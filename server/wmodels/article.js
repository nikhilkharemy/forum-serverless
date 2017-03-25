'use strict';
var Models = require("../models");

module.exports = (sequelize, DataTypes) => {
  const article = sequelize.define('article', {
    title: DataTypes.STRING,
    eng_title: DataTypes.STRING,
    slug: DataTypes.STRING,
    is_featured: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lang_id: DataTypes.INTEGER,
    description: DataTypes.TEXT,
    image: DataTypes.STRING,
    cat_id: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    wp_id: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    view_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    like_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    comment_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    is_anchor: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    modified_by: {
      type: DataTypes.STRING,
      references: {
          model: Models.user,
          key: 'user_id',
      },
      defaultValue: null
    },
    created_by: {
        type: DataTypes.STRING,
        references: {
            model: Models.user,
            key: 'user_id',
        }
    },
    tags: {
      type: DataTypes.TEXT
    },
    created_date:DataTypes.DATE,
    source: {
      type: DataTypes.STRING,
      defaultValue: '0'
    },
  }, {
    timestamps: false,
    freezeTableName: true
  },
  {
    underscored: true
  });
  article.associate = function(models) {
    article.hasMany(models.article_details,{foreignKey:'topic_id', sourceKey: 'id'});
    article.hasMany(models.article_relationship,{foreignKey:'topic_id', sourceKey: 'id'});
    article.hasMany(models.topic_views,{foreignKey:'topicId', sourceKey: 'id'});
    article.hasMany(models.topic_watchlist,{foreignKey:'topic_id', sourceKey: 'id'});
    article.hasMany(models.comment,{foreignKey:'topic_id', sourceKey: 'id'});
    article.belongsTo(models.user,{foreignKey: 'created_by', targetKey: 'user_id'});
    article.belongsTo(models.term,{foreignKey: 'cat_id'});
    // article.belongsTo(models.term_detail,{foreignKey: 'cat_id'});
  };
  return article;
};