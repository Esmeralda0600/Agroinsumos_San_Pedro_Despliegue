// api/controllers/pagoController.js
import { MercadoPagoConfig, Preference } from "mercadopago";
import Venta from "../models/Venta.js";
import { UsuarioMongo } from "../models/mongoModels.js";

// Detectar si el token es de PRUEBA (TEST-) o PRODUCCIÓN (APP_USR-)
const isSandbox = String(process.env.MP_ACCESS_TOKEN || "").startsWith("TEST-");

// Cliente de Mercado Pago usando el token del .env
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN, // TEST-... o APP_USR-...
});

// Instancia para manejar preferencias
const preference = new Preference(client);

const FRONT_URL_USER =
  process.env.FRONT_URL_USER ||
  "https://agroinsumos-san-pedro-despliegue-ebon.vercel.app";

/**
 * Crea una preferencia de pago en Mercado Pago
 * Espera en req.body:
 * {
 *   items: [
 *     { id_producto, nombre, precio, cantidad }
 *   ],
 *   email: "correo@cliente.com" (opcional),
 *   metodoPago: "oxxo" | "bbva" | etc (opcional)
 * }
 */
export const crearPreferencia = async (req, res) => {
  try {
    const { items, email, metodoPago } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No hay productos para pagar" });
    }

    // Armamos los items en el formato que pide Mercado Pago
    const mpItems = items.map((item, index) => ({
      id: String(item.id_producto || index + 1),
      title: item.nombre || "Producto",
      quantity: Number(item.cantidad) || 1,
      unit_price: Number(item.precio) || 0,
      currency_id: "MXN",
    }));

    const body = {
      items: mpItems,
      payer: {
        // correo del COMPRADOR (cliente)
        email: email || "cliente_sin_correo@example.com",
      },
      metadata: {
        metodoPagoSeleccionado: metodoPago || "no_especificado",
        ambiente: isSandbox ? "sandbox" : "production",
      },
      back_urls: {
        // Siempre regresamos a la página de confirmación del FRONT
        success: `${FRONT_URL_USER}/confirmacion.html`,
        failure: `${FRONT_URL_USER}/confirmacion.html`,
        pending: `${FRONT_URL_USER}/confirmacion.html`,
      },
      // en producción es útil para que regrese solo al success
      auto_return: "approved",
    };

    const result = await preference.create({ body });

    // En el SDK nuevo los datos vienen directo en result
    return res.status(200).json({
      id: result.id,
      init_point: result.init_point,               // URL de producción
      sandbox_init_point: result.sandbox_init_point, // URL sandbox si el token es TEST
      env: isSandbox ? "sandbox" : "production",   // para que el front sepa qué usar
    });
  } catch (error) {
    console.error("Error creando preferencia de Mercado Pago:", error);
    return res.status(500).json({
      message: "Error al crear pago con Mercado Pago",
      error: error.message,
    });
  }
};

/**
 * Confirmar pago y registrar venta en BD
 * Espera en req.body:
 * {
 *   usuarioId,
 *   items,
 *   total,
 *   metodoPago,
 *   mpStatus,
 *   mpPaymentId,
 *   mpPreferenceId
 * }
 */
export const confirmarPago = async (req, res) => {
  try {
     console.log(" [confirmarPago] Body recibido:", req.body);
    const {
      usuarioId,
      nombreCliente: nombreDesdeFront,
      correoCliente: correoDesdeFront,
      items,
      total,
      metodoPago,
      mpStatus,
      mpPaymentId,
      mpPreferenceId,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log(" [confirmarPago] No hay items en la venta");
      return res.status(400).json({ message: "No hay items en la venta" });
    }

    if (!mpStatus) {
      console.log("❌ [confirmarPago] Falta mpStatus");
      return res.status(400).json({ message: "Falta estado del pago (mpStatus)" });
    }

    // Solo guardamos si el pago está aprobado
    if (mpStatus.toLowerCase() !== "approved") {
      console.log("❌ [confirmarPago] Pago no aprobado:", mpStatus);
      return res.status(400).json({
        message: "El pago no está aprobado, no se registrará la venta",
      });
    }

    //  Buscar nombre y correo del usuario (si viene usuarioId)
    let nombreCliente = nombreDesdeFront || null;
    let correoCliente = correoDesdeFront || null;

    if (usuarioId && (!nombreCliente || !correoCliente)) {
      try {
        const usuario = await UsuarioMongo.findById(usuarioId).lean();
         if (usuario) {
          // Ajusta nombres de campos según tu modelo real:
          if (!nombreCliente) {
            nombreCliente = usuario.nombre_usuario || usuario.nombre || null;
          }
          if (!correoCliente) {
            correoCliente = usuario.correo || usuario.email || null;
          }
        } else {
          console.log("⚠️ [confirmarPago] Usuario no encontrado para usuarioId:", usuarioId);
        }
      } catch (e) {
        console.error("Error buscando usuario para la venta:", e);
      }
    }

    // Crear la venta con toda la info
    const venta = new Venta({
      usuarioId: usuarioId || null,
      nombreCliente,
      correoCliente,
      items,
      total: Number(total) || 0,
      metodoPago: metodoPago || "no_especificado",
      mpStatus,
      mpPaymentId: mpPaymentId || null,
      mpPreferenceId: mpPreferenceId || null,
    });
   
    console.log("🧾 [confirmarPago] Intentando guardar venta:", {
      usuarioId,
      nombreCliente,
      correoCliente,
      total,
      metodoPago,
      mpStatus,
      mpPaymentId,
      mpPreferenceId,
      itemsLength: items.length,
    });
   
    const ventaGuardada = await venta.save();

    console.log("[confirmarPago] Venta guardada con _id:", ventaGuardada._id);

    return res.status(201).json({
      message: "Venta registrada correctamente",
      venta: ventaGuardada,
    });
  } catch (error) {
    console.error("Error confirmando pago y registrando venta:", error);
    return res.status(500).json({
      message: "Error registrando la venta",
      error: error.message,
    });
  }
};

