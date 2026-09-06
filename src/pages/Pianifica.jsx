import { useState } from "react";

const creaGiornata = (numero) => ({
  numero,
  titolo: `Giorno ${numero}`,
  partenza: "",
  arrivo: "",
  km: "",
  ore: "",
  dislivello: "",
  note: "",
});

export default function Pianifica() {
  const [nome, setNome] = useState("");
  const [regioni, setRegioni] = useState("");
  const [partenza, setPartenza] = useState("");
  const [arrivo, setArrivo] = useState("");
  const [waypoint, setWaypoint] = useState("");
  const [tipoPercorso, setTipoPercorso] = useState("Curve");
  const [stato, setStato] = useState("Bozza");
  const [giroCircolare, setGiroCircolare] = useState(false);
  const [numeroGiorni, setNumeroGiorni] = useState(1);
  const [giornate, setGiornate] = useState([creaGiornata(1)]);
  const [giornoAperto, setGiornoAperto] = useState(1);
  const [messaggio, setMessaggio] = useState("");

  const modificaNumeroGiorni = (valore) => {
    const nuovoNumero = Number(valore);

    setNumeroGiorni(nuovoNumero);

    setGiornate((giornateAttuali) =>
      Array.from({ length: nuovoNumero }, (_, indice) => {
        return (
          giornateAttuali[indice] ||
          creaGiornata(indice + 1)
        );
      })
    );

    if (giornoAperto > nuovoNumero) {
      setGiornoAperto(nuovoNumero);
    }
  };

  const aggiornaGiornata = (indice, campo, valore) => {
    setGiornate((giornateAttuali) =>
      giornateAttuali.map((giornata, indiceCorrente) =>
        indiceCorrente === indice
          ? {
              ...giornata,
              valore,
            }
          : giornata
      )
    );
  };

  const salvaTour = (evento) => {
    evento.preventDefault();

    const tour = {
      nome,
      regioni: regioni
        .split(",")
        .map((regione) => regione.trim())
        .filter(Boolean),
      partenza,
      arrivo: giroCircolare ? partenza : arrivo,
      waypoint: waypoint
        .split("\n")
        .map((punto) => punto.trim())
        .filter(Boolean),
      tipoPercorso,
      stato,
      giroCircolare,
      numeroGiorni,
      giornate,
    };

    console.log("Tour da salvare:", tour);

    setMessaggio(
      `Tour "${nome || "senza nome"}" preparato correttamente.`
    );
  };

  const campoObbligatorioMancante =
    !nome.trim() ||
    !partenza.trim() ||
    (!giroCircolare && !arrivo.trim());

  return (
    <main className="pianifica-page">
      <style>{`
        .pianifica-page {
          width: 100%;
        }

        .pianifica-title {
          margin: 0;
          color: #f97316;
          font-size: 28px;
          font-weight: 800;
        }

        .pianifica-subtitle {
          margin: 6px 0 0;
          color: #94a3b8;
          font-size: 14px;
        }

        .pianifica-layout {
          display: grid;
          grid-template-columns: minmax(290px, 1fr) minmax(0, 2fr);
          gap: 20px;
          align-items: start;
          margin-top: 24px;
        }

        .pianifica-card {
          min-width: 0;
          padding: 20px;
          border: 1px solid #1e293b;
          border-radius: 18px;
          background: #0f172a;
          box-shadow: 0 14px 35px rgba(0, 0, 0, 0.18);
        }

        .pianifica-card-title {
          margin: 0 0 20px;
          color: #f8fafc;
          font-size: 19px;
          text-align: center;
        }

        .pianifica-label {
          display: block;
          margin: 0 0 7px;
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .pianifica-field {
          display: block;
          width: 100%;
          box-sizing: border-box;
          margin: 0 0 14px;
          padding: 13px 14px;
          border: 1px solid #334155;
          border-radius: 11px;
          outline: none;
          background: #172033;
          color: #f8fafc;
          font-family: inherit;
          font-size: 14px;
          transition:
            border-color 150ms ease,
            box-shadow 150ms ease,
            background 150ms ease;
        }

        .pianifica-field::placeholder {
          color: #64748b;
        }

        .pianifica-field:hover {
          border-color: #475569;
          background: #1a2538;
        }

        .pianifica-field:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.16);
          background: #192438;
        }

        textarea.pianifica-field {
          min-height: 96px;
          resize: vertical;
        }

        .pianifica-grid-small {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .pianifica-switch-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin: 2px 0 20px;
          padding: 12px 14px;
          border: 1px solid #334155;
          border-radius: 11px;
          background: #172033;
        }

        .pianifica-switch-label {
          color: #e2e8f0;
          font-size: 14px;
          font-weight: 700;
        }

        .pianifica-switch {
          position: relative;
          width: 46px;
          height: 25px;
          flex: 0 0 auto;
        }

        .pianifica-switch input {
          width: 0;
          height: 0;
          opacity: 0;
        }

        .pianifica-switch-slider {
          position: absolute;
          inset: 0;
          cursor: pointer;
          border-radius: 999px;
          background: #475569;
          transition: 180ms ease;
        }

        .pianifica-switch-slider::before {
          position: absolute;
          width: 19px;
          height: 19px;
          left: 3px;
          top: 3px;
          border-radius: 50%;
          background: white;
          content: "";
          transition: 180ms ease;
        }

        .pianifica-switch input:checked
          + .pianifica-switch-slider {
          background: #f97316;
        }

        .pianifica-switch input:checked
          + .pianifica-switch-slider::before {
          transform: translateX(21px);
        }

        .pianifica-save {
          width: 100%;
          box-sizing: border-box;
          padding: 14px 18px;
          border: 0;
          border-radius: 11px;
          background: #f97316;
          color: white;
          cursor: pointer;
          font-family: inherit;
          font-size: 15px;
          font-weight: 800;
          transition:
            background 150ms ease,
            transform 150ms ease,
            opacity 150ms ease;
        }

        .pianifica-save:hover:not(:disabled) {
          background: #ea580c;
          transform: translateY(-1px);
        }

        .pianifica-save:disabled {
          cursor: not-allowed;
          opacity: 0.45;
        }

        .pianifica-message {
          margin: 12px 0 0;
          padding: 10px 12px;
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 10px;
          background: rgba(34, 197, 94, 0.1);
          color: #86efac;
          font-size: 13px;
        }

        .pianifica-map {
          position: relative;
          min-height: 440px;
          overflow: hidden;
          border: 1px solid #263449;
          border-radius: 16px;
          background:
            radial-gradient(
              circle at 22% 22%,
              #334155 0,
              transparent 34%
            ),
            linear-gradient(135deg, #172033, #0b1220);
        }

        .pianifica-map-grid {
          position: absolute;
          inset: 0;
          opacity: 0.18;
          background-image:
            linear-gradient(
              #94a3b8 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              #94a3b8 1px,
              transparent 1px
            );
          background-size: 42px 42px;
        }

        .pianifica-map svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .pianifica-map-info {
          position: absolute;
          top: 18px;
          left: 18px;
          max-width: calc(100% - 36px);
          padding: 13px 15px;
          border: 1px solid #334155;
          border-radius: 12px;
          background: rgba(2, 6, 23, 0.9);
          backdrop-filter: blur(8px);
        }

        .pianifica-map-info small {
          display: block;
          color: #94a3b8;
        }

        .pianifica-map-info strong {
          display: block;
          margin-top: 3px;
          color: #fb923c;
        }

        .pianifica-map-summary {
          position: absolute;
          right: 16px;
          bottom: 16px;
          left: 16px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .pianifica-summary-item {
          min-width: 0;
          padding: 11px;
          border: 1px solid #1e293b;
          border-radius: 11px;
          background: rgba(2, 6, 23, 0.9);
        }

        .pianifica-summary-item span {
          display: block;
          color: #64748b;
          font-size: 11px;
        }

        .pianifica-summary-item strong {
          display: block;
          overflow: hidden;
          margin-top: 3px;
          color: #f8fafc;
          font-size: 13px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .pianifica-days-heading {
          margin: 24px 0 12px;
          color: #f8fafc;
          font-size: 20px;
        }

        .pianifica-day-card {
          margin-bottom: 12px;
          overflow: hidden;
          border: 1px solid #334155;
          border-radius: 13px;
          background: #172033;
        }

        .pianifica-day-button {
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: space-between;
          box-sizing: border-box;
          padding: 15px 16px;
          border: 0;
          background: transparent;
          color: white;
          cursor: pointer;
          font-family: inherit;
          text-align: left;
        }

        .pianifica-day-button strong {
          color: #fb923c;
          font-size: 15px;
        }

        .pianifica-day-button span {
          color: #94a3b8;
          font-size: 12px;
        }

        .pianifica-day-content {
          padding: 0 16px 16px;
          border-top: 1px solid #273449;
        }

        .pianifica-day-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0 12px;
          padding-top: 15px;
        }

        .pianifica-day-note {
          min-height: 82px;
        }

        .pianifica-day-help {
          margin: 0;
          color: #64748b;
          font-size: 12px;
        }

        @media (max-width: 850px) {
          .pianifica-layout {
            grid-template-columns: 1fr;
          }

          .pianifica-map {
            min-height: 390px;
          }
        }

        @media (max-width: 560px) {
          .pianifica-grid-small,
          .pianifica-day-grid {
            grid-template-columns: 1fr;
          }

          .pianifica-map-summary {
            grid-template-columns: 1fr;
          }

          .pianifica-map {
            min-height: 510px;
          }
        }
      `}</style>

      <header>
        <h2 className="pianifica-title">
          Pianificazione Tour
        </h2>

        <p className="pianifica-subtitle">
          Definisci il percorso generale e suddividilo
          fino a un massimo di cinque giornate.
        </p>
      </header>

      <form
        className="pianifica-layout"
        onSubmit={salvaTour}
      >
        <section className="pianifica-card">
          <h3 className="pianifica-card-title">
            Nuovo tour
          </h3>

          <label className="pianifica-label">
            Nome tour
          </label>
          <input
            className="pianifica-field"
            value={nome}
            onChange={(evento) =>
              setNome(evento.target.value)
            }
            placeholder="Es. Tour delle Dolomiti"
          />

          <label className="pianifica-label">
            Regioni attraversate
          </label>
          <input
            className="pianifica-field"
            value={regioni}
            onChange={(evento) =>
              setRegioni(evento.target.value)
            }
            placeholder="Piemonte, Liguria, Francia"
          />

          <label className="pianifica-label">
            Partenza
          </label>
          <input
            className="pianifica-field"
            value={partenza}
            onChange={(evento) =>
              setPartenza(evento.target.value)
            }
            placeholder="Località di partenza"
          />

          <label className="pianifica-label">
            Arrivo
          </label>
          <input
            className="pianifica-field"
            value={giroCircolare ? partenza : arrivo}
            onChange={(evento) =>
              setArrivo(evento.target.value)
            }
            disabled={giroCircolare}
            placeholder="Località di arrivo"
          />

          <label className="pianifica-label">
            Waypoint intermedi
          </label>
          <textarea
            className="pianifica-field"
            value={waypoint}
            onChange={(evento) =>
              setWaypoint(evento.target.value)
            }
            placeholder={
              "Inserisci un punto per riga\nEs. Colle del Sestriere"
            }
          />

          <div className="pianifica-grid-small">
            <div>
              <label className="pianifica-label">
                Tipo percorso
              </label>
              <select
                className="pianifica-field"
                value={tipoPercorso}
                onChange={(evento) =>
                  setTipoPercorso(
                    evento.target.value
                  )
                }
              >
                <option value="Veloce">
                  Veloce
                </option>
                <option value="Panoramico">
                  Panoramico
                </option>
                <option value