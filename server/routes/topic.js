var express = require('express');
var topic = express.Router();
var Models = require("../models");
var helper = require("../helper/common");
var request = require('request');



topic.post('/create',  function(req, res) {
	let articleId = "0";
	articleId = req.body.articleId ? req.body.articleId : articleId;
    create_topic_json = {
        eng_title: req.body.eng_title,
		is_featured: req.body.is_featured,
		cat_id: req.body.cat_id,
		topic_slug: helper.convertToSlug(req.body.eng_title),
		tags: req.body.tags,
		referer_id:req.body.referer,
		followers:0,
		views:0,
		status:1,
		image:req.body.image,
		article_id:articleId,
		modified_date:Date.now(),
		modified_by:req.body.userId,
		created_by:req.body.userId,
		created_date:Date.now()
	}
	topic_details_array = req.body.topic_details;
	
	return Models.sequelize.transaction(function (t) {
		return Models.topic.create(create_topic_json, {transaction: t}).then((topic) => {
			let insert_data = [];
			topic_details_array.forEach(details => {
				insert_data.push({
					topic_id: topic.id,
					lang_id:details.lang_id,
					title: details.title,
					description: details.description,
					created_date:helper.getCurrentDateTime()})
			});
				return Models.topic_detail.bulkCreate(
				insert_data, {returning: true}, {transaction: t}
			);
		})
	  }).then(function (result) {
		// Transaction has been committed
			res.send(result);
		// result is whatever the result of the promise chain returned to the transaction callback
	  }).catch(function (err) {
		// Transaction has been rolled back
		// err is whatever rejected the promise chain returned to the transaction callback
		res.send(err);
	  });
    
});

function getTopicDetail(userId,topicId,callback){
	// let offset = 0;
	// let limit = 10;
	var result = {'topic':'',
								'topic_details':'',
								'comments':''};
	var topic_watchlist_where_json = {user_id: user_id};
	console.log('asdasd');return;
	Models.topic.findOne(
	{
		where:{id:parseInt(topicId)},
		include: [
			{
			  	model: Models.topic_watchlist,
			  	where: topic_watchlist_where_json,
			  	paranoid: false, 
			  	required: false,
			  	attributes: ['act_type']
			}
		]
	}).then(function (t) {
		console.log(t);return;
		result.topic = t;
		Models.topic_details.findAll({where:{topic_id:parseInt(topicId)}}).then(function(t_details){
			result.topic_details = t_details;
			let query = "SELECT cm.*, u.display_name as author_name, u.display_pic as author_image FROM comment cm  LEFT OUTER JOIN user AS u ON cm.created_by = u.user_id WHERE " + 
        "cm.status=0 AND cm.is_reported=0 AND cm.comment_type=0 AND cm.parent_id=0 AND u.user_id IS NOT NULL AND cm.topic_id="+topicId+" ORDER BY cm.id DESC LIMIT "+offset+","+limit+"";
			
			Models.sequelize.query(query, { type: Models.sequelize.QueryTypes.SELECT})
			.then(comments => {
				result.comments = comments;
					// We don't need spread here, since only the results will be returned for select queries
					callback(result);
			})
		});
	}).catch(err => {
		console.log(err)
	});
}


topic.post('/fetcharticle/', function(req, res){
	let articleUrl = req.body.articleUrl ? req.body.articleUrl : 0;
	let user_id = req.body.user_id ? req.body.user_id : 0;
	let isID = req.body.isID ? req.body.isID : 0;
	let articleId = 0;
	let articleLang = 'english';

	if(isID == 0){
		articleId = helper.getArticleId(articleUrl); //fetch article ID from URl
		articleLang = helper.getRefererLang(articleUrl); //get language based on domain
		// let cat_id = 0;
	}
	else{
		articleId = articleUrl;
		articleLang = (req.body.channelId).toLowerCase();
	}
	checkExistenceOfArticle(articleId,user_id, function(returnValue) {
		if(returnValue === null){
			//article does not exist,,create one by fetching
			fetchniktopic(articleId,articleLang,function(returnValue) {
				let articleResponse = returnValue;
				//condition to restrict article type before fetching in Forum
				if(articleResponse.news_type != 'news'){
					let failure_response = {success:false,description:'Article Type not supported for Forum'}
					res.json(failure_response);
					return;
				}
				getCategoryId(returnValue.primary_category,returnValue.site_id,function(returnValue){
						// res.json(articleResponse);
					storeInforumDB(returnValue.data.id,articleResponse, user_id, function(returnValue){
						// res.json(returnValue);
						checkExistenceOfArticle(articleId,user_id,function(forumArticleDetail){
							res.json(forumArticleDetail);
						});
					});
				});	
			});
		}
		else{
			//article already exists
			res.json(returnValue);
		}
	});
})

function getCategoryId(cat_name,cat_lang,callback){
let cat_slug = helper.convertToSlug(cat_name);

Models.term.findOrCreate({
	where: {cat_slug: cat_slug},
	defaults: {
		cat_slug: cat_slug,
		parent_id: 0,
		status: 1,
		topic_count: 0,
		cat_type: '1',
		created_by: 1,
		created_date: Date.now()
	},
	include: [
		{
				model: Models.term_detail,
				where: {lang_id: cat_lang},
				required: true
		}
		]
})
.spread((term, created) => {
	let data = term.get({
			plain: true
	})
	if(created){
					Models.term_detail.findOrCreate({
						where: {name: cat_name}, 
						defaults: {
							name: cat_name,
							cat_id: data.id,
							description: cat_name,
							lang_id: cat_lang,
							status: '1',
							created_by: 1,
							created_date: Date.now()
							}
				})
					.spread((term_detail, created) => {
							let data = term_detail.get({
									plain: true
							})
							if(created){
									// res.json({success: true, data: data});
							}
							else{
									// res.json({success: created, data: data});
							}
					})
		callback({success: true, data: data});
	}
	else{
		callback({success: created, data: data});
	}
})
}

function checkExistenceOfArticle(articleId, user_id, callback){	
	let where_json = {article_id: articleId};
	var result = {'topic':'',
	'topic_details':'',
	'comments':''};
	Models.topic.findOne({
		where: where_json,
		include: [
			{
			  	model: Models.topic_detail,
			},
			{
				model: Models.topic_watchlist,
				where: {user_id: user_id},
				paranoid: false, 
				required: false,
				attributes: [['user_id', 'follower']]
			}
	  	]
		
	  }).then(topic_list => {
			if(topic_list === null){
				callback(topic_list);
			}
			else{
				result.topic = topic_list;
			let query = "SELECT cm.*, u.display_name as author_name, u.display_pic as author_image FROM comment cm  LEFT OUTER JOIN user AS u ON cm.created_by = u.user_id WHERE " + 
        "cm.status=0 AND cm.is_reported=0 AND cm.comment_type=0 AND cm.parent_id=0 AND u.user_id IS NOT NULL AND cm.topic_id="+topic_list.id+" ORDER BY cm.id DESC LIMIT 0,10";
			
			Models.sequelize.query(query, { type: Models.sequelize.QueryTypes.SELECT})
			.then(comments => {
				result.comments = comments;
				result.topic_details = topic_list.topic_details;
					// We don't need spread here, since only the results will be returned for select queries
				callback(result);
			})
			}
		})
}

function fetchniktopic(articleId,articleLang,callback){
	let articleJsonUrl = 'http://appfeedsnew.niklive.in/testfeeds/'+articleLang+'/posts/'+articleId+'/index';
	var JSONcontent = helper.fetchJSONcontent(articleJsonUrl,function(results){
		
		
		if(typeof results.content.id == 'undefined'){
			var content = results;
		}
		else{
			var content = results.content;
		}
		callback(content);
	});
}

//fn to insert new record in topic table ends  (Discuss On forum feature)
function storeInforumDB(cat_id,content, user_id, callback){
	let topic_detail = 0;
	//condition to save single record if its an english article
	if(content.site_id == 1){
		topic_details = [{
			"lang_id":"1",
			"title": content.title_en,
			"description": content.content
			}]
	}
	else{
		topic_details = [{
			"lang_id":"1",
			"title": content.title_en,
			"description": content.content
			},
			{
				"lang_id":"2",
				"title": content.title,
				"description": content.content
				}]
	}

	var create_topic_json = {
		eng_title: content.title_en,
		is_featured: 0,
		cat_id: cat_id,
		topic_slug: helper.convertToSlug(content.title_en),
		tags: content.tags?content.tags.toString() : 0,
		referer_id:content.site_id,
		followers:0,
		views:0,
		status:1,
		image:content.thumbnail_large,
		article_id:content.id,
		modified_date:Date.now(),
		modified_by:user_id,
		created_by:user_id,
		created_date:Date.now()
	}
	topic_details_array = topic_details;

	return Models.sequelize.transaction(function (t) {
		return Models.topic.create(create_topic_json, {transaction: t}).then((topic) => {
			let insert_data = [];
			topic_details_array.forEach(details => {
				insert_data.push({
					topic_id: topic.id,
					lang_id:details.lang_id,
					title: details.title,
					description: details.description,
					created_date:helper.getCurrentDateTime()})
			});
				return Models.topic_detail.bulkCreate(
				insert_data, {returning: true}, {transaction: t}
			);
		})
	}).then(function (result) {
	// Transaction has been committed
		callback(result);
	// result is whatever the result of the promise chain returned to the transaction callback
	}).catch(function (err) {
	// Transaction has been rolled back
	// err is whatever rejected the promise chain returned to the transaction callback
		console.log(err);
	});

}
//fn to insert new record in topic table ends


topic.post('/list/',  function(req, res) {
	let q_params = req.body;
	let limit = 50;   // number of records per page
	let where_json;
	
	let isApp = req.body.isApp ? req.body.isApp : '1';
	var user_id = req.body.length ? req.body[0].userId : req.body.userId ? req.body.userId : 0;
	let offset = req.body.length ? req.body[0].offset : 0;
	
	if(offset == 0){
		where_json = {status:1};
	}
	else{
		where_json = {status:1,id: {$lt: offset}};
	}

	if(isApp == '0'){
		user_where_cond = '';
	}
	else{
		user_where_cond = {user_type: {$ne : '2'}};
	}
	// console.log(where_json);return;
	var topic_watchlist_where_json = {user_id: user_id,$or: [{act_type: {$eq: "1"}}, {act_type: {$eq: "2"}}]};
	let order_json = ['id', 'DESC'];
	Models.topic.findAll({
		where: where_json,
		order: [order_json],
		limit: limit,
		include: [
			{
			  	model: Models.topic_detail,
			},
			{
			  	model: Models.topic_watchlist,
			  	where: topic_watchlist_where_json,
			  	paranoid: false, 
			  	required: false,
			  	attributes: ['act_type']
			},
			{
				model: Models.user,
				where: user_where_cond,
				paranoid: false, 
				required: true,
			}
	  	]
		
	}).then(topic_list => {
		console.log(topic_list.length)
		res.json(topic_list)
	});
});


topic.post('/anchor/list/',  function(req, res) {
	let q_params = req.body;
	let limit = 5;   // number of records per page
  	let offset = 0;		// used to skip the number of rows
	var user_id = req.body.length ? req.body[0].userId : req.body.userId;
	var anchor_id = req.body.length ? req.body[0].anchor_id : req.body.anchor_id;
	offset = req.body.length ? req.body[0].offset : offset;
	let where_json;

	if(offset == 0){
		where_json = {status:1, created_by: anchor_id};
	}
	else{
		where_json = {status:1,id: {$lt: offset}, created_by: anchor_id};
	}
	console.log(where_json);
	var topic_watchlist_where_json = {user_id: user_id,$or: [{act_type: {$eq: "1"}}, {act_type: {$eq: "2"}}]};
	let order_json = ['id', 'DESC'];
	Models.topic.findAll({
		where: where_json,
		order: [order_json],
		limit: limit,
		attributes: [['id','tId']['eng_title','engTitle']['is_featured','isFeatured']['cat_id','categoryId']['topic_slug','tSlug']['tags','tTags']['referer_id','refId']['followers','tFollowers']['comment_count','comntCount']['views','tViews']['status','tStatus']['modified_date','modDate']['image','tImage']['article_id','artId']['like_count','likeCount']['modified_by','modBy']['created_by','createBy']['created_date','createDate']],		
		include: [
			{
			  	model: Models.topic_detail,
			},
			{
			  	model: Models.topic_watchlist,
			  	where: topic_watchlist_where_json,
			  	paranoid: false, 
			  	required: false,
			  	attributes: ['act_type']
			},
			{
				model:Models.user, 
	            where:{user_type:2,status:1, user_id: anchor_id},   
	            required:true
			}
	  	]
		
	  }).then(topic_list => {
		const resObj = topic_list.map(_t => {
		});

		res.json(topic_list)
	  });
});

topic.post('/update/:id', function(req, res) {
	
	topic_update_array = req.body;
	// res.send(topic_details_array);
	//topic_detail_query = 

	Models.topic.update(
		topic_update_array,
		{ where: {id: req.params.id} }
	).then(result =>
			res.send(result)
	).error(err =>
		res.send(err)
	)
	
});


topic.post('/getById/:id', function(req, res) {
	var user_id = req.body.length ? req.body.userId : 0;
	let offset = 0;
	let limit = 10;
	var result = {'topic':'',
								'topic_details':'',
								'comments':''};
	var topic_query = "SELECT `topic`.`id`, `topic`.`eng_title`, `topic`.`is_featured`, `topic`.`cat_id`, `topic`.`topic_slug`, `topic`.`tags`, `topic`.`referer_id`, `topic`.`followers`, `topic`.`comment_count`, `topic`.`views`, `topic`.`status`, `topic`.`modified_date`, `topic`.`image`, `topic`.`modified_by`, `topic`.`created_by`, `topic`.`created_date`, `topic_watchlists`.`user_id` AS `follower` FROM `topic` AS `topic` LEFT JOIN `topic_watchlist` AS `topic_watchlists` ON `topic`.`id` = `topic_watchlists`.`topic_id` AND `topic_watchlists`.`user_id` = '"+user_id+"' WHERE `topic`.`id` = " +req.params.id;
	var topic_watchlist_where_json = {user_id: user_id,$or: [{act_type: {$eq: "1"}}, {act_type: {$eq: "2"}}]};
	Models.article.findOne(
	{
		where:{id:parseInt(req.params.id)},
		include: [
			{
				model: Models.topic_watchlist,
			  	where: topic_watchlist_where_json,
			  	paranoid: false, 
			  	required: false,
			  	attributes: ['act_type']
			}
		]
	})
	// Models.sequelize.query(topic_query, { type: Models.sequelize.QueryTypes.SELECT})
	.then(function (t) {
		result.topic = t;
		Models.article_details.findAll({where:{topic_id:parseInt(req.params.id)}}).then(function(t_details){
			result.topic_details = t_details;
			let query = "SELECT cm.*, u.display_name as author_name, u.display_pic as author_image FROM comment cm  LEFT OUTER JOIN user AS u ON cm.created_by = u.user_id WHERE " + 
        "cm.status=0 AND cm.is_reported!=2 AND cm.comment_type=0 AND cm.parent_id=0 AND u.user_id IS NOT NULL AND cm.topic_id="+req.params.id+" ORDER BY cm.id DESC LIMIT "+offset+","+limit+"";
			
			Models.sequelize.query(query, { type: Models.sequelize.QueryTypes.SELECT})
			.then(comments => {
				result.comments = comments;
					// We don't need spread here, since only the results will be returned for select queries
				res.send(result);
			})

			
			
		});
	});
	
});


function getTopicDetail(userId,topicId,callback){
	// let offset = 0;
	// let limit = 10;
	var result = {'topic':'',
								'topic_details':'',
								'comments':''};
	var topic_watchlist_where_json = {user_id: user_id};
	console.log('asdasd');return;
	Models.topic.findOne(
	{
		where:{id:parseInt(topicId)},
		include: [
			{
			  	model: Models.topic_watchlist,
			  	where: topic_watchlist_where_json,
			  	paranoid: false, 
			  	required: false,
			  	attributes: ['act_type']
			}
		]
	}).then(function (t) {
		console.log(t);return;
		result.topic = t;
		Models.topic_details.findAll({where:{topic_id:parseInt(topicId)}}).then(function(t_details){
			result.topic_details = t_details;
			let query = "SELECT cm.*, u.display_name as author_name, u.display_pic as author_image FROM comment cm  LEFT OUTER JOIN user AS u ON cm.created_by = u.user_id WHERE " + 
        "cm.status=0 AND cm.is_reported=0 AND cm.comment_type=0 AND cm.parent_id=0 AND u.user_id IS NOT NULL AND cm.topic_id="+topicId+" ORDER BY cm.id DESC LIMIT "+offset+","+limit+"";
			
			Models.sequelize.query(query, { type: Models.sequelize.QueryTypes.SELECT})
			.then(comments => {
				result.comments = comments;
					// We don't need spread here, since only the results will be returned for select queries
					callback(result);
			})
		});
	}).catch(err => {
		console.log(err)
	});
}


topic.post('/comment/getById/:id', function(req, res) {
	var user_id = req.body.userId;//req.headers.userid;
	let offset = 0;
	let limit = 10;
	offset = req.body.offset ? req.body.offset : offset;
	var result = { 'success' : '',
		'comments':''};
	let order_json = ['id', 'DESC'];
	let where_json = {topic_id:req.params.id,id: {$lt: offset},status:0,parent_id:0, is_reported: {$ne: 2}};

	if(offset == 0){
		where_json = {topic_id:req.params.id,status:0,parent_id:0, is_reported: {$ne: 2}};
	}
	else{
		where_json = {topic_id:req.params.id,id: {$lt: offset},status:0,parent_id:0, is_reported: {$ne: 2}};
	}

	Models.comment.findAll(
	{
		where:where_json,
		order: [order_json],
		limit: limit,
		include: [
			{
					model: Models.comment_activity,
					where: {comment_act_by: user_id},
					paranoid: false, 
					required: false,
					attributes: ['comment_act_type']
			},
			{
				model: Models.user,
				as: 'author',
				paranoid: false, 
				required: false,
				attributes: [['user_id','id'],['display_name','author_name'],['display_pic','author_image']]
		}
		]
	})
	// Models.sequelize.query(topic_query, { type: Models.sequelize.QueryTypes.SELECT})
	.then(function (comments) {
		result.success = 'true';
		result.comments = comments;
		// We don't need spread here, since only the results will be returned for select queries
		res.send(result);
	});

});




topic.get('/latestcomment/getById/:id', function(req, res) {
	// console.log(req.headers.userid)
	var user_id = req.headers.userid;
	let prevCommentID = 0;
	let limit = 10;
	prevCommentID = req.body.length ? req.body[0].prevCommentID : prevCommentID;

	var result = {'comments':''};
			query = "SELECT cm.*, u.display_name as author_name, u.display_pic as author_image FROM comment cm  LEFT OUTER JOIN user AS u ON cm.created_by = u.user_id WHERE " + 
        "cm.status=0 AND cm.is_reported=0 AND cm.comment_type=0 AND cm.parent_id=0 AND u.user_id IS NOT NULL AND cm.topic_id="+req.params.id+" AND cm.id > "+prevCommentID+"";
			
			Models.sequelize.query(query, { type: Models.sequelize.QueryTypes.SELECT})
			.then(comments => {

				result.comments = comments;
					// We don't need spread here, since only the results will be returned for select queries
				res.send(result);
			})
});

topic.post('/update/:id', function(req, res) {
	
	topic_update_array = req.body;
	// res.send(topic_details_array);
	//topic_detail_query = 

	Models.topic.update(
		topic_update_array,
		{ where: {id: req.params.id} }
	).then(result =>
			res.send(result)
	).error(err =>
		res.send(err)
	)
	
});



topic.post('/follow/', function(req, res) {
	//user id is mandatory for this api
	console.log(req.body);return;
	if(typeof req.body.user_id == 'undefined'){
		res.json({success: false, data: 'User not logged in'});
		return;
	}
	topic_watchlist_json = {topic_id:req.body.topic_id,user_id:req.body.user_id, status:1,created_date:Date.now(),act_type:2};
	req.body.type = parseInt(req.body.type);
	req.body.topic_id = parseInt(req.body.topic_id);
	if(req.body.type == 0){
		Models.topic_watchlist.destroy({where: {user_id: req.body.user_id,topic_id:req.body.topic_id }})
		.then(created => {
			if(created){
				Models.article.findByPk(req.body.topic_id).then(topic_data => {
		            topic_data.decrement('followers', {by: 1})
		        }).then(data => {
		            res.json({ success: true});
		        }).catch(err=>{
		            res.json({success: false, data: err});
		        })
			}
			else{
				res.json({success: false});
			}
		}).catch(err => {
            res.json({success: false, data: err});
		});
	}
	else{
		Models.topic_watchlist.findOrCreate({where: {user_id: req.body.user_id,topic_id:req.body.topic_id }, defaults:topic_watchlist_json })
		.spread((topic_watchlist, created) => {
			let data = topic_watchlist.get({
					plain: true
			})
			if(created){
				Models.article.findByPk(req.body.topic_id).then(topic_data => {
		            topic_data.increment('followers', {by: 1})
		        }).then(data => {
		            res.json({ success: true});
		        }).catch(err=>{
		            res.json({success: false, data: err});
		        })
			}
			else{
				res.json({success: false});
			}
		});
	}
});



topic.post('/like/', function(req, res) {
	//user id is mandatory for this api
	if(typeof req.body.user_id == 'undefined'){
		res.json({success: false, data: 'User not logged in'});
		return;
	}
	topic_watchlist_json = {topic_id:req.body.topic_id,user_id:req.body.user_id, status:1,created_date:Date.now(),act_type:1};
	req.body.type = parseInt(req.body.type);
	req.body.topic_id = parseInt(req.body.topic_id);
	if(req.body.type == 0){
		Models.topic_watchlist.destroy({where: {user_id: req.body.user_id,topic_id:req.body.topic_id,act_type: 1}})
		.then(created => {
			if(created){
				Models.topic.findByPk(req.body.topic_id).then(topic_data => {
		            topic_data.decrement('like_count', {by: 1})
		        }).then(data => {
		            res.json({ success: true});
		        }).catch(err=>{
		            res.json({success: false, data: err});
		        })
			}
			else{
				res.json({success: false});
			}
		}).catch(err => {
            res.json({success: false, data: err});
		});
	}
	else{
		Models.topic_watchlist.findOrCreate({where: {user_id: req.body.user_id,topic_id:req.body.topic_id,act_type : 1 }, defaults:topic_watchlist_json })
		.spread((topic_watchlist, created) => {
			let data = topic_watchlist.get({
					plain: true
			})
			if(created){
				Models.topic.findByPk(req.body.topic_id).then(topic_data => {
		            topic_data.increment('like_count', {by: 1})
		        }).then(data => {
		            res.json({ success: true});
		        }).catch(err=>{
		            res.json({success: false, data: err});
		        })
			}
			else{
				res.json({success: false});
			}
		});
	}
});

topic.post('/isfollowed/', function(req, res) {
	
	topic_watchlist_where = {topic_id:req.body.topic_id,user_id:req.body.user_id,act_type:2};
	
	Models.topic_watchlist.findOne(
		{where:topic_watchlist_where},
		).then(function (t) {
			if( t === null){
				res.send(false);
			}else{
				res.send(t);
			}
		});

});

topic.post('/isLiked/', function(req, res) {
	
	topic_watchlist_where = {topic_id:req.body.topic_id,user_id:req.body.user_id,act_type:1};
	
	Models.topic_watchlist.findOne(
		{where:topic_watchlist_where},
		).then(function (t) {
			if( t === null){
				res.send(false);
			}else{
				res.send(t);
			}
		});

});

topic.post('/isAuthTest/', function(req, res) {
	
helper.isAuthenticated();

});


module.exports = topic;
