const apiKey = import.meta.env.VITE_ORS_API_KEY;

const ORS_BASE_URL =
  "https://api.openrouteservice.org";

function verificaApiKey() {
  if (!apiKey) {
    throw new Error(
      "Chiave OpenRouteService mancante. Controlla il file .env.local e riavvia Vite."
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

export async function geocodificaLocalita(
  localita
) {
  verificaApiKey();

  const query = localita?.trim();

  if (!query) {
    throw new Error(
      "Località non valida."
    );
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
    let dettaglio = "";

    try {
      const datiErrore =
        await risposta.json();

      dettaglio =
        datiErrore?.error?.message ||
        datiErrore?.message ||
        "";
    } catch {
      dettaglio = "";
    }

    throw new Error(
      dettaglio ||
        `Errore di geocodifica per "${query}" (${risposta.status}).`
    );
  }

  const dati = await risposta.json();

  const risultato =
    dati?.features?.[0];

  if (!risultato) {
    throw new Error(
      `Località non trovata: "${query}". Prova a specificare anche provincia o nazione.`
    );
  }

  const coordinateGeoJson =
    risultato.geometry?.coordinates;

  if (!coordinateValide(coordinateGeoJson)) {
    throw new Error(
      `Coordinate non valide per "${query}".`
    );
  }

  const [
    longitudine,
    latitudine,
  ] = coordinateGeoJson;

  return {
    nome:
      risultato.properties?.label ||
      risultato.properties?.name ||
      query,

    coordinateLeaflet: [
      Number(latitudine),
      Number(longitudine),
    ],

    coordinateORS: [
      Number(longitudine),
      Number(latitudine),
    ],
  };
}

function calcolaDatiAltimetrici(
  coordinateGeometria
) {
  if (
    !Array.isArray(coordinateGeometria) ||
    coordinateGeometria.length === 0
  ) {
    return {
      dislivelloPositivo: 0,
      dislivelloNegativo: 0,
      quotaMinima: null,
      quotaMassima: null,
    };
  }

  const quote = coordinateGeometria
    .map((punto) => Number(punto?.[2]))
    .filter(Number.isFinite);

  if (quote.length === 0) {
    return {
      dislivelloPositivo: 0,
      dislivelloNegativo: 0,
      quotaMinima: null,
      quotaMassima: null,
    };
  }

  let dislivelloPositivo = 0;
  let dislivelloNegativo = 0;

  for (
    let indice = 1;
    indice < coordinateGeometria.length;
    indice += 1
  ) {
    const quotaPrecedente = Number(
      coordinateGeometria[indice - 1]?.[2]
    );

    const quotaAttuale = Number(
      coordinateGeometria[indice]?.[2]
    );

    if (
      !Number.isFinite(quotaPrecedente) ||
      !Number.isFinite(quotaAttuale)
    ) {
      continue;
    }

    const differenza =
      quotaAttuale - quotaPrecedente;

    if (differenza > 0) {
      dislivelloPositivo += differenza;
    } else if (differenza < 0) {
      dislivelloNegativo +=
        Math.abs(differenza);
    }
  }

  return {
    dislivelloPositivo:
      Math.round(dislivelloPositivo),

    dislivelloNegativo:
      Math.round(dislivelloNegativo),

    quotaMinima:
      Math.round(Math.min(...quote)),

    quotaMassima:
      Math.round(Math.max(...quote)),
  };
}

function convertiGeometriaPerLeaflet(
  coordinateGeometria
) {
  if (!Array.isArray(coordinateGeometria)) {
    return [];
  }

  return coordinateGeometria
    .filter(coordinateValide)
    .map((punto) => [
      Number(punto[1]),
      Number(punto[0]),
    ]);
}

export async function calcolaPercorso({
  coordinate,
  evitaAutostrade = false,
}) {
  verificaApiKey();

  if (
    !Array.isArray(coordinate) ||
    coordinate.length < 2
  ) {
    throw new Error(
      "Servono almeno partenza e arrivo per calcolare il percorso."
    );
  }

  const tutteValide =
    coordinate.every(coordinateValide);

  if (!tutteValide) {
    throw new Error(
      "Una o più coordinate del percorso non sono valide."
    );
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
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(body),
    }
  );

  if (!risposta.ok) {
    let dettaglio = "";

    try {
      const datiErrore =
        await risposta.json();

      dettaglio =
        datiErrore?.error?.message ||
        datiErrore?.message ||
        "";
    } catch {
      dettaglio = "";
    }

    throw new Error(
      dettaglio ||
        `Errore nel calcolo del percorso (${risposta.status}).`
    );
  }

  const dati = await risposta.json();

  const feature =
    dati?.features?.[0];

  if (!feature) {
    throw new Error(
      "OpenRouteService non ha restituito alcun percorso."
    );
  }

  const geometria =
    feature.geometry?.coordinates || [];

  const summary =
    feature.properties?.summary || {};

  const altimetria =
    calcolaDatiAltimetrici(geometria);

  return {
    distanzaMetri:
      Number(summary.distance) || 0,

    durataSecondi:
      Number(summary.duration) || 0,

    geometriaLeaflet:
      convertiGeometriaPerLeaflet(
        geometria
      ),

    geometriaGeoJson:
      geometria,

    dislivelloPositivo:
      altimetria.dislivelloPositivo,

    dislivelloNegativo:
      altimetria.dislivelloNegativo,

    quotaMinima:
      altimetria.quotaMinima,

    quotaMassima:
      altimetria.quotaMassima,
  };
}

export async function costruisciPercorso({
  partenza,
  passaggi = [],
  arrivo,
  autostrade = false,
}) {
  const partenzaPulita =
    partenza?.trim();

  const arrivoPulito =
    arrivo?.trim();

  const passaggiPuliti = passaggi
    .map((passaggio) =>
      passaggio?.trim()
    )
    .filter(Boolean);

  if (!partenzaPulita) {
    throw new Error(
      "Inserisci la partenza."
    );
  }

  if (!arrivoPulito) {
    throw new Error(
      "Inserisci l’arrivo."
    );
  }

  const localita = [
    partenzaPulita,
    ...passaggiPuliti,
    arrivoPulito,
  ];

  const geocodificate = [];

  for (const voce of localita) {
    const risultato =
      await geocodificaLocalita(voce);

    geocodificate.push(risultato);
  }

  const coordinate =
    geocodificate.map(
      (elemento) =>
        elemento.coordinateORS
    );

  const percorso =
    await calcolaPercorso({
      coordinate,
      evitaAutostrade: !autostrade,
    });

  return {
    pointStart:
      geocodificate[0]
        .coordinateLeaflet,

    pointEnd:
      geocodificate[
        geocodificate.length - 1
      ].coordinateLeaflet,

    passaggi:
      geocodificate
        .slice(1, -1)
        .map(
          (punto) =>
            punto.coordinateLeaflet
        ),

    localitaGeocodificate:
      geocodificate,

    geometria:
      percorso.geometriaLeaflet,

    geometriaGeoJson:
      percorso.geometriaGeoJson,

    distanzaMetri:
      percorso.distanzaMetri,

    durataSecondi:
      percorso.durataSecondi,

    dislivelloPositivo:
      percorso.dislivelloPositivo,

    dislivelloNegativo:
      percorso.dislivelloNegativo,

    quotaMinima:
      percorso.quotaMinima,

    quotaMassima:
      percorso.quotaMassima,
  };
}