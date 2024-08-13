// pages/api/simulate.js

import { executeCommand } from "../../components/CommandHandler";
import commands from "@/components/filemanagmentTest";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const errorLog = [];
  const fullLog = [];

  // Define a new set of commands for an admin behavior simulation
  const adminCommands = commands;

  for (const fullCommand of adminCommands) {
    const [command, ...args] = fullCommand.split(" ");

    try {
      const output = await executeCommand(command, args);
      const successMessage = `Command: ${fullCommand}\nOutput: ${output}\n`;
      console.log(successMessage);
      fullLog.push(successMessage);
    } catch (error) {
      const errorMessage = `Error executing command: ${fullCommand}\nError: ${error.message}\n`;
      console.error(errorMessage);
      fullLog.push(errorMessage);
      errorLog.push({
        command: fullCommand,
        error: error.message,
      });
    }
  }

  // Determine the filename with an incrementing counter
  let counter = 1;
  let fileName;
  do {
    fileName = `adminRun${counter}.txt`;
    counter++;
  } while (fs.existsSync(path.join(process.cwd(), fileName)));

  // Write the full log to the file
  fs.writeFileSync(path.join(process.cwd(), fileName), fullLog.join("\n"));

  // Respond with the full log and separated errors
  res.status(200).json({
    success: errorLog.length === 0,
    message:
      errorLog.length === 0
        ? "All commands executed successfully."
        : "Some commands failed.",
    fileName: fileName,
    errors: errorLog,
  });
}
