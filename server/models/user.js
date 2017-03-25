'use strict';
const config = require(__dirname + '/../config/config.json');
module.exports = (sequelize, DataTypes) => {
	const user = sequelize.define('user', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true 
		},
		user_id: {
			type: DataTypes.STRING,
			unique: true
		},
		user_name:DataTypes.STRING,
		display_name: DataTypes.INTEGER,
		display_pic: DataTypes.INTEGER,
		email_id: DataTypes.INTEGER,
		contact_no: DataTypes.INTEGER,
		status: DataTypes.INTEGER,
		created_date:DataTypes.DATE,
		user_type: DataTypes.INTEGER,
		default_lang_id: DataTypes.INTEGER,
		preffered_lang_id: DataTypes.INTEGER,
		login_status: DataTypes.INTEGER,
		login_attempts: DataTypes.INTEGER,
		last_login: DataTypes.DATE,
		last_logout: DataTypes.DATE
	}, {
		timestamps: false,
		freezeTableName: true
	});
	user.associate = function(models) {
		user.hasMany(models.comment,{foreignKey:config.comment.created_by, sourceKey: 'user_id'});
		user.hasMany(models.comment_activity,{foreignKey:'comment_act_by', sourceKey: 'user_id'});
		user.hasMany(models.topic_views,{foreignKey:'userId', sourceKey: 'user_id'});
		user.hasMany(models.topic_watchlist,{foreignKey:'user_id', sourceKey: 'user_id'});
		user.hasMany(models.topic,{foreignKey:'created_by', sourceKey: 'user_id'});
		user.hasMany(models.topics,{foreignKey:'created_by', sourceKey: 'user_id'});
		user.hasMany(models.topics,{foreignKey:'modified_by', sourceKey: 'user_id'});
		user.hasMany(models.article,{foreignKey:'created_by', sourceKey: 'user_id'});
		// user.hasMany(models.article,{foreignKey:'modified_by', sourceKey: 'user_id'});
	};
	
  	return user;
};