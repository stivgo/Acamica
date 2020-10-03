const db = require("../db/db");
const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();
const SECRET_KEY = "^D%U^XuLWeI3w%6ujyLY5";

//Funciones y Middlewares

//Funcion generar un token
const generarToken = (usuario) => {
  let token = jwt.sign(
    {
      id: usuario.id_usuario,
      username: usuario.username,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      rol: usuario.rol,
    },
    SECRET_KEY
  );
  return token;
};
//Funcion verificar Token
const verificarToken = (token) => {
  try {
    const data = jwt.verify(token, SECRET_KEY);
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

//middleware de verificacion de token
const midVerificarToken = (req, res, next) => {
  const { authorization } = req.headers;
  const token = authorization && authorization.split(" ")[1];
  const usuario = verificarToken(token);

  if (usuario) {
    req.usuario = usuario;
    next();
  } else {
    res.status(401).json({ mensaje: "token invalido" });
    return;
  }
};

//Middleware para verificar rol y dar permisos
const verificarUsuario = (req, res, next) => {
  console.log(req.params);
  const { id } = req.params;
  console.log(req.usuario);
  const idUsuario = req.usuario.id;
  const { rol } = req.usuario;

  if (id == idUsuario || rol === "admin") {
    next();
  } else {
    res
      .status(401)
      .json({ error: "No tiene derechos para hacer el requesito" });
  }
};

//Middleware para verificar rol y dar permisos
const verificarAdmin = (req, res, next) => {
  const { rol } = req.usuario;

  if (rol === "admin") {
    next();
  } else {
    res
      .status(401)
      .json({ error: "No tiene derechos para hacer el requesito" });
  }
};

//Endpoints de Usuario

//Creación de usario
router.post("/registrarse", async (req, res, next) => {
  console.log(req.body);

  const emailRegex = /^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i;
  const {
    username,
    nombre,
    apellido,
    correo,
    telefono,
    direccion,
    contrasena,
  } = req.body;
  if (
    username &&
    nombre &&
    apellido &&
    correo &&
    telefono &&
    direccion &&
    contrasena
  ) {
    if (emailRegex.test(correo)) {
      console.log("correo valido");
      const usernameExiste = (await validarUserName(username))[0];
      const correoExiste = (await validarCorreo(correo))[0];
      if (usernameExiste) {
        res
          .status(409)
          .json({ mensaje: "Existe un usuario con el mismo username" });
      } else if (correoExiste) {
        res
          .status(409)
          .json({ mensaje: "Existe un usuario con el mismo correo" });
      } else {
        const query = `
                INSERT INTO usuario (username,nombre,apellido,correo,telefono,direccion,contrasena)
                VALUES(:username,:nombre,:apellido,:correo,:telefono,:direccion,:contrasena);
                `;
        try {
          const data = await db.ejecutarConsulta(
            query,
            {
              username,
              nombre,
              apellido,
              correo,
              telefono,
              direccion,
              contrasena,
            },
            false
          );
          res.status(201).json({ id: data[0] });
        } catch (error) {
          next(error);
        }
      }
    } else {
      res.status(400).json({ error: "El correo ingresado no es valido" });
      console.log("invalido");
    }
  } else {
    res.status(400).json({ error: "Error en el body request" });
  }
});

//Obtener usuarios
router.get("/usuarios",midVerificarToken,verificarAdmin,async (req, res, next) => {
    const query = "SELECT * FROM usuario";
    try {
      const data = await db.ejecutarConsulta(query, null, true);
      res.status(200).json({ data: data });
    } catch (error) {
      next(error);
    }
  }
);

//Obtener usuarios por ID
router.get("/usuarios/:id",midVerificarToken,verificarUsuario, async (req, res, next) => {
    const { id } = req.params;

    const query = `
            SELECT * FROM usuario
            WHERE id_usuario=:id;
    `;
    try {
      const data = await db.ejecutarConsulta(query, { id }, true);

      res.status(200).json({ data: data });
    } catch (error) {
      next(error);
    }
  }
);

//actualizar usuario por id
router.put("/usuarios/:id",midVerificarToken,verificarUsuario, async (req, res, next) => {
    const id = parseInt(req.params.id);
    let {
      username,
      nombre,
      apellido,
      correo,
      telefono,
      direccion,
      contrasena,
    } = req.body;
    telefono = parseInt(telefono);
    const usuario = (await obtenerUsuarioID(id))[0];
    if (!usuario) {
      res
        .status(404)
        .json({ error: "No existe el producto con el id ingresado" });
      return;
    }
    console.log(usuario);
    username = username || usuario.username;
    nombre = nombre || usuario.nombre;
    apellido = apellido || usuario.apellido;
    correo = correo || usuario.correo;
    telefono = telefono || usuario.telefono;
    direccion = direccion || usuario.direccion;
    contrasena = contrasena || usuario.contrasena;

    const query = `
            UPDATE usuario
            SET  username = :username, nombre=:nombre, apellido=:apellido, correo=:correo, telefono=:telefono, direccion=:direccion, contrasena=:contrasena
            WHERE id_usuario = :id;
    `;
    try {
      await db.ejecutarConsulta(
        query,
        {
          username,
          nombre,
          apellido,
          correo,
          telefono,
          direccion,
          contrasena,
          id,
        },
        false
      );
      const nUsuario = await obtenerUsuarioID(id);
      res.status(200).json({ data: nUsuario });
    } catch (error) {
      next(error);
    }
  }
);

//Eliminar usuario por ID
router.delete("/usuarios/:id",midVerificarToken,verificarUsuario, async (req, res, next) => {
    const id = parseInt(req.params.id);

    const query = "DELETE FROM usuario WHERE id_usuario = :id";

    try {
      await db.ejecutarConsulta(query, { id }, false);

      res.status(204).send("Se ha eliminado el usuario");
    } catch (error) {
      next(error);
    }
  }
);

//Funcion para verificar la existencia de un username
const validarUserName = async (username) => {
  const query = `
            SELECT * FROM usuario
            WHERE username=:username;
    `;
  let usuario;
  try {
    usuario = await db.ejecutarConsulta(query, { username }, true);
  } catch (error) {
    console.log(error);
  }
  return usuario;
};

//Funcion para verificar la existencia de un correo
const validarCorreo = async (correo) => {
  const query = `
            SELECT * FROM usuario
            WHERE correo=:correo;
    `;
  let usuario;
  try {
    usuario = await db.ejecutarConsulta(query, { correo }, true);
  } catch (error) {
    console.log(error);
  }
  return usuario;
};

//Se obtiene la información de un usuario a traves de su id
const obtenerUsuarioID = async (id) => {
  const query = `
            SELECT * FROM usuario
            WHERE id_usuario=:id;
    `;
  let usuario;
  try {
    usuario = await db.ejecutarConsulta(query, { id }, true);
  } catch (error) {
    console.log(error);
  }
  return usuario;
};

//Se obtiene la información de un usuario a traves de su correo
const obtenerUsuarioCorreo = async (correo) => {
  const query = `
            SELECT * FROM usuario
            WHERE correo=:correo;
    `;
  let usuario;
  try {
    usuario = await db.ejecutarConsulta(query, { correo }, true);
  } catch (error) {
    console.log(error);
  }
  return usuario;
};

//Login del usuario
router.post("/login", async (req, res, next) => {
  const { correo, contrasena } = req.body;

  let estado = false;
  const usuario = await obtenerUsuarioCorreo(correo);

  if (!usuario[0]) {
    res.status(401).json({ mensaje: "correo o contraseña incorrecta" });
    return;
  }

  if (usuario[0].contrasena === contrasena) {
    estado = true;
  }

  if (estado) {
    const token = generarToken(usuario[0]);
    res.status(200).json({ token });
  } else {
    res.status(401).json({ mensaje: "correo o contraseña incorrecta" });
  }
});

module.exports = {
  router,
  midVerificarToken,
  verificarUsuario,
  verificarAdmin,
};
