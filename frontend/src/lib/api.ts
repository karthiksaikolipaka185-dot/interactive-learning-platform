const API_BASE = 'http://localhost:5000/api';

export const api = {
    getExercises: async () => {
        const res = await fetch(`${API_BASE}/exercises`);
        if (!res.ok) throw new Error('Failed to fetch exercises');
        return res.json();
    },

    getSubtopic: async (id: number) => {
        const res = await fetch(`${API_BASE}/subtopics/${id}`);
        if (!res.ok) throw new Error('Failed to fetch subtopic');
        return res.json();
    },

    saveProgress: async (email: string, subtopicId: number, score: number, timeSpent?: number) => {
        const res = await fetch(`${API_BASE}/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, subtopicId, score, timeSpent })
        });
        if (!res.ok) throw new Error('Failed to save progress');
        return res.json();
    },

    getMasteryQuestions: async (exerciseId: number) => {
        const res = await fetch(`${API_BASE}/mastery/${exerciseId}`);
        if (!res.ok) throw new Error('Failed to fetch mastery questions');
        return res.json();
    },

    chat: async (messages: { role: string, content: string }[], context?: Record<string, any>, userEmail?: string) => {
        const res = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages, context, userEmail })
        });
        if (!res.ok) throw new Error('Failed to get chat response');
        return res.json();
    },

    // --- STUDENT PROFILE & SESSION RESTORATION ---
    getUserProfile: async (email: string) => {
        const res = await fetch(`${API_BASE}/user/profile/${encodeURIComponent(email)}`);
        if (!res.ok) throw new Error('Failed to fetch profile');
        return res.json();
    },

    updateUserProfile: async (payload: Record<string, any>) => {
        const res = await fetch(`${API_BASE}/user/profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to update profile');
        return res.json();
    },

    getDashboard: async (email: string) => {
        const res = await fetch(`${API_BASE}/dashboard/${encodeURIComponent(email)}`);
        if (!res.ok) throw new Error('Failed to fetch dashboard');
        return res.json();
    },

    // --- GROQ AI DAILY MISSION ---
    getTodayMission: async (email: string) => {
        const res = await fetch(`${API_BASE}/mission/today/${encodeURIComponent(email)}`);
        if (!res.ok) throw new Error('Failed to fetch today mission');
        return res.json();
    },

    completeMissionTask: async (taskId: number, completed: boolean, email?: string) => {
        const res = await fetch(`${API_BASE}/mission/complete-task`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskId, completed, email })
        });
        if (!res.ok) throw new Error('Failed to complete mission task');
        return res.json();
    },

    // --- MY JOURNEY METRICS ---
    getJourneyMetrics: async (email: string) => {
        const res = await fetch(`${API_BASE}/journey/${encodeURIComponent(email)}`);
        if (!res.ok) throw new Error('Failed to fetch journey metrics');
        return res.json();
    },

    // --- DOUBT ZONE CONVERSATIONS ---
    getDoubtZoneConversations: async (email: string) => {
        const res = await fetch(`${API_BASE}/doubt-zone/conversations/${encodeURIComponent(email)}`);
        if (!res.ok) throw new Error('Failed to fetch Doubt Zone conversations');
        return res.json();
    },

    // --- YOUR GROWTH ANALYTICS ---
    getGrowthAnalytics: async (email: string) => {
        const res = await fetch(`${API_BASE}/analytics/growth/${encodeURIComponent(email)}`);
        if (!res.ok) throw new Error('Failed to fetch growth analytics');
        return res.json();
    },

    // --- QUICK REVISION ---
    getQuickRevisionTopics: async (email: string) => {
        const res = await fetch(`${API_BASE}/analytics/quick-revision/${encodeURIComponent(email)}`);
        if (!res.ok) throw new Error('Failed to fetch quick revision topics');
        return res.json();
    },

    // --- VIDEO PROGRESS ---
    saveVideoProgress: async (payload: Record<string, any>) => {
        const res = await fetch(`${API_BASE}/progress/video`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to save video progress');
        return res.json();
    },

    getVideoProgress: async (email: string, videoId: string) => {
        const res = await fetch(`${API_BASE}/progress/video/${encodeURIComponent(email)}/${encodeURIComponent(videoId)}`);
        if (!res.ok) throw new Error('Failed to fetch video progress');
        return res.json();
    },

    // --- CHEAT SHEET PROGRESS ---
    saveCheatSheetProgress: async (payload: Record<string, any>) => {
        const res = await fetch(`${API_BASE}/progress/cheatsheet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to save cheat sheet progress');
        return res.json();
    },

    getCheatSheetProgress: async (email: string, cheatSheetId: string) => {
        const res = await fetch(`${API_BASE}/progress/cheatsheet/${encodeURIComponent(email)}/${encodeURIComponent(cheatSheetId)}`);
        if (!res.ok) throw new Error('Failed to fetch cheat sheet progress');
        return res.json();
    },

    // --- INLINE QUIZ ---
    saveInlineQuizAttempt: async (payload: Record<string, any>) => {
        const res = await fetch(`${API_BASE}/progress/inline-quiz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to save inline quiz attempt');
        return res.json();
    },

    // --- QUESTION BANK ---
    saveQuestionBankSubmission: async (payload: Record<string, any>) => {
        const res = await fetch(`${API_BASE}/progress/question-bank`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to save question bank submission');
        return res.json();
    },

    getQuestionBankSubmissions: async (email: string) => {
        const res = await fetch(`${API_BASE}/progress/question-bank/${encodeURIComponent(email)}`);
        if (!res.ok) throw new Error('Failed to fetch question bank submissions');
        return res.json();
    },

    // --- AI CHAT LOGS & MASTERY ---
    logAIChat: async (payload: Record<string, any>) => {
        const res = await fetch(`${API_BASE}/ai-chat-history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to log AI chat');
        return res.json();
    },

    getAIChatHistory: async (email: string) => {
        const res = await fetch(`${API_BASE}/ai-chat-history/${encodeURIComponent(email)}`);
        if (!res.ok) throw new Error('Failed to fetch AI chat history');
        return res.json();
    },

    getMasteryList: async (email: string) => {
        const res = await fetch(`${API_BASE}/mastery-list/${encodeURIComponent(email)}`);
        if (!res.ok) throw new Error('Failed to fetch concept mastery');
        return res.json();
    }
};
