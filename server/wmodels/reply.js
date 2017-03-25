'use strict';
module.exports = (sequelize, DataTypes) => {
	const reply = sequelize.define('reply', {
		comment_text: DataTypes.STRING,
                comment_type: DataTypes.INTEGER,
                parent_id: DataTypes.INTEGER,
                topic_id:  DataTypes.INTEGER,
                is_reported: DataTypes.INTEGER,
                like_count: DataTypes.INTEGER,
                dislike_count: DataTypes.INTEGER,
                reported_count: DataTypes.INTEGER,
                moderated_by: DataTypes.STRING,
                moderated_date: DataTypes.DATE,
                status: DataTypes.INTEGER, 
                created_date: DataTypes.DATE,
                created_by: DataTypes.STRING
	}, {
		timestamps: false,
		freezeTableName: true
	});
	reply.associate = function(models) {
	// associations can be defined here
	};
	
  	return reply;
};
