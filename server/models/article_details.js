'use strict';
var Models = require("../models");
module.exports = (sequelize, DataTypes) => {
  const article_details = sequelize.define('article_details', {
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
  	article_details.associate = function(models) {
		article_details.belongsTo(models.article,{foreignKey:'topic_id'});
  	};
  	return article_details;
};