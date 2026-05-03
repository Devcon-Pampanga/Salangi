import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import { Listing } from "../features/Data/Listings";

// Leaflet default icon fix for React/Webpack environments
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// ─── ORS API Key ──────────────────────────────────────────────────────────────

const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImRjNGVmODljMTk1NDQxYjA4YjRiZjJiOTg1OTEzOWYyIiwiaCI6Im11cm11cjY0In0=";
const ORS_BASE_URL = "https://api.heigit.org/v2/directions/driving-car";

// ─── Icons ────────────────────────────────────────────────────────────────────

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
      <img src="${markerIcon}" width="25" height="41" style="display:block;" />
    </div>
  `,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isValidCoord = (coord: any): coord is number =>
  typeof coord === "number" && !isNaN(coord) && isFinite(coord);

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

function haversineDistance(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const aVal =
    sinDLat * sinDLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng;
  return R * 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
}

function findClosestPointIndex(
  pos: { lat: number; lng: number },
  coords: L.LatLng[]
): number {
  let minDist = Infinity;
  let minIdx = 0;
  for (let i = 0; i < coords.length; i++) {
    const dist = haversineDistance(pos, { lat: coords[i].lat, lng: coords[i].lng });
    if (dist < minDist) {
      minDist = dist;
      minIdx = i;
    }
  }
  return minIdx;
}

function computeRemainingDistance(coords: L.LatLng[], startIndex: number): number {
  let total = 0;
  for (let i = startIndex; i < coords.length - 1; i++) {
    total += haversineDistance(
      { lat: coords[i].lat, lng: coords[i].lng },
      { lat: coords[i + 1].lat, lng: coords[i + 1].lng }
    );
  }
  return total;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatETA(seconds: number): string {
  const totalMins = Math.round(seconds / 60);
  if (totalMins < 60) return `${totalMins} min${totalMins !== 1 ? "s" : ""} away`;
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return mins > 0 ? `${hrs} hr ${mins} min${mins !== 1 ? "s" : ""}` : `${hrs} hr`;
}

// ─── ORS Route Fetcher ────────────────────────────────────────────────────────

async function fetchORSRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): Promise<{ coords: L.LatLng[]; totalDistance: number; totalDuration: number } | null> {
  try {
    const url = `${ORS_BASE_URL}?api_key=${ORS_API_KEY}&start=${from.lng},${from.lat}&end=${to.lng},${to.lat}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json, application/geo+json" },
    });
    if (!res.ok) {
      console.warn("ORS routing failed:", res.status, await res.text());
      return null;
    }
    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature) return null;

    const coords: L.LatLng[] = feature.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => L.latLng(lat, lng)
    );
    const summary = feature.properties.summary;
    return {
      coords,
      totalDistance: summary.distance,
      totalDuration: summary.duration,
    };
  } catch (err) {
    console.warn("ORS fetch error:", err);
    return null;
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEVIATION_THRESHOLD = 25;
const POSITION_THROTTLE_MS = 1500;

// ─── HUD Styles ───────────────────────────────────────────────────────────────

const HUD_STYLES = `
  .mapview-hud {
    position: absolute;
    bottom: max(24px, env(safe-area-inset-bottom, 24px));
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    display: flex;
    align-items: stretch;
    background: rgba(15, 23, 42, 0.92);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.07);
    overflow: hidden;
    font-family: 'SF Pro Display', 'Segoe UI', sans-serif;
    width: calc(100% - 32px);
    max-width: 360px;
  }
  .mapview-hud__block {
    padding: 14px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    flex: 1;
    min-width: 0;
  }
  .mapview-hud__block--left {
    border-right: 1px solid rgba(255,255,255,0.08);
  }
  .mapview-hud__label {
    font-size: clamp(9px, 2.5vw, 11px);
    font-weight: 600;
    letter-spacing: 0.08em;
    color: #64748B;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .mapview-hud__value {
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
  .mapview-hud__value--eta {
    font-size: clamp(13px, 3.5vw, 15px);
    color: #FFE2A0;
  }
  .mapview-hud__value--distance {
    font-size: clamp(13px, 3.5vw, 15px);
    color: #F1F5F9;
  }
  .mapview-hud__divider {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #334155;
    align-self: center;
    flex-shrink: 0;
    margin: 0 2px;
  }
  .leaflet-control-attribution {
    font-size: 10px !important;
    max-width: calc(100vw - 16px) !important;
  }
  .leaflet-top.leaflet-left {
    top: max(10px, env(safe-area-inset-top, 10px));
    left: max(10px, env(safe-area-inset-left, 10px));
  }
  .leaflet-top.leaflet-right {
    top: max(10px, env(safe-area-inset-top, 10px));
    right: max(10px, env(safe-area-inset-right, 10px));
  }
`;

export interface NavInfo {
  distanceRemaining: string;
  eta: string;
}

interface MapViewProps {
  listings?: Listing[];
  selectedListing?: Listing | null;
  onSelect?: (listing: Listing) => void;
  onNavInfo?: (info: NavInfo | null) => void;
}

const MapView = ({
  listings = [],
  selectedListing = null,
  onSelect = () => {},
  onNavInfo,
}: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);

  const remainingPolylineRef = useRef<L.Polyline | null>(null);
  const completedPolylineRef = useRef<L.Polyline | null>(null);

  const routeCoordsRef = useRef<L.LatLng[]>([]);
  const totalRouteDurationRef = useRef<number>(0);
  const totalRouteDistanceRef = useRef<number>(0);

  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const isNavigatingRef = useRef<boolean>(false);
  const isBuildingRouteRef = useRef<boolean>(false);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [navInfo, setNavInfo] = useState<NavInfo | null>(null);

  const routerLocation = useLocation();
  const selectedFromRoute: Listing | undefined = routerLocation.state?.listing;

  useEffect(() => {
    onNavInfo?.(navInfo);
  }, [navInfo, onNavInfo]);

  // ── Inject HUD styles ──────────────────────────────────────────────────────
  useEffect(() => {
    const id = "mapview-hud-styles";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = HUD_STYLES;
      document.head.appendChild(style);
    }
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  // ── Map Init ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current, { zoomControl: false }).setView([15.145, 120.589], 13);
      mapInstanceRef.current = map;

      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const resizeObserver = new ResizeObserver(() => { map.invalidateSize(); });
      resizeObserver.observe(mapRef.current!);

      return () => {
        resizeObserver.disconnect();
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        remainingPolylineRef.current?.remove();
        completedPolylineRef.current?.remove();
        mapInstanceRef.current?.remove();
        mapInstanceRef.current = null;
      };
    }
  }, []);

  // ── Update Route Progress ──────────────────────────────────────────────────
  const updateRouteProgress = useCallback(
    (pos: { lat: number; lng: number }, currentSpeed: number | null) => {
      const map = mapInstanceRef.current;
      const coords = routeCoordsRef.current;
      if (!map || coords.length === 0) return;

      const closestIdx = findClosestPointIndex(pos, coords);

      const completedCoords = coords.slice(0, closestIdx + 1);
      if (completedPolylineRef.current) {
        completedPolylineRef.current.setLatLngs(completedCoords);
      } else {
        completedPolylineRef.current = L.polyline(completedCoords, {
          color: "#9CA3AF", weight: 4, opacity: 0.6, dashArray: "6 6",
        }).addTo(map);
      }

      const remainingCoords = coords.slice(closestIdx);
      if (remainingPolylineRef.current) {
        remainingPolylineRef.current.setLatLngs(remainingCoords);
      } else {
        remainingPolylineRef.current = L.polyline(remainingCoords, {
          color: "#3B82F6", weight: 5, opacity: 0.9,
        }).addTo(map);
      }

      const remainingMeters = computeRemainingDistance(coords, closestIdx);
      let remainingSeconds = 0;
      if (currentSpeed && currentSpeed > 0.5) {
        remainingSeconds = remainingMeters / currentSpeed;
      } else {
        const avgSpeed = (totalRouteDistanceRef.current > 0 && totalRouteDurationRef.current > 0)
          ? totalRouteDistanceRef.current / totalRouteDurationRef.current : 1;
        remainingSeconds = remainingMeters / avgSpeed;
      }

      setNavInfo({
        distanceRemaining: formatDistance(remainingMeters),
        eta: formatETA(remainingSeconds),
      });
    },
    []
  );

  // ── Build Route via ORS ────────────────────────────────────────────────────
  const buildRoute = useCallback(
    async (from: { lat: number; lng: number }, to: { lat: number; lng: number }) => {
      const map = mapInstanceRef.current;
      if (!map || isBuildingRouteRef.current) return;

      isBuildingRouteRef.current = true;

      remainingPolylineRef.current?.remove();
      completedPolylineRef.current?.remove();
      remainingPolylineRef.current = null;
      completedPolylineRef.current = null;
      routeCoordsRef.current = [];

      const result = await fetchORSRoute(from, to);
      isBuildingRouteRef.current = false;

      if (!result) return;

      routeCoordsRef.current = result.coords;
      totalRouteDurationRef.current = result.totalDuration;
      totalRouteDistanceRef.current = result.totalDistance;

      remainingPolylineRef.current = L.polyline(result.coords, {
        color: "#3B82F6", weight: 5, opacity: 0.9,
      }).addTo(map);

      setNavInfo({
        distanceRemaining: formatDistance(result.totalDistance),
        eta: formatETA(result.totalDuration),
      });

      isNavigatingRef.current = true;
    },
    []
  );

  // ── GPS Tracking ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) return;

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        if (now - lastUpdateRef.current < POSITION_THROTTLE_MS) return;
        lastUpdateRef.current = now;

        const coords = validateLatLng(position.coords.latitude, position.coords.longitude);
        if (!coords) return;

        const currentPos = { lat: coords[0], lng: coords[1] };
        setUserLocation(currentPos);

        const map = mapInstanceRef.current;
        if (!map) return;

        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng(currentPos);
        } else {
          userMarkerRef.current = L.marker(currentPos, {
            icon: userLocationIcon, zIndexOffset: 1000,
          })
            .addTo(map)
            .bindPopup('<div style="text-align:center"><strong>📍 You are here</strong></div>');
        }

        const activeTarget = selectedListing || selectedFromRoute;

        if (isNavigatingRef.current && routeCoordsRef.current.length > 0) {
          updateRouteProgress(currentPos, position.coords.speed);

          const closestIdx = findClosestPointIndex(currentPos, routeCoordsRef.current);
          const distToRoute = haversineDistance(currentPos, {
            lat: routeCoordsRef.current[closestIdx].lat,
            lng: routeCoordsRef.current[closestIdx].lng,
          });

          if (distToRoute > DEVIATION_THRESHOLD && activeTarget) {
            buildRoute(currentPos, activeTarget.coordinates);
          }
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) return;
        console.warn("Location watch error:", error.message);
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );

    watchIdRef.current = id;
    return () => {
      navigator.geolocation.clearWatch(id);
      watchIdRef.current = null;
    };
  }, [selectedListing, selectedFromRoute, buildRoute, updateRouteProgress]);

  // ── Initial Pan ────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const map = mapInstanceRef.current;
      if (!map || !userLocation || !isMapVisible(map)) return;
      if (!selectedListing && !selectedFromRoute) {
        map.flyTo([userLocation.lat, userLocation.lng], 14, { animate: true, duration: 1 });
      }
    } catch (e) { console.error(e); }
  }, [userLocation, selectedListing, selectedFromRoute]);

  // ── Markers ────────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const map = mapInstanceRef.current;
      if (!map || listings.length === 0) return;

      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();

      listings.forEach((listing) => {
        const coords = validateLatLng(listing.coordinates.lat, listing.coordinates.lng);
        if (!coords) return;

        const isSelected = selectedListing?.id === listing.id;
        const marker = L.marker(coords, {
          icon: isSelected ? selectedMarkerIcon : defaultMarkerIcon,
        }).addTo(map);
        marker.on("click", () => onSelect(listing));
        markersRef.current.set(listing.id, marker);
      });
    } catch (e) { console.error(e); }
  }, [listings]);

  // ── Marker Icon Swap ───────────────────────────────────────────────────────
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      marker.setIcon(selectedListing?.id === id ? selectedMarkerIcon : defaultMarkerIcon);
    });
  }, [selectedListing]);

  // ── Fly To Selected ────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const map = mapInstanceRef.current;
      if (!map || !selectedListing || !isMapVisible(map)) return;
      const coords = validateLatLng(selectedListing.coordinates.lat, selectedListing.coordinates.lng);
      if (coords) map.flyTo(coords, 16, { animate: true, duration: 0.8 });
    } catch (e) { console.error(e); }
  }, [selectedListing]);

  // ── Routing Trigger ────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    const target = selectedListing || selectedFromRoute;
    if (!map || !target || !userLocation) return;

    const dest = target.coordinates;
    const destCoords = validateLatLng(dest.lat, dest.lng);
    if (!destCoords) return;

    if (isMapVisible(map)) {
      map.flyTo(destCoords, 15, { animate: true, duration: 1 });
      markersRef.current.get(target.id)?.openPopup();
    }

    buildRoute(userLocation, { lat: destCoords[0], lng: destCoords[1] });

    return () => {
      remainingPolylineRef.current?.remove();
      completedPolylineRef.current?.remove();
      remainingPolylineRef.current = null;
      completedPolylineRef.current = null;
      isNavigatingRef.current = false;
      setNavInfo(null);
    };
  }, [userLocation, selectedListing, selectedFromRoute, buildRoute]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overscrollBehavior: "none" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%", WebkitTouchCallout: "none" }} />
      {navInfo && (
        <div className="mapview-hud">
          <div className="mapview-hud__block mapview-hud__block--left">
            <span className="mapview-hud__label">ETA</span>
            <span className="mapview-hud__value mapview-hud__value--eta">{navInfo.eta}</span>
          </div>
          <div className="mapview-hud__divider" />
          <div className="mapview-hud__block">
            <span className="mapview-hud__label">Distance</span>
            <span className="mapview-hud__value mapview-hud__value--distance">{navInfo.distanceRemaining}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;