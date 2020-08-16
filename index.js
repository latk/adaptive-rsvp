const express = require("express");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
//Express is a package that makes server side a lot easier.
const app = express();

const database = require("./database");
let { texts } = require("./texts");
let textMethods = require("./textMethods");

app.use(cookieParser()); // To access cookies quickly

//This line is to ensure that getting info from a HTML form is easier. (will see later)
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
//Shows app where to see for static content(Css,images etc)
app.use(express.static(__dirname + "/public"));

//Sets the view engine to EJS which makes data exchanging through back-end and front-end a lot easier.
app.set("view engine", "ejs");

//Main route, this function is executed when the user goes on the main URL (In our case localhost:3000)
app.get("/", function (req, res) {
  // Creates Cookie With all data inside
  const textOrder = shuffle([...Array(texts.length).keys()]);
  res.cookie("Information", {
    textOrder, // the order of text snippets
    index: 0, // at which text we currently are
    finished: false, // whether all texts have been completed
  });

  //When the user goes on / then render the main.ejs file(found on views.)
  res.render("main", { initText: texts[textOrder[0]].text });
});

//same logic for /about
app.get("/about", function (req, res) {
  res.render("about");
});

//this one is executed when a post request is passed through to this route (/reader) from a form on our case
app.get("/reader", function (req, res) {
  let { textOrder, index, finished } = req.cookies["Information"];

  if (finished) {
    return res.render("finished");
  }

  let textEntry = texts[textOrder[index]];
  let { automaticSpeed, text: inputText } = textEntry;

  let arrayOfWords = inputText.split(" "); //creates an array with all the words from the user text

  let speed = 300;
  if (automaticSpeed) {
    let textComplexityScore = Math.round(
      textMethods.calculateComplexityScore(inputText)
    );
    speed = textMethods.interpolate(textComplexityScore);
    console.log(
      `Complexity Score = ${textComplexityScore}\n` +
        `AutomatedSpeed = ${speed}`
    );
  }

  //renders  reader.ejs and passes an array with the name arrayOfWords to the file
  res.render("reader", { arrayOfWords, speed });
});

app.get("/form", function (req, res) {
  let { textOrder, index } = req.cookies["Information"];
  let id = textOrder[index];
  let textEntry = texts[id];

  let {
    cf: countFaster,
    cs: countSlower,
    cp: countPauses,
    t: time,
  } = req.query;
  let formNr = req.params.formNr;

  res.render("form", {
    question: textEntry.question,
    id,
    countFaster,
    countSlower,
    time,
    countPauses,
  });
});

app.post("/formHandler", function (req, res) {
  // extract form data
  let {
    id,
    countFaster,
    countSlower,
    countPauses,
    time,
    question: answer,
  } = req.body;

  database.saveFormData({
    passage: id,
    answer,
    reading_duration: time,
    interactions: {
      slower: countSlower,
      faster: countFaster,
      pauses: countPauses,
    },
  });

  let { index, textOrder } = req.cookies["Information"];
  index++; // mark this text passage as completed

  if (index >= texts.length) {
    res.cookie("Information", {
      textOrder,
      index,
      finished: true,
    });
    res.render("finished");
  } else {
    res.cookie("Information", {
      textOrder,
      index,
      finished: false,
    });
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
