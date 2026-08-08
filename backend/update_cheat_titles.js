const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    for (let i = 1; i <= 11; i++) {
        const subtopic = await prisma.subtopic.findFirst({
            where: { exerciseId: 1, title: `Day ${i}` },
            include: { contentBlocks: true }
        });

        if (subtopic) {
            const markdownBlock = subtopic.contentBlocks.find(cb => cb.contentType === 'markdown');
            if (markdownBlock) {
                await prisma.contentBlock.update({
                    where: { id: markdownBlock.id },
                    data: {
                        contentData: `### 📝 Cheat ${i}\n\n*(Empty cheat sheet - ready for notes)*`
                    }
                });
                console.log(`Updated Cheat ${i} for Day ${i}`);
            }
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
