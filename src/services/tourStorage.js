const STORAGE_KEY = "mototour_tours";
const STORAGE_VERSION = 1;

function leggiArchivio() {
  try {
    const valore = localStorage.getItem(STORAGE_KEY);

    if (!valore) {
      return {
        versione: STORAGE_VERSION,
        tours: [],
      };
    }

    const archivio = JSON.parse(valore);

    if (Array.isArray(archivio)) {
      return {
        versione: STORAGE_VERSION,
        tours: archivio,
      };
    }

    return {
      versione: Number(archivio?.versione) || STORAGE_VERSION,
      tours: Array.isArray(archivio?.tours) ? archivio.tours : [],
    };
  } catch (errore) {
    console.error("Archivio tour non leggibile:", errore);

    return {
      versione: STORAGE_VERSION,
      tours: [],
    };
  }
}

function scriviArchivio(tours) {
  const archivio = {
    versione: STORAGE_VERSION,
    tours,
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(archivio)
  );

  window.dispatchEvent(
    new CustomEvent("mototour:tours-updated", {
      detail: {
        totale: tours.length,
      },
    })
  );

  return tours;
}

function generaId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `tour_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function normalizzaPunto(punto) {
  if (!punto) {
    return {
      label: "",
      coordinateORS: null,
      coordinateLeaflet: null,
    };
  }

  if (typeof punto === "string") {
    return {
      label: punto.trim(),
      coordinateORS: null,
      coordinateLeaflet: null,
    };
  }

  return {
    label: String(punto.label || "").trim(),
    coordinateORS: Array.isArray(punto.coordinateORS)
      ? punto.coordinateORS.map(Number)
      : null,
    coordinateLeaflet: Array.isArray(punto.coordinateLeaflet)
      ? punto.coordinateLeaflet.map(Number)
      : null,
  };
}

function normalizzaRiepilogo(riepilogo) {
  if (!riepilogo) {
    return null;
  }

  return {
    distanzaMetri: Number(riepilogo.distanzaMetri) || 0,
    durataSecondi: Number(riepilogo.durataSecondi) || 0,
    dislivelloPositivo: Number(riepilogo.dislivelloPositivo) || 0,
    dislivelloNegativo: Number(riepilogo.dislivelloNegativo) || 0,
    quotaMinima:
      riepilogo.quotaMinima === null ||
      riepilogo.quotaMinima === undefined
        ? null
        : Number(riepilogo.quotaMinima),
    quotaMassima:
      riepilogo.quotaMassima === null ||
      riepilogo.quotaMassima === undefined
        ? null
        : Number(riepilogo.quotaMassima),
  };
}

export function creaTour(dati = {}) {
  const adesso = new Date().toISOString();

  return {
    id: dati.id || generaId(),
    versione: STORAGE_VERSION,
    nome: String(dati.nome || "Tour senza nome").trim(),
    stato: dati.stato || "Bozza",
    tipoPercorso: dati.tipoPercorso || "Curve",
    numeroGiorni: Math.max(1, Number(dati.numeroGiorni) || 1),
    giroCircolare: Boolean(dati.giroCircolare),
    consentiAutostrade: Boolean(dati.consentiAutostrade),
    creatoIl: dati.creatoIl || adesso,
    aggiornatoIl: adesso,
    partenza: normalizzaPunto(dati.partenza),
    passaggi: Array.isArray(dati.passaggi)
      ? dati.passaggi.map(normalizzaPunto).filter((punto) => punto.label)
      : [],
    arrivo: normalizzaPunto(dati.arrivo),
    riepilogo: normalizzaRiepilogo(dati.riepilogo),
    geometria: Array.isArray(dati.geometria) ? dati.geometria : [],
    giornate: Array.isArray(dati.giornate) ? dati.giornate : [],
  };
}

export function recuperaTour() {
  return leggiArchivio().tours;
}

export function recuperaTourPerId(id) {
  return recuperaTour().find((tour) => tour.id === id) || null;
}

export function salvaTour(dati) {
  const archivio = recuperaTour();
  const esistente = dati?.id
    ? archivio.find((tour) => tour.id === dati.id)
    : null;

  const tour = creaTour({
    ...esistente,
    ...dati,
    creatoIl: esistente?.creatoIl || dati?.creatoIl,
  });

  const indice = archivio.findIndex(
    (elemento) => elemento.id === tour.id
  );

  if (indice >= 0) {
    const aggiornati = [...archivio];
    aggiornati[indice] = tour;
    scriviArchivio(aggiornati);
  } else {
    scriviArchivio([tour, ...archivio]);
  }

  return tour;
}

export function eliminaTour(id) {
  const aggiornati = recuperaTour().filter(
    (tour) => tour.id !== id
  );

  scriviArchivio(aggiornati);

  return aggiornati;
}

export function duplicaTour(id) {
  const originale = recuperaTourPerId(id);

  if (!originale) {
    return null;
  }

  return salvaTour({
    ...originale,
    id: undefined,
    nome: `${originale.nome} - Copia`,
    stato: "Bozza",
    creatoIl: undefined,
    aggiornatoIl: undefined,
  });
}

export function eliminaTuttiITour() {
  return scriviArchivio([]);
}

export function esportaArchivioTour() {
  return JSON.stringify(leggiArchivio(), null, 2);
}

export function importaArchivioTour(testoJson) {
  const dati = JSON.parse(testoJson);
  const tours = Array.isArray(dati)
    ? dati
    : Array.isArray(dati?.tours)
      ? dati.tours
      : [];

  const normalizzati = tours.map(creaTour);
  scriviArchivio(normalizzati);

  return normalizzati;
}