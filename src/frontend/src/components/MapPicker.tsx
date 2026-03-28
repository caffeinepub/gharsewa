import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";

// Fix Leaflet default icon paths
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapPickerProps {
  value: string;
  onChange: (address: string, lat: number, lng: number) => void;
}

export default function MapPicker({ value, onChange }: MapPickerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [manualAddress, setManualAddress] = useState(value);
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [27.7172, 85.324],
      zoom: 13,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    map.on("click", async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      // Update marker
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(
          map,
        );
        markerRef.current.on("dragend", async () => {
          const pos = markerRef.current!.getLatLng();
          await reverseGeocode(pos.lat, pos.lng);
        });
      }

      await reverseGeocode(lat, lng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  async function reverseGeocode(lat: number, lng: number) {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        { headers: { "Accept-Language": "en" } },
      );
      const data = await res.json();
      const address =
        data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setManualAddress(address);
      onChange(address, lat, lng);
    } catch {
      const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setManualAddress(fallback);
      onChange(fallback, lat, lng);
    } finally {
      setIsGeocoding(false);
    }
  }

  return (
    <div className="space-y-2">
      <Input
        type="text"
        placeholder="Click on map or type address..."
        value={isGeocoding ? "Getting address..." : manualAddress}
        onChange={(e) => {
          setManualAddress(e.target.value);
          onChange(e.target.value, 0, 0);
        }}
        data-ocid="job.input"
      />
      <div
        ref={containerRef}
        style={{
          height: "250px",
          borderRadius: "0.75rem",
          overflow: "hidden",
          zIndex: 0,
        }}
        className="border border-border shadow-sm"
      />
      <p className="text-xs text-muted-foreground">
        📍 Click on the map to set the exact work location
      </p>
    </div>
  );
}
