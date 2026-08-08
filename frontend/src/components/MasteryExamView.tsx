import { useState, useEffect } from 'react';
import { X, Clock, HelpCircle, BrainCircuit } from 'lucide-react';
import { api } from '../lib/api';
import './MasteryExamView.css';

interface Props {
    exerciseId: string;
    onClose: () => void;
    onComplete: (result: any) => void;
    telemetryData?: any[]; // Array of { itemId, timeTakenSecs, mistakesCount, difficultyAssigned }
}

export const MasteryExamView = ({ exerciseId, onClose, onComplete, telemetryData = [] }: Props) => {
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
    const [questions, setQuestions] = useState<any[]>([]);

    useEffect(() => {
        // Fetch real questions from the pool
        const exId = parseInt(exerciseId) || 1; // Default to 1 if string 'Exercise 8.1' etc.
        
        api.getMasteryQuestions(exId)
            .then(baseQuestions => {
                // Personalize the text based on telemetry
                const totalMistakes = telemetryData.reduce((sum, item) => sum + item.mistakesCount, 0);
                const totalTime = telemetryData.reduce((sum, item) => sum + item.timeTakenSecs, 0);

                const personalized = baseQuestions.map((q: any, i: number) => {
                    let prefix = "";
                    if (i === 0 && totalMistakes > 0) prefix = `Based on your ${totalMistakes} mistakes in the quizzes: `;
                    else if (i === 0 && totalMistakes === 0) prefix = "Since you had a perfect score, let's test advanced application: ";
                    else if (i === 1 && totalTime < 60) prefix = "Quick check for speed: ";
                    
                    return {
                        ...q,
                        text: prefix + q.questionText,
                        answer: q.options.indexOf(q.correctAnswer) // Convert value to index
                    };
                });
                setQuestions(personalized);
            })
            .catch(err => console.error(err));
    }, [exerciseId, telemetryData]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleOptionSelect = (optionIndex: number) => {
        const newAnswers = { ...examAnswers, [currentQuestion]: optionIndex };
        setExamAnswers(newAnswers);

        if (currentQuestion < questions.length - 1) {
            setTimeout(() => setCurrentQuestion(prev => prev + 1), 300);
        } else {
            // Calculate final score
            let correct = 0;
            questions.forEach((q, i) => {
                if (newAnswers[i] === q.answer) correct++;
            });
            const score = Math.round((correct / questions.length) * 100);

            setTimeout(() => {
                onComplete({ score, correct, total: questions.length, timeTaken: 600 - timeLeft });
            }, 500);
        }
    };

    if (questions.length === 0) return null;

    return (
        <div className="exam-container">
            <div className="exam-header">
                <div className="exam-info">
                    <h2>Mastery Exam: {exerciseId}</h2>
                    <div className="ai-generation-badge">
                        <BrainCircuit size={16} />
                        AI Generated based on your learning telemetry
                    </div>
                    <div className="timer">
                        <Clock size={18} className={timeLeft < 60 ? 'text-red-500 animate-pulse' : ''} />
                        <span className={timeLeft < 60 ? 'text-red-500 font-bold' : ''}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>
                <button className="quit-btn" onClick={onClose}>
                    <X size={24} />
                    <span>Quit</span>
                </button>
            </div>

            <div className="exam-progress-bar">
                <div
                    className="exam-progress-fill"
                    style={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
                ></div>
            </div>

            <main className="exam-content">
                <div className="question-card">
                    <div className="question-header mt-4">
                        <span className="question-number">Question {currentQuestion + 1} of {questions.length}</span>
                        <button className="hint-btn text-blue-500"><HelpCircle size={18} /> Hint</button>
                    </div>

                    <h3 className="question-text">{questions[currentQuestion].text}</h3>

                    <div className="options-grid">
                        {questions[currentQuestion].options.map((option: string, index: number) => (
                            <button
                                key={index}
                                className={`option-btn ${examAnswers[currentQuestion] === index ? 'selected' : ''}`}
                                onClick={() => handleOptionSelect(index)}
                            >
                                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                                <span className="option-content">{option}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};
