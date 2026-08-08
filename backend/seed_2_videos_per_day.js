const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    for (let i = 1; i <= 11; i++) {
        const subtopic = await prisma.subtopic.findFirst({
            where: { exerciseId: 1, title: `Day ${i}` }
        });

        if (subtopic) {
            // Delete existing content blocks for this subtopic
            await prisma.contentBlock.deleteMany({
                where: { subtopicId: subtopic.id }
            });

            // Create 2 video blocks and 2 markdown cheat sheets
            await prisma.contentBlock.createMany({
                data: [
                    {
                        subtopicId: subtopic.id,
                        contentType: 'video',
                        contentData: '',
                        sequenceOrder: 1
                    },
                    {
                        subtopicId: subtopic.id,
                        contentType: 'markdown',
                        contentData: `### 📝 Cheat ${i}.1 (Part 1)\n\n*(Empty cheat sheet - ready for Part 1 notes)*`,
                        sequenceOrder: 2
                    },
                    {
                        subtopicId: subtopic.id,
                        contentType: 'video',
                        contentData: '',
                        sequenceOrder: 3
                    },
                    {
                        subtopicId: subtopic.id,
                        contentType: 'markdown',
                        contentData: `### 📝 Cheat ${i}.2 (Part 2)\n\n*(Empty cheat sheet - ready for Part 2 notes)*`,
                        sequenceOrder: 4
                    }
                ]
            });
            console.log(`Updated Day ${i} with 2 videos and 2 cheat sheets.`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
