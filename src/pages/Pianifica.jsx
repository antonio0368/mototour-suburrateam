import { useState } from "react";

export default function Pianifica() {
  const [giorni, setGiorni] = useState(1);

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px",
    marginBottom: "12px",
    background: "#172033",
    color: "white",
    border: "1px solid #334155",
    borderRadius: "10px",
    outline: "none",
  };

  const cardStyle = {
    background: "#0f172a",
    padding: "20px",
    borderRadius: "16px",
  };

  return (
    <div>
      <h2 style={{ color: "#f97316" }}>
        Pianificazione Tour
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "380px 1fr",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <div style={cardStyle}>
          <h3
            style={{
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            Nuovo Tour
          </h3>

          <input
            placeholder="Nome tour"
            style={inputStyle}
          />

          <input
            placeholder="Regioni attraversate"
            style={inputStyle}
          />

          <input
            placeholder="Partenza"
            style={inputStyle}
          />

          <input
            placeholder="Arrivo"
            style={inputStyle}
          />

          <textarea
            placeholder="Waypoint intermedi (uno per riga)"
            style={{
              ...inputStyle,
              minHeight: "120px",
            }}
          />

          <select style={inputStyle}>
            <option>Veloce</option>
            <option>Panoramico</option>
            <option>Curve</option>
            <option>Extra curve</option>
          </select>

          <input
            type="number"
            min="1"
            max="14"
            value={giorni}
            onChange={(e) =>
              setGiorni(Number(e.target.value) || 1)
            }
            style={inputStyle}
          />

          <select style={inputStyle}>
            <option>Bozza</option>
            <option>Valido</option>
          </select>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <input type="checkbox" />
            Giro circolare
          </label>

          <div
            style={{
              marginBottom: "20px",
            }}
          >
            {[...Array(giorni)].map((_, index) => (
              <div
                key={index}
                style={{
                  background: "#172033",
                  border: "1px solid #334155",
                  padding: "12px",
                  borderRadius: "10px",
                  marginBottom: "10px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Giorno {index + 1}
              </div>
            ))}
          </div>

          <button
            style={{
              width: "100%",
              background: "#f97316",
              color: "white",
              border: "none",
              padding: "14px",
              borderRadius: "10px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Salva Tour
          </button>
        </div>

        <div
          style={{
            ...cardStyle,
            minHeight: "700px",
          }}
        >
          <h3
            style={{
              textAlign: "center",
            }}
          >
            Mappa percorso
          </h3>

          <p
            style={{
              textAlign: "center",
              color: "#94a3b8",
            }}
          >
            Qui comparirà OpenStreetMap
          </p>
        </div>
      </div>
    </div>
  );
}