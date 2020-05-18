let rsvpModule = (function () {
  // Third-grade students = 150 words per minute (wpm)
  // Eight grade students = 250
  // Average college student = 450
  // Average “high level exec” = 575
  // Average college professor = 675
  // Speed readers = 1,500
  // World speed reading champion = 4,700
  // Average adult: 300 wpm

  let playing = false; //shows whether we are playing or not
  let index = 0; //at which word are we in the array
  let wpm = 300; //wpm
  let interval; //the reference returned by the setInterval function, to stop or play
  let speeds = [150, 250, 300, 450, 575, 675, 800]; //wpms

  let arrayOfWords = []; //(<%- JSON.stringify(arrayOfWords) %>); //This line took me 3 hours, just because of the JSON.stringify() func
  wordEl = document.getElementById("word"); //Html element that will display the words.
  slider = document.getElementById("range"); //Html slider element
  slider.onchange = updateSpeed;
  wpmLabel = document.getElementById("wpmLabel");

  // OPV Implemented by Louis
  opvCheckBox = document.getElementById("OPV"); //obtain the HTML element
  opvCheckBox.onclick = opvTriggered;

  //OPV Function implemented by Louis
  function opvTriggered() {
    // If the opv is checked, apply appropriate margin
    if (opvCheckBox.checked && wordEl.offsetWidth > 150) {
      wordEl.style.margin =
        "0 0 0 10%"; /*Optimal reading point for long words. */
      /* I will seek for a more "dynamic" way to do this ...*/
    } else {
      wordEl.style.margin = "0";
    }
  }

  //init
  function setWords(words) {
    arrayOfWords = words;
  }

  function play() {
    if (playing) return;
    interval = setInterval(playerOn, (60 * 1000) / wpm); //calls the playerOn function according to the speed.
    playing = true;
  }

  function stop() {
    if (!playing) return;
    clearInterval(interval); //clears the interval
    playing = false;
  }

  function reset() {
    if (playing) {
      stop();
    } else {
      play();
    }
  }

  function forward() {
    stop();
    if (index < arrayOfWords.length - 1) {
      index++;
      wordEl.innerHTML = arrayOfWords[index].word;
    }
    opvTriggered();
  }

  function rewind() {
    stop();
    if (index > 0) {
      index--;
      if (index == 0) {
        wordEl.innerHTML = arrayOfWords[0].word;
      } else {
        wordEl.innerHTML = arrayOfWords[index - 1].word;
      }
    }
    opvTriggered();
  }

  function updateSpeed() {
    wpm = speeds[slider.value]; //slider has values from 0 - 6, the indexes of the array
    wpmLabel.innerHTML = "Words/minute: " + wpm;
    if (playing) {
      stop();
      play();
    }
  }

  function playerOn() {
    if (index >= arrayOfWords.length) {
      stop();
    } else {
      wordEl.innerHTML = arrayOfWords[index].word;
      index++;
    }
    opvTriggered();
  }

  //clicking on the word stops or resumes
  document.getElementsByClassName("mainReader")[0].onclick = function () {
    reset();
  };

  document.onkeydown = function (event) {
    switch (event.key) {
      case "ArrowLeft":
        rewind();
        break;
      case " ":
        reset();
        break;
      case "ArrowRight":
        forward();
        break;
    }
  };
  //self explanatory
  window.onload = function () {
    wpmLabel.innerHTML = "Words/minute: " + wpm;
    setTimeout(play, 600);
  };

  return {
    setWords: setWords,
  };
})();
