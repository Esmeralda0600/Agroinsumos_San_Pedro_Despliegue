import Favorito from "../models/favoritoModel.js";
import { ProductoMongo } from "../models/mongoModels.js";

// ===============================
// LISTAR FAVORITOS
// ===============================
export const listarFavoritos = async (req, res) => {
    const { usuarioId } = req.params;

    try {
        const favoritos = await Favorito.find({ usuario: usuarioId });
        res.json({ favoritos });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ===============================
// AGREGAR FAVORITO (por id_producto)
// ===============================
export const agregarFavorito = async (req, res) => {
    const { usuarioId, productoId } = req.body;

    try {
        // Buscar el producto usando id_producto
        const producto = await ProductoMongo.findOne({ id_producto: productoId });

        if (!producto) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        const existe = await Favorito.findOne({
            usuario: usuarioId,
            nombre: producto.nombre_producto
        });

        if (existe) {
            return res.status(400).json({ error: "El producto ya está en favoritos" });
        }

        const nuevoFavorito = await Favorito.create({
            usuario: usuarioId,
            nombre: producto.nombre_producto,
            precio: producto.precio,
            imagen: producto.direccion_img
        });

        res.status(201).json({ ok: true, favorito: nuevoFavorito });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ===============================
// ELIMINAR FAVORITO
// ===============================
export const eliminarFavorito = async (req, res) => {
    const { favoritoId } = req.params;

    try {
        const eliminado = await Favorito.findByIdAndDelete(favoritoId);

        if (!eliminado) {
            return res.status(404).json({ error: "Favorito no encontrado" });
        }

        res.json({ mensaje: "Favorito eliminado correctamente" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
