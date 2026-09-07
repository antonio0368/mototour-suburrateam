const apiKey = import.meta.env.VITE_ORS_API_KEY;

const ORS_BASE_URL =
  "https://api.openrouteservice.org";

function verificaApiKey() {
  if (!apiKey) {
    throw new Error(
      "Chiave OpenRouteService mancante."
    );
  }
}

export async function geocodificaLocalita(
  localita
) {
  verificaApiKey();
console.log("PARAMETRO coordinate =", coordinate);
export async function calcolaPercorso({
  coordinate,
  evitaAutostrade = false,
}) {
  verificaApiKey();

  console.log(
    "PARAMETRO coordinate =",
    coordinate
  );

  const body = {
    coordinates,
    elevation: true,
    instructions: false,
  };


  const query = localita.trim();

  if (!query) {
    throw new Error(
      "Località non valida."
    );
  }

  const risposta = await fetch(
    `${ORS_BASE_URL}/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(
      query
    )}&size=1`
  );

  if (!risposta.ok) {
    throw new Error(
      `Errore geocodifica: ${query}`
    );
  }

  const dati = await risposta.json();

  const risultato =
    dati?.features?.[0];

  if (!risultato) {
    throw new Error(
      `Località non trovata: ${query}`
    );
  }

  const [
    longitudine,
    latitudine,
  ] = risultato.geometry.coordinates;

  return {
    nome:
      risultato.properties?.label ||
      query,

    coordinateLeaflet: [
      latitudine,
      longitudine,
    ],

    coordinateORS: [
      longitudine,
      latitudine,
    ],
  };
}

export async function calcolaPercorso({
  coordinate,
  evitaAutostrade = false,
}) {
  verificaApiKey();

  const body = {
    coordinates,
    elevation: true,
    instructions: false,
  };

  if (evitaAutostrade) {
    body.options = {
      avoid_features: [
        "highways",
      ],
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
    throw new Error(
      "Errore calcolo percorso."
    );
  }

  const dati = await risposta.json();

  const feature =
    dati.features?.[0];

  if (!feature) {
    throw new Error(
      "Percorso non disponibile."
    );
  }

  const geometria =
    feature.geometry.coordinates;

  const summary =
    feature.properties.summary;

  return {
    distanzaMetri:
      summary.distance,

    durataSecondi:
      summary.duration,

    geometriaLeaflet:
      geometria.map(
        (punto) => [
          punto[1],
          punto[0],
        ]
      ),
  };
}

export async function costruisciPercorso({
  partenza,
  passaggi,
  arrivo,
  autostrade,
}) {
  const localita = [
    partenza,
    ...passaggi.filter(Boolean),
    arrivo,
  ];

  const geocodificate = [];

  for (const voce of localita) {
    geocodificate.push(
      await geocodificaLocalita(voce)
    );
  }

  const coordinate =
    geocodificate.map(
      (elemento) =>
        elemento.coordinateORS
    );

  const percorso =
    await calcolaPercorso({
      coordinate,

      evitaAutostrade:
        !autostrade,
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

    geometria:
      percorso.geometriaLeaflet,

    distanzaMetri:
      percorso.distanzaMetri,

    durataSecondi:
      percorso.durataSecondi,
  };
}
}