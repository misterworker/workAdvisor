'use client'

import { useState } from 'react';

export default function PostPredictionPage() {
  const [textInput, setTextInput] = useState('');
  const [predictedCategory, setPredictedCategory] = useState<string | null>(null);
  const [llmResponse, setLlmResponse] = useState<string | null>(null);

  const handlePrediction = async (event: React.FormEvent) => {
    event.preventDefault();

    // Mocking the LLM prediction response here
    const category = await mockPredictCategory(textInput);
    const response = await mockLLMResponse(textInput);

    setPredictedCategory(category);
    setLlmResponse(response);
  };

  // Mock prediction function (category)
  const mockPredictCategory = (input: string) => {
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve(input.length % 2 === 0 ? 'Research' : 'News');
      }, 1000);
    });
  };

  // Mock function to simulate LLM output
  const mockLLMResponse = (input: string) => {
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve(`LLM Response to: ${input}`);
      }, 1500);
    });
  };

  return (
    <div className="container">
      <div className="left-container">
        <h1>Post Prediction</h1>
        <form onSubmit={handlePrediction}>
          <label htmlFor="text-input">Enter Post Content</label>
          <textarea
            id="text-input"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Enter your post content here"
            required
          />
          <button type="submit">Predict Category</button>
        </form>

        {predictedCategory && (
          <div className="prediction-result">
            <h2>Predicted Category:</h2>
            <p>{predictedCategory}</p>
          </div>
        )}
      </div>

      <div className="right-container">
        {llmResponse && (
          <div className="prediction-result llm">
            <h2>LLM Response:</h2>
            <p>{llmResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
}
