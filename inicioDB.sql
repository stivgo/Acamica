DROP table Proyecto.pedidoxproducto;
DROP table Proyecto.pedido;
DROP table Proyecto.producto;
DROP table Proyecto.usuario;
DROP SCHEMA Proyecto;
CREATE SCHEMA Proyecto;

CREATE TABLE Proyecto.usuario (
    id_usuario INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    telefono INT UNSIGNED NOT NULL,
    direccion VARCHAR(200) NOT NULL,
    contrasena VARCHAR(200) NOT NULL,
    rol VARCHAR(20)  DEFAULT 'cliente',
    PRIMARY KEY (id_usuario),
    CONSTRAINT UC_Usuario UNIQUE (username,correo)
);
CREATE TABLE Proyecto.producto (
    id_producto INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    precio INT UNSIGNED NOT NULL,
    PRIMARY KEY (id_producto)
);
CREATE TABLE Proyecto.pedido (
    id_pedido INT NOT NULL AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    fecha DATETIME NOT NULL,
    estado VARCHAR(20) NOT NULL,
    formaPago VARCHAR(20) NOT NULL,
    total INT UNSIGNED NOT NULL,
    direccion VARCHAR(200) DEFAULT NULL,
    PRIMARY KEY (id_pedido),
    CONSTRAINT fk_usuario_ped FOREIGN KEY (id_pedido)
        REFERENCES usuario (id_usuario)
);
CREATE TABLE Proyecto.pedidoxproducto (
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT UNSIGNED NOT NULL,
    KEY fk_pedidox_1_idx (id_pedido),
    KEY fk_pedidox_2_idx (id_producto),
    CONSTRAINT fk_pedidox FOREIGN KEY (id_pedido)
        REFERENCES pedido (id_pedido),
    CONSTRAINT fk_productox FOREIGN KEY (id_producto)
        REFERENCES producto (id_producto)
);

INSERT Proyecto.usuario(username,nombre,apellido,correo,telefono,direccion,contrasena,rol) VALUES
('admin','admin','admin','admin@gmail.com',1234567,'Calle 1234','admin123','admin');
INSERT Proyecto.usuario(username,nombre,apellido,correo,telefono,direccion,contrasena) VALUES
('user1','user','apellido','correo1@gmail.com',1234567,'Calle 1234','12345678'),
('user2','user','apellido','correo2@gmail.com',1234567,'Calle 1234','12345678'),
('user3','user','apellido','correo3@gmail.com',1234567,'Calle 1234','12345678'),
('user4','user','apellido','correo4@gmail.com',1234567,'Calle 1234','12345678'),
('user5','user','apellido','correo5@gmail.com',1234567,'Calle 1234','12345678'),
('user6','user','apellido','correo5@gmail.com',1234567,'Calle 1234','12345678');


INSERT Proyecto.producto(nombre,precio) VALUES
('Papas',8000),
('Gaseosa',5000),
('Arepa',1000),
('Pan',2000),
('Chorizo',3000);