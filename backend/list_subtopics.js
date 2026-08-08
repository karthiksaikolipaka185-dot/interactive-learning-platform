const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./backend/prisma/dev.db');

db.serialize(() => {
    db.each("SELECT id, title FROM Subtopic", (err, row) => {
        if (err) {
            console.error(err);
        } else {
            console.log(`${row.id}: ${row.title}`);
        }
    });
});

db.close();