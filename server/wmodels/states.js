'use strict';
module.exports = (sequelize, DataTypes) => {
  const states = sequelize.define('states', {
    name: DataTypes.STRING,
    countryId: DataTypes.INTEGER
  }, {});
  states.associate = function(models) {
    // associations can be defined here
  };
  return states;
};