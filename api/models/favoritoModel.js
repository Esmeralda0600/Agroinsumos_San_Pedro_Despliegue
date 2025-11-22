import mongoose from "mongoose";

const favoritoSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    imagen: { type: String, required: true },
    creadoEn: { type: Date, default: Date.now }
});

const Favorito = mongoose.model("Favorito", favoritoSchema);
export default Favorito;
