const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const cors = require("cors");

const jwt = require("jsonwebtoken");
const uuid = require("uuid");
const bcrypt = require("bcrypt");

const uuidv4 = uuid.v4;

const app = express();
app.use(express.json());
app.use(cors());

const dbPath = path.join(__dirname, "userapplication.db");

let db = null;
const initializeDBAndServer = async () => {
    try {
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database,
      });
      app.listen(3000, () => {
        console.log("Server Running at Port  http://localhost:3000/");
        //   console.log(uuidv4());
      });
    } catch (e) {
      console.log(`DB Error: ${e.message}`);
      process.exit(1);
    }
  };
  initializeDBAndServer();

  //GET ALL USERS
  app.get("/users", async (req, res) => {
    const sql = `SELECT * FROM users`;
    const data = await db.all(sql);
    // const list = data.json();
    res.send(data);
  });
  
  //GET SINGLE USER
  

  app.get("/users/:userId/", async (request, response) => {
    const { userId } = request.params;
    const getUserQuery = `
      SELECT
        *
      FROM
        users
      WHERE
        id = ${userId};`;
    const user = await db.get(getUserQuery);
    response.send(user);
  });

  // Delete User API
  
  app.delete("/users/:userId", async (request, response) => {
    const { userId } = request.params;
    const deleteuserQuery = `
      DELETE FROM
        users
      WHERE
        id=${userId};`;
    await db.all(deleteuserQuery);
    response.send("User Deleted");
  });