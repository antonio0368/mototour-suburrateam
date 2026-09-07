import { useEffect, useRef, useState } from "react";

const apiKey =
  import.meta.env.VITE_ORS_API_KEY;

const ORS_BASE_URL =
  "https://api.openrouteservice.org";

export default function AutocompleteLocalita({
  value,
  onChange,
  placeholder = "",
  disabled = false,
}) {
  const [risultati, setRisultati] =
    useState([]);

  const [aperto, setAperto] =
    useState(false);
  
  const [selezioneManuale, setSelezioneManuale] =
  useState(false);

  const timeoutRef = useRef(null);

  useEffect(() => {
    if (selezioneManuale) {
      setSelezioneManuale(false);
      return;
    }
    
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
              `${ORS_BASE_URL}/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(
                testo
              )}&layers=street,address,venue&size=15`
            );

          if (!risposta.ok) {
            return;
          }

          const dati =
            await risposta.json();

          const risultatiPuliti =
            (dati.features || []).map(
                (feature) => {
                const nome =
                    feature.properties?.name ||
                    "";

                const via =
                    feature.properties?.street ||
                    "";

                const numero =
                    feature.properties?.housenumber ||
                    "";

                const citta =
                    feature.properties?.locality ||
                    feature.properties?.county ||
                    "";

                let label = "";

                if (via) {
                    label = via;

                    if (numero) {
                    label += ` ${numero}`;
                    }

                    if (citta) {
                    label += `, ${citta}`;
                    }
                } else {
                    label =
                    nome ||
                    feature.properties?.label ||
                    "";
                }

                return {
                    label,
                    coordinate:
                    feature.geometry
                        ?.coordinates,
                };
                }
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
        width: "100%",
      }}
    >
      <input
        className="pianifica-field"
        value={value}
        disabled={disabled}
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
              width: "100%",
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
                    setSelezioneManuale(true);

                    setAperto(false);

                    setRisultati([]);

                    onChange(
                      risultato.label
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