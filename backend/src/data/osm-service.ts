import fetch from 'node-fetch';

export class OSMDataService {
  private overpassUrl = 'https://overpass-api.de/api/interpreter';

  async getBuildings(bounds: any) {
    const { south, west, north, east } = bounds;

    try {
      // Query OpenStreetMap via Overpass API
      const query = `
        [out:json][timeout:25];
        (
          way["building"](${south},${west},${north},${east});
          relation["building"](${south},${west},${north},${east});
        );
        out body;
        >;
        out skel qt;
      `;

      const response = await fetch(this.overpassUrl, {
        method: 'POST',
        body: query,
      });

      const data: any = await response.json();
      
      // Process buildings
      const buildings = data.elements
        .filter((el: any) => el.type === 'way' || el.type === 'relation')
        .map((el: any) => ({
          id: el.id,
          type: el.tags?.building || 'yes',
          height: el.tags?.height,
          levels: el.tags?.['building:levels'],
          name: el.tags?.name,
        }));

      return {
        source: 'OpenStreetMap',
        count: buildings.length,
        buildings: buildings.slice(0, 1000), // Limit for performance
        buildingTypes: this.aggregateBuildingTypes(buildings),
      };
    } catch (error) {
      console.error('Error fetching OSM buildings:', error);
      return this.getMockBuildings();
    }
  }

  async getLandUse(bounds: any) {
    const { south, west, north, east } = bounds;

    try {
      const query = `
        [out:json][timeout:25];
        (
          way["landuse"](${south},${west},${north},${east});
          relation["landuse"](${south},${west},${north},${east});
        );
        out body;
        >;
        out skel qt;
      `;

      const response = await fetch(this.overpassUrl, {
        method: 'POST',
        body: query,
      });

      const data: any = await response.json();
      
      const landUseAreas = data.elements
        .filter((el: any) => el.type === 'way' || el.type === 'relation')
        .map((el: any) => ({
          id: el.id,
          type: el.tags?.landuse,
          name: el.tags?.name,
        }));

      return {
        source: 'OpenStreetMap',
        areas: landUseAreas,
        distribution: this.aggregateLandUse(landUseAreas),
      };
    } catch (error) {
      console.error('Error fetching OSM land use:', error);
      return this.getMockLandUse();
    }
  }

  private aggregateBuildingTypes(buildings: any[]) {
    const types: Record<string, number> = {};
    buildings.forEach((b) => {
      types[b.type] = (types[b.type] || 0) + 1;
    });
    return types;
  }

  private aggregateLandUse(areas: any[]) {
    const distribution: Record<string, number> = {};
    areas.forEach((a) => {
      distribution[a.type] = (distribution[a.type] || 0) + 1;
    });
    return distribution;
  }

  private getMockBuildings() {
    return {
      source: 'Mock data',
      count: 1500,
      buildings: [],
      buildingTypes: {
        residential: 900,
        commercial: 350,
        industrial: 100,
        retail: 150,
      },
    };
  }

  private getMockLandUse() {
    return {
      source: 'Mock data',
      areas: [],
      distribution: {
        residential: 450,
        commercial: 120,
        industrial: 45,
        retail: 80,
        park: 30,
      },
    };
  }
}


