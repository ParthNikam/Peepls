import sqlite3 from "sqlite3";
import md5 from "md5";

sqlite3.verbose();

const DBSOURCE = "sqliteDat.db";

let db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    // Cannot open database
    console.error(err);
    throw err;
  } else {
    console.log("Connected to the SQLite database.");
    // id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2)))) || '-' || lower(hex(randomblob(2)))) || '-' || lower(hex(randomblob(2)))) || '-' || lower(hex(randomblob(6)))),
    db.run(
      `CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            coverImage BLOB,
            name text, 
            role text,
            email text UNIQUE, 
            password text, 
            CONSTRAINT email_unique UNIQUE (email)
            )`,
      (err) => {
        if (err) {
          // Table already created
        } else {
          // Table just created, creating some rows
        }
      }
    );
  }
});

export default db;
