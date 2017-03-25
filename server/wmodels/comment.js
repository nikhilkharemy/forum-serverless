'use strict';
var Models = require("../models");
const config = require(__dirname + '/../config/config.json');

module.exports = (sequelize, DataTypes) => {
	const comment = sequelize.define('comment', {
		comment_text: DataTypes.STRING,
                comment_type: DataTypes.INTEGER,
                parent_id: DataTypes.INTEGER,
                topic_id:  {
                  type: DataTypes.INTEGER,
                  references: {
                      model: Models.article,
                      key: 'id',
                  }
                },
                is_reported: DataTypes.INTEGER,
                like_count: DataTypes.INTEGER,
                dislike_count: DataTypes.INTEGER,
                reported_count: DataTypes.INTEGER,
                moderated_by: DataTypes.INTEGER,
                moderated_date: DataTypes.DATE,
                status: DataTypes.INTEGER, 
                created_date: DataTypes.DATE,
                created_by: {
                    type: DataTypes.STRING,
                    references: {
                        model: Models.user,
                        key: 'user_id',
                    }
                },
                reply_count: DataTypes.INTEGER
	}, {
		timestamps: false,
		freezeTableName: true
	});
	comment.associate = function(models) {
       comment.belongsTo(models.user,{foreignKey: config.comment.created_by, targetKey: 'user_id'});
       comment.belongsTo(models.topic,{foreignKey: 'topic_id', targetKey: 'id'});
       comment.belongsTo(models.article,{foreignKey: 'topic_id', targetKey: 'id'});
       comment.hasMany(models.comment_activity,{foreignKey:'comment_id', sourceKey: 'id'});
	};
	
  	return comment;
};