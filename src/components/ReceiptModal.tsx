import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Copy, Check, Printer, Download, ArrowDownToLine, Receipt } from 'lucide-react';
import { Transaction } from '../types';

interface ReceiptModalProps {
  tx: Transaction | null;
  onClose: () => void;
}

export default function ReceiptModal({ tx, onClose }: ReceiptModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);

  if (!tx) return null;

  const handleCopyRef = () => {
    navigator.clipboard.writeText(tx.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert(`Receipt downloaded successfully! Saved as Credible-Easy-${tx.reference}.pdf`);
    }, 1800);
  };

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => {
      setPrinting(false);
      alert('Forwarding utility document to default print spooler...');
    }, 1200);
  };

  const symbol = tx.currency === 'NGN' ? '₦' : '$';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Visual background backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 z-10 font-sans"
      >
        {/* Top brand header */}
        <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-wine-400" />
            <div>
              <h4 className="font-extrabold text-sm tracking-tight text-white uppercase">Utility Transaction Receipt</h4>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider">{tx.reference}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Paper Container Body */}
        <div className="p-6 space-y-4 bg-slate-50 relative">
          
          {/* Aesthetic punch holes of receipt paper */}
          <div className="absolute -top-3 left-0 right-0 flex justify-around select-none">
            {Array.from({ length: 15 }).map((_, idx) => (
              <span key={idx} className="w-2.5 h-2.5 bg-slate-900 rounded-full inline-block opacity-10"></span>
            ))}
          </div>

          <div className="text-center pt-2 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-550 block">Debited Amount</span>
            <div className="text-2xl font-black text-slate-950 font-mono">
              {symbol}{tx.amount.toLocaleString()}
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full select-none">
              <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              {tx.status}
            </span>
          </div>

          <div className="border-t border-b border-dashed border-slate-250 py-3 text-xs space-y-2 font-mono scrollbar-none">
            <div className="flex justify-between">
              <span className="text-slate-400">Statement Desc:</span>
              <span className="font-extrabold text-slate-850 text-right max-w-[180px] truncate">{tx.title}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Payment Date:</span>
              <span className="text-slate-850 font-semibold">{tx.timestamp}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Merchant Platform:</span>
              <span className="text-slate-850 font-extrabold uppercase">Credible Easy MFB</span>
            </div>

            {tx.details.phone && (
              <div className="flex justify-between">
                <span className="text-slate-440 font-sans">Telephone No:</span>
                <span className="text-slate-850 font-semibold">{tx.details.phone} ({tx.details.network})</span>
              </div>
            )}

            {tx.details.meterNumber && (
              <div className="flex justify-between">
                <span className="text-slate-440">Meter Reference:</span>
                <span className="text-slate-850 font-bold">{tx.details.meterNumber}</span>
              </div>
            )}

            {tx.details.customerId && (
              <div className="flex justify-between">
                <span className="text-slate-440">Water Account ID:</span>
                <span className="text-slate-850 font-bold">{tx.details.customerId}</span>
              </div>
            )}

            {tx.details.provider && (
              <div className="flex justify-between">
                <span className="text-slate-440">Utility Provider:</span>
                <span className="text-slate-800 font-semibold text-right">{tx.details.provider}</span>
              </div>
            )}

            {tx.details.pointsTraded && (
              <div className="flex justify-between">
                <span className="text-slate-440">Converted Points:</span>
                <span className="text-slate-800 font-extrabold text-right">{Math.abs(tx.details.pointsTraded)} BP</span>
              </div>
            )}

            {tx.details.rate && (
              <div className="flex justify-between">
                <span className="text-slate-440">Conversion Rate:</span>
                <span className="text-slate-800 font-bold text-right">{symbol}{tx.details.rate}</span>
              </div>
            )}

            <div className="flex justify-between border-t border-dashed border-slate-200 pt-2 text-emerald-800 text-[11px] font-sans font-bold">
              <span>Loyalty Points Reward:</span>
              <span className="font-mono">
                {tx.pointsReward >= 0 ? `+${tx.pointsReward}` : tx.pointsReward} BP
              </span>
            </div>
          </div>

          {tx.details.tokensCredit && (
            <div className="p-3 bg-wine-50 border border-wine-200 rounded-xl font-mono text-center space-y-1">
              <div className="text-[10px] uppercase font-bold text-wine-600 tracking-wider">Meter prepaid credit Refill code</div>
              <div className="text-sm font-black text-slate-900 tracking-widest leading-normal">
                {tx.details.tokensCredit}
              </div>
            </div>
          )}

          {/* Simulated scanning node QR code */}
          <div className="flex flex-col items-center justify-center p-1 bg-white border border-slate-200 rounded-xl space-y-2">
            <svg id="receipt-barcode" viewBox="0 0 100 100" className="w-20 h-20 text-slate-800">
              {/* Generate pixelated mock QR vectors */}
              <rect x="5" y="5" width="25" height="25" fill="currentColor" />
              <rect x="10" y="10" width="15" height="15" fill="white" />
              <rect x="13" y="13" width="9" height="9" fill="currentColor" />
              
              <rect x="70" y="5" width="25" height="25" fill="currentColor" />
              <rect x="75" y="10" width="15" height="15" fill="white" />
              <rect x="78" y="13" width="9" height="9" fill="currentColor" />

              <rect x="5" y="70" width="25" height="25" fill="currentColor" />
              <rect x="10" y="75" width="15" height="15" fill="white" />
              <rect x="13" y="78" width="9" height="9" fill="currentColor" />

              <rect x="40" y="10" width="10" height="10" fill="currentColor" />
              <rect x="55" y="5" width="8" height="20" fill="currentColor" />
              <rect x="40" y="40" width="20" height="20" fill="currentColor" />
              <rect x="70" y="45" width="15" height="15" fill="currentColor" />
              <rect x="80" y="65" width="15" height="30" fill="currentColor" />
              <rect x="45" y="75" width="15" height="15" fill="currentColor" />
            </svg>
            <span className="text-[9px] text-slate-400 font-mono">SCAN TO VERIFY INTEGRITY</span>
          </div>

        </div>

        {/* Action button toolbar */}
        <div className="px-5 py-4 bg-slate-100 border-t border-slate-200 flex gap-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-1 bg-white hover:bg-slate-50 border border-slate-250 py-2 rounded-xl text-xs font-bold text-slate-700 disabled:bg-slate-100 disabled:text-slate-400 transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            {downloading ? 'Saving...' : 'PDF'}
          </button>
          <button
            onClick={handlePrint}
            disabled={printing}
            className="flex-1 flex items-center justify-center gap-1 bg-white hover:bg-slate-50 border border-slate-250 py-2 rounded-xl text-xs font-bold text-slate-700 disabled:bg-slate-100 disabled:text-slate-400 transition-all cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            {printing ? 'Printing...' : 'Print'}
          </button>
          
          <button
            onClick={handleCopyRef}
            className="flex items-center justify-center p-2.5 bg-wine-600 hover:bg-wine-700 rounded-xl text-white transition-all cursor-pointer"
            title="Copy Transaction Ref"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
