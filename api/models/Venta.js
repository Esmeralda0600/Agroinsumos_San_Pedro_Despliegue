import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
  id_producto: { type: mongoose.Schema.Types.ObjectId, ref: "Producto", required: false },
  nombre: String,
  precio: Number,
  cantidad: Number,
});

const VentaSchema = new mongoose.Schema(
  {
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "UsuarioMongo", required: false },
    items: [ItemSchema],
    total: { type: Number, required: true },
    metodoPago: { type: String, default: "no_especificado" },

    // Datos de Mercado Pago
    mpStatus: String,
    mpPaymentId: String,
    mpPreferenceId: String,
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

const Venta = mongoose.model("Venta", VentaSchema);
export default Venta;
