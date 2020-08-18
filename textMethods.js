const syll = require("syllable");

function interpolateScoreToSpeed(score) {
  // the couples are pairs with [score, speed]
  let couples = [
    [0, 100],
    [15, 150],
    [65, 400],
    [75, 500],
    [85, 600],
    [95, 675],
    [100, 700],
  ];

  // handle very small scores
  let [minScore, minSpeed] = couples[0];
  if (score < minScore) return minSpeed;

  // see whether the score falls between any of the couples
  for (let i = 0; i < couples.length - 1; i++) {
    let [currScore, currSpeed] = couples[i];
    let [nextScore, nextSpeed] = couples[i + 1];
    if (currScore <= score && score < nextScore) {
      let deltaSpeed = nextSpeed - currSpeed;
      let deltaScore = nextScore - currScore;
      return deltaSpeed * (score - currScore) / deltaScore + currSpeed;
    }
  }

  // if no score matched until now, it's an even larger score
  let [, maxSpeed] = couples[couples.length - 1];
  return maxSpeed;
}

function calculateComplexityScore(text) {
  let arrayOfWords = text.split(" ");
  let nrOfWords = arrayOfWords.length;

  // Sentences are delimited by .!? marks
  // that are NOT followed by a word character.
  const re = /[.!?](?!\w)/;
  const nrOfSentences = text.split(re).length - 1;

  // Count the syllables in the text.
  let nrOfSyllables = 0;
  arrayOfWords.forEach((word) => {
    nrOfSyllables += syll(word);
  });

  let asl = nrOfWords / nrOfSentences;
  let asw = nrOfSyllables / nrOfWords;

  let score = 206.835 - 1.015 * asl - 84.6 * asw;
  return score;
}

module.exports = {
  interpolate: interpolateScoreToSpeed,
  calculateComplexityScore,
};
