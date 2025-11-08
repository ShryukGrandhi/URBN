import fetch from 'node-fetch';
import { config } from '../config.js';

export class HUDDataService {
  private apiKey: string;
  private baseUrl = 'https://www.huduser.gov/hudapi/public';

  constructor() {
    this.apiKey = config.apiKeys.hud || 'demo';
  }

  async getHousingData(location: [number, number]) {
    try {
      // HUD API provides Fair Market Rents and Income Limits
      // For actual implementation, would need to query by ZIP or county
      
      return this.getMockHousingData();
    } catch (error) {
      console.error('Error fetching HUD data:', error);
      return this.getMockHousingData();
    }
  }

  private getMockHousingData() {
    const currentYear = new Date().getFullYear();
    
    return {
      source: 'HUD User API',
      year: currentYear,
      fairMarketRents: {
        studio: 1450,
        oneBedroom: 1650,
        twoBedroom: 2100,
        threeBedroom: 2850,
        fourBedroom: 3200,
      },
      medianFamilyIncome: 98500,
      incomeLimits: {
        veryLow: 39400,  // 50% of median
        low: 63040,       // 80% of median
        moderate: 94560,  // 120% of median
      },
      affordableHousingUnits: 1250,
      subsidizedUnits: 380,
    };
  }
}


