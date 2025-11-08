import fetch from 'node-fetch';
import { config } from '../config.js';

export class EPADataService {
  private apiKey: string;
  private baseUrl = 'https://aqs.epa.gov/data/api';

  constructor() {
    this.apiKey = config.apiKeys.epa || 'demo';
  }

  async getAirQuality(location: [number, number]) {
    const [lng, lat] = location;

    try {
      // Get county FIPS code from coordinates (simplified - would need geocoding)
      // For now, use a sample query for demonstration
      
      const currentYear = new Date().getFullYear();
      const startDate = `${currentYear - 1}0101`;
      const endDate = `${currentYear - 1}1231`;

      // PM2.5 (parameter 88101) - Fine Particulate Matter
      // Ozone (parameter 44201)
      // For demo, we'll use mock data since EPA API requires specific county codes

      return this.getMockAirQuality();
    } catch (error) {
      console.error('Error fetching EPA data:', error);
      return this.getMockAirQuality();
    }
  }

  private getMockAirQuality() {
    return {
      source: 'EPA Air Quality System',
      year: new Date().getFullYear() - 1,
      pollutants: {
        pm25: {
          name: 'PM2.5 (Fine Particulate Matter)',
          value: 8.5,
          unit: 'µg/m³',
          aqi: 35,
          category: 'Good',
        },
        ozone: {
          name: 'Ozone',
          value: 0.055,
          unit: 'ppm',
          aqi: 45,
          category: 'Good',
        },
        no2: {
          name: 'Nitrogen Dioxide',
          value: 18,
          unit: 'ppb',
          aqi: 40,
          category: 'Good',
        },
      },
      overallAQI: 45,
      category: 'Good',
      recommendations: 'Air quality is satisfactory, and air pollution poses little or no risk.',
    };
  }
}


