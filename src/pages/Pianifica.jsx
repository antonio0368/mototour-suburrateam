import { useMemo, useState } from "react";
import MappaPercorso from "../components/MappaPercorso";
import RiepilogoPercorso from "../components/RiepilogoPercorso";
import { costruisciPercorso } from "../services/routingService";
import AutocompleteLocalita from "../components/AutocompleteLocalita";

const MAX_PASSAGGI = 10;
const creaGiornata = (numero) => ({
  id: crypto.randomUUID(), numero, titolo: `Giorno ${numero}`,
  partenza: "", arrivo: "", passaggi: [], note: "",
  riepilogo: null, geometria: null,
});
const letteraPercorso = (indice) => String.fromCharCode(65 + indice);

export default function Pianifica() {
  const [nome, setNome] = useState("");
  const [partenza, setPartenza] = useState("");
  const [arrivo, setArrivo] = useState("");
  const [passaggi, setPassaggi] = useState([]);
  const [tipoPercorso, setTipoPercorso] = useState("Curve");
  const [stato, setStato] = useState("Bozza");
  const [giroCircolare, setGiroCircolare] = useState(false);
  const [consentiAutostrade, setConsentiAutostrade] = useState(false);
  const [numeroGiorni, setNumeroGiorni] = useState(1);
  const [giornate, setGiornate] = useState([creaGiornata(1)]);
  const [giornoAperto, setGiornoAperto] = useState(1);
  const [messaggio, setMessaggio] = useState("");
  const [errore, setErrore] = useState("");
  const [calcoloInCorso, setCalcoloInCorso] = useState(false);
  const [coordinatePartenza, setCoordinatePartenza] = useState(null);
  const [coordinateArrivo, setCoordinateArrivo] = useState(null);
  const [coordinatePassaggi, setCoordinatePassaggi] = useState([]);
  const [coordinateTraccia, setCoordinateTraccia] = useState([]);
  const [riepilogoTour, setRiepilogoTour] = useState(null);

  const invalidaCalcolo = () => {
    setCoordinatePartenza(null); setCoordinateArrivo(null);
    setCoordinatePassaggi([]); setCoordinateTraccia([]);
    setRiepilogoTour(null); setMessaggio(""); setErrore("");
  };
  const aggiornaPartenza = (v) => { setPartenza(v); invalidaCalcolo(); };
  const aggiornaArrivo = (v) => { setArrivo(v); invalidaCalcolo(); };
  const aggiungiPassaggio = () => {
    if (passaggi.length < MAX_PASSAGGI) { setPassaggi((p) => [...p, ""]); invalidaCalcolo(); }
  };
  const aggiornaPassaggio = (i, v) => {
    setPassaggi((p) => p.map((x, j) => j === i ? v : x)); invalidaCalcolo();
  };
  const eliminaPassaggio = (i) => { setPassaggi((p) => p.filter((_, j) => j !== i)); invalidaCalcolo(); };
  const spostaPassaggio = (da, a) => {
    if (a < 0 || a >= passaggi.length) return;
    setPassaggi((p) => { const c = [...p]; const [x] = c.splice(da, 1); c.splice(a, 0, x); return c; });
    invalidaCalcolo();
  };
  const modificaNumeroGiorni = (v) => {
    const n = Math.min(5, Math.max(1, Number(v) || 1)); setNumeroGiorni(n);
    setGiornate((g) => Array.from({ length: n }, (_, i) => g[i] ? { ...g[i], numero: i + 1 } : creaGiornata(i + 1)));
    if (giornoAperto && giornoAperto > n) setGiornoAperto(n);
  };
  const aggiornaGiornata = (i, campo, valore) => {
    setGiornate((g) => g.map((x, j) => j === i ? { ...x, [campo]: valore } : x));
    setMessaggio("");
  };
  const totaliGiornate = useMemo(() => {
    const r = giornate.map((g) => g.riepilogo).filter(Boolean); if (!r.length) return null;
    const min = r.map((x) => Number(x.quotaMinima)).filter(Number.isFinite);
    const max = r.map((x) => Number(x.quotaMassima)).filter(Number.isFinite);
    return {
      distanzaMetri: r.reduce((t, x) => t + (Number(x.distanzaMetri) || 0), 0),
      durataSecondi: r.reduce((t, x) => t + (Number(x.durataSecondi) || 0), 0),
      dislivelloPositivo: r.reduce((t, x) => t + (Number(x.dislivelloPositivo) || 0), 0),
      dislivelloNegativo: r.reduce((t, x) => t + (Number(x.dislivelloNegativo) || 0), 0),
      quotaMinima: min.length ? Math.min(...min) : null,
      quotaMassima: max.length ? Math.max(...max) : null,
    };
  }, [giornate]);
  const riepilogoVisualizzato = riepilogoTour || totaliGiornate;
  const obbligatoriMancanti = !nome.trim() || !partenza.trim() || (!giroCircolare && !arrivo.trim());

  const calcolaPercorso = async () => {
    setErrore(""); setMessaggio("");
    if (!partenza.trim()) return setErrore("Inserisci la partenza.");
    if (!giroCircolare && !arrivo.trim()) return setErrore("Inserisci l’arrivo oppure attiva Giro circolare.");
    setCalcoloInCorso(true);
    try {
      const risultato = await costruisciPercorso({
        partenza: partenza.trim(), passaggi: passaggi.map((p) => p.trim()).filter(Boolean),
        arrivo: giroCircolare ? partenza.trim() : arrivo.trim(), autostrade: consentiAutostrade,
      });
      setCoordinatePartenza(risultato.pointStart);
      setCoordinateArrivo(risultato.pointEnd);
      setCoordinatePassaggi(risultato.passaggi || []);
      setCoordinateTraccia(risultato.geometria || []);
      setRiepilogoTour({
        distanzaMetri: Number(risultato.distanzaMetri) || 0,
        durataSecondi: Number(risultato.durataSecondi) || 0,
        dislivelloPositivo: Number(risultato.dislivelloPositivo) || 0,
        dislivelloNegativo: Number(risultato.dislivelloNegativo) || 0,
        quotaMinima: risultato.quotaMinima ?? null,
        quotaMassima: risultato.quotaMassima ?? null,
      });
      setMessaggio("Percorso calcolato correttamente.");
    } catch (e) { console.error(e); invalidaCalcolo(); setErrore(e?.message || "Impossibile calcolare il percorso."); }
    finally { setCalcoloInCorso(false); }
  };

  const salvaTour = (e) => {
    e.preventDefault();
    console.log("Tour da salvare:", {
      id: crypto.randomUUID(), nome: nome.trim(), partenza: partenza.trim(),
      passaggi: passaggi.map((p) => p.trim()).filter(Boolean),
      arrivo: giroCircolare ? partenza.trim() : arrivo.trim(), tipoPercorso, stato,
      giroCircolare, consentiAutostrade, numeroGiorni, giornate,
      geometria: coordinateTraccia.length ? coordinateTraccia : null,
      riepilogo: riepilogoVisualizzato,
    });
    setMessaggio(`Tour "${nome.trim() || "senza nome"}" preparato correttamente.`);
  };

  return (
    <main className="pianifica-page">
      <style>{`
        .pianifica-page{width:100%;box-sizing:border-box}.pianifica-title{margin:0;color:#f97316;font-size:28px;font-weight:800}.pianifica-subtitle{margin:6px 0 0;color:#94a3b8;font-size:14px}.pianifica-layout{display:grid;grid-template-columns:minmax(300px,1fr) minmax(0,2fr);gap:20px;align-items:start;margin-top:24px}.pianifica-card{min-width:0;padding:20px;box-sizing:border-box;border:1px solid #1e293b;border-radius:18px;background:#0f172a}.pianifica-card-title{margin:0 0 20px;color:#f8fafc;text-align:center}.pianifica-label{display:block;margin:0 0 7px;color:#cbd5e1;font-size:12px;font-weight:700}.pianifica-field{display:block;width:100%;box-sizing:border-box;margin:0;padding:13px 14px;border:1px solid #334155;border-radius:11px;outline:none;background:#172033;color:#f8fafc;font:14px inherit}.pianifica-field:focus{border-color:#f97316;box-shadow:0 0 0 3px rgba(249,115,22,.16)}.pianifica-field:disabled{opacity:.62}.pianifica-standard-field{margin-bottom:14px}.pianifica-route-fields{margin-bottom:18px;padding:14px;border:1px solid #29374b;border-radius:14px;background:#111a2b}.pianifica-route-row{display:grid;grid-template-columns:32px minmax(0,1fr) auto;align-items:center;gap:8px;margin-bottom:10px}.pianifica-route-letter{display:flex;width:30px;height:30px;align-items:center;justify-content:center;border:2px solid #f97316;border-radius:50%;color:#fb923c;font-weight:900}.pianifica-route-letter.arrivo{border-color:#38bdf8;color:#7dd3fc}.pianifica-route-controls{display:flex;gap:5px}.pianifica-route-control{width:30px;height:30px;border:1px solid #334155;border-radius:8px;background:#172033;color:#94a3b8}.pianifica-add-passaggio{width:100%;margin:3px 0 12px;padding:11px;border:1px dashed #475569;border-radius:11px;background:#172033;color:#fb923c;font-weight:800}.pianifica-route-help{margin:0 0 14px;color:#64748b;font-size:11px}.pianifica-grid-small{display:grid;grid-template-columns:1fr 1fr;gap:12px}.pianifica-switches{display:grid;gap:10px;margin:2px 0 20px}.pianifica-switch-row{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border:1px solid #334155;border-radius:11px;background:#172033}.pianifica-switch-label{font-weight:700}.pianifica-switch-help{display:block;color:#64748b;font-size:11px;font-weight:400}.pianifica-switch{position:relative;width:46px;height:25px}.pianifica-switch input{opacity:0}.pianifica-switch-slider{position:absolute;inset:0;border-radius:999px;background:#475569}.pianifica-switch-slider:before{content:"";position:absolute;width:19px;height:19px;left:3px;top:3px;border-radius:50%;background:white;transition:.18s}.pianifica-switch input:checked+.pianifica-switch-slider{background:#f97316}.pianifica-switch input:checked+.pianifica-switch-slider:before{transform:translateX(21px)}.pianifica-calculate,.pianifica-save{width:100%;padding:14px;border-radius:11px;font-weight:800;font:15px inherit}.pianifica-calculate{margin-bottom:10px;border:1px solid #f97316;background:rgba(249,115,22,.1);color:#fb923c}.pianifica-save{border:0;background:#f97316;color:white}.pianifica-calculate:disabled,.pianifica-save:disabled{opacity:.45}.pianifica-message,.pianifica-error{margin:12px 0 0;padding:10px;border-radius:10px;font-size:13px}.pianifica-message{background:rgba(34,197,94,.1);color:#86efac}.pianifica-error{background:rgba(239,68,68,.1);color:#fca5a5}.pianifica-map-heading{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.pianifica-map-profile{padding:7px 11px;border:1px solid rgba(249,115,22,.35);border-radius:999px;color:#fb923c;font-size:12px}.pianifica-days-heading{margin:28px 0 12px;color:#f97316}.pianifica-day-help{color:#64748b;font-size:12px}.pianifica-day-card{margin-bottom:12px;border:1px solid #334155;border-radius:13px;background:#172033;overflow:hidden}.pianifica-day-button{display:flex;width:100%;justify-content:space-between;padding:15px 16px;border:0;background:transparent;color:white}.pianifica-day-content{padding:16px;border-top:1px solid #273449}.pianifica-day-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px 12px}.pianifica-auto-data{margin-top:16px;padding:13px;border:1px solid rgba(56,189,248,.22);border-radius:12px;color:#bae6fd;font-size:12px}.pianifica-day-note{margin-top:14px;min-height:82px}@media(max-width:850px){.pianifica-layout{grid-template-columns:1fr}}@media(max-width:560px){.pianifica-grid-small,.pianifica-day-grid{grid-template-columns:1fr}}
      `}</style>
      <header><h2 className="pianifica-title">Pianificazione Tour</h2><p className="pianifica-subtitle">Inserisci il percorso e usa Calcola percorso per traccia, distanza e durata.</p></header>
      <form className="pianifica-layout" onSubmit={salvaTour}>
        <section className="pianifica-card">
          <h3 className="pianifica-card-title">Nuovo tour</h3>
          <label className="pianifica-label">Nome tour</label><input className="pianifica-field pianifica-standard-field" value={nome} onChange={(e)=>setNome(e.target.value)} placeholder="Es. Tour delle Dolomiti" />
          <label className="pianifica-label">Percorso</label>
          <div className="pianifica-route-fields">
            <div className="pianifica-route-row"><span className="pianifica-route-letter">A</span><AutocompleteLocalita value={partenza} onChange={aggiornaPartenza} placeholder="Partenza"/><div /></div>
            
            {passaggi.map((p,i)=><div className="pianifica-route-row" key={i}><span className="pianifica-route-letter">{letteraPercorso(i+1)}</span><input className="pianifica-field" value={p} onChange={(e)=>aggiornaPassaggio(i,e.target.value)} placeholder={`Passaggio ${i+1}`}/><div className="pianifica-route-controls"><button type="button" className="pianifica-route-control" disabled={i===0} onClick={()=>spostaPassaggio(i,i-1)}>▲</button><button type="button" className="pianifica-route-control" disabled={i===passaggi.length-1} onClick={()=>spostaPassaggio(i,i+1)}>▼</button><button type="button" className="pianifica-route-control" onClick={()=>eliminaPassaggio(i)}>×</button></div></div>)}
            <button type="button" className="pianifica-add-passaggio" onClick={aggiungiPassaggio} disabled={passaggi.length>=MAX_PASSAGGI}>+ Aggiungi passaggio</button>
            <div className="pianifica-route-row"><span className="pianifica-route-letter arrivo">{letteraPercorso(passaggi.length+1)}</span><input className="pianifica-field" value={giroCircolare?partenza:arrivo} onChange={(e)=>aggiornaArrivo(e.target.value)} disabled={giroCircolare} placeholder="Arrivo"/><div/></div>
          </div>
          <p className="pianifica-route-help">Ogni modifica del percorso richiede un nuovo calcolo.</p>
          <div className="pianifica-grid-small"><div><label className="pianifica-label">Tipo percorso</label><select className="pianifica-field pianifica-standard-field" value={tipoPercorso} onChange={(e)=>{setTipoPercorso(e.target.value);invalidaCalcolo();}}><option>Veloce</option><option>Panoramico</option><option>Curve</option><option>Extra curve</option></select></div><div><label className="pianifica-label">Numero giorni</label><select className="pianifica-field pianifica-standard-field" value={numeroGiorni} onChange={(e)=>modificaNumeroGiorni(e.target.value)}>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n} {n===1?"giorno":"giorni"}</option>)}</select></div></div>
          <label className="pianifica-label">Stato</label><select className="pianifica-field pianifica-standard-field" value={stato} onChange={(e)=>setStato(e.target.value)}><option>Bozza</option><option>Valido</option></select>
          <div className="pianifica-switches"><div className="pianifica-switch-row"><span className="pianifica-switch-label">Giro circolare<span className="pianifica-switch-help">L’arrivo coincide con la partenza.</span></span><label className="pianifica-switch"><input type="checkbox" checked={giroCircolare} onChange={(e)=>{setGiroCircolare(e.target.checked);if(e.target.checked)setArrivo("");invalidaCalcolo();}}/><span className="pianifica-switch-slider"/></label></div><div className="pianifica-switch-row"><span className="pianifica-switch-label">Consenti autostrade<span className="pianifica-switch-help">Se disattivato, il routing evita le autostrade.</span></span><label className="pianifica-switch"><input type="checkbox" checked={consentiAutostrade} onChange={(e)=>{setConsentiAutostrade(e.target.checked);invalidaCalcolo();}}/><span className="pianifica-switch-slider"/></label></div></div>
          <button className="pianifica-calculate" type="button" onClick={calcolaPercorso} disabled={calcoloInCorso||!partenza.trim()||(!giroCircolare&&!arrivo.trim())}>{calcoloInCorso?"Calcolo in corso…":"Calcola percorso"}</button>
          <button className="pianifica-save" type="submit" disabled={obbligatoriMancanti}>Salva tour</button>
          {errore&&<p className="pianifica-error">{errore}</p>}{messaggio&&<p className="pianifica-message">{messaggio}</p>}
        </section>
        <section className="pianifica-card">
          <div className="pianifica-map-heading"><h3>Mappa percorso</h3><span className="pianifica-map-profile">{tipoPercorso} · {consentiAutostrade?"autostrade consentite":"autostrade escluse"}</span></div>
          <MappaPercorso partenza={coordinatePartenza} arrivo={giroCircolare?coordinatePartenza:coordinateArrivo} passaggi={coordinatePassaggi} coordinateTraccia={coordinateTraccia}/>
          <RiepilogoPercorso riepilogo={riepilogoVisualizzato} titolo="Anteprima del percorso" />
          <h3 className="pianifica-days-heading">Suddivisione del viaggio</h3><p className="pianifica-day-help">I dati giornalieri saranno calcolati dalla relativa traccia.</p>
          <div style={{marginTop:14}}>{giornate.map((g,i)=>{const aperta=giornoAperto===g.numero;return <article className="pianifica-day-card" key={g.id}><button className="pianifica-day-button" type="button" onClick={()=>setGiornoAperto(aperta?null:g.numero)}><strong>Giorno {g.numero}</strong><span>{aperta?"Chiudi dettagli":"Apri dettagli"}</span></button>{aperta&&<div className="pianifica-day-content"><div className="pianifica-day-grid"><div><label className="pianifica-label">Titolo tappa</label><input className="pianifica-field" value={g.titolo} onChange={(e)=>aggiornaGiornata(i,"titolo",e.target.value)}/></div><div><label className="pianifica-label">Partenza giornata</label><input className="pianifica-field" value={g.partenza} onChange={(e)=>aggiornaGiornata(i,"partenza",e.target.value)}/></div><div><label className="pianifica-label">Arrivo giornata</label><input className="pianifica-field" value={g.arrivo} onChange={(e)=>aggiornaGiornata(i,"arrivo",e.target.value)}/></div></div><div className="pianifica-auto-data">Km, durata e dislivello compariranno dopo il calcolo della giornata.</div><RiepilogoPercorso riepilogo={g.riepilogo} titolo={`Dati del giorno ${g.numero}`}/><textarea className="pianifica-field pianifica-day-note" value={g.note} onChange={(e)=>aggiornaGiornata(i,"note",e.target.value)} placeholder="Note di pianificazione"/></div>}</article>})}</div>
        </section>
      </form>
    </main>
  );
}
