import React, { useState } from 'react';
import './App.css';
import QuizForm from './components/QuizForm';
import QuizPage from './components/QuizPage';

export interface Question {
  question: string;
  options: string[];
  answer: string;
}

export interface QuizData {
  questions: Question[];
}

function App() {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentPage, setCurrentPage] = useState<'form' | 'quiz'>('form');

  const handleQuizGenerated = (data: QuizData) => {
    setQuizData(data);
    setCurrentPage('quiz');
  };

  const handleBackToForm = () => {
    setQuizData(null);
    setCurrentPage('form');
  };

  return (
    <div className="App">
      {currentPage === 'form' ? (
        <QuizForm onQuizGenerated={handleQuizGenerated} />
      ) : (
        <QuizPage 
          quizData={quizData!} 
          onBackToForm={handleBackToForm} 
        />
      )}
    </div>
  );
}

export default App;
