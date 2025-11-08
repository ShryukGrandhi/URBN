import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface DynamicSimulationMapProps {
  city: string;
  simulationData: any;
  messages: any[];
  simulationId: string | null;
}

export function DynamicSimulationMap({ city, simulationData, messages, simulationId }: DynamicSimulationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [constructionMarkers, setConstructionMarkers] = useState<mapboxgl.Marker[]>([]);
  const [publicSentiment, setPublicSentiment] = useState<any[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/standard',
      center: [-122.4194, 37.7749],
      zoom: 15,
      pitch: 70,
      bearing: -17,
      antialias: true,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      constructionMarkers.forEach(m => m.remove());
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Geocode and fly to city
  useEffect(() => {
    if (!map.current || !city || !mapLoaded) return;

    fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(city)}.json?access_token=${MAPBOX_TOKEN}&limit=1`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          map.current?.flyTo({
            center: [lng, lat],
            zoom: 15,
            pitch: 70,
            bearing: -17.6,
            duration: 2000,
          });
        }
      })
      .catch(console.error);
  }, [city, mapLoaded]);

  // DYNAMIC SIMULATION EFFECTS
  useEffect(() => {
    if (!map.current || !mapLoaded || !simulationData?.metrics) return;

    const center = map.current.getCenter();

    // Remove old markers
    constructionMarkers.forEach(m => m.remove());
    setConstructionMarkers([]);

    // Parse policy actions from messages
    const policyActions = messages
      .filter(m => m.channel === `simulation:${simulationId}`)
      .filter(m => m.data.message?.includes('Action') || m.data.message?.includes('policy'))
      .map(m => m.data.message);

    // 1. ADD NEW BUILDING CONSTRUCTION SITES
    if (simulationData.metrics.changes?.housingAffordability?.percentage > 0) {
      const numNewBuildings = Math.floor(Math.abs(simulationData.metrics.changes.housingAffordability.percentage) / 2);
      const newMarkers: mapboxgl.Marker[] = [];

      for (let i = 0; i < Math.min(numNewBuildings, 10); i++) {
        // Random position near city center
        const offsetLng = (Math.random() - 0.5) * 0.02;
        const offsetLat = (Math.random() - 0.5) * 0.02;

        const el = document.createElement('div');
        el.innerHTML = `
          <div class="relative group cursor-pointer">
            <div class="absolute -inset-2 bg-green-500 rounded-full blur-xl opacity-60 animate-pulse"></div>
            <div class="relative w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-2xl text-2xl animate-bounce">
              🏗️
            </div>
          </div>
        `;

        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
          <div class="p-3 bg-black/90 rounded-lg border border-green-500/50">
            <h4 class="font-bold text-green-400 mb-1">New Housing Development</h4>
            <p class="text-white/80 text-sm">Affordable housing complex</p>
            <p class="text-green-300 text-xs mt-1">📊 +${Math.floor(Math.random() * 200 + 50)} units</p>
          </div>
        `);

        const marker = new mapboxgl.Marker(el)
          .setLngLat([center.lng + offsetLng, center.lat + offsetLat])
          .setPopup(popup)
          .addTo(map.current!);

        newMarkers.push(marker);

        // Show popup briefly then hide
        setTimeout(() => marker.togglePopup(), 500 + i * 200);
        setTimeout(() => marker.togglePopup(), 3000 + i * 200);
      }

      setConstructionMarkers(newMarkers);
    }

    // 2. SHOW DEMOLITION SITES (if housing decreased)
    if (simulationData.metrics.changes?.housingAffordability?.percentage < -5) {
      const numDemolitions = Math.floor(Math.abs(simulationData.metrics.changes.housingAffordability.percentage) / 5);
      const newMarkers: mapboxgl.Marker[] = [];

      for (let i = 0; i < Math.min(numDemolitions, 5); i++) {
        const offsetLng = (Math.random() - 0.5) * 0.02;
        const offsetLat = (Math.random() - 0.5) * 0.02;

        const el = document.createElement('div');
        el.innerHTML = `
          <div class="relative">
            <div class="absolute -inset-2 bg-red-500 rounded-full blur-xl opacity-60 animate-pulse"></div>
            <div class="relative w-12 h-12 bg-gradient-to-br from-red-400 to-orange-500 rounded-xl flex items-center justify-center shadow-2xl text-2xl">
              💥
            </div>
          </div>
        `;

        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
          <div class="p-3 bg-black/90 rounded-lg border border-red-500/50">
            <h4 class="font-bold text-red-400 mb-1">Demolition Zone</h4>
            <p class="text-white/80 text-sm">Old building removal</p>
          </div>
        `);

        const marker = new mapboxgl.Marker(el)
          .setLngLat([center.lng + offsetLng, center.lat + offsetLat])
          .setPopup(popup)
          .addTo(map.current!);

        newMarkers.push(marker);
      }

      setConstructionMarkers(prev => [...prev, ...newMarkers]);
    }

    // 3. ADD NEW ROAD CONSTRUCTION
    if (simulationData.metrics.changes?.trafficFlow?.percentage > 5) {
      // Add glowing new road overlay
      if (map.current.getSource('new-roads')) {
        map.current.removeLayer('new-roads-glow');
        map.current.removeLayer('new-roads');
        map.current.removeSource('new-roads');
      }

      map.current.addSource('new-roads', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: [
                  [center.lng - 0.01, center.lat - 0.01],
                  [center.lng + 0.01, center.lat + 0.01]
                ]
              },
              properties: { type: 'new' }
            }
          ]
        }
      });

      map.current.addLayer({
        id: 'new-roads-glow',
        type: 'line',
        source: 'new-roads',
        paint: {
          'line-width': 12,
          'line-color': '#3b82f6',
          'line-blur': 8,
          'line-opacity': 0.6
        }
      });

      map.current.addLayer({
        id: 'new-roads',
        type: 'line',
        source: 'new-roads',
        paint: {
          'line-width': 4,
          'line-color': '#60a5fa',
          'line-dasharray': [2, 2]
        }
      });
    }

    // 4. PUBLIC SENTIMENT MARKERS
    const sentiments = [
      { emoji: '😊', text: 'Love the new housing!', position: 'positive', color: 'green' },
      { emoji: '🤔', text: 'Traffic seems better', position: 'positive', color: 'blue' },
      { emoji: '👍', text: 'Air quality improved!', position: 'positive', color: 'green' },
      { emoji: '😐', text: 'Rent still high...', position: 'neutral', color: 'yellow' },
      { emoji: '🏡', text: 'Great for families!', position: 'positive', color: 'green' },
    ];

    if (simulationData.metrics.changes) {
      const markers: mapboxgl.Marker[] = [];

      sentiments.slice(0, 5).forEach((sentiment, i) => {
        const offsetLng = (Math.random() - 0.5) * 0.03;
        const offsetLat = (Math.random() - 0.5) * 0.03;

        const el = document.createElement('div');
        el.innerHTML = `
          <div class="relative group cursor-pointer">
            <div class="absolute -inset-1 bg-${sentiment.color}-500 rounded-full blur-lg opacity-40"></div>
            <div class="relative w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl text-xl border-2 border-${sentiment.color}-400 hover:scale-125 transition-transform">
              ${sentiment.emoji}
            </div>
          </div>
        `;

        const popup = new mapboxgl.Popup({ offset: 15, closeButton: false }).setHTML(`
          <div class="p-2 bg-black/95 rounded-lg border border-white/20">
            <p class="text-white text-sm">${sentiment.text}</p>
          </div>
        `);

        const marker = new mapboxgl.Marker(el)
          .setLngLat([center.lng + offsetLng, center.lat + offsetLat])
          .setPopup(popup)
          .addTo(map.current!);

        markers.push(marker);

        // Auto-show popup briefly
        setTimeout(() => marker.togglePopup(), 1000 + i * 500);
        setTimeout(() => marker.togglePopup(), 4000 + i * 500);
      });

      setConstructionMarkers(prev => [...prev, ...markers]);
    }

  }, [simulationData, mapLoaded, simulationId]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center h-full bg-red-900">
        <div className="text-center p-8 bg-white rounded-2xl">
          <h3 className="text-xl font-bold mb-2">Mapbox Token Required</h3>
          <p className="text-gray-600">Set VITE_MAPBOX_TOKEN in frontend/.env</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Simulation Legend */}
      {simulationData && (
        <div className="absolute bottom-8 left-8 z-10">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-75"></div>
            <div className="relative bg-black/90 backdrop-blur-2xl border border-white/20 rounded-2xl p-4">
              <h4 className="text-white font-bold mb-3 text-sm uppercase tracking-wide">Map Legend</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="text-xl">🏗️</div>
                  <span className="text-white/80">New Construction</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xl">💥</div>
                  <span className="text-white/80">Demolition</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xl">🛣️</div>
                  <span className="text-white/80">New Roads</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xl">😊</div>
                  <span className="text-white/80">Public Sentiment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white font-medium">Loading 3D map...</p>
          </div>
        </div>
      )}
    </div>
  );
}

