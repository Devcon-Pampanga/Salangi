import { useEffect, useRef } from "react";
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

interface MapViewProps {
  listings?: Listing[];
  selectedListing?: Listing | null;
  onSelect?: (listing: Listing) => void;
}

const MapView = ({ 
  listings = [], 
  selectedListing = null, 
  onSelect = () => {} 
}: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());

  // Initialize map once
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
    };
  }, []);

  // Add all listing markers once listings are available
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || listings.length === 0) return;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // Add a marker for every listing
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

  // Pan to selected listing when it changes
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