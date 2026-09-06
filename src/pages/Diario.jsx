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
   