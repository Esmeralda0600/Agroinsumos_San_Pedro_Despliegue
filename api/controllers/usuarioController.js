import { UsuarioMongo , CategoriaMongo, MarcaMongo, IngredienteMongo, ProductoMongo} from "../models/mongoModels.js";
import bcrypt from "bcryptjs";

// ========================
// LISTAR USUARIOS
// ========================
export async function listarUsuarios(req, res) {
  try {
    const mongoData = await UsuarioMongo.find();
    res.json({ mongo: mongoData });
  } catch (err) {
    res.status(500).json({ error: "Error al listar usuarios" });
  }
}

// ========================
// REGISTRAR USUARIO
// ========================
export async function crearUsuario(req, res) {
  try {
    console.log("BODY RECIBIDO:", req.body);

    const { nombre_usuario, correo, password } = req.body;

    if (!nombre_usuario || !correo || !password) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // Validación longitud usuario
    if (nombre_usuario.length > 10) {
      return res.status(400).json({ error: "El nombre de usuario no puede tener más de 10 caracteres" });
    }

    if (nombre_usuario.length < 3) {
      return res.status(400).json({ error: "El nombre de usuario debe tener al menos 3 caracteres" });
    }

    // Validar formato correo
    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
    if (!correoValido) {
      return res.status(400).json({ error: "Formato de correo inválido" });
    }

    // Verificar si el correo ya existe
    const existe = await UsuarioMongo.findOne({ correo });
    if (existe) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    // Encriptar contraseña
    const hash = await bcrypt.hash(password, 10);

    const usuario = await UsuarioMongo.create({
      nombre_usuario,
      correo,
      contraseña: hash
    });

    res.status(201).json({
      mensaje: "Usuario creado correctamente",
      id: usuario._id
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Usuario existente",
      detalle: err.message
    });
  }
}

// ========================
// LOGIN
// ========================
export async function login_Usuario(req, res) {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const user = await UsuarioMongo.findOne({ correo });
    if (!user) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    const passwordCorrecta = await bcrypt.compare(password, user.contraseña);

    if (!passwordCorrecta) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    res.json({
      mensaje: "Login exitoso",
      usuario: {
        _id: user._id,
        nombre: user.nombre_usuario,
        correo: user.correo
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error interno" });
  }
}

export async function mostrar_categorias(req, res) {
  const mongoData = await CategoriaMongo.find();
  res.json(mongoData);
};

export async function mostrar_marcas(req, res) {
  const mongoData = await MarcaMongo.find();
  res.json(mongoData );
};

export async function mostrar_ingredientes(req, res) {
  const mongoData = await IngredienteMongo.find();
  res.json(mongoData);
};


export async function mostrar_productos(req,res) {
  const { categoria } = req.body;
  console.log(categoria);
  const encontrada = await CategoriaMongo.findOne({ nombre:categoria });
    if (!encontrada) {
      return res.status(400).json({ error: "Categoria no encontrado" });
    }
  const mongoData = await ProductoMongo.find({ categoria_producto: categoria});
  res.json(mongoData);
}