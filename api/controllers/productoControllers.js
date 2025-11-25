import { ProductoMongo } from "../models/mongoModels.js";

export async function crearProducto(req, res) {
  try {
    const {
      id_producto,
      nombre_producto,
      precio,
      ingrediente_activo,
      marca,
      descripcion,
      cantidad,
      id_sucursal,
      direccion_img,
      categoria_producto
    } = req.body;

    // Opcional: validaciones básicas
    if (!id_producto || !nombre_producto || !precio || !id_sucursal ||
  !categoria_producto) {
      return res.status(400).json({
        mensaje: "Faltan datos obligatorios (id_producto, nombre_producto, precio, id_sucursal)"
      });
    }

    const nuevoProducto = await ProductoMongo.create({
      id_producto,
      nombre_producto,
      precio,
      ingrediente_activo,
      marca,
      descripcion,
      cantidad,
      id_sucursal,
      direccion_img,
      categoria_producto 
    });

    res.status(201).json({
      mensaje: "Producto creado correctamente",
      producto: nuevoProducto
    });
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({
      mensaje: "Error al crear producto",
      error: error.message
    });
  }
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
 *                       cantidad:
 *                         type: number
 *                       id_sucursal:
 *                         type: string
 *                       categoria:
 *                         type:string
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


// 🔍 Buscar producto por nombre o id_producto
export async function buscarProductoPorNombre(req, res) {
  try {
    const { nombre, id_producto } = req.query;

    console.log("[DEBUG buscarProductoPorNombre] query:", req.query);

    // 1) Si viene id_producto, buscamos directo por id_producto
    if (id_producto) {
      const productoPorId = await ProductoMongo.findOne({ id_producto });

      console.log("[DEBUG buscarProductoPorNombre] resultado por id_producto:", productoPorId);

      if (!productoPorId) {
        return res.status(404).json({ mensaje: "Producto no encontrado por id_producto" });
      }

      return res.json({
        mensaje: "Producto encontrado por id_producto",
        producto: productoPorId
      });
    }

    // 2) Si no hay nombre ni id_producto
    if (!nombre) {
      return res.status(400).json({ mensaje: "Falta el parámetro 'nombre' o 'id_producto'" });
    }

    // 3) Búsqueda por nombre_producto (contiene el texto, sin importar mayúsculas)
    const productoPorNombre = await ProductoMongo.findOne({
      nombre_producto: { $regex: nombre, $options: "i" }  // 'Faena', 'faena fuerte', etc.
    });

    console.log("[DEBUG buscarProductoPorNombre] resultado por nombre:", productoPorNombre);

    if (!productoPorNombre) {
      return res.status(404).json({ mensaje: "Producto no encontrado por nombre" });
    }

    res.json({
      mensaje: "Producto encontrado por nombre",
      producto: productoPorNombre
    });

  } catch (error) {
    console.error("Error al buscar producto:", error);
    res.status(500).json({
      mensaje: "Error al buscar producto",
      error: error.message
    });
  }
}



// Eliminar producto por id_producto (usado en baja)
export async function eliminarProducto(req, res) {
  try {
    const { id } = req.params; // id = id_producto

    if (!id) {
      return res.status(400).json({ mensaje: "Falta el parámetro 'id'" });
    }

    const eliminado = await ProductoMongo.findOneAndDelete({ id_producto: id });

    if (!eliminado) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    res.json({
      mensaje: "Producto eliminado correctamente",
      producto: eliminado
    });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({
      mensaje: "Error al eliminar producto",
      error: error.message
    });
  }
}


// Obtener un producto por id_producto (para la página de modificar)
export async function obtenerProductoPorId(req, res) {
  try {
    const { id } = req.params;

    const producto = await ProductoMongo.findOne({ id_producto: id });

    if (!producto) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    res.json({
      mensaje: "Producto encontrado",
      producto
    });
  } catch (error) {
    console.error("Error al obtener producto:", error);
    res.status(500).json({
      mensaje: "Error al obtener producto",
      error: error.message
    });
  }
}

// Actualizar cantidad y/o precio de un producto
export async function actualizarProducto(req, res) {
  try {
    const { id } = req.params;
    const { cantidad, precio } = req.body;

    const updateData = {};

    if (typeof cantidad === "number") {
      updateData.cantidad = cantidad;
    }
    if (typeof precio === "number") {
      updateData.precio = precio;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        mensaje: "No se proporcionaron datos válidos para actualizar"
      });
    }

    const productoActualizado = await ProductoMongo.findOneAndUpdate(
      { id_producto: id },
      updateData,
      { new: true }
    );

    if (!productoActualizado) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    res.json({
      mensaje: "Producto actualizado correctamente",
      producto: productoActualizado
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({
      mensaje: "Error al actualizar producto",
      error: error.message
    });
  }
}