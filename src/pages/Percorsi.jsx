import { useEffect, useMemo, useState } from "react";
import {
  duplicaTour,
  eliminaTour,
  recuperaTour,
} from "../services/tourStorage";

function formattaDistanza(metri) {
  return `${((Number(metri) || 0) / 1000).toLocaleString("it-IT", {
    maximumFractionDigits: 1,
  })} km`;
}

function formattaDurata(secondi) {
  const minutiTotali = Math.round((Number(secondi) || 0) / 60);
  const ore = Math.floor(minutiTotali / 60);
  const minuti = minutiTotali % 60;

  if (!ore) return `${minuti} min`;
  if (!minuti) return `${ore} h`;
  return `${ore} h ${minuti} min`;
}

function formattaData(dataIso) {
  if (!dataIso) return "Data non disponibile";

  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dataIso));
}

export default function Percorsi({ onApriTour }) {
  const [tours, setTours] = useState(() => recuperaTour());
  const [ricerca, setRicerca] = useState("");

  const ricarica = () => {
    setTours(recuperaTour());
  };

  useEffect(() => {
    window.addEventListener("mototour:tours-updated", ricarica);
    window.addEventListener("storage", ricarica);

    return () => {
      window.removeEventListener("mototour:tours-updated", ricarica);
      window.removeEventListener("storage", ricarica);
    };
  }, []);

  const toursFiltrati = useMemo(() => {
    const testo = ricerca.trim().toLowerCase();

    if (!testo) return tours;

    return tours.filter((tour) => {
      const valori = [
        tour.nome,
        tour.stato,
        tour.tipoPercorso,
        tour.partenza?.label,
        tour.arrivo?.label,
        ...(tour.passaggi || []).map((passaggio) => passaggio.label),
      ];

      return valori.some((valore) =>
        String(valore || "").toLowerCase().includes(testo)
      );
    });
  }, [tours, ricerca]);

  const gestisciEliminazione = (tour) => {
    const confermato = window.confirm(
      `Eliminare definitivamente il tour "${tour.nome}"?`
    );

    if (!confermato) return;

    eliminaTour(tour.id);
    ricarica();
  };

  const gestisciDuplicazione = (tour) => {
    duplicaTour(tour.id);
    ricarica();
  };

  return (
    <main className="percorsi-page">
      <style>{`
        .percorsi-page{width:100%;box-sizing:border-box}.percorsi-header{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:22px}.percorsi-title{margin:0;color:#f97316;font-size:28px;font-weight:800}.percorsi-subtitle{margin:6px 0 0;color:#94a3b8;font-size:14px}.percorsi-search{width:min(360px,100%);padding:12px 14px;border:1px solid #334155;border-radius:11px;outline:none;background:#172033;color:#f8fafc;font:14px inherit}.percorsi-search:focus{border-color:#f97316;box-shadow:0 0 0 3px rgba(249,115,22,.16)}.percorsi-empty{padding:42px 22px;border:1px dashed #334155;border-radius:18px;background:#0f172a;color:#94a3b8;text-align:center}.percorsi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:16px}.percorso-card{display:flex;flex-direction:column;min-width:0;padding:18px;border:1px solid #1e293b;border-radius:17px;background:#0f172a;box-shadow:0 12px 30px rgba(0,0,0,.16)}.percorso-card-top{display:flex;align-items:start;justify-content:space-between;gap:12px}.percorso-card h3{margin:0;color:#f8fafc;font-size:18px}.percorso-badge{flex:0 0 auto;padding:5px 9px;border:1px solid rgba(249,115,22,.35);border-radius:999px;background:rgba(249,115,22,.09);color:#fb923c;font-size:11px;font-weight:800}.percorso-route{margin:15px 0 0;padding:12px;border:1px solid #29374b;border-radius:12px;background:#111a2b}.percorso-point{display:grid;grid-template-columns:22px minmax(0,1fr);gap:8px;padding:4px 0;color:#e2e8f0;font-size:12px}.percorso-point-letter{display:flex;width:20px;height:20px;align-items:center;justify-content:center;border-radius:50%;background:#1e293b;color:#fb923c;font-size:10px;font-weight:900}.percorso-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}.percorso-metric{padding:10px 7px;border:1px solid #263449;border-radius:10px;background:#172033;text-align:center}.percorso-metric span{display:block;color:#64748b;font-size:10px}.percorso-metric strong{display:block;margin-top:3px;color:#f8fafc;font-size:13px}.percorso-meta{margin-top:13px;color:#64748b;font-size:11px}.percorso-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:auto;padding-top:16px}.percorso-action{flex:1 1 auto;padding:9px 11px;border:1px solid #334155;border-radius:9px;background:#172033;color:#cbd5e1;cursor:pointer;font:12px inherit;font-weight:700}.percorso-action:hover{border-color:#f97316;color:#fb923c}.percorso-action.primary{border-color:#f97316;background:#f97316;color:white}.percorso-action.danger:hover{border-color:#ef4444;color:#fca5a5}@media(max-width:700px){.percorsi-header{align-items:stretch;flex-direction:column}.percorsi-search{width:100%}.percorso-metrics{grid-template-columns:1fr}}
      `}</style>

      <header className="percorsi-header">
        <div>
          <h2 className="percorsi-title">Percorsi salvati</h2>
          <p className="percorsi-subtitle">
            Consulta, duplica o riapri i tour salvati sul dispositivo.
          </p>
        </div>

        <input
          className="percorsi-search"
          value={ricerca}
          onChange={(evento) => setRicerca(evento.target.value)}
          placeholder="Cerca per nome, città o stato"
        />
      </header>

      {toursFiltrati.length === 0 ? (
        <section className="percorsi-empty">
          {tours.length === 0
            ? "Non hai ancora salvato alcun tour."
            : "Nessun tour corrisponde alla ricerca."}
        </section>
      ) : (
        <section className="percorsi-grid">
          {toursFiltrati.map((tour) => {
            const punti = [
              tour.partenza,
              ...(tour.passaggi || []),
              tour.arrivo,
            ].filter((punto) => punto?.label);

            return (
              <article className="percorso-card" key={tour.id}>
                <div className="percorso-card-top">
                  <h3>{tour.nome}</h3>
                  <span className="percorso-badge">{tour.stato}</span>
                </div>

                <div className="percorso-route">
                  {punti.map((punto, indice) => (
                    <div className="percorso-point" key={`${tour.id}-${indice}`}>
                      <span className="percorso-point-letter">
                        {String.fromCharCode(65 + indice)}
                      </span>
                      <span>{punto.label}</span>
                    </div>
                  ))}
                </div>

                <div className="percorso-metrics">
                  <div className="percorso-metric">
                    <span>Distanza</span>
                    <strong>{formattaDistanza(tour.riepilogo?.distanzaMetri)}</strong>
                  </div>
                  <div className="percorso-metric">
                    <span>Durata</span>
                    <strong>{formattaDurata(tour.riepilogo?.durataSecondi)}</strong>
                  </div>
                  <div className="percorso-metric">
                    <span>Dislivello</span>
                    <strong>{Number(tour.riepilogo?.dislivelloPositivo) || 0} m</strong>
                  </div>
                </div>

                <div className="percorso-meta">
                  {tour.tipoPercorso} · {tour.numeroGiorni} giorn${tour.numeroGiorni === 1 ? "o" : "i"}
                  <br />
                  Aggiornato: {formattaData(tour.aggiornatoIl)}
                </div>

                <div className="percorso-actions">
                  <button
                    className="percorso-action primary"
                    type="button"
                    onClick={() => onApriTour?.(tour)}
                  >
                    Apri
                  </button>
                  <button
                    className="percorso-action"
                    type="button"
                    onClick={() => gestisciDuplicazione(tour)}
                  >
                    Duplica
                  </button>
                  <button
                    className="percorso-action danger"
                    type="button"
                    onClick={() => gestisciEliminazione(tour)}
                  >
                    Elimina
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
