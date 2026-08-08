const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const day1 = await prisma.subtopic.findFirst({
        where: { exerciseId: 1, title: 'Day 1' },
        include: { contentBlocks: { orderBy: { sequenceOrder: 'asc' } } }
    });

    if (day1 && day1.contentBlocks.length > 0) {
        // Find all video blocks
        const videoBlocks = day1.contentBlocks.filter(b => b.contentType === 'video');
        if (videoBlocks.length >= 2) {
            const video2Block = videoBlocks[1]; // Second video block (Video 2)
            const videoInfo = {
                url: 'https://www.youtube.com/embed/ddoP4a0XPwE',
                title: 'Introduction to Trigonometry | Part-2 | Trigonometry ratio table & identities'
            };
            await prisma.contentBlock.update({
                where: { id: video2Block.id },
                data: {
                    contentData: JSON.stringify(videoInfo)
                }
            });
            console.log(`Successfully updated Day 1 -> Video 2 (Block ID: ${video2Block.id}) with YouTube embed URL and title.`);
        } else {
            console.error('Video 2 block not found in Day 1.');
        }
    } else {
        console.error('Day 1 subtopic not found.');
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
