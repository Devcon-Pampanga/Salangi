// MapView.jsx — Simulated map component, ready for Google Maps / Leaflet swap-in
// Props: selectedListing (object | null)

// HOW TO UPGRADE TO REAL MAP:
//   1. npm install @react-google-maps/api   (or leaflet + react-leaflet)
//   2. Replace the <div> placeholder below with <GoogleMap> or <MapContainer>
//   3. Use selectedListing.coordinates to set center + place a <Marker>

import type { Listing } from '../Data/Listings';

// Asset imports — adjust path to match your project structure
import locBtnSelected from '../../assets/locBtnSelected.png';

interface MapViewProps {
  selectedListing: Listing | null;
}

function MapView({ selectedListing }: MapViewProps) {
  // Default center: Pampanga province
  const defaultCenter = { lat: 15.0791, lng: 120.6200 };
  const zoom: number = selectedListing ? 14 : 11;
  const center = selectedListing ? selectedListing.coordinates : defaultCenter;

  // Static map preview via OpenStreetMap — no API key required
  // Swap this URL out when integrating a real map SDK
  const staticMapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${center.lat},${center.lng}&zoom=${zoom}&size=740x620&markers=${center.lat},${center.lng},red`;

  return (
    <div className="w-full h-full relative overflow-hidden rounded-xl border border-zinc-800">
      {/* Static map image */}
      <img
        src={staticMapUrl}
        alt="Map"
        className="w-full h-full object-cover transition-all duration-500"
      />

      {/* Dark overlay for aesthetic consistency */}
      <div className="absolute inset-0 bg-[#1A1A1A]/30 pointer-events-none rounded-xl" />

      {/* Selected listing info overlay */}
      {selectedListing && (
        <div className="absolute bottom-4 left-4 right-4 bg-[#222222]/90 backdrop-blur-sm rounded-lg p-3 border border-zinc-700">
          <div className="flex items-center gap-2">
            <img src={locBtnSelected} width="12" alt="pin" />
            <p className="text-[#FFE2A0] text-xs font-semibold">{selectedListing.name}</p>
          </div>
          <p className="text-zinc-400 text-xs mt-1">{selectedListing.location}</p>
          <p className="text-zinc-500 text-[10px] mt-1">
            {selectedListing.coordinates.lat.toFixed(4)}°N,{' '}
            {selectedListing.coordinates.lng.toFixed(4)}°E
          </p>
        </div>
      )}

      {/* Empty state when nothing is selected */}
      {!selectedListing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="bg-[#222222]/80 backdrop-blur-sm rounded-xl p-4 text-center border border-zinc-700">
            <p className="text-[#FFE2A0] text-sm font-semibold">Explore Pampanga</p>
            <p className="text-zinc-400 text-xs mt-1">Click a card to pin its location</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapView;