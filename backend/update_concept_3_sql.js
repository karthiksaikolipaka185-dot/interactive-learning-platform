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
    // Enable foreign keys
    db.run("PRAGMA foreign_keys = ON;");

    // 1. Find Subtopic ID (Exercise 1, Sequence 3)
    let exerciseId = null;
    let subtopicId = null;

    db.get(`
        SELECT E.id 
        FROM Exercise E
        JOIN Course C ON E.courseId = C.id
        WHERE C.syllabusType = 'NCERT_11' AND E.sequenceOrder = 1
    `, [], (err, row) => {
        if (err || !row) {
            console.error("Exercise not found", err);
            return;
        }
        exerciseId = row.id;

        db.get(`SELECT id, title FROM Subtopic WHERE exerciseId = ? AND sequenceOrder = 3`, [exerciseId], (err, row) => {
            if (err || !row) {
                console.error("Subtopic not found", err);
                return;
            }
            subtopicId = row.id;
            console.log(`Found Subtopic ID: ${subtopicId} (${row.title})`);
            updateSubtopic(subtopicId);
        });
    });

    function updateSubtopic(id) {
        // 2. Clear old content
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
                        else console.log(`Deleted ${this.changes} old Checkpoints.`);
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
            // Section 1: Understanding Angle Growth
            {
                seq: 1,
                content: `## 📈 Section 1: Understanding Angle Growth\n\nContent:\n\nAs angle increases from **0° to 90°**, trigonometric values change in a fixed pattern.\n\n*   **sin θ** increases from 0 to 1.\n*   **cos θ** decreases from 1 to 0.\n*   **tan θ** increases slowly first, then rapidly near 90°.`,
                trigger: 30,
                checkpoint: {
                    q: 'As θ increases from 0° to 90°, sin θ:',
                    type: 'mcq',
                    diff: 'easy',
                    opts: JSON.stringify(['Decreases', 'Remains constant', 'Increases', 'Becomes undefined']),
                    ans: JSON.stringify('Increases'),
                    expl: 'sin θ increases from 0 to 1 as the angle grows.'
                }
            },
            {
                seq: 2,
                content: '', // Hidden block for Q2
                trigger: 35,
                checkpoint: {
                    q: 'As θ increases, cos θ:',
                    type: 'mcq',
                    diff: 'easy',
                    opts: JSON.stringify(['Increases', 'Decreases', 'Remains same', 'Doubles']),
                    ans: JSON.stringify('Decreases'),
                    expl: 'cos θ decreases from 1 to 0 as the angle grows.'
                }
            },
            // Section 2: Visual Pattern Logic
            {
                seq: 3,
                content: `## 👁️ Section 2: Visual Pattern Logic\n\nContent:\n\n*   **sin θ** follows the pattern $\\frac{\\sqrt{0}}{2}, \\frac{\\sqrt{1}}{2}, \\frac{\\sqrt{2}}{2}, \\frac{\\sqrt{3}}{2}, \\frac{\\sqrt{4}}{2}$.\n*   **cos θ** follows the reverse pattern.\n*   **tan θ** = $\\frac{\\sin \\theta}{\\cos \\theta}$.\n\n**tan** becomes very large when **cos θ** becomes very small (near 90°).`,
                trigger: 60,
                checkpoint: {
                    q: 'tan θ is equal to:',
                    type: 'mcq',
                    diff: 'easy',
                    opts: JSON.stringify(['cos θ / sin θ', 'sin θ / cos θ', '1 / sin θ', '1 / cos θ']),
                    ans: JSON.stringify('sin θ / cos θ'),
                    expl: 'Identity: tan = sin/cos'
                }
            },
            {
                seq: 4,
                content: '',
                trigger: 65,
                checkpoint: {
                    q: 'Why does tan θ grow rapidly near 90°?',
                    type: 'mcq',
                    diff: 'medium',
                    opts: JSON.stringify(['sin becomes zero', 'cos becomes zero', 'tan doubles', 'angle becomes negative']),
                    ans: JSON.stringify('cos becomes zero'),
                    expl: 'Division by a decreasing denominator (cos approaching 0) result in a large value.'
                }
            },
            // Section 3: Concept Reinforcement
            {
                seq: 5,
                content: `## 🎯 Section 3: Concept Reinforcement\n\nContent:\n\n*   For acute angles, **sin θ** is always between 0 and 1.\n*   **cos θ** is also between 0 and 1.\n*   **tan θ** can be greater than 1.\n\nUnderstanding these patterns helps in solving exam problems quickly!`,
                trigger: 90,
                checkpoint: {
                    q: 'For acute angles, sin θ is:',
                    type: 'mcq',
                    diff: 'easy',
                    opts: JSON.stringify(['Greater than 1', 'Between 0 and 1', 'Always 2', 'Undefined']),
                    ans: JSON.stringify('Between 0 and 1'),
                    expl: 'Hypotenuse is the longest side, so Opposite/Hypotenuse ≤ 1.'
                }
            },
            {
                seq: 6,
                content: '',
                trigger: 95,
                checkpoint: {
                    q: 'Which ratio can be greater than 1?',
                    type: 'mcq',
                    diff: 'medium',
                    opts: JSON.stringify(['sin θ', 'cos θ', 'tan θ', 'none']),
                    ans: JSON.stringify('tan θ'),
                    expl: 'tan = Opp/Adj. Opposite can be > Adjacent.'
                }
            }
        ];

        let completed = 0;

        sections.forEach(sec => {
            // Insert Checkpoint
            db.run(`INSERT INTO Checkpoint (questionText, questionType, options, correctAnswer, explanationMarkdown, difficulty) VALUES (?, ?, ?, ?, ?, ?)`,
                [sec.checkpoint.q, sec.checkpoint.type, sec.checkpoint.opts, sec.checkpoint.ans, sec.checkpoint.expl, sec.checkpoint.diff],
                function (err) {
                    if (err) return console.error("Error inserting checkpoint:", err);
                    const checkpointId = this.lastID;

                    // Insert ContentBlock
                    db.run(`INSERT INTO ContentBlock (subtopicId, contentType, contentData, sequenceOrder, triggerAtScrollDepth, checkpointId) VALUES (?, ?, ?, ?, ?, ?)`,
                        [subtopicId, 'markdown', sec.content, sec.seq, sec.trigger, checkpointId],
                        function (err) {
                            if (err) return console.error("Error inserting content block:", err);
                            console.log(`Inserted block seq ${sec.seq} (Checkpoint ID: ${checkpointId})`);
                            completed++;
                            if (completed === sections.length) {
                                console.log("All sections inserted. Done.");
                                db.close();
                            }
                        }
                    );
                }
            );
        });
    }
});
