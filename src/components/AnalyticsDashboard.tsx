import { motion } from 'framer-motion';
import { 
  TrendingUp, Calendar, MapPin, Moon, Camera, Route, 
  BarChart3, PieChart, Activity, Zap, Clock, Target
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, BarChart, Bar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PremiumBadge } from '@/components/PremiumBadge';
import { useTrip } from '@/context/TripContext';
import { cn } from '@/lib/utils';

const monthlyData = [
  { month: 'Jan', miles: 450, trips: 1 },
  { month: 'Feb', miles: 0, trips: 0 },
  { month: 'Mar', miles: 680, trips: 2 },
  { month: 'Apr', miles: 1200, trips: 2 },
  { month: 'May', miles: 890, trips: 1 },
  { month: 'Jun', miles: 2100, trips: 3 },
  { month: 'Jul', miles: 1650, trips: 2 },
  { month: 'Aug', miles: 980, trips: 2 },
  { month: 'Sep', miles: 1340, trips: 2 },
  { month: 'Oct', miles: 720, trips: 1 },
  { month: 'Nov', miles: 0, trips: 0 },
  { month: 'Dec', miles: 540, trips: 1 },
];

const regionData = [
  { name: 'West', value: 45, color: 'hsl(32, 95%, 55%)' },
  { name: 'Southwest', value: 25, color: 'hsl(152, 45%, 35%)' },
  { name: 'Midwest', value: 15, color: 'hsl(200, 80%, 50%)' },
  { name: 'Northeast', value: 10, color: 'hsl(265, 85%, 60%)' },
  { name: 'South', value: 5, color: 'hsl(45, 100%, 50%)' },
];

const tripTypeData = [
  { type: 'Weekend', count: 8 },
  { type: '1 Week', count: 5 },
  { type: '2 Weeks', count: 3 },
  { type: '1 Month+', count: 2 },
];

interface AnalyticsDashboardProps {
  className?: string;
}

export const AnalyticsDashboard = ({ className }: AnalyticsDashboardProps) => {
  const { completedTrips } = useTrip();

  const totalMiles = completedTrips.reduce((sum, t) => sum + t.distance, 0);
  const avgMilesPerTrip = completedTrips.length > 0 ? Math.round(totalMiles / completedTrips.length) : 0;
  const totalNights = completedTrips.reduce((sum, t) => sum + t.nights, 0);
  const avgTripLength = completedTrips.length > 0 ? (totalNights / completedTrips.length).toFixed(1) : 0;
  const totalPhotos = completedTrips.reduce((sum, t) => sum + t.photos.length, 0);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(265_85%_60%)] to-[hsl(280_80%_55%)] flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">Advanced Analytics</h2>
            <p className="text-sm text-muted-foreground">Deep insights into your travels</p>
          </div>
        </div>
        <PremiumBadge />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Avg Miles/Trip', value: avgMilesPerTrip.toLocaleString(), icon: Route, color: 'text-primary' },
          { label: 'Avg Trip Length', value: `${avgTripLength} days`, icon: Clock, color: 'text-secondary' },
          { label: 'Total Photos', value: totalPhotos, icon: Camera, color: 'text-achievement' },
          { label: 'Fuel Efficiency', value: '8.2 mpg', icon: Zap, color: 'text-success' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-xl p-4 border border-border"
          >
            <stat.icon className={cn("w-5 h-5 mb-2", stat.color)} />
            <p className="font-display text-xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Miles Over Time Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" />
              Miles Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="milesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(32, 95%, 55%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(32, 95%, 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 15%, 60%)', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 15%, 60%)', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(220, 18%, 14%)', 
                      border: '1px solid hsl(220, 15%, 22%)',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="miles" 
                    stroke="hsl(32, 95%, 55%)" 
                    strokeWidth={2}
                    fill="url(#milesGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Two Column Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Regions Visited */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin size={18} className="text-secondary" />
                Regions Explored
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={regionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {regionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(220, 18%, 14%)', 
                        border: '1px solid hsl(220, 15%, 22%)',
                        borderRadius: '8px'
                      }}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {regionData.map((region) => (
                  <div key={region.name} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: region.color }} />
                    <span className="text-muted-foreground">{region.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trip Duration Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar size={18} className="text-achievement" />
                Trip Lengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tripTypeData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis 
                      type="category" 
                      dataKey="type" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: 'hsl(215, 15%, 60%)', fontSize: 12 }}
                      width={70}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(220, 18%, 14%)', 
                        border: '1px solid hsl(220, 15%, 22%)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(152, 45%, 35%)" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity size={18} className="text-[hsl(265_85%_60%)]" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/50 flex items-start gap-3">
              <Target className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Peak Travel Season</p>
                <p className="text-xs text-muted-foreground">You travel most in June-July. Consider booking campgrounds early!</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-secondary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Favorite Region</p>
                <p className="text-xs text-muted-foreground">45% of your travels are in the West. You're a true desert explorer!</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 flex items-start gap-3">
              <Moon className="w-5 h-5 text-achievement mt-0.5" />
              <div>
                <p className="text-sm font-medium">Average Stay</p>
                <p className="text-xs text-muted-foreground">You average 4 nights per trip. Extended trips show you're taking your time!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
