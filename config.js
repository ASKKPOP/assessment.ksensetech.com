export const CONFIG = {
  API_BASE_URL: 'https://assessment.ksensetech.com/api',
  API_KEY: 'ak_3b95f69c290603ef0f02c21ee15602b39d8d2ded808f7541',
  DEFAULT_LIMIT: 5,
  MAX_LIMIT: 20,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  RATE_LIMIT_DELAY: 2000, // 2 seconds
};

export const RISK_SCORES = {
  BLOOD_PRESSURE: {
    NORMAL: 1,      // Systolic <120 AND Diastolic <80
    ELEVATED: 2,    // Systolic 120-129 AND Diastolic <80
    STAGE_1: 3,     // Systolic 130-139 OR Diastolic 80-89
    STAGE_2: 4,     // Systolic ≥140 OR Diastolic ≥90
    INVALID: 0      // Missing or malformed data
  },
  TEMPERATURE: {
    NORMAL: 0,      // ≤99.5°F
    LOW_FEVER: 1,   // 99.6-100.9°F
    HIGH_FEVER: 2,  // ≥101°F
    INVALID: 0      // Missing or malformed data
  },
  AGE: {
    UNDER_40: 1,    // <40 years
    AGE_40_65: 1,   // 40-65 years
    OVER_65: 2,     // >65 years
    INVALID: 0      // Missing or malformed data
  }
};

export const THRESHOLDS = {
  HIGH_RISK_SCORE: 4,
  FEVER_TEMPERATURE: 99.6
}; 