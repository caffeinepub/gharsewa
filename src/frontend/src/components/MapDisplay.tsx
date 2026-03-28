import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

// Fix Leaflet default icon paths
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapDisplayProps {
  location: string;
  height?: number;
}

function parseLocation(
  location: string,
): { lat: number; lng: number; address: string } | null {
  // Format: "lat,lng|address text"
  const pipeIdx = location.indexOf("|");
  if (pipeIdx > -1) {
    const coords = location.substring(0, pipeIdx);
    const address = location.substring(pipeIdx + 1);
    const parts = coords.split(",");
    if (parts.length === 2) {
      const lat = Number.parseFloat(parts[0]);
      const lng = Number.parseFloat(parts[1]);
      if (!Number.isNaN(lat) && !Number.isNaN(lng))
        return { lat, lng, address };
    }
  }
  return null;
}

export default function MapDisplay({
  location,
  height = 180,
}: MapDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const parsed = parseLocation(location);

  // biome-ignore lint/correctness/useExhaustiveDependencies: location string captures all deps
  useEffect(() => {
    if (!parsed || !containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [parsed.lat, parsed.lng],
      zoom: 15,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      keyboard: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    L.marker([parsed.lat, parsed.lng]).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [location]);

  if (!parsed) {
    return (
      <div className="flex items-center gap-1.5 mb-3 px-3 py-2 bg-terracotta/5 rounded-xl border border-terracotta/20">
        <span className="text-sm">📍</span>
        <span className="text-sm font-semibold text-terracotta">
          {location}
        </span>
      </div>
    );
  }

  return (
    <div className="mb-3">
      <div
        ref={containerRef}
        style={{
          height: `${height}px`,
          borderRadius: "0.75rem",
          overflow: "hidden",
          zIndex: 0,
        }}
        className="border border-terracotta/20 shadow-sm"
      />
      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
        <span>📍</span>
        <span className="truncate">{parsed.address || location}</span>
      </p>
    </div>
  );
}
