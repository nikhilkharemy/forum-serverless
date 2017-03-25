'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('topics', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      eng_title: {
        type: Sequelize.STRING
      },
      slug: {
        type: Sequelize.STRING
      },
      is_featured: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      lang_id:{
        type: Sequelize.INTEGER,
        defaultValue: 1
      } ,
      cat_id:{
        type: Sequelize.INTEGER
      } ,
      description: {
        type: Sequelize.TEXT
      },
      image: {
        type: Sequelize.STRING,
        defaultValue: null
      },
      wp_id: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      view_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      like_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      comment_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      status: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      is_anchor: {
        type: Sequelize.STRING,
        defaultValue: 0
      },
      modified_by: {
        type: Sequelize.STRING,
      },
      created_by: {
        type: Sequelize.STRING,
      },
      created_date: {
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('topics');
  }
};