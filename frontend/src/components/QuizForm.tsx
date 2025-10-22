import React, { useState } from 'react';
import { QuizData } from '../App';

interface QuizFormProps {
  onQuizGenerated: (data: QuizData) => void;
}

const QuizForm: React.FC<QuizFormProps> = ({ onQuizGenerated }) => {
  const [topic, setTopic] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic: topic.trim(),
          number_questions: numberOfQuestions,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      onQuizGenerated(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quiz-form-container">
      <div className="quiz-form">
        <h1>Quiz Generator</h1>
        <p>Generate a custom quiz on any topic!</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="topic">Topic:</label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic (e.g., Chemistry, History, Math)"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="questions">Number of Questions:</label>
            <select
              id="questions"
              value={numberOfQuestions}
              onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
              disabled={loading}
            >
              <option value={3}>3 Questions</option>
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={15}>15 Questions</option>
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="generate-btn">
            {loading ? 'Generating Quiz...' : 'Generate Quiz'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuizForm;