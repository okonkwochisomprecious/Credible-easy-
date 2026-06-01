import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, TrendingUp, TrendingDown, ArrowRight, RefreshCw, Tag, Sliders, ShieldCheck } from 'lucide-react';
import { UserProfile, Transaction, TradeOrder } from '../types';
import { INITIAL_TRADE_BOOK } from '../constants';

interface TradingExchangeProps {
  user: UserProfile;
  onTxSuccess: (updatedUser: UserProfile, newTx: Transaction) => void;
}

export default function TradingExchange({ user, onTxSuccess }: TradingExchangeProps) {
  const [tradeType, setTradeType] = useState<'sell' | 'buy'>('sell');
  const [pointsQty, setPointsQty] = useState('');
  
  // Market variables - dynamic lookup matching founder parameters if customised
  const getDynamicBaseRate = () => {
    if (user.currency === 'NGN') {
      const stored = localStorage.getItem('credible_easy_config_baseRate_NGN');
      return stored ? parseFloat(stored) : 10.00;
    } else {
      const stored = localStorage.getItem('credible_easy_config_baseRate_USD');
      return stored ? parseFloat(stored) : 0.007;
    }
  };
  const baseRate = getDynamicBaseRate();
  const [currentPrice, setCurrentPrice] = useState(baseRate);
  const [priceHistory, setPriceHistory] = useState<number[]>(
    Array.from({ length: 15 }, () => baseRate * (0.95 + Math.random() * 0.1))
  );

  // Synchronise starting prices if founder adjusts indices
  useEffect(() => {
    setCurrentPrice(baseRate);
    setPriceHistory(
      Array.from({ length: 15 }, () => baseRate * (0.95 + Math.random() * 0.1))
    );
  }, [baseRate]);
  const [priceChangePercent, setPriceChangePercent] = useState(1.4);
  const [orderBook, setOrderBook] = useState<TradeOrder[]>(INITIAL_TRADE_BOOK);
  
  // States
  const [isTrading, setIsTrading] = useState(false);
  const [tradeSuccess, setTradeSuccess] = useState('');
  const [activePartnerTab, setActivePartnerTab] = useState<'cash' | 'vouchers'>('cash');

  // Fluctuating rates to make the live feed fee totally real
  useEffect(() => {
    const priceInterval = setInterval(() => {
      // Small fluctuation
      const fluctuation = (Math.random() - 0.48) * 0.02 * baseRate;
      setCurrentPrice((prev) => {
        const nextPrice = Math.max(prev + fluctuation, baseRate * 0.7);
        
        // Update History
        setPriceHistory((prevHistory) => {
          const nextHistory = [...prevHistory.slice(1), nextPrice];
          return nextHistory;
        });

        // Compute percentage change compared to history start
        const first = priceHistory[0] || baseRate;
        const pct = ((nextPrice - first) / first) * 100;
        setPriceChangePercent(parseFloat(pct.toFixed(2)));
        
        return parseFloat(nextPrice.toFixed(user.currency === 'NGN' ? 2 : 4));
      });

      // Fluctuate the ledger order book slightly to prove live node activity
      setOrderBook((prevOrders) => {
        return prevOrders.map((ord) => {
          if (Math.random() > 0.7) {
            // Randomly update an existing order price/volume to look active
            const randomDelta = (Math.random() - 0.5) * 0.1;
            const nextQty = Math.max(ord.quantity + Math.floor((Math.random() - 0.5) * 10), 10);
            const nextPrice = parseFloat(Math.max(ord.price + randomDelta, 0.001).toFixed(user.currency === 'NGN' ? 2 : 4));
            return {
              ...ord,
              quantity: nextQty,
              price: nextPrice,
              total: parseFloat((nextQty * nextPrice).toFixed(2))
            };
          }
          return ord;
        });
      });
    }, 4500);

    return () => clearInterval(priceInterval);
  }, [priceHistory, baseRate, user.currency]);

  const handleProcessTrade = (e: React.FormEvent) => {
    e.preventDefault();
    setTradeSuccess('');
    
    const qty = parseInt(pointsQty);
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid amount of points to trade');
      return;
    }

    const tradeVolumeCost = qty * currentPrice;

    if (tradeType === 'sell') {
      // Deduct points, credit wallet balance
      if (qty > user.points) {
        alert(`Insufficient loyalty points! You have ${user.points} points, but specified ${qty} points to sell.`);
        return;
      }

      setIsTrading(true);
      setTimeout(() => {
        setIsTrading(false);
        const ref = `EXCH-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        const now = new Date();
        const timestampString = now.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        const updatedUser: UserProfile = {
          ...user,
          balance: parseFloat((user.balance + tradeVolumeCost).toFixed(2)),
          points: user.points - qty
        };

        const tx: Transaction = {
          id: ref,
          type: 'trading_sell',
          title: `Sold Buzi Points for Cash`,
          amount: tradeVolumeCost,
          currency: user.currency,
          pointsReward: -qty, // negative represents deduction
          timestamp: timestampString,
          status: 'Completed',
          reference: ref,
          details: {
            pointsTraded: qty,
            rate: currentPrice
          }
        };

        // Insert new order into simulated database ledger
        const newOrder: TradeOrder = {
          id: `to-${Math.random().toString(36).substring(2, 6)}`,
          type: 'sell',
          quantity: qty,
          price: currentPrice,
          total: parseFloat(tradeVolumeCost.toFixed(2)),
          timestamp: `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`,
          userName: 'You',
          status: 'Completed'
        };

        setOrderBook((prev) => [newOrder, ...prev.slice(0, 5)]);
        setTradeSuccess(`Successfully sold ${qty} Buzi Points at ${user.currency === 'NGN' ? '₦' : '$'}${currentPrice}/point. Added ${user.currency === 'NGN' ? '₦' : '$'}${tradeVolumeCost.toLocaleString()} to your wallet balance.`);
        setPointsQty('');
        onTxSuccess(updatedUser, tx);
      }, 1400);
    } 
    else {
      // BUY points: deduct wallet balance, credit points
      if (tradeVolumeCost > user.balance) {
        alert(`Insufficient funds! To buy ${qty} points, you need ${user.currency === 'NGN' ? '₦' : '$'}${tradeVolumeCost.toLocaleString()} but your balance is only ${user.currency === 'NGN' ? '₦' : '$'}${user.balance.toLocaleString()}.`);
        return;
      }

      setIsTrading(true);
      setTimeout(() => {
        setIsTrading(false);
        const ref = `EXCH-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        const now = new Date();
        const timestampString = now.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        const updatedUser: UserProfile = {
          ...user,
          balance: parseFloat((user.balance - tradeVolumeCost).toFixed(2)),
          points: user.points + qty
        };

        const tx: Transaction = {
          id: ref,
          type: 'trading_buy',
          title: 'Purchased Buzi Points',
          amount: tradeVolumeCost,
          currency: user.currency,
          pointsReward: qty,
          timestamp: timestampString,
          status: 'Completed',
          reference: ref,
          details: {
            pointsTraded: qty,
            rate: currentPrice
          }
        };

        const newOrder: TradeOrder = {
          id: `to-${Math.random().toString(36).substring(2, 6)}`,
          type: 'buy',
          quantity: qty,
          price: currentPrice,
          total: parseFloat(tradeVolumeCost.toFixed(2)),
          timestamp: `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`,
          userName: 'You',
          status: 'Completed'
        };

        setOrderBook((prev) => [newOrder, ...prev.slice(0, 5)]);
        setTradeSuccess(`Successfully bought ${qty} Buzi Points for ${user.currency === 'NGN' ? '₦' : '$'}${tradeVolumeCost.toLocaleString()} from cash balance.`);
        setPointsQty('');
        onTxSuccess(updatedUser, tx);
      }, 1450);
    }
  };

  // Voucher Swap list
  const partnerVouchers = user.currency === 'NGN' ? [
    { id: 'v-jumia', partner: 'Jumia Nigeria', value: '₦1,500 Shopping Voucher', cost: 130, code: 'JM-892-CRED' },
    { id: 'v-ikeja', partner: 'Ikeja Electric', value: '₦3,000 Electricity Refill Code', cost: 260, code: 'IK-551-EASY' },
    { id: 'v-shoprite', partner: 'Shoprite Hypermarket', value: '₦5,000 Grocery Coupon', cost: 420, code: 'SR-773-CRED' }
  ] : [
    { id: 'v-amazon', partner: 'Amazon.com Global', value: '$10 Shopping Voucher', cost: 100, code: 'AZ-AMZN-EASY' },
    { id: 'v-netflix', partner: 'Netflix Streaming', value: '1-Month Standard Subscription', cost: 150, code: 'NF-FLIX-NET' },
    { id: 'v-starbucks', partner: 'Starbucks International', value: '$25 Premium Brew Gift', cost: 240, code: 'SB-COFFEE-88' }
  ];

  const handleRedeemVoucher = (voucherCost: number, voucherName: string, couponCode: string) => {
    setTradeSuccess('');
    if (voucherCost > user.points) {
      alert(`Insufficient points! You need ${voucherCost} Buzi Points to unlock the ${voucherName}, but you have ${user.points}.`);
      return;
    }

    if (confirm(`Swap ${voucherCost} Buzi Points for ${voucherName}?`)) {
      const ref = `REDEEM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const now = new Date();
      const timestampString = now.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      const updatedUser: UserProfile = {
        ...user,
        points: user.points - voucherCost
      };

      const tx: Transaction = {
        id: ref,
        type: 'trading_sell',
        title: `Redeemed ${voucherName}`,
        amount: 0,
        currency: user.currency,
        pointsReward: -voucherCost,
        timestamp: timestampString,
        status: 'Completed',
        reference: ref,
        details: {
          pointsTraded: voucherCost,
          provider: voucherName
        }
      };

      setTradeSuccess(`Success! Exchanged ${voucherCost} Buzi Points. Coupon code generated: ${couponCode}. Use code during payment checkout.`);
      onTxSuccess(updatedUser, tx);
    }
  };

  // Render prices line based on history array
  const maxPrice = Math.max(...priceHistory);
  const minPrice = Math.min(...priceHistory);
  const spread = maxPrice - minPrice || 0.01;
  const paddingY = 8;
  const heightSvg = 70;
  
  const pointsDrawn = priceHistory.map((val, idx) => {
    const x = (idx / (priceHistory.length - 1)) * 360;
    const y = paddingY + ((maxPrice - val) / spread) * (heightSvg - paddingY * 2);
    return `${x},${y}`;
  }).join(' ');

  const symbol = user.currency === 'NGN' ? '₦' : '$';

  return (
    <div className="bg-slate-900 text-white rounded-2xl shadow-xl overflow-hidden font-sans border border-slate-800">
      
      {/* Header bar */}
      <div className="p-6 bg-slate-950 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 flex items-center justify-center bg-wine-750/20 text-wine-400 rounded-xl">
            <Coins className="h-6 w-6 text-wine-400" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-100 flex items-center gap-1.5 text-base">
              CE Point Exchange
              <span className="text-[10px] bg-wine-700/35 text-wine-300 border border-wine-500/30 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider select-none animate-pulse">
                Live trading
              </span>
            </h3>
            <p className="text-[10.5px] text-slate-400">Trade earned utility loyalties into real-value wallet coin</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-0.5">Buzi Points</div>
          <div className="text-xl font-black text-wine-400 font-mono tracking-tight">{user.points.toLocaleString()} BP</div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CHART SECTION IN MIDDLE COLUMN */}
        <div className="md:col-span-2 space-y-4">
          
          {/* Statistics row */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Rate per Points</div>
              <div className="text-base font-black font-mono mt-0.5 text-wine-400">
                {symbol}{currentPrice}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Status (24h)</div>
              <div className={`text-xs font-black flex items-center gap-0.5 mt-0.5 font-mono ${
                priceChangePercent >= 0 ? 'text-emerald-450' : 'text-red-400'
              }`}>
                {priceChangePercent >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {priceChangePercent >= 0 ? '+' : ''}{priceChangePercent}%
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Community Capital</div>
              <div className="text-xs font-black text-slate-300 mt-1 font-mono">
                {user.currency === 'NGN' ? '₦1.2M' : '$14.5K'}
              </div>
            </div>
          </div>

          {/* Mini Interactive SVG chart */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-[10.5px] text-slate-400">
              <span className="font-bold uppercase tracking-wider text-[9px] text-slate-500">Fluctuating Value Index</span>
              <span className="font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md flex items-center gap-1 text-[9px]">
                <RefreshCw className="h-2.5 w-2.5 text-wine-500 animate-spin" /> Auto-syncing
              </span>
            </div>
            
            <div className="relative">
              <svg viewBox="0 0 360 70" className="w-full h-24 overflow-visible">
                {/* Graticules/grid guidelines */}
                <line x1="0" y1="10" x2="360" y2="10" stroke="#1e293b" strokeDasharray="3,3" />
                <line x1="0" y1="35" x2="360" y2="35" stroke="#1e293b" strokeDasharray="3,3" />
                <line x1="0" y1="60" x2="360" y2="60" stroke="#1e293b" strokeDasharray="3,3" />
                
                {/* Visual Line path */}
                <polyline
                  fill="none"
                  stroke={priceChangePercent >= 0 ? '#10b981' : '#ef4444'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={pointsDrawn}
                />
              </svg>
            </div>
          </div>

          {/* LEDGER BLOCK (ORDER BOOK) */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Live Consolidated Order Book</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] font-mono text-slate-300">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800 text-left">
                    <th className="pb-1.5">User</th>
                    <th className="pb-1.5">Action</th>
                    <th className="pb-1.5 text-right">Qty (BP)</th>
                    <th className="pb-1.5 text-right">Price</th>
                    <th className="pb-1.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {orderBook.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-920">
                      <td className="py-1.5 text-slate-350">{ord.userName}</td>
                      <td className="py-1.5">
                        <span className={`px-1 rounded text-[10px] font-bold ${
                          ord.type === 'buy' ? 'bg-emerald-950 text-emerald-450 border border-emerald-900' : 'bg-red-950 text-red-400 border border-red-900'
                        }`}>
                          {ord.type === 'buy' ? 'BUY' : 'SELL'}
                        </span>
                      </td>
                      <td className="py-1.5 text-right font-bold">{ord.quantity}</td>
                      <td className="py-1.5 text-right text-slate-400">{symbol}{ord.price}</td>
                      <td className="py-1.5 text-right font-bold text-slate-105">{symbol}{ord.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - TRADING CENTER */}
        <div className="space-y-4">
          <div className="bg-slate-950 rounded-xl border border-slate-800 p-4">
            
            {/* Mode selection button */}
            <div className="flex border-b border-slate-850 pb-3 mb-4">
              <button
                onClick={() => { setActivePartnerTab('cash'); setTradeSuccess(''); }}
                className={`flex-1 text-center py-1 text-xs font-bold border-r border-slate-850 flex items-center justify-center gap-1 ${
                  activePartnerTab === 'cash' ? 'text-wine-400' : 'text-slate-450 hover:text-slate-200'
                }`}
              >
                💹 Cash Out
              </button>
              <button
                onClick={() => { setActivePartnerTab('vouchers'); setTradeSuccess(''); }}
                className={`flex-1 text-center py-1 text-xs font-bold flex items-center justify-center gap-1 ${
                  activePartnerTab === 'vouchers' ? 'text-wine-400' : 'text-slate-450 hover:text-slate-200'
                }`}
              >
                🎟️ Swap Vouchers
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activePartnerTab === 'cash' ? (
                <motion.div
                  key="cash-convert"
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                >
                  <div className="flex rounded-lg bg-slate-900 p-1 mb-4 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setTradeType('sell')}
                      className={`flex-1 py-1.5 text-[10.5px] font-extrabold rounded-md transition-all ${
                        tradeType === 'sell'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-100'
                      }`}
                    >
                      Sell BP (Get Cash)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTradeType('buy')}
                      className={`flex-1 py-1.5 text-[10.5px] font-extrabold rounded-md transition-all ${
                        tradeType === 'buy'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-100'
                      }`}
                    >
                      Buy BP (Spend Cash)
                    </button>
                  </div>

                  <form onSubmit={handleProcessTrade} className="space-y-4">
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase font-black mb-1.5">
                        {tradeType === 'sell' ? 'Quantity of BP to Sell' : 'Quantity of BP to Buy'}
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 100"
                        value={pointsQty}
                        onChange={(e) => setPointsQty(e.target.value)}
                        className="block w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-3 text-sm font-semibold focus:border-wine-550 focus:outline-none focus:ring-1 focus:ring-wine-500 font-mono text-white"
                        min="1"
                      />
                    </div>

                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-850 space-y-1.5 text-xs text-slate-450">
                      <div className="flex justify-between items-center text-[10.5px] text-slate-500 font-bold uppercase">
                        <span>Trade Projection Summary</span>
                        <span className="font-mono text-slate-400">{symbol}{currentPrice}/point</span>
                      </div>
                      <div className="flex justify-between text-slate-350">
                        <span>Exchange Points:</span>
                        <span className="font-mono font-bold text-slate-100">{pointsQty || 0} BP</span>
                      </div>
                      <div className="flex justify-between text-slate-350">
                        <span>Rate:</span>
                        <span className="font-mono text-slate-100">{symbol}{currentPrice}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-800 pt-1.5 font-bold text-slate-200">
                        <span>{tradeType === 'sell' ? 'Wallet Credit:' : 'Total Debit Cost:'}</span>
                        <span className="font-mono text-wine-400 font-bold text-sm">
                          {symbol}{parseFloat(((parseInt(pointsQty) || 0) * currentPrice).toFixed(2)).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isTrading}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-extrabold text-white shadow-md transition-colors cursor-pointer ${
                        tradeType === 'sell' 
                          ? 'bg-red-650 hover:bg-red-750 disabled:bg-red-900' 
                          : 'bg-emerald-650 hover:bg-emerald-750 disabled:bg-emerald-900'
                      }`}
                    >
                      {isTrading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Settling Ledger Contract...
                        </span>
                      ) : (
                        <>
                          {tradeType === 'sell' ? 'Proceed with Points Liquidation' : 'Acquire Points Contract'}
                          <ArrowRight className="h-3.5 w-3.5 animate-pulse" />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                /* PARTNER SWAPS PORTAL */
                <motion.div
                  key="voucher-panel animate-fadeIn"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 5 }}
                  className="space-y-3"
                >
                  <p className="text-[10px] text-slate-400 leading-normal mb-1">
                    Redeem your points directly for brand discount vouchers or partner utility recharge codes:
                  </p>

                  <div className="space-y-2.5">
                    {partnerVouchers.map((v) => (
                      <div key={v.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center text-xs gap-1.5 hover:border-slate-700 transition-colors">
                        <div>
                          <span className="text-[9px] bg-slate-850 px-1.5 py-0.5 rounded text-wine-400 font-extrabold block w-fit mb-1">{v.partner}</span>
                          <span className="font-bold text-slate-200 block">{v.value}</span>
                        </div>
                        <button
                          onClick={() => handleRedeemVoucher(v.cost, v.value, v.code)}
                          className="px-2.5 py-1.5 bg-wine-700 hover:bg-wine-800 text-[10px] font-black rounded-lg transition-colors text-right flex-shrink-0"
                        >
                          Swap for <div className="font-mono text-[9px] opacity-80">{v.cost} BP</div>
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>

      {/* Success notification banner */}
      <AnimatePresence>
        {tradeSuccess && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-emerald-950 text-emerald-450 text-xs px-6 py-3 border-t border-emerald-900 font-medium font-sans"
          >
            <div className="flex gap-2 items-center">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-400 inline-flex" />
              <span>{tradeSuccess}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
