const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'prisma/dev.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to the SQLite database.');
});

db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON;");

    // 1. Find Exercise 8.1
    let exerciseId = null;
    let subtopicId = null;

    db.get(`
        SELECT E.id 
        FROM Exercise E
        JOIN Course C ON E.courseId = C.id
        WHERE C.syllabusType = 'NCERT_11' AND E.sequenceOrder = 1
    `, [], (err, row) => {
        if (err || !row) {
            console.error("Exercise 8.1 not found", err);
            return;
        }
        exerciseId = row.id;

        // 2. Find or Create Subtopic at Sequence Level 5
        db.get(`SELECT id, title FROM Subtopic WHERE exerciseId = ? AND sequenceOrder = 5`, [exerciseId], (err, row) => {
            if (err) {
                console.error("Error finding subtopic", err);
                return;
            }

            if (row) {
                subtopicId = row.id;
                console.log(`Found existing Concept 5 (ID: ${subtopicId}). Updating...`);
                // Update Title
                db.run(`UPDATE Subtopic SET title = ?, description = ? WHERE id = ?`,
                    ['Solving Right Triangle Problems Like a Pro', 'Solving Right Triangle Problems Like a Pro (Cheat Sheet 5)'],
                    subtopicId,
                    (err) => {
                        if (err) console.error("Error updating title", err);
                        clearOldContent(subtopicId);
                    }
                );
            } else {
                console.log("Concept 5 not found. Creating new...");
                db.run(`INSERT INTO Subtopic (title, description, exerciseId, sequenceOrder) VALUES (?, ?, ?, ?)`,
                    ['Solving Right Triangle Problems Like a Pro', 'Solving Right Triangle Problems Like a Pro (Cheat Sheet 5)', exerciseId, 5],
                    function (err) {
                        if (err) {
                            console.error("Error creating subtopic", err);
                            return;
                        }
                        subtopicId = this.lastID;
                        console.log(`Created Concept 5 (ID: ${subtopicId}).`);
                        insertNewContent(subtopicId);
                    }
                );
            }
        });
    });

    function clearOldContent(id) {
        db.all(`SELECT checkpointId FROM ContentBlock WHERE subtopicId = ?`, [id], (err, rows) => {
            if (err) return console.error(err);
            const checkpointIds = rows.map(r => r.checkpointId).filter(id => id !== null);

            db.run(`DELETE FROM ContentBlock WHERE subtopicId = ?`, [id], function (err) {
                if (err) return console.error('Error deleting ContentBlock:', err);
                console.log(`Deleted ${this.changes} old ContentBlocks.`);

                if (checkpointIds.length > 0) {
                    const placeholders = checkpointIds.map(() => '?').join(',');
                    db.run(`DELETE FROM Checkpoint WHERE id IN (${placeholders})`, checkpointIds, function (err) {
                        if (err) console.error("Error deleting checkpoints:", err);
                        insertNewContent(id);
                    });
                } else {
                    insertNewContent(id);
                }
            });
        });
    }

    function insertNewContent(subtopicId) {
        const sections = [
            // Section 1: If One Ratio is Given… You Can Find Everything 😎
            {
                seq: 1,
                content: `## 😎 Section 1: If One Ratio is Given… You Can Find Everything\n\nContent:\n\nIn exams, you are usually given **ONE** trigonometric ratio. From that single ratio, you can find all other ratios.\n\n### Step-by-Step:\n1.  **Assume sides** using a variable (like $k$).\n2.  Use **Pythagoras theorem**.\n3.  Find remaining ratios easily.\n\n### Example:\nIf $\\tan A = \\frac{3}{4}$:\n*   Opposite = $3k$, Adjacent = $4k$\n*   Hypotenuse² = $(3k)^2 + (4k)^2 = 9k^2 + 16k^2 = 25k^2$\n*   So **Hypotenuse = 5k**\n\nNow: $\\sin A = \\frac{3}{5}$, $\\cos A = \\frac{4}{5}$. **Boom.** All ratios found.`,
                trigger: 30,
                checkpoint: {
                    q: 'If tan A = 3/4, opposite side is:',
                    type: 'mcq',
                    diff: 'basic',
                    opts: JSON.stringify(['4k', '3k', '5k', 'k']),
                    ans: JSON.stringify('3k'),
                    expl: 'tan A = Opposite/Adjacent = 3/4. So Opposite is proportional to 3.'
                }
            },
            {
                seq: 2,
                content: '',
                trigger: 35,
                checkpoint: {
                    q: 'If opposite = 3k and adjacent = 4k, hypotenuse is:',
                    type: 'mcq',
                    diff: 'basic',
                    opts: JSON.stringify(['6k', '7k', '5k', '12k']),
                    ans: JSON.stringify('5k'),
                    expl: 'Pythagoras: sqrt((3k)^2 + (4k)^2) = sqrt(25k^2) = 5k.'
                }
            },
            // Section 2: Identity Power Move 💥
            {
                seq: 3,
                content: `## 💥 Section 2: Identity Power Move\n\nContent:\n\nOne identity you **MUST** know:\n\n$$ \\sin^2 A + \\cos^2 A = 1 $$\n\nThis identity helps when:\n*   You know **sin A** and need **cos A**\n*   You know **cos A** and need **sin A**\n\n### Example:\nIf $\\sin A = \\frac{3}{5}$:\n*   $\\sin^2 A = \\frac{9}{25}$\n*   $\\cos^2 A = 1 - \\frac{9}{25} = \\frac{16}{25}$\n*   So **$\\cos A = \\frac{4}{5}$**\n\nSuper useful in JEE problems.`,
                trigger: 60,
                checkpoint: {
                    q: 'Which identity is correct?',
                    type: 'mcq',
                    diff: 'basic',
                    opts: JSON.stringify(['sin²A − cos²A = 1', 'sin²A + cos²A = 1', 'tan²A + sec²A = 1', 'cos²A = 1']),
                    ans: JSON.stringify('sin²A + cos²A = 1'),
                    expl: 'The fundamental Pythagorean identity is sin²A + cos²A = 1.'
                }
            },
            {
                seq: 4,
                content: '',
                trigger: 65,
                checkpoint: {
                    q: 'If sin A = 3/5, cos A is:',
                    type: 'mcq',
                    diff: 'basic',
                    opts: JSON.stringify(['3/5', '4/5', '5/3', '1/5']),
                    ans: JSON.stringify('4/5'),
                    expl: 'Using the 3-4-5 triplet or identity: cos A = sqrt(1 - (3/5)^2) = 4/5.'
                }
            },
            // Section 3: Quick Exam Survival Rules 🚀
            {
                seq: 5,
                content: `## 🚀 Section 3: Quick Exam Survival Rules\n\nContent:\n\n*   **sin θ** and **cos θ** are always between **0 and 1** (for acute angles).\n*   **sec θ** and **cosec θ** are always $\\ge 1$.\n*   **tan θ** can be less than 1 or greater than 1.\n\n> **Pro Tip:**\n> *   If **two sides** are given → use **Pythagoras**.\n> *   If **one angle and one side** are given → use **ratios**.`,
                trigger: 90,
                checkpoint: {
                    q: 'Which ratio can be greater than 1?',
                    type: 'mcq',
                    diff: 'basic',
                    opts: JSON.stringify(['sin θ', 'cos θ', 'tan θ', 'none']),
                    ans: JSON.stringify('tan θ'),
                    expl: 'tan θ = Opp/Adj. Since Opposite can be larger than Adjacent, tan can be > 1.'
                }
            },
            {
                seq: 6,
                content: '',
                trigger: 95,
                checkpoint: {
                    q: 'If two sides are given in a right triangle, first step is:',
                    type: 'mcq',
                    diff: 'basic',
                    opts: JSON.stringify(['Guess the angle', 'Use identity', 'Use Pythagoras theorem', 'Use tan directly']),
                    ans: JSON.stringify('Use Pythagoras theorem'),
                    expl: 'Find the third side using Pythagoras Theorem first.'
                }
            }
        ];

        let completed = 0;

        sections.forEach(sec => {
            db.run(`INSERT INTO Checkpoint (questionText, questionType, options, correctAnswer, explanationMarkdown, difficulty) VALUES (?, ?, ?, ?, ?, ?)`,
                [sec.checkpoint.q, sec.checkpoint.type, sec.checkpoint.opts, sec.checkpoint.ans, sec.checkpoint.expl, sec.checkpoint.diff],
                function (err) {
                    if (err) return console.error("Error inserting checkpoint:", err);
                    const checkpointId = this.lastID;

                    db.run(`INSERT INTO ContentBlock (subtopicId, contentType, contentData, sequenceOrder, triggerAtScrollDepth, checkpointId) VALUES (?, ?, ?, ?, ?, ?)`,
                        [subtopicId, 'markdown', sec.content, sec.seq, sec.trigger, checkpointId],
                        function (err) {
                            if (err) return console.error("Error inserting content block:", err);
                            console.log(`Inserted block seq ${sec.seq} (Checkpoint ID: ${checkpointId})`);
                            completed++;
                            if (completed === sections.length) {
                                console.log(`SUCCESS: Concept 5 (ID: ${subtopicId}) Updated.`);
                                db.close();
                            }
                        }
                    );
                }
            );
        });
    }
});
