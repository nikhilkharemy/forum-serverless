'use strict';
const term = require('./term');

module.exports = (sequelize, DataTypes) => {
	const term_detail = sequelize.define('term_detail', {
		name: DataTypes.STRING,
		cat_id:{
			type: DataTypes.INTEGER,
			references: {
				// This is a reference to another model
				model: term,
				// This is the column name of the referenced model
				key: 'id',
		    }
		},
		description: DataTypes.TEXT,
		lang_id: DataTypes.INTEGER,
		status: DataTypes.INTEGER,
		created_by:DataTypes.STRING,
		created_date:DataTypes.DATE
	}, {
		timestamps: false,
		freezeTableName: true
	});
	term_detail.associate = function(models) {
		term_detail.belongsTo(models.term,{foreignKey:'cat_id', targetKey: 'id'});
	};
	return term_detail;
};