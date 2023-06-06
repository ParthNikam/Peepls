import express from "express";
import expressLayouts from "express-ejs-layouts";
import bodyParser from "body-parser";
import MethodOverride from "method-override";
import sqlite3 from "sqlite3";
import { dirname } from "path";
import { fileURLToPath } from "url";


const __dirname = dirname(fileURLToPath(import.meta.url));

import indexRouter from "./routes/index.js";
import userRouter  from "./routes/users.js";

const app = express();

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(MethodOverride("_method"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({limit: "10mb", extended:false}))
app.use(bodyParser.json());


app.use("/", indexRouter);
app.use("/users", userRouter);


import db from "./models/user_database.js"

app.get("/user", (req, res, next) => {
  var sql = "select * from users"
  var params = []
  db.all(sql, params, (err, rows) => {
      if (err) {
        res.status(400).json({"error":err});
        return;
      }
      res.json({
          "message":"success",
          "data":rows
      })
    });
});


app.listen(process.env.PORT || 5000);
