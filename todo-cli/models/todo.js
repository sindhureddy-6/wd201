// models/todo.js
'use strict';
const {
  Model,Op, where
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static async addTask(params) {
      return await Todo.create(params);
    }
    static async showList() {
      console.log("My Todo list \n");

      console.log("Overdue");
      // FILL IN HERE
      const overdueTasks = await Todo.findAll({
        where: {
          dueDate: { [Op.lt]: new Date() }
      
        },
      });
  overdueTasks.forEach(task => {
    console.log(task.displayableString());
  });
      console.log("\n");

      console.log("Due Today");
      // FILL IN HERE
      const TodaydueTasks = await Todo.findAll({
        where: {
          dueDate: { [Op.eq]: new Date() }
      
        },
      });
  TodaydueTasks.forEach(task => {
    console.log(task.displayableString());
  });
      console.log("\n");

      console.log("Due Later");
      // FILL IN HERE
      const LaterdueTasks = await Todo.findAll({
        where: {
          dueDate: { [Op.gt]: new Date() }
      
        },
      });
  LaterdueTasks.forEach(task => {
    console.log(task.displayableString());
  });
    }

    static async overdue() {
      // FILL IN HERE TO RETURN OVERDUE ITEMS
      return  await Todo.findAll({
        where: {
          dueDate: { [Op.lt]: new Date() }
        }
      });
      
    }

    static async dueToday() {
      // FILL IN HERE TO RETURN ITEMS DUE tODAY
       return await Todo.findAll({
        where: {
          dueDate: { [Op.eq]: new Date() }
        }
       });
      
    }

    static async dueLater() {
      // FILL IN HERE TO RETURN ITEMS DUE LATER
       return await Todo.findAll({
        where: {
          dueDate: { [Op.gt]: new Date() }
        }
      });
    }

    static async markAsComplete(id) {
      // FILL IN HERE TO MARK AN ITEM AS COMPLETE
      await Todo.update({ completed: true }, {
        where: {
          id: id
        }
      });

    }

    displayableString() {
      const today = new Date().toLocaleDateString();
  const dueDate = new Date(this.dueDate).toLocaleDateString();

  if (dueDate === today) {
    const checkbox = this.completed ? "[x]" : "[ ]";
    return `${this.id}. ${checkbox} ${this.title}`;
  }
   
      let checkbox = this.completed ? "[x]" : "[ ]";
      return `${this.id}. ${checkbox} ${this.title} ${this.dueDate}`;
    }
  }
  Todo.init({
    title: DataTypes.STRING,
    dueDate: DataTypes.DATEONLY,
    completed: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Todo',
  });
  return Todo;
};