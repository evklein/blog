import { useState, useEffect } from 'preact/hooks';
import "../styles/Typewriter.css";

interface TypewriterProps {
  text: String;
  makeMistakes: boolean;
  highlightLastWord: boolean;
};

export default function Typewriter(props: TypewriterProps) {
  const [textInProgress, setTextInProgress] = useState("");
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (props.makeMistakes) {

    }

    function type() {
      if (index < props.text.length) {
        setTextInProgress(props.text.slice(0, index + 1));
        setIndex(previousIndex => previousIndex + 1);
      } else {
        setTextInProgress(props.text.slice(0, index));
      }
    }

    const timer = setTimeout(type, Math.random() * 150 + 50);
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
