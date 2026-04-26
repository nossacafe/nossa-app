import { useState, useEffect, useRef, useCallback } from "react";

const DEFAULT_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyxs7uys-3iaRXEzYTBJLJRX2KIdjiixphwqSxUDvlyJykmrZOL2hNXGqq_I7KLUvCb0Q/exec";

const ADMIN_PASSWORD = "nossa2024";
const PUNTOS = ["Centro", "Primavera", "CF"];

const CATS = [
  {
    id: "pasteleria", nombre: "Pasteleria", icon: "🥐",
    color: "#7C5C3B", bg: "#FFF8F0", obligatoria: true, soloEn: null,
    productos: [
      { nombre: "Pastel pollo", min: 12, max: 18 },
      { nombre: "Almojavanas", min: 2, max: 5 },
      { nombre: "Galleta avena", min: 3, max: 6 },
      { nombre: "Galleta macadamia", min: 3, max: 6 },
      { nombre: "Galleta chocolate", min: 2, max: 4 },
      { nombre: "Empanada carne", min: 6, max: 18 },
      { nombre: "Empanada pollo", min: 6, max: 18 },
      { nombre: "Croissant mantequilla", min: 2, max: 6 },
      { nombre: "Croissant almendra", min: 2, max: 6 },
      { nombre: "Eclair maracuya", min: 5, max: 10 },
      { nombre: "Torta zanahoria", min: 6, max: 10 },
      { nombre: "Torta chocolate", min: 6, max: 10 },
      { nombre: "Torta naranja", min: 2, max: 6 },
      { nombre: "Torta almojavana", min: 2, max: 6 },
      { nombre: "Tarta cafe", min: 4, max: 8 },
      { nombre: "Tarta arandanos", min: 6, max: 12 },
      { nombre: "Cheesecake lulo", min: 3, max: 7 },
      { nombre: "Cheesecake guayaba", min: 2, max: 5 },
      { nombre: "Mangos", min: 4, max: 8 },
      { nombre: "Tres leches", min: 3, max: 6 },
      { nombre: "Milhojas arequipe", min: 5, max: 8 },
      { nombre: "Milhojas limon", min: 5, max: 8 },
      { nombre: "Cocos", min: 3, max: 6 },
      { nombre: "Fresas und", min: 3, max: 8 },
      { nombre: "Osos", min: 8, max: 12 },
    ],
  },
  {
    id: "cafeteria", nombre: "Cafeteria", icon: "C",
    color: "#6B4226", bg: "#FDF6F0", obligatoria: false, soloEn: null,
    productos: [
      { nombre: "Crema whisky", min: 1, max: 1 },
      { nombre: "Hierbabuena", min: 1, max: 1 },
      { nombre: "Tarro aro fresa", min: 1, max: 1 },
      { nombre: "Tarro aro papaya", min: 1, max: 1 },
      { nombre: "Tarro aro mora", min: 1, max: 1 },
      { nombre: "Leche almendra cajax6", min: 2, max: 6 },
      { nombre: "Varietales", min: 2, max: 6 },
    ],
  },
  {
    id: "limpieza", nombre: "Limpieza", icon: "L",
    color: "#2E7D6B", bg: "#F0FAF7", obligatoria: false, soloEn: null,
    productos: [
      { nombre: "Toallas manos paq", min: 2, max: 6 },
      { nombre: "Jabon loza", min: 1, max: 2 },
      { nombre: "Jabon lavavajillas", min: 1, max: 2 },
      { nombre: "Jabon de manos", min: 2, max: 6 },
      { nombre: "Esponjas", min: 1, max: 3 },
      { nombre: "Alcohol", min: 1, max: 1 },
      { nombre: "Cloro", min: 2, max: 6 },
      { nombre: "Limpiones", min: 2, max: 6 },
    ],
  },
  {
    id: "empaques", nombre: "Empaques", icon: "E",
    color: "#5C4DB1", bg: "#F5F3FF", obligatoria: false, soloEn: null,
    productos: [
      { nombre: "Bolsa manija grande", min: 15, max: 30 },
      { nombre: "Bolsa manija mediana", min: 15, max: 30 },
      { nombre: "Bolsa parafinada grande", min: 2, max: 4 },
      { nombre: "Bolsa parafinada pequena", min: 2, max: 4 },
      { nombre: "Servilletas", min: 1, max: 2 },
    ],
  },
  {
    id: "materias", nombre: "Materias Primas", icon: "M",
    color: "#3A7D44", bg: "#F1FAF2", obligatoria: false, soloEn: null,
    productos: [
      { nombre: "Te matcha", min: 1, max: 1 },
      { nombre: "Beach party te", min: 2, max: 6 },
      { nombre: "Chocolate mezcla", min: 1, max: 1 },
      { nombre: "Amaretto", min: 1, max: 2 },
      { nombre: "Pulpa de mango", min: 3, max: 6 },
      { nombre: "Guanabana pulpa", min: 2, max: 6 },
      { nombre: "Mora pulpa", min: 2, max: 6 },
      { nombre: "Fresa pulpa", min: 2, max: 6 },
      { nombre: "Huevos und", min: 2, max: 4 },
      { nombre: "Limones und", min: 3, max: 5 },
      { nombre: "Avena en polvo", min: 1, max: 1 },
    ],
  },
  {
    id: "cf_extra", nombre: "Exclusivo CF", icon: "*",
    color: "#C2185B", bg: "#FFF0F5", obligatoria: false, soloEn: "CF",
    productos: [
      { nombre: "Muffin arandano frambuesa", min: 2, max: 6 },
      { nombre: "Gansito", min: 2, max: 6 },
    ],
  },
];

// ─── LOOKUPS DERIVADOS ────────────────────────────────────────────────────────
// Categorias que son PRODUCCION para Obrador (lo que hornea, no compra)
const CATS_PRODUCCION = ["pasteleria", "cf_extra"];

// Map nombre de producto -> id de categoria. Permite reconstruir la categoria
// en cliente sin enviarla en cada item del pedido (URL mas corta).
const PRODUCTO_A_CAT = (function () {
  var m = {};
  CATS.forEach(function (c) {
    c.productos.forEach(function (p) { m[p.nombre] = c.id; });
  });
  return m;
})();

// Map id de categoria -> nombre legible (para mostrar agrupado en Obrador)
const CAT_NOMBRE = (function () {
  var m = {};
  CATS.forEach(function (c) { m[c.id] = c.nombre; });
  return m;
})();

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

// ─── ESTILOS ─────────────────────────────────────────────────────────────────
var S = {
  page:  { minHeight: "100vh", background: "#F2EDE8", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: 12, fontFamily: "Georgia, serif" },
  card:  { width: "100%", maxWidth: 480, background: "#fff", borderRadius: 20, boxShadow: "0 6px 40px rgba(0,0,0,0.12)", overflow: "hidden" },
  hero:  { background: "linear-gradient(160deg,#3D2B1F,#7C5C3B)", padding: "32px 24px 24px", textAlign: "center", color: "#fff" },
  body:  { padding: "8px 20px 28px" },
  lbl:   { fontSize: 11, color: "#6B7280", fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, margin: "16px 0 8px" },
  inp:   { width: "100%", padding: "13px 14px", borderRadius: 12, border: "2px solid #E5D8CC", fontSize: 15, outline: "none", fontFamily: "Georgia, serif", background: "#FFFAF7", boxSizing: "border-box" },
  btn:   { display: "block", width: "100%", padding: "16px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#C8873A,#7C5C3B)", color: "#fff", fontSize: 16, fontWeight: "bold", cursor: "pointer", fontFamily: "Georgia, serif", marginTop: 14 },
  ghost: { background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", padding: "7px 13px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontFamily: "Georgia, serif" },
  link:  { display: "block", width: "100%", marginTop: 12, padding: "10px", background: "transparent", border: "none", color: "#9CA3AF", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif", textDecoration: "underline" },
};

// ─── PRODUCT ROW ──────────────────────────────────────────────────────────────
function ProductRow({ prod, stocks, setStocks, idx, allProds, inputRefs, freshInput }) {
  var sVal    = stocks[prod.nombre];
  var display = sVal !== undefined ? String(sVal) : "";
  var filled  = sVal !== undefined;
  var pedir   = !filled ? null : sVal > prod.max ? "OVER" : sVal <= prod.min ? Math.max(0, prod.max - sVal) : 0;
  var isOver  = pedir === "OVER";
  var isAlert = filled && !isOver && typeof pedir === "number" && pedir > 0;
  var isOk    = filled && !isOver && pedir === 0;
  var bc = isOver ? "#DD6B20" : isAlert ? "#E53E3E" : isOk ? "#38A169" : "#E2E8F0";
  var tc = isOver ? "#DD6B20" : isAlert ? "#E53E3E" : isOk ? "#38A169" : "#2D3748";

  var incr = useCallback(function () {
    setStocks(function (p) { var r = Object.assign({}, p); r[prod.nombre] = Math.max(0, (p[prod.nombre] !== undefined ? p[prod.nombre] : 0) + 1); return r; });
  }, [prod.nombre]);

  var decr = useCallback(function () {
    setStocks(function (p) { var r = Object.assign({}, p); r[prod.nombre] = Math.max(0, (p[prod.nombre] !== undefined ? p[prod.nombre] : 0) - 1); return r; });
  }, [prod.nombre]);

  function commit(raw) {
    if (raw === "" || raw === "-") return;
    var n = Math.max(0, parseInt(raw) || 0);
    setStocks(function (p) { var r = Object.assign({}, p); r[prod.nombre] = n; return r; });
  }

  function onChange(e) {
    var raw = e.target.value;
    if (freshInput.current[prod.nombre]) { freshInput.current[prod.nombre] = false; raw = raw.replace(/^0+/, "") || "0"; }
    commit(raw);
  }
  function onFocus(e)  { e.target.select(); freshInput.current[prod.nombre] = true; }
  function onBlur(e)   { freshInput.current[prod.nombre] = false; commit(e.target.value); }
  function onKeyDown(e) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    freshInput.current[prod.nombre] = false;
    var nxt = allProds[idx + 1];
    if (nxt && inputRefs.current[nxt.nombre]) inputRefs.current[nxt.nombre].focus();
    else e.target.blur();
  }

  return (
    <div style={{ padding: "10px 14px", borderBottom: "1px solid #F0F0F0", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, background: isOver ? "#FFFAF0" : isAlert ? "#FFF5F5" : isOk ? "#F0FFF4" : "#FAFAFA", borderLeft: "4px solid " + bc }}>
      <div style={{ flex: 1, minWidth: 100 }}>
        <div style={{ fontSize: 13, fontWeight: "bold", color: "#2D3748" }}>{prod.nombre}</div>
        <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 1 }}>Min {prod.min} Max {prod.max}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <button style={{ width: 36, height: 36, borderRadius: 8, border: "2px solid #E2E8F0", background: "#F7FAFC", cursor: "pointer", fontSize: 18, fontWeight: "bold", color: "#4A5568" }} onClick={decr}>-</button>
        <input
          ref={function (el) { inputRefs.current[prod.nombre] = el; }}
          className="prod-input"
          style={{ width: 54, height: 36, textAlign: "center", borderRadius: 8, border: "2px solid " + bc, fontSize: 18, fontWeight: "bold", outline: "none", color: tc }}
          type="number" inputMode="numeric" min="0" placeholder="?"
          value={display}
          onChange={onChange} onFocus={onFocus} onBlur={onBlur} onKeyDown={onKeyDown}
          enterKeyHint="next"
        />
        <button style={{ width: 36, height: 36, borderRadius: 8, border: "2px solid #E2E8F0", background: "#F7FAFC", cursor: "pointer", fontSize: 18, fontWeight: "bold", color: "#4A5568" }} onClick={incr}>+</button>
      </div>
      <div style={{ width: "100%", fontSize: 11, fontWeight: "bold", paddingLeft: 2 }}>
        {isOver  && <span style={{ color: "#DD6B20" }}>Sobre maximo ({prod.max})</span>}
        {isAlert && <span style={{ color: "#E53E3E" }}>Pedir {pedir} und</span>}
        {isOk    && <span style={{ color: "#38A169" }}>OK</span>}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function NossaCafe() {
  var [screen, setScreen]               = useState("inicio");
  var [selectedPoint, setSelectedPoint] = useState(null);   // NUNCA se vuelve null durante el flujo
  var [responsable, setResponsable]     = useState("");
  var [hora, setHora]                   = useState(horaActual);
  var [catIdx, setCatIdx]               = useState(0);
  var [skipped, setSkipped]             = useState({});
  var [stocks, setStocks]               = useState({});
  var [minMax, setMinMax]               = useState({});
  var [cierresEstado, setCierresEstado] = useState({ Centro: false, Primavera: false, CF: false });
  var [cargando, setCargando]           = useState(false);
  var [saving, setSaving]               = useState(false);
  var [lastSaved, setLastSaved]         = useState(null);   // snapshot inmutable para resumen
  var [adminPass, setAdminPass]         = useState("");
  var [adminErr, setAdminErr]           = useState(false);
  var [adminTab, setAdminTab]           = useState("cierres");
  var [editMM, setEditMM]               = useState(null);
  var [eMin, setEMin]                   = useState("");
  var [eMax, setEMax]                   = useState("");
  var [despacho, setDespacho]           = useState(function () { return lsGet("nossa_despacho_v2") || {}; });

  // ── Obrador (separado del flujo de tienda) ─────────────────────────────────
  var [fechaObrador, setFechaObrador]   = useState(fechaAyer);
  var [obradorData,  setObradorData]    = useState({ Centro: null, Primavera: null, CF: null });
  var [obradorLoading, setObradorLoading] = useState(false);

  var inputRefs  = useRef({});
  var freshInput = useRef({});

  // ── Boot ────────────────────────────────────────────────────────────────────
  useEffect(function () {
    setHora(horaActual());
    setMinMax(lsGet("nossa_minmax") || {});
    recargar();
  }, []);

  useEffect(function () {
    if (screen !== "categoria") return;
    var t = setTimeout(function () { var f = document.querySelector(".prod-input"); if (f) f.focus(); }, 150);
    return function () { clearTimeout(t); };
  }, [catIdx, screen]);

  // ── Estado cierres desde Sheets ─────────────────────────────────────────────
  async function recargar() {
    setCargando(true);
    try {
      var e = await apiEstadoCierres();
      setCierresEstado(e);
    } catch (err) { console.error(err); }
    setCargando(false);
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

  // ── Min/Max ─────────────────────────────────────────────────────────────────
  function getMM(n, d) { return (minMax && minMax[n]) ? minMax[n] : { min: d.min, max: d.max }; }
  function saveMinMax(u) { lsSet("nossa_minmax", u); setMinMax(u); }

  // ── Categorías ──────────────────────────────────────────────────────────────
  function buildCats(pt) {
    return CATS
      .filter(function (c) { return !c.soloEn || c.soloEn === pt; })
      .map(function (c) {
        return Object.assign({}, c, {
          productos: c.productos.map(function (p) {
            var mm = getMM(p.nombre, p);
            return { nombre: p.nombre, min: mm.min, max: mm.max };
          }),
        });
      });
  }

  var categorias = buildCats(selectedPoint);
  var cat = categorias[catIdx] || categorias[0] || { id: "", icon: "", nombre: "", color: "#7C5C3B", bg: "#FFF8F0", obligatoria: true, productos: [] };

  function getPedir(prod) {
    var s = stocks[prod.nombre];
    if (s === undefined) return null;
    if (s > prod.max) return "OVER";
    return s <= prod.min ? Math.max(0, prod.max - s) : 0;
  }

  function catCompleta(c) {
    return skipped[c.id] || c.productos.every(function (p) { return stocks[p.nombre] !== undefined; });
  }

  // ── GUARDAR CIERRE ───────────────────────────────────────────────────────────
  async function handleGuardarCierre() {
    console.log("CLICK GUARDAR CIERRE");

    // 1. Snapshot inmediato de todo antes de cualquier setState
    var pt        = selectedPoint;
    var hr        = hora;
    var resp      = responsable;
    var stocksNow = Object.assign({}, stocks);
    var skipNow   = Object.assign({}, skipped);
    var catsNow   = buildCats(pt);
    var fecha     = fechaHoy();

    // 2. Validar punto
    if (!pt) {
      console.error("handleGuardarCierre: selectedPoint es null");
      alert("Error: no hay punto seleccionado. Vuelve al inicio y selecciona Centro, Primavera o CF.");
      return;
    }
    console.log("Punto validado:", pt);

    // 3. Construir pedido
    var pedido = catsNow
      .filter(function (c) { return !skipNow[c.id]; })
      .flatMap(function (c) {
        return c.productos
          .filter(function (p) { var s = stocksNow[p.nombre]; return s !== undefined && s <= p.min; })
          .map(function (p) { return { cat: c.nombre, prod: p.nombre, cantidad: Math.max(0, p.max - (stocksNow[p.nombre] || 0)) }; });
      });

    // 4. Construir URL — DATOS OPERATIVOS COMPACTOS
    //    - h: hora           (string corta)
    //    - r: responsable    (string)
    //    - p: pedido         (array de pares [nombre, cantidad] — items con stock <= min)
    //    - o: observaciones  (vacio en iter1; UI vendra en iter2)
    //
    //    La categoria NO se envia: se reconstruye en cliente con PRODUCTO_A_CAT.
    //    NO se envian stocks completos ni productos con stock OK.
    //    Esto deja la URL en orden de magnitud ~1000 chars con 20 items pendientes.
    var pedidoCompacto = [];
    catsNow.filter(function (c) { return !skipNow[c.id]; }).forEach(function (c) {
      c.productos.forEach(function (p) {
        var s = stocksNow[p.nombre];
        if (s !== undefined && s <= p.min) {
          pedidoCompacto.push([p.nombre, Math.max(0, p.max - s)]);
        }
      });
    });

    var datosOperativos = {
      h: hr,
      r: resp || "",
      p: pedidoCompacto,
      o: ""
    };

    var finalUrl = DEFAULT_APPS_SCRIPT_URL
      + "?action=guardarCierre"
      + "&fecha="  + encodeURIComponent(fecha)
      + "&punto="  + encodeURIComponent(pt)
      + "&datos="  + encodeURIComponent(JSON.stringify(datosOperativos));

    console.log("URL FINAL GUARDAR:", finalUrl);
    console.log("URL length:", finalUrl.length);
    console.log("Pedido compacto items:", pedidoCompacto.length);
    if (finalUrl.length > 1800) {
      console.warn("URL larga (" + finalUrl.length + " chars). Apps Script puede rechazarla. Items pendientes:", pedidoCompacto.length);
    }

    setSaving(true);
    try {
      // 5. Disparar GET sin CORS via Image()
      await dispararGetSinCors(finalUrl);
      console.log("dispararGetSinCors completado");

      // 6. Esperar 1500ms para que Sheets procese
      await new Promise(function (r) { setTimeout(r, 1500); });

      // 7. Recargar estado desde Sheets
      var estadoNuevo = await apiEstadoCierres();
      console.log("Estado tras guardar:", estadoNuevo);

      // 7b. Si el punto no salió true, reintento UNA vez tras 1500ms más
      if (!estadoNuevo[pt]) {
        console.warn("Punto " + pt + " aún no marcado como true. Reintentando estadoCierres...");
        await new Promise(function (r) { setTimeout(r, 1500); });
        estadoNuevo = await apiEstadoCierres();
        console.log("Estado tras reintento:", estadoNuevo);
      }

      setCierresEstado(estadoNuevo);

      if (estadoNuevo[pt]) {
        console.log("✓ Cierre confirmado en Sheets para " + pt);
      } else {
        console.warn("⚠ Cierre NO confirmado en Sheets para " + pt + ". Pasando a resumen igual.");
      }

      // 8. Construir mensaje WhatsApp desde snapshot
      var fechaDisplay = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
      var msg = "CIERRE - " + pt + "\n" + fechaDisplay + "  " + hr + "  " + (resp || "--") + "\n\n";
      if (!pedido.length) {
        msg += "Sin pedidos pendientes.";
      } else {
        msg += "PEDIR:\n\n";
        catsNow.filter(function (c) { return !skipNow[c.id]; }).forEach(function (c) {
          var items = c.productos.filter(function (p) { var s = stocksNow[p.nombre]; return s !== undefined && s <= p.min; });
          if (!items.length) return;
          msg += c.nombre + ":\n";
          items.forEach(function (p) { msg += "  - " + p.nombre + ": " + Math.max(0, p.max - (stocksNow[p.nombre] || 0)) + " und\n"; });
          msg += "\n";
        });
      }

      // 9. Guardar snapshot inmutable para resumen
      setLastSaved({ punto: pt, hora: hr, responsable: resp, pedido: pedido, mensaje: msg });

      // 10. Ir a resumen
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
    setCatIdx(0);
    setSkipped({});
    setStocks({});
    setLastSaved(null);
    freshInput.current = {};
    inputRefs.current  = {};
    recargar();
    setScreen("inicio");
  }

  function tryLogin() {
    if (adminPass === ADMIN_PASSWORD) { setScreen("admin"); setAdminErr(false); setAdminPass(""); }
    else { setAdminErr(true); setTimeout(function () { setAdminErr(false); }, 2000); }
  }

  // ════════════════════════════════════════════════════════
  // PANTALLA: OBRADOR — lee cierres reales desde Sheets por fecha
  // ════════════════════════════════════════════════════════
  if (screen === "obrador") {
    var enviadosCount = PUNTOS.filter(function (p) { return despachoMarcado(fechaObrador, p); }).length;

    function renderTarjetaPunto(p) {
      var d        = obradorData[p];
      var sent     = despachoMarcado(fechaObrador, p);
      var datos    = d && d.found ? d.datos : null;

      // Caso 1: aun cargando o sin datos para esta fecha
      if (!d || !d.found || !datos) {
        return (
          <div key={p} style={{ borderRadius: 12, border: "2px dashed #E2E8F0", background: "#FAFAFA", padding: "14px", marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 15, fontWeight: "bold", color: "#2D3748" }}>{p}</div>
              <span style={{ fontSize: 11, fontWeight: "bold", color: "#92400E", background: "#FEF3C7", padding: "3px 10px", borderRadius: 20 }}>Sin datos</span>
            </div>
            <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 10 }}>No hay cierre registrado para {fechaDisplay(fechaObrador)}.</div>
            <button
              onClick={function () { cargarUltimoPunto(p); }}
              style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1.5px solid #7C5C3B", background: "#fff", color: "#7C5C3B", fontSize: 12, fontWeight: "bold", cursor: "pointer", fontFamily: "Georgia, serif" }}
            >
              Ver ultimo cierre disponible
            </button>
          </div>
        );
      }

      // Caso 2: tiene datos. Separar items en produccion vs pedidos.
      var items = Array.isArray(datos.p) ? datos.p : [];
      var produccion = items.filter(function (it) { return CATS_PRODUCCION.indexOf(PRODUCTO_A_CAT[it[0]]) >= 0; });
      var pedidos    = items.filter(function (it) { return CATS_PRODUCCION.indexOf(PRODUCTO_A_CAT[it[0]]) <  0; });

      // Agrupar pedidos por categoria para mostrar bonito
      var pedidosPorCat = {};
      pedidos.forEach(function (it) {
        var cat = PRODUCTO_A_CAT[it[0]] || "otros";
        if (!pedidosPorCat[cat]) pedidosPorCat[cat] = [];
        pedidosPorCat[cat].push(it);
      });

      var hora = datos.h || "—";
      var resp = datos.r || "—";
      var obs  = datos.o || "";
      var fechaCierreReal = d.fecha;
      var muestraOtraFecha = d.esUltimo && fechaCierreReal && fechaCierreReal !== fechaObrador;

      return (
        <div key={p} style={{ borderRadius: 12, border: "2px solid " + (sent ? "#38A169" : "#E2E8F0"), background: "#fff", marginBottom: 10, opacity: sent ? 0.92 : 1 }}>
          {/* Header del punto */}
          <div style={{ padding: "12px 14px", borderBottom: "1px solid #F0F0F0", background: muestraOtraFecha ? "#FFF7ED" : (sent ? "#F0FFF4" : "#FAFAFA") }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 16, fontWeight: "bold", color: "#2D3748" }}>{p}</div>
              <span style={{ fontSize: 10, fontWeight: "bold", color: "#15803D", background: "#DCFCE7", padding: "3px 10px", borderRadius: 20 }}>Cerrado</span>
            </div>
            <div style={{ fontSize: 11, color: "#6B7280", marginTop: 3 }}>
              {fechaDisplay(fechaCierreReal)} - {hora} - {resp}
            </div>
            {muestraOtraFecha && (
              <div style={{ marginTop: 6, fontSize: 10, fontWeight: "bold", color: "#9A3412", background: "#FED7AA", padding: "3px 8px", borderRadius: 6, display: "inline-block" }}>
                ULTIMO CIERRE DISPONIBLE (no hay datos para {fechaDisplay(fechaObrador)})
              </div>
            )}
          </div>

          {/* Produccion */}
          <div style={{ padding: "10px 14px" }}>
            <div style={{ fontSize: 11, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, color: "#7C5C3B", marginBottom: 6 }}>
              Produccion ({produccion.length})
            </div>
            {produccion.length === 0
              ? <div style={{ fontSize: 12, color: "#6B7280", fontStyle: "italic", padding: "4px 0 8px" }}>Sin produccion pendiente</div>
              : (
                <div style={{ marginBottom: 8 }}>
                  {produccion.map(function (it, i) {
                    return (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: i < produccion.length - 1 ? "1px solid #F5F5F5" : "none" }}>
                        <span style={{ fontSize: 13, color: "#2D3748" }}>{it[0]}</span>
                        <span style={{ fontSize: 13, fontWeight: "bold", color: "#7C5C3B" }}>{it[1]} und</span>
                      </div>
                    );
                  })}
                </div>
              )
            }
          </div>

          {/* Pedidos agrupados */}
          <div style={{ padding: "0 14px 10px", borderTop: "1px solid #F0F0F0" }}>
            <div style={{ fontSize: 11, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, color: "#5C4DB1", margin: "10px 0 6px" }}>
              Pedidos ({pedidos.length})
            </div>
            {pedidos.length === 0
              ? <div style={{ fontSize: 12, color: "#6B7280", fontStyle: "italic", padding: "4px 0 8px" }}>Sin pedidos pendientes</div>
              : (
                <div>
                  {Object.keys(pedidosPorCat).map(function (catId) {
                    var lista = pedidosPorCat[catId];
                    return (
                      <div key={catId} style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: "bold", color: "#9CA3AF", marginBottom: 3 }}>{CAT_NOMBRE[catId] || catId}</div>
                        {lista.map(function (it, i) {
                          return (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                              <span style={{ fontSize: 12, color: "#2D3748" }}>{it[0]}</span>
                              <span style={{ fontSize: 12, fontWeight: "bold", color: "#5C4DB1" }}>{it[1]} und</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )
            }
          </div>

          {/* Observaciones (si hay) */}
          {obs && (
            <div style={{ padding: "8px 14px", borderTop: "1px solid #F0F0F0", background: "#FFFBEB" }}>
              <div style={{ fontSize: 10, fontWeight: "bold", color: "#92400E", textTransform: "uppercase", letterSpacing: 1 }}>Observaciones</div>
              <div style={{ fontSize: 12, color: "#78350F", marginTop: 3 }}>{obs}</div>
            </div>
          )}

          {/* Marcar enviado */}
          <div style={{ padding: "10px 14px", borderTop: "1px solid #F0F0F0", background: "#FAFAFA" }}>
            <button
              onClick={function () { toggleDespacho(fechaObrador, p); }}
              style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1.5px solid " + (sent ? "#38A169" : "#7C5C3B"), background: sent ? "#38A169" : "#fff", color: sent ? "#fff" : "#7C5C3B", fontSize: 12, fontWeight: "bold", cursor: "pointer", fontFamily: "Georgia, serif" }}
            >
              {sent ? "Enviado" : "Marcar enviado"}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={S.page}>
        <div style={S.card}>
          <div style={{ background: "linear-gradient(160deg,#3D2B1F,#7C5C3B)", padding: "20px 20px 14px", color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: "bold", color: "#F5E6D3" }}>Obrador</div>
                <div style={{ fontSize: 12, color: "#C8A882", fontStyle: "italic" }}>{new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}</div>
              </div>
              <button style={S.ghost} onClick={function () { recargar(); setScreen("inicio"); }}>Salir</button>
            </div>

            {/* Selector de fecha */}
            <div style={{ marginTop: 14, background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 10, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, color: "#C8A882", marginBottom: 6 }}>
                Fecha de cierre que estoy revisando
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  type="date"
                  value={fechaObrador}
                  onChange={function (e) { setFechaObrador(e.target.value); }}
                  style={{ flex: 1, minWidth: 140, padding: "7px 9px", borderRadius: 8, border: "none", fontSize: 13, fontFamily: "Georgia, serif", background: "#fff", color: "#2D3748" }}
                />
                <button
                  onClick={function () { setFechaObrador(fechaAyer()); }}
                  style={{ padding: "7px 12px", borderRadius: 8, border: "none", background: "rgba(255,255,255,0.25)", color: "#fff", fontSize: 11, fontWeight: "bold", cursor: "pointer", fontFamily: "Georgia, serif" }}
                >Ayer</button>
                <button
                  onClick={function () { setFechaObrador(fechaHoy()); }}
                  style={{ padding: "7px 12px", borderRadius: 8, border: "none", background: "rgba(255,255,255,0.25)", color: "#fff", fontSize: 11, fontWeight: "bold", cursor: "pointer", fontFamily: "Georgia, serif" }}
                >Hoy</button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, background: "rgba(255,255,255,0.15)", color: "#fff", padding: "4px 12px", borderRadius: 20 }}>{enviadosCount}/3 enviados</span>
              {obradorLoading && <span style={{ fontSize: 11, background: "rgba(255,255,255,0.15)", color: "#fff", padding: "4px 12px", borderRadius: 20 }}>Cargando...</span>}
            </div>
          </div>

          <div style={{ padding: "16px 16px 32px", overflowY: "auto", maxHeight: "70vh" }}>
            <div style={{ fontWeight: "bold", fontSize: 14, color: "#2D3748", marginBottom: 12 }}>
              Cierre del {fechaDisplay(fechaObrador)}
            </div>
            {PUNTOS.map(renderTarjetaPunto)}
            <button
              style={{ ...S.btn, background: "#4A5568", fontSize: 14 }}
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
    var adminTabs = [["cierres", "Cierres"], ["minmax", "Min/Max"]];
    return (
      <div style={S.page}>
        <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
          <div style={{ background: "linear-gradient(160deg,#3D2B1F,#7C5C3B)", padding: "18px 20px 0", color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: "bold", color: "#F5E6D3" }}>Panel Admin</div>
                <div style={{ fontSize: 12, color: "#C8A882", fontStyle: "italic" }}>Nossa Cafe</div>
              </div>
              <button style={S.ghost} onClick={function () { setScreen("inicio"); }}>Salir</button>
            </div>
          </div>
          <div style={{ display: "flex", overflowX: "auto", borderBottom: "2px solid #F0F0F0", background: "#FAFAFA" }}>
            {adminTabs.map(function (pair) {
              return <button key={pair[0]} onClick={function () { setAdminTab(pair[0]); }} style={{ padding: "12px 14px", border: "none", background: "transparent", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "Georgia, serif", color: adminTab === pair[0] ? "#7C5C3B" : "#9CA3AF", fontWeight: adminTab === pair[0] ? "bold" : "normal", borderBottom: adminTab === pair[0] ? "3px solid #7C5C3B" : "3px solid transparent" }}>{pair[1]}</button>;
            })}
          </div>
          <div style={{ padding: "16px 16px 32px", overflowY: "auto", maxHeight: "65vh" }}>
            {adminTab === "cierres" && (
              <div>
                <div style={{ fontWeight: "bold", fontSize: 14, color: "#2D3748", marginBottom: 12 }}>Estado cierres hoy</div>
                {PUNTOS.map(function (p) {
                  var ok = cierresEstado[p];
                  return <div key={p} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#FAFAFA", borderRadius: 10, marginBottom: 8, borderLeft: "4px solid " + (ok ? "#38A169" : "#E2E8F0") }}><span style={{ fontSize: 14, fontWeight: "bold", color: "#2D3748" }}>{p}</span><span style={{ fontSize: 12, fontWeight: "bold", padding: "4px 12px", borderRadius: 20, background: ok ? "#DCFCE7" : "#FEF3C7", color: ok ? "#15803D" : "#92400E" }}>{ok ? "Completo" : "Pendiente"}</span></div>;
                })}
                <button style={{ ...S.btn, background: "#4A5568", fontSize: 14 }} onClick={recargar}>{cargando ? "Cargando..." : "Actualizar desde Sheets"}</button>
              </div>
            )}
            {adminTab === "minmax" && (
              <div>
                <div style={{ fontWeight: "bold", fontSize: 14, color: "#2D3748", marginBottom: 12 }}>Minimos y Maximos</div>
                {CATS.map(function (c) {
                  return (
                    <div key={c.id} style={{ marginBottom: 16 }}>
                      <div style={{ color: c.color, fontWeight: "bold", fontSize: 12, margin: "0 0 6px" }}>{c.nombre}</div>
                      <div style={{ background: "#FAFAFA", borderRadius: 12, border: "1px solid #F1F5F9", overflow: "hidden" }}>
                        {c.productos.map(function (prod, i) {
                          var mm = getMM(prod.nombre, prod);
                          var editing = editMM === prod.nombre;
                          return (
                            <div key={prod.nombre} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderBottom: i < c.productos.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                              <div style={{ flex: 1, fontSize: 13, color: "#2D3748" }}>{prod.nombre}</div>
                              {!editing
                                ? <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: 11, color: "#6B7280", background: "#F1F5F9", padding: "3px 8px", borderRadius: 20 }}>{mm.min} - {mm.max}</span>
                                    <button style={{ background: "#EDF2F7", border: "none", padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontSize: 12 }} onClick={function () { setEditMM(prod.nombre); setEMin(String(mm.min)); setEMax(String(mm.max)); }}>Ed</button>
                                  </div>
                                : <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                    <input style={{ width: 40, padding: "6px", borderRadius: 8, border: "1.5px solid #CBD5E0", fontSize: 14, textAlign: "center" }} type="number" value={eMin} onChange={function (e) { setEMin(e.target.value); }} />
                                    <input style={{ width: 40, padding: "6px", borderRadius: 8, border: "1.5px solid #CBD5E0", fontSize: 14, textAlign: "center" }} type="number" value={eMax} onChange={function (e) { setEMax(e.target.value); }} />
                                    <button style={{ background: "#38A169", color: "#fff", border: "none", padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: "bold" }} onClick={function () { var u = Object.assign({}, minMax); u[prod.nombre] = { min: parseInt(eMin) || prod.min, max: parseInt(eMax) || prod.max }; saveMinMax(u); setEditMM(null); }}>OK</button>
                                    <button style={{ background: "#E2E8F0", border: "none", padding: "6px 10px", borderRadius: 8, cursor: "pointer" }} onClick={function () { setEditMM(null); }}>X</button>
                                  </div>
                              }
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                <button style={{ ...S.btn, background: "#4A5568" }} onClick={function () { saveMinMax({}); alert("Restablecido."); }}>Restablecer valores</button>
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
          <div style={{ background: "linear-gradient(160deg,#3D2B1F,#7C5C3B)", padding: "28px 24px", textAlign: "center", color: "#fff" }}>
            <div style={{ fontSize: 44, marginBottom: 6 }}>🔒</div>
            <div style={{ fontSize: 20, fontWeight: "bold", color: "#F5E6D3" }}>Administrador</div>
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
  // PANTALLA: CATEGORIA
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

    var pct  = Math.round((catIdx / categorias.length) * 100);
    var done = catCompleta(cat);

    return (
      <div style={S.page}>
        <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 16px 12px", color: "#fff", background: cat.color }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <button style={S.ghost} onClick={function () { catIdx === 0 ? setScreen("inicio") : setCatIdx(catIdx - 1); }}>Atras</button>
              <span style={{ fontSize: 11, background: "rgba(255,255,255,0.22)", padding: "3px 10px", borderRadius: 20 }}>{selectedPoint}</span>
            </div>
            <div style={{ fontSize: 36, textAlign: "center" }}>{cat.icon}</div>
            <div style={{ fontSize: 17, fontWeight: "bold", textAlign: "center", margin: "4px 0 2px" }}>{cat.nombre}</div>
            <div style={{ textAlign: "center", fontSize: 11, opacity: 0.75 }}>{catIdx + 1} / {categorias.length}</div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.3)", borderRadius: 3, marginTop: 10 }}>
              <div style={{ height: "100%", background: "#fff", borderRadius: 3, width: pct + "%", transition: "width 0.4s" }} />
            </div>
          </div>

          {!cat.obligatoria && !skipped[cat.id] && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid #E5E7EB", gap: 8, background: cat.bg }}>
              <span style={{ color: cat.color, fontSize: 13 }}>Revisaste esta categoria hoy?</span>
              <button style={{ fontSize: 12, padding: "7px 12px", borderRadius: 20, border: "1.5px solid " + cat.color, background: "transparent", cursor: "pointer", color: cat.color }} onClick={function () {
                var ns = Object.assign({}, skipped); ns[cat.id] = true; setSkipped(ns);
                if (catIdx < categorias.length - 1) setCatIdx(catIdx + 1); else handleGuardarCierre();
              }}>Omitir</button>
            </div>
          )}

          {skipped[cat.id] && (
            <div style={{ background: "#F3F4F6", padding: "10px 16px", fontSize: 13, color: "#6B7280", borderBottom: "1px solid #E5E7EB" }}>
              Omitida - <button style={{ background: "none", border: "none", color: "#3B82F6", cursor: "pointer", fontSize: 13, textDecoration: "underline" }} onClick={function () { var ns = Object.assign({}, skipped); ns[cat.id] = false; setSkipped(ns); }}>Deshacer</button>
            </div>
          )}

          {!skipped[cat.id] && (
            <div>
              <div style={{ padding: "9px 16px", fontSize: 13, fontStyle: "italic", borderBottom: "1px solid #E5E7EB", color: cat.color }}>Cuantas unidades quedan ahora mismo?</div>
              <div style={{ overflowY: "auto", maxHeight: "44vh" }}>
                {cat.productos.map(function (prod, idx) {
                  return <ProductRow key={prod.nombre} prod={prod} idx={idx} allProds={cat.productos} stocks={stocks} setStocks={setStocks} inputRefs={inputRefs} freshInput={freshInput} />;
                })}
              </div>
            </div>
          )}

          <div style={{ padding: 14, borderTop: "1px solid #F0F0F0", background: "#FAFAFA" }}>
            {!done && !skipped[cat.id] && <div style={{ textAlign: "center", color: "#D97706", fontSize: 11, marginBottom: 8, fontStyle: "italic" }}>Completa todos los productos para continuar</div>}
            {saving && <div style={{ textAlign: "center", color: "#6B7280", fontSize: 12, marginBottom: 8 }}>Guardando en Sheets...</div>}
            <button
              style={{ ...S.btn, marginTop: 0, opacity: done && !saving ? 1 : 0.35 }}
              disabled={!done || saving}
              onClick={function () {
                if (catIdx < categorias.length - 1) setCatIdx(catIdx + 1);
                else handleGuardarCierre();
              }}
            >
              {saving ? "Guardando..." : catIdx < categorias.length - 1 ? "Siguiente: " + (categorias[catIdx + 1] ? categorias[catIdx + 1].nombre : "") : "Guardar cierre"}
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
          <div style={{ background: "linear-gradient(160deg,#3D2B1F,#7C5C3B)", padding: "32px 24px 20px", textAlign: "center", color: "#fff" }}>
            <div style={{ fontSize: 48 }}>{confirmado ? "✓" : "!"}</div>
            <div style={{ fontSize: 22, fontWeight: "bold", color: "#F5E6D3" }}>{pedRes.length === 0 ? "Todo en orden!" : pedRes.length + " productos por pedir"}</div>
            <div style={{ fontSize: 13, color: "#C8A882", marginTop: 4 }}>{ptRes} - {hrRes} - {respRes || "--"}</div>
            {confirmado
              ? <div style={{ color: "#C6F6D5", fontSize: 12, marginTop: 8 }}>Confirmado en Google Sheets</div>
              : <div style={{ color: "#FED7D7", fontSize: 12, marginTop: 8 }}>Enviado — verificando en Sheets</div>}
          </div>
          <div style={S.body}>
            {pedRes.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                {pedRes.map(function (item, i) {
                  return <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #F0F0F0" }}><span style={{ fontSize: 13, color: "#2D3748" }}>{item.prod}</span><span style={{ fontSize: 13, fontWeight: "bold", color: "#E53E3E" }}>{item.cantidad} und</span></div>;
                })}
              </div>
            )}
            {pedRes.length === 0 && <div style={{ padding: 14, background: "#F0FFF4", borderRadius: 12, textAlign: "center", color: "#38A169", fontSize: 14, marginBottom: 16 }}>Todos los productos sobre el nivel minimo</div>}
            <div style={{ padding: 14, background: "#F0FFF4", borderRadius: 14, border: "2px solid #C6F6D5", marginBottom: 16 }}>
              <div style={{ fontWeight: "bold", fontSize: 13, color: "#276749", marginBottom: 8 }}>Mensaje para WhatsApp</div>
              <textarea style={{ width: "100%", borderRadius: 8, border: "1px solid #C6F6D5", padding: 10, fontSize: 11, background: "#fff", resize: "none", fontFamily: "monospace", boxSizing: "border-box", lineHeight: 1.6 }} readOnly value={msgRes} rows={Math.min(14, msgRes.split("\n").length + 2)} />
              <button style={{ width: "100%", padding: 11, borderRadius: 10, border: "none", background: "#38A169", color: "#fff", fontSize: 13, fontWeight: "bold", cursor: "pointer", marginTop: 8 }} onClick={function () { if (navigator.clipboard) navigator.clipboard.writeText(msgRes); alert("Copiado!"); }}>Copiar mensaje</button>
            </div>
            <button style={{ ...S.btn, background: "#4A5568" }} onClick={reiniciar}>Nuevo cierre</button>
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
          <div style={{ fontSize: 44, marginBottom: 8 }}>☕</div>
          <div style={{ fontSize: 24, fontWeight: "bold", letterSpacing: 1.5, color: "#F5E6D3" }}>Nossa Cafe</div>
          <div style={{ fontSize: 13, color: "#C8A882", marginTop: 4, fontStyle: "italic" }}>Cierre de turno</div>
        </div>
        <div style={S.body}>

          <button style={{ ...S.btn, marginTop: 8, background: "linear-gradient(135deg,#334155,#1E293B)" }} onClick={function () { recargar(); setScreen("obrador"); }}>
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
                <div key={p} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", borderBottom: i < 2 ? "1px solid #F3F4F6" : "none", background: ok ? "#F0FFF4" : "#FAFAFA" }}>
                  <span style={{ fontSize: 13, fontWeight: "600", color: "#2D3748" }}>{p}</span>
                  <span style={{ fontSize: 11, fontWeight: "bold", color: ok ? "#15803D" : "#92400E", background: ok ? "#DCFCE7" : "#FEF3C7", padding: "3px 10px", borderRadius: 20 }}>{ok ? "Completo" : "Pendiente"}</span>
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
                    border: "2px solid " + (activo ? "#7C5C3B" : cerrado ? "#38A169" : "#E5D8CC"),
                    background: activo ? "#7C5C3B" : "#FFF8F4",
                    cursor: "pointer", fontSize: 13, fontWeight: "bold",
                    color: activo ? "#fff" : "#7C5C3B",
                    position: "relative",
                    boxShadow: activo ? "0 2px 8px rgba(124,92,59,0.4)" : "none",
                  }}
                >
                  {p}
                  {cerrado && (
                    <span style={{ position: "absolute", top: -6, right: -6, background: "#38A169", color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>v</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Punto ya cerrado hoy */}
          {puntoCerrado ? (
            <div style={{ background: "#FFF7ED", border: "2px solid #F97316", borderRadius: 14, padding: "14px", margin: "12px 0" }}>
              <div style={{ fontWeight: "bold", fontSize: 14, color: "#92400E", marginBottom: 4 }}>Este punto ya realizo el cierre hoy</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>Registrado en Google Sheets. No se permiten duplicados.</div>
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
                  setCatIdx(0);
                  setSkipped({});
                  setStocks({});
                  freshInput.current = {};
                  inputRefs.current  = {};
                  setScreen("categoria");
                }}
              >
                Iniciar revision
              </button>
            </div>
          )}

          <button style={S.link} onClick={function () { setScreen("login"); }}>Acceso administrador</button>
        </div>
      </div>
    </div>
  );
}
