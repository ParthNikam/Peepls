import md5 from "md5";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import fs from 'fs';
import { stringify } from "querystring";
import { query } from "express";


sqlite3.verbose();

const db = await open({ filename: "sqliteDat.db", driver: sqlite3.Database });

const methods = {
  GET_ALL:  "GET_ALL",
  GET_ID:   "GET_ID",
  POST:     "POST",
  PUT:      "PUT",
  DELETE:   "DELETE"
}

const showIndex = async (req, res) => {
  var [_, query] = queryParams(0, methods.GET_ALL);

  if (req.query.name != null && req.query.name != "")
    query += ` WHERE name LIKE '%${req.query.name}%'`;

  try {
    const users = await db.all(query);
    res.render("users/index", {
      users: users,
      searchOptions: req.query,
    });
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
};


async function showUser(req, res) {
  try {
    const userId = req.params.id;
    var [_, sql] = queryParams(0, methods.GET_ID);
    const user = await db.get(sql, [userId]);
    if (user) {
      res.render("users/show", { user: user });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
}


const createUser = async (req, res) => {
  var errors = [];
  if (!req.body.password) errors.push("No password specified");

  if (!req.body.email) errors.push("No email specified");

  if (errors.length) {
    res.status(400).json({ error: errors.join(",") });
    return;
  }

  
  var [params, sql] = queryParams(req.body, methods.POST);
  
  try {
    await db.run(sql, params, (err) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        message: "success",
        data: user,
        id: this.lastID,
      });
    });
    res.redirect(`users/`);
  } catch (error) {
    console.log(error);
  }
};


async function renderFormPage(res, user, form, hasError = false) {
  try {
    const params = {
      user: user,
    };
    if (hasError) {
      if (form == "edit") {
        params.errorMessage = "Error Updating User";
      } else {
        params.errorMessage = "Error Creating User";
      }
    }
    res.render(`users/${form}`, params);
  } catch {
    res.redirect("/users");
  }
}


async function renderForm(req, res) {
  var tempUser = {
    name: "",
    role: "",
    email: "",
    password: "",
  };
  renderFormPage(res, tempUser, "new", false);
}


async function renderEditPage(req, res) {
  try {
    const userId = req.params.id;
    var [_, sql] = queryParams(0, methods.GET_ID);
    const user = await db.get(sql, [userId]);
    console.log(user, userId);
    renderFormPage(res, user, "edit", false);
  } catch {
    res.redirect("/");
  }
}


async function updateUser(req, res) {
  const userId = req.params.id;
  var [_, sql] = queryParams(0, methods.GET_ID);

  const user = await db.get(sql, [userId]);

  var [params, updateQuery] = queryParams(req.body, methods.PUT);
  params.push(userId);
  
  try {
    await db.run(updateQuery, params, (err) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        message: "success",
        data: user,
        id: userId,
      });
    });
    console.log(`redirecting user to users/${user.id}`);
    res.redirect(`/users/${user.id}`);
  } catch {
    if (user != null) {
      console.log("user != null");
      renderFormPage(res, user, "edit", true);
    } else {
      console.log("user is null")
      res.redirect("/");
    }
  }
}


async function deleteUser(req, res) {
  try {
    const userId = parseInt(req.params.id);
    var [_, sqlSelect] = queryParams(0, methods.GET_ID);
    const user = await db.get(sqlSelect, [userId]);

    if (user) {
      var [_, sqlDelete] = queryParams(0, methods.DELETE);
      await db.run(sqlDelete, [userId]);
      res.redirect("/users");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
}




const queryParams = (req, action) => {
  req = req || 0;
  action = action;
  var params = []

  if (req) {
    var imageValue = stringifyImage(req.coverImage);
    var data = {
      coverImage: imageValue,
      name: req.name,
      role: req.role,
      email: req.email,
      password: md5(req.password),
    }
  
    var columns = Object.keys(data);
    var values = Object.values(data);
    var tableColumns = columns.map((column) => `${column}`).join(', ');
    params = [...values]
  }
  
  // setting the UPDATE query to update all the columns automatically 
  // instead of manually defining all of them.
  var query = "";
  switch (action) {
    case methods.GET_ALL:
      query = "SELECT * FROM users";
      break;

    case methods.GET_ID:
      query = "SELECT * FROM users WHERE id = ?";
      break;

    case methods.POST:
      query = `INSERT INTO users (${tableColumns}) VALUES (?,?,?,?,?)`;
      break;
    
    case methods.PUT:
      const columnNames = tableColumns.split(", ");
      const updateColumns = columnNames.map((columnName) => `${columnName} = ?`).join(", ");
      query = `UPDATE users SET ${updateColumns} WHERE id = ?`;
      break;
    
    case methods.DELETE:
      query = "DELETE from users WHERE id = ?";
      break;

  }

  return [params, query];
}



const stringifyImage = (coverImage) => {
  var str = coverImage;
  const dataStartIndex = str.indexOf('"data"') + 8; 
  const dataEndIndex = str.lastIndexOf('"'); 
  const imageValue = str.substring(dataStartIndex, dataEndIndex);
  return imageValue;
}

export { showIndex, showUser, createUser, renderForm, renderEditPage, updateUser, deleteUser };
