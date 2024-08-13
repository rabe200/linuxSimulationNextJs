import React from "react";
import manuals from "./manuals.json";
const ManualList = () => {
  // Sort the manuals alphabetically by command name
  const sortedManuals = Object.keys(manuals)
    .sort()
    .map((command) => ({
      command,
      ...manuals[command],
    }));

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Command Manuals</h1>
      {sortedManuals.map(({ command, description, usage, examples }) => (
        <div key={command} style={{ marginBottom: "20px" }}>
          <h2 style={{ textTransform: "uppercase", color: "#0070f3" }}>
            {command}
          </h2>
          <p>
            <strong>Description:</strong> {description}
          </p>
          <p>
            <strong>Usage:</strong> <code>{usage}</code>
          </p>
          <p>
            <strong>Examples:</strong>
          </p>
          <ul>
            {examples.map((example, index) => (
              <li key={index}>
                <code>{example}</code>
              </li>
            ))}
          </ul>
          <hr style={{ marginTop: "20px", marginBottom: "20px" }} />
        </div>
      ))}
    </div>
  );
};

export default ManualList;
