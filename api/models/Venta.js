import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
  //id_producto: { type: mongoose.Schema.Types.ObjectId, ref: "Producto", required: false },
  id_producto: { type: String, required: false },
  nombre: String,
  precio: Number,
  cantidad: Number,
});


const VentaSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UsuarioMongo",
      required: false,
    },

    //  Snapshot de los datos del cliente al momento de la compra
    nombreCliente: { type: String },
    correoCliente: { type: String },

    items: [ItemSchema],
    total: { type: Number, required: true },
    metodoPago: { type: String, default: "no_especificado" },

    // Datos de Mercado Pago
    mpStatus: String,
    mpPaymentId: String,
    mpPreferenceId: String,
  },
  {
    timestamps: true,
  }
);


const Venta = mongoose.model("Venta", VentaSchema ,"ventas");
export default Venta;
