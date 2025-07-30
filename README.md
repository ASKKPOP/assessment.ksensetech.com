# Healthcare API Assessment

A comprehensive patient risk scoring system that integrates with the DemoMed Healthcare API to analyze patient data and generate risk assessments.

## Features

- **Patient Data Fetching**: Retrieves patient data from the Healthcare API with pagination support
- **Risk Scoring**: Calculates risk scores based on blood pressure, temperature, and age
- **Data Quality Validation**: Identifies patients with invalid or missing data
- **Retry Logic**: Handles API rate limiting and intermittent failures
- **Comprehensive Testing**: Includes unit tests for all risk scoring logic
- **Real-time Assessment**: Submits results to the assessment API for scoring

## Risk Scoring Algorithm

### Blood Pressure Risk (1-4 points)
- **Normal** (Systolic <120 AND Diastolic <80): 1 point
- **Elevated** (Systolic 120-129 AND Diastolic <80): 2 points
- **Stage 1** (Systolic 130-139 OR Diastolic 80-89): 3 points
- **Stage 2** (Systolic ≥140 OR Diastolic ≥90): 4 points
- **Invalid/Missing**: 0 points

### Temperature Risk (0-2 points)
- **Normal** (≤99.5°F): 0 points
- **Low Fever** (99.6-100.9°F): 1 point
- **High Fever** (≥101°F): 2 points
- **Invalid/Missing**: 0 points

### Age Risk (1-2 points)
- **Under 40** (<40 years): 1 point
- **40-65** (40-65 years): 1 point
- **Over 65** (>65 years): 2 points
- **Invalid/Missing**: 0 points

### Total Risk Score
Total Risk = Blood Pressure Score + Temperature Score + Age Score

## Installation

1. Clone or download the project files
2. Install dependencies:
```bash
npm install
```

## Usage

### Run the Complete Assessment
```bash
npm start
```

This will:
1. Fetch all patient data from the API
2. Analyze each patient's risk factors
3. Generate assessment results
4. Submit results to the assessment API
5. Display detailed feedback and scoring

### Run Tests
```bash
npm test
```

This will run comprehensive unit tests for the risk scoring logic.

### Programmatic Usage
```javascript
import { HealthcareAssessment } from './index.js';

const assessment = new HealthcareAssessment();

// Run complete assessment
const results = await assessment.runAssessment();

// Get current results without submitting
const currentResults = assessment.getCurrentResults();

// Get detailed analysis for a specific patient
const patientDetails = assessment.getPatientDetails('DEMO001');

// Get summary statistics
const summary = assessment.getSummary();
```

## Project Structure

```
healthcare-api-assessment/
├── config.js          # Configuration and constants
├── utils.js           # Utility functions and risk scoring logic
├── api-client.js      # API client with retry logic
├── risk-analyzer.js   # Patient data analysis engine
├── index.js           # Main application entry point
├── test.js            # Unit tests
├── package.json       # Project dependencies
└── README.md          # This file
```

## Real-World API Challenges & Solutions

This Healthcare API Assessment system is designed to handle real-world API challenges that simulate production environments. Here's how we solve each challenge:

### 1. Rate Limiting (429 Errors) ✅ SOLVED

**Challenge**: API may return 429 errors if requests are made too quickly.

**Our Solution**:
- **Automatic Rate Limiting**: Built-in delays between requests (500ms default)
- **Exponential Backoff**: Retry logic with increasing delays (1s, 2s, 4s)
- **Configurable Delays**: Rate limit delays can be adjusted in `config.js`
- **Smart Pagination**: Uses maximum page size (20 patients) to reduce request frequency

```javascript
// From api-client.js
if (response.status === 429) {
  console.log('Rate limited, waiting before retry...');
  await sleep(CONFIG.RATE_LIMIT_DELAY);
  throw new Error('Rate limited');
}

// Add delay between pagination requests
if (hasNext) {
  await sleep(500);
}
```

### 2. Intermittent Failures (500/503 Errors) ✅ SOLVED

**Challenge**: ~8% chance of 500/503 server errors requiring retry logic.

**Our Solution**:
- **Retry with Exponential Backoff**: Automatic retry for server errors
- **Configurable Retry Attempts**: 3 attempts by default (configurable)
- **Error Classification**: Distinguishes between retryable and non-retryable errors
- **Graceful Degradation**: Continues processing even if some requests fail

```javascript
// From api-client.js
export async function retryWithBackoff(fn, maxAttempts = 3, baseDelay = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
}

// Handle server errors specifically
if (response.status >= 500) {
  throw new Error(`Server error: ${response.status}`);
}
```

### 3. Pagination (~10 pages, ~50 patients) ✅ SOLVED

**Challenge**: API returns 5 patients per page by default, requiring pagination handling.

**Our Solution**:
- **Automatic Pagination**: Fetches all pages automatically
- **Maximum Page Size**: Uses limit=20 to minimize page count
- **Progress Tracking**: Shows current page and total patients fetched
- **Pagination Metadata**: Handles `hasNext`, `totalPages`, `total` fields
- **Memory Efficient**: Processes patients as they're received

```javascript
// From api-client.js
async getAllPatients() {
  let allPatients = [];
  let currentPage = 1;
  let hasNext = true;

  while (hasNext) {
    const response = await this.getPatients(currentPage, CONFIG.MAX_LIMIT);
    
    if (response.data && Array.isArray(response.data)) {
      allPatients = allPatients.concat(response.data);
      console.log(`Page ${currentPage}: ${response.data.length} patients`);
    }

    if (response.pagination) {
      hasNext = response.pagination.hasNext;
      currentPage++;
    }
  }
}
```

### 4. Inconsistent Responses & Missing Fields ✅ SOLVED

**Challenge**: API occasionally returns data in different formats or with missing fields.

**Our Solution**:
- **Robust Data Parsing**: Handles both string and number data types
- **Null/Undefined Handling**: Graceful handling of missing fields
- **Data Type Validation**: Validates data types before processing
- **Fallback Values**: Provides default values for missing data
- **Comprehensive Error Handling**: Continues processing even with malformed data

```javascript
// From utils.js - Flexible data parsing
export function parseTemperature(tempValue) {
  if (tempValue === null || tempValue === undefined) {
    return { temperature: null, isValid: false };
  }

  // Handle number type directly
  if (typeof tempValue === 'number') {
    if (tempValue > 0 && tempValue <= 120) {
      return { temperature: tempValue, isValid: true };
    }
    return { temperature: null, isValid: false };
  }

  // Handle string type
  if (typeof tempValue === 'string') {
    const trimmed = tempValue.trim();
    if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
      return { temperature: null, isValid: false };
    }
    // ... parsing logic
  }
}

// Data quality validation
export function hasDataQualityIssues(patient) {
  const { systolic, diastolic, isValid: bpValid } = parseBloodPressure(patient.blood_pressure);
  const { temperature, isValid: tempValid } = parseTemperature(patient.temperature);
  const { age, isValid: ageValid } = parseAge(patient.age);
  
  return !bpValid || !tempValid || !ageValid;
}
```

## API Configuration

The system is configured to work with the DemoMed Healthcare API:

- **Base URL**: `https://assessment.ksensetech.com/api`
- **Authentication**: API key in `x-api-key` header
- **Rate Limiting**: Automatic retry with exponential backoff
- **Pagination**: Handles multiple pages of patient data

## Configuration Options

The system provides configurable parameters to tune the API handling behavior:

```javascript
// From config.js
export const CONFIG = {
  API_BASE_URL: 'https://assessment.ksensetech.com/api',
  API_KEY: 'your-api-key-here',
  DEFAULT_LIMIT: 5,           // Default page size
  MAX_LIMIT: 20,              // Maximum page size for pagination
  RETRY_ATTEMPTS: 3,          // Number of retry attempts for failed requests
  RETRY_DELAY: 1000,          // Base delay for exponential backoff (ms)
  RATE_LIMIT_DELAY: 2000,     // Delay when rate limited (ms)
};
```

### Tuning Recommendations

- **For High-Volume APIs**: Increase `RATE_LIMIT_DELAY` to 3000-5000ms
- **For Unstable Networks**: Increase `RETRY_ATTEMPTS` to 5 and `RETRY_DELAY` to 2000ms
- **For Large Datasets**: Increase `MAX_LIMIT` to reduce pagination overhead
- **For Development**: Decrease delays for faster testing

## Error Handling

The system includes robust error handling for:

- **Rate Limiting**: Automatic retry with delays
- **Server Errors**: Retry logic for 5xx errors
- **Network Issues**: Exponential backoff retry
- **Data Validation**: Comprehensive input validation
- **API Failures**: Graceful degradation and reporting

## Data Quality Issues

The system identifies patients with data quality issues including:

- Missing or malformed blood pressure readings
- Invalid temperature values
- Non-numeric age values
- Null or undefined data fields

## Assessment Results

The system generates three categories of results:

1. **High-Risk Patients**: Patient IDs with total risk score ≥ 4
2. **Fever Patients**: Patient IDs with temperature ≥ 99.6°F
3. **Data Quality Issues**: Patient IDs with invalid/missing data

## Testing

The test suite includes comprehensive test cases for:

- Blood pressure risk scoring
- Temperature risk scoring
- Age risk scoring
- Data quality validation
- Edge cases and error conditions

Run tests with:
```bash
npm test
```

## API Endpoints

### GET /api/patients
Retrieves patient data with pagination support.

**Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 5, max: 20)

**Headers:**
- `x-api-key`: API authentication key

### POST /api/submit-assessment
Submits assessment results for scoring.

**Headers:**
- `x-api-key`: API authentication key
- `Content-Type`: application/json

**Body:**
```json
{
  "high_risk_patients": ["DEMO001", "DEMO002"],
  "fever_patients": ["DEMO003", "DEMO004"],
  "data_quality_issues": ["DEMO005", "DEMO006"]
}
```

## Dependencies

- **Node.js**: ES modules support required
- **fetch**: Built-in HTTP client (Node.js 18+)
- **axios**: HTTP client (optional, for older Node.js versions)

## License

MIT License - see LICENSE file for details.

## Support

For issues or questions about the Healthcare API Assessment system, please refer to the API documentation or contact the assessment administrators. 