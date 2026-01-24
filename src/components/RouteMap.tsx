import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { RouteData, formatRouteMiles, formatRouteDuration } from '@/lib/routing';
import { Milestone, getCategoryInfo } from '@/types/milestone';

interface RouteMapProps {
  route: RouteData | null;
  milestones?: Milestone[];
  className?: string;
}

export const RouteMap = ({ route, milestones = [], className = '' }: RouteMapProps) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Calculate bounds and SVG viewBox
  const { viewBox, pathD, startPos, endPos, milestonePositions } = useMemo(() => {
    if (!route || route.coordinates.length === 0) {
      return { viewBox: '0 0 400 300', pathD: '', startPos: null, endPos: null, milestonePositions: [] };
    }

    const coords = route.coordinates;
    
    // Get bounding box
    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;
    
    coords.forEach(([lng, lat]) => {
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    });
    
    // Add padding
    const lngPadding = (maxLng - minLng) * 0.15;
    const latPadding = (maxLat - minLat) * 0.15;
    minLng -= lngPadding;
    maxLng += lngPadding;
    minLat -= latPadding;
    maxLat += latPadding;
    
    const width = 400;
    const height = 300;
    
    // Scale function
    const scaleX = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * width;
    const scaleY = (lat: number) => height - ((lat - minLat) / (maxLat - minLat)) * height;
    
    // Build SVG path
    const pathPoints = coords.map(([lng, lat], i) => {
      const x = scaleX(lng);
      const y = scaleY(lat);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    });
    
    const startCoord = coords[0];
    const endCoord = coords[coords.length - 1];
    
    // Position milestones with coords on the map
    const milestonePos = milestones
      .filter(m => m.latitude && m.longitude)
      .map(m => ({
        milestone: m,
        x: scaleX(m.longitude!),
        y: scaleY(m.latitude!),
      }));
    
    return {
      viewBox: `0 0 ${width} ${height}`,
      pathD: pathPoints.join(' '),
      startPos: { x: scaleX(startCoord[0]), y: scaleY(startCoord[1]) },
      endPos: { x: scaleX(endCoord[0]), y: scaleY(endCoord[1]) },
      milestonePositions: milestonePos,
    };
  }, [route, milestones]);

  const handleZoomIn = () => setZoom(z => Math.min(z * 1.5, 4));
  const handleZoomOut = () => setZoom(z => Math.max(z / 1.5, 0.5));
  const handleReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  if (!route) {
    return (
      <div className={`bg-muted/30 rounded-xl flex items-center justify-center p-8 ${className}`}>
        <p className="text-sm text-muted-foreground text-center">
          No route data yet. Add start and end points when ending your trip!
        </p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 ${className}`}>
      {/* Map controls */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 bg-card/90 backdrop-blur rounded-lg flex items-center justify-center hover:bg-card transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 bg-card/90 backdrop-blur rounded-lg flex items-center justify-center hover:bg-card transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="w-8 h-8 bg-card/90 backdrop-blur rounded-lg flex items-center justify-center hover:bg-card transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Route info badge */}
      <div className="absolute top-2 left-2 z-10 bg-card/90 backdrop-blur rounded-lg px-3 py-1.5 flex items-center gap-2">
        <Navigation className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">{formatRouteMiles(route.distance)} mi</span>
        <span className="text-muted-foreground">•</span>
        <span className="text-sm text-muted-foreground">{formatRouteDuration(route.duration)}</span>
      </div>

      {/* SVG Map */}
      <svg
        viewBox={viewBox}
        className="w-full h-[250px] cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <g transform={`translate(${pan.x / zoom}, ${pan.y / zoom}) scale(${zoom})`}>
          {/* Route path with glow effect */}
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--secondary))" />
            </linearGradient>
          </defs>
          
          {/* Route shadow */}
          <path
            d={pathD}
            fill="none"
            stroke="hsl(var(--primary) / 0.2)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Main route line */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          
          {/* Milestone markers */}
          {milestonePositions.map(({ milestone, x, y }) => {
            const catInfo = getCategoryInfo(milestone.category);
            return (
              <g key={milestone.id}>
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  fill="hsl(var(--secondary))"
                  stroke="hsl(var(--card))"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  fontSize="10"
                >
                  {catInfo.icon}
                </text>
              </g>
            );
          })}
          
          {/* Start marker */}
          {startPos && (
            <g>
              <circle
                cx={startPos.x}
                cy={startPos.y}
                r="12"
                fill="hsl(var(--primary))"
                stroke="hsl(var(--card))"
                strokeWidth="3"
              />
              <text
                x={startPos.x}
                y={startPos.y + 4}
                textAnchor="middle"
                fill="hsl(var(--primary-foreground))"
                fontSize="10"
                fontWeight="bold"
              >
                S
              </text>
            </g>
          )}
          
          {/* End marker */}
          {endPos && (
            <g>
              <circle
                cx={endPos.x}
                cy={endPos.y}
                r="12"
                fill="hsl(var(--secondary))"
                stroke="hsl(var(--card))"
                strokeWidth="3"
              />
              <text
                x={endPos.x}
                y={endPos.y + 4}
                textAnchor="middle"
                fill="hsl(var(--secondary-foreground))"
                fontSize="10"
                fontWeight="bold"
              >
                E
              </text>
            </g>
          )}
        </g>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">{route.startPoint.name || 'Start'}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-secondary" />
          <span className="text-muted-foreground">{route.endPoint.name || 'End'}</span>
        </div>
      </div>
    </div>
  );
};
