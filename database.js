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

const formDataSchema = new mongoose.Schema({
  passage: Number,
  answer: String,
  reading_duration: Number,
  interactions: { slower: Number, faster: Number, pauses: Number },
});

const formDataDB = new mongoose.model("answer", formDataSchema);

/** data must have shape:
 *
 *  ```
 *  { passage,
 *    answer,
 *    reading_duration,
 *    interactions: { slower, faster, pauses } }
 * ```
 */
function saveFormData(data) {
    new formDataDB(data).save();
}

module.exports = {
    saveFormData,
};
