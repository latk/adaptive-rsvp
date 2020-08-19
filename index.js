// @ts-check
const express = require("express");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
//Express is a package that makes server side a lot easier.
const app = express();

const database = require("./database");
let { texts } = require("./texts");

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

/**
 * The stored state & state transitions that are managed via a cookie.
 */
class UserState {
  constructor(stateCookie) {
    const {
      textOrder = null,
      index = 0,
      finished = false,
      speed = 300,
    } = stateCookie || {};

    /**
     * the order of text snippets
     * @type {null | number[]}
     */
    // @ts-ignore
    this.textOrder = textOrder;

    /**
     * the number of the next text snippet to be read
     * @type {number}
     */
    this.index = index;

    /**
     * whether the evaluation has been completed
     * @type {boolean}
     */
    this.finished = finished;

    /**
     * the last speed that was manually selected
     */
    this.speed = speed;
  }

  /**
   * map the user state to a cookie value
   * @returns {object}
   */
  toCookie() {
    let { textOrder, index, finished, speed } = this;
    return { textOrder, index, finished, speed };
  }

  currentText() {
    if (!this.textOrder) return null;
    if (this.finished) return null;
    return texts[this.textOrder[this.index]];
  }

  reset() {
    // @ts-ignore
    this.textOrder = shuffle([...texts.keys()]);
    this.index = 0;
    this.finished = false;
    this.speed = 300;
  }

  nextText() {
    if (!this.textOrder) return;
    this.index++;
    if (this.index >= this.textOrder.length) this.finished = true;
  }
}

//Main route, this function is executed when the user goes on the main URL (In our case localhost:3000)
app.get("/", function (req, res) {
  const state = new UserState(req.cookies["Information"]);
  state.reset();

  // Creates Cookie With all data inside
  res.cookie("Information", state.toCookie());

  //When the user goes on / then render the main.ejs file(found on views.)
  res.render("main", { initText: state.currentText().text });
});

//same logic for /about
app.get("/about", function (req, res) {
  res.render("about");
});

//this one is executed when a post request is passed through to this route (/reader) from a form on our case
app.get("/reader", function (req, res) {
  const state = new UserState(req.cookies["Information"]);

  if (state.finished) return res.render("finished");

  const textEntry = state.currentText();
  if (!textEntry) return res.redirect("/");

  let speed = state.speed;

  let {
    automaticSpeed,
    text: inputText,
    speed: speedBasedOnComplexity,
    score: textComplexityScore,
    question,
  } = textEntry;

  //creates an array with all the words from the user text
  let arrayOfWords = `${inputText} Question: ${question}`.split(" ");

  if (automaticSpeed) {
    speed = Math.round(speedBasedOnComplexity);
    console.log(
      `Complexity Score = ${Math.round(textComplexityScore)}\n` +
        `AutomatedSpeed = ${speed}`
    );
  }

  //renders  reader.ejs and passes an array with the name arrayOfWords to the file
  res.render("reader", {
    arrayOfWords,
    speed,
    id: state.index,
  });
});

app.post("/formHandler", function (req, res) {
  // extract form data
  let {
    id,
    faster,
    slower,
    pause: pauses,
    forward,
    rewind,
    elapsedSeconds: time,
    speed: lastSpeed,
    question: answer,
  } = req.body;

  database.saveFormData({
    passage: id,
    answer,
    reading_duration: time,
    interactions: {
      slower,
      faster,
      pauses,
      forward,
      rewind,
    },
  });

  const state = new UserState(req.cookies["Information"]);
  state.nextText(); // mark this text passage as completed

  // was a new speed manually selected?
  if (faster || slower) state.speed = lastSpeed;

  res.cookie("Information", state.toCookie());

  if (state.finished) {
    res.render("finished");
  } else {
    res.redirect("/reader");
  }
});

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

app.listen(3000, () => console.log("The application started on port 3000"));
