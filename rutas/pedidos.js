const db = require("../db/db");
const producto = require("./productos");
const express = require("express");
const usuario = require("./usuarios");

const router = express.Router();

//Endpoints de la tabla Pedido

//Creación de pedido
router.post("/pedidos", usuario.midVerificarToken, async (req, res, next) => {
  console.log(req.body);
  let usuarioP = req.usuario;
  let id_usuario = usuarioP.id;
  let fecha = new Date();
  let estado = "recibido";
  let total = 0;
  let data;

  const { formaPago, direccion, id_productos, cantidades } = req.body;

  if (formaPago && direccion && id_productos && cantidades) {
    if (id_productos.length === cantidades.length) {
      for (let i = 0; i < id_productos.length; i++) {
        let buscar = (await producto.obtenerProductoID(id_productos[i]))[0];
        if (buscar) {
          console.log(buscar);
        } else {
          res
            .status(404)
            .json({
              error: "No existe el producto con el id " + id_productos[i],
            });
          return;
        }
      }

      const query = `
            INSERT INTO pedido (id_usuario,fecha,estado,formaPago,total,direccion)
            VALUES(:id_usuario,:fecha,:estado,:formaPago,:total,:direccion);
            `;
      try {
        data = await db.ejecutarConsulta(
          query,
          { id_usuario, fecha, estado, formaPago, total, direccion },
          false
        );
      } catch (error) {
        next(error);
      }
      data = data[0];
      console.log(data, "data1");

      for (let i = 0; i < id_productos.length; i++) {
        let id_producto = id_productos[i];
        let cantidad = cantidades[i];
        let query2 = `
                INSERT INTO pedidoxproducto (id_pedido,id_producto,cantidad)
                VALUES(:data,:id_producto,:cantidad);
                `;
        try {
          await db.ejecutarConsulta(
            query2,
            { data, id_producto, cantidad },
            false
          );
        } catch (error) {
          next(error);
        }
      }

      let totalCalculado = 0;
      console.log("Data", data);
      const queryTotal = `
                        SELECT sum(pp.cantidad*p.precio) AS suma
                        FROM pedidoxproducto as pp
                        JOIN producto as p
                        ON pp.id_producto=p.id_producto
                        WHERE pp.id_pedido = :data;
            `;
      try {
        totalCalculado = await db.ejecutarConsulta(queryTotal, { data }, true);
        console.log(totalCalculado[0].suma);
        totalCalculado = totalCalculado[0].suma;
      } catch (error) {
        next(error);
      }

      const queryActualizar = `
            UPDATE pedido
            SET  total = :totalCalculado
            WHERE id_pedido = :data
            `;
      try {
        await db.ejecutarConsulta(
          queryActualizar,
          { totalCalculado, data },
          false
        );
      } catch (error) {
        next(error);
      }

      res.status(201).json({ data: data });
    } else {
      res
        .status(400)
        .json({
          error: "No corresponde las cantidades con el numero de productos",
        });
    }
  } else {
    res.status(400).json({ error: "Error en el body request" });
  }
});

//Leer todos los pedidos
router.get("/pedidos", usuario.midVerificarToken, async (req, res, next) => {
  let usuarioP = req.usuario;
  console.log(usuarioP);

  let data;
  if (usuarioP.rol === "admin") {
    const query = `
                SELECT p.estado, p.fecha, p.id_pedido, p.formaPago, p.total ,u.username, p.direccion
                FROM pedido as p
                JOIN usuario as u
                ON p.id_usuario=u.id_usuario;
                `;
    try {
      data = await db.ejecutarConsulta(query, null, true);
    } catch (error) {
      next(error);
    }
  } else {
    let id_usuario = usuarioP.id;
    const query = `
                SELECT p.estado, p.fecha, p.id_pedido, p.formaPago, p.total ,u.username, p.direccion
                FROM pedido as p
                JOIN usuario as u
                ON p.id_usuario=u.id_usuario
                WHERE p.id_usuario = :id_usuario;
                `;

    try {
      data = await db.ejecutarConsulta(query, { id_usuario }, true);

      //res.status(200).json({ data })
    } catch (error) {
      next(error);
    }
  }

  console.log(data.length);
  for (let i = 0; i < data.length; i++) {
    let id = data[i].id_pedido;
    const queryDescripcion = `
                SELECT pr.nombre, pp.cantidad
                FROM Proyecto.pedido as p
                JOIN Proyecto.pedidoxproducto as pp
                ON p.id_pedido = pp.id_pedido
                JOIN Proyecto.producto as pr
                ON pp.id_producto = pr.id_producto
                WHERE p.id_pedido = :id;
                `;
    try {
      let descripcion = await db.ejecutarConsulta(
        queryDescripcion,
        { id },
        true
      );
      console.log(descripcion);
      data[i].descripcion = descripcion;
    } catch (error) {
      next(error);
    }
  }

  res.status(200).json(data);
});

//actualizar pedido
router.put("/pedidos/:id",usuario.midVerificarToken,usuario.verificarAdmin, async (req, res, next) => {
    const id = parseInt(req.params.id);
    let { estado } = req.body;
    const pedido = (await obtenerPedidoID(id))[0];
    if (!pedido) {
      res
        .status(404)
        .json({ error: "No existe el pedido con el id ingresado" });
      return;
    }
    console.log(pedido);
    const query = `
            UPDATE pedido
            SET  estado = :estado
            WHERE id_pedido = :id
    `;
    try {
      await db.ejecutarConsulta(query, { estado, id }, false);
      const nPedido = await obtenerPedidoID(id)[0];
      res.status(200).json(nPedido);
    } catch (error) {
      next(error);
    }
  }
);

//Eliminar Pedido
router.delete("/pedidos/:id",usuario.midVerificarToken,usuario.verificarAdmin,async (req, res, next) => {
    const id = parseInt(req.params.id);

    const query1 = "DELETE FROM pedidoxproducto WHERE id_pedido = :id;";
    const query2 = "DELETE FROM pedido WHERE id_pedido = :id;"

    try {
      await db.ejecutarConsulta(query1, { id }, false);
    } catch (error) {
      next(error);
    }
    try{
      await db.ejecutarConsulta(query2, { id }, false);
      res.status(204).send("Se ha eliminado el pedido");

    } catch(error){
      next(error)
    }
  }
);

//Se obtiene la información de un producto a traves de su id
const obtenerPedidoID = async (id) => {
  const query = `
            SELECT * FROM pedido
            WHERE id_pedido=:id;
    `;
  let pedido;
  try {
    pedido = await db.ejecutarConsulta(query, { id }, true);
  } catch (error) {
    console.log(error);
  }
  return pedido;
};

module.exports = router;
