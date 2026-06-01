export type UserType = 'nigerian' | 'foreigner';

export interface UserProfile {
  type: UserType;
  identifier: string; // The email login identifier
  name: string;
  balance: number; // in local currency (Naira for Nigerian, USD for Foreigner)
  points: number; // Loyalty Buzi Points
  currency: 'NGN' | 'USD';
  email?: string; // Stored user email address for multi-channel dispatches
  network?: string; // MTN, Glo, Airtel, 9mobile
  country?: string; // e.g. United Kingdom, USA, etc.
  phoneNumber?: string; // Store phone for airtime/data top-ups
  transactionPin?: string; // 4-digit payment authentication code
  security2fa?: boolean; // Simulated 2-Factor Authentication trigger
  biometricsEnabled?: boolean; // Simulated biometric bypass
  dailyTxLimit?: number; // Custom cap on daily spending limit
  inviteCodeUsed?: string; // Store invitation code verified on onboard
}

export type TransactionType = 
  | 'airtime' 
  | 'data' 
  | 'electricity' 
  | 'water' 
  | 'trading_sell' 
  | 'trading_buy' 
  | 'add_funds' 
  | 'withdraw';

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  currency: 'NGN' | 'USD';
  pointsReward: number; // Points gained or used
  timestamp: string;
  status: 'Completed' | 'Pending' | 'Failed';
  reference: string;
  details: {
    phone?: string;
    network?: string;
    meterNumber?: string;
    provider?: string;
    tokensCredit?: string; // For prepaid electricity tokens
    customerId?: string;
    pointsTraded?: number;
    rate?: number;
    paymentMethod?: string;
    bankName?: string;
    accountNumber?: string;
  };
}

export interface TradeOrder {
  id: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  total: number;
  timestamp: string;
  status: 'Completed' | 'Pending';
  userName: string;
}

export interface NetworkProvider {
  id: string;
  name: string;
  logo: string;
  color: string;
}

export interface DataPlan {
  id: string;
  name: string;
  price: number;
  volume: string;
  validity: string;
}

export interface UtilityProvider {
  id: string;
  name: string;
  category: 'electricity' | 'water';
  logo: string;
  shortName: string;
}
