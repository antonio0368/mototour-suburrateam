export default function Percorsi() {
  return (
    <div>
      <h2 style={{ color: "#f97316" }}>
        Archivio Percorsi
      </h2>

      <div
        style={{
          display: "grid",
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
          <h3>Colle del Nivolet</h3>

          <p>Piemonte • Valle d'Aosta</p>

          <p>196 km • 2 giorni</p>
        </div>

        <div
          style={{
            background: "#0f172a",
            padding: "20px",
            borderRadius: "16px",
          }}
        >
          <h3>Val di Susa</h3>

          <p>Piemonte</p>

          <p>218 km • 1 giorno</p>
        </div>
      </div>
    </div>
  );
}