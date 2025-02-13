"use client";

import React, { useState } from "react";
import { Paper, Title, Stack, TextInput, Button, Select, Textarea, Loader, Text, Box } from "@mantine/core";

// Helper function to format LLM response
const formatLlmResponse = (response: string) => {
  // 1. Bold formatting for text enclosed in **
  let formattedResponse = response.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // 2. Convert URLs into clickable links
  formattedResponse = formattedResponse.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline">$1</a>'
  );

  // 3. Add new lines when '-' is detected (indicating bullet points)
  formattedResponse = formattedResponse.replace(/- /g, "<br>• ");

  return formattedResponse;
};

export default function PostPredictionPage() {
  const [textInput, setTextInput] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [category, setCategory] = useState("A Level");
  const [llmResponse, setLlmResponse] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePrediction = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("https://validate-post-78306345447.asia-southeast1.run.app/validate_post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: textInput, title: postTitle, category }),
      });

      if (response.ok) {
        const data = await response.json();
        const { ridiculous, leaks_pii, relevant_to_category } = data.result;

        if (!ridiculous && !leaks_pii && relevant_to_category) {
          const predictionResponse = await fetch("https://post-validation-78306345447.asia-southeast1.run.app/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ post_content: textInput, post_title: postTitle, category }),
          });

          if (predictionResponse.ok) {
            const predictionData = await predictionResponse.json();
            setAnalysisResult(predictionData);
          } else {
            const error = await predictionResponse.json();
            setLlmResponse(`Error with prediction: ${error.error}`);
          }
        } else {
          setAnalysisResult(null);
        }
        setLlmResponse(data.response);
      } else {
        const error = await response.json();
        setLlmResponse(`Error: ${error.error}`);
      }
    } catch (error) {
      setLlmResponse("Error connecting to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper shadow="xs" p="xl" radius="md" style={{ minHeight: "100vh", backgroundColor: "#1A1B1E" }}>
      {/* Page Title */}
      <Title order={2} mb="lg" c="white">
        Post Prediction & Analysis
      </Title>

      <Stack>
        {/* Form Section */}
        <Paper p="lg" radius="md" shadow="md" style={{ backgroundColor: "#2C2E33" }}>
          <Title order={3} mb="md" c="white">
            Enter Your Post Details
          </Title>
          <form onSubmit={handlePrediction}>
            <Stack>
              {/* Category Select */}
              <Select
                label="Select Category"
                value={category}
                onChange={(value) => setCategory(value || "A Level")}
                data={["A Level", "GCSE", "Job Experience", "Study Support"]}
                disabled={loading}
                radius="md"
              />

              {/* Post Title */}
              <TextInput
                label="Post Title"
                placeholder="Enter your post title"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                disabled={loading}
                radius="md"
              />

              {/* Post Content */}
              <Textarea
                label="Post Content"
                placeholder="Enter your post content"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                minRows={4}
                disabled={loading}
                radius="md"
              />

              {/* Submit Button */}
              <Button type="submit" fullWidth color="blue" radius="md" disabled={loading}>
                {loading ? <Loader size="sm" color="white" /> : "Validate Post"}
              </Button>
            </Stack>
          </form>
        </Paper>

        {/* Analysis Results */}
        <Paper p="lg" radius="md" shadow="md" style={{ backgroundColor: "#2C2E33" }}>
          <Title order={3} mb="md" c="white">
            Analysis Result
          </Title>

          {analysisResult ? (
            <Stack>
              {analysisResult.predictions.map((prediction: any, index: number) => (
                <Box key={index} style={{ backgroundColor: "#373A40", padding: "12px", borderRadius: "8px" }}>
                  <Text size="sm" c="gray.3">
                    Day {prediction.days_since_post}:
                  </Text>
                  <Text size="lg" c="blue.4">
                    {prediction.predicted_class}
                  </Text>
                </Box>
              ))}

              {analysisResult.predictions.find((p: any) => p.days_since_post === 7) && (
                <Box style={{ backgroundColor: "#1E88E5", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
                  <Text size="lg" c="white">
                    Predicted Engagement after 7 days:{" "}
                    {analysisResult.predictions.find((p: any) => p.days_since_post === 7).predicted_class}
                  </Text>
                </Box>
              )}
            </Stack>
          ) : (
            <Text size="sm" c="gray.5">
              Follow LLM instructions to improve your post!
            </Text>
          )}
        </Paper>

        {/* AI Generated Feedback Section */}
        <Paper p="lg" radius="md" shadow="md" style={{ backgroundColor: "#2C2E33" }}>
          <Title order={3} mb="md" c="white">
            AI Generated Feedback
          </Title>
          {llmResponse ? (
            <Box
              style={{
                backgroundColor: "#373A40",
                padding: "16px",
                borderRadius: "8px",
                color: "white",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
              dangerouslySetInnerHTML={{
                __html: formatLlmResponse(llmResponse),
              }}
            />
          ) : (
            <Text size="sm" c="gray.5">
              No response yet. Please try submitting your post.
            </Text>
          )}
        </Paper>
      </Stack>
    </Paper>
  );
}
