'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
       // logic for transforming into the new state
       return Promise.all([
        queryInterface.addColumn(
        'topic',
        'article_id',
       Sequelize.INTEGER
      ),
      queryInterface.addColumn(
        'topic',
        'like_count',
       Sequelize.INTEGER
      )
    ]);
  },

  down: (queryInterface, Sequelize) => {
    // logic for reverting the changes
    return Promise.all([
      queryInterface.removeColumn('topic', 'article_id'),
      queryInterface.removeColumn('topic', 'like_count')
    ]);
  }
};
