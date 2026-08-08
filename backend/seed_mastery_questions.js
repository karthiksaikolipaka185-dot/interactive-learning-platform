const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'prisma/dev.db');
const questionsPath = path.resolve(__dirname, 'data/mastery_questions_8_1.json');

// Read Questions
if (!fs.existsSync(questionsPath)) {
    console.error("Questions file not found!");
    process.exit(1);
}
const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
console.log(`Loaded ${questions.length} questions.`);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite.');
});

db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON;");

    let exerciseId = null;
    let subtopicId = null;

    // 1. Get Exercise 8.1 ID
    db.get(`
        SELECT E.id 
        FROM Exercise E
        JOIN Course C ON E.courseId = C.id
        WHERE C.syllabusType = 'NCERT_11' AND E.sequenceOrder = 1
    `, [], (err, row) => {
        if (err || !row) {
            console.error("Exercise 8.1 not found.");
            return;
        }
        exerciseId = row.id;

        // 2. Find or Create Hidden Subtopic (Seq 999)
        db.get(`SELECT id FROM Subtopic WHERE exerciseId = ? AND sequenceOrder = 999`, [exerciseId], (err, row) => {
            if (row) {
                subtopicId = row.id;
                console.log(`Found Mastery Pool Subtopic ID: ${subtopicId}`);
                clearAndInsert(subtopicId);
            } else {
                db.run(`INSERT INTO Subtopic (title, description, exerciseId, sequenceOrder) VALUES (?, ?, ?, ?)`,
                    ['Mastery Question Pool', 'Hidden pool for adaptive tests', exerciseId, 999],
                    function (err) {
                        if (err) return console.error(err);
                        subtopicId = this.lastID;
                        console.log(`Created Mastery Pool Subtopic ID: ${subtopicId}`);
                        clearAndInsert(subtopicId);
                    }
                );
            }
        });
    });

    function clearAndInsert(subtopicId) {
        // Clear checkpoints first (they depend on blocks)
        db.run(`DELETE FROM Checkpoint WHERE contentBlockId IN (SELECT id FROM ContentBlock WHERE subtopicId = ?)`, [subtopicId], function (err) {
            if (err) console.error(err);
            
            // Then clear blocks
            db.run(`DELETE FROM ContentBlock WHERE subtopicId = ?`, [subtopicId], function (err) {
                if (err) console.error(err);
                console.log(`Cleared old content for subtopic ${subtopicId}.`);
                insertQuestions(subtopicId);
            });
        });
    }

    function insertQuestions(subtopicId) {
        let index = 0;

        function insertNext() {
            if (index >= questions.length) {
                console.log(`SUCCESS: Inserted all ${questions.length} mastery questions.`);
                db.close();
                return;
            }

            const q = questions[index];

            // 1. Insert ContentBlock first
            db.run(`INSERT INTO ContentBlock (subtopicId, contentType, contentData, sequenceOrder) VALUES (?, ?, ?, ?)`,
                [subtopicId, 'hidden', '{}', index + 1],
                function (err) {
                    if (err) {
                        console.error(`Error inserting block ${index}:`, err);
                        return;
                    }
                    const contentBlockId = this.lastID;

                    // 2. Insert Checkpoint with contentBlockId
                    db.run(`INSERT INTO Checkpoint (questionText, questionType, options, correctAnswer, explanationMarkdown, difficulty, contentBlockId) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [q.q, q.type, JSON.stringify(q.opts), JSON.stringify(q.ans), q.expl, q.diff, contentBlockId],
                        function (err) {
                            if (err) {
                                console.error(`Error inserting checkpoint ${index}:`, err);
                                return;
                            }
                            console.log(`Inserted question ${index + 1}/${questions.length}`);
                            index++;
                            insertNext(); // Recursive call for next item
                        }
                    );
                }
            );
        }

        // Start insertion
        db.serialize(() => {
            insertNext();
        });
    }
});
