'use strict';
module.exports = (sequelize, DataTypes) => {
	const commentactivity = sequelize.define('comment_activity', {
		comment_id: DataTypes.INTEGER, 
                comment_act_type:  DataTypes.INTEGER,
                comment_act_by: DataTypes.STRING,
                comment_act_date: DataTypes.DATE,
                report_reason: {
                	type: DataTypes.STRING,
                	defaultValue: null
                },
                status: DataTypes.INTEGER, 
                created_date: DataTypes.DATE 
	}, {
		timestamps: false,
		freezeTableName: true
	});
	commentactivity.associate = function(models) {
	// associations can be defined here
		commentactivity.belongsTo(models.comment,{foreignKey: 'comment_id', targetKey: 'id'});
		commentactivity.belongsTo(models.user,{foreignKey: 'comment_act_by', targetKey: 'user_id'});
	};
	
  	return commentactivity;
};