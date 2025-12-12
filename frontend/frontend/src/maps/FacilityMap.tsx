import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function FacilityMap({ lat, lon }: { lat?: number; lon?: number }) {
  if (!lat || !lon) return null;
  return (
    <div style={{ height: 300, width: "100%" }}>
      <MapContainer center={[lat, lon]} zoom={14} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[lat, lon]}><Popup>Facility</Popup></Marker>
      </MapContainer>
    </div>
  );
}
