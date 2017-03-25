'use strict';
var helper = require("../helper/common");
const topic_detail = require('./topic_detail');

module.exports = (sequelize, DataTypes) => {
	const topic = sequelize.define('topic', {
		eng_title: DataTypes.STRING,
		is_featured:DataTypes.INTEGER,
		cat_id: DataTypes.INTEGER,
		topic_slug: DataTypes.STRING,
		tags: DataTypes.STRING,
		referer_id:DataTypes.INTEGER,
		followers:DataTypes.INTEGER,
		comment_count: DataTypes.INTEGER,
		views:DataTypes.INTEGER,
		status:DataTypes.INTEGER,
		modified_date:DataTypes.DATE,
		image: DataTypes.STRING,
		article_id: DataTypes.INTEGER,
		like_count: DataTypes.INTEGER,
		modified_by: {
			type: DataTypes.STRING,
			default: null
		},
		created_by:DataTypes.STRING,
		created_date:DataTypes.DATE
	}, {
		timestamps: false,
		freezeTableName: true
	},
	{
		underscored: true
	  });
	topic.associate = function(models) {
		//relations
		topic.hasMany(models.topic_detail,{foreignKey:'topic_id'});
		topic.hasMany(models.topic_views,{foreignKey:'topicId', sourceKey: 'id'});
		topic.hasMany(models.topic_watchlist,{foreignKey:'topic_id', sourceKey: 'id'});
		topic.hasMany(models.comment,{foreignKey:'topic_id'});
		topic.belongsTo(models.user,{foreignKey: 'created_by', targetKey: 'user_id'});
	};
	
	return topic;
};
