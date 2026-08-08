const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const day2 = await prisma.subtopic.findFirst({
        where: { exerciseId: 1, title: 'Day 2' },
        include: { contentBlocks: { orderBy: { sequenceOrder: 'asc' } } }
    });

    if (day2 && day2.contentBlocks.length > 0) {
        const videoBlocks = day2.contentBlocks.filter(b => b.contentType === 'video');
        if (videoBlocks.length >= 2) {
            const video2Block = videoBlocks[1]; // Second video block of Day 2
            const videoInfo = {
                url: 'https://www.youtube.com/embed/rKDFvtVlspM',
                title: 'Introduction to Trigonometry | Part-4 | Exercise 11.1 Problems (6 to 11)'
            };
            await prisma.contentBlock.update({
                where: { id: video2Block.id },
                data: {
                    contentData: JSON.stringify(videoInfo)
                }
            });
            console.log(`Successfully updated Day 2 -> Video 2 (Block ID: ${video2Block.id}) with YouTube embed URL and title.`);
        } else {
            console.error('Video 2 block not found in Day 2.');
        }
    } else {
        console.error('Day 2 subtopic not found.');
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
