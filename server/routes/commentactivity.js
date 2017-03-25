var express = require('express');
var commentactivity = express.Router();
var Models = require("../models");
var WModels = require("../wmodels");
var helper = require("../helper/common");
const config = require(__dirname + '/../config/config.json');

/*commentactivity.get('/all', function(req, res) {
    Models.comment.findAll({ raw: true }).then(result => {
        res.json({success: true, data: result});
    }).catch((err)=>{
        res.status(401).json({success: false, msg: 'Please retry later!'});
    }) 
});*/

commentactivity.post('/create',helper.loginMiddleware, function(req, res) {
    /*Activity Type: #Like = 3 #Dislike = 4 #Report = 5  */
    req.body.actType = parseInt(req.body.actType);
    // console.log(req.body.actType);return;
    req.body.cId = parseInt(req.body.cId);
    if( req.body.actType == 3 ){ 
        if(req.body.isLiked && req.body.isLiked == '1'){
            WModels.comment_activity.destroy({where: 
                { comment_act_by: req.body.createBy, comment_id: req.body.cId, comment_act_type:req.body.actType }
            }).then((data) => {
                let query = "UPDATE comment SET like_count = like_count-1 WHERE id="+req.body.cId;
			WModels.sequelize.query(query, { type: WModels.sequelize.QueryTypes.UPDATE})
                .then(data => {
		            res.json({ success: true});
                    res.end();
		        }).catch(err=>{
		            res.json({success: false, data: err});
                    res.end();
		        })
            }).catch(err => {
                res.status(400).json({ success: false, data: err });
                res.end();
                return;
            })
        } 
        else{
            Models.comment_activity.findAll(
                { where: { comment_act_by: req.body.createBy, comment_id: req.body.cId, comment_act_type:req.body.actType, status:0 } })
            .then(result => {
                  
                //First time "like" process!
                if(result.length == 0){
                        WModels.comment_activity.create({ 
                            comment_id: req.body.cId,
                            comment_act_by: req.body.createBy,
                            comment_act_type: req.body.actType,
                            comment_act_date: Date.now(),
                            status: 0, 
                            created_date: Date.now() 
                        })
                        .then((data) => {
                        //check comment is exist or not with status 0
                        WModels.comment.findOne(
                           { attributes: ['id'],
                               where: { id: req.body.cId, status:0 }  
                        })
                        .then(data => {
                            var likecount = data.like_count;
                            //Add +1 on Like count
                            data.increment('like_count', {by: 1})
                            // WModels.comment.findOne(
                            //     { attributes: ['id','like_count'],
                            //         where: { id: data.id }  
                            //  }).then(comment_data => {
                            // })
                            .then((data) => {
                                
                                //if dislike record exist then minus (-1) from dislike_count
                                WModels.comment_activity.findOne(
                                    { where: { comment_act_by: req.body.createBy, comment_id: req.body.cId, comment_act_type: 4, status: 0 } })
                                .then(dl_result => {
                                   
                                   if (typeof dl_result.id !== 'undefined'){
                                    
                                        var comment_activity_id = dl_result.id;
                                        
                                        WModels.comment.findOne(
                                            { where: { id: req.body.cId, status: 0 }  
                                        })
                                        .then(data => {
                                           var dislikecount = data.dislike_count;
                                   
                                            if(dislikecount > 0){
                                                //Minus -1 on disLike count
                                                // WModels.comment.update(
                                                //     { dislike_count: dislikecount-1 },
                                                //     { where: { id: data.id } }
                                                // )
                                                WModels.comment.findByPk(data.id).then(comment_data => {
                                                    comment_data.decrement('dislike_count', {by: 1})
                                                })
                                                .then(data => {
                                                    
                                                   //Dislike activity's status update
                                                   WModels.comment_activity.update(
                                                        { status: 1 },
                                                        { where: { id: comment_activity_id } }
                                                    )
                                                    .then((data) => {
                                                        res.status(200).json({ success: true, data: 'done!', id: data.id });
                                                        res.end();

                                                    }).catch((err)=>{
                                                        res.status(401).json({ success: false,  data: err.message });
                                                        res.end();
                                                        //res.send({ data: 'error code 0008' },{error: err});
                                                    });


                                                }).catch((err)=>{
                                                    res.status(401).json({ success: false,  data: err.message });
                                                    res.end();
                                                    //res.send({ data: 'error code 0007' },{error: err});
                                                });
                                            }

                                        }).catch((err)=>{
                                            console.log('dd')
                                            res.status(401).json({ success: false,  data: err.message });
                                            res.end();
                                            //res.status(401).json({success: false, msg: 'Please retry later!'});
                                            //res.send({ data: 'error code 0006' },{error: err});
                                        });
                                    }
                                    
                                }).catch((err)=>{
                                     
                                    res.status(401).json({ success: false,  data: err.message });
                                    res.end();
                                    //res.status(401).json({success: false, msg: 'Please retry later!'});
                                    //res.send({ data: 'error code 0005' },{error: err});
                                });
                                     
                                //res.send({ id:data.id, status: 'done!' });
                                
                               //res.send({ data: 'commentactivity saved' });
                            }).catch((err) => {
                                //res.send({ data: 'error code 0001' },{error: err});
                                res.status(401).json({ success: false,  data: err.message });
                                res.end();
                                //res.send(err)
                            });
                            //res.send({ data: 'commentactivity saved' });
                        }).catch((err) => {
                            //res.send(err)
                            //res.send({ data: 'error code 0002' },{error: err});
                            res.status(401).json({ success: false,  data: err.message });
                            res.end();
                        });
                        
                        //res.send({ data: 'commentactivity saved' });
                    }).catch((err) => {
                        //res.send(err)
                        //res.send({ data: 'error code 0003' },{error: err});
                        res.status(401).json({ success: false,  data: err.message });
                        res.end();
                    });
                }else{ 
                    //res.send({ data: 'already liked!' });
                    res.status(200).json({ success: true, data: 'already liked!' });
                    res.end();
                }
            }).catch((err)=>{
                //res.status(401).json({success: false, msg: 'Please retry later!'});
                //res.send({ data: 'error code 0043' },{error: err});
                res.status(401).json({ success: false,  data: err.message });
                res.end();
            });
        }
         
    }
    
    // if( req.body.actType == 4 ){
    //     WModels.comment_activity.findAll(
    //             { where: { comment_act_by: req.body.createBy, comment_id: req.body.cId, comment_act_type:req.body.actType, status:0 } })
    //     .then(result => {
              
    //         //First time "dislike" process!
    //         if(result.length == 0){
    //                 WModels.comment_activity.create({ 
    //                     comment_id: req.body.cId,
    //                     comment_act_by: req.body.createBy,
    //                     comment_act_type: req.body.actType,
    //                     comment_act_date: Date.now(),
    //                     status: 0, 
    //                     created_date: Date.now() 
    //                 })
    //                 .then((data) => {
    //                 //check comment is exist or not with status 0
    //                 WModels.comment.findOne(
    //                    { where: { id: req.body.cId, status:0 }  
    //                 })
    //                 .then(data => {
    //                     var dislikecount = data.dislike_count; 
    //                     //Add +1 on disLike count
    //                     WModels.comment.update(
    //                         { dislike_count: dislikecount+1 },
    //                         { where: { id: data.id } }
    //                     )
    //                     .then((data) => {
                            
    //                         //if like record exist then minus (-1) from like_count
    //                         WModels.comment_activity.findOne(
    //                             { where: { comment_act_by: req.body.createBy, comment_id: req.body.cId, comment_act_type: 3, status: 0 } })
    //                         .then(l_result => {
                               
    //                            if (typeof l_result.id !== 'undefined'){
                                
    //                                 var comment_activity_id = l_result.id;
                                    
    //                                 WModels.comment.findOne(
    //                                     { where: { id: req.body.cId, status: 0 }  
    //                                 })
    //                                 .then(data => {
    //                                    var likecount = data.like_count;
                               
    //                                     if(likecount > 0){
    //                                         //Minus -1 on Like count
    //                                         WModels.comment.update(
    //                                             { like_count: likecount-1 },
    //                                             { where: { id: data.id } }
    //                                         )
    //                                         .then(data => {
                                                
    //                                            //like activity's status update
    //                                            WModels.comment_activity.update(
    //                                                 { status: 1 },
    //                                                 { where: { id: comment_activity_id } }
    //                                             )
    //                                             .then((data) => {

                                                

    //                                             }).catch((err)=>{
    //                                                 res.status(401).json({ success: false,  data: err.message });
    //                                                 //res.send({ data: 'error code 0008' },{error: err});
    //                                             });


    //                                         }).catch((err)=>{
    //                                             res.status(401).json({ success: false,  data: err.message });
    //                                             //res.send({ data: 'error code 0007' },{error: err});
    //                                         });
    //                                     }



    //                                 }).catch((err)=>{
    //                                     res.status(401).json({ success: false,  data: err.message });
    //                                     //res.status(401).json({success: false, msg: 'Please retry later!'});
    //                                     //res.send({ data: 'error code 0006' },{error: err});
    //                                 });
    //                             }
                                
    //                         }).catch((err)=>{
                                 
    //                             res.status(401).json({ success: false,  data: err.message });
    //                             //res.status(401).json({success: false, msg: 'Please retry later!'});
    //                             //res.send({ data: 'error code 0005' },{error: err});
    //                         });
                                 
    //                         //res.send({ data: 'done!' });
    //                         res.status(200).json({ success: true });
    //                        //res.send({ data: 'commentactivity saved' });
    //                     }).catch((err) => {
    //                         //res.send({ data: 'error code 0001' },{error: err});
    //                         res.status(401).json({ success: false,  data: err.message });
    //                         //res.send(err)
    //                     });
    //                     //res.send({ data: 'commentactivity saved' });
    //                 }).catch((err) => {
    //                     //res.send(err)
    //                     //res.send({ data: 'error code 0002' },{error: err});
    //                     res.status(401).json({ success: false,  data: err.message });
    //                 });
                    
    //                 //res.send({ data: 'commentactivity saved' });
    //             }).catch((err) => {
    //                 //res.send(err)
    //                 //res.send({ data: 'error code 0003' },{error: err});
    //                 res.status(401).json({ success: false,  data: err.message });
    //             });
    //         }else{ 
    //             //res.send({ data: 'already disliked!' });
    //             res.status(200).json({ success: true, data: 'already disliked!' });
    //         }
    //     }).catch((err)=>{
    //         //res.status(401).json({success: false, msg: 'Please retry later!'});
    //         res.status(401).json({ success: false,  data: err.message });
    //     });
         
    // }
    
    if( req.body.actType == 5 ){ 
        
        Models.comment.findOne(
                { where: { id: req.body.cId, status:0 },
                attributes: ['id','is_reported','reported_count']
            })
        .then(result => {
            if (typeof result.id !== 'undefined'){
                var reportedCount = result.reported_count;
        
                WModels.comment_activity.create({ 
                        comment_id: req.body.cId,
                        comment_act_by: req.body.createBy,
                        comment_act_type: req.body.actType,
                        comment_act_date: Date.now(),
                        report_reason: req.body.report_reasons,
                        status: 0, 
                        created_date: Date.now() 
                        
                }).then((data) => {
                    if( result.is_reported == 0 ){
                        
                        WModels.comment.update(
                            { is_reported: 1 },
                            { where: { id: result.id } }
                        )
                        .then((data) => {                        

                        }).catch((err)=>{
                            
                            res.status(401).json({ success: false,  data: err.message });
                            res.end();
                            //res.send({ data: 'error code 0008' },{error: err});
                        });
                    }
                    
                        WModels.comment.update(
                            { reported_count: reportedCount+1 },
                            { where: { id: result.id } }
                        )
                        .then((data) => {
                            //
                            res.status(200).json({ success: true, data: 'done!' });
                            res.end();

                        }).catch((err)=>{

                            //res.send({ data: 'error code 0008' },{error: err});
                            res.status(401).json({ success: false,  data: err.message });
                            res.end();
                        });
                        
                    //res.send({ data: 'done!' });


                }).catch((err)=>{

                    res.status(401).json({ success: false,  data: err.message });
                });
        
                    
            }else{ 
                //res.send({ data: 'already reported!' });
                res.status(200).json({ success: true, data: 'already reported!' });
                res.end()
            }
        }).catch((err)=>{
            res.status(401).json({ success: false,  data: err.message });
            res.end();
        });
         
    }
     
})

module.exports = commentactivity;
