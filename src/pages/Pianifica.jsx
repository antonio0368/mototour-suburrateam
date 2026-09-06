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

const letteraPercorso = (indice) =>
  String.fromCharCode(65 + indice);

const creaRiepilogoVuoto = () => null;

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

  const [consentiAutostrade, setConsentiAutostrade] =
    useState(false);

  const [numeroGiorni, setNumeroGiorni] =
    useState(1);

  const [giornate, setGiornate] = useState([
    creaGiornata(1),
  ]);

  const [giornoAperto, setGiornoAperto] =
    useState(1);

  const [messaggio, setMessaggio] = useState("");

  /*
   * Coordinate prodotte dalla futura geocodifica.
   * Leaflet utilizza coordinate nel formato:
   * [latitudine, longitudine]
   */

  const [
    coordinatePartenza,
    setCoordinatePartenza,
  ] = useState(null);

  const [
    coordinateArrivo,
    setCoordinateArrivo,
  ] = useState(null);

  const [
    coordinatePassaggi,
    setCoordinatePassaggi,
  ] = useState([]);

  const [
    coordinateTraccia,
    setCoordinateTraccia,
  ] = useState([]);

  /*
   * Dati calcolati automaticamente dal routing.
   * Non devono essere compilati manualmente.
   */

  const [
    riepilogoTour,
    setRiepilogoTour,
  ] = useState(creaRiepilogoVuoto());

  const invalidaCalcoloPercorso = () => {
    setCoordinateTraccia([]);
    setRiepilogoTour(null);

    setGiornate((giornateAttuali) =>
      giornateAttuali.map((giornata) => ({
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

    if (giroCircolare) {
      setCoordinateArrivo(null);
    }

    invalidaCalcoloPercorso();
  };

  const aggiornaArrivo = (valore) => {
    setArrivo(valore);
    setCoordinateArrivo(null);
    invalidaCalcoloPercorso();
  };

  const aggiungiPassaggio = () => {
    if (passaggi.length >= MAX_PASSAGGI) {
      return;
    }

    setPassaggi((passaggiAttuali) => [
      ...passaggiAttuali,
      "",
    ]);

    setCoordinatePassaggi(
      (coordinateAttuali) => [
        ...coordinateAttuali,
        null,
      ]
    );

    invalidaCalcoloPercorso();
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

    setCoordinatePassaggi(
      (coordinateAttuali) =>
        coordinateAttuali.map(
          (coordinate, indiceCorrente) =>
            indiceCorrente === indice
              ? null
              : coordinate
        )
    );

    invalidaCalcoloPercorso();
  };

  const eliminaPassaggio = (indice) => {
    setPassaggi((passaggiAttuali) =>
      passaggiAttuali.filter(
        (_, indiceCorrente) =>
          indiceCorrente !== indice
      )
    );

    setCoordinatePassaggi(
      (coordinateAttuali) =>
        coordinateAttuali.filter(
          (_, indiceCorrente) =>
            indiceCorrente !== indice
        )
    );

    invalidaCalcoloPercorso();
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

    setCoordinatePassaggi(
      (coordinateAttuali) => {
        const coordinateRiordinate = [
          ...coordinateAttuali,
        ];

        const [coordinateSpostate] =
          coordinateRiordinate.splice(
            indicePartenza,
            1
          );

        coordinateRiordinate.splice(
          indiceDestinazione,
          0,
          coordinateSpostate
        );

        return coordinateRiordinate;
      }
    );

    invalidaCalcoloPercorso();
  };

  const modificaNumeroGiorni = (valore) => {
    const nuovoNumero = Math.max(
      1,
      Number(valore) || 1
    );

    setNumeroGiorni(nuovoNumero);

    setGiornate((giornateAttuali) =>
      Array.from(
        { length: nuovoNumero },
        (_, indice) =>
          giornateAttuali[indice] || {
            ...creaGiornata(indice + 1),
          }
      ).map((giornata, indice) => ({
        ...giornata,
        numero: indice + 1,
      }))
    );

    if (
      giornoAperto !== null &&
      giornoAperto > nuovoNumero
    ) {
      setGiornoAperto(nuovoNumero);
    }

    setRiepilogoTour(null);
    setCoordinateTraccia([]);
    setMessaggio("");
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

    if (
      campo !== "note" &&
      campo !== "titolo"
    ) {
      setRiepilogoTour(null);
    }

    setMessaggio("");
  };

  const totaliTour = useMemo(() => {
    const riepiloghiValidi = giornate
      .map((giornata) => giornata.riepilogo)
      .filter(Boolean);

    if (riepiloghiValidi.length === 0) {
      return null;
    }

    const quoteMinime = riepiloghiValidi
      .map((riepilogo) =>
        Number(riepilogo.quotaMinima)
      )
      .filter(Number.isFinite);

    const quoteMassime = riepiloghiValidi
      .map((riepilogo) =>
        Number(riepilogo.quotaMassima)
      )
      .filter(Number.isFinite);

    return {
      distanzaMetri: riepiloghiValidi.reduce(
        (totale, riepilogo) =>
          totale +
          (Number(
            riepilogo.distanzaMetri
          ) || 0),
        0
      ),

      durataSecondi: riepiloghiValidi.reduce(
        (totale, riepilogo) =>
          totale +
          (Number(
            riepilogo.durataSecondi
          ) || 0),
        0
      ),

      dislivelloPositivo:
        riepiloghiValidi.reduce(
          (totale, riepilogo) =>
            totale +
            (Number(
              riepilogo.dislivelloPositivo
            ) || 0),
          0
        ),

      dislivelloNegativo:
        riepiloghiValidi.reduce(
          (totale, riepilogo) =>
            totale +
            (Number(
              riepilogo.dislivelloNegativo
            ) || 0),
          0
        ),

      quotaMinima:
        quoteMinime.length > 0
          ? Math.min(...quoteMinime)
          : null,

      quotaMassima:
        quoteMassime.length > 0
          ? Math.max(...quoteMassime)
          : null,
    };
  }, [giornate]);

  const riepilogoVisualizzato =
    riepilogoTour || totaliTour;

  const percorsoRiepilogato = useMemo(
    () =>
      [
        {
          tipo: "Partenza",
          localita: partenza.trim(),
        },

        ...passaggi
          .map((passaggio, indice) => ({
            tipo: `Passaggio ${indice + 1}`,
            localita: passaggio.trim(),
          }))
          .filter(
            (elemento) => elemento.localita
          ),

        {
          tipo: "Arrivo",
          localita: giroCircolare
            ? partenza.trim()
            : arrivo.trim(),
        },
      ].filter(
        (elemento) => elemento.localita
      ),
    [
      partenza,
      passaggi,
      arrivo,
      giroCircolare,
    ]
  );

  const coordinatePassaggiValide =
    coordinatePassaggi.filter(
      (coordinate) =>
        Array.isArray(coordinate) &&
        coordinate.length >= 2
    );

  const campoObbligatorioMancante =
    !nome.trim() ||
    !partenza.trim() ||
    (!giroCircolare && !arrivo.trim());

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
      consentiAutostrade,
      numeroGiorni,
      giornate,

      geometria:
        coordinateTraccia.length > 0
          ? coordinateTraccia
          : null,

      riepilogo:
        riepilogoVisualizzato || null,
    };

    console.log(
      "Tour da salvare:",
      tour
    );

    setMessaggio(
      `Tour "${
        nome.trim() || "senza nome"
      }" preparato correttamente.`
    );
  };

  return (
    <main className="pianifica-page">
      <style>{`
        .pianifica-page {
          width: 100%;
          box-sizing: border-box;
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
          line-height: 1.5;
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
          box-sizing: border-box;
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

        .pianifica-switches {
          display: grid;
          gap: 10px;
          margin: 2px 0 20px;
        }

        .pianifica-switch-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
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

        .pianifica-switch-help {
          display: block;
          margin-top: 3px;
          color: #64748b;
          font-size: 11px;
          font-weight: 400;
        }

        .pianifica-switch {
          position: relative;
          flex: 0 0 auto;
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

        .pianifica-map-section {
          min-width: 0;
        }

        .pianifica-map-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 14px;
        }

        .pianifica-map-heading h3 {
          margin: 0;
          color: #f8fafc;
          font-size: 19px;
        }

        .pianifica-map-profile {
          padding: 7px 11px;
          border:
            1px solid
            rgba(249, 115, 22, 0.35);
          border-radius: 999px;
          background:
            rgba(249, 115, 22, 0.1);
          color: #fb923c;
          font-size: 12px;
          font-weight: 800;
        }

        .pianifica-map-container {
          position: relative;
          min-width: 0;
        }

        .pianifica-map-route {
          margin-top: 14px;
          padding: 14px;
          border: 1px solid #29374b;
          border-radius: 14px;
          background: #111a2b;
        }

        .pianifica-map-route-title {
          margin: 0 0 9px;
          color: #cbd5e1;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .pianifica-map-route-empty {
          margin: 0;
          color: #64748b;
          font-size: 12px;
        }

        .pianifica-map-route-row {
          display: grid;
          grid-template-columns:
            22px minmax(0, 1fr);
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
          margin: 28px 0 12px;
          color: #f97316;
          font-size: 20px;
        }

        .pianifica-day-help {
          margin: 0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.5;
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
          padding: 16px;
          border-top: 1px solid #273449;
        }

        .pianifica-day-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 14px 12px;
        }

        .pianifica-day-note {
          min-height: 82px;
          margin-top: 14px;
        }

        .pianifica-auto-data {
          margin-top: 16px;
          padding: 13px;
          border:
            1px solid
            rgba(56, 189, 248, 0.22);
          border-radius: 12px;
          background:
            rgba(56, 189, 248, 0.06);
          color: #bae6fd;
          font-size: 12px;
          line-height: 1.5;
        }

        @media (max-width: 850px) {
          .pianifica-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 560px) {
          .pianifica-grid-small,
          .pianifica-day-grid {
            grid-template-columns: 1fr;
          }

          .pianifica-route-row {
            grid-template-columns:
              30px minmax(0, 1fr);
          }

          .pianifica-route-controls {
            grid-column: 2;
          }

          .pianifica-map-heading {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <header>
        <h2 className="pianifica-title">
          Pianificazione Tour
        </h2>

        <p className="pianifica-subtitle">
          Definisci partenza, passaggi intermedi e
          arrivo. La mappa mostrerà il percorso e i
          dati calcolati automaticamente.
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
            onChange={(evento) => {
              setNome(evento.target.value);
              setMessaggio("");
            }}
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
                  aggiornaPartenza(
                    evento.target.value
                  )
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
                    key={`passaggio-${indice}`}
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
                  aggiornaArrivo(
                    evento.target.value
                  )
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
            passaggi. Ogni modifica invalida il
            precedente calcolo del percorso.
          </p>

          <div className="pianifica-grid-small">
            <div>
              <label className="pianifica-label">
                Tipo percorso
              </label>

              <select
                className="pianifica-field pianifica-standard-field"
                value={tipoPercorso}
                onChange={(evento) => {
                  setTipoPercorso(
                    evento.target.value
                  );
                  invalidaCalcoloPercorso();
                }}
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
                    impostaGiroCircolare(
                      evento.target.checked
                    )
                  }
                />

                <span className="pianifica-switch-slider" />
              </label>
            </div>

            <div className="pianifica-switch-row">
              <span className="pianifica-switch-label">
                Consenti autostrade

                <span className="pianifica-switch-help">
                  Se disattivato, il futuro routing
                  eviterà le autostrade.
                </span>
              </span>

              <label className="pianifica-switch">
                <input
                  type="checkbox"
                  checked={consentiAutostrade}
                  onChange={(evento) => {
                    setConsentiAutostrade(
                      evento.target.checked
                    );

                    invalidaCalcoloPercorso();
                  }}
                />

                <span className="pianifica-switch-slider" />
              </label>
            </div>
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

        <section className="pianifica-card pianifica-map-section">
          <div className="pianifica-map-heading">
            <h3>Mappa percorso</h3>

            <span className="pianifica-map-profile">
              {tipoPercorso}
              {" · "}
              {consentiAutostrade
                ? "autostrade consentite"
                : "autostrade escluse"}
            </span>
          </div>

          <div className="pianifica-map-container">
            <MappaPercorso
              partenza={coordinatePartenza}
              arrivo={
                giroCircolare
                  ? coordinatePartenza
                  : coordinateArrivo
              }
              passaggi={
                coordinatePassaggiValide
              }
              coordinateTraccia={
                coordinateTraccia
              }
            />
          </div>

          <div className="pianifica-map-route">
            <p className="pianifica-map-route-title">
              Punti del percorso
            </p>

            {percorsoRiepilogato.length ===
            0 ? (
              <p className="pianifica-map-route-empty">
                Inserisci almeno partenza e arrivo.
              </p>
            ) : (
              percorsoRiepilogato.map(
                (elemento, indice) => (
                  <div
                    className="pianifica-map-route-row"
                    key={`${elemento.tipo}-${indice}`}
                  >
                    <span className="pianifica-map-route-letter">
                      {letteraPercorso(indice)}
                    </span>

                    <span>
                      <span className="pianifica-map-route-type">
                        {elemento.tipo}
                      </span>

                      {elemento.localita}
                    </span>
                  </div>
                )
              )
            )}
          </div>

          <RiepilogoPercorso
            riepilogo={
              riepilogoVisualizzato
            }
            titolo="Anteprima del percorso"
          />

          <h3 className="pianifica-days-heading">
            Suddivisione del viaggio
          </h3>

          <p className="pianifica-day-help">
            Chilometri, durata e dislivello di ogni
            giornata saranno calcolati
            automaticamente dalla relativa traccia.
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
                    key={giornata.id}
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
                        </div>

                        <div className="pianifica-auto-data">
                          Km, ore, dislivello,
                          quota minima e quota
                          massima non sono campi
                          manuali. Questi valori
                          compariranno dopo il
                          calcolo della giornata.
                        </div>

                        <RiepilogoPercorso
                          riepilogo={
                            giornata.riepilogo
                          }
                          titolo={`Dati del giorno ${giornata.numero}`}
                        />

                        <label
                          className="pianifica-label"
                          style={{
                            marginTop: "16px",
                          }}
                        >
                          Note di pianificazione
                        </label>

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