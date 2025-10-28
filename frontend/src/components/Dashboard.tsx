import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface QuizAttempt {
  id: number;
  topic: string;
  total_questions: number;
  score: number;
  percentage: number;
  status: string;
  quiz_data?: string;
  user_answers?: string;
  created_at: string;
  completed_at: string | null;
}

interface DashboardStats {
  total_quizzes: number;
  average_marks: number;
  highest_marks: number;
  lowest_marks: number;
  completed_quizzes: number;
  incomplete_quizzes: number;
  recent_attempts: QuizAttempt[];
}

interface DashboardProps {
  onNavigateToQuiz: () => void;
  onResumeQuiz?: (quizData: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigateToQuiz, onResumeQuiz }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleResumeQuiz = async (attempt: QuizAttempt) => {
    if (!attempt.quiz_data || !onResumeQuiz) return;
    
    try {
      const questions = JSON.parse(attempt.quiz_data);
      const userAnswers = attempt.user_answers ? JSON.parse(attempt.user_answers) : [];
      
      onResumeQuiz({
        questions,
        topic: attempt.topic,
        quizId: attempt.id,
        userAnswers
      });
    } catch (err) {
      console.error('Failed to resume quiz:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/quiz/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  if (!stats) {
    return null;
  }

  const chartData = [
    { name: 'Total Quizzes', value: stats.total_quizzes },
    { name: 'Avg Marks (%)', value: stats.average_marks },
    { name: 'Highest (%)', value: stats.highest_marks },
    { name: 'Lowest (%)', value: stats.lowest_marks },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={onNavigateToQuiz} className="nav-btn">
          Generate New Quiz →
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Quizzes</h3>
          <p className="stat-value">{stats.total_quizzes}</p>
        </div>
        <div className="stat-card">
          <h3>Average Marks</h3>
          <p className="stat-value">{stats.average_marks}%</p>
        </div>
        <div className="stat-card">
          <h3>Highest Marks</h3>
          <p className="stat-value">{stats.highest_marks}%</p>
        </div>
        <div className="stat-card">
          <h3>Lowest Marks</h3>
          <p className="stat-value">{stats.lowest_marks}%</p>
        </div>
      </div>

      <div className="quiz-status-section">
        <div className="status-card completed">
          <h3>Completed Quizzes</h3>
          <p className="status-value">{stats.completed_quizzes}</p>
        </div>
        <div className="status-card incomplete">
          <h3>Incomplete Quizzes</h3>
          <p className="status-value">{stats.incomplete_quizzes}</p>
        </div>
      </div>

      <div className="chart-section">
        <h2>Performance Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#4CAF50" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="recent-attempts-section">
        <h2>Recent Quiz Attempts (Last 10)</h2>
        {stats.recent_attempts.length === 0 ? (
          <p className="no-attempts">No quiz attempts yet. Start by generating a quiz!</p>
        ) : (
          <div className="attempts-table">
            <table>
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Questions</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_attempts.map((attempt) => (
                  <tr key={attempt.id}>
                    <td>{attempt.topic}</td>
                    <td>{attempt.total_questions}</td>
                    <td>{attempt.score}/{attempt.total_questions}</td>
                    <td>{attempt.percentage}%</td>
                    <td>
                      <span className={`status-badge ${attempt.status}`}>
                        {attempt.status}
                      </span>
                    </td>
                    <td>{formatDate(attempt.created_at)}</td>
                    <td>
                      {attempt.status === 'incomplete' && (
                        <button 
                          onClick={() => handleResumeQuiz(attempt)}
                          className="resume-btn"
                        >
                          Resume
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
