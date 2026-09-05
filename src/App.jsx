export default function App() {
  const [page, setPage] = React.useState("home");
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "white",
        padding: "40px",
        fontFamily: "system-ui"
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px"
        }}
      >
        <div>
          <h1 style={{ color: "#f97316", margin: 0 }}>
            Mototour - Suburra Team
          </h1>

          <p style={{ marginTop: "8px" }}>
            La strada giusta, curva dopo curva
          </p>
        </div>

        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            border: "2px solid #facc15",
            background: "#334155"
          }}
        />
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "350px 1fr",
          gap: "20px"
        }}
      >
        <div
          style={{
            background: "#0f172a",
            padding: "20px",
            borderRadius: "16px"
          }}
        >
          <h2>Pianifica</h2>

          <p>Nuovo tour</p>

          <input
            placeholder="Nome tour"
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "12px"
            }}
          />

          <button
            style={{
              background: "#f97316",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "8px"
            }}
          >
            Salva Tour
          </button>
        </div>

        <div
          style={{
            background: "#172033",
            borderRadius: "16px",
            minHeight: "500px",
            padding: "20px"
          }}
        >
          <h2>Mappa percorso</h2>

          <p>Qui comparirà la mappa OpenStreetMap.</p>
        </div>
      </div>
    </div>
  );
}
