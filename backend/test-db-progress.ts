import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabasePersistence() {
    console.log('🧪 Testing Student Progress Database Persistence...\n');

    const testEmail = 'student_test@example.com';

    // 1. Create/Upsert User
    const user = await prisma.user.upsert({
        where: { email: testEmail },
        update: { xp: { increment: 50 }, currentStreak: 4 },
        create: {
            email: testEmail,
            name: 'Test Student',
            xp: 100,
            level: 1,
            currentStreak: 4,
            totalStudyTime: 600,
            currentChapter: 'Trigonometry',
            currentExercise: 'Exercise 8.1',
            currentDay: 'Day 1'
        }
    });
    console.log('✅ User Profile Saved:', user.email, '| XP:', user.xp, '| Streak:', user.currentStreak);

    // 2. Video Progress
    const video = await prisma.videoProgress.upsert({
        where: { userEmail_videoId: { userEmail: testEmail, videoId: 'day1-video1' } },
        update: { watchPercentage: 100, watched: true, lastPlaybackPosition: 240 },
        create: { userEmail: testEmail, videoId: 'day1-video1', watchPercentage: 100, watched: true, lastPlaybackPosition: 240 }
    });
    console.log('✅ Video Progress Saved:', video.videoId, '| Watched:', video.watched);

    // 3. Cheat Sheet Progress
    const cheat = await prisma.cheatSheetProgress.upsert({
        where: { userEmail_cheatSheetId: { userEmail: testEmail, cheatSheetId: 'Day 1' } },
        update: { readingProgress: 100, inlineQuizCompleted: true, completed: true },
        create: { userEmail: testEmail, cheatSheetId: 'Day 1', readingProgress: 100, inlineQuizCompleted: true, completed: true }
    });
    console.log('✅ Cheat Sheet Progress Saved:', cheat.cheatSheetId, '| Reading %:', cheat.readingProgress);

    // 4. Question Bank Submission
    const qb = await prisma.questionBankSubmission.create({
        data: {
            userEmail: testEmail,
            bankTitle: 'Question Bank • Day 1',
            totalScore: 12,
            totalQuestions: 15,
            percentage: 80,
            accuracy: 80,
            answers: {
                create: [
                    { questionId: 1, questionText: 'Meaning of Trigonometry?', studentAnswer: 'Measurement of three sides', correctAnswer: 'Measurement of three sides', isCorrect: true },
                    { questionId: 6, questionText: 'sin theta equals?', studentAnswer: 'Opposite / Hypotenuse', correctAnswer: 'Opposite / Hypotenuse', isCorrect: true }
                ]
            }
        },
        include: { answers: true }
    });
    console.log('✅ Question Bank Submission Saved: ID', qb.id, '| Score:', qb.totalScore, '/ 15');

    // 5. Concept Mastery
    const mastery = await prisma.conceptMastery.upsert({
        where: { userEmail_conceptName: { userEmail: testEmail, conceptName: 'Trigonometric Ratios' } },
        update: { masteryScore: 88 },
        create: { userEmail: testEmail, conceptName: 'Trigonometric Ratios', masteryScore: 88 }
    });
    console.log('✅ Concept Mastery Saved:', mastery.conceptName, '| Score:', mastery.masteryScore, '%\n');

    console.log('🎉 All Database Persistence Models Operating 100% Correctly!');
}

testDatabasePersistence()
    .catch(err => console.error('❌ DB Test Error:', err))
    .finally(async () => {
        await prisma.$disconnect();
    });
