import { useState, useEffect } from 'react';
import { HelpCircle, Search, MessageCircle, Clock, Bot, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import { AITutorDrawer, QuizContext } from './AITutorDrawer';
import './DoubtZone.css';

interface ChatLogItem {
    id: number;
    studentQuestion: string;
    aiResponse: string;
    lessonContext?: string | null;
    timestamp: string;
}

export const DoubtZone = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [history, setHistory] = useState<ChatLogItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedContext, setSelectedContext] = useState<QuizContext | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('user_session');
        const email = stored ? JSON.parse(stored).email : 'student@example.com';

        api.getDoubtZoneConversations(email)
            .then(res => {
                if (Array.isArray(res)) {
                    setHistory(res);
                }
            })
            .catch(err => console.error("Failed to load Doubt Zone history", err))
            .finally(() => setIsLoading(false));
    }, []);

    const filteredHistory = history.filter(item =>
        item.studentQuestion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.aiResponse.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleReopenThread = (item: ChatLogItem) => {
        let ctx: QuizContext = {
            questionText: item.studentQuestion,
            options: [],
            selectedAnswer: '',
            correctAnswer: ''
        };

        if (item.lessonContext) {
            try {
                const parsed = JSON.parse(item.lessonContext);
                ctx = { ...ctx, ...parsed };
            } catch (e) {
                console.error(e);
            }
        }

        setSelectedContext(ctx);
        setIsDrawerOpen(true);
    };

    return (
        <div className="doubt-container space-y-6">
            <div className="doubt-header text-center">
                <div className="header-icon-doubt mx-auto">
                    <HelpCircle size={32} />
                </div>
                <h2>Doubt Zone & AI Conversation History</h2>
                <p>Review past Groq AI Tutor explanations or reopen threads to ask follow-up questions</p>
            </div>

            <div className="search-section">
                <div className="search-bar">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search your past questions & AI tutor explanations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Conversation History List */}
            <div className="space-y-4">
                <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                    <MessageCircle size={20} className="text-indigo-600" /> Recent AI Tutor Conversations ({filteredHistory.length})
                </h3>

                {isLoading ? (
                    <div className="p-8 text-center text-sm text-slate-400">Loading conversation history...</div>
                ) : filteredHistory.length === 0 ? (
                    <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
                        <Bot size={32} className="mx-auto text-indigo-400" />
                        <div className="font-bold text-slate-700">No AI conversations found yet</div>
                        <p className="text-xs text-slate-400">Ask the AI Tutor any question during lessons or quizzes to record your conversation history here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {filteredHistory.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleReopenThread(item)}
                                className="bg-white hover:bg-indigo-50/50 p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 transition cursor-pointer shadow-sm flex items-start justify-between gap-4 group"
                            >
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                        <Clock size={12} />
                                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                                    </div>
                                    <h4 className="font-extrabold text-slate-900 text-base group-hover:text-indigo-600 transition">
                                        "{item.studentQuestion}"
                                    </h4>
                                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                        🤖 <strong>Groq AI:</strong> {item.aiResponse}
                                    </p>
                                </div>
                                <button className="px-3.5 py-2 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white font-bold text-xs transition flex items-center gap-1.5 flex-shrink-0">
                                    <span>Reopen Thread</span>
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <AITutorDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                context={selectedContext}
            />
        </div>
    );
};
