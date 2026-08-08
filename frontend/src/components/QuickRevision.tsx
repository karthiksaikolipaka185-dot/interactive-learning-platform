import { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, Zap, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';
import './QuickRevision.css';

interface RevisionTopic {
    concept: string;
    reason: string;
    urgency: string;
}

export const QuickRevision = () => {
    const [topics, setTopics] = useState<RevisionTopic[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('user_session');
        const email = stored ? JSON.parse(stored).email : 'student@example.com';

        api.getQuickRevisionTopics(email)
            .then(res => {
                if (Array.isArray(res)) setTopics(res);
            })
            .catch(err => console.error("Failed to load quick revision topics", err))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="revision-container">
            <div className="revision-header">
                <div className="header-icon-bolt">
                    <Zap size={28} />
                </div>
                <div>
                    <h2>Adaptive Quick Revision</h2>
                    <p>AI-recommended revision topics based on database performance</p>
                </div>
            </div>

            {isLoading ? (
                <div className="p-8 text-center text-sm text-slate-400">Loading recommended revision topics...</div>
            ) : (
                <div className="revision-grid border-t pt-6">
                    {topics.map((topic, idx) => (
                        <div key={idx} className="revision-card group border-l-4 border-l-amber-500">
                            <div className="card-top">
                                <span className="topic-icon">📐</span>
                                <span className={`level-badge ${topic.urgency === 'High' ? 'advanced' : 'intermediate'}`}>
                                    {topic.urgency} Priority
                                </span>
                            </div>
                            <h3 className="text-base font-bold text-slate-900 mb-1">{topic.concept}</h3>
                            <div className="text-xs text-amber-700 font-medium mb-3 flex items-center gap-1">
                                <AlertTriangle size={12} />
                                <span>{topic.reason}</span>
                            </div>
                            <div className="card-bottom">
                                <span className="time-estimate">
                                    <BookOpen size={14} />
                                    10 mins
                                </span>
                                <button className="start-btn text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    Revise <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
