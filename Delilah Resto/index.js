//Dependencias del proyecto
const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("./db/db");
const productos = require("./rutas/productos");
const usuarios = require("./rutas/usuarios");
const pedidos = require("./rutas/pedidos");

//Conexión con la base de datos
const sequelize = db.db;
const servidor = express();
servidor.use(express.json());
servidor.use(productos.router);
servidor.use(usuarios.router);
servidor.use(pedidos);

//Middleware sobre error general
servidor.use((err, req, res, next) => {
  if (err) {
    console.log(err);
    res.status(500).json({ error: "Internal error" });
  } else {
    next();
  }
});

//Inicialización servidor
servidor.listen(3000, () => {
  console.log("Servidor escuchando puerto 3000");
  sequelize
    .authenticate()
    .then(() => {
      console.log("Conectado a la base de datos");
    })
    .catch((error) => console.log(error.message));
});
