import { CensusDataService } from './census-service.js';
import { EPADataService } from './epa-service.js';
import { OSMDataService } from './osm-service.js';
import { MapboxDataService } from './mapbox-service.js';
import { HUDDataService } from './hud-service.js';

export interface UrbanDataQuery {
  city: string;
  region?: string;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface UrbanData {
  location: {
    city: string;
    region?: string;
    bounds: any;
    center: [number, number];
  };
  demographics: any;
  traffic: any;
  buildings: any;
  emissions: any;
  housing: any;
  landUse: any;
}

export async function getUrbanData(query: UrbanDataQuery): Promise<UrbanData> {
  console.log(`Fetching urban data for ${query.city}...`);

  // Geocode city to get bounds
  const mapboxService = new MapboxDataService();
  const geocoded = await mapboxService.geocode(query.city);
  
  const bounds = query.bounds || geocoded.bounds;
  const center = geocoded.center;

  // Fetch data from all sources in parallel
  const [demographics, traffic, buildings, emissions, housing, landUse] = await Promise.all([
    new CensusDataService().getDemographics(center),
    mapboxService.getTrafficData(bounds),
    new OSMDataService().getBuildings(bounds),
    new EPADataService().getAirQuality(center),
    new HUDDataService().getHousingData(center),
    new OSMDataService().getLandUse(bounds),
  ]);

  return {
    location: {
      city: query.city,
      region: query.region,
      bounds,
      center,
    },
    demographics,
    traffic,
    buildings,
    emissions,
    housing,
    landUse,
  };
}


