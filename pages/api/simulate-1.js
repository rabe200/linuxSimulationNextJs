// pages/api/simulate.js

import { executeCommand } from "../../components/CommandHandler";
import commands from "@/components/filemanagmentTest";

export default async function handler(req, res) {
  const errorLog = [];

  for (const fullCommand of commands) {
    const [command, ...args] = fullCommand.split(" ");

    try {
      const output = await executeCommand(command, args);
      console.log(`Command: ${fullCommand}\nOutput: ${output}\n`);
    } catch (error) {
      console.error(`Error executing command: ${fullCommand}\nError: ${error}`);
      errorLog.push({
        command: fullCommand,
        error: error.message,
      });
    }
  }

  if (errorLog.length > 0) {
    // Respond with the error log
    res.status(200).json({ success: false, errors: errorLog });
  } else {
    res
      .status(200)
      .json({ success: true, message: "All commands executed successfully." });
  }
}
