import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Updating remaining concepts for Exercise 8.1...");

    // 1. Update Subtopic 2: Construction-Based Derivations
    const sub2 = await prisma.subtopic.update({
        where: { id: 2 },
        data: {
            title: "Construction-Based Derivations",
            description: "Deriving ratios using geometry and construction."
        }
    });

    // Delete old blocks if any
    await prisma.contentBlock.deleteMany({ where: { subtopicId: 2 } });

    await prisma.contentBlock.create({
        data: {
            subtopicId: 2,
            contentType: 'markdown',
            sequenceOrder: 1,
            contentData: `
### Understanding the 'Why'
Before we memorize formulas, let's see how they arise naturally from geometric constructions.

**1. The 45° Triangle (Isosceles Right Triangle)**
In an isosceles right triangle, two sides are equal ($a = b$).
- Let $a = 1, b = 1$
- By Pythagoras: $h = \\sqrt{1^2 + 1^2} = \\sqrt{2}$
- Therefore, $\\sin 45^\\circ = \\frac{1}{\\sqrt{2}}$ and $\\cos 45^\\circ = \\frac{1}{\\sqrt{2}}$.

**2. The 30°-60°-90° Triangle**
Imagine an equilateral triangle with side length 2. If we drop a perpendicular from one vertex, we get two 30°-60°-90° triangles.
- The base is halved to 1.
- The height is $\\sqrt{2^2 - 1^2} = \\sqrt{3}$.
- $\\sin 30^\\circ = \\frac{1}{2}$, $\\sin 60^\\circ = \\frac{\\sqrt{3}}{2}$.
            `
        }
    });

    // 2. Update Subtopic 4: Special Cases & Undefined Conditions
    const sub4 = await prisma.subtopic.update({
        where: { id: 4 },
        data: {
            title: "Special Cases & Undefined Conditions",
            description: "What happens at 0°, 90°, and beyond?"
        }
    });

    await prisma.contentBlock.deleteMany({ where: { subtopicId: 4 } });

    await prisma.contentBlock.create({
        data: {
            subtopicId: 4,
            contentType: 'markdown',
            sequenceOrder: 1,
            contentData: `
### When Ratios Break
Not every trigonometric ratio is defined for every angle. This is a crucial 'gotcha' in exams.

**1. Division by Zero**
Recall that $\\tan \\theta = \\frac{\\sin \\theta}{\\cos \\theta}$.
- At $\\theta = 90^\\circ$, $\\cos 90^\\circ = 0$.
- Since you cannot divide by zero, $\\tan 90^\\circ$ is **undefined** (often written as $\\infty$ in limits).

**2. Range Limitations**
The values of $\\sin \\theta$ and $\\cos \\theta$ are **always** between -1 and 1.
- If you calculate a $\\sin \\theta$ value as 1.5, you've made a mistake!
- However, $\\tan \\theta$ can take any real value from $-\\infty$ to $+\\infty$.

**3. Complementary Angles**
Remember: $\\sin \\theta = \\cos(90^\\circ - \\theta)$. This is why the 'sine' of 30° is the 'co-sine' of 60°.
            `
        }
    });

    console.log("Remaining concepts updated successfully!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
