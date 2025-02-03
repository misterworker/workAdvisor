'use server'

interface SalaryPredictionPayload {
  job_description: string;
  job_title: string;
  query: string;
  soft_skills: string[];
  hard_skills: string[];
  location_flexibility: string;
  contract_type: string;
  education_level: string;
  seniority: string;
  min_years_experience: number;
  field_of_study: string[];
  country_code: string;
}

export async function predictSalary(payload: SalaryPredictionPayload) {
  try {
    const response = await fetch('https://salary-prediction-491899619233.asia-southeast1.run.app/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Prediction error:', error);
    return { success: false, error: 'Failed to predict salary' };
  }
}
