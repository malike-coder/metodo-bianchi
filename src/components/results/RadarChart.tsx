import type { DimensionKey, DimensionScores } from '../../types/bianchi';

interface Props {
  dimensions: DimensionScores;
}

const CX = 200;
const CY = 200;
const R  = 135; // Matches the maxRadius in the original script

function polarToXY(angle: number, radius: number) {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

export function RadarChart({ dimensions }: Props) {
  const keys = Object.keys(dimensions) as DimensionKey[];
  const count = keys.length;
  const angleStep = 360 / count;

  // Build polygon for values
  const valuePoints = keys.map((k, i) => {
    const score = dimensions[k] || 0;
    const r = (score / 100) * R;
    return polarToXY(i * angleStep, r);
  });
  const valuePath = valuePoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';

  // Concentric decagons / decagons for the levels (5 levels)
  const rings = [20, 40, 60, 80, 100];

  return (
    <div className="radar-card w-full">
      <div className="radar-chart-container mx-auto">
        <svg viewBox="0 0 400 400" width="100%" height="100%" id="radar-svg">
          {/* Concentric decagons */}
          {rings.map((pct) => {
            const r = (pct / 100) * R;
            const points = keys.map((_, i) => polarToXY(i * angleStep, r));
            const pointsStr = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
            return (
              <polygon
                key={pct}
                points={pointsStr}
                fill="none"
                stroke="#E6E2DC"
                strokeWidth="1"
              />
            );
          })}

          {/* Axes */}
          {keys.map((_, i) => {
            const outer = polarToXY(i * angleStep, R);
            return (
              <line
                key={i}
                x1={CX}
                y1={CY}
                x2={outer.x.toFixed(1)}
                y2={outer.y.toFixed(1)}
                stroke="#E6E2DC"
                strokeWidth="1"
              />
            );
          })}

          {/* Value polygon */}
          <path
            d={valuePath}
            fill="rgba(152, 117, 87, 0.15)"
            stroke="#987557"
            strokeWidth="1.5"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 1000,
              strokeDashoffset: 0,
              animation: 'radarDraw 1.2s ease-out forwards',
            }}
          />

          {/* Points dots */}
          {valuePoints.map((p, i) => (
            <circle
              key={i}
              cx={p.x.toFixed(1)}
              cy={p.y.toFixed(1)}
              r="3"
              fill="#987557"
              stroke="white"
              strokeWidth="1"
            />
          ))}

          {/* Axis Labels */}
          {keys.map((k, i) => {
            const angle = i * angleStep;
            const labelR = R + 22;
            const pos = polarToXY(angle, labelR);
            const words = k.split(' ');
            const labelX = pos.x;
            const labelY = pos.y + 4;

            if (words.length > 1) {
              return (
                <text
                  key={k}
                  x={labelX.toFixed(1)}
                  y={labelY.toFixed(1)}
                  fontSize="9"
                  fontFamily="'Jost', sans-serif"
                  fill="#878179"
                  textAnchor="middle"
                >
                  <tspan x={labelX.toFixed(1)} dy="-4">{words[0]}</tspan>
                  <tspan x={labelX.toFixed(1)} dy="10">{words.slice(1).join(' ')}</tspan>
                </text>
              );
            } else {
              return (
                <text
                  key={k}
                  x={labelX.toFixed(1)}
                  y={labelY.toFixed(1)}
                  fontSize="9"
                  fontFamily="'Jost', sans-serif"
                  fill="#878179"
                  textAnchor="middle"
                >
                  {k}
                </text>
              );
            }
          })}
        </svg>
      </div>

      {/* Dimensions List Grid */}
      <div className="dimensions-list-grid">
        {keys.map((k) => {
          const score = dimensions[k] || 0;
          return (
            <div key={k} className="dim-badge">
              <span className="dim-name">{k}</span>
              <span className="dim-value">{score}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default RadarChart;
