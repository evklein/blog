import { useState, useEffect } from 'preact/hooks';
import "../styles/Typewriter.css";

interface TypewriterProps {
    text: String;
    highlightedWords: String[];
    makeMistakes: boolean;
    mistakes: String[];
};

export default function Typewriter(props: TypewriterProps) {
    const [textInProgress, setTextInProgress] = useState("");
    const [index, setIndex] = useState(0);
    const [hasTypedWrong, setHasTypedWrong] = useState(false);
    const [textUpToThisPoint, setTextUpInThisProgress] = useState("");
    const [mistakeToUse, setMistakeToUse] = props.mistakes[Math.floor(Math.random() * props.mistakes.length)];
    const [lastTurnaroundIndex, SetLastTurnaroundIndex] = useState(0); 
    
    function type() {
        if (!props.makeMistakes) {
            typeWithoutMistakes();
        } else {
            typeWithMistakes();
        }
    }

    function typeWithoutMistakes() {
        if (index < props.text.length) {
            setTextInProgress(props.text.slice(0, index + 1));
            setIndex(previousIndex => previousIndex + 1);
        } else {
            setTextInProgress(props.text.slice(0, index));
        }
    }

    // Hey, I'm Evan.
    // Hey, IUN'm Evan

    function typeWithMistakes() {

        if (index < props.text.length && props.text !== textInProgress) {
            if (props.text[index - 1] !== textInProgress[index - 1]) {
                const mistakesAreCaught: boolean = Math.floor(Math.random() * 100) < 20; // 1-in-5 chance that the mistake will be caught.
                if (mistakesAreCaught) {
                    setHasTypedWrong(true);
                    SetLastTurnaroundIndex(index);
                }
            } else {
                if (textInProgress === props.text.slice(0, index)) setHasTypedWrong(false);
            }

            if (!hasTypedWrong) {
                console.log(index + " Typing forwards... Mistake index is " + lastTurnaroundIndex);
                if (lastTurnaroundIndex > index) setTextInProgress(props.text.slice(0, index + 1));
                else setTextInProgress(mistakeToUse.slice(0, index + 1));
                setIndex(previousIndex => previousIndex + 1);
            } else { // Work backwards
                console.log("Typing backwards... ");
                setTextInProgress(mistakeToUse.slice(0, index - 1));
                setIndex(previousIndex => previousIndex - 1);
            }
        } else {
            setTextInProgress(props.text.slice(0, index));
        }
    }

    useEffect(() => {
        const timer = setTimeout(type, Math.random() * 150 + 100); // change to 50
        return () => clearTimeout(timer);
    }, [index, props.text]);

    return (
        <>
            <h1>
                <span>{textInProgress}</span>
                <span class="blink">|</span>
            </h1>
        </>
    );
}
