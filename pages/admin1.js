// pages/index.js

import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState("");

  const runSimulation = async () => {
    const res = await fetch("/api/simulateAdmin1");
    const data = await res.json();
    if (data.success) {
      setResult(data.message);
    } else {
      setResult(`Errors: ${JSON.stringify(data.errors, null, 2)}`);
    }
  };

  return (
    <div>
      <h1>Command Simulator | version: Admin1</h1>
      <button onClick={runSimulation}>Run Simulation</button>
      <pre>{result}</pre>
    </div>
  );
}
