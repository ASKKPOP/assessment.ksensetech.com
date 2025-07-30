import { 
  calculateTotalRiskScore, 
  hasDataQualityIssues, 
  hasFever, 
  isHighRisk 
} from './utils.js';

/**
 * Risk Analyzer for processing patient data
 */
export class RiskAnalyzer {
  constructor() {
    this.patients = [];
    this.results = {
      highRiskPatients: [],
      feverPatients: [],
      dataQualityIssues: []
    };
  }

  /**
   * Add patients to the analyzer
   */
  addPatients(patients) {
    if (Array.isArray(patients)) {
      this.patients = this.patients.concat(patients);
    } else {
      this.patients.push(patients);
    }
  }

  /**
   * Clear all patients and results
   */
  clear() {
    this.patients = [];
    this.results = {
      highRiskPatients: [],
      feverPatients: [],
      dataQualityIssues: []
    };
  }

  /**
   * Analyze all patients and generate results
   */
  analyze() {
    console.log(`Analyzing ${this.patients.length} patients...`);

    this.results = {
      highRiskPatients: [],
      feverPatients: [],
      dataQualityIssues: []
    };

    for (const patient of this.patients) {
      const patientId = patient.patient_id;

      // Check for data quality issues
      if (hasDataQualityIssues(patient)) {
        this.results.dataQualityIssues.push(patientId);
        continue; // Skip further analysis for patients with data quality issues
      }

      // Check for fever
      if (hasFever(patient)) {
        this.results.feverPatients.push(patientId);
      }

      // Check for high risk
      if (isHighRisk(patient)) {
        this.results.highRiskPatients.push(patientId);
      }
    }

    // Sort results for consistent output
    this.results.highRiskPatients.sort();
    this.results.feverPatients.sort();
    this.results.dataQualityIssues.sort();

    console.log('Analysis complete:');
    console.log(`- High risk patients: ${this.results.highRiskPatients.length}`);
    console.log(`- Fever patients: ${this.results.feverPatients.length}`);
    console.log(`- Data quality issues: ${this.results.dataQualityIssues.length}`);

    return this.results;
  }

  /**
   * Get detailed analysis for a specific patient
   */
  getPatientAnalysis(patientId) {
    const patient = this.patients.find(p => p.patient_id === patientId);
    if (!patient) {
      return null;
    }

    const totalRisk = calculateTotalRiskScore(patient);
    const hasDataIssues = hasDataQualityIssues(patient);
    const hasFeverStatus = hasFever(patient);
    const isHighRiskStatus = isHighRisk(patient);

    return {
      patientId,
      name: patient.name,
      age: patient.age,
      bloodPressure: patient.blood_pressure,
      temperature: patient.temperature,
      totalRiskScore: totalRisk,
      hasDataQualityIssues: hasDataIssues,
      hasFever: hasFeverStatus,
      isHighRisk: isHighRiskStatus,
      riskBreakdown: {
        bloodPressure: this.getBloodPressureRisk(patient.blood_pressure),
        temperature: this.getTemperatureRisk(patient.temperature),
        age: this.getAgeRisk(patient.age)
      }
    };
  }

  /**
   * Get blood pressure risk breakdown
   */
  getBloodPressureRisk(bpString) {
    const { systolic, diastolic, isValid } = this.parseBloodPressure(bpString);
    
    if (!isValid) {
      return { score: 0, category: 'Invalid/Missing', systolic, diastolic };
    }

    let category = 'Normal';
    let score = 1;

    if (systolic >= 140 || diastolic >= 90) {
      category = 'Stage 2';
      score = 4;
    } else if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
      category = 'Stage 1';
      score = 3;
    } else if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
      category = 'Elevated';
      score = 2;
    }

    return { score, category, systolic, diastolic };
  }

  /**
   * Get temperature risk breakdown
   */
  getTemperatureRisk(tempString) {
    const { temperature, isValid } = this.parseTemperature(tempString);
    
    if (!isValid) {
      return { score: 0, category: 'Invalid/Missing', temperature };
    }

    let category = 'Normal';
    let score = 0;

    if (temperature >= 101) {
      category = 'High Fever';
      score = 2;
    } else if (temperature >= 99.6) {
      category = 'Low Fever';
      score = 1;
    }

    return { score, category, temperature };
  }

  /**
   * Get age risk breakdown
   */
  getAgeRisk(ageValue) {
    const { age, isValid } = this.parseAge(ageValue);
    
    if (!isValid) {
      return { score: 0, category: 'Invalid/Missing', age };
    }

    let category = 'Under 40';
    let score = 1;

    if (age > 65) {
      category = 'Over 65';
      score = 2;
    } else if (age >= 40) {
      category = '40-65';
      score = 1;
    }

    return { score, category, age };
  }

  /**
   * Parse blood pressure (duplicate from utils for internal use)
   */
  parseBloodPressure(bpString) {
    if (!bpString || typeof bpString !== 'string') {
      return { systolic: null, diastolic: null, isValid: false };
    }

    const trimmed = bpString.trim();
    if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
      return { systolic: null, diastolic: null, isValid: false };
    }

    const parts = trimmed.split('/');
    
    if (parts.length !== 2) {
      return { systolic: null, diastolic: null, isValid: false };
    }

    const systolic = parseFloat(parts[0]);
    const diastolic = parseFloat(parts[1]);

    if (isNaN(systolic) || isNaN(diastolic) || systolic <= 0 || diastolic <= 0) {
      return { systolic: null, diastolic: null, isValid: false };
    }

    return { systolic, diastolic, isValid: true };
  }

  /**
   * Parse temperature (duplicate from utils for internal use)
   */
  parseTemperature(tempValue) {
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

      const temperature = parseFloat(trimmed);
      
      if (isNaN(temperature) || temperature <= 0 || temperature > 120) {
        return { temperature: null, isValid: false };
      }

      return { temperature, isValid: true };
    }

    return { temperature: null, isValid: false };
  }

  /**
   * Parse age (duplicate from utils for internal use)
   */
  parseAge(ageValue) {
    if (ageValue === null || ageValue === undefined) {
      return { age: null, isValid: false };
    }

    if (typeof ageValue === 'number') {
      if (ageValue > 0 && ageValue <= 150) {
        return { age: ageValue, isValid: true };
      }
      return { age: null, isValid: false };
    }

    if (typeof ageValue === 'string') {
      const trimmed = ageValue.trim();
      if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
        return { age: null, isValid: false };
      }

      const age = parseFloat(trimmed);
      
      if (isNaN(age) || age <= 0 || age > 150) {
        return { age: null, isValid: false };
      }

      return { age, isValid: true };
    }

    return { age: null, isValid: false };
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    const totalPatients = this.patients.length;
    const validPatients = this.patients.filter(p => !hasDataQualityIssues(p)).length;
    const highRiskCount = this.results.highRiskPatients.length;
    const feverCount = this.results.feverPatients.length;
    const dataQualityCount = this.results.dataQualityIssues.length;

    return {
      totalPatients,
      validPatients,
      highRiskCount,
      feverCount,
      dataQualityCount,
      dataQualityPercentage: totalPatients > 0 ? (dataQualityCount / totalPatients * 100).toFixed(2) : 0
    };
  }
} 