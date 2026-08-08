import React, { useState } from 'react';
import { CheckCircle2, XCircle, Trophy, RotateCcw, ArrowRight, Sparkles, HelpCircle, Lightbulb, Award, Bot } from 'lucide-react';
import { AITutorDrawer, AITutorButton, QuizContext } from './AITutorDrawer';
import { api } from '../lib/api';

export interface QuestionItem {
    id: number;
    difficulty: 'Easy' | 'Medium' | 'Challenge';
    text: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
}

export const DAY1_VIDEO1_QUESTIONS: QuestionItem[] = [
    // 🟢 EASY (1-5)
    {
        id: 1,
        difficulty: 'Easy',
        text: 'What does the word "Trigonometry" literally mean?',
        options: ['Study of circles', 'Measurement of three sides', 'Measurement of angles', 'Measurement of distances'],
        correctIndex: 1,
        explanation: 'Trigonometry comes from Tri (three), Gon (sides), and Metry (measurement).'
    },
    {
        id: 2,
        difficulty: 'Easy',
        text: 'Which triangle is mainly used in basic trigonometry?',
        options: ['Equilateral', 'Isosceles', 'Right-angled', 'Scalene'],
        correctIndex: 2,
        explanation: 'Basic trigonometric ratios are defined using right-angled triangles.'
    },
    {
        id: 3,
        difficulty: 'Easy',
        text: 'Which side is always opposite the 90° angle?',
        options: ['Adjacent', 'Opposite', 'Hypotenuse', 'Base'],
        correctIndex: 2,
        explanation: 'The hypotenuse is always opposite the right angle and is the longest side.'
    },
    {
        id: 4,
        difficulty: 'Easy',
        text: 'Which side changes when θ changes?',
        options: ['Hypotenuse', 'Adjacent', 'Only Hypotenuse', 'None'],
        correctIndex: 1,
        explanation: 'The adjacent and opposite sides depend on the chosen angle θ.'
    },
    {
        id: 5,
        difficulty: 'Easy',
        text: 'Which side is the longest in a right triangle?',
        options: ['Opposite', 'Adjacent', 'Hypotenuse', 'Base'],
        correctIndex: 2,
        explanation: 'The hypotenuse is always the longest side in a right-angled triangle.'
    },

    // 🟡 MEDIUM (6-10)
    {
        id: 6,
        difficulty: 'Medium',
        text: 'sin θ equals',
        options: ['Opposite / Hypotenuse', 'Adjacent / Hypotenuse', 'Opposite / Adjacent', 'Adjacent / Opposite'],
        correctIndex: 0,
        explanation: 'Sine is defined as the ratio of Opposite side to Hypotenuse.'
    },
    {
        id: 7,
        difficulty: 'Medium',
        text: 'cos θ equals',
        options: ['Opposite / Adjacent', 'Adjacent / Hypotenuse', 'Opposite / Hypotenuse', 'Hypotenuse / Opposite'],
        correctIndex: 1,
        explanation: 'Cosine is defined as the ratio of Adjacent side to Hypotenuse.'
    },
    {
        id: 8,
        difficulty: 'Medium',
        text: 'tan θ equals',
        options: ['Opposite / Adjacent', 'Adjacent / Hypotenuse', 'Opposite / Hypotenuse', 'Hypotenuse / Adjacent'],
        correctIndex: 0,
        explanation: 'Tangent is defined as the ratio of Opposite side to Adjacent side.'
    },
    {
        id: 9,
        difficulty: 'Medium',
        text: 'Which ratio is the reciprocal of sin θ?',
        options: ['sec θ', 'cot θ', 'cosec θ', 'tan θ'],
        correctIndex: 2,
        explanation: 'Cosecant (cosec θ) is the reciprocal ratio of Sine (1 / sin θ).'
    },
    {
        id: 10,
        difficulty: 'Medium',
        text: 'Which ratio is the reciprocal of cos θ?',
        options: ['tan θ', 'sec θ', 'cosec θ', 'cot θ'],
        correctIndex: 1,
        explanation: 'Secant (sec θ) is the reciprocal ratio of Cosine (1 / cos θ).'
    },

    // 🔴 CHALLENGE (11-15)
    {
        id: 11,
        difficulty: 'Challenge',
        text: 'If Opposite = 4 and Hypotenuse = 5, find sin θ.',
        options: ['5/4', '3/5', '4/5', '4/3'],
        correctIndex: 2,
        explanation: 'sin θ = Opposite / Hypotenuse = 4 / 5.'
    },
    {
        id: 12,
        difficulty: 'Challenge',
        text: 'If Adjacent = 3 and Hypotenuse = 5, find cos θ.',
        options: ['3/5', '5/3', '4/5', '5/4'],
        correctIndex: 0,
        explanation: 'cos θ = Adjacent / Hypotenuse = 3 / 5.'
    },
    {
        id: 13,
        difficulty: 'Challenge',
        text: 'If Opposite = 4 and Adjacent = 3, find tan θ.',
        options: ['3/4', '5/4', '4/3', '5/3'],
        correctIndex: 2,
        explanation: 'tan θ = Opposite / Adjacent = 4 / 3.'
    },
    {
        id: 14,
        difficulty: 'Challenge',
        text: 'Which identity is correct?',
        options: ['tan θ = sin θ / cos θ', 'tan θ = cos θ / sin θ', 'tan θ = sec θ / cosec θ', 'tan θ = sin θ × cos θ'],
        correctIndex: 0,
        explanation: 'The quotient identity for Tangent is tan θ = sin θ / cos θ.'
    },
    {
        id: 15,
        difficulty: 'Challenge',
        text: 'Which statement is TRUE?',
        options: [
            'sin θ means sin × θ',
            'sin θ is a trigonometric function of angle θ',
            'sin θ is always greater than 1',
            'sin θ equals tan θ'
        ],
        correctIndex: 1,
        explanation: 'The notation sin θ represents the sine function applied to the angle θ, not multiplication.'
    }
];

interface Props {
    title?: string;
    questions?: QuestionItem[];
    onComplete?: () => void;
}

export const QuestionBank: React.FC<Props> = ({
    title = "Question Bank • Day 1",
    questions = DAY1_VIDEO1_QUESTIONS,
    onComplete
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [userAnswers, setUserAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [tutorContext, setTutorContext] = useState<QuizContext | null>(null);

    const currentQuestion = questions[currentIndex];
    const totalQuestions = questions.length;
    const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

    const handleOptionSelect = (optionIdx: number) => {
        if (isSubmitted) return;
        setSelectedOption(optionIdx);
    };

    const handleConfirmAnswer = () => {
        if (selectedOption === null) return;
        const newAnswers = [...userAnswers];
        newAnswers[currentIndex] = selectedOption;
        setUserAnswers(newAnswers);
        setIsSubmitted(true);
    };

    const handleNextQuestion = () => {
        if (currentIndex < totalQuestions - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(userAnswers[currentIndex + 1] ?? null);
            setIsSubmitted(userAnswers[currentIndex + 1] !== null);
        } else {
            setIsFinished(true);

            // Persist Question Bank Run to Backend Database
            const storedUserStr = localStorage.getItem('user_session');
            if (storedUserStr) {
                try {
                    const userObj = JSON.parse(storedUserStr);
                    const finalScore = userAnswers.reduce<number>((acc, ans, idx) => {
                        return ans === questions[idx].correctIndex ? acc + 1 : acc;
                    }, 0);
                    const pct = Math.round((finalScore / totalQuestions) * 100);

                    const formattedAnswers = questions.map((q, idx) => ({
                        questionId: q.id,
                        questionText: q.text,
                        studentAnswer: userAnswers[idx] !== null ? q.options[userAnswers[idx]!] : 'Unanswered',
                        correctAnswer: q.options[q.correctIndex],
                        isCorrect: userAnswers[idx] === q.correctIndex,
                        attempts: 1
                    }));

                    api.saveQuestionBankSubmission({
                        email: userObj.email,
                        bankTitle: title,
                        totalScore: finalScore,
                        totalQuestions,
                        percentage: pct,
                        accuracy: pct,
                        answers: formattedAnswers
                    }).catch(err => console.error("Failed to save Question Bank submission", err));
                } catch (e) {
                    console.error(e);
                }
            }
        }
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setSelectedOption(null);
        setUserAnswers(new Array(totalQuestions).fill(null));
        setIsSubmitted(false);
        setIsFinished(false);
    };

    // Calculate Final Results
    const score = userAnswers.reduce<number>((acc, ans, idx) => {
        return ans === questions[idx].correctIndex ? acc + 1 : acc;
    }, 0);
    const isExcellent = score >= Math.ceil(totalQuestions * 0.75);

    // Difficulty badge renderer
    const getDifficultyBadge = (diff: 'Easy' | 'Medium' | 'Challenge') => {
        switch (diff) {
            case 'Easy':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">🟢 Easy</span>;
            case 'Medium':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">🟡 Medium</span>;
            case 'Challenge':
                return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">🔴 Challenge</span>;
        }
    };

    // RESULT SCREEN
    if (isFinished) {
        return (
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-10 shadow-2xl border border-slate-800 space-y-8 animate-fadeIn max-w-3xl mx-auto">
                <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                        <Trophy size={32} className="text-slate-950" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">
                        🎉 Question Bank Completed!
                    </h2>
                    <p className="text-sm text-slate-400">
                        Great job working through the practice questions for {title}.
                    </p>
                </div>

                {/* Score Card */}
                <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                    <div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Final Score</div>
                        <div className="text-3xl font-black text-emerald-400">{score} / {totalQuestions}</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Performance</div>
                        <div className={`text-xl font-extrabold ${isExcellent ? 'text-emerald-300' : 'text-amber-400'}`}>
                            {isExcellent ? 'Excellent 🌟' : 'Needs Revision 📖'}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Accuracy</div>
                        <div className="text-3xl font-black text-indigo-400">
                            {Math.round((score / totalQuestions) * 100)}%
                        </div>
                    </div>
                </div>

                {/* Stats Breakdown */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
                        <CheckCircle2 size={24} className="text-emerald-400 flex-shrink-0" />
                        <div>
                            <div className="text-xs text-emerald-400 font-bold">Correct Answers</div>
                            <div className="text-lg font-black text-white">{score}</div>
                        </div>
                    </div>
                    <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-4 flex items-center gap-3">
                        <XCircle size={24} className="text-rose-400 flex-shrink-0" />
                        <div>
                            <div className="text-xs text-rose-400 font-bold">Incorrect Answers</div>
                            <div className="text-lg font-black text-white">{totalQuestions - score}</div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-800">
                    <button
                        onClick={handleRestart}
                        className="flex-1 py-3 px-6 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 border border-slate-700"
                    >
                        <RotateCcw size={18} /> Retry Question Bank
                    </button>
                    <button
                        onClick={onComplete}
                        className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-black rounded-xl text-sm shadow-lg transition flex items-center justify-center gap-2"
                    >
                        <span>Continue Learning</span> <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        );
    }

    // ACTIVE QUESTION SCREEN
    return (
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-6 max-w-3xl mx-auto">
            {/* Top Navigation & Progress */}
            <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        {getDifficultyBadge(currentQuestion.difficulty)}
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Question {currentIndex + 1} of {totalQuestions}
                        </span>
                    </div>
                    <div className="text-xs font-bold text-indigo-400">
                        {progressPercent}% Completed
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-800">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-emerald-400 to-indigo-500 transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Question Text */}
            <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/80 flex flex-wrap items-start justify-between gap-4">
                <h3 className="text-lg sm:text-xl font-black text-white leading-relaxed flex-1">
                    {currentQuestion.text}
                </h3>
                <AITutorButton
                    isIncorrect={isSubmitted && selectedOption !== currentQuestion.correctIndex}
                    onClick={() => {
                        setTutorContext({
                            day: 'Day 1',
                            videoOrCheatSheet: title,
                            questionText: currentQuestion.text,
                            options: currentQuestion.options,
                            selectedAnswer: selectedOption !== null ? currentQuestion.options[selectedOption] : '',
                            correctAnswer: currentQuestion.options[currentQuestion.correctIndex],
                            explanation: currentQuestion.explanation
                        });
                        setIsDrawerOpen(true);
                    }}
                />
            </div>

            {/* Options List */}
            <div className="space-y-3">
                {currentQuestion.options.map((optText, optIdx) => {
                    const isSelected = selectedOption === optIdx;
                    const isCorrectOption = optIdx === currentQuestion.correctIndex;

                    let btnClass = "w-full text-left p-4 rounded-xl border text-sm font-bold transition-all duration-200 flex items-center justify-between ";

                    if (isSubmitted) {
                        if (isCorrectOption) {
                            btnClass += "bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-500/10 ";
                        } else if (isSelected) {
                            btnClass += "bg-rose-500/20 border-rose-500 text-rose-200 ";
                        } else {
                            btnClass += "bg-slate-800/40 border-slate-800 text-slate-500 opacity-40 ";
                        }
                    } else {
                        if (isSelected) {
                            btnClass += "bg-indigo-600/30 border-indigo-500 text-white shadow-md shadow-indigo-500/20 ";
                        } else {
                            btnClass += "bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-slate-600 ";
                        }
                    }

                    const optionLetters = ['A', 'B', 'C', 'D'];

                    return (
                        <button
                            key={optIdx}
                            onClick={() => handleOptionSelect(optIdx)}
                            disabled={isSubmitted}
                            className={btnClass}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                                    {optionLetters[optIdx]}
                                </span>
                                <span>{optText}</span>
                            </div>

                            {isSubmitted && isCorrectOption && (
                                <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />
                            )}
                            {isSubmitted && isSelected && !isCorrectOption && (
                                <XCircle size={20} className="text-rose-400 flex-shrink-0" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Explanation Box (Visible after submission) */}
            {isSubmitted && (
                <div className={`p-4 rounded-xl text-sm border space-y-2 animate-fadeIn ${selectedOption === currentQuestion.correctIndex ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200' : 'bg-rose-950/60 border-rose-500/40 text-rose-200'}`}>
                    <div className="font-bold flex items-center justify-between gap-2 text-xs uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                            {selectedOption === currentQuestion.correctIndex ? (
                                <>
                                    <CheckCircle2 size={16} className="text-emerald-400" />
                                    <span>Correct Answer!</span>
                                </>
                            ) : (
                                <>
                                    <XCircle size={16} className="text-rose-400" />
                                    <span>Incorrect Answer</span>
                                </>
                            )}
                        </div>

                        {selectedOption !== currentQuestion.correctIndex && (
                            <AITutorButton
                                isIncorrect={true}
                                label="🤖 Ask AI Tutor why this answer is incorrect"
                                onClick={() => {
                                    setTutorContext({
                                        day: 'Day 1',
                                        videoOrCheatSheet: title,
                                        questionText: currentQuestion.text,
                                        options: currentQuestion.options,
                                        selectedAnswer: selectedOption !== null ? currentQuestion.options[selectedOption] : '',
                                        correctAnswer: currentQuestion.options[currentQuestion.correctIndex],
                                        explanation: currentQuestion.explanation
                                    });
                                    setIsDrawerOpen(true);
                                }}
                            />
                        )}
                    </div>

                    {currentQuestion.explanation && (
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">
                            💡 <strong>Explanation:</strong> {currentQuestion.explanation}
                        </p>
                    )}
                </div>
            )}

            {/* Bottom Action Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div className="text-xs text-slate-400 font-medium">
                    {selectedOption === null ? 'Select an answer to proceed' : isSubmitted ? 'Review explanation above' : 'Confirm your choice'}
                </div>

                {!isSubmitted ? (
                    <button
                        onClick={handleConfirmAnswer}
                        disabled={selectedOption === null}
                        className={`px-6 py-2.5 rounded-xl text-sm font-black transition ${selectedOption !== null ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                    >
                        Submit Answer
                    </button>
                ) : (
                    <button
                        onClick={handleNextQuestion}
                        className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-sm shadow-lg transition flex items-center gap-2"
                    >
                        <span>{currentIndex < totalQuestions - 1 ? 'Next Question' : 'Finish & See Results'}</span>
                        <ArrowRight size={18} />
                    </button>
                )}
            </div>

            {/* AI TUTOR SLIDE-OVER DRAWER */}
            <AITutorDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                context={tutorContext}
            />
        </div>
    );
};
