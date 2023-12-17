"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //association-->relationships
      // define association here
      Todo.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }
    static addTodo({ title, dueDate, userId }) {
      return this.create({
        title: title,
        dueDate: dueDate,
        completed: false,
        userId,
      });
    }
    static getTodos(userId) {
      return this.findAll({
        where: {
          userId,
        },
      });
    }
    setCompletionStatus(userId, id) {
      return this.update(
        { completed: true },
        {
          where: {
            userId,
            id,
            completed: false,
          },
        },
      ).then((updatedTodo) => {
        if (updatedTodo[0] === 0) {
          // No rows were updated, meaning the todo was not found or was already completed
          return this.update(
            { completed: false },
            {
              where: {
                userId,
                id,
                completed: true,
              },
            },
          );
        }
        return updatedTodo; // Return the result of the first update
      });
    }
  }
  Todo.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Todo should not be empty",
          },
        },
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        validate: {
          isDate: {
            msg: "Due date must be a valid date.",
          },
        },
      },
      completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Todo",
    },
  );
  return Todo;
};
