'use strict';
var helper = require('../helper/common');
module.exports = {
    // let term_data = [
    //     { cat_slug: 'india', parent_id: 0, status: 1, topic_count: 0, cat_type: '1', created_by: '1', created_date: Date.now()},
    //     { cat_slug: 'world', parent_id: 0, status: 1, topic_count: 0, cat_type: '1', created_by: '1', created_date: Date.now()},
    //     { cat_slug: 'tv', parent_id: 0, status: 1, topic_count: 0, cat_type: '1', created_by: '1', created_date: Date.now()},
    //     { cat_slug: 'photos', parent_id: 0, status: 1, topic_count: 0, cat_type: '1', created_by: '1', created_date: Date.now()},
    //     { cat_slug: 'jobs', parent_id: 0, status: 1, topic_count: 0, cat_type: '1', created_by: '1', created_date: Date.now()},
    //     { cat_slug: 'education', parent_id: 0, status: 1, topic_count: 0, cat_type: '1', created_by: '1', created_date: Date.now()},
    //     { cat_slug: 'budget', parent_id: 0, status: 1, topic_count: 0, cat_type: '1', created_by: '1', created_date: Date.now()},
    //     { cat_slug: 'news', parent_id: 0, status: 1, topic_count: 0, cat_type: '1', created_by: '1', created_date: Date.now()},
    //     { cat_slug: 'business', parent_id: 0, status: 1, topic_count: 0, cat_type: '1', created_by: '1', created_date: Date.now()},
    //     { cat_slug: 'opinion', parent_id: 0, status: 1, topic_count: 0, cat_type: '1', created_by: '1', created_date: Date.now()},
    //     { cat_slug: 'cricket', parent_id: 0, status: 1, topic_count: 0, cat_type: '1', created_by: '1', created_date: Date.now()},
    //     { cat_slug: 'sports', parent_id: 0, status: 1, topic_count: 0, cat_type: '1', created_by: '1', created_date: Date.now()},
    //     { cat_slug: 'auto', parent_id: 0, status: 1, topic_count: 0, cat_type: '1', created_by: '1', created_date: Date.now()},
    //     { cat_slug: 'gadgets', parent_id: 0, status: 1, topic_count: 0, cat_type: '1', created_by: '1', created_date: Date.now()},
    //     { cat_slug: 'events', parent_id: 0, status: 1, topic_count: 0, cat_type: '1', created_by: '1', created_date: Date.now()},
    //     { cat_slug: 'world', parent_id: 0, status: 1, topic_count: 0, cat_type: '1', created_by: '1', created_date: Date.now()}
    // ];
    up: (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('term', 
            [
                { cat_slug: 'india', parent_id: 0, status: 1, topic_count: 0, cat_type: '1', created_by: '1', created_date: helper.getCurrentDateTime()},
                { cat_slug: 'world', parent_id: 0, status: 1, topic_count: 0, cat_type: '1', created_by: '1', created_date: helper.getCurrentDateTime()},
                { cat_slug: 'tv', parent_id: 0, status: 1, topic_count: 0, cat_type: '1', created_by: '1', created_date: helper.getCurrentDateTime()},
                { cat_slug: 'photos', parent_id: 0, status: 1, topic_count: 0, cat_type: '1', created_by: '1', created_date: helper.getCurrentDateTime()},
                { cat_slug: 'jobs', parent_id: 0, status: 1, topic_count: 0, cat_type: '1', created_by: '1', created_date: helper.getCurrentDateTime()},
                { cat_slug: 'education', parent_id: 0, status: 1, topic_count: 0, cat_type: '1', created_by: '1', created_date: helper.getCurrentDateTime()},
                { cat_slug: 'budget', parent_id: 0, status: 1, topic_count: 0, cat_type: '1', created_by: '1', created_date: helper.getCurrentDateTime()},
                { cat_slug: 'news', parent_id: 0, status: 1, topic_count: 0, cat_type: '1', created_by: '1', created_date: helper.getCurrentDateTime()},
                { cat_slug: 'business', parent_id: 0, status: 1, topic_count: 0, cat_type: '1', created_by: '1', created_date: helper.getCurrentDateTime()},
                { cat_slug: 'opinion', parent_id: 0, status: 1, topic_count: 0, cat_type: '1', created_by: '1', created_date: helper.getCurrentDateTime()},
                { cat_slug: 'sports', parent_id: 0, status: 1, topic_count: 0, cat_type: '1', created_by: '1', created_date: helper.getCurrentDateTime()},
                { cat_slug: 'cricket', parent_id: 11, status: 1, topic_count: 0, cat_type: '1', created_by: '1', created_date: helper.getCurrentDateTime()},
                { cat_slug: 'auto', parent_id: 0, status: 1, topic_count: 0, cat_type: '1', created_by: '1', created_date: helper.getCurrentDateTime()},
                { cat_slug: 'gadgets', parent_id: 0, status: 1, topic_count: 0, cat_type: '1', created_by: '1', created_date: helper.getCurrentDateTime()},
                { cat_slug: 'events', parent_id: 0, status: 1, topic_count: 0, cat_type: '1', created_by: '1', created_date: helper.getCurrentDateTime()},
            ], {});
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('term', null, {});
    }

};
