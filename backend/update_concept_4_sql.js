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

        // 2. Find or Create Subtopic at Sequence Level 4
        db.get(`SELECT id, title FROM Subtopic WHERE exerciseId = ? AND sequenceOrder = 4`, [exerciseId], (err, row) => {
            if (err) {
                console.error("Error finding subtopic", err);
                return;
            }

            if (row) {
                subtopicId = row.id;
                console.log(`Found existing Concept 4 (ID: ${subtopicId}). Updating...`);
                // Update Title
                db.run(`UPDATE Subtopic SET title = ?, description = ? WHERE id = ?`,
                    ['Special Cases & Undefined Conditions', 'Special Cases & Undefined Conditions (Cheat Sheet 4)'],
                    subtopicId,
                    (err) => {
                        if (err) console.error("Error updating title", err);
                        clearOldContent(subtopicId);
                    }
                );
            } else {
                console.log("Concept 4 not found. Creating new...");
                db.run(`INSERT INTO Subtopic (title, description, exerciseId, sequenceOrder) VALUES (?, ?, ?, ?)`,
                    ['Special Cases & Undefined Conditions', 'Special Cases & Undefined Conditions (Cheat Sheet 4)', exerciseId, 4],
                    function (err) {
                        if (err) {
                            console.error("Error creating subtopic", err);
                            return;
                        }
                        subtopicId = this.lastID;
                        console.log(`Created Concept 4 (ID: ${subtopicId}).`);
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
            // Section 1: Understanding Special Angles (0° and 90°)
            {
                seq: 1,
                content: `## 📐 Section 1: Understanding Special Angles (0° and 90°)\n\nContent:\n\nIn trigonometry, **0°** and **90°** are special angles.\n\n*   At **0°**, the triangle becomes almost flat.\n*   At **90°**, one angle becomes a right angle and the opposite side becomes equal to the hypotenuse.\n\nThese extreme positions change trigonometric values dramatically!`,
                trigger: 30,
                checkpoint: {
                    q: 'Which two angles are considered special in basic trigonometry?',
                    type: 'mcq',
                    diff: 'basic',
                    opts: JSON.stringify(['15° and 75°', '0° and 90°', '30° and 60°', '45° and 90°']),
                    ans: JSON.stringify('0° and 90°'),
                    expl: '0° and 90° are the boundary angles in a right-angled context.'
                }
            },
            {
                seq: 2,
                content: '',
                trigger: 35,
                checkpoint: {
                    q: 'At 0°, the triangle becomes:',
                    type: 'mcq',
                    diff: 'basic',
                    opts: JSON.stringify(['Larger', 'Flat', 'Equilateral', 'Random']),
                    ans: JSON.stringify('Flat'),
                    expl: 'As the angle approaches 0°, the opposite side disappears, flattening the triangle.'
                }
            },
            // Section 2: Undefined Ratios Explained
            {
                seq: 3,
                content: `## 🚫 Section 2: Undefined Ratios Explained\n\nContent:\n\n*   A trigonometric ratio becomes **undefined** when its denominator is zero.\n*   Division by zero is not allowed in mathematics.\n\n$$ \\tan \\theta = \\frac{\\sin \\theta}{\\cos \\theta} $$\n\n*   When **cos 90° = 0**, **tan 90°** becomes undefined.\n*   Similarly, **cosec 0°** is undefined because **sin 0° = 0**.`,
                trigger: 60,
                checkpoint: {
                    q: 'tan 90° is undefined because:',
                    type: 'mcq',
                    diff: 'basic',
                    opts: JSON.stringify(['sin 90° = 0', 'cos 90° = 0', 'tan is always undefined', 'angle is too large']),
                    ans: JSON.stringify('cos 90° = 0'),
                    expl: 'tan 90 = sin 90 / cos 90. Since cos 90 is 0, division by zero occurs.'
                }
            },
            {
                seq: 4,
                content: '',
                trigger: 65,
                checkpoint: {
                    q: 'Which ratio is undefined at 0°?',
                    type: 'mcq',
                    diff: 'basic',
                    opts: JSON.stringify(['sin 0°', 'cos 0°', 'tan 0°', 'cosec 0°']),
                    ans: JSON.stringify('cosec 0°'),
                    expl: 'cosec 0 = 1 / sin 0. Since sin 0 is 0, cosec 0 is undefined.'
                }
            },
            // Section 3: Quick Reference Summary
            {
                seq: 5,
                content: `## 📝 Section 3: Quick Reference Summary\n\nContent:\n\n**At 0°:**\n*   sin 0° = 0\n*   cos 0° = 1\n*   tan 0° = 0\n*   **cosec 0°** is undefined\n\n**At 90°:**\n*   sin 90° = 1\n*   cos 90° = 0\n*   **tan 90°** is undefined\n*   **sec 90°** is undefined\n\n👉 **Always check the denominator before calculating a ratio.**`,
                trigger: 90,
                checkpoint: {
                    q: 'sec 90° is undefined because:',
                    type: 'mcq',
                    diff: 'basic',
                    opts: JSON.stringify(['sin 90° = 1', 'cos 90° = 0', 'tan 90° = 1', 'sec equals tan']),
                    ans: JSON.stringify('cos 90° = 0'),
                    expl: 'sec = 1/cos. cos 90 is 0.'
                }
            },
            {
                seq: 6,
                content: '',
                trigger: 95,
                checkpoint: {
                    q: 'Before calculating any trigonometric ratio, you must:',
                    type: 'mcq',
                    diff: 'basic',
                    opts: JSON.stringify(['Memorize formulas', 'Check denominator', 'Change angle', 'Multiply values']),
                    ans: JSON.stringify('Check denominator'),
                    expl: 'To avoid undefined values (division by zero).'
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
                                console.log(`SUCCESS: Concept 4 (ID: ${subtopicId}) Updated.`);
                                db.close();
                            }
                        }
                    );
                }
            );
        });
    }
});
