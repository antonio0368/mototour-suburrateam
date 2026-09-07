import { useEffect, useRef, useState } from "react";

const PHOTON_URL =
  "https://photon.komoot.io/api";

export default function AutocompleteLocalita({
  value,
  onChange,
  onSelect,
  placeholder = "",
  disabled = false,
}) {
  const [risultati, setRisultati] =
    useState([]);

  const [aperto, setAperto] =
    useState(false);
  
  const [selezioneManuale, setSelezioneManuale] =
  useState(false);

  const timeoutRef =
    useRef(null);

  useEffect(() => {
    if (selezioneManuale) {
      setSelezioneManuale(false);
      return;
    }
    
    const testo =
      String(value || "").trim();

    if (
      disabled ||
      testo.length < 3
    ) {
      setRisultati([]);
      setAperto(false);
      return;
    }

    clearTimeout(
      timeoutRef.current
    );

    timeoutRef.current =
      setTimeout(async () => {
        try {
          console.log("TESTO", testo);

          console.log(
            "URL",
            `${PHOTON_URL}?q=${encodeURIComponent(
              testo
            )}&limit=10&lang=it`
          );
          const risposta =
            await fetch(
              `${PHOTON_URL}?q=${encodeURIComponent(
                testo
              )}&limit=10`
            );

          if (!risposta.ok) {
            return;
          }

          const dati =
            await risposta.json();

          console.log(
            "RISPOSTA PHOTON",
            dati
          );

          const risultatiPuliti =
            (dati.features || [])
              .filter(
                (feature) =>
                  feature.geometry &&
                  Array.isArray(
                    feature.geometry
                      .coordinates
                  )
              )
              .map((feature) => {
                const props =
                  feature.properties ||
                  {};

                const lon =
                  Number(
                    feature.geometry
                      .coordinates[0]
                  );

                const lat =
                  Number(
                    feature.geometry
                      .coordinates[1]
                  );

                const nome =
                  props.name ||
                  props.street ||
                  "";

                const citta =
                  props.city ||
                  props.county ||
                  props.state ||
                  "";

                const label =
                  citta
                    ? `${nome}, ${citta}`
                    : nome;

                return {
                  label,

                  coordinateORS: [
                    lon,
                    lat,
                  ],

                  coordinateLeaflet: [
                    lat,
                    lon,
                  ],
                };
              })
              .filter(
                (r) =>
                  r.label &&
                  r.coordinateORS
              );

          setRisultati(
            risultatiPuliti
          );

          setAperto(
            risultatiPuliti.length >
              0
          );
        } catch (errore) {
          console.error(
            "Autocomplete",
            errore
          );
        }
      }, 350);

    return () =>
      clearTimeout(
        timeoutRef.current
      );
  }, [value, disabled]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
      }}
    >
      <input
        className="pianifica-field"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        onFocus={() => {
          if (
            risultati.length > 0
          ) {
            setAperto(true);
          }
        }}
      />

      {aperto &&
        risultati.length > 0 && (
          <div
            style={{
              position:
                "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 9999,
              background:
                "#172033",
              border:
                "1px solid #334155",
              borderRadius:
                "10px",
              overflow:
                "hidden",
              maxHeight:
                "280px",
              overflowY:
                "auto",
            }}
          >
            {risultati.map(
              (
                risultato,
                indice
              ) => (
                <button
                  key={indice}
                  type="button"
                  style={{
                    width: "100%",
                    textAlign:
                      "left",
                    padding:
                      "12px",
                    border: 0,
                    borderBottom:
                      "1px solid #243146",
                    background:
                      "transparent",
                    color:
                      "#f8fafc",
                    cursor: "pointer",
                  }}

                  onMouseDown={() => {
                    onChange(
                      risultato.label
                    );

                    if (
                      onSelect
                    ) {
                      onSelect(
                        risultato
                      );
                    }

                    setAperto(
                      false
                    );

                    setRisultati(
                      []
                    );
                  }}
                >
                  {
                    risultato.label
                  }
                </button>
              )
            )}
          </div>
        )}
    </div>
  );
}