const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const day1 = await prisma.subtopic.findFirst({
        where: { exerciseId: 1, title: 'Day 1' },
        include: { contentBlocks: { orderBy: { sequenceOrder: 'asc' } } }
    });

    if (day1 && day1.contentBlocks.length > 0) {
        const video1Block = day1.contentBlocks.find(b => b.contentType === 'video');
        if (video1Block) {
            const videoInfo = {
                url: 'https://www.youtube.com/embed/fhh-Fp23eqk',
                title: 'Introduction to Trigonometry | Part-1 | Introduction of ratios'
            };
            await prisma.contentBlock.update({
                where: { id: video1Block.id },
                data: {
                    contentData: JSON.stringify(videoInfo)
                }
            });
            console.log(`Updated Video 1 with title: "${videoInfo.title}"`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
