import { useState, useEffect, useRef } from 'preact/hooks';
import "../styles/typewriter.css";

interface Typewriter2Props {
    text: string;
    alternateTexts: string[];
};

export default function Typewriter2(props: Typewriter2Props) {
    const [displayText, setDisplayText] = useState('');
    const [completed, setCompleted] = useState(false);
    const intervalIdRef = useRef(0);
    const displayTextRef = useRef(displayText);

    // Update the ref whenever displayText changes
    useEffect(() => {
        displayTextRef.current = displayText;
    }, [displayText]);

    useEffect(() => {
        function typeNextCharacter() {
            let numberOfCharactersTyped = displayTextRef.current.length;
            if (numberOfCharactersTyped === props.text.length) {
                setCompleted(true);
                clearInterval(intervalIdRef.current);
            } else {
                setDisplayText(props.text.slice(0, numberOfCharactersTyped + 1));
            }
        }

        intervalIdRef.current = setInterval(typeNextCharacter, 300);

        // Cleanup the interval on component unmount
        return () => clearInterval(intervalIdRef.current);
    }, [props.text]);

    return (
        <div>
            <p>{displayText}</p>
            {completed && <p>Typing complete!</p>}
        </div>
    );
}
