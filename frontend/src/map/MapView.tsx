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

const isValidCoord = (coord: any): coord is number => 
  typeof coord === 'number' && !isNaN(coord) && isFinite(coord);

const validateLatLng = (lat: any, lng: any): [number, number] | null => {
  if (isValidCoord(lat) && isValidCoord(lng)) return [lat, lng];
  console.warn("Invalid coordinates detected:", { lat, lng });
  return null;
};

const isMapVisible = (map: L.Map | null) => {
  if (!map) return false;
  const container = map.getContainer();
  return !!(container.offsetWidth || container.offsetHeight || container.getClientRects().length);
};

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
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        if (isValidCoord(lat) && isValidCoord(lng)) {
          setUserLocation({ lat, lng });
        }
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

      // Handle visibility/resize changes
      const resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapRef.current);

      return () => {
        resizeObserver.disconnect();
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
    }
  }, []);

  // ── User location marker ──────────────────────────────────────────────────
  useEffect(() => {
    try {
      const map = mapInstanceRef.current;
      if (!map || !userLocation) return;
      
      const coords = validateLatLng(userLocation.lat, userLocation.lng);
      if (!coords) return;

      userMarkerRef.current?.remove();

      const marker = L.marker(coords, {
        icon: userLocationIcon,
        zIndexOffset: 1000,
      })
        .addTo(map)
        .bindPopup(`<div style="text-align:center"><strong>📍 You are here</strong></div>`);

      userMarkerRef.current = marker;

      if (!selectedListing && !selectedFromRoute && isMapVisible(map)) {
        map.flyTo(coords, 14, {
          animate: true,
          duration: 1,
        });
      }
    } catch (err) {
      console.error("Error in MapView user location effect:", err);
    }
  }, [userLocation, selectedListing, selectedFromRoute]);

  // ── Render all listing markers ────────────────────────────────────────────
  useEffect(() => {
    try {
      const map = mapInstanceRef.current;
      if (!map || listings.length === 0) return;

      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();

      listings.forEach((listing) => {
        const coords = validateLatLng(listing.coordinates.lat, listing.coordinates.lng);
        if (!coords) return;

        const isSelected = selectedListing?.id === listing.id;
        const icon = isSelected ? selectedMarkerIcon : defaultMarkerIcon;

        const marker = L.marker(coords, { icon }).addTo(map);

        marker.on("click", () => {
          onSelect(listing);
        });

        markersRef.current.set(listing.id, marker);
      });
    } catch (err) {
      console.error("Error in MapView listings effect:", err);
    }
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
    try {
      const map = mapInstanceRef.current;
      if (!map || !selectedListing) return;

      const coords = validateLatLng(selectedListing.coordinates.lat, selectedListing.coordinates.lng);
      if (coords && isMapVisible(map)) {
        map.flyTo(coords, 16, { animate: true, duration: 0.8 });
      }
    } catch (err) {
      console.error("Error in MapView selected listing effect:", err);
    }
  }, [selectedListing]);

  // ── Draw route whenever selectedListing or userLocation changes ───────────
  // Covers both: navigating from route state AND clicking a marker on the map
  useEffect(() => {
    const map = mapInstanceRef.current;

    // Resolve which listing to route to — marker click takes priority
    const target = selectedListing ?? selectedFromRoute ?? null;

    // Remove any existing route first
    if (routingControlRef.current && map) {
      map.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    // Need both user location and a target to draw a route
    if (!map || !userLocation || !target) return;

    try {
      const { lat, lng } = target.coordinates;
      const userCoords = validateLatLng(userLocation.lat, userLocation.lng);
      const targetCoords = validateLatLng(lat, lng);
      
      if (!userCoords || !targetCoords) return;

      const routing = (L as any).Routing.control({
        waypoints: [
          L.latLng(userCoords[0], userCoords[1]),
          L.latLng(targetCoords[0], targetCoords[1]),
        ],
        routeWhileDragging: false,
        lineOptions: {
          styles: [{ color: "#3B82F6", weight: 5 }],
          extendToWaypoints: true,
          missingRouteTolerance: 0,
        },
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: false,
        show: false,
        createMarker: () => null,
      }).addTo(map);

      routingControlRef.current = routing;
    } catch (err) {
      console.error("Error in MapView routing effect:", err);
    }

    return () => {
      if (routingControlRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
    };
  }, [userLocation, selectedListing, selectedFromRoute]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
};

export default MapView;