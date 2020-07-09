const express = require("express");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const { Collection } = require("mongoose");
//Express is a package that makes server side a lot easier.
const app = express();

let textArray = require("./texts");
let textMethods = require("./textMethods");

app.use(cookieParser()); // To access cookies quickly

let texts = [
  { text: textArray[0], form: 1, automaticSpeed: true },
  { text: textArray[1], form: 2, automaticSpeed: true },
  { text: textArray[2], form: 3, automaticSpeed: true },
  { text: textArray[3], form: 4, automaticSpeed: true },
  { text: textArray[4], form: 5, automaticSpeed: true },
  { text: textArray[5], form: 6, automaticSpeed: true },
];
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

//Main route, this function is executed when the user goes on the main URL (In our case localhost:3000)
app.get("/", function (req, res) {
  res.cookie("Information", information); //Creates Cookie With all data inside

  //When the user goes on / then render the main.ejs file(found on views.)
  res.render("main", { initText: texts[0].text });
});

//same logic for /about
app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/form", function (req, res) {
  res.render("form");
});

//this one is executed when a post request is passed through to this route (/reader) from a form on our case
app.get("/reader", function (req, res) {
  let cookie = req.cookies["Information"];
  let readingFinished = cookie.finished;
  if (!readingFinished) {
    let textIndex = cookie.index;
    let inputText = cookie.texts[textIndex].text; // Text we are reading at the moment
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

    res.render("reader", { arrayOfWords: arrayOfWords, speed: speed, form: formNr }); //renders  reader.ejs and passes an array with the name arrayOfWords to the file
  }
});

app.get("/form/:formNr", function(req,res){
  let formNr = req.params.formNr;
  res.render("forms/form" + formNr, {formNr: formNr});
})

app.post("/formHandler", function (req, res) {
  console.log("This form is form nr: " + req.body.formNr);
  console.log(req.body.question1);
  
  
  let cookie = req.cookies["Information"];
  let index = cookie.index + 1;
  let array = cookie.texts;
  let finished = cookie.finished;

  let textsLength = array.length;
  if (index >= textsLength) {
    finished = true;
    res.cookie("Information", { texts: array, index: index, finished: finished });
    res.render("finished");
  } else {
    res.cookie("Information", { texts: array, index: index, finished: finished });
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
