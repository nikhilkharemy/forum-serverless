'use strict';
module.exports = (sequelize, DataTypes) => {
	const countries = sequelize.define('countries', {
	    shortName: DataTypes.STRING,
	    name: DataTypes.STRING,
	    phoneCode: DataTypes.INTEGER
  	}, {});
  	countries.associate = function(models) {
    // associations can be defined here
  	};
  	return countries;
};