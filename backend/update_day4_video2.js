const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const day4 = await prisma.subtopic.findFirst({
        where: { exerciseId: 1, title: 'Day 4' },
        include: { contentBlocks: { orderBy: { sequenceOrder: 'asc' } } }
    });

    if (day4 && day4.contentBlocks.length > 0) {
        const videoBlocks = day4.contentBlocks.filter(b => b.contentType === 'video');
        if (videoBlocks.length >= 2) {
            const video2Block = videoBlocks[1]; // Second video block of Day 4
            const videoInfo = {
                url: 'https://www.youtube.com/embed/pDpnXaokzX8',
                title: 'Introduction to Trigonometry | Part-8 | Exercise 11.4 Problems (1, 2, 3 & 4)'
            };
            await prisma.contentBlock.update({
                where: { id: video2Block.id },
                data: {
                    contentData: JSON.stringify(videoInfo)
                }
            });
            console.log(`Successfully updated Day 4 -> Video 2 (Block ID: ${video2Block.id}) with YouTube embed URL and title.`);
        } else {
            console.error('Video 2 block not found in Day 4.');
        }
    } else {
        console.error('Day 4 subtopic not found.');
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
