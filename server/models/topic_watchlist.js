'use strict';
var Models = require("../models");
module.exports = (sequelize, DataTypes) => {
	const topic_watchlist = sequelize.define('topic_watchlist', {
		topic_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Models.topic,
                key: 'id',
            } 
        },
		status: DataTypes.INTEGER,
		user_id: {
            type: DataTypes.STRING,
            references: {
                model: Models.user,
                key: 'user_id',
            }
        },
		created_date:DataTypes.DATE,
		act_type:DataTypes.INTEGER,
	}, {
		timestamps: false,
		freezeTableName: true
	});
	topic_watchlist.associate = function(models) {
		topic_watchlist.belongsTo(models.user,{foreignKey: 'user_id', targetKey: 'user_id'});
    	// topic_watchlist.belongsTo(models.topic,{foreignKey: 'topic_id', targetKey: 'id', as: 'topic_followed'});
    	topic_watchlist.belongsTo(models.article,{foreignKey: 'topic_id', targetKey: 'id', as: 'topic_followed'});
	};
	
  	return topic_watchlist;
};