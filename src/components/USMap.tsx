import { geoAlbersUsa, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { Milestone, getCategoryInfo } from '@/types/milestone';
import { RouteData, formatRouteMiles, formatRouteDuration } from '@/lib/routing';
import { Navigation } from 'lucide-react';
import { Waypoint } from '@/context/TripContext';

const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

interface USMapProps {
  visitedStates: string[];
  milestones?: Milestone[];
  routeInfo?: RouteData | null;
  activeStops?: Waypoint[];
}

const stateAbbreviations: { [key: string]: string } = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA',
  '08': 'CO', '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL',
  '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN',
  '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME',
  '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS',
  '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH',
  '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND',
  '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI',
  '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT',
  '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV', '55': 'WI',
  '56': 'WY',
};

const WIDTH = 960;
const HEIGHT = 600;

const projection = geoAlbersUsa().scale(1200).translate([WIDTH / 2, HEIGHT / 2]);
const pathGenerator = geoPath().projection(projection);

export const USMap = ({ visitedStates, milestones = [], routeInfo, activeStops = [] }: USMapProps) => {
  const [hoveredMilestone, setHoveredMilestone] = useState<string | null>(null);
  const [hoveredStop, setHoveredStop] = useState<string | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [topoData, setTopoData] = useState<Topology | null>(null);

  useEffect(() => {
    fetch(geoUrl)
      .then(res => res.json())
      .then((data: Topology) => setTopoData(data))
      .catch(console.error);
  }, []);

  const states = useMemo(() => {
    if (!topoData) return [];
    const geom = topoData.objects.states as GeometryCollection;
    return feature(topoData, geom).features;
  }, [topoData]);

  const geoMilestones = milestones.filter(m => m.latitude && m.longitude);

  // Project a [lng, lat] to SVG [x, y]
  const project = (coords: [number, number]): [number, number] | null => {
    const p = projection(coords);
    return p ? [p[0], p[1]] : null;
  };

  // Build route polyline points
  const routePoints = useMemo(() => {
    if (!routeInfo?.coordinates?.length) return '';
    return routeInfo.coordinates
      .map(c => project(c))
      .filter(Boolean)
      .map(p => `${p![0]},${p![1]}`)
      .join(' ');
  }, [routeInfo?.coordinates]);

  // Build active stop polyline points
  const activeStopPoints = useMemo(() => {
    if (activeStops.length < 2 || routePoints) return '';
    return activeStops
      .map(s => project([s.lng, s.lat]))
      .filter(Boolean)
      .map(p => `${p![0]},${p![1]}`)
      .join(' ');
  }, [activeStops, routePoints]);

  if (!topoData) {
    return (
      <div className="w-full aspect-[1.6/1] flex items-center justify-center bg-muted/20 rounded-lg">
        <span className="text-muted-foreground text-sm">Loading map...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full aspect-[1.6/1] relative"
    >
      {routeInfo && (
        <div className="absolute top-2 left-2 z-10 bg-card/90 backdrop-blur rounded-lg px-3 py-1.5 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{formatRouteMiles(routeInfo.distance)} mi</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">{formatRouteDuration(routeInfo.duration)}</span>
        </div>
      )}

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-full">
        {/* State geometries */}
        {states.map((geo) => {
          const stateId = String(geo.id);
          const stateAbbr = stateAbbreviations[stateId];
          const isVisited = visitedStates.includes(stateAbbr);
          const isHovered = hoveredState === stateId;
          const d = pathGenerator(geo) || '';

          let fill = isVisited ? 'hsl(152, 45%, 35%)' : 'hsl(220, 15%, 25%)';
          if (isHovered) {
            fill = isVisited ? 'hsl(152, 50%, 45%)' : 'hsl(220, 15%, 30%)';
          }

          return (
            <path
              key={stateId}
              d={d}
              fill={fill}
              stroke="hsl(220, 20%, 15%)"
              strokeWidth={0.5}
              style={{ cursor: 'pointer', outline: 'none' }}
              onMouseEnter={() => setHoveredState(stateId)}
              onMouseLeave={() => setHoveredState(null)}
            />
          );
        })}

        {/* Active trip stop connection lines (dashed preview) */}
        {activeStopPoints && (
          <polyline
            points={activeStopPoints}
            fill="none"
            stroke="hsl(220, 80%, 55%)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray="6 4"
          />
        )}

        {/* Route line */}
        {routePoints && (
          <polyline
            points={routePoints}
            fill="none"
            stroke="hsl(32, 95%, 50%)"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        )}

        {/* Start marker */}
        {routeInfo?.startPoint && (() => {
          const p = project([routeInfo.startPoint.longitude, routeInfo.startPoint.latitude]);
          if (!p) return null;
          return (
            <g>
              <circle cx={p[0]} cy={p[1]} r={6} fill="hsl(152, 60%, 45%)" stroke="hsl(220, 20%, 15%)" strokeWidth={1.5} />
              <text x={p[0]} y={p[1] + 3} textAnchor="middle" fontSize={7} fontWeight="bold" fill="white">S</text>
            </g>
          );
        })()}

        {/* Waypoint markers */}
        {routeInfo?.waypoints?.map((waypoint, index) => {
          const p = project([waypoint.longitude, waypoint.latitude]);
          if (!p) return null;
          return (
            <g key={`waypoint-${index}`}>
              <circle cx={p[0]} cy={p[1]} r={5} fill="hsl(220, 80%, 60%)" stroke="hsl(220, 20%, 15%)" strokeWidth={1.5} />
              <text x={p[0]} y={p[1] + 3} textAnchor="middle" fontSize={6} fontWeight="bold" fill="white">{index + 1}</text>
            </g>
          );
        })}

        {/* End marker */}
        {routeInfo?.endPoint && (() => {
          const p = project([routeInfo.endPoint.longitude, routeInfo.endPoint.latitude]);
          if (!p) return null;
          return (
            <g>
              <circle cx={p[0]} cy={p[1]} r={6} fill="hsl(0, 70%, 50%)" stroke="hsl(220, 20%, 15%)" strokeWidth={1.5} />
              <text x={p[0]} y={p[1] + 3} textAnchor="middle" fontSize={7} fontWeight="bold" fill="white">E</text>
            </g>
          );
        })()}

        {/* Active Trip Stops */}
        {activeStops.map((stop, index) => {
          const p = project([stop.lng, stop.lat]);
          if (!p) return null;
          const isHovered = hoveredStop === stop.id;
          return (
            <g
              key={stop.id}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredStop(stop.id)}
              onMouseLeave={() => setHoveredStop(null)}
            >
              <circle cx={p[0]} cy={p[1]} r={isHovered ? 7 : 6} fill="hsl(220, 80%, 55%)" stroke="hsl(220, 20%, 15%)" strokeWidth={1.5} />
              <text x={p[0]} y={p[1] + 3.5} textAnchor="middle" fontSize={7} fontWeight="bold" fill="white">{index + 1}</text>
            </g>
          );
        })}

        {/* Milestone Markers */}
        {geoMilestones.map((milestone) => {
          const catInfo = getCategoryInfo(milestone.category);
          const p = project([milestone.longitude!, milestone.latitude!]);
          if (!p) return null;
          const isHovered = hoveredMilestone === milestone.id;
          return (
            <g
              key={milestone.id}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredMilestone(milestone.id)}
              onMouseLeave={() => setHoveredMilestone(null)}
            >
              {/* Invisible hit area */}
              <rect x={p[0] - 16} y={p[1] - 28} width={32} height={40} fill="transparent" style={{ pointerEvents: 'all' }} />
              {/* Pin shape */}
              <path
                d={`M${p[0]} ${p[1]}c0 0-12-12.8-12-20c0-6.6 5.4-12 12-12s12 5.4 12 12c0 7.2-12 20-12 20z`}
                fill={isHovered ? 'hsl(32, 95%, 55%)' : 'hsl(32, 95%, 44%)'}
                stroke="hsl(220, 20%, 15%)"
                strokeWidth="1"
                style={{ pointerEvents: 'none' }}
              />
              {/* Emoji icon */}
              <text x={p[0]} y={p[1] - 18} textAnchor="middle" fontSize="10" style={{ pointerEvents: 'none' }}>
                {catInfo.icon}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Stop tooltip overlay */}
      {hoveredStop && activeStops.length > 0 && (
        <StopTooltip stop={activeStops.find(s => s.id === hoveredStop)!} />
      )}
      {hoveredMilestone && (
        <MilestoneTooltip milestone={geoMilestones.find(m => m.id === hoveredMilestone)!} />
      )}
    </motion.div>
  );
};

const StopTooltip = ({ stop }: { stop: Waypoint }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
    >
      <div className="bg-card border border-border rounded-lg shadow-lg px-3 py-2 min-w-[160px]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground text-xs font-bold">📍</span>
          </div>
          <div>
            <p className="font-medium text-sm text-foreground">{stop.name}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(stop.timestamp).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MilestoneTooltip = ({ milestone }: { milestone: Milestone }) => {
  const catInfo = getCategoryInfo(milestone.category);
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
    >
      <div className="bg-card border border-border rounded-lg shadow-lg px-3 py-2 min-w-[180px]">
        <div className="flex items-center gap-2">
          <span className="text-lg">{catInfo.icon}</span>
          <div>
            <p className="font-medium text-sm text-foreground">{milestone.name}</p>
            <p className="text-xs text-muted-foreground">{catInfo.label}</p>
          </div>
        </div>
        {milestone.notes && (
          <p className="text-xs text-muted-foreground mt-1 border-t border-border pt-1">
            {milestone.notes}
          </p>
        )}
      </div>
    </motion.div>
  );
};
