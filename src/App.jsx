import { useState, useEffect, useCallback, useRef } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const PUNTOS = ["Centro", "Primavera", "CF"];
const ADMIN_PASSWORD = "nossa2024";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
// Fallback URL — used only if getConfig fails AND localStorage has no cache
const DEFAULT_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxys7uys-3iaRXEzYTBJLJRX2KldjijixphwqSxUDvlyJykmrZOL2hNXGqq_I7KLuvCb0Q/exec";

const CATEGORIAS = [
  {
    id: "pasteleria",
    icon: "🥐",
    nombre: "Pasteleria",
    color: "#7C5C3B",
    bg: "#FFF8F0",
    obligatoria: true,
    soloEn: null,
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
    id: "cafeteria",
    icon: "C",
    nombre: "Cafeteria",
    color: "#6B4226",
    bg: "#FDF6F0",
    obligatoria: false,
    soloEn: null,
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
    id: "limpieza",
    icon: "L",
    nombre: "Limpieza",
    color: "#2E7D6B",
    bg: "#F0FAF7",
    obligatoria: false,
    soloEn: null,
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
    id: "empaques",
    icon: "E",
    nombre: "Empaques",
    color: "#5C4DB1",
    bg: "#F5F3FF",
    obligatoria: false,
    soloEn: null,
    productos: [
      { nombre: "Bolsa manija grande", min: 15, max: 30 },
      { nombre: "Bolsa manija mediana", min: 15, max: 30 },
      { nombre: "Bolsa parafinada grande", min: 2, max: 4 },
      { nombre: "Bolsa parafinada pequena", min: 2, max: 4 },
      { nombre: "Servilletas", min: 1, max: 2 },
    ],
  },
  {
    id: "materias",
    icon: "M",
    nombre: "Materias Primas",
    color: "#3A7D44",
    bg: "#F1FAF2",
    obligatoria: false,
    soloEn: null,
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
    id: "cf_extra",
    icon: "*",
    nombre: "Exclusivo CF",
    color: "#C2185B",
    bg: "#FFF0F5",
    obligatoria: false,
    soloEn: "CF",
    productos: [
      { nombre: "Muffin arandano frambuesa", min: 2, max: 6 },
      { nombre: "Gansito", min: 2, max: 6 },
    ],
  },
];

// ─── STORAGE ──────────────────────────────────────────────────────────────────
async function dbGet(k) {
  try {
    const val = localStorage.getItem(k);
    return val ? JSON.parse(val) : null;
  } catch (e) {
    return null;
  }
}
async function dbSet(k, v) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch (e) {}
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  page: { minHeight: "100vh", background: "#F2EDE8", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: 12, fontFamily: "Georgia, serif" },
  card: { width: "100%", maxWidth: 480, background: "#fff", borderRadius: 20, boxShadow: "0 6px 40px rgba(0,0,0,0.12)", overflow: "hidden" },
  hero: { background: "linear-gradient(160deg,#3D2B1F,#7C5C3B)", padding: "36px 24px 28px", textAlign: "center", color: "#fff" },
  body: { padding: "8px 20px 24px" },
  lbl: { fontSize: 11, color: "#6B7280", fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, margin: "18px 0 8px" },
  inp: { width: "100%", padding: "13px 14px", borderRadius: 12, border: "2px solid #E5D8CC", fontSize: 15, outline: "none", fontFamily: "Georgia, serif", background: "#FFFAF7", boxSizing: "border-box" },
  btn: { display: "block", width: "100%", padding: "17px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#C8873A,#7C5C3B)", color: "#fff", fontSize: 16, fontWeight: "bold", cursor: "pointer", fontFamily: "Georgia, serif", marginTop: 16 },
  bb: { background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", padding: "7px 13px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontFamily: "Georgia, serif" },
  em: { color: "#9CA3AF", fontSize: 13, fontStyle: "italic", textAlign: "center", padding: 20 },
  st: { fontWeight: "bold", fontSize: 15, color: "#2D3748", marginBottom: 10 },
  tab: { padding: "12px 10px", border: "none", background: "transparent", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "Georgia, serif" },
};

// ─── PRODUCT ROW ──────────────────────────────────────────────────────────────
function ProductRow({ prod, idx, allProds, getStock, getPedir, setStock, setBlur, adjust, flashKey, inputRefs, freshInput }) {
  const val = getStock(prod.nombre);
  const pedir = getPedir(prod);
  const filled = val !== "" && val !== undefined;
  const isOver = pedir === "SOBRE_MAXIMO";
  const isAlert = filled && !isOver && typeof pedir === "number" && pedir > 0;
  const isOk = filled && !isOver && pedir === 0;
  const flashing = !!flashKey[prod.nombre];
  const pedirNum = typeof pedir === "number" && pedir > 0 ? pedir : 0;
  const incr = useCallback(function () { adjust(prod.nombre, 1); }, [prod.nombre, adjust]);
  const decr = useCallback(function () { adjust(prod.nombre, -1); }, [prod.nombre, adjust]);
  const bc = isOver ? "#DD6B20" : isAlert ? "#E53E3E" : isOk ? "#38A169" : "#E2E8F0";
  const tc = isOver ? "#DD6B20" : isAlert ? "#E53E3E" : isOk ? "#38A169" : "#2D3748";

  function onKeyDown(e) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    freshInput.current[prod.nombre] = false;
    const nxt = allProds[idx + 1] ? allProds[idx + 1].nombre : null;
    if (nxt && inputRefs.current[nxt]) inputRefs.current[nxt].focus();
    else e.target.blur();
  }

  function onFocus(e) {
    e.target.select();
    freshInput.current[prod.nombre] = true;
  }

  function onChange(e) {
    const raw = e.target.value;
    if (freshInput.current[prod.nombre]) {
      freshInput.current[prod.nombre] = false;
      setStock(prod.nombre, raw.replace(/^0+/, "") || "0");
    } else {
      setStock(prod.nombre, raw);
    }
  }

  function onBlur(e) {
    setBlur(prod.nombre, e.target.value);
    freshInput.current[prod.nombre] = false;
  }

  return (
    <div style={{ padding: "11px 14px", borderBottom: "1px solid #F0F0F0", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, background: isOver ? "#FFFAF0" : isAlert ? "#FFF5F5" : isOk ? "#F0FFF4" : "#FAFAFA", borderLeft: "4px solid " + bc, transition: "background 0.18s, transform 0.12s", transform: flashing ? "scale(1.01)" : "scale(1)" }}>
      <div style={{ flex: 1, minWidth: 110 }}>
        <div style={{ fontSize: 13, fontWeight: "bold", color: "#2D3748" }}>{prod.nombre}</div>
        <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2 }}>Min {prod.min} Max {prod.max}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <button style={{ width: 36, height: 36, borderRadius: 8, border: "2px solid #E2E8F0", background: "#F7FAFC", cursor: "pointer", fontSize: 18, fontWeight: "bold", color: "#4A5568" }} onClick={decr}>-</button>
        <input
          ref={function (el) { inputRefs.current[prod.nombre] = el; }}
          className="prod-input"
          style={{ width: 54, height: 36, textAlign: "center", borderRadius: 8, border: "2px solid " + bc, fontSize: 18, fontWeight: "bold", outline: "none", color: tc }}
          type="number" inputMode="numeric" min="0" placeholder="?"
          value={val}
          onChange={onChange} onFocus={onFocus} onBlur={onBlur} onKeyDown={onKeyDown}
          enterKeyHint="next"
        />
        <button style={{ width: 36, height: 36, borderRadius: 8, border: "2px solid #E2E8F0", background: "#F7FAFC", cursor: "pointer", fontSize: 18, fontWeight: "bold", color: "#4A5568" }} onClick={incr}>+</button>
      </div>
      <div style={{ width: "100%", paddingLeft: 2 }}>
        {isOver && <span style={{ color: "#DD6B20", fontSize: 11, fontWeight: "bold" }}>Sobre maximo</span>}
        {isAlert && <span style={{ color: "#E53E3E", fontSize: 11, fontWeight: "bold" }}>Pedir {pedirNum}</span>}
        {isOk && <span style={{ color: "#38A169", fontSize: 11, fontWeight: "bold" }}>OK</span>}
      </div>
    </div>
  );
}

// ─── OBRADOR VIEW ─────────────────────────────────────────────────────────────
function ObradorView({ cierres, despacho, setDespacho, onBack }) {
  const [tab, setTab] = useState("prod");

  const todayStr = new Date().toLocaleDateString("es-CO");
  const dateLabel = new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });

  const cierresHoy = PUNTOS.map(function (p) {
    return {
      punto: p,
      cierre: cierres.find(function (c) {
        return c.punto === p && !c.esCorreccion && new Date(c.fecha).toLocaleDateString("es-CO") === todayStr;
      }),
    };
  });

  const faltantes = cierresHoy.filter(function (x) { return !x.cierre; });
  const cerrados = PUNTOS.length - faltantes.length;

  var totalesMap = {};
  cierresHoy.forEach(function (entry) {
    if (!entry.cierre || !entry.cierre.pedido) return;
    entry.cierre.pedido.forEach(function (item) {
      if (!totalesMap[item.prod]) totalesMap[item.prod] = { total: 0, cat: item.cat };
      totalesMap[item.prod].total += item.cantidad;
    });
  });
  cierres.forEach(function (c) {
    if (!c.esCorreccion) return;
    if (new Date(c.fecha).toLocaleDateString("es-CO") !== todayStr) return;
    if (!c.pedido) return;
    c.pedido.forEach(function (item) {
      if (!totalesMap[item.prod]) totalesMap[item.prod] = { total: 0, cat: "Corr" };
      totalesMap[item.prod].total += item.cantidad;
    });
  });
  const totales = Object.keys(totalesMap).map(function (k) {
    return { prod: k, total: totalesMap[k].total, cat: totalesMap[k].cat };
  }).sort(function (a, b) { return b.total - a.total; });
  const maxTotal = totales.length > 0 ? totales[0].total : 1;
  const grandTotal = totales.reduce(function (s, t) { return s + t.total; }, 0);
  const enviados = PUNTOS.filter(function (p) { return despacho[p]; }).length;

  async function toggleDespacho(p) {
    const updated = {};
    PUNTOS.forEach(function (k) { updated[k] = despacho[k]; });
    updated[p] = !despacho[p];
    setDespacho(updated);
    await dbSet("nossa_obra_desp", updated);
  }

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={{ background: "linear-gradient(160deg,#3D2B1F,#7C5C3B)", padding: "20px 20px 16px", color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: "bold", color: "#F5E6D3", letterSpacing: 1 }}>Obrador</div>
              <div style={{ fontSize: 13, color: "#C8A882", marginTop: 4, fontStyle: "italic", textTransform: "capitalize" }}>{dateLabel}</div>
            </div>
            <button style={S.bb} onClick={onBack}>Salir</button>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: "bold", background: cerrados === 3 ? "rgba(255,255,255,0.25)" : "rgba(249,115,22,0.35)", color: "#fff", padding: "4px 12px", borderRadius: 20 }}>{cerrados}/3 cerrados</span>
            <span style={{ fontSize: 11, fontWeight: "bold", background: "rgba(255,255,255,0.15)", color: "#fff", padding: "4px 12px", borderRadius: 20 }}>{enviados}/3 enviados</span>
          </div>
          {faltantes.length > 0 && (
            <div style={{ marginTop: 10, background: "rgba(249,115,22,0.25)", borderRadius: 10, padding: "8px 12px", fontSize: 12, color: "#FED7AA", fontWeight: "600" }}>
              Falta: {faltantes.map(function (f) { return f.punto; }).join(", ")}
            </div>
          )}
        </div>
        <div style={{ display: "flex", borderBottom: "2px solid #F0F0F0", background: "#FAFAFA" }}>
          <button onClick={function () { setTab("prod"); }} style={{ ...S.tab, flex: 1, color: tab === "prod" ? "#1E293B" : "#9CA3AF", fontWeight: tab === "prod" ? "bold" : "normal", borderBottom: tab === "prod" ? "3px solid #1E293B" : "3px solid transparent" }}>Produccion</button>
          <button onClick={function () { setTab("desp"); }} style={{ ...S.tab, flex: 1, color: tab === "desp" ? "#1E293B" : "#9CA3AF", fontWeight: tab === "desp" ? "bold" : "normal", borderBottom: tab === "desp" ? "3px solid #1E293B" : "3px solid transparent" }}>Despacho</button>
        </div>
        <div style={{ padding: "16px 16px 32px", overflowY: "auto", maxHeight: "62vh" }}>
          {tab === "prod" && (
            <div>
              {totales.length === 0 && <div style={S.em}>Sin cierres hoy. Los pedidos aparecen aqui automaticamente.</div>}
              {totales.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 12 }}>{totales.length} productos - {grandTotal} unidades</div>
                  {totales.map(function (t) {
                    const pct = Math.round((t.total / maxTotal) * 100);
                    const hi = t.total >= 25;
                    return (
                      <div key={t.prod} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #F8FAFC" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: "600", color: "#2D3748", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {t.prod}
                            {hi && <span style={{ marginLeft: 6, fontSize: 9, background: "#FFF7ED", color: "#C2410C", border: "1px solid #FED7AA", padding: "1px 6px", borderRadius: 10, fontWeight: "bold" }}>alto</span>}
                          </div>
                          <div style={{ fontSize: 10, color: "#9CA3AF" }}>{t.cat}</div>
                        </div>
                        <div style={{ width: 72, height: 6, background: "#F1F5F9", borderRadius: 3, flexShrink: 0, overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: 3, width: pct + "%", background: hi ? "#F97316" : "#7C5C3B" }} />
                        </div>
                        <span style={{ fontSize: 16, fontWeight: "bold", minWidth: 26, textAlign: "right", flexShrink: 0, color: hi ? "#C2410C" : "#1E293B" }}>{t.total}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {tab === "desp" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {cierresHoy.map(function (entry) {
                const sent = despacho[entry.punto];
                const sub = entry.cierre && entry.cierre.pedido ? entry.cierre.pedido.reduce(function (s, i) { return s + i.cantidad; }, 0) : 0;
                return (
                  <div key={entry.punto} style={{ borderRadius: 14, overflow: "hidden", border: "2px solid " + (sent ? "#38A169" : entry.cierre ? "#E2E8F0" : "#FED7AA"), background: "#fff", opacity: sent ? 0.85 : 1 }}>
                    <div style={{ padding: "13px 14px", background: sent ? "#F0FFF4" : entry.cierre ? "#FAFAFA" : "#FFF7ED", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: "bold", color: "#2D3748" }}>{entry.punto}</div>
                        {entry.cierre
                          ? <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{entry.cierre.hora} - {entry.cierre.responsable || "--"} - {sub} und</div>
                          : <div style={{ fontSize: 11, color: "#D97706", marginTop: 2 }}>Sin cierre registrado</div>
                        }
                      </div>
                      <button
                        disabled={!entry.cierre}
                        onClick={function () { toggleDespacho(entry.punto); }}
                        style={{ padding: "9px 14px", borderRadius: 20, border: "1.5px solid " + (sent ? "#38A169" : entry.cierre ? "#7C5C3B" : "#E2E8F0"), cursor: entry.cierre ? "pointer" : "not-allowed", fontSize: 12, fontWeight: "bold", background: sent ? "#38A169" : "#fff", color: sent ? "#fff" : entry.cierre ? "#7C5C3B" : "#9CA3AF" }}
                      >
                        {sent ? "Enviado" : entry.cierre ? "Marcar enviado" : "Pendiente"}
                      </button>
                    </div>
                    {entry.cierre && !sent && entry.cierre.pedido && entry.cierre.pedido.length > 0 && (
                      <div style={{ padding: "8px 14px 12px" }}>
                        {entry.cierre.pedido.map(function (it, i) {
                          return (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: i < entry.cierre.pedido.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                              <span style={{ fontSize: 13, color: "#4A5568" }}>{it.prod}</span>
                              <span style={{ fontSize: 13, fontWeight: "bold", color: "#7C5C3B" }}>{it.cantidad} und</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {sent && <div style={{ padding: "10px 14px", fontSize: 12, color: "#15803D", textAlign: "center" }}>Pedido enviado</div>}
                    {!entry.cierre && <div style={{ padding: "10px 14px", fontSize: 12, color: "#D97706", textAlign: "center" }}>Esperando cierre de turno...</div>}
                  </div>
                );
              })}
              {enviados === 3 && <div style={{ background: "#F0FFF4", border: "2px solid #38A169", borderRadius: 14, padding: 16, textAlign: "center", fontSize: 15, fontWeight: "bold", color: "#15803D" }}>Todos los pedidos enviados</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN VIEW ───────────────────────────────────────────────────────────────
function AdminView({ cierres, minMax, getMM, saveMinMax, sheetsUrl, setSheetsUrl, saveConfigFn, syncStatus, customProds, setCustomProds, onBack }) {
  const [tab, setTab] = useState("pedidos");
  const [editMM, setEditMM] = useState(null);
  const [eMin, setEMin] = useState("");
  const [eMax, setEMax] = useState("");
  const [nNom, setNNom] = useState("");
  const [nMin, setNMin] = useState("2");
  const [nMax, setNMax] = useState("6");
  const [nCat, setNCat] = useState("pasteleria");
  const [urlInput, setUrlInput] = useState(sheetsUrl);

  async function saveCustom(list) {
    setCustomProds(list);
    await dbSet("nossa_custom_prods", list);
  }

  function addProduct() {
    if (!nNom.trim()) return;
    const updated = customProds.concat([{ id: Date.now(), nombre: nNom.trim(), cat: nCat, min: parseInt(nMin) || 2, max: parseInt(nMax) || 6 }]);
    saveCustom(updated);
    setNNom(""); setNMin("2"); setNMax("6");
  }

  function buildSugerencias() {
    var freq = {};
    cierres.filter(function (c) { return !c.esCorreccion; }).forEach(function (c) {
      if (!c.pedido) return;
      c.pedido.forEach(function (item) {
        if (!freq[item.prod]) freq[item.prod] = { c: 0, a: 0, t: 0 };
        freq[item.prod].t++;
        var pd = null;
        CATEGORIAS.forEach(function (cat) { cat.productos.forEach(function (p) { if (p.nombre === item.prod) pd = p; }); });
        if (!pd) pd = { min: 2, max: 6 };
        var mm = getMM(item.prod, pd);
        if (item.cantidad >= mm.max * 0.8) freq[item.prod].c++;
        else freq[item.prod].a++;
      });
    });
    var result = [];
    Object.keys(freq).forEach(function (prod) {
      var d = freq[prod];
      if (d.t < 2) return;
      var pd = null;
      CATEGORIAS.forEach(function (cat) { cat.productos.forEach(function (p) { if (p.nombre === prod) pd = p; }); });
      if (!pd) pd = { min: 2, max: 6 };
      var mm = getMM(prod, pd);
      if (d.c / d.t >= 0.6) result.push({ prod: prod, tipo: "subir", actual: mm.max, sug: mm.max + 2, razon: "Pide al maximo en " + d.c + "/" + d.t, urg: "alta" });
      else if (d.a / d.t >= 0.6) result.push({ prod: prod, tipo: "bajar", actual: mm.max, sug: Math.max(mm.min + 1, mm.max - 1), razon: "Nunca baja en " + d.a + "/" + d.t, urg: "baja" });
    });
    return result;
  }

  var sugs = buildSugerencias();
  var tabs = [["pedidos", "Pedidos"], ["productos", "Productos"], ["minmax", "Min/Max"], ["sugerencias", "Sugerencias"], ["sheets", "Sheets"]];

  return (
    <div style={S.page}>
      <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(160deg,#3D2B1F,#7C5C3B)", padding: "20px 20px 0", color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: "bold", color: "#F5E6D3" }}>Panel Admin</div>
              <div style={{ fontSize: 13, color: "#C8A882", fontStyle: "italic" }}>Nossa Cafe</div>
            </div>
            <button style={S.bb} onClick={onBack}>Salir</button>
          </div>
        </div>
        <div style={{ display: "flex", overflowX: "auto", borderBottom: "2px solid #F0F0F0", background: "#FAFAFA" }}>
          {tabs.map(function (pair) {
            return (
              <button key={pair[0]} onClick={function () { setTab(pair[0]); }} style={{ ...S.tab, color: tab === pair[0] ? "#7C5C3B" : "#9CA3AF", fontWeight: tab === pair[0] ? "bold" : "normal", borderBottom: tab === pair[0] ? "3px solid #7C5C3B" : "3px solid transparent" }}>
                {pair[1]}
              </button>
            );
          })}
        </div>
        <div style={{ padding: "16px 16px 32px", overflowY: "auto", maxHeight: "65vh" }}>
          {tab === "pedidos" && (
            <div>
              <div style={S.st}>Resumen de cierres</div>
              {cierres.filter(function (c) { return !c.esCorreccion; }).length === 0 && <div style={S.em}>Sin cierres registrados.</div>}
              {cierres.filter(function (c) { return !c.esCorreccion; }).slice(0, 30).map(function (c) {
                var hasPedido = c.pedido && c.pedido.length > 0;
                return (
                  <div key={c.id} style={{ padding: 12, background: "#FAFAFA", borderRadius: 10, marginBottom: 10, border: "1px solid #E5E7EB", borderLeft: "4px solid " + (hasPedido ? "#E53E3E" : "#38A169") }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: "bold", color: "#2D3748" }}>{c.punto}</div>
                        <div style={{ fontSize: 11, color: "#6B7280" }}>{new Date(c.fecha).toLocaleDateString("es-CO")} - {c.hora} - {c.responsable || "--"}</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: "bold", padding: "3px 10px", borderRadius: 20, background: hasPedido ? "#FEE2E2" : "#DCFCE7", color: hasPedido ? "#991B1B" : "#15803D" }}>
                        {hasPedido ? c.pedido.length + " prod" : "Sin pedidos"}
                      </span>
                    </div>
                    {hasPedido && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #F3F4F6" }}>
                        {c.pedido.slice(0, 4).map(function (p, i) {
                          return <span key={i} style={{ fontSize: 11, color: "#4A5568", background: "#F1F5F9", borderRadius: 20, padding: "2px 8px", marginRight: 4, display: "inline-block" }}>{p.prod} {p.cantidad}</span>;
                        })}
                        {c.pedido.length > 4 && <span style={{ fontSize: 11, color: "#9CA3AF" }}>+{c.pedido.length - 4} mas</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {tab === "productos" && (
            <div>
              <div style={S.st}>Catalogo de productos</div>
              {customProds.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  {customProds.map(function (p) {
                    return (
                      <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F0F0F0" }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: "600", color: "#2D3748" }}>{p.nombre}</div>
                          <div style={{ fontSize: 11, color: "#9CA3AF" }}>Min {p.min} Max {p.max}</div>
                        </div>
                        <button style={{ background: "#FEE2E2", border: "none", color: "#991B1B", padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontSize: 12 }} onClick={function () { saveCustom(customProds.filter(function (x) { return x.id !== p.id; })); }}>Eliminar</button>
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{ background: "#F8FAFC", borderRadius: 14, padding: 14, border: "1.5px solid #E2E8F0" }}>
                <div style={{ fontSize: 12, fontWeight: "bold", color: "#475569", marginBottom: 10 }}>Agregar producto</div>
                <div style={S.lbl}>Nombre</div>
                <input style={S.inp} placeholder="Nombre del producto" value={nNom} onChange={function (e) { setNNom(e.target.value); }} />
                <div style={S.lbl}>Categoria</div>
                <select style={{ ...S.inp, appearance: "none" }} value={nCat} onChange={function (e) { setNCat(e.target.value); }}>
                  {CATEGORIAS.map(function (c) { return <option key={c.id} value={c.id}>{c.nombre}</option>; })}
                </select>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={S.lbl}>Min</div>
                    <input style={S.inp} type="number" min="0" value={nMin} onChange={function (e) { setNMin(e.target.value); }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={S.lbl}>Max</div>
                    <input style={S.inp} type="number" min="1" value={nMax} onChange={function (e) { setNMax(e.target.value); }} />
                  </div>
                </div>
                <button style={{ ...S.btn, marginTop: 8, opacity: nNom.trim() ? 1 : 0.4 }} disabled={!nNom.trim()} onClick={addProduct}>Agregar</button>
              </div>
            </div>
          )}
          {tab === "minmax" && (
            <div>
              <div style={S.st}>Minimos y Maximos</div>
              {CATEGORIAS.map(function (cat) {
                return (
                  <div key={cat.id} style={{ marginBottom: 18 }}>
                    <div style={{ color: cat.color, fontWeight: "bold", fontSize: 12, margin: "0 0 8px" }}>{cat.nombre}</div>
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
                                <input style={{ width: 40, padding: "6px 8px", borderRadius: 8, border: "1.5px solid #CBD5E0", fontSize: 14, textAlign: "center" }} type="number" value={eMin} onChange={function (e) { setEMin(e.target.value); }} />
                                <input style={{ width: 40, padding: "6px 8px", borderRadius: 8, border: "1.5px solid #CBD5E0", fontSize: 14, textAlign: "center" }} type="number" value={eMax} onChange={function (e) { setEMax(e.target.value); }} />
                                <button style={{ background: "#38A169", color: "#fff", border: "none", padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: "bold" }} onClick={function () {
                                  var updated = {};
                                  Object.keys(minMax).forEach(function (k) { updated[k] = minMax[k]; });
                                  updated[prod.nombre] = { min: parseInt(eMin) || prod.min, max: parseInt(eMax) || prod.max };
                                  saveMinMax(updated);
                                  setEditMM(null);
                                }}>OK</button>
                                <button style={{ background: "#E2E8F0", border: "none", padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontSize: 13 }} onClick={function () { setEditMM(null); }}>X</button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              <button style={{ ...S.btn, background: "#4A5568", marginTop: 4 }} onClick={function () { saveMinMax({}); alert("Restablecido."); }}>Restablecer</button>
            </div>
          )}
          {tab === "sugerencias" && (
            <div>
              <div style={S.st}>Sugerencias</div>
              <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 14 }}>Basadas en historico. No se aplican automaticamente.</div>
              {sugs.length === 0 && (
                <div>
                  <div style={S.em}>Se necesitan mas de 2 cierres por producto.</div>
                  <div style={{ background: "#F0FFF4", borderRadius: 12, padding: 14, border: "1.5px solid #86EFAC", marginTop: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: "bold", color: "#15803D", marginBottom: 6 }}>Como funciona</div>
                    <div style={{ fontSize: 12, color: "#4A5568", lineHeight: 1.6 }}>Detecta si un producto alcanza su maximo con frecuencia o si nunca se pide.</div>
                  </div>
                </div>
              )}
              {sugs.map(function (s, i) {
                var hi = s.urg === "alta";
                return (
                  <div key={i} style={{ borderRadius: 12, padding: 14, marginBottom: 10, border: "1.5px solid " + (hi ? "#FCA5A5" : "#FDE68A"), background: hi ? "#FEF2F2" : "#FFFBEB" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: "bold", color: "#1E293B" }}>{s.prod}</div>
                      <span style={{ fontSize: 10, fontWeight: "bold", padding: "2px 8px", borderRadius: 20, background: hi ? "#FEE2E2" : "#FEF3C7", color: hi ? "#991B1B" : "#92400E" }}>{hi ? "Urgente" : "Revisar"}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 8 }}>{s.razon}</div>
                    <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>
                      <span style={{ color: "#6B7280" }}>Max actual: </span><strong>{s.actual}</strong>
                      <span style={{ margin: "0 8px", color: "#9CA3AF" }}>-</span>
                      <span style={{ color: s.tipo === "subir" ? "#15803D" : "#C2410C", fontWeight: "bold" }}>{s.tipo === "subir" ? "subir" : "bajar"} a {s.sug}</span>
                    </div>
                    <button style={{ marginTop: 10, padding: "7px 14px", borderRadius: 20, border: "1.5px solid " + (hi ? "#F87171" : "#FCD34D"), background: "transparent", cursor: "pointer", fontSize: 12, color: hi ? "#991B1B" : "#92400E", fontFamily: "Georgia, serif" }} onClick={function () {
                      var pd = null;
                      CATEGORIAS.forEach(function (cat) { cat.productos.forEach(function (p) { if (p.nombre === s.prod) pd = p; }); });
                      if (!pd) pd = { min: 2, max: 6 };
                      var mm = getMM(s.prod, pd);
                      var updated = {};
                      Object.keys(minMax).forEach(function (k) { updated[k] = minMax[k]; });
                      updated[s.prod] = { min: mm.min, max: s.sug };
                      saveMinMax(updated);
                      alert("Max de " + s.prod + " -> " + s.sug);
                    }}>Aplicar</button>
                  </div>
                );
              })}
            </div>
          )}
          {tab === "sheets" && (
            <div>
              <div style={S.st}>Google Sheets</div>
              <div style={{ background: "#EFF6FF", border: "1.5px solid #BFDBFE", borderRadius: 12, padding: 14, fontSize: 13, color: "#1E40AF", marginBottom: 14, lineHeight: 1.6 }}>Cada cierre se envia automaticamente cuando hay conexion.</div>
              {[["1", "Extensiones - Apps Script en Google Sheets"], ["2", "Pega el codigo de abajo"], ["3", "Implementar - App web - Cualquier persona"], ["4", "Copia la URL y pegala abajo"]].map(function (pair) {
                return (
                  <div key={pair[0]} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", fontSize: 13, borderBottom: "1px solid #F0F0F0" }}>
                    <span style={{ background: "#7C5C3B", color: "#fff", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: "bold", flexShrink: 0 }}>{pair[0]}</span>
                    <span>{pair[1]}</span>
                  </div>
                );
              })}
              <div style={S.lbl}>URL Apps Script</div>
              <input style={S.inp} placeholder="https://script.google.com/..." value={urlInput} onChange={function (e) { setUrlInput(e.target.value); }} />
              <button style={{ ...S.btn, marginTop: 8 }} onClick={function () { setSheetsUrl(urlInput); saveConfigFn({ sheetsUrl: urlInput }); alert("URL guardada."); }}>Guardar URL</button>
              {syncStatus === "ok" && <div style={{ color: "#38A169", marginTop: 8, fontSize: 13 }}>Conexion exitosa</div>}
              {syncStatus === "error" && <div style={{ color: "#E53E3E", marginTop: 8, fontSize: 13 }}>Error de conexion</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function NossaCafe() {
  const [screen, setScreen]           = useState("inicio");
  const [punto, setPunto]             = useState(null);
  const [responsable, setResponsable] = useState("");
  const [hora, setHora]               = useState("");
  const [catIdx, setCatIdx]           = useState(0);
  const [skipped, setSkipped]         = useState({});
  const [stocks, setStocks]           = useState({});
  const [minMax, setMinMax]           = useState({});
  const [config, setConfig]           = useState({});
  const [adminPass, setAdminPass]     = useState("");
  const [adminErr, setAdminErr]       = useState(false);
  const [cierres, setCierres]         = useState([]);
  const [sheetsUrl, setSheetsUrl]     = useState("");
  const [syncStatus, setSyncStatus]   = useState("");
  const [flashKey, setFlashKey]       = useState({});
  const [despacho, setDespacho]       = useState({ Centro: false, Primavera: false, CF: false });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [corrProd, setCorrProd]       = useState("");
  const [corrCant, setCorrCant]       = useState("");
  const [corrNota, setCorrNota]       = useState("");
  const [customProds, setCustomProds] = useState([]);

  const inputRefs  = useRef({});
  const freshInput = useRef({});

  useEffect(function () {
    var now = new Date();
    setHora(now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0"));
    (async function () {
      var mm  = await dbGet("nossa_minmax")       || {};
      var dep = await dbGet("nossa_obra_desp")    || { Centro: false, Primavera: false, CF: false };
      var cp  = await dbGet("nossa_custom_prods") || [];
      setMinMax(mm); setDespacho(dep); setCustomProds(cp);

      // ── Resolve Apps Script URL (centralized, not per-device) ──────────────
      // Priority: 1) getConfig from Sheets  2) localStorage cache  3) DEFAULT
      var urlFromSheets = null;
      try {
        var res = await fetch(DEFAULT_APPS_SCRIPT_URL + "?action=getConfig");
        if (res.ok) {
          var data = await res.json();
          if (data && data.success && data.config && data.config.appsScriptUrl) {
            urlFromSheets = data.config.appsScriptUrl;
            await dbSet("nossa_url_cache", urlFromSheets); // cache it locally
          }
        }
      } catch (e) {
        console.warn("getConfig failed, using cache or default:", e);
      }

      var cachedUrl = await dbGet("nossa_url_cache");
      var resolvedUrl = urlFromSheets || cachedUrl || DEFAULT_APPS_SCRIPT_URL;

      setSheetsUrl(resolvedUrl);
      setConfig({ sheetsUrl: resolvedUrl });
      if (resolvedUrl) await cargarCierresDesdeSheets(resolvedUrl);
    })();
  }, []);

  useEffect(function () {
    if (screen !== "categoria") return;
    var t = setTimeout(function () {
      var f = document.querySelector(".prod-input");
      if (f) f.focus();
    }, 150);
    return function () { clearTimeout(t); };
  }, [catIdx, screen]);

  function getMM(name, defaults) {
    return minMax[name] || { min: defaults.min, max: defaults.max };
  }

  async function saveMinMax(updated) {
    await dbSet("nossa_minmax", updated);
    setMinMax(updated);
  }

  async function saveConfig(updates) {
    var newUrl = updates.sheetsUrl;
    if (newUrl) {
      // Cache locally as fallback only
      await dbSet("nossa_url_cache", newUrl);
      // Push to Sheets so all devices pick it up via getConfig
      try {
        await fetch(newUrl, {
          method: "POST",
          body: JSON.stringify({ action: "actualizarConfig", config: { appsScriptUrl: newUrl } }),
        });
      } catch (e) {
        console.warn("actualizarConfig failed:", e);
      }
      setSheetsUrl(newUrl);
      setConfig({ sheetsUrl: newUrl });
    }
  }

  function getCategorias() {
    return CATEGORIAS.filter(function (c) {
      return !c.soloEn || c.soloEn === punto;
    }).map(function (c) {
      return {
        id: c.id, icon: c.icon, nombre: c.nombre, color: c.color, bg: c.bg,
        obligatoria: c.obligatoria, soloEn: c.soloEn,
        productos: c.productos.map(function (p) {
          var mm = getMM(p.nombre, p);
          return { nombre: p.nombre, min: mm.min, max: mm.max };
        }),
      };
    });
  }

  var categorias = getCategorias();
  var cat = categorias[catIdx] || categorias[0];

  function triggerFlash(nombre) {
    setFlashKey(function (f) {
      var n = {};
      Object.keys(f).forEach(function (k) { n[k] = f[k]; });
      n[nombre] = Date.now();
      return n;
    });
  }

  function getStock(n) {
    return stocks[n] !== undefined ? String(stocks[n]) : "";
  }

  function setStock(nombre, val) {
    if (val === "" || val === "-") return;
    var n = Math.max(0, parseInt(val) || 0);
    setStocks(function (s) {
      var r = {};
      Object.keys(s).forEach(function (k) { r[k] = s[k]; });
      r[nombre] = n;
      return r;
    });
    triggerFlash(nombre);
  }

  function setBlur(nombre, val) {
    var n = Math.max(0, parseInt(val) || 0);
    setStocks(function (s) {
      var r = {};
      Object.keys(s).forEach(function (k) { r[k] = s[k]; });
      r[nombre] = n;
      return r;
    });
  }

  var adjust = useCallback(function (nombre, delta) {
    setStocks(function (s) {
      var r = {};
      Object.keys(s).forEach(function (k) { r[k] = s[k]; });
      r[nombre] = Math.max(0, (s[nombre] || 0) + delta);
      return r;
    });
    triggerFlash(nombre);
  }, []);

  function getPedir(prod) {
    var s = stocks[prod.nombre];
    if (s === undefined) return null;
    if (s > prod.max) return "SOBRE_MAXIMO";
    return s <= prod.min ? Math.max(0, prod.max - s) : 0;
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

  async function cargarCierresDesdeSheets(url) {
    if (!url) return;

    try {
      var fecha = new Date().toISOString().slice(0, 10);
      var res = await fetch(url + "?action=estadoCierres&fecha=" + fecha);
      var data = await res.json();

      if (Array.isArray(data)) {
        setCierres(data);
        return;
      }

      if (data && data.cierres && !Array.isArray(data.cierres)) {
        var lista = [];

        Object.keys(data.cierres).forEach(function (p) {
          if (data.cierres[p]) {
            lista.push({
              id: p + "-" + fecha,
              fecha: new Date().toISOString(),
              hora: "--",
              punto: p,
              responsable: "",
              stocks: {},
              skipped: {},
              pedido: []
            });
          }
        });

        setCierres(lista);
        return;
      }

      if (data && Array.isArray(data.cierres)) {
        setCierres(data.cierres);
        return;
      }

      setCierres([]);
    } catch (e) {
      console.warn("No se pudo cargar estado desde Sheets:", e);
      setCierres([]);
    }
  }

async function syncToSheets(cierre) {
  var url = sheetsUrl || DEFAULT_APPS_SCRIPT_URL;

  if (!url) {
    alert("No hay URL de Apps Script configurada.");
    return false;
  }

  try {
    setSyncStatus("syncing");

    var fecha = new Date().toISOString().slice(0, 10);

    var productos = {};
    if (cierre.stocks) {
      Object.keys(cierre.stocks).forEach(function (k) {
        if (cierre.stocks[k] !== undefined) {
          productos[k] = cierre.stocks[k];
        }
      });
    }

    var datos = {
      hora: cierre.hora || "",
      responsable: cierre.responsable || "",
      pedido: cierre.pedido || [],
      productos: productos,
      skipped: cierre.skipped || {},
      esCorreccion: !!cierre.esCorreccion,
      nota: cierre.nota || ""
    };

    var params = new URLSearchParams({
      action: "guardarCierre",
      fecha: fecha,
      punto: cierre.punto,
      datos: JSON.stringify(datos),
      cacheBust: Date.now().toString()
    });

    var saveUrl = url + "?" + params.toString();

    console.log("GUARDANDO CIERRE EN:", saveUrl);

    await new Promise(function (resolve) {
      var img = new Image();
      var done = false;

      function finish() {
        if (done) return;
        done = true;
        resolve();
      }

      img.onload = finish;
      img.onerror = finish;
      img.src = saveUrl;

      setTimeout(finish, 2500);
    });

    await cargarCierresDesdeSheets(url);

    setSyncStatus("ok");
    setTimeout(function () {
      setSyncStatus("");
    }, 3000);

    return true;

  } catch (e) {
    console.error("Error guardando cierre:", e);
    alert("Error guardando cierre:\n" + e.message);
    setSyncStatus("error");
    return false;
  }
}
  var todayStr = new Date().toLocaleDateString("es-CO");

  function getCierreHoy(p) {
    return cierres.find(function (c) {
      return c.punto === p && !c.esCorreccion && new Date(c.fecha).toLocaleDateString("es-CO") === todayStr;
    });
  }

  async function submitCierre() {
    var pedido = categorias.filter(function (c) { return !skipped[c.id]; }).flatMap(function (c) {
      return c.productos.filter(function (p) { var v = getPedir(p); return typeof v === "number" && v > 0; }).map(function (p) {
        return { cat: c.nombre, prod: p.nombre, cantidad: getPedir(p) };
      });
    });
    var existente = getCierreHoy(punto);
    var id = modoEdicion && existente ? existente.id : Date.now();
    var cierre = { id: id, fecha: new Date().toISOString(), hora: hora, punto: punto, responsable: responsable, stocks: {}, skipped: {}, pedido: pedido };
    Object.keys(stocks).forEach(function (k) { cierre.stocks[k] = stocks[k]; });
    Object.keys(skipped).forEach(function (k) { cierre.skipped[k] = skipped[k]; });
    var updated;
    if (modoEdicion) {
      updated = cierres.map(function (c) {
        if (c.punto === punto && !c.esCorreccion && new Date(c.fecha).toLocaleDateString("es-CO") === todayStr) return cierre;
        return c;
      });
    } else {
      updated = [cierre].concat(cierres).slice(0, 200);
    }
    var guardado = await syncToSheets(cierre);
    if (!guardado) return;
    setModoEdicion(false);
    setScreen("resumen");
  }

  async function submitCorreccion() {
    if (!corrProd.trim() || !corrCant) return;
    var corr = { id: Date.now(), fecha: new Date().toISOString(), hora: hora, punto: punto, responsable: responsable, esCorreccion: true, pedido: [{ cat: "Correccion", prod: corrProd.trim(), cantidad: parseInt(corrCant) || 0 }], nota: corrNota.trim() };
    var guardado = await syncToSheets(corr);
    if (!guardado) return;
    setCorrProd(""); setCorrCant(""); setCorrNota("");
    setScreen("resumen");
  }

  function abrirEdicion(p) {
    var c = getCierreHoy(p);
    if (!c) return;
    setPunto(p); setResponsable(c.responsable || "");
    var st = {}; if (c.stocks) Object.keys(c.stocks).forEach(function (k) { st[k] = c.stocks[k]; }); setStocks(st);
    var sk = {}; if (c.skipped) Object.keys(c.skipped).forEach(function (k) { sk[k] = c.skipped[k]; }); setSkipped(sk);
    setModoEdicion(true); setCatIdx(0); setScreen("categoria");
  }

  function reiniciar() {
    setPunto(null); setResponsable(""); setCatIdx(0);
    setSkipped({}); setStocks({}); setModoEdicion(false);
    freshInput.current = {}; inputRefs.current = {};
    var now = new Date();
    setHora(now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0"));
    setScreen("inicio");
  }

  function tryLogin() {
    var pass = (config && config.adminPass) ? config.adminPass : ADMIN_PASSWORD;
    if (adminPass === pass) {
      setScreen("admin"); setAdminErr(false); setAdminPass("");
    } else {
      setAdminErr(true);
      setTimeout(function () { setAdminErr(false); }, 2000);
    }
  }

  // ── SCREEN: OBRADOR ──────────────────────────────────────────────────────
  if (screen === "obrador") {
    return (
      <ObradorView
        cierres={cierres}
        despacho={despacho}
        setDespacho={setDespacho}
        onBack={function () { setScreen("inicio"); }}
      />
    );
  }

  // ── SCREEN: ADMIN ────────────────────────────────────────────────────────
  if (screen === "admin") {
    return (
      <AdminView
        cierres={cierres}
        minMax={minMax}
        getMM={getMM}
        saveMinMax={saveMinMax}
        sheetsUrl={sheetsUrl}
        setSheetsUrl={setSheetsUrl}
        saveConfigFn={saveConfig}
        syncStatus={syncStatus}
        customProds={customProds}
        setCustomProds={setCustomProds}
        onBack={function () { setScreen("inicio"); }}
      />
    );
  }

  // ── SCREEN: LOGIN ────────────────────────────────────────────────────────
  if (screen === "login") {
    return (
      <div style={S.page}>
        <div style={{ ...S.card, maxWidth: 360 }}>
          <div style={{ background: "linear-gradient(160deg,#3D2B1F,#7C5C3B)", padding: "28px 24px", textAlign: "center", color: "#fff" }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🔒</div>
            <div style={{ fontSize: 22, fontWeight: "bold", color: "#F5E6D3" }}>Administrador</div>
          </div>
          <div style={S.body}>
            <div style={S.lbl}>Contrasena</div>
            <input
              style={{ ...S.inp, letterSpacing: 4 }}
              type="password" placeholder="..."
              value={adminPass}
              onChange={function (e) { setAdminPass(e.target.value); }}
              onKeyDown={function (e) { if (e.key === "Enter") tryLogin(); }}
            />
            {adminErr && <div style={{ color: "#E53E3E", fontSize: 13, textAlign: "center", margin: "8px 0", fontWeight: "bold" }}>Contrasena incorrecta</div>}
            <button style={{ ...S.btn, opacity: 1 }} onClick={tryLogin}>Entrar</button>
            <button style={{ display: "block", textAlign: "center", marginTop: 12, color: "#6B7280", fontSize: 13, cursor: "pointer", background: "none", border: "none", fontFamily: "Georgia, serif" }} onClick={function () { setScreen("inicio"); }}>Volver</button>
          </div>
        </div>
      </div>
    );
  }

  // ── SCREEN: CATEGORIA ────────────────────────────────────────────────────
  if (screen === "categoria") {
    var pct = Math.round((catIdx / categorias.length) * 100);
    var done = catCompleta(cat);
    return (
      <div style={S.page}>
        <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "18px 18px 14px", color: "#fff", background: cat.color }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <button style={S.bb} onClick={function () { catIdx === 0 ? setScreen("inicio") : setCatIdx(catIdx - 1); }}>Atras</button>
              <span style={{ fontSize: 11, background: "rgba(255,255,255,0.22)", padding: "4px 12px", borderRadius: 20 }}>{punto}</span>
            </div>
            <div style={{ fontSize: 38, textAlign: "center", display: "block" }}>{cat.icon}</div>
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
                var ns = {}; Object.keys(skipped).forEach(function (k) { ns[k] = skipped[k]; }); ns[cat.id] = true; setSkipped(ns);
                if (catIdx < categorias.length - 1) setCatIdx(catIdx + 1); else submitCierre();
              }}>Omitir</button>
            </div>
          )}
          {skipped[cat.id] && (
            <div style={{ background: "#F3F4F6", padding: "10px 16px", fontSize: 13, color: "#6B7280", borderBottom: "1px solid #E5E7EB" }}>
              Categoria omitida -{" "}
              <button style={{ background: "none", border: "none", color: "#3B82F6", cursor: "pointer", fontSize: 13, textDecoration: "underline" }} onClick={function () {
                var ns = {}; Object.keys(skipped).forEach(function (k) { ns[k] = skipped[k]; }); ns[cat.id] = false; setSkipped(ns);
              }}>Deshacer</button>
            </div>
          )}
          {!skipped[cat.id] && (
            <div>
              <div style={{ padding: "10px 16px", fontSize: 13, fontStyle: "italic", borderBottom: "1px solid #E5E7EB", color: cat.color }}>Cuantas unidades quedan ahora mismo?</div>
              <div style={{ overflowY: "auto", maxHeight: "44vh" }}>
                {cat.productos.map(function (prod, idx) {
                  return (
                    <ProductRow
                      key={prod.nombre}
                      prod={prod}
                      idx={idx}
                      allProds={cat.productos}
                      getStock={getStock}
                      getPedir={getPedir}
                      setStock={setStock}
                      setBlur={setBlur}
                      adjust={adjust}
                      flashKey={flashKey}
                      inputRefs={inputRefs}
                      freshInput={freshInput}
                    />
                  );
                })}
              </div>
            </div>
          )}
          <div style={{ padding: 14, borderTop: "1px solid #F0F0F0", background: "#FAFAFA" }}>
            {!done && !skipped[cat.id] && <div style={{ textAlign: "center", color: "#D97706", fontSize: 11, marginBottom: 8, fontStyle: "italic" }}>Completa todos los productos para continuar</div>}
            <button style={{ ...S.btn, marginTop: 0, opacity: done ? 1 : 0.35 }} disabled={!done} onClick={function () {
              if (catIdx < categorias.length - 1) setCatIdx(catIdx + 1);
              else submitCierre();
            }}>
              {catIdx < categorias.length - 1 ? ("Siguiente: " + (categorias[catIdx + 1] ? categorias[catIdx + 1].nombre : "")) : "Ver resumen"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── SCREEN: RESUMEN ──────────────────────────────────────────────────────
  if (screen === "resumen") {
    var aPedir = categorias.filter(function (c) { return !skipped[c.id]; }).flatMap(function (c) {
      return c.productos.filter(function (p) { var v = getPedir(p); return typeof v === "number" && v > 0; });
    });
    var mensaje = generarMensaje();
    return (
      <div style={S.page}>
        <div style={S.card}>
          <div style={{ background: "linear-gradient(160deg,#3D2B1F,#7C5C3B)", padding: "36px 24px 20px", textAlign: "center", color: "#fff" }}>
            <div style={{ fontSize: 52 }}>{aPedir.length === 0 ? "ok" : "!"}</div>
            <div style={{ fontSize: 22, fontWeight: "bold", color: "#F5E6D3" }}>{aPedir.length === 0 ? "Todo en orden!" : aPedir.length + " productos por pedir"}</div>
            <div style={{ fontSize: 13, color: "#C8A882", marginTop: 4 }}>{punto} - {hora} - {responsable || "--"}</div>
            {syncStatus === "ok" && <div style={{ color: "#C6F6D5", fontSize: 12, marginTop: 8 }}>Sincronizado</div>}
            {syncStatus === "error" && <div style={{ color: "#FED7D7", fontSize: 12, marginTop: 8 }}>Sin conexion - guardado local</div>}
          </div>
          <div style={S.body}>
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
            {aPedir.length === 0 && <div style={{ padding: 16, background: "#F0FFF4", borderRadius: 12, textAlign: "center", color: "#38A169", fontSize: 14, marginBottom: 16 }}>Todos los productos sobre el nivel minimo</div>}
            <div style={{ padding: 14, background: "#F0FFF4", borderRadius: 14, border: "2px solid #C6F6D5", marginBottom: 16 }}>
              <div style={{ fontWeight: "bold", fontSize: 13, color: "#276749", marginBottom: 8 }}>Mensaje WhatsApp</div>
              <textarea style={{ width: "100%", borderRadius: 8, border: "1px solid #C6F6D5", padding: 10, fontSize: 11, color: "#2D3748", background: "#fff", resize: "none", fontFamily: "monospace", boxSizing: "border-box", lineHeight: 1.6 }} readOnly value={mensaje} rows={Math.min(14, mensaje.split("\n").length + 2)} />
              <button style={{ width: "100%", padding: 11, borderRadius: 10, border: "none", background: "#38A169", color: "#fff", fontSize: 13, fontWeight: "bold", cursor: "pointer", marginTop: 8 }} onClick={function () { if (navigator.clipboard) navigator.clipboard.writeText(mensaje); alert("Copiado!"); }}>Copiar</button>
            </div>
            <button style={{ ...S.btn, background: "#4A5568" }} onClick={async function () { reiniciar(); await cargarCierresDesdeSheets(sheetsUrl || DEFAULT_APPS_SCRIPT_URL); }}>Nuevo cierre</button>
          </div>
        </div>
      </div>
    );
  }

  // ── SCREEN: CORRECCION ───────────────────────────────────────────────────
  if (screen === "correccion") {
    var cierreBase = getCierreHoy(punto);
    var corrHoy = cierres.filter(function (c) { return c.esCorreccion && c.punto === punto && new Date(c.fecha).toLocaleDateString("es-CO") === todayStr; });
    return (
      <div style={S.page}>
        <div style={S.card}>
          <div style={{ background: "linear-gradient(160deg,#3D2B1F,#7C5C3B)", padding: "22px 20px 18px", color: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: "bold", color: "#F5E6D3" }}>Agregar correccion</div>
                <div style={{ fontSize: 13, color: "#C8A882", fontStyle: "italic" }}>{punto}</div>
              </div>
              <button style={S.bb} onClick={function () { setScreen("inicio"); }}>Volver</button>
            </div>
          </div>
          <div style={S.body}>
            <div style={{ background: "#F0FFF4", border: "1.5px solid #86EFAC", borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: "bold", color: "#15803D", marginBottom: 6 }}>Cierre original - {cierreBase ? cierreBase.hora : "--"}</div>
              {cierreBase && cierreBase.pedido && cierreBase.pedido.slice(0, 4).map(function (p, i) { return <div key={i} style={{ fontSize: 12, color: "#4A5568", padding: "2px 0" }}>{p.prod}: {p.cantidad}</div>; })}
              {cierreBase && cierreBase.pedido && cierreBase.pedido.length > 4 && <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>+{cierreBase.pedido.length - 4} mas</div>}
            </div>
            {corrHoy.length > 0 && corrHoy.map(function (c) {
              return (
                <div key={c.id} style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 10, padding: "10px 12px", marginBottom: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: "600", color: "#92400E" }}>{c.hora}</div>
                  {c.pedido && c.pedido.map(function (p, i) { return <div key={i} style={{ fontSize: 13, color: "#C2410C", marginTop: 2 }}>+ {p.prod}: {p.cantidad}</div>; })}
                </div>
              );
            })}
            <div style={S.lbl}>Producto</div>
            <input style={S.inp} placeholder="Nombre del producto" value={corrProd} onChange={function (e) { setCorrProd(e.target.value); }} />
            <div style={S.lbl}>Unidades</div>
            <input style={{ ...S.inp, fontSize: 20, fontWeight: "bold" }} type="number" inputMode="numeric" min="1" placeholder="0" value={corrCant} onChange={function (e) { setCorrCant(e.target.value); }} />
            <div style={S.lbl}>Nota (opcional)</div>
            <input style={S.inp} placeholder="Ej: Se olvidaron en la nevera" value={corrNota} onChange={function (e) { setCorrNota(e.target.value); }} />
            <button style={{ ...S.btn, opacity: corrProd.trim() && corrCant ? 1 : 0.35 }} disabled={!corrProd.trim() || !corrCant} onClick={submitCorreccion}>Guardar correccion</button>
          </div>
        </div>
      </div>
    );
  }

  // ── SCREEN: INICIO ───────────────────────────────────────────────────────
  var estadoPuntos = PUNTOS.map(function (p) {
    var c = getCierreHoy(p);
    var corrs = cierres.filter(function (ci) { return ci.esCorreccion && ci.punto === p && new Date(ci.fecha).toLocaleDateString("es-CO") === todayStr; });
    return { p: p, c: c, corrs: corrs };
  });
  var nFaltantes = estadoPuntos.filter(function (e) { return !e.c; }).length;
  var cierreActual = punto ? getCierreHoy(punto) : null;

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.hero}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>☕</div>
          <div style={{ fontSize: 26, fontWeight: "bold", letterSpacing: 1.5, color: "#F5E6D3" }}>Nossa Cafe</div>
          <div style={{ fontSize: 13, color: "#C8A882", marginTop: 4, fontStyle: "italic" }}>Cierre de turno</div>
        </div>
        <div style={S.body}>
          <button style={{ ...S.btn, marginTop: 8, background: "linear-gradient(135deg,#334155,#1E293B)" }} onClick={function () { setScreen("obrador"); }}>
            Entrar como Obrador
          </button>
          <div style={S.lbl}>Estado de cierres hoy</div>
          <div style={{ borderRadius: 12, border: "1px solid #E5E7EB", overflow: "hidden", marginBottom: 4 }}>
            {estadoPuntos.map(function (entry, i) {
              return (
                <div key={entry.p} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", borderBottom: i < 2 ? "1px solid #F3F4F6" : "none", background: entry.c ? "#F0FFF4" : "#FAFAFA" }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: "600", color: "#2D3748" }}>{entry.p}</span>
                    {entry.c && <div style={{ fontSize: 10, color: "#6B7280" }}>{entry.c.hora} - {entry.c.responsable || "--"}</div>}
                    {entry.corrs.length > 0 && <div style={{ fontSize: 10, color: "#D97706" }}>+{entry.corrs.length} correccion(es)</div>}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: "bold", color: entry.c ? "#15803D" : "#92400E", background: entry.c ? "#DCFCE7" : "#FEF3C7", padding: "3px 10px", borderRadius: 20 }}>
                    {entry.c ? "Completo" : "Pendiente"}
                  </span>
                </div>
              );
            })}
          </div>
          {nFaltantes > 0 && (
            <div style={{ background: "#FFF7ED", border: "1.5px solid #F97316", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#C2410C", marginBottom: 4, fontWeight: "600" }}>
              Faltan {nFaltantes} punto(s) por cerrar
            </div>
          )}
          <div style={S.lbl}>Desde que punto?</div>
          <div style={{ display: "flex", gap: 8 }}>
            {PUNTOS.map(function (p) {
              var yaHizo = !!getCierreHoy(p);
              return (
                <button key={p} style={{ flex: 1, padding: "13px 6px", borderRadius: 12, border: "2px solid " + (yaHizo ? "#38A169" : "#E5D8CC"), background: punto === p ? "#7C5C3B" : "#FFF8F4", cursor: "pointer", fontSize: 13, fontWeight: "bold", color: punto === p ? "#fff" : "#7C5C3B", position: "relative" }} onClick={function () { setPunto(p); }}>
                  {p}
                  {yaHizo && <span style={{ position: "absolute", top: -6, right: -6, background: "#38A169", color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>v</span>}
                </button>
              );
            })}
          </div>
          {cierreActual ? (
            <div style={{ background: "#FFF7ED", border: "2px solid #F97316", borderRadius: 14, padding: "16px", margin: "12px 0" }}>
              <div style={{ fontWeight: "bold", fontSize: 14, color: "#92400E", marginBottom: 4 }}>Ya realizaste el cierre hoy</div>
              <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 12 }}>Registrado a las {cierreActual.hora} por {cierreActual.responsable || "--"}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button style={{ ...S.btn, marginTop: 0, background: "linear-gradient(135deg,#F97316,#C2410C)", fontSize: 14 }} onClick={function () { abrirEdicion(punto); }}>Editar cierre</button>
                <button style={{ ...S.btn, marginTop: 0, background: "#fff", color: "#7C5C3B", border: "2px solid #7C5C3B", fontSize: 14 }} onClick={function () { setScreen("correccion"); }}>Agregar correccion</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={S.lbl}>Quien cierra?</div>
              <input style={S.inp} placeholder="Tu nombre (opcional)" value={responsable} onChange={function (e) { setResponsable(e.target.value); }} />
              <div style={{ fontSize: 13, color: "#6B7280", margin: "12px 0", fontStyle: "italic" }}>Hora: {hora}</div>
              <button style={{ ...S.btn, opacity: punto ? 1 : 0.35 }} disabled={!punto} onClick={function () { setCatIdx(0); setScreen("categoria"); }}>
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
