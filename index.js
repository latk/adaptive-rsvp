// @ts-check
const express = require("express");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
//Express is a package that makes server side a lot easier.
const app = express();

const database = require("./database");
const { texts } = require("./texts");

app.use(cookieParser()); // To access cookies quickly

//This line is to ensure that getting info from a HTML form is easier. (will see later)
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
//Shows app where to see for static content(Css,images etc)
// @ts-ignore
app.use(express.static(__dirname + "/public"));

//Sets the view engine to EJS which makes data exchanging through back-end and front-end a lot easier.
app.set("view engine", "ejs");

// Log any requests
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

//Main route, this function is executed when the user goes on the main URL (In our case localhost:3000)
app.get("/", function (req, res) {
  //When the user goes on / then render the main.ejs file(found on views.)
  res.render("main");
});

/**
 * The stored state & state transitions that are managed via a cookie.
 *
 * States:
 * * null: initial state
 * * demographic: user has given consent and is now answering background questions
 * * tutorial: user is now in tutorial
 * * reading: user is in the phase where they read text snippets
 * * finished: user has completed the experiment
 *
 * @typedef {null | 'demographic' | 'tutorial' | 'reading' | 'finished'} State
 */
class UserState {
  constructor() {
    /**
     * the user ID
     * @type {string}
     */
    this.uid = [Date.now(), 0 | (1e6 * Math.random())].join(".");

    /**
     * the state of this user
     * @type {State}
     */
    this.state = null;

    /**
     * the order of text snippets
     * @type {number[]}
     */
    // @ts-ignore
    this.textOrder = shuffle([...texts.keys()]);

    /**
     * the number of the next text snippet to be read
     * @type {number}
     */
    this.index = 0;

    /**
     * the last speed that was manually selected
     */
    this.speed = 300;
  }

  /**
   * map the user state to a cookie value
   * @returns {object}
   */
  toCookie() {
    let { uid, state, textOrder, index, speed } = this;
    return { uid, state, textOrder, index, speed };
  }

  /**
   * hydrate the state from a cookie value
   * @param {object} cookie
   */
  fromCookie(cookie) {
    this.uid = cookie.uid || this.uid;
    this.state = cookie.state || this.state;
    this.textOrder = cookie.textOrder || this.textOrder;
    this.index = cookie.index || this.index;
    this.speed = cookie.speed || this.speed;
  }

  currentText() {
    if (this.state !== "reading") return null;
    return texts[this.textOrder[this.index]];
  }

  nextText() {
    this.index++;
    if (this.index >= this.textOrder.length) this.state = "finished";
  }
}

/** state assertions that guard some of the below routes.
 * Certain states force a particular route.
 * @type {() => (req, res, next) => any}
 */
const ensureState = () => (req, res, next) => {
  const state = (req.state = new UserState());
  state.fromCookie(req.cookies["Information"] || {});

  // no state? Get consent.
  if (!state.state && req.path !== "/consent") return res.redirect("/consent");

  // demographics?
  if (state.state === "demographic" && req.path !== "/demographic")
    return res.redirect("/demographic");

  // tutorial?
  if (state.state === "tutorial" && !req.path.startsWith("/tutorial/"))
    return res.redirect("/tutorial/1");

  // reading?
  if (state.state === "reading" && req.path !== "/text-snippet")
    return res.redirect("/text-snippet");

  // finished? Really stay finished.
  if (state.state === "finished" && req.path !== "/finished")
    return res.redirect("/finished");

  return next();
};

// no preconditions, can always start anew
app.get("/consent", (req, res) => {
  res.render("consent");
});

app.post("/consent", (req, res) => {
  const consent = req.body.consent;
  if (consent !== "on") {
    return res.redirect("/consent");
  }

  // the user has given consent, so initialize the state
  const state = new UserState();
  state.state = "demographic";
  res.cookie("Information", state.toCookie());
  return res.redirect("/demographic");
});

const DEMOGRAPHIC_DEFAULT = {
  message: null,
  ageRange: null,
  englishLevel: null,
  vision: null,
  source: null,
  rsvpExperience: null,
  device: null,
  light: null,
};

app.get("/demographic", ensureState(), (req, res) => {
  res.render("demographic", { ...DEMOGRAPHIC_DEFAULT });
});

app.post("/demographic", ensureState(), async (req, res) => {
  /** @type {UserState} */
  const state = req.state;

  const params = { ...DEMOGRAPHIC_DEFAULT, ...req.body };

  var {
    ageRange,
    englishLevel,
    vision,
    source,
    rsvpExperience,
    device,
    light,
  } = params;

  if (
    !ageRange ||
    !englishLevel ||
    !vision ||
    !source ||
    !rsvpExperience ||
    !device ||
    !light
  ) {
    res.status(400);
    res.render("demographic", {
      ...params,
      message: "please answer all questions or select N/A.",
    });
    return;
  }

  await database.saveDemographic({
    uid: state.uid,
    date: new Date(),
    ageRange,
    englishLevel,
    vision,
    source,
    rsvpExperience,
    device,
    light,
  });

  state.state = "tutorial";
  res.cookie("Information", state.toCookie());
  res.redirect("/tutorial/1");
});

app.get("/tutorial/1", ensureState(), (req, res) => {
  res.render("tutorial-1");
});

app.get("/tutorial/2", ensureState(), (req, res) => {
  res.render("tutorial-2");
});

app.get("/tutorial/3", ensureState(), (req, res) => {
  res.render("tutorial-3");
});

app.post("/tutorial/done", ensureState(), (req, res) => {
  /** @type {UserState} */
  const state = req.state;

  state.state = "reading";
  res.cookie("Information", state.toCookie());
  return res.redirect("/text-snippet");
});

// This route contains the main evaluation:
// first show one of the text snippets with RSVP,
// then ask the comprehension question.
app.get("/text-snippet", ensureState(), function (req, res) {
  /** @type {UserState} */
  const state = req.state;

  const textEntry = state.currentText();

  let speed = state.speed;

  let {
    automaticSpeed,
    text: inputText,
    speed: speedBasedOnComplexity,
    score: textComplexityScore,
    question,
  } = textEntry;

  if (automaticSpeed) {
    speed = Math.round(speedBasedOnComplexity);
    console.log(
      `Complexity Score = ${Math.round(textComplexityScore)}\n` +
        `AutomatedSpeed = ${speed}`
    );
  }

  //renders  text-snippet.ejs and passes the text to be RSVP-rendered
  res.render("text-snippet", {
    text: `${inputText} Question: ${question}`,
    speed,
    id: state.index,
    taskNumber: state.index + 1,
    taskTotal: state.textOrder.length,
  });
});

app.post("/text-snippet", ensureState(), async (req, res) => {
  /** @type {UserState} */
  const state = req.state;

  // extract form data
  try {
    var {
      id,
      faster,
      slower,
      pause,
      forward,
      rewind,
      elapsedSeconds: time,
      speed: lastSpeed,
      question: answer,
    } = req.body;
  } catch (err) {
    if (err instanceof TypeError) return res.sendStatus(400);
    throw err;
  }

  await database.saveAnswer({
    uid: state.uid,
    date: new Date(),
    passage: id,
    position: state.index + 1,
    answer,
    readingDuration: time,
    interactions: {
      slower,
      faster,
      pause,
      forward,
      rewind,
    },
  });

  state.nextText(); // mark this text passage as completed

  // was a new speed manually selected?
  if (faster || slower) state.speed = lastSpeed;

  res.cookie("Information", state.toCookie());

  // go to next text snippet, or to finished page
  res.redirect("/text-snippet");
});

app.get("/finished", ensureState(), (req, res) => {
  return res.render("finished");
});

/**
 * Implement HTTP Basic Authentication.
 *
 * Credentials `user:pass` are taken from `DOWNLOAD_CREDENTIALS` env variable
 */
const ensureDownloadAuthorization = () => (req, res, next) => {
  const credentials = process.env.DOWNLOAD_CREDENTIALS;
  const expectedAuthorization =
    "Basic " + Buffer.from(credentials, "utf8").toString("base64");
  if (credentials && req.headers.authorization === expectedAuthorization)
    return next();

  res.set("WWW-Authenticate", 'Basic realm="research data download"');
  res.status(401);
  res.send("data download requires authorization token");
};

app.get(
  "/download/answers",
  ensureDownloadAuthorization(),
  async (req, res) => {
    const data = await database.getAllAnswers();
    return res.json(data);
  }
);

app.get(
  "/download/demographics",
  ensureDownloadAuthorization(),
  async (req, res) => {
    const data = await database.getAllDemographics();
    return res.json(data);
  }
);

/**
 * Shuffle the array *in place* and return it.
 */
function shuffle(array) {
  // Fisher-Yates shuffle
  // <https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle>
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

const server = app.listen(3000, () =>
  console.log("The application started on port 3000")
);

process.on("SIGTERM", () => {
  console.log("Shutdown initiated.");
  server.close(() => {
    console.log("Shutdown complete.");
  });
});
