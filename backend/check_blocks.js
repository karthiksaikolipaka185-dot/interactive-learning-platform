const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const subtopics = await prisma.subtopic.findMany({
        where: { exerciseId: 1 },
        include: { contentBlocks: true },
        orderBy: { sequenceOrder: 'asc' }
    });
    for (const s of subtopics) {
        console.log('Subtopic:', s.id, s.title, 'seq:', s.sequenceOrder);
        for (const cb of s.contentBlocks) {
            console.log('   Block:', cb.id, 'type:', cb.contentType, 'data:', JSON.stringify(cb.contentData));
        }
    }
}
main().finally(() => prisma.$disconnect());
