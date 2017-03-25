'use strict';
var helper = require('../helper/common');
var insert_data = [
                { name: 'India', description: 'India', cat_id: 1, status: 1, lang_id: 1, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'World', description: 'World', cat_id: 2, status: 1, lang_id: 1, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'TV', description: 'TV', cat_id: 3, status: 1, lang_id: 1, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'Photos', description: 'Photos', cat_id: 4, status: 1, lang_id: 1, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'भारत', description: 'भारत', cat_id: 1, status: 1, lang_id: 3, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'विश्व', description: 'विश्व', cat_id: 2, status: 1, lang_id: 3, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'टेलीविजन', description: 'टेलीविजन', cat_id: 3, status: 1, lang_id: 3, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'तस्वीरें', description: 'तस्वीरें', cat_id: 4, status: 1, lang_id: 3, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'ভারত', description: 'ভারত', cat_id: 1, status: 1, lang_id: 7, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'বিশ্ব', description: 'বিশ্ব', cat_id: 2, status: 1, lang_id: 7, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'খবর', description: 'খবর', cat_id: 8, status: 1, lang_id: 7, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'স্পোর্টস', description: 'স্পোর্টস', cat_id: 11, status: 1, lang_id: 7, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'ਨੌਕਰੀਆਂ', description: 'ਨੌਕਰੀਆਂ', cat_id: 1, status: 1, lang_id: 519, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'ਸਿੱਖਿਆ', description: 'ਸਿੱਖਿਆ', cat_id: 2, status: 1, lang_id: 519, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'ਨਿਊਜ਼', description: 'ਨਿਊਜ਼', cat_id: 8, status: 1, lang_id: 519, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'ਖੇਡਾਂ', description: 'ਖੇਡਾਂ', cat_id: 11, status: 1, lang_id: 519, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'नोकर्या', description: 'नोकर्या', cat_id: 1, status: 1, lang_id: 5, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'शिक्षण', description: 'शिक्षण', cat_id: 2, status: 1, lang_id: 5, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'बातम्या', description: 'बातम्या', cat_id: 8, status: 1, lang_id: 5, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'खेळ', description: 'खेळ', cat_id: 11, status: 1, lang_id: 5, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'નોકરીઓ', description: 'નોકરીઓ', cat_id: 1, status: 1, lang_id: 4, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'શિક્ષણ', description: 'શિક્ષણ', cat_id: 2, status: 1, lang_id: 4, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'સમાચાર', description: 'સમાચાર', cat_id: 8, status: 1, lang_id: 4, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'રમતો', description: 'રમતો', cat_id: 11, status: 1, lang_id: 4, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'Jobs', description: 'Jobs', cat_id: 5, status: 1, lang_id: 1, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'Education', description: 'Education', cat_id: 6, status: 1, lang_id: 1, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'Budget', description: 'Budget', cat_id: 7, status: 1, lang_id: 1, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'News', description: 'News', cat_id: 8, status: 1, lang_id: 1, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'Business', description: 'Business', cat_id: 9, status: 1, lang_id: 1, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'Opinion', description: 'Opinion', cat_id: 10, status: 1, lang_id: 1, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'Sports', description: 'Sports', cat_id: 11, status: 1, lang_id: 1, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'Auto', description: 'Auto', cat_id: 13, status: 1, lang_id: 1, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'Gadgets', description: 'Gadgets', cat_id: 14, status: 1, lang_id: 1, created_by: '1', created_date: helper.getCurrentDateTime()},
                { name: 'Events', description: 'Events', cat_id: 15, status: 1, lang_id: 1, created_by: '1', created_date: helper.getCurrentDateTime()},
            ];
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('term_detail', 
            insert_data, {});
    },

    down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
    }
};
