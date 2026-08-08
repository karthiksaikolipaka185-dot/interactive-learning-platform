import { useState } from 'react';
import { Mic, Send, X, Bot, Sparkles } from 'lucide-react';
import './FeynmanAssessment.css';

interface Props {
    exerciseName: string;
    onComplete: (proficiency: 'easy' | 'medium' | 'hard', explanation: string) => void;
    onClose: () => void;
}

export function FeynmanAssessment({ exerciseName, onComplete, onClose }: Props) {
    const [explanation, setExplanation] = useState('');
    const [isEvaluating, setIsEvaluating] = useState(false);

    // Mock evaluation based on word length for now
    const handleEvaluate = () => {
        if (!explanation.trim()) return;

        setIsEvaluating(true);

        // Simulate AI network delay
        setTimeout(() => {
            let proficiency: 'easy' | 'medium' | 'hard' = 'easy';
            const words = explanation.trim().split(/\s+/).length;

            if (words > 20) {
                proficiency = 'hard';
            } else if (words > 10) {
                proficiency = 'medium';
            }

            setIsEvaluating(false);
            onComplete(proficiency, explanation);
        }, 2000);
    };

    const handleSkip = () => {
        // Default to 'easy' and empty explanation if the user skips
        onComplete('easy', '');
    };

    return (
        <div className="feynman-overlay">
            <div className="feynman-container">
                <button className="feynman-close-btn" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="feynman-header">
                    <div className="ai-icon-pulse">
                        <Bot size={32} />
                    </div>
                    <h2>Pre-Exercise Assessment</h2>
                    <p>Let's use the Feynman Technique! Explain everything you know about <strong className="text-purple-600">{exerciseName}</strong> as if you were teaching a beginner.</p>
                </div>

                <div className="feynman-body">
                    <div className="input-container">
                        <textarea
                            className="explanation-input"
                            placeholder="Type your explanation here, or use voice..."
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            disabled={isEvaluating}
                        ></textarea>

                        <div className="input-actions">
                            <button className="voice-btn" disabled={isEvaluating} title="Record Voice">
                                <Mic size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button className="skip-btn" onClick={handleSkip} disabled={isEvaluating}>
                            Skip Assessment
                        </button>
                        <button
                            className={`submit-btn ${isEvaluating ? 'evaluating' : ''}`}
                            onClick={handleEvaluate}
                            disabled={isEvaluating || !explanation.trim()}
                        >
                            {isEvaluating ? (
                                <>Evaluating... <Sparkles className="animate-spin" size={18} /></>
                            ) : (
                                <>Submit Answer <Send size={18} /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
