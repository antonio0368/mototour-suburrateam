export default function Navigation({ page, setPage }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#0f172a",
        padding: "10px",
        borderRadius: "16px",
        display: "flex",
        gap: "10px",
      }}
    >
      <button onClick={() => setPage("home")}>
        🏠 Home
      </button>

      <button onClick={() => setPage("pianifica")}>
        🗺 Pianifica
      </button>
    </div>
  );
}