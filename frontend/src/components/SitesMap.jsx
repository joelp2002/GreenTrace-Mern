import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import icon from 'leaflet/dist/images/marker-icon.png';
import icon2x from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

/** Fix default marker icons in bundlers (Vite). */
function setupLeafletIcons() {
  const DefaultIcon = L.icon({
    iconUrl: icon,
    iconRetinaUrl: icon2x,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
  L.Marker.prototype.options.icon = DefaultIcon;
}

function FitBounds({ sites }) {
  const map = useMap();
  useEffect(() => {
    if (!sites?.length) return;
    const pts = sites.map((s) => [s.location.coordinates[1], s.location.coordinates[0]]);
    if (pts.length === 1) {
      map.setView(pts[0], 12);
      return;
    }
    const bounds = L.latLngBounds(pts);
    map.fitBounds(bounds.pad(0.15));
  }, [map, sites]);
  return null;
}

export function SitesMap({ sites, height = 420 }) {
  const iconsReady = useRef(false);
  useEffect(() => {
    if (iconsReady.current) return;
    setupLeafletIcons();
    iconsReady.current = true;
  }, []);

  const center = useMemo(() => {
    if (sites?.length) {
      const s = sites[0];
      return [s.location.coordinates[1], s.location.coordinates[0]];
    }
    return [12.8797, 121.774]; // Philippines centroid approx
  }, [sites]);

  if (!sites?.length) {
    return (
      <div className="map-wrap glass-panel" style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ margin: 0 }}>No planting sites with coordinates yet.</p>
      </div>
    );
  }

  return (
    <div className="map-wrap" style={{ height }}>
      <MapContainer center={center} zoom={6} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds sites={sites} />
        {sites.map((site) => (
          <Marker key={site._id} position={[site.location.coordinates[1], site.location.coordinates[0]]}>
            <Popup>
              <strong>{site.name}</strong>
              <br />
              {site.municipality}, {site.province}
              <br />
              <Link to={`/sites?focus=${site._id}`}>Open detail</Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
