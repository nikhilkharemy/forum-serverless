'use strict';
var Models = require("../models");
module.exports = (sequelize, DataTypes) => {
  	const article_relationship = sequelize.define('article_relationship', {
   		topic_id: DataTypes.INTEGER,
	    term_id:  {
			type: DataTypes.INTEGER,
	        references: {
	            model: Models.term,
	            key: 'id',
			}
	    },
	    level: {
	      type: DataTypes.INTEGER,
	      defaultValue: 0
	    },
  	}, {
	    timestamps: false,
	    freezeTableName: true
	},
	{
		underscored: true
	});
  	article_relationship.associate = function(models) {
   		article_relationship.belongsTo(models.term,{foreignKey: 'term_id'});
   		article_relationship.belongsTo(models.article,{foreignKey: 'topic_id'});
  	};
  	return article_relationship;
};