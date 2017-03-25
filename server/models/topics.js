'use strict';
var Models = require("../models");

module.exports = (sequelize, DataTypes) => {
  const topics = sequelize.define('topics', {
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
    created_date:DataTypes.DATE
  }, {
    timestamps: false,
    freezeTableName: true,
    charset: "utf8",
    collate: "utf8_general_ci"
  },
  {
    underscored: true
  });
  topics.associate = function(models) {
    // associations can be defined here
    topics.hasMany(models.topic_details,{foreignKey:'topic_id'});
    topics.hasMany(models.topic_views,{foreignKey:'topicId', sourceKey: 'id'});
    topics.hasMany(models.topic_watchlist,{foreignKey:'topic_id', sourceKey: 'id'});
    topics.hasMany(models.comment,{foreignKey:'topic_id'});
    topics.belongsTo(models.user,{foreignKey: 'created_by', targetKey: 'user_id'});
    topics.belongsTo(models.user,{foreignKey: 'modified_by', targetKey: 'user_id'});
  };
  return topics;
};