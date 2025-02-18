import { executeCommand, resolvePath } from "./CommandHandler";
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
  white-space: pre; /* Ensures white space and line breaks are respected */
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
  const [commandHistory, setCommandHistory] = useState([]); // Stores the history of commands
  const [input, setInput] = useState("");
  const [currentPath, setCurrentPath] = useState(["root", "home", "user"]);
  const [historyIndex, setHistoryIndex] = useState(-1); // Track the position in the command history
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  const resolvePath = (cwd, path = "") => {
    let newPath = path.startsWith("/")
      ? path.split("/").filter(Boolean)
      : [...cwd, ...path.split("/").filter(Boolean)];

    const resolvedPath = [];
    for (const part of newPath) {
      if (part === "..") {
        resolvedPath.pop();
      } else if (part !== ".") {
        resolvedPath.push(part);
      }
    }
    return resolvedPath;
  };

  const handleKeyPress = async (e) => {
    if (e.key === "Enter") {
      const commandLine = input.trim(); // Capture the full command line input
      const [command, ...args] = commandLine.split(" ");

      // Display the user's command in the terminal
      setHistory((prevHistory) => [
        ...prevHistory, // Spread the previous history array
        `/${currentPath.join("/")}$ ${commandLine}`, // Correctly using backticks for the template literal
      ]);

      // Add the command to the command history
      setCommandHistory((prevCommandHistory) => [
        ...prevCommandHistory,
        commandLine,
      ]);

      // Execute the command and pass commandHistory to it
      const output = await executeCommand(command, args, commandHistory);

      // Display the output in the terminal, if any
      if (output) {
        setHistory((prevHistory) => [...prevHistory, output]);
      }

      // Handle special case for cd command to update the path
      if (command === "cd" && output === "") {
        const newPath = resolvePath(currentPath, args[0]);
        setCurrentPath(newPath);
      }

      setInput(""); // Clear the input field
      setHistoryIndex(-1); // Reset the history index
    } else if (e.key === "ArrowUp") {
      // Move up in the command history
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]); // Display the command from history
      }
    } else if (e.key === "ArrowDown") {
      // Move down in the command history
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]); // Display the command from history
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput(""); // Clear input when at the bottom of history
      }
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
          onKeyDown={handleKeyPress} // Use onKeyDown instead of onKeyPress to capture Arrow keys
          autoFocus
        />
      </TerminalInputContainer>

      <div ref={terminalEndRef} />
    </TerminalContainer>
  );
};

export default Terminal2;
