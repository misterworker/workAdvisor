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
  Paper,
} from '@mantine/core';
import { useForm } from '@mantine/form';

export default function SalaryForm() {
  const form = useForm({
    initialValues: {
      job_description: '',
      job_title: '',
      query: '',
      soft_skills: [],
      hard_skills: [],
      location_flexibility: 'unknown',
      contract_type: 'unknown',
      education_level: 'unknown',
      seniority: 'unknown',
      min_years_experience: 0,
      field_of_study: [],
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    console.log(values);
    // Handle form submission here
  };

  return (
    <Paper shadow="xs" p="md" style={{ height: '100%' }}>
      <Title order={2} mb="lg">Salary Prediction Form</Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Job Title"
            placeholder="Enter job title"
            required
            {...form.getInputProps('job_title')}
          />

          <Textarea
            label="Job Description"
            placeholder="Enter job description"
            required
            minRows={3}
            {...form.getInputProps('job_description')}
          />

          <TextInput
            label="Query"
            placeholder="Enter query"
            {...form.getInputProps('query')}
          />

          <MultiSelect
            label="Soft Skills"
            placeholder="Select soft skills"
            data={[
              'Communication',
              'Leadership',
              'Teamwork',
              'Problem Solving',
              'Time Management',
            ]}
            searchable
            clearable
            nothingFoundMessage="Nothing found..."
            {...form.getInputProps('soft_skills')}
          />

          <MultiSelect
            label="Hard Skills"
            placeholder="Select hard skills"
            data={[
              'JavaScript',
              'Python',
              'React',
              'Node.js',
              'SQL',
            ]}
            searchable
            clearable
            nothingFoundMessage="Nothing found..."
            {...form.getInputProps('hard_skills')}
          />

          <Select
            label="Location Flexibility"
            placeholder="Select location flexibility"
            data={[
              { value: 'remote', label: 'Remote' },
              { value: 'hybrid', label: 'Hybrid' },
              { value: 'onsite', label: 'Onsite' },
              { value: 'unknown', label: 'Unknown' },
            ]}
            {...form.getInputProps('location_flexibility')}
          />

          <Select
            label="Contract Type"
            placeholder="Select contract type"
            data={[
              { value: 'full_time', label: 'Full Time' },
              { value: 'part_time', label: 'Part Time' },
              { value: 'contract', label: 'Contract' },
              { value: 'unknown', label: 'Unknown' },
            ]}
            {...form.getInputProps('contract_type')}
          />

          <Select
            label="Education Level"
            placeholder="Select education level"
            data={[
              { value: 'high_school', label: 'High School' },
              { value: 'bachelors', label: 'Bachelor\'s Degree' },
              { value: 'masters', label: 'Master\'s Degree' },
              { value: 'phd', label: 'PhD' },
              { value: 'unknown', label: 'Unknown' },
            ]}
            {...form.getInputProps('education_level')}
          />

          <Select
            label="Seniority"
            placeholder="Select seniority level"
            data={[
              { value: 'entry', label: 'Entry Level' },
              { value: 'mid', label: 'Mid Level' },
              { value: 'senior', label: 'Senior Level' },
              { value: 'lead', label: 'Lead' },
              { value: 'unknown', label: 'Unknown' },
            ]}
            {...form.getInputProps('seniority')}
          />

          <NumberInput
            label="Minimum Years of Experience"
            placeholder="Enter minimum years of experience"
            min={0}
            decimalScale={1}
            {...form.getInputProps('min_years_experience')}
          />

          <MultiSelect
            label="Field of Study"
            placeholder="Select field of study"
            data={[
              'Computer Science',
              'Engineering',
              'Business',
              'Mathematics',
              'Physics',
            ]}
            searchable
            {...form.getInputProps('field_of_study')}
          />

          <Button type="submit" mt="md">
            Submit
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
