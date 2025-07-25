var express = require('express');
var topic = express.Router();
var Models = require("../models");
var WModels = require("../wmodels");
var helper = require("../helper/common");
var request = require('request');
const config = require(__dirname + '/../config/config.json');
require('dotenv').config();
const apiUrl = process.env.API_URL || 'https://api.forum.com/';
const Op = Models.Sequelize.Op;
const web_url = process.env.WEB_URL || 'https://www.forum.com/';
const es_index = process.env.ES_INDEX || 'forumprod';
const es_type = process.env.ES_TYPE || 'topic';
const es_url = process.env.ES_URL || 'http://192.168.45.201/nikdashboard/backend/web/elasticindexcron/elastic-index-cron_bckp.php';
const es_key = es_index + '/' + es_type;
const es_search_url = process.env.ES_SEARCH_URL || 'https://search-niknews-elastic-6qf2of3b6nge4pxk6bzbssuuty.ap-south-1.es.amazonaws.com';
var request = require('request');
var querystring = require('querystring');
const { Client } = require('@elastic/elasticsearch')
const new_client = new Client({ node: es_search_url })

topic.post('/create', function (req, res) {
	let tags = '';
	if (req.body.tags.length) {
		req.body.tags.forEach((tag, index) => {
			tags += tag.itemName;
			if (index < (req.body.tags.length - 1))
				tags += ',';
		})
	}
	if (req.body.category.isNew == 1) {
		return WModels.sequelize.transaction(function (t) {
			let term_data = {
				cat_slug: req.body.category.catSlug,
				parent_id: 0,
				status: 1,
				topic_count: 0,
				cat_type: 1,
				created_by: req.body.created_by,
				created_date: Date.now()

			}
			return Models.term.findOne({where: {cat_slug: req.body.category.catSlug}}).then(term => {
				if(term){
					let term_detail_data = {
						cat_id: term.id,
						name: req.body.category['term_details.termDetailName'],
						description: req.body.category['term_details.termDetailName'],
						lang_id: helper.getLangId(req.body.channel.toLowerCase()),
						status: 1,
						created_by: req.body.created_by,
						created_date: Date.now()
					}
					return WModels.term_detail.create(term_detail_data, {returning: true}, {transaction: t}
					);
				}
				else{
					return WModels.term.create(term_data, {transaction: t}).then(term => {
						let term_detail_data = {
							cat_id: term.id,
							name: req.body.category['term_details.termDetailName'],
							description: req.body.category['term_details.termDetailName'],
							lang_id: helper.getLangId(req.body.channel.toLowerCase()),
							status: 1,
							created_by: req.body.created_by,
							created_date: Date.now()
						}
						return WModels.term_detail.create(term_detail_data, {returning: true}, {transaction: t}
						);
					})
				}
			})
		}).then(function (result) {
			// console.log();	
			createArticle(req.body, result.cat_id, tags, function (topic) {
				res.send(topic)
			});
			// res.send(result);
		}).catch(function (err) {
			// Transaction has been rolled back
			// err is whatever rejected the promise chain returned to the transaction callback
			// createArticle(req.body, function(topic){
			// 	res.send(topic)
			// });
			res.send(err);
		});
	}
	else {
		createArticle(req.body, req.body.cat_id, tags, function (topic) {
			res.send(topic)
		});
	}

});

/**
 * This function is used to create article on forum. This api is used for admin dashboard when any admin or anchor creates a new article. This is not used when an article is migrated from nik Live or any other language
 *
 * @param {string[]} topic_data - All the article information is in this array
 * @param {number} cat_id - Category Id
 * @param {string} tags - Tags in string format
 * @return {string[]} Callback function
 *
 */

function createArticle(topic_data, cat_id, tags, callback) {
	let articleId = 0;
	articleId = topic_data.articleId ? topic_data.articleId : articleId;
	let create_topic_json = {
		eng_title: topic_data.eng_title,
		title: topic_data.title,
		description: topic_data.description,
		lang_id: helper.getLangId(topic_data.channel.toLowerCase()),
		is_featured: topic_data.is_featured,
		cat_id: parseInt(cat_id),
		tags: tags,
		slug: topic_data.slug,
		view_count: 0,
		like_count: 0,
		comment_count: 0,
		status: 1,
		image: topic_data.image,
		wp_id: parseInt(articleId),
		is_anchor: topic_data.anchor,
		modified_by: topic_data.created_by,
		created_by: topic_data.userId == 0 ? topic_data.created_by : topic_data.userId,
		created_date: Date.now(),
		source: '0'  //created from web directly
	}
	// console.log(create_topic_json);return;
	// let relationship_data = { topic_id: 8, term_id: parseInt(97), level: 0 };

	return WModels.sequelize.transaction(function (t) {
		return WModels.article.create(create_topic_json, {returning: true}, {transaction: t}).then((topic) => {
			let relationship_data = {topic_id: topic.id, term_id: parseInt(cat_id), level: 0};
			// console.log(relationship_data);return;
			let detail_data = {
				topic_id: topic.id,
				meta_details: JSON.stringify(topic_data.seo)
			}
			return WModels.article_details.create(detail_data, {returning: true}, {transaction: t}).then(relationship => {
				return WModels.article_relationship.create(relationship_data, {returning: true}, {transaction: t}
				);
			})


		})
	}).then(function (result) {
		// Transaction has been committed
		callback(result);
		// result is whatever the result of the promise chain returned to the transaction callback
	}).catch(function (err) {
		// Transaction has been rolled back
		// err is whatever rejected the promise chain returned to the transaction callback
		callback(err);
	});
}



topic.post('/update', (req, res) => {
	let topic_data = req.body;
	let articleId = 0;
	articleId = topic_data.articleId ? topic_data.articleId : articleId;
	let tags = '';
	if (req.body.tags.length) {
		req.body.tags.forEach((tag, index) => {
			tags += tag.itemName;
			if (index < (req.body.tags.length - 1))
				tags += ',';
		})
	}
	let update_topic_json = {
		eng_title: topic_data.eng_title,
		title: topic_data.title,
		description: topic_data.description,
		lang_id: helper.getLangId(topic_data.channel.toLowerCase()),
		tags: tags,
		cat_id: parseInt(topic_data.cat_id),
		slug: topic_data.slug,
		wp_id: parseInt(articleId),
		is_anchor: topic_data.anchor,
		modified_by: topic_data.created_by,
		created_by: topic_data.anchor == 1 ? topic_data.userId : topic_data.created_by,
		// created_date: Date.now()
	}
	// console.log(update_topic_json);return;
	return WModels.sequelize.transaction(function (t) {
		return WModels.article.update(update_topic_json, {where: {id: topic_data.id}}, {returning: true}, {transaction: t}).then((topic) => {
			let relationship_data = {topic_id: topic_data.id, term_id: parseInt(topic_data.cat_id), level: 0};
			// console.log(topic);return;
			let detail_data = {
				topic_id: topic_data.id,
				meta_details: JSON.stringify(topic_data.seo)
			}
			return Models.article_details.findOne({where: {topic_id: topic_data.id}}, {returning: true}, {transaction: t}).then(art_details => {
				if(art_details){
					WModels.article_details.update(detail_data, {where: {topic_id: topic_data.id}}).then(data => {
						console.log('updated')
					}).catch(err => {
						console.log(err)
					})
				}
				else{
					WModels.article_details.create(detail_data).then(data => {
						console.log('created')
					}).catch(err => {
						console.log(err)
					});
				}
			// return WModels.article_details.update(detail_data, {where: {topic_id: topic_data.id}}, {returning: true}, {transaction: t}).then(relationship => {
				Models.article_relationship.findOne({where: {topic_id: topic_data.id}}, {returning: true}, {transaction: t}).then(art_rel => {
					if(art_rel){
						WModels.article_relationship.update(relationship_data, {where: {topic_id: topic_data.id}}).then(data => {
							console.log('updated')
						}).catch(err => {
							console.log(err)
						})
					}
					else{
						WModels.article_relationship.create(relationship_data).then(data => {
							console.log('created')
						}).catch(err => {
							console.log(err)
						});
					}
				})
			})
		})
	}).then(function (result) {
		// Transaction has been committed
		res.status(200).json({ success: true });
		// result is whatever the result of the promise chain returned to the transaction callback
	}).catch(function (err) {
		// Transaction has been rolled back
		// err is whatever rejected the promise chain returned to the transaction callback
		res.status(400).json({ success: false });
	});
})

function getTopicDetail(userId, topicId, callback) {
	// let offset = 0;
	// let limit = 10;
	var result = {
		'topic': '',
		'topic_details': '',
		'comments': ''
	};
	var topic_watchlist_where_json = { user_id: user_id };
	Models.topic.findOne(
		{
			where: { id: parseInt(topicId) },
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
			result.topic = t;
			Models.topic_details.findAll({ where: { topic_id: parseInt(topicId) } }).then(function (t_details) {
				result.topic_details = t_details;
				let query = "SELECT cm.*, u.display_name as author_name, u.display_pic as author_image FROM comment cm  LEFT OUTER JOIN user AS u ON cm.created_by = u.user_id WHERE " +
					"cm.status=0 AND cm.is_reported=0 AND cm.comment_type=0 AND cm.parent_id=0 AND u.user_id IS NOT NULL AND cm.topic_id=" + topicId + " ORDER BY cm.id DESC LIMIT " + offset + "," + limit + "";

				Models.sequelize.query(query, { type: Models.sequelize.QueryTypes.SELECT })
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

topic.post('/fetchWPStory', (req, res) => {
	Models.article.findOne({ where: { wp_id: req.body.wp_id } }).then(data => {
		if (data) {
			res.status(200).json({ success: false, msg: 'exists' });
		}
		else {
			let articleId = req.body.wp_id;
			let articleLang = (req.body.channel).toLowerCase();
			fetchniktopic(articleId, articleLang, function (returnValue) {
				let articleResponse = returnValue.data;
				res.send(returnValue)
			});
		}
	})

})

topic.post('/fetcharticle/', function (req, res) {
	// console.log(new_client);return;
	let articleUrl = req.body.articleUrl ? req.body.articleUrl : 0;
	let user_id = req.body.userId ? req.body.userId : "0";
	let isID = req.body.isID ? req.body.isID : 0;
	let articleId = 0;
	let articleLang = 'english';
	let source = req.body.source ? req.body.source : '0' //1: web, 2: android, 0: default
	let bot_user_id;
	if (isID == 0) {
		articleId = helper.getArticleId(articleUrl); //fetch article ID from URl
		articleLang = (req.body.channelId).toLowerCase(); //get language based on domain
		langId = helper.getLangId(articleLang);
	}
	else {
		articleId = articleUrl;
		articleLang = (req.body.channelId).toLowerCase();
		langId = helper.getLangId(articleLang);
	}
	checkExistenceOfArticle(articleId, langId, function (returnValue) {
		// console.log(returnValue.dataValues);return;
		if (returnValue === null) {
			//article does not exist,,create one by fetching
			fetchniktopic(articleId, articleLang, function (articleResponse) {
				// console.log(articleResponse);return;
				if(articleResponse == null){
					let failure_response = { success: false, description: 'Wrong Language Chosen' }
					res.json(failure_response);
					res.end();
					return;
				}
				//condition to restrict article type before fetching in Forum
				if (articleResponse.news_type != 'news') {
					let failure_response = { success: false, description: 'Article Type not supported for Forum' }
					res.json(failure_response);
					res.end();
					return;
				}else{
					// getCategoryId(articleResponse.section_slug, articleResponse.section, langId, user_id, function (categoryData) {
					getCategoryId(articleResponse.section_slug, helper.jsUcfirst((articleResponse.section_slug).replace(/-/g, ' ')), langId, user_id, function (categoryData) {
						if (user_id == "0") {
							switch (articleLang) {
								case "english":
									bot_user_id = "Zhy1r2kVyDM8w9pboxiQ1XysnfK2"
									break;
								case "bengali":
									bot_user_id = "Zhy1r2kVyDM8w9pboxiQ1XysnfK2"
									break;
								case "hindi":
									bot_user_id = "Zhy1r2kVyDM8w9pboxiQ1XysnfK2"
									break;
								case "gujarati":
									bot_user_id = "Zhy1r2kVyDM8w9pboxiQ1XysnfK2"
									break;
								case "marathi":
									bot_user_id = "Zhy1r2kVyDM8w9pboxiQ1XysnfK2"
									break;
								case "punjabi":
									bot_user_id = "Zhy1r2kVyDM8w9pboxiQ1XysnfK2"
									break;
								default:
									bot_user_id = "Zhy1r2kVyDM8w9pboxiQ1XysnfK2"
									break;
							}
						}
						else{
							bot_user_id = user_id;
						}
						//create article on forum 
						storeInforumDB(categoryData.data.id, articleResponse, articleLang, bot_user_id, source, function (topicDetailData) {
							//create object of article details to push to redis
							let pushObj = {
								categoryId: topicDetailData.dataValues.cat_id,
								comntCount: topicDetailData.dataValues.comment_count,
								createBy: topicDetailData.dataValues.created_by,
								createDate: topicDetailData.dataValues.created_date,
								engTitle: topicDetailData.dataValues.eng_title,
								isAnchor: "0",
								isFeatured: 0,
								langId: topicDetailData.dataValues.lang_id,
								likeCount: topicDetailData.dataValues.like_count,
								modifiedBy: topicDetailData.dataValues.modified_by,
								refId: topicDetailData.dataValues.wp_id,
								tDescription: topicDetailData.dataValues.description,
								tId: topicDetailData.dataValues.id,
								tImage: topicDetailData.dataValues.image,
								tSlug: topicDetailData.dataValues.slug,
								tStatus: 1,
								tTags: topicDetailData.dataValues.tags,
								tTitle: topicDetailData.dataValues.title,
								tViews: 0,
								term_detail: {termId: topicDetailData.dataValues.cat_id, catSlug: articleResponse.section_slug, termDetailName: helper.jsUcfirst((articleResponse.section_slug).replace(/-/g, ' ')), term_details: [{termDetailName: helper.jsUcfirst((articleResponse.section_slug).replace(/-/g, ' '))}]},
								topic_watchlists: [],
								article_details: [{
									id: topicDetailData.articleDetails.id,
									meta_details: topicDetailData.articleDetails.meta_details,
									topic_id: topicDetailData.dataValues.id
								}]
							};
							//fetch user details
							Models.user.findOne({
								where: {user_id: topicDetailData.dataValues.created_by},
								attributes: [['user_id', config.user.user_id], ['display_name', config.user.display_name], ['display_pic', config.user.display_pic]]
							}).then(userData => {
								Object.assign(pushObj, {
									user: {
										userId: userData.dataValues.userId,
										dispName: helper.decrypt(userData.dataValues.dispName),
										dispPic: helper.decrypt(userData.dataValues.dispPic),
									}
								})
								
								//getting redis data
								client.get('st1lang'+pushObj.langId, (err, response) => {
									if(!err){
										let redisData = JSON.parse(response);
										if(redisData.length >= 200){
											redisData = redisData.slice(0, 199);
										}
										redisData.unshift(pushObj);
										storeInES(pushObj, (data => {
										}));
										Object.assign(redisData[0], {totalCount: redisData.length});
										client.set('st1lang'+langId, JSON.stringify(redisData));//updating redis data
										res.json({topic: pushObj, topic_details: pushObj.article_details});
									}
								})
								// request.post({url:es_url, form: {data: [pushObj], key: es_key}}, function(err,httpResponse,body){
								// 	res.json(body)
								// })
							})
						});
					});	
				}
			});
		}
		else {
			//article already exists
			getTopicFullDetails(returnValue.dataValues.tId, langId, function (forumArticleDetail) {
				res.json(forumArticleDetail)
			});
		}
	});
})

function getCategoryId(cat_slug,cat_name,cat_lang, userId, callback){
	let catData = {catSlug: cat_slug};
    WModels.term.findOrCreate({
        where: {cat_slug: cat_slug},
        defaults: {
            cat_slug: cat_slug,
            parent_id: 0,
            status: 1,
            topic_count: 0,
            cat_type: '1',
            created_by: userId,
            created_date: Date.now()
        },
    })
    .spread((term, created) => {
        let data = term.get({
                plain: true
        })
        WModels.term_detail.findOrCreate({
            where: {name: cat_name,lang_id:1}, //lang id 1 to keep the category universal throughout 
            defaults: {
                name: cat_name,
                cat_id: term.dataValues.id,
                description: cat_name,
                lang_id: 1,
                status: '1',
                created_by: 1,
                created_date: Date.now()
                }
    	})
        .spread((term_detail, created) => {
            let detailData = term_detail.get({
                    plain: true
            })
            if(created){
                    // res.json({success: true, data: data});
				callback({success: true, data: data});
            }
            else{
                    // res.json({success: created, data: data});
				callback({success: true, data: data});
            }

        	// console.log(data)
        })
    
    })
}

function getTopicFullDetails(articleId, lang = 3, callback) {
	// console.log(lang);return;
	let where_json = { id: articleId, lang_id: lang };
	var result = {
		'topic': '',
		'topic_details': ''
	};
	// console.log('st1lang'+lang);return;
	client.get('st1lang'+lang, (err, response) => {
		response = JSON.parse(response);
		if(response){
			let redisIndex = response.findIndex(x => (x.tId == articleId && x.langId == lang))
			if(redisIndex != -1){
					let responseData = {
					topic_details: {
						tId: response[redisIndex].article_details[0].id, 
						tdId: response[redisIndex].article_details[0].id, 
						metaDetails: response[redisIndex].article_details[0].meta_details
					}
				}
				delete response[redisIndex].article_details;
				Object.assign(responseData, {
					topic: response[redisIndex]
				});
				callback(responseData)
			}
			else{
				Models.article.findOne({
					where: where_json,
					attributes: [['id', config.article.id], ['title', config.article.title], ['eng_title', config.article.eng_title], ['tags', config.article.tags], ['slug', config.article.slug], ['is_featured', config.article.is_featured], ['lang_id', config.article.lang_id], ['description', config.article.description], ['image', config.article.image], ['cat_id', config.article.cat_id], ['wp_id', config.article.wp_id], ['view_count', config.article.view_count], ['like_count', config.article.like_count], ['comment_count', config.article.comment_count], ['status', config.article.status], ['is_anchor', config.article.is_anchor], ['modified_by', config.article.modified_by], ['created_by', config.article.created_by], ['created_date', config.article.created_date], ['created_date', config.article.created_date]],
					include: [
						{
							model: Models.user,
							attributes: [['user_id', config.user.user_id], ['display_name', config.user.display_name], ['display_pic', config.user.display_pic]],
							required: false
						}
					]
				})
				.then(function (t) {
					if (t == null) {
						callback(t);
					}
					else{
						Models.term.findOne({
							where: {id: t.dataValues.categoryId},
							attributes: [['id',config.term.id],['cat_slug', config.term.cat_slug]],
							// include: 
							// {
							// 	  model: Models.term_detail,
							// 	  where: {cat_id: t.dataValues.categoryId, lang_id: 1},
							// 	  attributes: [['name',config.term_detail.name]],
							// }
						}).then(data => {
							Object.assign(t.dataValues, { term_detail: data.dataValues });
							Object.assign(t.dataValues.term_detail, {termDetailName: helper.jsUcfirst((data.dataValues.catSlug).replace(/-/g, ' '))});
							Object.assign(t.dataValues.term_detail, { term_details: [{termDetailName: helper.jsUcfirst((data.dataValues.catSlug).replace(/-/g, ' '))}]});
							Object.assign(t.dataValues.term_detail, {termDetailId: data.dataValues.termId});
							if (t.user) {
								t.user.dataValues.dispName = helper.decrypt(t.user.dataValues.dispName);
								t.user.dataValues.dispPic = t.user.dataValues.dispPic != '' ? helper.decrypt(t.user.dataValues.dispPic) : '';
							}
							result.topic = t;
							Models.article_details.findOne({ where: { topic_id: parseInt(t.dataValues.tId) }, attributes: [['id', config.article_details.id], ['topic_id', config.article_details.topic_id], ['meta_details', config.article_details.meta_details]] }).then(function (t_details) {
								result.topic_details = t_details;
								callback(result);
							});
						})
					}
				});

			}
		}
		else{
			Models.article.findOne({
				where: where_json,
				attributes: [['id', config.article.id], ['title', config.article.title], ['eng_title', config.article.eng_title], ['tags', config.article.tags], ['slug', config.article.slug], ['is_featured', config.article.is_featured], ['lang_id', config.article.lang_id], ['description', config.article.description], ['image', config.article.image], ['cat_id', config.article.cat_id], ['wp_id', config.article.wp_id], ['view_count', config.article.view_count], ['like_count', config.article.like_count], ['comment_count', config.article.comment_count], ['status', config.article.status], ['is_anchor', config.article.is_anchor], ['modified_by', config.article.modified_by], ['created_by', config.article.created_by], ['created_date', config.article.created_date], ['created_date', config.article.created_date]],
				include: [
					{
						model: Models.user,
						attributes: [['user_id', config.user.user_id], ['display_name', config.user.display_name], ['display_pic', config.user.display_pic]],
						required: false
					}
				]
			})
			.then(function (t) {
				if (t == null) {
					callback(t);
				}
				else{
					Models.term.findOne({
						where: {id: t.dataValues.categoryId},
						attributes: [['id',config.term.id],['cat_slug', config.term.cat_slug]],
						// include: 
						// {
						// 	  model: Models.term_detail,
						// 	  where: {cat_id: t.dataValues.categoryId, lang_id: 1},
						// 	  attributes: [['name',config.term_detail.name]],
						// }
					}).then(data => {
						Object.assign(t.dataValues, { term_detail: data.dataValues });
						Object.assign(t.dataValues.term_detail, {termDetailName: helper.jsUcfirst((data.dataValues.catSlug).replace(/-/g, ' '))});
						Object.assign(t.dataValues.term_detail, { term_details: [{termDetailName: helper.jsUcfirst((data.dataValues.catSlug).replace(/-/g, ' '))}]});
						Object.assign(t.dataValues.term_detail, {termDetailId: data.dataValues.termId});
						if (t.user) {
							t.user.dataValues.dispName = helper.decrypt(t.user.dataValues.dispName);
							t.user.dataValues.dispPic = t.user.dataValues.dispPic != '' ? helper.decrypt(t.user.dataValues.dispPic) : '';
						}
						result.topic = t;
						Models.article_details.findOne({ where: { topic_id: parseInt(t.dataValues.tId) }, attributes: [['id', config.article_details.id], ['topic_id', config.article_details.topic_id], ['meta_details', config.article_details.meta_details]] }).then(function (t_details) {
							result.topic_details = t_details;
							callback(result);
						});
					})
				}
			});

		}
	})
	
}

function checkExistenceOfArticle(articleId, langId, callback) {
	let where_json = { wp_id: articleId, lang_id: langId };

	Models.article.findOne({
		where: where_json,
		attributes: [['id',config.article.id],['wp_id', config.article.wp_id],['slug',config.article.slug]]
	})
		.then(topic_list => {
			if (topic_list === null) {
				callback(topic_list);
				return;
			}
			else {
				callback(topic_list);
			}
		})
}

function fetchniktopic(articleId, articleLang, callback) {
	let articleJsonUrl = 'http://appfeedsnew.niklive.com/testfeeds/' + articleLang + '/posts/' + articleId + '/index';
	var JSONcontent = helper.fetchJSONcontent(articleJsonUrl, function (results) {
		if(results.success){
			results = results.data
			if (typeof results.content.id == 'undefined') {
				var content = results;
			}
			else {
				var content = results.content;
			}
			callback(content);
		}
		else{
			callback(null)
		}
	});
}

//fn to insert new record in topic table ends  (Discuss On forum feature)
function storeInforumDB(cat_id, content, articleLang, user_id, source = 0, callback) {
	// let topic_detail = 0;
	// console.log(content.tags.toString());return;
	// console.log('ee')
	var create_topic_json = {
		title: content.title,
		eng_title: content.title_en,
		is_featured: 0,
		cat_id: cat_id,
		lang_id: helper.getLangId(articleLang),
		slug: helper.convertToSlug(content.title_en),
		description: content.excerpt,
		view_count: 0,
		status: 1,
		image: content.thumbnail_large,
		wp_id: content.id,
		modified_by: user_id,
		created_by: user_id,
		created_date: Date.now(),
		tags: content.tags && content.tags!=null ? content.tags.toString(): '',
		source: source
	}
	let topicData;
	return WModels.sequelize.transaction(function (t) {
		return WModels.article.create(create_topic_json, {transaction: t}).then((tData) => {
			// let articleDetails = content.seo + content.website_url
			topicData = tData;
			Object.assign(content.seo, { website_url: content.website_url })
			var create_topic_detail_json = {
				topic_id: topicData.id,
				// meta_details: content.seo
				meta_details: JSON.stringify(content.seo)
			}
			
			return WModels.sequelize.transaction(t => {

				return WModels.article_details.create(create_topic_detail_json, {transaction: t}).then(article_details => {
					Object.assign(topicData, {articleDetails: article_details.dataValues})
				//   console.log(article_details);
				});

			}).then(result => {
				//   console.log(result);
				// Transaction has been committed
				// result is whatever the result of the promise chain returned to the transaction callback
			}).catch(err => {
				console.log(err);
				// Transaction has been rolled back
				// err is whatever rejected the promise chain returned to the transaction callback
			});
		})
	}).then(function (result) {
		// Transaction has been committed
		callback(topicData);
		// result is whatever the result of the promise chain returned to the transaction callback
	}).catch(function (err) {
		// Transaction has been rolled back
		// err is whatever rejected the promise chain returned to the transaction callback
		console.log(err);
	});

}

async function storeInES(data){
	data.tDescription = data.tDescription.replace(/"/g, '\\"')
	data.tId = data.tId.toString();
	await new_client.index({
		index: es_index,
		type: es_type, // uncomment this line if you are using Elasticsearch ≤ 6
		id: data.tId.toString(),
		body: data
	})

	// here we are forcing an index refresh, otherwise we will not
	// get any result in the consequent search
	// await new_client.indices.refresh({ index: es_key })
}
topic.post('/ESlist/', function (req, res) {
	var lang_id = req.body.length ? req.body[0].langId ? req.body[0].langId : "3" : req.body.langId ? req.body.langId : "3";
	let offset = req.body.length ? req.body[0].offset ? req.body[0].offset : "0" : req.body.offset ? req.body.offset : "0";
	var request = require("request")
var url = es_search_url+'/'+es_key+'/_search?q=langId:'+lang_id+'&from='+offset+'&size=300&sort=_id:desc'
// es_search_url+'/'+es_key+'/'+req.body.topic_id+'/_update'
let esResponseArr = [];
request({
    url: url,
    json: true
}, function (error, response, ESdata) {

    if (!error && response.statusCode === 200) {
		for(let i = 0;i<ESdata.hits.hits.length;i++){
			esResponseArr.push(ESdata.hits.hits[i]._source);
		}
		res.send(esResponseArr);
	}
	else{
		res.status(400).json({success: false, err: error})
	}
})


});

function esListHomePage(lang_id,offset,callback){
	var request = require("request")
	if(offset == 0){
		var url = es_search_url+'/'+es_key+'/_search?q=langId:'+lang_id+'&from='+offset+'&size=10&sort=_id:desc'
	}
	else{
		var url = es_search_url+'/'+es_key+'/_search?q=(langId:'+lang_id+') AND (tId:[0 TO '+offset+'])&size=10&sort=_id:desc';
	}
	let esResponseArr = [];
	request({
		url: url,
		json: true
	}, function (error, response, ESdata) {

		if (!error && response.statusCode === 200) {
			for(let i = 0;i<ESdata.hits.hits.length;i++){
				esResponseArr.push(ESdata.hits.hits[i]._source);
			}
			callback(esResponseArr);
		}
		else{
			callback({success: false, err: error})
		}
	})
}

topic.post('/list/', function (req, res) {
	let limit = config.article.limit;   // number of records per page
	let where_json;
	var lang_id = req.body.length ? req.body[0].langId ? req.body[0].langId : "3" : req.body.langId ? req.body.langId : "3";
	let isApp = req.body.isApp ? req.body.isApp : '1';
	var anchor_id = req.body.length ? req.body[0].anchorId ? req.body[0].anchorId : "0" : req.body.anchorId ? req.body.anchorId : "0";
	var user_id = req.body.length ? req.body[0].userId ? req.body[0].userId : "0" : req.body.userId ? req.body.userId : "0";
	let offset = req.body.length ? req.body[0].offset ? req.body[0].offset : "0" : req.body.offset ? req.body.offset : "0";
	let isTagAvailable = req.body.length ? req.body[0].isTagAvailable ? req.body[0].isTagAvailable : "0" : req.body.isTagAvailable ? req.body.isTagAvailable : "0";
	let Tag = req.body.length ? req.body[0].Tag ? req.body[0].Tag : "0" : req.body.Tag ? req.body.Tag : "0";
	let isCategoryAvailable = req.body.length ? req.body[0].isCategoryAvailable ? req.body[0].isCategoryAvailable : "0" : req.body.isCategoryAvailable ? req.body.isCategoryAvailable : "0";
	let categoryId = req.body.length ? req.body[0].categoryId ? req.body[0].categoryId : "0" : req.body.categoryId ? req.body.categoryId : "0";
	let isSearch = req.body.length ? req.body[0].isSearch ? req.body[0].isSearch : "0" : req.body.isSearch ? req.body.isSearch : "0";
	let tagOrTitle = req.body.length ? req.body[0].tagOrTitle ? req.body[0].tagOrTitle : "0" : req.body.tagOrTitle ? req.body.tagOrTitle : "0";
	let user_where_json = {};
	let redisSearchKey = 'st1';
	let redisSearchParam = '';
	where_json = { status: 1 }


	//ES home page condition here
	if (isTagAvailable === "0" && Tag === "0" && isSearch === "0" && tagOrTitle === "0" && isCategoryAvailable === "0" && categoryId === "0") {
		esListHomePage(lang_id, offset, function (ESresponse) {
			res.send(ESresponse);
		});
	}
	else{
		if (lang_id == "3") {
			redisSearchKey = 'st1lang3';
		}
		else {
			redisSearchKey = 'st1lang' + lang_id;
		}
		// console.log(lang_id);
		client.get(redisSearchKey, (err, response) => {
			// console.log(response);return;
			if (err) {
				res.status(500).send([])
			}
			if (response) {
				let allTopics = JSON.parse(response);
				let filteredTopic = allTopics
				let filteredTopicCount = filteredTopic.length;
				// console.log(filteredTopicCount)
				if (isTagAvailable !== "0" && Tag !== "0") {
					filteredTopic = filteredTopic.filter(x => (x.tTags.includes(Tag + ',') || x.tTags.includes(helper.jsUcfirst(Tag) + ',') || x.tTags.includes(',' + Tag) || x.tTags.includes(',' + helper.jsUcfirst(Tag)) || x.tTags.includes(Tag) || x.tTags.includes(helper.jsUcfirst(Tag))));
					filteredTopicCount = filteredTopic.length;
				}
				//Listing based on tagOrTitle
				if (isSearch !== "0" && tagOrTitle !== "0") {
					filteredTopic = filteredTopic.filter(x => (x.tTags.includes(tagOrTitle + ',') || x.tTags.includes(',' + tagOrTitle) || x.tTags.includes(tagOrTitle) || x.tTitle.includes(tagOrTitle) || x.tTags.includes(helper.jsUcfirst(tagOrTitle) + ',') || x.tTags.includes(',' + helper.jsUcfirst(tagOrTitle)) || x.tTags.includes(helper.jsUcfirst(tagOrTitle)) || x.tTitle.includes(helper.jsUcfirst(tagOrTitle))));
					filteredTopicCount = filteredTopic.length;
					// Object.assign(where_json, {[Op.or]: [{tags: {[Op.like]: '%' + tagOrTitle + '%' }}, {title: {[Op.like]: '%' + tagOrTitle + '%' }}]});
				}
				if (isCategoryAvailable !== "0" && categoryId !== "0") {
					filteredTopic = filteredTopic.filter(x => x.categoryId == categoryId);
					filteredTopicCount = filteredTopic.length;
				}
				if (offset !== "0") {
					filteredTopic = filteredTopic.filter(x => x.tId < offset);
					// Object.assign(where_json, {id: {[Op.lt]: offset}});
				}
				filteredTopic.length ? Object.assign(filteredTopic[0], {totalCount: filteredTopicCount}) : [];
				request.post({url:es_url, form: {data: filteredTopic.slice(0, 10), key: es_key}}, function(err,httpResponse,body){
					res.send(filteredTopic.slice(0, 10))
				})
			}
			else {
				if (offset !== "0") {
					Object.assign(where_json, { id: { [Op.lt]: offset } });
				}
	
	
				// Listing based on tag
				if (isTagAvailable !== "0" && Tag !== "0") {
					Object.assign(where_json, { [Op.and]: [Models.sequelize.literal("FIND_IN_SET(\"" + Tag + "\", `tags`)")] });
				}
	
				//Listing based on tagOrTitle
				if (isSearch !== "0" && tagOrTitle !== "0") {
					Object.assign(where_json, { [Op.or]: [{ tags: { [Op.like]: '%' + tagOrTitle + '%' } }, { title: { [Op.like]: '%' + tagOrTitle + '%' } }] });
				}
	
				if (isCategoryAvailable !== "0" && categoryId !== "0") {
					Object.assign(where_json, { cat_id: categoryId });
				}
				// Listing based on a particular anchor
				if (anchor_id == "0") {
					Object.assign(where_json, { is_anchor: 0 });
				}
				// Listing based on a particular anchor
				if (anchor_id != "0" && anchor_id != "-1") {
					Object.assign(user_where_json, { default_lang_id: lang_id });
					Object.assign(where_json, { created_by: anchor_id, is_anchor: 1 });
				}
				// Listing based on all anchors
				if (anchor_id == "-1") {
					Object.assign(user_where_json, { default_lang_id: lang_id });
					Object.assign(where_json, { is_anchor: 1 });
					Object.assign(user_where_json, { user_type: 2 });
				}
				let includeArr = [{
					model: Models.article_details,
					required: true,
				},
				{
					model: Models.user,
					where: user_where_json,
					attributes: [['user_id', config.user.user_id], ['display_name', config.user.display_name], ['display_pic', config.user.display_pic]],
					paranoid: false,
					required: true,
				}]
				let topic_watchlist_where_json = { user_id: user_id };
				if (user_id != "0") {
					
				}
	
				let order_json = ['id', 'DESC'];
				Models.article.findAndCountAll({
					where: where_json,
					// limit: limit,
					order: [order_json],
					attributes: [['id', config.article.id], ['title', config.article.title], ['eng_title', config.article.eng_title], ['slug', config.article.slug], ['is_featured', config.article.is_featured], ['lang_id', config.article.lang_id], ['description', config.article.description], ['image', config.article.image], ['cat_id', config.article.cat_id], ['wp_id', config.article.wp_id], ['view_count', config.article.view_count], ['like_count', config.article.like_count], ['comment_count', config.article.comment_count], ['status', config.article.status], ['is_anchor', config.article.is_anchor], ['modified_by', config.article.modified_by], ['created_by', config.article.created_by], ['created_date', config.article.created_date], ['tags', config.article.tags]],
					include: includeArr
				}).then(topic_list => {
					let topicList = [];
					if (typeof topic_list.rows !== 'undefined' && topic_list.rows.length > 0) {
						Object.assign(topic_list.rows[0].dataValues, { totalCount: topic_list.count });
						topic_list.rows.forEach((topic, index) => {
							if (!topic.dataValues.topic_watchlists) {
								Object.assign(topic_list.rows[index].dataValues, { topic_watchlists: [] });
							}
	
							Object.assign(topic_list.rows[index].dataValues, { comments: [] });
	
							let where_termDetail_json = { cat_id: topic.dataValues.categoryId, lang_id: topic.dataValues.langId };
							let where_term_json = { id: topic.dataValues.categoryId };
							Models.term.findOne({
								where: where_term_json,
								attributes: [['id', config.term.id], ['cat_slug', config.term.cat_slug]],
								include:
								{
									model: Models.term_detail,
									where: where_termDetail_json,
									attributes: [['name', config.term_detail.name]]
								}
							}).then(data => {
								if (data) {
									Object.assign(topic_list.rows[index].dataValues, { term_detail: data.dataValues });
									Object.assign(topic_list.rows[index].dataValues.term_detail, { termDetailName: data.dataValues.term_details[0].dataValues.termDetailName });
									Object.assign(topic_list.rows[index].dataValues.term_detail, { termDetailId: data.dataValues.termId });
								}
								topic_list.rows[index].user.dataValues.dispName = helper.decrypt(topic_list.rows[index].user.dataValues.dispName);
								topic_list.rows[index].user.dataValues.dispPic = topic_list.rows[index].user.dataValues.dispPic != '' ? helper.decrypt(topic_list.rows[index].user.dataValues.dispPic) : '';
								topicList.push(topic_list.rows[index])
	
								if (index == (topic_list.rows.length - 1)) {
									res.send(topicList)
								}
							})
							//to decrypt the user details
						});
					} else {
						res.send(topicList)
					}
				});
			}
		});
	}
});

topic.get('/filter-list/', function (req, res) {
	var lang_id = req.query.langId ? req.query.langId : "3";
	var anchor_id = req.query.anchorId ? req.query.anchorId : "0";
	let offset = req.query.offset ? parseInt(req.query.offset) : 0;
	let Tag = req.query.tag ? req.query.tag : "0";
	let categoryId = req.query.category ? req.query.category : "0";
	let tagOrTitle = req.query.tagOrTitle ? req.query.tagOrTitle : "0";
	let where_json;
	let user_where_json = {};
	let totalTopicCount = req.body.totalTopics ? req.body.totalTopics : 0;
	let topicCountQuery = "select count(*) as totalTopics from article where";
	where_json = { status: 1 }
			// if (offset !== "0") {
			// 	Object.assign(where_json, { id: { [Op.lt]: offset } });
			// }
			if (lang_id == "3") {
				topicCountQuery += ' && lang_id IN (3, 6)';
				Object.assign(where_json, {[Op.or]: [{lang_id: "3"}, {lang_id: "6"}]});
				Object.assign(where_json, {lang_id: { 
					[Op.or]: [
						[3,6]
						]
				}});
			}
			else {
				topicCountQuery += ' && lang_id = '+lang_id;
				Object.assign(where_json, { lang_id: lang_id});
				Object.assign(where_json, {lang_id: { 
					[Op.or]: [
						[lang_id]
						]
				}});
			}


			// Listing based on tag
			if ( Tag !== "0") {
				topicCountQuery += ' && (FIND_IN_SET("'+Tag+'", `tags`))';
				Object.assign(where_json, { [Op.and]: [Models.sequelize.literal("FIND_IN_SET(\"" + Tag + "\", `tags`)")] });
			}

			//Listing based on tagOrTitle
			if ( tagOrTitle !== "0") {
				topicCountQuery += ' && tags LIKE "%'+tagOrTitle+'%" OR title LIKE "%'+tagOrTitle+'%"';
				Object.assign(where_json, { [Op.or]: [{ tags: { [Op.like]: '%' + tagOrTitle + '%' } }, { title: { [Op.like]: '%' + tagOrTitle + '%' } }
					, { tags: { [Op.like]: '%' + helper.jsUcfirst(tagOrTitle) + '%' } }, { title: { [Op.like]: '%' + helper.jsUcfirst(tagOrTitle) + '%' } }
					, { tags: { [Op.like]: '%' + (tagOrTitle).toUpperCase() + '%' } }, { title: { [Op.like]: '%' + (tagOrTitle).toUpperCase() + '%' } }
					, { tags: { [Op.like]: '%' + (tagOrTitle).toLowerCase() + '%' } }, { title: { [Op.like]: '%' + (tagOrTitle).toLowerCase() + '%' } }
					] });
			}
			if ( categoryId !== "0") {
				categoryId = categoryId.split('-');
				let cat_id = categoryId[categoryId.length - 1];
				// cat_id = categoryId
				topicCountQuery += ' && cat_id = '+cat_id;
				Object.assign(where_json, { cat_id: cat_id });
			}
			// Listing based on a particular anchor
			if (anchor_id == "0") {
				Object.assign(where_json, { is_anchor: 0 });
			}
			// Listing based on a particular anchor
			if (anchor_id != "0" && anchor_id != "-1") {
				topicCountQuery += ' && created_by = "'+anchor_id+'"';
				Object.assign(user_where_json, { default_lang_id: lang_id });
				Object.assign(where_json, { created_by: anchor_id, is_anchor: 1 });
			}
			// Listing based on all anchors
			if (anchor_id == "-1") {
				topicCountQuery += ' && is_anchor = 1';
				Object.assign(user_where_json, { default_lang_id: lang_id });
				Object.assign(where_json, { is_anchor: 1 });
				Object.assign(user_where_json, { user_type: 2 });
			}

			let order_json = ['id', 'DESC'];
			if(topicCountQuery.split(' where')[1] == "" || topicCountQuery.split(' where ')[1] == ""){
				topicCountQuery = topicCountQuery.split(' where')[0] 
			}
			else{
				topicCountQuery = topicCountQuery.replace('where && ', 'where ')
			}
			Models.article.findAll({
				where: where_json,
				order: [order_json],
				offset: offset,
				limit: 10,
				attributes: [['id', config.article.id], ['title', config.article.title], ['eng_title', config.article.eng_title], ['slug', config.article.slug], ['is_featured', config.article.is_featured], ['lang_id', config.article.lang_id], ['description', config.article.description], ['image', config.article.image], ['cat_id', config.article.cat_id], ['wp_id', config.article.wp_id], ['view_count', config.article.view_count], ['like_count', config.article.like_count], ['comment_count', config.article.comment_count], ['status', config.article.status], ['is_anchor', config.article.is_anchor], ['modified_by', config.article.modified_by], ['created_by', config.article.created_by], ['created_date', config.article.created_date], ['tags', config.article.tags]]
				// include: includeArr
			}).then(topic_list => {
				let topicList = [];
				// if (typeof topic_list.rows !== 'undefined' && topic_list.rows.length > 0) {
				// 		Models.sequelize.query(topicCountQuery, { type: Models.sequelize.QueryTypes.SELECT})
				// 		.then(result => {
				// 			totalTopicCount = result[0].totalTopics;
							// Object.assign(topic_list.rows[0].dataValues, { totalCount: totalTopicCount});
							if(offset == 0){
								Models.sequelize.query(topicCountQuery, { type: Models.sequelize.QueryTypes.SELECT})
								.then(result => {
									totalTopicCount = result[0].totalTopics;
									topic_list.forEach((topic, index) => {
										if(index == 0){
											Object.assign(topic_list[index].dataValues, { totalCount: totalTopicCount});
										}
										let where_termDetail_json = { cat_id: topic.dataValues.categoryId, lang_id: topic.dataValues.langId };
										let where_term_json = { id: topic.dataValues.categoryId };
										Models.term.findOne({
											where: where_term_json,
											attributes: [['id', config.term.id], ['cat_slug', config.term.cat_slug]],
											include:
											{
												model: Models.term_detail,
												where: where_termDetail_json,
												attributes: [['name', config.term_detail.name]]
											}
										}).then(data => {
											if (data) {
												Object.assign(topic_list[index].dataValues, { term_detail: data.dataValues });
												Object.assign(topic_list[index].dataValues.term_detail, { termDetailName: data.dataValues.term_details[0].dataValues.termDetailName });
												Object.assign(topic_list[index].dataValues.term_detail, { termDetailId: data.dataValues.termId });
											}
											topicList.push(topic_list[index])
				
											if (index == (topic_list.length - 1)) {
												res.send(topicList)
											}
										})
										//to decrypt the user details
									});
								})
							}
							else{
								topic_list.forEach((topic, index) => {
									if(index == 0){
										Object.assign(topic_list[index].dataValues, { totalCount: totalTopicCount});
									}
									let where_termDetail_json = { cat_id: topic.dataValues.categoryId, lang_id: topic.dataValues.langId };
									let where_term_json = { id: topic.dataValues.categoryId };
									Models.term.findOne({
										where: where_term_json,
										attributes: [['id', config.term.id], ['cat_slug', config.term.cat_slug]],
										include:
										{
											model: Models.term_detail,
											where: where_termDetail_json,
											attributes: [['name', config.term_detail.name]]
										}
									}).then(data => {
										if (data) {
											Object.assign(topic_list[index].dataValues, { term_detail: data.dataValues });
											Object.assign(topic_list[index].dataValues.term_detail, { termDetailName: data.dataValues.term_details[0].dataValues.termDetailName });
											Object.assign(topic_list[index].dataValues.term_detail, { termDetailId: data.dataValues.termId });
										}
										topicList.push(topic_list[index])
			
										if (index == (topic_list.length - 1)) {
											res.send(topicList)
										}
									})
									//to decrypt the user details
								});
							}
				// 		})
				// } else {
				// 	res.send(topicList)
				// }
			});
});


topic.post('/admin-list/', function (req, res) {
	let limit = req.body.limit;   // number of records per page
	let where_json = {};
	let lang_id = req.body.language ? req.body.language : "0";
	let isApp = req.body.isApp ? req.body.isApp : '1';
	var anchor_id = req.body.length ? req.body[0].anchorId ? req.body[0].anchorId : "0" : req.body.anchorId ? req.body.anchorId : "0";
	var cat_id = req.body.length ? req.body[0].category ? req.body[0].category : "0" : req.body.category ? req.body.category : "0";
	var sortOn = req.body.length ? req.body[0].sortOn ? req.body[0].sortOn : "4" : req.body.sortOn ? req.body.sortOn : "4";
	var user_id = req.body.length ? req.body[0].userId : req.body.userId ? req.body.userId : 0;
	let offset = req.body.offset ? req.body.offset : 0;
	let order_json = ['id', 'DESC'];
	let user_where_json = {};
	let totalTopicCount = req.body.totalTopics ? req.body.totalTopics : 0;
	let topicCountQuery = "select count(*) as totalTopics from article where";
	// if(anchor_id != "0" || anchor_id == "-1" || anchor_id == "-2" || anchor_id != "-2" || anchor_id != "-1" || lang_id > 0 || cat_id != "0" || (req.body.startDate && req.body.startDate != '')){
	// 	topicCountQuery += ' where ';
	// }
	if (anchor_id != "0" && anchor_id != "-2" && anchor_id != "-1") {
		topicCountQuery += ' && created_by = "'+anchor_id+'"';
		Object.assign(where_json, { created_by: anchor_id });
	}
	if (anchor_id == "-1") {
		topicCountQuery += ' && is_anchor = 1';
		Object.assign(where_json, { is_anchor: 1 });
		user_where_json = { user_type: 2 }
	}
	if (anchor_id == "-2") {
		topicCountQuery += ' && is_anchor = 0';
		Object.assign(where_json, { is_anchor: 0 });
		user_where_json = { user_type: 1 }
	}
	// sorting required 
	if (sortOn != "0") {
		switch (sortOn) {
			case "1":
				order_json = ['comment_count', 'DESC'];
				break;
			case "10":
				order_json = ['comment_count', 'ASC'];
				break;
			case "2":
				order_json = ['like_count', 'DESC'];
				break;
			case "20":
				order_json = ['like_count', 'ASC'];
				break;
			case "3":
				order_json = ['view_count', 'DESC'];
				break;
			case "30":
				order_json = ['view_count', 'ASC'];
				break;
			case "4":
				order_json = ['created_date', 'DESC'];
				break;
			case "40":
				order_json = ['created_date', 'ASC'];
				break;
			default:
				break;
		}
	}
	if (cat_id != "0") {
		topicCountQuery += ' && cat_id = '+cat_id;
		Object.assign(where_json, { cat_id: cat_id });
	}
	if (lang_id > 0) {
		if (lang_id == 3) {
			topicCountQuery += ' && lang_id IN (3, 6)';
			Object.assign(where_json, { [Op.or]: [{ lang_id: 3 }, { lang_id: 6 }] });
		}
		else {
			topicCountQuery += ' && lang_id = '+lang_id;
			Object.assign(where_json, { lang_id: lang_id });
		}
	}

	if (req.body.startDate && req.body.startDate != '') {
		Object.assign(where_json, { created_date: { [Op.between]: [new Date(req.body.startDate), new Date(new Date(new Date(new Date().setDate(new Date(req.body.endDate).getDate())).setHours(23)).setMinutes(59))] } });
	}
	if(topicCountQuery.split(' where')[1] == "" || topicCountQuery.split(' where ')[1] == ""){
		topicCountQuery = topicCountQuery.split(' where')[0] 
	}
	else{
		topicCountQuery = topicCountQuery.replace('where && ', 'where ')
	}
	if(offset == 0 && totalTopicCount == 0){
		Models.sequelize.query(topicCountQuery, { type: Models.sequelize.QueryTypes.SELECT})
		.then(result => {
			totalTopicCount = result[0].totalTopics;
			if(totalTopicCount > 0){
				getAdminTopicList(where_json, order_json, user_where_json, offset, totalTopicCount, (data) => {
					res.json(data)
				})
			}
			else{
				res.json({success: true, topicList: [], totalTopics: totalTopicCount})
			}
		})
	}
	else{
		getAdminTopicList(where_json, order_json, user_where_json, offset, totalTopicCount, (data) => {
			res.json(data)
		})
	}
	// if(totalTopicCount > 0){
	// 	getAdminTopicList(where_json, order_json, offset, totalTopicCount, (data) => {
	// 		res.send(data)
	// 	})
	// }
	// else{

	// }
	// return;

	// console.log(new Date(new Date().setDate(new Date(req.body.startDate).getDate())))
	// console.log(where_json);return;
	// var topic_watchlist_where_json = {user_id: user_id, $or: [{act_type: "1"}, {act_type: "2"}]};
	
});

function getAdminTopicList(where_json, order_json, user_where_json, offset, totalTopicCount, callback) {
	WModels.article.findAll({
		where: where_json,
		order: [order_json],
		offset: offset,
		limit: 10,
		attributes: [['id', config.article.id], ['title', config.article.title], ['eng_title', config.article.eng_title], ['slug', config.article.slug], ['is_featured', config.article.is_featured], ['lang_id', config.article.lang_id], ['description', config.article.description], ['image', config.article.image], ['cat_id', config.article.cat_id], ['wp_id', config.article.wp_id], ['view_count', config.article.view_count], ['like_count', config.article.like_count], ['comment_count', config.article.comment_count], ['status', config.article.status], ['is_anchor', config.article.is_anchor], ['modified_by', config.article.modified_by], ['created_by', config.article.created_by], ['created_date', config.article.created_date], ['tags', config.article.tags], 'source'],
		include: [
			// {
			// 	model: Models.article_details,
			// 	attributes: ['id', 'topic_id', 'meta_details']
			// },
			{
				model: Models.user,
				required: true,
				where: user_where_json,
				attributes: [['user_id', config.user.user_id], ['display_name', config.user.display_name], ['display_pic', config.user.display_pic]],
			}
		]

	}).then(topic_list => {
		//no results for this criteria
		if (topic_list.length == 0) {
			callback(topic_list);
			return;
		}
		let topicList = [];
		let iterationCount = 0;
		let totalComments = 0;
		let totalLikes = 0;
		let totalViews = 0;
		let totalReportedComments = 0;
		topic_list.forEach((topic, index) => {
			if (topic_list[index].user) {
				topic_list[index].user.dataValues.dispName = helper.decrypt(topic_list[index].user.dataValues.dispName);
				topic_list[index].user.dataValues.dispPic = topic_list[index].user.dataValues.dispPic != '' ? helper.decrypt(topic_list[index].user.dataValues.dispPic) : '';
				topicList.push(topic_list[index])
			}
			else {
				topicList.push(topic_list[index])
			}

			iterationCount = iterationCount + 1;
			//create promise of above loop to send the response after loop finishes execution
			// if (iterationCount == topic_list.length) {
			// 	callback({success: true, topicList: topicList, totalTopics: totalTopicCount})
			// }

		});
		Promise.all(topicList)
			.then((result) => {
				callback({success: true, topicList: topicList, totalTopics: totalTopicCount})
			})
			.catch((err) => {
				callback({success: false, message: err})
			});

	});
}
topic.post('/count-admin-list/', function (req, res) {
	let where_json = {};
	let lang_id = req.body.language ? req.body.language : "0";
	var anchor_id = req.body.length ? req.body[0].anchorId ? req.body[0].anchorId : "0" : req.body.anchorId ? req.body.anchorId : "0";
	var cat_id = req.body.length ? req.body[0].category ? req.body[0].category : "0" : req.body.category ? req.body.category : "0";
	let totalTopicCount = 0;
	let totalCommentCount = 0;
	let totalLikeCount = 0;
	let topicCountQuery = "select id as totalTopics,like_count,comment_count from article where";
	if (anchor_id != "0" && anchor_id != "-2" && anchor_id != "-1") {
		topicCountQuery += ' && created_by = "'+anchor_id+'"';
	}
	if (anchor_id == "-1") {
		topicCountQuery += ' && is_anchor = 1';
	}
	if (anchor_id == "-2") {
		topicCountQuery += ' && is_anchor = 0';
	}
	
	if (cat_id != "0") {
		topicCountQuery += ' && cat_id = '+cat_id;
	}
	if (lang_id > 0) {
		if (lang_id == 3) {
			topicCountQuery += ' && lang_id IN (3, 6)';
		}
		else {
			topicCountQuery += ' && lang_id = '+lang_id;
		}
	}

	if (req.body.startDate && req.body.startDate != '') {
		topicCountQuery += ' && created_date BETWEEN \' ' + req.body.startDate + ' \' AND \' ' +  req.body.endDate + '\'';
		// Object.assign(where_json, { created_date: { [Op.between]: [new Date(req.body.startDate), new Date(new Date(new Date(new Date().setDate(new Date(req.body.endDate).getDate())).setHours(23)).setMinutes(59))] } });
	}
	if(topicCountQuery.split(' where')[1] == "" || topicCountQuery.split(' where ')[1] == ""){
		topicCountQuery = topicCountQuery.split(' where')[0] 
	}
	else{
		topicCountQuery = topicCountQuery.replace('where && ', 'where ')
	}
	Models.sequelize.query(topicCountQuery, { type: Models.sequelize.QueryTypes.SELECT})
	.then(result => {
		result.forEach((topic_ind, index) => {
		totalTopicCount = totalTopicCount + 1;
		totalCommentCount = totalCommentCount + result[index]['comment_count'];
		totalLikeCount = totalLikeCount + result[index]['like_count'];
		});
		res.json({success: true, totalTopics: totalTopicCount, totalComments: totalCommentCount, totalLikes: totalLikeCount});
		return;
	})	
});


// topic.post('/anchor/list/',  function(req, res) {
// 	let limit = 5;   // number of records per page
//   	let offset = 0;		// used to skip the number of rows
// 	var user_id = req.body.length ? req.body[0].userId : req.body.userId;
// 	var anchor_id = req.body.length ? req.body[0].anchor_id : req.body.anchor_id;
// 	offset = req.body.length ? req.body[0].offset : offset;
// 	let where_json;

// 	if(offset == 0){
// 		where_json = {status:1, created_by: anchor_id};
// 	}
// 	else{
// 		where_json = {status:1,id: {$lt: offset}, created_by: anchor_id};
// 	}
// 	var topic_watchlist_where_json = {user_id: user_id,$or: [{act_type: {$eq: "1"}}, {act_type: {$eq: "2"}}]};
// 	let order_json = ['id', 'DESC'];
// 	Models.topic.findAll({
// 		where: where_json,
// 		order: [order_json],
// 		limit: limit,
// 		attributes: [['id','tId'],['eng_title','engTitle'],['is_featured','isFeatured'],['cat_id','categoryId'],['topic_slug','tSlug'],['tags','tTags'],['referer_id','refId'],['followers','tFollowers'],['comment_count','comntCount'],['views','tViews'],['status','tStatus'],['modified_date','modDate'],['image','tImage'],['article_id','artId'],['like_count','likeCount'],['modified_by','modBy'],['created_by','createBy'],['created_date','createDate']],
// 		include: [
// 			{
// 				model: Models.topic_detail,
// 				attributes: [['id','tdId'],['topic_id','tId'],['lang_id','tdLangId'],['title','tdTitle'],['description','tdDescription'],['created_date','tdCreatedDate']]  
// 			},
// 			{
// 			  	model: Models.topic_watchlist,
// 			  	where: topic_watchlist_where_json,
// 			  	paranoid: false, 
// 			  	required: false,
// 			  	attributes: ['act_type']
// 			},
// 			{
// 				model:Models.user, 
// 				where:{user_type:2,status:1, user_id: anchor_id},
// 				attributes: [['id','uId'],['user_id','userId'],['user_name','uName'],['display_name','dispName'],['display_pic','dispPic'],['email_id','emailId'],['contact_no','uContact'],['status','uStatus'],['created_date','uCreatedDate'],['user_type','uType']],
// 	            required:true
// 			}
// 	  	]

// 	  }).then(topic_list => {
// 		const resObj = topic_list.map(_t => {
// 		});

// 		res.json(topic_list)
// 	  });
// });

topic.post('/update/:id', function (req, res) {

	topic_update_array = req.body;
	// res.send(topic_details_array);
	//topic_detail_query = 

	WModels.topic.update(
		topic_update_array,
		{ where: { id: req.params.id } }
	).then(result =>
		res.send(result)
	).error(err =>
		res.send(err)
	)

});

topic.get('/details/:id', function (req, res) {
	// var topic_query = "SELECT `topic`.`id`, `topic`.`eng_title`, `topic`.`is_featured`, `topic`.`cat_id`, `topic`.`topic_slug`, `topic`.`tags`, `topic`.`referer_id`, `topic`.`followers`, `topic`.`comment_count`, `topic`.`views`, `topic`.`status`, `topic`.`modified_date`, `topic`.`image`, `topic`.`modified_by`, `topic`.`created_by`, `topic`.`created_date`, `topic_watchlists`.`user_id` AS `follower` FROM `topic` AS `topic` LEFT JOIN `topic_watchlist` AS `topic_watchlists` ON `topic`.`id` = `topic_watchlists`.`topic_id` AND `topic_watchlists`.`user_id` = '"+user_id+"' WHERE `topic`.`id` = " +req.params.id;
	// var topic_watchlist_where_json = {user_id: user_id, $or: [{act_type: {$eq: "1"}}, {act_type: {$eq: "2"}}]};

	getTopicFullDetails(req.params.id, (data) => {
		res.send(data);
	})

});

topic.get('/details/:langId/:id', function (req, res) {
	// var topic_query = "SELECT `topic`.`id`, `topic`.`eng_title`, `topic`.`is_featured`, `topic`.`cat_id`, `topic`.`topic_slug`, `topic`.`tags`, `topic`.`referer_id`, `topic`.`followers`, `topic`.`comment_count`, `topic`.`views`, `topic`.`status`, `topic`.`modified_date`, `topic`.`image`, `topic`.`modified_by`, `topic`.`created_by`, `topic`.`created_date`, `topic_watchlists`.`user_id` AS `follower` FROM `topic` AS `topic` LEFT JOIN `topic_watchlist` AS `topic_watchlists` ON `topic`.`id` = `topic_watchlists`.`topic_id` AND `topic_watchlists`.`user_id` = '"+user_id+"' WHERE `topic`.`id` = " +req.params.id;
	// var topic_watchlist_where_json = {user_id: user_id, $or: [{act_type: {$eq: "1"}}, {act_type: {$eq: "2"}}]};

	getTopicFullDetails(req.params.id, req.params.langId, (data) => {
		res.send(data);
	})

});


topic.post('/getById/:id', function (req, res) {
	var user_id = req.body.length ? req.body[0].userId ? req.body[0].userId : "0" : req.body.userId ? req.body.userId : "0";
	let offset = 0;
	let limit = 10;
	var result = {
		'topic': '',
		'topic_details': ''
	};
	// var topic_query = "SELECT `topic`.`id`, `topic`.`eng_title`, `topic`.`is_featured`, `topic`.`cat_id`, `topic`.`topic_slug`, `topic`.`tags`, `topic`.`referer_id`, `topic`.`followers`, `topic`.`comment_count`, `topic`.`views`, `topic`.`status`, `topic`.`modified_date`, `topic`.`image`, `topic`.`modified_by`, `topic`.`created_by`, `topic`.`created_date`, `topic_watchlists`.`user_id` AS `follower` FROM `topic` AS `topic` LEFT JOIN `topic_watchlist` AS `topic_watchlists` ON `topic`.`id` = `topic_watchlists`.`topic_id` AND `topic_watchlists`.`user_id` = '"+user_id+"' WHERE `topic`.`id` = " +req.params.id;
	// var topic_watchlist_where_json = {user_id: user_id, $or: [{act_type: {$eq: "1"}}, {act_type: {$eq: "2"}}]};
	var topic_watchlist_where_json = 0;
	if (user_id !== "0") {
		topic_watchlist_where_json = { user_id: user_id };
	}
	else {
		topic_watchlist_where_json = { user_id: null };
	}

	Models.article.findOne({
		where: { id: parseInt(req.params.id) },
		attributes: [['id', config.article.id], ['title', config.article.title], ['eng_title', config.article.eng_title], ['slug', config.article.slug], ['is_featured', config.article.is_featured], ['lang_id', config.article.lang_id], ['description', config.article.description], ['image', config.article.image], ['cat_id', config.article.cat_id], ['wp_id', config.article.wp_id], ['view_count', config.article.view_count], ['like_count', config.article.like_count], ['comment_count', config.article.comment_count], ['status', config.article.status], ['is_anchor', config.article.is_anchor], ['modified_by', config.article.modified_by], ['created_by', config.article.created_by], ['created_date', config.article.created_date], ['created_date', config.article.created_date]],
		include: [
			{
				model: Models.topic_watchlist,
				where: topic_watchlist_where_json,
				paranoid: false,
				required: false,
				attributes: [['act_type', config.watchlist.act_type]]
			},
			{
				model: Models.user,
				attributes: [['user_id', config.user.user_id], ['display_name', config.user.display_name], ['display_pic', config.user.display_pic]],
				required: false
			}
		]

	})
	.then(function (t) {
		if (t == null) {
			res.status(200).json({ success: false, msg: 'Topic not found' });
		}

		Models.term_detail.findOne({
			where: { cat_id: t.dataValues.categoryId, lang_id: t.dataValues.langId },
			attributes: [['name', config.term_detail.name]]
		}).then(data => {
			if (data) {
				Object.assign(t.dataValues, { term_detail: data.dataValues });
			}
			if (t.user) {
				t.user.dataValues.dispName = helper.decrypt(t.user.dataValues.dispName);
				t.user.dataValues.dispPic = t.user.dataValues.dispPic != '' ? helper.decrypt(t.user.dataValues.dispPic) : '';
			}
			result.topic = t;
			Models.article_details.findOne({ where: { topic_id: parseInt(req.params.id) }, attributes: [['id', config.article_details.id], ['topic_id', config.article_details.topic_id], ['meta_details', config.article_details.meta_details]] }).then(function (t_details) {
				result.topic_details = t_details;
				res.send(result);
			});
		})

	});

});

topic.post('/comment/getById/:id', function (req, res) {
	// console.log(req.body);
	var user_id = req.body.length ? req.body[0].userId ? req.body[0].userId : "0" : req.body.userId ? req.body.userId : "0";;
	let offset = 0;
	let limit = config.comment.limit;
	offset = req.body.offset ? req.body.offset : offset;
	var result = {
		'success': '',
		'comments': ''
	};
	let order_json = ['id', 'DESC'];
	let where_json = { topic_id: req.params.id, id: { $lt: offset }, status: 0, parent_id: 0, is_reported: { [Op.ne]: 2 } };

	if (offset == 0) {
		where_json = { topic_id: req.params.id, status: 0, parent_id: 0, is_reported: { [Op.ne]: 2 } };
	}
	else {
		where_json = { topic_id: req.params.id, id: { [Op.lt]: offset }, status: 0, parent_id: 0, is_reported: { [Op.ne]: 2 } };
	}

	let includeArr = [
		{
			model: Models.user,
			paranoid: false,
			required: true,
			attributes: [['user_id', config.user.user_id], ['display_name', config.user.display_name], ['display_pic', config.user.display_pic]]
		}
	];

	if (user_id != "0") {
		includeArr.push({
			model: Models.comment_activity,
			where: { comment_act_by: user_id },
			paranoid: false,
			required: false,
			attributes: [['comment_act_type', config.comment_activity.comment_act_type]]
		})
		// where_commentActivity_json = {comment_act_by: user_id};
	}
	// else{
	// 	where_commentActivity_json = {};
	// }
	// console.log(user_id);
	// console.log(includeArr);
	// console.log(where_json);return;
	Models.comment.findAll(
		{
			where: where_json,
			order: [order_json],
			limit: limit,
			attributes: [['id', config.comment.id], ['comment_text', config.comment.comment_text], ['comment_type', config.comment.comment_type], ['parent_id', config.comment.parent_id], ['topic_id', config.comment.topic_id], ['is_reported', config.comment.is_reported], ['like_count', config.comment.like_count], ['dislike_count', config.comment.dislike_count], ['reported_count', config.comment.reported_count], ['moderated_by', config.comment.moderated_by], ['moderated_date', config.comment.moderated_date], ['status', config.comment.status], ['created_date', config.comment.created_date], ['created_by', config.comment.created_by], ['reply_count', config.comment.reply_count]],
			include: includeArr
		})
		// Models.sequelize.query(topic_query, { type: Models.sequelize.QueryTypes.SELECT})
		.then(function (comments) {
			comments.forEach((comment, index) => {
				if (comments[index].user !== null) {
					comments[index].user.dataValues.dispName = helper.decrypt(comments[index].user.dataValues.dispName)
					comments[index].user.dataValues.dispPic = helper.decrypt(comments[index].user.dataValues.dispPic)
				}
			})
			result.success = 'true';
			result.comments = comments;
			// We don't need spread here, since only the results will be returned for select queries
			res.send(result);
		});

});

topic.post('/latestTwoComments/getById/', function (req, res) {
	let articleId = req.body.length ? req.body[0].articleId ? req.body[0].articleId : "0" : req.body.articleId ? req.body.articleId : "0";
	let langId = req.body.length ? req.body[0].langId ? req.body[0].langId : "0" : req.body.langId ? req.body.langId : "0";
	// console.log(articleId +'-0-'+langId);return;
	let langName = helper.getLangName(Number(langId));
	res.status(404).json({success:true, comments: [], url: web_url+langName+"/"+articleId+"/migrate"});
});

topic.get('/latestTwoComments/:langId/:articleId', function (req, res) {
	let articleId = req.params.articleId ? req.params.articleId : "0";
	let langId = req.params.langId ? req.params.langId : "0";
	let langName = helper.getLangName(Number(langId));
	res.status(200).json({ success: true, comments: [], url: web_url + langName + "/" + articleId + "/migrate" });
	/*
	checkExistenceOfArticle(articleId, langId, function (returnValue) {
		if (returnValue == null) {
		}
		else {
			let forumId = returnValue.dataValues.tId;
			let offset = 0;
			let limit = config.comment.partialLimit;
			offset = req.body.offset ? req.body.offset : offset;
			var result = {
				'success': '',
				'comments': '',
				'url': ''
			};
			let order_json = ['id', 'DESC'];
			let where_json = { topic_id: forumId, id: { $lt: offset }, status: 0, parent_id: 0, is_reported: { [Op.ne]: 2 } };

			if (offset == 0) {
				where_json = { topic_id: forumId, status: 0, parent_id: 0, is_reported: { [Op.ne]: 2 } };
			}
			else {
				where_json = { topic_id: forumId, id: { [Op.lt]: offset }, status: 0, parent_id: 0, is_reported: { [Op.ne]: 2 } };
			}

			let includeArr = [
				{
					model: Models.user,
					paranoid: false,
					required: false,
					attributes: [['user_id', config.user.user_id], ['display_name', config.user.display_name], ['display_pic', config.user.display_pic]]
				}
			];
			Models.comment.findAll(
				{
					where: where_json,
					order: [order_json],
					limit: limit,
					attributes: [['id', config.comment.id], ['comment_text', config.comment.comment_text], ['comment_type', config.comment.comment_type], ['parent_id', config.comment.parent_id], ['topic_id', config.comment.topic_id], ['is_reported', config.comment.is_reported], ['like_count', config.comment.like_count], ['dislike_count', config.comment.dislike_count], ['reported_count', config.comment.reported_count], ['moderated_by', config.comment.moderated_by], ['moderated_date', config.comment.moderated_date], ['status', config.comment.status], ['created_date', config.comment.created_date], ['created_by', config.comment.created_by], ['reply_count', config.comment.reply_count]],
					include: includeArr
				})
				.then(function (comments) {
					comments.forEach((comment, index) => {
						if (comments[index].user !== null) {
							comments[index].user.dataValues.dispName = helper.decrypt(comments[index].user.dataValues.dispName)
							comments[index].user.dataValues.dispPic = helper.decrypt(comments[index].user.dataValues.dispPic)
						}
					})
					result.success = true;
					result.comments = comments;
					let langShort = langId == 3 || langId == 6 ? '' : helper.getLang(langId, 1) + '/';
					result.url = web_url + langShort + 'topic/' + returnValue.dataValues.tSlug + '-' + forumId + '.html';
					result.url = result.url.replace('--', '-');
					res.status(200).json(result);
				});
		}
	});
	*/
});

topic.get('/latestcomment/getById/:id', function (req, res) {
	// console.log(req.headers.userid)
	var user_id = req.headers.userid;
	let prevCommentID = 0;
	let limit = 10;
	prevCommentID = req.body.length ? req.body[0].prevCommentID : prevCommentID;

	var result = { 'comments': '' };
	query = "SELECT cm.*, u.display_name as author_name, u.display_pic as author_image FROM comment cm  LEFT OUTER JOIN user AS u ON cm.created_by = u.user_id WHERE " +
		"cm.status=0 AND cm.is_reported=0 AND cm.comment_type=0 AND cm.parent_id=0 AND u.user_id IS NOT NULL AND cm.topic_id=" + req.params.id + " AND cm.id > " + prevCommentID + "";

	Models.sequelize.query(query, { type: Models.sequelize.QueryTypes.SELECT })
		.then(comments => {

			result.comments = comments;
			// We don't need spread here, since only the results will be returned for select queries
			res.send(result);
		})
});

topic.post('/update/:id', function (req, res) {

	topic_update_array = req.body;
	// res.send(topic_details_array);
	//topic_detail_query = 
	WModels.topic.update(
		topic_update_array,
		{ where: { id: req.params.id } }
	).then(result =>
		res.send(result)
	).error(err =>
		res.send(err)
	)

});



topic.post('/follow/', function (req, res) {
	//user id is mandatory for this api
	if (typeof req.body.userId == 'undefined') {
		res.json({ success: false, data: 'User not logged in' });
		return;
	}
	topic_watchlist_json = { topic_id: req.body.tId, user_id: req.body.userId, status: 1, created_date: Date.now(), act_type: 2 };
	req.body.actType = parseInt(req.body.actType);
	req.body.tId = parseInt(req.body.tId);
	if (req.body.actType == 0) {
		Models.topic_watchlist.destroy({ where: { user_id: req.body.userId, topic_id: req.body.tId } })
			.then(created => {
				if (created) {
					res.json({ success: true });
					//have to implement this to store total follow count
					// Models.article.findByPk(req.body.tId).then(topic_data => {
					//     topic_data.decrement('followers', {by: 1})
					// }).then(data => {
					//     res.json({ success: true});
					// }).catch(err=>{
					//     res.json({success: false, data: err});
					// })
				}
				else {
					res.json({ success: false });
				}
			}).catch(err => {
				res.json({ success: false, data: err });
			});
	}
	else {
		Models.topic_watchlist.findOrCreate({ where: { user_id: req.body.userId, topic_id: req.body.tId }, defaults: topic_watchlist_json })
			.spread((topic_watchlist, created) => {
				let data = topic_watchlist.get({
					plain: true
				})
				if (created) {
					res.json({ success: true });
					//have to implement this to store total follow count
					// Models.topic.findByPk(req.body.tId).then(topic_data => {
					//     topic_data.increment('followers', {by: 1})
					// }).then(data => {
					//     res.json({ success: true});
					// }).catch(err=>{
					//     res.json({success: false, data: err});
					// })
				}
				else {
					res.json({ success: false, msg: 'Already followed!' });
				}
			});
	}
});



topic.post('/like/', helper.loginMiddleware, function (req, res) {
	//user id is mandatory for this api
	if (typeof req.body.user_id == 'undefined') {
		res.json({ success: false, data: 'User not logged in' });
		return;
	}
	topic_watchlist_json = { topic_id: req.body.topic_id, user_id: req.body.user_id, status: 1, created_date: Date.now(), act_type: 1 };
	req.body.type = parseInt(req.body.type);
	req.body.topic_id = parseInt(req.body.topic_id);
	let langId;
	let likeCnt = 0;
	if(req.body.type == 0){
		WModels.topic_watchlist.destroy({where: {user_id: req.body.user_id,topic_id:req.body.topic_id,act_type: 1}})
		.then(created => {
			if(created){
				// WModels.topic.findByPk(req.body.topic_id)
				WModels.article.findOne(
					{ attributes: ['id', 'lang_id', 'like_count'],
					where: { id: req.body.topic_id }
					})
				.then(topic_data => {
					langId = topic_data.dataValues.lang_id;
		            likeCnt = topic_data.dataValues.like_count - 1;
		            topic_data.decrement('like_count', {by: 1})
		        }).then(data => {
		        	client.get('st1lang'+langId, (err, response) => {
						if(response)  {
							response = JSON.parse(response);
							let redisIndex = response.findIndex(x => x.tId == req.body.topic_id);
							if(redisIndex != -1){
								response[redisIndex].likeCount = likeCnt;
								client.set('st1lang'+langId, JSON.stringify(response));
								// response[redisIndex]
							}
							else{
								helper.purgeCach([
			                        apiUrl+'topic/details/'+langId+'/'+req.body.topic_id
			                    ]);
							}
							request({
                                headers: {
                                  // 'Content-Length': contentLength,
                                  'Content-Type': 'application/json'
                                },
                                uri: es_search_url+'/'+es_key+'/'+req.body.topic_id+'/_update',
                                body: JSON.stringify({ "doc" : {"likeCount" : likeCnt}}),
                                method: 'POST'
                              }, function (err, res, body) {
                                console.log(body)
                            });
				            res.json({ success: true});
						}
					});
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
		WModels.topic_watchlist.findOrCreate({where: {user_id: req.body.user_id,topic_id:req.body.topic_id,act_type : 1 }, defaults:topic_watchlist_json })
		.spread((topic_watchlist, created) => {
			let data = topic_watchlist.get({
					plain: true
			})
			if(created){
				// WModels.topic.findByPk(req.body.topic_id)
				WModels.article.findOne(
					{ attributes: ['id', 'lang_id', 'like_count'],
					where: { id: req.body.topic_id }
					})
				.then(topic_data => {
					langId = topic_data.dataValues.lang_id;
		            likeCnt = topic_data.dataValues.like_count + 1;
		            topic_data.increment('like_count', {by: 1})
		        }).then(data => {
		        	client.get('st1lang'+langId, (err, response) => {
						if (err) {
							res.status(500).send([])
						}
						else {
							// console.log(response)
							response = JSON.parse(response);
							let redisIndex = response.findIndex(x => x.tId == req.body.topic_id);
							if(redisIndex != -1){
		        				response[redisIndex].likeCount = likeCnt;
								client.set('st1lang'+langId, JSON.stringify(response));
							}
							else{
								 helper.purgeCach([
			                        apiUrl+'topic/details/'+langId+'/'+req.body.topic_id
			                    ]);
							}
							request({
                                headers: {
                                  // 'Content-Length': contentLength,
                                  'Content-Type': 'application/json'
                                },
                                uri: es_search_url+'/'+es_key+'/'+req.body.topic_id+'/_update',
                                body: JSON.stringify({ "doc" : {"likeCount" : likeCnt}}),
                                method: 'POST'
                              }, function (err, res, body) {
                                console.log(body)
                            });
                    		res.json({ success: true});
						}
					});
		           
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

topic.post('/isfollowed/', function (req, res) {

	topic_watchlist_where = { topic_id: req.body.topic_id, user_id: req.body.user_id, act_type: 2 };

	Models.topic_watchlist.findOne(
		{ where: topic_watchlist_where },
	).then(function (t) {
		if (t === null) {
			res.send(false);
		} else {
			res.send(t);
		}
	});

});

topic.post('/isLiked/', function (req, res) {

	topic_watchlist_where = { topic_id: req.body.topic_id, user_id: req.body.user_id, act_type: 1 };

	Models.topic_watchlist.findOne(
		{ where: topic_watchlist_where },
	).then(function (t) {
		if (t === null) {
			res.send(false);
		} else {
			res.send(t);
		}
	});

});

topic.post('/migrateToRedis', (req, res) => {
	let lang_id = req.body.langId;
	let redisSearchKey = 'st1';
	let where_json = { status: 1 }
	let user_where_json = { user_type: { [Op.ne]: 2 } }
	if (lang_id == "3") {
		Object.assign(where_json, {[Op.or]: [{lang_id: "3"}, {lang_id: "6"}]});
	}
	else {
		Object.assign(where_json, { lang_id: lang_id});
	}
	redisSearchKey += 'lang' + lang_id;
	console.log(redisSearchKey);
	let includeArr = [{
		model: Models.article_details,
		required: true,
	},
	{
		model: Models.user,
		where: user_where_json,
		attributes: [['user_id', config.user.user_id], ['display_name', config.user.display_name], ['display_pic', config.user.display_pic]],
		paranoid: false,
		required: true,
	}]

	let order_json = ['id', 'DESC'];
	let categoryDetail = [];
	client.get('forumCategoriesData', (err, allCat) => {
		allCat = JSON.parse(allCat)
		WModels.article.findAll({
			where: where_json,
			limit: 100,
			order: [order_json],
			attributes: [['id', config.article.id], ['title', config.article.title], ['eng_title', config.article.eng_title], ['slug', config.article.slug], ['is_featured', config.article.is_featured], ['lang_id', config.article.lang_id], ['description', config.article.description], ['image', config.article.image], ['cat_id', config.article.cat_id], ['wp_id', config.article.wp_id], ['view_count', config.article.view_count], ['like_count', config.article.like_count], ['comment_count', config.article.comment_count], ['status', config.article.status], ['is_anchor', config.article.is_anchor], ['modified_by', config.article.modified_by], ['created_by', config.article.created_by], ['created_date', config.article.created_date], ['tags', config.article.tags]],
			include: includeArr
		}).then(topic_list => {
			let topicList = [];
			let wpIdArr = [];
			let articleIdArr = [];
			topic_list.forEach((topic, index) => {
				console.log(topic.dataValues.refId);
				if(!articleIdArr.includes(topic.dataValues.refId)){
					articleIdArr.push(topic.dataValues.refId)
					// console.log(topic.dataValues.refId)
					let query = "SELECT cm.id as "+config.comment.id+",cm.comment_text as "+config.comment.comment_text+",cm.comment_type as "+config. comment.comment_type+",cm.reported_count as "+config.comment.reported_count+",cm.reply_count as "+config.comment.reply_count+",cm.moderated_by as "+config.comment.moderated_by+",cm.moderated_date as "+config.comment.moderated_date+",cm.created_date as "+config.comment.created_date+",cm.created_by as "+config.comment.created_by+", u.display_name as "+config.user.display_name+", u.display_pic as "+config.user.display_pic+" FROM comment cm  LEFT OUTER JOIN user AS u ON cm.created_by = u.user_id WHERE " + 
			        "cm.status=0 AND cm.is_reported!=2 AND cm.comment_type=0 AND cm.parent_id=0 AND u.user_id IS NOT NULL AND cm.topic_id="+topic.dataValues.tId+" ORDER BY cm.id DESC LIMIT 0, 2";
					// console.log(query)	
					WModels.sequelize.query(query, { type: WModels.sequelize.QueryTypes.SELECT})
					.then(comments => {
						if(comments.length){
							comments.forEach((comment, index) => {
								comments[index].dispName = helper.decrypt(comments[index].dispName)
								comments[index].dispPic = helper.decrypt(comments[index].dispPic)
							})
							Object.assign(topic_list[index].dataValues, {comments: comments});
						}
					})
					if(!topic.dataValues.topic_watchlists){
						Object.assign(topic_list[index].dataValues, {topic_watchlists: []});
					}
					
					let where_termDetail_json = {cat_id: topic.dataValues.categoryId, lang_id: topic.dataValues.langId};
					let where_term_json = {id: topic.dataValues.categoryId};
					categoryDetail = allCat.find(x => x.id == topic.dataValues.categoryId)
					Object.assign(topic_list[index].dataValues, { term_detail: {termId: categoryDetail.id, catSlug: categoryDetail.cat_slug, termDetailName: helper.jsUcfirst((categoryDetail.cat_slug).replace(/-/g, ' ')), term_details: [{termDetailName: helper.jsUcfirst((categoryDetail.cat_slug).replace(/-/g, ' '))}]} });
					topic_list[index].user.dataValues.dispName = helper.decrypt(topic_list[index].user.dataValues.dispName);
					topic_list[index].user.dataValues.dispPic = topic_list[index].user.dataValues.dispPic!='' ? helper.decrypt(topic_list[index].user.dataValues.dispPic) : '';
					topicList.push(topic_list[index])
					if(index == (topic_list.length - 1)){
						client.set(redisSearchKey, JSON.stringify(topicList));
						res.send(topicList)
						res.end();
					}
				}
				else{
					if(index == (topic_list.length - 1)){
						client.set(redisSearchKey, JSON.stringify(topicList));
						res.send(topicList)
						res.end();
					}
					//else condition for duplicate article	
				}
				
			});
		});
	})
})

topic.post('/migrateToES', (req, res) => {
	let lang_id = req.body.langId;
	let redisSearchKey = 'st1';
	let where_json = { status: 1 }
	let offset = parseInt(req.body.offset);
	let user_where_json = { user_type: { [Op.ne]: 2 } }
	if (lang_id == "3") {
		Object.assign(where_json, {[Op.or]: [{lang_id: "3"}, {lang_id: "6"}]});
	}
	else {
		Object.assign(where_json, { lang_id: lang_id});
	}
	redisSearchKey += 'lang' + lang_id;
	let includeArr = [{
		model: Models.article_details,
		required: true,
	},
	{
		model: Models.user,
		where: user_where_json,
		attributes: [['user_id', config.user.user_id], ['display_name', config.user.display_name], ['display_pic', config.user.display_pic]],
		paranoid: false,
		required: true,
	}]

	let order_json = ['id', 'DESC'];
	let categoryDetail = [];
	client.get('forumCategoriesData', (err, allCat) => {
		allCat = JSON.parse(allCat)
		WModels.article.findAll({
			offset: offset,
			limit: 25000,
			attributes: [['id', config.article.id], ['title', config.article.title], ['eng_title', config.article.eng_title], ['slug', config.article.slug], ['is_featured', config.article.is_featured], ['lang_id', config.article.lang_id], ['description', config.article.description], ['image', config.article.image], ['cat_id', config.article.cat_id], ['wp_id', config.article.wp_id], ['view_count', config.article.view_count], ['like_count', config.article.like_count], ['comment_count', config.article.comment_count], ['status', config.article.status], ['is_anchor', config.article.is_anchor], ['modified_by', config.article.modified_by], ['created_by', config.article.created_by], ['created_date', config.article.created_date], ['tags', config.article.tags]],
			include: includeArr
		}).then(topic_list => {
			let topicList = [];
			let wpIdArr = [];
			let articleIdArr = [];
			topic_list.forEach((topic, index) => {
				if(!articleIdArr.includes(topic.dataValues.refId)){
					articleIdArr.push(topic.dataValues.refId)
					// console.log(topic.dataValues.refId)
					let query = "SELECT cm.id as "+config.comment.id+",cm.comment_text as "+config.comment.comment_text+",cm.comment_type as "+config. comment.comment_type+",cm.reported_count as "+config.comment.reported_count+",cm.reply_count as "+config.comment.reply_count+",cm.moderated_by as "+config.comment.moderated_by+",cm.moderated_date as "+config.comment.moderated_date+",cm.created_date as "+config.comment.created_date+",cm.created_by as "+config.comment.created_by+", u.display_name as "+config.user.display_name+", u.display_pic as "+config.user.display_pic+" FROM comment cm  LEFT OUTER JOIN user AS u ON cm.created_by = u.user_id WHERE " + 
			        "cm.status=0 AND cm.is_reported!=2 AND cm.comment_type=0 AND cm.parent_id=0 AND u.user_id IS NOT NULL AND cm.topic_id="+topic.dataValues.tId+" ORDER BY cm.id DESC LIMIT 0, 2";
					// console.log(query)	
					WModels.sequelize.query(query, { type: WModels.sequelize.QueryTypes.SELECT})
					.then(comments => {
						if(comments.length){
							comments.forEach((comment, index) => {
								comments[index].dispName = helper.decrypt(comments[index].dispName)
								comments[index].dispPic = helper.decrypt(comments[index].dispPic)
							})
							Object.assign(topic_list[index].dataValues, {comments: comments});
						}
					})
					if(!topic.dataValues.topic_watchlists){
						Object.assign(topic_list[index].dataValues, {topic_watchlists: []});
					}
					
					let where_termDetail_json = {cat_id: topic.dataValues.categoryId, lang_id: topic.dataValues.langId};
					let where_term_json = {id: topic.dataValues.categoryId};
					categoryDetail = allCat.find(x => x.id == topic.dataValues.categoryId)
					Object.assign(topic_list[index].dataValues, { term_detail: {termId: categoryDetail.id, catSlug: categoryDetail.cat_slug, termDetailName: helper.jsUcfirst((categoryDetail.cat_slug).replace(/-/g, ' ')), term_details: [{termDetailName: helper.jsUcfirst((categoryDetail.cat_slug).replace(/-/g, ' '))}]} });
					topic_list[index].user.dataValues.dispName = helper.decrypt(topic_list[index].user.dataValues.dispName);
					topic_list[index].user.dataValues.dispPic = topic_list[index].user.dataValues.dispPic!='' ? helper.decrypt(topic_list[index].user.dataValues.dispPic) : '';
					topicList.push(topic_list[index].dataValues)
					storeInES(topic_list[index].dataValues, (data => {
						console.log(data)
						// if(index == (topic_list.length - 1)){
						// 	res.send('migrated')
						// }
					}));
					if(index == (topic_list.length - 1)){
						res.send('migrated')
					}
					// if(index == (topic_list.length - 1)){
					// 	request.post({url:es_url, form: {data: topicList, key: es_key}}, function(err,httpResponse,body){
					// 		res.json(body)
					// 	})
					// }
				}

				else{
					storeInES(topic_list[index].dataValues, (data => {
						console.log(data)
					}));
					if(index == (topic_list.length - 1)){
						res.send('migrated')
					}
				}
				
			});
		});
	})
})


/**
 * Function to get Topic Watchlist of a particular user.
*/
topic.post('/getWatchlist', (req, res) => {
	Models.topic_watchlist.findOne({
		where: {
			user_id : req.body.userId,
			topic_id: req.body.topicId
		},
		attributes: [['act_type', config.watchlist.act_type]]
	}).then(data => {
		res.send(data)
	})
})

/**
 * Function to get Topic Watchlist of a particular user.
*/
topic.post('/getTopicWatchlist', (req, res) => {
	Models.topic_watchlist.findAll({
		where: {
			user_id : req.body.userId,
			topic_id: req.body.topicId
		},
		attributes: [['act_type', config.watchlist.act_type]]
	}).then(data => {
		res.status(200).json({success: true, topic_watchlists: data})
	}).catch(err => {
		res.status(400).json({success: false, err: err})
	})
})

module.exports = topic;
