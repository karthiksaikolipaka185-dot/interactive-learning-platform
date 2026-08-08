const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    for (let i = 1; i <= 11; i++) {
        const subtopic = await prisma.subtopic.create({
            data: {
                title: 'Day ' + i,
                sequenceOrder: 10 + i,
                exerciseId: 1,
                contentBlocks: {
                    create: [
                        {
                            contentType: 'video',
                            contentData: '',
                            sequenceOrder: 1
                        },
                        {
                            contentType: 'markdown',
                            contentData: '## Cheat ' + i + '\n\n',
                            sequenceOrder: 2
                        }
                    ]
                }
            }
        });
        console.log('Created subtopic', subtopic.title);
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
