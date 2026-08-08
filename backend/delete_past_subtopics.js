const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const pastIds = [1, 2, 3, 4, 5];
    
    for (const subtopicId of pastIds) {
        // Find content blocks
        const blocks = await prisma.contentBlock.findMany({
            where: { subtopicId }
        });

        const blockIds = blocks.map(b => b.id);

        // Delete checkpoints associated with these blocks
        if (blockIds.length > 0) {
            await prisma.checkpoint.deleteMany({
                where: { contentBlockId: { in: blockIds } }
            });
        }

        // Delete content blocks
        await prisma.contentBlock.deleteMany({
            where: { subtopicId }
        });

        // Delete user progress for these subtopics
        await prisma.userProgress.deleteMany({
            where: { subtopicId }
        });

        // Delete subtopic
        await prisma.subtopic.delete({
            where: { id: subtopicId }
        });

        console.log(`Deleted past subtopic ${subtopicId}`);
    }

    // Update sequence orders for Day 1..11 so they start from 1
    const daySubtopics = await prisma.subtopic.findMany({
        where: { exerciseId: 1, title: { startsWith: 'Day ' } },
        orderBy: { id: 'asc' }
    });

    for (let index = 0; index < daySubtopics.length; index++) {
        await prisma.subtopic.update({
            where: { id: daySubtopics[index].id },
            data: { sequenceOrder: index + 1 }
        });
    }

    console.log('Re-indexed sequence orders for Day 1..11');
}

main().catch(console.error).finally(() => prisma.$disconnect());
