let rsvpModule = (function () {
  let playing = false; //shows whether we are playing or not
  let index = 0; //at which word are we in the array
  let wpm; //wpm
  let interval; //the reference returned by the setInterval function, to stop or play
  //let speeds = [150, 250, 300, 450, 575, 675, 800]; //wpms
  let speedIndex = 0;

  let finished = false;
  let nextButton = document.getElementById("nextButton");

  let manual = false;

  let arrayOfWords = [];
  wordEl = document.getElementById("word"); //Html element that will display the words.

  wpmLabel = document.getElementById("wpmLabel");

  //init
  function init(words, wordsPerMinute) {
    arrayOfWords = words;
    wpm = wordsPerMinute;
  }

  function play() {
    if (playing) return;
    interval = setInterval(playerOn, (60 * 1000) / wpm); //calls the playerOn function according to the speed.
    playing = true;
    nextButton.style.display = "none";
  }

  function stop() {
    if (!playing) return;
    clearInterval(interval); //clears the interval
    playing = false;
    if (finished) {
      nextButton.style.display = "block";
    }
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
      wordEl.innerHTML = arrayOfWords[index];
      if (index == arrayOfWords.length - 1) {
        finished = true;
        nextButton.style.display = "block";
      }
    }
  }

  function rewind() {
    stop();
    if (index > 0) {
      index--;
      if (index == 0) {
        wordEl.innerHTML = arrayOfWords[0];
      } else {
        wordEl.innerHTML = arrayOfWords[index - 1];
      }
    }
  }

  function playerOn() {
    if (index >= arrayOfWords.length) {
      finished = true;
      stop();
    } else {
      wordEl.innerHTML = arrayOfWords[index];
      index++;
    }
  }

  //clicking on the word stops or resumes
  document.getElementsByClassName("mainReader")[0].onclick = function () {
    reset();
  };

  document.onkeydown = function (event) {
    switch (event.key) {
      case "ArrowUp":
        faster();
        break;
      case "ArrowDown":
        slower();
        break;
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

  function faster() {
    wpm += 10;
    updateLabel();
    adjustSpeed();
    // if (!manual) {
    //   //first time to adjust speed
    //   manual = true;
    //   speedsNr = speeds.length;
    //   for (let i = 0; i < speedsNr; i++) {
    //     if (wpm < speeds[i]) {
    //       wpm = speeds[i];
    //       speedIndex = i;
    //       updateLabel();
    //       adjustSpeed();
    //       break;
    //     }
    //   }
    // } else {
    //   speedIndex++;
    //   if (speedIndex < speeds.length) {
    //     wpm = speeds[speedIndex];
    //     updateLabel();
    //     adjustSpeed();
    //   } else {
    //     speedIndex = speeds.length - 1;
    //   }
    // }
  }

  function slower() {
    previousWpm = wpm;
    wpm -= 10;
    if (wpm < 100) {
      wpm = previousWpm;
    }
    updateLabel();
    adjustSpeed();
    // if (!manual) {
    //   //first time to adjust speed
    //   manual = true;
    //   speedsNr = speeds.length;
    //   for (let i = speedsNr-1; i >= 0; i--) {
    //     if (wpm > speeds[i]) {
    //       wpm = speeds[i];
    //       speedIndex = i;
    //       updateLabel();
    //       adjustSpeed();
    //       break;
    //     }
    //   }
    // } else {
    //   speedIndex--;
    //   if (speedIndex >= 0) {
    //     wpm = speeds[speedIndex];
    //     updateLabel();
    //     adjustSpeed();
    //   } else {
    //     speedIndex = 0;
    //   }
    // }
  }

  function adjustSpeed() {
    if (playing) {
      stop();
      play();
    }
  }

  function updateLabel() {
    wpmLabel.innerHTML = "Words/minute: " + wpm;
  }
  //self explanatory
  window.onload = function () {
    updateLabel();
    setTimeout(play, 600);
  };

  return {
    init: init,
  };
})();
