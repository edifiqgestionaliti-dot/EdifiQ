
DROP DATABASE IF EXISTS edifiq;
CREATE DATABASE edifiq;
USE edifiq;

-- CATALOGOS

CREATE TABLE tipo_documento(
    id_tipo_documento INT AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    abreviatura VARCHAR(10) NOT NULL,
    PRIMARY KEY(id_tipo_documento)
);

INSERT INTO tipo_documento(nombre,abreviatura)
VALUES
('Cédula de Ciudadanía','CC'),
('Tarjeta de Identidad','TI'),
('Cédula de Extranjería','CE'),
('Pasaporte','PA'),
('NIT','NIT');

-- -----------------------------------------------------

CREATE TABLE tipo_residente(
    id_tipo_residente INT AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    PRIMARY KEY(id_tipo_residente)
);

INSERT INTO tipo_residente(nombre)
VALUES
('Propietario'),
('Arrendatario'),
('Familiar');

-- -----------------------------------------------------

CREATE TABLE tipo_visita(
    id_tipo_visita INT AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    PRIMARY KEY(id_tipo_visita)
);

INSERT INTO tipo_visita(nombre)
VALUES
('Visitante'),
('Familiar'),
('Domiciliario'),
('Proveedor'),
('Técnico');

-- -----------------------------------------------------

CREATE TABLE tipo_servicio(
    id_tipo_servicio INT AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    PRIMARY KEY(id_tipo_servicio)
);

INSERT INTO tipo_servicio(nombre)
VALUES
('Administración'),
('Agua'),
('Luz'),
('Gas'),
('Internet');

-- -----------------------------------------------------

CREATE TABLE estado_usuario(
    id_estado_usuario INT AUTO_INCREMENT,
    nombre VARCHAR(30) NOT NULL,
    PRIMARY KEY(id_estado_usuario)
);

INSERT INTO estado_usuario(nombre)
VALUES
('Activo'),
('Inactivo');

-- -----------------------------------------------------

CREATE TABLE estado_visita(
    id_estado_visita INT AUTO_INCREMENT,
    nombre VARCHAR(30) NOT NULL,
    PRIMARY KEY(id_estado_visita)
);

INSERT INTO estado_visita(nombre)
VALUES
('Pendiente'),
('Ingresó'),
('Finalizada'),
('Cancelada');

-- -----------------------------------------------------

CREATE TABLE estado_paquete(
    id_estado_paquete INT AUTO_INCREMENT,
    nombre VARCHAR(30) NOT NULL,
    PRIMARY KEY(id_estado_paquete)
);

INSERT INTO estado_paquete(nombre)
VALUES
('Recibido'),
('Entregado');

-- -----------------------------------------------------

CREATE TABLE estado_recibo(
    id_estado_recibo INT AUTO_INCREMENT,
    nombre VARCHAR(30) NOT NULL,
    PRIMARY KEY(id_estado_recibo)
);

INSERT INTO estado_recibo(nombre)
VALUES
('Pendiente'),
('Pagado'),
('Pendiente por revisar');

-- -----------------------------------------------------

CREATE TABLE estado_reserva(
    id_estado_reserva INT AUTO_INCREMENT,
    nombre VARCHAR(30) NOT NULL,
    PRIMARY KEY(id_estado_reserva)
);

INSERT INTO estado_reserva(nombre)
VALUES
('Pendiente'),
('Aprobada'),
('Cancelada');

-- -----------------------------------------------------

CREATE TABLE rol(
    id_rol INT AUTO_INCREMENT,
    nombre VARCHAR(30) NOT NULL,
    PRIMARY KEY(id_rol)
);

INSERT INTO rol(nombre)
VALUES
('Administrador'),
('Vigilante'),
('Residente');

-- -----------------------------------------------------

CREATE TABLE permiso(
    id_permiso INT AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    PRIMARY KEY(id_permiso)
);

CREATE TABLE rol_permiso(
    id_rol INT NOT NULL,
    id_permiso INT NOT NULL,

    PRIMARY KEY(id_rol,id_permiso),

    FOREIGN KEY(id_rol)
    REFERENCES rol(id_rol),

    FOREIGN KEY(id_permiso)
    REFERENCES permiso(id_permiso)
);

-- =====================================================
-- TORRES
-- =====================================================

CREATE TABLE torre(
    id_torre INT AUTO_INCREMENT,
    nombre_torre VARCHAR(20) NOT NULL,

    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY(id_torre)
);

-- APARTAMENTOS

CREATE TABLE apartamento(
    id_apartamento INT AUTO_INCREMENT,

    numero_apartamento VARCHAR(10) NOT NULL,
    piso INT NOT NULL,

    activo BOOLEAN DEFAULT TRUE,

    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    id_torre INT NOT NULL,

    PRIMARY KEY(id_apartamento),

    FOREIGN KEY(id_torre)
    REFERENCES torre(id_torre)
);

-- PERSONAS

CREATE TABLE persona(
    id_persona INT AUTO_INCREMENT,

    id_tipo_documento INT NOT NULL,

    numero_documento VARCHAR(20) NOT NULL,

    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,

    telefono VARCHAR(20),
    correo VARCHAR(100),

    activo BOOLEAN DEFAULT TRUE,

    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY(id_persona),

    UNIQUE(id_tipo_documento,numero_documento),

    FOREIGN KEY(id_tipo_documento)
    REFERENCES tipo_documento(id_tipo_documento)
);

-- APARTAMENTO PERSONA

CREATE TABLE apartamento_persona(
    id_apartamento INT NOT NULL,
    id_persona INT NOT NULL,

    id_tipo_residente INT NOT NULL,

    fecha_ingreso DATE NOT NULL,
    fecha_salida DATE,

    PRIMARY KEY(id_apartamento,id_persona),

    FOREIGN KEY(id_apartamento)
    REFERENCES apartamento(id_apartamento),

    FOREIGN KEY(id_persona)
    REFERENCES persona(id_persona),

    FOREIGN KEY(id_tipo_residente)
    REFERENCES tipo_residente(id_tipo_residente)
);

-- USUARIOS

CREATE TABLE usuario(
    id_usuario INT AUTO_INCREMENT,

    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,

    id_estado_usuario INT NOT NULL DEFAULT 1,

    id_persona INT NOT NULL,
    id_rol INT NOT NULL,

    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY(id_usuario),

    UNIQUE(username),

    FOREIGN KEY(id_persona)
    REFERENCES persona(id_persona),

    FOREIGN KEY(id_rol)
    REFERENCES rol(id_rol),

    FOREIGN KEY(id_estado_usuario)
    REFERENCES estado_usuario(id_estado_usuario)
);

-- VISITAS

CREATE TABLE visita(
    id_visita INT AUTO_INCREMENT,

    id_tipo_visita INT NOT NULL,
    id_tipo_documento INT NOT NULL,

    nombre_visitante VARCHAR(100) NOT NULL,
    documento_visitante VARCHAR(30) NOT NULL,

    motivo_visita VARCHAR(150),

    fecha_ingreso DATETIME NOT NULL,
    fecha_salida DATETIME,

    id_estado_visita INT NOT NULL DEFAULT 1,

    id_apartamento INT NOT NULL,

    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY(id_visita),

    FOREIGN KEY(id_tipo_visita)
    REFERENCES tipo_visita(id_tipo_visita),

    FOREIGN KEY(id_tipo_documento)
    REFERENCES tipo_documento(id_tipo_documento),

    FOREIGN KEY(id_estado_visita)
    REFERENCES estado_visita(id_estado_visita),

    FOREIGN KEY(id_apartamento)
    REFERENCES apartamento(id_apartamento)
);

-- PAQUETES

CREATE TABLE paquete(
    id_paquete INT AUTO_INCREMENT,

    descripcion VARCHAR(200) NOT NULL,
    remitente VARCHAR(100) NOT NULL,

    fecha_recepcion DATETIME NOT NULL,
    fecha_entrega DATETIME,

    id_estado_paquete INT NOT NULL DEFAULT 1,

    id_apartamento INT NOT NULL,

    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY(id_paquete),

    FOREIGN KEY(id_estado_paquete)
    REFERENCES estado_paquete(id_estado_paquete),

    FOREIGN KEY(id_apartamento)
    REFERENCES apartamento(id_apartamento)
);

-- RECIBOS

CREATE TABLE recibo(
    id_recibo INT AUTO_INCREMENT,

    id_tipo_servicio INT NOT NULL,

    periodo VARCHAR(20) NOT NULL,

    valor DECIMAL(12,2) NOT NULL,

    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,

    id_estado_recibo INT NOT NULL DEFAULT 1,

    id_apartamento INT NOT NULL,

    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY(id_recibo),

    FOREIGN KEY(id_tipo_servicio)
    REFERENCES tipo_servicio(id_tipo_servicio),

    FOREIGN KEY(id_estado_recibo)
    REFERENCES estado_recibo(id_estado_recibo),

    FOREIGN KEY(id_apartamento)
    REFERENCES apartamento(id_apartamento)
);

-- ZONAS COMUNES

CREATE TABLE zona_comun(
    id_zona INT AUTO_INCREMENT,

    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(200) NOT NULL,

    PRIMARY KEY(id_zona)
);

-- RESERVAS

CREATE TABLE reserva_zona(
    id_reserva INT AUTO_INCREMENT,

    fecha_reserva DATE NOT NULL,

    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,

    cantidad_invitados INT,

    id_estado_reserva INT NOT NULL DEFAULT 1,

    id_zona INT NOT NULL,
    id_apartamento INT NOT NULL,

    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY(id_reserva),

    FOREIGN KEY(id_estado_reserva)
    REFERENCES estado_reserva(id_estado_reserva),

    FOREIGN KEY(id_zona)
    REFERENCES zona_comun(id_zona),

    FOREIGN KEY(id_apartamento)
    REFERENCES apartamento(id_apartamento)
);

-- NOTIFICACIONES

CREATE TABLE notificacion(
    id_notificacion INT AUTO_INCREMENT,

    titulo VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,

    leida BOOLEAN DEFAULT FALSE,

    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,

    id_usuario INT NOT NULL,

    PRIMARY KEY(id_notificacion),

    FOREIGN KEY(id_usuario)
    REFERENCES usuario(id_usuario)
);

-- HISTORIAL

CREATE TABLE historial(
    id_historial INT AUTO_INCREMENT,

    accion VARCHAR(50) NOT NULL,

    tabla_afectada VARCHAR(50) NOT NULL,

    id_registro INT NOT NULL,

    valor_anterior LONGTEXT,
    valor_nuevo LONGTEXT,

    descripcion TEXT,

    ip_usuario VARCHAR(50),

    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,

    id_usuario INT NOT NULL,

    PRIMARY KEY(id_historial),

    FOREIGN KEY(id_usuario)
    REFERENCES usuario(id_usuario)
);



INSERT INTO persona
(
    id_tipo_documento,
    numero_documento,
    nombres,
    apellidos,
    telefono,
    correo,
    activo
)
VALUES
(
    1,
    '123456789',
    'Administrador',
    'Sistema',
    '3000000000',
    'admin@edifiq.com',
    1
);

INSERT INTO usuario
(
    username,
    password,
    id_persona,
    id_rol,
    id_estado_usuario
)
VALUES
(
    'admin',
    12345678,
    1,
    1,
    1
);

-- DATOS INICIALES DEL CONJUNTO
INSERT INTO torre(nombre_torre) VALUES
('Torre A'), ('Torre B');

INSERT INTO apartamento(numero_apartamento,piso,activo,id_torre) VALUES
('101',1,TRUE,1),
('102',1,TRUE,1),
('201',2,TRUE,1),
('301',3,TRUE,2);

INSERT INTO zona_comun(nombre,descripcion) VALUES
('Salón social','Espacio para reuniones y eventos de residentes'),
('Piscina','Zona recreativa de uso común'),
('Gimnasio','Espacio para actividad física'),
('BBQ','Zona de asados y reuniones');


select * from rol;



select *from persona;

select *from usuario;