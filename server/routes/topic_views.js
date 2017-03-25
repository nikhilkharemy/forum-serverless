var express = require('express');
var topic_views = express.Router();
var Models = require("../models");


// var requestIp = require('request-ip');
 
// inside middleware handler
// const ipMiddleware = function(req, res, next) {
//     const clientIp = requestIp.getClientIp(req); 
//     next();
// };

// topic_views.use(requestIp.mw())

// topic_views.get('/all', function(req, res) {
//     Models.topic_views.findAll({ raw: true }).then(result => {
//         res.json({success: true, data: result});
//     }).catch((err)=>{
//         res.status(401).json({success: false, msg: 'Please retry later!'});
//     }) 
// });

topic_views.post('/create', function(req, res) {
    var ip;
    if (req.headers['x-forwarded-for']) {
        ip = req.headers['x-forwarded-for'].split(",")[0];
    } else if (req.connection && req.connection.remoteAddress) {
        ip = req.connection.remoteAddress;
    } else {
        ip = req.ip;
    }
    Models.topic_views.findOne(
        {where: {userId: req.body.user_id, topicId: req.body.topic_id}}
    ).then(views => {
        if(views){
            res.send(views);
        }
        else{
            // Model.topic.increment(['views', '1'], { where: { id: req.body.topic_id } });
            return Models.sequelize.transaction(function (t) {
                return Models.topic_views.create({userId: req.body.user_id, topicId: req.body.topic_id, ip: ip, createdAt: Date.now(), updatedAt: Date.now()}, {transaction: t}).then((topic_v) => {
                    return Models.article.increment(['view_count'], { where: { id: req.body.topic_id } }, {transaction: t}).then(top => {

                    });
                    // return Models.topic.findByPk(req.body.topicid).then(topic_data => {
                    //     topic_data.increment('comment_count', {by: 1})
                    // }, {transaction: t})
                });
            }).then(function (result) {
                console.log(top)
                // Transaction has been committed
                    res.send(result);
                // result is whatever the result of the promise chain returned to the transaction callback
            }).catch(function (err) {
                // Transaction has been rolled back
                // err is whatever rejected the promise chain returned to the transaction callback
                res.send(err);
            });

            
        }
    })

    // .then(([user, created]) => {
    //     res.send(user.get({
    //         plain: true
    //     }))
    // }).catch((err) => {
    //     res.send(err)
    // });
})

module.exports = topic_views;
