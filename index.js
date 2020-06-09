const express = require("express");
const mongoose = require("mongoose"); //not yet put to work, it works as a framework for MongoDB
const bodyParser = require("body-parser");

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

//this one is executed when a post request is passed through to this route (/reader) from a form on our case
app.post("/reader", function (req, res) {
  //Here is where the magic will happen/happens.

  let inputText = "As the US reopens in phases, more and more jobs are being " +
  "added back to the economy. Unemployment officially fell to 13.3% in May " +
  "as employers added 2.5 million jobs, the best month for job growth since the " +
  "Bureau of Labor Statistics started tracking the data in 1939. The Labor " +
  "Department noted that during the pandemic, millions of workers were " +
  "misclassified as employed but not at work, when they should have been " +
  "counted as unemployed on temporary layoff. If it weren't for those " +
  "misclassifications, the unemployment rate would have been higher — around " +
  "19.2% in April and 16.1% in May, not including seasonal adjustments. " +
  "From retail to restaurants across America, people are returning to their " +
  "old jobs or finding new ones. Here are the occupations that reported the " +
  "most gains:";

  //gets the data from the form req.body(request body).Name of the variable on this case inputText(text from user)


  let arrayOfWords = inputText.split(" "); //creates an array with all the words from the user text

  let arrayOfWordObjects = []; // This array will keep all Word Objects, which will contain the word and the word complexity.


  arrayOfWords.forEach(function (word) {
    let el = {
      word: word,
      complexity: 1, //for the moment we have no function to calculate the complexity of the word, so all we do is pass a dummy value
    };
    arrayOfWordObjects.push(el); //adds this new word object to our array
  });
  res.render("reader", { arrayOfWords: arrayOfWordObjects }); //renders  reader.ejs and passes an array with the name arrayOfWords to the file
});

app.listen(3000, () => console.log("The application started on port 3000"));
