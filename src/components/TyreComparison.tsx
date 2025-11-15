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
    <div className="w-full overflow-x-auto animate-fade-in">
      <svg
        viewBox={`0 0 600 ${svgHeight}`}
        className="w-full transition-all duration-500 ease-out"
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
        <g transform={`translate(150, ${centerY})`} className="animate-scale-in">
          {/* Rim */}
          <ellipse
            cx="0"
            cy="0"
            rx={oldScaledDiameter / 2 - oldScaledWidth}
            ry={oldScaledDiameter / 2 - oldScaledWidth}
            fill="hsl(var(--muted))"
            stroke="hsl(var(--border))"
            strokeWidth="2"
            style={{ transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
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
            style={{ transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
          {/* Tread pattern */}
          <ellipse
            cx="0"
            cy="0"
            rx={oldScaledDiameter / 2}
            ry={oldScaledDiameter / 2}
            fill="url(#treadPattern)"
            opacity="0.3"
            style={{ transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
          
          {/* Label */}
          <text
            x="0"
            y={oldScaledDiameter / 2 + 25}
            textAnchor="middle"
            className="fill-foreground text-sm font-semibold"
            style={{ transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
          >
            Current
          </text>
          <text
            x="0"
            y={oldScaledDiameter / 2 + 40}
            textAnchor="middle"
            className="fill-muted-foreground text-xs"
            style={{ transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
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
            style={{ transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
          <text
            x="0"
            y="-8"
            textAnchor="middle"
            className="fill-primary text-xs"
            style={{ transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
          >
            {oldDiameter.toFixed(0)}mm
          </text>
        </g>

        {/* New Tyre */}
        <g transform={`translate(450, ${centerY})`} className="animate-scale-in" style={{ animationDelay: "0.1s" }}>
          {/* Rim */}
          <ellipse
            cx="0"
            cy="0"
            rx={newScaledDiameter / 2 - newScaledWidth}
            ry={newScaledDiameter / 2 - newScaledWidth}
            fill="hsl(var(--muted))"
            stroke="hsl(var(--border))"
            strokeWidth="2"
            style={{ transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
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
            style={{ transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
          {/* Tread pattern */}
          <ellipse
            cx="0"
            cy="0"
            rx={newScaledDiameter / 2}
            ry={newScaledDiameter / 2}
            fill="url(#treadPattern)"
            opacity="0.3"
            style={{ transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
          
          {/* Label */}
          <text
            x="0"
            y={newScaledDiameter / 2 + 25}
            textAnchor="middle"
            className="fill-primary text-sm font-semibold"
            style={{ transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
          >
            New
          </text>
          <text
            x="0"
            y={newScaledDiameter / 2 + 40}
            textAnchor="middle"
            className="fill-muted-foreground text-xs"
            style={{ transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
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
            style={{ transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
          />
          <text
            x="0"
            y="-8"
            textAnchor="middle"
            className="fill-primary text-xs"
            style={{ transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
          >
            {newDiameter.toFixed(0)}mm
          </text>
        </g>

        {/* Comparison lines */}
        <line
          x1="150"
          y1={centerY - Math.max(oldScaledDiameter, newScaledDiameter) / 2 - 20}
          x2="450"
          y2={centerY - Math.max(oldScaledDiameter, newScaledDiameter) / 2 - 20}
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="1"
          strokeDasharray="2 2"
          opacity="0.3"
          style={{ transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
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
          style={{ transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
    </div>
  );
};
