import mongoose from "mongoose";

const usuariosSchema = new mongoose.Schema({
    nombre_usuario: {
        type: String,
        required: [true, "El nombre de usuario es obligatorio"],
        unique: true, // garantiza que no se repita en la colección
        trim: true    // elimina espacios al inicio y final
    },
    correo : {
        type: String,
        required: [true, "El correo es obligatorio"],
        unique: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "El formato del correo no es válido"]
    },
    contraseña: String,
});

export const UsuarioMongo = mongoose.model("usuario", usuariosSchema, "usuarios");
//Crea un modelo llamado usuario basado en un esquema (usuariosSchema) y que estará vinculado a una colección específica llamada (usuarios).

const adminsSchema = new mongoose.Schema({
    nombre_admin: {
        type: String,
        required: [true, "El nombre de administrador es obligatorio"],
        unique: true, // garantiza que no se repita en la colección
        trim: true    // elimina espacios al inicio y final
    },
    correo_admin : {
        type: String,
        required: [true, "El correo es obligatorio"],
        unique: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "El formato del correo no es válido"]
    },
    contraseña_admin: String,
});

export const AdminMongo = mongoose.model("admin", adminsSchema, "admins");

const productosSchema = new mongoose.Schema({
id_producto: {
        type: String,
        required: [true, "El id del producto es obligatorio"],
        unique: true,
        trim: true
    },
    nombre_producto: {
        type: String,
        required: [true, "El nombre del producto es obligatorio"],
        trim: true
    },
    precio: {
        type: Number,
        required: [true, "El precio es obligatorio"],
        min: [0, "El precio no puede ser negativo"]
    },
    ingrediente_activo: {
        type: String,
        required: [true, "El ingrediente activo es obligatorio"],
        trim: true
    },
    marca: {
        type: String,
        required: [true, "La marca es obligatoria"],
        trim: true
    },
    descripcion: {
        type: String,
        default: "",
        trim: true
    },
    cantidad:{
        type: Number,
        required: [true, "La cantidad es obligatoria"],
        min: [0, "La cantidad no puede ser negativa"]
    },
    id_sucursal: {
        type: String,
        required: [true, "El id de sucursal es obligatorio"],
        trim: true
    },
    direccion_img:{
        type: String,
        trim: true,
        default: "default.png"
    },
    categoria_producto:{
        type: String,
        required: [true, "La categoria del producto es obligatoria y en mayusculas"],
        trim: true
    }
});

export const ProductoMongo = mongoose.model("producto", productosSchema, "productos");


const extrasSchema = new mongoose.Schema({
    id_extra: {
        type: String,
        required: [true, "El id del extra es obligatorio"],
        unique: true,
        trim: true
    },
    nombre: {
        type: String,
        required: [true, "El nombre del extra es obligatorio"],
        trim: true
    },
    precio: {
        type: Number,
        required: [true, "El precio del extra es obligatorio"],
        min: [0, "El precio no puede ser negativo"]
    }
});

export const ExtraMongo = mongoose.model("extra", extrasSchema, "extras");

const sucursalesSchema = new mongoose.Schema({
    id_sucursal: {
        type: String,
        required: [true, "El id de la sucursal es obligatorio"],
        unique: true,
        trim: true
    },
    nombre_sucursal: {
        type: String,
        required: [true, "El nombre de la sucursal es obligatorio"],
        trim: true
    },
    direccion: {
        type: String,
        required: [true, "La dirección es obligatoria"],
        trim: true
    }
});

export const SucursalMongo = mongoose.model("sucursal", sucursalesSchema, "sucursales");

const proveedoresSchema = new mongoose.Schema({
    id_proveedor: {
        type: String,
        required: [true, "El id del proveedor es obligatorio"],
        unique: true,
        trim: true
    },
    nombre_proveedor: {
        type: String,
        required: [true, "El nombre del proveedor es obligatorio"],
        trim: true
    },
    telefono: {
        type: String,
        required: [true, "El teléfono es obligatorio"],
        match: [/^[0-9]{10}$/, "El teléfono debe tener 10 dígitos"]
    }
});

export const ProveedorMongo = mongoose.model("proveedor", proveedoresSchema, "proveedores");

const categoriasSchema = new mongoose.Schema({ 
    nombre_categoria: {
        type: String,
        required: [true, "El nombre de la categoria es obligatorio"],
        trim: true
    },
    direccion_img: {
        type: String,
        trim: true
    }
});

export const CategoriaMongo = mongoose.model("categoria", categoriasSchema, "categorias");

const marcasSchema = new mongoose.Schema({
    id_marcas: {
        type: String,
        required: [true, "El id de la marca es obligatorio"],
        unique: true,
        trim: true
    },
    nombre_marca: {
        type: String,
        required: [true, "El nombre de la marca es obligatorio"],
        trim: true
    },
    direccion_img: {
        type: String,
        trim: true
    }
});

export const MarcaMongo = mongoose.model("marca", marcasSchema, "marcas");

const ingredientesSchema = new mongoose.Schema({
    id_ingrediente: {
        type: String,
        required: [true, "El id de la ingrediente es obligatorio"],
        unique: true,
        trim: true
    },
    nombre_ingrediente: {
        type: String,
        required: [true, "El nombre de la ingrediente es obligatorio"],
        trim: true
    },
    direccion_img: {
        type: String,
        trim: true
    }
});

export const IngredienteMongo = mongoose.model("ingrediente", ingredientesSchema, "ingredientes");