const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const day2 = await prisma.subtopic.findFirst({
        where: { exerciseId: 1, title: 'Day 2' },
        include: { contentBlocks: { orderBy: { sequenceOrder: 'asc' } } }
    });

    if (day2 && day2.contentBlocks.length > 0) {
        const videoBlocks = day2.contentBlocks.filter(b => b.contentType === 'video');
        if (videoBlocks.length >= 1) {
            const video1Block = videoBlocks[0]; // First video block of Day 2
            const videoInfo = {
                url: 'https://www.youtube.com/embed/3gG_O0b51PI',
                title: 'Introduction to Trigonometry | Part-3 | Exercise 11.1 Problems (1 to 5)'
            };
            await prisma.contentBlock.update({
                where: { id: video1Block.id },
                data: {
                    contentData: JSON.stringify(videoInfo)
                }
            });
            console.log(`Successfully updated Day 2 -> Video 1 (Block ID: ${video1Block.id}) with YouTube embed URL and title.`);
        } else {
            console.error('Video 1 block not found in Day 2.');
        }
    } else {
        console.error('Day 2 subtopic not found.');
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
