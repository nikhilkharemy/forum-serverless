var express = require('express');
var term_detail = express.Router();
var Models = require("../models");
var WModels = require("../wmodels");
var helper = require('../helper/common');

term_detail.get('/all', function(req, res) {
    Models.term_detail.findAll({ raw: true }).then(result => {
        res.json({success: true, data: result});
    }).catch((err)=>{
        res.status(401).json({success: false, msg: 'Please retry later!'});
    }) 
});

term_detail.post('/find/:slug', function(req, res) {
    WModels.term_detail.findOrCreate({where: {cat_slug: req.params.slug}, defaults: {
        cat_slug: req.params.slug,
        parent_id: 0,
        status: 1,
        topic_count: 0,
        cat_type: '1',
        created_by: 1,
        created_date: Date.now()
    }})
    .spread((term_detail, created) => {
        let data = term_detail.get({
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
module.exports = term_detail;