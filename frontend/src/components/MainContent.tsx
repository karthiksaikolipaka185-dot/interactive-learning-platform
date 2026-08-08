import { useState, useEffect } from 'react';
import { ChevronDown, Clock, BookOpen, FileText, PlayCircle } from 'lucide-react';
import { api } from '../lib/api';
import './MainContent.css';

interface MainContentProps {
  onItemComplete: (itemId: string) => void;
  completedItems: Set<string>;
  onTopicClick?: (topicId: string, exerciseId: string) => void;
}

const weeks = [
  { id: 1, label: 'Week - 1', dateRange: '1st Jan - 7th Jan', isLocked: false },
  { id: 2, label: 'Week - 2', dateRange: '8th Jan - 14th Jan', isLocked: true },
  { id: 3, label: 'Week - 3', dateRange: '15th Jan - 21st Jan', isLocked: true },
  { id: 4, label: 'Week - 4', dateRange: '22nd Jan - 28th Jan', isLocked: true },
];

export function MainContent({ onItemComplete, completedItems, onTopicClick }: MainContentProps) {
  const [selectedWeek, setSelectedWeek] = useState(weeks[0]);
  const [showWeekDropdown, setShowWeekDropdown] = useState(false);
  const [exercises, setExercises] = useState<any[]>([]);

  const [studentName, setStudentName] = useState('Student');

  useEffect(() => {
    api.getExercises()
      .then(data => setExercises(data))
      .catch(err => console.error("Failed to load exercises", err));

    const stored = localStorage.getItem('user_session');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        api.getUserProfile(u.email)
          .then(p => {
            if (p.name) setStudentName(p.name);
          })
          .catch(e => console.error(e));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  return (
    <div className="main-content-area">
      <div className="main-header">
        <div className="header-greeting">
          <h1>Welcome Back, <span>{studentName}</span> ⚡</h1>
          <p>JEE Mains Prep • <span className="text-green-500 font-medium">On Track</span></p>
        </div>
        <div className="live-session-badge">
          <div className="pulse-dot"></div> Live Session in 2h
        </div>
      </div>

      <div className="progression-section">
        <div className="progression-header">
          <h2>Your Progression</h2>
          <span className="completion-text">0 / 5 WEEKS COMPLETE</span>
        </div>
        <div className="weeks-scroll-container">
          {weeks.map((week) => (
            <div
              key={week.id}
              className={`week-card ${selectedWeek.id === week.id ? 'active' : ''} ${week.isLocked ? 'locked' : ''}`}
              onClick={() => { if (!week.isLocked) setSelectedWeek(week); }}
            >
              <div className="week-card-inner">
                <div className="week-name">{week.label.toUpperCase()}</div>
                <div className="week-date">{week.dateRange}</div>
              </div>
              {selectedWeek.id === week.id && <div className="active-ring"></div>}
              {week.isLocked && <div className="lock-icon">🔒</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="week-banner-section">
        <h2 className="week-title-heading">{selectedWeek.label}</h2>
        <div className="course-banner">
          <div className="banner-badge">
            <span className="dot"></span> LIVE COURSE
          </div>
          <h1 className="banner-title">Trigonometry</h1>
          <p className="banner-desc">
            Master the relationships between side lengths and angles. From foundational ratios to complex identities.
          </p>
          <div className="banner-avatars">
            <div className="avatar-stack">
              <div className="avatar empty"></div>
              <div className="avatar empty"></div>
              <div className="avatar empty"></div>
              <div className="avatar count">+2k</div>
            </div>
          </div>
        </div>
      </div>

      <div className="exercises-section">
        {exercises.map(exercise => (
          <div key={exercise.id} className="exercise-list-item">
            <div className="exercise-header">
              <h3>{exercise.title}</h3>
              <span className="toggle-icon">▼</span>
            </div>
            <div className="exercise-topics">
              {exercise.subtopics.map((subtopic: any) => (
                <div
                  key={subtopic.id}
                  className={`topic-row ${completedItems.has(subtopic.id.toString()) ? 'completed' : ''}`}
                  onClick={() => {
                    if (onTopicClick) onTopicClick(subtopic.id.toString(), exercise.id.toString());
                    else onItemComplete(subtopic.id.toString());
                  }}
                >
                  <div className="topic-name">{subtopic.title}</div>
                  <button className="start-topic-btn">START</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
