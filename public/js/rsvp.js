// @ts-check
// eslint-env browser,es2017

class Timer {
  constructor() {
    this.start = performance.now();
  }

  elapsedMS() {
    return performance.now() - this.start;
  }
}

/**
 * Logic for an abstract RSVP reader, does not contain UI elements.
 *
 * States:
 *
 * * paused (initial)
 * * playing
 * * finished
 *
 * State transitions:
 *
 * * play: paused -> playing
 * * pause: playing -> paused, count this event
 * * stop: playing -> paused, do not count the event
 * * _advanceToNextToken: any -> any, but may reach the finished state
 */
export class RsvpModel {
  /**
   * Create a new RSVP model.
   *
   * Remember to call play() to start the playback.
   *
   * @param {object} config
   * @param {string[]} config.tokens the words to be shown
   * @param {number} config.wpm the initial speed
   * @param {(token: string) => void} config.onNewToken called to show each token
   * @param {(elapsedTimeMS: number) => void} config.onComplete called after the last token has been read
   * @param {(wpm: number) => void} config.onWpmChange called when the speed is changed
   */
  constructor({ tokens, wpm, onNewToken, onComplete, onWpmChange }) {
    this.tokens = tokens;
    this.wpm = wpm;
    this.playing = null;
    this.timer = null;
    this.tokenIndex = 0;
    this.onNewToken = onNewToken;
    this.onComplete = onComplete;
    this.onWpmChange = onWpmChange;

    this.counts = {
      slower: 0,
      faster: 0,
      pause: 0,
      forward: 0,
      rewind: 0,
    };

    // initialize the caller's state with the first word
    this._emitNewTokenEvent();
    // initialize the caller's state with the WPM display
    this.onWpmChange(wpm);
  }

  /**
   * true if no words remain to be read
   */
  isFinished() {
    return !(this.tokenIndex < this.tokens.length);
  }

  /**
   * calls the user-supplied callback with the current word
   */
  _emitNewTokenEvent() {
    let i = this.tokenIndex;
    // terminating token is "white square"
    let token = i < this.tokens.length ? this.tokens[i] : "\u25A1";
    this.onNewToken(token);
  }

  /**
   * move forward by one word, then _emitNewTokenEvent().
   *
   * If no words remain, stop() and emit onComplete().
   */
  _advanceToNextToken() {
    if (this.isFinished()) {
      this.stop();
      this.onComplete(this.timer.elapsedMS());
    } else {
      this.tokenIndex++;
      this._emitNewTokenEvent();
    }
  }

  /**
   * resume or start playing
   */
  play() {
    if (this.playing) return;
    let refreshEveryMS = (60 * 1000) / this.wpm;
    this.playing = setInterval(() => {
      this._advanceToNextToken();
    }, refreshEveryMS);
    if (!this.timer) this.timer = new Timer();
  }

  /**
   * stop playback but register it as a pause
   */
  pause() {
    if (!this.playing) return;
    this.counts.pause++;
    this.stop();
  }

  /**
   * stop playback
   */
  stop() {
    if (this.playing) {
      clearInterval(this.playing);
      this.playing = null;
    }
  }

  /**
   * toggle between play() and pause()
   */
  toggle() {
    if (this.playing) {
      this.pause();
    } else {
      this.play();
    }
  }

  _withSuspendedPlayback(callback) {
    if (this.playing) {
      this.stop();
      callback();
      this.play();
    } else {
      callback();
    }
  }

  /**
   * skip forward by one token
   */
  forward() {
    this.stop();
    this.counts.forward++;
    this._advanceToNextToken();
  }

  /**
   * skip backwards by one token
   */
  rewind() {
    this.stop();
    if (this.tokenIndex > 0) this.tokenIndex--;
    this.counts.rewind++;
    this._emitNewTokenEvent();
  }

  /**
   * increase playback speed
   */
  faster() {
    this._withSuspendedPlayback(() => {
      this.wpm += 10;
      this.counts.faster++;
      this.onWpmChange(this.wpm);
    });
  }

  /**
   * reduce playback speed
   */
  slower() {
    this._withSuspendedPlayback(() => {
      // never go below 100 WPM
      const newWpm = Math.max(100, this.wpm - 10);
      if (this.wpm == newWpm) return;
      this.wpm = newWpm;
      this.counts.slower++;
      this.onWpmChange(newWpm);
    });
  }
}

export class RsvpUI {
  /**
   * Initialize the RSVP UI in an existing `$container` DOM element.
   *
   * Remember to `unmount()` the UI afterwards.
   *
   * @param {object} args
   * @param {string[]} args.tokens
   * @param {number} args.defaultWpm
   * @param {HTMLElement} args.$container where the reader should be mounted
   * @param {({slower, faster, pause, forward, rewind, elapsedSeconds}) => void} args.onComplete
   */
  constructor({ tokens, defaultWpm, $container, onComplete }) {
    // prepare the container
    $container.classList.add("rsvp-container");
    while ($container.firstChild) {
      $container.removeChild($container.firstChild);
    }

    const addElem = (role) => {
      const $el = document.createElement("div");
      $el.classList.add(role);
      $container.appendChild($el);
      return $el;
    };

    const $word = addElem("rsvp-word");
    const $message = addElem("rsvp-message");
    const $wpmLabel = addElem("rsvp-label");

    $message.textContent = "press SPACE to start";

    const rsvp = new RsvpModel({
      tokens,
      wpm: defaultWpm,
      onNewToken: (word) => {
        $word.textContent = word;
      },
      onComplete: (elapsedMS) => {
        let elapsedSeconds = elapsedMS / 1000; // convert to seconds
        onComplete({ elapsedSeconds, ...rsvp.counts });
      },
      onWpmChange: (wpm) => {
        let delta = wpm - defaultWpm;
        let label;
        if (delta < 0) {
          label = "" + delta;
        } else if (delta > 0) {
          label = `+${delta}`;
        } else {
          label = `±0`;
        }
        $wpmLabel.textContent = `Speed: ${label}`;
      },
    });

    function updateMessage(isPlaying) {
      $message.textContent = isPlaying ? "" : "press SPACE to resume";
    }

    //clicking on the word stops or resumes
    const clickHandler = () => {
      rsvp.toggle();
      updateMessage(rsvp.playing);
    };

    // support keyboard controls
    const keyboardHandler = (event) => {
      switch (event.key) {
      case "ArrowUp":
        rsvp.faster();
        break;
      case "ArrowDown":
        rsvp.slower();
        break;
      case "ArrowLeft":
        rsvp.rewind();
        break;
      case " ":
        rsvp.toggle();
        updateMessage(rsvp.playing);
        break;
      case "ArrowRight":
        rsvp.forward();
        break;
      }
    };

    // mount event listeners
    $container.addEventListener('click', clickHandler);
    document.addEventListener('keydown', keyboardHandler);

    this.unmount = () => {
      document.removeEventListener('keydown', keyboardHandler);
      $container.removeEventListener('click', clickHandler);
      $container.removeChild($wpmLabel);
      $container.removeChild($message);
      $container.removeChild($word);
      $container.classList.remove("rsvp-container");
    };
  }
}
