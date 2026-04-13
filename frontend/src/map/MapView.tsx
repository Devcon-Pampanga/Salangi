import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Listing } from "../features/Data/Listings";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// ── Blue dot icon for user's current location ─────────────────────────────────
const userLocationIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 16px; height: 16px;
      background: #3B82F6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.4);
    "></div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

interface MapViewProps {
  listings?: Listing[];
  selectedListing?: Listing | null;
  onSelect?: (listing: Listing) => void;
}

const MapView = ({
  listings = [],
  selectedListing = null,
  onSelect = () => {},
}: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // ── Fetch user location on mount ──────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
  (position) => {
    console.log("Accuracy:", position.coords.accuracy, "meters");
    console.log("Lat:", position.coords.latitude);
    console.log("Lng:", position.coords.longitude);

    const coords = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
    setUserLocation(coords);

    setTimeout(() => {
      const map = mapInstanceRef.current;
      if (!map) return;

      userMarkerRef.current?.remove();

      const marker = L.marker([coords.lat, coords.lng], {
        icon: userLocationIcon,
        zIndexOffset: 1000,
      })
        .addTo(map)
        .bindPopup(`<div style="text-align:center"><strong>📍 You are here</strong></div>`);

      userMarkerRef.current = marker;

      if (!selectedListing) {
        map.flyTo([coords.lat, coords.lng], 14, { animate: true, duration: 1 });
      }
    }, 300);
  },
  (error) => {
    console.warn("Location access denied:", error);
  }
);
  }, []);

  // ── Initialize map once ───────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([15.145, 120.589], 13);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);
    }

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      markersRef.current.clear();
      userMarkerRef.current = null;
    };
  }, []);

  // ── Update user marker when userLocation state changes ────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation) return;

    userMarkerRef.current?.remove();

    const marker = L.marker([userLocation.lat, userLocation.lng], {
      icon: userLocationIcon,
      zIndexOffset: 1000,
    })
      .addTo(map)
      .bindPopup(`<div style="text-align:center"><strong>📍 You are here</strong></div>`);

    userMarkerRef.current = marker;

    if (!selectedListing) {
      map.flyTo([userLocation.lat, userLocation.lng], 14, {
        animate: true,
        duration: 1,
      });
    }
  }, [userLocation]);

  // ── Add all listing markers once listings are available ───────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || listings.length === 0) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    listings.forEach((listing) => {
      const { lat, lng } = listing.coordinates;
      const marker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`
          <div style="min-width:140px">
            <strong>${listing.name}</strong><br/>
            <small>${listing.location}</small><br/>
            <small>${listing.hours}</small>
          </div>
        `);

      marker.on("click", () => {
        onSelect(listing);
      });

      markersRef.current.set(listing.id, marker);
    });
  }, [listings]);

  // ── Pan to selected listing when it changes ───────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedListing) return;

    const { lat, lng } = selectedListing.coordinates;
    const marker = markersRef.current.get(selectedListing.id);

    map.flyTo([lat, lng], 16, { animate: true, duration: 1 });
    marker?.openPopup();
  }, [selectedListing]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
};

export default MapView;