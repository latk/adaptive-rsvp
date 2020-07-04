const express = require("express");
const bodyParser = require("body-parser");
const syll = require("syllable");

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
  

  console.log(calculateComplexityScore(inputText));
  




  res.render("reader", { arrayOfWords: arrayOfWords }); //renders  reader.ejs and passes an array with the name arrayOfWords to the file
});

function calculateComplexityScore(text)
{
  let arrayOfWords = text.split(" ");
  nrOfWords = arrayOfWords.length;
  const re = /[.!?]/;
  const nrOfSentences = text.split(re).length - 1;
  let nrOfSyllables = 0;

  arrayOfWords.forEach(function(word){
    let s = syll(word);
    nrOfSyllables = nrOfSyllables + s;
  });

  let asl = nrOfWords/nrOfSentences;
  let asw = nrOfSyllables/nrOfWords;

  let score = 206.835 - (1.015 * asl ) - (84.6 * asw);
  return score;

}


//this one is executed when the evaluationForm has been filled
app.post("/form", function (req, res) {});

app.listen(3000, () => console.log("The application started on port 3000"));
