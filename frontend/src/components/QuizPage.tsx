import React, { useState } from 'react';
import { QuizData } from '../App';

interface QuizPageProps {
  quizData: QuizData;
  onBackToForm: () => void;
  onQuizCompleted: (score: number, totalQuestions: number) => void;
  onQuizProgress: (userAnswers: UserAnswer[]) => void;
}

interface UserAnswer {
  questionIndex: number;
  selectedOption: string;
}

const QuizPage: React.FC<QuizPageProps> = ({ quizData, onBackToForm, onQuizCompleted, onQuizProgress }) => {
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>(quizData.userAnswers || []);
  const [showResults, setShowResults] = useState(false);

  const handleOptionSelect = (questionIndex: number, selectedOption: string) => {
    setUserAnswers(prev => {
      const existing = prev.find(answer => answer.questionIndex === questionIndex);
      let newAnswers;
      if (existing) {
        newAnswers = prev.map(answer => 
          answer.questionIndex === questionIndex 
            ? { ...answer, selectedOption }
            : answer
        );
      } else {
        newAnswers = [...prev, { questionIndex, selectedOption }];
      }
      
      // Save progress after each answer
      onQuizProgress(newAnswers);
      return newAnswers;
    });
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
    const score = calculateScore();
    onQuizCompleted(score, quizData.questions.length);
  };

  const calculateScore = () => {
    let correct = 0;
    quizData.questions.forEach((question, index) => {
      const userAnswer = userAnswers.find(answer => answer.questionIndex === index);
      if (userAnswer && userAnswer.selectedOption === question.answer) {
        correct++;
      }
    });
    return correct;
  };

  const getAnswerStatus = (questionIndex: number, option: string) => {
    const question = quizData.questions[questionIndex];
    const userAnswer = userAnswers.find(answer => answer.questionIndex === questionIndex);
    
    if (!showResults) return '';
    
    if (option === question.answer) return 'correct';
    if (userAnswer && userAnswer.selectedOption === option && option !== question.answer) {
      return 'incorrect';
    }
    return '';
  };

  const score = showResults ? calculateScore() : 0;
  const percentage = showResults ? Math.round((score / quizData.questions.length) * 100) : 0;

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <button onClick={onBackToForm} className="back-btn">
          ← Back to Quiz Generator
        </button>
        <h1>Quiz Time!</h1>
        {showResults && (
          <div className="score-display">
            <h2>Your Score: {score}/{quizData.questions.length} ({percentage}%)</h2>
          </div>
        )}
      </div>

      <div className="questions-container">
        {quizData.questions.map((question, questionIndex) => (
          <div key={questionIndex} className="question-card">
            <h3>Question {questionIndex + 1}</h3>
            <p className="question-text">{question.question}</p>
            
            <div className="options-container">
              {question.options.map((option, optionIndex) => {
                const userAnswer = userAnswers.find(answer => answer.questionIndex === questionIndex);
                const isSelected = userAnswer?.selectedOption === option;
                const answerStatus = getAnswerStatus(questionIndex, option);
                
                return (
                  <label 
                    key={optionIndex} 
                    className={`option-label ${isSelected ? 'selected' : ''} ${answerStatus}`}
                  >
                    <input
                      type="radio"
                      name={`question-${questionIndex}`}
                      value={option}
                      checked={isSelected}
                      onChange={() => handleOptionSelect(questionIndex, option)}
                      disabled={showResults}
                    />
                    <span className="option-text">{option}</span>
                    {showResults && option === question.answer && (
                      <span className="correct-indicator">✓</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!showResults && (
        <div className="quiz-actions">
          <button 
            onClick={handleSubmitQuiz}
            disabled={userAnswers.length !== quizData.questions.length}
            className="submit-quiz-btn"
          >
            Submit Quiz ({userAnswers.length}/{quizData.questions.length} answered)
          </button>
        </div>
      )}

      {showResults && (
        <div className="results-actions">
          <button onClick={onBackToForm} className="new-quiz-btn">
            Generate New Quiz
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizPage;