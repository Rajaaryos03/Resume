"use client";

interface TerminalWindowProps {
  name: string;
  title: string;
  skills: string[];
  status?: string;
}

export default function TerminalWindow({ name, title, skills, status }: TerminalWindowProps) {
  const displaySkills = skills.slice(0, 4);
  const displayStatus = status || "open to work ✓";

  return (
    <div className="terminal-window w-full max-w-sm text-xs font-mono">
      {/* Title bar */}
      <div className="terminal-titlebar">
        <span className="terminal-dot dot-red" />
        <span className="terminal-dot dot-yellow" />
        <span className="terminal-dot dot-green" />
        <span className="terminal-title-text">raja@portfolio ~ zsh</span>
      </div>

      {/* Body */}
      <div className="terminal-body">
        <p>
          <span className="terminal-prompt">➜</span>{" "}
          <span className="terminal-cmd">whoami</span>
        </p>
        <p className="terminal-output">{name} — {title}</p>

        <p className="mt-2">
          <span className="terminal-prompt">➜</span>{" "}
          <span className="terminal-cmd">cat skills.json</span>
        </p>
        <pre className="terminal-output mt-1">{`{
  `}<span className="terminal-key">"stack"</span>{`: [`}
          {displaySkills.map((skill, i) => (
            <span key={skill}>
              {`\n    `}
              <span className="terminal-str">"{skill}"</span>
              {i < displaySkills.length - 1 ? "," : ""}
            </span>
          ))}
          {`\n  ],\n  `}
          <span className="terminal-key">"status"</span>
          {`: `}
          <span className="terminal-str">"{displayStatus}"</span>
          {`\n}`}
        </pre>

        <p className="mt-2">
          <span className="terminal-prompt">➜</span>{" "}
          <span className="terminal-cursor-blink">▋</span>
        </p>
      </div>
    </div>
  );
}
