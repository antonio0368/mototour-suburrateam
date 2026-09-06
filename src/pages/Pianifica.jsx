export default function Pianifica() {
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
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "12px",
        }}
      />

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