import { useState, useEffect } from 'preact/hooks';
import "../styles/Typewriter.css";

interface TypewriterProps {
    text: String;
    highlightedWords: String[];
    makeMistakes: boolean;
    mistakes: String[];
};

var textInProgress: String = "";
let hardenedTextIndex: number = 0;
let index: number = 0;
let turnaroundIndex: number;
let firstMistakeFoundAt: number;
let mistakeTyped: boolean = false;
let mistakeNoticed: boolean = false;
let moveBackwards: boolean = false;

export default function Typewriter(props: TypewriterProps) {
  const [textToDisplay, setTextToDisplay] = useState("");
  const [incrementer, setIncrementer] = useState(0);
  const [mistakeToUse, setMistakeToUse] = useState(props.mistakes[Math.floor(Math.random() * props.mistakes.length)]);

  function generateMistake() {
      let numberOfMistakes = Math.floor(Math.random() * (props.text.length / 5));
      let newString = props.text;
      for (var i = 0; i < numberOfMistakes; i++) {
          let mistakeIndex = Math.floor(Math.random() * newString.length);
          let mistakeLength = Math.floor(Math.random() * 4);
          let mistake = (Math.random() + 1).toString(36).substring(mistakeLength);
          newString = newString.slice(0, mistakeIndex) + mistake + newString.slice(mistakeIndex);
      }
      setMistakeToUse(newString);
      console.log("Mistake generated. " + newString);
  }
    function type() {
        if (!props.makeMistakes) {
            typeWithoutMistakes();
        } else {
            typeWithMistakes();
        }
    }

    function typeWithoutMistakes() {
      /*
        if (index < props.text.length) {
            setTextInProgress(props.text.slice(0, index + 1));
            setIndex(previousIndex => previousIndex + 1);
        } else {
            setTextInProgress(props.text.slice(0, index));
        }
        */
    }

    function typeWithMistakes() {
        //if (index < props.text.length) {
        if (index > props.text.length) index = props.text.length;
        if (props.text !== textInProgress) {
            typeNextCharacter();
        }
    }

    function typeNextCharacter() {
        console.log(index);
        console.log("typing next character, index is " + index + ", character at index is " + mistakeToUse[index]);
        if (mistakeTyped) {
            if (!mistakeNoticed) {
                const mistakeIsCaught: boolean = Math.floor(Math.random() * 100) < 20; // 1-in-5 chance that the mistake will be caught.
                mistakeNoticed = mistakeIsCaught;
                if (mistakeIsCaught || textInProgress.length === props.text.length) {
                  turnaroundIndex = index;
                  moveBackwards = true;
                  console.log("MISTAKE NOTICED: turnaround = " + turnaroundIndex + ", moving backwards");
                }
            }

            if (mistakeNoticed) {
                if (index === firstMistakeFoundAt) {
                  console.log("MISTAKE REMOVED: " + index + ", resuming forward motion")
                  moveBackwards = false;
                }
                if (moveBackwards) {
                  textInProgress = props.text.slice(0, hardenedTextIndex) +  textInProgress.slice(hardenedTextIndex, index - 1);
                  index--;
                } else {
                  if (index < turnaroundIndex) {
                    textInProgress = props.text.slice(0, hardenedTextIndex) +  props.text.slice(hardenedTextIndex, index + 1);
                    index++;
                  } else {
                    hardenedTextIndex = turnaroundIndex;
                    mistakeTyped = false;
                    mistakeNoticed = false;
                    turnaroundIndex = -1;
                    firstMistakeFoundAt = -1;
                    console.log("MISTAKE CORRECTED. HARDENED INDEX SITS AT " + hardenedTextIndex + ", HARDENED WORD SITS AT " + props.text.slice(0, hardenedTextIndex));
                  }
                }
            } else {
                textInProgress = props.text.slice(0, hardenedTextIndex) +  mistakeToUse.slice(hardenedTextIndex, index + 1);
                index++;
            } 
        } else {
            textInProgress = props.text.slice(0, hardenedTextIndex) +  mistakeToUse.slice(hardenedTextIndex, index + 1);
            if (props.text[index] !== textInProgress[index]) {
                console.log("MISTAKE FOUND: index " + index + ", " + props.text.slice(0, index + 1) + " != " + textInProgress.slice(0, index + 1));
                mistakeTyped = true;
                firstMistakeFoundAt = index;
            }
            index++;
        }

        setTextToDisplay(textInProgress);
        setIncrementer(i => i + 1);
    }

    useEffect(() => {
        //generateMistake();
        const timer = setTimeout(type, Math.random() * 150 + 80); // change to 50
        return () => clearTimeout(timer);
    }, [incrementer, props.text]);

    return (
        <>
            <h1>
                <span>{textToDisplay}</span>
                <span class="blink">_</span>
            </h1>
        </>
    );
}
