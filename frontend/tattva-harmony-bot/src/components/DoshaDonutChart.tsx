// DoshaDonutChart.tsx with improved readability and label positioning
import React from "react";

interface DoshaValue {
  name: string;
  value: number;
  color: string;
}

interface DoshaDonutChartProps {
  title: string;
  values: DoshaValue[];
  size?: number;
}

const DoshaDonutChart: React.FC<DoshaDonutChartProps> = ({ 
  title, 
  values, 
  size = 220 // Increased default size for more space
}) => {
  const radius = size / 2;
  const innerRadius = radius * 0.55; // Balanced inner circle
  const strokeWidth = radius - innerRadius;
  
  // Sort values by percentage (descending)
  const sortedValues = [...values].sort((a, b) => b.value - a.value);
  
  let cumulativePercent = 0;
  
  return (
    <div className="flex flex-col items-center">
      <h3 className="text-center font-medium text-lg mb-3 text-tattva-green-dark">{title}</h3>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Create the donut segments */}
          {sortedValues.map((item, index) => {
            // Calculate angles for this segment
            const startPercent = cumulativePercent;
            const endPercent = startPercent + item.value / 100;
            
            cumulativePercent = endPercent;
            
            // Calculate angles in radians
            const startAngle = startPercent * Math.PI * 2 - Math.PI / 2;
            const endAngle = endPercent * Math.PI * 2 - Math.PI / 2;
            
            // Calculate path coordinates
            const startX = radius + innerRadius * Math.cos(startAngle);
            const startY = radius + innerRadius * Math.sin(startAngle);
            
            const endX = radius + innerRadius * Math.cos(endAngle);
            const endY = radius + innerRadius * Math.sin(endAngle);
            
            const outerStartX = radius + radius * Math.cos(startAngle);
            const outerStartY = radius + radius * Math.sin(startAngle);
            
            const outerEndX = radius + radius * Math.cos(endAngle);
            const outerEndY = radius + radius * Math.sin(endAngle);
            
            // Create the path
            const largeArcFlag = endPercent - startPercent > 0.5 ? 1 : 0;
            
            const path = `
              M ${startX} ${startY}
              L ${outerStartX} ${outerStartY}
              A ${radius} ${radius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY}
              L ${endX} ${endY}
              A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startX} ${startY}
              Z
            `;
            
            // Calculate label position - move slightly toward the outer edge
            const midAngle = (startAngle + endAngle) / 2;
            const labelRadius = (innerRadius + radius * 0.9) / 2; // Position in the middle of the donut, closer to outer edge
            const labelX = radius + labelRadius * Math.cos(midAngle);
            const labelY = radius + labelRadius * Math.sin(midAngle);
            
            // For smaller segments, position labels outside the donut
            let nameX = labelX;
            let nameY = labelY - 7; // Name above percentage
            let percentX = labelX;
            let percentY = labelY + 7; // Percentage below name
            
            // Determine text colors - always ensure high contrast
            let textColor = "black";
            
            
            return (
              <g key={index}>
                <path
                  d={path}
                  fill={item.color}
                  stroke="white"
                  strokeWidth="1.5" // Thicker border between segments
                />
                
                {item.value >= 5 && (
                  <g>
                    {/* Text background/outline for better readability */}
                    <text
                      x={nameX}
                      y={nameY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="none"
                      stroke="white"
                      strokeWidth="4"
                      strokeLinejoin="round"
                      paintOrder="stroke"
                      fontSize="14"
                      fontWeight="bold"
                    >
                      {item.name}
                    </text>
                    <text
                      x={percentX}
                      y={percentY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="none"
                      stroke="white"
                      strokeWidth="4"
                      strokeLinejoin="round"
                      paintOrder="stroke"
                      fontSize="14"
                      fontWeight="bold"
                    >
                      {item.value}%
                    </text>
                    
                    {/* Actual text - name and percentage on separate lines */}
                    <text
                      x={nameX}
                      y={nameY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={textColor}
                      fontSize="14"
                      fontWeight="bold"
                    >
                      {item.name}
                    </text>
                    <text
                      x={percentX}
                      y={percentY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={textColor}
                      fontSize="14"
                      fontWeight="bold"
                    >
                      {item.value}%
                    </text>
                  </g>
                )}
              </g>
            );
          })}
          
          {/* Inner circle */}
          <circle
            cx={radius}
            cy={radius}
            r={innerRadius}
            fill="white"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        </svg>
      </div>
    </div>
  );
};

export default DoshaDonutChart;