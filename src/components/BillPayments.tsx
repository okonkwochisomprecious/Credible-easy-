import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Wifi, Zap, Droplet, UserCheck, AlertCircle, ArrowRight, Search, FileText } from 'lucide-react';
import { UserProfile, Transaction, UtilityProvider, NetworkProvider, DataPlan } from '../types';
import { 
  NIGERIAN_NETWORKS, 
  FOREIGN_NETWORKS, 
  NIGERIAN_DATA_PLANS, 
  FOREIGN_DATA_PLANS, 
  UTILITY_PROVIDERS,
  INITIAL_NIGERIAN_MOCK_METERS,
  INITIAL_FOREIGN_MOCK_METERS
} from '../constants';
import SecureGatewayModal from './SecureGatewayModal';

interface BillPaymentsProps {
  user: UserProfile;
  onTxSuccess: (updatedUser: UserProfile, newTx: Transaction) => void;
}

type TabType = 'airtime' | 'data' | 'electricity' | 'water';

export default function BillPayments({ user, onTxSuccess }: BillPaymentsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('airtime');

  // Filter networks and utilities based on user region and load dynamic owner customizations
  const getDynamicNetworks = (): NetworkProvider[] => {
    const rawCustomNGN = localStorage.getItem('credible_easy_custom_networks_NGN');
    const rawCustomUSD = localStorage.getItem('credible_easy_custom_networks_USD');
    
    if (user.type === 'nigerian') {
      const custom = rawCustomNGN ? JSON.parse(rawCustomNGN) : [];
      return [...NIGERIAN_NETWORKS, ...custom];
    } else {
      const custom = rawCustomUSD ? JSON.parse(rawCustomUSD) : [];
      return [...FOREIGN_NETWORKS, ...custom];
    }
  };

  const getDynamicUtilities = (): UtilityProvider[] => {
    const rawCustom = localStorage.getItem('credible_easy_custom_utilities');
    const custom = rawCustom ? JSON.parse(rawCustom) : [];
    return [...UTILITY_PROVIDERS, ...custom];
  };

  const networks = getDynamicNetworks();
  const allUtilities = getDynamicUtilities();
  const utilityCategory = user.type === 'nigerian' ? 'nigerian' : 'foreigner';
  
  const electricityProviders = allUtilities.filter(
    p => (p.category === 'electricity' && 
    (user.type === 'nigerian' ? p.id !== 'gridsafe' && p.id !== 'natgrid' : p.id === 'gridsafe' || p.id === 'natgrid')) ||
    (p.category === 'electricity' && !UTILITY_PROVIDERS.some(orig => orig.id === p.id))
  );
  
  const waterProviders = allUtilities.filter(
    p => (p.category === 'water' && 
    (user.type === 'nigerian' ? p.id !== 'thames' && p.id !== 'metrowater' : p.id === 'thames' || p.id === 'metrowater')) ||
    (p.category === 'water' && !UTILITY_PROVIDERS.some(orig => orig.id === p.id))
  );

  // States
  const [networkId, setNetworkId] = useState(networks[0]?.id || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [airtimeAmount, setAirtimeAmount] = useState('');
  
  const [selectedPlanId, setSelectedPlanId] = useState('');
  
  const [meterNo, setMeterNo] = useState('');
  const [utilityId, setUtilityId] = useState(electricityProviders[0]?.id || '');
  const [utilityAmount, setUtilityAmount] = useState('');
  const [verifiedName, setVerifiedName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  
  const [waterCustomerId, setWaterCustomerId] = useState('');
  const [waterProviderId, setWaterProviderId] = useState(waterProviders[0]?.id || '');
  const [waterAmount, setWaterAmount] = useState('');
  const [waterVerifiedName, setWaterVerifiedName] = useState('');
  const [waterIsVerifying, setWaterIsVerifying] = useState(false);
  
  const [isPaying, setIsPaying] = useState(false);
  const [paymentFinished, setPaymentFinished] = useState(false);
  const [latestTx, setLatestTx] = useState<Transaction | null>(null);

  // States to control the checkout gateway experience
  const [showCheckoutGateway, setShowCheckoutGateway] = useState(false);
  const [checkoutAmount, setCheckoutAmount] = useState(0);
  const [checkoutTitle, setCheckoutTitle] = useState('');
  const [checkoutType, setCheckoutType] = useState<'airtime' | 'data' | 'electricity' | 'water'>('airtime');
  const [checkoutDetails, setCheckoutDetails] = useState<any>({});
  const [checkoutPoints, setCheckoutPoints] = useState(0);

  // Sync state if region shifts
  useEffect(() => {
    setNetworkId(networks[0]?.id || '');
    setUtilityId(electricityProviders[0]?.id || '');
    setWaterProviderId(waterProviders[0]?.id || '');
    // Reset forms
    setVerifiedName('');
    setWaterVerifiedName('');
    setVerificationError('');
  }, [user.type]);

  // Handle data plans
  const activeDataPlans: DataPlan[] = user.type === 'nigerian' 
    ? (NIGERIAN_DATA_PLANS[networkId] || []) 
    : (FOREIGN_DATA_PLANS[networkId] || []);

  useEffect(() => {
    if (activeDataPlans.length > 0) {
      setSelectedPlanId(activeDataPlans[0].id);
    }
  }, [networkId, user.type]);

  // Meter check simulation
  const handleVerifyMeter = () => {
    if (!meterNo.trim()) {
      setVerificationError('Enter a valid meter number first.');
      return;
    }
    
    setIsVerifying(true);
    setVerificationError('');
    setVerifiedName('');

    setTimeout(() => {
      setIsVerifying(false);
      const registry = user.type === 'nigerian' ? INITIAL_NIGERIAN_MOCK_METERS : INITIAL_FOREIGN_MOCK_METERS;
      const matched = registry[meterNo.trim()];
      
      if (matched) {
        setVerifiedName(matched);
      } else {
        // Generate a real-looking random name to support dynamic inputs
        const names = ['Kehinde Balogun', 'Ngozi Adebayo', 'Michael Adams', 'Fatima Danjuma', 'Arthur Pendelton', 'Clara Jenkins'];
        const randomName = names[Math.floor(Math.random() * names.length)] + ' (Unregistered Address)';
        setVerifiedName(randomName);
      }
    }, 1200);
  };

  // Water account check simulation
  const handleVerifyWater = () => {
    if (!waterCustomerId.trim()) {
      setVerificationError('Enter customer reference key.');
      return;
    }

    setWaterIsVerifying(true);
    setVerificationError('');
    setWaterVerifiedName('');

    setTimeout(() => {
      setWaterIsVerifying(false);
      const registry = user.type === 'nigerian' ? INITIAL_NIGERIAN_MOCK_METERS : INITIAL_FOREIGN_MOCK_METERS;
      const matched = registry[waterCustomerId.trim()];
      
      if (matched) {
        setWaterVerifiedName(matched);
      } else {
        setWaterVerifiedName('Resident - Plot 449 District Facility');
      }
    }, 1100);
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError('');

    let finalAmount = 0;
    let title = '';
    let details: any = {};
    let ptsEarned = 0;

    // Validate based on active tab
    if (activeTab === 'airtime') {
      const parsed = parseFloat(airtimeAmount);
      if (isNaN(parsed) || parsed < (user.type === 'nigerian' ? 50 : 2)) {
        alert('Enter a valid recharge amount');
        return;
      }
      if (!phoneNumber.trim()) {
        alert('Enter a cellular telephone number');
        return;
      }
      finalAmount = parsed;
      ptsEarned = Math.round(finalAmount * 0.05); // 5% airtime points cashback
      title = `Airtime Recharge - ${networks.find(n => n.id === networkId)?.name || 'Carrier'}`;
      details = {
        phone: phoneNumber.trim(),
        network: networks.find(n => n.id === networkId)?.name
      };
    } 
    else if (activeTab === 'data') {
      const plan = activeDataPlans.find(p => p.id === selectedPlanId);
      if (!plan) {
        alert('Please select a data bundle');
        return;
      }
      if (!phoneNumber.trim()) {
        alert('Enter a cellular telephone number');
        return;
      }
      finalAmount = plan.price;
      ptsEarned = Math.round(finalAmount * 0.05); // 5% data points cashback
      title = `Data Bundle - ${plan.volume} (${networks.find(n => n.id === networkId)?.name})`;
      details = {
        phone: phoneNumber.trim(),
        network: networks.find(n => n.id === networkId)?.name,
        provider: plan.name
      };
    } 
    else if (activeTab === 'electricity') {
      const parsed = parseFloat(utilityAmount);
      if (isNaN(parsed) || parsed <= 0) {
        alert('Please enter utility funding amount');
        return;
      }
      if (!verifiedName) {
        alert('Verify your meter address before proceeding');
        return;
      }
      finalAmount = parsed;
      ptsEarned = Math.round(finalAmount * 0.02); // 2% utility point cashback
      
      const utilitySelected = electricityProviders.find(u => u.id === utilityId);
      title = `Electricity Token - ${utilitySelected?.shortName}`;
      
      // Simulate prepayment visual credit code!
      const randomTokenCode = Array.from({length: 5}, () => Math.floor(1000 + Math.random() * 9000)).join('-');
      details = {
        meterNumber: meterNo.trim(),
        provider: utilitySelected?.name,
        tokensCredit: randomTokenCode // e.g. "1902-8640-1011-3004-9982" prepaid code!
      };
    } 
    else if (activeTab === 'water') {
      const parsed = parseFloat(waterAmount);
      if (isNaN(parsed) || parsed <= 0) {
        alert('Please enter utility payment amount');
        return;
      }
      if (!waterVerifiedName) {
        alert('Verify your customer account before proceeding');
        return;
      }
      finalAmount = parsed;
      ptsEarned = Math.round(finalAmount * 0.02); // 2% utility point cashback
      
      const waterSelected = waterProviders.find(w => w.id === waterProviderId);
      title = `Water Utility - ${waterSelected?.shortName}`;
      details = {
        customerId: waterCustomerId.trim(),
        provider: waterSelected?.name
      };
    }

    setCheckoutAmount(finalAmount);
    setCheckoutTitle(title);
    setCheckoutType(activeTab);
    setCheckoutDetails(details);
    setCheckoutPoints(ptsEarned);
    setShowCheckoutGateway(true);
  };

  const symbol = user.currency === 'NGN' ? '₦' : '$';

  return (
    <div id="service-block" className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden font-sans">
      <div className="flex border-b border-slate-100 overflow-x-auto whitespace-nowrap bg-slate-50 p-2 gap-1 scrollbar-none">
        {[
          { id: 'airtime', label: 'Airtime', icon: Smartphone },
          { id: 'data', label: 'Data Bundles', icon: Wifi },
          { id: 'electricity', label: 'Electricity Token', icon: Zap },
          { id: 'water', label: 'Water Bills', icon: Droplet },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as TabType);
                setPaymentFinished(false);
                setLatestTx(null);
                setVerificationError('');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === item.id
                  ? 'bg-wine-600 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {!paymentFinished ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
            >
              <form onSubmit={handlePay} className="space-y-4">
                
                {/* 1. AIRTIME FORM */}
                {activeTab === 'airtime' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Choose Telecom Carrier
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {networks.map((net) => (
                          <button
                            key={net.id}
                            type="button"
                            onClick={() => setNetworkId(net.id)}
                            className={`py-2 px-1 text-[11px] font-extrabold border text-center rounded-xl transition-all block overflow-hidden truncate ${
                              networkId === net.id
                                ? 'border-wine-600 bg-wine-50 text-wine-800 ring-1 ring-wine-500'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-55 animate-fadeIn'
                            }`}
                          >
                            <span className="block text-xs">{net.logo}</span>
                            <span className="block text-[9px] opacity-75 font-medium leading-none mt-0.5">{net.name.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Recipient Phone Number
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder={user.type === 'nigerian' ? 'e.g. 08022345678' : 'e.g. +44 7911 123456'}
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm font-sans focus:border-wine-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Load Amount ({user.currency})
                        </label>
                        <input
                          type="number"
                          required
                          placeholder={user.type === 'nigerian' ? 'Min ₦100' : 'Min $5'}
                          value={airtimeAmount}
                          onChange={(e) => setAirtimeAmount(e.target.value)}
                          className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm font-sans focus:border-wine-500"
                        />
                      </div>
                    </div>

                    {/* Pre-select amount buttons */}
                    <div>
                      <div className="flex gap-1.5 overflow-x-auto whitespace-nowrap py-1">
                        {(user.type === 'nigerian' ? [100, 200, 550, 1000, 2000, 5000] : [5, 10, 20, 30, 50]).map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setAirtimeAmount(amt.toString())}
                            className={`py-1.5 px-3 text-xs font-bold border rounded-lg transition-all ${
                              airtimeAmount === amt.toString()
                                ? 'bg-wine-600 text-white border-wine-600'
                                : 'bg-slate-50 text-slate-650 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {symbol}{amt.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. DATA BUNDLE FORM */}
                {activeTab === 'data' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Select Cellular Carrier
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {networks.map((net) => (
                          <button
                            key={net.id}
                            type="button"
                            onClick={() => setNetworkId(net.id)}
                            className={`py-2 px-1 text-[11px] font-extrabold border text-center rounded-xl transition-all block overflow-hidden truncate ${
                              networkId === net.id
                                ? 'border-wine-600 bg-wine-50 text-wine-800 ring-1 ring-wine-500'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-55'
                            }`}
                          >
                            <span className="block text-xs">{net.logo}</span>
                            <span className="block text-[9px] opacity-75 font-medium leading-none mt-0.5">{net.name.split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Recipient Mobile Number
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder={user.type === 'nigerian' ? 'e.g. 08123456789' : 'e.g. +447111222333'}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm focus:border-wine-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Choose Recommended Data Plan
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {activeDataPlans.map((plan) => (
                          <button
                            key={plan.id}
                            type="button"
                            onClick={() => setSelectedPlanId(plan.id)}
                            className={`flex justify-between items-center p-3 text-left border rounded-xl transition-all ${
                              selectedPlanId === plan.id
                                ? 'border-wine-600 bg-wine-50 ring-1 ring-wine-500'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <div>
                              <span className="block text-xs font-extrabold text-slate-900">{plan.name}</span>
                              <span className="text-[11px] text-slate-500 font-medium">Volume: {plan.volume} • {plan.validity}</span>
                            </div>
                            <span className="text-sm font-black text-wine-700">
                              {symbol}{plan.price.toLocaleString()}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. ELECTRICITY FORM */}
                {activeTab === 'electricity' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Power Distribution Corp
                        </label>
                        <select
                          value={utilityId}
                          onChange={(e) => {
                            setUtilityId(e.target.value);
                            setVerifiedName('');
                          }}
                          className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm focus:border-wine-500 font-medium"
                        >
                          {electricityProviders.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Smart Meter Number
                        </label>
                        <div className="relative flex">
                          <input
                            type="text"
                            placeholder={user.type === 'nigerian' ? "e.g. 12345678901 (11 digits)" : "e.g. 98765432100"}
                            value={meterNo}
                            onChange={(e) => {
                              setMeterNo(e.target.value);
                              setVerifiedName('');
                            }}
                            className="block w-full rounded-l-xl border border-r-0 border-slate-200 bg-white py-2.5 px-3 text-sm font-mono focus:border-wine-500 focus:ring-1 focus:ring-wine-500"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyMeter}
                            disabled={isVerifying}
                            className="inline-flex items-center gap-1.5 rounded-r-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-bold px-4 transition-all"
                          >
                            {isVerifying ? (
                              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                              <>
                                <Search className="h-3.5 w-3.5" />
                                Verify
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Address verify visual state */}
                    <AnimatePresence>
                      {verifiedName && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 p-3 bg-wine-50 border border-wine-200 rounded-xl text-wine-800 text-xs animate-fadeIn"
                        >
                          <UserCheck className="h-4.5 w-4.5 text-wine-600 flex-shrink-0" />
                          <div>
                            <div className="font-bold text-wine-950">Meter Verified Account:</div>
                            <div className="font-mono">{verifiedName}</div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {verifiedName && (
                      <div className="animate-slideUp">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Amount to Recharge ({user.currency})
                        </label>
                        <input
                          type="number"
                          required
                          placeholder={user.type === 'nigerian' ? 'Minimum ₦1,000' : 'Minimum $10'}
                          value={utilityAmount}
                          onChange={(e) => setUtilityAmount(e.target.value)}
                          className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm font-sans font-bold text-slate-800 focus:border-wine-500"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* 4. WATER FORM */}
                {activeTab === 'water' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Regional Water Utility
                        </label>
                        <select
                          value={waterProviderId}
                          onChange={(e) => {
                            setWaterProviderId(e.target.value);
                            setWaterVerifiedName('');
                          }}
                          className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm focus:border-wine-500 font-medium"
                        >
                          {waterProviders.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Customer Ref / Account ID
                        </label>
                        <div className="relative flex">
                          <input
                            type="text"
                            placeholder="e.g. 12345678901"
                            value={waterCustomerId}
                            onChange={(e) => {
                              setWaterCustomerId(e.target.value);
                              setWaterVerifiedName('');
                            }}
                            className="block w-full rounded-l-xl border border-r-0 border-slate-200 bg-white py-2.5 px-3 text-sm font-mono focus:border-wine-500 focus:ring-1 focus:ring-wine-500"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyWater}
                            disabled={waterIsVerifying}
                            className="inline-flex items-center gap-1.5 rounded-r-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-bold px-4 transition-all"
                          >
                            {waterIsVerifying ? (
                              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                              <>
                                <Search className="h-3.5 w-3.5" />
                                Verify
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {waterVerifiedName && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 p-3 bg-wine-50 border border-wine-200 rounded-xl text-wine-800 text-xs"
                        >
                          <UserCheck className="h-4.5 w-4.5 text-wine-600 flex-shrink-0" />
                          <div>
                            <div className="font-bold text-wine-950">Water Account Verified:</div>
                            <div className="font-mono">{waterVerifiedName}</div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {waterVerifiedName && (
                      <div className="animate-slideUp">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Settlement Bill Amount ({user.currency})
                        </label>
                        <input
                          type="number"
                          required
                          placeholder="e.g. 2500"
                          value={waterAmount}
                          onChange={(e) => setWaterAmount(e.target.value)}
                          className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm font-sans font-bold text-slate-800 focus:border-wine-500"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Action */}
                <div className="pt-4 border-t border-slate-150">
                  <button
                    type="submit"
                    disabled={
                      isPaying || 
                      (activeTab === 'electricity' && !verifiedName) || 
                      (activeTab === 'water' && !waterVerifiedName)
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-wine-600 px-4 py-3.5 text-sm font-bold text-white shadow-md hover:bg-wine-700 disabled:bg-slate-200 disabled:text-slate-450 transition-colors cursor-pointer"
                  >
                    {isPaying ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Processing Payment Securely...
                      </>
                    ) : (
                      <>
                        Confirm Secure Utility Payment
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                  
                  {((activeTab === 'electricity' && !verifiedName) || (activeTab === 'water' && !waterVerifiedName)) && (
                    <p className="mt-2 text-center text-[10px] text-slate-400 italic">
                      💡 Please search and verify the meter/account number above before submitting details.
                    </p>
                  )}
                </div>
              </form>
            </motion.div>
          ) : (
            /* PAYMENT SUCCESSFUL MODAL CARD */
            <motion.div
              key="utility-receipt-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-4"
            >
              <div className="text-center">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-extrabold mb-2 text-lg">✓</span>
                <h4 className="text-lg font-black text-slate-900">Payment Processed!</h4>
                <p className="text-xs text-slate-500">Credible Easy certified voucher & cashback points generated.</p>
              </div>

              {latestTx && (
                <div className="bg-white p-4 rounded-xl border border-slate-150 text-xs font-mono select-none space-y-2 text-slate-700">
                  <div className="border-b border-dashed border-slate-200 pb-2 flex justify-between">
                    <span className="font-bold text-slate-800">Credible Easy Statement</span>
                    <span className="text-[10px] text-slate-400">{latestTx.timestamp}</span>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between">
                      <span className="text-slate-450">Transaction Type:</span>
                      <span className="font-extrabold text-slate-900 uppercase text-[10.5px]">{latestTx.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">Voucher Label:</span>
                      <span className="font-extrabold text-slate-900 text-right">{latestTx.title}</span>
                    </div>

                    {latestTx.details.phone && (
                      <div className="flex justify-between">
                        <span className="text-slate-450 font-sans">Mobile Line:</span>
                        <span className="font-mono text-slate-900">{latestTx.details.phone} ({latestTx.details.network})</span>
                      </div>
                    )}

                    {latestTx.details.meterNumber && (
                      <div className="flex justify-between">
                        <span className="text-slate-450 font-sans">Power Meter:</span>
                        <span className="font-mono text-slate-900">{latestTx.details.meterNumber}</span>
                      </div>
                    )}

                    {latestTx.details.tokensCredit && (
                      <div className="p-2 bg-yellow-50 text-yellow-800 font-bold border border-yellow-250 rounded-lg text-center mt-2 font-mono">
                        <div className="text-[10px] uppercase font-bold text-yellow-600 mb-0.5">Prepaid Token Code</div>
                        <span className="text-sm tracking-widest">{latestTx.details.tokensCredit}</span>
                      </div>
                    )}

                    {latestTx.details.customerId && (
                      <div className="flex justify-between">
                        <span className="text-slate-450 font-sans">Water Account ID:</span>
                        <span className="font-mono text-slate-900">{latestTx.details.customerId}</span>
                      </div>
                    )}

                    <div className="flex justify-between pt-2 border-t border-dashed border-slate-200">
                      <span className="text-slate-450">Total Debited:</span>
                      <span className="font-black text-slate-950 text-sm">
                        {symbol}{latestTx.amount.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between text-emerald-800 text-[11px] font-bold">
                      <span>Points Gained Reward:</span>
                      <span>+{latestTx.pointsReward} Buzi Points</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setPaymentFinished(false);
                    setLatestTx(null);
                    // Clear fields
                    setAirtimeAmount('');
                    setUtilityAmount('');
                    setWaterAmount('');
                    setVerifiedName('');
                    setWaterVerifiedName('');
                  }}
                  className="flex-1 bg-wine-600 text-white rounded-xl py-2.5 text-xs font-bold hover:bg-wine-700 transition-all cursor-pointer"
                >
                  Pay Another Bill
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modern Multi-Gateway secure billing checkout integration */}
      {showCheckoutGateway && (
        <SecureGatewayModal
          isOpen={showCheckoutGateway}
          onClose={() => {
            setShowCheckoutGateway(false);
          }}
          user={user}
          amount={checkoutAmount}
          txType={checkoutType}
          txTitle={checkoutTitle}
          txDetails={checkoutDetails}
          pointsReward={checkoutPoints}
          onPaymentSuccess={(updatedUser, tx) => {
            setLatestTx(tx);
            setPaymentFinished(true);
            onTxSuccess(updatedUser, tx);
            setShowCheckoutGateway(false);
          }}
        />
      )}
    </div>
  );
}
