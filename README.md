# Acamica - Proyecto Delilah Resto
Tercer Proyecto del programa Desarrollador Web Full Stack de Acamica, se presenta el backend de una aplicación de pedidos con CRUD de usuarios y productos.

## Instalacion
Lo primero es clonar el repositorio al lugar de trabajo, luego de esto dirigirnos a la carpeta Delilah Resto (./Delilah Resto)
```
https://github.com/stivgo/Delilah-Resto.git
```
## Configurar la Base de datos
Instalar MySql si este no se encuentra presente, se recomienda el programa MySQL Workbench. Allí configurar el usuario y constraseña. Ya con esto ejecutar el archivo _inicioDB.sql_. Aquí se crean las tablas correspondientes y unos insert de prueba.
Luego de la creación de tablas nos dirigimos al archivo _db.js_ (./db/db.js) y configuramos el nombre,usuario y contraseña de la base datos.

```
const nombreDB = "";
const usuarioDB = "";
const contrasenaDB = "";
```
Ya generadas las tablas y el insert se tiene varios usuarios clientes y un administrador. Con el administrador podemos hacer CRUD de productos y actualizar los pedidos, la información concreta se encuentra en el archivo _inicioDB.sql_.

## Instalar depencias e iniciar el proyecto
Luego de haber hecho la configuración anterior instalamos las dependencias del proyecto con `npm`
```
npm i
npm start
```

## Por Ultimo
Puede utilizar el archivo de la collección de Postman _Delilah_Postman_collection.json_ para realizar las pruebas correspiendestes a cada uno de los endpoints de esta API, si desea saber más información de la API se encuntra el archivo _Delilah-1.0.0.yaml_.
