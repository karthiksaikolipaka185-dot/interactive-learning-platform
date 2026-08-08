const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const day5 = await prisma.subtopic.findFirst({
        where: { exerciseId: 1, title: 'Day 5' },
        include: { contentBlocks: { orderBy: { sequenceOrder: 'asc' } } }
    });

    if (day5 && day5.contentBlocks.length > 0) {
        const videoBlocks = day5.contentBlocks.filter(b => b.contentType === 'video');
        if (videoBlocks.length >= 1) {
            const video1Block = videoBlocks[0]; // First video block of Day 5
            const videoInfo = {
                url: 'https://www.youtube.com/embed/OiIM4zXCmLc',
                title: 'Introduction to Trigonometry | Part-9 | Ex-11.4 Problems (5th main i to iii)'
            };
            await prisma.contentBlock.update({
                where: { id: video1Block.id },
                data: {
                    contentData: JSON.stringify(videoInfo)
                }
            });
            console.log(`Successfully updated Day 5 -> Video 1 (Block ID: ${video1Block.id}) with YouTube embed URL and title.`);
        } else {
            console.error('Video 1 block not found in Day 5.');
        }
    } else {
        console.error('Day 5 subtopic not found.');
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
