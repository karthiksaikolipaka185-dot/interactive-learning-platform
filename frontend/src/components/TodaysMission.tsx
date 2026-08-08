import { useState, useEffect } from 'react';
import { Target, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import './TodaysMission.css';

interface MissionTask {
    id: number;
    title: string;
    durationMinutes: number;
    taskType: string;
    completed: boolean;
}

export const TodaysMission = () => {
    const [tasks, setTasks] = useState<MissionTask[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('user_session');
        const email = stored ? JSON.parse(stored).email : 'student@example.com';

        api.getTodayMission(email)
            .then(res => {
                if (res && res.tasks) {
                    setTasks(res.tasks);
                }
            })
            .catch(err => console.error("Failed to load Groq AI daily mission", err))
            .finally(() => setIsLoading(false));
    }, []);

    const toggleMission = (taskId: number) => {
        const target = tasks.find(t => t.id === taskId);
        if (!target) return;

        const nextState = !target.completed;
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: nextState } : t));

        const stored = localStorage.getItem('user_session');
        const email = stored ? JSON.parse(stored).email : undefined;

        api.completeMissionTask(taskId, nextState, email).catch(err => console.error(err));
    };

    const completedCount = tasks.filter(t => t.completed).length;
    const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

    return (
        <div className="mission-container">
            <div className="mission-header flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="header-icon">
                        <Target size={28} />
                    </div>
                    <div>
                        <h2 className="flex items-center gap-2">
                            Today's Mission <Sparkles size={16} className="text-amber-400" />
                        </h2>
                        <p>AI-personalized 60-min daily target</p>
                    </div>
                </div>
            </div>

            <div className="progress-section">
                <div className="progress-header">
                    <span>Overall Progress</span>
                    <span className="progress-text">{progress}%</span>
                </div>
                <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            {isLoading ? (
                <div className="p-6 text-center text-sm text-slate-400">
                    ✨ Groq AI is generating your personalized daily study mission...
                </div>
            ) : (
                <div className="mission-list">
                    {tasks.map(task => (
                        <div
                            key={task.id}
                            className={`mission-card ${task.completed ? 'completed' : ''}`}
                            onClick={() => toggleMission(task.id)}
                        >
                            <div className="mission-info">
                                <h3 className={task.completed ? 'line-through text-gray-400' : 'text-gray-800'}>
                                    {task.title}
                                </h3>
                                <div className="duration">
                                    <Clock size={14} />
                                    <span>{task.durationMinutes} mins</span>
                                </div>
                            </div>
                            <div className={`check-icon ${task.completed ? 'active' : ''}`}>
                                <CheckCircle size={24} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
