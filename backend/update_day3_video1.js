const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const day3 = await prisma.subtopic.findFirst({
        where: { exerciseId: 1, title: 'Day 3' },
        include: { contentBlocks: { orderBy: { sequenceOrder: 'asc' } } }
    });

    if (day3 && day3.contentBlocks.length > 0) {
        const videoBlocks = day3.contentBlocks.filter(b => b.contentType === 'video');
        if (videoBlocks.length >= 1) {
            const video1Block = videoBlocks[0]; // First video block of Day 3
            const videoInfo = {
                url: 'https://www.youtube.com/embed/8lOem8SFMfI',
                title: 'Introduction to Trigonometry | Part-5 | Exercise 11.2 Problems (1 main i, ii, iii)'
            };
            await prisma.contentBlock.update({
                where: { id: video1Block.id },
                data: {
                    contentData: JSON.stringify(videoInfo)
                }
            });
            console.log(`Successfully updated Day 3 -> Video 1 (Block ID: ${video1Block.id}) with YouTube embed URL and title.`);
        } else {
            console.error('Video 1 block not found in Day 3.');
        }
    } else {
        console.error('Day 3 subtopic not found.');
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
