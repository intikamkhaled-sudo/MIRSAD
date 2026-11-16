import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import type { LatLngExpression } from 'leaflet'

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
})
export default function WeatherMap({ lat, lon }: { lat: number; lon: number }) {
  const center: LatLngExpression = [lat, lon]
  return <div className="map-wrap"><MapContainer center={center} zoom={7} scrollWheelZoom={true} key={`${lat}-${lon}`}>
    <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <Marker position={center} icon={markerIcon}><Popup>Observation location<br />{lat.toFixed(4)}, {lon.toFixed(4)}</Popup></Marker>
  </MapContainer></div>
}
