export default function Navigation({ page, setPage }) {
  const styleButton = {
    background: "#1e293b",
    color: "white",
    border: "none",
    padding: "10px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#0f172a",
        padding: "12px",
        borderRadius: "16px",
        display: "flex",
        gap: "8px",
      }}
    >
      <button style={styleButton} onClick={() => setPage("home")}>
        🏠 Home
      </button>

      <button style={styleButton} onClick={() => setPage("pianifica")}>
        🗺 Pianifica
      </button>

      <button style={styleButton} onClick={() => setPage("percorsi")}>
        📚 Percorsi
      </button>

      <button style={styleButton} onClick={() => setPage("diario")}>
        📓 Diario
      </button>

      <button style={styleButton} onClick={() => setPage("statistiche")}>
        📊 Statistiche
      </button>
    </div>
  );
}