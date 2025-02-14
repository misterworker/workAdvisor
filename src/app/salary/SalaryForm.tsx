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
  Collapse,
  UnstyledButton,
  Progress,
} from '@mantine/core';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { HelpCircle } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useForm } from '@mantine/form';
import React, { useState, useEffect } from 'react';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

interface FormLabelProps {
  label: string;
  tooltip: string;
}

interface FormLabelProps {
  label: string;
  tooltip: string;
  style?: React.CSSProperties;
}

function FormLabel({ label, tooltip, style }: FormLabelProps) {
  const tooltipContent = tooltip.split('\n').map((line, index) => (
    <span key={index}>
      {line}
      {index < tooltip.split('\n').length - 1 && <br />}
    </span>
  ));

  return (
    <Text component="div" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', ...style }}>
      {label}
      <Tooltip
        label={tooltipContent}
        position="top-start"
        multiline
      >
        <HelpCircle size={16} style={{ cursor: 'help' }} />
      </Tooltip>
    </Text>
  );
}

import { predictSalary } from './actions';
import { jobPresets, formTooltips } from './presets';

export default function SalaryForm() {
  const driverObj = React.useRef(
    driver({
      showProgress: true,
      steps: [
        {
          popover: {
            title: 'Welcome to Salary Predictor!',
            description: 'Let me show you around our salary prediction tool.',
            side: "bottom",
            align: 'start'
          }
        },
        {
          element: '#preset-selector',
          popover: {
            title: 'Job Presets',
            description: 'Start by selecting a job preset, or create your own custom prediction with the clear button.',
            side: "top",
            align: 'start'
          }
        },
        {
          element: '#form-section',
          popover: {
            title: 'Job Details',
            description: 'Fill in the details about the job position you want to analyze.',
            side: "left",
            align: 'start'
          }
        },
        {
          element: '#countries-select',
          popover: {
            title: 'Select Countries',
            description: 'Choose one or more countries to get salary predictions for different regions.',
            side: "top",
            align: 'start'
          }
        },
        {
          element: '#saved-predictions',
          popover: {
            title: 'Saved Predictions',
            description: 'Your predictions will be saved here for future reference.',
            side: "top",
            align: 'start'
          }
        }
      ]
    })
  );

  useEffect(() => {
    // Only show the tour if it's the user's first visit
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      driverObj.current.drive();
      localStorage.setItem('hasSeenTour', 'true');
    }
  }, []);
  interface SavedPrediction {
    name: string;
    timestamp: number;
    predictions: {
      [key: string]: {
        salary: number | null;
        duration: number;
        relativeDuration: number;
      };
    };
    formValues: FormValues;
  }

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
      location_in: [],
    },
    validate: {
      countries: (value) => value.length === 0 ? 'Please select at least one country' : null,
    },
    validateInputOnChange: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('software_engineer');
  const [formExpanded, setFormExpanded] = useState(true);


  const [predictions, setPredictions] = useState<{ [key: string]: { salary: number | null; duration: number; relativeDuration: number } }>({});
  const [lastPredictionTime, setLastPredictionTime] = useState<number | null>(null);
  const [lastEndTime, setLastEndTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedPredictions, setSavedPredictions] = useState<SavedPrediction[]>([]);
  const [savePredictionName, setSavePredictionName] = useState('');
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [timer, setTimer] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const timerIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = React.useRef<number>(0);
  const fadeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Cleanup function to ensure interval is properly cleared
  const clearCurrentInterval = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setTimer(0);
  };

  // Start timer function
  const startTimer = () => {
    clearCurrentInterval();
    startTimeRef.current = performance.now();
    timerIntervalRef.current = setInterval(() => {
      setTimer(performance.now() - startTimeRef.current);
    }, 10);
  };

  const handleSubmit = async (values: typeof form.values) => {
    setIsLoading(true);
    setError(null);
    setPredictions({});
    setFormExpanded(false);
    setLastPredictionTime(null);
    setLastEndTime(null);
    setProgress({ completed: 0, total: 0 });
    setTimer(0);
    clearCurrentInterval();

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

    setProgress({ completed: 0, total: predictionQueue.length });
    setShowProgress(true);
    let completedPredictions = 0;
    const totalPredictions = predictionQueue.length;

    // Process predictions sequentially
    for (const { country, location } of predictionQueue) {
      // Reset and start timer for each prediction
      startTimer();

      const payload = {
        job_title: values.job_title,
        query: values.query,
        job_description: values.job_description,
        contract_type: values.contract_type,
        education_level: values.education_level,
        seniority: values.seniority,
        min_years_experience: values.min_years_experience,
        location_us: values.location_us,
        location_in: values.location_in,
      };

      const predictionKey = location ? `${country}-${location}` : country;
      console.log(`Fetching prediction for ${predictionKey}`);

      try {
        const startTime = performance.now();
        const result = await predictSalary(payload, country, location);
        const endTime = performance.now();
        const duration = endTime - startTime;
        const relativeDuration = lastEndTime ? startTime - lastEndTime : duration;
        setLastEndTime(endTime);
        clearCurrentInterval();
        completedPredictions++;
        setProgress(prev => ({ ...prev, completed: completedPredictions }));

        if (result.success && result.data) {
          setPredictions(prev => ({
            ...prev,
            [predictionKey]: {
              salary: result.data.predicted_salary,
              duration: duration,
              relativeDuration: relativeDuration
            }
          }));
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
    }

    if (completedPredictions === totalPredictions) {
      notifications.show({
        title: 'All Predictions Complete',
        message: `Successfully processed ${completedPredictions} predictions`,
        color: 'green',
        icon: <CheckCircle2 size={18} />,
      });
    }

    clearCurrentInterval();
    setIsLoading(false);

    // Keep progress visible then fade out
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
    }
    fadeTimeoutRef.current = setTimeout(() => {
      setShowProgress(false);
    }, 1000);

    console.log("handleSubmit finished");
  };


  // Set initial preset values when component mounts
  // Load saved predictions from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('savedPredictions');
    if (saved) {
      setSavedPredictions(JSON.parse(saved));
    }
    if (jobPresets.software_engineer) {
      form.setValues(jobPresets.software_engineer);
    }
  }, []);

  // Cleanup intervals and timeouts when component unmounts
  React.useEffect(() => {
    return () => {
      clearCurrentInterval();
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Paper shadow="xs" p="md" style={{ height: '100%' }}>
      <Group justify="space-between" mb="md">
        <Title order={3} id="welcome-message">Salary Prediction Form</Title>
        <Button
          variant="subtle"
          size="xs"
          onClick={() => driverObj.current.drive()}
        >
          Show Tour
        </Button>
      </Group>

      <Collapse in={!isLoading && formExpanded}
        id="preset-selector"
      >
        <Stack gap="xs">
          <Group mb="md">
            <Button
              variant={selectedPreset === 'software_engineer' ? 'filled' : 'light'}
              onClick={() => {
                setSelectedPreset('software_engineer');
                form.setValues(jobPresets.software_engineer);
              }}
              size="sm"
            >
              Software Engineer
            </Button>
            <Button
              variant={selectedPreset === 'data_scientist' ? 'filled' : 'light'}
              onClick={() => {
                setSelectedPreset('data_scientist');
                form.setValues(jobPresets.data_scientist);
              }}
              size="sm"
            >
              Data Scientist
            </Button>
            <Button
              variant={selectedPreset === 'product_manager' ? 'filled' : 'light'}
              onClick={() => {
                setSelectedPreset('product_manager');
                form.setValues(jobPresets.product_manager);
              }}
              size="sm"
            >
              Product Manager
            </Button>
            <Button
              variant="subtle"
              color="gray"
              onClick={() => {
                setSelectedPreset('');
                form.reset();
              }}
              size="sm"
            >
              Clear
            </Button>
          </Group>
        </Stack>
      </Collapse>

      <form onSubmit={form.onSubmit(handleSubmit)} style={{ marginTop: formExpanded ? 0 : '1rem' }}>
        <Card withBorder shadow="sm">
          <Stack gap="md">
            <Collapse in={formExpanded} id="form-section">
              <Grid >
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

                <Grid.Col span={12} id="countries-select">
                  <FormLabel
                    label="Countries"
                    tooltip={formTooltips.countries}
                    style={{
                      fontSize: 'var(--mantine-font-size-sm)',
                      fontWeight: 500,
                      marginBottom: '0.25rem'
                    }}
                  />
                  <Group>
                    <Button
                      variant={form.values.countries.includes('US') ? 'filled' : 'light'}
                      onClick={() => {
                        const newCountries = form.values.countries.includes('US')
                          ? form.values.countries.filter(c => c !== 'US')
                          : [...form.values.countries, 'US'];
                        form.setFieldValue('countries', newCountries);
                      }}
                      size="sm"
                    >
                      <Text style={{
                        textDecoration: form.values.countries.includes('US') ? 'none' : 'line-through'
                      }}>
                        United States {form.values.countries.includes('US') && '✓'}
                      </Text>
                    </Button>
                    <Button
                      variant={form.values.countries.includes('SG') ? 'filled' : 'light'}
                      onClick={() => {
                        const newCountries = form.values.countries.includes('SG')
                          ? form.values.countries.filter(c => c !== 'SG')
                          : [...form.values.countries, 'SG'];
                        form.setFieldValue('countries', newCountries);
                      }}
                      size="sm"
                    >
                      <Text style={{
                        textDecoration: form.values.countries.includes('SG') ? 'none' : 'line-through'
                      }}>
                        Singapore {form.values.countries.includes('SG') && '✓'}
                      </Text>
                    </Button>
                    <Button
                      variant={form.values.countries.includes('IN') ? 'filled' : 'light'}
                      onClick={() => {
                        const newCountries = form.values.countries.includes('IN')
                          ? form.values.countries.filter(c => c !== 'IN')
                          : [...form.values.countries, 'IN'];
                        form.setFieldValue('countries', newCountries);
                      }}
                      size="sm"
                    >
                      <Text style={{
                        textDecoration: form.values.countries.includes('IN') ? 'none' : 'line-through'
                      }}>
                        India {form.values.countries.includes('IN') && '✓'}
                      </Text>
                    </Button>
                  </Group>
                  {form.errors.countries && (
                    <Text c="red" size="sm">
                      {form.errors.countries}
                    </Text>
                  )}
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
            </Collapse>

            <Collapse in={showProgress}>
              <Stack gap="xs" style={{ transition: 'opacity 0.5s ease-out' }}>
                <Progress
                  value={(progress.completed / progress.total) * 100}
                  animated={isLoading}
                  size="xl"
                  radius="xl"
                />
                <Text size="sm" ta="center">
                  {isLoading ?
                    `Processing ${progress.completed} of ${progress.total} predictions` :
                    `Completed ${progress.total} predictions`
                  }
                </Text>
                <Text size="sm" ta="center" c="dimmed">
                  {(timer / 1000).toFixed(2)}s
                </Text>
              </Stack>
            </Collapse>
            {Object.keys(predictions).length > 0 ? (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  setPredictions({});
                  setError(null);
                  setFormExpanded(true);
                  setLastPredictionTime(null);
                  setLastEndTime(null);
                  setProgress({ completed: 0, total: 0 });
                  setTimer(0);
                  setShowProgress(false);
                  clearCurrentInterval();
                }}
                type="button"
                color="gray"
              >
                Start New Prediction
              </Button>
            ) : (
              <Button
                type="submit"
                mt="md"
                loading={isLoading}
              >
                {isLoading ? 'Calculating...' : 'Submit'}
              </Button>
            )}

            {Object.keys(predictions).length > 0 && (
              <Paper p="md" withBorder>
                <Title order={4} mb="md">Predicted Salaries</Title>
                <Grid>
                  {['US', 'SG', 'IN'].filter(country =>
                    Object.keys(predictions).some(key => key.startsWith(country))
                  ).map(country => (
                    <Grid.Col key={country} span={{ base: 12, sm: 6, lg: 4 }}>
                      <Card withBorder shadow="sm">
                        <Stack gap="xs">
                          <Group justify="space-between">
                            <Stack gap="xs">
                              <Title order={5}>
                                {country === 'US' ? 'United States' :
                                  country === 'SG' ? 'Singapore' :
                                    'India'}
                              </Title>
                              {predictions[country]?.salary && (
                                <Stack gap={0}>
                                  <Text fw={700} size="lg" c="blue" ta="right">
                                    ${predictions[country].salary.toLocaleString()}
                                  </Text>
                                  <Text size="xs" c="dimmed" ta="left">
                                    {(predictions[country].relativeDuration / 1000).toFixed(2)}s
                                  </Text>
                                </Stack>
                              )}
                            </Stack>
                          </Group>

                          {/* Location-specific predictions */}
                          {Object.entries(predictions)
                            .filter(([key]) => key.startsWith(country) && key !== country)
                            .map(([key, data]) => {
                              const location = key.split('-')[1];
                              return (
                                <Card key={key} withBorder p="xs">
                                  <Group justify="space-between" wrap="nowrap">
                                    <Text fw={500} size="sm" style={{ flex: 1 }}>
                                      {location}
                                    </Text>
                                    <Stack gap={0} align="flex-end">
                                      <Text fw={700} size="sm">
                                        ${data.salary?.toLocaleString() ?? 'N/A'}
                                      </Text>
                                      <Text size="xs" c="dimmed">
                                        {(data.relativeDuration / 1000).toFixed(2)}s
                                      </Text>
                                    </Stack>
                                  </Group>
                                </Card>
                              );
                            })}
                        </Stack>
                      </Card>
                    </Grid.Col>
                  ))}
                </Grid>
              </Paper>
            )}

            {Object.keys(predictions).length > 0 && (
              <Card withBorder>
                <Stack gap="md">
                  <Title order={4}>Save Prediction</Title>
                  <Group>
                    <TextInput
                      placeholder="Enter a name for this prediction"
                      value={savePredictionName}
                      onChange={(event) => setSavePredictionName(event.currentTarget.value)}
                      style={{ flex: 1 }}
                    />
                    <Button
                      onClick={() => {
                        if (!savePredictionName.trim()) {
                          notifications.show({
                            title: 'Error',
                            message: 'Please enter a name for the prediction',
                            color: 'red',
                          });
                          return;
                        }

                        const newSavedPrediction: SavedPrediction = {
                          name: savePredictionName,
                          timestamp: Date.now(),
                          predictions,
                          formValues: form.values,
                        };

                        const updatedSavedPredictions = [...savedPredictions, newSavedPrediction];
                        setSavedPredictions(updatedSavedPredictions);
                        localStorage.setItem('savedPredictions', JSON.stringify(updatedSavedPredictions));

                        setSavePredictionName('');
                        notifications.show({
                          title: 'Success',
                          message: 'Prediction saved successfully',
                          color: 'green',
                        });
                      }}
                    >
                      Save
                    </Button>
                  </Group>
                </Stack>
              </Card>
            )}


            {error && (
              <Text c="red" size="sm">
                {error}
              </Text>
            )}
          </Stack>
        </Card>
      </form>

      {savedPredictions.length > 0 && (
        <Card withBorder mt="md" id="saved-predictions">
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={4}>Saved Predictions</Title>
              <Text size="sm" c="dimmed">{savedPredictions.length} saved</Text>
            </Group>
            <Grid>
              {savedPredictions
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((saved, index) => (
                  <Grid.Col key={index} span={{ base: 12, sm: 6, lg: 4 }}>
                    <Card withBorder shadow="sm">
                      <Stack gap="md">
                        <Group justify="space-between" wrap="nowrap">
                          <Stack gap={2}>
                            <Text fw={700} truncate>
                              {saved.name}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {new Date(saved.timestamp).toLocaleString()}
                            </Text>
                          </Stack>
                        </Group>

                        <Stack gap="xs">
                          <Text size="sm">
                            {saved.formValues.job_title || saved.formValues.query}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {Object.keys(saved.predictions).length} predictions
                          </Text>
                        </Stack>

                        <Group grow>
                          <Button
                            variant="light"
                            size="xs"
                            onClick={() => {
                              setPredictions(saved.predictions);
                              form.setValues(saved.formValues);
                              setFormExpanded(false);
                              notifications.show({
                                title: 'Prediction Loaded',
                                message: `Loaded "${saved.name}"`,
                                color: 'blue',
                              });
                            }}
                          >
                            Load
                          </Button>
                          <Button
                            variant="light"
                            color="red"
                            size="xs"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete "${saved.name}"?`)) {
                                const updatedSavedPredictions = savedPredictions.filter((_, i) => i !== index);
                                setSavedPredictions(updatedSavedPredictions);
                                localStorage.setItem('savedPredictions', JSON.stringify(updatedSavedPredictions));
                                notifications.show({
                                  title: 'Deleted',
                                  message: `Deleted "${saved.name}"`,
                                  color: 'red',
                                });
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </Group>
                      </Stack>
                    </Card>
                  </Grid.Col>
                ))}
            </Grid>
          </Stack>
        </Card>
      )}
    </Paper>
  );
}
