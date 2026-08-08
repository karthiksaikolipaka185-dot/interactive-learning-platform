const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const day5 = await prisma.subtopic.findFirst({
        where: { exerciseId: 1, title: 'Day 5' },
        include: { contentBlocks: { orderBy: { sequenceOrder: 'asc' } } }
    });

    if (day5 && day5.contentBlocks.length > 0) {
        const videoBlocks = day5.contentBlocks.filter(b => b.contentType === 'video');
        if (videoBlocks.length >= 2) {
            const video2Block = videoBlocks[1]; // Second video block of Day 5
            const videoInfo = {
                url: 'https://www.youtube.com/embed/naZnruCrF9Q',
                title: 'Introduction to Trigonometry | Part-10 | Ex-11.4 Problems (5th main iv to vi)'
            };
            await prisma.contentBlock.update({
                where: { id: video2Block.id },
                data: {
                    contentData: JSON.stringify(videoInfo)
                }
            });
            console.log(`Successfully updated Day 5 -> Video 2 (Block ID: ${video2Block.id}) with YouTube embed URL and title.`);
        } else {
            console.error('Video 2 block not found in Day 5.');
        }
    } else {
        console.error('Day 5 subtopic not found.');
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
