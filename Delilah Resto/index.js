//Dependencias del proyecto
const express = require('express')
const Sequelize = require('sequelize')
const jwt = require('jsonwebtoken')


//Conexión con la base de datos
const sequelize = new Sequelize('mysql://stiven:matemania@localhost:3306/Proyecto')
servidor = express()
servidor.use(express.json())

//Endpoints de la tabla Producto

//Creación de producto
servidor.post('/productos', async(req, res, next) => {
    console.log(req.body)
    const { nombre, precio } = req.body
    if (nombre && precio) {
        const query = `
                INSERT INTO producto (nombre,precio)
                VALUES(:nombre,:precio);
        `
        try {
            const data = ejecutarConsulta(query, { nombre, precio }, false)

            res.status(201).json({ data })
        } catch (error) {
            next(error)
        }
    } else {
        res.status(400).json({ error: 'Invalid body request' })
    }
})

//Leer producto por id
servidor.get('/productos/:id', async(req, res, next) => {
    const { id } = req.params

    const query = `
            SELECT * FROM producto
            WHERE id_producto=:id;
    `
    try {
        const data = await ejecutarConsulta(query, { id }, true)

        res.status(200).json({ data })
    } catch (error) {
        next(error)
    }

})

//Leer todos los productos
servidor.get('/productos', async(req, res, next) => {
    const query = 'SELECT * FROM producto'
    try {
        const data = await ejecutarConsulta(query, null, true)
        res.status(200).json({ data })
    } catch (error) {
        next(error)
    }
})

//Actualizar producto
servidor.put('/productos/:id', async(req, res, next) => {
    const id = parseInt(req.params.id)
    let { nombre, precio } = req.body
    precio = parseInt(precio)
    const producto = (await obtenerProductoID(id))[0]
    if (!producto) {
        res.status(404).json({ error: 'No existe el producto con el id ingresado' })
        return
    }
    console.log(producto)
    nombre = nombre || producto.nombre
    precio = precio || producto.precio

    const query = `
            UPDATE producto
            SET  nombre = :nombre, precio=:precio
            WHERE id_producto = :id
    `
    try {
        await ejecutarConsulta(query, { nombre, precio, id }, false)
        const nProducto = await obtenerProductoID(id)
        res.status(200).json({ data: nProducto })
    } catch (error) {
        next(error)
    }

})


//Eliminar producto
servidor.delete('/productos/:id', async(req, res, next) => {
    const id = parseInt(req.params.id)

    const query = 'DELETE FROM producto WHERE id_producto = :id'

    try {
        const data = await ejecutarConsulta(query, { id }, false)

        res.status(204).send('Se ha eliminado el producto')

    } catch (error) {
        next(error)
    }
})


//Funcion generrica para implementar todas las consultas SQL
const ejecutarConsulta = async(query, replacements, isSelectQuery) => {

    return await sequelize.query(query, {
        type: (isSelectQuery ? sequelize.QueryTypes.SELECT : undefined),
        replacements
    });
}

//Se obtiene la información de un producto a traves de su id
const obtenerProductoID = async(id) => {
    const query = `
            SELECT * FROM producto
            WHERE id_producto=:id;
    `
    let producto
    try {
        producto = await ejecutarConsulta(query, { id }, true)
    } catch (error) {
        console.log(error)
    }
    return producto
}


servidor.post('/login', (req, res) => {
    const { usuario, contrasena } = req.body

})

servidor.post('/registrarse', (req, res) => {

})



//Inicialización servidor
servidor.listen(3000, () => {
    sequelize.authenticate().then(() => {
        console.log('Conectado')
    }).catch((error) => console.log(error.message))

    console.log('Servidor escuchando puerto 3000')
})