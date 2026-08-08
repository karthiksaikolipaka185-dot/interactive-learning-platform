import React, { useState } from 'react';
import { Lock, CheckCircle2, AlertCircle, Sparkles, BookOpen, Lightbulb, ArrowRight, ShieldCheck, HelpCircle, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AITutorDrawer, AITutorButton, QuizContext } from './AITutorDrawer';
import { api } from '../lib/api';

interface Props {
    subtopicTitle: string;
    markdownContent: string;
    onGoToQuestionBank?: () => void;
}

export const InteractiveCheatSheet: React.FC<Props> = ({ subtopicTitle, markdownContent, onGoToQuestionBank }) => {
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [unlockedPartB, setUnlockedPartB] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [tutorContext, setTutorContext] = useState<QuizContext | null>(null);

    // Knowledge Check Question (Clean Unicode Math)
    const question = {
        text: "In a right-angled triangle, if sin θ = 4/5, what is the value of the reciprocal ratio cosecant (csc θ)?",
        options: [
            "5 / 4  (Reciprocal of Sine: 1 / sin θ)",
            "3 / 5  (Cosine ratio)",
            "4 / 3  (Tangent ratio)",
            "3 / 4  (Cotangent ratio)"
        ],
        correctIndex: 0,
        explanation: "Correct! Cosecant (csc θ) is the reciprocal ratio of Sine (sin θ). Since sin θ = Opposite / Hypotenuse = 4/5, csc θ = Hypotenuse / Opposite = 5/4."
    };

    // Fetch stored cheat sheet progress on mount
    React.useEffect(() => {
        const storedUserStr = localStorage.getItem('user_session');
        if (storedUserStr) {
            try {
                const userObj = JSON.parse(storedUserStr);
                const cheatId = subtopicTitle;
                api.getCheatSheetProgress(userObj.email, cheatId)
                    .then(cs => {
                        if (cs && cs.inlineQuizCompleted) {
                            setUnlockedPartB(true);
                            setIsAnswered(true);
                            setIsCorrect(true);
                            setSelectedOption(0);
                        }
                    })
                    .catch(err => console.error('Failed to restore cheat sheet progress', err));
            } catch (e) {
                console.error(e);
            }
        }
    }, [subtopicTitle]);

    const handleOptionSelect = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
        setIsAnswered(true);
        const correct = index === question.correctIndex;
        setIsCorrect(correct);

        if (correct) {
            setUnlockedPartB(true);
        }

        const storedUserStr = localStorage.getItem('user_session');
        if (storedUserStr) {
            try {
                const userObj = JSON.parse(storedUserStr);
                api.saveInlineQuizAttempt({
                    email: userObj.email,
                    quizId: `${subtopicTitle}-checkpoint`,
                    questionText: question.text,
                    selectedAnswer: question.options[index],
                    correctAnswer: question.options[question.correctIndex],
                    isCorrect: correct,
                    conceptName: 'Trigonometric Ratios'
                }).catch(err => console.error(err));

                api.saveCheatSheetProgress({
                    email: userObj.email,
                    cheatSheetId: subtopicTitle,
                    opened: true,
                    readingProgress: correct ? 100 : 50,
                    inlineQuizCompleted: correct,
                    completed: correct
                }).catch(err => console.error(err));
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleRetry = () => {
        setSelectedOption(null);
        setIsAnswered(false);
        setIsCorrect(false);
    };

    // Check if content is Day 1 Cheat Sheet 1 or generic cheat sheet
    const isDay1Cheat1 = markdownContent.includes("Fundamentals of Trigonometric Ratios") || subtopicTitle === 'Day 1';

    return (
        <div className="interactive-cheat-sheet space-y-8 text-slate-800">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        <BookOpen size={14} /> Interactive Study Notes • {subtopicTitle}
                    </span>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                        <span>Progress:</span>
                        <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                            <div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                                style={{ width: unlockedPartB ? '100%' : '50%' }}
                            />
                        </div>
                        <span className="font-bold text-white">{unlockedPartB ? '100%' : '50%'}</span>
                    </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-white mb-2">
                    {isDay1Cheat1 ? "Cheat Sheet: Fundamentals of Trigonometric Ratios" : `${subtopicTitle} Cheat Sheet`}
                </h1>
                <p className="text-sm text-slate-300">
                    Master key concepts, formulas, and worked examples with interactive checkpoint validation.
                </p>
            </div>

            {/* IF GENERIC CHEAT SHEET MARKDOWN */}
            {!isDay1Cheat1 ? (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
                    <div className="markdown-prose prose max-w-none text-slate-700">
                        <ReactMarkdown>{markdownContent}</ReactMarkdown>
                    </div>

                    {/* Generic Checkpoint */}
                    <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 space-y-4">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                            <Sparkles size={16} /> Knowledge Checkpoint
                        </div>
                        <p className="text-sm font-semibold">
                            Have you reviewed all concepts above carefully?
                        </p>
                        <button
                            onClick={() => setUnlockedPartB(true)}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-sm transition"
                        >
                            Mark Section Complete & Unlock Next Steps
                        </button>
                    </div>

                    {unlockedPartB && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-3">
                            <h3 className="text-base font-bold text-emerald-900">Section Unlocked 🎉</h3>
                            <button
                                onClick={onGoToQuestionBank}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition"
                            >
                                <span>Continue to Question Bank</span>
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                /* PART A - CONCEPTS & DEFINITIONS FOR DAY 1 CHEAT SHEET 1 */
                <div className="space-y-6">
                    {/* Section 1: Meaning of Trigonometry */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">1</span>
                            <h2 className="text-lg font-bold text-slate-900">The Meaning of Trigonometry</h2>
                        </div>

                        <p className="text-sm text-slate-600 leading-relaxed">
                            The word <strong className="text-indigo-600">Trigonometry</strong> is derived from three Greek root words:
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 text-center">
                                <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Tri</div>
                                <div className="text-lg font-black text-indigo-900">Three</div>
                            </div>
                            <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 text-center">
                                <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Gon</div>
                                <div className="text-lg font-black text-indigo-900">Sides</div>
                            </div>
                            <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 text-center">
                                <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Metry</div>
                                <div className="text-lg font-black text-indigo-900">Measurement</div>
                            </div>
                        </div>

                        <div className="bg-slate-50 border-l-4 border-indigo-500 p-4 rounded-r-xl text-sm text-slate-700">
                            Basic trigonometry is strictly applied to <strong>right-angled triangles</strong> (90° right angle + two acute angles &lt; 90°). It explores the relationship between acute angles and side lengths.
                        </div>
                    </div>

                    {/* Section 2: Naming the Sides with SVG Diagram */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">2</span>
                            <h2 className="text-lg font-bold text-slate-900">Naming the Sides of a Right-Angled Triangle</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            {/* SVG Right-Triangle Diagram */}
                            <div className="bg-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center text-white border border-slate-800 relative">
                                <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/50">
                                    Interactive Geometry Model
                                </span>
                                
                                <svg viewBox="0 0 300 200" className="w-full max-w-[260px] h-auto my-2">
                                    {/* Triangle ABC */}
                                    <polygon points="50,160 250,160 50,40" fill="rgba(99, 102, 241, 0.15)" stroke="#818cf8" strokeWidth="3" strokeLinejoin="round" />
                                    
                                    {/* Right Angle Box at B */}
                                    <rect x="50" y="145" width="15" height="15" fill="none" stroke="#22c55e" strokeWidth="2" />
                                    
                                    {/* Theta Arc at C (250, 160) */}
                                    <path d="M 210 160 A 40 40 0 0 0 220 138" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                                    <text x="200" y="152" fill="#f59e0b" fontSize="16" fontWeight="bold">θ</text>

                                    {/* Labels */}
                                    <text x="35" y="35" fill="#e2e8f0" fontSize="14" fontWeight="bold">A</text>
                                    <text x="35" y="175" fill="#e2e8f0" fontSize="14" fontWeight="bold">B (90°)</text>
                                    <text x="260" y="175" fill="#e2e8f0" fontSize="14" fontWeight="bold">C</text>

                                    {/* Side Names */}
                                    <text x="145" y="90" fill="#f43f5e" fontSize="12" fontWeight="bold" transform="rotate(-31, 145, 90)">Hypotenuse (Longest)</text>
                                    <text x="150" y="180" fill="#38bdf8" fontSize="12" fontWeight="bold">Adjacent (Base)</text>
                                    <text x="15" y="105" fill="#a855f7" fontSize="12" fontWeight="bold" transform="rotate(-90, 15, 105)">Opposite</text>
                                </svg>

                                <div className="text-center text-xs text-slate-400 mt-1">
                                    Triangle ABC with right angle at B and acute angle θ at C.
                                </div>
                            </div>

                            {/* Definition Lists */}
                            <div className="space-y-3">
                                <div className="p-3.5 bg-rose-50/70 border border-rose-100 rounded-xl">
                                    <div className="text-xs font-bold text-rose-600 uppercase tracking-wider">Hypotenuse</div>
                                    <div className="text-sm font-semibold text-slate-800">Directly opposite the 90° right angle. Always the longest side.</div>
                                </div>
                                <div className="p-3.5 bg-sky-50/70 border border-sky-100 rounded-xl">
                                    <div className="text-xs font-bold text-sky-600 uppercase tracking-wider">Adjacent Side (Base)</div>
                                    <div className="text-sm font-semibold text-slate-800">Right next to angle θ. It is the line on which angle θ sits.</div>
                                </div>
                                <div className="p-3.5 bg-purple-50/70 border border-purple-100 rounded-xl">
                                    <div className="text-xs font-bold text-purple-600 uppercase tracking-wider">Opposite Side (Perpendicular)</div>
                                    <div className="text-sm font-semibold text-slate-800">Directly across from the focused acute angle θ.</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start text-amber-900 text-sm">
                            <Lightbulb size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <strong>Pro-Tip:</strong> If you switch focus to acute angle A, the <em>Opposite</em> and <em>Adjacent</em> sides swap places, but the <strong>Hypotenuse always remains unchanged</strong>.
                            </div>
                        </div>
                    </div>

                    {/* Section 3: The Six Trigonometric Ratios Table */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">3</span>
                            <h2 className="text-lg font-bold text-slate-900">The Six Trigonometric Ratios</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="bg-slate-900 text-white rounded-lg">
                                        <th className="p-3 rounded-l-lg font-semibold">Category</th>
                                        <th className="p-3 font-semibold">Ratio Name</th>
                                        <th className="p-3 font-semibold">Symbol</th>
                                        <th className="p-3 font-semibold">Formula Ratio</th>
                                        <th className="p-3 rounded-r-lg font-semibold">Reciprocal Relation</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 font-bold text-indigo-600">Primary</td>
                                        <td className="p-3 font-medium">Sine</td>
                                        <td className="p-3 font-mono font-bold text-slate-900">sin θ</td>
                                        <td className="p-3 font-semibold">Opposite / Hypotenuse</td>
                                        <td className="p-3 text-slate-400">—</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 font-bold text-indigo-600">Primary</td>
                                        <td className="p-3 font-medium">Cosine</td>
                                        <td className="p-3 font-mono font-bold text-slate-900">cos θ</td>
                                        <td className="p-3 font-semibold">Adjacent / Hypotenuse</td>
                                        <td className="p-3 text-slate-400">—</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 font-bold text-indigo-600">Primary</td>
                                        <td className="p-3 font-medium">Tangent</td>
                                        <td className="p-3 font-mono font-bold text-slate-900">tan θ</td>
                                        <td className="p-3 font-semibold">Opposite / Adjacent</td>
                                        <td className="p-3 font-semibold text-emerald-600">sin θ / cos θ</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 font-bold text-amber-600">Reciprocal</td>
                                        <td className="p-3 font-medium">Cosecant</td>
                                        <td className="p-3 font-mono font-bold text-slate-900">csc θ</td>
                                        <td className="p-3 font-semibold">Hypotenuse / Opposite</td>
                                        <td className="p-3 font-semibold text-emerald-600">1 / sin θ</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 font-bold text-amber-600">Reciprocal</td>
                                        <td className="p-3 font-medium">Secant</td>
                                        <td className="p-3 font-mono font-bold text-slate-900">sec θ</td>
                                        <td className="p-3 font-semibold">Hypotenuse / Adjacent</td>
                                        <td className="p-3 font-semibold text-emerald-600">1 / cos θ</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="p-3 font-bold text-amber-600">Reciprocal</td>
                                        <td className="p-3 font-medium">Cotangent</td>
                                        <td className="p-3 font-mono font-bold text-slate-900">cot θ</td>
                                        <td className="p-3 font-semibold">Adjacent / Opposite</td>
                                        <td className="p-3 font-semibold text-emerald-600">1 / tan θ = cos θ / sin θ</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Section 4: Crucial Formulas & Warning */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">4</span>
                            <h2 className="text-lg font-bold text-slate-900">Important Quotient Identities & Golden Rule</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-900 text-white rounded-xl text-center border border-slate-800">
                                <div className="text-xs font-bold text-indigo-400 mb-1">Tangent Quotient Identity</div>
                                <div className="text-xl font-black font-mono text-emerald-400">tan θ = sin θ / cos θ</div>
                            </div>
                            <div className="p-4 bg-slate-900 text-white rounded-xl text-center border border-slate-800">
                                <div className="text-xs font-bold text-indigo-400 mb-1">Cotangent Quotient Identity</div>
                                <div className="text-xl font-black font-mono text-emerald-400">cot θ = cos θ / sin θ</div>
                            </div>
                        </div>

                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex gap-3 items-start text-rose-900 text-sm">
                            <AlertCircle size={20} className="text-rose-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <strong>CRUCIAL RULE:</strong> The expression <code>sin θ</code> is <strong>NOT</strong> the product of "sin" multiplied by "θ". The word "sin" completely loses its mathematical meaning if written without an angle attached!
                            </div>
                        </div>
                    </div>

                    {/* INLINE KNOWLEDGE CHECK (CHECKPOINT CARD) */}
                    <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border-2 border-indigo-500/30 relative">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-indigo-800/50">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
                                    <Sparkles size={14} /> Knowledge Checkpoint
                                </span>
                                <span className="text-xs text-slate-400 font-medium">1 Question Required</span>
                            </div>
                            {unlockedPartB && (
                                <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-700">
                                    <ShieldCheck size={14} /> UNLOCKED
                                </span>
                            )}
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-white mb-4 leading-snug">
                            {question.text}
                        </h3>

                        <div className="space-y-2.5 mb-6">
                            {question.options.map((optionText, idx) => {
                                let optStyle = "w-full text-left p-3.5 rounded-xl border text-sm font-semibold transition-all duration-200 flex items-center justify-between ";
                                if (isAnswered) {
                                    if (idx === question.correctIndex) {
                                        optStyle += "bg-emerald-500/20 border-emerald-500 text-emerald-200 ";
                                    } else if (selectedOption === idx) {
                                        optStyle += "bg-rose-500/20 border-rose-500 text-rose-200 ";
                                    } else {
                                        optStyle += "bg-slate-800/40 border-slate-800 text-slate-400 opacity-50 ";
                                    }
                                } else {
                                    optStyle += "bg-slate-800/60 border-slate-700/70 text-slate-200 hover:bg-indigo-600/30 hover:border-indigo-500/60 ";
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(idx)}
                                        disabled={isAnswered}
                                        className={optStyle}
                                    >
                                        <span>{optionText}</span>
                                        {isAnswered && idx === question.correctIndex && (
                                            <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {isAnswered && (
                            <div className={`p-4 rounded-xl text-sm ${isCorrect ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-200' : 'bg-rose-950/80 border border-rose-500/40 text-rose-200'}`}>
                                <div className="font-bold mb-1 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        {isCorrect ? (
                                            <>
                                                <CheckCircle2 size={18} className="text-emerald-400" />
                                                <span>Awesome! Part B Unlocked 🎉</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle size={18} className="text-rose-400" />
                                                <span>Not quite. Let's review:</span>
                                            </>
                                        )}
                                    </div>
                                    {!isCorrect && selectedOption !== null && (
                                        <AITutorButton
                                            isIncorrect={true}
                                            onClick={() => {
                                                setTutorContext({
                                                    day: subtopicTitle,
                                                    videoOrCheatSheet: 'Cheat Sheet 1',
                                                    questionText: question.text,
                                                    options: question.options,
                                                    selectedAnswer: question.options[selectedOption] || '',
                                                    correctAnswer: question.options[question.correctIndex],
                                                    explanation: question.explanation
                                                });
                                                setIsDrawerOpen(true);
                                            }}
                                        />
                                    )}
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed mb-2">{question.explanation}</p>
                                {!isCorrect && (
                                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-rose-800/50">
                                        <div className="text-xs text-amber-300 font-medium flex items-center gap-1">
                                            💡 Need help? Click the pulsing AI Tutor button above to ask why this answer is incorrect.
                                        </div>
                                        <button
                                            onClick={handleRetry}
                                            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition flex-shrink-0"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* PART B - WORKED EXAMPLES & KEY TAKEAWAYS (LOCKED UNTIL CHECKPOINT PASSED) */}
                    {!unlockedPartB ? (
                        <div className="bg-slate-100 rounded-2xl p-8 border-2 border-dashed border-slate-300 text-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                                <Lock size={24} />
                            </div>
                            <h3 className="text-base font-bold text-slate-700">🔒 Part B Content Locked</h3>
                            <p className="text-xs text-slate-500 max-w-md mx-auto">
                                Answer the Knowledge Checkpoint above correctly to unlock the 3-4-5 Triangle Practical Example, Worked Solutions, and Question Bank access.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fadeIn">
                            {/* Section 5: Practical Example */}
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                    <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-sm">5</span>
                                    <h2 className="text-lg font-bold text-slate-900">Practical Example: 3-4-5 Right Triangle</h2>
                                </div>

                                <p className="text-sm text-slate-600">
                                    Consider a right triangle with side lengths 3 cm, 4 cm, and hypotenuse 5 cm.
                                </p>

                                <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <div className="text-xs text-indigo-400 font-bold uppercase">Pythagorean Verification</div>
                                        <div className="text-base font-mono font-bold">5² = 3² + 4²  ⟹  25 = 9 + 16 ✅</div>
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold rounded-lg">
                                        Valid Right Triangle
                                    </span>
                                </div>

                                <div className="text-sm font-semibold text-slate-800">
                                    For acute angle C where Opposite = 4, Adjacent = 3, and Hypotenuse = 5:
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                                        <div className="text-xs font-bold text-slate-500 mb-1">sin C</div>
                                        <div className="text-lg font-black text-indigo-600 font-mono">4 / 5 = 0.8</div>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                                        <div className="text-xs font-bold text-slate-500 mb-1">cos C</div>
                                        <div className="text-lg font-black text-indigo-600 font-mono">3 / 5 = 0.6</div>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                                        <div className="text-xs font-bold text-slate-500 mb-1">tan C</div>
                                        <div className="text-lg font-black text-indigo-600 font-mono">4 / 3 = 1.33</div>
                                    </div>
                                </div>
                            </div>

                            {/* Question Bank CTA */}
                            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white text-center shadow-lg space-y-3">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white">
                                    <ShieldCheck size={14} /> Cheat Sheet Complete
                                </div>
                                <h3 className="text-lg font-black">Ready to Test Your Mastery?</h3>
                                <p className="text-xs text-emerald-100 max-w-lg mx-auto">
                                    You've completed the interactive cheat sheet notes. Proceed to the Question Bank to solve practice problems!
                                </p>
                                <button
                                    onClick={onGoToQuestionBank}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-900 font-black rounded-xl text-sm shadow-md hover:bg-emerald-50 transition transform hover:-translate-y-0.5"
                                >
                                    <span>Continue to Question Bank</span>
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* AI TUTOR DRAWER SLIDE-OVER */}
            <AITutorDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                context={tutorContext}
            />
        </div>
    );
};
