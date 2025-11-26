// api/controllers/pagoController.js
import { MercadoPagoConfig, Preference } from "mercadopago";
import Venta from "../models/Venta.js";

// Detectar si el token es de PRUEBA (TEST-) o PRODUCCIÓN (APP_USR-)
const isSandbox = String(process.env.MP_ACCESS_TOKEN || "").startsWith("TEST-");

// Cliente de Mercado Pago usando el token del .env
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN, // TEST-... o APP_USR-...
});

// Instancia para manejar preferencias
const preference = new Preference(client);

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
        success: "http://localhost:8181/Interfaz_user/confirmacion.html",
        failure: "http://localhost:8181/Interfaz_user/pago.html",
        pending: "http://localhost:8181/Interfaz_user/pago.html",
      },
      // en producción es útil para que regrese solo al success
      //auto_return: "approved",
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
    const {
      usuarioId,
      items,
      total,
      metodoPago,
      mpStatus,
      mpPaymentId,
      mpPreferenceId,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No hay items en la venta" });
    }

    if (!mpStatus) {
      return res.status(400).json({ message: "Falta estado del pago (mpStatus)" });
    }

    // Solo registramos como venta si el pago fue aprobado
    if (mpStatus.toLowerCase() !== "approved") {
      return res.status(400).json({
        message: "El pago no está aprobado, no se registrará la venta",
      });
    }

    const venta = new Venta({
      usuarioId: usuarioId || null,
      items,
      total: Number(total) || 0,
      metodoPago: metodoPago || "no_especificado",
      mpStatus,
      mpPaymentId: mpPaymentId || null,
      mpPreferenceId: mpPreferenceId || null,
    });

    const ventaGuardada = await venta.save();

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
