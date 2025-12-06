

// api/controllers/adminController.js
import { AdminMongo, ProductoMongo } from "../models/mongoModels.js";

/**
 * GET /administradores
 * Lista todos los administradores
 */
export async function listarAdmins(req, res) {
  try {
    const mongoData = await AdminMongo.find();
    res.json({ mongo: mongoData });
  } catch (err) {
    console.error("Error al listar admins:", err);
    res.status(500).json({ message: "Error al listar administradores" });
  }
}

/**
 * POST /administradores
 * Crea un nuevo admin (guardando la contraseña tal cual)
 * Body: { nombre_admin, correo_admin, contraseña_admin }
 */
export async function crearAdmin(req, res) {
  try {
    const { nombre_admin, correo_admin, contraseña_admin } = req.body;

    if (!nombre_admin || !correo_admin || !contraseña_admin) {
      return res.status(400).json({
        message: "Faltan datos: nombre_admin, correo_admin o contraseña_admin",
      });
    }

    await AdminMongo.create({
      nombre_admin,
      correo_admin,
      contraseña_admin, 
    });

    res.json({ mensaje: "Administrador agregado en la base de datos" });
  } catch (err) {
    console.error("Error al crear admin:", err);
    res.status(500).json({ message: "Error al crear administrador" });
  }
}

/**
 * POST /administradores/login
 * Login del admin: compara usuario + contraseña DIRECTO contra Mongo
 * Body: { nombre_admin, contraseña_admin }
 */
export async function loginAdmin(req, res) {
  try {
    const { nombre_admin, contraseña_admin } = req.body;

    if (!nombre_admin || !contraseña_admin) {
      return res
        .status(400)
        .json({ message: "Faltan nombre_admin o contraseña_admin" });
    }

    // Buscamos un admin que tenga EXACTAMENTE ese usuario y esa contraseña
    const admin = await AdminMongo.findOne({
      nombre_admin,
      contraseña_admin,
    });

    if (!admin) {
      return res
        .status(401)
        .json({ message: "Usuario o contraseña incorrectos" });
    }

    // Login correcto
    return res.json({
      ok: true,
      adminId: admin._id,
      nombre_admin: admin.nombre_admin,
      correo_admin: admin.correo_admin,
    });
  } catch (err) {
    console.error("Error en loginAdmin:", err);
    res.status(500).json({ message: "Error en el servidor" });
  }
}

/**
 * GET /administradores/inventario
 * 
 */
export async function mostrarInventario(req, res) {
  try {
    const productos = await ProductoMongo.find();
    res.json({
      mensaje: "Inventario obtenido correctamente",
      inventario: productos,
    });
  } catch (error) {
    console.error("Error al obtener el inventario:", error);
    res.status(500).json({
      mensaje: "Error al obtener el inventario",
      error: error.message,
    });
  }
}
