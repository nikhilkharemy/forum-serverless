var express = require('express');
var comment = express.Router();
var Models = require("../models");
var WModels = require("../wmodels");
var helper = require("../helper/common");
const config = require(__dirname + '/../config/config.json');
require('dotenv').config();
const apiUrl = process.env.API_URL || 'https://api.abpmanch.com/';
const purgeUrl = process.env.PURGE_URL || 'https://wahcricket.com/general_cms/api/clear_akamai_cache.php';
const es_search_url = process.env.ES_SEARCH_URL || 'https://search-abpnews-elastic-6qf2of3b6nge4pxk6bzbssuuty.ap-south-1.es.amazonaws.com';
const es_index = process.env.ES_INDEX || 'manchprod';
const es_type = process.env.ES_TYPE || 'topic';
const es_key = es_index + '/' + es_type;
var request = require('request');


comment.get('/all', function (req, res) {
    Models.comment.find({
        raw: true,
        where: { topic_id: 4 },
        include: [
            {
                model: Models.user,
                as: 'author',
                attributes: ['display_name', 'email_id'],
            }
        ]
    }).then(result => {
        res.json({ success: true, data: result });
    }).catch((err) => {
        res.status(401).json({ success: false, msg: err });
    })
});

comment.post('/getReplies/:comment_id', function (req, res) {
    let offset = 0;
    let limit = 10;
    offset = req.body.length ? req.body[0].offset ? req.body[0].offset : "0" : req.body.offset ? req.body.offset : "0";

    if (offset == 0) {
        query = "SELECT cm.id as " + config.comment.id + ",cm.comment_text as " + config.comment.comment_text + ",cm.comment_type as " + config.comment.comment_type + ",cm.parent_id as " + config.comment.parent_id + ",cm.topic_id as " + config.comment.topic_id + ",cm.is_reported as " + config.comment.is_reported + ",cm.like_count as " + config.comment.like_count + ",cm.dislike_count as " + config.comment.dislike_count + ",cm.reported_count as " + config.comment.reported_count + ",cm.reply_count as " + config.comment.reply_count + ",cm.moderated_by as " + config.comment.moderated_by + ",cm.moderated_date as " + config.comment.moderated_date + ",cm.status as " + config.comment.status + ",cm.created_date as " + config.comment.created_date + ",cm.created_by as " + config.comment.created_by + ", u.display_name as " + config.user.display_name + ", u.display_pic as " + config.user.display_pic + " FROM comment cm  LEFT OUTER JOIN user AS u ON cm.created_by = u.user_id WHERE " +
            "cm.status=0 AND cm.is_reported=0 AND cm.comment_type=1 AND u.user_id IS NOT NULL AND cm.parent_id=" + req.params.comment_id + " ORDER BY cm.id DESC LIMIT " + limit + "";
    }
    else {
        query = "SELECT cm.id as " + config.comment.id + ",cm.comment_text as " + config.comment.comment_text + ",cm.comment_type as " + config.comment.comment_type + ",cm.parent_id as " + config.comment.parent_id + ",cm.topic_id as " + config.comment.topic_id + ",cm.is_reported as " + config.comment.is_reported + ",cm.like_count as " + config.comment.like_count + ",cm.dislike_count as " + config.comment.dislike_count + ",cm.reported_count as " + config.comment.reported_count + ",cm.reply_count as " + config.comment.reply_count + ",cm.moderated_by as " + config.comment.moderated_by + ",cm.moderated_date as " + config.comment.moderated_date + ",cm.status as " + config.comment.status + ",cm.created_date as " + config.comment.created_date + ",cm.created_by as " + config.comment.created_by + ", u.display_name as " + config.user.display_name + ", u.display_pic as " + config.user.display_pic + " FROM comment cm  LEFT OUTER JOIN user AS u ON cm.created_by = u.user_id WHERE " +
            "cm.status=0 AND cm.is_reported=0 AND cm.comment_type=1 AND u.user_id IS NOT NULL AND cm.parent_id=" + req.params.comment_id + " AND cm.id < " + offset + " ORDER BY cm.id DESC LIMIT " + limit + "";
    }
    Models.sequelize.query(query, { type: Models.sequelize.QueryTypes.SELECT })
        .then(comments => {
            comments.forEach((comment, index) => {
                comments[index].dispName = helper.decrypt(comments[index].dispName)
                comments[index].dispPic = helper.decrypt(comments[index].dispPic)
            })
            // We don't need spread here, since only the results will be returned for select queries
            res.send(comments);
        })
});

comment.post('/getById/:id', function (req, res) {
    var user_id = req.body.length ? req.body[0].userId ? req.body[0].userId : "0" : req.body.userId ? req.body.userId : "0";;
    let limit = config.comment.limit;
    var result = {
        'success': '',
        'comments': ''
    };
    let order_json = ['id', 'DESC'];
    let where_json = { id: req.params.id, status: 0, parent_id: 0, is_reported: { $ne: 2 } };



    if (user_id == 0) {
        where_commentActivity_json = { comment_act_by: user_id };
    }
    else {
        where_commentActivity_json = {};
    }

    Models.comment.findOne(
        {
            where: where_json,
            order: [order_json],
            limit: limit,
            attributes: [['id', config.comment.id], ['comment_text', config.comment.comment_text], ['comment_type', config.comment.comment_type], ['parent_id', config.comment.parent_id], ['topic_id', config.comment.topic_id], ['is_reported', config.comment.is_reported], ['like_count', config.comment.like_count], ['dislike_count', config.comment.dislike_count], ['reported_count', config.comment.reported_count], ['moderated_by', config.comment.moderated_by], ['moderated_date', config.comment.moderated_date], ['status', config.comment.status], ['created_date', config.comment.created_date], ['created_by', config.comment.created_by], ['reply_count', config.comment.reply_count]],
            include: [
                {
                    model: Models.comment_activity,
                    where: where_commentActivity_json,
                    paranoid: false,
                    required: false,
                    attributes: [['comment_act_type', config.comment_activity.comment_act_type]]
                },
                {
                    model: Models.user,
                    paranoid: false,
                    required: false,
                    attributes: [['user_id', config.user.user_id], ['display_name', config.user.display_name], ['display_pic', config.user.display_pic]]
                }
            ]
        })
        // Models.sequelize.query(topic_query, { type: Models.sequelize.QueryTypes.SELECT})
        .then(function (comments) {
            if (comments !== null) {
                if (comments.user !== null) {
                    comments.user.dataValues.dispName = helper.decrypt(comments.user.dataValues.dispName)
                    comments.user.dataValues.dispPic = helper.decrypt(comments.user.dataValues.dispPic)
                }
            }
            result.success = 'true';
            result.comments = comments;
            // We don't need spread here, since only the results will be returned for select queries
            res.send(result);
        });

});


comment.post('/create', helper.loginMiddleware, function (req, res) {
    /**
        Activity Type: comment = 1, reply = 2, Like = 3, Dislike = 4, Report = 5
        In DB comment_type 0=comment, 1=reply
    **/
    // console.log(es_search_url+'/'+es_key+'/'+req.body.tId+'/_update');return;
    if (typeof req.body.actType != "undefined" && req.body.actType == 1) {
        var parentid = 0;
        var commenttype = 0;
    } else {
        var parentid = req.body.pId;
        var commenttype = 1;
    }
    var create_comment_json = {
        comment_text: req.body.commentText,
        comment_type: commenttype,
        parent_id: parentid,
        topic_id: req.body.tId,
        is_reported: 0,
        like_count: 0,
        dislike_count: 0,
        reported_count: 0,
        reply_count: 0,
        moderated_by: "NULL",
        moderated_date: Date.now(),
        status: 0,
        created_date: Date.now(),
        created_by: req.body.createBy,
    };
    let cacheLangId;
    let topicCmntCnt = 0;

    return WModels.sequelize.transaction(function (t) {
        return WModels.comment.create(create_comment_json, { transaction: t }).then((comment) => {
            const comment_activity_json = {
                comment_id: comment.id,
                comment_act_type: comment.comment_type,
                comment_act_by: comment.created_by,
                report_reason: '',
                comment_act_date: Date.now(),
                topic_id: req.body.tId,
                status: 0,
                created_date: Date.now()
            };
            return WModels.comment_activity.create(
                comment_activity_json, { returning: true }, { transaction: t }
            );
        })
    }).then(function (result) {
        create_comment_json = result.dataValues;
        // Transaction has been committed
        if (req.body.actType == 1) {
            Models.article.findOne(
                {
                    attributes: ['id',['lang_id',config.article.lang_id],['wp_id',config.article.wp_id],['comment_count',config.article.comment_count]],
                    where: { id: req.body.tId }
                })
                .then(topic_data => {
                    topic_data.increment('comment_count', { by: 1 });
                    topicCmntCnt = topic_data.dataValues.comntCount + 1;
                    cacheTopicId = topic_data.dataValues.id;
                    cacheLangId = topic_data.dataValues.langId;
                    cacheWpId = topic_data.dataValues.refId;
                    
                }).then(data => {
                    //check if in redis
                    client.get('st1lang'+cacheLangId, (err, response) => {
                        if(response) {
                            response = JSON.parse(response);
                            let redisIndex = response.findIndex(x => x.tId == req.body.tId);
                            if(redisIndex != -1){
                                response[redisIndex].comntCount = topicCmntCnt;
                                Models.user.findOne({
                                    where:{user_id: req.body.createBy},
                                    attributes: [['display_name', config.user.display_name], ['display_pic', config.user.display_pic]]
                                }).then(userData => {
                                    let commentOBJ = {
                                        cId: create_comment_json.comment_id,
                                        commentText: req.body.commentText,
                                        commentType: 0,
                                        createDate: create_comment_json.comment_act_date,
                                        created_by: create_comment_json.comment_act_by,
                                        dispName: helper.decrypt(userData.dataValues.dispName),
                                        dispPic: helper.decrypt(userData.dataValues.dispPic),
                                        moderatedBy: "NULL",
                                        moderatedDate: create_comment_json.comment_act_date,
                                        replyCount: 0,
                                        reportedCount: 0
                                    }
                                    if(response[redisIndex].comments){
                                        response[redisIndex].comments = response[redisIndex].comments.slice(0, 1);
                                        response[redisIndex].comments.unshift(commentOBJ);
                                        client.set('st1lang'+cacheLangId, JSON.stringify(response));
                                    }
                                    else{
                                        Object.assign(response[redisIndex], {comments: []});
                                        response[redisIndex].comments.push(commentOBJ);
                                        client.set('st1lang'+cacheLangId, JSON.stringify(response));
                                    }
                                    //update elastic search key
                                    request({
                                        headers: {
                                          // 'Content-Length': contentLength,
                                          'Content-Type': 'application/json'
                                        },
                                        uri: es_search_url+'/'+es_key+'/'+req.body.tId+'/_update',
                                        body: JSON.stringify({ "doc" : {"comments" : response[redisIndex].comments, "comntCount" : topicCmntCnt}}),
                                        method: 'POST'
                                      }, function (err, res, body) {
                                        console.log(body)
                                    });
                                })
                            }
                        }
                    });
                    // clear cache from akamai
                    helper.purgeCach([
                        apiUrl+"topic/latestTwoComments/"+cacheLangId+"/"+cacheWpId,
                        apiUrl+'topic/details/'+cacheLangId+'/'+req.body.tId
                    ]);
                    res.status(200).json({ success: 'true', cId: result.comment_id, createDate: result.created_date });
                }).catch(err => {
                    res.status(401).json({ success: false, data: err });
                })

        }
        if (req.body.actType == 2) {
            // WModels.comment.findOne(parentid)
            Models.comment.findOne(
                {
                    attributes: ['id', 'reply_count'],
                    where: { id: parentid, status: 0 }
                })
                .then(comment => {
                    comment.increment('reply_count', { by: 1 })
                    topicCmntCnt = comment.dataValues.reply_count + 1;
                }).then(data => {
                    request.get(es_search_url+'/'+es_key+'/'+req.body.tId, (err, res, data) => {
                        // console.log(JSON.parse(data)._source.comments);
                        data = JSON.parse(data);
                        let commentId = data._source.comments.findIndex(x => x.cId == parentid);
                        // console.log(commentId);
                        data._source.comments[commentId].replyCount = topicCmntCnt
                        request({
                            headers: {
                              // 'Content-Length': contentLength,
                              'Content-Type': 'application/json'
                            },
                            uri: es_search_url+'/'+es_key+'/'+req.body.tId+'/_update',
                            body: JSON.stringify({ "doc" : {"comments" : data._source.comments}}),
                            method: 'POST'
                          }, function (err, res, body) {
                            console.log(body)
                        });

                    });
                    res.status(200).json({ success: 'true', replyid: result.id, created_date: result.created_date });
                }).catch(err => {
                    res.status(401).json({ success: false, data: err });
                })
        }
        // result is whatever the result of the promise chain returned to the transaction callback
    }).catch(function (err) {
        // Transaction has been rolled back
        // err is whatever rejected the promise chain returned to the transaction callback
        res.status(401).json({ success: false, data: err });
    });
    /**
        status 0 is active comment
        is_reported 0 is showable comment
        comment_type 0
        parent_id 0
    **/

});

comment.get('/getcommentreportlist/', function (req, res) {
    Models.comment.findAll({
        where: { is_reported: 1 },
        attributes: [['id', 'cId'], ['comment_text', config.comment.comment_text], ['created_date', config.comment.created_date]],
        include: [
            {
                model: Models.article,
                attributes: ['id', ['slug', 'topic_slug'], 'eng_title'],
                required: true
            },
            {
                model: Models.user,
                attributes: [['user_id', config.user.user_id], ['display_name', config.user.display_name], ['display_pic', config.user.display_pic]],
                paranoid: false,
                required: true,
            }
        ]
    }).then(reportedComments => {
        reportList = [];
        // console.log(reportedComments[0].user.dataValues);return;
        reportedComments.forEach((topic, index) => {

            //to decrypt the user details
            reportedComments[index].user.dataValues.dispName = helper.decrypt(reportedComments[index].user.dataValues.dispName);
            reportedComments[index].user.dataValues.dispPic = reportedComments[index].user.dataValues.dispPic != '' ? helper.decrypt(reportedComments[index].user.dataValues.dispPic) : '';
            reportList.push(reportedComments[index])
        });
        Promise.all(reportList)
            .then((result) => res.json({ success: true, data: reportedComments }))
            .catch((err) => res.json({ success: false, data: err }));
        // 
    }).catch((err) => {
        res.json({ success: false, data: err })
    });
});

comment.get('/getcommentReports/:commentId', (req, res) => {
    // console.log('adasdsad');return;
    Models.comment_activity.findAll({
        where: { comment_act_type: 5, comment_id: req.params.commentId, status: 0 },
        include: [
            {
                model: Models.user,
                attributes: [['user_id', config.user.user_id], ['display_name', config.user.display_name], ['display_pic', config.user.display_pic]],
            }
        ]
    }).then(reportedComments => {
        reportList = [];
        // console.log(reportedComments[0].user.dataValues);return;
        reportedComments.forEach((topic, index) => {

            //to decrypt the user details
            reportedComments[index].user.dataValues.dispName = helper.decrypt(reportedComments[index].user.dataValues.dispName);
            reportedComments[index].user.dataValues.dispPic = reportedComments[index].user.dataValues.dispPic != '' ? helper.decrypt(reportedComments[index].user.dataValues.dispPic) : '';
            reportList.push(reportedComments[index])
        });
        Promise.all(reportList)
            .then((result) => res.json({ success: true, data: reportedComments }))
            .catch((err) => res.json({ success: false, data: err }));
        // res.json({success:true, data: reportedComments})
    }).catch((err) => {
        res.json({ success: false, data: err })
    });
})

comment.post('/updatereport', function (req, res) {
    // console.log(req.body);return;
    //2: remove comment, 0: retain comment
    WModels.comment.update(
        { is_reported: req.body.action },
        { where: { id: req.body.commentId } }
    )
        .then(data => {
            if (req.body.action == 2) {
                WModels.article.findByPk(req.body.topicId).then(t_data => {
                    t_data.decrement('comment_count', { by: 1 })
                }).then(data => {
                    WModels.comment_activity.update(
                        { status: 1 },
                        { where: { comment_id: req.body.commentId } }
                    ).then(data => {
                        res.status(200).json({ success: true, data: 'done!' });
                    }).catch((err) => {
                        res.status(400).json({ success: false, data: err.message });
                    })
                }).catch(err => {
                    res.status(400).json({ success: false, data: err });
                })
            }
            // console.log(data);return;

        }).catch((err) => {
            res.status(401).json({ success: false, data: err.message });
        });
});



module.exports = comment;
