'use strict';
module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('topic', 'image', {
      type: Sequelize.TEXT
    }).then(() => {
      queryInterface.addColumn('topic', 'comment_count', {
        type: Sequelize.INTEGER,
      }).then(() => {
          console.log('migrated');
      })
    })
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('topic', 'image')
    .then(() => {
      queryInterface.removeColumn('topic', 'comment_count')
      .then(() => {
          console.log('deleted column image and comment_count');
      })
    })
  }
};
