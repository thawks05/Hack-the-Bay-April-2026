export interface District {
  id: string;
  name: string;
  mwh: number;
  waste: number;
  renewable: number;
  peak: string;
  status: 'red' | 'amber' | 'green';
  coords: [number, number][];
}

export interface Project {
  id: string;
  score: number;
  name: string;
  districtId: string;
  type: 'solar' | 'efficiency' | 'wind' | 'storage' | 'grid';
  cost: string;
  time: string;
  impact: string;
  efficiency: number;
  costScore: number;
  speed: number;
}

export interface Alert {
  level: 'red' | 'amber' | 'green';
  district: string;
  message: string;
}

export interface CityKpis {
  totalMwh: number;
  peakMw: number;
  wastePercent: number;
  renewablePercent: number;
  gridStress: string;
  gridCapacityPercent: number;
  totalDemandMw: number;
  cleanEnergyPercent: number;
}

export interface MonthlyPoint {
  month: string;
  mwh: number;
}

export interface HourlyPoint {
  hour: string;
  mw: number;
}

export const DISTRICTS: District[] = [
  {
    id: 'downtown',
    name: 'Downtown Core',
    mwh: 1240,
    waste: 28,
    renewable: 5,
    peak: 'Tue 6PM',
    status: 'red',
    coords: [
      [27.952, -82.462],
      [27.952, -82.449],
      [27.943, -82.449],
      [27.943, -82.462],
    ],
  },
  {
    id: 'westshore',
    name: 'Westshore',
    mwh: 920,
    waste: 24,
    renewable: 8,
    peak: 'Mon 8AM',
    status: 'red',
    coords: [
      [27.958, -82.497],
      [27.958, -82.482],
      [27.946, -82.482],
      [27.946, -82.497],
    ],
  },
  {
    id: 'channelside',
    name: 'Channelside',
    mwh: 680,
    waste: 16,
    renewable: 22,
    peak: 'Fri 7PM',
    status: 'amber',
    coords: [
      [27.945, -82.449],
      [27.945, -82.436],
      [27.937, -82.436],
      [27.937, -82.449],
    ],
  },
  {
    id: 'hydepark',
    name: 'Hyde Park',
    mwh: 540,
    waste: 14,
    renewable: 18,
    peak: 'Wed 6PM',
    status: 'amber',
    coords: [
      [27.943, -82.477],
      [27.943, -82.462],
      [27.934, -82.462],
      [27.934, -82.477],
    ],
  },
  {
    id: 'riverwalk',
    name: 'Riverwalk',
    mwh: 430,
    waste: 12,
    renewable: 25,
    peak: 'Sat 8PM',
    status: 'amber',
    coords: [
      [27.952, -82.462],
      [27.952, -82.453],
      [27.944, -82.453],
      [27.944, -82.462],
    ],
  },
  {
    id: 'ybor',
    name: 'Ybor City',
    mwh: 410,
    waste: 8,
    renewable: 34,
    peak: 'Thu 9PM',
    status: 'green',
    coords: [
      [27.961, -82.442],
      [27.961, -82.428],
      [27.952, -82.428],
      [27.952, -82.442],
    ],
  },
  {
    id: 'harbour',
    name: 'Harbour Island',
    mwh: 310,
    waste: 6,
    renewable: 41,
    peak: 'Sun 7PM',
    status: 'green',
    coords: [
      [27.937, -82.455],
      [27.937, -82.445],
      [27.930, -82.445],
      [27.930, -82.455],
    ],
  },
  {
    id: 'armature',
    name: 'Armature Works',
    mwh: 291,
    waste: 5,
    renewable: 38,
    peak: 'Sat 2PM',
    status: 'green',
    coords: [
      [27.966, -82.472],
      [27.966, -82.458],
      [27.958, -82.458],
      [27.958, -82.472],
    ],
  },
];

export const PROJECTS: Project[] = [
  {
    id: 'p1',
    score: 94,
    name: 'Downtown solar canopy network',
    districtId: 'downtown',
    type: 'solar',
    cost: '$4.2M',
    time: '8 months',
    impact: '+42 MW',
    efficiency: 95,
    costScore: 88,
    speed: 90,
  },
  {
    id: 'p2',
    score: 91,
    name: 'Smart LED streetlight grid',
    districtId: 'downtown',
    type: 'efficiency',
    cost: '$1.8M',
    time: '4 months',
    impact: '-28 MW demand',
    efficiency: 90,
    costScore: 95,
    speed: 96,
  },
  {
    id: 'p3',
    score: 88,
    name: 'Westshore HVAC retrofit',
    districtId: 'westshore',
    type: 'efficiency',
    cost: '$1.2M',
    time: '6 months',
    impact: '-180 MWh/yr',
    efficiency: 88,
    costScore: 85,
    speed: 82,
  },
  {
    id: 'p4',
    score: 85,
    name: 'Ybor City wind micro-turbines',
    districtId: 'ybor',
    type: 'wind',
    cost: '$2.1M',
    time: '10 months',
    impact: '+18 MW',
    efficiency: 82,
    costScore: 78,
    speed: 70,
  },
  {
    id: 'p5',
    score: 79,
    name: 'Channelside battery storage',
    districtId: 'channelside',
    type: 'storage',
    cost: '$2.8M',
    time: '14 months',
    impact: '+34% renewable',
    efficiency: 76,
    costScore: 72,
    speed: 65,
  },
  {
    id: 'p6',
    score: 76,
    name: 'Smart grid node mesh',
    districtId: 'hydepark',
    type: 'grid',
    cost: '$3.4M',
    time: '12 months',
    impact: '-15% waste',
    efficiency: 80,
    costScore: 68,
    speed: 72,
  },
];

export const CITY_KPIS: CityKpis = {
  totalMwh: 4821,
  peakMw: 312,
  wastePercent: 18,
  renewablePercent: 23,
  gridStress: 'Medium',
  gridCapacityPercent: 87,
  totalDemandMw: 847,
  cleanEnergyPercent: 31,
};

export const MONTHLY_TREND: MonthlyPoint[] = [
  { month: 'Jan', mwh: 4920 },
  { month: 'Feb', mwh: 4800 },
  { month: 'Mar', mwh: 4750 },
  { month: 'Apr', mwh: 4680 },
  { month: 'May', mwh: 4900 },
  { month: 'Jun', mwh: 5100 },
  { month: 'Jul', mwh: 5300 },
  { month: 'Aug', mwh: 5200 },
  { month: 'Sep', mwh: 4950 },
  { month: 'Oct', mwh: 4821 },
  { month: 'Nov', mwh: 4700 },
  { month: 'Dec', mwh: 4600 },
];

export const HOURLY_PEAK: HourlyPoint[] = [
  { hour: '6am', mw: 140 },
  { hour: '7am', mw: 185 },
  { hour: '8am', mw: 230 },
  { hour: '9am', mw: 258 },
  { hour: '10am', mw: 245 },
  { hour: '11am', mw: 238 },
  { hour: '12pm', mw: 242 },
  { hour: '1pm', mw: 235 },
  { hour: '2pm', mw: 228 },
  { hour: '3pm', mw: 240 },
  { hour: '4pm', mw: 265 },
  { hour: '5pm', mw: 298 },
  { hour: '6pm', mw: 312 },
  { hour: '7pm', mw: 290 },
  { hour: '8pm', mw: 255 },
  { hour: '9pm', mw: 210 },
  { hour: '10pm', mw: 175 },
];

export const ALERTS: Alert[] = [
  {
    level: 'red',
    district: 'Downtown Core',
    message:
      'Peak demand exceeded threshold — Tue 6:00 PM. Recommend load shifting.',
  },
  {
    level: 'amber',
    district: 'Westshore',
    message:
      '3 municipal buildings running HVAC at full capacity on mild-weather days.',
  },
  {
    level: 'amber',
    district: 'Channelside',
    message: '34% of solar output wasted — no battery storage installed.',
  },
];
