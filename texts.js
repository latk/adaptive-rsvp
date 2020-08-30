// @ts-check

const { interpolate, calculateComplexityScore } = require("./textMethods.js");

/**
 * @typedef {{text: string, question: string, expectedAnswer: ('yes' | 'no'), words: number, score: number, speed: number, automaticSpeed: boolean}} Entry
 */

/**
 * @type {Entry[]}
 */
let texts = [];

/**
 * Add a text snippet to the `texts` array.
 *
 * @param {object} args
 * @param {string} args.text
 * @param {string} args.question
 * @param {('yes' | 'no')} args.expectedAnswer
 */
const addText = ({ text, question, expectedAnswer }) => {
  let fullText = `${text} Question: ${question}`;
  let words = fullText.split(/\s+/).length;
  let score = calculateComplexityScore(fullText);
  let speed = interpolate(score);
  texts.push({
    text,
    question,
    expectedAnswer,
    words,
    score,
    speed,
    automaticSpeed: undefined,
  });
};

addText({
  text:
    "Businesses today routinely keep track of large amounts of both financial and non-financial information. Sales departments keep track of current and potential customers; marketing departments keep track of product details and regional demographics; accounting departments keep track of financial data and issue reports. To be useful, all this data must be organized into a meaningful and useful system. Such a system is called a management information system, abbreviated MIS. The financial hub of the MIS is accounting. Accounting is the information system that records, analyzes, and reports economic transactions, enabling decision makers to make informed choices when allocating scarce economic resources. It is a tool that enables the user, whether a business entity or an individual, to make wiser, more informed economic choices. It is an aid to planning, controlling, and evaluating a broad range of activities. A financial accounting system is intended for use by both the management of an organization and those outside the organization.",
  question:
    "Is a financial accounting system only intended for use inside of an organization?",
  expectedAnswer: "no",
});

addText({
  text:
    "Coral reefs are among the most diverse and productive ecosystems on Earth. Consisting of both living and non-living components, this type of ecosystem is found in the warm, clear, shallow waters of tropical oceans worldwide. The functionality of the reefs ranges from providing food and shelter to fish and other forms of marine life to protecting the shore from the ill effects of erosion and putrefaction. In fact, reefs actually create land in tropical areas by formulating islands and contributing mass to continental shorelines. Although coral looks like a plant, it is mainly comprised of the limestone skeleton of a tiny animal called a coral polyp. While corals are the main components of reef structure, they are not the only living participants. Coralline algae cement the myriad corals, and other miniature organisms such as tubeworms and mollusks contribute skeletons to this dense and diverse structure. Together, these living creatures construct many different types of tropical reefs.",
  question: "Do coral reefs consist entirely of living components?",
  expectedAnswer: "no",
});

addText({
  text:
    "Mental and physical health professionals may consider referring clients and patients to a music therapist for a number of reasons. It seems a particularly good choice for the social worker who is coordinating a client’s case. Music therapists use music to establish a relationship with the patient and to improve the patient’s health, using highly structured musical interactions. Patients and therapists may sing, play instruments, dance, compose, or simply listen to music. The course of training for music therapists is comprehensive. In addition to formal musical and therapy training, music therapists are taught to discern what kinds of interventions will be most beneficial for each individual patient. Because each patient is different and has different goals, the music therapist must be able to understand the patient’s situation and choose the music and activities that will do the most toward helping the patient achieve his or her goals. The referring social worker can help this process by clearly communicating each client’s history. Although patients may develop their musical skills, that is not the main goal of music therapy. Any client who needs particular work on communication or on academic, emotional, and social skills, and who is not responding to traditional therapy, is an excellent candidate for music therapy.",
  question:
    "Would a patient who is not responding to traditional therapy be an excellent candidate for music therapy?",
  expectedAnswer: "yes",
});

addText({
  text:
    "An ecosystem is a group of animals and plants living in a specific region and interacting with one another and with their physical environment. Ecosystems include physical and chemical components, such as soils, water, and nutrients that support the organisms living there. These organisms may range from large animals to microscopic bacteria. Ecosystems also can be thought of as the interactions among all organisms in a given habitat; for instance, one species may serve as food for another. People are part of the ecosystems where they live and work. Human activities can harm or destroy local ecosystems unless actions such as land development for housing or businesses are carefully planned to conserve and sustain the ecology of the area. An important part of ecosystem management involves finding ways to protect and enhance economic and social well-being while protecting local ecosystems.",
  question: "Are animals part of an ecosystem?",
  expectedAnswer: "yes",
});

addText({
  text:
    "On February 3, 1956, Autherine Lucy became the first African-American student to attend the University of Alabama, although the dean of women refused to allow Autherine to live in a university dormitory. White students rioted in protest of her admission, and the federal government had to assume command of the Alabama National Guard in order to protect her. Nonetheless, on her first day in class, Autherine bravely took a seat in the front row. She remembers being surprised that the professor of the class appeared not to notice she was even in class. Later, she would appreciate his seeming indifference, as he was one of only a few professors to speak out in favor of her right to attend the university. For protection, Autherine was taken in and out of classroom buildings by the back door and driven from class to class by an assistant to the university president. The students continued to riot, and one day, the windshield of the car she was in was broken. University officials suspended her, saying it was for her own safety. When her attorney issued a statement in her name protesting her suspension, the university used it as grounds for expelling her for insubordination. Although she never finished her education at the University of Alabama, Autherine Lucy’s courage was an inspiration to African-American students who followed her lead and desegregated universities all over the United States.",
  question:
    "Did Autherine Lucy become the first African-American student to attend the University of North Carolina?",
  expectedAnswer: "no",
});

addText({
  text:
    "Firefighters are often asked to speak to school and community groups about the importance of fire safety, particularly fire prevention and detection. Because smoke detectors reduce the risk of dying in a fire by half, firefighters often provide audiences with information on how to install these protective devices in their homes. Specifically, they tell them these things: A smoke detector should be placed on each floor of a home. While sleeping, people are in particular danger of an emergent fire, and there must be a detector outside each sleeping area. A good site for a detector would be a hallway that runs between living spaces and bedrooms. Detectors should not be mounted near windows, exterior doors, or other places where drafts might direct the smoke away from the unit. Nor should they be placed in kitchens and garages, where cooking and gas fumes are likely to cause false alarms.",
  question: "Should a smoke detector be placed on each floor of a home?",
  expectedAnswer: "yes",
});

addText({
  text:
    "Saving energy means saving money. Homeowners and renters know this basic fact, but they often don’t know what kinds of adjustments they can make in their homes and apartments that will result in savings. For those willing to spend some time and money to reap long-term energy savings, an energy audit is the way to go. An energy auditor will come into your home and assess its energy efficiency. The auditor will pinpoint areas of your home that use the most energy and offer solutions to lower your energy use and costs. Trained energy auditors know what to look for and can locate a variety of flaws that may be resulting in energy inefficiency, including inadequate insulation, construction flaws, and uneven heat distribution. There are quicker and less costly measures that can be taken as well. One way to save money is to replace incandescent lights with fluorescents. This can result in a savings of more than 50% on your monthly lighting costs.",
  question:
    "Can replacing incandescent lights with fluorescents result in savings of more than 50% on your monthly lighting costs?",
  expectedAnswer: "yes",
});

addText({
  text:
    "Today, bicycles are elegantly simple machines that are common around the world. Many people ride bicycles for recreation, whereas others use them as a means of transportation. The first bicycle, called a draisienne, was invented in Germany in 1818 by Baron Karl de Drais de Sauerbrun. Because it was made of wood, the draisienne wasn’t very durable nor did it have pedals. Riders moved it by pushing their feet against the ground. In 1839, Kirkpatrick Macmillan, a Scottish blacksmith, invented a much better bicycle. Macmillan’s machine had tires with iron rims to keep them from getting worn down. He also used foot-operated cranks, similar to pedals, so his bicycle could be ridden at a quick pace. It didn’t look much like the modern bicycle, though, because its back wheel was substantially larger than its front wheel. Although Macmillan’s bicycles could be ridden easily, they were never produced in large numbers.",
  question: "Was the first bicycle invented in France?",
  expectedAnswer: "no",
});

addText({
  text:
    "Millions of people in the United States are affected by eating disorders. More than 90% of those afflicted are adolescents or young adult women. Although all eating disorders share some common manifestations, anorexia nervosa, bulimia nervosa, and binge eating each have distinctive symptoms and risks. People who intentionally starve themselves (even while experiencing severe hunger pains) suffer from anorexia nervosa. The disorder, which usually begins around the time of puberty, involves extreme weight loss to at least 15% below the individual’s normal body weight. Many people with the disorder look emaciated but are convinced they are overweight. In patients with anorexia nervosa, starvation can damage vital organs such as the heart and brain. To protect itself, the body shifts into slow gear: Menstrual periods stop, blood pressure rates drop, and thyroid function slows. Excessive thirst and frequent urination may occur. Dehydration contributes to constipation, and reduced body fat leads to lowered body temperature and the inability to withstand cold. Mild anemia, swollen joints, reduced muscle mass, and light-headedness also commonly occur in anorexia nervosa.",
  question: "Is eating disorder a rare disease in the USA?",
  expectedAnswer: "no",
});

addText({
  text:
    "There are two types of diabetes, insulin dependent and non-insulin-dependent. Between 90–95% of the estimated 13–14 million people in the United States with diabetes have non-insulin dependent, or Type II, diabetes. Because this form of diabetes usually begins in adults over the age of 40 and is most common after the age of 55, it used to be called adult-onset diabetes. Its symptoms often develop gradually and are hard to identify at first; therefore, nearly half of all people with diabetes do not know they have it. For instance, someone who has developed Type II diabetes may feel tired or ill without knowing why. This can be particularly dangerous because untreated diabetes can cause damage to the heart, blood vessels, eyes, kidneys, and nerves. While the causes, short-term effects, and treatments of the two types of diabetes differ, both types can cause the same long term health problems.",
  question:
    "Are the two types of diabetes called ’insulin dependent’ and ’non-insuling-dependent’?",
  expectedAnswer: "yes",
});

// Before exporting, assign whether to use automatic speed.
// We do this in a manner that ensures roughly equal complexity scores in each group.
// First, sort by complexity, then pair two consecutive elements,
// then randomly assign which text of the pair gets to use automatic speed.
// To ensure reproducibility, a sequence of random decisions is hardcoded.
// Actually not quite random, the decisions were adapted to get fairly equal average scores.
texts.sort((a, b) => a.score - b.score);
if (texts.length % 2 != 0) throw "texts array must have even size";
let coinflip = [true, true, true, false, false];
for (let i = 0; i < texts.length; i += 2) {
  let [a, b] = [texts[i], texts[i + 1]];
  [a.automaticSpeed, b.automaticSpeed] = coinflip[i / 2]
    ? [true, false]
    : [false, true];
}

/**
 * Utility function to calculate quality metrics of the automatic/manual distribution
 */
function qualityMetrics() {
  let auto = [];
  let manual = [];
  for (let entry of texts) {
    (entry.automaticSpeed ? auto : manual).push(entry);
  }
  auto.sort((entry) => entry.score);
  manual.sort((entry) => entry.score);

  /**
   * @param {Entry[]} group
   */
  const stats = (group) => {
    const scores = group.map((entry) => entry.score);
    return {
      scores: scores.reduce((object, score, i) => {
        const firstWord = group[i].text.split(/\s+/)[0];
        object[firstWord] = score;
        return object;
      }, {}),
      min: scores[0],
      max: scores[scores.length - 1],
      mean: scores.reduce((a, b) => a + b) / scores.length,
      expectedYesRatio:
        group.filter((entry) => entry.expectedAnswer === "yes").length /
        group.length,
      longestWords: group.map(
        (entry) =>
          entry.text.split(/\s+/).sort((a, b) => b.length - a.length)[0]
      ),
    };
  };

  return {
    auto: stats(auto),
    manual: stats(manual),
  };
}

module.exports = {
  texts,
  qualityMetrics,
};
