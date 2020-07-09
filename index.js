const express = require("express");
const bodyParser = require("body-parser");
const syll = require("syllable");

let couples = [
  [0, 100],
  [15, 150],
  [25, 200],
  [35, 250],
  [45, 300],
  [55, 350],
  [65, 400],
  [75, 500],
  [85, 600],
  [95, 675],
  [100, 700],
];
//Express is a package that makes server side a lot easier.
const app = express();

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
  //When the user goes on / then render the main.ejs file(found on views.)
  res.render("main");
});

//same logic for /about
app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/form", function (req, res) {
  res.render("form");
});

//this one is executed when a post request is passed through to this route (/reader) from a form on our case
app.post("/reader", function (req, res) {
  //Here is where the magic will happen/happens.

  let inputText = req.body.inputText;

  //gets the data from the form req.body(request body).Name of the variable on this case inputText(text from user)

  let arrayOfWords = inputText.split(" "); //creates an array with all the words from the user text

  let textComplexityScore = Math.round(calculateComplexityScore(inputText));
  let automatedSpeed = interpolate(textComplexityScore);
  console.log(
    "Complexity Score = " +
      textComplexityScore +
      "\nAutomated Speed = " +
      automatedSpeed
  );

  res.render("reader", { arrayOfWords: arrayOfWords }); //renders  reader.ejs and passes an array with the name arrayOfWords to the file
});

function interpolate(score) {
  let i, j, x;
  if (score >= 95) {
    i = 10;
  } else if (score >= 85 && score < 95) {
    i = 9;
  } else if (score >= 75 && score < 85) {
    i = 8;
  } else if (score >= 65 && score < 75) {
    i = 7;
  } else if (score >= 55 && score < 65) {
    i = 6;
  } else if (score >= 45 && score < 55) {
    i = 5;
  } else if (score >= 35 && score < 45) {
    i = 4;
  } else if (score >= 25 && score < 35) {
    i = 3;
  } else if (score >= 15 && score < 25) {
    i = 2;
  } else {
    i = 1;
  }
  j = i - 1;

  firstSpeed = couples[i][1];
  secondSpeed = couples[j][1];
  firstScore = couples[i][0];
  secondScore = couples[j][0];

  x =
    ((firstSpeed - secondSpeed) * (score - secondScore)) /
      (firstScore - secondScore) +
    secondSpeed;

  return x;
}

function calculateComplexityScore(text) {
  let arrayOfWords = text.split(" ");
  nrOfWords = arrayOfWords.length;
  const re = /[.!?]/;
  const nrOfSentences = text.split(re).length - 1;
  let nrOfSyllables = 0;

  arrayOfWords.forEach(function (word) {
    let s = syll(word);
    nrOfSyllables = nrOfSyllables + s;
  });

  let asl = nrOfWords / nrOfSentences;
  let asw = nrOfSyllables / nrOfWords;

  let score = 206.835 - 1.015 * asl - 84.6 * asw;
  return score;
}

//this one is executed when the evaluationForm has been filled
app.post("/form", function (req, res) {
  res.render("form");
});

app.listen(3000, () => console.log("The application started on port 3000"));
