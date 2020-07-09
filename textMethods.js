const syll = require("syllable");

function interpolate(score) {
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


  module.exports = {interpolate: interpolate, calculateComplexityScore: calculateComplexityScore};