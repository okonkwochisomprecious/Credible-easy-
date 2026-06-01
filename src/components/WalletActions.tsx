import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Wallet, CreditCard, Landmark, CheckCircle, X, DollarSign } from 'lucide-react';
import { UserProfile, Transaction } from '../types';
import SecureGatewayModal from './SecureGatewayModal';

interface WalletActionsProps {
  user: UserProfile;
  isOpen: 'add' | 'withdraw' | null;
  onClose: () => void;
  onTxSuccess: (updatedUser: UserProfile, newTx: Transaction) => void;
}

export default function WalletActions({ user, isOpen, onClose, onTxSuccess }: WalletActionsProps) {
  const [amount, setAmount] = useState('');
  
  // Add funds form details
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('Access Bank');
  const [accountNumber, setAccountNumber] = useState('');
  
  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [phase, setPhase] = useState<'form' | 'success'>('form');
  const [generatedTx, setGeneratedTx] = useState<Transaction | null>(null);
  
  // Multi-gateway trigger state
  const [showGateway, setShowGateway] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (isOpen === 'withdraw' && parsedAmount > user.balance) {
      alert('Insufficient wallet balance to perform this withdrawal!');
      return;
    }

    if (isOpen === 'add') {
      setShowGateway(true);
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      
      const referenceCode = `TXN-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
      const now = new Date();
      const timestampString = now.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      // Update User Balances
      const newBalance = user.balance - parsedAmount;
      
      const pointsGain = 0; // zero points gain for withdraws
      const updatedUser: UserProfile = {
        ...user,
        balance: newBalance,
        points: user.points
      };

      // Create transaction item
      const tx: Transaction = {
        id: referenceCode,
        type: 'withdraw',
        title: 'Wallet Withdrawal Sent',
        amount: parsedAmount,
        currency: user.currency,
        pointsReward: 0,
        timestamp: timestampString,
        status: 'Completed',
        reference: referenceCode,
        details: {
          paymentMethod: 'Instant Direct Transfer',
          bankName: selectedBank,
          accountNumber
        }
      };

      setGeneratedTx(tx);
      setPhase('success');
      onTxSuccess(updatedUser, tx);
    }, 1500);
  };

  const symbol = user.currency === 'NGN' ? '₦' : '$';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      {/* Modal element */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 z-10"
      >
        {/* Header toolbar */}
        <div className="flex justify-between items-center bg-slate-50 px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-wine-600" />
            <h3 className="font-extrabold text-slate-800">
              {isOpen === 'add' ? 'Deposit Funds' : 'Withdraw Balance'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {phase === 'form' ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">
                Specify Amount ({user.currency})
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 font-bold text-lg">
                  {symbol}
                </span>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-lg font-bold placeholder-slate-350 focus:border-wine-500 focus:outline-none focus:ring-1 focus:ring-wine-500 font-mono"
                  min="5"
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {isOpen === 'add' 
                  ? `Earn ${amount ? Math.floor(parseFloat(amount) * 0.01) || 0 : 0} Bill Loyalty Points on this payment!`
                  : `Available Balance: ${symbol}${user.balance.toLocaleString()}`
                }
              </p>
            </div>

            {isOpen === 'add' ? (
              /* DEPOSIT METHODS */
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">
                    Payment Category
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`flex items-center justify-center gap-2 p-2.5 text-xs font-semibold rounded-lg border transition-all ${
                        paymentMethod === 'card'
                          ? 'border-wine-550 bg-wine-50 text-wine-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <CreditCard className="h-4 w-4" />
                      ATM Debit Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank')}
                      className={`flex items-center justify-center gap-2 p-2.5 text-xs font-semibold rounded-lg border transition-all ${
                        paymentMethod === 'bank'
                          ? 'border-wine-550 bg-wine-50 text-wine-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Landmark className="h-4 w-4" />
                      Direct Bank Transfer
                    </button>
                  </div>
                </div>

                {paymentMethod === 'card' ? (
                  <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 animate-fadeIn">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wide font-bold text-slate-500 mb-1">
                        Credit Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="4123 4567 8901 2345"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                        className="block w-full rounded-lg border border-slate-250 bg-white px-3 py-2 text-xs font-mono focus:border-wine-500 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wide font-bold text-slate-500 mb-1">
                          Expiry MM/YY
                        </label>
                        <input
                          type="text"
                          placeholder="12/28"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="block w-full rounded-lg border border-slate-250 bg-white px-3 py-2 text-xs text-center font-mono focus:border-wine-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wide font-bold text-slate-500 mb-1">
                          CVV Number
                        </label>
                        <input
                          type="password"
                          placeholder="***"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="block w-full rounded-lg border border-slate-250 bg-white px-3 py-2 text-xs text-center font-mono focus:border-wine-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1.5 animate-fadeIn text-emerald-800 text-xs">
                    <div className="font-bold text-emerald-900 flex items-center gap-1">
                      <Landmark className="h-3.5 w-3.5" />
                      Dynamic Clearing Account
                    </div>
                    <p className="leading-relaxed">
                      Transfer any amount to this dynamically created payment address:
                    </p>
                    <div className="bg-white p-2.5 rounded-lg border border-emerald-200 space-y-1 text-slate-700 font-mono">
                      <div>Bank: <span className="font-bold text-slate-900">Credible Easy Microfinance / Wema</span></div>
                      <div>Account Number: <span className="font-bold text-slate-900 text-sm">7659920199</span></div>
                      <div>Name: <span className="font-bold text-slate-900">CE-{user.name.split(' ')[0]}</span></div>
                    </div>
                    <p className="text-[10px] text-emerald-600">
                      System auto-detects transfer completions in 2-5 seconds.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* WITHDRAW FORM */
              <div className="space-y-3">
                {user.currency === 'NGN' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">
                      Destination Nigerian Bank
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm focus:border-wine-500 focus:outline-none"
                    >
                      <option value="Access Bank">Access Bank 🍊</option>
                      <option value="GTBank">Guaranty Trust Bank (GTBank) 🍊</option>
                      <option value="Zenith Bank">Zenith Bank Plc 🔴</option>
                      <option value="UBA">United Bank for Africa (UBA) 🔴</option>
                      <option value="Kuda Bank">Kuda Microfinance Bank 💜</option>
                      <option value="Opay">OPay Digital Bank 💚</option>
                      <option value="Moniepoint">Moniepoint MFB 💙</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">
                      International Clearing Platform
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm focus:border-wine-500 focus:outline-none"
                    >
                      <option value="PayPal Express">PayPal Wallet 🔵</option>
                      <option value="Wise Clearing">Wise Multi-Currency Wire 🟢</option>
                      <option value="Stripe Payout">Stripe Instant Merchant Payout 💜</option>
                      <option value="Wire Transfer">SWIFT Direct Bank Wire 🏛️</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-1">
                    Destination Account Detail
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={user.currency === 'NGN' ? "10-digit NUBAN number" : "Account Email/IBAN code"}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm focus:border-wine-500 font-mono"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-wine-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-wine-700 disabled:bg-wine-400 transition-colors cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Processing Transaction...
                </>
              ) : (
                <>
                  {isOpen === 'add' ? 'Fund Securely Now' : 'Process Withdrawal Now'}
                </>
              )}
            </button>
          </form>
        ) : (
          /* SUCCESS STATE */
          <div className="p-8 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-slate-900">Transaction Successful!</h4>
              <p className="text-xs text-slate-500">
                The financial request was completed, signed, and saved securely.
              </p>
            </div>

            {generatedTx && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left font-mono text-xs space-y-1.5 text-slate-600">
                <div>Ref: <span className="font-semibold text-slate-900">{generatedTx.reference}</span></div>
                <div>Type: <span className="font-semibold text-slate-900 capitalize">{generatedTx.type.replace('_', ' ')}</span></div>
                <div>Amount: <span className="font-semibold text-slate-950 text-sm">{symbol}{generatedTx.amount.toLocaleString()}</span></div>
                {isOpen === 'add' && (
                  <div>Points Earned: <span className="font-semibold text-emerald-600">+{generatedTx.pointsReward} Buzi Points</span></div>
                )}
                <div>Status: <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Completed</span></div>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => {
                  setPhase('form');
                  setAmount('');
                  setCardNumber('');
                  setAccountNumber('');
                  onClose();
                }}
                className="w-full bg-slate-900 text-white rounded-xl py-2.5 text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Modern Multi-Gateway secure billing system integration */}
      {showGateway && (
        <SecureGatewayModal
          isOpen={showGateway}
          onClose={() => {
            setShowGateway(false);
          }}
          user={user}
          amount={parseFloat(amount)}
          txType="add_funds"
          txTitle="Wallet Deposit Funded"
          txDetails={{}}
          pointsReward={Math.floor(parseFloat(amount) * 0.01)}
          onPaymentSuccess={(updatedUser, tx) => {
            setGeneratedTx(tx);
            setPhase('success');
            onTxSuccess(updatedUser, tx);
            setShowGateway(false);
          }}
        />
      )}
    </div>
  );
}
