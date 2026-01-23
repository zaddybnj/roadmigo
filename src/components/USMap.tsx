import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Milestone, getCategoryInfo } from '@/types/milestone';

const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

interface USMapProps {
  visitedStates: string[];
  milestones?: Milestone[];
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

export const USMap = ({ visitedStates, milestones = [] }: USMapProps) => {
  const [hoveredMilestone, setHoveredMilestone] = useState<string | null>(null);

  // Filter milestones that have coordinates
  const geoMilestones = milestones.filter(m => m.latitude && m.longitude);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full aspect-[1.6/1] relative"
    >
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

        {/* Milestone Markers */}
        {geoMilestones.map((milestone) => {
          const catInfo = getCategoryInfo(milestone.category);
          const isHovered = hoveredMilestone === milestone.id;
          
          return (
            <Marker
              key={milestone.id}
              coordinates={[milestone.longitude!, milestone.latitude!]}
              onMouseEnter={() => setHoveredMilestone(milestone.id)}
              onMouseLeave={() => setHoveredMilestone(null)}
            >
              <g
                style={{ cursor: 'pointer' }}
                transform="translate(-12, -24)"
              >
                {/* Pin shape */}
                <path
                  d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 20 12 20s12-12.8 12-20c0-6.6-5.4-12-12-12z"
                  fill={isHovered ? 'hsl(32, 95%, 55%)' : 'hsl(32, 95%, 44%)'}
                  stroke="hsl(220, 20%, 15%)"
                  strokeWidth="1"
                  style={{
                    transition: 'all 0.2s ease',
                    transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                    transformOrigin: 'center bottom',
                  }}
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

      {/* Tooltip overlay */}
      {hoveredMilestone && (
        <MilestoneTooltip 
          milestone={geoMilestones.find(m => m.id === hoveredMilestone)!}
        />
      )}
    </motion.div>
  );
};

// Tooltip component
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
