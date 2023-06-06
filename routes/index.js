import { Router } from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { dirname } from "path";
import { fileURLToPath } from "url";


const __dirname = dirname(fileURLToPath(import.meta.url));

const router = Router();

router.get("/", async (req, res) => {
  let users = [];
  try {
    const db = await open({
      filename: "sqliteDat.db",
      driver: sqlite3.Database,
    });

    const query = `
      SELECT * FROM users
      LIMIT 10
    `;

    users = await db.all(query);
  } catch (error) {
    console.error(error);
  }
  
  res.render("index", { users });
});

export default router;
