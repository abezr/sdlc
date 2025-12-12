import React from "react";

// Simple BI skeleton showing warnings and recent runs (static placeholders).

export function App() {
  const warnings = [{ id: "w1", message: "No data yet", severity: "info" }];
  const runs = [{ id: "r1", status: "pending" }];

  return (
    <div style={{ fontFamily: "Inter, sans-serif", padding: 24 }}>
      <h2>AI Maintainer BI</h2>
      <section>
        <h3>Inspector Warnings</h3>
        <ul>
          {warnings.map((w) => (
            <li key={w.id}>
              [{w.severity}] {w.message}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Recent Runs</h3>
        <ul>
          {runs.map((r) => (
            <li key={r.id}>Run {r.id}: {r.status}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App;
