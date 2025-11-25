import { AdminMongo,ProductoMongo } from "../models/mongoModels.js";
// import { ProductoMongo} from "../models/mongoModels.js";

/**
 * @openapi
 * /administradores:
 *   get:
 *     summary: Obtiene administrador desde la base de datos
 *     tags: [Administradores]
  *     responses:
 *       200:
 *         description: Lista de administrador desde MongoDB.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mongo:
 *                   type: array
 *                   items:
 *                     type: object 
 */

export async function listarAdmins(req, res) {
  const mongoData = await AdminMongo.find();
  res.json({mongo: mongoData });
}


/**
 * @openapi
 * /administradores:
 *   post:
 *     summary: Crea una nuevo Administrador en la bases de datos
 *     tags: [Administradores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre_admin, correo_admin, contraseña_admin]
 *             properties:
 *               nombre_admin:
 *                 type: string
 *               correo_admin:
 *                 type: string
 *                 format: email
 *               contraseña_admin:
 *                 type: string
 *     responses:
 *       200:
 *         description: Administrador agregado exitosamente
 */

export async function crearAdmin(req, res) {
  const { nombre_admin, correo_admin, contraseña_admin } = req.body;
  await AdminMongo.create({ nombre_admin, correo_admin, contraseña_admin});
  res.json({ mensaje: "Administrador agregado en la bases de datos" });
}

/**
 * @openapi
 * /administradores/inventario:
 *   get:
 *     summary: Obtiene el inventario de productos desde la base de datos
 *     tags: [Inventario]
 *     responses:
 *       200:
 *         description: Lista de productos en inventario.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Inventario obtenido correctamente
 *                 inventario:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_producto:
 *                         type: string
 *                       nombre_producto:
 *                         type: string
 *                       precio:
 *                         type: number
 *                       ingrediente_activo:
 *                         type: string
 *                       marca:
 *                         type: string
 *                       descripcion:
 *                         type: string
 *                       id_sucursal:
 *                         type: string
 */
export async function mostrarInventario(req, res) {
  try {
    const productos = await ProductoMongo.find();
    res.json({
      mensaje: "Inventario obtenido correctamente",
      inventario: productos
    });
  } catch (error) {
    console.error("Error al obtener el inventario:", error);
    res.status(500).json({
      mensaje: "Error al obtener el inventario",
      error: error.message
    });
  }
}
