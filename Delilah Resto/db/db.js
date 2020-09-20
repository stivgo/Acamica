const Sequelize = require('sequelize')

const nombreDB = 'Proyecto'
const usuarioDB = 'stiven'
const contrasenaDB = 'Proyecto#123'

//Conexión con la base de datos
const db = new Sequelize(nombreDB, usuarioDB, contrasenaDB, {
    dialect: 'mysql',
    host: 'localhost'
})

//Funcion generica para implementar todas las consultas SQL
const ejecutarConsulta = async(query, replacements, isSelectQuery) => {

    return await db.query(query, {
        type: (isSelectQuery ? db.QueryTypes.SELECT : undefined),
        replacements
    });
}

module.exports = {
    db,
    ejecutarConsulta
}