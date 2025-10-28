import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import QuizForm from './components/QuizForm';
import QuizPage from './components/QuizPage';
import Dashboard from './components/Dashboard';

export interface Question {
  question: string;
  options: string[];
  answer: string;
}

export interface QuizData {
  questions: Question[];
  topic?: string;
  quizId?: number;
  userAnswers?: any[];
}

interface User {
  id: number;
  username: string;
  email: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authPage, setAuthPage] = useState<'login' | 'register'>('login');
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'form' | 'quiz'>('dashboard');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleAuthSuccess = (token: string, userData: User) => {
    setIsAuthenticated(true);
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    
    try {
      await fetch('http://localhost:8000/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
      setQuizData(null);
      setCurrentPage('dashboard');
    }
  };

  const handleQuizGenerated = async (data: QuizData, topic: string) => {
    // Save quiz as incomplete when first generated
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/quiz/save-attempt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic: topic,
          total_questions: data.questions.length,
          score: 0,
          percentage: 0,
          status: 'incomplete',
          quiz_data: JSON.stringify(data.questions),
          user_answers: JSON.stringify([])
        }),
      });
      
      if (response.ok) {
        const savedQuiz = await response.json();
        setQuizData({ ...data, topic, quizId: savedQuiz.id });
        setCurrentPage('quiz');
      }
    } catch (err) {
      console.error('Failed to save quiz:', err);
      // Still show quiz even if save fails
      setQuizData({ ...data, topic });
      setCurrentPage('quiz');
    }
  };

  const handleBackToForm = () => {
    setQuizData(null);
    setCurrentPage('form');
  };

  const handleQuizCompleted = async (score: number, totalQuestions: number) => {
    if (!quizData?.topic || !quizData?.quizId) return;

    const percentage = Math.round((score / totalQuestions) * 100);
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8000/api/quiz/update-attempt/${quizData.quizId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          score: score,
          percentage: percentage,
          status: 'completed'
        }),
      });
    } catch (err) {
      console.error('Failed to update quiz attempt:', err);
    }
  };
  
  const handleQuizProgress = async (userAnswers: any[]) => {
    if (!quizData?.quizId) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8000/api/quiz/update-attempt/${quizData.quizId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_answers: JSON.stringify(userAnswers)
        }),
      });
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  };

  const handleNavigateToDashboard = () => {
    setCurrentPage('dashboard');
  };

  const handleNavigateToQuiz = () => {
    setCurrentPage('form');
  };

  if (!isAuthenticated) {
    return (
      <div className="App">
        {authPage === 'login' ? (
          <Login 
            onLoginSuccess={handleAuthSuccess}
            onSwitchToRegister={() => setAuthPage('register')}
          />
        ) : (
          <Register 
            onRegisterSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setAuthPage('login')}
          />
        )}
      </div>
    );
  }

  return (
    <div className="App">
      <div className="app-header">
        <div className="nav-menu">
          <button 
            onClick={handleNavigateToDashboard} 
            className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </button>
          <button 
            onClick={handleNavigateToQuiz} 
            className={`nav-link ${currentPage === 'form' || currentPage === 'quiz' ? 'active' : ''}`}
          >
            Generate Quiz
          </button>
        </div>
        <div className="user-info">
          <span>Welcome, {user?.username}!</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
      
      {currentPage === 'dashboard' && (
        <Dashboard 
          onNavigateToQuiz={handleNavigateToQuiz}
          onResumeQuiz={(data) => {
            setQuizData(data);
            setCurrentPage('quiz');
          }}
        />
      )}
      
      {currentPage === 'form' && (
        <QuizForm onQuizGenerated={handleQuizGenerated} />
      )}
      
      {currentPage === 'quiz' && quizData && (
        <QuizPage 
          quizData={quizData} 
          onBackToForm={handleBackToForm}
          onQuizCompleted={handleQuizCompleted}
          onQuizProgress={handleQuizProgress}
        />
      )}
    </div>
  );
}

export default App;
