'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('comment', 'reply_count', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    }).then(() => {
        queryInterface.addConstraint('comment', ['created_by'], {
          type: 'foreign key',
          name: 'created_by_fkey',
          references: { //Required field
            table: 'user',
            field: 'user_id'
          },
          onDelete: 'cascade',
          onUpdate: 'cascade'
        }).then(() => {
          console.log('created')
        });
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('comment', 'reply_count')
    .then(() => {
      console.log('removed attribute');
    });
  }
};
