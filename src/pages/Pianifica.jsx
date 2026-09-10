import { useMemo, useState } from "react";
import AutocompleteLocalita from "../components/AutocompleteLocalita";
import MappaPercorso from "../components/MappaPercorso";
import RiepilogoPercorso from "../components/RiepilogoPercorso";
import { costruisciPercorso } from "../services/routingService";
import {
  salvaTour as salvaTourStorage,
} from "../services/tourStorage";

const MAX_PASSAGGI = 10;

const creaGiornata = (numero) => ({
  id: crypto.randomUUID(),
  numero,
  titolo: `Giorno ${numero}`,
  partenza: "",
  arrivo: "",
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
  const [errore, setErrore] = useState("");
  const [calcoloInCorso, setCalcoloInCorso] = useState(false);

  const [coordinatePartenza, setCoordinatePartenza] = useState(null);
  const [coordinateArrivo, setCoordinateArrivo] = useState(null);
  const [coordinatePassaggi, setCoordinatePassaggi] = useState([]);
  const [coordinateTraccia, setCoordinateTraccia] = useState([]);
  const [coordinateORSPartenza, setCoordinateORSPartenza] = useState(null);
  const [coordinateORSArrivo, setCoordinateORSArrivo] = useState(null);
  const [coordinateORSPassaggi, setCoordinateORSPassaggi] = useState([]);
  const [riepilogoTour, setRiepilogoTour] = useState(null);

  const invalidaSoloRisultato = () => {
    setCoordinateTraccia([]);
    setRiepilogoTour(null);
    setMessaggio("");
    setErrore("");
  };

  const aggiornaPartenza = (valore) => {
    setPartenza(valore);
    setCoordinatePartenza(null);
    setCoordinateORSPartenza(null);
    invalidaSoloRisultato();
  };

  const selezionaPartenza = (risultato) => {
    console.log("PARTENZA SELEZIONATA",risultato);
    setPartenza(risultato.label);
    setCoordinatePartenza(risultato.coordinateLeaflet);
    setCoordinateORSPartenza(risultato.coordinateORS);
    invalidaSoloRisultato();
  };

  const aggiornaArrivo = (valore) => {
    setArrivo(valore);
    setCoordinateArrivo(null);
    setCoordinateORSArrivo(null);
    invalidaSoloRisultato();
  };

  const selezionaArrivo = (risultato) => {
    console.log("ARRIVO SELEZIONATO",risultato);
    setArrivo(risultato.label);
    setCoordinateArrivo(risultato.coordinateLeaflet);
    setCoordinateORSArrivo(risultato.coordinateORS);
    invalidaSoloRisultato();
  };

  const aggiungiPassaggio = () => {
    if (passaggi.length >= MAX_PASSAGGI) return;
    setPassaggi((correnti) => [...correnti, ""]);
    setCoordinatePassaggi((correnti) => [...correnti, null]);
    setCoordinateORSPassaggi((correnti) => [...correnti, null]);
    invalidaSoloRisultato();
  };

  const aggiornaPassaggio = (indice, valore) => {
    setPassaggi((correnti) =>
      correnti.map((passaggio, i) => (i === indice ? valore : passaggio))
    );
    setCoordinatePassaggi((correnti) =>
      correnti.map((coordinate, i) => (i === indice ? null : coordinate))
    );
    setCoordinateORSPassaggi((correnti) =>
      correnti.map((coordinate, i) => (i === indice ? null : coordinate))
    );
    invalidaSoloRisultato();
  };

  const selezionaPassaggio = (indice, risultato) => {
    setPassaggi((correnti) =>
      correnti.map((passaggio, i) =>
        i === indice ? risultato.label : passaggio
      )
    );
    setCoordinatePassaggi((correnti) =>
      correnti.map((coordinate, i) =>
        i === indice ? risultato.coordinateLeaflet : coordinate
      )
    );
    setCoordinateORSPassaggi((correnti) =>
      correnti.map((coordinate, i) =>
        i === indice ? risultato.coordinateORS : coordinate
      )
    );
    invalidaSoloRisultato();
  };

  const eliminaPassaggio = (indice) => {
    setPassaggi((correnti) => correnti.filter((_, i) => i !== indice));
    setCoordinatePassaggi((correnti) =>
      correnti.filter((_, i) => i !== indice)
    );
    setCoordinateORSPassaggi((correnti) =>
      correnti.filter((_, i) => i !== indice)
    );
    invalidaSoloRisultato();
  };

  const spostaElemento = (lista, da, a) => {
    const copia = [...lista];
    const [elemento] = copia.splice(da, 1);
    copia.splice(a, 0, elemento);
    return copia;
  };

  const spostaPassaggio = (da, a) => {
    if (a < 0 || a >= passaggi.length) return;
    setPassaggi((correnti) => spostaElemento(correnti, da, a));
    setCoordinatePassaggi((correnti) => spostaElemento(correnti, da, a));
    setCoordinateORSPassaggi((correnti) => spostaElemento(correnti, da, a));
    invalidaSoloRisultato();
  };

  const modificaNumeroGiorni = (valore) => {
    const nuovoNumero = Math.min(5, Math.max(1, Number(valore) || 1));
    setNumeroGiorni(nuovoNumero);
    setGiornate((correnti) =>
      Array.from({ length: nuovoNumero }, (_, indice) =>
        correnti[indice]
          ? { ...correnti[indice], numero: indice + 1 }
          : creaGiornata(indice + 1)
      )
    );
    if (giornoAperto && giornoAperto > nuovoNumero) {
      setGiornoAperto(nuovoNumero);
    }
  };

  const aggiornaGiornata = (indice, campo, valore) => {
    setGiornate((correnti) =>
      correnti.map((giornata, i) =>
        i === indice ? { ...giornata, [campo]: valore } : giornata
      )
    );
    setMessaggio("");
  };

  const totaliGiornate = useMemo(() => {
    const validi = giornate.map((giornata) => giornata.riepilogo).filter(Boolean);
    if (!validi.length) return null;

    const quoteMinime = validi
      .map((riepilogo) => Number(riepilogo.quotaMinima))
      .filter(Number.isFinite);
    const quoteMassime = validi
      .map((riepilogo) => Number(riepilogo.quotaMassima))
      .filter(Number.isFinite);

    return {
      distanzaMetri: validi.reduce(
        (totale, riepilogo) => totale + (Number(riepilogo.distanzaMetri) || 0),
        0
      ),
      durataSecondi: validi.reduce(
        (totale, riepilogo) => totale + (Number(riepilogo.durataSecondi) || 0),
        0
      ),
      dislivelloPositivo: validi.reduce(
        (totale, riepilogo) =>
          totale + (Number(riepilogo.dislivelloPositivo) || 0),
        0
      ),
      dislivelloNegativo: validi.reduce(
        (totale, riepilogo) =>
          totale + (Number(riepilogo.dislivelloNegativo) || 0),
        0
      ),
      quotaMinima: quoteMinime.length ? Math.min(...quoteMinime) : null,
      quotaMassima: quoteMassime.length ? Math.max(...quoteMassime) : null,
    };
  }, [giornate]);

  const riepilogoVisualizzato = riepilogoTour || totaliGiornate;
  const obbligatoriMancanti =
    !nome.trim() || !partenza.trim() || (!giroCircolare && !arrivo.trim());

  const impostaGiroCircolare = (attivo) => {
    setGiroCircolare(attivo);
    if (attivo) {
      setArrivo("");
      setCoordinateArrivo(coordinatePartenza);
      setCoordinateORSArrivo(coordinateORSPartenza);
    } else {
      setCoordinateArrivo(null);
      setCoordinateORSArrivo(null);
    }
    invalidaSoloRisultato();
  };

  const calcolaPercorso = async () => {
    setErrore("");
    setMessaggio("");

    if (!partenza.trim()) return setErrore("Inserisci la partenza.");
    if (!giroCircolare && !arrivo.trim()) {
      return setErrore("Inserisci l’arrivo oppure attiva Giro circolare.");
    }

    setCalcoloInCorso(true);

    try {
      const risultato = await costruisciPercorso({
        partenza: partenza.trim(),
        passaggi: passaggi.map((passaggio) => passaggio.trim()).filter(Boolean),
        arrivo: giroCircolare ? partenza.trim() : arrivo.trim(),
        autostrade: consentiAutostrade,
        coordinateSelezionate: {
          partenza: coordinateORSPartenza,
          passaggi: coordinateORSPassaggi,
          arrivo: giroCircolare ? coordinateORSPartenza : coordinateORSArrivo,
        },
      });

      setCoordinatePartenza(risultato.pointStart);
      setCoordinateArrivo(risultato.pointEnd);
      setCoordinatePassaggi(risultato.passaggi || []);
      setCoordinateTraccia(risultato.geometria || []);
      setRiepilogoTour({
        distanzaMetri: risultato.distanzaMetri,
        durataSecondi: risultato.durataSecondi,
        dislivelloPositivo: risultato.dislivelloPositivo,
        dislivelloNegativo: risultato.dislivelloNegativo,
        quotaMinima: risultato.quotaMinima,
        quotaMassima: risultato.quotaMassima,
      });
      setMessaggio("Percorso calcolato correttamente.");
    } catch (erroreCalcolo) {
      console.error(erroreCalcolo);
      setErrore(erroreCalcolo?.message || "Impossibile calcolare il percorso.");
      setCoordinateTraccia([]);
      setRiepilogoTour(null);
    } finally {
      setCalcoloInCorso(false);
    }
  };

  const salvaTour = (evento) => {
    evento.preventDefault();

    const tour = {
      id: crypto.randomUUID(),
      nome: nome.trim(),
      partenza: {
        label: partenza.trim(),
        coordinateORS: coordinateORSPartenza,
        coordinateLeaflet: coordinatePartenza,
      },
      passaggi: passaggi
        .map((label, indice) => ({
          label: label.trim(),
          coordinateORS: coordinateORSPassaggi[indice] || null,
          coordinateLeaflet: coordinatePassaggi[indice] || null,
        }))
        .filter((passaggio) => passaggio.label),
      arrivo: {
        label: giroCircolare ? partenza.trim() : arrivo.trim(),
        coordinateORS: giroCircolare
          ? coordinateORSPartenza
          : coordinateORSArrivo,
        coordinateLeaflet: giroCircolare
          ? coordinatePartenza
          : coordinateArrivo,
      },
      tipoPercorso,
      stato,
      giroCircolare,
      consentiAutostrade,
      numeroGiorni,
      giornate,
      geometria: coordinateTraccia.length ? coordinateTraccia : null,
      riepilogo: riepilogoVisualizzato,
    };

    salvaTourStorage(tour);
    
    setMessaggio(
      `Tour "${nome.trim() || "senza nome"}" salvato correttamente.`
    );
  };
  return (
    <main className="pianifica-page">
      <style>{`
        .pianifica-page{width:100%;box-sizing:border-box}.pianifica-title{margin:0;color:#f97316;font-size:28px;font-weight:800}.pianifica-subtitle{margin:6px 0 0;color:#94a3b8;font-size:14px}.pianifica-layout{display:grid;grid-template-columns:minmax(300px,1fr) minmax(0,2fr);gap:20px;align-items:start;margin-top:24px}.pianifica-card{min-width:0;padding:20px;box-sizing:border-box;border:1px solid #1e293b;border-radius:18px;background:#0f172a}.pianifica-card-title{margin:0 0 20px;color:#f8fafc;text-align:center}.pianifica-label{display:block;margin:0 0 7px;color:#cbd5e1;font-size:12px;font-weight:700}.pianifica-field{display:block;width:100%;box-sizing:border-box;margin:0;padding:13px 14px;border:1px solid #334155;border-radius:11px;outline:none;background:#172033;color:#f8fafc;font:14px inherit}.pianifica-field:focus{border-color:#f97316;box-shadow:0 0 0 3px rgba(249,115,22,.16)}.pianifica-field:disabled{opacity:.62}.pianifica-standard-field{margin-bottom:14px}.pianifica-route-fields{margin-bottom:18px;padding:14px;border:1px solid #29374b;border-radius:14px;background:#111a2b}.pianifica-route-row{display:grid;grid-template-columns:32px minmax(0,1fr) auto;align-items:center;gap:8px;margin-bottom:10px}.pianifica-route-letter{display:flex;width:30px;height:30px;align-items:center;justify-content:center;border:2px solid #f97316;border-radius:50%;color:#fb923c;font-weight:900}.pianifica-route-letter.arrivo{border-color:#38bdf8;color:#7dd3fc}.pianifica-route-controls{display:flex;gap:5px}.pianifica-route-control{width:30px;height:30px;border:1px solid #334155;border-radius:8px;background:#172033;color:#94a3b8}.pianifica-add-passaggio{width:100%;margin:3px 0 12px;padding:11px;border:1px dashed #475569;border-radius:11px;background:#172033;color:#fb923c;font-weight:800}.pianifica-route-help{margin:0 0 14px;color:#64748b;font-size:11px}.pianifica-grid-small{display:grid;grid-template-columns:1fr 1fr;gap:12px}.pianifica-switches{display:grid;gap:10px;margin:2px 0 20px}.pianifica-switch-row{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border:1px solid #334155;border-radius:11px;background:#172033}.pianifica-switch-label{font-weight:700}.pianifica-switch-help{display:block;color:#64748b;font-size:11px;font-weight:400}.pianifica-switch{position:relative;width:46px;height:25px}.pianifica-switch input{opacity:0}.pianifica-switch-slider{position:absolute;inset:0;border-radius:999px;background:#475569}.pianifica-switch-slider:before{content:"";position:absolute;width:19px;height:19px;left:3px;top:3px;border-radius:50%;background:white;transition:.18s}.pianifica-switch input:checked+.pianifica-switch-slider{background:#f97316}.pianifica-switch input:checked+.pianifica-switch-slider:before{transform:translateX(21px)}.pianifica-calculate,.pianifica-save{width:100%;padding:14px;border-radius:11px;font-weight:800;font:15px inherit}.pianifica-calculate{margin-bottom:10px;border:1px solid #f97316;background:rgba(249,115,22,.1);color:#fb923c}.pianifica-save{border:0;background:#f97316;color:white}.pianifica-calculate:disabled,.pianifica-save:disabled{opacity:.45}.pianifica-message,.pianifica-error{margin:12px 0 0;padding:10px;border-radius:10px;font-size:13px}.pianifica-message{background:rgba(34,197,94,.1);color:#86efac}.pianifica-error{background:rgba(239,68,68,.1);color:#fca5a5}.pianifica-map-heading{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.pianifica-map-profile{padding:7px 11px;border:1px solid rgba(249,115,22,.35);border-radius:999px;color:#fb923c;font-size:12px}.pianifica-days-heading{margin:28px 0 12px;color:#f97316}.pianifica-day-help{color:#64748b;font-size:12px}.pianifica-day-card{margin-bottom:12px;border:1px solid #334155;border-radius:13px;background:#172033;overflow:hidden}.pianifica-day-button{display:flex;width:100%;justify-content:space-between;padding:15px 16px;border:0;background:transparent;color:white}.pianifica-day-content{padding:16px;border-top:1px solid #273449}.pianifica-day-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px 12px}.pianifica-auto-data{margin-top:16px;padding:13px;border:1px solid rgba(56,189,248,.22);border-radius:12px;color:#bae6fd;font-size:12px}.pianifica-day-note{margin-top:14px;min-height:82px}@media(max-width:850px){.pianifica-layout{grid-template-columns:1fr}}@media(max-width:560px){.pianifica-grid-small,.pianifica-day-grid{grid-template-columns:1fr}}
      `}</style>

      <header>
        <h2 className="pianifica-title">Pianificazione Tour</h2>
        <p className="pianifica-subtitle">
          Seleziona partenza, passaggi e arrivo dai suggerimenti, quindi calcola il percorso.
        </p>
      </header>

      <form className="pianifica-layout" onSubmit={salvaTour}>
        <section className="pianifica-card">
          <h3 className="pianifica-card-title">Nuovo tour</h3>

          <label className="pianifica-label">Nome tour</label>
          <input
            className="pianifica-field pianifica-standard-field"
            value={nome}
            onChange={(evento) => setNome(evento.target.value)}
            placeholder="Es. Tour delle Dolomiti"
          />

          <label className="pianifica-label">Percorso</label>
          <div className="pianifica-route-fields">
            <div className="pianifica-route-row">
              <span className="pianifica-route-letter">A</span>
              <AutocompleteLocalita
                value={partenza}
                onChange={aggiornaPartenza}
                onSelect={selezionaPartenza}
                placeholder="Partenza"
              />
              <div />
            </div>

            {passaggi.map((passaggio, indice) => (
              <div className="pianifica-route-row" key={`passaggio-${indice}`}>
                <span className="pianifica-route-letter">
                  {letteraPercorso(indice + 1)}
                </span>
                <AutocompleteLocalita
                  value={passaggio}
                  onChange={(valore) => aggiornaPassaggio(indice, valore)}
                  onSelect={(risultato) =>
                    selezionaPassaggio(indice, risultato)
                  }
                  placeholder={`Passaggio ${indice + 1}`}
                />
                <div className="pianifica-route-controls">
                  <button
                    type="button"
                    className="pianifica-route-control"
                    disabled={indice === 0}
                    onClick={() => spostaPassaggio(indice, indice - 1)}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    className="pianifica-route-control"
                    disabled={indice === passaggi.length - 1}
                    onClick={() => spostaPassaggio(indice, indice + 1)}
                  >
                    ▼
                  </button>
                  <button
                    type="button"
                    className="pianifica-route-control"
                    onClick={() => eliminaPassaggio(indice)}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="pianifica-add-passaggio"
              onClick={aggiungiPassaggio}
              disabled={passaggi.length >= MAX_PASSAGGI}
            >
              + Aggiungi passaggio
            </button>

            <div className="pianifica-route-row">
              <span className="pianifica-route-letter arrivo">
                {letteraPercorso(passaggi.length + 1)}
              </span>
              <AutocompleteLocalita
                value={giroCircolare ? partenza : arrivo}
                onChange={aggiornaArrivo}
                onSelect={selezionaArrivo}
                placeholder="Arrivo"
                disabled={giroCircolare}
              />
              <div />
            </div>
          </div>

          <p className="pianifica-route-help">
            Le coordinate dei suggerimenti selezionati vengono conservate e usate direttamente dal routing.
          </p>

          <div className="pianifica-grid-small">
            <div>
              <label className="pianifica-label">Tipo percorso</label>
              <select
                className="pianifica-field pianifica-standard-field"
                value={tipoPercorso}
                onChange={(evento) => {
                  setTipoPercorso(evento.target.value);
                  invalidaSoloRisultato();
                }}
              >
                <option>Veloce</option>
                <option>Panoramico</option>
                <option>Curve</option>
                <option>Extra curve</option>
              </select>
            </div>
            <div>
              <label className="pianifica-label">Numero giorni</label>
              <select
                className="pianifica-field pianifica-standard-field"
                value={numeroGiorni}
                onChange={(evento) => modificaNumeroGiorni(evento.target.value)}
              >
                {[1, 2, 3, 4, 5].map((numero) => (
                  <option key={numero} value={numero}>
                    {numero} {numero === 1 ? "giorno" : "giorni"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="pianifica-label">Stato</label>
          <select
            className="pianifica-field pianifica-standard-field"
            value={stato}
            onChange={(evento) => setStato(evento.target.value)}
          >
            <option>Bozza</option>
            <option>Valido</option>
          </select>

          <div className="pianifica-switches">
            <div className="pianifica-switch-row">
              <span className="pianifica-switch-label">
                Giro circolare
                <span className="pianifica-switch-help">
                  L’arrivo coincide con la partenza.
                </span>
              </span>
              <label className="pianifica-switch">
                <input
                  type="checkbox"
                  checked={giroCircolare}
                  onChange={(evento) =>
                    impostaGiroCircolare(evento.target.checked)
                  }
                />
                <span className="pianifica-switch-slider" />
              </label>
            </div>

            <div className="pianifica-switch-row">
              <span className="pianifica-switch-label">
                Consenti autostrade
                <span className="pianifica-switch-help">
                  Se disattivato, il routing evita le autostrade.
                </span>
              </span>
              <label className="pianifica-switch">
                <input
                  type="checkbox"
                  checked={consentiAutostrade}
                  onChange={(evento) => {
                    setConsentiAutostrade(evento.target.checked);
                    invalidaSoloRisultato();
                  }}
                />
                <span className="pianifica-switch-slider" />
              </label>
            </div>
          </div>

          <button
            className="pianifica-calculate"
            type="button"
            onClick={calcolaPercorso}
            disabled={
              calcoloInCorso ||
              !partenza.trim() ||
              (!giroCircolare && !arrivo.trim())
            }
          >
            {calcoloInCorso ? "Calcolo in corso…" : "Calcola percorso"}
          </button>

          <button
            className="pianifica-save"
            type="submit"
            disabled={obbligatoriMancanti}
          >
            Salva tour
          </button>

          {errore && <p className="pianifica-error">{errore}</p>}
          {messaggio && <p className="pianifica-message">{messaggio}</p>}
        </section>

        <section className="pianifica-card">
          <div className="pianifica-map-heading">
            <h3>Mappa percorso</h3>
            <span className="pianifica-map-profile">
              {tipoPercorso} · {consentiAutostrade
                ? "autostrade consentite"
                : "autostrade escluse"}
            </span>
          </div>

          <MappaPercorso
            partenza={coordinatePartenza}
            arrivo={giroCircolare ? coordinatePartenza : coordinateArrivo}
            passaggi={coordinatePassaggi.filter(Boolean)}
            coordinateTraccia={coordinateTraccia}
          />

          <RiepilogoPercorso
            riepilogo={riepilogoVisualizzato}
            titolo="Anteprima del percorso"
          />

          <h3 className="pianifica-days-heading">Suddivisione del viaggio</h3>
          <p className="pianifica-day-help">
            I dati giornalieri saranno calcolati dalla relativa traccia.
          </p>

          <div style={{ marginTop: 14 }}>
            {giornate.map((giornata, indice) => {
              const aperta = giornoAperto === giornata.numero;

              return (
                <article className="pianifica-day-card" key={giornata.id}>
                  <button
                    className="pianifica-day-button"
                    type="button"
                    onClick={() =>
                      setGiornoAperto(aperta ? null : giornata.numero)
                    }
                  >
                    <strong>Giorno {giornata.numero}</strong>
                    <span>
                      {aperta ? "Chiudi dettagli" : "Apri dettagli"}
                    </span>
                  </button>

                  {aperta && (
                    <div className="pianifica-day-content">
                      <div className="pianifica-day-grid">
                        <div>
                          <label className="pianifica-label">
                            Titolo tappa
                          </label>
                          <input
                            className="pianifica-field"
                            value={giornata.titolo}
                            onChange={(evento) =>
                              aggiornaGiornata(
                                indice,
                                "titolo",
                                evento.target.value
                              )
                            }
                          />
                        </div>
                        <div>
                          <label className="pianifica-label">
                            Partenza giornata
                          </label>
                          <input
                            className="pianifica-field"
                            value={giornata.partenza}
                            onChange={(evento) =>
                              aggiornaGiornata(
                                indice,
                                "partenza",
                                evento.target.value
                              )
                            }
                          />
                        </div>
                        <div>
                          <label className="pianifica-label">
                            Arrivo giornata
                          </label>
                          <input
                            className="pianifica-field"
                            value={giornata.arrivo}
                            onChange={(evento) =>
                              aggiornaGiornata(
                                indice,
                                "arrivo",
                                evento.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="pianifica-auto-data">
                        Km, durata e dislivello compariranno dopo il calcolo
                        della giornata.
                      </div>

                      <RiepilogoPercorso
                        riepilogo={giornata.riepilogo}
                        titolo={`Dati del giorno ${giornata.numero}`}
                      />

                      <textarea
                        className="pianifica-field pianifica-day-note"
                        value={giornata.note}
                        onChange={(evento) =>
                          aggiornaGiornata(
                            indice,
                            "note",
                            evento.target.value
                          )
                        }
                        placeholder="Note di pianificazione"
                      />
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