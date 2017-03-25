'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('article', 'source', {
      type: Sequelize.STRING,
      defaultValue: '0'
    }).then(() => {
      console.log('migrated')
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('article', 'source')
    .then(() => {
      console.log('deleted column source');
    })
  }
};
