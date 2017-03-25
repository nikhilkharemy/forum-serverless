'use strict';
var Models = require("../models");

module.exports = (sequelize, DataTypes) => {
	const topic_views = sequelize.define('topic_views', {
		userId: {
            type: DataTypes.STRING,
            references: {
                model: Models.user,
                key: 'user_id',
            }
        },
        topicId: {
            type: DataTypes.INTEGER,
            references: {
                model: Models.topic,
                key: 'id',
            } 
        },
        ip: DataTypes.STRING,
	}, {});
	topic_views.associate = function(models) {
		topic_views.belongsTo(models.user,{foreignKey: 'userId', targetKey: 'user_id', as: 'viewer'});
        topic_views.belongsTo(models.topic,{foreignKey: 'topicId', targetKey: 'id', as: 'topic'});
        // topic_views.belongsTo(models.topics,{foreignKey: 'topicId', targetKey: 'id', as: 'topics'});
    	topic_views.belongsTo(models.article,{foreignKey: 'topicId', targetKey: 'id', as: 'topics'});
	};
  	return topic_views;
};