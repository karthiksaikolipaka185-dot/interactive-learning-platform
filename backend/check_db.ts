import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const courses = await prisma.course.count();
    const exercises = await prisma.exercise.count();
    const subtopics = await prisma.subtopic.count();
    const blocks = await prisma.contentBlock.count();
    const checkpoints = await prisma.checkpoint.count();
    const progress = await prisma.userProgress.count();

    console.log({
        courses,
        exercises,
        subtopics,
        blocks,
        checkpoints,
        progress
    });
}

main().finally(() => prisma.$disconnect());
