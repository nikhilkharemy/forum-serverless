'use strict';
var Models = require("../models");

module.exports = (sequelize, DataTypes) => {
  	const topic_details = sequelize.define('topic_details', {
	    topic_id: {
			type: DataTypes.INTEGER,
            references: {
                model: Models.topics,
                key: 'id',
            }
		},
	    meta_details: DataTypes.TEXT
	}, {
		timestamps: false,
		freezeTableName: true
	},
	{
		underscored: true
	});
	topic_details.associate = function(models) {
		topic_details.belongsTo(models.topics,{foreignKey:'topic_id'});
	};
  return topic_details;
};