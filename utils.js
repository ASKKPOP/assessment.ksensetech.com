import { RISK_SCORES, THRESHOLDS } from './config.js';

/**
 * Sleep function for rate limiting
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Parse blood pressure string and return systolic and diastolic values
 */
export function parseBloodPressure(bpString) {
  if (!bpString || typeof bpString !== 'string') {
    return { systolic: null, diastolic: null, isValid: false };
  }

  const trimmed = bpString.trim();
  if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
    return { systolic: null, diastolic: null, isValid: false };
  }

  // Handle various formats: "120/80", "150/", "/90", "INVALID", etc.
  const parts = trimmed.split('/');
  
  if (parts.length !== 2) {
    return { systolic: null, diastolic: null, isValid: false };
  }

  const systolic = parseFloat(parts[0]);
  const diastolic = parseFloat(parts[1]);

  // Check if either value is NaN or invalid
  if (isNaN(systolic) || isNaN(diastolic) || systolic <= 0 || diastolic <= 0) {
    return { systolic: null, diastolic: null, isValid: false };
  }

  return { systolic, diastolic, isValid: true };
}

/**
 * Calculate blood pressure risk score
 */
export function calculateBloodPressureRisk(bpString) {
  const { systolic, diastolic, isValid } = parseBloodPressure(bpString);
  
  if (!isValid) {
    return RISK_SCORES.BLOOD_PRESSURE.INVALID;
  }

  // Determine the highest risk category
  let riskScore = RISK_SCORES.BLOOD_PRESSURE.NORMAL;

  // Stage 2: Systolic ≥140 OR Diastolic ≥90
  if (systolic >= 140 || diastolic >= 90) {
    riskScore = RISK_SCORES.BLOOD_PRESSURE.STAGE_2;
  }
  // Stage 1: Systolic 130-139 OR Diastolic 80-89
  else if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    riskScore = RISK_SCORES.BLOOD_PRESSURE.STAGE_1;
  }
  // Elevated: Systolic 120-129 AND Diastolic <80
  else if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    riskScore = RISK_SCORES.BLOOD_PRESSURE.ELEVATED;
  }
  // Normal: Systolic <120 AND Diastolic <80
  else if (systolic < 120 && diastolic < 80) {
    riskScore = RISK_SCORES.BLOOD_PRESSURE.NORMAL;
  }

  return riskScore;
}

/**
 * Parse temperature and return numeric value
 */
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

    // Handle non-numeric values like "TEMP_ERROR", "invalid", etc.
    const temperature = parseFloat(trimmed);
    
    if (isNaN(temperature) || temperature <= 0 || temperature > 120) {
      return { temperature: null, isValid: false };
    }

    return { temperature, isValid: true };
  }

  return { temperature: null, isValid: false };
}

/**
 * Calculate temperature risk score
 */
export function calculateTemperatureRisk(tempString) {
  const { temperature, isValid } = parseTemperature(tempString);
  
  if (!isValid) {
    return RISK_SCORES.TEMPERATURE.INVALID;
  }

  if (temperature >= 101) {
    return RISK_SCORES.TEMPERATURE.HIGH_FEVER;
  } else if (temperature >= 99.6) {
    return RISK_SCORES.TEMPERATURE.LOW_FEVER;
  } else {
    return RISK_SCORES.TEMPERATURE.NORMAL;
  }
}

/**
 * Parse age and return numeric value
 */
export function parseAge(ageValue) {
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

    // Handle non-numeric strings like "fifty-three", "unknown", etc.
    const age = parseFloat(trimmed);
    
    if (isNaN(age) || age <= 0 || age > 150) {
      return { age: null, isValid: false };
    }

    return { age, isValid: true };
  }

  return { age: null, isValid: false };
}

/**
 * Calculate age risk score
 */
export function calculateAgeRisk(ageValue) {
  const { age, isValid } = parseAge(ageValue);
  
  if (!isValid) {
    return RISK_SCORES.AGE.INVALID;
  }

  if (age > 65) {
    return RISK_SCORES.AGE.OVER_65;
  } else if (age >= 40) {
    return RISK_SCORES.AGE.AGE_40_65;
  } else {
    return RISK_SCORES.AGE.UNDER_40;
  }
}

/**
 * Calculate total risk score for a patient
 */
export function calculateTotalRiskScore(patient) {
  const bpRisk = calculateBloodPressureRisk(patient.blood_pressure);
  const tempRisk = calculateTemperatureRisk(patient.temperature);
  const ageRisk = calculateAgeRisk(patient.age);
  
  return bpRisk + tempRisk + ageRisk;
}

/**
 * Check if patient has data quality issues
 */
export function hasDataQualityIssues(patient) {
  const { systolic, diastolic, isValid: bpValid } = parseBloodPressure(patient.blood_pressure);
  const { temperature, isValid: tempValid } = parseTemperature(patient.temperature);
  const { age, isValid: ageValid } = parseAge(patient.age);
  
  return !bpValid || !tempValid || !ageValid;
}

/**
 * Check if patient has fever
 */
export function hasFever(patient) {
  const { temperature, isValid } = parseTemperature(patient.temperature);
  return isValid && temperature >= THRESHOLDS.FEVER_TEMPERATURE;
}

/**
 * Check if patient is high risk
 */
export function isHighRisk(patient) {
  const totalRisk = calculateTotalRiskScore(patient);
  return totalRisk >= THRESHOLDS.HIGH_RISK_SCORE;
}

/**
 * Retry function with exponential backoff
 */
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