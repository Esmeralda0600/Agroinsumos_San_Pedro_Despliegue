import {
  UsuarioMongo,
  CategoriaMongo,
  MarcaMongo,
  IngredienteMongo,
  ProductoMongo
} from "../models/mongoModels.js";

import bcrypt from "bcryptjs";

// ============================================================
// LISTAR USUARIOS
// ============================================================
export async function listarUsuarios(req, res) {
  try {
    const mongoData = await UsuarioMongo.find();
    res.json({ mongo: mongoData });
  } catch (err) {
    res.status(500).json({ error: "Error al listar usuarios" });
  }
}

// ============================================================
// REGISTRAR USUARIO
// ============================================================
export async function crearUsuario(req, res) {
  try {
    const { nombre_usuario, correo, password } = req.body;

    if (!nombre_usuario || !correo || !password) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    if (nombre_usuario.length < 3 || nombre_usuario.length > 10) {
      return res.status(400).json({
        error: "El nombre usuario debe tener entre 3 y 10 caracteres"
      });
    }

    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
    if (!correoValido) return res.status(400).json({ error: "Correo inválido" });

    const existe = await UsuarioMongo.findOne({ correo });
    if (existe) return res.status(400).json({ error: "El correo ya existe" });

    const hash = await bcrypt.hash(password, 10);

    const usuario = await UsuarioMongo.create({
      nombre_usuario,
      correo,
      contraseña: hash,
    });

    res.status(201).json({
      mensaje: "Usuario creado correctamente",
      id: usuario._id
    });

  } catch (err) {
    res.status(500).json({ error: "Error al registrar usuario" });
  }
}

// ============================================================
// LOGIN
// ============================================================
export async function login_Usuario(req, res) {
  try {
    const { correo, password } = req.body;

    const user = await UsuarioMongo.findOne({ correo });
    if (!user) return res.status(400).json({ error: "Usuario no encontrado" });

    const passOK = await bcrypt.compare(password, user.contraseña);
    if (!passOK) return res.status(400).json({ error: "Contraseña incorrecta" });

    res.json({
      mensaje: "Login exitoso",
      usuario: {
        _id: user._id,
        nombre_usuario: user.nombre_usuario,
        correo: user.correo
      }
    });

  } catch (error) {
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
}

// ============================================================
// CATEGORÍAS
// ============================================================
export async function mostrar_categorias(req, res) {
  try {
    const data = await CategoriaMongo.find();

    // FRONTEND requiere { nombre, img }
    const respuesta = data.map(c => ({
      nombre: c.nombre_categoria,
      img: c.direccion_img
    }));

    res.json(respuesta);

  } catch {
    res.status(500).json({ error: "Error al obtener categorías" });
  }
}

// ============================================================
// MARCAS
// ============================================================
export async function mostrar_marcas(req, res) {
  try {
    const data = await MarcaMongo.find();

    const respuesta = data.map(m => ({
      nombre: m.nombre_marca,
      img: m.direccion_img
    }));

    res.json(respuesta);

  } catch {
    res.status(500).json({ error: "Error al obtener marcas" });
  }
}

// ============================================================
// INGREDIENTES
// ============================================================
export async function mostrar_ingredientes(req, res) {
  try {
    const data = await IngredienteMongo.find();

    const respuesta = data.map(i => ({
      nombre: i.nombre_ingrediente,
      img: i.direccion_img
    }));

    res.json(respuesta);

  } catch {
    res.status(500).json({ error: "Error al obtener ingredientes" });
  }
}

// ============================================================
// PRODUCTOS POR CATEGORÍA
// ============================================================
expor
