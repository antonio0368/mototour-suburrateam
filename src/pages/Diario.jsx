import { useMemo, useState } from "react";
import "./Diario.css";

const tourIniziali = [
  {
    id: 1,
    nome: "Anello Val di Susa",
    data: "2026-08-16",
    km: 218,
    durataOre: 4.7,
    dislivelloPositivo: 3250,
    pernottamenti: 0,
    partecipanti: 4,
    tipoPercorso: "Curve",
    stato: "effettuato",
    note: "Tour completato con percorso circolare.",
  },
  {
    id: 2,
    nome: "Colle del Nivolet",
    data: "2026-08-29",
    km: 196,
    durataOre: 4.2,
    dislivelloPositivo: 2870,
    pernottamenti: 1,
    partecipanti: 5,
    tipoPercorso: "Panoramico",
    stato: "effettuato",
    note: "Pernottamento previsto al termine del tour.",
  },
  {
    id: 3,
    nome: "Langhe e Alta Langa",
    data: "2026-09-20",
    km: 244,
    durataOre: 5.1,
    dislivelloPositivo: 1980,
    pernottamenti: 1,
    partecipanti: 3,
    tipoPercorso: "Extra curve",
    stato: "pianificato",
    note: "Percorso ancora da confermare.",
  },
];

function formattaDurata(oreDecimali) {
  const ore = Math.floor(oreDecimali);
  const minuti = Math.round((oreDecimali - ore) * 60);
  return `${ore} h ${minuti.toString().padStart(2, "0")} min`;
}

function formattaData(data) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${data}T12:00:00`));
}

export default function Diario() {
  const [filtroStato, setFiltroStato] = useState("tutti");
  const [ricerca, setRicerca] = useState("");
  const [tourAperto, setTourAperto] = useState(null);

  const tourFiltrati = useMemo(() => {
    return tourIniziali.filter((tour) => {
      const statoValido =
        filtroStato === "tutti" || tour.stato === filtroStato;

      const testoValido = tour.nome
        .toLocaleLowerCase("it-IT")
        .includes(ricerca.trim().toLocaleLowerCase("it-IT"));

      return statoValido && testoValido;
    });
  }, [filtroStato, ricerca]);

  const tourEffettuati = tourIniziali.filter(
    (tour) => tour.stato === "effettuato"
  );

  const statistiche = useMemo(() => {
    return {
      tour: tourEffettuati.length,
      km: tourEffettuati.reduce((totale, tour) => totale + tour.km, 0),
      ore: tourEffettuati.reduce(
        (totale, tour) => totale + tour.durataOre,
        0
      ),
      dislivello: tourEffettuati.reduce(
        (totale, tour) => totale + tour.dislivelloPositivo,
        0
      ),
      pernottamenti: tourEffettuati.reduce(
        (totale, tour) => totale + tour.pernottamenti,
        0
      ),
    };
  }, []);

  return (
    <main className="diario-page">
      <section className="diario-header">
        <div>
          <p className="diario-eyebrow">MOTOTOUR TEAM SUBURRA</p>
          <h1>Diario dei tour</h1>
          <p className="diario-subtitle">
            La memoria delle strade percorse, curva dopo curva.
          </p>
        </div>
      </section>

      <section className="diario-statistiche">
        <article className="stat-card">
          <span>Tour effettuati</span>
          <strong>{statistiche.tour}</strong>
        </article>

        <article className="stat-card">
          <span>Km percorsi</span>
          <strong>{statistiche.km.toLocaleString("it-IT")}</strong>
        </article>

        <article className="stat-card">
          <span>Ore in moto</span>
          <strong>{statistiche.ore.toFixed(1)}</strong>
        </article>

        <article className="stat-card">
          <span>Dislivello D+</span>
          <strong>
            {statistiche.dislivello.toLocaleString("it-IT")} m
          </strong>
        </article>

        <article className="stat-card">
          <span>Pernottamenti</span>
          <strong>{statistiche.pernottamenti}</strong>
        </article>
      </section>

      <section className="diario-toolbar">
        <input
          type="search"
          value={ricerca}
          onChange={(evento) => setRicerca(evento.target.value)}
          placeholder="Cerca un tour"
          aria-label="Cerca un tour"
        />

        <select
          value={filtroStato}
          onChange={(evento) => setFiltroStato(evento.target.value)}
          aria-label="Filtra i tour per stato"
        >
          <option value="tutti">Tutti i tour</option>
          <option value="effettuato">Effettuati</option>
          <option value="pianificato">Pianificati</option>
        </select>
      </section>

      <section className="elenco-tour">
        {tourFiltrati.length === 0 ? (
          <div className="nessun-tour">
            Nessun tour corrisponde ai filtri selezionati.
          </div>
        ) : (
          tourFiltrati.map((tour) => {
            const aperto = tourAperto === tour.id;

            return (
              <article className="tour-card" key={tour.id}>
                <div className="tour-card-top">
                  <div>
                    <span className={`stato stato-${tour.stato}`}>
                      {tour.stato}
                    </span>

                    <h2>{tour.nome}</h2>
                    <p>{formattaData(tour.data)}</p>
                  </div>

                  <span className="tipo-percorso">
                    {tour.tipoPercorso}
                  </span>
                </div>

                <div className="tour-dati">
                  <div>
                    <strong>{tour.km}</strong>
                    <span>km</span>
                  </div>

                  <div>
                    <strong>{formattaDurata(tour.durataOre)}</strong>
                    <span>durata</span>
                  </div>

                  <div>
                    <strong>
                      {tour.dislivelloPositivo.toLocaleString("it-IT")} m
                    </strong>
                    <span>D+</span>
                  </div>

                  <div>
                    <strong>{tour.partecipanti}</strong>
                    <span>partecipanti</span>
                  </div>
                </div>

                {aperto && (
                  <div className="tour-dettaglio">
                    <p>
                      <strong>Pernottamenti:</strong>{" "}
                      {tour.pernottamenti}
                    </p>

                    <p>
                      <strong>Note:</strong> {tour.note}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  className="dettaglio-button"
                  onClick={() =>
                    setTourAperto(aperto ? null : tour.id)
                  }
                >
                  {aperto ? "Chiudi dettaglio" : "Vedi dettaglio"}
                </button>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}