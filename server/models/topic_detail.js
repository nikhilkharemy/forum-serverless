'use strict';
const topic = require('./topic');

module.exports = (sequelize, DataTypes) => {
	const topic_detail = sequelize.define('topic_detail', {
		topic_id: {
			type: DataTypes.INTEGER,
			references: {
				// This is a reference to another model
				model: topic,
				// This is the column name of the referenced model
				key: 'id',
			}
		},
		lang_id:DataTypes.INTEGER,
		title: DataTypes.TEXT,
		description: DataTypes.TEXT,
		created_date:DataTypes.DATE
	}, {
		timestamps: false,
		freezeTableName: true
	},
	{
		underscored: true
	});
	topic_detail.associate = function(models) {
	// associations can be defined here
		topic_detail.belongsTo(models.topic,{foreignKey:'topic_id'});
	};
	
  	return topic_detail;
};
