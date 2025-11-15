interface TyreComparisonProps {
  oldSize: string;
  newSize: string;
  oldDiameter: number;
  newDiameter: number;
  oldWidth: number;
  newWidth: number;
}

export const TyreComparison = ({
  oldSize,
  newSize,
  oldDiameter,
  newDiameter,
  oldWidth,
  newWidth,
}: TyreComparisonProps) => {
  const maxDiameter = Math.max(oldDiameter, newDiameter);
  const scale = 200 / maxDiameter;

  const oldScaledDiameter = oldDiameter * scale;
  const newScaledDiameter = newDiameter * scale;
  const oldScaledWidth = oldWidth * scale * 0.3;
  const newScaledWidth = newWidth * scale * 0.3;

  const svgHeight = Math.max(oldScaledDiameter, newScaledDiameter) + 80;
  const centerY = svgHeight / 2;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 600 ${svgHeight}`}
        className="w-full"
        style={{ maxHeight: "400px" }}
      >
        <defs>
          <pattern
            id="treadPattern"
            x="0"
            y="0"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <rect width="10" height="10" fill="hsl(var(--muted))" />
            <path d="M0,5 L10,5" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Old Tyre */}
        <g transform={`translate(150, ${centerY})`}>
          {/* Rim */}
          <ellipse
            cx="0"
            cy="0"
            rx={oldScaledDiameter / 2 - oldScaledWidth}
            ry={oldScaledDiameter / 2 - oldScaledWidth}
            fill="hsl(var(--muted))"
            stroke="hsl(var(--border))"
            strokeWidth="2"
          />
          {/* Tyre */}
          <ellipse
            cx="0"
            cy="0"
            rx={oldScaledDiameter / 2}
            ry={oldScaledDiameter / 2}
            fill="none"
            stroke="hsl(var(--foreground))"
            strokeWidth={oldScaledWidth}
            opacity="0.8"
          />
          {/* Tread pattern */}
          <ellipse
            cx="0"
            cy="0"
            rx={oldScaledDiameter / 2}
            ry={oldScaledDiameter / 2}
            fill="url(#treadPattern)"
            opacity="0.3"
          />
          
          {/* Label */}
          <text
            x="0"
            y={oldScaledDiameter / 2 + 25}
            textAnchor="middle"
            className="fill-foreground text-sm font-semibold"
          >
            Current
          </text>
          <text
            x="0"
            y={oldScaledDiameter / 2 + 40}
            textAnchor="middle"
            className="fill-muted-foreground text-xs"
          >
            {oldSize}
          </text>
          
          {/* Diameter indicator */}
          <line
            x1={-oldScaledDiameter / 2}
            y1="0"
            x2={oldScaledDiameter / 2}
            y2="0"
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            strokeDasharray="4 2"
            opacity="0.5"
          />
          <text
            x="0"
            y="-8"
            textAnchor="middle"
            className="fill-primary text-xs"
          >
            {oldDiameter.toFixed(0)}mm
          </text>
        </g>

        {/* New Tyre */}
        <g transform={`translate(450, ${centerY})`}>
          {/* Rim */}
          <ellipse
            cx="0"
            cy="0"
            rx={newScaledDiameter / 2 - newScaledWidth}
            ry={newScaledDiameter / 2 - newScaledWidth}
            fill="hsl(var(--muted))"
            stroke="hsl(var(--border))"
            strokeWidth="2"
          />
          {/* Tyre */}
          <ellipse
            cx="0"
            cy="0"
            rx={newScaledDiameter / 2}
            ry={newScaledDiameter / 2}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={newScaledWidth}
            opacity="0.8"
          />
          {/* Tread pattern */}
          <ellipse
            cx="0"
            cy="0"
            rx={newScaledDiameter / 2}
            ry={newScaledDiameter / 2}
            fill="url(#treadPattern)"
            opacity="0.3"
          />
          
          {/* Label */}
          <text
            x="0"
            y={newScaledDiameter / 2 + 25}
            textAnchor="middle"
            className="fill-primary text-sm font-semibold"
          >
            New
          </text>
          <text
            x="0"
            y={newScaledDiameter / 2 + 40}
            textAnchor="middle"
            className="fill-muted-foreground text-xs"
          >
            {newSize}
          </text>
          
          {/* Diameter indicator */}
          <line
            x1={-newScaledDiameter / 2}
            y1="0"
            x2={newScaledDiameter / 2}
            y2="0"
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            strokeDasharray="4 2"
            opacity="0.5"
          />
          <text
            x="0"
            y="-8"
            textAnchor="middle"
            className="fill-primary text-xs"
          >
            {newDiameter.toFixed(0)}mm
          </text>
        </g>

        {/* Comparison line */}
        <line
          x1="150"
          y1={centerY - Math.max(oldScaledDiameter, newScaledDiameter) / 2 - 20}
          x2="450"
          y2={centerY - Math.max(oldScaledDiameter, newScaledDiameter) / 2 - 20}
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="1"
          strokeDasharray="2 2"
          opacity="0.3"
        />
        <line
          x1="150"
          y1={centerY + Math.max(oldScaledDiameter, newScaledDiameter) / 2 + 20}
          x2="450"
          y2={centerY + Math.max(oldScaledDiameter, newScaledDiameter) / 2 + 20}
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="1"
          strokeDasharray="2 2"
          opacity="0.3"
        />
      </svg>
    </div>
  );
};
