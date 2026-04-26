import { useState, useEffect, useCallback, useRef } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const DEFAULT_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyxs7uys-3iaRXEzYTBJLJRX2KIdjiixphwqSxUDvlyJykmrZOL2hNXGqq_I7KLUvCb0Q/exec";
const ADMIN_PASSWORD = "nossa2024";
const PUNTOS = ["Centro", "Primavera", "CF"];

// ─── CATEGORIAS ───────────────────────────────────────────────────────────────
const CATEGORIAS = [
  {
    id: "pasteleria", icon: "🥐", nombre: "Pasteleria",
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
    id: "cafeteria", icon: "C", nombre: "Cafeteria",
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
    id: "limpieza", icon: "L", nombre: "Limpieza",
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
    id: "empaques", icon: "E", nombre: "Empaques",
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
    id: "materias", icon: "M", nombre: "Materias Primas",
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
    id: "cf_extra", icon: "*", nombre: "Exclusivo CF",
    color: "#C2185B", bg: "#FFF0F5", obligatoria: false, soloEn: "CF",
    productos: [
      { nombre: "Muffin arandano frambuesa", min: 2, max: 6 },
      { nombre: "Gansito", min: 2, max: 6 },
    ],
  },
];

// ─── STORAGE (localStorage, config only) ─────────────────────────────────────
async function dbGet(k) {
  try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; }
}
async function dbSet(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
}

// ─── APPS SCRIPT HELPERS ─────────────────────────────────────────────────────
function getUrl() {
  // Try localStorage cache first, fall back to constant
  try {
    var cached = localStorage.getItem("nossa_url_cache");
    if (cached) return JSON.parse(cached);
  } catch (e) {}
  return DEFAULT_APPS_SCRIPT_URL;
}

async function fetchEstadoCierres() {
  var url = getUrl();
  var fecha = new Date().toISOString().slice(0, 10);
  var res = await fetch(url + "?action=estadoCierres&fecha=" + fecha);
  var data = await res.json();
  console.log("estadoCierres response:", data);
  // Expected: { success: true, cierres: { Centro: true, Primavera: false, CF: false } }
  if (data && data.success && data.cierres) return data.cierres;
  return { Centro: false, Primavera: false, CF: false };
}

async function guardarCierreEnSheets(cierre) {
  var url = getUrl();
  var fecha = new Date().toISOString().slice(0, 10);
  var datos = {
    hora: cierre.hora,
    responsable: cierre.responsable || "",
    pedido: cierre.pedido || [],
    productos: cierre.stocks || {},
  };
  var params = new URLSearchParams({
    action: "guardarCierre",
    fecha: fecha,
    punto: cierre.punto,
    datos: JSON.stringify(datos),
  });
  console.log("GET guardarCierre:", url + "?" + params.toString());
  var res = await fetch(url + "?" + params.toString());
  var data = await res.json();
  console.log("guardarCierre response:", data);
  return data;
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
var ST = {
  page:  { minHeight: "100vh", background: "#F2EDE8", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: 12, fontFamily: "Georgia, serif" },
  card:  { width: "100%", maxWidth: 480, background: "#fff", borderRadius: 20, boxShadow: "0 6px 40px rgba(0,0,0,0.12)", overflow: "hidden" },
  hero:  { background: "linear-gradient(160deg,#3D2B1F,#7C5C3B)", padding: "36px 24px 28px", textAlign: "center", color: "#fff" },
  body:  { padding: "8px 20px 24px" },
  lbl:   { fontSize: 11, color: "#6B7280", fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, margin: "18px 0 8px" },
  inp:   { width: "100%", padding: "13px 14px", borderRadius: 12, border: "2px solid #E5D8CC", fontSize: 15, outline: "none", fontFamily: "Georgia, serif", background: "#FFFAF7", boxSizing: "border-box" },
  btn:   { display: "block", width: "100%", padding: "17px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#C8873A,#7C5C3B)", color: "#fff", fontSize: 16, fontWeight: "bold", cursor: "pointer", fontFamily: "Georgia, serif", marginTop: 16 },
  bb:    { background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", padding: "7px 13px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontFamily: "Georgia, serif" },
  em:    { color: "#9CA3AF", fontSize: 13, fontStyle: "italic", textAlign: "center", padding: 20 },
  stit:  { fontWeight: "bold", fontSize: 15, color: "#2D3748", marginBottom: 10 },
  tab:   { padding: "12px 10px", border: "none", background: "transparent", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "Georgia, serif" },
};

// ─── PRODUCT ROW ──────────────────────────────────────────────────────────────
function ProductRow({ prod, idx, allProds, stocks, setStocks, flashKey, inputRefs, freshInput, minMax }) {
  var mm = (minMax && minMax[prod.nombre]) ? minMax[prod.nombre] : { min: prod.min, max: prod.max };
  var val = stocks[prod.nombre] !== undefined ? String(stocks[prod.nombre]) : "";
  var s = stocks[prod.nombre];
  var pedir = s === undefined ? null : s > mm.max ? "OVER" : s <= mm.min ? Math.max(0, mm.max - s) : 0;
  var filled = val !== "";
  var isOver = pedir === "OVER";
  var isAlert = filled && !isOver && typeof pedir === "number" && pedir > 0;
  var isOk = filled && !isOver && pedir === 0;
  var flashing = !!flashKey[prod.nombre];
  var bc = isOver ? "#DD6B20" : isAlert ? "#E53E3E" : isOk ? "#38A169" : "#E2E8F0";
  var tc = isOver ? "#DD6B20" : isAlert ? "#E53E3E" : isOk ? "#38A169" : "#2D3748";

  function flash() {
    setStocks(function (prev) { return Object.assign({}, prev); });
  }

  function adjust(delta) {
    setStocks(function (prev) {
      var cur = prev[prod.nombre] !== undefined ? prev[prod.nombre] : 0;
      var n = Object.assign({}, prev);
      n[prod.nombre] = Math.max(0, cur + delta);
      return n;
    });
  }

  var incr = useCallback(function () { adjust(1); }, [prod.nombre]);
  var decr = useCallback(function () { adjust(-1); }, [prod.nombre]);

  function onKeyDown(e) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    freshInput.current[prod.nombre] = false;
    var nxt = allProds[idx + 1] ? allProds[idx + 1].nombre : null;
    if (nxt && inputRefs.current[nxt]) inputRefs.current[nxt].focus();
    else e.target.blur();
  }

  function onFocus(e) {
    e.target.select();
    freshInput.current[prod.nombre] = true;
  }

  function onChange(e) {
    var raw = e.target.value;
    var clean = freshInput.current[prod.nombre] ? (raw.replace(/^0+/, "") || "0") : raw;
    freshInput.current[prod.nombre] = false;
    if (clean === "" || clean === "-") return;
    var n = Math.max(0, parseInt(clean) || 0);
    setStocks(function (prev) { var r = Object.assign({}, prev); r[prod.nombre] = n; return r; });
  }

  function onBlur(e) {
    var n = Math.max(0, parseInt(e.target.value) || 0);
    setStocks(function (prev) { var r = Object.assign({}, prev); r[prod.nombre] = n; return r; });
    freshInput.current[prod.nombre] = false;
  }

  return (
    <div style={{ padding: "11px 14px", borderBottom: "1px solid #F0F0F0", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, background: isOver ? "#FFFAF0" : isAlert ? "#FFF5F5" : isOk ? "#F0FFF4" : "#FAFAFA", borderLeft: "4px solid " + bc, transition: "background 0.15s, transform 0.1s", transform: flashing ? "scale(1.01)" : "scale(1)" }}>
      <div style={{ flex: 1, minWidth: 110 }}>
        <div style={{ fontSize: 13, fontWeight: "bold", color: "#2D3748" }}>{prod.nombre}</div>
        <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2 }}>Min {mm.min} Max {mm.max}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <button style={{ width: 36, height: 36, borderRadius: 8, border: "2px solid #E2E8F0", background: "#F7FAFC", cursor: "pointer", fontSize: 18, fontWeight: "bold", color: "#4A5568" }} onClick={decr}>-</button>
        <input ref={function (el) { inputRefs.current[prod.nombre] = el; }} className="prod-input"
          style={{ width: 54, height: 36, textAlign: "center", borderRadius: 8, border: "2px solid " + bc, fontSize: 18, fontWeight: "bold", outline: "none", color: tc }}
          type="number" inputMode="numeric" min="0" placeholder="?"
          value={val} onChange={onChange} onFocus={onFocus} onBlur={onBlur} onKeyDown={onKeyDown} enterKeyHint="next" />
        <button style={{ width: 36, height: 36, borderRadius: 8, border: "2px solid #E2E8F0", background: "#F7FAFC", cursor: "pointer", fontSize: 18, fontWeight: "bold", color: "#4A5568" }} onClick={incr}>+</button>
      </div>
      <div style={{ width: "100%", paddingLeft: 2, fontSize: 11, fontWeight: "bold" }}>
        {isOver && <span style={{ color: "#DD6B20" }}>Sobre maximo</span>}
        {isAlert && <span style={{ color: "#E53E3E" }}>Pedir {pedir}</span>}
        {isOk && <span style={{ color: "#38A169" }}>OK</span>}
      </div>
    </div>
  );
}

// ─── OBRADOR VIEW ─────────────────────────────────────────────────────────────
function ObradorView({ cierresRaw, despacho, setDespacho, onBack }) {
  var [tab, setTab] = useState("prod");
  var todayStr = new Date().toLocaleDateString("es-CO");

  // cierresRaw: array of cierre objects from Sheets OR { Centro: bool, ... }
  // Normalize to array for display; handle both formats
  var cierresArr = Array.isArray(cierresRaw) ? cierresRaw : [];
  var estadoMap = {};
  if (cierresRaw && !Array.isArray(cierresRaw) && typeof cierresRaw === "object") {
    estadoMap = cierresRaw; // { Centro: true, Primavera: false, CF: false }
  } else {
    PUNTOS.forEach(function (p) {
      estadoMap[p] = cierresArr.some(function (c) { return c.punto === p; });
    });
  }

  var cerrados = PUNTOS.filter(function (p) { return estadoMap[p]; }).length;
  var faltantes = PUNTOS.filter(function (p) { return !estadoMap[p]; });

  // Build totals from cierresArr if available
  var totalesMap = {};
  cierresArr.forEach(function (c) {
    var productos = c.productos || c.datos || {};
    Object.keys(productos).forEach(function (k) {
      if (!totalesMap[k]) totalesMap[k] = 0;
      totalesMap[k] += productos[k] || 0;
    });
  });
  var totales = Object.keys(totalesMap).map(function (k) { return { prod: k, total: totalesMap[k] }; }).sort(function (a, b) { return b.total - a.total; });
  var maxT = totales.length > 0 ? totales[0].total : 1;
  var env = PUNTOS.filter(function (p) { return despacho[p]; }).length;

  async function toggleDesp(p) {
    var u = Object.assign({}, despacho);
    u[p] = !despacho[p];
    setDespacho(u);
    await dbSet("nossa_obra_desp", u);
  }

  return (
    <div style={ST.page}>
      <div style={ST.card}>
        <div style={{ background: "linear-gradient(160deg,#3D2B1F,#7C5C3B)", padding: "20px 20px 16px", color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: "bold", color: "#F5E6D3" }}>Obrador</div>
              <div style={{ fontSize: 13, color: "#C8A882", fontStyle: "italic", textTransform: "capitalize" }}>{new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}</div>
            </div>
            <button style={ST.bb} onClick={onBack}>Salir</button>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: "bold", background: cerrados === 3 ? "rgba(255,255,255,0.25)" : "rgba(249,115,22,0.35)", color: "#fff", padding: "4px 12px", borderRadius: 20 }}>{cerrados}/3 cerrados</span>
            <span style={{ fontSize: 11, fontWeight: "bold", background: "rgba(255,255,255,0.15)", color: "#fff", padding: "4px 12px", borderRadius: 20 }}>{env}/3 enviados</span>
          </div>
          {faltantes.length > 0 && <div style={{ marginTop: 10, background: "rgba(249,115,22,0.25)", borderRadius: 10, padding: "8px 12px", fontSize: 12, color: "#FED7AA", fontWeight: "600" }}>Falta: {faltantes.join(", ")}</div>}
        </div>
        <div style={{ display: "flex", borderBottom: "2px solid #F0F0F0", background: "#FAFAFA" }}>
          <button onClick={function () { setTab("prod"); }} style={{ ...ST.tab, flex: 1, color: tab === "prod" ? "#1E293B" : "#9CA3AF", fontWeight: tab === "prod" ? "bold" : "normal", borderBottom: tab === "prod" ? "3px solid #1E293B" : "3px solid transparent" }}>Produccion</button>
          <button onClick={function () { setTab("desp"); }} style={{ ...ST.tab, flex: 1, color: tab === "desp" ? "#1E293B" : "#9CA3AF", fontWeight: tab === "desp" ? "bold" : "normal", borderBottom: tab === "desp" ? "3px solid #1E293B" : "3px solid transparent" }}>Despacho</button>
        </div>
        <div style={{ padding: "16px 16px 32px", overflowY: "auto", maxHeight: "62vh" }}>
          {tab === "prod" && (
            <div>
              {totales.length === 0 && <div style={ST.em}>Sin datos de pedidos hoy. Los pedidos aparecen aqui cuando cada punto cierra.</div>}
              {totales.map(function (t) {
                var pct = Math.round((t.total / maxT) * 100);
                var hi = t.total >= 25;
                return (
                  <div key={t.prod} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #F8FAFC" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: "600", color: "#2D3748", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {t.prod} {hi && <span style={{ fontSize: 9, background: "#FFF7ED", color: "#C2410C", border: "1px solid #FED7AA", padding: "1px 6px", borderRadius: 10, fontWeight: "bold" }}>alto</span>}
                      </div>
                    </div>
                    <div style={{ width: 72, height: 6, background: "#F1F5F9", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 3, width: pct + "%", background: hi ? "#F97316" : "#7C5C3B" }} />
                    </div>
                    <span style={{ fontSize: 16, fontWeight: "bold", minWidth: 26, textAlign: "right", color: hi ? "#C2410C" : "#1E293B" }}>{t.total}</span>
                  </div>
                );
              })}
            </div>
          )}
          {tab === "desp" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {PUNTOS.map(function (p) {
                var sent = despacho[p];
                var completo = estadoMap[p];
                return (
                  <div key={p} style={{ borderRadius: 14, border: "2px solid " + (sent ? "#38A169" : completo ? "#E2E8F0" : "#FED7AA"), background: "#fff", opacity: sent ? 0.85 : 1 }}>
                    <div style={{ padding: "13px 14px", background: sent ? "#F0FFF4" : completo ? "#FAFAFA" : "#FFF7ED", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: "bold", color: "#2D3748" }}>{p}</div>
                        {completo ? <div style={{ fontSize: 11, color: "#15803D", marginTop: 2 }}>Cierre registrado en Sheets</div> : <div style={{ fontSize: 11, color: "#D97706", marginTop: 2 }}>Sin cierre registrado</div>}
                      </div>
                      <button disabled={!completo} onClick={function () { toggleDesp(p); }} style={{ padding: "9px 14px", borderRadius: 20, border: "1.5px solid " + (sent ? "#38A169" : completo ? "#7C5C3B" : "#E2E8F0"), cursor: completo ? "pointer" : "not-allowed", fontSize: 12, fontWeight: "bold", background: sent ? "#38A169" : "#fff", color: sent ? "#fff" : completo ? "#7C5C3B" : "#9CA3AF" }}>
                        {sent ? "Enviado" : completo ? "Marcar enviado" : "Pendiente"}
                      </button>
                    </div>
                  </div>
                );
              })}
              {env === 3 && <div style={{ background: "#F0FFF4", border: "2px solid #38A169", borderRadius: 14, padding: 16, textAlign: "center", fontSize: 15, fontWeight: "bold", color: "#15803D" }}>Todos los pedidos enviados</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN VIEW ───────────────────────────────────────────────────────────────
function AdminView({ cierresEstado, minMax, saveMinMax, onBack }) {
  var [tab, setTab] = useState("pedidos");
  var [editMM, setEditMM] = useState(null);
  var [eMin, setEMin] = useState("");
  var [eMax, setEMax] = useState("");
  var [urlInput, setUrlInput] = useState(getUrl());

  async function saveUrl() {
    await dbSet("nossa_url_cache", urlInput);
    alert("URL guardada localmente. Se usara en el proximo inicio.");
  }

  var tabs = [["pedidos", "Cierres"], ["minmax", "Min/Max"], ["sheets", "Sheets"]];

  return (
    <div style={ST.page}>
      <div style={{ ...ST.card, padding: 0, overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(160deg,#3D2B1F,#7C5C3B)", padding: "20px 20px 0", color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: "bold", color: "#F5E6D3" }}>Panel Admin</div>
              <div style={{ fontSize: 13, color: "#C8A882", fontStyle: "italic" }}>Nossa Cafe</div>
            </div>
            <button style={ST.bb} onClick={onBack}>Salir</button>
          </div>
        </div>
        <div style={{ display: "flex", overflowX: "auto", borderBottom: "2px solid #F0F0F0", background: "#FAFAFA" }}>
          {tabs.map(function (pair) {
            return <button key={pair[0]} onClick={function () { setTab(pair[0]); }} style={{ ...ST.tab, color: tab === pair[0] ? "#7C5C3B" : "#9CA3AF", fontWeight: tab === pair[0] ? "bold" : "normal", borderBottom: tab === pair[0] ? "3px solid #7C5C3B" : "3px solid transparent" }}>{pair[1]}</button>;
          })}
        </div>
        <div style={{ padding: "16px 16px 32px", overflowY: "auto", maxHeight: "65vh" }}>
          {tab === "pedidos" && (
            <div>
              <div style={ST.stit}>Estado cierres hoy</div>
              {PUNTOS.map(function (p) {
                var completo = cierresEstado[p];
                return (
                  <div key={p} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#FAFAFA", borderRadius: 10, marginBottom: 8, borderLeft: "4px solid " + (completo ? "#38A169" : "#E2E8F0") }}>
                    <div style={{ fontSize: 14, fontWeight: "bold", color: "#2D3748" }}>{p}</div>
                    <span style={{ fontSize: 12, fontWeight: "bold", padding: "4px 12px", borderRadius: 20, background: completo ? "#DCFCE7" : "#FEF3C7", color: completo ? "#15803D" : "#92400E" }}>{completo ? "Completo" : "Pendiente"}</span>
                  </div>
                );
              })}
            </div>
          )}
          {tab === "minmax" && (
            <div>
              <div style={ST.stit}>Minimos y Maximos</div>
              {CATEGORIAS.map(function (cat) {
                return (
                  <div key={cat.id} style={{ marginBottom: 18 }}>
                    <div style={{ color: cat.color, fontWeight: "bold", fontSize: 12, margin: "0 0 8px" }}>{cat.nombre}</div>
                    <div style={{ background: "#FAFAFA", borderRadius: 12, border: "1px solid #F1F5F9", overflow: "hidden" }}>
                      {cat.productos.map(function (prod, i) {
                        var mm = (minMax && minMax[prod.nombre]) ? minMax[prod.nombre] : { min: prod.min, max: prod.max };
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
                                <input style={{ width: 40, padding: "6px 8px", borderRadius: 8, border: "1.5px solid #CBD5E0", fontSize: 14, textAlign: "center" }} type="number" value={eMin} onChange={function (e) { setEMin(e.target.value); }} />
                                <input style={{ width: 40, padding: "6px 8px", borderRadius: 8, border: "1.5px solid #CBD5E0", fontSize: 14, textAlign: "center" }} type="number" value={eMax} onChange={function (e) { setEMax(e.target.value); }} />
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
              <button style={{ ...ST.btn, background: "#4A5568", marginTop: 4 }} onClick={function () { saveMinMax({}); alert("Restablecido."); }}>Restablecer</button>
            </div>
          )}
          {tab === "sheets" && (
            <div>
              <div style={ST.stit}>URL de Apps Script</div>
              <div style={{ background: "#EFF6FF", border: "1.5px solid #BFDBFE", borderRadius: 12, padding: 14, fontSize: 13, color: "#1E40AF", marginBottom: 14, lineHeight: 1.6 }}>
                Todos los dispositivos usan la URL hardcodeada en el codigo. Aqui puedes sobreescribirla solo en este dispositivo como cache local.
              </div>
              <div style={ST.lbl}>URL actual</div>
              <input style={ST.inp} placeholder="https://script.google.com/..." value={urlInput} onChange={function (e) { setUrlInput(e.target.value); }} />
              <button style={{ ...ST.btn, marginTop: 8 }} onClick={saveUrl}>Guardar en este dispositivo</button>
              <div style={{ marginTop: 12, fontSize: 12, color: "#9CA3AF" }}>
                Para cambiar para todos: edita DEFAULT_APPS_SCRIPT_URL en App.jsx y redespliega en Vercel.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function NossaCafe() {
  // ── State ──────────────────────────────────────────────────────────────────
  var [screen, setScreen]         = useState("inicio");
  var [punto, setPunto]           = useState(null);
  var [responsable, setResponsable] = useState("");
  var [hora, setHora]             = useState("");
  var [catIdx, setCatIdx]         = useState(0);
  var [skipped, setSkipped]       = useState({});
  var [stocks, setStocks]         = useState({});
  var [minMax, setMinMax]         = useState({});
  var [adminPass, setAdminPass]   = useState("");
  var [adminErr, setAdminErr]     = useState(false);
  var [syncStatus, setSyncStatus] = useState(""); // "syncing" | "ok" | "error"
  var [flashKey, setFlashKey]     = useState({});
  var [despacho, setDespacho]     = useState({ Centro: false, Primavera: false, CF: false });
  var [modoEdicion, setModoEdicion] = useState(false);

  // Estado de cierres — SOLO viene de Sheets, nunca de localStorage
  // { Centro: true/false, Primavera: true/false, CF: true/false }
  var [cierresEstado, setCierresEstado] = useState({ Centro: false, Primavera: false, CF: false });
  var [cargandoCierres, setCargandoCierres] = useState(false);

  var inputRefs  = useRef({});
  var freshInput = useRef({});

  // ── Boot ───────────────────────────────────────────────────────────────────
  useEffect(function () {
    var now = new Date();
    setHora(now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0"));
    (async function () {
      var mm  = await dbGet("nossa_minmax")    || {};
      var dep = await dbGet("nossa_obra_desp") || { Centro: false, Primavera: false, CF: false };
      setMinMax(mm); setDespacho(dep);
      await recargarEstadoCierres();
    })();
  }, []);

  // Auto-focus first input when entering a category
  useEffect(function () {
    if (screen !== "categoria") return;
    var t = setTimeout(function () {
      var f = document.querySelector(".prod-input");
      if (f) f.focus();
    }, 150);
    return function () { clearTimeout(t); };
  }, [catIdx, screen]);

  // ── Sheets helpers ─────────────────────────────────────────────────────────
  async function recargarEstadoCierres() {
    setCargandoCierres(true);
    try {
      var estado = await fetchEstadoCierres();
      setCierresEstado(estado);
    } catch (e) {
      console.error("fetchEstadoCierres error:", e);
    }
    setCargandoCierres(false);
  }

  // ── Config helpers ─────────────────────────────────────────────────────────
  async function saveMinMax(updated) {
    await dbSet("nossa_minmax", updated);
    setMinMax(updated);
  }

  function getMM(nombre, defaults) {
    return (minMax && minMax[nombre]) ? minMax[nombre] : { min: defaults.min, max: defaults.max };
  }

  // ── Category helpers ───────────────────────────────────────────────────────
  function getCategorias() {
    return CATEGORIAS
      .filter(function (c) { return !c.soloEn || c.soloEn === punto; })
      .map(function (c) {
        return Object.assign({}, c, {
          productos: c.productos.map(function (p) {
            var mm = getMM(p.nombre, p);
            return { nombre: p.nombre, min: mm.min, max: mm.max };
          }),
        });
      });
  }

  var categorias = getCategorias();
  var cat = categorias[catIdx] || categorias[0];

  function getPedir(prod) {
    var s = stocks[prod.nombre];
    if (s === undefined) return null;
    var mm = getMM(prod.nombre, prod);
    if (s > mm.max) return "OVER";
    return s <= mm.min ? Math.max(0, mm.max - s) : 0;
  }

  function catCompleta(c) {
    return skipped[c.id] || c.productos.every(function (p) { return stocks[p.nombre] !== undefined; });
  }

  function generarMensaje() {
    var fecha = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
    var msg = "CIERRE - " + punto + "\n" + fecha + "  " + hora + "  " + (responsable || "--") + "\n\n";
    var conPedido = categorias.filter(function (c) { return !skipped[c.id]; }).flatMap(function (c) {
      return c.productos.filter(function (p) { var v = getPedir(p); return typeof v === "number" && v > 0; });
    });
    if (!conPedido.length) return msg + "Sin pedidos pendientes.";
    msg += "PEDIR:\n\n";
    categorias.filter(function (c) { return !skipped[c.id]; }).forEach(function (c) {
      var items = c.productos.filter(function (p) { var v = getPedir(p); return typeof v === "number" && v > 0; });
      if (!items.length) return;
      msg += c.nombre + ":\n";
      items.forEach(function (p) { msg += "  - " + p.nombre + ": " + getPedir(p) + " und\n"; });
      msg += "\n";
    });
    return msg;
  }

  // ── Submit cierre — GET based ──────────────────────────────────────────────
  async function submitCierre() {
    setSyncStatus("syncing");
    try {
      var pedido = categorias.filter(function (c) { return !skipped[c.id]; }).flatMap(function (c) {
        return c.productos
          .filter(function (p) { var v = getPedir(p); return typeof v === "number" && v > 0; })
          .map(function (p) { return { cat: c.nombre, prod: p.nombre, cantidad: getPedir(p) }; });
      });

      var cierre = {
        hora: hora,
        punto: punto,
        responsable: responsable,
        skipped: skipped,
        pedido: pedido,
        stocks: Object.assign({}, stocks),
      };

      var data = await guardarCierreEnSheets(cierre);

      if (data && data.success === false) {
        var msg = data.error || "Apps Script devolvio success:false";
        if (data.duplicate) {
          alert("Este punto ya tiene un cierre hoy. Usa la opcion Agregar correccion si necesitas ajustar.");
        } else {
          alert("Error desde Apps Script: " + msg);
        }
        setSyncStatus("error");
        setTimeout(function () { setSyncStatus(""); }, 5000);
        return;
      }

      setSyncStatus("ok");
      setTimeout(function () { setSyncStatus(""); }, 3000);
      // Re-fetch para confirmar que Sheets tiene el cierre antes de mostrar completo
      await recargarEstadoCierres();
      setModoEdicion(false);
      setScreen("resumen");
    } catch (e) {
      console.error("submitCierre error:", e);
      alert("Error al guardar el cierre:\n" + e.message);
      setSyncStatus("error");
      setTimeout(function () { setSyncStatus(""); }, 5000);
    }
  }

  // ── Other flows ────────────────────────────────────────────────────────────
  function tryLogin() {
    if (adminPass === ADMIN_PASSWORD) { setScreen("admin"); setAdminErr(false); setAdminPass(""); }
    else { setAdminErr(true); setTimeout(function () { setAdminErr(false); }, 2000); }
  }

  function reiniciar() {
    setPunto(null); setResponsable(""); setCatIdx(0);
    setSkipped({}); setStocks({}); setModoEdicion(false);
    freshInput.current = {}; inputRefs.current = {};
    var now = new Date();
    setHora(now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0"));
    recargarEstadoCierres(); // refresh from Sheets
    setScreen("inicio");
  }

  var todayStr = new Date().toLocaleDateString("es-CO");
  var puntoCerradoHoy = punto ? cierresEstado[punto] : false;

  // ── SCREENS ────────────────────────────────────────────────────────────────

  if (screen === "obrador") {
    return <ObradorView cierresRaw={cierresEstado} despacho={despacho} setDespacho={setDespacho} onBack={function () { recargarEstadoCierres(); setScreen("inicio"); }} />;
  }

  if (screen === "admin") {
    return <AdminView cierresEstado={cierresEstado} minMax={minMax} saveMinMax={saveMinMax} onBack={function () { setScreen("inicio"); }} />;
  }

  if (screen === "login") {
    return (
      <div style={ST.page}>
        <div style={{ ...ST.card, maxWidth: 360 }}>
          <div style={{ background: "linear-gradient(160deg,#3D2B1F,#7C5C3B)", padding: "28px 24px", textAlign: "center", color: "#fff" }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🔒</div>
            <div style={{ fontSize: 22, fontWeight: "bold", color: "#F5E6D3" }}>Administrador</div>
          </div>
          <div style={ST.body}>
            <div style={ST.lbl}>Contrasena</div>
            <input style={{ ...ST.inp, letterSpacing: 4 }} type="password" placeholder="..." value={adminPass} onChange={function (e) { setAdminPass(e.target.value); }} onKeyDown={function (e) { if (e.key === "Enter") tryLogin(); }} />
            {adminErr && <div style={{ color: "#E53E3E", fontSize: 13, textAlign: "center", margin: "8px 0", fontWeight: "bold" }}>Contrasena incorrecta</div>}
            <button style={ST.btn} onClick={tryLogin}>Entrar</button>
            <button style={{ display: "block", textAlign: "center", marginTop: 12, color: "#6B7280", fontSize: 13, cursor: "pointer", background: "none", border: "none" }} onClick={function () { setScreen("inicio"); }}>Volver</button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "categoria") {
    var pct = Math.round((catIdx / categorias.length) * 100);
    var done = catCompleta(cat);
    return (
      <div style={ST.page}>
        <div style={{ ...ST.card, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "18px 18px 14px", color: "#fff", background: cat.color }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <button style={ST.bb} onClick={function () { catIdx === 0 ? setScreen("inicio") : setCatIdx(catIdx - 1); }}>Atras</button>
              <span style={{ fontSize: 11, background: "rgba(255,255,255,0.22)", padding: "4px 12px", borderRadius: 20 }}>{punto}</span>
            </div>
            <div style={{ fontSize: 38, textAlign: "center" }}>{cat.icon}</div>
            <div style={{ fontSize: 18, fontWeight: "bold", textAlign: "center", margin: "4px 0 2px" }}>{cat.nombre}</div>
            <div style={{ textAlign: "center", fontSize: 11, opacity: 0.75 }}>{catIdx + 1} / {categorias.length}</div>
            {modoEdicion && <div style={{ background: "rgba(249,115,22,0.25)", borderRadius: 8, padding: "4px 12px", textAlign: "center", fontSize: 11, marginTop: 6, fontWeight: "bold" }}>MODO EDICION</div>}
            <div style={{ height: 5, background: "rgba(255,255,255,0.3)", borderRadius: 3, marginTop: 12 }}>
              <div style={{ height: "100%", background: "#fff", borderRadius: 3, width: pct + "%", transition: "width 0.4s" }} />
            </div>
          </div>
          {!cat.obligatoria && !skipped[cat.id] && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid #E5E7EB", gap: 8, flexWrap: "wrap", background: cat.bg }}>
              <span style={{ color: cat.color, fontSize: 13 }}>Revisaste esta categoria hoy?</span>
              <button style={{ fontSize: 12, padding: "7px 12px", borderRadius: 20, border: "1.5px solid " + cat.color, background: "transparent", cursor: "pointer", color: cat.color }} onClick={function () {
                var ns = Object.assign({}, skipped); ns[cat.id] = true; setSkipped(ns);
                if (catIdx < categorias.length - 1) setCatIdx(catIdx + 1); else submitCierre();
              }}>Omitir</button>
            </div>
          )}
          {skipped[cat.id] && (
            <div style={{ background: "#F3F4F6", padding: "10px 16px", fontSize: 13, color: "#6B7280", borderBottom: "1px solid #E5E7EB" }}>
              Categoria omitida -{" "}
              <button style={{ background: "none", border: "none", color: "#3B82F6", cursor: "pointer", fontSize: 13, textDecoration: "underline" }} onClick={function () { var ns = Object.assign({}, skipped); ns[cat.id] = false; setSkipped(ns); }}>Deshacer</button>
            </div>
          )}
          {!skipped[cat.id] && (
            <div>
              <div style={{ padding: "10px 16px", fontSize: 13, fontStyle: "italic", borderBottom: "1px solid #E5E7EB", color: cat.color }}>Cuantas unidades quedan ahora mismo?</div>
              <div style={{ overflowY: "auto", maxHeight: "44vh" }}>
                {cat.productos.map(function (prod, idx) {
                  return <ProductRow key={prod.nombre} prod={prod} idx={idx} allProds={cat.productos} stocks={stocks} setStocks={setStocks} flashKey={flashKey} inputRefs={inputRefs} freshInput={freshInput} minMax={minMax} />;
                })}
              </div>
            </div>
          )}
          <div style={{ padding: 14, borderTop: "1px solid #F0F0F0", background: "#FAFAFA" }}>
            {!done && !skipped[cat.id] && <div style={{ textAlign: "center", color: "#D97706", fontSize: 11, marginBottom: 8, fontStyle: "italic" }}>Completa todos los productos para continuar</div>}
            {syncStatus === "syncing" && <div style={{ textAlign: "center", color: "#6B7280", fontSize: 12, marginBottom: 8 }}>Guardando en Google Sheets...</div>}
            <button style={{ ...ST.btn, marginTop: 0, opacity: done ? 1 : 0.35 }} disabled={!done || syncStatus === "syncing"} onClick={function () {
              if (catIdx < categorias.length - 1) setCatIdx(catIdx + 1);
              else submitCierre();
            }}>
              {catIdx < categorias.length - 1 ? ("Siguiente: " + (categorias[catIdx + 1] ? categorias[catIdx + 1].nombre : "")) : syncStatus === "syncing" ? "Guardando..." : "Ver resumen"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "resumen") {
    var aPedir = categorias.filter(function (c) { return !skipped[c.id]; }).flatMap(function (c) {
      return c.productos.filter(function (p) { var v = getPedir(p); return typeof v === "number" && v > 0; });
    });
    var mensaje = generarMensaje();
    var puntoResumen = punto || (cierres.length > 0 ? cierres[0].punto : "");
var confirmado = cierresEstado[puntoResumen];
    return (
      <div style={ST.page}>
        <div style={ST.card}>
          <div style={{ background: "linear-gradient(160deg,#3D2B1F,#7C5C3B)", padding: "36px 24px 20px", textAlign: "center", color: "#fff" }}>
            <div style={{ fontSize: 52 }}>{confirmado ? "✓" : syncStatus === "error" ? "!" : "..."}</div>
            <div style={{ fontSize: 22, fontWeight: "bold", color: "#F5E6D3" }}>
              {confirmado ? (aPedir.length === 0 ? "Todo en orden!" : aPedir.length + " productos por pedir") : syncStatus === "error" ? "Error al guardar" : "Guardando..."}
            </div>
            <div style={{ fontSize: 13, color: "#C8A882", marginTop: 4 }}>{puntoResumen} - {hora} - {responsable || "--"}</div>
            {confirmado && <div style={{ color: "#C6F6D5", fontSize: 12, marginTop: 8 }}>Confirmado en Google Sheets</div>}
            {syncStatus === "error" && <div style={{ color: "#FED7D7", fontSize: 12, marginTop: 8 }}>No se pudo confirmar en Sheets</div>}
          </div>
          <div style={ST.body}>
            {aPedir.length > 0 && categorias.filter(function (c) { return !skipped[c.id]; }).map(function (c) {
              var items = c.productos.filter(function (p) { var v = getPedir(p); return typeof v === "number" && v > 0; });
              if (!items.length) return null;
              return (
                <div key={c.id} style={{ padding: "10px 12px", borderRadius: 10, background: "#FAFAFA", marginBottom: 10, borderLeft: "4px solid " + c.color }}>
                  <div style={{ color: c.color, fontWeight: "bold", fontSize: 13, marginBottom: 8 }}>{c.nombre}</div>
                  {items.map(function (p) {
                    return (
                      <div key={p.nombre} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid #F0F0F0" }}>
                        <span style={{ fontSize: 13 }}>{p.nombre}</span>
                        <span style={{ color: "#E53E3E", fontWeight: "bold", fontSize: 13 }}>{getPedir(p)} und</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {aPedir.length === 0 && confirmado && <div style={{ padding: 16, background: "#F0FFF4", borderRadius: 12, textAlign: "center", color: "#38A169", fontSize: 14, marginBottom: 16 }}>Todos los productos sobre el nivel minimo</div>}
            <div style={{ padding: 14, background: "#F0FFF4", borderRadius: 14, border: "2px solid #C6F6D5", marginBottom: 16 }}>
              <div style={{ fontWeight: "bold", fontSize: 13, color: "#276749", marginBottom: 8 }}>Mensaje WhatsApp</div>
              <textarea style={{ width: "100%", borderRadius: 8, border: "1px solid #C6F6D5", padding: 10, fontSize: 11, color: "#2D3748", background: "#fff", resize: "none", fontFamily: "monospace", boxSizing: "border-box", lineHeight: 1.6 }} readOnly value={mensaje} rows={Math.min(14, mensaje.split("\n").length + 2)} />
              <button style={{ width: "100%", padding: 11, borderRadius: 10, border: "none", background: "#38A169", color: "#fff", fontSize: 13, fontWeight: "bold", cursor: "pointer", marginTop: 8 }} onClick={function () { if (navigator.clipboard) navigator.clipboard.writeText(mensaje); alert("Copiado!"); }}>Copiar</button>
            </div>
            <button style={{ ...ST.btn, background: "#4A5568" }} onClick={reiniciar}>Nuevo cierre</button>
          </div>
        </div>
      </div>
    );
  }

  // ── INICIO ─────────────────────────────────────────────────────────────────
  return (
    <div style={ST.page}>
      <div style={ST.card}>
        <div style={ST.hero}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>☕</div>
          <div style={{ fontSize: 26, fontWeight: "bold", letterSpacing: 1.5, color: "#F5E6D3" }}>Nossa Cafe</div>
          <div style={{ fontSize: 13, color: "#C8A882", marginTop: 4, fontStyle: "italic" }}>Cierre de turno</div>
        </div>
        <div style={ST.body}>
          <button style={{ ...ST.btn, marginTop: 8, background: "linear-gradient(135deg,#334155,#1E293B)" }} onClick={function () { recargarEstadoCierres(); setScreen("obrador"); }}>
            Entrar como Obrador
          </button>

          <div style={ST.lbl}>Estado de cierres hoy {cargandoCierres && <span style={{ color: "#9CA3AF", fontWeight: "normal" }}>cargando...</span>}</div>
          <div style={{ borderRadius: 12, border: "1px solid #E5E7EB", overflow: "hidden", marginBottom: 4 }}>
            {PUNTOS.map(function (p, i) {
              var completo = cierresEstado[p];
              return (
                <div key={p} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", borderBottom: i < 2 ? "1px solid #F3F4F6" : "none", background: completo ? "#F0FFF4" : "#FAFAFA" }}>
                  <span style={{ fontSize: 13, fontWeight: "600", color: "#2D3748" }}>{p}</span>
                  <span style={{ fontSize: 11, fontWeight: "bold", color: completo ? "#15803D" : "#92400E", background: completo ? "#DCFCE7" : "#FEF3C7", padding: "3px 10px", borderRadius: 20 }}>
                    {completo ? "Completo" : "Pendiente"}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={ST.lbl}>Desde que punto?</div>
          <div style={{ display: "flex", gap: 8 }}>
            {PUNTOS.map(function (p) {
              var cerrado = cierresEstado[p];
              return (
                <button key={p} style={{ flex: 1, padding: "13px 6px", borderRadius: 12, border: "2px solid " + (cerrado ? "#38A169" : "#E5D8CC"), background: punto === p ? "#7C5C3B" : "#FFF8F4", cursor: "pointer", fontSize: 13, fontWeight: "bold", color: punto === p ? "#fff" : "#7C5C3B", position: "relative" }} onClick={function () { setPunto(p); }}>
                  {p}
                  {cerrado && <span style={{ position: "absolute", top: -6, right: -6, background: "#38A169", color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>v</span>}
                </button>
              );
            })}
          </div>

          {puntoCerradoHoy ? (
            <div style={{ background: "#FFF7ED", border: "2px solid #F97316", borderRadius: 14, padding: "16px", margin: "12px 0" }}>
              <div style={{ fontWeight: "bold", fontSize: 14, color: "#92400E", marginBottom: 4 }}>Este punto ya realizo el cierre hoy</div>
              <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 12 }}>Registrado en Google Sheets.</div>
            </div>
          ) : (
            <div>
              <div style={ST.lbl}>Quien cierra?</div>
              <input style={ST.inp} placeholder="Tu nombre (opcional)" value={responsable} onChange={function (e) { setResponsable(e.target.value); }} />
              <div style={{ fontSize: 13, color: "#6B7280", margin: "12px 0", fontStyle: "italic" }}>Hora: {hora}</div>
              <button style={{ ...ST.btn, opacity: punto ? 1 : 0.35 }} disabled={!punto} onClick={function () { setCatIdx(0); setScreen("categoria"); }}>
                Iniciar revision
              </button>
            </div>
          )}

          <button style={{ display: "block", width: "100%", marginTop: 12, padding: "10px", background: "transparent", border: "none", color: "#9CA3AF", fontSize: 12, cursor: "pointer", fontFamily: "Georgia, serif", textDecoration: "underline" }} onClick={function () { setScreen("login"); }}>
            Acceso administrador
          </button>
        </div>
      </div>
    </div>
  );
}
