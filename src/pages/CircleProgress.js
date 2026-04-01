// C:\Users\ADMIN\Downloads\ProjectMahal 1512\ProjectMahal\temp-app\src\pages\CircleProgress.js
import React from "react";
// import "./css/CircleProgress.css";
import "./css/CircleProgress.css"

export default function CircleProgress({ progress }) {
  const radius = 48;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const strokeDashoffset =
    circumference - (progress / 100) * circumference;

  return (
    <div className="circle-wrapper">
      <svg height={radius * 2} width={radius * 2}>
        <circle
          stroke="#eaeaea"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="#ff7a00"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference + " " + circumference}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="progress-ring"
        />
      </svg>

      <div className="circle-text">{progress}%</div>
    </div>
  );
}