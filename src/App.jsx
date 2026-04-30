import { useState, useEffect } from "react";

const DEFAULT_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyxs7uys-3iaRXEzYTBJLJRX2KIdjiixphwqSxUDvlyJykmrZOL2hNXGqq_I7KLUvCb0Q/exec";

const ADMIN_PASSWORD = "nossa2024";
const PUNTOS = ["Centro", "Primavera", "CF"];

// ─── CATEGORIAS — METADATA VISUAL ─────────────────────────────────────────────
// Las categorias son fijas (ID + visual metadata). Los PRODUCTOS son dinamicos
// y se cargan desde la hoja PRODUCTOS via Apps Script (fuente de verdad).
const CATS_META = {
  pasteleria: { nombre: "Pasteleria",      icon: "🥐", color: "#7C5C3B", bg: "#FFF8F0", obligatoria: true,  soloEn: null },
  cafeteria:  { nombre: "Cafeteria",       icon: "C",  color: "#6B4226", bg: "#FDF6F0", obligatoria: false, soloEn: null },
  limpieza:   { nombre: "Limpieza",        icon: "L",  color: "#2E7D6B", bg: "#F0FAF7", obligatoria: false, soloEn: null },
  empaques:   { nombre: "Empaques",        icon: "E",  color: "#5C4DB1", bg: "#F5F3FF", obligatoria: false, soloEn: null },
  materias:   { nombre: "Materias Primas", icon: "M",  color: "#3A7D44", bg: "#F1FAF2", obligatoria: false, soloEn: null },
  cf_extra:   { nombre: "Exclusivo CF",    icon: "*",  color: "#C2185B", bg: "#FFF0F5", obligatoria: false, soloEn: "CF" },
};
const CATS_ORDER = ["pasteleria", "cafeteria", "limpieza", "empaques", "materias", "cf_extra"];

// Categorias que son PRODUCCION para Obrador (lo que hornea, no compra)
const CATS_PRODUCCION = ["pasteleria", "cf_extra"];

// Map id de categoria -> nombre legible
const CAT_NOMBRE = (function () {
  var m = {};
  CATS_ORDER.forEach(function (id) { if (CATS_META[id]) m[id] = CATS_META[id].nombre; });
  return m;
})();

// ─── PRODUCTOS — FALLBACK LOCAL ───────────────────────────────────────────────
// Solo se usa si Apps Script no responde y no hay cache en localStorage.
// La fuente de verdad es la hoja PRODUCTOS (cargada en boot).
// ─── PRODUCTOS — FALLBACK LOCAL ───────────────────────────────────────────────
// Solo se usa si Apps Script no responde y no hay cache en localStorage.
// La fuente de verdad es la hoja PRODUCTOS (cargada en boot).
// Cada producto se expande automaticamente a 3 puntos (Centro/Primavera/CF).
// cf_extra solo se siembra en CF.
const PRODUCTOS_FALLBACK_BASE = [
  // Pasteleria
  { categoria: "pasteleria", producto: "Pastel pollo", min: 12, max: 18 },
  { categoria: "pasteleria", producto: "Almojavanas", min: 2, max: 5 },
  { categoria: "pasteleria", producto: "Galleta avena", min: 3, max: 6 },
  { categoria: "pasteleria", producto: "Galleta macadamia", min: 3, max: 6 },
  { categoria: "pasteleria", producto: "Galleta chocolate", min: 2, max: 4 },
  { categoria: "pasteleria", producto: "Empanada carne", min: 6, max: 18 },
  { categoria: "pasteleria", producto: "Empanada pollo", min: 6, max: 18 },
  { categoria: "pasteleria", producto: "Croissant mantequilla", min: 2, max: 6 },
  { categoria: "pasteleria", producto: "Croissant almendra", min: 2, max: 6 },
  { categoria: "pasteleria", producto: "Eclair maracuya", min: 5, max: 10 },
  { categoria: "pasteleria", producto: "Torta zanahoria", min: 6, max: 10 },
  { categoria: "pasteleria", producto: "Torta chocolate", min: 6, max: 10 },
  { categoria: "pasteleria", producto: "Torta naranja", min: 2, max: 6 },
  { categoria: "pasteleria", producto: "Torta almojavana", min: 2, max: 6 },
  { categoria: "pasteleria", producto: "Tarta cafe", min: 4, max: 8 },
  { categoria: "pasteleria", producto: "Tarta arandanos", min: 6, max: 12 },
  { categoria: "pasteleria", producto: "Cheesecake lulo", min: 3, max: 7 },
  { categoria: "pasteleria", producto: "Cheesecake guayaba", min: 2, max: 5 },
  { categoria: "pasteleria", producto: "Mangos", min: 4, max: 8 },
  { categoria: "pasteleria", producto: "Tres leches", min: 3, max: 6 },
  { categoria: "pasteleria", producto: "Milhojas arequipe", min: 5, max: 8 },
  { categoria: "pasteleria", producto: "Milhojas limon", min: 5, max: 8 },
  { categoria: "pasteleria", producto: "Cocos", min: 3, max: 6 },
  { categoria: "pasteleria", producto: "Fresas und", min: 3, max: 8 },
  { categoria: "pasteleria", producto: "Osos", min: 8, max: 12 },
  // Cafeteria
  { categoria: "cafeteria", producto: "Crema whisky", min: 1, max: 1 },
  { categoria: "cafeteria", producto: "Hierbabuena", min: 1, max: 1 },
  { categoria: "cafeteria", producto: "Tarro aro fresa", min: 1, max: 1 },
  { categoria: "cafeteria", producto: "Tarro aro papaya", min: 1, max: 1 },
  { categoria: "cafeteria", producto: "Tarro aro mora", min: 1, max: 1 },
  { categoria: "cafeteria", producto: "Leche almendra cajax6", min: 2, max: 6 },
  { categoria: "cafeteria", producto: "Varietales", min: 2, max: 6 },
  // Limpieza
  { categoria: "limpieza", producto: "Toallas manos paq", min: 2, max: 6 },
  { categoria: "limpieza", producto: "Jabon loza", min: 1, max: 2 },
  { categoria: "limpieza", producto: "Jabon lavavajillas", min: 1, max: 2 },
  { categoria: "limpieza", producto: "Jabon de manos", min: 2, max: 6 },
  { categoria: "limpieza", producto: "Esponjas", min: 1, max: 3 },
  { categoria: "limpieza", producto: "Alcohol", min: 1, max: 1 },
  { categoria: "limpieza", producto: "Cloro", min: 2, max: 6 },
  { categoria: "limpieza", producto: "Limpiones", min: 2, max: 6 },
  // Empaques
  { categoria: "empaques", producto: "Bolsa manija grande", min: 15, max: 30 },
  { categoria: "empaques", producto: "Bolsa manija mediana", min: 15, max: 30 },
  { categoria: "empaques", producto: "Bolsa parafinada grande", min: 2, max: 4 },
  { categoria: "empaques", producto: "Bolsa parafinada pequena", min: 2, max: 4 },
  { categoria: "empaques", producto: "Servilletas", min: 1, max: 2 },
  // Materias
  { categoria: "materias", producto: "Te matcha", min: 1, max: 1 },
  { categoria: "materias", producto: "Beach party te", min: 2, max: 6 },
  { categoria: "materias", producto: "Chocolate mezcla", min: 1, max: 1 },
  { categoria: "materias", producto: "Amaretto", min: 1, max: 2 },
  { categoria: "materias", producto: "Pulpa de mango", min: 3, max: 6 },
  { categoria: "materias", producto: "Guanabana pulpa", min: 2, max: 6 },
  { categoria: "materias", producto: "Mora pulpa", min: 2, max: 6 },
  { categoria: "materias", producto: "Fresa pulpa", min: 2, max: 6 },
  { categoria: "materias", producto: "Huevos und", min: 2, max: 4 },
  { categoria: "materias", producto: "Limones und", min: 3, max: 5 },
  { categoria: "materias", producto: "Avena en polvo", min: 1, max: 1 },
  // CF extra
  { categoria: "cf_extra", producto: "Muffin arandano frambuesa", min: 2, max: 6 },
  { categoria: "cf_extra", producto: "Gansito", min: 2, max: 6 },
];

const PRODUCTOS_FALLBACK = (function () {
  var out = [];
  PRODUCTOS_FALLBACK_BASE.forEach(function (p) {
    var puntos = (p.categoria === "cf_extra") ? ["CF"] : ["Centro", "Primavera", "CF"];
    puntos.forEach(function (pt) {
      out.push({ categoria: p.categoria, producto: p.producto, punto: pt, min: p.min, max: p.max, activo: true });
    });
  });
  return out;
})();

// Construye un map nombre -> categoria a partir de un array de productos.
// Incluye productos inactivos (para que cierres historicos sigan categorizables en Obrador).
// Nota: el mismo `producto` aparece en multiples puntos pero comparte categoria, asi que
// el ultimo wins es seguro (todos coincidirian).
function buildProductoACat(productosArr) {
  var m = {};
  productosArr.forEach(function (p) { m[p.producto] = p.categoria; });
  return m;
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
function fechaHoy() {
  var d = new Date();
  var mm = String(d.getMonth() + 1).padStart(2, "0");
  var dd = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + mm + "-" + dd;
}

function horaActual() {
  var d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}

function fechaAyer() {
  var d = new Date();
  d.setDate(d.getDate() - 1);
  var mm = String(d.getMonth() + 1).padStart(2, "0");
  var dd = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + mm + "-" + dd;
}

// "2026-04-26" -> "26/04/2026". Si recibe vacio o algo raro, devuelve tal cual.
function fechaDisplay(yyyymmdd) {
  if (!yyyymmdd || typeof yyyymmdd !== "string" || yyyymmdd.length < 10) return yyyymmdd || "";
  return yyyymmdd.slice(8, 10) + "/" + yyyymmdd.slice(5, 7) + "/" + yyyymmdd.slice(0, 4);
}

// Normaliza el "datos" de un cierre (sea cual sea su formato historico)
// a un array de { nombre, cantidad }.
// Soporta:
//   - { p:  [["nombre", n], ...] }              (formato actual compacto)
//   - { pedido:    [{prod,cantidad}, ...] }     (formato local previo)
//   - { pedidos:   [...] }                      (alias)
//   - { produccion:[...] }                      (alias futuro)
// Suma duplicados. Filtra cantidades <= 0.
function normalizarItemsCierre(datos) {
  if (!datos || typeof datos !== "object") return [];

  function parseEntry(it) {
    if (Array.isArray(it)) {
      var nombre = it[0];
      var cant   = it[1];
      if (nombre) return { nombre: String(nombre), cantidad: Number(cant) || 0 };
      return null;
    }
    if (it && typeof it === "object") {
      var n = it.nombre || it.prod || it.producto || it.name || "";
      var c = it.cantidad != null ? it.cantidad : (it.cant != null ? it.cant : (it.qty != null ? it.qty : 0));
      if (n) return { nombre: String(n), cantidad: Number(c) || 0 };
    }
    return null;
  }

  var bag = {};
  ["p", "pedido", "pedidos", "produccion", "pedidoManual"].forEach(function (key) {
    var arr = datos[key];
    if (!Array.isArray(arr)) return;
    arr.forEach(function (it) {
      var parsed = parseEntry(it);
      if (parsed && parsed.cantidad > 0) {
        bag[parsed.nombre] = (bag[parsed.nombre] || 0) + parsed.cantidad;
      }
    });
  });

  // Handle compact pm tuples: [[producto, categoria, cantidad, nota], ...]
  if (Array.isArray(datos.pm)) {
    datos.pm.forEach(function (tuple) {
      if (!Array.isArray(tuple) || tuple.length < 3) return;
      var nombre   = String(tuple[0] || "");
      var cantidad = Number(tuple[2]) || 0;
      if (nombre && cantidad > 0) {
        bag[nombre] = (bag[nombre] || 0) + cantidad;
      }
    });
  }

  return Object.keys(bag).map(function (nombre) {
    return { nombre: nombre, cantidad: bag[nombre] };
  });
}

// Extrae items del pedidoManual preservando nota y categoria.
// Fuente principal: pedidoManual o pm. Fallback: formatos viejos.
function extraerPedidoManualItems(datos) {
  if (!datos || typeof datos !== "object") return [];
  var bag = {};
  function addItem(producto, categoria, cantidad, nota) {
    var c = Number(cantidad) || 0;
    if (!producto || c <= 0) return;
    var key = String(producto);
    if (bag[key]) {
      bag[key].cantidad += c;
      if (nota && !bag[key].nota) bag[key].nota = nota;
    } else {
      bag[key] = { producto: key, categoria: categoria || "", cantidad: c, nota: nota || "" };
    }
  }
  if (Array.isArray(datos.pedidoManual)) {
    datos.pedidoManual.forEach(function (it) {
      if (it && typeof it === "object") addItem(it.producto || it.nombre || it.prod, it.categoria || "", it.cantidad != null ? it.cantidad : it.cant, it.nota || "");
    });
    if (Object.keys(bag).length > 0) return Object.keys(bag).map(function (k) { return bag[k]; });
  }
  if (Array.isArray(datos.pm)) {
    datos.pm.forEach(function (tuple) {
      if (!Array.isArray(tuple) || tuple.length < 3) return;
      addItem(tuple[0], tuple[1], tuple[2], tuple[3] || "");
    });
    if (Object.keys(bag).length > 0) return Object.keys(bag).map(function (k) { return bag[k]; });
  }
  ["p", "pedido", "pedidos", "produccion"].forEach(function (key) {
    var arr = datos[key];
    if (!Array.isArray(arr)) return;
    arr.forEach(function (it) {
      if (Array.isArray(it)) { addItem(it[0], "", it[1], ""); }
      else if (it && typeof it === "object") {
        var n = it.nombre || it.prod || it.producto || it.name || "";
        var c = it.cantidad != null ? it.cantidad : (it.cant != null ? it.cant : (it.qty != null ? it.qty : 0));
        addItem(n, it.categoria || "", c, it.nota || "");
      }
    });
  });
  return Object.keys(bag).map(function (k) { return bag[k]; });
}

function lsGet(k) {
  try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; }
}
function lsSet(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
}

// ─── API ─────────────────────────────────────────────────────────────────────
function dispararGetSinCors(url) {
  return new Promise(function (resolve) {
    var img  = new Image();
    var done = false;
    function finish() { if (done) return; done = true; resolve(true); }
    img.onload  = finish;
    img.onerror = finish;
    img.src = url;
    setTimeout(finish, 2500);
  });
}

async function apiEstadoCierres() {
  var fecha = fechaHoy();
  var url = DEFAULT_APPS_SCRIPT_URL + "?action=estadoCierres&fecha=" + fecha;
  console.log("GET estadoCierres:", url);
  try {
    var res  = await fetch(url);
    var text = await res.text();
    var data = JSON.parse(text);
    console.log("Respuesta estadoCierres:", data);
    if (data && data.success && data.cierres) return data.cierres;
  } catch (e) {
    console.error("Error estadoCierres:", e);
  }
  return { Centro: false, Primavera: false, CF: false };
}

async function apiObtenerCierre(fecha, punto) {
  var url = DEFAULT_APPS_SCRIPT_URL
    + "?action=obtenerCierre"
    + "&fecha=" + encodeURIComponent(fecha)
    + "&punto=" + encodeURIComponent(punto);
  try {
    var res  = await fetch(url);
    var text = await res.text();
    var data = JSON.parse(text);
    if (data && data.success) return data;
    console.warn("apiObtenerCierre respuesta sin success:", data);
  } catch (e) {
    console.error("apiObtenerCierre:", e);
  }
  return { success: false, found: false, fecha: fecha, punto: punto, datos: null };
}

async function apiUltimoCierre(punto) {
  var url = DEFAULT_APPS_SCRIPT_URL
    + "?action=ultimoCierre"
    + "&punto=" + encodeURIComponent(punto);
  try {
    var res  = await fetch(url);
    var text = await res.text();
    var data = JSON.parse(text);
    if (data && data.success) return data;
    console.warn("apiUltimoCierre respuesta sin success:", data);
  } catch (e) {
    console.error("apiUltimoCierre:", e);
  }
  return { success: false, found: false, punto: punto, datos: null };
}

// ─── API PRODUCTOS ─────────────────────────────────────────────────────────────
async function apiListarProductos(opts) {
  var o = opts || {};
  var url = DEFAULT_APPS_SCRIPT_URL + "?action=listarProductos";
  if (o.punto)            url += "&punto=" + encodeURIComponent(o.punto);
  if (o.incluirInactivos) url += "&incluirInactivos=true";
  try {
    var res  = await fetch(url);
    var text = await res.text();
    var data = JSON.parse(text);
    if (data && data.success && Array.isArray(data.productos)) return data.productos;
    console.warn("apiListarProductos respuesta sin success:", data);
  } catch (e) {
    console.error("apiListarProductos:", e);
  }
  return null;  // null = falla; el caller decide si usar cache/fallback
}

// punto puede ser "Centro"|"Primavera"|"CF"|"Todos"
async function apiGuardarProducto(categoria, producto, punto, min, max) {
  var url = DEFAULT_APPS_SCRIPT_URL
    + "?action=guardarProducto"
    + "&categoria=" + encodeURIComponent(categoria)
    + "&producto="  + encodeURIComponent(producto)
    + "&punto="     + encodeURIComponent(punto)
    + "&min="       + encodeURIComponent(String(min))
    + "&max="       + encodeURIComponent(String(max));
  try {
    var res  = await fetch(url);
    var text = await res.text();
    return JSON.parse(text);
  } catch (e) {
    console.error("apiGuardarProducto:", e);
    return { success: false, error: String(e) };
  }
}

// Actualiza una fila puntual: clave compuesta (producto, punto). punto requerido.
// cambios: { min?, max?, activo?, categoria? }
async function apiActualizarProducto(producto, punto, cambios) {
  var url = DEFAULT_APPS_SCRIPT_URL
    + "?action=actualizarProducto"
    + "&producto=" + encodeURIComponent(producto)
    + "&punto="    + encodeURIComponent(punto);
  if (cambios.min       != null) url += "&min="       + encodeURIComponent(String(cambios.min));
  if (cambios.max       != null) url += "&max="       + encodeURIComponent(String(cambios.max));
  if (cambios.activo    != null) url += "&activo="    + encodeURIComponent(String(cambios.activo));
  if (cambios.categoria != null) url += "&categoria=" + encodeURIComponent(cambios.categoria);
  try {
    var res  = await fetch(url);
    var text = await res.text();
    return JSON.parse(text);
  } catch (e) {
    console.error("apiActualizarProducto:", e);
    return { success: false, error: String(e) };
  }
}

// Soft delete por (producto, punto). punto puede ser "Todos" para inactivar en los 3.
async function apiEliminarProducto(producto, punto) {
  var url = DEFAULT_APPS_SCRIPT_URL
    + "?action=eliminarProducto"
    + "&producto=" + encodeURIComponent(producto)
    + "&punto="    + encodeURIComponent(punto);
  try {
    var res  = await fetch(url);
    var text = await res.text();
    return JSON.parse(text);
  } catch (e) {
    console.error("apiEliminarProducto:", e);
    return { success: false, error: String(e) };
  }
}

// Anula un cierre (soft: marca anulado:true en Datos). El punto vuelve a aparecer
// como Pendiente en estadoCierres y permite rehacer el cierre.
async function apiAnularCierre(fecha, punto) {
  var url = DEFAULT_APPS_SCRIPT_URL
    + "?action=anularCierre"
    + "&fecha=" + encodeURIComponent(fecha)
    + "&punto=" + encodeURIComponent(punto);
  try {
    var res  = await fetch(url);
    var text = await res.text();
    return JSON.parse(text);
  } catch (e) {
    console.error("apiAnularCierre:", e);
    return { success: false, error: String(e) };
  }
}

async function apiGuardarCierre(punto, datos) {
  if (!punto) {
    alert("Error: punto es null. No se puede guardar.");
    return false;
  }
  var fecha    = fechaHoy();
  var finalUrl = DEFAULT_APPS_SCRIPT_URL
    + "?action=guardarCierre"
    + "&fecha="  + encodeURIComponent(fecha)
    + "&punto="  + encodeURIComponent(punto)
    + "&datos="  + encodeURIComponent(JSON.stringify(datos));

  console.log("GET guardarCierre:", finalUrl);
  console.log("URL length:", finalUrl.length);

  await dispararGetSinCors(finalUrl);
  console.log("dispararGetSinCors completado — esperando 1000ms");

  await new Promise(function (r) { setTimeout(r, 1000); });

  var estado = await apiEstadoCierres();
  return estado;
}

// ─── ESTILOS — Nossa Brand ──────────────────────────────────────────────────
// Pantone 317C aqua (#6BB8B0), negro (#1A1A1A), blanco (#FFFFFF)
var NOSSA = {
  aqua:     "#6BB8B0",
  aquaDark: "#4A9E95",
  aquaLight:"#E8F5F3",
  aquaPale: "#F2FAF8",
  black:    "#1A1A1A",
  charcoal: "#2D3748",
  gray:     "#6B7280",
  grayLight:"#E5E7EB",
  white:    "#FFFFFF",
  cream:    "#FAFBFA",
  ok:       "#2F9E6E",
  okBg:     "#E6F7EF",
  warn:     "#D97706",
  warnBg:   "#FEF3C7",
  danger:   "#DC2626",
};

var S = {
  page:  { minHeight: "100vh", background: "#F4F6F5", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: 12, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
  card:  { width: "100%", maxWidth: 480, background: NOSSA.white, borderRadius: 20, boxShadow: "0 4px 32px rgba(0,0,0,0.08)", overflow: "hidden" },
  hero:  { background: NOSSA.black, padding: "32px 24px 24px", textAlign: "center", color: NOSSA.white },
  body:  { padding: "8px 20px 28px" },
  lbl:   { fontSize: 11, color: NOSSA.gray, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1.2, margin: "16px 0 8px" },
  inp:   { width: "100%", padding: "13px 14px", borderRadius: 12, border: "2px solid " + NOSSA.grayLight, fontSize: 15, outline: "none", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", background: NOSSA.cream, boxSizing: "border-box" },
  btn:   { display: "block", width: "100%", padding: "16px", borderRadius: 14, border: "none", background: NOSSA.black, color: NOSSA.white, fontSize: 16, fontWeight: "bold", cursor: "pointer", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", marginTop: 14, letterSpacing: 0.5 },
  ghost: { background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", color: NOSSA.white, padding: "7px 14px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
  link:  { display: "block", width: "100%", marginTop: 12, padding: "10px", background: "transparent", border: "none", color: "#9CA3AF", fontSize: 12, cursor: "pointer", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", textDecoration: "underline" },
  font:  "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function NossaCafe() {
  var [screen, setScreen]               = useState("inicio");
  var [selectedPoint, setSelectedPoint] = useState(null);   // NUNCA se vuelve null durante el flujo
  var [responsable, setResponsable]     = useState("");
  var [hora, setHora]                   = useState(horaActual);
  var [cierresEstado, setCierresEstado] = useState({ Centro: false, Primavera: false, CF: false });
  var [cargando, setCargando]           = useState(false);
  var [saving, setSaving]               = useState(false);
  var [lastSaved, setLastSaved]         = useState(null);   // snapshot inmutable para resumen
  var [adminPass, setAdminPass]         = useState("");
  var [adminErr, setAdminErr]           = useState(false);
  var [adminTab, setAdminTab]           = useState("cierres");

  // ── Cantidades del pedido: map producto -> cantidad (number) ──────────────
  // Inicia en {} (todo 0 implícito). Se resetea en cada nuevo cierre.
  var [cantidades, setCantidades]       = useState({});
  var [observaciones, setObservaciones] = useState("");

  // ── Productos: fuente de verdad es la hoja PRODUCTOS de Sheets.
  //    En boot intentamos cache de localStorage (rapido), luego sobreescribimos con Sheets.
  //    Si Sheets falla y no hay cache, usamos PRODUCTOS_FALLBACK.
  //    Cache key: v2 porque el shape cambio (ahora incluye `punto`).
  var [productos, setProductos]         = useState(function () {
    var cache = lsGet("nossa_productos_v2");
    if (cache && Array.isArray(cache) && cache.length > 0 && cache[0].punto) return cache;
    return PRODUCTOS_FALLBACK;
  });
  var [productosLoading, setProductosLoading] = useState(false);

  // ── Estado de edicion en el panel Admin Min/Max
  // Clave compuesta: (producto, punto). null = nadie editando.
  var [editProd, setEditProd]           = useState(null);
  var [editPunto, setEditPunto]         = useState(null);
  var [eMin, setEMin]                   = useState("");
  var [eMax, setEMax]                   = useState("");
  var [savingProd, setSavingProd]       = useState(false);

  // ── Selector de punto en Min/Max admin + filtro inactivos
  var [adminPunto, setAdminPunto]       = useState("Centro");   // qué punto se ve
  var [mostrarInactivos, setMostrarInactivos] = useState(false);

  // ── Estado del formulario "Anadir producto"
  var [adding, setAdding]               = useState(false);
  var [aCat,  setACat]                  = useState("pasteleria");
  var [aName, setAName]                 = useState("");
  var [aPunto, setAPunto]               = useState("Todos");    // sentinel "Todos" => 3 filas
  var [aMin,  setAMin]                  = useState("");
  var [aMax,  setAMax]                  = useState("");

  // ── Estado de "Corregir cierres" (admin)
  var [corregirFecha, setCorregirFecha]     = useState(fechaHoy);
  var [corregirPunto, setCorregirPunto]     = useState("Centro");
  var [corregirCierre, setCorregirCierre]   = useState(null);   // {found, anulado, datos, fecha, punto, timestamp}
  var [corregirLoading, setCorregirLoading] = useState(false);
  var [corregirMsg, setCorregirMsg]         = useState("");
  var [corregirMsgOk, setCorregirMsgOk]     = useState(false);

  var [despacho, setDespacho]           = useState(function () { return lsGet("nossa_despacho_v2") || {}; });

  // ── Obrador (separado del flujo de tienda) ─────────────────────────────────
  var [fechaObrador, setFechaObrador]   = useState(fechaAyer);
  var [obradorData,  setObradorData]    = useState({ Centro: null, Primavera: null, CF: null });
  var [obradorLoading, setObradorLoading] = useState(false);

  // ── Boot ────────────────────────────────────────────────────────────────────
  useEffect(function () {
    setHora(horaActual());
    recargar();
    cargarProductos();   // carga productos desde Sheets en background
  }, []);

  // ── Estado cierres desde Sheets ─────────────────────────────────────────────
  async function recargar() {
    setCargando(true);
    try {
      var e = await apiEstadoCierres();
      setCierresEstado(e);
    } catch (err) { console.error(err); }
    setCargando(false);
  }

  // ── Productos: carga desde Sheets, actualiza cache ─────────────────────────
  // Por defecto solo activos (lo que necesita el flujo de cierre).
  // Cuando admin muestra inactivos, se llama con incluirInactivos=true (sin cache).
  async function cargarProductos(opts) {
    var o = opts || {};
    setProductosLoading(true);
    try {
      var arr = await apiListarProductos({ incluirInactivos: !!o.incluirInactivos });
      if (arr && arr.length > 0) {
        setProductos(arr);
        // Solo cacheamos cuando son activos solos (lo que se usa para cierres).
        if (!o.incluirInactivos) {
          lsSet("nossa_productos_v2", arr);
        }
      } else {
        console.warn("listarProductos vacio o null. Manteniendo cache/fallback.");
      }
    } catch (e) {
      console.error("cargarProductos:", e);
    }
    setProductosLoading(false);
  }

  // ── Obrador: cargar todos los puntos para una fecha ────────────────────────
  async function cargarObrador(fecha) {
    setObradorLoading(true);
    try {
      var resultados = await Promise.all(PUNTOS.map(function (p) {
        return apiObtenerCierre(fecha, p);
      }));
      var nuevo = {};
      PUNTOS.forEach(function (p, i) {
        var r = resultados[i];
        nuevo[p] = {
          found:     !!r.found,
          fecha:     r.fecha || fecha,
          datos:     r.datos || null,
          esUltimo:  false,
        };
      });
      setObradorData(nuevo);
    } catch (e) {
      console.error("cargarObrador:", e);
    }
    setObradorLoading(false);
  }

  // ── Obrador: cargar el ULTIMO cierre disponible para un punto ──────────────
  async function cargarUltimoPunto(punto) {
    setObradorLoading(true);
    try {
      var r = await apiUltimoCierre(punto);
      setObradorData(function (prev) {
        var u = Object.assign({}, prev);
        u[punto] = {
          found:    !!r.found,
          fecha:    r.fecha || "",
          datos:    r.datos || null,
          esUltimo: true,
        };
        return u;
      });
    } catch (e) {
      console.error("cargarUltimoPunto:", e);
    }
    setObradorLoading(false);
  }

  // ── Obrador: toggle "marcar enviado" (key fecha+punto en localStorage) ─────
  function toggleDespacho(fecha, punto) {
    var key = fecha + "_" + punto;
    var u   = Object.assign({}, despacho);
    u[key]  = !u[key];
    setDespacho(u);
    lsSet("nossa_despacho_v2", u);
  }

  function despachoMarcado(fecha, punto) {
    return !!despacho[fecha + "_" + punto];
  }

  // Cargar Obrador automaticamente al entrar a la pantalla o cambiar fecha
  useEffect(function () {
    if (screen !== "obrador") return;
    cargarObrador(fechaObrador);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, fechaObrador]);

  // Recargar productos al entrar al panel admin (fuente de verdad fresca)
  // Si mostrarInactivos cambia, recargamos con/sin inactivos.
  useEffect(function () {
    if (screen !== "admin") return;
    cargarProductos({ incluirInactivos: mostrarInactivos });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, mostrarInactivos]);

  // ── Corregir cierres: buscar / anular ──────────────────────────────────────
  async function buscarCierreParaCorregir() {
    setCorregirLoading(true);
    setCorregirMsg("");
    setCorregirCierre(null);
    try {
      // Pedimos incluirAnulados para que el admin pueda ver tambien los ya anulados
      var url = DEFAULT_APPS_SCRIPT_URL
        + "?action=obtenerCierre"
        + "&fecha=" + encodeURIComponent(corregirFecha)
        + "&punto=" + encodeURIComponent(corregirPunto)
        + "&incluirAnulados=true";
      var res  = await fetch(url);
      var text = await res.text();
      var data = JSON.parse(text);
      if (data && data.success) {
        setCorregirCierre(data);
        if (!data.found) {
          setCorregirMsg("No hay cierre para esa fecha y punto.");
          setCorregirMsgOk(false);
        }
      } else {
        setCorregirMsg("Error: " + (data.error || "respuesta inesperada"));
        setCorregirMsgOk(false);
      }
    } catch (e) {
      console.error("buscarCierreParaCorregir:", e);
      setCorregirMsg("Error de red consultando el cierre.");
      setCorregirMsgOk(false);
    }
    setCorregirLoading(false);
  }

  async function anularCierreActual() {
    if (!corregirCierre || !corregirCierre.found) return;
    if (corregirCierre.datos && corregirCierre.datos.anulado) {
      setCorregirMsg("Este cierre ya estaba anulado.");
      setCorregirMsgOk(false);
      return;
    }
    if (!confirm("Anular cierre de " + corregirPunto + " del " + fechaDisplay(corregirFecha) + "?\n\nEl punto volvera a aparecer como Pendiente y podra rehacer el cierre.\n\nNo se borra el historial.")) return;
    setCorregirLoading(true);
    var r = await apiAnularCierre(corregirFecha, corregirPunto);
    setCorregirLoading(false);
    if (r && r.success) {
      setCorregirMsg("Cierre anulado. El punto puede realizar el cierre nuevamente.");
      setCorregirMsgOk(true);
      // Refrescar el cierre mostrado y el estadoCierres
      buscarCierreParaCorregir();
      recargar();
    } else {
      setCorregirMsg("Error: " + ((r && r.error) || "no se pudo anular"));
      setCorregirMsgOk(false);
    }
  }

  // ── Productos derivados (memoizados) ───────────────────────────────────────
  // Productos activos solamente, agrupados por categoria, en el orden de CATS_ORDER
  var productosActivos = productos.filter(function (p) { return p.activo; });
  var productoACat     = buildProductoACat(productos);  // incluye inactivos para historico

  // ── Catalogo deduplicado por nombre (para el flujo de pedido manual) ────────
  // Los productos vienen repetidos por punto. Para el catalogo de la UI
  // solo necesitamos un entry por nombre (activos). Agrupados por categoria.
  var catalogoDedup = (function () {
    var seen = {};
    var out  = [];
    productosActivos.forEach(function (p) {
      if (seen[p.producto]) return;
      seen[p.producto] = true;
      out.push({ producto: p.producto, categoria: p.categoria });
    });
    return out;
  })();

  var catalogoPorCat = {};
  catalogoDedup.forEach(function (p) {
    if (!catalogoPorCat[p.categoria]) catalogoPorCat[p.categoria] = [];
    catalogoPorCat[p.categoria].push(p);
  });

  // Contar cuantos productos tienen cantidad > 0
  var totalConCantidad = catalogoDedup.filter(function (p) { return (cantidades[p.producto] || 0) > 0; }).length;

  // ── GUARDAR CIERRE ───────────────────────────────────────────────────────────
  async function handleGuardarCierre() {
    console.log("CLICK GUARDAR CIERRE");

    var pt   = selectedPoint;
    var hr   = hora;
    var resp = responsable;
    var fecha = fechaHoy();

    if (!pt) {
      console.error("handleGuardarCierre: selectedPoint es null");
      alert("Error: no hay punto seleccionado. Vuelve al inicio y selecciona Centro, Primavera o CF.");
      return;
    }

    // Construir pedidoManual desde cantidades > 0
    var pedidoManual = [];
    catalogoDedup.forEach(function (p) {
      var cant = cantidades[p.producto] || 0;
      if (cant > 0) {
        pedidoManual.push({ producto: p.producto, categoria: p.categoria, cantidad: cant, origen: "manual" });
      }
    });

    // Confirmacion si no hay items
    if (pedidoManual.length === 0) {
      if (!confirm("No agregaste productos al pedido.\nQuieres guardar el cierre sin pedido para Obrador?")) return;
    }

    // Formato compacto para URL: pm = [[producto, categoria, cantidad], ...]
    var pmCompacto = pedidoManual.map(function (it) {
      return [it.producto, it.categoria, it.cantidad];
    });

    var datosOperativos = {
      h: hr,
      r: resp || "",
      pm: pmCompacto,
      o: observaciones || ""
    };

    var finalUrl = DEFAULT_APPS_SCRIPT_URL
      + "?action=guardarCierre"
      + "&fecha="  + encodeURIComponent(fecha)
      + "&punto="  + encodeURIComponent(pt)
      + "&datos="  + encodeURIComponent(JSON.stringify(datosOperativos));

    console.log("URL FINAL GUARDAR:", finalUrl);
    console.log("URL length:", finalUrl.length);
    console.log("Pedido manual items:", pmCompacto.length);
    if (finalUrl.length > 1800) {
      console.warn("URL larga (" + finalUrl.length + " chars).");
    }

    setSaving(true);
    try {
      await dispararGetSinCors(finalUrl);
      await new Promise(function (r) { setTimeout(r, 1500); });
      var estadoNuevo = await apiEstadoCierres();

      if (!estadoNuevo[pt]) {
        await new Promise(function (r) { setTimeout(r, 1500); });
        estadoNuevo = await apiEstadoCierres();
      }

      setCierresEstado(estadoNuevo);

      // Construir mensaje WhatsApp
      var fechaDisp = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
      var msg = "CIERRE - " + pt + "\n" + fechaDisp + "  " + hr + "  " + (resp || "--") + "\n\n";
      if (pedidoManual.length === 0) {
        msg += "Sin pedidos.";
      } else {
        msg += "PEDIDO PARA OBRADOR:\n\n";
        var porCat = {};
        pedidoManual.forEach(function (it) {
          var catNom = CAT_NOMBRE[it.categoria] || it.categoria;
          if (!porCat[catNom]) porCat[catNom] = [];
          porCat[catNom].push(it);
        });
        Object.keys(porCat).forEach(function (catNom) {
          msg += catNom + ":\n";
          porCat[catNom].forEach(function (it) {
            msg += "  - " + it.producto + ": " + it.cantidad + " und\n";
          });
          msg += "\n";
        });
      }
      if (observaciones) {
        msg += "OBSERVACIONES:\n" + observaciones + "\n";
      }

      setLastSaved({ punto: pt, hora: hr, responsable: resp, pedido: pedidoManual, mensaje: msg });
      setScreen("resumen");
    } catch (e) {
      console.error("handleGuardarCierre error:", e);
      alert("Error al guardar:\n" + e.message);
    }
    setSaving(false);
  }

  function reiniciar() {
    setSelectedPoint(null);
    setResponsable("");
    setHora(horaActual());
    setCantidades({});
    setObservaciones("");
    setLastSaved(null);
    recargar();
    setScreen("inicio");
  }

  function tryLogin() {
    if (adminPass === ADMIN_PASSWORD) { setScreen("admin"); setAdminErr(false); setAdminPass(""); }
    else { setAdminErr(true); setTimeout(function () { setAdminErr(false); }, 2000); }
  }

  // ════════════════════════════════════════════════════════
  // PANTALLA: OBRADOR — consolidado general + despacho por punto
  // ════════════════════════════════════════════════════════
  if (screen === "obrador") {
    var enviadosCount = PUNTOS.filter(function (p) { return despachoMarcado(fechaObrador, p); }).length;

    var puntosEnConsolidado = PUNTOS.filter(function (p) {
      var d = obradorData[p];
      return d && d.found && !d.esUltimo;
    });
    var puntosPendientes = PUNTOS.filter(function (p) { return puntosEnConsolidado.indexOf(p) < 0; });

    // ─── Consolidado general agrupado por categoria ───────────────────────────
    var consolidadoMap = {};
    puntosEnConsolidado.forEach(function (p) {
      var d = obradorData[p];
      var items = extraerPedidoManualItems(d.datos);
      items.forEach(function (it) {
        if (!consolidadoMap[it.producto]) {
          consolidadoMap[it.producto] = { producto: it.producto, categoria: it.categoria || productoACat[it.producto] || "otros", total: 0 };
        }
        consolidadoMap[it.producto].total += it.cantidad;
      });
    });
    var consolidadoList = Object.keys(consolidadoMap).map(function (k) { return consolidadoMap[k]; });
    // Agrupar por categoria
    var consPorCat = {};
    var totalGeneralCons = 0;
    consolidadoList.forEach(function (it) {
      var catId = it.categoria;
      if (!consPorCat[catId]) consPorCat[catId] = [];
      consPorCat[catId].push(it);
      totalGeneralCons += it.total;
    });
    // Ordenar items dentro de cada cat
    Object.keys(consPorCat).forEach(function (c) {
      consPorCat[c].sort(function (a, b) { return b.total - a.total; });
    });

    // ─── Generar texto WhatsApp ───────────────────────────────────────────────
    function generarTextoWhatsApp() {
      var fechaDisp = fechaDisplay(fechaObrador);
      var txt = "NOSSA - OBRADOR\n" + fechaDisp + "\n";
      txt += puntosEnConsolidado.length + "/3 cerrados | " + enviadosCount + "/3 enviados\n";
      txt += "────────────────\n\n";

      if (consolidadoList.length > 0) {
        txt += "CONSOLIDADO GENERAL (" + totalGeneralCons + " und)\n\n";
        CATS_ORDER.forEach(function (catId) {
          var lista = consPorCat[catId];
          if (!lista || lista.length === 0) return;
          var catTotal = lista.reduce(function (s, it) { return s + it.total; }, 0);
          txt += (CAT_NOMBRE[catId] || catId) + " (" + catTotal + "):\n";
          lista.forEach(function (it) {
            txt += "  " + it.producto + ": " + it.total + "\n";
          });
          txt += "\n";
        });
        // Categorias fuera de CATS_ORDER
        Object.keys(consPorCat).forEach(function (catId) {
          if (CATS_ORDER.indexOf(catId) >= 0) return;
          var lista = consPorCat[catId];
          var catTotal = lista.reduce(function (s, it) { return s + it.total; }, 0);
          txt += (CAT_NOMBRE[catId] || catId) + " (" + catTotal + "):\n";
          lista.forEach(function (it) {
            txt += "  " + it.producto + ": " + it.total + "\n";
          });
          txt += "\n";
        });
      } else {
        txt += "Sin pedidos registrados.\n\n";
      }

      txt += "────────────────\n\nDESPACHO POR PUNTO\n\n";

      PUNTOS.forEach(function (p) {
        var d    = obradorData[p];
        var sent = despachoMarcado(fechaObrador, p);
        if (!d || !d.found) {
          txt += p + ": Pendiente / Sin cierre\n\n";
          return;
        }
        var datos = d.datos;
        var items = extraerPedidoManualItems(datos);
        var estado = sent ? "Enviado" : "Cerrado";
        txt += p + " (" + estado + "):\n";
        if (items.length === 0) {
          txt += "  Sin pedido\n";
        } else {
          var puntoTotal = items.reduce(function (s, it) { return s + it.cantidad; }, 0);
          items.forEach(function (it) {
            txt += "  " + it.producto + ": " + it.cantidad + "\n";
          });
          txt += "  Total: " + puntoTotal + " und\n";
        }
        var obs = datos.o || datos.obs || datos.observaciones || "";
        if (obs) txt += "  Obs: " + obs + "\n";
        txt += "\n";
      });

      return txt.trim();
    }

    function copiarWhatsApp() {
      var txt = generarTextoWhatsApp();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(function () { alert("Copiado al portapapeles"); }).catch(function () { prompt("Copia este texto:", txt); });
      } else {
        prompt("Copia este texto:", txt);
      }
    }

    // ─── Tarjeta de DESPACHO POR PUNTO ────────────────────────────────────────
    function renderDespachoPunto(p) {
      var d    = obradorData[p];
      var sent = despachoMarcado(fechaObrador, p);
      var datos = d && d.found ? d.datos : null;

      if (!d || !d.found || !datos) {
        return (
          <div key={p} style={{ borderRadius: 14, border: "2px dashed " + NOSSA.grayLight, background: NOSSA.cream, padding: "14px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 15, fontWeight: "bold", color: NOSSA.charcoal }}>{p}</div>
              <span style={{ fontSize: 11, fontWeight: "bold", color: NOSSA.warn, background: NOSSA.warnBg, padding: "3px 10px", borderRadius: 20 }}>Pendiente</span>
            </div>
            <div style={{ fontSize: 12, color: NOSSA.gray, marginBottom: 10 }}>No hay cierre para {fechaDisplay(fechaObrador)}.</div>
            <button
              onClick={function () { cargarUltimoPunto(p); }}
              style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1.5px solid " + NOSSA.aquaDark, background: NOSSA.white, color: NOSSA.aquaDark, fontSize: 12, fontWeight: "bold", cursor: "pointer", fontFamily: S.font }}
            >Ver ultimo cierre disponible</button>
          </div>
        );
      }

      var itemsPunto    = extraerPedidoManualItems(datos);
      var puntoTotal    = itemsPunto.reduce(function (s, it) { return s + it.cantidad; }, 0);
      var hora          = datos.h || datos.hora || "—";
      var resp          = datos.r || datos.responsable || "—";
      var obs           = datos.o || datos.obs || datos.observaciones || "";
      var fechaCierreReal  = d.fecha;
      var muestraOtraFecha = d.esUltimo && fechaCierreReal && fechaCierreReal !== fechaObrador;

      // Agrupar items del punto por categoria
      var itemsPorCat = {};
      itemsPunto.forEach(function (it) {
        var catId = it.categoria || productoACat[it.producto] || "otros";
        if (!itemsPorCat[catId]) itemsPorCat[catId] = [];
        itemsPorCat[catId].push(it);
      });

      var estadoColor = sent ? NOSSA.ok : NOSSA.aquaDark;
      var estadoLabel = sent ? "Enviado" : "Cerrado";
      var estadoBg    = sent ? NOSSA.okBg : NOSSA.aquaLight;

      return (
        <div key={p} style={{ borderRadius: 14, border: "2px solid " + (muestraOtraFecha ? NOSSA.warn : sent ? NOSSA.ok : NOSSA.grayLight), background: NOSSA.white, marginBottom: 12, opacity: sent ? 0.92 : 1 }}>
          <div style={{ padding: "12px 14px", borderBottom: "1px solid #F0F0F0", background: muestraOtraFecha ? NOSSA.warnBg : (sent ? NOSSA.okBg : NOSSA.cream) }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 16, fontWeight: "bold", color: NOSSA.charcoal }}>{p}</div>
              <span style={{ fontSize: 10, fontWeight: "bold", color: estadoColor, background: estadoBg, padding: "3px 10px", borderRadius: 20 }}>{estadoLabel}</span>
            </div>
            <div style={{ fontSize: 11, color: NOSSA.gray, marginTop: 3 }}>
              {fechaDisplay(fechaCierreReal)} - {hora} - {resp}
              {puntoTotal > 0 && <span style={{ marginLeft: 8, fontWeight: "bold", color: NOSSA.aquaDark }}>{puntoTotal} und</span>}
            </div>
            {muestraOtraFecha && (
              <div style={{ marginTop: 6, fontSize: 10, fontWeight: "bold", color: "#9A3412", background: "#FED7AA", padding: "5px 8px", borderRadius: 6 }}>
                Dato de otra fecha — no entra en el consolidado
              </div>
            )}
          </div>

          {itemsPunto.length > 0 ? (
            <div style={{ padding: "8px 14px 4px" }}>
              {CATS_ORDER.map(function (catId) {
                var lista = itemsPorCat[catId];
                if (!lista || lista.length === 0) return null;
                var meta = CATS_META[catId];
                return (
                  <div key={catId} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, color: meta ? meta.color : NOSSA.gray, marginBottom: 3 }}>{CAT_NOMBRE[catId] || catId}</div>
                    {lista.map(function (it, i) {
                      return (
                        <div key={i} style={{ padding: "4px 0", borderBottom: "1px solid #F5F5F5" }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 13, color: NOSSA.charcoal }}>{it.producto}</span>
                            <span style={{ fontSize: 13, fontWeight: "bold", color: NOSSA.aquaDark }}>{it.cantidad} und</span>
                          </div>
                          {it.nota && <div style={{ fontSize: 11, color: NOSSA.gray, fontStyle: "italic", marginTop: 1 }}>{it.nota}</div>}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              {/* Categorias fuera de CATS_ORDER */}
              {Object.keys(itemsPorCat).filter(function (c) { return CATS_ORDER.indexOf(c) < 0; }).map(function (catId) {
                var lista = itemsPorCat[catId];
                return (
                  <div key={catId} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, color: NOSSA.gray, marginBottom: 3 }}>{CAT_NOMBRE[catId] || catId}</div>
                    {lista.map(function (it, i) {
                      return (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #F5F5F5" }}>
                          <span style={{ fontSize: 13, color: NOSSA.charcoal }}>{it.producto}</span>
                          <span style={{ fontSize: 13, fontWeight: "bold", color: NOSSA.aquaDark }}>{it.cantidad} und</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: "14px", fontSize: 13, color: NOSSA.gray, textAlign: "center" }}>Cerrado sin pedido para Obrador</div>
          )}

          {obs && (
            <div style={{ padding: "8px 14px", borderTop: "1px solid #F0F0F0", background: NOSSA.warnBg }}>
              <div style={{ fontSize: 10, fontWeight: "bold", color: NOSSA.warn, textTransform: "uppercase", letterSpacing: 1 }}>Observaciones</div>
              <div style={{ fontSize: 12, color: "#78350F", marginTop: 3 }}>{obs}</div>
            </div>
          )}

          <div style={{ padding: "10px 14px", borderTop: "1px solid #F0F0F0", background: NOSSA.cream }}>
            <button
              onClick={function () { toggleDespacho(fechaObrador, p); }}
              style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1.5px solid " + (sent ? NOSSA.ok : NOSSA.aquaDark), background: sent ? NOSSA.ok : NOSSA.white, color: sent ? NOSSA.white : NOSSA.aquaDark, fontSize: 12, fontWeight: "bold", cursor: "pointer", fontFamily: S.font }}
            >{sent ? "Enviado" : "Marcar enviado"}</button>
          </div>
        </div>
      );
    }

    return (
      <div style={S.page}>
        <div style={S.card}>
          {/* HEADER */}
          <div style={{ background: NOSSA.black, padding: "20px 20px 14px", color: NOSSA.white }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: "bold", letterSpacing: 2.5, color: NOSSA.aqua }}>nossa.</div>
                <div style={{ fontSize: 20, fontWeight: "bold", color: NOSSA.white, marginTop: 2 }}>Obrador</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}</div>
              </div>
              <button style={S.ghost} onClick={function () { recargar(); setScreen("inicio"); }}>Salir</button>
            </div>

            <div style={{ marginTop: 14, background: "rgba(255,255,255,0.07)", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 10, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1.2, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
                Fecha
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  type="date"
                  value={fechaObrador}
                  onChange={function (e) { setFechaObrador(e.target.value); }}
                  style={{ flex: 1, minWidth: 140, padding: "7px 9px", borderRadius: 8, border: "none", fontSize: 13, fontFamily: S.font, background: NOSSA.white, color: NOSSA.charcoal }}
                />
                <button onClick={function () { setFechaObrador(fechaAyer()); }} style={{ padding: "7px 12px", borderRadius: 8, border: "none", background: "rgba(255,255,255,0.15)", color: NOSSA.white, fontSize: 11, fontWeight: "bold", cursor: "pointer", fontFamily: S.font }}>Ayer</button>
                <button onClick={function () { setFechaObrador(fechaHoy()); }}  style={{ padding: "7px 12px", borderRadius: 8, border: "none", background: "rgba(255,255,255,0.15)", color: NOSSA.white, fontSize: 11, fontWeight: "bold", cursor: "pointer", fontFamily: S.font }}>Hoy</button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, fontWeight: "bold", background: NOSSA.aquaDark, color: NOSSA.white, padding: "4px 12px", borderRadius: 20 }}>{puntosEnConsolidado.length}/3 cerrados</span>
              <span style={{ fontSize: 11, background: "rgba(255,255,255,0.12)", color: NOSSA.white, padding: "4px 12px", borderRadius: 20 }}>{enviadosCount}/3 enviados</span>
              {obradorLoading && <span style={{ fontSize: 11, background: "rgba(255,255,255,0.12)", color: NOSSA.white, padding: "4px 12px", borderRadius: 20 }}>Cargando...</span>}
            </div>
            {puntosPendientes.length > 0 && (
              <div style={{ marginTop: 10, background: "rgba(217,119,6,0.2)", borderRadius: 10, padding: "8px 12px", fontSize: 12, color: "#FDE68A", fontWeight: "600" }}>
                Sin cierre: {puntosPendientes.join(", ")}
              </div>
            )}
          </div>

          {/* CUERPO */}
          <div style={{ padding: "16px 16px 32px", overflowY: "auto", maxHeight: "70vh" }}>

            {/* CONSOLIDADO GENERAL POR CATEGORIA */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontSize: 11, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1.5, color: NOSSA.aquaDark }}>
                  Consolidado general
                </div>
                {totalGeneralCons > 0 && (
                  <span style={{ fontSize: 12, fontWeight: "bold", color: NOSSA.aquaDark, background: NOSSA.aquaLight, padding: "2px 10px", borderRadius: 20 }}>{totalGeneralCons} und</span>
                )}
              </div>
              <div style={{ fontSize: 11, color: NOSSA.gray, marginBottom: 10 }}>
                Suma de los puntos cerrados para el {fechaDisplay(fechaObrador)}.
              </div>

              {puntosEnConsolidado.length === 0 ? (
                <div style={{ padding: 16, background: NOSSA.warnBg, border: "2px solid #FDE68A", borderRadius: 12, textAlign: "center", color: "#92400E", fontSize: 13 }}>
                  Ningun punto cerro el {fechaDisplay(fechaObrador)} todavia.
                </div>
              ) : consolidadoList.length === 0 ? (
                <div style={{ padding: 16, background: NOSSA.aquaLight, border: "2px solid " + NOSSA.aqua, borderRadius: 12, textAlign: "center", color: NOSSA.aquaDark, fontSize: 13 }}>
                  Los puntos cerrados no registraron pedidos.
                </div>
              ) : (
                <div style={{ background: NOSSA.white, border: "1px solid " + NOSSA.grayLight, borderRadius: 14, overflow: "hidden" }}>
                  {CATS_ORDER.map(function (catId) {
                    var lista = consPorCat[catId];
                    if (!lista || lista.length === 0) return null;
                    var meta = CATS_META[catId];
                    var catTotal = lista.reduce(function (s, it) { return s + it.total; }, 0);
                    return (
                      <div key={catId}>
                        <div style={{ padding: "8px 14px", background: meta ? meta.bg : "#F9F9F9", borderBottom: "1px solid #F0F0F0" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 11, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, color: meta ? meta.color : NOSSA.gray }}>{meta ? meta.icon + " " : ""}{CAT_NOMBRE[catId] || catId}</span>
                            <span style={{ fontSize: 11, fontWeight: "bold", color: meta ? meta.color : NOSSA.gray }}>{catTotal} und</span>
                          </div>
                        </div>
                        <div style={{ padding: "2px 14px 6px" }}>
                          {lista.map(function (it, i) {
                            return (
                              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: i < lista.length - 1 ? "1px solid #F7F7F7" : "none" }}>
                                <span style={{ fontSize: 13, color: NOSSA.charcoal }}>{it.producto}</span>
                                <span style={{ fontSize: 13, fontWeight: "bold", color: NOSSA.aquaDark }}>{it.total}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {/* Categorias fuera de CATS_ORDER */}
                  {Object.keys(consPorCat).filter(function (c) { return CATS_ORDER.indexOf(c) < 0; }).map(function (catId) {
                    var lista = consPorCat[catId];
                    var catTotal = lista.reduce(function (s, it) { return s + it.total; }, 0);
                    return (
                      <div key={catId}>
                        <div style={{ padding: "8px 14px", background: "#F9F9F9", borderBottom: "1px solid #F0F0F0" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 11, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, color: NOSSA.gray }}>{CAT_NOMBRE[catId] || catId}</span>
                            <span style={{ fontSize: 11, fontWeight: "bold", color: NOSSA.gray }}>{catTotal} und</span>
                          </div>
                        </div>
                        <div style={{ padding: "2px 14px 6px" }}>
                          {lista.map(function (it, i) {
                            return (
                              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: i < lista.length - 1 ? "1px solid #F7F7F7" : "none" }}>
                                <span style={{ fontSize: 13, color: NOSSA.charcoal }}>{it.producto}</span>
                                <span style={{ fontSize: 13, fontWeight: "bold", color: NOSSA.aquaDark }}>{it.total}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* DESPACHO POR PUNTO */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1.5, color: NOSSA.charcoal, marginBottom: 8 }}>
                Despacho por punto
              </div>
              {PUNTOS.map(renderDespachoPunto)}
            </div>

            {/* ACCIONES */}
            <button
              style={{ ...S.btn, background: NOSSA.aquaDark, marginTop: 0 }}
              onClick={copiarWhatsApp}
            >Copiar resumen para WhatsApp</button>

            <button
              style={{ ...S.btn, background: NOSSA.charcoal }}
              onClick={function () { cargarObrador(fechaObrador); }}
            >{obradorLoading ? "Cargando..." : "Actualizar desde Sheets"}</button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // PANTALLA: ADMIN
  // ════════════════════════════════════════════════════════
  if (screen === "admin") {
    var adminTabs = [["cierres", "Cierres"], ["minmax", "Min/Max"], ["corregir", "Corregir"]];
    return (
      <div style={S.page}>
        <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
          <div style={{ background: NOSSA.black, padding: "18px 20px 0", color: NOSSA.white }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: "bold", color: NOSSA.white }}>Panel Admin</div>
                <div style={{ fontSize: 11, color: NOSSA.aqua, letterSpacing: 2 }}>nossa.</div>
              </div>
              <button style={S.ghost} onClick={function () { setScreen("inicio"); }}>Salir</button>
            </div>
          </div>
          <div style={{ display: "flex", overflowX: "auto", borderBottom: "2px solid #F0F0F0", background: "#FAFAFA" }}>
            {adminTabs.map(function (pair) {
              return <button key={pair[0]} onClick={function () { setAdminTab(pair[0]); }} style={{ padding: "12px 14px", border: "none", background: "transparent", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", fontFamily: S.font, color: adminTab === pair[0] ? NOSSA.aquaDark : "#9CA3AF", fontWeight: adminTab === pair[0] ? "bold" : "normal", borderBottom: adminTab === pair[0] ? "3px solid " + NOSSA.aquaDark : "3px solid transparent" }}>{pair[1]}</button>;
            })}
          </div>
          <div style={{ padding: "16px 16px 32px", overflowY: "auto", maxHeight: "65vh" }}>
            {adminTab === "cierres" && (
              <div>
                <div style={{ fontWeight: "bold", fontSize: 14, color: "#2D3748", marginBottom: 12 }}>Estado cierres hoy</div>
                {PUNTOS.map(function (p) {
                  var ok = cierresEstado[p];
                  return <div key={p} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: NOSSA.cream, borderRadius: 10, marginBottom: 8, borderLeft: "4px solid " + (ok ? NOSSA.ok : NOSSA.grayLight) }}><span style={{ fontSize: 14, fontWeight: "bold", color: NOSSA.charcoal }}>{p}</span><span style={{ fontSize: 12, fontWeight: "bold", padding: "4px 12px", borderRadius: 20, background: ok ? NOSSA.okBg : NOSSA.warnBg, color: ok ? NOSSA.ok : NOSSA.warn }}>{ok ? "Completo" : "Pendiente"}</span></div>;
                })}
                <button style={{ ...S.btn, background: NOSSA.charcoal, fontSize: 14 }} onClick={recargar}>{cargando ? "Cargando..." : "Actualizar desde Sheets"}</button>
              </div>
            )}
            {adminTab === "minmax" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontWeight: "bold", fontSize: 14, color: "#2D3748" }}>
                    Productos {productosLoading ? <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: "normal" }}>cargando...</span> : null}
                  </div>
                  <button
                    onClick={function () { cargarProductos({ incluirInactivos: mostrarInactivos }); }}
                    style={{ background: "#EDF2F7", border: "none", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontFamily: S.font }}
                  >Actualizar</button>
                </div>

                {/* Selector de punto */}
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  {PUNTOS.map(function (p) {
                    var sel = adminPunto === p;
                    return (
                      <button key={p} onClick={function () { setAdminPunto(p); setEditProd(null); setEditPunto(null); }}
                        style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: "1.5px solid " + (sel ? NOSSA.aquaDark : "#E2E8F0"), background: sel ? NOSSA.aquaDark : "#fff", color: sel ? "#fff" : "#4A5568", fontSize: 12, fontWeight: "bold", cursor: "pointer", fontFamily: S.font }}>
                        {p}
                      </button>
                    );
                  })}
                </div>

                {/* Toggle mostrar inactivos */}
                <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 12, color: "#4A5568", cursor: "pointer" }}>
                  <input type="checkbox" checked={mostrarInactivos} onChange={function (e) { setMostrarInactivos(e.target.checked); }} />
                  Mostrar productos inactivos
                </label>

                {/* Boton: Anadir producto */}
                {!adding ? (
                  <button
                    onClick={function () {
                      setAdding(true);
                      setACat("pasteleria");
                      setAName("");
                      setAPunto("Todos");
                      setAMin("");
                      setAMax("");
                    }}
                    style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1.5px dashed " + NOSSA.aquaDark, background: NOSSA.aquaPale, color: NOSSA.aquaDark, fontSize: 13, fontWeight: "bold", cursor: "pointer", fontFamily: S.font, marginBottom: 14 }}
                  >+ Anadir producto</button>
                ) : (
                  <div style={{ background: NOSSA.aquaPale, border: "2px solid " + NOSSA.aquaDark, borderRadius: 12, padding: 12, marginBottom: 14 }}>
                    <div style={{ fontWeight: "bold", fontSize: 12, color: NOSSA.aquaDark, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Nuevo producto</div>

                    <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>Categoria</div>
                    <select value={aCat} onChange={function (e) { setACat(e.target.value); }}
                      style={{ width: "100%", padding: "8px", borderRadius: 8, border: "1.5px solid #CBD5E0", fontSize: 13, marginBottom: 8, fontFamily: S.font, background: "#fff" }}>
                      {CATS_ORDER.map(function (id) { return <option key={id} value={id}>{CATS_META[id].nombre}</option>; })}
                    </select>

                    <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>Nombre</div>
                    <input type="text" value={aName} onChange={function (e) { setAName(e.target.value); }} placeholder="Ej: Croissant chocolate"
                      style={{ width: "100%", padding: "8px", borderRadius: 8, border: "1.5px solid #CBD5E0", fontSize: 13, marginBottom: 8, fontFamily: S.font, boxSizing: "border-box" }} />

                    <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>Punto</div>
                    <select value={aPunto} onChange={function (e) { setAPunto(e.target.value); }}
                      style={{ width: "100%", padding: "8px", borderRadius: 8, border: "1.5px solid #CBD5E0", fontSize: 13, marginBottom: 8, fontFamily: S.font, background: "#fff" }}>
                      <option value="Todos">Todos los puntos (crea 3 filas)</option>
                      <option value="Centro">Centro</option>
                      <option value="Primavera">Primavera</option>
                      <option value="CF">CF</option>
                    </select>

                    <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>Min</div>
                        <input type="number" min="0" value={aMin} onChange={function (e) { setAMin(e.target.value); }}
                          style={{ width: "100%", padding: "8px", borderRadius: 8, border: "1.5px solid #CBD5E0", fontSize: 13, fontFamily: S.font, boxSizing: "border-box" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>Max</div>
                        <input type="number" min="0" value={aMax} onChange={function (e) { setAMax(e.target.value); }}
                          style={{ width: "100%", padding: "8px", borderRadius: 8, border: "1.5px solid #CBD5E0", fontSize: 13, fontFamily: S.font, boxSizing: "border-box" }} />
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button disabled={savingProd}
                        onClick={async function () {
                          var nombre = aName.trim();
                          var min = parseInt(aMin, 10);
                          var max = parseInt(aMax, 10);
                          if (!nombre)               { alert("El nombre no puede estar vacio."); return; }
                          if (isNaN(min) || min < 0) { alert("Min invalido."); return; }
                          if (isNaN(max) || max < 0) { alert("Max invalido."); return; }
                          if (max < min)             { alert("Max debe ser >= Min."); return; }
                          setSavingProd(true);
                          var r = await apiGuardarProducto(aCat, nombre, aPunto, min, max);
                          setSavingProd(false);
                          if (r && r.success && r.saved) {
                            setAdding(false);
                            await cargarProductos({ incluirInactivos: mostrarInactivos });
                          } else {
                            alert("Error: " + ((r && r.error) || "no se pudo guardar"));
                          }
                        }}
                        style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: NOSSA.aquaDark, color: "#fff", fontSize: 13, fontWeight: "bold", cursor: "pointer", fontFamily: S.font, opacity: savingProd ? 0.6 : 1 }}
                      >{savingProd ? "Guardando..." : "Guardar"}</button>
                      <button onClick={function () { setAdding(false); }}
                        style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1.5px solid #CBD5E0", background: "#fff", color: "#4A5568", fontSize: 13, cursor: "pointer", fontFamily: S.font }}
                      >Cancelar</button>
                    </div>
                  </div>
                )}

                {/* Lista de productos del PUNTO seleccionado, agrupados por categoria */}
                {CATS_ORDER.map(function (catId) {
                  var meta = CATS_META[catId];
                  if (!meta) return null;
                  // soloEn: si la categoria es solo para un punto y estamos viendo otro, ocultarla
                  if (meta.soloEn && meta.soloEn !== adminPunto) return null;
                  var prods = productos.filter(function (p) {
                    if (p.categoria !== catId) return false;
                    if (p.punto !== adminPunto) return false;
                    if (!mostrarInactivos && !p.activo) return false;
                    return true;
                  });
                  if (prods.length === 0) return null;
                  return (
                    <div key={catId} style={{ marginBottom: 16 }}>
                      <div style={{ color: meta.color, fontWeight: "bold", fontSize: 12, margin: "0 0 6px" }}>{meta.nombre} ({prods.length})</div>
                      <div style={{ background: "#FAFAFA", borderRadius: 12, border: "1px solid #F1F5F9", overflow: "hidden" }}>
                        {prods.map(function (prod, i) {
                          var editing = editProd === prod.producto && editPunto === prod.punto;
                          var inactivo = !prod.activo;
                          return (
                            <div key={prod.producto + "_" + prod.punto} style={{ padding: "10px 12px", borderBottom: i < prods.length - 1 ? "1px solid #F1F5F9" : "none", opacity: inactivo ? 0.55 : 1 }}>
                              {!editing ? (
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                                  <div style={{ flex: 1, fontSize: 13, color: "#2D3748" }}>
                                    {prod.producto}
                                    {inactivo && <span style={{ fontSize: 10, marginLeft: 6, padding: "2px 6px", borderRadius: 6, background: "#FEE2E2", color: "#991B1B", fontWeight: "bold" }}>INACTIVO</span>}
                                  </div>
                                  <span style={{ fontSize: 11, color: "#6B7280", background: "#F1F5F9", padding: "3px 8px", borderRadius: 20 }}>{prod.min} - {prod.max}</span>
                                  {inactivo ? (
                                    <button title="Reactivar"
                                      onClick={async function () {
                                        setSavingProd(true);
                                        var r = await apiActualizarProducto(prod.producto, prod.punto, { activo: true });
                                        setSavingProd(false);
                                        if (r && r.success) await cargarProductos({ incluirInactivos: mostrarInactivos });
                                        else alert("Error: " + ((r && r.error) || "no se pudo reactivar"));
                                      }}
                                      style={{ background: "#DCFCE7", border: "none", padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontFamily: S.font, color: "#15803D" }}
                                    >Reactivar</button>
                                  ) : (
                                    <>
                                      <button title="Editar"
                                        onClick={function () { setEditProd(prod.producto); setEditPunto(prod.punto); setEMin(String(prod.min)); setEMax(String(prod.max)); }}
                                        style={{ background: "#EDF2F7", border: "none", padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontFamily: S.font }}
                                      >Editar</button>
                                      <button title="Eliminar"
                                        onClick={async function () {
                                          if (!confirm("Eliminar \"" + prod.producto + "\" en " + prod.punto + "?\n\nQuedara inactivo y dejara de aparecer en cierres y Obrador. No se borra el historial.")) return;
                                          setSavingProd(true);
                                          var r = await apiEliminarProducto(prod.producto, prod.punto);
                                          setSavingProd(false);
                                          if (r && r.success) await cargarProductos({ incluirInactivos: mostrarInactivos });
                                          else alert("Error: " + ((r && r.error) || "no se pudo eliminar"));
                                        }}
                                        style={{ background: "#FEE2E2", border: "none", padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontFamily: S.font, color: "#991B1B" }}
                                      >X</button>
                                    </>
                                  )}
                                </div>
                              ) : (
                                <div>
                                  <div style={{ fontSize: 13, color: "#2D3748", fontWeight: "bold", marginBottom: 6 }}>{prod.producto} ({prod.punto})</div>
                                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                    <span style={{ fontSize: 11, color: "#6B7280" }}>Min</span>
                                    <input type="number" min="0" value={eMin} onChange={function (e) { setEMin(e.target.value); }} style={{ width: 50, padding: "6px", borderRadius: 8, border: "1.5px solid #CBD5E0", fontSize: 14, textAlign: "center" }} />
                                    <span style={{ fontSize: 11, color: "#6B7280" }}>Max</span>
                                    <input type="number" min="0" value={eMax} onChange={function (e) { setEMax(e.target.value); }} style={{ width: 50, padding: "6px", borderRadius: 8, border: "1.5px solid #CBD5E0", fontSize: 14, textAlign: "center" }} />
                                    <button disabled={savingProd}
                                      onClick={async function () {
                                        var min = parseInt(eMin, 10);
                                        var max = parseInt(eMax, 10);
                                        if (isNaN(min) || min < 0) { alert("Min invalido."); return; }
                                        if (isNaN(max) || max < 0) { alert("Max invalido."); return; }
                                        if (max < min) { alert("Max debe ser >= Min."); return; }
                                        setSavingProd(true);
                                        var r = await apiActualizarProducto(prod.producto, prod.punto, { min: min, max: max });
                                        setSavingProd(false);
                                        if (r && r.success) {
                                          setEditProd(null); setEditPunto(null);
                                          await cargarProductos({ incluirInactivos: mostrarInactivos });
                                        } else {
                                          alert("Error: " + ((r && r.error) || "no se pudo actualizar"));
                                        }
                                      }}
                                      style={{ background: NOSSA.ok, color: "#fff", border: "none", padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: "bold", opacity: savingProd ? 0.6 : 1 }}
                                    >Guardar</button>
                                    <button onClick={function () { setEditProd(null); setEditPunto(null); }}
                                      style={{ background: "#E2E8F0", border: "none", padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontFamily: S.font }}
                                    >Cancelar</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <div style={{ marginTop: 12, padding: 10, background: "#F0FFF4", borderRadius: 10, fontSize: 11, color: "#15803D" }}>
                  Cambios persisten en la hoja PRODUCTOS de Google Sheets.
                </div>
              </div>
            )}

            {adminTab === "corregir" && (
              <div>
                <div style={{ fontWeight: "bold", fontSize: 14, color: "#2D3748", marginBottom: 8 }}>Corregir cierres</div>
                <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 12, fontStyle: "italic" }}>
                  Anular un cierre lo deja como "Pendiente" y permite rehacerlo. No borra historial.
                </div>

                {/* Selector fecha */}
                <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>Fecha</div>
                <input
                  type="date"
                  value={corregirFecha}
                  onChange={function (e) { setCorregirFecha(e.target.value); setCorregirCierre(null); setCorregirMsg(""); }}
                  style={{ width: "100%", padding: "8px", borderRadius: 8, border: "1.5px solid #CBD5E0", fontSize: 13, marginBottom: 8, fontFamily: S.font, boxSizing: "border-box" }}
                />

                {/* Selector punto */}
                <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>Punto</div>
                <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                  {PUNTOS.map(function (p) {
                    var sel = corregirPunto === p;
                    return (
                      <button key={p} onClick={function () { setCorregirPunto(p); setCorregirCierre(null); setCorregirMsg(""); }}
                        style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: "1.5px solid " + (sel ? NOSSA.aquaDark : "#E2E8F0"), background: sel ? NOSSA.aquaDark : "#fff", color: sel ? "#fff" : "#4A5568", fontSize: 12, fontWeight: "bold", cursor: "pointer", fontFamily: S.font }}>
                        {p}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={corregirLoading}
                  onClick={buscarCierreParaCorregir}
                  style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", background: NOSSA.charcoal, color: "#fff", fontSize: 13, fontWeight: "bold", cursor: "pointer", fontFamily: S.font, opacity: corregirLoading ? 0.6 : 1, marginBottom: 12 }}
                >{corregirLoading ? "Buscando..." : "Buscar cierre"}</button>

                {/* Mensaje */}
                {corregirMsg && (
                  <div style={{ padding: 10, background: corregirMsgOk ? "#F0FFF4" : "#FEF3C7", border: "1px solid " + (corregirMsgOk ? NOSSA.ok : "#F59E0B"), borderRadius: 10, color: corregirMsgOk ? "#15803D" : "#92400E", fontSize: 12, marginBottom: 12 }}>
                    {corregirMsg}
                  </div>
                )}

                {/* Resumen del cierre */}
                {corregirCierre && corregirCierre.found && (
                  <div style={{ background: "#fff", border: "2px solid " + (corregirCierre.datos && corregirCierre.datos.anulado ? "#FED7AA" : NOSSA.aquaDark), borderRadius: 12, padding: 14, marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: "bold", color: "#2D3748" }}>{corregirCierre.punto} - {fechaDisplay(corregirCierre.fecha)}</div>
                      {corregirCierre.datos && corregirCierre.datos.anulado
                        ? <span style={{ fontSize: 10, fontWeight: "bold", color: "#9A3412", background: "#FED7AA", padding: "3px 10px", borderRadius: 20 }}>ANULADO</span>
                        : <span style={{ fontSize: 10, fontWeight: "bold", color: "#15803D", background: "#DCFCE7", padding: "3px 10px", borderRadius: 20 }}>ACTIVO</span>}
                    </div>
                    {corregirCierre.datos && (
                      <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 8 }}>
                        {(corregirCierre.datos.h || corregirCierre.datos.hora || "—")} - {(corregirCierre.datos.r || corregirCierre.datos.responsable || "—")}
                        {corregirCierre.datos.anulado && corregirCierre.datos.anuladoEn && (
                          <div style={{ fontSize: 10, marginTop: 4, color: "#9A3412" }}>
                            Anulado: {String(corregirCierre.datos.anuladoEn).slice(0, 19).replace("T", " ")}
                          </div>
                        )}
                      </div>
                    )}
                    {/* Resumen de items */}
                    {(function () {
                      var items = normalizarItemsCierre(corregirCierre.datos);
                      if (items.length === 0) return <div style={{ fontSize: 12, color: "#6B7280", fontStyle: "italic" }}>Sin items pendientes en este cierre</div>;
                      return (
                        <div style={{ background: "#FAFAFA", borderRadius: 8, padding: "8px 12px", maxHeight: 200, overflowY: "auto" }}>
                          {items.map(function (it, i) {
                            return (
                              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: i < items.length - 1 ? "1px solid #F0F0F0" : "none" }}>
                                <span style={{ fontSize: 12, color: "#2D3748" }}>{it.nombre}</span>
                                <span style={{ fontSize: 12, fontWeight: "bold", color: NOSSA.aquaDark }}>{it.cantidad} und</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {/* Boton anular - solo si no esta ya anulado */}
                    {!(corregirCierre.datos && corregirCierre.datos.anulado) && (
                      <button
                        disabled={corregirLoading}
                        onClick={anularCierreActual}
                        style={{ width: "100%", marginTop: 12, padding: "11px", borderRadius: 10, border: "none", background: "#DC2626", color: "#fff", fontSize: 13, fontWeight: "bold", cursor: "pointer", fontFamily: S.font, opacity: corregirLoading ? 0.6 : 1 }}
                      >Anular cierre</button>
                    )}
                  </div>
                )}

                <div style={{ marginTop: 8, padding: 10, background: "#FFF7ED", borderRadius: 10, fontSize: 11, color: "#9A3412" }}>
                  Despues de anular, el punto puede volver a hacer el cierre desde la pantalla principal. estadoCierres ignora cierres anulados.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // PANTALLA: LOGIN
  // ════════════════════════════════════════════════════════
  if (screen === "login") {
    return (
      <div style={S.page}>
        <div style={{ ...S.card, maxWidth: 360 }}>
          <div style={{ background: NOSSA.black, padding: "28px 24px", textAlign: "center", color: NOSSA.white }}>
            <div style={{ fontSize: 44, marginBottom: 6 }}>🔒</div>
            <div style={{ fontSize: 20, fontWeight: "bold", color: NOSSA.white }}>Administrador</div>
          </div>
          <div style={S.body}>
            <div style={S.lbl}>Contrasena</div>
            <input style={{ ...S.inp, letterSpacing: 4 }} type="password" placeholder="..." value={adminPass} onChange={function (e) { setAdminPass(e.target.value); }} onKeyDown={function (e) { if (e.key === "Enter") tryLogin(); }} />
            {adminErr && <div style={{ color: "#E53E3E", fontSize: 13, textAlign: "center", margin: "8px 0", fontWeight: "bold" }}>Contrasena incorrecta</div>}
            <button style={S.btn} onClick={tryLogin}>Entrar</button>
            <button style={{ display: "block", textAlign: "center", marginTop: 12, color: "#6B7280", fontSize: 13, cursor: "pointer", background: "none", border: "none" }} onClick={function () { setScreen("inicio"); }}>Volver</button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // PANTALLA: PEDIDO PARA OBRADOR (grid de cantidades)
  // ════════════════════════════════════════════════════════
  if (screen === "categoria") {
    if (!selectedPoint) {
      return (
        <div style={S.page}>
          <div style={S.card}>
            <div style={S.body}>
              <div style={{ color: "#E53E3E", fontSize: 14, fontWeight: "bold", textAlign: "center", padding: 20 }}>Error: no hay punto seleccionado.</div>
              <button style={S.btn} onClick={reiniciar}>Volver al inicio</button>
            </div>
          </div>
        </div>
      );
    }

    function setCant(nombre, val) {
      var n = val === "" ? 0 : Math.max(0, parseInt(val) || 0);
      setCantidades(function (prev) { var u = Object.assign({}, prev); u[nombre] = n; return u; });
    }

    return (
      <div style={S.page}>
        <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ padding: "16px 16px 12px", color: NOSSA.white, background: NOSSA.black }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <button style={S.ghost} onClick={function () { setScreen("inicio"); }}>Atras</button>
              <span style={{ fontSize: 11, background: NOSSA.aquaDark, padding: "3px 10px", borderRadius: 20, color: NOSSA.white }}>{selectedPoint}</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: "bold", textAlign: "center", color: NOSSA.white }}>Pedido para Obrador</div>
            <div style={{ textAlign: "center", fontSize: 11, opacity: 0.75, marginTop: 4 }}>
              {totalConCantidad > 0 ? totalConCantidad + " productos con pedido" : "Escribe las cantidades que necesitas"}
            </div>
          </div>

          {/* Grid de productos por categoria */}
          <div style={{ overflowY: "auto", maxHeight: "58vh" }}>
            {CATS_ORDER.map(function (catId) {
              var meta  = CATS_META[catId];
              if (!meta) return null;
              var prods = catalogoPorCat[catId];
              if (!prods || prods.length === 0) return null;
              return (
                <div key={catId}>
                  {/* Header de categoria */}
                  <div style={{ padding: "8px 16px", background: meta.bg, borderBottom: "1px solid #E5E7EB", borderTop: "1px solid #E5E7EB" }}>
                    <span style={{ fontSize: 12, fontWeight: "bold", color: meta.color, textTransform: "uppercase", letterSpacing: 1 }}>{meta.icon} {meta.nombre}</span>
                    <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 6 }}>({prods.length})</span>
                  </div>
                  {/* Filas de productos */}
                  {prods.map(function (p, i) {
                    var val = cantidades[p.producto] || 0;
                    var hasQty = val > 0;
                    return (
                      <div key={p.producto} style={{ display: "flex", alignItems: "center", padding: "8px 16px", borderBottom: "1px solid #F3F4F6", background: hasQty ? "#FFFBEB" : "#fff" }}>
                        <div style={{ flex: 1, fontSize: 13, color: "#2D3748", fontWeight: hasQty ? "600" : "normal" }}>{p.producto}</div>
                        <input
                          type="number"
                          inputMode="numeric"
                          min="0"
                          value={val === 0 ? "" : String(val)}
                          placeholder="0"
                          onChange={function (e) { setCant(p.producto, e.target.value); }}
                          onFocus={function (e) { e.target.select(); }}
                          style={{
                            width: 56, height: 34, textAlign: "center", borderRadius: 8,
                            border: "2px solid " + (hasQty ? meta.color : "#E2E8F0"),
                            fontSize: 16, fontWeight: "bold", outline: "none",
                            color: hasQty ? meta.color : "#9CA3AF",
                            background: hasQty ? "#fff" : "#FAFAFA",
                            fontFamily: S.font,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Observaciones + Guardar */}
          <div style={{ padding: "12px 16px 16px", borderTop: "2px solid #E5E7EB", background: "#FAFAFA" }}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>Observaciones (opcional)</div>
              <textarea
                placeholder="Ej: mañana hay evento, pedir doble..."
                value={observaciones}
                onChange={function (e) { setObservaciones(e.target.value); }}
                rows={2}
                style={{ width: "100%", padding: "8px", borderRadius: 8, border: "1.5px solid #CBD5E0", fontSize: 12, fontFamily: S.font, boxSizing: "border-box", resize: "vertical" }}
              />
            </div>
            {saving && <div style={{ textAlign: "center", color: "#6B7280", fontSize: 12, marginBottom: 8 }}>Guardando en Sheets...</div>}
            <button
              style={{ ...S.btn, marginTop: 0, opacity: !saving ? 1 : 0.35 }}
              disabled={saving}
              onClick={handleGuardarCierre}
            >
              {saving ? "Guardando..." : "Guardar cierre" + (totalConCantidad > 0 ? " (" + totalConCantidad + ")" : "")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // PANTALLA: RESUMEN — LEE SOLO DE lastSaved
  // ════════════════════════════════════════════════════════
  if (screen === "resumen") {
    var ls        = lastSaved;
    var ptRes     = ls ? ls.punto       : "—";
    var hrRes     = ls ? ls.hora        : "";
    var respRes   = ls ? ls.responsable : "";
    var pedRes    = ls ? ls.pedido      : [];
    var msgRes    = ls ? ls.mensaje     : "";
    var confirmado = ls ? !!cierresEstado[ls.punto] : false;

    return (
      <div style={S.page}>
        <div style={S.card}>
          <div style={{ background: NOSSA.black, padding: "32px 24px 20px", textAlign: "center", color: NOSSA.white }}>
            <div style={{ fontSize: 48 }}>{confirmado ? "✓" : "!"}</div>
            <div style={{ fontSize: 22, fontWeight: "bold", color: NOSSA.white }}>{pedRes.length === 0 ? "Cierre sin pedidos" : pedRes.length + " productos pedidos"}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{ptRes} - {hrRes} - {respRes || "--"}</div>
            {confirmado
              ? <div style={{ color: NOSSA.aqua, fontSize: 12, marginTop: 8 }}>Confirmado en Google Sheets</div>
              : <div style={{ color: "#FCA5A5", fontSize: 12, marginTop: 8 }}>Enviado — verificando en Sheets</div>}
          </div>
          <div style={S.body}>
            {pedRes.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                {pedRes.map(function (item, i) {
                  return (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #F0F0F0", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: 13, color: "#2D3748" }}>{item.producto}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: "bold", color: NOSSA.aquaDark }}>{item.cantidad} und</span>
                    </div>
                  );
                })}
              </div>
            )}
            {pedRes.length === 0 && <div style={{ padding: 14, background: NOSSA.aquaLight, borderRadius: 12, textAlign: "center", color: NOSSA.aquaDark, fontSize: 14, marginBottom: 16 }}>Cierre registrado sin pedidos</div>}
            <div style={{ padding: 14, background: NOSSA.aquaLight, borderRadius: 14, border: "2px solid " + NOSSA.aqua, marginBottom: 16 }}>
              <div style={{ fontWeight: "bold", fontSize: 13, color: NOSSA.aquaDark, marginBottom: 8 }}>Mensaje para WhatsApp</div>
              <textarea style={{ width: "100%", borderRadius: 8, border: "1px solid " + NOSSA.aqua, padding: 10, fontSize: 11, background: NOSSA.white, resize: "none", fontFamily: "monospace", boxSizing: "border-box", lineHeight: 1.6 }} readOnly value={msgRes} rows={Math.min(14, msgRes.split("\n").length + 2)} />
              <button style={{ width: "100%", padding: 11, borderRadius: 10, border: "none", background: NOSSA.aquaDark, color: NOSSA.white, fontSize: 13, fontWeight: "bold", cursor: "pointer", marginTop: 8 }} onClick={function () { if (navigator.clipboard) navigator.clipboard.writeText(msgRes); alert("Copiado!"); }}>Copiar mensaje</button>
            </div>
            <button style={{ ...S.btn, background: NOSSA.charcoal }} onClick={reiniciar}>Nuevo cierre</button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // PANTALLA: INICIO
  // ════════════════════════════════════════════════════════
  var puntoCerrado = selectedPoint ? !!cierresEstado[selectedPoint] : false;

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.hero}>
          <div style={{ fontSize: 28, fontWeight: "bold", letterSpacing: 3, color: NOSSA.aqua, marginBottom: 4 }}>nossa.</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4, letterSpacing: 1 }}>Cierre de turno</div>
        </div>
        <div style={S.body}>

          <button style={{ ...S.btn, marginTop: 8, background: NOSSA.aquaDark }} onClick={function () { recargar(); setScreen("obrador"); }}>
            Entrar como Obrador
          </button>

          <div style={S.lbl}>
            Estado de cierres hoy
            {cargando && <span style={{ color: "#9CA3AF", fontWeight: "normal", marginLeft: 6 }}>actualizando...</span>}
          </div>
          <div style={{ borderRadius: 12, border: "1px solid #E5E7EB", overflow: "hidden", marginBottom: 4 }}>
            {PUNTOS.map(function (p, i) {
              var ok = cierresEstado[p];
              return (
                <div key={p} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", borderBottom: i < 2 ? "1px solid #F3F4F6" : "none", background: ok ? NOSSA.aquaPale : "#FAFAFA" }}>
                  <span style={{ fontSize: 13, fontWeight: "600", color: NOSSA.charcoal }}>{p}</span>
                  <span style={{ fontSize: 11, fontWeight: "bold", color: ok ? NOSSA.ok : NOSSA.warn, background: ok ? NOSSA.okBg : NOSSA.warnBg, padding: "3px 10px", borderRadius: 20 }}>{ok ? "Completo" : "Pendiente"}</span>
                </div>
              );
            })}
          </div>

          <div style={S.lbl}>Desde que punto?</div>
          <div style={{ display: "flex", gap: 8 }}>
            {PUNTOS.map(function (p) {
              var cerrado = cierresEstado[p];
              var activo  = selectedPoint === p;
              return (
                <button
                  key={p}
                  onClick={function () { setSelectedPoint(p); }}
                  style={{
                    flex: 1, padding: "12px 6px", borderRadius: 12,
                    border: "2px solid " + (activo ? NOSSA.aquaDark : cerrado ? NOSSA.ok : NOSSA.grayLight),
                    background: activo ? NOSSA.aquaDark : NOSSA.white,
                    cursor: "pointer", fontSize: 13, fontWeight: "bold",
                    color: activo ? NOSSA.white : NOSSA.charcoal,
                    position: "relative",
                    boxShadow: activo ? "0 2px 8px rgba(107,184,176,0.4)" : "none",
                    fontFamily: S.font,
                  }}
                >
                  {p}
                  {cerrado && (
                    <span style={{ position: "absolute", top: -6, right: -6, background: NOSSA.ok, color: NOSSA.white, borderRadius: "50%", width: 16, height: 16, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>v</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Punto ya cerrado hoy */}
          {puntoCerrado ? (
            <div style={{ background: NOSSA.warnBg, border: "2px solid #F97316", borderRadius: 14, padding: "14px", margin: "12px 0" }}>
              <div style={{ fontWeight: "bold", fontSize: 14, color: "#92400E", marginBottom: 4 }}>Este punto ya realizo el cierre hoy</div>
              <div style={{ fontSize: 12, color: NOSSA.gray }}>Registrado en Google Sheets. No se permiten duplicados.</div>
            </div>
          ) : (
            <div>
              <div style={S.lbl}>Quien cierra?</div>
              <input
                style={S.inp}
                placeholder="Tu nombre (opcional)"
                value={responsable}
                onChange={function (e) { setResponsable(e.target.value); }}
              />
              <div style={{ fontSize: 13, color: "#6B7280", margin: "10px 0", fontStyle: "italic" }}>Hora: {hora}</div>

              {/* Boton INICIAR — disabled SOLO si selectedPoint es null */}
              <button
                style={{ ...S.btn, opacity: selectedPoint ? 1 : 0.35, cursor: selectedPoint ? "pointer" : "not-allowed" }}
                disabled={!selectedPoint}
                onClick={function () {
                  if (!selectedPoint) { alert("Selecciona Centro, Primavera o CF primero."); return; }
                  setHora(horaActual());
                  setCantidades({});
                  setObservaciones("");
                  setScreen("categoria");
                }}
              >
                Iniciar pedido
              </button>
            </div>
          )}

          <button style={S.link} onClick={function () { setScreen("login"); }}>Acceso administrador</button>
        </div>
      </div>
    </div>
  );
}
