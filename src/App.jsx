import { useState, useEffect, useRef, useCallback } from "react";

// ─── URL DE APPS SCRIPT ───────────────────────────────────────────────────────
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyxs7uys-3iaRXEzYTBJLJRX2KIdjiixphwqSxUDvlyJykmrZOL2hNXGqq_I7KLUvCb0Q/exec";
const ADMIN_PASSWORD  = "nossa2024";
const PUNTOS          = ["Centro", "Primavera", "CF"];

// ─── CATEGORÍAS ───────────────────────────────────────────────────────────────
const CATS = [
  {
    id: "pasteleria", nombre: "Pasteleria", icon: "🥐",
    color: "#7C5C3B", bg: "#FFF8F0", obligatoria: true, soloEn: null,
    productos: [
      { nombre: "Pastel pollo",          min: 12, max: 18 },
      { nombre: "Almojavanas",           min: 2,  max: 5  },
      { nombre: "Galleta avena",         min: 3,  max: 6  },
      { nombre: "Galleta macadamia",     min: 3,  max: 6  },
      { nombre: "Galleta chocolate",     min: 2,  max: 4  },
      { nombre: "Empanada carne",        min: 6,  max: 18 },
      { nombre: "Empanada pollo",        min: 6,  max: 18 },
      { nombre: "Croissant mantequilla", min: 2,  max: 6  },
      { nombre: "Croissant almendra",    min: 2,  max: 6  },
      { nombre: "Eclair maracuya",       min: 5,  max: 10 },
      { nombre: "Torta zanahoria",       min: 6,  max: 10 },
      { nombre: "Torta chocolate",       min: 6,  max: 10 },
      { nombre: "Torta naranja",         min: 2,  max: 6  },
      { nombre: "Torta almojavana",      min: 2,  max: 6  },
      { nombre: "Tarta cafe",            min: 4,  max: 8  },
      { nombre: "Tarta arandanos",       min: 6,  max: 12 },
      { nombre: "Cheesecake lulo",       min: 3,  max: 7  },
      { nombre: "Cheesecake guayaba",    min: 2,  max: 5  },
      { nombre: "Mangos",                min: 4,  max: 8  },
      { nombre: "Tres leches",           min: 3,  max: 6  },
      { nombre: "Milhojas arequipe",     min: 5,  max: 8  },
      { nombre: "Milhojas limon",        min: 5,  max: 8  },
      { nombre: "Cocos",                 min: 3,  max: 6  },
      { nombre: "Fresas und",            min: 3,  max: 8  },
      { nombre: "Osos",                  min: 8,  max: 12 },
    ],
  },
  {
    id: "cafeteria", nombre: "Cafeteria", icon: "C",
    color: "#6B4226", bg: "#FDF6F0", obligatoria: false, soloEn: null,
    productos: [
      { nombre: "Crema whisky",         min: 1, max: 1 },
      { nombre: "Hierbabuena",          min: 1, max: 1 },
      { nombre: "Tarro aro fresa",      min: 1, max: 1 },
      { nombre: "Tarro aro papaya",     min: 1, max: 1 },
      { nombre: "Tarro aro mora",       min: 1, max: 1 },
      { nombre: "Leche almendra cajax6",min: 2, max: 6 },
      { nombre: "Varietales",           min: 2, max: 6 },
    ],
  },
  {
    id: "limpieza", nombre: "Limpieza", icon: "L",
    color: "#2E7D6B", bg: "#F0FAF7", obligatoria: false, soloEn: null,
    productos: [
      { nombre: "Toallas manos paq",    min: 2, max: 6 },
      { nombre: "Jabon loza",           min: 1, max: 2 },
      { nombre: "Jabon lavavajillas",   min: 1, max: 2 },
      { nombre: "Jabon de manos",       min: 2, max: 6 },
      { nombre: "Esponjas",             min: 1, max: 3 },
      { nombre: "Alcohol",              min: 1, max: 1 },
      { nombre: "Cloro",                min: 2, max: 6 },
      { nombre: "Limpiones",            min: 2, max: 6 },
    ],
  },
  {
    id: "empaques", nombre: "Empaques", icon: "E",
    color: "#5C4DB1", bg: "#F5F3FF", obligatoria: false, soloEn: null,
    productos: [
      { nombre: "Bolsa manija grande",          min: 15, max: 30 },
      { nombre: "Bolsa manija mediana",         min: 15, max: 30 },
      { nombre: "Bolsa parafinada grande",      min: 2,  max: 4  },
      { nombre: "Bolsa parafinada pequena",     min: 2,  max: 4  },
      { nombre: "Servilletas",                  min: 1,  max: 2  },
    ],
  },
  {
    id: "materias", nombre: "Materias Primas", icon: "M",
    color: "#3A7D44", bg: "#F1FAF2", obligatoria: false, soloEn: null,
    productos: [
      { nombre: "Te matcha",       min: 1, max: 1 },
      { nombre: "Beach party te",  min: 2, max: 6 },
      { nombre: "Chocolate mezcla",min: 1, max: 1 },
      { nombre: "Amaretto",        min: 1, max: 2 },
      { nombre: "Pulpa de mango",  min: 3, max: 6 },
      { nombre: "Guanabana pulpa", min: 2, max: 6 },
      { nombre: "Mora pulpa",      min: 2, max: 6 },
      { nombre: "Fresa pulpa",     min: 2, max: 6 },
      { nombre: "Huevos und",      min: 2, max: 4 },
      { nombre: "Limones und",     min: 3, max: 5 },
      { nombre: "Avena en polvo",  min: 1, max: 1 },
    ],
  },
  {
    id: "cf_extra", nombre: "Exclusivo CF", icon: "*",
    color: "#C2185B", bg: "#FFF0F5", obligatoria: false, soloEn: "CF",
    productos: [
      { nombre: "Muffin arandano frambuesa", min: 2, max: 6 },
      { nombre: "Gansito",                   min: 2, max: 6 },
    ],
  },
];

// ─── HELPERS: FECHA / URL ─────────────────────────────────────────────────────
function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function horaActual() {
  var n = new Date();
  return n.getHours().toString().padStart(2, "0") + ":" + n.getMinutes().toString().padStart(2, "0");
}

function getScriptUrl() {
  try {
    var cached = localStorage.getItem("nossa_url_override");
    if (cached) return cached;
  } catch (e) {}
  return APPS_SCRIPT_URL;
}

// ─── SHEETS API ───────────────────────────────────────────────────────────────
async function apiEstadoCierres() {
  var url = getScriptUrl() + "?action=estadoCierres&fecha=" + hoyISO();
  console.log("[GET]", url);
  var res = await fetch(url);
  var data = await res.json();
  console.log("[estadoCierres]", data);
  // Expect: { success: true, cierres: { Centro: true, Primavera: false, CF: false } }
  if (data && data.success && data.cierres) return data.cierres;
  return { Centro: false, Primavera: false, CF: false };
}

async function apiGuardarCierre(punto, datos) {
  if (!punto) throw new Error("punto es null — no se puede guardar");
  var params = new URLSearchParams({
    action:  "guardarCierre",
    fecha:   hoyISO(),
    punto:   punto,
    datos:   JSON.stringify(datos),
  });
  var url = getScriptUrl() + "?" + params.toString();
  console.log("[GET guardarCierre]", url);
  var res = await fetch(url);
  var data = await res.json();
  console.log("[guardarCierre response]", data);
  return data;
}

// ─── STORAGE (solo configuración) ────────────────────────────────────────────
function lsGet(k) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

// ─── ESTILOS ─────────────────────────────────────────────────────────────────
var css = {
  page:  { minHeight: "100vh", background: "#F2EDE8", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: 12, fontFamily: "Georgia, serif" },
  card:  { width: "100%", maxWidth: 480, background: "#fff", borderRadius: 20, boxShadow: "0 6px 40px rgba(0,0,0,0.12)", overflow: "hidden" },
  hero:  { background: "linear-gradient(160deg,#3D2B1F,#7C5C3B)", padding: "32px 24px 24px", textAlign: "center", color: "#fff" },
  body:  { padding: "8px 20px 24px" },
  lbl:   { fontSize: 11, color: "#6B7280", fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, margin: "16px 0 8px" },
  inp:   { width: "100%", padding: "13px 14px", borderRadius: 12, border: "2px solid #E5D8CC", fontSize: 15, outline: "none", fontFamily: "Georgia, serif", background: "#FFFAF7", boxSizing: "border-box" },
  btn:   { display: "block", width: "100%", padding: "16px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#C8873A,#7C5C3B)", color: "#fff", fontSize: 16, fontWeight: "bold", cursor: "pointer", fontFamily: "Georgia, serif", marginTop: 14 },
  bbk:   { background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", padding: "7px 13px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontFamily: "Georgia, serif" },
  empty: { color: "#9CA3AF", fontSize: 13, fontStyle: "italic", textAlign: "center", padding: 20 },
};

// ─── PRODUCT ROW ──────────────────────────────────────────────────────────────
function ProductRow({ prod, idx, allProds, stocks, setStocks, inputRefs, freshInput }) {
  var sVal = stocks[prod.nombre];
  var display = sVal !== undefined ? String(sVal) : "";
  var filled = sVal !== undefined;
  var pedir  = !filled ? null : sVal > prod.max ? "OVER" : sVal <= prod.min ? Math.max(0, prod.max - sVal) : 0;
  var isOver  = pedir === "OVER";
  var isAlert = filled && !isOver && typeof pedir === "number" && pedir > 0;
  var isOk    = filled && !isOver && pedir === 0;
  var bc = isOver ? "#DD6B20" : isAlert ? "#E53E3E" : isOk ? "#38A169" : "#E2E8F0";
  var tc = isOver ? "#DD6B20" : isAlert ? "#E53E3E" : isOk ? "#38A169" : "#2D3748";

  var incr = useCallback(function () {
    setStocks(function (prev) {
      var r = Object.assign({}, prev);
      r[prod.nombre] = Math.max(0, (prev[prod.nombre] || 0) + 1);
      return r;
    });
  }, [prod.nombre]);

  var decr = useCallback(function () {
    setStocks(function (prev) {
      var r = Object.assign({}, prev);
      r[prod.nombre] = Math.max(0, (prev[prod.nombre] || 0) - 1);
      return r;
    });
  }, [prod.nombre]);

  function onChange(e) {
    var raw = e.target.value;
    if (freshInput.current[prod.nombre]) {
      freshInput.current[prod.nombre] = false;
      raw = raw.replace(/^0+/, "") || "0";
    }
    if (raw === "" || raw === "-") return;
    var n = Math.max(0, parseInt(raw) || 0);
    setStocks(function (prev) { var r = Object.assign({}, prev); r[prod.nombre] = n; return r; });
  }

  function onFocus(e) { e.target.select(); freshInput.current[prod.nombre] = true; }

  function onBlur(e) {
    freshInput.current[prod.nombre] = false;
    var n = Math.max(0, parseInt(e.target.value) || 0);
    setStocks(function (prev) { var r = Object.assign({}, prev); r[prod.nombre] = n; return r; });
  }

  function onKeyDown(e) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    freshInput.current[prod.nombre] = false;
    var next = allProds[idx + 1];
    if (next && inputRefs.current[next.nombre]) inputRefs.current[next.nombre].focus();
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
      <div style={{ width: "100%", paddingLeft: 2, fontSize: 11, fontWeight: "bold" }}>
        {isOver  && <span style={{ color: "#DD6B20" }}>Sobre maximo ({prod.max})</span>}
        {isAlert && <span style={{ color: "#E53E3E" }}>Pedir {pedir} und</span>}
        {isOk    && <span style={{ color: "#38A169" }}>OK</span>}
      </div>
    </div>
  );
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function NossaCafe() {
  // ── Pantalla actual ────────────────────────────────────────────────────────
  var [screen, setScreen] = useState("inicio");

  // ── Estado del punto seleccionado ─────────────────────────────────────────
  // puntoActivo: el punto que está haciendo el cierre AHORA
  // Se fija al comenzar y no cambia hasta reiniciar
  var [puntoActivo, setPuntoActivo] = useState(null);

  // ── Estado del formulario ─────────────────────────────────────────────────
  var [responsable, setResponsable] = useState("");
  var [hora, setHora]               = useState(horaActual);
  var [catIdx, setCatIdx]           = useState(0);
  var [skipped, setSkipped]         = useState({});
  var [stocks, setStocks]           = useState({});
  var [minMax, setMinMax]           = useState({});

  // ── Resultado del cierre guardado (para resumen) ──────────────────────────
  // Se snapshot al momento de guardar — no depende de puntoActivo
  var [cierreGuardado, setCierreGuardado] = useState(null);
  // { punto, hora, responsable, pedido, mensaje }

  // ── Estado de cierres del día (desde Sheets) ──────────────────────────────
  var [cierresEstado, setCierresEstado] = useState({ Centro: false, Primavera: false, CF: false });
  var [cargando, setCargando]           = useState(false);
  var [saving, setSaving]               = useState(false);

  // ── Admin ─────────────────────────────────────────────────────────────────
  var [adminPass, setAdminPass] = useState("");
  var [adminErr, setAdminErr]   = useState(false);
  var [adminTab, setAdminTab]   = useState("cierres");
  var [editMM, setEditMM]       = useState(null);
  var [eMin, setEMin]           = useState("");
  var [eMax, setEMax]           = useState("");
  var [urlInput, setUrlInput]   = useState(getScriptUrl);

  // ── Obrador ───────────────────────────────────────────────────────────────
  var [despacho, setDespacho]   = useState(function () { return lsGet("nossa_despacho") || { Centro: false, Primavera: false, CF: false }; });

  // ── Refs ──────────────────────────────────────────────────────────────────
  var inputRefs  = useRef({});
  var freshInput = useRef({});

  // ── Boot ──────────────────────────────────────────────────────────────────
  useEffect(function () {
    setHora(horaActual());
    var mm = lsGet("nossa_minmax") || {};
    setMinMax(mm);
    recargarEstado();
  }, []);

  useEffect(function () {
    if (screen !== "categoria") return;
    var t = setTimeout(function () {
      var f = document.querySelector(".prod-input");
      if (f) f.focus();
    }, 150);
    return function () { clearTimeout(t); };
  }, [catIdx, screen]);

  // ── Sheets ────────────────────────────────────────────────────────────────
  async function recargarEstado() {
    setCargando(true);
    try {
      var estado = await apiEstadoCierres();
      setCierresEstado(estado);
    } catch (e) {
      console.error("recargarEstado error:", e);
    }
    setCargando(false);
  }

  // ── Min/max helpers ───────────────────────────────────────────────────────
  function getMM(nombre, defaults) {
    return minMax[nombre] || { min: defaults.min, max: defaults.max };
  }

  async function saveMinMax(updated) {
    lsSet("nossa_minmax", updated);
    setMinMax(updated);
  }

  // ── Categorías con min/max aplicados ──────────────────────────────────────
  function getCategorias(pt) {
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

  var categorias = getCategorias(puntoActivo);
  var cat = categorias[catIdx] || categorias[0] || { productos: [], obligatoria: true, id: "" };

  function getPedir(prod) {
    var s = stocks[prod.nombre];
    if (s === undefined) return null;
    if (s > prod.max) return "OVER";
    return s <= prod.min ? Math.max(0, prod.max - s) : 0;
  }

  function catCompleta(c) {
    return skipped[c.id] || c.productos.every(function (p) { return stocks[p.nombre] !== undefined; });
  }

  // ── Mensaje WhatsApp ──────────────────────────────────────────────────────
  function buildMensaje(pt, hr, resp, cats, sk, stocksSnap) {
    var fecha = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
    var msg = "CIERRE - " + pt + "\n" + fecha + "  " + hr + "  " + (resp || "--") + "\n\n";
    var conPedido = cats.filter(function (c) { return !sk[c.id]; }).flatMap(function (c) {
      return c.productos.filter(function (p) {
        var s = stocksSnap[p.nombre];
        if (s === undefined) return false;
        return s <= p.min;
      });
    });
    if (!conPedido.length) return msg + "Sin pedidos pendientes.";
    msg += "PEDIR:\n\n";
    cats.filter(function (c) { return !sk[c.id]; }).forEach(function (c) {
      var items = c.productos.filter(function (p) {
        var s = stocksSnap[p.nombre];
        return s !== undefined && s <= p.min;
      });
      if (!items.length) return;
      msg += c.nombre + ":\n";
      items.forEach(function (p) {
        var pedir = Math.max(0, p.max - (stocksSnap[p.nombre] || 0));
        msg += "  - " + p.nombre + ": " + pedir + " und\n";
      });
      msg += "\n";
    });
    return msg;
  }

  // ── GUARDAR CIERRE ────────────────────────────────────────────────────────
  async function doGuardarCierre() {
    // Snapshot de todo antes de cualquier cambio de estado
    var ptSnapshot    = puntoActivo;
    var hrSnapshot    = hora;
    var respSnapshot  = responsable;
    var stocksSnap    = Object.assign({}, stocks);
    var skippedSnap   = Object.assign({}, skipped);
    var catsSnap      = getCategorias(ptSnapshot);

    // Validación crítica
    if (!ptSnapshot) {
      alert("Error: no hay punto seleccionado. Vuelve al inicio y selecciona un punto.");
      return;
    }

    setSaving(true);
    try {
      // Construir pedido
      var pedido = catsSnap.filter(function (c) { return !skippedSnap[c.id]; }).flatMap(function (c) {
        return c.productos
          .filter(function (p) {
            var s = stocksSnap[p.nombre];
            return s !== undefined && s <= p.min;
          })
          .map(function (p) {
            return { cat: c.nombre, prod: p.nombre, cantidad: Math.max(0, p.max - (stocksSnap[p.nombre] || 0)) };
          });
      });

      var datos = {
        hora:         hrSnapshot,
        responsable:  respSnapshot || "",
        stocks:       stocksSnap,
        pedido:       pedido,
      };

      var result = await apiGuardarCierre(ptSnapshot, datos);

      if (result && result.success === false) {
        if (result.duplicate) {
          alert("Este punto ya tiene un cierre hoy registrado en Google Sheets.");
        } else {
          alert("Error de Apps Script: " + (result.error || "success:false"));
        }
        setSaving(false);
        return;
      }

      // Guardar snapshot del cierre para el resumen
      var mensaje = buildMensaje(ptSnapshot, hrSnapshot, respSnapshot, catsSnap, skippedSnap, stocksSnap);
      setCierreGuardado({
        punto:       ptSnapshot,
        hora:        hrSnapshot,
        responsable: respSnapshot,
        pedido:      pedido,
        mensaje:     mensaje,
      });

      // Recargar estado desde Sheets
      await recargarEstado();
      setScreen("resumen");

    } catch (e) {
      console.error("doGuardarCierre error:", e);
      alert("Error al guardar: " + e.message);
    }
    setSaving(false);
  }

  // ── REINICIAR ─────────────────────────────────────────────────────────────
  function reiniciar() {
    setPuntoActivo(null);
    setResponsable("");
    setHora(horaActual());
    setCatIdx(0);
    setSkipped({});
    setStocks({});
    setCierreGuardado(null);
    freshInput.current = {};
    inputRefs.current  = {};
    recargarEstado();
    setScreen("inicio");
  }

  // ── ADMIN ─────────────────────────────────────────────────────────────────
  function tryLogin() {
    if (adminPass === ADMIN_PASSWORD) { setScreen("admin"); setAdminErr(false); setAdminPass(""); }
    else { setAdminErr(true); setTimeout(function () { setAdminErr(false); }, 2000); }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PANTALLA: OBRADOR
  // ──────────────────────────────────────────────────────────────────────────
  if (screen === "obrador") {
    var env = PUNTOS.filter(function (p) { return despacho[p]; }).length;
    var falt = PUNTOS.filter(function (p) { return !cierresEstado[p]; });
    return (
      <div style={css.page}>
        <div style={css.card}>
          <div style={{ background: "linear-gradient(160deg,#3D2B1F,#7C5C3B)", padding: "20px 20px 14px", color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: "bold", color: "#F5E6D3" }}>Obrador</div>
                <div style={{ fontSize: 12, color: "#C8A882", fontStyle: "italic" }}>{new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}</div>
              </div>
              <button style={css.bbk} onClick={function () { recargarEstado(); setScreen("inicio"); }}>Salir</button>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, fontWeight: "bold", background: falt.length === 0 ? "rgba(255,255,255,0.25)" : "rgba(249,115,22,0.35)", color: "#fff", padding: "4px 12px", borderRadius: 20 }}>
                {PUNTOS.length - falt.length}/3 cerrados
              </span>
              <span style={{ fontSize: 11, background: "rgba(255,255,255,0.15)", color: "#fff", padding: "4px 12px", borderRadius: 20 }}>
                {env}/3 enviados
              </span>
            </div>
            {falt.length > 0 && (
              <div style={{ marginTop: 10, background: "rgba(249,115,22,0.25)", borderRadius: 10, padding: "8px 12px", fontSize: 12, color: "#FED7AA", fontWeight: "600" }}>
                Sin cierre: {falt.join(", ")}
              </div>
            )}
          </div>
          <div style={{ padding: "16px 16px 32px", overflowY: "auto", maxHeight: "72vh" }}>
            <div style={{ fontWeight: "bold", fontSize: 14, color: "#2D3748", marginBottom: 12 }}>Despacho del dia</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PUNTOS.map(function (p) {
                var cerrado = cierresEstado[p];
                var sent    = despacho[p];
                return (
                  <div key={p} style={{ borderRadius: 12, border: "2px solid " + (sent ? "#38A169" : cerrado ? "#E2E8F0" : "#FED7AA"), background: "#fff", opacity: sent ? 0.85 : 1 }}>
                    <div style={{ padding: "13px 14px", background: sent ? "#F0FFF4" : cerrado ? "#FAFAFA" : "#FFF7ED", display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: 10 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: "bold", color: "#2D3748" }}>{p}</div>
                        <div style={{ fontSize: 11, color: cerrado ? "#15803D" : "#D97706", marginTop: 2 }}>
                          {cerrado ? "Cierre en Sheets" : "Sin cierre hoy"}
                        </div>
                      </div>
                      <button
                        disabled={!cerrado}
                        onClick={function () {
                          var u = Object.assign({}, despacho);
                          u[p] = !despacho[p];
                          setDespacho(u);
                          lsSet("nossa_despacho", u);
                        }}
                        style={{ padding: "9px 14px", borderRadius: 20, border: "1.5px solid " + (sent ? "#38A169" : cerrado ? "#7C5C3B" : "#E2E8F0"), cursor: cerrado ? "pointer" : "not-allowed", fontSize: 12, fontWeight: "bold", background: sent ? "#38A169" : "#fff", color: sent ? "#fff" : cerrado ? "#7C5C3B" : "#9CA3AF" }}
                      >
                        {sent ? "Enviado" : cerrado ? "Marcar enviado" : "Pendiente"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {env === 3 && (
              <div style={{ marginTop: 12, background: "#F0FFF4", border: "2px solid #38A169", borderRadius: 12, padding: 14, textAlign: "center", fontSize: 14, fontWeight: "bold", color: "#15803D" }}>
                Todos los pedidos enviados
              </div>
            )}
            <button style={{ ...css.btn, background: "#4A5568", marginTop: 20, fontSize: 14 }} onClick={recargarEstado}>
              {cargando ? "Actualizando..." : "Actualizar desde Sheets"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PANTALLA: ADMIN
  // ──────────────────────────────────────────────────────────────────────────
  if (screen === "admin") {
    var adminTabs = [["cierres", "Cierres"], ["minmax", "Min/Max"], ["config", "Config"]];
    return (
      <div style={css.page}>
        <div style={{ ...css.card, padding: 0, overflow: "hidden" }}>
          <div style={{ background: "linear-gradient(160deg,#3D2B1F,#7C5C3B)", padding: "18px 20px 0", color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: "bold", color: "#F5E6D3" }}>Panel Admin</div>
                <div style={{ fontSize: 12, color: "#C8A882", fontStyle: "italic" }}>Nossa Cafe</div>
              </div>
              <button style={css.bbk} onClick={function () { setScreen("inicio"); }}>Salir</button>
            </div>
          </div>
          <div style={{ display: "flex", overflowX: "auto", borderBottom: "2px solid #F0F0F0", background: "#FAFAFA" }}>
            {adminTabs.map(function (pair) {
              return (
                <button key={pair[0]} onClick={function () { setAdminTab(pair[0]); }} style={{ padding: "12px 14px", border: "none", background: "transparent", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "Georgia, serif", color: adminTab === pair[0] ? "#7C5C3B" : "#9CA3AF", fontWeight: adminTab === pair[0] ? "bold" : "normal", borderBottom: adminTab === pair[0] ? "3px solid #7C5C3B" : "3px solid transparent" }}>
                  {pair[1]}
                </button>
              );
            })}
          </div>
          <div style={{ padding: "16px 16px 32px", overflowY: "auto", maxHeight: "65vh" }}>
            {adminTab === "cierres" && (
              <div>
                <div style={{ fontWeight: "bold", fontSize: 14, color: "#2D3748", marginBottom: 12 }}>Estado cierres hoy</div>
                {PUNTOS.map(function (p) {
                  var ok = cierresEstado[p];
                  return (
                    <div key={p} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#FAFAFA", borderRadius: 10, marginBottom: 8, borderLeft: "4px solid " + (ok ? "#38A169" : "#E2E8F0") }}>
                      <div style={{ fontSize: 14, fontWeight: "bold", color: "#2D3748" }}>{p}</div>
                      <span style={{ fontSize: 12, fontWeight: "bold", padding: "4px 12px", borderRadius: 20, background: ok ? "#DCFCE7" : "#FEF3C7", color: ok ? "#15803D" : "#92400E" }}>{ok ? "Completo" : "Pendiente"}</span>
                    </div>
                  );
                })}
                <button style={{ ...css.btn, background: "#4A5568", fontSize: 14 }} onClick={recargarEstado}>{cargando ? "Cargando..." : "Actualizar desde Sheets"}</button>
              </div>
            )}
            {adminTab === "minmax" && (
              <div>
                <div style={{ fontWeight: "bold", fontSize: 14, color: "#2D3748", marginBottom: 12 }}>Minimos y Maximos</div>
                {CATS.map(function (cat) {
                  return (
                    <div key={cat.id} style={{ marginBottom: 16 }}>
                      <div style={{ color: cat.color, fontWeight: "bold", fontSize: 12, margin: "0 0 6px" }}>{cat.nombre}</div>
                      <div style={{ background: "#FAFAFA", borderRadius: 12, border: "1px solid #F1F5F9", overflow: "hidden" }}>
                        {cat.productos.map(function (prod, i) {
                          var mm = getMM(prod.nombre, prod);
                          var editing = editMM === prod.nombre;
                          return (
                            <div key={prod.nombre} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderBottom: i < cat.productos.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                              <div style={{ flex: 1, fontSize: 13, color: "#2D3748" }}>{prod.nombre}</div>
                              {!editing ? (
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ fontSize: 11, color: "#6B7280", background: "#F1F5F9", padding: "3px 8px", borderRadius: 20 }}>{mm.min} - {mm.max}</span>
                                  <button style={{ background: "#EDF2F7", border: "none", padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontSize: 12 }} onClick={function () { setEditMM(prod.nombre); setEMin(String(mm.min)); setEMax(String(mm.max)); }}>Ed</button>
                                </div>
                              ) : (
                                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                  <input style={{ width: 40, padding: "6px", borderRadius: 8, border: "1.5px solid #CBD5E0", fontSize: 14, textAlign: "center" }} type="number" value={eMin} onChange={function (e) { setEMin(e.target.value); }} />
                                  <input style={{ width: 40, padding: "6px", borderRadius: 8, border: "1.5px solid #CBD5E0", fontSize: 14, textAlign: "center" }} type="number" value={eMax} onChange={function (e) { setEMax(e.target.value); }} />
                                  <button style={{ background: "#38A169", color: "#fff", border: "none", padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: "bold" }} onClick={function () {
                                    var u = Object.assign({}, minMax);
                                    u[prod.nombre] = { min: parseInt(eMin) || prod.min, max: parseInt(eMax) || prod.max };
                                    saveMinMax(u); setEditMM(null);
                                  }}>OK</button>
                                  <button style={{ background: "#E2E8F0", border: "none", padding: "6px 10px", borderRadius: 8, cursor: "pointer" }} onClick={function () { setEditMM(null); }}>X</button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                <button style={{ ...css.btn, background: "#4A5568" }} onClick={function () { saveMinMax({}); alert("Restablecido."); }}>Restablecer valores</button>
              </div>
            )}
            {adminTab === "config" && (
              <div>
                <div style={{ fontWeight: "bold", fontSize: 14, color: "#2D3748", marginBottom: 12 }}>URL de Apps Script</div>
                <div style={{ background: "#EFF6FF", border: "1.5px solid #BFDBFE", borderRadius: 12, padding: 12, fontSize: 12, color: "#1E40AF", marginBottom: 14, lineHeight: 1.6 }}>
                  La URL por defecto esta en el codigo (DEFAULT_APPS_SCRIPT_URL). Aqui puedes sobreescribirla solo en este dispositivo.
                </div>
                <div style={css.lbl}>URL (este dispositivo)</div>
                <input style={css.inp} value={urlInput} onChange={function (e) { setUrlInput(e.target.value); }} placeholder="https://script.google.com/..." />
                <button style={{ ...css.btn, marginTop: 8 }} onClick={function () {
                  lsSet("nossa_url_override", urlInput);
                  alert("Guardado localmente en este dispositivo.");
                }}>Guardar en este dispositivo</button>
                <button style={{ ...css.btn, background: "#4A5568", marginTop: 8 }} onClick={function () {
                  localStorage.removeItem("nossa_url_override");
                  setUrlInput(APPS_SCRIPT_URL);
                  alert("Override eliminado. Usando URL del codigo.");
                }}>Usar URL del codigo</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PANTALLA: LOGIN ADMIN
  // ──────────────────────────────────────────────────────────────────────────
  if (screen === "login") {
    return (
      <div style={css.page}>
        <div style={{ ...css.card, maxWidth: 360 }}>
          <div style={{ background: "linear-gradient(160deg,#3D2B1F,#7C5C3B)", padding: "28px 24px", textAlign: "center", color: "#fff" }}>
            <div style={{ fontSize: 44, marginBottom: 6 }}>🔒</div>
            <div style={{ fontSize: 20, fontWeight: "bold", color: "#F5E6D3" }}>Administrador</div>
          </div>
          <div style={css.body}>
            <div style={css.lbl}>Contrasena</div>
            <input style={{ ...css.inp, letterSpacing: 4 }} type="password" placeholder="..." value={adminPass} onChange={function (e) { setAdminPass(e.target.value); }} onKeyDown={function (e) { if (e.key === "Enter") tryLogin(); }} />
            {adminErr && <div style={{ color: "#E53E3E", fontSize: 13, textAlign: "center", margin: "8px 0", fontWeight: "bold" }}>Contrasena incorrecta</div>}
            <button style={css.btn} onClick={tryLogin}>Entrar</button>
            <button style={{ display: "block", textAlign: "center", marginTop: 12, color: "#6B7280", fontSize: 13, cursor: "pointer", background: "none", border: "none" }} onClick={function () { setScreen("inicio"); }}>Volver</button>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PANTALLA: CATEGORIA
  // ──────────────────────────────────────────────────────────────────────────
  if (screen === "categoria") {
    if (!puntoActivo) {
      // Nunca deberia llegar aqui sin punto, pero por seguridad:
      return (
        <div style={css.page}>
          <div style={css.card}>
            <div style={css.body}>
              <div style={{ color: "#E53E3E", fontSize: 14, fontWeight: "bold", textAlign: "center", padding: 20 }}>Error: no hay punto seleccionado.</div>
              <button style={css.btn} onClick={reiniciar}>Volver al inicio</button>
            </div>
          </div>
        </div>
      );
    }

    var pct  = Math.round((catIdx / categorias.length) * 100);
    var done = catCompleta(cat);

    function skipCat() {
      var ns = Object.assign({}, skipped);
      ns[cat.id] = true;
      setSkipped(ns);
      if (catIdx < categorias.length - 1) setCatIdx(catIdx + 1);
      else doGuardarCierre();
    }

    function siguiente() {
      if (catIdx < categorias.length - 1) setCatIdx(catIdx + 1);
      else doGuardarCierre();
    }

    return (
      <div style={css.page}>
        <div style={{ ...css.card, padding: 0, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ padding: "16px 16px 12px", color: "#fff", background: cat.color }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <button style={css.bbk} onClick={function () { catIdx === 0 ? setScreen("inicio") : setCatIdx(catIdx - 1); }}>Atras</button>
              <span style={{ fontSize: 11, background: "rgba(255,255,255,0.22)", padding: "3px 10px", borderRadius: 20 }}>{puntoActivo}</span>
            </div>
            <div style={{ fontSize: 36, textAlign: "center" }}>{cat.icon}</div>
            <div style={{ fontSize: 17, fontWeight: "bold", textAlign: "center", margin: "4px 0 2px" }}>{cat.nombre}</div>
            <div style={{ textAlign: "center", fontSize: 11, opacity: 0.75 }}>{catIdx + 1} / {categorias.length}</div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.3)", borderRadius: 3, marginTop: 10 }}>
              <div style={{ height: "100%", background: "#fff", borderRadius: 3, width: pct + "%", transition: "width 0.4s" }} />
            </div>
          </div>

          {/* Skip opcional */}
          {!cat.obligatoria && !skipped[cat.id] && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid #E5E7EB", gap: 8, background: cat.bg }}>
              <span style={{ color: cat.color, fontSize: 13 }}>Revisaste esta categoria hoy?</span>
              <button style={{ fontSize: 12, padding: "7px 12px", borderRadius: 20, border: "1.5px solid " + cat.color, background: "transparent", cursor: "pointer", color: cat.color }} onClick={skipCat}>Omitir</button>
            </div>
          )}
          {skipped[cat.id] && (
            <div style={{ background: "#F3F4F6", padding: "10px 16px", fontSize: 13, color: "#6B7280", borderBottom: "1px solid #E5E7EB" }}>
              Omitida -{" "}
              <button style={{ background: "none", border: "none", color: "#3B82F6", cursor: "pointer", fontSize: 13, textDecoration: "underline" }} onClick={function () { var ns = Object.assign({}, skipped); ns[cat.id] = false; setSkipped(ns); }}>Deshacer</button>
            </div>
          )}

          {/* Productos */}
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

          {/* Footer */}
          <div style={{ padding: 14, borderTop: "1px solid #F0F0F0", background: "#FAFAFA" }}>
            {!done && !skipped[cat.id] && <div style={{ textAlign: "center", color: "#D97706", fontSize: 11, marginBottom: 8, fontStyle: "italic" }}>Completa todos los productos para continuar</div>}
            {saving && <div style={{ textAlign: "center", color: "#6B7280", fontSize: 12, marginBottom: 8 }}>Guardando en Google Sheets...</div>}
            <button style={{ ...css.btn, marginTop: 0, opacity: done && !saving ? 1 : 0.35 }} disabled={!done || saving} onClick={siguiente}>
              {saving ? "Guardando..." : catIdx < categorias.length - 1 ? "Siguiente: " + (categorias[catIdx + 1] ? categorias[catIdx + 1].nombre : "") : "Guardar cierre"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PANTALLA: RESUMEN
  // ──────────────────────────────────────────────────────────────────────────
  if (screen === "resumen") {
    // Usar SIEMPRE el snapshot guardado, nunca estado mutable
    var cg     = cierreGuardado;
    var ptRes  = cg ? cg.punto       : "(sin datos)";
    var hrRes  = cg ? cg.hora        : "";
    var respRes = cg ? cg.responsable : "";
    var pedRes = cg ? cg.pedido      : [];
    var msgRes = cg ? cg.mensaje     : "";
    var confirmado = cg ? cierresEstado[cg.punto] : false;

    return (
      <div style={css.page}>
        <div style={css.card}>
          <div style={{ background: "linear-gradient(160deg,#3D2B1F,#7C5C3B)", padding: "32px 24px 20px", textAlign: "center", color: "#fff" }}>
            <div style={{ fontSize: 48 }}>{confirmado ? "✓" : "!"}</div>
            <div style={{ fontSize: 22, fontWeight: "bold", color: "#F5E6D3" }}>
              {pedRes.length === 0 ? "Todo en orden!" : pedRes.length + " productos por pedir"}
            </div>
            <div style={{ fontSize: 13, color: "#C8A882", marginTop: 4 }}>
              {ptRes} - {hrRes} - {respRes || "--"}
            </div>
            {confirmado
              ? <div style={{ color: "#C6F6D5", fontSize: 12, marginTop: 8 }}>Confirmado en Google Sheets</div>
              : <div style={{ color: "#FED7D7", fontSize: 12, marginTop: 8 }}>Guardado - pendiente de confirmacion</div>
            }
          </div>
          <div style={css.body}>
            {pedRes.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                {pedRes.map(function (item, i) {
                  return (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #F0F0F0" }}>
                      <span style={{ fontSize: 13, color: "#2D3748" }}>{item.prod}</span>
                      <span style={{ fontSize: 13, fontWeight: "bold", color: "#E53E3E" }}>{item.cantidad} und</span>
                    </div>
                  );
                })}
              </div>
            )}
            {pedRes.length === 0 && confirmado && (
              <div style={{ padding: 14, background: "#F0FFF4", borderRadius: 12, textAlign: "center", color: "#38A169", fontSize: 14, marginBottom: 16 }}>
                Todos los productos sobre el nivel minimo
              </div>
            )}
            {/* WhatsApp */}
            <div style={{ padding: 14, background: "#F0FFF4", borderRadius: 14, border: "2px solid #C6F6D5", marginBottom: 16 }}>
              <div style={{ fontWeight: "bold", fontSize: 13, color: "#276749", marginBottom: 8 }}>Mensaje para WhatsApp</div>
              <textarea style={{ width: "100%", borderRadius: 8, border: "1px solid #C6F6D5", padding: 10, fontSize: 11, background: "#fff", resize: "none", fontFamily: "monospace", boxSizing: "border-box", lineHeight: 1.6 }} readOnly value={msgRes} rows={Math.min(14, msgRes.split("\n").length + 2)} />
              <button style={{ width: "100%", padding: 11, borderRadius: 10, border: "none", background: "#38A169", color: "#fff", fontSize: 13, fontWeight: "bold", cursor: "pointer", marginTop: 8 }} onClick={function () { if (navigator.clipboard) navigator.clipboard.writeText(msgRes); alert("Copiado!"); }}>
                Copiar mensaje
              </button>
            </div>
            <button style={{ ...css.btn, background: "#4A5568" }} onClick={reiniciar}>
              Nuevo cierre
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PANTALLA: INICIO (default)
  // ──────────────────────────────────────────────────────────────────────────
  var puntoCerrado = puntoActivo ? cierresEstado[puntoActivo] : false;

  return (
    <div style={css.page}>
      <div style={css.card}>
        <div style={css.hero}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>☕</div>
          <div style={{ fontSize: 24, fontWeight: "bold", letterSpacing: 1.5, color: "#F5E6D3" }}>Nossa Cafe</div>
          <div style={{ fontSize: 13, color: "#C8A882", marginTop: 4, fontStyle: "italic" }}>Cierre de turno</div>
        </div>
        <div style={css.body}>
          {/* Obrador */}
          <button style={{ ...css.btn, marginTop: 8, background: "linear-gradient(135deg,#334155,#1E293B)" }} onClick={function () { recargarEstado(); setScreen("obrador"); }}>
            Entrar como Obrador
          </button>

          {/* Estado cierres */}
          <div style={css.lbl}>
            Estado de cierres hoy
            {cargando && <span style={{ color: "#9CA3AF", fontWeight: "normal", marginLeft: 6 }}>actualizando...</span>}
          </div>
          <div style={{ borderRadius: 12, border: "1px solid #E5E7EB", overflow: "hidden", marginBottom: 4 }}>
            {PUNTOS.map(function (p, i) {
              var ok = cierresEstado[p];
              return (
                <div key={p} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", borderBottom: i < 2 ? "1px solid #F3F4F6" : "none", background: ok ? "#F0FFF4" : "#FAFAFA" }}>
                  <span style={{ fontSize: 13, fontWeight: "600", color: "#2D3748" }}>{p}</span>
                  <span style={{ fontSize: 11, fontWeight: "bold", color: ok ? "#15803D" : "#92400E", background: ok ? "#DCFCE7" : "#FEF3C7", padding: "3px 10px", borderRadius: 20 }}>
                    {ok ? "Completo" : "Pendiente"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Seleccion de punto */}
          <div style={css.lbl}>Desde que punto?</div>
          <div style={{ display: "flex", gap: 8 }}>
            {PUNTOS.map(function (p) {
              var cerrado = cierresEstado[p];
              return (
                <button key={p} style={{ flex: 1, padding: "12px 6px", borderRadius: 12, border: "2px solid " + (cerrado ? "#38A169" : puntoActivo === p ? "#7C5C3B" : "#E5D8CC"), background: puntoActivo === p ? "#7C5C3B" : "#FFF8F4", cursor: "pointer", fontSize: 13, fontWeight: "bold", color: puntoActivo === p ? "#fff" : "#7C5C3B", position: "relative" }} onClick={function () { setPuntoActivo(p); }}>
                  {p}
                  {cerrado && <span style={{ position: "absolute", top: -6, right: -6, background: "#38A169", color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>v</span>}
                </button>
              );
            })}
          </div>

          {/* Bloqueo si ya cerró */}
          {puntoCerrado ? (
            <div style={{ background: "#FFF7ED", border: "2px solid #F97316", borderRadius: 14, padding: "14px", margin: "12px 0" }}>
              <div style={{ fontWeight: "bold", fontSize: 14, color: "#92400E", marginBottom: 4 }}>Este punto ya realizo el cierre hoy</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>Registrado en Google Sheets.</div>
            </div>
          ) : (
            <div>
              <div style={css.lbl}>Quien cierra?</div>
              <input style={css.inp} placeholder="Tu nombre (opcional)" value={responsable} onChange={function (e) { setResponsable(e.target.value); }} />
              <div style={{ fontSize: 13, color: "#6B7280", margin: "10px 0", fontStyle: "italic" }}>Hora: {hora}</div>
              <button
                style={{ ...css.btn, opacity: puntoActivo && !saving ? 1 : 0.35 }}
                disabled={!puntoActivo || saving}
                onClick={function () {
                  if (!puntoActivo) { alert("Selecciona un punto antes de continuar."); return; }
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

          {/* Admin */}
          <button style={{ display: "block", width: "100%", marginTop: 12, padding: "10px", background: "transparent", border: "none", color: "#9CA3AF", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif", textDecoration: "underline" }} onClick={function () { setScreen("login"); }}>
            Acceso administrador
          </button>
        </div>
      </div>
    </div>
  );
}
