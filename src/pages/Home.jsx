export default function Home() {
  return (
    <div>
      <h2 style={{ color: "#f97316" }}>
        Dashboard Suburra Team
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "16px",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            background: "#0f172a",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <h3>Tour</h3>
          <p>12</p>
        </div>

        <div
          style={{
            background: "#0f172a",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <h3>Km Percorsi</h3>
          <p>2.450</p>
        </div>

        <div
          style={{
            background: "#0f172a",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <h3>Pernottamenti</h3>
          <p>8</p>
        </div>
      </div>
    </div>
  );
}