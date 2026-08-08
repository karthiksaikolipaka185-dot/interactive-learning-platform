import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding initial data...');

    // 1. Create Course
    const course = await prisma.course.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            title: 'Mathematics Class 11',
            syllabusType: 'NCERT_11'
        }
    });

    // 2. Create Exercise 8.1
    const exercise = await prisma.exercise.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            title: 'Exercise 8.1: Trigonometric Ratios',
            sequenceOrder: 1,
            courseId: course.id
        }
    });

    // 3. Create Subtopics for 8.1
    const subtopicTitles = [
        'Trigonometric Ratios Defined',
        'Construction-Based Derivations',
        'Angle-Wise Behavior & Value Patterns',
        'Special Cases & Undefined Conditions',
        'Solving Right Triangle Problems Like a Pro'
    ];

    for (let i = 0; i < subtopicTitles.length; i++) {
        await prisma.subtopic.upsert({
            where: { id: i + 1 },
            update: { title: subtopicTitles[i] },
            create: {
                id: i + 1,
                title: subtopicTitles[i],
                sequenceOrder: i + 1,
                exerciseId: exercise.id,
                description: `Deep dive into ${subtopicTitles[i]}`
            }
        });
    }

    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
