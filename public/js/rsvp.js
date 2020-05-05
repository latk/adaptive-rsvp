let rsvpModule = (function() {
    // Third-grade students = 150 words per minute (wpm)
    // Eight grade students = 250
    // Average college student = 450
    // Average “high level exec” = 575
    // Average college professor = 675
    // Speed readers = 1,500
    // World speed reading champion = 4,700
    // Average adult: 300 wpm
    //input from browser
    let wordEl ,slider, wpmLabel; //the slider and label for wpm 
    
    //private variables
    let playing = false; //shows whether we are playing or not
    let index = 0; //at which word are we in the array
    let wpm = 300; //wpm
    let interval; //the reference returned by the setInterval function, to stop or play
    let speeds = [150,250,300,450,575,675,800]; //wpms

    //public variables
    let arrayOfWords = [];//(<%- JSON.stringify(arrayOfWords) %>); //This line took me 3 hours, just because of the JSON.stringify() func

    //private methods
    function play(){
        if(playing) return;
        interval = setInterval(playerOn, (60 * 1000 / wpm)); //calls the playerOn function according to the speed.
        playing = true;
    }

    function stop(){
        if(!playing) return;
        clearInterval(interval); //clears the interval
        playing = false;
    }
  
    function reset(){
        index=0;
        if(playing){
            stop();
        }
        else{
            play();
        }
    }

    function forward(){
        if(index < (arrayOfWords.length - 1)){
            index++;
            wordEl.innerHTML = arrayOfWords[index].word;
        }
    }

    function rewind(){
        stop();
        if(index > 0)
        {
            index--;
            wordEl.innerHTML = arrayOfWords[index].word;
        }
    }

    function updateSpeed(){
        wpm = speeds[slider.value]; //slider has values from 0 - 6, the indexes of the array
        wpmLabel.innerHTML = "Words/minute: " + wpm;
        if(playing)
        {
          stop();
          play();
        }
    }

    function playerOn(){
        if(index >= arrayOfWords.length){
            stop();
        }
        else{
            wordEl.innerHTML = arrayOfWords[index].word;
            index++;
        }
    }
    //public method
    function intialSetup(document,window,words) {
        arrayOfWords=words;
        wordEl = document.getElementById("word");
        slider = document.getElementById("range");
        wpmLabel = document.getElementById("wpmLabel");

        //clicking on the word stops or resumes
        document.getElementsByClassName("mainReader")[0].onclick = function()
        {
            reset();
        }

        //self explanatory
        document.onkeydown = function(event){
            switch(event.key)
            {
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
        }

        window.onload = function () {
            wpmLabel.innerHTML = "Words/minute: " + wpm;
            setTimeout(play, 600);
        };

        slider.onchange = updateSpeed;
    }
  
    return {
        intialSetup:intialSetup
    };
  })();