const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Find subtopic Day 1
    const day1 = await prisma.subtopic.findFirst({
        where: { exerciseId: 1, title: 'Day 1' },
        include: { contentBlocks: { orderBy: { sequenceOrder: 'asc' } } }
    });

    if (day1 && day1.contentBlocks.length > 0) {
        // Find the first video block (Video 1)
        const video1Block = day1.contentBlocks.find(b => b.contentType === 'video');
        if (video1Block) {
            await prisma.contentBlock.update({
                where: { id: video1Block.id },
                data: {
                    contentData: 'https://www.youtube.com/embed/fhh-Fp23eqk'
                }
            });
            console.log(`Successfully updated Day 1 -> Video 1 (Block ID: ${video1Block.id}) with YouTube embed URL.`);
        } else {
            console.error('Video 1 block not found in Day 1.');
        }
    } else {
        console.error('Day 1 subtopic not found.');
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
