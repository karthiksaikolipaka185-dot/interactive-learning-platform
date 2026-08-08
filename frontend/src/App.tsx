import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { MyJourney } from './components/MyJourney';
import { AITutor } from './components/AITutor';
import { TodaysMission } from './components/TodaysMission';
import { YourGrowth } from './components/YourGrowth';
import { DoubtZone } from './components/DoubtZone';
import { LoginPage } from './components/LoginPage';
import { StatsPanel } from './components/StatsPanel';
import { Leaderboard } from './components/Leaderboard';
import { TopicViewer } from './components/TopicViewer';
import { QuickRevision } from './components/QuickRevision';
import { MasteryExamView } from './components/MasteryExamView';
import { MasteryResultView } from './components/MasteryResultView';
import { FeynmanAssessment } from './components/FeynmanAssessment';
import { initializeDummyUsers, User, updateUserScore } from './data/users';
import { api } from './lib/api';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState('home');
  const [activeSubtopicId, setActiveSubtopicId] = useState<string | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [feynmanCompletedExercises, setFeynmanCompletedExercises] = useState<Set<string>>(new Set());
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [currentStreak, setCurrentStreak] = useState(3);
  const [consistencyScore, setConsistencyScore] = useState(2471);
  const [testResult, setTestResult] = useState<any>(null);
  const [exerciseMetrics, setExerciseMetrics] = useState<any[]>([]);
  const [showFeynman, setShowFeynman] = useState(false);
  const [feynmanProficiency, setFeynmanProficiency] = useState<'easy' | 'medium' | 'hard'>('easy');

  useEffect(() => {
    initializeDummyUsers();
    const storedUser = localStorage.getItem('user_session');
    if (storedUser) {
      try {
        const sessionUser = JSON.parse(storedUser);
        setUser(sessionUser);

        // Fetch dynamic profile from DB
        api.getUserProfile(sessionUser.email)
          .then(dbUser => {
            setUser(prev => prev ? { ...prev, xp: dbUser.xp, level: dbUser.level, streak: dbUser.currentStreak } : prev);
            if (dbUser.currentStreak) setCurrentStreak(dbUser.currentStreak);
            if (dbUser.currentSubtopicId) {
              setActiveSubtopicId(dbUser.currentSubtopicId.toString());
            }
          })
          .catch(err => console.error("Failed to fetch DB user profile:", err));
      } catch (e) {
        console.error("Failed to restore session", e);
      }
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user_session', JSON.stringify(userData));

    api.getUserProfile(userData.email)
      .then(dbUser => {
        setUser(prev => prev ? { ...prev, xp: dbUser.xp, level: dbUser.level, streak: dbUser.currentStreak } : prev);
        if (dbUser.currentStreak) setCurrentStreak(dbUser.currentStreak);
        if (dbUser.currentSubtopicId) {
          setActiveSubtopicId(dbUser.currentSubtopicId.toString());
        }
      })
      .catch(err => console.error("Failed to fetch profile on login:", err));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user_session');
    setActiveView('home');
  };

  const handleItemComplete = (itemId: string, payload?: any) => {
    if (payload && typeof payload === 'object' && !payload.target) {
      setExerciseMetrics(prev => [...prev, { itemId, ...payload }]);
    }

    setCompletedItems(prev => {
      const newSet = new Set(prev);
      if (!newSet.has(itemId)) {
        newSet.add(itemId);
        if (user) {
          const updatedUser = updateUserScore(user.email, 50, true);
          if (updatedUser) {
            setUser(updatedUser);
            localStorage.setItem('user_session', JSON.stringify(updatedUser));
          }

          const subId = parseInt(itemId);
          if (!isNaN(subId)) {
            const timeSpent = (payload && typeof payload === 'object') ? payload.timeTakenSecs : 0;
            api.saveProgress(user.email, subId, 50, timeSpent).catch(err => console.error("Sync failed", err));
          }
          api.updateUserProfile({ email: user.email, xp: 50 }).catch(err => console.error("Profile update failed", err));
        }
      }
      return newSet;
    });
  };

  const handleTopicClick = (subtopicId: string, exerciseId: string) => {
    setActiveSubtopicId(subtopicId);
    setActiveExerciseId(exerciseId);

    if (user) {
      const subId = parseInt(subtopicId);
      api.updateUserProfile({
        email: user.email,
        currentSubtopicId: !isNaN(subId) ? subId : undefined,
        currentExercise: exerciseId
      }).catch(err => console.error("Failed to save current subtopic to DB", err));
    }
    
    if (!feynmanCompletedExercises.has(exerciseId)) {
      setShowFeynman(true);
    } else {
      setActiveView('player');
    }
  };

  const handleFeynmanComplete = (proficiency: 'easy' | 'medium' | 'hard', explanation: string) => {
    setFeynmanProficiency(proficiency);
    setShowFeynman(false);
    setActiveView('player');

    if (activeExerciseId) {
      setFeynmanCompletedExercises(prev => new Set(prev).add(activeExerciseId));
      if (explanation.trim().length > 0) {
        // Store in localStorage
        const stored = JSON.parse(localStorage.getItem('feynman_responses') || '{}');
        stored[activeExerciseId] = explanation;
        localStorage.setItem('feynman_responses', JSON.stringify(stored));
      }
    }
  };

  const handleFeynmanClose = () => {
    setShowFeynman(false);
    setActiveSubtopicId(null);
  };

  const handleBackToCourse = () => {
    setActiveView('home');
    setActiveSubtopicId(null);
  };

  const handleTestComplete = (result: any) => {
    setTestResult(result);
    setActiveView('mastery-result');
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // --- FULL SCREEN VIEW: EXAM MODE ---
  if (activeView === 'mastery-test') {
    return (
      <MasteryExamView
        exerciseId={activeSubtopicId || "Current Exercise"}
        onClose={handleBackToCourse}
        onComplete={handleTestComplete}
        telemetryData={exerciseMetrics}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* 1. Left Sidebar (Persistent) - Hidden in Player Mode */}
      {activeView !== 'player' && (
        <Sidebar
          activeView={activeView}
          onNavigate={(view) => {
            setActiveView(view);
            if (view !== 'player') setActiveSubtopicId(null);
          }}
          user={user}
          onLogout={handleLogout}
        />
      )}

      {/* 2. Middle Section (Primary Focus Area) */}
      <main className="flex-1 overflow-auto relative flex flex-col">
        {activeView === 'player' && activeSubtopicId ? (
          <TopicViewer
            initialSubtopicId={activeSubtopicId}
            onBack={handleBackToCourse}
            completedItems={completedItems}
            onItemComplete={handleItemComplete}
            onStartTest={() => setActiveView('mastery-test')}
            difficulty={feynmanProficiency}
            onTopicChange={handleTopicClick}
          />
        ) : activeView === 'mastery-result' ? (
          <MasteryResultView
            resultData={testResult}
            onBack={handleBackToCourse}
          />
        ) : activeView === 'journey' ? (
          <MyJourney />
        ) : activeView === 'ai-tutor' ? (
          <AITutor />
        ) : activeView === 'todays-mission' ? (
          <TodaysMission />
        ) : activeView === 'your-growth' ? (
          <YourGrowth />
        ) : activeView === 'doubt-zone' ? (
          <DoubtZone />
        ) : activeView === 'quick-revision' ? (
          <QuickRevision />
        ) : (
          <MainContent
            onItemComplete={handleItemComplete}
            completedItems={completedItems}
            onTopicClick={handleTopicClick}
          />
        )}
      </main>

      {/* 3. Right Sidebar (Motivation - Persistent) - Only visible on Home */}
      {activeView === 'home' && (
        <aside className="hidden lg:block h-full border-l border-gray-200 bg-white">
          {showLeaderboard ? (
            <Leaderboard onBack={() => setShowLeaderboard(false)} currentUser={user} />
          ) : (
            <StatsPanel
              currentStreak={currentStreak}
              consistencyScore={consistencyScore}
              onViewLeaderboard={() => setShowLeaderboard(true)}
              user={user}
            />
          )}
        </aside>
      )}

      {/* Feynman Assessment Overlay */}
      {showFeynman && activeSubtopicId && (
        <FeynmanAssessment
          exerciseName={activeSubtopicId}
          onComplete={handleFeynmanComplete}
          onClose={handleFeynmanClose}
        />
      )}
    </div>
  );
}