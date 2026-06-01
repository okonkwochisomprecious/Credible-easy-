import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, Coins, LogOut, ArrowUpRight, ArrowDownLeft, ShieldCheck, 
  Clock, Flame, HelpCircle, ChevronRight, Activity, Calendar, Receipt, RotateCcw,
  Sliders, Database, Cpu, Sparkles, TrendingUp, DollarSign, ShieldAlert,
  MessageSquare, Smartphone, Copy, Check, Menu, Settings, User
} from 'lucide-react';
import { UserProfile, Transaction } from '../types';
import BillPayments from './BillPayments';
import TradingExchange from './TradingExchange';
import WalletActions from './WalletActions';
import ReceiptModal from './ReceiptModal';
import FounderConsole from './FounderConsole';
import SecurityVault from './SecurityVault';
import ReferralsCenter from './ReferralsCenter';
import ProfileSettings from './ProfileSettings';
import logoUrl from '../assets/images/credible_easy_logo_1780254945335.png';
import { smsBroadcastSystem, SMSNotification } from '../lib/smsService';

interface DashboardProps {
  user: UserProfile;
  onLogout: () => void;
  onUserUpdate: (updatedUser: UserProfile) => void;
}

export default function Dashboard({ user, onLogout, onUserUpdate }: DashboardProps) {
  const isOwner = user.identifier.toLowerCase() === 'okonkwoprecious418@gmail.com' || user.name.toLowerCase().includes('precious okonkwo');

  // Navigation State
  const [activeTab, setActiveTab] = useState<'pay' | 'exchange' | 'referrals' | 'security' | 'profile'>('pay');
  const [bgTheme, setBgTheme] = useState<'slate' | 'cream' | 'wine' | 'charcoal'>(() => {
    const stored = localStorage.getItem('credible_easy_bg_theme');
    if (stored === 'blue') return 'wine';
    return (stored as any) || 'slate';
  });
  
  // Modal controllers
  const [walletModal, setWalletModal] = useState<'add' | 'withdraw' | null>(null);
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<Transaction | null>(null);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Dynamic bulletins & config reload hooks
  const [bulletins, setBulletins] = useState<any[]>([]);
  const [configRefreshCounter, setConfigRefreshCounter] = useState(0);

  // Incoming Simulated SMS Overlays State
  const [incomingSms, setIncomingSms] = useState<SMSNotification | null>(null);
  const [copiedSmsId, setCopiedSmsId] = useState(false);

  // MTN B2B Integration State on Dashboard
  const [mtnB2bInfo, setMtnB2bInfo] = useState<{ status: string; linesCount: number; primaryPhone: string }>({
    status: 'verified',
    linesCount: 5,
    primaryPhone: '+2348039121945'
  });

  const handleConfigRefresh = () => {
    setConfigRefreshCounter(prev => prev + 1);
  };

  useEffect(() => {
    // Subscribe to simulated SMS broadcast gateway
    const unsubscribe = smsBroadcastSystem.subscribe((sms) => {
      setIncomingSms(sms);
      setCopiedSmsId(false);
      
      // Play a cute simulated notification sound using Web Audio API!
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
        
        setTimeout(() => {
          const osc2 = audioCtx.createOscillator();
          const gain2 = audioCtx.createGain();
          osc2.connect(gain2);
          gain2.connect(audioCtx.destination);
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(1046.5, audioCtx.currentTime); // C6
          gain2.gain.setValueAtTime(0.04, audioCtx.currentTime);
          osc2.start();
          osc2.stop(audioCtx.currentTime + 0.15);
        }, 120);
      } catch (err) {
        // block errors if audioContext blocked
      }

      // Automatically clear after 25 seconds
      const timer = setTimeout(() => {
        setIncomingSms(current => current?.id === sms.id ? null : current);
      }, 25000);

      return () => clearTimeout(timer);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Initial dynamic load of active announcements
    const DEFAULT_BULLETINS = [
      {
        id: 'bulletin-1',
        icon: '⚡',
        title: 'EKEDC Tariff Advisory',
        content: 'Attention Prepaid users: EKEDC is modernizing central server pipelines. Keep track of transaction receipts!',
        color: 'indigo'
      },
      {
        id: 'bulletin-2',
        icon: '💧',
        title: 'FCT Water Board Bonus',
        content: 'Pay your Abuja FCT municipal water bill through Credible Easy this week and earn an extra +50 BP loyalty point multiplier!',
        color: 'teal'
      }
    ];
    const saved = localStorage.getItem('credible_easy_bulletins');
    setBulletins(saved ? JSON.parse(saved) : DEFAULT_BULLETINS);

    // Load MTN B2B Config info to show real-time live link badge on Dashboard
    const savedMtn = localStorage.getItem('credible_easy_mtn_b2b_config');
    if (savedMtn) {
      try {
        const parsed = JSON.parse(savedMtn);
        setMtnB2bInfo({
          status: parsed.verificationStatus || 'verified',
          linesCount: parsed.linesConnected ? parsed.linesConnected.length : 0,
          primaryPhone: parsed.connectedPhone || '+2348039121945'
        });
      } catch (e) {
        // use default
      }
    } else {
      const initialMtn = {
        connectedEmail: 'okonkwoprecious418@gmail.com',
        connectedPhone: '+2348039121945',
        apiKey: 'mtn-momo-live-pk_3b72cda90d81b4f420e1ddfbc0023ee',
        partnerId: 'CREDEASY-99',
        webhookUrl: 'https://api.credibleeasy.com/v1/webhooks/mtn',
        verificationStatus: 'verified',
        linesConnected: [
          '+2348031200000',
          '+2348149800000',
          '+2349033300000',
          '+2347065400000',
          '+2348039121945'
        ]
      };
      localStorage.setItem('credible_easy_mtn_b2b_config', JSON.stringify(initialMtn));
      setMtnB2bInfo({
        status: 'verified',
        linesCount: 5,
        primaryPhone: '+2348039121945'
      });
    }
  }, [configRefreshCounter]);
  
  // Local transaction history state loaded matching user profile
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txFilter, setTxFilter] = useState<'all' | 'recharge' | 'bills' | 'trading'>('all');

  // Load user-specific transaction history from LocalStorage
  useEffect(() => {
    const rawTxList = localStorage.getItem(`credible_easy_tx_${user.identifier}`);
    if (rawTxList) {
      const stored = JSON.parse(rawTxList);
      // Filter out pre-allocated mock/placeholder seed transactions to enforce completely real actions
      const realOnly = stored.filter((tx: Transaction) => tx.id !== 'CE-R20499' && tx.id !== 'CE-W18204');
      setTransactions(realOnly);
      localStorage.setItem(`credible_easy_tx_${user.identifier}`, JSON.stringify(realOnly));
    } else {
      // Start with a completely fresh, empty list for real transactions only
      const initialSeed: Transaction[] = [];
      localStorage.setItem(`credible_easy_tx_${user.identifier}`, JSON.stringify(initialSeed));
      setTransactions(initialSeed);
    }
  }, [user.identifier, user.currency]);

  // Real-time ticking clock for dashboard header
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Callback to insert transactions, shift user currency levels, and log history
  const handleTxSuccess = (updatedUser: UserProfile, newTx: Transaction) => {
    onUserUpdate(updatedUser);
    
    // Add transaction to local history array state and persist to localDB match
    const nextTxList = [newTx, ...transactions];
    setTransactions(nextTxList);
    localStorage.setItem(`credible_easy_tx_${user.identifier}`, JSON.stringify(nextTxList));
  };

  // Filter conditions
  const filteredTxs = transactions.filter((tx) => {
    if (txFilter === 'all') return true;
    if (txFilter === 'recharge') return tx.type === 'airtime' || tx.type === 'data';
    if (txFilter === 'bills') return tx.type === 'electricity' || tx.type === 'water';
    if (txFilter === 'trading') return tx.type === 'trading_sell' || tx.type === 'trading_buy';
    return true;
  });

  const currencySymbol = user.currency === 'NGN' ? '₦' : '$';

  // Wipe transaction logs safely for clean state testing
  const handleClearHistory = () => {
    if (confirm("Reset current sandbox transaction stats?")) {
      localStorage.removeItem(`credible_easy_tx_${user.identifier}`);
      setTransactions([]);
    }
  };

  // Owner Administration quick-actions
  const handleOwnerAddCash = () => {
    const extraCash = user.currency === 'NGN' ? 500000 : 1000;
    const updated = {
      ...user,
      balance: user.balance + extraCash,
    };
    onUserUpdate(updated);

    const referenceCode = `OWNER-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const now = new Date();
    const timestampString = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    const bonusTx: Transaction = {
      id: referenceCode,
      type: 'add_funds',
      title: '👑 Owner Cash Drawer Grant',
      amount: extraCash,
      currency: user.currency,
      pointsReward: 0,
      timestamp: timestampString,
      status: 'Completed',
      reference: referenceCode,
      details: { paymentMethod: 'Founder Command Console' }
    };

    const nextTxList = [bonusTx, ...transactions];
    setTransactions(nextTxList);
    localStorage.setItem(`credible_easy_tx_${user.identifier}`, JSON.stringify(nextTxList));
  };

  const handleOwnerAddPoints = () => {
    const extraPoints = 10000;
    const updated = {
      ...user,
      points: user.points + extraPoints,
    };
    onUserUpdate(updated);

    const referenceCode = `OWNER-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const now = new Date();
    const timestampString = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    const bonusTx: Transaction = {
      id: referenceCode,
      type: 'add_funds',
      title: '👑 Owner Point Grant Issued',
      amount: 0,
      currency: user.currency,
      pointsReward: extraPoints,
      timestamp: timestampString,
      status: 'Completed',
      reference: referenceCode,
      details: { paymentMethod: 'Founder Command Console' }
    };

    const nextTxList = [bonusTx, ...transactions];
    setTransactions(nextTxList);
    localStorage.setItem(`credible_easy_tx_${user.identifier}`, JSON.stringify(nextTxList));
  };

  const getThemeClass = () => {
    switch (bgTheme) {
      case 'cream':
        return 'bg-stone-100/90 text-slate-850';
      case 'wine':
        return 'bg-wine-50/25 text-slate-850';
      case 'charcoal':
        return 'bg-slate-900 text-slate-100';
      default:
        return 'bg-slate-100/95 text-slate-900';
    }
  };

  return (
    <div className={`min-h-screen ${getThemeClass()} font-sans pb-16 transition-colors duration-300`}>
      
      {/* 1. COMPACT NAVIGATION HEADER */}
      <nav className="bg-white border-b border-slate-150 shadow-xs sticky top-0 z-40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between h-16 items-center">
          
          <div className="flex items-center gap-2 select-none">
            <div className="h-9 w-9 bg-white border border-slate-100 flex items-center justify-center rounded-xl overflow-hidden shadow-sm">
              <img 
                src={logoUrl} 
                alt="Credible Easy Logo" 
                className="h-full w-full object-cover" 
                referrerPolicy="no-referrer" 
              />
            </div>
            <div>
              <span className="font-sans font-black text-slate-900 tracking-tight text-base leading-none block">Credible Easy</span>
              <span className="text-[9px] text-wine-800 font-extrabold tracking-widest uppercase">MFB Gate</span>
            </div>
          </div>

          {/* Core Info & Live Clock */}
          <div className="hidden md:flex items-center gap-4 text-xs font-mono px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-wine-700" />
              <span>{formatDate(currentTime)}</span>
            </div>
            <span className="text-slate-350">|</span>
            <div className="flex items-center gap-1 text-slate-700 font-extrabold">
              <Clock className="h-3.5 w-3.5 text-wine-800 animate-pulse" />
              <span>{formatTime(currentTime)}</span>
            </div>
          </div>

          {/* User region identification and dropdown menu bar */}
          <div className="flex items-center gap-3 relative">
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5 mb-0.5">
                {isOwner && (
                  <span className="text-[8px] font-black uppercase tracking-wider bg-gradient-to-r from-wine-700 to-wine-800 text-white px-1.5 py-0.5 rounded shadow-sm animate-pulse select-none">
                    👑 Owner
                  </span>
                )}
                <div className="text-xs font-black text-slate-905 leading-none">
                  {user.type === 'nigerian' ? '🇳🇬' : '🌐'} {user.name}
                </div>
              </div>
              <div className="text-[10px] text-slate-400 font-medium font-mono lowercase tracking-wide">
                Ref: {user.identifier}
              </div>
            </div>

            {/* Menu Bar Button */}
            <div className="relative">
              <button
                id="header-menu-button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                  isMenuOpen 
                    ? 'bg-wine-50/80 border-wine-200 text-wine-800 shadow-xs' 
                    : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-750'
                }`}
                title="Application Menu Bar"
              >
                <Menu className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-wide hidden sm:inline">Menu</span>
                <span className="w-1.5 h-1.5 rounded-full bg-wine-600 animate-pulse" />
              </button>

              {/* Dynamic Downward Dropdown Menu Card container */}
              <AnimatePresence>
                {isMenuOpen && (
                  <>
                    {/* Click-out overlay */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsMenuOpen(false)} 
                    />
                    
                    <motion.div
                      id="navigation-dropdown-menu"
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 mt-2 w-56 bg-white border border-slate-150 rounded-2xl shadow-xl z-50 overflow-hidden font-sans"
                    >
                      <div className="p-3 bg-slate-50 border-b border-slate-100 select-none text-left">
                        <span className="text-[9px] tracking-widest font-black uppercase text-slate-400 block mb-1">
                          Connected Account
                        </span>
                        <span className="text-[11px] font-black text-slate-800 block truncate">
                          {user.name}
                        </span>
                        <span className="text-[9.5px] text-slate-450 font-semibold font-mono block truncate lowercase">
                          {user.email || user.identifier}
                        </span>
                      </div>

                      <div className="p-1 px-1.5 py-1.5 space-y-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('profile');
                            setIsMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-black rounded-lg transition-colors text-left cursor-pointer ${
                            activeTab === 'profile'
                              ? 'bg-wine-50 text-wine-800 font-black'
                              : 'text-slate-750 hover:bg-slate-50 hover:text-slate-900 font-bold'
                          }`}
                        >
                          <span className="text-sm">👤</span>
                          <span className="flex-1">Profile Settings</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('pay');
                            setIsMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-black rounded-lg transition-colors text-left cursor-pointer ${
                            activeTab === 'pay'
                              ? 'bg-wine-50 text-wine-800 font-black'
                              : 'text-slate-750 hover:bg-slate-50 hover:text-slate-900 font-bold'
                          }`}
                        >
                          <span className="text-sm">🏠</span>
                          <span className="flex-1">Bills & Airtime</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('exchange');
                            setIsMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-black rounded-lg transition-colors text-left cursor-pointer ${
                            activeTab === 'exchange'
                              ? 'bg-wine-50 text-wine-800 font-black'
                              : 'text-slate-750 hover:bg-slate-50 hover:text-slate-900 font-bold'
                          }`}
                        >
                          <span className="text-sm">📈</span>
                          <span className="flex-1">BP Trading Center</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('referrals');
                            setIsMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-black rounded-lg transition-colors text-left cursor-pointer ${
                            activeTab === 'referrals'
                              ? 'bg-wine-50 text-wine-800 font-black'
                              : 'text-slate-750 hover:bg-slate-50 hover:text-slate-900 font-bold'
                          }`}
                        >
                          <span className="text-sm">👥</span>
                          <span className="flex-1">Invite & Cash Bonus</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('security');
                            setIsMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-black rounded-lg transition-colors text-left cursor-pointer ${
                            activeTab === 'security'
                              ? 'bg-wine-50 text-wine-800 font-black'
                              : 'text-slate-750 hover:bg-slate-50 hover:text-slate-900 font-bold'
                          }`}
                        >
                          <span className="text-sm">🛡️</span>
                          <span className="flex-1">Security Vault</span>
                        </button>
                      </div>

                      <div className="p-1 px-1.5 border-t border-slate-100 bg-slate-50/50 py-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-black text-red-650 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="h-4 w-4 text-red-600" />
                          <span>Exit Session</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </nav>

      {/* 2. MAIN GRID CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        
        {/* WALLET OVERVIEW (BENTO CARD GRID) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Main Wallet Currency Balance */}
          <div className="bg-white rounded-2xl p-6 border border-slate-150 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 h-28 w-28 bg-wine-600/5 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-450 uppercase tracking-widest">
                <Wallet className="h-4 w-4 text-wine-700" />
                Wallet Cash Balance
              </div>
              <h2 className="text-3xl font-black text-slate-950 tracking-tight font-mono mt-3">
                {currencySymbol}{user.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setWalletModal('add')}
                className="flex-1 bg-wine-700 text-white rounded-xl py-2 px-3 text-xs font-black hover:bg-wine-800 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowUpRight className="h-4 w-4" />
                Fund Wallet
              </button>
              <button
                onClick={() => setWalletModal('withdraw')}
                className="flex-1 bg-slate-950 text-white rounded-xl py-2 px-3 text-xs font-black hover:bg-slate-800 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowDownLeft className="h-4 w-4" />
                Withdrawal
              </button>
            </div>
          </div>

          {/* Loyalty Points Wallet */}
          <div className="bg-slate-950 text-white rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 h-24 w-24 bg-wine-600/10 rounded-full blur-xl pointer-events-none"></div>
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <Coins className="h-4 w-4 text-wine-400" />
                  Credible Buzi Points (BP)
                </div>
                <span className="text-[10px] bg-wine-900/40 text-wine-300 border border-wine-800/40 px-2 py-0.5 rounded-full font-bold select-none">
                  Cashable BP
                </span>
              </div>
              <h2 className="text-3xl font-black text-wine-400 tracking-tight font-mono mt-3">
                {user.points.toLocaleString()} <span className="text-sm font-bold text-slate-400 font-sans">BP</span>
              </h2>
              <p className="text-[11px] text-slate-455 mt-1">
                Earned via electricity recharges (2%) and airtime topups (5%).
              </p>
            </div>
            <button
              onClick={() => setActiveTab('exchange')}
              className="w-full bg-wine-800 hover:bg-wine-900 text-white py-2 text-xs font-black rounded-xl mt-4 flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              Navigate Point Trading Exchange
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Quick Stats / Tip Carousel */}
          <div className="bg-white rounded-2xl p-6 border border-slate-150 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-450 uppercase tracking-widest">
                <span>Loyalty Multiplier</span>
                <span className="text-emerald-700 font-black flex items-center gap-0.5 font-mono bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                  <Flame className="h-3 w-3 inline animate-bounce text-emerald-600" /> 2.5x Hot
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                <span className="text-xs font-extrabold text-slate-800 block">Current Exchange Price Index:</span>
                <span className="text-xs text-slate-500 font-medium">1 Buzi Point (BP) is currently trading globally value:</span>
                <span className="text-xs font-bold text-wine-700 font-mono block">
                  {currencySymbol}{user.type === 'nigerian' ? '10.00 NGN' : '0.007 USD'}
                </span>
              </div>
            </div>
            
            <div className="text-[10.5px] text-slate-400 font-medium flex gap-1 items-center mt-3 leading-normal border-t border-slate-100 pt-3">
              <HelpCircle className="h-4 w-4 text-slate-300 flex-shrink-0" />
              <span>Liquidate points anytime into wallet cash inside the Trading Center below!</span>
            </div>
          </div>

        </div>

        {/* 3. APP SCREEN NAVIGATION & LAYOUT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* A. PLATFORM SIDEBAR MENU (LEFT SIDE) */}
          <div className="lg:col-span-1 space-y-4">
            {/* Horizontal menu slider for mobile devices */}
            <div id="mobile-menu-slider" className="lg:hidden flex bg-slate-200/50 p-1.5 rounded-2xl w-full overflow-x-auto gap-1 border border-slate-250/60 scrollbar-none sticky top-[4.2rem] z-30 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 text-xs font-black rounded-xl shrink-0 transition-all cursor-pointer ${
                  activeTab === 'profile' ? 'bg-wine-800 text-white shadow-sm' : 'text-slate-655 font-bold hover:text-slate-900'
                }`}
              >
                👤 Profile Settings
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pay')}
                className={`px-4 py-2 text-xs font-black rounded-xl shrink-0 transition-all cursor-pointer ${
                  activeTab === 'pay' ? 'bg-wine-800 text-white shadow-sm' : 'text-slate-655 font-bold hover:text-slate-900'
                }`}
              >
                🏠 Recharges
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('exchange')}
                className={`px-4 py-2 text-xs font-black rounded-xl shrink-0 transition-all cursor-pointer ${
                  activeTab === 'exchange' ? 'bg-wine-800 text-white shadow-sm' : 'text-slate-655 font-bold hover:text-slate-900'
                }`}
              >
                📈 BP Exchange
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('referrals')}
                className={`px-4 py-2 text-xs font-black rounded-xl shrink-0 transition-all cursor-pointer ${
                  activeTab === 'referrals' ? 'bg-wine-800 text-white shadow-sm' : 'text-slate-655 font-bold hover:text-slate-900'
                }`}
              >
                👥 Invite & Earn
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`px-4 py-2 text-xs font-black rounded-xl shrink-0 transition-all cursor-pointer ${
                  activeTab === 'security' ? 'bg-wine-800 text-white shadow-sm' : 'text-slate-655 font-bold hover:text-slate-900'
                }`}
              >
                🛡️ Security Vault
              </button>
              {isOwner && (
                <button
                  type="button"
                  onClick={() => setIsConsoleOpen(true)}
                  className="px-4 py-1.5 text-xs font-black rounded-xl shrink-0 bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-bold transition-all border border-yellow-600/30"
                >
                  👑 Founder Panel
                </button>
              )}
            </div>

            {/* Vertical column menu sidebar for desktop views */}
            <div id="desktop-sidebar-menu" className="hidden lg:block bg-white rounded-3xl border border-slate-150 p-4 shadow-sm space-y-1 sticky top-24">
              <span className="text-[10px] tracking-widest font-black uppercase text-slate-400 px-3 pb-1.5 block select-none">Platform Menu</span>
              
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs font-black rounded-xl transition-all cursor-pointer text-left ${
                  activeTab === 'profile'
                    ? 'bg-wine-800 text-white shadow-md'
                    : 'text-slate-650 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="text-base leading-none">👤</span>
                <span>Profile Settings</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('pay')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs font-black rounded-xl transition-all cursor-pointer text-left ${
                  activeTab === 'pay'
                    ? 'bg-wine-800 text-white shadow-md'
                    : 'text-slate-650 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="text-base leading-none">🏠</span>
                <span>Bills & Airtime</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('exchange')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs font-black rounded-xl transition-all cursor-pointer text-left ${
                  activeTab === 'exchange'
                    ? 'bg-wine-800 text-white shadow-md'
                    : 'text-slate-650 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="text-base leading-none">📈</span>
                <span>BP Trading Center</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('referrals')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs font-black rounded-xl transition-all cursor-pointer text-left ${
                  activeTab === 'referrals'
                    ? 'bg-wine-800 text-white shadow-md'
                    : 'text-slate-650 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="text-base leading-none">👥</span>
                <span className="flex-1">Invite & Cash Bonus</span>
                <span className="text-[9.5px] bg-wine-200 text-wine-950 font-black px-1.5 py-0.5 rounded uppercase leading-none">₦1,500</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs font-black rounded-xl transition-all cursor-pointer text-left ${
                  activeTab === 'security'
                     ? 'bg-wine-800 text-white shadow-md'
                     : 'text-slate-650 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="text-base leading-none">🛡️</span>
                <span>Security Vault</span>
              </button>

              {isOwner && (
                <button
                  type="button"
                  onClick={() => setIsConsoleOpen(true)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs font-black rounded-xl transition-all cursor-pointer text-left text-slate-750 hover:text-amber-950 hover:bg-amber-50 border border-dashed border-amber-300 mt-2`}
                >
                  <span className="text-base leading-none font-bold text-slate-900">👑</span>
                  <span className="flex-1 font-extrabold text-slate-800">Founder Terminal</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                </button>
              )}

              {/* EYE COMFORT COLOR CANVAS SELECTOR */}
              <div className="pt-3 border-t border-slate-100 mt-2 select-none">
                <span className="text-[10px] tracking-widest font-black uppercase text-slate-400 px-3 pb-1.5 block">
                  🎨 Theme Canvas
                </span>
                <div className="grid grid-cols-4 gap-1.5 px-2">
                  <button
                    type="button"
                    title="Default Minimal Slate"
                    onClick={() => {
                      setBgTheme('slate');
                      localStorage.setItem('credible_easy_bg_theme', 'slate');
                    }}
                    className={`h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                      bgTheme === 'slate'
                        ? 'border-wine-600 bg-slate-100 ring-2 ring-wine-600/15 scale-105 shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <span className="h-3.5 w-3.5 rounded-full bg-slate-200 border border-slate-400 block" />
                  </button>
                  <button
                    type="button"
                    title="Warm Cream Eye Comfort"
                    onClick={() => {
                      setBgTheme('cream');
                      localStorage.setItem('credible_easy_bg_theme', 'cream');
                    }}
                    className={`h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                      bgTheme === 'cream'
                        ? 'border-amber-600 bg-amber-55 ring-2 ring-amber-600/10 scale-105 shadow-xs'
                        : 'border-slate-200 bg-amber-50/40 hover:bg-amber-100/40'
                    }`}
                  >
                    <span className="h-3.5 w-3.5 rounded-full bg-amber-150 border border-amber-300 block" />
                  </button>
                  <button
                    type="button"
                    title="Sovereign Premium Wine"
                    onClick={() => {
                      setBgTheme('wine');
                      localStorage.setItem('credible_easy_bg_theme', 'wine');
                    }}
                    className={`h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                      bgTheme === 'wine'
                        ? 'border-wine-600 bg-wine-50 ring-2 ring-wine-600/15 scale-105 shadow-xs'
                        : 'border-slate-200 bg-wine-50/40 hover:bg-wine-100/40'
                    }`}
                  >
                    <span className="h-3.5 w-3.5 rounded-full bg-wine-200 border border-wine-300 block" />
                  </button>
                  <button
                    type="button"
                    title="Charcoal Dark Mode"
                    onClick={() => {
                      setBgTheme('charcoal');
                      localStorage.setItem('credible_easy_bg_theme', 'charcoal');
                    }}
                    className={`h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                      bgTheme === 'charcoal'
                        ? 'border-slate-800 bg-slate-800 ring-2 ring-slate-800/20 scale-105 shadow-xs'
                        : 'border-slate-200 bg-slate-900 hover:bg-slate-850'
                    }`}
                  >
                    <span className="h-3.5 w-3.5 rounded-full bg-slate-850 border border-slate-700 block" />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-3.5 py-3 text-xs font-black rounded-xl text-red-650 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer text-left"
                >
                  <span className="text-base leading-none">🚪</span>
                  <span>Exit Session</span>
                </button>
              </div>
            </div>
            
            {/* Quick Stats / Tip Carousel (Desktop Only, keeps screen balanced!) */}
            <div className="hidden lg:block bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Loyalty Rate Index</span>
                  <span className="text-emerald-700 font-black flex items-center gap-0.5 font-mono bg-emerald-50 px-1.5 py-0.5 rounded text-[9px] uppercase">
                    <Flame className="h-3 w-3 inline animate-bounce text-emerald-600" /> 2.5x Hot
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                  <span className="text-xs font-extrabold text-slate-700 block leading-tight">BP Price Value:</span>
                  <span className="text-[11px] font-bold text-wine-700 font-mono block">
                    {currencySymbol}{user.type === 'nigerian' ? '10.00 NGN' : '0.007 USD'}
                  </span>
                </div>
              </div>
              <div className="text-[10.5px] text-slate-400 font-medium flex gap-2 items-start leading-tight">
                <HelpCircle className="h-4 w-4 text-slate-300 shrink-0 mt-0.5" />
                <span>Liquidate points anytime into wallet cash inside the Trading Center below!</span>
              </div>
            </div>

          </div>

          {/* B. ACTIVE VIEW CHANGER SECTION (RIGHT SIDE) */}
          <div className="lg:col-span-3 space-y-6">
            <AnimatePresence mode="wait">
              
              {activeTab === 'pay' && (
                <motion.div
                  key="view-pay"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start"
                >
                  {/* Left segment is 2Columns: payment forms + invoice list */}
                  <div className="md:col-span-2 space-y-6">
                    <BillPayments user={user} onTxSuccess={handleTxSuccess} />
                    
                    {/* TRANSACTIONS HISTORY LEDGER TABLE */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                            <Activity className="h-4.5 w-4.5 text-wine-600" />
                            Secure Ledger Logs
                          </h3>
                          <p className="text-xs text-slate-450 font-medium leading-none">Verify blockchain-secured utilities invoices</p>
                        </div>

                        <div className="flex gap-1.5 flex-wrap">
                          {[
                            { id: 'all', label: 'All Activity' },
                            { id: 'recharge', label: 'Recharges' },
                            { id: 'bills', label: 'Utility Bills' },
                            { id: 'trading', label: 'BP Trades' }
                          ].map((chip) => (
                            <button
                              key={chip.id}
                              onClick={() => setTxFilter(chip.id as any)}
                              className={`px-2.5 py-1 text-[10px] rounded-lg font-black border transition-all cursor-pointer ${
                                txFilter === chip.id
                                  ? 'bg-slate-900 text-white border-slate-900'
                                  : 'bg-slate-50 text-slate-550 border-slate-250 hover:bg-slate-100'
                              }`}
                            >
                              {chip.label}
                            </button>
                          ))}
                          
                          {transactions.length > 0 && (
                            <button
                              onClick={handleClearHistory}
                              className="px-2 py-1 text-[10.5px] text-red-600 hover:bg-red-50 border border-dashed border-red-200 rounded-lg font-bold cursor-pointer"
                              title="Reset statements"
                            >
                              <RotateCcw className="h-3 w-3 inline" />
                            </button>
                          )}
                        </div>
                      </div>

                      {filteredTxs.length > 0 ? (
                        <div className="overflow-x-auto scrollbar-none">
                          <table className="w-full text-xs text-left text-slate-500">
                            <thead className="text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50 select-none">
                              <tr>
                                <th className="px-3 py-2.5 font-bold rounded-l-xl">Reference</th>
                                <th className="px-3 py-2.5 font-bold">Transaction Detail</th>
                                <th className="px-3 py-2.5 font-bold text-right5 text-right">Debit / Credit</th>
                                <th className="px-3 py-2.5 font-bold text-right">Points</th>
                                <th className="px-3 py-2.5 font-bold text-right rounded-r-xl">Receipt</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                              {filteredTxs.map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                                  <td className="px-3 py-3 font-mono text-slate-455 text-[11px] font-semibold">{tx.id}</td>
                                  <td className="px-3 py-3">
                                    <span className="block font-bold text-slate-850 leading-tight">{tx.title}</span>
                                    <span className="text-[10px] text-slate-400 font-sans tracking-wide">{tx.timestamp}</span>
                                  </td>
                                  <td className="px-3 py-3 text-right font-black font-mono text-slate-950">
                                    {tx.type === 'add_funds' || tx.type === 'trading_sell' ? '+' : '-'}
                                    {currencySymbol}{tx.amount.toLocaleString()}
                                  </td>
                                  <td className="px-3 py-3 text-right font-mono font-bold">
                                    <span className={tx.pointsReward >= 0 ? "text-emerald-700" : "text-slate-500"}>
                                      {tx.pointsReward >= 0 ? `+${tx.pointsReward}` : tx.pointsReward} BP
                                    </span>
                                  </td>
                                  <td className="px-3 py-3 text-right font-sans">
                                    <button
                                      onClick={() => setSelectedTxForReceipt(tx)}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 hover:bg-slate-150 text-[10px] text-slate-700 font-black rounded-lg border border-slate-200 transition-colors cursor-pointer"
                                    >
                                      <Receipt className="h-3 w-3" />
                                      Receipt
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-10 space-y-2">
                          <span className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 mx-auto">📭</span>
                          <p className="text-xs font-bold text-slate-700">No matching logs found.</p>
                          <p className="text-[11px] text-slate-400">Perform sub-bills payments or add funds above to populate ledger stats.</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Right segment is 1Column: admin panels + bulletins */}
                  <div className="md:col-span-1 space-y-6">
                    
                    {/* 👑 ADMINISTRATOR SYSTEM CONSOLE */}
                    {isOwner && (
                      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-wine-950 text-white rounded-3xl border border-slate-800 shadow-xl p-5 space-y-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 h-32 w-32 bg-wine-500/10 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="absolute -bottom-8 -left-8 h-24 w-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
                        
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 flex items-center gap-1 w-fit mb-1 leading-none">
                              <Sparkles className="h-3 w-3 text-amber-400" /> Founder Center
                            </span>
                            <h4 className="text-sm font-black text-slate-100 font-sans uppercase tracking-tight">Owner Control</h4>
                          </div>
                          <Cpu className="h-5 w-5 text-wine-400 animate-spin" style={{ animationDuration: '6s' }} />
                        </div>
                        
                        <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">
                          Welcome, <strong>{user.name}</strong>! Adjust parameters, edit simulated accounts, and publish bulletins on the dashboard menu.
                        </p>

                        <button
                          onClick={() => setIsConsoleOpen(true)}
                          className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-550 hover:to-amber-650 text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer border-0"
                        >
                          <Sliders className="h-4 w-4 animate-spin" style={{ animationDuration: '4s' }} />
                          Launch Founder Terminal
                        </button>

                        <a
                          href="https://ai.studio/build"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/60 text-wine-300 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center group"
                          title="Return to AI Studio Build Workspace to continue coding"
                        >
                          <Sparkles className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
                          <span>Return to AI Studio Workspace</span>
                        </a>

                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60 pt-3">
                          <button
                            onClick={handleOwnerAddCash}
                            className="flex flex-col items-center justify-center p-2 bg-slate-800/85 hover:bg-slate-800 hover:border-wine-500 active:scale-95 border border-slate-700 rounded-xl transition-all cursor-pointer text-center group"
                          >
                            <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 group-hover:text-wine-400">Mint Capital</span>
                            <span className="text-[11px] font-bold text-slate-200 mt-0.5">
                              {user.currency === 'NGN' ? '+₦500,000' : '+$1,000'}
                            </span>
                          </button>

                          <button
                            onClick={handleOwnerAddPoints}
                            className="flex flex-col items-center justify-center p-2 bg-slate-800/85 hover:bg-slate-800 hover:border-amber-500 active:scale-95 border border-slate-700 rounded-xl transition-all cursor-pointer text-center group"
                          >
                            <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 group-hover:text-amber-400">Mint Points</span>
                            <span className="text-[11px] font-bold text-slate-200 mt-0.5">+10,000 BP</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Regional Bulletins list */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                        Regional Board Bulletins
                      </h4>
                      
                      <div className="space-y-3">
                        {bulletins.length > 0 ? (
                          bulletins.map((b) => {
                            const styleMap: Record<string, string> = {
                              indigo: 'bg-indigo-50 border-indigo-100 text-indigo-950',
                              teal: 'bg-teal-50 border-teal-100 text-teal-950',
                              amber: 'bg-amber-50 border-amber-100 text-amber-950',
                              rose: 'bg-rose-50 border-rose-100 text-rose-950',
                            };
                            const cardStyle = styleMap[b.color] || styleMap.indigo;
                            return (
                              <div key={b.id} className={`p-3 border rounded-xl space-y-1 text-[11px] ${cardStyle}`}>
                                <span className="font-extrabold flex items-center gap-1">
                                  {b.icon} {b.title}
                                </span>
                                <p className="leading-snug text-[10.5px] font-medium font-sans">
                                  {b.content}
                                </p>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-6 text-slate-400">
                            <p className="text-[11px] italic">No active bulletins.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sandbox note */}
                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-3xl space-y-2 text-[11px] text-slate-500">
                      <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                        🛡️ Sandbox Securities
                      </div>
                      <p className="leading-normal">
                        All payments are mock executions. Funding triggers simulated deposits with zero real financial exposure. Receipts are secured on browser local states.
                      </p>
                    </div>

                  </div>
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <ProfileSettings user={user} onUserUpdate={onUserUpdate} />
              )}

              {activeTab === 'exchange' && (
                <motion.div
                  key="view-exchange"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                >
                  <TradingExchange user={user} onTxSuccess={handleTxSuccess} />
                  
                  {/* BP Exchange transactions Ledger */}
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                      <Clock className="h-4.5 w-4.5 text-wine-600" />
                      Exchange Trades History
                    </h3>
                    {transactions.filter(t => t.type.startsWith('trading')).length > 0 ? (
                      <div className="overflow-x-auto scrollbar-none">
                        <table className="w-full text-xs text-left text-slate-500">
                          <thead className="text-[10px] text-slate-400 bg-slate-50 uppercase tracking-widest rounded-xl">
                            <tr>
                              <th className="px-3 py-2 font-bold">Ref</th>
                              <th className="px-3 py-2 font-bold">Action</th>
                              <th className="px-3 py-2 font-bold text-right">Points traded</th>
                              <th className="px-3 py-2 font-bold text-right">Value</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-755 font-medium">
                            {transactions.filter(t => t.type.startsWith('trading')).map((tx) => (
                              <tr key={tx.id} className="hover:bg-slate-50/50">
                                <td className="px-3 py-3 font-mono font-semibold">{tx.id}</td>
                                <td className="px-3 py-3 font-bold">{tx.title}</td>
                                <td className="px-3 py-3 text-right font-bold text-indigo-700">{tx.pointsReward} BP</td>
                                <td className="px-3 py-3 text-right font-black font-mono text-slate-900">{currencySymbol}{tx.amount.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-400 text-xs">
                        No trade orders performed yet. Cash out or buy loyalty packages inside the Point Center above.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'referrals' && (
                <motion.div
                  key="view-referrals"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                >
                  <ReferralsCenter user={user} />
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  key="view-security"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.15 }}
                >
                  <SecurityVault user={user} onUserUpdate={onUserUpdate} />
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>

      </main>

      {/* 4. MODALS */}
      <AnimatePresence>
        {walletModal && (
          <WalletActions
            user={user}
            isOpen={walletModal}
            onClose={() => setWalletModal(null)}
            onTxSuccess={handleTxSuccess}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedTxForReceipt && (
          <ReceiptModal
            tx={selectedTxForReceipt}
            onClose={() => setSelectedTxForReceipt(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isConsoleOpen && (
          <FounderConsole
            isOpen={isConsoleOpen}
            onClose={() => setIsConsoleOpen(false)}
            currentUser={user}
            onUserUpdate={onUserUpdate}
            onConfigChange={handleConfigRefresh}
          />
        )}
      </AnimatePresence>

      {/* REAL-TIME SMS ALERTS CORNER */}
      <AnimatePresence>
        {incomingSms && (
          <motion.div
            initial={{ opacity: 0, y: -80, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9, transition: { duration: 0.2 } }}
            className="fixed top-5 right-5 z-[99999] w-[335px] bg-slate-900 border border-slate-800 text-white p-4 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md"
          >
            {/* Top Device Bar */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-extrabold pb-2 border-b border-white/5 mb-2.5">
              <span className="flex items-center gap-1.5 uppercase font-black text-wine-400 tracking-wider">
                <MessageSquare className="h-3.5 w-3.5" /> SMS Messenger Node
              </span>
              <span className="text-[9.5px] font-mono">SIM-1 (MTN-NG)</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[10.5px] font-sans font-black uppercase text-slate-300 tracking-wide">
                  +234 Operator Core
                </span>
                <span className="text-[9px] text-slate-500 font-bold font-mono">Just Now</span>
              </div>
              <p className="text-[11px] text-slate-200 font-mono leading-relaxed select-all">
                {incomingSms.message}
              </p>
            </div>

            {/* Quick action controls for high sandbox efficiency */}
            <div className="flex gap-2 mt-3.5 pt-2.5 border-t border-white/5">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(incomingSms.code);
                  setCopiedSmsId(true);
                  setTimeout(() => setCopiedSmsId(false), 2000);
                }}
                className="flex-1 bg-wine-600 hover:bg-wine-700 text-white text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedSmsId ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Copied OTP!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy {incomingSms.code}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIncomingSms(null)}
                className="bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white text-[10px] font-bold px-3.5 py-1.5 rounded-lg transition-all cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
