import { useMemo, useState } from "react";
import MappaPercorso from "../components/MappaPercorso";
import RiepilogoPercorso from "../components/RiepilogoPercorso";

const MAX_PASSAGGI = 10;

const creaGiornata = (numero) => ({
  id: crypto.randomUUID(),
  numero,
  titolo: `Giorno ${numero}`,
  partenza: "",
  arrivo: "",
  passaggi: [],
  note: "",
  riepilogo: null,
  geometria: null,
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

  const [coordinatePartenza, setCoordinatePartenza] = useState(null);
  const [coordinateArrivo, setCoordinateArrivo] = useState(null);
  const [coordinatePassaggi, setCoordinatePassaggi] = useState([]);
  const [coordinateTraccia, setCoordinateTraccia] = useState([]);
  const [riepilogoTour, setRiepilogoTour] = useState(null);

  const invalidaCalcoloPercorso = () => {
    setCoordinateTraccia([]);
    setRiepilogoTour(null);
    setGiornate((correnti) =>
      correnti.map((giornata) => ({
        ...giornata,
        riepilogo: null,
        geometria: null,
      }))
    );
    setMessaggio("");
  };

  const aggiornaPartenza = (valore) => {
    setPartenza(valore);
    setCoordinatePartenza(null);
    if (giroCircolare) setCoordinateArrivo(null);
    invalidaCalcoloPercorso();
  };

  const aggiornaArrivo = (valore) => {
    setArrivo(valore);
    setCoordinateArrivo(null);
    invalidaCalcoloPercorso();
  };

  const aggiungiPassaggio = () => {
    if (passaggi.length >= MAX_PASSAGGI) return;
    setPassaggi((correnti) => [...correnti, ""]);
    setCoordinatePassaggi((correnti) => [...correnti, null]);
    invalidaCalcoloPercorso();
  };

  const aggiornaPassaggio = (indice, valore) => {
    setPassaggi((correnti) =>
      correnti.map((passaggio, i) => (i === indice ? valore : passaggio))
    );
    setCoordinatePassaggi((correnti) =>
      correnti.map((coordinate, i) => (i === indice ? null : coordinate))
    );
    invalidaCalcoloPercorso();
  };

  const eliminaPassaggio = (indice) => {
    setPassaggi((correnti) => correnti.filter((_, i) => i !== indice));
    setCoordinatePassaggi((correnti) => correnti.filter((_, i) => i !== indice));
    invalidaCalcoloPercorso();
  };

  const spostaPassaggio = (da, a) => {
    if (a < 0 || a >= passaggi.length) return;
    setPassaggi((correnti) => {
      const copia = [...correnti];
      const [elemento] = copia.splice(da, 1);
      copia.splice(a, 0, elemento);
      return copia;
    });
    setCoordinatePassaggi((correnti) => {
      const copia = [...correnti];
      const [elemento] = copia.splice(da, 1);
      copia.splice(a, 0, elemento);
      return copia;
    });
    invalidaCalcoloPercorso();
  };

  const modificaNumeroGiorni = (valore) => {
    const nuovoNumero = Math.min(5, Math.max(1, Number(valore) || 1));
    setNumeroGiorni(nuovoNumero);
    setGiornate((correnti) =>
      Array.from({ length: nuovoNumero }, (_, i) =>
        correnti[i] ? { ...correnti[i], numero: i + 1 } : creaGiornata(i + 1)
      )
    );
    if (giornoAperto !== null && giornoAperto > nuovoNumero) {
      setGiornoAperto(nuovoNumero);
    }
    invalidaCalcoloPercorso();
  };

  const aggiornaGiornata = (indice, campo, valore) => {
    setGiornate((correnti) =>
      correnti.map((giornata, i) =>
        i === indice ? { ...giornata, [campo]: valore } : giornata
      )
    );
    if (campo !== "note" && campo !== "titolo") setRiepilogoTour(null);
    setMessaggio("");
  };

  const totaliTour = useMemo(() => {
    const validi = giornate.map((g) => g.riepilogo).filter(Boolean);
    if (!validi.length) return null;
    const minime = validi.map((r) => Number(r.quotaMinima)).filter(Number.isFinite);
    const massime = validi.map((r) => Number(r.quotaMassima)).filter(Number.isFinite);
    return {
      distanzaMetri: validi.reduce((t, r) => t + (Number(r.distanzaMetri) || 0), 0),
      durataSecondi: validi.reduce((t, r) => t + (Number(r.durataSecondi) || 0), 0),
      dislivelloPositivo: validi.reduce((t, r) => t + (Number(r.dislivelloPositivo) || 0), 0),
      dislivelloNegativo: validi.reduce((t, r) => t + (Number(r.dislivelloNegativo) || 0), 0),
      quotaMinima: minime.length ? Math.min(...minime) : null,
      quotaMassima: massime.length ? Math.max(...massime) : null,
    };
  }, [giornate]);

  const riepilogoVisualizzato = riepilogoTour || totaliTour;
  const coordinatePassaggiValide = coordinatePassaggi.filter(
    (c) => Array.isArray(c) && c.length >= 2
  );
  const campoObbligatorioMancante =
    !nome.trim() || !partenza.trim() || (!giroCircolare && !arrivo.trim());

  const impostaGiroCircolare = (attivo) => {
    setGiroCircolare(attivo);
    if (attivo) {
      setArrivo("");
      setCoordinateArrivo(null);
    }
    invalidaCalcoloPercorso();
  };

  const salvaTour = (evento) => {
    evento.preventDefault();
    const tour = {
      id: crypto.randomUUID(),
      nome: nome.trim(),
      partenza: partenza.trim(),
      passaggi: passaggi.map((p) => p.trim()).filter(Boolean),
      arrivo: giroCircolare ? partenza.trim() : arrivo.trim(),
      tipoPercorso,
      stato,
      giroCircolare,
      consentiAutostrade,
      numeroGiorni,
      giornate,
      geometria: coordinateTraccia.length ? coordinateTraccia : null,
      riepilogo: riepilogoVisualizzato || null,
    };
    console.log("Tour da salvare:", tour);
    setMessaggio(`Tour "${nome.trim() || "senza nome"}" preparato correttamente.`);
  };

  return (
    <main className="pianifica-page">
      <style>{`
        .pianifica-page{width:100%;box-sizing:border-box}.pianifica-title{margin:0;color:#f97316;font-size:28px;font-weight:800}.pianifica-subtitle{margin:6px 0 0;color:#94a3b8;font-size:14px;line-height:1.5}.pianifica-layout{display:grid;grid-template-columns:minmax(300px,1fr) minmax(0,2fr);gap:20px;align-items:start;margin-top:24px}.pianifica-card{min-width:0;padding:20px;box-sizing:border-box;border:1px solid #1e293b;border-radius:18px;background:#0f172a;box-shadow:0 14px 35px rgba(0,0,0,.18)}.pianifica-card-title{margin:0 0 20px;color:#f8fafc;font-size:19px;text-align:center}.pianifica-label{display:block;margin:0 0 7px;color:#cbd5e1;font-size:12px;font-weight:700}.pianifica-field{display:block;width:100%;box-sizing:border-box;margin:0;padding:13px 14px;border:1px solid #334155;border-radius:11px;outline:none;background:#172033;color:#f8fafc;font-family:inherit;font-size:14px}.pianifica-field::placeholder{color:#64748b}.pianifica-field:hover{border-color:#475569;background:#1a2538}.pianifica-field:focus{border-color:#f97316;box-shadow:0 0 0 3px rgba(249,115,22,.16)}.pianifica-field:disabled{cursor:not-allowed;opacity:.62}.pianifica-standard-field{margin-bottom:14px}textarea.pianifica-field{min-height:82px;resize:vertical}
        .pianifica-route-fields{margin-bottom:18px;padding:14px;border:1px solid #29374b;border-radius:14px;background:#111a2b}.pianifica-route-row{display:grid;grid-template-columns:32px minmax(0,1fr) auto;align-items:center;gap:8px;margin-bottom:10px}.pianifica-route-row:last-child{margin-bottom:0}.pianifica-route-letter{display:flex;width:30px;height:30px;align-items:center;justify-content:center;box-sizing:border-box;border:2px solid #f97316;border-radius:50%;background:rgba(249,115,22,.12);color:#fb923c;font-size:12px;font-weight:900}.pianifica-route-letter.arrivo{border-color:#38bdf8;background:rgba(56,189,248,.1);color:#7dd3fc}.pianifica-route-controls{display:flex;gap:5px}.pianifica-route-control{display:flex;width:30px;height:30px;align-items:center;justify-content:center;padding:0;border:1px solid #334155;border-radius:8px;background:#172033;color:#94a3b8;cursor:pointer;font-size:12px}.pianifica-route-control:hover:not(:disabled){border-color:#f97316;color:#fb923c}.pianifica-route-control.delete:hover{border-color:#ef4444;color:#fca5a5}.pianifica-route-control:disabled{cursor:not-allowed;opacity:.28}.pianifica-add-passaggio{width:100%;box-sizing:border-box;margin:3px 0 12px;padding:11px 14px;border:1px dashed #475569;border-radius:11px;background:rgba(23,32,51,.7);color:#fb923c;cursor:pointer;font-family:inherit;font-size:13px;font-weight:800}.pianifica-add-passaggio:hover:not(:disabled){border-color:#f97316;background:rgba(249,115,22,.08)}.pianifica-add-passaggio:disabled{cursor:not-allowed;opacity:.45}.pianifica-route-help{margin:0 0 14px;color:#64748b;font-size:11px;line-height:1.5}.pianifica-grid-small{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .pianifica-switches{display:grid;gap:10px;margin:2px 0 20px}.pianifica-switch-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 14px;border:1px solid #334155;border-radius:11px;background:#172033}.pianifica-switch-label{color:#e2e8f0;font-size:14px;font-weight:700}.pianifica-switch-help{display:block;margin-top:3px;color:#64748b;font-size:11px;font-weight:400}.pianifica-switch{position:relative;flex:0 0 auto;width:46px;height:25px}.pianifica-switch input{width:0;height:0;opacity:0}.pianifica-switch-slider{position:absolute;inset:0;cursor:pointer;border-radius:999px;background:#475569;transition:180ms ease}.pianifica-switch-slider::before{position:absolute;width:19px;height:19px;left:3px;top:3px;border-radius:50%;background:white;content:"";transition:180ms ease}.pianifica-switch input:checked+.pianifica-switch-slider{background:#f97316}.pianifica-switch input:checked+.pianifica-switch-slider::before{transform:translateX(21px)}.pianifica-save{width:100%;padding:14px 18px;border:0;border-radius:11px;background:#f97316;color:white;cursor:pointer;font-family:inherit;font-size:15px;font-weight:800}.pianifica-save:hover:not(:disabled){background:#ea580c}.pianifica-save:disabled{cursor:not-allowed;opacity:.45}.pianifica-message{margin:12px 0 0;padding:10px 12px;border:1px solid rgba(34,197,94,.3);border-radius:10px;background:rgba(34,197,94,.1);color:#86efac;font-size:13px}
        .pianifica-map-section{min-width:0}.pianifica-map-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:14px}.pianifica-map-heading h3{margin:0;color:#f8fafc;font-size:19px}.pianifica-map-profile{padding:7px 11px;border:1px solid rgba(249,115,22,.35);border-radius:999px;background:rgba(249,115,22,.1);color:#fb923c;font-size:12px;font-weight:800}.pianifica-map-container{position:relative;min-width:0}.pianifica-days-heading{margin:28px 0 12px;color:#f97316;font-size:20px}.pianifica-day-help{margin:0;color:#64748b;font-size:12px;line-height:1.5}.pianifica-day-card{margin-bottom:12px;overflow:hidden;border:1px solid #334155;border-radius:13px;background:#172033}.pianifica-day-button{display:flex;width:100%;align-items:center;justify-content:space-between;padding:15px 16px;box-sizing:border-box;border:0;background:transparent;color:white;cursor:pointer;font-family:inherit}.pianifica-day-button strong{color:#fb923c}.pianifica-day-button span{color:#94a3b8;font-size:12px}.pianifica-day-content{padding:16px;border-top:1px solid #273449}.pianifica-day-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 12px}.pianifica-day-note{min-height:82px;margin-top:14px}.pianifica-auto-data{margin-top:16px;padding:13px;border:1px solid rgba(56,189,248,.22);border-radius:12px;background:rgba(56,189,248,.06);color:#bae6fd;font-size:12px;line-height:1.5}
        @media(max-width:850px){.pianifica-layout{grid-template-columns:1fr}}@media(max-width:560px){.pianifica-grid-small,.pianifica-day-grid{grid-template-columns:1fr}.pianifica-route-row{grid-template-columns:30px minmax(0,1fr)}.pianifica-route-controls{grid-column:2}.pianifica-map-heading{align-items:flex-start;flex-direction:column}}
      `}</style>

      <header>
        <h2 className="pianifica-title">Pianificazione Tour</h2>
        <p className="pianifica-subtitle">
          Definisci partenza, passaggi intermedi e arrivo. La mappa mostrerà il percorso e i dati calcolati automaticamente.
        </p>
      </header>

      <form className="pianifica-layout" onSubmit={salvaTour}>
        <section className="pianifica-card">
          <h3 className="pianifica-card-title">Nuovo tour</h3>

          <label className="pianifica-label">Nome tour</label>
          <input
            className="pianifica-field pianifica-standard-field"
            value={nome}
            onChange={(e) => { setNome(e.target.value); setMessaggio(""); }}
            placeholder="Es. Tour delle Dolomiti"
          />

          <label className="pianifica-label">Percorso</label>
          <div className="pianifica-route-fields">
            <div className="pianifica-route-row">
              <span className="pianifica-route-letter">A</span>
              <input className="pianifica-field" value={partenza} onChange={(e) => aggiornaPartenza(e.target.value)} placeholder="Partenza" />
              <div />
            </div>

            {passaggi.map((passaggio, indice) => (
              <div className="pianifica-route-row" key={`passaggio-${indice}`}>
                <span className="pianifica-route-letter">{letteraPercorso(indice + 1)}</span>
                <input className="pianifica-field" value={passaggio} onChange={(e) => aggiornaPassaggio(indice, e.target.value)} placeholder={`Passaggio ${indice + 1}`} />
                <div className="pianifica-route-controls">
                  <button className="pianifica-route-control" type="button" disabled={indice === 0} onClick={() => spostaPassaggio(indice, indice - 1)}>▲</button>
                  <button className="pianifica-route-control" type="button" disabled={indice === passaggi.length - 1} onClick={() => spostaPassaggio(indice, indice + 1)}>▼</button>
                  <button className="pianifica-route-control delete" type="button" onClick={() => eliminaPassaggio(indice)}>×</button>
                </div>
              </div>
            ))}

            <button className="pianifica-add-passaggio" type="button" onClick={aggiungiPassaggio} disabled={passaggi.length >= MAX_PASSAGGI}>
              + Aggiungi passaggio
            </button>

            <div className="pianifica-route-row">
              <span className="pianifica-route-letter arrivo">{letteraPercorso(passaggi.length + 1)}</span>
              <input className="pianifica-field" value={giroCircolare ? partenza : arrivo} onChange={(e) => aggiornaArrivo(e.target.value)} disabled={giroCircolare} placeholder={giroCircolare ? "Uguale alla partenza" : "Arrivo"} />
              <div />
            </div>
          </div>

          <p className="pianifica-route-help">Usa ▲ e ▼ per modificare l’ordine dei passaggi. Ogni modifica invalida il precedente calcolo del percorso.</p>

          <div className="pianifica-grid-small">
            <div>
              <label className="pianifica-label">Tipo percorso</label>
              <select className="pianifica-field pianifica-standard-field" value={tipoPercorso} onChange={(e) => { setTipoPercorso(e.target.value); invalidaCalcoloPercorso(); }}>
                <option value="Veloce">Veloce</option>
                <option value="Panoramico">Panoramico</option>
                <option value="Curve">Curve</option>
                <option value="Extra curve">Extra curve</option>
              </select>
            </div>
            <div>
              <label className="pianifica-label">Numero giorni</label>
              <select className="pianifica-field pianifica-standard-field" value={numeroGiorni} onChange={(e) => modificaNumeroGiorni(e.target.value)}>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} {n === 1 ? "giorno" : "giorni"}</option>)}
              </select>
            </div>
          </div>

          <label className="pianifica-label">Stato</label>
          <select className="pianifica-field pianifica-standard-field" value={stato} onChange={(e) => setStato(e.target.value)}>
            <option value="Bozza">Bozza</option>
            <option value="Valido">Valido</option>
          </select>

          <div className="pianifica-switches">
            <div className="pianifica-switch-row">
              <span className="pianifica-switch-label">Giro circolare<span className="pianifica-switch-help">L’arrivo coincide con la partenza.</span></span>
              <label className="pianifica-switch"><input type="checkbox" checked={giroCircolare} onChange={(e) => impostaGiroCircolare(e.target.checked)} /><span className="pianifica-switch-slider" /></label>
            </div>
            <div className="pianifica-switch-row">
              <span className="pianifica-switch-label">Consenti autostrade<span className="pianifica-switch-help">Se disattivato, il futuro routing eviterà le autostrade.</span></span>
              <label className="pianifica-switch"><input type="checkbox" checked={consentiAutostrade} onChange={(e) => { setConsentiAutostrade(e.target.checked); invalidaCalcoloPercorso(); }} /><span className="pianifica-switch-slider" /></label>
            </div>
          </div>

          <button className="pianifica-save" type="submit" disabled={campoObbligatorioMancante}>Salva tour</button>
          {messaggio && <p className="pianifica-message">{messaggio}</p>}
        </section>

        <section className="pianifica-card pianifica-map-section">
          <div className="pianifica-map-heading">
            <h3>Mappa percorso</h3>
            <span className="pianifica-map-profile">{tipoPercorso} · {consentiAutostrade ? "autostrade consentite" : "autostrade escluse"}</span>
          </div>

          <div className="pianifica-map-container">
            <MappaPercorso
              partenza={coordinatePartenza}
              arrivo={giroCircolare ? coordinatePartenza : coordinateArrivo}
              passaggi={coordinatePassaggiValide}
              coordinateTraccia={coordinateTraccia}
            />
          </div>

          <RiepilogoPercorso riepilogo={riepilogoVisualizzato} titolo="Anteprima del percorso" />

          <h3 className="pianifica-days-heading">Suddivisione del viaggio</h3>
          <p className="pianifica-day-help">Chilometri, durata e dislivello di ogni giornata saranno calcolati automaticamente dalla relativa traccia.</p>

          <div style={{ marginTop: "14px" }}>
            {giornate.map((giornata, indice) => {
              const aperta = giornoAperto === giornata.numero;
              return (
                <article className="pianifica-day-card" key={giornata.id}>
                  <button className="pianifica-day-button" type="button" onClick={() => setGiornoAperto(aperta ? null : giornata.numero)}>
                    <strong>Giorno {giornata.numero}</strong><span>{aperta ? "Chiudi dettagli" : "Apri dettagli"}</span>
                  </button>
                  {aperta && (
                    <div className="pianifica-day-content">
                      <div className="pianifica-day-grid">
                        <div><label className="pianifica-label">Titolo tappa</label><input className="pianifica-field" value={giornata.titolo} onChange={(e) => aggiornaGiornata(indice, "titolo", e.target.value)} /></div>
                        <div><label className="pianifica-label">Partenza giornata</label><input className="pianifica-field" value={giornata.partenza} onChange={(e) => aggiornaGiornata(indice, "partenza", e.target.value)} placeholder="Partenza tappa" /></div>
                        <div><label className="pianifica-label">Arrivo giornata</label><input className="pianifica-field" value={giornata.arrivo} onChange={(e) => aggiornaGiornata(indice, "arrivo", e.target.value)} placeholder="Arrivo tappa" /></div>
                      </div>
                      <div className="pianifica-auto-data">Km, ore, dislivello, quota minima e quota massima non sono campi manuali. Questi valori compariranno dopo il calcolo della giornata.</div>
                      <RiepilogoPercorso riepilogo={giornata.riepilogo} titolo={`Dati del giorno ${giornata.numero}`} />
                      <label className="pianifica-label" style={{ marginTop: "16px" }}>Note di pianificazione</label>
                      <textarea className="pianifica-field pianifica-day-note" value={giornata.note} onChange={(e) => aggiornaGiornata(indice, "note", e.target.value)} placeholder="Indicazioni, strade da verificare, orari o altre note" />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </form>
    </main>
  );
}