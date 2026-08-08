import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, User as UserIcon, HelpCircle, Lightbulb } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { api } from '../lib/api';

export interface QuizContext {
    chapter?: string;
    exercise?: string;
    day?: string;
    videoOrCheatSheet?: string;
    questionText: string;
    options: string[];
    selectedAnswer: string;
    correctAnswer: string;
    explanation?: string;
}

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    context: QuizContext | null;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

// SVG Right Triangle Diagram Generator for AI Tutor Explanations
const RenderRightTriangleSVG = () => (
    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 my-3 text-center">
        <div className="text-[10px] uppercase tracking-wider font-bold text-indigo-400 mb-2">Right Triangle Reference Diagram</div>
        <svg viewBox="0 0 240 160" className="w-full max-w-[200px] h-auto mx-auto">
            <polygon points="40,130 200,130 40,30" fill="rgba(99, 102, 241, 0.15)" stroke="#818cf8" strokeWidth="2.5" />
            <rect x="40" y="118" width="12" height="12" fill="none" stroke="#22c55e" strokeWidth="2" />
            <path d="M 165 130 A 35 35 0 0 0 175 110" fill="none" stroke="#f59e0b" strokeWidth="2" />
            <text x="155" y="125" fill="#f59e0b" fontSize="13" fontWeight="bold">θ</text>
            <text x="25" y="25" fill="#e2e8f0" fontSize="12" fontWeight="bold">A</text>
            <text x="25" y="145" fill="#e2e8f0" fontSize="12" fontWeight="bold">B (90°)</text>
            <text x="210" y="145" fill="#e2e8f0" fontSize="12" fontWeight="bold">C</text>
            <text x="110" y="70" fill="#f43f5e" fontSize="10" fontWeight="bold" transform="rotate(-32, 110, 70)">Hypotenuse (Opposite 90°)</text>
            <text x="110" y="148" fill="#38bdf8" fontSize="10" fontWeight="bold">Adjacent (Base next to θ)</text>
            <text x="10" y="85" fill="#a855f7" fontSize="10" fontWeight="bold" transform="rotate(-90, 10, 85)">Opposite</text>
        </svg>
    </div>
);

export const AITutorDrawer: React.FC<DrawerProps> = ({ isOpen, onClose, context }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const buildContextPayload = (ctx: QuizContext) => ({
        subject: 'Mathematics',
        chapter: ctx.chapter || 'Trigonometry',
        exercise: ctx.exercise || 'Exercise 8.1',
        day: ctx.day || 'Day 1',
        video: ctx.videoOrCheatSheet,
        cheatSheet: ctx.videoOrCheatSheet,
        questionText: ctx.questionText,
        options: ctx.options,
        selectedAnswer: ctx.selectedAnswer,
        correctAnswer: ctx.correctAnswer
    });

    // Fetch real Groq AI explanation when drawer opens with context
    useEffect(() => {
        let isMounted = true;

        if (isOpen && context) {
            setMessages([]);
            setIsLoading(true);

            const initialPrompt = `Hello! I need help understanding this quiz question. Please explain:
1. Why my selected answer ("${context.selectedAnswer || 'None'}") is incorrect (if incorrect).
2. Why the correct answer ("${context.correctAnswer}") is right.
3. Which core concept is being tested.
4. A handy memory trick to remember this.
5. A step-by-step worked example.`;

            const contextPayload = buildContextPayload(context);

            api.chat([{ role: 'user', content: initialPrompt }], contextPayload)
                .then(res => {
                    if (isMounted) {
                        setMessages([
                            {
                                id: 'init-1',
                                role: 'assistant',
                                content: res.content
                            }
                        ]);
                    }
                })
                .catch(err => {
                    console.error('Failed to load initial Groq tutor response:', err);
                    if (isMounted) {
                        setMessages([
                            {
                                id: 'init-1',
                                role: 'assistant',
                                content: "I'm sorry, I'm having trouble connecting to the Groq AI service right now. Please check your connection or Groq API key and try again!"
                            }
                        ]);
                    }
                })
                .finally(() => {
                    if (isMounted) setIsLoading(false);
                });
        }

        return () => {
            isMounted = false;
        };
    }, [isOpen, context]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    if (!isOpen || !context) return null;

    const handleSend = async (messageText?: string) => {
        const textToSend = messageText || input;
        if (!textToSend.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: textToSend
        };

        const updated = [...messages, userMsg];
        setMessages(updated);
        if (!messageText) setInput('');
        setIsLoading(true);

        try {
            const contextPayload = buildContextPayload(context);
            const response = await api.chat(
                updated.map(m => ({ role: m.role, content: m.content })),
                contextPayload
            );

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.content
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            console.error(err);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I'm having trouble connecting to my Groq AI brain right now. Please try asking your question again."
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickChip = (chipText: string) => {
        handleSend(chipText);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm animate-fadeIn flex justify-end">
            <div className="w-full max-w-lg bg-slate-900 text-white h-full shadow-2xl flex flex-col border-l border-slate-800 relative animate-slideLeft">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-5 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400 shadow-md">
                            <Bot size={22} />
                        </div>
                        <div>
                            <h3 className="font-black text-white text-base flex items-center gap-1.5">
                                AI Learning Assistant <Sparkles size={14} className="text-amber-400" />
                            </h3>
                            <p className="text-xs text-slate-400 truncate max-w-[260px]">
                                Instant Help for Question: "{context.questionText.slice(0, 30)}..."
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Context Card Summary */}
                <div className="bg-slate-950/80 p-3.5 border-b border-slate-800/80 px-5 flex items-center justify-between text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                            Selected: {context.selectedAnswer || 'None'}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                            Correct: {context.correctAnswer}
                        </span>
                    </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center flex-shrink-0 border border-indigo-500/30 mt-1">
                                    <Bot size={16} />
                                </div>
                            )}

                            <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none'}`}>
                                <div className="markdown-prose">
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                                {msg.role === 'assistant' && msg.id === 'init-1' && <RenderRightTriangleSVG />}
                            </div>

                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center flex-shrink-0 mt-1">
                                    <UserIcon size={16} />
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex items-center gap-2 text-xs text-indigo-400 italic">
                            <Bot size={14} className="animate-spin" /> AI Tutor is thinking...
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Follow-up Chips */}
                <div className="px-5 py-2 bg-slate-950/60 border-t border-slate-800 flex gap-2 overflow-x-auto text-xs">
                    <button
                        onClick={() => handleQuickChip("Can you explain this with a diagram?")}
                        className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-indigo-600/40 text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap transition"
                    >
                        📐 Show diagram
                    </button>
                    <button
                        onClick={() => handleQuickChip("I still don't understand.")}
                        className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-indigo-600/40 text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap transition"
                    >
                        ❓ Simplify
                    </button>
                    <button
                        onClick={() => handleQuickChip("Give me another example.")}
                        className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-indigo-600/40 text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap transition"
                    >
                        💡 Example
                    </button>
                </div>

                {/* Chat Input */}
                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask follow-up questions..."
                        disabled={isLoading}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold rounded-xl text-sm transition flex items-center justify-center"
                    >
                        <Send size={16} />
                    </button>
                </form>
            </div>
        </div>
    );
};

// Reusable AI Tutor Button Component with Pulsing Glow on Incorrect Answer
export const AITutorButton: React.FC<{
    isIncorrect: boolean;
    onClick: () => void;
    label?: string;
}> = ({ isIncorrect, onClick, label }) => {
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-md ${
                isIncorrect
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white animate-pulse shadow-rose-500/30 ring-2 ring-rose-400 ring-offset-2 ring-offset-slate-900'
                    : 'bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30'
            }`}
        >
            <Bot size={16} className={isIncorrect ? 'animate-spin' : ''} />
            <span>{label || (isIncorrect ? '🤖 Ask AI Tutor Why' : 'AI Tutor')}</span>
        </button>
    );
};
