import { useEffect, useRef, useState } from "react";

const apiKey =
  import.meta.env.VITE_ORS_API_KEY;

const ORS_BASE_URL =
  "https://api.openrouteservice.org";

export default function AutocompleteLocalita({
  value,
  onChange,
  placeholder = "",
}) {
  const [risultati, setRisultati] =
    useState([]);

  const [aperto, setAperto] =
    useState(false);

  const timeoutRef = useRef(null);

  useEffect(() => {
    const testo = value?.trim();

    if (!testo || testo.length < 3) {
      setRisultati([]);
      return;
    }

    clearTimeout(timeoutRef.current);

    timeoutRef.current =
      setTimeout(async () => {
        try {
          const risposta =
            await fetch(
              `${ORS_BASE_URL}/geocode/autocomplete?api_key=${apiKey}&text=${encodeURIComponent(
                testo
              )}&size=8`
            );

          if (!risposta.ok) {
            return;
          }

          const dati =
            await risposta.json();

          const risultatiPuliti =
            (dati.features || []).map(
              (feature) => ({
                label:
                  feature.properties?.label,
                coordinate:
                  feature.geometry
                    ?.coordinates,
              })
            );

          setRisultati(
            risultatiPuliti
          );

          setAperto(true);
        } catch (errore) {
          console.error(errore);
        }
      }, 300);

    return () =>
      clearTimeout(
        timeoutRef.current
      );
  }, [value]);

  return (
    <div
      style={{
        position: "relative",
      }}
    >
      <input
        className="pianifica-field"
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
        onFocus={() =>
          risultati.length > 0 &&
          setAperto(true)
        }
      />

      {aperto &&
        risultati.length > 0 && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "100%",
              zIndex: 9999,
              marginTop: 4,
              border:
                "1px solid #334155",
              borderRadius: 12,
              overflow: "hidden",
              background:
                "#172033",
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
                  onClick={() => {
                    onChange(
                      risultato.label
                    );

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