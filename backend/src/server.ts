import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { generateLLMResponse, TutorContext } from './aiService';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper for Level and Rank Calculation
function calculateLevelAndRank(xp: number) {
    let level = 1;
    if (xp >= 2000) level = 5;
    else if (xp >= 1400) level = 4;
    else if (xp >= 900) level = 3;
    else if (xp >= 500) level = 2;
    else level = 1;

    let rank = 'Silver II';
    if (xp >= 1500) rank = 'Gold I';
    else if (xp >= 1000) rank = 'Gold II';
    else if (xp >= 600) rank = 'Silver I';

    return { level, rank };
}

// --- ROUTES ---

// 1. Get all courses/exercises
app.get('/api/exercises', async (req, res) => {
    try {
        const exercises = await prisma.exercise.findMany({
            include: {
                course: true,
                subtopics: {
                    select: {
                        id: true,
                        title: true,
                        sequenceOrder: true
                    },
                    orderBy: {
                        sequenceOrder: 'asc'
                    }
                }
            }
        });
        res.json(exercises);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch exercises' });
    }
});

// 2. Get specific subtopic with content
app.get('/api/subtopics/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const subtopic = await prisma.subtopic.findUnique({
            where: { id: parseInt(id) },
            include: {
                contentBlocks: {
                    include: {
                        checkpoint: true
                    },
                    orderBy: {
                        sequenceOrder: 'asc'
                    }
                }
            }
        });

        if (!subtopic) {
            return res.status(404).json({ error: 'Subtopic not found' });
        }

        res.json(subtopic);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch subtopic' });
    }
});

// 3. Save progress
app.post('/api/progress', async (req, res) => {
    const { email, subtopicId, score, timeSpent } = req.body;
    try {
        const progress = await prisma.userProgress.upsert({
            where: {
                userEmail_subtopicId: {
                    userEmail: email,
                    subtopicId: parseInt(subtopicId)
                }
            },
            update: {
                score,
                timeSpent: { increment: timeSpent || 0 }
            },
            create: {
                userEmail: email,
                subtopicId: parseInt(subtopicId),
                score,
                timeSpent: timeSpent || 0
            }
        });
        res.json(progress);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save progress' });
    }
});

// 4. Get Mastery Questions for an exercise
app.get('/api/mastery/:exerciseId', async (req, res) => {
    const { exerciseId } = req.params;
    try {
        const masterySubtopic = await prisma.subtopic.findFirst({
            where: {
                exerciseId: parseInt(exerciseId),
                sequenceOrder: 999 // The hidden pool
            },
            include: {
                contentBlocks: {
                    include: {
                        checkpoint: true
                    }
                }
            }
        });

        if (!masterySubtopic) {
            return res.status(404).json({ error: 'Mastery pool not found' });
        }

        const questions = masterySubtopic.contentBlocks
            .filter(b => b.checkpoint)
            .map(b => ({
                ...b.checkpoint,
                options: JSON.parse(b.checkpoint!.options),
                correctAnswer: JSON.parse(b.checkpoint!.correctAnswer)
            }));

        res.json(questions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch mastery questions' });
    }
});

// ----------------------------------------------------
// DYNAMIC STUDENT PROFILE & SESSION RESTORATION ROUTES
// ----------------------------------------------------

app.get('/api/user/profile/:email', async (req, res) => {
    const { email } = req.params;
    try {
        let user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name: email.split('@')[0] || 'Student',
                    xp: 0,
                    level: 1,
                    rank: 'Silver II',
                    currentStreak: 1,
                    longestStreak: 1,
                    totalStudyTime: 0,
                    currentChapter: 'Trigonometry',
                    currentExercise: 'Exercise 8.1',
                    currentDay: 'Day 1'
                }
            });
        }

        const { level, rank } = calculateLevelAndRank(user.xp);
        if (user.level !== level || user.rank !== rank) {
            user = await prisma.user.update({
                where: { email },
                data: { level, rank }
            });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

app.post('/api/user/profile', async (req, res) => {
    const {
        email, name, xp, level, currentStreak, totalStudyTime,
        currentChapter, currentExercise, currentDay, currentVideo, currentSubtopicId
    } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                ...(name && { name }),
                ...(xp !== undefined && { xp: { increment: xp } }),
                ...(level !== undefined && { level }),
                ...(currentStreak !== undefined && { currentStreak }),
                ...(totalStudyTime !== undefined && { totalStudyTime: { increment: totalStudyTime } }),
                ...(currentChapter !== undefined && { currentChapter }),
                ...(currentExercise !== undefined && { currentExercise }),
                ...(currentDay !== undefined && { currentDay }),
                ...(currentVideo !== undefined && { currentVideo }),
                ...(currentSubtopicId !== undefined && { currentSubtopicId: parseInt(currentSubtopicId) }),
                lastLogin: new Date()
            },
            create: {
                email,
                name: name || email.split('@')[0] || 'Student',
                xp: xp || 0,
                level: level || 1,
                rank: 'Silver II',
                currentStreak: currentStreak || 1,
                longestStreak: currentStreak || 1,
                totalStudyTime: totalStudyTime || 0,
                currentChapter: currentChapter || 'Trigonometry',
                currentExercise: currentExercise || 'Exercise 8.1',
                currentDay: currentDay || 'Day 1',
                currentVideo: currentVideo || null,
                currentSubtopicId: currentSubtopicId ? parseInt(currentSubtopicId) : null
            }
        });

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update user profile' });
    }
});

// Dynamic Dashboard Data Endpoint
app.get('/api/dashboard/:email', async (req, res) => {
    const { email } = req.params;
    try {
        let user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name: email.split('@')[0] || 'Student',
                    xp: 150,
                    level: 1,
                    rank: 'Silver II',
                    currentStreak: 3,
                    longestStreak: 3,
                    totalStudyTime: 1200,
                    currentChapter: 'Trigonometry',
                    currentExercise: 'Exercise 8.1',
                    currentDay: 'Day 1'
                }
            });
        }

        const masteries = await prisma.conceptMastery.findMany({
            where: { userEmail: email }
        });

        const defaultMasteries = masteries.length > 0 ? masteries : [
            { conceptName: 'Trigonometric Ratios', masteryScore: 82 },
            { conceptName: 'Triangle Identification', masteryScore: 96 },
            { conceptName: 'Reciprocal Ratios', masteryScore: 43 }
        ];

        const weakTopics = defaultMasteries.filter(m => m.masteryScore < 65);

        const videoLogs = await prisma.videoProgress.findMany({
            where: { userEmail: email }
        });

        const cheatSheetLogs = await prisma.cheatSheetProgress.findMany({
            where: { userEmail: email }
        });

        const qbSubmissions = await prisma.questionBankSubmission.findMany({
            where: { userEmail: email },
            orderBy: { completionDate: 'desc' },
            take: 5
        });

        res.json({
            user,
            masteries: defaultMasteries,
            weakTopics,
            continueLearning: {
                chapter: user.currentChapter || 'Trigonometry',
                exercise: user.currentExercise || 'Exercise 8.1',
                day: user.currentDay || 'Day 1',
                video: user.currentVideo || 'Day 1 • Video 1',
                subtopicId: user.currentSubtopicId || 1
            },
            recentActivity: {
                videosWatched: videoLogs.length,
                cheatSheetsRead: cheatSheetLogs.length,
                questionBanksCompleted: qbSubmissions.length
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// ----------------------------------------------------
// GROQ AI GENERATED DAILY MISSION ROUTES
// ----------------------------------------------------
app.get('/api/mission/today/:email', async (req, res) => {
    const { email } = req.params;
    const todayStr = new Date().toISOString().split('T')[0];

    try {
        let mission = await prisma.dailyMission.findUnique({
            where: { userEmail_dateStr: { userEmail: email, dateStr: todayStr } },
            include: { tasks: true }
        });

        if (!mission) {
            const masteries = await prisma.conceptMastery.findMany({ where: { userEmail: email } });
            const weakConcepts = masteries.filter(m => m.masteryScore < 65).map(m => m.conceptName);
            const weakContext = weakConcepts.length > 0 ? weakConcepts.join(', ') : 'Reciprocal Ratios';

            const missionPrompt = `Generate a 4-task personalized study mission (total ~60 min) for a mathematics student studying Trigonometry. The student has weak understanding in: "${weakContext}".
Return ONLY a valid raw JSON array of 4 objects matching this exact structure:
[
  {"title": "Watch Day 2 Video 1", "durationMinutes": 15, "taskType": "video"},
  {"title": "Complete Interactive Cheat Sheet", "durationMinutes": 15, "taskType": "cheatsheet"},
  {"title": "Solve Question Bank Practice", "durationMinutes": 20, "taskType": "question_bank"},
  {"title": "Review ${weakConcepts[0] || 'Reciprocal Ratios'}", "durationMinutes": 10, "taskType": "revision"}
]`;

            let tasksList = [
                { title: 'Watch Day 2 Video 1', durationMinutes: 15, taskType: 'video', completed: false },
                { title: 'Complete Interactive Cheat Sheet', durationMinutes: 15, taskType: 'cheatsheet', completed: false },
                { title: 'Solve Question Bank Practice', durationMinutes: 20, taskType: 'question_bank', completed: false },
                { title: `Review ${weakConcepts[0] || 'Reciprocal Ratios'}`, durationMinutes: 10, taskType: 'revision', completed: false }
            ];

            try {
                const aiRes = await generateLLMResponse([{ role: 'user', content: missionPrompt }]);
                const match = aiRes.match(/\[[\s\S]*\]/);
                if (match) {
                    const parsed = JSON.parse(match[0]);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        tasksList = parsed.map(t => ({
                            title: t.title || 'Study Lesson',
                            durationMinutes: t.durationMinutes || 15,
                            taskType: t.taskType || 'video',
                            completed: false
                        }));
                    }
                }
            } catch (aiErr) {
                console.warn('Groq Daily Mission AI fallback used:', aiErr);
            }

            mission = await prisma.dailyMission.create({
                data: {
                    userEmail: email,
                    dateStr: todayStr,
                    estimatedMinutes: 60,
                    completed: false,
                    tasks: {
                        create: tasksList
                    }
                },
                include: { tasks: true }
            });
        }

        res.json(mission);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch daily mission' });
    }
});

app.post('/api/mission/complete-task', async (req, res) => {
    const { taskId, completed, email } = req.body;
    try {
        const task = await prisma.dailyMissionTask.update({
            where: { id: parseInt(taskId) },
            data: { completed: !!completed }
        });

        // Award +25 XP per task
        if (completed && email) {
            await prisma.user.updateMany({
                where: { email },
                data: { xp: { increment: 25 } }
            });
        }

        res.json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update mission task' });
    }
});

// ----------------------------------------------------
// MY JOURNEY DYNAMIC DATA ROUTE
// ----------------------------------------------------
app.get('/api/journey/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const qbSubmissions = await prisma.questionBankSubmission.findMany({ where: { userEmail: email } });
        const videoLogs = await prisma.videoProgress.findMany({ where: { userEmail: email } });
        const cheatSheetLogs = await prisma.cheatSheetProgress.findMany({ where: { userEmail: email } });

        const trigCompletedCount = videoLogs.length + cheatSheetLogs.length + qbSubmissions.length;
        const trigPct = Math.min(100, Math.round((trigCompletedCount / 6) * 100)) || 72;

        res.json([
            {
                chapter: 'Trigonometry',
                completionPct: trigPct,
                videosCompleted: videoLogs.length,
                cheatSheetsCompleted: cheatSheetLogs.length,
                questionBanksCompleted: qbSubmissions.length,
                mastery: 82
            },
            {
                chapter: 'Algebra',
                completionPct: 0,
                videosCompleted: 0,
                cheatSheetsCompleted: 0,
                questionBanksCompleted: 0,
                mastery: 0
            },
            {
                chapter: 'Coordinate Geometry',
                completionPct: 0,
                videosCompleted: 0,
                cheatSheetsCompleted: 0,
                questionBanksCompleted: 0,
                mastery: 0
            },
            {
                chapter: 'Probability',
                completionPct: 0,
                videosCompleted: 0,
                cheatSheetsCompleted: 0,
                questionBanksCompleted: 0,
                mastery: 0
            }
        ]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch journey metrics' });
    }
});

// ----------------------------------------------------
// DOUBT ZONE CONVERSATIONS ROUTE
// ----------------------------------------------------
app.get('/api/doubt-zone/conversations/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const logs = await prisma.aIChatLog.findMany({
            where: { userEmail: email },
            orderBy: { timestamp: 'desc' },
            take: 30
        });

        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch Doubt Zone conversations' });
    }
});

// ----------------------------------------------------
// YOUR GROWTH ANALYTICS ROUTE
// ----------------------------------------------------
app.get('/api/analytics/growth/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        const qbSubmissions = await prisma.questionBankSubmission.findMany({ where: { userEmail: email } });
        const masteries = await prisma.conceptMastery.findMany({ where: { userEmail: email } });

        const avgAcc = qbSubmissions.length > 0
            ? Math.round(qbSubmissions.reduce((a, s) => a + s.accuracy, 0) / qbSubmissions.length)
            : 85;

        res.json({
            studyTimeSecs: user?.totalStudyTime || 1200,
            xp: user?.xp || 150,
            level: user?.level || 1,
            rank: user?.rank || 'Silver II',
            accuracy: avgAcc,
            weeklyProgress: [
                { day: 'Mon', hours: 1.2 },
                { day: 'Tue', hours: 0.8 },
                { day: 'Wed', hours: 1.5 },
                { day: 'Thu', hours: 0.5 },
                { day: 'Fri', hours: 2.0 },
                { day: 'Sat', hours: 1.8 },
                { day: 'Sun', hours: 1.1 }
            ],
            masteries
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch growth analytics' });
    }
});

// ----------------------------------------------------
// QUICK REVISION ROUTE
// ----------------------------------------------------
app.get('/api/analytics/quick-revision/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const masteries = await prisma.conceptMastery.findMany({ where: { userEmail: email } });
        const weak = masteries.filter(m => m.masteryScore < 65);

        if (weak.length === 0) {
            return res.json([
                { concept: 'Reciprocal Ratios', reason: 'Accuracy below 60% in recent quiz', urgency: 'High' },
                { concept: 'Quotient Identities', reason: 'Not practiced in last 3 days', urgency: 'Medium' }
            ]);
        }

        res.json(weak.map(w => ({
            concept: w.conceptName,
            reason: `Current mastery is ${Math.round(w.masteryScore)}% (below target)`,
            urgency: w.masteryScore < 50 ? 'High' : 'Medium'
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch revision topics' });
    }
});

// ----------------------------------------------------
// VIDEO PROGRESS ROUTES
// ----------------------------------------------------
app.post('/api/progress/video', async (req, res) => {
    const { email, videoId, watched, watchPercentage, lastPlaybackPosition, timeSpent } = req.body;

    if (!email || !videoId) {
        return res.status(400).json({ error: 'email and videoId are required' });
    }

    try {
        const vp = await prisma.videoProgress.upsert({
            where: {
                userEmail_videoId: { userEmail: email, videoId }
            },
            update: {
                watched: watched ?? false,
                watchPercentage: watchPercentage || 0,
                lastPlaybackPosition: lastPlaybackPosition || 0,
                ...(watched && { completedAt: new Date() })
            },
            create: {
                userEmail: email,
                videoId,
                watched: watched ?? false,
                watchPercentage: watchPercentage || 0,
                lastPlaybackPosition: lastPlaybackPosition || 0,
                ...(watched && { completedAt: new Date() })
            }
        });

        if (timeSpent) {
            await prisma.user.updateMany({
                where: { email },
                data: { totalStudyTime: { increment: timeSpent } }
            });
        }

        if (watched) {
            await prisma.user.updateMany({
                where: { email },
                data: { xp: { increment: 20 }, totalVideosCompleted: { increment: 1 } }
            });
        }

        res.json(vp);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save video progress' });
    }
});

app.get('/api/progress/video/:email/:videoId', async (req, res) => {
    const { email, videoId } = req.params;
    try {
        const vp = await prisma.videoProgress.findUnique({
            where: { userEmail_videoId: { userEmail: email, videoId } }
        });
        res.json(vp || { watched: false, watchPercentage: 0, lastPlaybackPosition: 0 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch video progress' });
    }
});

// ----------------------------------------------------
// CHEAT SHEET PROGRESS ROUTES
// ----------------------------------------------------
app.post('/api/progress/cheatsheet', async (req, res) => {
    const { email, cheatSheetId, opened, readingProgress, scrollPosition, inlineQuizCompleted, completed, timeSpentReading } = req.body;

    if (!email || !cheatSheetId) {
        return res.status(400).json({ error: 'email and cheatSheetId are required' });
    }

    try {
        const cs = await prisma.cheatSheetProgress.upsert({
            where: {
                userEmail_cheatSheetId: { userEmail: email, cheatSheetId }
            },
            update: {
                opened: opened ?? true,
                ...(readingProgress !== undefined && { readingProgress }),
                ...(scrollPosition !== undefined && { scrollPosition }),
                ...(inlineQuizCompleted !== undefined && { inlineQuizCompleted }),
                ...(completed !== undefined && { completed }),
                ...(timeSpentReading !== undefined && { timeSpentReading: { increment: timeSpentReading } })
            },
            create: {
                userEmail: email,
                cheatSheetId,
                opened: opened ?? true,
                readingProgress: readingProgress || 0,
                scrollPosition: scrollPosition || 0,
                inlineQuizCompleted: inlineQuizCompleted || false,
                completed: completed || false,
                timeSpentReading: timeSpentReading || 0
            }
        });

        if (timeSpentReading) {
            await prisma.user.updateMany({
                where: { email },
                data: { totalStudyTime: { increment: timeSpentReading } }
            });
        }

        if (completed) {
            await prisma.user.updateMany({
                where: { email },
                data: { xp: { increment: 40 }, totalCheatSheetsCompleted: { increment: 1 } }
            });
        }

        res.json(cs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save cheat sheet progress' });
    }
});

app.get('/api/progress/cheatsheet/:email/:cheatSheetId', async (req, res) => {
    const { email, cheatSheetId } = req.params;
    try {
        const cs = await prisma.cheatSheetProgress.findUnique({
            where: { userEmail_cheatSheetId: { userEmail: email, cheatSheetId } }
        });
        res.json(cs || { opened: false, readingProgress: 0, scrollPosition: 0, inlineQuizCompleted: false, completed: false });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch cheat sheet progress' });
    }
});

// ----------------------------------------------------
// INLINE QUIZ & CONCEPT MASTERY ROUTES
// ----------------------------------------------------
app.post('/api/progress/inline-quiz', async (req, res) => {
    const { email, quizId, questionText, selectedAnswer, correctAnswer, isCorrect, attempts, completionTime, conceptName } = req.body;

    if (!email || !quizId) {
        return res.status(400).json({ error: 'email and quizId are required' });
    }

    try {
        const attempt = await prisma.inlineQuizAttempt.create({
            data: {
                userEmail: email,
                quizId,
                questionText: questionText || '',
                selectedAnswer: selectedAnswer || '',
                correctAnswer: correctAnswer || '',
                isCorrect: !!isCorrect,
                attempts: attempts || 1,
                completionTime: completionTime || 0,
                accuracy: isCorrect ? 100 : 0
            }
        });

        if (isCorrect && email) {
            await prisma.user.updateMany({
                where: { email },
                data: { xp: { increment: 20 } }
            });
        }

        const targetConcept = conceptName || 'Trigonometric Ratios';
        const existingMastery = await prisma.conceptMastery.findUnique({
            where: { userEmail_conceptName: { userEmail: email, conceptName: targetConcept } }
        });

        let newScore = isCorrect ? 90 : 40;
        if (existingMastery) {
            newScore = isCorrect
                ? Math.min(100, existingMastery.masteryScore + 10)
                : Math.max(0, existingMastery.masteryScore - 15);
        }

        await prisma.conceptMastery.upsert({
            where: { userEmail_conceptName: { userEmail: email, conceptName: targetConcept } },
            update: { masteryScore: newScore },
            create: { userEmail: email, conceptName: targetConcept, masteryScore: newScore }
        });

        res.json(attempt);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save inline quiz attempt' });
    }
});

// ----------------------------------------------------
// QUESTION BANK ROUTES
// ----------------------------------------------------
app.post('/api/progress/question-bank', async (req, res) => {
    const { email, bankTitle, totalScore, totalQuestions, percentage, accuracy, answers } = req.body;

    if (!email || !bankTitle) {
        return res.status(400).json({ error: 'email and bankTitle are required' });
    }

    try {
        const submission = await prisma.questionBankSubmission.create({
            data: {
                userEmail: email,
                bankTitle,
                totalScore: totalScore || 0,
                totalQuestions: totalQuestions || 0,
                percentage: percentage || 0,
                accuracy: accuracy || 0,
                answers: {
                    create: (answers || []).map((ans: any) => ({
                        questionId: ans.questionId || 0,
                        questionText: ans.questionText || '',
                        studentAnswer: ans.studentAnswer || '',
                        correctAnswer: ans.correctAnswer || '',
                        isCorrect: !!ans.isCorrect,
                        attempts: ans.attempts || 1,
                        timeTaken: ans.timeTaken || 0
                    }))
                }
            },
            include: { answers: true }
        });

        const xpEarned = (totalScore || 0) * 10 + 80;
        await prisma.user.upsert({
            where: { email },
            update: {
                xp: { increment: xpEarned },
                totalQuestionBanksCompleted: { increment: 1 }
            },
            create: { email, name: email.split('@')[0], xp: xpEarned, level: 1, currentStreak: 1 }
        });

        const defaultConcepts = [
            { name: 'Trigonometric Ratios', score: percentage >= 75 ? 85 : 55 },
            { name: 'Triangle Identification', score: percentage >= 80 ? 95 : 60 },
            { name: 'Reciprocal Ratios', score: percentage >= 60 ? 70 : 43 }
        ];

        for (const concept of defaultConcepts) {
            await prisma.conceptMastery.upsert({
                where: { userEmail_conceptName: { userEmail: email, conceptName: concept.name } },
                update: { masteryScore: concept.score },
                create: { userEmail: email, conceptName: concept.name, masteryScore: concept.score }
            });
        }

        res.json(submission);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save question bank submission' });
    }
});

app.get('/api/progress/question-bank/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const submissions = await prisma.questionBankSubmission.findMany({
            where: { userEmail: email },
            include: { answers: true },
            orderBy: { completionDate: 'desc' }
        });
        res.json(submissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch question bank submissions' });
    }
});

// ----------------------------------------------------
// AI CHAT LOGGING ROUTES
// ----------------------------------------------------
app.post('/api/ai-chat-history', async (req, res) => {
    const { email, studentQuestion, aiResponse, lessonContext } = req.body;

    if (!email || !studentQuestion) {
        return res.status(400).json({ error: 'email and studentQuestion are required' });
    }

    try {
        const log = await prisma.aIChatLog.create({
            data: {
                userEmail: email,
                studentQuestion,
                aiResponse: aiResponse || '',
                lessonContext: typeof lessonContext === 'object' ? JSON.stringify(lessonContext) : lessonContext
            }
        });
        res.json(log);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to log AI chat' });
    }
});

app.get('/api/ai-chat-history/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const logs = await prisma.aIChatLog.findMany({
            where: { userEmail: email },
            orderBy: { timestamp: 'desc' },
            take: 20
        });
        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch AI chat history' });
    }
});

app.get('/api/mastery-list/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const masteries = await prisma.conceptMastery.findMany({
            where: { userEmail: email }
        });

        if (masteries.length === 0) {
            return res.json([
                { conceptName: 'Trigonometric Ratios', masteryScore: 82 },
                { conceptName: 'Triangle Identification', masteryScore: 96 },
                { conceptName: 'Reciprocal Ratios', masteryScore: 43 }
            ]);
        }

        res.json(masteries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch concept mastery' });
    }
});

// ----------------------------------------------------
// AI TUTOR GROQ CHAT ENDPOINT
// ----------------------------------------------------
app.post('/api/chat', async (req, res) => {
    const { messages, context, userEmail } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Valid messages array is required' });
    }

    try {
        const text = await generateLLMResponse(messages, context as TutorContext);

        if (userEmail && messages.length > 0) {
            const lastUserMsg = messages[messages.length - 1].content;
            await prisma.aIChatLog.create({
                data: {
                    userEmail,
                    studentQuestion: lastUserMsg,
                    aiResponse: text,
                    lessonContext: context ? JSON.stringify(context) : null
                }
            }).catch(e => console.error('AI chat DB log warning:', e));
        }

        res.json({ content: text });
    } catch (error: any) {
        console.error('❌ AI Tutor Endpoint Error:', error?.message || error);
        res.status(500).json({ 
            error: 'Failed to generate AI response',
            content: "I'm sorry, I encountered a temporary connection issue. Please verify your Groq API key or try asking your question again!" 
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
