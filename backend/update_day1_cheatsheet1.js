const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const day1 = await prisma.subtopic.findFirst({
        where: { exerciseId: 1, title: 'Day 1' },
        include: { contentBlocks: { orderBy: { sequenceOrder: 'asc' } } }
    });

    if (day1 && day1.contentBlocks.length > 1) {
        const cheat1Block = day1.contentBlocks[1]; // Cheat Sheet 1 of Day 1

        const cheatSheetMarkdown = `# Cheat Sheet: Fundamentals of Trigonometric Ratios & Right Triangles

## 1. The Meaning of Trigonometry
The word **Trigonometry** is derived from three Greek words:
* **Tri** meaning *Three*
* **Gon** meaning *Sides*
* **Metry** (Metron) meaning *Measurement*

Simply put, it is the study of the measurement of the three sides of a triangle. Basic trigonometry is strictly applied to **right-angled triangles** (where one angle is $90^\\circ$ and the other two are acute angles $< 90^\\circ$).

---

## 2. Naming the Sides of a Right-Angled Triangle
To use trigonometric ratios, you must correctly identify the three sides of a right-angled triangle relative to a specific acute angle $\\theta$:
* **Hypotenuse**: Always the side located directly opposite the $90^\\circ$ right angle. It is the longest side.
* **Adjacent Side (Base)**: The side right next to (adjacent to) the acute angle $\\theta$. It is the line on which the angle sits.
* **Opposite Side (Perpendicular)**: The side directly across from the acute angle $\\theta$.

> 💡 **Note**: If you switch which acute angle you are looking at, the **Opposite** and **Adjacent** sides will swap places, but the **Hypotenuse** ALWAYS remains the same.

---

## 3. The Six Trigonometric Ratios
| Ratio Name | Symbol | Formula | Reciprocal Identity |
| :--- | :--- | :--- | :--- |
| **Sine** | $\\sin\\theta$ | $\\frac{\\text{Opposite}}{\\text{Hypotenuse}}$ | - |
| **Cosine** | $\\cos\\theta$ | $\\frac{\\text{Adjacent}}{\\text{Hypotenuse}}$ | - |
| **Tangent** | $\\tan\\theta$ | $\\frac{\\text{Opposite}}{\\text{Adjacent}}$ | $\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}$ |
| **Cosecant** | $\\csc\\theta$ | $\\frac{\\text{Hypotenuse}}{\\text{Opposite}}$ | $\\frac{1}{\\sin\\theta}$ |
| **Secant** | $\\sec\\theta$ | $\\frac{\\text{Hypotenuse}}{\\text{Adjacent}}$ | $\\frac{1}{\\cos\\theta}$ |
| **Cotangent** | $\\cot\\theta$ | $\\frac{\\text{Adjacent}}{\\text{Opposite}}$ | $\\frac{1}{\\tan\\theta} = \\frac{\\cos\\theta}{\\sin\\theta}$ |

---

## 4. Important Formulas & Crucial Rules
* **Tangent Identity**: $\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}$
* **Cotangent Identity**: $\\cot\\theta = \\frac{\\cos\\theta}{\\sin\\theta}$

> ⚠️ **Crucial Rule**: The expression $\\sin\\theta$ is **NOT** the product of $\\text{sin} \\times \\theta$. The word "sin" completely loses its mathematical meaning if written without an angle attached to it!

---

## 5. Practical Example (3-4-5 Triangle)
Consider a right-angled triangle with sides measuring $3\\text{ cm}$, $4\\text{ cm}$, and hypotenuse $5\\text{ cm}$.
* **Pythagorean Theorem Check**: $5^2 = 3^2 + 4^2 \\implies 25 = 9 + 16$ ✅
* Focusing on acute angle $C$ where Opposite = $4\\text{ cm}$ and Adjacent = $3\\text{ cm}$:
  * $\\sin C = \\frac{4}{5}$
  * $\\cos C = \\frac{3}{5}$
  * $\\tan C = \\frac{4}{3}$
`;

        await prisma.contentBlock.update({
            where: { id: cheat1Block.id },
            data: { contentData: cheatSheetMarkdown }
        });

        console.log(`Updated Day 1 -> Cheat Sheet 1 (Block ID: ${cheat1Block.id}) with comprehensive study notes.`);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
