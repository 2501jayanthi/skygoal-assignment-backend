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

  //Register User
  app.post("/users/", async (request, response) => {
    const { username,  password, gender, location } = request.body;
    const hashedPassword = await bcrypt.hash(request.body.password, 10);
    const selectUserQuery = `SELECT * FROM users WHERE username = '${username}'`;
    const dbUser = await db.get(selectUserQuery);
    if (dbUser === undefined) {
      const createUserQuery = `
        INSERT INTO 
          user (username, name, password, gender, location) 
        VALUES 
          (
            '${username}', 
            '${hashedPassword}', 
            '${gender}',
            '${location}'
          )`;
      const dbResponse = await db.run(createUserQuery);
      const newUserId = dbResponse.lastID;
      response.send(`Created new user with ${newUserId}`);
    } else {
      response.status = 400;
      response.send("User already exists");
    }
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

  //Login User

  app.post("/login", async (request, response) => {
    const { username, password } = request.body;
    const selectUserQuery = `SELECT * FROM user WHERE username = '${username}'`;
    const dbUser = await db.get(selectUserQuery);
    if (dbUser === undefined) {
      response.status(400);
      response.send("Invalid User");
    } else {
      const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
      if (isPasswordMatched === true) {
        const payload = {
          username: username,
        };
        const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
        response.send({ jwtToken });
      } else {
        response.status(400);
        response.send("Invalid Password");
      }
    }
  });