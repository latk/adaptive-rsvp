const express = require("express");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
//Express is a package that makes server side a lot easier.
const app = express();

let textArray = require("./texts");
let textMethods = require("./textMethods");
const e = require("express");

app.use(cookieParser()); // To access cookies quickly

let texts = [
  { text: 0, form: 1, automaticSpeed: true },
  { text: 1, form: 2, automaticSpeed: true },
  { text: 2, form: 3, automaticSpeed: true },
  { text: 3, form: 4, automaticSpeed: true },
  { text: 4, form: 5, automaticSpeed: true },
  { text: 5, form: 6, automaticSpeed: true },
]; // text shows the index on the text Array
shuffle(texts);

let information = { texts: texts, index: 0, finished: false }; //cookie Information, index shows on which text are we.

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

/* DATABASE PART */
mongoose.connect(
  "mongodb+srv://admin_renis:" +
    "renishis" +
    "@cluster0-ervkr.mongodb.net/RSPV_Data?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
); // Online conection with my Mongo database online

const formDataSchema = new mongoose.Schema({
  passage: Number,
  answer: String,
  reading_duration: Number,
  interactions: { slower: Number, faster: Number, pauses: Number },
});

const formDataDB = new mongoose.model("answer", formDataSchema);

/* END DB */

//Main route, this function is executed when the user goes on the main URL (In our case localhost:3000)
app.get("/", function (req, res) {
  res.cookie("Information", information); //Creates Cookie With all data inside

  let textNr = texts[0].text;
  let inputText = textArray[textNr]
  //When the user goes on / then render the main.ejs file(found on views.)
  res.render("main", { initText: inputText });
});

//same logic for /about
app.get("/about", function (req, res) {
  res.render("about");
});

//this one is executed when a post request is passed through to this route (/reader) from a form on our case
app.get("/reader", function (req, res) {
  let cookie = req.cookies["Information"];
  let readingFinished = cookie.finished;
  if (!readingFinished) {
    let textIndex = cookie.index;
    let textNr = cookie.texts[textIndex].text;
    let inputText = textArray[textNr] // Text we are reading at the moment
    let automatic = cookie.texts[textIndex].automaticSpeed;
    let formNr = cookie.texts[textIndex].form;

    let arrayOfWords = inputText.split(" "); //creates an array with all the words from the user text

    let speed = 300;
    if (automatic) {
      let textComplexityScore = Math.round(
        textMethods.calculateComplexityScore(inputText)
      );
      speed = textMethods.interpolate(textComplexityScore);
      console.log(
        "Complexity Score = " +
          textComplexityScore +
          "\nAutomated Speed = " +
          speed
      );
    }

    res.render("reader", {
      arrayOfWords: arrayOfWords,
      speed: speed,
      form: formNr,
    }); //renders  reader.ejs and passes an array with the name arrayOfWords to the file
  } else {
    res.render("finished");
  }
});

app.get("/form/:formNr", function (req, res) {
  let formNr = req.params.formNr;
  let countFaster = req.query.cf;
  let countSlower = req.query.cs;
  let countPauses = req.query.cp;
  let time = req.query.t;

  res.render("forms/form" + formNr, {
    formNr: formNr,
    countFaster: countFaster,
    countSlower: countSlower,
    time: time,
    countPauses: countPauses,
  });
});

app.post("/formHandler", function (req, res) {
  /*
      Work with form data

  */
  let passage = req.body.formNr;
  let countFaster = req.body.countFaster;
  let countSlower = req.body.countSlower;
  let countPauses = req.body.countPauses;
  let time = req.body.time;
  let answer = req.body.question;

  let dataToDb = new formDataDB({
    passage: passage,
    answer: answer,
    reading_duration: time,
    interactions: {
      slower: countSlower,
      faster: countFaster,
      pauses: countPauses,
    },
  });

  dataToDb.save();

  let cookie = req.cookies["Information"];
  let index = cookie.index + 1;
  let array = cookie.texts;
  let finished = cookie.finished;

  let textsLength = array.length;
  if (index >= textsLength) {
    finished = true;
    res.cookie("Information", {
      texts: array,
      index: index,
      finished: finished,
    });
    res.render("finished");
  } else {
    res.cookie("Information", {
      texts: array,
      index: index,
      finished: finished,
    });
    res.redirect("/reader");
  }
});

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}
app.listen(3000, () => console.log("The application started on port 3000"));
