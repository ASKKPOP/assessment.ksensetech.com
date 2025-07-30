import { CONFIG } from './config.js';
import { sleep, retryWithBackoff } from './utils.js';

/**
 * API Client for Healthcare Assessment API
 */
export class ApiClient {
  constructor() {
    this.baseURL = CONFIG.API_BASE_URL;
    this.apiKey = CONFIG.API_KEY;
    this.headers = {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
      'User-Agent': 'HealthcareAssessment/1.0.0'
    };
  }

  /**
   * Make HTTP request with retry logic and rate limiting
   */
  async makeRequest(url, options = {}) {
    const fullUrl = `${this.baseURL}${url}`;
    const requestOptions = {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers
      }
    };

    return retryWithBackoff(async () => {
      try {
        const response = await fetch(fullUrl, requestOptions);
        
        // Handle rate limiting
        if (response.status === 429) {
          console.log('Rate limited, waiting before retry...');
          await sleep(CONFIG.RATE_LIMIT_DELAY);
          throw new Error('Rate limited');
        }

        // Handle server errors
        if (response.status >= 500) {
          throw new Error(`Server error: ${response.status}`);
        }

        // Handle other HTTP errors
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status} - ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        if (error.message === 'Rate limited' || error.message.includes('Server error')) {
          throw error; // Retry these errors
        }
        throw new Error(`Request failed: ${error.message}`);
      }
    }, CONFIG.RETRY_ATTEMPTS, CONFIG.RETRY_DELAY);
  }

  /**
   * Get patients with pagination
   */
  async getPatients(page = 1, limit = CONFIG.DEFAULT_LIMIT) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: Math.min(limit, CONFIG.MAX_LIMIT).toString()
    });

    return this.makeRequest(`/patients?${params}`);
  }

  /**
   * Get all patients by fetching all pages
   */
  async getAllPatients() {
    let allPatients = [];
    let currentPage = 1;
    let hasNext = true;

    console.log('Fetching all patients...');

    while (hasNext) {
      try {
        console.log(`Fetching page ${currentPage}...`);
        const response = await this.getPatients(currentPage, CONFIG.MAX_LIMIT);
        
        if (response.data && Array.isArray(response.data)) {
          allPatients = allPatients.concat(response.data);
          console.log(`Page ${currentPage}: ${response.data.length} patients`);
        }

        // Check pagination info
        if (response.pagination) {
          hasNext = response.pagination.hasNext;
          currentPage++;
        } else {
          hasNext = false;
        }

        // Add delay between requests to avoid rate limiting
        if (hasNext) {
          await sleep(500);
        }
      } catch (error) {
        console.error(`Error fetching page ${currentPage}:`, error.message);
        throw error;
      }
    }

    console.log(`Total patients fetched: ${allPatients.length}`);
    return allPatients;
  }

  /**
   * Submit assessment results
   */
  async submitAssessment(results) {
    const payload = {
      high_risk_patients: results.highRiskPatients || [],
      fever_patients: results.feverPatients || [],
      data_quality_issues: results.dataQualityIssues || []
    };

    console.log('Submitting assessment results...');
    console.log(`High risk patients: ${payload.high_risk_patients.length}`);
    console.log(`Fever patients: ${payload.fever_patients.length}`);
    console.log(`Data quality issues: ${payload.data_quality_issues.length}`);

    return this.makeRequest('/submit-assessment', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
} 