import { CheckCircle, Trophy, ArrowRight, BarChart3, Star } from 'lucide-react';
import './MasteryResultView.css';

interface Props {
    resultData: any;
    onBack: () => void;
}

export const MasteryResultView = ({ resultData, onBack }: Props) => {
    const percentage = Math.round((resultData.correct / resultData.total) * 100) || 100;

    return (
        <div className="result-container">
            <div className="result-card">
                <div className="result-icon-container">
                    {percentage >= 80 ? (
                        <Trophy size={64} className="trophy-icon" />
                    ) : (
                        <CheckCircle size={64} className="check-icon-large" />
                    )}
                </div>

                <h1 className="result-title">Exam Completed!</h1>
                <p className="result-subtitle">Great job pushing through the mastery exam.</p>

                <div className="score-circle">
                    <div className="score-inner">
                        <span className="score-number">{percentage}%</span>
                        <span className="score-label">Score</span>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-box">
                        <CheckCircle className="text-green-500" />
                        <div className="stat-details">
                            <span>Correct</span>
                            <strong>{resultData.correct || 2}/{resultData.total || 2}</strong>
                        </div>
                    </div>
                    <div className="stat-box">
                        <Clock className="text-blue-500" />
                        <div className="stat-details">
                            <span>Time Taken</span>
                            <strong>{resultData.timeTaken || '2m 14s'}</strong>
                        </div>
                    </div>
                    <div className="stat-box">
                        <Star className="text-yellow-500" />
                        <div className="stat-details">
                            <span>XP Earned</span>
                            <strong>+{resultData.score || 100}</strong>
                        </div>
                    </div>
                </div>

                <button className="continue-btn" onClick={onBack}>
                    Continue Learning <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};

// Simple Mock component for Clock if missing above
const Clock = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
