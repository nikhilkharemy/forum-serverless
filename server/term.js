'use strict';
module.exports = (sequelize, DataTypes) => {
	var Term = sequelize.define('term', {
		    cat_slug:Sequelize.STRING,
		    parent_id: Sequelize.INTEGER,
		    status: Sequelize.INTEGER,
		    topic_count: Sequelize.INTEGER,
		    cat_type:Sequelize.STRING,
		    created_by:Sequelize.STRING,
		    created_date:Sequelize.DATE
		},
		{
			timestamps: false,
			freezeTableName: true
		}
	);

	// User.associate = function(models) {
	// 	models.User.hasMany(models.Task);
	// };

	return Term;
};