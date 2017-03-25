'use strict';
module.exports = (sequelize, DataTypes) => {
	const term = sequelize.define('term', {
		cat_slug: DataTypes.STRING,
		parent_id: DataTypes.INTEGER,
		status: DataTypes.INTEGER,
		topic_count: DataTypes.INTEGER,
		cat_type:DataTypes.STRING,
		created_by:DataTypes.STRING,
		created_date:DataTypes.DATE
	}, {
		timestamps: false,
		freezeTableName: true
	});
	term.associate = function(models) {
		term.hasMany(models.term_detail,{foreignKey:'cat_id', soureKey: 'id'});
		term.hasMany(models.topic_relationship,{foreignKey:'term_id'});
		term.hasMany(models.article_relationship,{foreignKey:'term_id'});
		term.hasMany(models.article,{foreignKey:'cat_id'});
	};
	
  	return term;
};