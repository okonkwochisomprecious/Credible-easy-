import { NetworkProvider, DataPlan, UtilityProvider, TradeOrder } from './types';

export const NIGERIAN_NETWORKS: NetworkProvider[] = [
  { id: 'mtn', name: 'MTN Nigeria', logo: 'MTN', color: 'bg-yellow-450 text-black border-yellow-500' },
  { id: 'glo', name: 'GLO Mobile', logo: 'GLO', color: 'bg-green-600 text-white border-green-700' },
  { id: 'airtel', name: 'Airtel Nigeria', logo: 'Airtel', color: 'bg-red-600 text-white border-red-700' },
  { id: '9mobile', name: '9mobile', logo: '9mobile', color: 'bg-emerald-900 text-white border-emerald-950' }
];

export const FOREIGN_NETWORKS: NetworkProvider[] = [
  { id: 'vodafone', name: 'Vodafone Global', logo: 'Vodafone', color: 'bg-red-500 text-white border-red-600' },
  { id: 'tmobile', name: 'T-Mobile US', logo: 'T-Mobile', color: 'bg-pink-600 text-white border-pink-700' },
  { id: 'orange', name: 'Orange Europe', logo: 'Orange', color: 'bg-orange-500 text-white border-orange-600' },
  { id: 'att', name: 'AT&T US', logo: 'AT&T', color: 'bg-cyan-500 text-white border-cyan-600' }
];

export const NIGERIAN_DATA_PLANS: Record<string, DataPlan[]> = {
  mtn: [
    { id: 'm1', name: 'MTN Daily Lite', volume: '1.5GB', price: 1200, validity: '24 Hours' },
    { id: 'm2', name: 'MTN Weekly Value', volume: '5GB', price: 2500, validity: '7 Days' },
    { id: 'm3', name: 'MTN Monthly Super', volume: '15GB', price: 5000, validity: '30 Days' },
    { id: 'm4', name: 'MTN Monthly Mega', volume: '50GB', price: 12000, validity: '30 Days' }
  ],
  glo: [
    { id: 'g1', name: 'GLO Daily Special', volume: '2GB', price: 1000, validity: '24 Hours' },
    { id: 'g2', name: 'GLO Weekly Special', volume: '7GB', price: 2000, validity: '7 Days' },
    { id: 'g3', name: 'GLO Monthly Grande', volume: '20GB', price: 4500, validity: '30 Days' },
    { id: 'g4', name: 'GLO Monthly Unlimited', volume: '80GB', price: 15000, validity: '30 Days' }
  ],
  airtel: [
    { id: 'a1', name: 'Airtel Binge', volume: '2GB', price: 1200, validity: '24 Hours' },
    { id: 'a2', name: 'Airtel Weekly Max', volume: '6GB', price: 2500, validity: '7 Days' },
    { id: 'a3', name: 'Airtel Monthly Essential', volume: '18GB', price: 5000, validity: '30 Days' },
    { id: 'a4', name: 'Airtel Monthly Premium', volume: '45GB', price: 11000, validity: '30 Days' }
  ],
  '9mobile': [
    { id: 'n1', name: '9mobile Daily Mini', volume: '1GB', price: 800, validity: '24 Hours' },
    { id: 'n2', name: '9mobile Weekly Blast', volume: '5GB', price: 2000, validity: '7 Days' },
    { id: 'n3', name: '9mobile Monthly Lite', volume: '12GB', price: 4000, validity: '30 Days' },
    { id: 'n4', name: '9mobile Monthly Premium', volume: '40GB', price: 10000, validity: '30 Days' }
  ]
};

export const FOREIGN_DATA_PLANS: Record<string, DataPlan[]> = {
  vodafone: [
    { id: 'v1', name: 'Vodafone Day Pass', volume: '3GB', price: 5, validity: '1 Day' },
    { id: 'v2', name: 'Vodafone Traveler Pack', volume: '15GB', price: 20, validity: '14 Days' },
    { id: 'v3', name: 'Vodafone Unlimited Monthly', volume: 'Unlimited', price: 45, validity: '30 Days' }
  ],
  tmobile: [
    { id: 't1', name: 'T-Mobile Tourist Pass', volume: '2GB', price: 10, validity: '7 Days' },
    { id: 't2', name: 'T-Mobile Standard LTE', volume: '10GB', price: 25, validity: '30 Days' },
    { id: 't3', name: 'T-Mobile Direct Unlimited', volume: 'Unlimited 5G', price: 50, validity: '30 Days' }
  ],
  orange: [
    { id: 'o1', name: 'Orange Europe Holiday', volume: '12GB', price: 15, validity: '14 Days' },
    { id: 'o2', name: 'Orange Europe Plus', volume: '30GB', price: 30, validity: '30 Days' }
  ],
  att: [
    { id: 'at1', name: 'AT&T Prepaid Basic', volume: '5GB', price: 15, validity: '30 Days' },
    { id: 'at2', name: 'AT&T Prepaid Unlimited', volume: 'Unlimited', price: 40, validity: '30 Days' }
  ]
};

export const UTILITY_PROVIDERS: UtilityProvider[] = [
  { id: 'ekedc', name: 'Eko Electricity (EKEDC)', category: 'electricity', logo: '⚡', shortName: 'EKEDC' },
  { id: 'ikedc', name: 'Ikeja Electricity (IKEDC)', category: 'electricity', logo: '⚡', shortName: 'IKEDC' },
  { id: 'aedc', name: 'Abuja Electricity (AEDC)', category: 'electricity', logo: '⚡', shortName: 'AEDC' },
  { id: 'kedco', name: 'Kano Electricity (KEDCO)', category: 'electricity', logo: '⚡', shortName: 'KEDCO' },
  { id: 'lwc', name: 'Lagos Water Corp (LWC)', category: 'water', logo: '💧', shortName: 'LWC' },
  { id: 'fctwb', name: 'Abuja FCT Water Board', category: 'water', logo: '💧', shortName: 'FCTWB' },
  
  // Foreigner-friendly Utilities
  { id: 'gridsafe', name: 'GridSafe US Power', category: 'electricity', logo: '⚡', shortName: 'GridSafe' },
  { id: 'natgrid', name: 'National Grid UK', category: 'electricity', logo: '⚡', shortName: 'NatGrid' },
  { id: 'thames', name: 'Thames Water UK', category: 'water', logo: '💧', shortName: 'Thames' },
  { id: 'metrowater', name: 'Metro Water US', category: 'water', logo: '💧', shortName: 'MetroWater' }
];

export const INITIAL_TRADE_BOOK: TradeOrder[] = [
  { id: 'to-1', type: 'buy', quantity: 150, price: 9.8, total: 1470, timestamp: '18:35', userName: 'Yusuf A.', status: 'Pending' },
  { id: 'to-2', type: 'buy', quantity: 420, price: 9.65, total: 4053, timestamp: '18:33', userName: 'Chinedu O.', status: 'Pending' },
  { id: 'to-3', type: 'sell', quantity: 95, price: 10.15, total: 964.25, timestamp: '18:40', userName: 'Sarah M.', status: 'Pending' },
  { id: 'to-4', type: 'sell', quantity: 280, price: 10.3, total: 2884, timestamp: '18:29', userName: 'Adekunle K.', status: 'Pending' },
  { id: 'to-5', type: 'buy', quantity: 600, price: 9.5, total: 5700, timestamp: '18:25', userName: 'Fatima Z.', status: 'Pending' }
];

export const INITIAL_NIGERIAN_MOCK_METERS: Record<string, string> = {
  '01010101010': 'Precious Okonkwo',
  '11122233344': 'Alhaji Musa Dangote',
  '22233344455': 'Olawale Gabriel',
  '55566677788': 'Amara Nwachukwu',
  '12345678901': 'Credible Easy Test'
};

export const INITIAL_FOREIGN_MOCK_METERS: Record<string, string> = {
  '98765432100': 'Johnathan Smith',
  '123456789': 'Emma Watson',
  '555555555': 'David Beckham',
  '12345': 'Credible Easy International Service'
};
