const { DataTypes } = require('sequelize')
const db = require('../../db')

let emp = db.define('emp', {
 
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
 
},
  {
    tableName: 'emp',
    freezeTableName: true,
    timestamps: false,
  });
  emp.removeAttribute('id');
console.log('emp')
module.exports = emp
