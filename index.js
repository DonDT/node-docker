const express = require("express");
const mongoose = require("mongoose");
const {
  MONGO_USER,
  MONGO_IP,
  MONGO_PASSWORD,
  MONGO_PORT,
  REDIS_PORT,
  REDIS_URL,
  SESSION_SECRET,
} = require("./config/config");
const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");
const cors = require("cors");

const session = require("express-session");
const redis = require("redis");

let redisStore = require("connect-redis")(session);

let redisClient = redis.createClient({
  host: REDIS_URL,
  port: REDIS_PORT,
});

const app = express();

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;
// const mongoURL = `mongodb://donald:mypassword@mongo:27017/?authSource=admin`;

const connectWithRetry = () => {
  mongoose
    .connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log(`Success connecting to database`);
    })
    .catch((e) => {
      console.log(`Error connecting to database`);
      console.log(e);
      // Docker or kubernetes cannot guarantee that mongo db is running before
      // your application starts, there has to be a logic that does it
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

app.enable("trust proxy"); // accept some of the headers nginx is gonna be adding to our request.
app.use(cors({})); // allows servers and front end to operate ondifferent domain names

app.use(
  session({
    store: new redisStore({ client: redisClient }),
    secret: SESSION_SECRET,
    cookie: {
      secure: false,
      resave: false,
      saveUninitialized: false,
      httpOnly: true,
      maxAge: 30000,
    },
  })
);

app.use(express.json());

app.get("/api/v1", (req, res) => {
  console.log("Yeah it is a Saturday!!");
  res.send("<h2>Hello Donald!!!</h2>");
  res.end();
});

app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
