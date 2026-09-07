import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CENTRO_INIZIALE = [45.0703, 7.6869];

function AdattaMappaAlPercorso({
  partenza,
  arrivo,
  passaggi,
  coordinateTraccia,
}) {
  const map = useMap();

  useEffect(() => {
    const punti = [
      partenza,
      ...passaggi,
      arrivo,
      ...coordinateTraccia,
    ].filter(
      (punto) =>
        Array.isArray(punto) &&
        punto.length >= 2 &&
        Number.isFinite(Number(punto[0])) &&
        Number.isFinite(Number(punto[1]))
    );

    if (punti.length === 0) {
      return;
    }

    if (punti.length === 1) {
      map.setView(punti[0], 13);
      return;
    }

    map.fitBounds(punti, {
      padding: [35, 35],
    });
  }, [
    map,
    partenza,
    arrivo,
    passaggi,
    coordinateTraccia,
  ]);

  return null;
}

export default function MappaPercorso({
  partenza = null,
  arrivo = null,
  passaggi = [],
  coordinateTraccia = [],
}) {
  const tracciaValida =
    Array.isArray(coordinateTraccia) &&
    coordinateTraccia.length >= 2;

  return (
    <section className="mappa-percorso-wrapper">
      <MapContainer
        center={CENTRO_INIZIALE}
        zoom={8}
        minZoom={4}
        maxZoom={19}
        scrollWheelZoom={true}
        className="mappa-leaflet"
        style={{
          width: "100%",
          height: "440px",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {partenza && (
          <Marker position={partenza}>
            <Popup>
              <strong>Partenza</strong>
            </Popup>
          </Marker>
        )}

        {passaggi.map((passaggio, indice) => (
          <Marker
            key={`passaggio-${indice}`}
            position={passaggio}
          >
            <Popup>
              <strong>
                Passaggio {indice + 1}
              </strong>
            </Popup>
          </Marker>
        ))}

        {arrivo && (
          <Marker position={arrivo}>
            <Popup>
              <strong>Arrivo</strong>
            </Popup>
          </Marker>
        )}

        {tracciaValida && (
          <Polyline
            positions={coordinateTraccia}
            pathOptions={{
              color: "#f97316",
              weight: 6,
              opacity: 0.9,
            }}
          />
        )}

        <AdattaMappaAlPercorso
          partenza={partenza}
          arrivo={arrivo}
          passaggi={passaggi}
          coordinateTraccia={coordinateTraccia}
        />
      </MapContainer>

      {!partenza &&
        !arrivo &&
        !tracciaValida && (
          <div className="mappa-messaggio">
            Inserisci partenza, passaggi e arrivo
            per costruire il percorso.
          </div>
        )}
    </section>
  );
}