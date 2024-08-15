const { Sequelize } = require("sequelize")

const db = new Sequelize({
    username: `postgres`,
    host: `localhost`,
    dialect: `postgres`,
    database: `Collections`,
    password: `eros1234`,
    port: 5432,
    schema: `public`
})

module.exports = db 
