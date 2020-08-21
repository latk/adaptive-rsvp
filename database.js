const mongoose = require("mongoose");

const DATABASE =
  process.env.DATABASE ||
  "mongodb+srv://admin_renis:" +
    "renishis" +
    "@cluster0-ervkr.mongodb.net/RSPV_Data?retryWrites=true&w=majority";

mongoose.connect(DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}); // Online conection with my Mongo database online

const answerSchema = new mongoose.Schema({
  uid: String,
  date: Date,
  passage: Number,
  position: Number,
  answer: String,
  readingDuration: Number,
  interactions: {
    slower: Number,
    faster: Number,
    pause: Number,
    forward: Number,
    rewind: Number,
  },
});

const demographicSchema = new mongoose.Schema({
  uid: String,
  date: Date,
  ageRange: String,
  englishLevel: String,
  vision: String,
  source: String,
  rsvpExperience: String,
  device: String,
  light: String,
});

const Answer = new mongoose.model("Answer", answerSchema);
const Demographic = new mongoose.model("Demographic", demographicSchema);

/** save an answer to the text snippet comprehension question, including interaction statistics
 *
 * @param {object} answer
 * @param {string} answer.uid
 * @param {Date}   answer.date
 * @param {number} answer.passage
 * @param {number} answer.position
 * @param {string} answer.answer (yes or no)
 * @param {number} answer.readingDuration (in seconds)
 * @param {object} answer.interactions
 * @param {number} answer.interactions.slower
 * @param {number} answer.interactions.faster
 * @param {number} answer.interactions.pause
 * @param {number} answer.interactions.forward
 * @param {number} answer.interactions.rewind
 */
async function saveAnswer(answer) {
  await new Answer(answer).save();
}

async function getAllAnswers() {
  const answers = await Answer.find({});
  return answers.map((model) => model.toObject());
}

/**
 * save demographic background data
 *
 * @param {object} demographic
 * @param {string} demographic.uid;
 * @param {Date}   demographic.date;
 * @param {string} demographic.ageRange;
 * @param {string} demographic.englishLevel;
 * @param {string} demographic.vision;
 * @param {string} demographic.source;
 * @param {string} demographic.rsvpExperience;
 * @param {string} demographic.device;
 * @param {string} demographic.light;
 */
async function saveDemographic(demographic) {
  await new Demographic(demographic).save();
}

async function getAllDemographics() {
  const answers = await Demographic.find({});
  return answers.map((model) => model.toObject());
}

module.exports = {
  saveAnswer,
  getAllAnswers,
  saveDemographic,
  getAllDemographics,
};
