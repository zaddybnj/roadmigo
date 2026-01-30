import { ComposableMap, Geographies, Geography, Marker, Line } from 'react-simple-maps';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Milestone, getCategoryInfo } from '@/types/milestone';
import { RouteData, formatRouteMiles, formatRouteDuration } from '@/lib/routing';
import { Navigation } from 'lucide-react';
import { Waypoint, RoutePreview } from '@/context/TripContext';

const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

interface USMapProps {
  visitedStates: string[];
  milestones?: Milestone[];
  routeInfo?: RouteData | null;
  activeStops?: Waypoint[]; // For showing stops during an active trip
  routePreview?: RoutePreview; // For showing start/end pins before route is calculated
}

// State FIPS to abbreviation mapping
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

export const USMap = ({ visitedStates, milestones = [], routeInfo, activeStops = [], routePreview }: USMapProps) => {
  const [hoveredMilestone, setHoveredMilestone] = useState<string | null>(null);
  const [hoveredStop, setHoveredStop] = useState<string | null>(null);

  // Filter milestones that have coordinates
  const geoMilestones = milestones.filter(m => m.latitude && m.longitude);

  // Use route from routePreview if available, otherwise use routeInfo
  const effectiveRouteData = routePreview?.routeData || routeInfo;
  const effectiveStartPoint = routePreview?.startPoint || routeInfo?.startPoint;
  const effectiveEndPoint = routePreview?.endPoint || routeInfo?.endPoint;

  // Convert route coordinates to line segments for react-simple-maps
  const routeSegments: Array<{ from: [number, number]; to: [number, number] }> = [];
  if (effectiveRouteData?.coordinates && effectiveRouteData.coordinates.length > 1) {
    for (let i = 0; i < effectiveRouteData.coordinates.length - 1; i++) {
      routeSegments.push({
        from: effectiveRouteData.coordinates[i],
        to: effectiveRouteData.coordinates[i + 1],
      });
    }
  }

  // Create line segments between active stops (during active trip, before final route)
  const activeStopSegments: Array<{ from: [number, number]; to: [number, number] }> = [];
  if (activeStops.length > 1 && routeSegments.length === 0) {
    for (let i = 0; i < activeStops.length - 1; i++) {
      activeStopSegments.push({
        from: [activeStops[i].lng, activeStops[i].lat],
        to: [activeStops[i + 1].lng, activeStops[i + 1].lat],
      });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full aspect-[1.6/1] relative"
    >
      {/* Route info badge */}
      {routeInfo && (
        <div className="absolute top-2 left-2 z-10 bg-card/90 backdrop-blur rounded-lg px-3 py-1.5 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{formatRouteMiles(routeInfo.distance)} mi</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">{formatRouteDuration(routeInfo.duration)}</span>
        </div>
      )}

      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{ scale: 1000 }}
        className="w-full h-full"
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const stateId = geo.id;
              const stateAbbr = stateAbbreviations[stateId];
              const isVisited = visitedStates.includes(stateAbbr);

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isVisited ? 'hsl(152, 45%, 35%)' : 'hsl(220, 15%, 25%)'}
                  stroke="hsl(220, 20%, 15%)"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: {
                      fill: isVisited ? 'hsl(152, 50%, 45%)' : 'hsl(220, 15%, 30%)',
                      outline: 'none',
                      cursor: 'pointer',
                    },
                    pressed: { outline: 'none' },
                  }}
                />
              );
            })
          }
        </Geographies>

        {/* Active trip stop connection lines (dashed preview) */}
        {activeStopSegments.map((segment, i) => (
          <Line
            key={`active-stop-${i}`}
            from={segment.from}
            to={segment.to}
            stroke="hsl(220, 80%, 55%)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray="6 4"
          />
        ))}

        {/* Route line segments */}
        {routeSegments.map((segment, i) => (
          <Line
            key={`route-${i}`}
            from={segment.from}
            to={segment.to}
            stroke="hsl(32, 95%, 50%)"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        ))}

        {/* Start marker */}
        {routeInfo?.startPoint && (
          <Marker coordinates={[routeInfo.startPoint.longitude, routeInfo.startPoint.latitude]}>
            <circle r={6} fill="hsl(152, 60%, 45%)" stroke="hsl(220, 20%, 15%)" strokeWidth={1.5} />
            <text
              textAnchor="middle"
              y={3}
              fontSize={7}
              fontWeight="bold"
              fill="white"
            >
              S
            </text>
          </Marker>
        )}

        {/* Waypoint markers */}
        {routeInfo?.waypoints?.map((waypoint, index) => (
          <Marker key={`waypoint-${index}`} coordinates={[waypoint.longitude, waypoint.latitude]}>
            <circle r={5} fill="hsl(220, 80%, 60%)" stroke="hsl(220, 20%, 15%)" strokeWidth={1.5} />
            <text
              textAnchor="middle"
              y={3}
              fontSize={6}
              fontWeight="bold"
              fill="white"
            >
              {index + 1}
            </text>
          </Marker>
        ))}

        {/* End marker */}
        {routeInfo?.endPoint && (
          <Marker coordinates={[routeInfo.endPoint.longitude, routeInfo.endPoint.latitude]}>
            <circle r={6} fill="hsl(0, 70%, 50%)" stroke="hsl(220, 20%, 15%)" strokeWidth={1.5} />
            <text
              textAnchor="middle"
              y={3}
              fontSize={7}
              fontWeight="bold"
              fill="white"
            >
              E
            </text>
          </Marker>
        )}

        {/* Active Trip Stops (during trip, before final route is calculated) */}
        {activeStops.map((stop, index) => {
          const isHovered = hoveredStop === stop.id;
          return (
            <Marker
              key={stop.id}
              coordinates={[stop.lng, stop.lat]}
            >
              <g
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredStop(stop.id)}
                onMouseLeave={() => setHoveredStop(null)}
              >
                <circle 
                  r={isHovered ? 7 : 6} 
                  fill="hsl(220, 80%, 55%)" 
                  stroke="hsl(220, 20%, 15%)" 
                  strokeWidth={1.5} 
                />
                <text
                  textAnchor="middle"
                  y={3.5}
                  fontSize={7}
                  fontWeight="bold"
                  fill="white"
                >
                  {index + 1}
                </text>
              </g>
            </Marker>
          );
        })}

        {/* Milestone Markers */}
        {geoMilestones.map((milestone) => {
          const catInfo = getCategoryInfo(milestone.category);
          const isHovered = hoveredMilestone === milestone.id;
          
          return (
            <Marker
              key={milestone.id}
              coordinates={[milestone.longitude!, milestone.latitude!]}
            >
              <g
                style={{ cursor: 'pointer' }}
                transform="translate(-12, -24)"
                onMouseEnter={() => setHoveredMilestone(milestone.id)}
                onMouseLeave={() => setHoveredMilestone(null)}
              >
                {/* Invisible larger hit area to prevent flickering */}
                <rect
                  x="-4"
                  y="-4"
                  width="32"
                  height="40"
                  fill="transparent"
                  style={{ pointerEvents: 'all' }}
                />
                {/* Pin shape */}
                <path
                  d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 20 12 20s12-12.8 12-20c0-6.6-5.4-12-12-12z"
                  fill={isHovered ? 'hsl(32, 95%, 55%)' : 'hsl(32, 95%, 44%)'}
                  stroke="hsl(220, 20%, 15%)"
                  strokeWidth="1"
                  style={{ pointerEvents: 'none' }}
                />
                {/* Emoji icon inside pin */}
                <text
                  x="12"
                  y="14"
                  textAnchor="middle"
                  fontSize="10"
                  style={{ pointerEvents: 'none' }}
                >
                  {catInfo.icon}
                </text>
              </g>
            </Marker>
          );
        })}
      </ComposableMap>

      {/* Stop tooltip overlay */}
      {hoveredStop && activeStops.length > 0 && (
        <StopTooltip stop={activeStops.find(s => s.id === hoveredStop)!} />
      )}
      {hoveredMilestone && (
        <MilestoneTooltip 
          milestone={geoMilestones.find(m => m.id === hoveredMilestone)!}
        />
      )}
    </motion.div>
  );
};

// Stop tooltip component
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

// Milestone tooltip component
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
