'use client';

import React, { useState } from "react";

export default function PostPredictionPage() {
  const [textInput, setTextInput] = useState("");
  const [category, setCategory] = useState("A Levels");
  const [predictedCategory, setPredictedCategory] = useState<string | null>(null);
  const [llmResponse, setLlmResponse] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<Record<string, any> | null>(null);

  const handlePrediction = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch("https://validate-post-78306345447.asia-southeast1.run.app/validate_post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: textInput,
          category,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPredictedCategory(category); // Use the selected category as the predicted one
        setAnalysisResult(data.result); // Display the structured output
        setLlmResponse(data.response); // Display the LLM response
      } else {
        const error = await response.json();
        console.error("Error:", error.error);
        setLlmResponse(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error connecting to server:", error);
      setLlmResponse("Error connecting to the server.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Section */}
        <div className="flex-1 bg-gray-800 p-6 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold mb-4">Post Prediction</h1>
          <form onSubmit={handlePrediction} className="space-y-4">
            <div>
              <label htmlFor="category-select" className="block text-sm font-medium mb-1">
                Select Category
              </label>
              <select
                id="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600"
              >
                <option value="A Levels">A Levels</option>
                <option value="GCSE">GCSE</option>
                <option value="Job Experience">Job Experience</option>
                <option value="Studies">Studies</option>
              </select>
            </div>

            <div>
              <label htmlFor="text-input" className="block text-sm font-medium mb-1">
                Enter Post Content
              </label>
              <textarea
                id="text-input"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter your post content here"
                required
                className="w-full p-2 h-32 rounded-lg bg-gray-700 border border-gray-600"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
            >
              Validate Post
            </button>
          </form>

          {predictedCategory && (
            <div className="mt-6 bg-gray-700 p-4 rounded-lg">
              <h2 className="text-lg font-semibold">Selected Category:</h2>
              <p>{predictedCategory}</p>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex-1 bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">Analysis Result</h2>
          {analysisResult ? (
            <pre className="bg-gray-700 p-4 rounded-lg overflow-auto">
              {JSON.stringify(analysisResult, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-400">No analysis result available.</p>
          )}

          <h2 className="text-xl font-bold mt-6 mb-4">LLM Response</h2>
          {llmResponse ? (
            <p className="bg-gray-700 p-4 rounded-lg">{llmResponse}</p>
          ) : (
            <p className="text-gray-400">No response yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
