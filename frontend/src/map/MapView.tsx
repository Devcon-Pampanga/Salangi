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

// ─── Icons ────────────────────────────────────────────────────────────────────

// Custom blue dot to represent the user's live location
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

// ─── Helpers (Math & Formatting) ──────────────────────────────────────────────

/**
 * Haversine formula: calculates the straight-line distance (in meters) between 
 * two coordinates on the Earth's surface, accounting for the planet's curvature.
 */
function haversineDistance(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371000; // Earth's radius in meters
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

/**
 * Finds which point on the drawn route polyline the user is currently closest to.
 * This helps us determine how much of the route is completed.
 */
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

/**
 * Adds up the distance of all remaining route segments from the user's current 
 * closest point to the final destination.
 */
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

// Formats meters into human-readable text (e.g., "800 m" or "1.2 km")
function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

// Formats seconds into human-readable ETA (e.g., "15 mins" or "1 hr 5 mins")
function formatETA(seconds: number): string {
  const totalMins = Math.round(seconds / 60);
  if (totalMins < 60) return `${totalMins} min${totalMins !== 1 ? "s" : ""} away`;
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return mins > 0 ? `${hrs} hr ${mins} min${mins !== 1 ? "s" : ""}` : `${hrs} hr`;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEVIATION_THRESHOLD = 25; // If user strays >25m off the path, recalculate route
const POSITION_THROTTLE_MS = 1500; // Ignore rapid GPS updates faster than 1.5s to save CPU

// ─── Props & Interfaces ───────────────────────────────────────────────────────

interface MapViewProps {
  listings?: Listing[];
  selectedListing?: Listing | null;
  onSelect?: (listing: Listing) => void;
}

// ─── Responsive HUD styles injected once ──────────────────────────────────────

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

    /* Fluid width: fills most of the screen on mobile, caps on desktop */
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
    min-width: 0; /* prevent flex overflow */
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

  /* Ensure Leaflet attribution doesn't get clipped on mobile */
  .leaflet-control-attribution {
    font-size: 10px !important;
    max-width: calc(100vw - 16px) !important;
  }

  /* Give zoom controls breathing room from notch/status bar */
  .leaflet-top.leaflet-left {
    top: max(10px, env(safe-area-inset-top, 10px));
    left: max(10px, env(safe-area-inset-left, 10px));
  }

  .leaflet-top.leaflet-right {
    top: max(10px, env(safe-area-inset-top, 10px));
    right: max(10px, env(safe-area-inset-right, 10px));
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────

const MapView = ({
  listings = [],
  selectedListing = null,
  onSelect = () => {},
}: MapViewProps) => {
  // Map and control references
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routingControlRef = useRef<any>(null);

  // We use two custom polylines (gray dashed for past, blue for future) 
  // instead of Leaflet Routing Machine's default solid line.
  const remainingPolylineRef = useRef<L.Polyline | null>(null);
  const completedPolylineRef = useRef<L.Polyline | null>(null);

  // Route calculation data storage
  const routeCoordsRef = useRef<L.LatLng[]>([]);
  const totalRouteDurationRef = useRef<number>(0);
  const totalRouteDistanceRef = useRef<number>(0);

  // GPS Tracking references
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const isNavigatingRef = useRef<boolean>(false);

  // State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [navInfo, setNavInfo] = useState<{ distanceRemaining: string; eta: string } | null>(null);

  const routerLocation = useLocation();
  const selectedFromRoute: Listing | undefined = routerLocation.state?.listing;

  // ── Inject HUD styles once ─────────────────────────────────────────────────
  useEffect(() => {
    const id = "mapview-hud-styles";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = HUD_STYLES;
      document.head.appendChild(style);
    }
    return () => {
      document.getElementById(id)?.remove();
    };
  }, []);

  // ── 1. Map Initialization ──────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // Default center fallback (Angeles City)
      const map = L.map(mapRef.current, {
      }).setView([15.145, 120.589], 13);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);
    }

    // Cleanup on unmount
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (routingControlRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeControl(routingControlRef.current);
      }
      remainingPolylineRef.current?.remove();
      completedPolylineRef.current?.remove();
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // ── 2. Update Route Progress & ETA (HUD) ──────────────────────────────────
  const updateRouteProgress = useCallback(
    (pos: { lat: number; lng: number }, currentSpeed: number | null) => {
      const map = mapInstanceRef.current;
      const coords = routeCoordsRef.current;
      if (!map || coords.length === 0) return;

      // Find exactly where the user is along the drawn route
      const closestIdx = findClosestPointIndex(pos, coords);

      // --- Draw Completed Path (Gray, Dashed) ---
      const completedCoords = coords.slice(0, closestIdx + 1);
      if (completedPolylineRef.current) {
        completedPolylineRef.current.setLatLngs(completedCoords);
      } else {
        completedPolylineRef.current = L.polyline(completedCoords, {
          color: "#9CA3AF",
          weight: 4,
          opacity: 0.6,
          dashArray: "6 6",
        }).addTo(map);
      }

      // --- Draw Remaining Path (Blue, Solid) ---
      const remainingCoords = coords.slice(closestIdx);
      if (remainingPolylineRef.current) {
        remainingPolylineRef.current.setLatLngs(remainingCoords);
      } else {
        remainingPolylineRef.current = L.polyline(remainingCoords, {
          color: "#3B82F6",
          weight: 5,
          opacity: 0.9,
        }).addTo(map);
      }

      // --- Calculate dynamic ETA ---
      const remainingMeters = computeRemainingDistance(coords, closestIdx);
      let remainingSeconds = 0;
      
      // If we have a reliable live speed from GPS (> 0.5 m/s), use it for real-world accuracy
      if (currentSpeed && currentSpeed > 0.5) {
        remainingSeconds = remainingMeters / currentSpeed;
      } else {
        // Fallback: If they are stopped or speed is unavailable, use the route's predicted average speed
        const avgSpeed = 
          (totalRouteDistanceRef.current > 0 && totalRouteDurationRef.current > 0)
            ? totalRouteDistanceRef.current / totalRouteDurationRef.current
            : 1; // Default to 1m/s to avoid dividing by zero
        remainingSeconds = remainingMeters / avgSpeed;
      }

      setNavInfo({
        distanceRemaining: formatDistance(remainingMeters),
        eta: formatETA(remainingSeconds),
      });
    },
    []
  );

  // ── 3. Build Route with "Shortest Path" Logic ─────────────────────────────
  const buildRoute = useCallback(
    (from: { lat: number; lng: number }, to: { lat: number; lng: number }) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // Clear previous routes
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
      remainingPolylineRef.current?.remove();
      completedPolylineRef.current?.remove();
      routeCoordsRef.current = [];

      const routing = (L as any).Routing.control({
        waypoints: [L.latLng(from.lat, from.lng), L.latLng(to.lat, to.lng)],
        
        // CRITICAL FIX: Change profile to 'bike'. 
        // The default 'car' profile heavily favors major highways and will route 
        // you out of town just to use a fast road. 'bike' forces the OSRM engine 
        // to prioritize the physical shortest distance (local streets/barangay roads).
        router: (L as any).Routing.osrmv1({
          serviceUrl: "https://router.project-osrm.org/route/v1",
          profile: "bike", 
        }),
        
        routeWhileDragging: false,
        lineOptions: {
          styles: [{ color: "transparent", weight: 0 }], // Hide default line so we can draw our own
          extendToWaypoints: false,
          missingRouteTolerance: 0,
        },
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: false,
        show: false, // Hides the step-by-step instruction panel
        createMarker: () => null,
      }).addTo(map);

      routing.on("routesfound", (e: any) => {
        const route = e.routes[0];
        if (!route) return;

        // Save standard route data
        routeCoordsRef.current = route.coordinates as L.LatLng[];
        totalRouteDurationRef.current = route.summary.totalTime; 
        totalRouteDistanceRef.current = route.summary.totalDistance;

        // Force hide the routing instruction container
        const container = routing.getContainer?.();
        if (container) {
          Object.assign(container.style, {
            display: "none", visibility: "hidden", pointerEvents: "none",
          });
        }

        // Draw initial blue line for the whole route
        remainingPolylineRef.current?.remove();
        remainingPolylineRef.current = L.polyline(routeCoordsRef.current, {
          color: "#3B82F6", weight: 5, opacity: 0.9,
        }).addTo(map);

        setNavInfo({
          distanceRemaining: formatDistance(totalRouteDistanceRef.current),
          eta: formatETA(totalRouteDurationRef.current),
        });

        isNavigatingRef.current = true;
      });

      routingControlRef.current = routing;
    },
    []
  );

  // ── 4. Live GPS Tracking (watchPosition) ──────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) return;

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        // Throttle updates to prevent map jitter and high CPU usage
        if (now - lastUpdateRef.current < POSITION_THROTTLE_MS) return;
        lastUpdateRef.current = now;

        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        
        // Extract live device speed in meters per second (can be null if stopped)
        const liveSpeed = position.coords.speed; 

        setUserLocation(coords);

        const map = mapInstanceRef.current;
        if (!map) return;

        // Move the user's blue dot
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([coords.lat, coords.lng]);
        } else {
          userMarkerRef.current = L.marker([coords.lat, coords.lng], {
            icon: userLocationIcon, zIndexOffset: 1000,
          })
            .addTo(map)
            .bindPopup('<div style="text-align:center"><strong>📍 You are here</strong></div>');
        }

        // If navigating, update the path lines and HUD
        const routeCoords = routeCoordsRef.current;
        if (isNavigatingRef.current && routeCoords.length > 0) {
          
          // Pass the liveSpeed we extracted earlier
          updateRouteProgress(coords, liveSpeed);

          // Reroute Logic: Check if the user drove off the designated path
          const closestIdx = findClosestPointIndex(coords, routeCoords);
          const distanceFromRoute = haversineDistance(coords, {
            lat: routeCoords[closestIdx].lat,
            lng: routeCoords[closestIdx].lng,
          });

          // Trigger a silent rebuild if they deviate past the threshold (e.g. 25m)
          if (distanceFromRoute > DEVIATION_THRESHOLD && selectedFromRoute) {
            const dest = selectedFromRoute.coordinates;
            buildRoute(coords, { lat: dest.lat, lng: dest.lng });
          }
        }
      },
      (error) => console.warn("Location watch error:", error),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );

    watchIdRef.current = id;

    return () => {
      navigator.geolocation.clearWatch(id);
      watchIdRef.current = null;
    };
  }, [selectedFromRoute, buildRoute, updateRouteProgress]);

  // ── 5. Pan to User ────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation) return;

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: userLocationIcon, zIndexOffset: 1000,
      }).addTo(map);
    }

    if (!selectedListing && !selectedFromRoute) {
      map.flyTo([userLocation.lat, userLocation.lng], 14, { animate: true, duration: 1 });
    }
  }, [userLocation, selectedListing, selectedFromRoute]);

  // ── 6. Render Map Markers for Listings ────────────────────────────────────
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

      marker.on("click", () => onSelect(listing));
      markersRef.current.set(listing.id, marker);
    });
  }, [listings]);

  // ── 7. Fly to Selected Listing ────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedListing) return;

    const { lat, lng } = selectedListing.coordinates;
    const marker = markersRef.current.get(selectedListing.id);

    map.flyTo([lat, lng], 16, { animate: true, duration: 1 });
    marker?.openPopup();
  }, [selectedListing]);

  // ── 8. Trigger Route from Router State ────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !userLocation || !selectedFromRoute) return;

    const dest = selectedFromRoute.coordinates;
    map.flyTo([dest.lat, dest.lng], 15, { animate: true, duration: 1 });
    markersRef.current.get(selectedFromRoute.id)?.openPopup();

    buildRoute(userLocation, { lat: dest.lat, lng: dest.lng });

    return () => {
      if (routingControlRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeControl(routingControlRef.current);
      }
      remainingPolylineRef.current?.remove();
      completedPolylineRef.current?.remove();
      isNavigatingRef.current = false;
      setNavInfo(null);
    };
  }, [userLocation, selectedFromRoute, buildRoute]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100dvh",
        overscrollBehavior: "none",
      }}
    >
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "100%",
          // Prevent the default touch callout on long-press (iOS)
          WebkitTouchCallout: "none",
        }}
      />

      {/* Navigation HUD */}
      {navInfo && (
        <div className="mapview-hud">
          {/* ETA Block */}
          <div className="mapview-hud__block mapview-hud__block--left">
            <span className="mapview-hud__label">ETA</span>
            <span className="mapview-hud__value mapview-hud__value--eta">
              {navInfo.eta}
            </span>
          </div>

          {/* Divider Dot */}
          <div className="mapview-hud__divider" />

          {/* Distance Block */}
          <div className="mapview-hud__block">
            <span className="mapview-hud__label">Distance</span>
            <span className="mapview-hud__value mapview-hud__value--distance">
              {navInfo.distanceRemaining}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;