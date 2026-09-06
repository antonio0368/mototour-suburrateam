export default function Statistiche() {
  return (
    <div>
      <h2 style={{ color: "#f97316" }}>
        Statistiche
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
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
          <h3>Tour Effettuati</h3>
          <p>12</p>
        </div>

        <div
          style={{
            background: "#0f172a",
            padding: "20px",
            borderRadius: "16px",
          }}
        >
          <h3>Km Totali</h3>
          <p>2450</p>
        </div>

        <div
          style={{
            background: "#0f172a",
            padding: "20px",
            borderRadius: "16px",
          }}
        >
          <h3>Pernottamenti</h3>
          <p>8</p>
        </div>
      </div>
    </div>
  );
}