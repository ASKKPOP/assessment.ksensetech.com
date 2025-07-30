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

## API Configuration

The system is configured to work with the DemoMed Healthcare API:

- **Base URL**: `https://assessment.ksensetech.com/api`
- **Authentication**: API key in `x-api-key` header
- **Rate Limiting**: Automatic retry with exponential backoff
- **Pagination**: Handles multiple pages of patient data

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