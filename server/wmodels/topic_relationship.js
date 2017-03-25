'use strict';
var Models = require("../models");

module.exports = (sequelize, DataTypes) => {
  const topic_relationship = sequelize.define('topic_relationship', {
    topic_id: DataTypes.INTEGER,
    term_id:  {
		type: DataTypes.INTEGER,
        references: {
            model: Models.term,
            key: 'id',
		}
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
  }, {});
  topic_relationship.associate = function(models) {
   	topic_relationship.belongsTo(models.term,{foreignKey: 'term_id'});
  };
  return topic_relationship;
};