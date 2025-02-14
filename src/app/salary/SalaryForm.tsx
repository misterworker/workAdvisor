"use client"

import {
  TextInput,
  Textarea,
  Select,
  MultiSelect,
  NumberInput,
  Button,
  Stack,
  Title,
  Text,
  Paper,
  Card,
  Grid,
  Tooltip,
  Group,
} from '@mantine/core';
import { HelpCircle } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useForm } from '@mantine/form';
import { useState, ReactNode } from 'react';

interface FormLabelProps {
  label: string;
  tooltip: string;
}

function FormLabel({ label, tooltip }: FormLabelProps) {
  const tooltipContent = tooltip.split('\n').map((line, index) => (
    <span key={index}>
      {line}
      {index < tooltip.split('\n').length - 1 && <br />}
    </span>
  ));

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
      {label}
      <Tooltip
        label={tooltipContent}
        position="top-start"
        multiline
      >
        <HelpCircle size={16} style={{ cursor: 'help' }} />
      </Tooltip>
    </div>
  );
}

import { predictSalary } from './actions';
import { jobPresets, formTooltips } from './presets';

export default function SalaryForm() {
  interface FormValues {
    job_title: string;
    query: string;
    job_description: string;
    contract_type: string;
    education_level: string;
    seniority: string;
    min_years_experience: string;
    countries: string[];
    location_us: string[];
    location_sg: string[];
    location_in: string[];
  }


  const form = useForm<FormValues>({
    initialValues: {
      job_title: '',
      query: '',
      job_description: '',
      contract_type: '',
      education_level: '',
      seniority: '',
      min_years_experience: '',
      countries: ['US', 'SG', 'IN'],
      location_us: [],
      location_sg: [],
      location_in: [],
    },
    validate: {
      countries: (value) => value.length === 0 ? 'Please select at least one country' : null,
    },
    validateInputOnChange: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('');


  const [predictions, setPredictions] = useState<{ [key: string]: number | null }>({});
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: typeof form.values) => {
    setIsLoading(true);
    setError(null);
    setPredictions({});

    console.log("handleSubmit started");

    // Create a queue of all predictions we need to make
    const predictionQueue: { country: string; location: string }[] = [];

    for (const country_code of values.countries) {
      const locationKey = `location_${country_code.toLowerCase()}` as keyof typeof values;
      const locations = values[locationKey] as string[];

      if (locations.length === 0) {
        predictionQueue.push({ country: country_code, location: '' });
      } else {
        for (const location of locations) {
          predictionQueue.push({ country: country_code, location });
        }
      }
    }

    let completedPredictions = 0;
    const totalPredictions = predictionQueue.length;

    // Process all predictions concurrently
    const allPromises = predictionQueue.map(async ({ country, location }) => {
      const payload = {
        job_title: values.job_title,
        query: values.query,
        job_description: values.job_description,
        contract_type: values.contract_type,
        education_level: values.education_level,
        seniority: values.seniority,
        min_years_experience: values.min_years_experience,
        location_us: values.location_us,
        location_sg: values.location_sg,
        location_in: values.location_in,
      };

      const predictionKey = location ? `${country}-${location}` : country;
      console.log(`Fetching prediction for ${predictionKey}`);

      try {
        const result = await predictSalary(payload, country, location);
        completedPredictions++;

        if (result.success && result.data) {
          setPredictions(prev => ({
            ...prev,
            [predictionKey]: result.data.predicted_salary
          }));

          notifications.show({
            title: 'Prediction Received',
            message: `${predictionKey}: $${result.data.predicted_salary.toLocaleString()}`,
            color: 'green',
            icon: <CheckCircle2 size={18} />,
            autoClose: 3000,
          });
        } else {
          setError(prev => prev || result.error || 'Failed to predict salary');
          notifications.show({
            title: 'Prediction Failed',
            message: `Failed for ${predictionKey}: ${result.error}`,
            color: 'red',
            icon: <XCircle size={18} />,
          });
        }
      } catch (error) {
        console.error(`Error predicting for ${predictionKey}:`, error);
      }
    });

    await Promise.all(allPromises);

    if (completedPredictions === totalPredictions) {
      notifications.show({
        title: 'All Predictions Complete',
        message: `Successfully processed ${completedPredictions} predictions`,
        color: 'green',
        icon: <CheckCircle2 size={18} />,
      });
    }

    setIsLoading(false);
    console.log("handleSubmit finished");
  };

  return (
    <Paper shadow="xs" p="md" style={{ height: '100%' }}>
      <Title order={3} mb="lg">Salary Prediction Form</Title>

      <Select
        label="Load Preset"
        placeholder="Select a job preset"
        mb="lg"
        value={selectedPreset}
        clearable
        data={[
          { value: 'software_engineer', label: 'Software Engineer' },
          { value: 'data_scientist', label: 'Data Scientist' },
          { value: 'product_manager', label: 'Product Manager' },
        ]}
        onChange={(value) => {
          setSelectedPreset(value || '');
          if (value && jobPresets[value as keyof typeof jobPresets]) {
            form.setValues(jobPresets[value as keyof typeof jobPresets]);
          } else {
            form.reset();
          }
        }}
      />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Card withBorder shadow="sm">
          <Stack gap="md">
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label={
                    <FormLabel label="Job Title" tooltip={formTooltips.query} />
                  }
                  placeholder="Enter job title"
                  {...form.getInputProps('job_title')}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <TextInput
                  label={<FormLabel label="Query" tooltip={formTooltips.query} />}
                  placeholder="Enter query"
                  {...form.getInputProps('query')}
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <Textarea
                  label={<FormLabel label="Job Description" tooltip={formTooltips.job_description} />}
                  placeholder="Enter job description"
                  minRows={3}
                  {...form.getInputProps('job_description')}
                />
              </Grid.Col>



              <Grid.Col span={6}>
                <Select
                  label={<FormLabel label="Contract Type" tooltip={formTooltips.contract_type} />}
                  placeholder="Select contract type"
                  data={[
                    { value: 'Full-time', label: 'Full Time' },
                    { value: 'Part-time', label: 'Part Time' },
                    { value: 'Contract', label: 'Contract' },
                  ]}
                  {...form.getInputProps('contract_type')}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <Select
                  label={<FormLabel label="Education Level" tooltip={formTooltips.education_level} />}
                  placeholder="Select education level"
                  data={[
                    { value: "Bachelor's", label: "Bachelor's Degree" },
                    { value: "Master's", label: "Master's Degree" },
                    { value: 'PhD', label: 'PhD' },
                  ]}
                  {...form.getInputProps('education_level')}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <Select
                  label={<FormLabel label="Seniority" tooltip={formTooltips.seniority} />}
                  placeholder="Select seniority level"
                  data={[
                    { value: 'Entry', label: 'Entry Level' },
                    { value: 'Mid', label: 'Mid Level' },
                    { value: 'Senior', label: 'Senior Level' },
                    { value: 'Lead', label: 'Lead' },
                  ]}
                  {...form.getInputProps('seniority')}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <TextInput
                  label={<FormLabel label="Minimum Years of Experience" tooltip={formTooltips.min_years_experience} />}
                  placeholder="Enter years of experience"
                  {...form.getInputProps('min_years_experience')}
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <MultiSelect
                  label={<FormLabel label="Countries" tooltip={formTooltips.countries} />}
                  placeholder="Select at least one country for prediction"
                  required
                  error={form.errors.countries}
                  data={[
                    { value: 'US', label: 'United States' },
                    { value: 'SG', label: 'Singapore' },
                    { value: 'IN', label: 'India' },
                  ]}
                  defaultValue={['US', 'SG', 'IN']}
                  {...form.getInputProps('countries')}
                />
              </Grid.Col>

              {form.values.countries.includes('US') && (
                <Grid.Col span={12}>
                  <MultiSelect
                    label={<FormLabel label="US Locations" tooltip={formTooltips.location_us} />}
                    placeholder="Select locations in United States"
                    searchable
                    clearable
                    data={[
                      'New York',
                      'San Francisco',
                      'Seattle',
                      'Austin',
                      'Boston',
                      'Los Angeles',
                      'Chicago',
                      'Denver',
                    ]}
                    {...form.getInputProps('location_us')}
                  />
                </Grid.Col>
              )}

              {form.values.countries.includes('SG') && (
                <Grid.Col span={12}>
                  <MultiSelect
                    label={<FormLabel label="Singapore Locations" tooltip={formTooltips.location_sg} />}
                    placeholder="Select locations in Singapore"
                    searchable
                    clearable
                    data={[
                      'Central Region',
                      'East Region',
                      'North Region',
                      'North-East Region',
                      'West Region',
                    ]}
                    {...form.getInputProps('location_sg')}
                  />
                </Grid.Col>
              )}

              {form.values.countries.includes('IN') && (
                <Grid.Col span={12}>
                  <MultiSelect
                    label={<FormLabel label="India Locations" tooltip={formTooltips.location_in} />}
                    placeholder="Select locations in India"
                    searchable
                    clearable
                    data={[
                      'Bangalore',
                      'Mumbai',
                      'Delhi',
                      'Hyderabad',
                      'Chennai',
                      'Pune',
                      'Noida',
                      'Gurgaon',
                    ]}
                    {...form.getInputProps('location_in')}
                  />
                </Grid.Col>
              )}
            </Grid>

            <Stack>
              <Button
                type="submit"
                mt="md"
                loading={isLoading}
              >
                {isLoading ? 'Calculating...' : 'Submit'}
              </Button>

              {Object.keys(predictions).length > 0 && (
                <Paper p="md" withBorder>
                  <Title order={4}>Predicted Salaries</Title>
                  {Object.entries(predictions).map(([key, salary]) => {
                    const [country, location] = key.split('-');
                    return (
                      <Text key={key} size="lg" fw={500}>
                        {location ? `${country} - ${location}` : country}: ${salary?.toLocaleString() ?? 'N/A'}
                      </Text>
                    );
                  })}
                </Paper>
              )}

              {error && (
                <Text c="red" size="sm">
                  {error}
                </Text>
              )}
            </Stack>
          </Stack>
        </Card>
      </form>
    </Paper>
  );
}
