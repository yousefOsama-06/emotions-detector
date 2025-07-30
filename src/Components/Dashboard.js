import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const emotionColors = {
  'Happy': '#FFD700',
  'Sad': '#4682B4',
  'Angry': '#DC143C',
  'Fear': '#8B4513',
  'Surprise': '#FF69B4',
  'Disgust': '#228B22',
  'Neutral': '#808080',
  'Anxious': '#FF8C00',
  'Excited': '#32CD32',
  'Calm': '#87CEEB',
  'Stressed': '#FF6347',
  'Content': '#98FB98'
};

function Dashboard() {
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('weekly'); // daily, weekly, monthly
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMoods();
    }
  }, [user]);

  const fetchMoods = async () => {
    try {
      const response = await fetch('http://localhost:8000/moods', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMoods(data);
      }
    } catch (error) {
      console.error('Error fetching moods:', error);
    } finally {
      setLoading(false);
    }
  };

  const processMoodData = (timeRange) => {
    if (!moods.length) return { labels: [], datasets: [] };

    const now = new Date();
    const filteredMoods = moods.filter(mood => {
      const moodDate = new Date(mood.timestamp);
      switch (timeRange) {
        case 'daily':
          return moodDate.toDateString() === now.toDateString();
        case 'weekly':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return moodDate >= weekAgo;
        case 'monthly':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return moodDate >= monthAgo;
        default:
          return true;
      }
    });

    // Group moods by time period
    const groupedMoods = {};
    filteredMoods.forEach(mood => {
      const date = new Date(mood.timestamp);
      let key;
      
      switch (timeRange) {
        case 'daily':
          key = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          break;
        case 'weekly':
          key = date.toLocaleDateString('en-US', { weekday: 'short' });
          break;
        case 'monthly':
          key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          break;
        default:
          key = date.toLocaleDateString();
      }

      if (!groupedMoods[key]) {
        groupedMoods[key] = [];
      }
      groupedMoods[key].push(mood.mood);
    });

    // Calculate average mood scores for each period
    const labels = Object.keys(groupedMoods);
    const moodScores = labels.map(key => {
      const periodMoods = groupedMoods[key];
      const scores = periodMoods.map(mood => getMoodScore(mood));
      return scores.reduce((a, b) => a + b, 0) / scores.length;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Mood Score',
          data: moodScores,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
          pointBackgroundColor: 'rgb(75, 192, 192)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
        }
      ]
    };
  };

  const getMoodScore = (mood) => {
    const moodScores = {
      'Happy': 10, 'Excited': 9, 'Content': 8, 'Calm': 7, 'Neutral': 5,
      'Anxious': 4, 'Stressed': 3, 'Sad': 2, 'Angry': 1, 'Fear': 1,
      'Surprise': 6, 'Disgust': 2
    };
    return moodScores[mood] || 5;
  };

  const getEmotionDistribution = () => {
    if (!moods.length) return { labels: [], datasets: [] };

    const emotionCounts = {};
    moods.forEach(mood => {
      emotionCounts[mood.mood] = (emotionCounts[mood.mood] || 0) + 1;
    });

    const labels = Object.keys(emotionCounts);
    const data = Object.values(emotionCounts);
    const backgroundColor = labels.map(label => emotionColors[label] || '#808080');

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor,
          borderWidth: 2,
          borderColor: '#fff',
        }
      ]
    };
  };

  const getMoodTrends = () => {
    if (!moods.length) return { labels: [], datasets: [] };

    const recentMoods = moods.slice(0, 10).reverse(); // Last 10 moods
    const labels = recentMoods.map(mood => {
      const date = new Date(mood.timestamp);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    // Get unique emotions that actually appear in the recent moods
    const uniqueEmotions = [...new Set(recentMoods.map(mood => mood.mood))];

    const datasets = uniqueEmotions.map(emotion => {
      const data = recentMoods.map(mood => mood.mood === emotion ? 1 : 0);
      return {
        label: emotion,
        data,
        backgroundColor: emotionColors[emotion] || '#808080',
        borderColor: emotionColors[emotion] || '#808080',
        borderWidth: 1,
      };
    });

    return { labels, datasets };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Mood Trends - ${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} View`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 2,
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Emotion Distribution',
      },
    },
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!moods.length) {
    return (
      <div className="dashboard-container">
        <h2>Mood Trends Dashboard</h2>
        <p>No mood data available yet. Start by analyzing some images to see your trends!</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Mood Trends Dashboard</h2>
        <div className="time-range-selector">
          <button 
            className={timeRange === 'daily' ? 'active' : ''} 
            onClick={() => setTimeRange('daily')}
          >
            Daily
          </button>
          <button 
            className={timeRange === 'weekly' ? 'active' : ''} 
            onClick={() => setTimeRange('weekly')}
          >
            Weekly
          </button>
          <button 
            className={timeRange === 'monthly' ? 'active' : ''} 
            onClick={() => setTimeRange('monthly')}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Entries</h3>
          <p className="stat-number">{moods.length}</p>
        </div>
        <div className="stat-card">
          <h3>Most Common Mood</h3>
          <p className="stat-text">
            {(() => {
              const counts = {};
              moods.forEach(mood => counts[mood.mood] = (counts[mood.mood] || 0) + 1);
              const mostCommon = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
              return mostCommon;
            })()}
          </p>
        </div>
        <div className="stat-card">
          <h3>Average Mood Score</h3>
          <p className="stat-number">
            {(moods.reduce((sum, mood) => sum + getMoodScore(mood.mood), 0) / moods.length).toFixed(1)}
          </p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <Line data={processMoodData(timeRange)} options={chartOptions} />
        </div>
        
        <div className="chart-container">
          <Doughnut data={getEmotionDistribution()} options={doughnutOptions} />
        </div>
        
        <div className="chart-container full-width">
          <Bar 
            data={getMoodTrends()} 
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  display: true,
                  text: 'Recent Mood Patterns',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 1,
                  ticks: {
                    stepSize: 1,
                  }
                }
              }
            }} 
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 