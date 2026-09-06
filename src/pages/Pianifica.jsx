import { useState } from "react";

export default function Pianifica() {
  const [giorni, setGiorni] = useState(1);
  return (
    <div>
      <h2 style={{ color: "#f97316" }}>
        Pianificazione Tour
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "350px 1fr",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            background: "#0f172a",
            padding: "20px",
            borderRadius: "16px",
          }}
        >
          <h3>Nuovo tour</h3>

        <input
          placeholder="Nome tour"
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "12px",
          }}
        />

        <input
          placeholder="Regioni attraversate"
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "12px",
          }}
        />

        <input
        placeholder="Partenza"
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "12px",
        }}
      />

      <input
        placeholder="Arrivo"
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "12px",
        }}
      />

      <textarea
        placeholder="Waypoint intermedi (uno per riga)"
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "12px",
          minHeight: "100px",
        }}
      />

      <select
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "12px",
        }}
      >
        <option>Veloce</option>
        <option>Panoramico</option>
        <option>Curve</option>
        <option>Extra curve</option>
      </select>

      <input
        type="number"
        placeholder="Numero giorni"
        min="1"
        max="14"
        value={giorni}
        onChange={(e) =>
          setGiorni(Number(e.target.value) || 1)
        }
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "12px",
        }}
      />

      <select
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "12px",
        }}
      >
        <option>Bozza</option>
        <option>Valido</option>
      </select>

      <label
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        <input type="checkbox" />
        Giro circolare
      </label>

          <button
            style={{
              background: "#f97316",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "8px",
            }}
          >
            Salva Tour
          </button>
        </div>
        <div
          style={{
            marginBottom: "16px",
          }}
        >
          {[...Array(giorni)].map((_, index) => (
            <div
              key={index}
              style={{
                background: "#172033",
                padding: "10px",
                borderRadius: "8px",
                marginBottom: "8px",
              }}
            >
              Giorno {index + 1}
            </div>
          ))}
        </div>
        <div
          style={{
            background: "#172033",
            borderRadius: "16px",
            minHeight: "400px",
            padding: "20px",
          }}
        >
          <h3>Mappa percorso</h3>

          <p>Qui comparirà OpenStreetMap</p>
        </div>
      </div>
    </div>
  );
}