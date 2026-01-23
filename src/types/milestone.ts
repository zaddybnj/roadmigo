export type MilestoneCategory = 
  | 'national_park'
  | 'state_park'
  | 'campground'
  | 'restaurant'
  | 'attraction'
  | 'scenic_viewpoint'
  | 'gas_station'
  | 'rv_park'
  | 'other';

export interface Milestone {
  id: string;
  name: string;
  category: MilestoneCategory;
  notes?: string;
  timestamp: string;
  latitude?: number;
  longitude?: number;
}

export const MILESTONE_CATEGORIES: { value: MilestoneCategory; label: string; icon: string }[] = [
  { value: 'national_park', label: 'National Park', icon: '🏞️' },
  { value: 'state_park', label: 'State Park', icon: '🌲' },
  { value: 'campground', label: 'Campground', icon: '⛺' },
  { value: 'rv_park', label: 'RV Park', icon: '🚐' },
  { value: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { value: 'attraction', label: 'Attraction', icon: '🎢' },
  { value: 'scenic_viewpoint', label: 'Scenic Viewpoint', icon: '🌅' },
  { value: 'gas_station', label: 'Gas Station', icon: '⛽' },
  { value: 'other', label: 'Other', icon: '📍' },
];

export const getCategoryInfo = (category: MilestoneCategory) => {
  return MILESTONE_CATEGORIES.find(c => c.value === category) || MILESTONE_CATEGORIES[MILESTONE_CATEGORIES.length - 1];
};
