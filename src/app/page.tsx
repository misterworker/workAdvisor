'use client';

import { Container, Title, Text, Button, Group, Stack, ThemeIcon } from '@mantine/core';
import { Briefcase, Bot, BarChart, FileText, UserCog, School } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [lastHoveredButton, setLastHoveredButton] = useState<"salary" | "postPrediction" | "education">("salary");
  const [isHovered, setIsHovered] = useState(false);
  const [autoTransition, setAutoTransition] = useState(true);

  const featureData = {
    salary: [
      {
        icon: <Briefcase size={30} />,
        title: 'Salary Insights',
        description: 'Get personalized salary recommendations based on your experience and market data.',
      },
      {
        icon: <Bot size={30} />,
        title: 'AI-Powered Advice',
        description: 'Receive tailored negotiation strategies and professional development guidance.',
      },
      {
        icon: <BarChart size={30} />,
        title: 'Market Analysis',
        description: 'Stay informed with real-time industry trends and compensation benchmarks.',
      },
    ],
    postPrediction: [
      {
        icon: <BarChart size={30} />,
        title: 'Engagement Prediction',
        description: 'Predict post engagement using AI based on content, timing, and past data to maximize visibility.',
      },
      {
        icon: <Bot size={30} />,
        title: 'AI-Generated Feedback',
        description: 'Get real-time AI feedback to improve your post, with suggestions on tone, keywords, and structure.',
      },
      {
        icon: <UserCog size={30} />,
        title: 'Personalized Guidance',
        description: 'Receive tailored advice on crafting posts that resonate with your audience and goals.',
      },
    ],
    education: [
      {
        icon: <School size={30} />,
        title: 'Educational Equity',
        description: 'Identify and address educational disparities through data-driven insights.',
      },
      {
        icon: <BarChart size={30} />,
        title: 'Predictive Modeling',
        description: 'Analyze education trends and flag regions needing intervention.',
      },
      {
        icon: <FileText size={30} />,
        title: 'Policy Recommendations',
        description: 'Generate actionable insights to promote equal learning opportunities.',
      },
    ],    
  };

  useEffect(() => {
    if (!isHovered && autoTransition) {
      const intervalId = setInterval(() => {
        setLastHoveredButton((prev: "salary" | "postPrediction" | "education") => {
          if (prev === "salary") return "postPrediction";
          if (prev === "postPrediction") return "education";
          return "salary";
        });
      }, 3750);

      return () => clearInterval(intervalId);
    }
  }, [autoTransition, isHovered]);

  const getButtonClass = (button: string) => {
    return button === lastHoveredButton ? 'button-scale' : '';
  };

  const handleMouseEnter = (section: "salary" | "postPrediction" | "education") => {
    setLastHoveredButton(section);
    setIsHovered(true);
    setAutoTransition(false);
  };  

  const handleMouseLeave = () => {
    setIsHovered(false);
    setAutoTransition(true);
  };

  return (
    <Container size="lg" py={{ base: 'xl', md: '6rem' }}>
      {/* Hero Section */}
      <Stack ta="center" gap="xl" mb={50}>
        <Title size="h1" fw={900}>
          WorkAdvisor
        </Title>
        <Text size="xl" maw={600} mx="auto" c="dimmed">
          Your AI-powered career companion for salary negotiations and professional growth
        </Text>
        <Group justify="center" mt="md">
          <Button
            component={Link}
            href="/salary"
            size="lg"
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan' }}
            onMouseEnter={() => handleMouseEnter('salary')}
            onMouseLeave={handleMouseLeave}
            className={getButtonClass('salary')}
          >
            Salary AI
          </Button>
          <Button
            component={Link}
            href="/post-prediction"
            size="lg"
            variant="gradient"
            gradient={{ from: 'violet', to: 'grape', deg: 45 }}
            onMouseEnter={() => handleMouseEnter('postPrediction')}
            onMouseLeave={handleMouseLeave}
            className={getButtonClass('postPrediction')}
          >
            Post Predictor AI
          </Button>
          <Button
            component={Link}
            href="/education"
            size="lg"
            variant="gradient"
            gradient={{ from: 'teal', to: 'lime', deg: 45 }}
            onMouseEnter={() => handleMouseEnter('education')}
            onMouseLeave={handleMouseLeave}
            className={getButtonClass('education')}
          >
            Education AI
          </Button>
        </Group>
      </Stack>

      {/* Features Section */}
      <Container size="md" py="xl">
        <Stack gap="xl">
          {/* Map the features based on the last hovered button */}
          {featureData[lastHoveredButton].map((feature, index) => (
            <Group key={index} gap="lg" justify="center">
              <ThemeIcon size={54} radius="md" variant="light">
                {feature.icon}
              </ThemeIcon>
              <Stack gap={0} style={{ flex: 1 }}>
                <Text size="lg" fw={500} mb={4}>
                  {feature.title}
                </Text>
                <Text c="dimmed">
                  {feature.description}
                </Text>
              </Stack>
            </Group>
          ))}
        </Stack>
      </Container>
    </Container>
  );
}
