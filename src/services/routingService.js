const apiKey = import.meta.env.VITE_ORS_API_KEY;

const ORS_BASE_URL = "/ors-api";

function verificaApiKey() {
  if (!apiKey) {
    throw new Error(
      "Chiave OpenRouteService mancante. Controlla .env.local e riavvia Vite."
    );
  }
}

function coordinateValide(coordinate) {
  return (
    Array.isArray(coordinate) &&
    coordinate.length >= 2 &&
    Number.isFinite(Number(coordinate[0])) &&
    Number.isFinite(Number(coordinate[1]))
  );
}

export async function geocodificaLocalita(localita) {
  verificaApiKey();

  const query = String(localita || "").trim();

  if (!query) {
    throw new Error("Località non valida.");
  }

  const parametri = new URLSearchParams({
    api_key: apiKey,
    text: query,
    size: "1",
  });

  const risposta = await fetch(
    `${ORS_BASE_URL}/geocode/search?${parametri.toString()}`
  );

  if (!risposta.ok) {
    throw new Error(`Errore di geocodifica per "${query}" (${risposta.status}).`);
  }

  const dati = await risposta.json();
  const risultato = dati?.features?.[0];

  if (!risultato) {
    throw new Error(`Località non trovata: "${query}".`);
  }

  const coordinate = risultato.geometry?.coordinates;

  if (!coordinateValide(coordinate)) {
    throw new Error(`Coordinate non valide per "${query}".`);
  }

  const [longitudine, latitudine] = coordinate;

  return {
    nome: risultato.properties?.label || query,
    coordinateORS: [Number(longitudine), Number(latitudine)],
    coordinateLeaflet: [Number(latitudine), Number(longitudine)],
  };
}

function calcolaAltimetria(geometria) {
  const quote = (geometria || [])
    .map((punto) => Number(punto?.[2]))
    .filter(Number.isFinite);

  if (!quote.length) {
    return {
      dislivelloPositivo: 0,
      dislivelloNegativo: 0,
      quotaMinima: null,
      quotaMassima: null,
    };
  }

  let dislivelloPositivo = 0;
  let dislivelloNegativo = 0;

  for (let indice = 1; indice < geometria.length; indice += 1) {
    const precedente = Number(geometria[indice - 1]?.[2]);
    const attuale = Number(geometria[indice]?.[2]);

    if (!Number.isFinite(precedente) || !Number.isFinite(attuale)) {
      continue;
    }

    const differenza = attuale - precedente;

    if (differenza > 0) dislivelloPositivo += differenza;
    if (differenza < 0) dislivelloNegativo += Math.abs(differenza);
  }

  return {
    dislivelloPositivo: Math.round(dislivelloPositivo),
    dislivelloNegativo: Math.round(dislivelloNegativo),
    quotaMinima: Math.round(Math.min(...quote)),
    quotaMassima: Math.round(Math.max(...quote)),
  };
}

export async function calcolaPercorso({
  coordinate,
  evitaAutostrade = false,
}) {
  verificaApiKey();

  if (!Array.isArray(coordinate) || coordinate.length < 2) {
    throw new Error("Servono almeno partenza e arrivo.");
  }

  if (!coordinate.every(coordinateValide)) {
    throw new Error("Una o più coordinate del percorso non sono valide.");
  }

  const body = {
    coordinates: coordinate,
    elevation: true,
    instructions: false,
  };

  if (evitaAutostrade) {
    body.options = {
      avoid_features: ["highways"],
    };
  }

  const risposta = await fetch(
    `${ORS_BASE_URL}/v2/directions/driving-car/geojson`,
    {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!risposta.ok) {
    let dettaglio = "";

    try {
      const erroreApi = await risposta.json();
      dettaglio = erroreApi?.error?.message || erroreApi?.message || "";
    } catch {
      dettaglio = "";
    }

    throw new Error(
      dettaglio || `Errore nel calcolo del percorso (${risposta.status}).`
    );
  }

  const dati = await risposta.json();
  const feature = dati?.features?.[0];

  if (!feature) {
    throw new Error("OpenRouteService non ha restituito alcun percorso.");
  }

  const geometriaGeoJson = feature.geometry?.coordinates || [];
  const summary = feature.properties?.summary || {};
  const altimetria = calcolaAltimetria(geometriaGeoJson);

  return {
    geometriaGeoJson,
    geometriaLeaflet: geometriaGeoJson
      .filter(coordinateValide)
      .map((punto) => [Number(punto[1]), Number(punto[0])]),
    distanzaMetri: Number(summary.distance) || 0,
    durataSecondi: Number(summary.duration) || 0,
    ...altimetria,
  };
}

async function risolviPunto(localita, coordinateSelezionate) {
  if (coordinateValide(coordinateSelezionate)) {
    return {
      nome: String(localita || "").trim(),
      coordinateORS: [
        Number(coordinateSelezionate[0]),
        Number(coordinateSelezionate[1]),
      ],
      coordinateLeaflet: [
        Number(coordinateSelezionate[1]),
        Number(coordinateSelezionate[0]),
      ],
      daSelezione: true,
    };
  }

  return geocodificaLocalita(localita);
}

export async function costruisciPercorso({
  partenza,
  passaggi = [],
  arrivo,
  autostrade = false,
  coordinateSelezionate = {},
}) {
  const partenzaPulita = String(partenza || "").trim();
  const arrivoPulito = String(arrivo || "").trim();
  const passaggiPuliti = passaggi
    .map((passaggio) => String(passaggio || "").trim())
    .filter(Boolean);

  if (!partenzaPulita) throw new Error("Inserisci la partenza.");
  if (!arrivoPulito) throw new Error("Inserisci l’arrivo.");

  const partenzaRisolta = await risolviPunto(
    partenzaPulita,
    coordinateSelezionate.partenza
  );

  const passaggiRisolti = [];

  for (let indice = 0; indice < passaggiPuliti.length; indice += 1) {
    passaggiRisolti.push(
      await risolviPunto(
        passaggiPuliti[indice],
        coordinateSelezionate.passaggi?.[indice]
      )
    );
  }

  const arrivoRisolto = await risolviPunto(
    arrivoPulito,
    coordinateSelezionate.arrivo
  );

  const punti = [partenzaRisolta, ...passaggiRisolti, arrivoRisolto];

  const percorso = await calcolaPercorso({
    coordinate: punti.map((punto) => punto.coordinateORS),
    evitaAutostrade: !autostrade,
  });

  return {
    pointStart: partenzaRisolta.coordinateLeaflet,
    pointEnd: arrivoRisolto.coordinateLeaflet,
    passaggi: passaggiRisolti.map((punto) => punto.coordinateLeaflet),
    puntiRisolti: punti,
    geometria: percorso.geometriaLeaflet,
    geometriaGeoJson: percorso.geometriaGeoJson,
    distanzaMetri: percorso.distanzaMetri,
    durataSecondi: percorso.durataSecondi,
    dislivelloPositivo: percorso.dislivelloPositivo,
    dislivelloNegativo: percorso.dislivelloNegativo,
    quotaMinima: percorso.quotaMinima,
    quotaMassima: percorso.quotaMassima,
  };
}
