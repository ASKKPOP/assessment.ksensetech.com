import { 
  calculateBloodPressureRisk, 
  calculateTemperatureRisk, 
  calculateAgeRisk, 
  calculateTotalRiskScore,
  hasDataQualityIssues,
  hasFever,
  isHighRisk
} from './utils.js';

/**
 * Test cases for risk scoring logic
 */
const testCases = [
  // Blood Pressure Tests
  {
    name: 'Blood Pressure - Normal',
    data: { blood_pressure: '110/70' },
    expected: { bpRisk: 1, tempRisk: 0, ageRisk: 1, total: 2, highRisk: false }
  },
  {
    name: 'Blood Pressure - Elevated',
    data: { blood_pressure: '125/75' },
    expected: { bpRisk: 2, tempRisk: 0, ageRisk: 1, total: 3, highRisk: false }
  },
  {
    name: 'Blood Pressure - Stage 1',
    data: { blood_pressure: '135/85' },
    expected: { bpRisk: 3, tempRisk: 0, ageRisk: 1, total: 4, highRisk: true }
  },
  {
    name: 'Blood Pressure - Stage 2',
    data: { blood_pressure: '150/95' },
    expected: { bpRisk: 4, tempRisk: 0, ageRisk: 1, total: 5, highRisk: true }
  },
  {
    name: 'Blood Pressure - Invalid (missing diastolic)',
    data: { blood_pressure: '150/' },
    expected: { bpRisk: 0, tempRisk: 0, ageRisk: 1, total: 1, highRisk: false, dataQuality: true }
  },
  {
    name: 'Blood Pressure - Invalid (non-numeric)',
    data: { blood_pressure: 'INVALID' },
    expected: { bpRisk: 0, tempRisk: 0, ageRisk: 1, total: 1, highRisk: false, dataQuality: true }
  },

  // Temperature Tests
  {
    name: 'Temperature - Normal',
    data: { temperature: '98.6' },
    expected: { bpRisk: 3, tempRisk: 0, ageRisk: 1, total: 4, highRisk: true, fever: false }
  },
  {
    name: 'Temperature - Low Fever',
    data: { temperature: '100.0' },
    expected: { bpRisk: 3, tempRisk: 1, ageRisk: 1, total: 5, highRisk: true, fever: true }
  },
  {
    name: 'Temperature - High Fever',
    data: { temperature: '102.5' },
    expected: { bpRisk: 3, tempRisk: 2, ageRisk: 1, total: 6, highRisk: true, fever: true }
  },
  {
    name: 'Temperature - Invalid (non-numeric)',
    data: { temperature: 'TEMP_ERROR' },
    expected: { bpRisk: 3, tempRisk: 0, ageRisk: 1, total: 4, highRisk: true, fever: false, dataQuality: true }
  },

  // Age Tests
  {
    name: 'Age - Under 40',
    data: { age: 25 },
    expected: { bpRisk: 3, tempRisk: 0, ageRisk: 1, total: 4, highRisk: true }
  },
  {
    name: 'Age - 40-65',
    data: { age: 55 },
    expected: { bpRisk: 3, tempRisk: 0, ageRisk: 1, total: 4, highRisk: true }
  },
  {
    name: 'Age - Over 65',
    data: { age: 70 },
    expected: { bpRisk: 3, tempRisk: 0, ageRisk: 2, total: 5, highRisk: true }
  },
  {
    name: 'Age - Invalid (non-numeric string)',
    data: { age: 'fifty-three' },
    expected: { bpRisk: 3, tempRisk: 0, ageRisk: 0, total: 3, highRisk: false, dataQuality: true }
  },

  // Combined Tests
  {
    name: 'High Risk Combination',
    data: { blood_pressure: '160/100', temperature: '103.0', age: 75 },
    expected: { bpRisk: 4, tempRisk: 2, ageRisk: 2, total: 8, highRisk: true, fever: true }
  },
  {
    name: 'Data Quality Issues',
    data: { blood_pressure: 'INVALID', temperature: 'TEMP_ERROR', age: 'unknown' },
    expected: { bpRisk: 0, tempRisk: 0, ageRisk: 0, total: 0, highRisk: false, fever: false, dataQuality: true }
  }
];

/**
 * Run test cases
 */
function runTests() {
  console.log('🧪 Running Risk Scoring Tests...\n');

  let passed = 0;
  let failed = 0;

  testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase.name}`);
    
    try {
      // Create a complete patient object with default values
      const patient = {
        patient_id: `TEST${index + 1}`,
        name: 'Test Patient',
        blood_pressure: testCase.data.blood_pressure || '120/80',
        temperature: testCase.data.temperature || '98.6',
        age: testCase.data.age || 45,
        gender: 'M',
        visit_date: '2024-01-15',
        diagnosis: 'Test',
        medications: 'Test'
      };

      // Calculate individual risk scores
      const bpRisk = calculateBloodPressureRisk(patient.blood_pressure);
      const tempRisk = calculateTemperatureRisk(patient.temperature);
      const ageRisk = calculateAgeRisk(patient.age);
      const totalRisk = calculateTotalRiskScore(patient);

      // Check additional conditions
      const dataQualityIssues = hasDataQualityIssues(patient);
      const feverStatus = hasFever(patient);
      const highRiskStatus = isHighRisk(patient);

      // Validate results
      const expected = testCase.expected;
      let testPassed = true;
      let errors = [];

      if (bpRisk !== expected.bpRisk) {
        errors.push(`BP Risk: expected ${expected.bpRisk}, got ${bpRisk}`);
        testPassed = false;
      }

      if (tempRisk !== expected.tempRisk) {
        errors.push(`Temp Risk: expected ${expected.tempRisk}, got ${tempRisk}`);
        testPassed = false;
      }

      if (ageRisk !== expected.ageRisk) {
        errors.push(`Age Risk: expected ${expected.ageRisk}, got ${ageRisk}`);
        testPassed = false;
      }

      if (totalRisk !== expected.total) {
        errors.push(`Total Risk: expected ${expected.total}, got ${totalRisk}`);
        testPassed = false;
      }

      if (highRiskStatus !== expected.highRisk) {
        errors.push(`High Risk: expected ${expected.highRisk}, got ${highRiskStatus}`);
        testPassed = false;
      }

      if (expected.fever !== undefined && feverStatus !== expected.fever) {
        errors.push(`Fever: expected ${expected.fever}, got ${feverStatus}`);
        testPassed = false;
      }

      if (expected.dataQuality !== undefined && dataQualityIssues !== expected.dataQuality) {
        errors.push(`Data Quality: expected ${expected.dataQuality}, got ${dataQualityIssues}`);
        testPassed = false;
      }

      if (testPassed) {
        console.log(`  ✅ PASSED - BP: ${bpRisk}, Temp: ${tempRisk}, Age: ${ageRisk}, Total: ${totalRisk}`);
        passed++;
      } else {
        console.log(`  ❌ FAILED - ${errors.join(', ')}`);
        console.log(`     Patient: ${JSON.stringify(patient)}`);
        failed++;
      }

    } catch (error) {
      console.log(`  ❌ ERROR - ${error.message}`);
      failed++;
    }

    console.log('');
  });

  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Please review the implementation.');
  }

  return { passed, failed };
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { runTests, testCases }; 