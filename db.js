const { Sequelize } = require('sequelize');
require('dotenv').config()

const db = new Sequelize('excelTask', 'root', 'root', {
  host: 'localhost',
  dialect: "mysql"
}
)

db.sync({}).then(() => {
  console.log('data is migrated');
})


module.exports = db


