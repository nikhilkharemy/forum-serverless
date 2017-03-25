'use strict';
module.exports = (sequelize, DataTypes) => {
  const cities = sequelize.define('cities', {
    name: DataTypes.STRING,
    stateId: DataTypes.INTEGER
  }, {});
  cities.associate = function(models) {
    // associations can be defined here
  };
  return cities;
};