import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
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

const userLocationIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:16px;height:16px;
      background:#3B82F6;
      border:3px solid white;
      border-radius:50%;
      box-shadow:0 0 0 3px rgba(59,130,246,0.4);
    "></div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const defaultMarkerIcon = new L.Icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedMarkerIcon = L.divIcon({
  className: "",
  html: `
    <div style="position:relative;width:25px;height:41px;filter:drop-shadow(0 0 6px rgba(59,130,246,0.8));">
      <img
        src="${markerIcon}"
        width="25"
        height="41"
        style="display:block;"
      />
    </div>
  `,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
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
  const routingControlRef = useRef<any>(null);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const routerLocation = useLocation();
  const selectedFromRoute: Listing | undefined = routerLocation.state?.listing;

  // ── Fetch user location once ──────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => console.warn("Location access denied:", error)
    );
  }, []);

  // ── Initialize map once ───────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        zoomControl: false,
      }).setView([15.145, 120.589], 13);

      mapInstanceRef.current = map;

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // ── Inject CSS to permanently hide routing container ──────────────
      const style = document.createElement('style');
      style.id = 'lrm-hide';
      style.textContent = `.leaflet-routing-container { display: none !important; }`;
      document.head.appendChild(style);
    }

    return () => {
      document.getElementById('lrm-hide')?.remove();
      if (routingControlRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      markersRef.current.clear();
      userMarkerRef.current = null;
    };
  }, []);

  // ── User location marker ──────────────────────────────────────────────────
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

    if (!selectedListing && !selectedFromRoute) {
      map.flyTo([userLocation.lat, userLocation.lng], 14, {
        animate: true,
        duration: 1,
      });
    }
  }, [userLocation]);

  // ── Render all listing markers ────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || listings.length === 0) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    listings.forEach((listing) => {
      const { lat, lng } = listing.coordinates;

      const isSelected = selectedListing?.id === listing.id;
      const icon = isSelected ? selectedMarkerIcon : defaultMarkerIcon;

      const marker = L.marker([lat, lng], { icon }).addTo(map);

      marker.on("click", () => {
        onSelect(listing);
      });

      markersRef.current.set(listing.id, marker);
    });
  }, [listings]);

  // ── Swap marker icons when selected listing changes ───────────────────────
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      marker.setIcon(
        selectedListing?.id === id ? selectedMarkerIcon : defaultMarkerIcon
      );
    });
  }, [selectedListing]);

  // ── Pan & zoom to selected listing ───────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedListing) return;

    const { lat, lng } = selectedListing.coordinates;
    map.flyTo([lat, lng], 16, { animate: true, duration: 0.8 });
  }, [selectedListing]);

  // ── Routing to listing that came in via route state ───────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation || !selectedFromRoute) return;

    const { lat, lng } = selectedFromRoute.coordinates;

    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    map.flyTo([lat, lng], 15, { animate: true, duration: 1 });

    const routing = (L as any).Routing.control({
      waypoints: [
        L.latLng(userLocation.lat, userLocation.lng),
        L.latLng(lat, lng),
      ],
      routeWhileDragging: false,
      lineOptions: {
        styles: [{ color: "#3B82F6", weight: 5 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0,
      },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      createMarker: () => null,
    }).addTo(map);

    routingControlRef.current = routing;

    return () => {
      if (routingControlRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
    };
  }, [userLocation, selectedFromRoute]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
};

export default MapView;