const db = require('../db/db')
const express = require("express");
const usuario = require('./usuarios')

const router = express.Router();




//Endpoints de la tabla Producto

//Creación de producto
router.post('/productos',usuario.midVerificarToken, usuario.verificarAdmin, async(req, res, next) => {
    console.log(req.body)
    const { nombre, precio } = req.body
    if (nombre && precio) {
        const query = `
                INSERT INTO producto (nombre,precio)
                VALUES(:nombre,:precio);
        `
        try {
            const data = db.ejecutarConsulta(query, { nombre, precio }, false)

            res.status(201).json({ data:data })
        } catch (error) {
            next(error)
        }
    } else {
        res.status(400).json({ error: 'Invalid body request' })
    }
})

//Leer producto por id
router.get('/productos/:id', async(req, res, next) => {
    const { id } = req.params

    const query = `
            SELECT * FROM producto
            WHERE id_producto=:id;
    `
    try {
        const data = await db.ejecutarConsulta(query, { id }, true)

        res.status(200).json({ data })
    } catch (error) {
        next(error)
    }

})

//Leer todos los productos
router.get('/productos', async(req, res, next) => {
    const query = 'SELECT * FROM producto'
    try {
        const data = await db.ejecutarConsulta(query, null, true)
        res.status(200).json({ data })
    } catch (error) {
        next(error)
    }
})

//Actualizar producto
router.put('/productos/:id', usuario.midVerificarToken, usuario.verificarAdmin,async(req, res, next) => {
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
        await db.ejecutarConsulta(query, { nombre, precio, id }, false)
        const nProducto = (await obtenerProductoID(id)[0])
        res.status(200).json({ data: nProducto })
    } catch (error) {
        next(error)
    }

})


//Eliminar producto
router.delete('/productos/:id', usuario.midVerificarToken, usuario.verificarAdmin, async(req, res, next) => {
    const id = parseInt(req.params.id)

    const query = 'DELETE FROM producto WHERE id_producto = :id'

    try {
        await db.ejecutarConsulta(query, { id }, false)

        res.status(204).json({data:'Se ha eliminado el producto'})

    } catch (error) {
        next(error)
    }
})




//Se obtiene la información de un producto a traves de su id
const obtenerProductoID = async(id) => {
    const query = `
            SELECT * FROM producto
            WHERE id_producto=:id;
    `
    let producto
    try {
        producto = await db.ejecutarConsulta(query, { id }, true)
    } catch (error) {
        console.log(error)
    }
    return producto
}

module.exports = {
    router,
    obtenerProductoID
}