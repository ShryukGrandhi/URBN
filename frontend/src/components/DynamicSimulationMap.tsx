import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Activity } from 'lucide-react';
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
  const [is3D, setIs3D] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);

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

  // Toggle 3D/2D view
  const toggle3D = () => {
    if (!map.current) return;
    
    if (is3D) {
      // Switch to 2D
      map.current.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 1000
      });
    } else {
      // Switch to 3D
      map.current.easeTo({
        pitch: 70,
        bearing: -17,
        duration: 1000
      });
    }
    setIs3D(!is3D);
  };

  // STUNNING HEATMAP OVERLAYS - AI-DRIVEN IMPACT ZONES
  useEffect(() => {
    if (!map.current || !mapLoaded || !simulationData?.metrics || !showHeatmap) return;

    const center = map.current.getCenter();
    
    // Remove existing heatmap layers
    ['heatmap-outer', 'heatmap-middle', 'heatmap-inner', 'heatmap-core', 'policy-maker-zone'].forEach(id => {
      if (map.current?.getLayer(id)) {
        map.current?.removeLayer(id);
      }
    });

    if (map.current?.getSource('heatmap-source')) {
      map.current?.removeSource('heatmap-source');
    }

    // Create concentric heatmap zones based on policy impact
    const changes = simulationData.metrics.changes || {};
    const avgImpact = Object.values(changes).reduce((sum: number, c: any) => sum + Math.abs(c.percentage || 0), 0) / Object.keys(changes).length;

    // Determine colors based on overall impact
    const isPositive = Object.values(changes).filter((c: any) => (c.percentage || 0) > 0).length > Object.values(changes).length / 2;
    
    const colors = isPositive 
      ? ['#22c55e', '#84cc16', '#fbbf24', '#fb923c']  // Green to orange (positive)
      : ['#ef4444', '#f97316', '#fbbf24', '#84cc16']; // Red to yellow (negative)

    // Create multiple impact zones (like ripples)
    const zones = [
      { radius: 2000, opacity: 0.15, color: colors[0], label: 'Core Impact Zone' },
      { radius: 1500, opacity: 0.25, color: colors[1], label: 'Primary Zone' },
      { radius: 1000, opacity: 0.35, color: colors[2], label: 'Secondary Zone' },
      { radius: 500, opacity: 0.45, color: colors[3], label: 'Direct Impact' },
    ];

    map.current.addSource('heatmap-source', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: zones.map((zone, i) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [center.lng, center.lat]
          },
          properties: {
            radius: zone.radius,
            color: zone.color,
            opacity: zone.opacity,
            label: zone.label
          }
        }))
      }
    });

    // Add heatmap layers (outer to inner for proper stacking)
    zones.reverse().forEach((zone, i) => {
      map.current!.addLayer({
        id: `heatmap-${i}`,
        type: 'circle',
        source: 'heatmap-source',
        filter: ['==', ['get', 'radius'], zone.radius],
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, zone.radius / 20,
            16, zone.radius / 3,
            20, zone.radius
          ],
          'circle-color': zone.color,
          'circle-opacity': zone.opacity,
          'circle-blur': 1
        }
      });
    });

    // Add POLICY MAKER ATTRIBUTION ZONE (who made this policy)
    if (simulationData.policyMaker || simulationData.source) {
      const policyMaker = simulationData.policyMaker || 'City Council';
      
      const makerEl = document.createElement('div');
      makerEl.innerHTML = `
        <div class="relative group">
          <div class="absolute -inset-2 bg-purple-500 rounded-2xl blur-xl opacity-60 animate-pulse"></div>
          <div class="relative bg-black/90 backdrop-blur-xl border-2 border-purple-400/50 rounded-2xl px-6 py-3 shadow-2xl">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-xl">
                🏛️
              </div>
              <div>
                <p class="text-purple-300 text-xs font-bold uppercase tracking-wide">Policy by</p>
                <p class="text-white font-bold">${policyMaker}</p>
              </div>
            </div>
          </div>
        </div>
      `;

      const makerMarker = new mapboxgl.Marker(makerEl)
        .setLngLat([center.lng, center.lat + 0.01])
        .addTo(map.current!);

      setConstructionMarkers(prev => [...prev, makerMarker]);
    }

  }, [simulationData, mapLoaded, showHeatmap]);

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
      
      {/* 3D/2D Toggle Button - ALWAYS VISIBLE */}
      <div className="absolute top-8 right-8 z-20 space-y-4">
        <button
          onClick={toggle3D}
          className="group relative"
        >
          <div className={`absolute -inset-1 bg-gradient-to-r ${is3D ? 'from-blue-600 to-cyan-600' : 'from-purple-600 to-pink-600'} rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition`}></div>
          <div className="relative bg-black/90 backdrop-blur-3xl border-2 border-white/30 rounded-2xl px-6 py-4 flex items-center gap-3 hover:scale-105 transition-transform cursor-pointer shadow-2xl">
            <div className="text-3xl">{is3D ? '🏙️' : '🗺️'}</div>
            <div>
              <p className="text-white font-bold text-lg">{is3D ? '3D View' : '2D View'}</p>
              <p className="text-white/60 text-xs">Click to switch</p>
            </div>
          </div>
        </button>

        {/* Heatmap Toggle - Shows during simulation */}
        {simulationData && (
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className="group relative"
          >
            <div className={`absolute -inset-1 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition animate-pulse`}></div>
            <div className="relative bg-black/90 backdrop-blur-3xl border-2 border-white/30 rounded-2xl px-6 py-4 flex items-center gap-3 hover:scale-105 transition-transform cursor-pointer shadow-2xl">
              <div className="text-3xl">🔥</div>
              <div>
                <p className="text-white font-bold text-lg">Heatmap</p>
                <p className={`text-xs font-bold ${showHeatmap ? 'text-green-400' : 'text-red-400'}`}>
                  {showHeatmap ? '✅ ON' : '❌ OFF'}
                </p>
              </div>
            </div>
          </button>
        )}
      </div>
      
      {/* Simulation Legend */}
      {simulationData && (
        <div className="absolute bottom-8 left-8 z-10">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-75"></div>
            <div className="relative bg-black/90 backdrop-blur-2xl border border-white/20 rounded-2xl p-4">
              <h4 className="text-white font-bold mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-yellow-400 rounded-full animate-pulse"></div>
                Impact Zones
              </h4>
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
                {showHeatmap && (
                  <>
                    <div className="border-t border-white/20 my-2 pt-2">
                      <p className="text-white/60 font-bold mb-2">HEATMAP ZONES:</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500"></div>
                      <span className="text-white/80">Strong Impact</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-lime-500"></div>
                      <span className="text-white/80">Medium Impact</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                      <span className="text-white/80">Low Impact</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                      <span className="text-white/80">Minimal Effect</span>
                    </div>
                  </>
                )}
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

