"use client";

import React, { useState } from 'react';
import { TextInput, Button, Card, Select, Container, Grid, Title, Text } from '@mantine/core';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title as ChartTitle, Tooltip, Legend } from 'chart.js';
import { ChartData } from 'chart.js';

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Anguilla", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", 
  "Austria", "Azerbaijan", "The Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", 
  "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "British Virgin Islands", "Brunei", "Bulgaria", 
  "Burkina Faso", "Burundi", "Cape Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", 
  "China", "Colombia", "Comoros", "Republic of the Congo", "Cook Islands", "Costa Rica", "Ivory Coast", "Croatia", "Cuba", 
  "Cyprus", "Czech Republic", "North Korea", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", 
  "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", 
  "Fiji", "Finland", "France", "Gabon", "The Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", 
  "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Vatican City", "Honduras", "Hungary", "Iceland", "India", "Indonesia", 
  "Iran", "Iraq", "Republic of Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", 
  "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", 
  "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", 
  "Mexico", "Federated States of Micronesia", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", 
  "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "North Macedonia", 
  "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", 
  "Qatar", "South Korea", "Moldova", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", 
  "Samoa", "San Marino", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", 
  "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Palestinian National Authority", "Sudan", 
  "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Thailand", "East Timor", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", 
  "Tunisia", "Turkey", "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", 
  "Tanzania", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

export default function Education() {
    const [formData, setFormData] = useState({
        country: 'USA', // Default value to avoid null
        oosr: '',
        enrollment: '',
        proficiency: '',
        literacy: '',
        unemployment: '',
    });

    const [prediction, setPrediction] = useState<string | null>(null);
    const [confidence, setConfidence] = useState<number | null>(null);
    const [chartData, setChartData] = useState<ChartData<'bar', number[], string> | undefined>(undefined);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const fetchPrediction = async () => {
        const response = await fetch('https://your-cloud-run-url/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        const data = await response.json();
        setPrediction(data.prediction);
        setConfidence(data.confidence);
        setChartData({
            labels: ['OOSR', 'Enrollment', 'Proficiency', 'Literacy', 'Unemployment'],
            datasets: [{
                label: 'Metrics',
                data: [
                    parseFloat(formData.oosr),
                    parseFloat(formData.enrollment),
                    parseFloat(formData.proficiency),
                    parseFloat(formData.literacy),
                    parseFloat(formData.unemployment)
                ],
                backgroundColor: 'blue',
            }],
        });
    };

    // Handle CSV download without file-saver
    const downloadCSV = () => {
        const csvData = `Country,Prediction,Confidence\n${formData.country},${prediction},${confidence}`;
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'education_report.csv';
        document.body.appendChild(a); // Append to DOM (optional, but safe)
        a.click();
        document.body.removeChild(a); // Clean up
        window.URL.revokeObjectURL(url); // Clean up the URL object
    };
    

    // Handle PDF download using window.print()
    const downloadPDF = () => {
        const docContent = `
            Country: ${formData.country}\n
            Prediction: ${prediction}\n
            Confidence: ${confidence}%\n
        `;
        
        // Create a simple document using the browser's print functionality
        const printWindow = window.open('', '', 'height=600,width=800');
        if (printWindow) { // Check if the window was opened successfully
            printWindow.document.write('<pre>' + docContent + '</pre>');
            printWindow.document.close();
            printWindow.print();
        } else {
            alert('Failed to open print window. Please check your browser settings.');
        }
    };

    return (
        <Container>
            <Title order={1} style={{ marginTop: '20px' }}>Education System Intervention</Title>
            <Grid style={{ marginTop: '20px' }}>
                <Grid.Col span={6}>
                    <Card shadow="sm" p="lg">
                        <Title order={3}>Input Metrics</Title>
                        <Select 
                            label="Country" 
                            placeholder="Select a country" 
                            name="country" 
                            value={formData.country} 
                            onChange={(value) => setFormData({ ...formData, country: value || 'USA' })} 
                            data={countries} 
                        />
                        <TextInput label="Out-of-School Rate" name="oosr" value={formData.oosr} onChange={handleChange} />
                        <TextInput label="Enrollment Rate" name="enrollment" value={formData.enrollment} onChange={handleChange} />
                        <TextInput label="Proficiency Level" name="proficiency" value={formData.proficiency} onChange={handleChange} />
                        <TextInput label="Literacy Rate" name="literacy" value={formData.literacy} onChange={handleChange} />
                        <TextInput label="Unemployment Rate" name="unemployment" value={formData.unemployment} onChange={handleChange} />
                        <Button onClick={fetchPrediction} fullWidth mt="md">Predict</Button>
                    </Card>
                </Grid.Col>

                <Grid.Col span={6}>
                    <Card shadow="sm" p="lg">
                        <Title order={3}>Prediction Output</Title>
                        {prediction && confidence !== null && chartData && (
                            <>
                                <Text size="lg">Intervention Needed: <strong>{prediction}</strong></Text>
                                <Text size="sm">Confidence: {confidence}%</Text>
                                <Bar data={chartData} />
                                <Button onClick={downloadCSV} mt="md">Download CSV</Button>
                                <Button onClick={downloadPDF} mt="md" ml="sm">Download PDF</Button>
                            </>
                        )}
                    </Card>
                </Grid.Col>
            </Grid>
        </Container>
    );
}