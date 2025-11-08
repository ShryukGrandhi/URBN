import fetch from 'node-fetch';
import { config } from '../config.js';

export class CensusDataService {
  private apiKey: string;
  private baseUrl = 'https://api.census.gov/data';

  constructor() {
    this.apiKey = config.apiKeys.census || 'demo';
  }

  async getDemographics(location: [number, number]) {
    const [lng, lat] = location;

    try {
      // Get latest ACS 5-year data
      const year = 2022;
      
      // Get tract for coordinates
      const geoUrl = `https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${lng}&y=${lat}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`;
      const geoResponse = await fetch(geoUrl);
      const geoData: any = await geoResponse.json();

      const tract = geoData.result?.geographies?.['Census Tracts']?.[0];
      if (!tract) {
        console.warn('No census tract found for coordinates');
        return this.getMockDemographics();
      }

      const state = tract.STATE;
      const county = tract.COUNTY;
      const tractCode = tract.TRACT;

      // Fetch demographic data
      const variables = [
        'B01003_001E', // Total population
        'B19013_001E', // Median household income
        'B25077_001E', // Median home value
        'B08301_001E', // Total commuters
        'B08301_010E', // Public transit commuters
        'B08301_019E', // Walk commuters
        'B08301_021E', // Bike commuters
        'B25024_001E', // Total housing units
        'B25002_003E', // Vacant housing units
      ];

      const url = `${this.baseUrl}/${year}/acs/acs5?get=${variables.join(',')},NAME&for=tract:${tractCode}&in=state:${state}+county:${county}&key=${this.apiKey}`;
      
      const response = await fetch(url);
      const data: any = await response.json();

      if (!data || data.length < 2) {
        return this.getMockDemographics();
      }

      const values = data[1];
      
      return {
        source: 'US Census Bureau ACS 5-Year',
        year,
        tract: {
          state,
          county,
          tract: tractCode,
          name: values[values.length - 4],
        },
        population: parseInt(values[0]) || 0,
        medianIncome: parseInt(values[1]) || 0,
        medianHomeValue: parseInt(values[2]) || 0,
        commute: {
          total: parseInt(values[3]) || 0,
          publicTransit: parseInt(values[4]) || 0,
          walk: parseInt(values[5]) || 0,
          bike: parseInt(values[6]) || 0,
        },
        housing: {
          total: parseInt(values[7]) || 0,
          vacant: parseInt(values[8]) || 0,
        },
      };
    } catch (error) {
      console.error('Error fetching Census data:', error);
      return this.getMockDemographics();
    }
  }

  private getMockDemographics() {
    return {
      source: 'Mock data (Census API unavailable)',
      year: 2022,
      tract: {
        state: 'XX',
        county: 'XXX',
        tract: 'XXXXXX',
        name: 'Unknown Tract',
      },
      population: 5000,
      medianIncome: 75000,
      medianHomeValue: 450000,
      commute: {
        total: 2400,
        publicTransit: 480,
        walk: 240,
        bike: 120,
      },
      housing: {
        total: 2000,
        vacant: 100,
      },
    };
  }
}


