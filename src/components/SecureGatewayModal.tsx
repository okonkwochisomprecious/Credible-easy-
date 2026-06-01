import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, X, CreditCard, Landmark, Phone, Smartphone, AlertCircle, 
  CheckCircle, ArrowRight, Wallet, Info, Lock, KeyRound, Check, RefreshCw, Send
} from 'lucide-react';
import { UserProfile, Transaction } from '../types';

interface SecureGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  amount: number; // Raw amount in current selected currency (NGN or USD)
  txType: 'add_funds' | 'airtime' | 'data' | 'electricity' | 'water';
  txTitle: string;
  txDetails: any;
  pointsReward: number;
  onPaymentSuccess: (updatedUser: UserProfile, newTx: Transaction) => void;
}

type GatewayType = 'paystack' | 'flutterwave' | 'stripe' | 'paypal' | 'wallet';

export default function SecureGatewayModal({
  isOpen,
  onClose,
  user,
  amount,
  txType,
  txTitle,
  txDetails,
  pointsReward,
  onPaymentSuccess
}: SecureGatewayModalProps) {
  const [selectedGateway, setSelectedGateway] = useState<GatewayType>('paystack');
  
  // Phase inside the checkout flow
  // - 'select': select gateway of choice
  // - 'checkout': active gateway UI/checkout
  // - 'verifying': sandbox validation loading spinner
  // - 'otp': OTP verification popups
  // - 'success': final receipt
  const [phase, setPhase] = useState<'select' | 'pin_verify' | 'checkout' | 'verifying' | 'otp' | 'success'>('select');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  
  // Real security PIN States
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);
  
  // Custom Gateway states
  const [paystackMethod, setPaystackMethod] = useState<'card' | 'transfer' | 'ussd' | 'kuda'>('card');
  const [flutterwaveMethod, setFlutterwaveMethod] = useState<'card' | 'momo' | 'transfer'>('card');
  const [stripeMethod, setStripeMethod] = useState<'card' | 'gpay' | 'link'>('card');
  
  // Card input states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardZip, setCardZip] = useState('');
  const [cardHolder, setCardHolder] = useState(user.name);
  
  // Other details states
  const [selectedUSSDbank, setSelectedUSSDbank] = useState('*737#');
  const [momoNetwork, setMomoNetwork] = useState('mtn');
  const [momoNumber, setMomoNumber] = useState('');
  const [emailUser, setEmailUser] = useState(user.identifier.includes('@') ? user.identifier : 'client@credibleeasy.com');
  const [passUser, setPassUser] = useState('');
  
  // Virtual account payment simulator countdown
  const [virtualAccountCountdown, setVirtualAccountCountdown] = useState(600); // 10 mins
  
  // Created transaction for receipt screen
  const [finishedTx, setFinishedTx] = useState<Transaction | null>(null);

  // Auto set initial gateway based on user type
  useEffect(() => {
    if (user.type === 'nigerian') {
      setSelectedGateway('paystack');
    } else {
      setSelectedGateway('stripe');
    }
    setPhase('select');
  }, [user.type, isOpen]);

  // Virtual bank account timer countdown effect
  useEffect(() => {
    if (phase === 'checkout' && (paystackMethod === 'transfer' || flutterwaveMethod === 'transfer')) {
      const interval = setInterval(() => {
        setVirtualAccountCountdown(prev => (prev > 0 ? prev - 1 : 600));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase, paystackMethod, flutterwaveMethod]);

  if (!isOpen) return null;

  const symbol = user.currency === 'NGN' ? '₦' : '$';
  
  // Dynamic conversions for gate display
  // Paystack & Flutterwave support multiple currencies but usually bill NGN
  // Stripe & PayPal process internationally. We convert dynamically:
  // e.g. 1 USD = 1,450 NGN multiplier for display
  const conversionRate = 1450;
  const convertedAmount = user.currency === 'USD' && (selectedGateway === 'paystack' || selectedGateway === 'flutterwave')
    ? amount * conversionRate
    : user.currency === 'NGN' && (selectedGateway === 'stripe' || selectedGateway === 'paypal')
      ? amount / conversionRate
      : amount;

  const displayCurrency = (selectedGateway === 'paystack' || selectedGateway === 'flutterwave') 
    ? 'NGN' 
    : (selectedGateway === 'stripe' || selectedGateway === 'paypal') 
      ? 'USD' 
      : user.currency;

  const displaySymbol = displayCurrency === 'NGN' ? '₦' : '$';

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGatewaySelect = (gateway: GatewayType) => {
    setSelectedGateway(gateway);
    setPhase('checkout');
    // Pre-fill some details
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCardZip('');
  };

  const executeSandboxProcess = () => {
    setPhase('verifying');
    
    // Simulating gateway fraud checks, merchant validation & processing
    setTimeout(() => {
      if (selectedGateway === 'paystack' && paystackMethod === 'card') {
        setPhase('otp'); // Ask for Secure Mastercard/Visa OTP simulation
      } else if (selectedGateway === 'flutterwave' && flutterwaveMethod === 'card') {
        setPhase('otp');
      } else if (selectedGateway === 'stripe' && stripeMethod === 'card') {
        setPhase('otp');
      } else {
        // Instant success for other methods
        completeTransaction();
      }
    }, 2000);
  };

  const handleVerifyPin = (enteredPin: string) => {
    const requiredPin = user.transactionPin || '1234';
    if (enteredPin === requiredPin) {
      setPinError('');
      setPhase('verifying');
      setTimeout(() => {
        completeTransaction();
      }, 1500);
    } else {
      setPinError('Incorrect transaction PIN. Default PIN is 1234.');
      setPinInput('');
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setOtpError('Please insert verification code');
      return;
    }
    setPhase('verifying');
    
    setTimeout(() => {
      completeTransaction();
    }, 1500);
  };

  const completeTransaction = () => {
    const referenceCode = `CE-${selectedGateway.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const now = new Date();
    const timestampString = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // Update balances
    let finalUpdatedProfile: UserProfile;
    if (txType === 'add_funds') {
      // Funded wallet: Add funds to current balance
      finalUpdatedProfile = {
        ...user,
        balance: user.balance + amount,
        points: user.points + pointsReward
      };
    } else if (selectedGateway === 'wallet') {
      // Deduct spent service cost from wallet cash drawer
      finalUpdatedProfile = {
        ...user,
        balance: user.balance - amount,
        points: user.points + pointsReward
      };
    } else {
      // Direct checkout bill pay: paid via outside gateways, client keeps current wallet currency
      finalUpdatedProfile = {
        ...user,
        points: user.points + pointsReward
      };
    }

    // Details formatting with custom gateway descriptors
    const enrichedDetails = {
      ...txDetails,
      paymentMethod: `${selectedGateway.toUpperCase()} (${
        selectedGateway === 'paystack' ? paystackMethod.toUpperCase() :
        selectedGateway === 'flutterwave' ? flutterwaveMethod.toUpperCase() :
        selectedGateway === 'stripe' ? stripeMethod.toUpperCase() : 'EXPRESS'
      })`,
      gatewayReference: `${selectedGateway.substring(0,2).toUpperCase()}_${Math.floor(100000 + Math.random() * 900000)}`
    };

    const newTx: Transaction = {
      id: referenceCode,
      type: txType,
      title: txType === 'add_funds' ? `Wallet Deposit Funded via ${selectedGateway.toUpperCase()}` : txTitle,
      amount: amount,
      currency: user.currency,
      pointsReward: pointsReward,
      timestamp: timestampString,
      status: 'Completed',
      reference: referenceCode,
      details: enrichedDetails
    };

    setFinishedTx(newTx);
    setPhase('success');
    onPaymentSuccess(finalUpdatedProfile, newTx);
  };

  return (
    <div id="payment-gateway-layer" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Blur Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 z-10 font-sans text-slate-800"
      >
        {/* Gateway Header */}
        <div className="flex justify-between items-center bg-slate-900 border-b border-slate-800 px-6 py-4 text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <h3 className="font-extrabold text-sm tracking-tight text-white uppercase">Secure Payment Checkout</h3>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider">Merchant: Credible Easy MFB Gateway</p>
            </div>
          </div>
          {phase !== 'verifying' && phase !== 'otp' && phase !== 'success' && (
            <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* 1. SELECT GATEWAY PHASE */}
        {phase === 'select' && (
          <div className="p-6 space-y-5">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Checkout Total</span>
              <div className="text-3xl font-black text-slate-950 font-mono">
                {symbol}{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                {txType === 'add_funds' ? 'Top up your Credible Easy instant wallet' : `Direct instant secure settlement for: ${txTitle}`}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3">
              <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-1">
                Select Your Secure Payment Gateway
              </label>

              <div className="grid grid-cols-1 gap-2.5">
                {/* WALLET BALANCE (Only when paying for bills, not when adding funds) */}
                {txType !== 'add_funds' && (
                  <button
                    type="button"
                    disabled={user.balance < amount}
                    onClick={() => {
                      setSelectedGateway('wallet');
                      setPhase('pin_verify');
                      setPinInput('');
                      setPinError('');
                    }}
                    className={`flex items-center justify-between p-3 py-2.5 rounded-xl border transition-all text-left group ${
                      user.balance >= amount
                        ? 'border-wine-200 bg-wine-50/5 hover:bg-wine-50/20 hover:border-wine-500 cursor-pointer'
                        : 'border-slate-100 bg-slate-50/55 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-8 w-8 rounded-lg flex items-center justify-center font-black text-xs select-none ${
                        user.balance >= amount ? 'bg-wine-150 bg-wine-100 text-wine-600' : 'bg-slate-200 text-slate-400'
                      }`}>W</span>
                      <div>
                        <span className={`block text-xs font-extrabold ${user.balance >= amount ? 'text-slate-900 group-hover:text-wine-700' : 'text-slate-400'}`}>Direct Wallet Balance Cash</span>
                        <span className="text-[10px] text-slate-500 font-medium font-mono">Available Balance: {symbol}{user.balance.toLocaleString()}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      user.balance >= amount ? 'bg-wine-50 text-wine-700' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {user.balance >= amount ? 'Instant Settlement' : 'Insufficient NGN'}
                    </span>
                  </button>
                )}

                {/* PAYSTACK */}
                <button
                  type="button"
                  onClick={() => handleGatewaySelect('paystack')}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-205 hover:bg-emerald-50/20 hover:border-emerald-500 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-8 w-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-black text-base select-none">P</span>
                    <div>
                      <span className="block text-xs font-extrabold text-slate-900 group-hover:text-emerald-700">Paystack Secure Portal 🇳🇬</span>
                      <span className="text-[10px] text-slate-500 font-medium">Cards, Bank Transfer, USSD Dial, Kuda App</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-500">Popular (Nigeria)</span>
                </button>

                {/* FLUTTERWAVE */}
                <button
                  type="button"
                  onClick={() => handleGatewaySelect('flutterwave')}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-205 hover:bg-amber-50/20 hover:border-amber-500 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-700 font-black text-base select-none">F</span>
                    <div>
                      <span className="block text-xs font-extrabold text-slate-900 group-hover:text-amber-800">Flutterwave Rave 🌊</span>
                      <span className="text-[10px] text-slate-500 font-medium">Pan-African Cards, Bank Transfer, Mobile Money</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-500">Africa / Global</span>
                </button>

                {/* STRIPE */}
                <button
                  type="button"
                  onClick={() => handleGatewaySelect('stripe')}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-205 hover:bg-indigo-50/20 hover:border-indigo-500 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-700 font-black text-base select-none">S</span>
                    <div>
                      <span className="block text-xs font-extrabold text-slate-900 group-hover:text-indigo-800">Stripe Checkout 🌐</span>
                      <span className="text-[10px] text-slate-500 font-medium">Global Credit/Debit Cards, Apple Pay, Google Pay</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-500">International</span>
                </button>

                {/* PAYPAY */}
                <button
                  type="button"
                  onClick={() => handleGatewaySelect('paypal')}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-205 hover:bg-sky-50/20 hover:border-sky-500 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-8 w-8 bg-sky-100 rounded-lg flex items-center justify-center text-sky-700 font-black text-base select-none">Y</span>
                    <div>
                      <span className="block text-xs font-extrabold text-slate-900 group-hover:text-sky-850 font-sans">PayPal Express 🔵</span>
                      <span className="text-[10px] text-slate-500 font-medium">PayPal Balance, Direct Credit Cards</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-500">Global</span>
                </button>
              </div>
            </div>

            <div className="flex gap-2 items-center text-[10.5px] text-slate-400 bg-slate-50 p-2.5 rounded-xl text-center justify-center">
              <Lock className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
              <span>Standard 256-Bit SSL Military Encryption. Safe sandbox.</span>
            </div>
          </div>
        )}

        {/* 2. ACTIVE CHECKOUT GATEWAY INTERFACES */}
        {phase === 'checkout' && (
          <div className="p-0 overflow-hidden">
            
            {/* PAYSTACK GATEWAY SIMULATION */}
            {selectedGateway === 'paystack' && (
              <div className="animate-fadeIn">
                {/* Paystack brand ribbon */}
                <div className="bg-emerald-600 text-white px-6 py-3.5 flex justify-between items-center select-none text-[11px] font-mono">
                  <div className="flex items-center gap-1.5 font-sans font-black tracking-tighter text-sm">
                    <span className="bg-white text-emerald-600 px-1 py-0.5 rounded text-[10px]">PAY</span> paystack
                  </div>
                  <span className="font-bold">{emailUser}</span>
                </div>

                <div className="p-6 space-y-4">
                  {/* Internal Subtabs */}
                  <div className="flex bg-slate-100 p-1 rounded-lg gap-1 border border-slate-200">
                    {[
                      { id: 'card', label: '💳 Card' },
                      { id: 'transfer', label: '🏦 Transfer' },
                      { id: 'ussd', label: '📱 USSD' },
                      { id: 'kuda', label: '📲 Kuda/OPay' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setPaystackMethod(tab.id as any)}
                        className={`flex-1 py-1.5 text-[11px] font-black rounded-md transition-all cursor-pointer ${
                          paystackMethod === tab.id
                            ? 'bg-white text-emerald-800 shadow-xs ring-1 ring-emerald-500/20'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="min-h-[170px] flex flex-col justify-between">
                    {/* Paystack CARD Form */}
                    {paystackMethod === 'card' && (
                      <div className="space-y-3 animate-slideUp">
                        <div className="grid grid-cols-1">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Card Number</label>
                          <input
                            type="text"
                            placeholder="4000 1234 5678 9010"
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                            className="block w-full rounded-lg border border-slate-250 bg-white px-3 py-2 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Expiry Date</label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              maxLength={5}
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              className="block w-full rounded-lg border border-slate-250 bg-white px-3 py-2 text-xs text-center font-mono focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">CVV Security</label>
                            <input
                              type="password"
                              placeholder="***"
                              maxLength={3}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              className="block w-full rounded-lg border border-slate-250 bg-white px-3 py-2 text-xs text-center font-mono focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Paystack TRANSFER Simulator */}
                    {paystackMethod === 'transfer' && (
                      <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl space-y-2 animate-slideUp text-xs font-sans text-emerald-850">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-[12px] text-emerald-950 flex items-center gap-1">
                            <Landmark className="h-4 w-4" /> Live Transfer clearing
                          </span>
                          <span className="font-mono bg-emerald-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                            {formatSeconds(virtualAccountCountdown)}
                          </span>
                        </div>
                        <p className="leading-tight text-[10.5px]">Please make a transfer of exactly <strong>{displaySymbol}{convertedAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong> to:</p>
                        
                        <div className="bg-white p-3 rounded-lg border border-emerald-250 space-y-1 font-mono text-[11px] text-slate-700">
                          <div>Bank: <span className="font-bold text-slate-900">Titan Trust Bank / Paystack</span></div>
                          <div className="flex justify-between items-center">
                            <span>Account No: <span className="font-bold text-slate-950 text-xs">9982701144</span></span>
                            <span className="bg-slate-100 text-[9px] px-1.5 py-0.5 rounded hover:bg-slate-205 cursor-pointer" onClick={() => navigator.clipboard.writeText('9982701144')}>Copy</span>
                          </div>
                          <div>Account Name: <span className="font-bold text-slate-900">Credible Easy Checkout Ltd</span></div>
                        </div>
                        <button
                          type="button"
                          onClick={executeSandboxProcess}
                          className="w-full mt-2 bg-emerald-650 hover:bg-emerald-700 text-white font-extrabold text-[11px] py-1.5 rounded-lg flex items-center justify-center gap-1"
                        >
                          I have compiled this bank transfer
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        </button>
                      </div>
                    )}

                    {/* Paystack USSD Form */}
                    {paystackMethod === 'ussd' && (
                      <div className="space-y-3 animate-slideUp">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Select Bank for USSD Code</label>
                          <select
                            value={selectedUSSDbank}
                            onChange={(e) => setSelectedUSSDbank(e.target.value)}
                            className="block w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs focus:border-emerald-500 focus:outline-none"
                          >
                            <option value="*737*2*8*#">Guaranty Trust Bank (GTBank) • *737#</option>
                            <option value="*901*2*1*#">Access Bank • *901#</option>
                            <option value="*966*3*1*#">Zenith Bank • *966#</option>
                            <option value="*894*2*9*#">First Bank • *894#</option>
                            <option value="*329*1*5*#">FCMB • *329#</option>
                          </select>
                        </div>
                        <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-xl space-y-1 font-mono text-center text-indigo-900">
                          <span className="block text-[10px] font-bold text-indigo-500 uppercase">USSD String Generated</span>
                          <span className="block text-sm font-black tracking-wider text-slate-900">{selectedUSSDbank.replace('#', '')}{Math.round(convertedAmount)}#</span>
                          <span className="block text-[9.5px] leading-tight text-indigo-400 font-sans">Simulate dialect string trigger below to charge line.</span>
                        </div>
                        <button
                          type="button"
                          onClick={executeSandboxProcess}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-xl"
                        >
                          📞 Dial Simulated USSD String
                        </button>
                      </div>
                    )}

                    {/* Paystack KUDA/OPAY Push Authorization */}
                    {paystackMethod === 'kuda' && (
                      <div className="space-y-3 animate-slideUp">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Specify Regulatory Phone/Account Number</label>
                          <input
                            type="text"
                            placeholder="e.g. 7062231920 (OPay Account or Kuda Handle)"
                            value={momoNumber}
                            onChange={(e) => setMomoNumber(e.target.value)}
                            className="block w-full rounded-lg border border-slate-250 bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <p className="text-[10px] text-slate-450 leading-tight">
                          We will trigger a real-looking push notification prompt inside your OPay/Kuda smartphone application for instant biometric signature authorization.
                        </p>
                        <button
                          type="button"
                          onClick={executeSandboxProcess}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1"
                        >
                          Request Push Authorization Alert
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Common Bottom pricing bar */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Invoiced (NGN)</span>
                        <div className="text-lg font-black text-slate-900 tracking-tight font-mono">{displaySymbol}{convertedAmount.toLocaleString(undefined, {minimumFractionDigits:2})}</div>
                      </div>
                      {paystackMethod === 'card' && (
                        <button
                          type="button"
                          onClick={executeSandboxProcess}
                          className="bg-emerald-650 hover:bg-emerald-750 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1 cursor-pointer"
                        >
                          Execute Secure Payment
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* FLUTTERWAVE GATEWAY SIMULATION */}
            {selectedGateway === 'flutterwave' && (
              <div className="animate-fadeIn">
                <div className="bg-amber-600 text-white px-6 py-3.5 flex justify-between items-center select-none text-[11px]">
                  <div className="flex items-center gap-2 font-black tracking-tight text-base italic text-white uppercase">
                    flutterwave <span className="bg-white/20 text-[9px] px-1 py-0.5 rounded not-italic font-bold tracking-widest text-[#FFF200]">RAVE</span>
                  </div>
                  <span className="font-mono text-slate-200">Ref: FLW-{Math.floor(1000 + Math.random() * 9000)}</span>
                </div>

                <div className="p-6 space-y-4">
                  {/* Internal Flutterwave tabs */}
                  <div className="flex bg-slate-100 p-1 rounded-lg gap-1 border border-slate-200">
                    {[
                      { id: 'card', label: '💳 Credit/Debit' },
                      { id: 'momo', label: '📞 Mobile Money' },
                      { id: 'transfer', label: '🏛️ Bank Transfer' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFlutterwaveMethod(tab.id as any)}
                        className={`flex-1 py-1.5 text-[11px] font-black rounded-md transition-all cursor-pointer ${
                          flutterwaveMethod === tab.id
                            ? 'bg-amber-605 bg-amber-500 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="min-h-[170px] flex flex-col justify-between">
                    {/* FLW CARD Form */}
                    {flutterwaveMethod === 'card' && (
                      <div className="space-y-3 animate-slideUp">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Card Holder Name</label>
                          <input
                            type="text"
                            placeholder="John Doe"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            className="block w-full rounded-lg border border-slate-250 bg-white px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-5 gap-1.5">
                          <div className="col-span-3">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase font-sans">Card Number</label>
                            <input
                              type="text"
                              placeholder="5399 2201 9011 2049"
                              maxLength={19}
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                              className="block w-full rounded-lg border border-slate-250 bg-white px-3 py-2 text-xs font-mono focus:border-amber-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Expiry</label>
                            <input
                              type="text"
                              placeholder="12/27"
                              maxLength={5}
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              className="block w-full rounded-lg border border-slate-250 bg-white px-2 py-2 text-xs text-center font-mono focus:border-amber-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">CVV</label>
                            <input
                              type="password"
                              placeholder="***"
                              maxLength={3}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              className="block w-full rounded-lg border border-slate-250 bg-white px-2 py-2 text-xs text-center font-mono focus:border-amber-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* FLW Mobile Money */}
                    {flutterwaveMethod === 'momo' && (
                      <div className="space-y-3 animate-slideUp">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">African MoMo Country</label>
                            <select
                              value={momoNetwork}
                              onChange={(e) => setMomoNetwork(e.target.value)}
                              className="block w-full rounded-xl border border-slate-205 bg-white py-2 px-3 text-xs focus:border-amber-500 focus:outline-none"
                            >
                              <option value="mtn">Uganda 🇺🇬 MTN Mobile Money</option>
                              <option value="mpesa">Kenya 🇰🇪 Safaricom M-Pesa</option>
                              <option value="tigo">Ghana 🇬🇭 Telecel/Tigo Cash</option>
                              <option value="airtel">Malawi 🇲🇼 Airtel Money</option>
                              <option value="barter">Nigeria 🇳🇬 Flutterwave Barter</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Account Identifier</label>
                            <input
                              type="tel"
                              placeholder="e.g. 0772234059"
                              value={momoNumber}
                              onChange={(e) => setMomoNumber(e.target.value)}
                              className="block w-full rounded-xl border border-slate-205 bg-white py-2 px-3 text-xs font-mono focus:border-amber-500 focus:outline-none"
                            />
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-450 leading-relaxed">
                          Enter your local African mobile money telecommunication operator phone key. Rave triggers the respective API network gateway pull payload request directly.
                        </p>
                      </div>
                    )}

                    {/* FLW Bank Transfer */}
                    {flutterwaveMethod === 'transfer' && (
                      <div className="p-3 bg-amber-50 border border-amber-150 rounded-xl space-y-2 animate-slideUp text-xs font-sans text-amber-900">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-amber-950 flex items-center gap-1">
                            <Landmark className="h-4 w-4" /> Flutterwave Multi-acct Clearance
                          </span>
                          <span className="font-mono bg-warning bg-amber-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                            {formatSeconds(virtualAccountCountdown)}
                          </span>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-amber-200 space-y-1 font-mono text-[11px] text-slate-700">
                          <div>Bank: <span className="font-bold text-slate-900">Wema Bank / Flutterwave</span></div>
                          <div className="flex justify-between items-center">
                            <span>Account No: <span className="font-bold text-slate-950 text-xs">8829011933</span></span>
                            <span className="bg-slate-100 text-[9px] px-1.5 py-0.5 rounded hover:bg-slate-205 cursor-pointer" onClick={() => navigator.clipboard.writeText('8829011933')}>Copy</span>
                          </div>
                          <div>Name: <span className="font-bold text-slate-900">Rave-CredibleEasy Refill</span></div>
                        </div>
                        <button
                          type="button"
                          onClick={executeSandboxProcess}
                          className="w-full mt-1 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[10.5px] py-1.5 rounded-lg flex items-center justify-center gap-1 border-0"
                        >
                          Verify Money Transfer Cleared
                          <RefreshCw className="h-3 w-3 animate-spin text-white" />
                        </button>
                      </div>
                    )}

                    {/* Interactive action */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Payout Value</span>
                        <div className="text-lg font-black text-slate-900 tracking-tight font-mono">{displaySymbol}{convertedAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                      </div>
                      {(flutterwaveMethod === 'card' || flutterwaveMethod === 'momo') && (
                        <button
                          type="button"
                          onClick={executeSandboxProcess}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1 border-0 cursor-pointer"
                        >
                          Pay Direct with Rave
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STRIPE SIMULATION */}
            {selectedGateway === 'stripe' && (
              <div className="animate-fadeIn">
                <div className="bg-indigo-650 bg-indigo-700 text-white px-6 py-4 flex justify-between items-center select-none text-[11px] font-sans">
                  <div className="flex items-center gap-1.5 font-bold text-base tracking-tighter">
                    stripe <span className="font-mono text-[9px] font-semibold bg-white/20 tracking-widest px-1 py-0.5 rounded text-indigo-200">CHECKOUT</span>
                  </div>
                  <span className="font-bold bg-white text-indigo-750 font-sans px-2 py-0.5 rounded text-[10px] text-indigo-800">Secure TLS</span>
                </div>

                <div className="p-6 space-y-4">
                  {/* Stripe Quickpay express triggers */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={executeSandboxProcess}
                      className="flex items-center justify-center gap-2 py-2 px-3 border border-slate-205 rounded-xl hover:bg-slate-50 transition-all font-semibold text-xs text-slate-800"
                    >
                      <span className="text-indigo-600 font-extrabold"></span> Pay with Apple Pay
                    </button>
                    <button
                      type="button"
                      onClick={executeSandboxProcess}
                      className="flex items-center justify-center gap-2 py-2 px-3 border border-slate-205 rounded-xl hover:bg-slate-50 transition-all font-semibold text-xs text-slate-800"
                    >
                      <span className="text-[#4285F4] font-extrabold font-mono">G</span> Google Quick Pay
                    </button>
                  </div>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-150"></div>
                    <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Or credit card details</span>
                    <div className="flex-grow border-t border-slate-150"></div>
                  </div>

                  <div className="min-h-[175px] flex flex-col justify-between">
                    <div className="space-y-3 animate-slideUp">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Cardholder Name</label>
                        <input
                          type="text"
                          placeholder="Elizabeth Smith"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          className="block w-full rounded-lg border border-slate-250 bg-white px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">Card Number</label>
                          <input
                            type="text"
                            placeholder="4242 4242 4242 4242"
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                            className="block w-full rounded-lg border border-slate-250 bg-white px-3 py-2 text-xs font-mono focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">MM/YY</label>
                          <input
                            type="text"
                            placeholder="09/29"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="block w-full rounded-lg border border-slate-250 bg-white px-2 py-2 text-xs text-center font-mono focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">CVV Number</label>
                          <input
                            type="password"
                            placeholder="***"
                            maxLength={3}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="block w-full rounded-lg border border-slate-250 bg-white px-3 py-2 text-xs text-center font-mono focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">US Zip / Postal code</label>
                          <input
                            type="text"
                            placeholder="10001"
                            maxLength={6}
                            value={cardZip}
                            onChange={(e) => setCardZip(e.target.value)}
                            className="block w-full rounded-lg border border-slate-250 bg-white px-3 py-2 text-xs text-center font-mono focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Incurred (USD)</span>
                        <div className="text-lg font-black text-slate-900 tracking-tight font-mono">{displaySymbol}{convertedAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                      </div>
                      <button
                        type="button"
                        onClick={executeSandboxProcess}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        Authorize & Pay
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* PAYPAL CHECKOUT SIMULATION */}
            {selectedGateway === 'paypal' && (
              <div className="animate-fadeIn">
                <div className="bg-[#003087] text-white px-6 py-4 flex justify-between items-center select-none text-[11px] font-sans">
                  <div className="flex items-center gap-1 font-black text-base tracking-tighter italic text-[#0079C1]">
                    Pay<span className="text-[#00457C]">Pal</span> <span className="not-italic text-[10px] font-bold text-white bg-slate-800/40 px-1.5 py-0.5 rounded tracking-wide font-sans ml-1">SANDBOX</span>
                  </div>
                  <span className="font-mono text-slate-350 select-none">Client API Node v2</span>
                </div>

                <div className="p-6 space-y-4">
                  <div className="p-3 bg-yellow-50 border border-yellow-250 text-yellow-800 text-[11px] leading-relaxed rounded-xl font-medium">
                    💡 <strong>PayPal Instant Express:</strong> Standard direct auth logging is recommended for automated international settlements.
                  </div>

                  <div className="min-h-[170px] space-y-3 flex flex-col justify-between">
                    <div className="space-y-3 animate-slideUp">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">PayPal Email Account</label>
                        <input
                          type="email"
                          placeholder="personal-sandbox@paypal.com"
                          value={emailUser}
                          onChange={(e) => setEmailUser(e.target.value)}
                          className="block w-full rounded-lg border border-slate-250 bg-white px-3 py-2 text-xs focus:border-wine-500 focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Account Password</label>
                        <input
                          type="password"
                          placeholder="••••••••••••"
                          value={passUser}
                          onChange={(e) => setPassUser(e.target.value)}
                          className="block w-full rounded-lg border border-slate-250 bg-white px-3 py-2 text-xs focus:border-wine-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Due (USD)</span>
                        <div className="text-lg font-black text-slate-900 tracking-tight font-mono">{displaySymbol}{convertedAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                      </div>
                      <button
                        type="button"
                        onClick={executeSandboxProcess}
                        className="bg-[#FFC439] hover:bg-[#E1A919] text-[#003087] font-black text-xs px-5 py-2.5 rounded-full flex items-center gap-1 cursor-pointer border-0"
                      >
                        PayPal Express Pay
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Back action */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold select-none">🔑 Secured Sandbox Integrity</span>
              <button
                type="button"
                onClick={() => setPhase('select')}
                className="text-wine-600 hover:text-wine-800 font-black cursor-pointer bg-transparent border-0"
              >
                ← Go back methods
              </button>
            </div>
          </div>
        )}

        {/* 2.5 TRANSACTION PIN VERIFICATION SCREEN */}
        {phase === 'pin_verify' && (
          <div className="p-6 space-y-5 animate-slideUp">
            <div className="text-center space-y-1">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-800 mb-1">
                <Lock className="h-5 w-5 text-slate-700" />
              </span>
              <h4 className="text-sm font-black text-slate-900 uppercase">Verify Transaction PIN</h4>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto mb-1">
                Please input your 4-digit security PIN to confirm a secure debit of <strong>{symbol}{amount.toLocaleString()}</strong> from your wallet cash balance.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center gap-2">
                {[0, 1, 2, 3].map((index) => {
                  const val = pinInput[index] || '';
                  return (
                    <div
                      key={index}
                      className={`w-12 h-14 rounded-2xl border text-xl font-bold font-mono flex items-center justify-center transition-all ${
                        pinError ? 'border-red-500 bg-red-50 text-red-700 font-extrabold' :
                        val ? 'border-wine-600 bg-wine-50/20 text-wine-900 shadow-sm' : 'border-slate-200 text-slate-400'
                      }`}
                    >
                      {val ? '●' : ''}
                    </div>
                  );
                })}
              </div>

              {/* Secure keypad selection inputs */}
              <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      if (pinInput.length < 4) {
                        const nextPin = pinInput + num;
                        setPinInput(nextPin);
                        setPinError('');
                        if (nextPin.length === 4) {
                          handleVerifyPin(nextPin);
                        }
                      }
                    }}
                    className="h-11 bg-slate-50 hover:bg-slate-150 active:scale-95 text-xs font-black rounded-xl transition-all border border-slate-100 cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setPinInput('');
                    setPinError('');
                  }}
                  className="h-11 bg-red-50 hover:bg-red-100 text-[10px] text-red-650 font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center border-0"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (pinInput.length < 4) {
                      const nextPin = pinInput + '0';
                      setPinInput(nextPin);
                      setPinError('');
                      if (nextPin.length === 4) {
                        handleVerifyPin(nextPin);
                      }
                    }
                  }}
                  className="h-11 bg-slate-50 hover:bg-slate-150 active:scale-95 text-xs font-black rounded-xl transition-all border border-slate-100 cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (pinInput.length > 0) {
                      setPinInput(pinInput.slice(0, -1));
                      setPinError('');
                    }
                  }}
                  className="h-11 bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-650 font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center border-0"
                >
                  Del
                </button>
              </div>

              {pinError && (
                <p className="text-[10px] text-red-650 text-center font-extrabold tracking-wide uppercase leading-normal bg-red-50 p-2 rounded-lg border border-red-100 max-w-sm mx-auto">
                  ⚠️ {pinError}
                </p>
              )}

              <p className="text-[10.5px] text-slate-400 italic text-center">
                💡 Hint: First-time users can use default security PIN <strong>1234</strong>.
              </p>
            </div>

            {/* Back action */}
            <div className="bg-slate-50 -mx-6 -mb-6 px-6 py-3.5 border-t border-slate-100 flex justify-between items-center text-xs rounded-b-2xl">
              <span className="text-slate-400 font-bold select-none">🛡️ Multi-Factor Clearance</span>
              <button
                type="button"
                onClick={() => setPhase('select')}
                className="text-wine-600 hover:text-wine-800 font-black cursor-pointer bg-transparent border-0"
              >
                ← Go back methods
              </button>
            </div>
          </div>
        )}

        {/* 3. VERIFYING SECURE INVOICE STAGE */}
        {phase === 'verifying' && (
          <div className="p-10 text-center space-y-4 animate-fadeIn">
            <div className="w-12 h-12 border-4 border-wine-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">Processing Secure Routing...</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Handshaking with {selectedGateway.toUpperCase()} secure node to authorized settlement logs. Please wait under biometric firewall clearance.
              </p>
            </div>
          </div>
        )}

        {/* 4.OTP SECURE SECOND-FACTOR VERIFICATION POPUP */}
        {phase === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="p-6 space-y-4 animate-slideUp">
            <div className="text-center space-y-1">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-wine-100 text-wine-600 mb-1">
                <KeyRound className="h-5 w-5" />
              </span>
              <h4 className="text-sm font-black text-slate-900 uppercase">3D Secure Validation Required</h4>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                A verification passcode was routed via SMS to the line linked with the Mastercard/Visa card ending in *4242 or *9010. Insert sandbox code below.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase text-center">SMS/Token Verification Passcode</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="760 992"
                value={otpCode}
                onChange={(e) => {
                  setOtpCode(e.target.value);
                  setOtpError('');
                }}
                className="block w-40 rounded-xl border border-slate-250 bg-white py-2 px-3 text-center text-lg font-bold font-mono tracking-widest mx-auto focus:border-wine-500 focus:outline-none"
              />
              {otpError && <p className="text-[10px] text-red-600 text-center font-bold tracking-wide">{otpError}</p>}
            </div>

            <p className="text-[10px] text-slate-400 italic text-center leading-relaxed">
              💡 Hint: You can insert any random code (e.g. 123456) in this fully sandbox integrated environment to successfully authorize payment.
            </p>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-wine-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-wine-700 transition-colors border-0 cursor-pointer"
            >
              Confirm 3D Secure Validation
              <Check className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* 5. SUCCESS RECEIPT */}
        {phase === 'success' && finishedTx && (
          <div className="p-6 space-y-4 text-center animate-scaleIn">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle className="h-8 w-8" />
            </div>
            
            <div className="space-y-1">
              <h4 className="text-lg font-black text-slate-900 leading-tight">Payment Approved!</h4>
              <p className="text-xs text-slate-500">
                Processed instantly and verified by {selectedGateway.toUpperCase()} transaction API.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left font-mono text-xs space-y-1.5 text-slate-600 uppercase">
              <div className="font-extrabold text-slate-800 border-b border-dashed border-slate-200 pb-1.5 flex justify-between tracking-wide font-sans normal-case">
                <span>Payment Confirmation</span>
                <span className="text-[10px] text-slate-400">{finishedTx.timestamp}</span>
              </div>
              <div className="pt-1.5">Ref: <span className="font-bold text-slate-900 font-mono text-[11px] uppercase">{finishedTx.reference}</span></div>
              <div>Paid via: <span className="font-extrabold text-wine-700 font-mono">{finishedTx.details.paymentMethod}</span></div>
              
              {txType === 'add_funds' ? (
                <div>Balance Funded: <span className="font-black text-slate-950 font-mono text-xs">{symbol}{finishedTx.amount.toLocaleString()}</span></div>
              ) : (
                <div>Services Cleared: <span className="font-black text-slate-950 font-mono text-xs">{symbol}{finishedTx.amount.toLocaleString()}</span></div>
              )}

              {finishedTx.pointsReward > 0 && (
                <div className="text-emerald-700 font-black flex items-center gap-1 lowercase font-sans">
                  <span>Loyalty BP Gain:</span>
                  <span className="font-mono text-xs font-bold text-emerald-60s">+{finishedTx.pointsReward} bp points awarded</span>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full bg-slate-900 text-white rounded-xl py-3 text-xs font-extrabold hover:bg-slate-800 transition-colors border-0 cursor-pointer"
            >
              Return to Secures Gateway
            </button>
          </div>
        )}

      </motion.div>
    </div>
  );
}
