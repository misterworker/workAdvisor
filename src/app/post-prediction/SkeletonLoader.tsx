import React from 'react';
import { Skeleton, Stack, Paper, Text } from '@mantine/core';

const SkeletonLoader: React.FC = () => {
  return (
    <Stack>
      <Paper p="lg" radius="md" shadow="md" style={{ backgroundColor: "#2C2E33" }}>
        <Skeleton height={30} width="60%" />
        <Skeleton height={20} radius="md" style={{ marginTop: 8 }} />
        <Skeleton height={80} radius="md" style={{ marginTop: 16 }} />
        <Skeleton height={50} radius="md" style={{ marginTop: 16 }} />
      </Paper>

      {/* Skeleton for AI Feedback Section */}
      <Paper p="lg" radius="md" shadow="md" style={{ backgroundColor: "#2C2E33", marginTop: 16 }}>
        <Skeleton height={30} width="50%" />
        <Skeleton height={200} style={{ marginTop: 16 }} />
      </Paper>

      {/* Skeleton for Analysis Result Section */}
      <Paper p="lg" radius="md" shadow="md" style={{ backgroundColor: "#2C2E33", marginTop: 16 }}>
        <Skeleton height={30} width="60%" />
        <Skeleton height={200} style={{ marginTop: 16 }} />
      </Paper>

      {/* Skeleton for History Section */}
      <Paper p="lg" radius="md" shadow="md" style={{ backgroundColor: "#2C2E33", marginTop: 16 }}>
        <Skeleton height={30} width="50%" />
        <Skeleton height={300} style={{ marginTop: 16 }} />
      </Paper>
    </Stack>
  );
};

export default SkeletonLoader;
