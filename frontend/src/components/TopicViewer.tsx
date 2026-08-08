import { useState, useEffect } from 'react';
import { PlayCircle, ArrowLeft, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Sparkles, Bot, Video, FileText, MessageSquare, HelpCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { api } from '../lib/api';
import { InteractiveCheatSheet } from './InteractiveCheatSheet';
import { QuestionBank } from './QuestionBank';
import './TopicViewer.css';

interface Props {
    initialSubtopicId: string;
    onBack: () => void;
    completedItems: Set<string>;
    onItemComplete: (itemId: string, metrics?: any) => void;
    onStartTest: () => void;
    difficulty?: 'easy' | 'medium' | 'hard';
    onTopicChange?: (topicId: string, exerciseId: string) => void;
}

const parseVideoBlock = (data: string) => {
    if (!data) return { url: '', title: '' };
    if (data.trim().startsWith('{')) {
        try {
            return JSON.parse(data);
        } catch {
            return { url: data, title: '' };
        }
    }
    return { url: data, title: '' };
};

export const TopicViewer = ({ initialSubtopicId, onBack, completedItems, onItemComplete, onStartTest, difficulty = 'easy', onTopicChange }: Props) => {
    const [timeSpent, setTimeSpent] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
    const [showResults, setShowResults] = useState(false);
    const [subtopicData, setSubtopicData] = useState<any>(null);
    const [exercises, setExercises] = useState<any[]>([]);
    const [aiThinkingFor, setAiThinkingFor] = useState<number | null>(null);
    const [selectedBlockIndex, setSelectedBlockIndex] = useState<string>("0");
    const [videoTab, setVideoTab] = useState<'notes' | 'discussions' | 'doubts'>('notes');
    const [expandedDayId, setExpandedDayId] = useState<string | null>(initialSubtopicId);
    const [showQuestionBank, setShowQuestionBank] = useState<boolean>(false);

    useEffect(() => {
        // Fetch All Exercises for Sidebar
        api.getExercises()
            .then(data => setExercises(data))
            .catch(err => console.error(err));

        // Fetch Specific Subtopic Content
        api.getSubtopic(parseInt(initialSubtopicId))
            .then(data => setSubtopicData(data))
            .catch(err => console.error(err));

        // Reset state for new topic
        setQuizAnswers({});
        setShowResults(false);
        setAiThinkingFor(null);
        setTimeSpent(0);
        setSelectedBlockIndex("0");
        setVideoTab('notes');
        setExpandedDayId(initialSubtopicId);

        const timer = setInterval(() => {
            setTimeSpent(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [initialSubtopicId]);

    const questions = subtopicData?.contentBlocks
        ?.filter((b: any) => b.checkpoint)
        ?.map((b: any) => ({
            ...b.checkpoint,
            options: JSON.parse(b.checkpoint.options),
            answer: JSON.parse(b.checkpoint.correctAnswer)
        })) || [];

    const handleQuizSubmit = () => {
        setShowResults(true);
        let mistakes = 0;
        questions.forEach((q: any, i: number) => {
            const correctIndex = q.options.indexOf(q.answer);
            if (quizAnswers[i] !== correctIndex) mistakes++;
        });

        onItemComplete(initialSubtopicId, {
            timeTakenSecs: timeSpent,
            mistakesCount: mistakes,
            difficultyAssigned: difficulty
        });
    };

    const handleOptionClick = (qIndex: number, oIndex: number) => {
        if (quizAnswers[qIndex] !== undefined) return;
        setQuizAnswers({ ...quizAnswers, [qIndex]: oIndex });
        setAiThinkingFor(qIndex);
        setTimeout(() => {
            setAiThinkingFor(null);
        }, 1500);
    };

    if (!subtopicData) return <div className="p-10">Loading content...</div>;

    const hasContent = subtopicData.contentBlocks && subtopicData.contentBlocks.some((b: any) => (b.contentType === 'markdown' && b.contentData && b.contentData.trim() !== '') || b.contentType === 'video');

    const blocks = subtopicData?.contentBlocks || [];
    const activeBlocks = blocks[parseInt(selectedBlockIndex)] 
        ? [blocks[parseInt(selectedBlockIndex)]] 
        : blocks;

    return (
        <div className="topic-viewer-layout">
            {/* LEFT SIDEBAR NAVIGATION */}
            <div className="topic-sidebar">
                <button className="back-course-btn" onClick={onBack}>
                    <ChevronLeft size={20} /> BACK TO COURSE
                </button>

                <div className="exercise-accordion">
                    {exercises.map(exercise => (
                        <div key={exercise.id} className={`acc-section expanded`}>
                            <div className="acc-header">
                                {exercise.title}
                            </div>

                            <div className="acc-content" style={{ padding: '0.75rem' }}>
                                {exercise.subtopics.map((topic: any) => {
                                    const topicIdStr = topic.id.toString();
                                    const isActiveDay = topicIdStr === initialSubtopicId;
                                    const isExpanded = expandedDayId === topicIdStr;

                                    return (
                                        <div 
                                            key={topic.id} 
                                            className={`sidebar-day-accordion ${isActiveDay ? 'active-day' : ''}`}
                                        >
                                            {/* Header / Day Title */}
                                            <div 
                                                className="sidebar-day-header"
                                                onClick={() => {
                                                    setExpandedDayId(prev => prev === topicIdStr ? null : topicIdStr);
                                                    if (!isActiveDay && onTopicChange) {
                                                        onTopicChange(topicIdStr, exercise.id.toString());
                                                    }
                                                }}
                                            >
                                                <div className="sidebar-day-header-left">
                                                    <div className={`status-circle ${completedItems.has(topicIdStr) ? 'completed' : ''}`}>
                                                        {completedItems.has(topicIdStr) && <CheckCircle2 size={12} />}
                                                    </div>
                                                    <span className="sidebar-day-title">{topic.title}</span>
                                                </div>
                                                <ChevronRight className={`sidebar-chevron ${isExpanded ? 'expanded' : ''}`} size={16} />
                                            </div>

                                            {/* Sub-items Panel (visible when expanded) */}
                                            {isExpanded && (
                                                <div className="sidebar-sub-items-panel">
                                                    {isActiveDay && blocks.length > 0 ? (
                                                        (() => {
                                                            let vCount = 0;
                                                            let cCount = 0;
                                                            return blocks.map((b: any, idx: number) => {
                                                                let label = `Item ${idx + 1}`;
                                                                let IconComp = FileText;
                                                                if (b.contentType === 'video') {
                                                                    vCount++;
                                                                    const { title: vTitle } = parseVideoBlock(b.contentData);
                                                                    label = vTitle || `Video ${vCount}`;
                                                                    IconComp = Video;
                                                                } else if (b.contentType === 'markdown') {
                                                                    cCount++;
                                                                    label = `Cheat Sheet ${cCount}`;
                                                                    IconComp = FileText;
                                                                }
                                                                const isItemSelected = selectedBlockIndex === idx.toString();
                                                                return (
                                                                    <button
                                                                        key={b.id}
                                                                        onClick={() => setSelectedBlockIndex(idx.toString())}
                                                                        className={`sidebar-sub-item ${isItemSelected ? 'active' : ''}`}
                                                                        title={label}
                                                                    >
                                                                        <IconComp size={15} style={{ flexShrink: 0 }} />
                                                                        <span className="truncate">{label}</span>
                                                                    </button>
                                                                );
                                                            });
                                                        })()
                                                    ) : (
                                                        [
                                                            { idx: '0', label: 'Video 1', IconComp: Video },
                                                            { idx: '1', label: 'Cheat Sheet 1', IconComp: FileText },
                                                            { idx: '2', label: 'Video 2', IconComp: Video },
                                                            { idx: '3', label: 'Cheat Sheet 2', IconComp: FileText }
                                                        ].map((item) => (
                                                            <button
                                                                key={item.idx}
                                                                onClick={() => {
                                                                    if (!isActiveDay && onTopicChange) {
                                                                        onTopicChange(topicIdStr, exercise.id.toString());
                                                                    }
                                                                    setSelectedBlockIndex(item.idx);
                                                                }}
                                                                className={`sidebar-sub-item ${isActiveDay && selectedBlockIndex === item.idx ? 'active' : ''}`}
                                                            >
                                                                <item.IconComp size={15} style={{ flexShrink: 0 }} />
                                                                <span className="truncate">{item.label}</span>
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                <button className="pers-mastery-btn" style={{ margin: '1rem 0 0.5rem 0', width: '100%' }} onClick={onStartTest}>
                                    👑 Personalized Mastery Test
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT CONTENT AREA */}
            <div className="topic-content-area">
                <div className="content-inner-wrapper">

                    <div className="cheat-sheet-view">
                        <div className="cs-topic-title">{subtopicData.title}</div>
                        
                        {!hasContent && questions.length === 0 && (
                            <div className="text-gray-500 mt-4 italic">Content is currently being prepared for this topic.</div>
                        )}

                        {activeBlocks.map((block: any) => (
                            <div key={block.id} className="mb-8">
                                {/* VIDEO BLOCK */}
                                {block.contentType === 'video' && (() => {
                                    const { url: videoUrl, title: videoTitle } = parseVideoBlock(block.contentData);
                                    return (
                                        <div className="video-section-wrapper mb-6">
                                            {videoTitle && (
                                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', lineHeight: '1.4' }}>
                                                    {videoTitle}
                                                </h3>
                                            )}
                                            <div className="video-container" style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '0.75rem', marginBottom: '1.25rem', backgroundColor: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                                {videoUrl && videoUrl.trim() !== '' ? (
                                                    <iframe 
                                                        src={videoUrl}
                                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                        title={videoTitle || "Video Player"}
                                                    />
                                                ) : (
                                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: '0.5rem' }}>
                                                        <Video size={48} />
                                                        <span style={{ fontSize: '1rem', fontWeight: 600 }}>Video Placeholder</span>
                                                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Video URL will be added here</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Under Video: Notes, Discussions, Doubts */}
                                            <div className="video-accessories-card" style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                                <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', gap: '1rem', marginBottom: '1rem' }}>
                                                    <button
                                                        onClick={() => setVideoTab('notes')}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            fontWeight: 600,
                                                            fontSize: '0.875rem',
                                                            borderBottom: videoTab === 'notes' ? '2px solid #4f46e5' : '2px solid transparent',
                                                            color: videoTab === 'notes' ? '#4f46e5' : '#64748b',
                                                            background: 'none',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.375rem'
                                                        }}
                                                    >
                                                        <FileText size={16} /> Notes
                                                    </button>
                                                    <button
                                                        onClick={() => setVideoTab('discussions')}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            fontWeight: 600,
                                                            fontSize: '0.875rem',
                                                            borderBottom: videoTab === 'discussions' ? '2px solid #4f46e5' : '2px solid transparent',
                                                            color: videoTab === 'discussions' ? '#4f46e5' : '#64748b',
                                                            background: 'none',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.375rem'
                                                        }}
                                                    >
                                                        <MessageSquare size={16} /> Discussions
                                                    </button>
                                                    <button
                                                        onClick={() => setVideoTab('doubts')}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            fontWeight: 600,
                                                            fontSize: '0.875rem',
                                                            borderBottom: videoTab === 'doubts' ? '2px solid #4f46e5' : '2px solid transparent',
                                                            color: videoTab === 'doubts' ? '#4f46e5' : '#64748b',
                                                            background: 'none',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.375rem'
                                                        }}
                                                    >
                                                        <HelpCircle size={16} /> Doubts Zone
                                                    </button>
                                                </div>

                                                <div style={{ color: '#475569', fontSize: '0.875rem', minHeight: '70px' }}>
                                                    {videoTab === 'notes' && (
                                                        <div>
                                                            <h4 style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.375rem' }}>Lecture Notes</h4>
                                                            <p style={{ color: '#64748b', fontStyle: 'italic' }}>Notes, summary, and key takeaways for this video will be listed here.</p>
                                                        </div>
                                                    )}
                                                    {videoTab === 'discussions' && (
                                                        <div>
                                                            <h4 style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.375rem' }}>Discussion Forum</h4>
                                                            <p style={{ color: '#64748b', fontStyle: 'italic' }}>Community discussion and comments for this video lesson.</p>
                                                        </div>
                                                    )}
                                                    {videoTab === 'doubts' && (
                                                        <div>
                                                            <h4 style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.375rem' }}>Doubts & Questions</h4>
                                                            <p style={{ color: '#64748b', fontStyle: 'italic' }}>Have doubts regarding this video? Ask questions or request AI Tutor guidance here.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* CHEAT SHEET MARKDOWN BLOCK */}
                                {block.contentType === 'markdown' && (
                                    <InteractiveCheatSheet
                                        subtopicTitle={subtopicData.title}
                                        markdownContent={block.contentData}
                                        onGoToQuestionBank={() => {
                                            setShowQuestionBank(true);
                                            setTimeout(() => {
                                                const qbEl = document.querySelector('.question-bank-container');
                                                if (qbEl) {
                                                    qbEl.scrollIntoView({ behavior: 'smooth' });
                                                }
                                            }, 100);
                                        }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* QUESTION BANK SECTION */}
                    {showQuestionBank && (
                        <div className="question-bank-container mt-10 pt-8 border-t border-slate-200">
                            <QuestionBank
                                title={`${subtopicData.title} • Video 1`}
                                onComplete={() => {
                                    if (onItemComplete) onItemComplete(subtopicData.id.toString());
                                }}
                            />
                        </div>
                    )}

                    {questions.length > 0 && (
                        <div className="quiz-view mt-12 border-t border-slate-200 pt-10">
                            <div className="quiz-card">
                                <div className="quiz-card-header">
                                    <div className="kc-badge">
                                        KNOWLEDGE CHECK <Sparkles size={16} />
                                    </div>
                                    <div className="progress-pill">
                                        {Object.keys(quizAnswers).length} / {questions.length} <span className="prog-bar-mini"></span>
                                    </div>
                                </div>

                                {questions.map((q: any, qIndex: number) => {
                                    const hasAnswered = showResults || quizAnswers[qIndex] !== undefined;
                                    const isAiThinking = aiThinkingFor === qIndex;

                                    return (
                                        <div key={q.id} className="quiz-question-block mb-10 pb-8 border-b last:border-0 border-slate-100">
                                            <h3 className="the-question"><ReactMarkdown>{q.questionText}</ReactMarkdown></h3>

                                            <div className="the-options">
                                                {q.options.map((opt: string, oIndex: number) => {
                                                    const isSelected = quizAnswers[qIndex] === oIndex;
                                                    const isCorrect = opt === q.answer;

                                                    let optClass = 'q-opt';
                                                    if (hasAnswered && !isAiThinking) {
                                                        if (isCorrect) optClass += ' correct';
                                                        else if (isSelected) optClass += ' incorrect';
                                                    } else if (isSelected) {
                                                        optClass += ' selected';
                                                    }

                                                    return (
                                                        <button
                                                            key={oIndex}
                                                            className={optClass}
                                                            onClick={() => handleOptionClick(qIndex, oIndex)}
                                                            disabled={hasAnswered}
                                                        >
                                                            {opt}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {hasAnswered && (
                                                <div className="ai-tutor-container mt-6 flex flex-col gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`ai-tutor-icon ${isAiThinking ? 'blinking' : 'done'}`}>
                                                            <Bot size={20} />
                                                        </div>
                                                        <div className="ai-tutor-text text-sm font-medium">
                                                            {isAiThinking ? "AI Tutor is analyzing your answer..." : "AI Tutor Explanation"}
                                                        </div>
                                                    </div>
                                                    
                                                    {!isAiThinking && (
                                                        <div className="explanation-box ml-[52px]">
                                                            <ReactMarkdown>{q.explanationMarkdown}</ReactMarkdown>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {Object.keys(quizAnswers).length === questions.length && !showResults && aiThinkingFor === null && (
                                    <div className="mt-8 text-center">
                                        <button className="go-to-quiz-btn" onClick={handleQuizSubmit}>
                                            Complete Topic <CheckCircle2 size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
