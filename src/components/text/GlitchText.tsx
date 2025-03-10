import { useEffect, useState } from "react";
import { useInterval } from "react-use";

interface GlitchTextProps {
  text: string;
  glitchedText: string;
  className?: string;
  groupHover?: boolean;
}

export function GlitchText({
  text,
  glitchedText,
  className = "",
  groupHover = false,
}: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false);
  const [displayText, setDisplayText] = useState(text);
  const [glitchCount, setGlitchCount] = useState(0);
  const maxGlitches = 10; // Number of glitch iterations before showing final text

  useEffect(() => {
    if (groupHover) {
      const parent = document.querySelector("[data-info-card]");

      const handleMouseEnter = () => {
        setIsGlitching(true);
        setGlitchCount(0);
      };

      const handleMouseLeave = () => {
        setDisplayText(text);
        setIsGlitching(false);
        setGlitchCount(0);
      };

      parent?.addEventListener("mouseenter", handleMouseEnter);
      parent?.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        parent?.removeEventListener("mouseenter", handleMouseEnter);
        parent?.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [groupHover, text]);

  useInterval(
    () => {
      if (glitchCount >= maxGlitches) {
        setDisplayText(glitchedText);
        setIsGlitching(false);
        setGlitchCount(0);
        return;
      }

      const randomChars = glitchedText
        .split("")
        .map(() => String.fromCharCode(33 + Math.floor(Math.random() * 94)))
        .join("");
      setDisplayText(randomChars);
      setGlitchCount((count) => count + 1);
    },
    isGlitching ? 50 : null,
  );

  return (
    <span className={`transition-all duration-200 ${className}`}>
      {displayText}
    </span>
  );
}
