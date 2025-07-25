var express = require('express');
var term = express.Router();
var Models = require("../models");
var helper = require('../helper/common');
const config = require(__dirname + '/../config/config.json');

//term.get('/all', helper.isAuthenticated, function(req, res) {
term.get('/all/:lang_id', function(req, res) {
    let lang = req.params.lang_id;
    let whereJson = {};
    if(lang > 0) {
        whereJson = {lang_id: lang}
    }
    Models.term.findAll({
        raw: true,
        include: [
            { 
                model: Models.term_detail, 
                where: whereJson,
                paranoid: false, 
                attributes: [['name', config.term_detail.name], ['description', config.term_detail.description], ['id', config.term_detail.id], ['lang_id', config.term_detail.lang_id]]
            }
        ],
        attributes: [['cat_slug', config.term.cat_slug], ['id', config.term.id], ['created_by', config.term.created_by]]

    }).then(result => {
        res.json({success: true, data: result});
        res.end()
    }).catch((err)=>{
        res.status(401).json({success: false, msg: 'Please retry later!'});
        res.end()
    }) 
       
});

term.post('/createOrUpdate', (req, res) => {
    // console.log(req.body.userId);return;
    if(req.body.id > 0) {
        return WModels.sequelize.transaction(function (t) {
            return WModels.term.update({cat_slug: req.body.slug }, {where: {id: req.body.id}}, {transaction: t}).then((term) => {
                let updateJson = { name: req.body.name, description: req.body.desc, lang_id: req.body.langId }
                return WModels.term_detail.update(
                    updateJson, {where: {cat_id: req.body.id, lang_id: req.body.langId}}, {returning: true}, {transaction: t}
                );
            })
        }).then(function (result) {
        // Transaction has been committed
            res.status(200).json({success:true})
        // result is whatever the result of the promise chain returned to the transaction callback
        }).catch(function (err) {
        // Transaction has been rolled back
        // err is whatever rejected the promise chain returned to the transaction callback
            res.status(400).json({success:false})
        });
    }
    else{
        return WModels.sequelize.transaction(function (t) {
            let createJson = {cat_slug: req.body.slug, parent_id: 0, status: 1, cat_type: 1, topic_count: 0, created_by: req.body.userId, created_date: Date.now()}
            return WModels.term.create(createJson, {transaction: t}).then((term) => {
                let detailJson = { name: req.body.name, description: req.body.desc, lang_id: req.body.langId, cat_id: term.id, lang_id: req.body.langId, status: 1, created_by: req.body.userId, created_date: Date.now() }
                return WModels.term_detail.create(
                    detailJson, {returning: true}, {transaction: t}
                );
            })
        }).then(function (result) {
        // Transaction has been committed
            res.status(200).json({success:true})
        // result is whatever the result of the promise chain returned to the transaction callback
        }).catch(function (err) {
        // Transaction has been rolled back
        // err is whatever rejected the promise chain returned to the transaction callback
            res.status(400).json({success:false})
        });
    }
})

term.post('/find/:slug', function(req, res) {
    WModels.term.findOrCreate({where: {cat_slug: req.params.slug}, defaults: {
        cat_slug: req.params.slug,
        parent_id: 0,
        status: 1,
        topic_count: 0,
        cat_type: '1',
        created_by: 1,
        created_date: Date.now()
    }})
    .spread((term, created) => {
        let data = term.get({
            plain: true
        })
        if(created){
            res.json({success: true, data: data});
        }
        else{
            res.json({success: created, data: data});
        }
    })
})

term.post('/migrateToRedis', (req, res) => {
    Models.term.findAll().then(data => {
        client.set('forumCategoriesData', JSON.stringify(data));
        res.send('migrated')
    })
})
term.create = (data) => {
    console.log(data);
}
module.exports = term;
