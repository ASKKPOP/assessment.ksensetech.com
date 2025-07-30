import { ApiClient } from './api-client.js';
import { RiskAnalyzer } from './risk-analyzer.js';

/**
 * Main Healthcare API Assessment Application
 */
class HealthcareAssessment {
  constructor() {
    this.apiClient = new ApiClient();
    this.riskAnalyzer = new RiskAnalyzer();
  }

  /**
   * Run the complete assessment
   */
  async runAssessment() {
    try {
      console.log('🚀 Starting Healthcare API Assessment...\n');

      // Step 1: Fetch all patient data
      console.log('📋 Step 1: Fetching patient data...');
      const patients = await this.fetchAllPatients();
      
      if (!patients || patients.length === 0) {
        throw new Error('No patients data received');
      }

      // Step 2: Analyze patient data
      console.log('\n🔍 Step 2: Analyzing patient data...');
      const results = await this.analyzePatients(patients);

      // Step 3: Submit assessment results
      console.log('\n📤 Step 3: Submitting assessment results...');
      const submissionResult = await this.submitResults(results);

      // Step 4: Display results
      console.log('\n📊 Step 4: Assessment Results');
      this.displayResults(submissionResult);

      return submissionResult;

    } catch (error) {
      console.error('\n❌ Assessment failed:', error.message);
      throw error;
    }
  }

  /**
   * Fetch all patients from the API
   */
  async fetchAllPatients() {
    try {
      const patients = await this.apiClient.getAllPatients();
      console.log(`✅ Successfully fetched ${patients.length} patients`);
      return patients;
    } catch (error) {
      console.error('❌ Failed to fetch patients:', error.message);
      throw error;
    }
  }

  /**
   * Analyze patient data and generate results
   */
  async analyzePatients(patients) {
    try {
      // Add patients to analyzer
      this.riskAnalyzer.addPatients(patients);

      // Perform analysis
      const results = this.riskAnalyzer.analyze();

      // Get summary statistics
      const summary = this.riskAnalyzer.getSummary();
      
      console.log('\n📈 Analysis Summary:');
      console.log(`- Total patients: ${summary.totalPatients}`);
      console.log(`- Valid patients: ${summary.validPatients}`);
      console.log(`- High risk patients: ${summary.highRiskCount}`);
      console.log(`- Fever patients: ${summary.feverCount}`);
      console.log(`- Data quality issues: ${summary.dataQualityCount} (${summary.dataQualityPercentage}%)`);

      return results;
    } catch (error) {
      console.error('❌ Failed to analyze patients:', error.message);
      throw error;
    }
  }

  /**
   * Submit results to the assessment API
   */
  async submitResults(results) {
    try {
      const submissionResult = await this.apiClient.submitAssessment(results);
      console.log('✅ Assessment submitted successfully');
      return submissionResult;
    } catch (error) {
      console.error('❌ Failed to submit assessment:', error.message);
      throw error;
    }
  }

  /**
   * Display assessment results
   */
  displayResults(submissionResult) {
    if (!submissionResult || !submissionResult.results) {
      console.log('❌ No results to display');
      return;
    }

    const { results } = submissionResult;
    
    console.log('\n🎯 Assessment Score:');
    console.log(`- Overall Score: ${results.score} (${results.percentage}%)`);
    console.log(`- Status: ${results.status}`);
    console.log(`- Attempt: ${results.attempt_number}/${results.attempt_number + results.remaining_attempts}`);

    if (results.breakdown) {
      console.log('\n📊 Score Breakdown:');
      console.log(`- High Risk Patients: ${results.breakdown.high_risk.score}/${results.breakdown.high_risk.max} (${results.breakdown.high_risk.correct}/${results.breakdown.high_risk.submitted} correct)`);
      console.log(`- Fever Patients: ${results.breakdown.fever.score}/${results.breakdown.fever.max} (${results.breakdown.fever.correct}/${results.breakdown.fever.submitted} correct)`);
      console.log(`- Data Quality Issues: ${results.breakdown.data_quality.score}/${results.breakdown.data_quality.max} (${results.breakdown.data_quality.correct}/${results.breakdown.data_quality.submitted} correct)`);
    }

    if (results.feedback) {
      console.log('\n💡 Feedback:');
      if (results.feedback.strengths && results.feedback.strengths.length > 0) {
        console.log('✅ Strengths:');
        results.feedback.strengths.forEach(strength => console.log(`  ${strength}`));
      }
      
      if (results.feedback.issues && results.feedback.issues.length > 0) {
        console.log('⚠️  Issues:');
        results.feedback.issues.forEach(issue => console.log(`  ${issue}`));
      }
    }

    if (results.is_personal_best) {
      console.log('\n🏆 New Personal Best!');
    }

    if (results.can_resubmit) {
      console.log(`\n🔄 You can resubmit ${results.remaining_attempts} more time(s)`);
    }
  }

  /**
   * Get detailed analysis for a specific patient
   */
  getPatientDetails(patientId) {
    return this.riskAnalyzer.getPatientAnalysis(patientId);
  }

  /**
   * Get current results without submitting
   */
  getCurrentResults() {
    return this.riskAnalyzer.results;
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    return this.riskAnalyzer.getSummary();
  }
}

// Main execution
async function main() {
  const assessment = new HealthcareAssessment();
  
  try {
    await assessment.runAssessment();
  } catch (error) {
    console.error('Assessment failed:', error.message);
    process.exit(1);
  }
}

// Export for use as module
export { HealthcareAssessment };

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} 