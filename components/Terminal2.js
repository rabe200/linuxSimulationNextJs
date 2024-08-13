import { executeCommand } from "./CommandHandler";
import styled from "styled-components";
import React, { useState, useEffect, useRef } from "react";

const TerminalContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: black;
  color: green;
  padding: 10px;
  font-family: monospace;
  overflow-y: auto;
`;

const TerminalInput = styled.input`
  background-color: black;
  color: green;
  border: none;
  outline: none;
  font-family: monospace;
  width: auto;
  flex-grow: 1;
`;

const TerminalInputContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Terminal2 = () => {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [currentPath, setCurrentPath] = useState(["root", "home", "user"]); // Initial path as an array
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  const handleKeyPress = async (e) => {
    if (e.key === "Enter") {
      const [command, ...args] = input.split(" ");
      const output = await executeCommand(command, args, history); // Await the async function
      setHistory([...history, `/${currentPath.join("/")}$ ${input}`, output]);

      // Update the current path if the command was `cd`
      if (command === "cd" && output === "") {
        setCurrentPath([...currentPath]); // Trigger re-render
      }

      setInput("");
    }
  };

  return (
    <TerminalContainer>
      {history.map((item, index) => (
        <div key={index}>{item}</div>
      ))}
      <TerminalInputContainer>
        <span>{`/${currentPath.join("/")}`} &gt;&gt;&gt; </span>
        <TerminalInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          autoFocus
        />
      </TerminalInputContainer>
      <div ref={terminalEndRef} />
    </TerminalContainer>
  );
};

export default Terminal2;
