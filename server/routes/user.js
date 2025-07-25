var express = require('express');
var user = express.Router();
var Models = require("../models");
var WModels = require("../wmodels");
var helper = require('../helper/common');
var AWS = require('aws-sdk');
var fs = require('fs');
var admin = require('firebase-admin');
const Op = Models.Sequelize.Op;

// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
var firebase = require("firebase/app");
// Add the Firebase products that you want to use
require("firebase/auth");
const config = require(__dirname + '/../config/config.json');

s3 = new AWS.S3();
AWS.config.update({ region: 'ap-south-1' });
var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient({ convertEmptyValues: true }),
    // bodyParser = require('body-parser'),
    multer = require('multer'),
    multerS3 = require('multer-s3');
const table = "forum_users";
AWS.config.update({
    // secretAccessKey: '',
    // accessKeyId: '',
    region: 'ap-south-1'
});

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'forum/profile-images',
        key: function (req, file, cb) {
            // console.log(req.body);
            cb(null, req.body.name); //use Date.now() for unique file keys
        }
    })
});


var upload_app = multer({
    dest: 'images/',
    limits: { fileSize: 10000000, files: 1 },
    fileFilter: (req, file, callback) => {

        if (!file.originalname.match(/\.(jpg|jpeg)$/)) {

            return callback(new Error('Only Images are allowed !'), false)
        }

        callback(null, true);
    }
}).single('image');


const profileImgBucket = "https://forumstatic.niklive.in/profile-images/";

// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads')
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + '-' + Date.now())
//   }
// })

// var upload = multer({ storage: storage })

user.get('/all', function (req, res) {
    Models.user.findAll({ raw: true }).then(result => {
        res.json({ success: true, data: result });
    }).catch((err) => {
        res.status(401).json({ success: false, msg: 'Please retry later!' });
    })
});

user.get('/anchor/all', function (req, res) {
    let where_json = { status: 1, user_type: 2 };
    Models.user.findAll({
        where: where_json,
        attributes: [['user_id', config.user.user_id], ['display_name', config.user.display_name], ['display_pic', config.user.display_pic]],
        include: [
            {
                model: Models.article,
                attributes: [],
                required: true
            }
        ]
    }).then(result => {
        result.forEach((user, index) => {
            result[index].dataValues.dispName = helper.decrypt(result[index].dataValues.dispName)
            result[index].dataValues.dispPic = helper.decrypt(result[index].dataValues.dispPic)
            // console.log(comment.author_name)
        })
        res.json({ success: true, data: result });
    }).catch((err) => {
        res.status(401).json({ success: false, msg: err });
    })
});

user.get('/anchor/list', function (req, res) {
    let where_json = { status: 1, user_type: 2 };
    Models.user.findAll({
        where: where_json,
        attributes: [['user_id', config.user.user_id], ['display_name', config.user.display_name], ['display_pic', config.user.display_pic]]
    }).then(result => {
        let userList = [];
        result.forEach((user, index) => {
            result[index].dataValues.dispName = result[index].dataValues.dispName != '' ? helper.decrypt(result[index].dataValues.dispName) : ''
            result[index].dataValues.dispPic = result[index].dataValues.dispPic != '' ? helper.decrypt(result[index].dataValues.dispPic) : ''
        })
        res.send(result)
    }).catch((err) => {
        res.status(401).json({ success: false, msg: err });
    })
});
user.get('/anchor/list/:langId', function (req, res) {
    let where_json = { user_type: 2 };
    if (req.params.langId > 0) {
        Object.assign(where_json, { default_lang_id: req.params.langId })
    }
    Models.user.findAll({
        where: where_json,
        attributes: [['id', config.user.id], ['user_id', config.user.user_id], ['display_name', config.user.display_name], ['display_pic', config.user.display_pic]],
        include: [
            {
                model: Models.article,
                attributes: [],
                required: true
            }
        ]
    }).then(result => {
        let userList = [];
        result.forEach((user, index) => {
            result[index].dataValues.dispName = result[index].dataValues.dispName != '' ? helper.decrypt(result[index].dataValues.dispName) : ''
            result[index].dataValues.dispPic = result[index].dataValues.dispPic != '' ? helper.decrypt(result[index].dataValues.dispPic) : ''
        })
        userList.push({ dispName: 'All Anchors', dispPic: 'https://static.forum.com/images/all-anchors.png', uId: '0', userId: "-1" })
        userList = [...userList, ...result]
        res.json({ success: true, data: userList });
        // res.send(result)
    }).catch((err) => {
        res.status(401).json({ success: false, msg: err });
    })
});

user.get('/anchorNadmin/list/:langId', function (req, res) {
    // console.log(req.params.langId)
    let where_json = { status: 1, [Op.or]: [{ user_type: 1 }, { user_type: 2 }] };
    if (req.params.langId > 0) {
        Object.assign(where_json, { default_lang_id: req.params.langId })
    }
    // {[Op.or]: [{user_type: {[Op.like]: '%' + tagOrTitle + '%' }}
    Models.user.findAll({
        where: where_json,
        attributes: [['user_id', config.user.user_id], ['display_name', config.user.display_name], ['display_pic', config.user.display_pic], ['user_type', config.user.user_type]]
    }).then(result => {
        let userList = [];
        result.forEach((user, index) => {
            if (result[index].dataValues.uType == 1) {
                result[index].dataValues.uType = 'Admin';
            }
            else if (result[index].dataValues.uType == 2) {
                result[index].dataValues.uType = 'Anchor';
            }
            result[index].dataValues.dispName = result[index].dataValues.dispName != '' ? helper.decrypt(result[index].dataValues.dispName) : ''
            result[index].dataValues.dispPic = result[index].dataValues.dispPic != '' ? helper.decrypt(result[index].dataValues.dispPic) : ''
            result[index].dataValues.dispName = result[index].dataValues.dispName + ' ( ' + result[index].dataValues.uType + ' )';
        })
        res.send(result)
    }).catch((err) => {
        console.log(err);
        res.status(401).json({ success: false, msg: err });
    })
});

user.get('/getUserId/:token', function (req, res) {
    const user_details = helper.getCognitoIdFromToken(req.params.token);
    if (user_details.success) {
        res.status(200).json(user_details);
        res.end()
    }
    else {
        res.status(401).json({ success: false, data: 'Invalid Token' });
        res.end()
    }
});

user.post('/find/:id', function (req, res) {
    Models.user.findOne({ where: { user_id: req.params.id }, attributes: ['display_name', 'display_pic'] })
        .then((user) => {
            res.json({ success: true, data: user });
        })
        .catch((err) => {
            res.status(401).json({ success: false, msg: 'Please retry later!' });
        })
})

user.get('/profile/:user_id', (req, res) => {
    let user_id = req.params.user_id;
    var params = {
        TableName: table,
        KeyConditionExpression: "user_id = :id",
        ExpressionAttributeValues: {
            ":id": user_id
        }
    };

    // return docClient.query(params).promise();
    // return userDetail.then(data => {

    // })
    docClient.query(params, function (err, data) {
        if (err) {
            res.status(401).json({ success: false, msg: 'Please retry later!' });
            // console.log('err')
        } else {
            res.status(200).json({ success: true, userDetail: data });
        }
    });
    // getUserDetailFromDynamo(req.params.user_id).then(data => {
    // }).catch(err => {
    // });

})

user.post('/update/profile-file', upload.single('uploads'), (req, res, next) => {
    const file = req.file
    if (!file) {
        const error = new Error('Please upload a file')
        error.httpStatusCode = 400
        return next(error)
    }
    Models.user.update(
        { display_pic: profileImgBucket + req.body.name },
        { where: { user_id: req.body.user_id } }
    ).then(result => {
        res.status(200).send('updated');
    }).error(err => {
        res.status(400).send('error');
    })
})

user.post('/update/prefferedLang', helper.loginMiddleware, (req, res) => {
    const newPrefferedLang = req.body.langId;
    if (!newPrefferedLang) {
        const error = new Error();
        error.httpStatusCode = 400;
        error.message = 'Please select the language';
        res.send(error);
        return;
    }
    admin.auth().verifyIdToken(req.headers.authorization)
        .then(data => {
            const userId = data.user_id;
            WModels.user.update(
                { preffered_lang_id: newPrefferedLang },
                { where: { user_id: userId } }
            ).then(result => {
                res.status(200).json({ success: true, data: 'updated' })
            }).error(err => {
                res.status(400).json({ success: false, data: 'error' })
            })
        }).catch(err => {
            res.status(401).json({ success: false, msg: 'User Not Authenticated' });
        })
})

user.post('/profile/update', helper.loginMiddleware, (req, res) => {
    let user_id = req.body.user_id;
    let query = 'set ';
    let expressionObj = {};

    if (!req.body.is_new) {
        if (req.body.name != '') {
            query += " user_name = :name,";
            expressionObj[':name'] = req.body.name;
        }
        if (req.body.address != '') {
            query += " user_address = :address,";
            expressionObj[':address'] = req.body.address;
        }
        if (req.body.gender != '0') {
            query += " user_gender = :gender,";
            expressionObj[':gender'] = req.body.gender;
        }
        if (req.body.contact != '0') {
            query += " contact = :contact,";
            expressionObj[':contact'] = req.body.contact;
        }
        if (req.body.country.id != '0') {
            query += " user_country = :country,";
            expressionObj[':country'] = { id: req.body.country.id, name: req.body.country.name };
        }
        if (req.body.state.id != '0') {
            query += " user_state = :state,";
            expressionObj[':state'] = { id: req.body.state.id, name: req.body.state.name };
        }
        if (req.body.city.id != '0') {
            query += " user_city = :city,";
            expressionObj[':city'] = { id: req.body.city.id, name: req.body.city.name };
        }
        if (req.body.languages.length > 0) {
            query += " user_languages = :languages,";
            expressionObj[':languages'] = req.body.languages;
        }
        let params = {
            TableName: table,
            Key: {
                "user_id": req.body.user_id
            },
            UpdateExpression: query.slice(0, -1),
            ExpressionAttributeValues: expressionObj,
            ReturnValues: "UPDATED_NEW"
        };
        docClient.update(params, function (err, data) {
            if (err) {
                res.status(401).json({ success: false, data: err });
            } else {
                res.set({
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "*",
                    "Access-Control-Allow-Headers": "*",
                });
                res.status(200).json({ success: true, data: data });
            }
        });
    }
    else {
        let langArr = [];
        let currentLangObj = {};
        let userObj = { 'user_id': { S: req.body.user_id } };
        if (req.body.languages.length > 0) {
            req.body.languages.forEach(data => {
                currentLangObj = {
                    M: {
                        "id": { S: data.id.toString() },
                        "name": { S: data.name },
                    }
                };
                langArr.push(currentLangObj)
            })
            userObj['user_languages'] = { L: langArr };
        }
        else {
            userObj['user_languages'] = { L: [] }
        }

        if (req.body.name != '') {
            userObj['user_name'] = { S: req.body.name };
        }

        if (req.body.address != '') {
            userObj['user_address'] = { S: req.body.address };
        }

        if (req.body.gender != '0') {
            userObj['user_gender'] = { S: req.body.gender };
        }
        else {
            userObj['user_gender'] = { S: "0" };
        }
        if (req.body.contact != '') {
            userObj['contact'] = { S: req.body.contact };
        }

        if (req.body.country.id != '0') {
            userObj['user_country'] = {
                M: {
                    "id": { N: req.body.country.id.toString() },
                    "name": { S: req.body.country.name }
                }
            };
        }
        else {
            userObj['user_country'] = {
                M: {
                    "id": { N: "0" },
                    "name": { S: "0" }
                }
            };
        }
        if (req.body.state.id != '0') {
            userObj['user_state'] = {
                M: {
                    "id": { N: req.body.state.id.toString() },
                    "name": { S: req.body.state.name }
                }
            };
        }
        else {
            userObj['user_state'] = {
                M: {
                    "id": { N: "0" },
                    "name": { S: "0" }
                }
            };
        }
        if (req.body.city.id != '0') {
            userObj['user_city'] = {
                M: {
                    "id": { N: req.body.city.id.toString() },
                    "name": { S: req.body.city.name }
                }
            };
        }
        else {
            userObj['user_city'] = {
                M: {
                    "id": { N: "0" },
                    "name": { S: "0" }
                }
            };
        }


        var params = {
            TableName: table,
            Item: userObj
        };
        dynamodb.putItem(params, function (err, data) {
            if (err) {
                res.status(401).json({ success: false, data: err });
            } else {
                res.status(200).json({ success: true, data: data });
            }
        });
    }

})

user.post('/new', helper.loginMiddleware, (req, res) => {
    let user_id;
    helper.isAuthenticated(req.headers.authorization)
        .then(data => {
            // console.log(data);return;
            user_id = data.uid;
            let userObj = {
                user_id: user_id,
                user_name: '',
                display_name: data.name ? helper.encrypt(data.name) : helper.encrypt(req.body.name),
                display_pic: data.picture ? helper.encrypt(data.picture) : '',
                email_id: data.email ? helper.encrypt(req.body.email) : '',
                created_date: Date.now(),
                default_lang_id: req.body.lang,
                user_type: 0
            };
            Models.user.findOne(
                {
                    where: { user_id: user_id },
                    attributes: [['id', config.user.id], ['user_id', config.user.user_id], ['user_name', config.user.user_name], ['display_name', config.user.display_name], ['display_pic', config.user.display_pic], ['email_id', config.user.email_id], ['contact_no', config.user.contact_no], ['status', config.user.status], ['created_date', config.user.created_date], ['user_type', config.user.user_type]]
                })
                .then((data) => {
                    if (data) {
                        data.dataValues.dispName = data.dataValues.dispName ? helper.decrypt(data.dataValues.dispName) : ''
                        data.dataValues.dispPic = data.dataValues.dispPic ? helper.decrypt(data.dataValues.dispPic) : ''
                        if (data.status == 0) {
                            let display_name = { display_name: data.display_name };
                            userObj.default_lang_id = data.dataValues.default_lang_id;
                            data.update(userObj).then((userData) => {
                                Object.assign(userData, display_name);
                                res.send(userData);
                            }).catch((err) => {
                                res.send(err)
                            });
                        }
                        else {
                            res.send(data);
                        }
                    }
                    else {
                        WModels.user.create(userObj)
                            .then((data) => {
                                //new user created in DB
                                // create new user in Dynamo
                                let dynamoUserObj = {
                                    user_id: {
                                        S: user_id
                                    },
                                    user_name: {
                                        S: req.body.name
                                    }
                                };
                                var params = {
                                    TableName: table,
                                    Item: dynamoUserObj
                                };
                                dynamodb.putItem(params, function (err, data) {
                                    if (err) {
                                        res.send(err);
                                    } else {
                                        res.send(data);
                                    }
                                });
                            }).catch((err) => {
                                res.send(err)
                            });
                    }
                })
                .catch((err) => {
                    res.send(err);
                })
        }).catch(err => {
            res.send(err)
        })
})

user.post('/createAccount', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    firebase.auth().createUserWithEmailAndPassword(email, password).then(function (data) {
        res.send(data);
    }).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        res.send(errorMessage);
        // ...
    });
})

user.post('/login', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    firebase.auth().signInWithEmailAndPassword(email, password).then(function (data) {
        res.send(data);
    }).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        res.send(errorMessage);
    });
})



user.post('/verifyToken', (req, res) => {
    helper.isAuthenticated(req.body.token)
        .then(data => {
            res.send(data);
        }).catch(err => {
            res.send(err)
        })
})

// user.post('/refreshAccessToken', (req, res) => {
//     // firebase.auth().onAuthStateChanged(function(user) {
//     //     console.log(user);
//     //     if (user) {
//     //       res.send(user);
//     //     } else {
//     //       res.send('user not signed in');
//     //     }
//     //   });
// //     firebase.auth().currentUser.getIdToken()
// // .then(function(idToken) {
// //     res.send(idToken);
// // }).catch(function(error) {
// //     console.log(error);
// // });
// })


user.post('/logout', (req, res) => {
    firebase.auth().signOut().then(function () {
        res.send('Sign-out successful.');
    }).catch(function (error) {
        console.log(error);
    });
})

// user.post('/updatePassword', (req, res) => {
// var user = firebase.auth().currentUser;
// var newPassword = req.body.password;
// user.updatePassword(newPassword).then(function() {
//     res.send('Password Updated');
// }).catch(function(error) {
//   console.log(error);
// });
// })


user.post('/resetPassword', (req, res) => {
    var emailAddress = req.body.email;
    firebase.auth().sendPasswordResetEmail(emailAddress).then(function () {
        res.send('Email reset link sent');
    }).catch(function (error) {
        console.log(error);
    });
})

user.post('/update/profile-pic', (req, res) => {
    fs.readFile(req.files.image.path, function (err, data) {
        var dirname = "/var/www/html";
        var newPath = dirname + "/uploads/" + req.files.image.originalFilename;
        fs.writeFile(newPath, data, function (err) {
            if (err) {
                res.send({ 'response': "Error" });
            } else {
                res.send({ 'response': "Saved" });
            }
        });
    });
})

user.get('/role/:userId', helper.loginMiddleware, (req, res) => {
    Models.user.findOne({
        where: { user_id: req.params.userId },
        attributes: [['user_type', config.user.user_type], ['default_lang_id', config.user.default_lang_id]]
    }).then(data => {
        res.status(200).json({ success: true, data: data })
    })
})

user.post('/roleUsingEmail', (req, res) => {
    const encEmail = helper.encrypt(req.body.email);
    Models.user.findOne({
        where: { email_id: encEmail },
        attributes: [['user_type', config.user.user_type]]
    }).then(data => {
        res.status(200).json({ success: true, data: data })
    })
})

user.post('/profileDetails', helper.loginMiddleware, (req, res) => {
    helper.isAuthenticated(req.headers.authorization)
        .then(data => {
            userId = data.uid;
            Models.user.findOne({
                where: { user_id: userId },
                attributes: [['display_name', config.user.display_name], ['display_pic', config.user.display_pic], ['email_id', config.user.email_id], ['contact_no', config.user.contact_no], ['default_lang_id', config.user.preffered_lang_id]]
            }).then(data => {
                data.dataValues.dispName = helper.decrypt(data.dataValues.dispName);
                data.dataValues.dispPic = helper.decrypt(data.dataValues.dispPic);
                data.dataValues.emailId = helper.decrypt(data.dataValues.emailId);
                res.status(200).json({ success: true, data: data })
            })
        }).catch(err => {
            res.send({ success: false, data: err })
        });
})


module.exports = user;
