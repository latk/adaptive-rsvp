# RSVP Improved

A live version of the project is available at <https://rsvp.latk.de>

## How to run (manual)

1. Install node.js (https://nodejs.org/en/download/)
1. Open terminal/cmd and cd into the project directory
1. Run the command "npm i" to install all dependencies
1. Start a MongoDB database and put the connection string into the `DATABASE` env variable
1. On the same command prompt after installing run the app with `node index.js`
1. Access the site on http://localhost:3000

## How to run (automatic)

1. Install Docker and Docker-compose
1. Run `docker-compose up --build`
   * this will automatically start a container with MongoDB
     and another container with the app
1. Access the site on http://localhost:3000

## Guide to the data

Study results & analysis is found in the `data/` directory.

The `texts.json` file is an export of the data in `texts.js`.
Text passages are identified by position.

The files `demographics.json`, `answers.json`, and `text-order.json`
are an export of the corresponding database collections.

Each participant was assigned a `uid` upon providing consent
and completing the demographics questionnaire.
The participant's text order is in the `text-order` collection.

The `demographics` contain background info on the subjects,
compare `views/demographic.ejs` for the corresponding questionnaire.

* `_id`, `__v`: ignore
* `uid`: participant id
* `date`: timestamp
* `ageRange`
* `englishLevel`
* `vision`
* `source`: whether participant was a student from the same course
* `rsvpExperience`
* `device`
* `light`

The `answers` contain participants interactions with each text snippet.

* `_id`, `__v`: ignore
* `uid`: participant ID
* `date`: timestamp
* `interactions`: counts for different interaction types
* `passage`: index into that user's text-order array
* `position`: unused
* `answer`: response to the comprehension question
* `readingDuration`: for the RSVP text including the question,
  excluding answering of the question

Associating the answer with a text is somewhat indirect. Roughly:

```
answer = ...
uid = answer.uid
textID = (textOrder WHERE textOrder.uid = uid)[answer.passage]
return texts[textID]
```

## License

Copyright 2020 Renis Fejzo, Lukas Atkinson, Louis-César Pagès, Bogdan Gabriel Halmaghi, Anik Saha

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
