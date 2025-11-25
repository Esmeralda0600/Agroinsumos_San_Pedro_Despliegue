// api/models/Venta.js
import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    id_producto: { type: String },
    nombre: { type: String },
    precio: { type: Number },
    cantidad: { type: Number },
    imagen: { type: String },
  },
  { _id: false }
);

const ventaSchema = new mongoose.Schema(
  {
    usuarioId: { type: String, required: false }, // lo guardamos tal como viene de localStorage
    items: [itemSchema],
    total: { type: Number },
    metodoPago: { type: String },
    mpStatus: { type: String },
    mpPaymentId: { type: String },
    mpPreferenceId: { type: String },
  },
  { timestamps: true }
);

const Venta = mongoose.model("Venta", ventaSchema);

export default Venta;
