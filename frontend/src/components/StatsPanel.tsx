import { useState } from 'react';
import { Info, ChevronLeft, ChevronRight, Trophy, Flame, Target } from 'lucide-react';
import './StatsPanel.css';

interface StatsPanelProps {
  currentStreak: number;
  consistencyScore: number;
  onViewLeaderboard: () => void;
  user?: any;
}

const generateCalendarData = () => {
  const days: { day: number; state: string }[] = [];
  const daysInMonth = 31;
  const mockStates = [
    'achieved', 'missed', 'missed', 'holiday', 'achieved', 'achieved', 'achieved',
    'achieved', 'achieved', 'achieved', 'missed', 'missed', 'achieved', 'achieved',
    'achieved', 'achieved', 'achieved', 'current', 'future', 'future', 'future',
    'future', 'future', 'future', 'future', 'future', 'future', 'future',
    'future', 'future', 'future'
  ];

  for (let i = 0; i < daysInMonth; i++) {
    days.push({
      day: i + 1,
      state: mockStates[i] || 'future'
    });
  }
  return days;
};

export function StatsPanel({ currentStreak, consistencyScore, onViewLeaderboard, user }: StatsPanelProps) {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [currentMonth] = useState('January 2026');
  const calendarDays = generateCalendarData();

  return (
    <div className="stats-panel-container">
      <div className="stats-content">

        {/* Leaderboard Card */}
        <div className="glass-stats-card">
          <div className="card-header-row mb-4">
            <h3 className="card-title">Leaderboard</h3>
            <button className="view-btn" onClick={onViewLeaderboard}>
              View All <ChevronRight size={16} />
            </button>
          </div>

          <div className="rank-display mb-4">
            <div className="rank-badge">
              <Trophy size={28} className="text-white" />
              <div className="rank-badge-number">{user?.level || 1}</div>
            </div>
            <div className="rank-info">
              <div className="rank-name">{user?.rank || 'Silver II'}</div>
              <div className="rank-school">Level {user?.level || 1} Scholar</div>
            </div>
          </div>

          <div className="rank-footer">
            <span className="rank-position">Overall Rank: <strong>{user?.rank || 'Silver II'}</strong></span>
            <div className="rank-points">
              <span>🪙</span>
              <strong>{user?.xp !== undefined ? user.xp : (user?.score !== undefined ? user.score : 2475)} XP</strong>
            </div>
          </div>
        </div>

        {/* Learning Consistency Card */}
        <div className="glass-stats-card">
          <div className="card-header-row mb-3">
            <div className="title-with-icon">
              <h3 className="card-title">Learning Consistency</h3>
              <Info size={16} className="info-icon" />
            </div>
            <div className="goal-badge">
              Goal <strong>🔥 50</strong>
            </div>
          </div>

          <p className="card-subtitle">Keep your streak alive to maximize XP!</p>

          <div className="metrics-row mb-6">
            <div className="metric-box border-r border-gray-100">
              <div className="metric-label">Current Streak</div>
              <div className="metric-value-row">
                <Flame size={28} className="text-orange-500" />
                <span className="metric-big-number text-gray-800">{currentStreak}</span>
              </div>
              <div className="metric-subtitle text-green-500">My Best ⚡ 32</div>
            </div>

            <div className="metric-box pl-4">
              <div className="metric-label">Consistency Score</div>
              <div className="metric-value-row">
                <Target size={28} className="text-indigo-500" />
                <span className="metric-big-number text-gray-800">{consistencyScore}</span>
              </div>
              <div className="metric-subtitle text-indigo-500 font-semibold">+4 this week</div>
            </div>
          </div>

          {/* Monthly Tracker */}
          <div className="tracker-section">
            <div className="card-header-row mb-4">
              <div className="title-with-icon">
                <h4 className="card-title text-base">Monthly Tracker</h4>
              </div>
              <div className="mode-toggle">
                <button
                  className={`toggle-btn ${viewMode === 'daily' ? 'active' : ''}`}
                  onClick={() => setViewMode('daily')}
                >
                  Daily
                </button>
                <button
                  className={`toggle-btn ${viewMode === 'weekly' ? 'active' : ''}`}
                  onClick={() => setViewMode('weekly')}
                >
                  Weekly
                </button>
              </div>
            </div>

            <div className="month-navigator mb-4">
              <button className="nav-btn"><ChevronLeft size={18} /></button>
              <span className="month-name">{currentMonth}</span>
              <button className="nav-btn"><ChevronRight size={18} /></button>
            </div>

            <div className="calendar-grid mb-4">
              {calendarDays.map((day, index) => (
                <div key={index} className={`calendar-day ${day.state}`}></div>
              ))}
            </div>

            <div className="legend-grid">
              <div className="legend-item"><div className="legend-color missed"></div><span>Missed</span></div>
              <div className="legend-item"><div className="legend-color achieved"></div><span>Achieved</span></div>
              <div className="legend-item"><div className="legend-color holiday"></div><span>Holiday</span></div>
              <div className="legend-item"><div className="legend-color paused"></div><span>Paused</span></div>
              <div className="legend-item"><div className="legend-color streak-freeze"></div><span>Freeze</span></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}