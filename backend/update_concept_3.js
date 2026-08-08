const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting Concept 3 Update...');

    // 1. Find the specific Subtopic (Exercise 1, Sequence 3)
    const exercise = await prisma.exercise.findFirst({
        where: {
            course: { syllabusType: 'NCERT_11' },
            sequenceOrder: 1
        }
    });

    if (!exercise) {
        throw new Error("Exercise 8.1 not found!");
    }

    const subtopic = await prisma.subtopic.findFirst({
        where: {
            exerciseId: exercise.id,
            sequenceOrder: 3
        }
    });

    if (!subtopic) {
        throw new Error("Concept 3 (Subtopic) not found!");
    }

    console.log(`Found Subtopic ID: ${subtopic.id}, Old Title: ${subtopic.title}`);

    // 2. Update Title
    await prisma.subtopic.update({
        where: { id: subtopic.id },
        data: {
            title: 'Angle-Wise Behavior & Value Patterns',
            description: 'Angle-Wise Behavior & Value Patterns (Cheat Sheet 3)'
        }
    });
    console.log("Updated Title.");

    // 3. Delete old ContentBlocks
    const oldBlocks = await prisma.contentBlock.findMany({
        where: { subtopicId: subtopic.id }
    });

    for (const block of oldBlocks) {
        // Delete the checkpoint first if it exists, to avoid foreign key or clean DB orphans
        await prisma.checkpoint.deleteMany({
            where: { contentBlockId: block.id }
        });
        // Delete the block
        await prisma.contentBlock.delete({ where: { id: block.id } });
    }
    console.log(`Deleted ${oldBlocks.length} old content blocks.`);


    // 4. Insert New Content
    // Section 1
    await prisma.contentBlock.create({
        data: {
            subtopicId: subtopic.id,
            contentType: 'markdown',
            sequenceOrder: 1,
            contentData: `## 📈 Section 1: Understanding Angle Growth

### 🔹 Core Concept
As angle $\\theta$ increases from **0° to 90°**:

*   **sin $\\theta$** ↗️ **INCREASES** (from 0 to 1)
*   **cos $\\theta$** ↘️ **DECREASES** (from 1 to 0)
*   **tan $\\theta$** ↗️ **INCREASES** (starts slow, then typically explodes near 90°)

### 🧠 Gen-Z Vibe
Think of **sin** as a climber going UP the mountain 🏔️.
Think of **cos** as a skier going DOWN ⛷️.`,
            triggerAtScrollDepth: 30,
            checkpoint: {
                create: {
                    questionText: 'As θ increases from 0° to 90°, sin θ:',
                    questionType: 'mcq',
                    difficulty: 'easy',
                    options: JSON.stringify(['Decreases', 'Remains constant', 'Increases', 'Becomes undefined']),
                    correctAnswer: JSON.stringify('Increases'),
                    explanationMarkdown: 'sin θ starts at 0 and grows to 1.'
                }
            }
        }
    });

    // Question 2 for Section 1
    await prisma.contentBlock.create({
        data: {
            subtopicId: subtopic.id,
            contentType: 'markdown',
            sequenceOrder: 2,
            contentData: '',
            triggerAtScrollDepth: 35,
            checkpoint: {
                create: {
                    questionText: 'As θ increases, cos θ:',
                    questionType: 'mcq',
                    difficulty: 'easy',
                    options: JSON.stringify(['Increases', 'Decreases', 'Remains same', 'Doubles']),
                    correctAnswer: JSON.stringify('Decreases'),
                    explanationMarkdown: 'cos θ starts at 1 and drops to 0.'
                }
            }
        }
    });


    // Section 2
    await prisma.contentBlock.create({
        data: {
            subtopicId: subtopic.id,
            contentType: 'markdown',
            sequenceOrder: 3,
            contentData: `## 👁️ Section 2: Visual Pattern Logic

### 🔢 The Square Root Trick
Memorize values 0, 30, 45, 60, 90 deg using this pattern:

*   **sin**: $\\frac{\\sqrt{0}}{2}, \\frac{\\sqrt{1}}{2}, \\frac{\\sqrt{2}}{2}, \\frac{\\sqrt{3}}{2}, \\frac{\\sqrt{4}}{2}$
*   **cos**: Reverse the order! $\\frac{\\sqrt{4}}{2}, \\frac{\\sqrt{3}}{2} ...$

### 💡 The Tan Explosion
$$ \\tan \\theta = \\frac{\\sin \\theta}{\\cos \\theta} $$
When **cos** gets close to 0 (near 90°), the denominator gets tiny, so **tan** becomes HUGE! 🚀`,
            triggerAtScrollDepth: 60,
            checkpoint: {
                create: {
                    questionText: 'tan θ is equal to:',
                    questionType: 'mcq',
                    difficulty: 'easy',
                    options: JSON.stringify(['cos θ / sin θ', 'sin θ / cos θ', '1 / sin θ', '1 / cos θ']),
                    correctAnswer: JSON.stringify('sin θ / cos θ'),
                    explanationMarkdown: 'Basic identity: tan = sin/cos.'
                }
            }
        }
    });

    // Question 2 for Section 2
    await prisma.contentBlock.create({
        data: {
            subtopicId: subtopic.id,
            contentType: 'markdown',
            sequenceOrder: 4,
            contentData: '',
            triggerAtScrollDepth: 65,
            checkpoint: {
                create: {
                    questionText: 'Why does tan θ grow rapidly near 90°?',
                    questionType: 'mcq',
                    difficulty: 'medium',
                    options: JSON.stringify(['sin becomes zero', 'cos becomes zero', 'tan doubles', 'angle becomes negative']),
                    correctAnswer: JSON.stringify('cos becomes zero'),
                    explanationMarkdown: 'Division by a tiny number (cos approaching 0) yields a huge result.'
                }
            }
        }
    });


    // Section 3
    await prisma.contentBlock.create({
        data: {
            subtopicId: subtopic.id,
            contentType: 'markdown',
            sequenceOrder: 5,
            contentData: `## 🎯 Section 3: Concept Reinforcement

### 🚧 Range Check
For **Acute Angles** (0° < θ < 90°):

1.  **sin θ** is always between **0 and 1**.
2.  **cos θ** is always between **0 and 1**.
3.  **tan θ** can be anything! (Can be > 1).

**Pro Tip**: If you calculate sin θ = 1.5, check your math. It's wrong! ❌`,
            triggerAtScrollDepth: 90,
            checkpoint: {
                create: {
                    questionText: 'For acute angles, sin θ is:',
                    questionType: 'mcq',
                    difficulty: 'easy',
                    options: JSON.stringify(['Greater than 1', 'Between 0 and 1', 'Always 2', 'Undefined']),
                    correctAnswer: JSON.stringify('Between 0 and 1'),
                    explanationMarkdown: 'Sine of an acute angle cannot exceed 1.'
                }
            }
        }
    });

    // Question 2 for Section 3
    await prisma.contentBlock.create({
        data: {
            subtopicId: subtopic.id,
            contentType: 'markdown',
            sequenceOrder: 6,
            contentData: '',
            triggerAtScrollDepth: 95,
            checkpoint: {
                create: {
                    questionText: 'Which ratio can be greater than 1?',
                    questionType: 'mcq',
                    difficulty: 'medium',
                    options: JSON.stringify(['sin θ', 'cos θ', 'tan θ', 'none']),
                    correctAnswer: JSON.stringify('tan θ'),
                    explanationMarkdown: 'tan θ = Opp/Adj. Since Opposite can be larger than Adjacent, tan can be > 1.'
                }
            }
        }
    });

    console.log("New Content Inserted Successfully for Concept 3. (CJS Version)");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
