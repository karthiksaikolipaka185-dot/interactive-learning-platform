const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const day3 = await prisma.subtopic.findFirst({
        where: { exerciseId: 1, title: 'Day 3' },
        include: { contentBlocks: { orderBy: { sequenceOrder: 'asc' } } }
    });

    if (day3 && day3.contentBlocks.length > 0) {
        const videoBlocks = day3.contentBlocks.filter(b => b.contentType === 'video');
        if (videoBlocks.length >= 2) {
            const video2Block = videoBlocks[1]; // Second video block of Day 3
            const videoInfo = {
                url: 'https://www.youtube.com/embed/8FARCqhUiqo',
                title: 'Introduction to Trigonometry | Part-6 | Ex- 11.2 Problems 1 main (iv, v), 2, 3 & 4'
            };
            await prisma.contentBlock.update({
                where: { id: video2Block.id },
                data: {
                    contentData: JSON.stringify(videoInfo)
                }
            });
            console.log(`Successfully updated Day 3 -> Video 2 (Block ID: ${video2Block.id}) with YouTube embed URL and title.`);
        } else {
            console.error('Video 2 block not found in Day 3.');
        }
    } else {
        console.error('Day 3 subtopic not found.');
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
