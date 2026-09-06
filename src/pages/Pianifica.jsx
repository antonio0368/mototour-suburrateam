import { useState } from "react";
import MappaPercorso from "../components/MappaPercorso";

const MAX_PASSAGGI = 10;

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

const letteraPercorso = (indice) =>
  String.fromCharCode(65 + indice);

export default function Pianifica() {
  const [nome, setNome] = useState("");
  const [partenza, setPartenza] = useState("");
  const [arrivo, setArrivo] = useState("");
  const [passaggi, setPassaggi] = useState([]);
  const [tipoPercorso, setTipoPercorso] =
    useState("Curve");
  const [stato, setStato] = useState("Bozza");
  const [giroCircolare, setGiroCircolare] =
    useState(false);
  const [numeroGiorni, setNumeroGiorni] =
    useState(1);
  const [giornate, setGiornate] = useState([
    creaGiornata(1),
  ]);
  const [giornoAperto, setGiornoAperto] =
    useState(1);
  const [messaggio, setMessaggio] = useState("");

  const aggiungiPassaggio = () => {
    if (passaggi.length >= MAX_PASSAGGI) {
      return;
    }

    setPassaggi((passaggiAttuali) => [
      ...passaggiAttuali,
      "",
    ]);
  };

  const aggiornaPassaggio = (indice, valore) => {
    setPassaggi((passaggiAttuali) =>
      passaggiAttuali.map(
        (passaggio, indiceCorrente) =>
          indiceCorrente === indice
            ? valore
            : passaggio
      )
    );
  };

  const eliminaPassaggio = (indice) => {
    setPassaggi((passaggiAttuali) =>
      passaggiAttuali.filter(
        (_, indiceCorrente) =>
          indiceCorrente !== indice
      )
    );
  };

  const spostaPassaggio = (
    indicePartenza,
    indiceDestinazione
  ) => {
    if (
      indiceDestinazione < 0 ||
      indiceDestinazione >= passaggi.length
    ) {
      return;
    }

    setPassaggi((passaggiAttuali) => {
      const passaggiRiordinati = [
        ...passaggiAttuali,
      ];

      const [passaggioSpostato] =
        passaggiRiordinati.splice(
          indicePartenza,
          1
        );

      passaggiRiordinati.splice(
        indiceDestinazione,
        0,
        passaggioSpostato
      );

      return passaggiRiordinati;
    });
  };

  const modificaNumeroGiorni = (valore) => {
    const nuovoNumero = Number(valore);

    setNumeroGiorni(nuovoNumero);

    setGiornate((giornateAttuali) =>
      Array.from(
        { length: nuovoNumero },
        (_, indice) =>
          giornateAttuali[indice] ||
          creaGiornata(indice + 1)
      )
    );

    if (
      giornoAperto !== null &&
      giornoAperto > nuovoNumero
    ) {
      setGiornoAperto(nuovoNumero);
    }
  };

  const aggiornaGiornata = (
    indice,
    campo,
    valore
  ) => {
    setGiornate((giornateAttuali) =>
      giornateAttuali.map(
        (giornata, indiceCorrente) =>
          indiceCorrente === indice
            ? {
                ...giornata,
                valore,
              }
            : giornata
      )
    );
  };

  const totaliTour = giornate.reduce(
    (totali, giornata) => ({
      km:
        totali.km +
        (Number(giornata.km) || 0),

      ore:
        totali.ore +
        (Number(giornata.ore) || 0),

      dislivello:
        totali.dislivello +
        (Number(giornata.dislivello) || 0),
    }),
    {
      km: 0,
      ore: 0,
      dislivello: 0,
    }
  );

  const formattaOre = (oreDecimali) => {
    const minutiTotali = Math.round(
      oreDecimali * 60
    );

    const oreIntere = Math.floor(
      minutiTotali / 60
    );

    const minuti = minutiTotali % 60;

    if (oreIntere === 0 && minuti === 0) {
      return "0 h";
    }

    if (minuti === 0) {
      return `${oreIntere} h`;
    }

    if (oreIntere === 0) {
      return `${minuti} min`;
    }

    return `${oreIntere} h ${minuti} min`;
  };

  const campoObbligatorioMancante =
    !nome.trim() ||
    !partenza.trim() ||
    (!giroCircolare && !arrivo.trim());

  const percorsoRiepilogato = [
    {
      tipo: "Partenza",
      localita: partenza.trim(),
    },

    ...passaggi
      .map((passaggio, indice) => ({
        tipo: `Passaggio ${indice + 1}`,
        localita: passaggio.trim(),
      }))
      .filter((elemento) => elemento.localita),

    {
      tipo: "Arrivo",
      localita: giroCircolare
        ? partenza.trim()
        : arrivo.trim(),
    },
  ].filter((elemento) => elemento.localita);

  const salvaTour = (evento) => {
    evento.preventDefault();

    const tour = {
      nome: nome.trim(),

      partenza: partenza.trim(),

      passaggi: passaggi
        .map((passaggio) =>
          passaggio.trim()
        )
        .filter(Boolean),

      arrivo: giroCircolare
        ? partenza.trim()
        : arrivo.trim(),

      tipoPercorso,
      stato,
      giroCircolare,
      numeroGiorni,
      giornate,

      totali: {
        km: totaliTour.km,
        ore: totaliTour.ore,
        dislivello: totaliTour.dislivello,
      },
    };

    console.log("Tour da salvare:", tour);

    setMessaggio(
      `Tour "${
        nome || "senza nome"
      }" preparato correttamente.`
    );
  };

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
          grid-template-columns:
            minmax(300px, 1fr)
            minmax(0, 2fr);
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
          box-shadow:
            0 14px 35px
            rgba(0, 0, 0, 0.18);
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
        }

        .pianifica-field {
          display: block;
          width: 100%;
          box-sizing: border-box;
          margin: 0;
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
          box-shadow:
            0 0 0 3px
            rgba(249, 115, 22, 0.16);
        }

        .pianifica-field:disabled {
          cursor: not-allowed;
          opacity: 0.62;
        }

        .pianifica-standard-field {
          margin-bottom: 14px;
        }

        textarea.pianifica-field {
          min-height: 82px;
          resize: vertical;
        }

        .pianifica-route-fields {
          margin-bottom: 18px;
          padding: 14px;
          border: 1px solid #29374b;
          border-radius: 14px;
          background: #111a2b;
        }

        .pianifica-route-row {
          display: grid;
          grid-template-columns:
            32px minmax(0, 1fr) auto;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }

        .pianifica-route-row:last-child {
          margin-bottom: 0;
        }

        .pianifica-route-letter {
          display: flex;
          width: 30px;
          height: 30px;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          border: 2px solid #f97316;
          border-radius: 50%;
          background:
            rgba(249, 115, 22, 0.12);
          color: #fb923c;
          font-size: 12px;
          font-weight: 900;
        }

        .pianifica-route-letter.arrivo {
          border-color: #38bdf8;
          background:
            rgba(56, 189, 248, 0.1);
          color: #7dd3fc;
        }

        .pianifica-route-controls {
          display: flex;
          gap: 5px;
        }

        .pianifica-route-control {
          display: flex;
          width: 30px;
          height: 30px;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: 1px solid #334155;
          border-radius: 8px;
          background: #172033;
          color: #94a3b8;
          cursor: pointer;
          font-size: 12px;
        }

        .pianifica-route-control:hover:not(
          :disabled
        ) {
          border-color: #f97316;
          color: #fb923c;
        }

        .pianifica-route-control.delete:hover {
          border-color: #ef4444;
          color: #fca5a5;
        }

        .pianifica-route-control:disabled {
          cursor: not-allowed;
          opacity: 0.28;
        }

        .pianifica-add-passaggio {
          width: 100%;
          box-sizing: border-box;
          margin: 3px 0 12px;
          padding: 11px 14px;
          border: 1px dashed #475569;
          border-radius: 11px;
          background:
            rgba(23, 32, 51, 0.7);
          color: #fb923c;
          cursor: pointer;
          font-family: inherit;
          font-size: 13px;
          font-weight: 800;
        }

        .pianifica-add-passaggio:hover:not(
          :disabled
        ) {
          border-color: #f97316;
          background:
            rgba(249, 115, 22, 0.08);
        }

        .pianifica-add-passaggio:disabled {
          cursor: not-allowed;
          opacity: 0.45;
        }

        .pianifica-route-help {
          margin: 0 0 14px;
          color: #64748b;
          font-size: 11px;
          line-height: 1.5;
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
          padding: 14px 18px;
          border: 0;
          border-radius: 11px;
          background: #f97316;
          color: white;
          cursor: pointer;
          font-family: inherit;
          font-size: 15px;
          font-weight: 800;
        }

        .pianifica-save:hover:not(:disabled) {
          background: #ea580c;
        }

        .pianifica-save:disabled {
          cursor: not-allowed;
          opacity: 0.45;
        }

        .pianifica-message {
          margin: 12px 0 0;
          padding: 10px 12px;
          border:
            1px solid
            rgba(34, 197, 94, 0.3);
          border-radius: 10px;
          background:
            rgba(34, 197, 94, 0.1);
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
            linear-gradient(
              135deg,
              #172033,
              #0b1220
            );
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
          padding: 13px 15px;
          border: 1px solid #334155;
          border-radius: 12px;
          background:
            rgba(2, 6, 23, 0.9);
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
          grid-template-columns:
            repeat(3, 1fr);
          gap: 8px;
        }

        .pianifica-summary-item {
          min-width: 0;
          padding: 11px;
          border: 1px solid #1e293b;
          border-radius: 11px;
          background:
            rgba(2, 6, 23, 0.9);
          text-align: center;
        }

        .pianifica-summary-item span {
          display: block;
          color: #64748b;
          font-size: 11px;
        }

        .pianifica-summary-item strong {
          display: block;
          margin-top: 4px;
          color: #f8fafc;
          font-size: 15px;
        }

        .pianifica-map-route {
          position: absolute;
          top: 18px;
          right: 18px;
          width:
            min(
              240px,
              calc(100% - 36px)
            );
          max-height: 260px;
          overflow-y: auto;
          padding: 12px;
          border: 1px solid #334155;
          border-radius: 12px;
          background:
            rgba(2, 6, 23, 0.88);
        }

        .pianifica-map-route-title {
          margin: 0 0 9px;
          color: #cbd5e1;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .pianifica-map-route-row {
          display: grid;
          grid-template-columns:
            22px 1fr;
          align-items: start;
          gap: 8px;
          padding: 6px 0;
          color: #e2e8f0;
          font-size: 12px;
        }

        .pianifica-map-route-letter {
          display: flex;
          width: 20px;
          height: 20px;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #1e293b;
          color: #fb923c;
          font-size: 10px;
          font-weight: 900;
        }

        .pianifica-map-route-type {
          display: block;
          color: #64748b;
          font-size: 10px;
        }

        .pianifica-days-heading {
          margin: 24px 0 12px;
          color: #f8fafc;
          font-size: 20px;
        }

        .pianifica-day-help {
          margin: 0;
          color: #64748b;
          font-size: 12px;
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
          padding: 15px 16px;
          box-sizing: border-box;
          border: 0;
          background: transparent;
          color: white;
          cursor: pointer;
          font-family: inherit;
        }

        .pianifica-day-button strong {
          color: #fb923c;
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
          grid-template-columns:
            repeat(2, 1fr);
          gap: 14px 12px;
          padding-top: 15px;
        }

        .pianifica-day-note {
          min-height: 82px;
          margin-top: 14px;
        }

        @media (max-width: 850px) {
          .pianifica-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .pianifica-map-route {
            display: none;
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

          .pianifica-route-row {
            grid-template-columns:
              30px minmax(0, 1fr);
          }

          .pianifica-route-controls {
            grid-column: 2;
          }

          .pianifica-map {
            min-height: 570px;
          }
        }
      `}</style>

      <header>
        <h2 className="pianifica-title">
          Pianificazione Tour
        </h2>

        <p className="pianifica-subtitle">
          Definisci partenza, passaggi intermedi e
          arrivo. Riordina i passaggi in qualsiasi
          momento.
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
            className="pianifica-field pianifica-standard-field"
            value={nome}
            onChange={(evento) =>
              setNome(evento.target.value)
            }
            placeholder="Es. Tour delle Dolomiti"
          />

          <label className="pianifica-label">
            Percorso
          </label>

          <div className="pianifica-route-fields">
            <div className="pianifica-route-row">
              <span className="pianifica-route-letter">
                A
              </span>

              <input
                className="pianifica-field"
                value={partenza}
                onChange={(evento) =>
                  setPartenza(evento.target.value)
                }
                placeholder="Partenza"
                aria-label="Partenza"
              />

              <div />
            </div>

            {passaggi.map(
              (passaggio, indice) => {
                const lettera =
                  letteraPercorso(indice + 1);

                return (
                  <div
                    className="pianifica-route-row"
                    key={indice}
                  >
                    <span className="pianifica-route-letter">
                      {lettera}
                    </span>

                    <input
                      className="pianifica-field"
                      value={passaggio}
                      onChange={(evento) =>
                        aggiornaPassaggio(
                          indice,
                          evento.target.value
                        )
                      }
                      placeholder={`Passaggio ${
                        indice + 1
                      }`}
                      aria-label={`Passaggio ${
                        indice + 1
                      }`}
                    />

                    <div className="pianifica-route-controls">
                      <button
                        className="pianifica-route-control"
                        type="button"
                        disabled={indice === 0}
                        onClick={() =>
                          spostaPassaggio(
                            indice,
                            indice - 1
                          )
                        }
                        title="Sposta in alto"
                        aria-label={`Sposta passaggio ${
                          indice + 1
                        } in alto`}
                      >
                        ▲
                      </button>

                      <button
                        className="pianifica-route-control"
                        type="button"
                        disabled={
                          indice ===
                          passaggi.length - 1
                        }
                        onClick={() =>
                          spostaPassaggio(
                            indice,
                            indice + 1
                          )
                        }
                        title="Sposta in basso"
                        aria-label={`Sposta passaggio ${
                          indice + 1
                        } in basso`}
                      >
                        ▼
                      </button>

                      <button
                        className="pianifica-route-control delete"
                        type="button"
                        onClick={() =>
                          eliminaPassaggio(indice)
                        }
                        title="Elimina passaggio"
                        aria-label={`Elimina passaggio ${
                          indice + 1
                        }`}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              }
            )}

            <button
              className="pianifica-add-passaggio"
              type="button"
              onClick={aggiungiPassaggio}
              disabled={
                passaggi.length >= MAX_PASSAGGI
              }
            >
              + Aggiungi passaggio
            </button>

            <div className="pianifica-route-row">
              <span className="pianifica-route-letter arrivo">
                {letteraPercorso(
                  passaggi.length + 1
                )}
              </span>

              <input
                className="pianifica-field"
                value={
                  giroCircolare
                    ? partenza
                    : arrivo
                }
                onChange={(evento) =>
                  setArrivo(evento.target.value)
                }
                disabled={giroCircolare}
                placeholder={
                  giroCircolare
                    ? "Uguale alla partenza"
                    : "Arrivo"
                }
                aria-label="Arrivo"
              />

              <div />
            </div>
          </div>

          <p className="pianifica-route-help">
            Usa ▲ e ▼ per modificare l’ordine dei
            passaggi. Dopo un’eliminazione, lettere e
            numerazione vengono aggiornate
            automaticamente.
          </p>

          <div className="pianifica-grid-small">
            <div>
              <label className="pianifica-label">
                Tipo percorso
              </label>

              <select
                className="pianifica-field pianifica-standard-field"
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
                <option value="Curve">
                  Curve
                </option>
                <option value="Extra curve">
                  Extra curve
                </option>
              </select>
            </div>

            <div>
              <label className="pianifica-label">
                Numero giorni
              </label>

              <select
                className="pianifica-field pianifica-standard-field"
                value={numeroGiorni}
                onChange={(evento) =>
                  modificaNumeroGiorni(
                    evento.target.value
                  )
                }
              >
                {[1, 2, 3, 4, 5].map(
                  (numero) => (
                    <option
                      key={numero}
                      value={numero}
                    >
                      {numero}{" "}
                      {numero === 1
                        ? "giorno"
                        : "giorni"}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <label className="pianifica-label">
            Stato
          </label>

          <select
            className="pianifica-field pianifica-standard-field"
            value={stato}
            onChange={(evento) =>
              setStato(evento.target.value)
            }
          >
            <option value="Bozza">
              Bozza
            </option>
            <option value="Valido">
              Valido
            </option>
          </select>

          <div className="pianifica-switch-row">
            <span className="pianifica-switch-label">
              Giro circolare
            </span>

            <label className="pianifica-switch">
              <input
                type="checkbox"
                checked={giroCircolare}
                onChange={(evento) => {
                  const attivo =
                    evento.target.checked;

                  setGiroCircolare(attivo);

                  if (attivo) {
                    setArrivo("");
                  }
                }}
              />

              <span className="pianifica-switch-slider" />
            </label>
          </div>

          <button
            className="pianifica-save"
            type="submit"
            disabled={campoObbligatorioMancante}
          >
            Salva tour
          </button>

          {messaggio && (
            <p className="pianifica-message">
              {messaggio}
            </p>
          )}
        </section>

        <section className="pianifica-card">
          <div className="pianifica-map">
  <MappaPercorso />

  <div className="pianifica-map-info">
    <small>
      Anteprima del percorso
    </small>

    <strong>{tipoPercorso}</strong>
  </div>

  <div className="pianifica-map-summary">
    <div className="pianifica-summary-item">
      <span>Chilometri</span>

      <strong>
        {totaliTour.km.toLocaleString("it-IT")} km
      </strong>
    </div>

    <div className="pianifica-summary-item">
      <span>Ore</span>

      <strong>
        {formattaOre(totaliTour.ore)}
      </strong>
    </div>

    <div className="pianifica-summary-item">
      <span>Dislivello</span>

      <strong>
        {totaliTour.dislivello.toLocaleString(
          "it-IT"
        )}{" "}
        m D+
      </strong>
    </div>
  </div>
</div>
            
            <div className="pianifica-map-summary">
              <div className="pianifica-summary-item">
                <span>Chilometri</span>
                <strong>
                  {totaliTour.km.toLocaleString(
                    "it-IT"
                  )}{" "}
                  km
                </strong>
              </div>

              <div className="pianifica-summary-item">
                <span>Ore</span>
                <strong>
                  {formattaOre(totaliTour.ore)}
                </strong>
              </div>

              <div className="pianifica-summary-item">
                <span>Dislivello</span>
                <strong>
                  {totaliTour.dislivello.toLocaleString(
                    "it-IT"
                  )}{" "}
                  m D+
                </strong>
              </div>
            </div>
          </div>

          <h3 className="pianifica-days-heading">
            Suddivisione del viaggio
          </h3>

          <p className="pianifica-day-help">
            Hotel, ristoranti e regioni attraversate
            saranno registrati nel Diario durante o
            dopo il tour.
          </p>

          <div style={{ marginTop: "14px" }}>
            {giornate.map(
              (giornata, indice) => {
                const aperta =
                  giornoAperto ===
                  giornata.numero;

                return (
                  <article
                    className="pianifica-day-card"
                    key={giornata.numero}
                  >
                    <button
                      className="pianifica-day-button"
                      type="button"
                      onClick={() =>
                        setGiornoAperto(
                          aperta
                            ? null
                            : giornata.numero
                        )
                      }
                    >
                      <strong>
                        Giorno {giornata.numero}
                      </strong>

                      <span>
                        {aperta
                          ? "Chiudi dettagli"
                          : "Apri dettagli"}
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
                              value={
                                giornata.titolo
                              }
                              onChange={(evento) =>
                                aggiornaGiornata(
                                  indice,
                                  "titolo",
                                  evento.target
                                    .value
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
                              value={
                                giornata.partenza
                              }
                              onChange={(evento) =>
                                aggiornaGiornata(
                                  indice,
                                  "partenza",
                                  evento.target
                                    .value
                                )
                              }
                              placeholder="Partenza tappa"
                            />
                          </div>

                          <div>
                            <label className="pianifica-label">
                              Arrivo giornata
                            </label>

                            <input
                              className="pianifica-field"
                              value={
                                giornata.arrivo
                              }
                              onChange={(evento) =>
                                aggiornaGiornata(
                                  indice,
                                  "arrivo",
                                  evento.target
                                    .value
                                )
                              }
                              placeholder="Arrivo tappa"
                            />
                          </div>

                          <div>
                            <label className="pianifica-label">
                              Chilometri previsti
                            </label>

                            <input
                              className="pianifica-field"
                              type="number"
                              min="0"
                              value={giornata.km}
                              onChange={(evento) =>
                                aggiornaGiornata(
                                  indice,
                                  "km",
                                  evento.target
                                    .value
                                )
                              }
                              placeholder="Km"
                            />
                          </div>

                          <div>
                            <label className="pianifica-label">
                              Ore previste
                            </label>

                            <input
                              className="pianifica-field"
                              type="number"
                              min="0"
                              step="0.1"
                              value={giornata.ore}
                              onChange={(evento) =>
                                aggiornaGiornata(
                                  indice,
                                  "ore",
                                  evento.target
                                    .value
                                )
                              }
                              placeholder="Ore"
                            />
                          </div>

                          <div>
                            <label className="pianifica-label">
                              Dislivello positivo
                            </label>

                            <input
                              className="pianifica-field"
                              type="number"
                              min="0"
                              value={
                                giornata.dislivello
                              }
                              onChange={(evento) =>
                                aggiornaGiornata(
                                  indice,
                                  "dislivello",
                                  evento.target
                                    .value
                                )
                              }
                              placeholder="Metri D+"
                            />
                          </div>
                        </div>

                        <label className="pianifica-label">
                          Note di pianificazione
                        </label>

                        <textarea
                          className="pianifica-field pianifica-day-note"
                          value={giornata.note}
                          onChange={(evento) =>
                            aggiornaGiornata(
                              indice,
                              "note",
                              evento.target
                                .value
                            )
                          }
                          placeholder="Indicazioni, strade da verificare, orari o altre note"
                        />
                      </div>
                    )}
                  </article>
                );
              }
            )}
          </div>
        </section>
      </form>
    </main>
  );
}