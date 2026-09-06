import React from "react";
import Home from "./pages/Home";
import Pianifica from "./pages/Pianifica";
import Navigation from "./components/Navigation";
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

      <div>
        {page === "home" && <Home />}
        {page === "pianifica" && <Pianifica />}
      </div>
      <Navigation
        page={page}
       setPage={setPage}
      />
    </div>
  );
}
