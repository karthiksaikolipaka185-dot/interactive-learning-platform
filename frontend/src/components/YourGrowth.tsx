import { useState, useEffect } from 'react';
import { LineChart, TrendingUp, Trophy, Target } from 'lucide-react';
import { api } from '../lib/api';
import './YourGrowth.css';

export const YourGrowth = () => {
    const [growthData, setGrowthData] = useState<any>(null);

    useEffect(() => {
        const stored = localStorage.getItem('user_session');
        const email = stored ? JSON.parse(stored).email : 'student@example.com';

        api.getGrowthAnalytics(email)
            .then(res => setGrowthData(res))
            .catch(err => console.error("Failed to load growth analytics", err));
    }, []);

    const xp = growthData?.xp || 150;
    const rank = growthData?.rank || 'Silver II';
    const accuracy = growthData?.accuracy || 85;
    const weeklyBars = growthData?.weeklyProgress || [
        { day: 'Mon', hours: 1.2 },
        { day: 'Tue', hours: 0.8 },
        { day: 'Wed', hours: 1.5 },
        { day: 'Thu', hours: 0.5 },
        { day: 'Fri', hours: 2.0 },
        { day: 'Sat', hours: 1.8 },
        { day: 'Sun', hours: 1.1 }
    ];

    return (
        <div className="growth-container">
            <div className="growth-header">
                <div className="header-icon-growth">
                    <TrendingUp size={28} />
                </div>
                <div>
                    <h2>Your Growth</h2>
                    <p>Live learning telemetry and database performance tracking</p>
                </div>
            </div>

            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon bg-blue-100 text-blue-600">
                        <LineChart size={24} />
                    </div>
                    <div className="metric-info">
                        <h4>Total Output</h4>
                        <span className="value">{xp.toLocaleString()} XP</span>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon bg-yellow-100 text-yellow-600">
                        <Trophy size={24} />
                    </div>
                    <div className="metric-info">
                        <h4>Current Rank</h4>
                        <span className="value">{rank}</span>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon bg-emerald-100 text-emerald-600">
                        <Target size={24} />
                    </div>
                    <div className="metric-info">
                        <h4>Quiz Accuracy</h4>
                        <span className="value">{accuracy}%</span>
                    </div>
                </div>
            </div>

            <div className="chart-placeholder">
                <h3>Weekly Study Activity</h3>
                <div className="bars-container">
                    {weeklyBars.map((item: any, idx: number) => {
                        const maxH = 2.0;
                        const pct = Math.min(100, Math.round((item.hours / maxH) * 100)) || 20;
                        return (
                            <div key={idx} className="bar-wrapper">
                                <div className="bar" style={{ height: `${pct}%` }}></div>
                                <span>{item.day}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
