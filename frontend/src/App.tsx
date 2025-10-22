import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
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
  const [currentPage, setCurrentPage] = useState<'form' | 'quiz'>('form');

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
      setCurrentPage('form');
    }
  };

  const handleQuizGenerated = (data: QuizData) => {
    setQuizData(data);
    setCurrentPage('quiz');
  };

  const handleBackToForm = () => {
    setQuizData(null);
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
        <div className="user-info">
          <span>Welcome, {user?.username}!</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
      
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
