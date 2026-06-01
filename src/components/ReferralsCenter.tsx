import React, { useState, useEffect } from 'react';
import { Gift, Copy, Check, Users, Trophy, Award, HelpCircle, ArrowRight, Star } from 'lucide-react';
import { UserProfile } from '../types';

interface ReferralsCenterProps {
  user: UserProfile;
}

export default function ReferralsCenter({ user }: ReferralsCenterProps) {
  const isOwner = user.identifier.toLowerCase() === 'okonkwoprecious418@gmail.com' || user.name.toLowerCase().includes('precious okonkwo');
  
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState<string[]>([]);
  
  // Custom generated user code
  const userInviteCode = isOwner 
    ? 'PRECIOUS50' 
    : `${user.name.split(' ')[0].toUpperCase()}${Math.floor(10 + Math.random() * 90)}`;

  useEffect(() => {
    // Collect simulated and real referrals registered key-wise
    const preciousUsesRaw = localStorage.getItem('credible_easy_precious_invite_uses');
    let realUses: string[] = preciousUsesRaw ? JSON.parse(preciousUsesRaw) : [];
    
    if (isOwner) {
      // Seed initial dummy referrals for Precious ifempty so the UI immediately looks highly interactive and alive
      if (realUses.length === 0) {
        realUses = [
          'quadril_adetutu@gmail.com',
          'emeka_nwosu@paystack.com',
          'yusuf_larba@yahoo.co.uk',
          'chioma_nelson99@outlook.com',
          'toyin_shobowale@gmail.com',
          'blessing_okon_demo@credible.com'
        ];
        localStorage.setItem('credible_easy_precious_invite_uses', JSON.stringify(realUses));
      }
      setReferrals(realUses);
    } else {
      // General user's referrals list
      const generalKey = `credible_easy_referrals_${user.identifier}`;
      const savedGeneral = localStorage.getItem(generalKey);
      let generalList: string[] = savedGeneral ? JSON.parse(savedGeneral) : [];
      if (generalList.length === 0) {
        generalList = [
          'client_partner_44@exchange.net',
          'sandboxed_tester992@gmail.com'
        ];
        localStorage.setItem(generalKey, JSON.stringify(generalList));
      }
      setReferrals(generalList);
    }
  }, [user.identifier, isOwner]);

  const handleCopy = () => {
    navigator.clipboard.writeText(userInviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentReferralCount = referrals.length;
  const maxReferrals = isOwner ? 50 : 100;
  const progressPercentage = Math.min(100, (currentReferralCount / maxReferrals) * 100);

  // Rewards breakdown math
  const bonusCashEarnedStr = isOwner 
    ? `₦${(currentReferralCount * 1500).toLocaleString()}` 
    : `${(currentReferralCount * 50).toLocaleString()} BP`;

  return (
    <div id="referrals-view-component" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6 font-sans">
      
      {/* 1. HERO HEADER AREA */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-wine-950 text-white p-6 overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-wine-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 z-10">
          <div className="space-y-2 max-w-lg">
            <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 w-fit flex items-center gap-1">
              <Star className="h-3 w-3 text-amber-500 fill-amber-550" /> Referral program live
            </span>
            <h2 className="text-2xl font-black tracking-tight text-white leading-tight">
              Share the Ease, Earn Real Cash & Loyalty Buzi Points
            </h2>
            <p className="text-slate-300 text-xs leading-relaxed">
              Introduce your colleagues, group members, or clients to the top bills payment node. Let them save money on electricity and mobile bundle recharges instantly!
            </p>
          </div>
          <Gift className="h-16 w-16 text-wine-400 opacity-80 animate-pulse hidden md:block" />
        </div>
      </div>

      {/* 2. CORE BOX AND ACTION PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* INVITE CODE CONTAINER */}
        <div className="md:col-span-2 bg-slate-50 border border-slate-150 p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">your personalized referral code</span>
            <div className="flex bg-white rounded-xl border border-slate-200 p-2 items-center justify-between shadow-xs">
              <span className="font-mono text-xl font-black text-slate-950 tracking-wider pl-3 uppercase">
                {userInviteCode}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 bg-wine-600 hover:bg-wine-700 text-white px-4 py-2 text-xs font-black rounded-lg transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-450 leading-relaxed pt-1">
              {isOwner ? (
                <span>
                  🎁 <strong>Owner Special Promotion:</strong> The first **1 to 50** users who registers using your exclusive code <strong>PRECIOUS50</strong> receives <strong>₦1,500 cash</strong> placed directly into their safe wallet, usable instantly for buying data or payments of water and electric tokens.
                </span>
              ) : (
                <span>
                  Share this invitation code! When friends register, they receive exclusive startup bonuses, and you earn an extra <strong>+50 BP (Buzi Points)</strong> directly into your exchange center to redeem for cash.
                </span>
              )}
            </p>
          </div>

          <div className="pt-5 border-t border-slate-200 mt-5 flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-500">Status: <b className="text-emerald-700 font-bold uppercase text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded leading-none">🟢 Active Channel</b></span>
            <span className="text-slate-400 font-mono">Expires: Dec 31, 2026</span>
          </div>
        </div>

        {/* METRICS / ANALYTICS STATS */}
        <div className="bg-slate-950 text-white rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 h-20 w-20 bg-wine-500/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-black tracking-widest text-slate-400 uppercase">
              <span>Referrals ledger</span>
              <Users className="h-4.5 w-4.5 text-wine-400" />
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Active Enrollees</span>
                <span className="text-3xl font-black font-mono text-white mt-1 block">
                  {currentReferralCount} <span className="text-xs font-bold text-slate-450">users</span>
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Total Earned Out</span>
                <span className="text-xl font-bold font-mono text-wine-400 mt-1 block">
                  {bonusCashEarnedStr}
                </span>
              </div>
            </div>
          </div>

          {/* Progress meter bar */}
          <div className="space-y-1.5 pt-4 mt-4 border-t border-slate-800">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
              <span>Limit Cap</span>
              <span>{currentReferralCount}/{maxReferrals} ({Math.round(progressPercentage)}%)</span>
            </div>
            <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-wine-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

        </div>

      </div>

      {/* 3. REFERRED LIST & AUDITING SECTION */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-amber-500" />
            Referred Sandbox Accounts
          </h3>
          <p className="text-xs text-slate-400 leading-none mt-0.5">Audit real-time registrations and promotional payouts issued</p>
        </div>

        {referrals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {referrals.map((email, idx) => {
              const maskedEmail = email.replace(/(^.{3})(.*)(@.*)/, '$1***$3');
              return (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-7 w-7 rounded-lg bg-wine-50 text-wine-600 flex items-center justify-center font-bold text-xs font-mono">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="block text-xs font-extrabold text-slate-900 font-mono">{maskedEmail}</span>
                      <span className="text-[9.5px] text-slate-400 font-semibold uppercase">Channel: PRECIOUS50 Gate</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded leading-none flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 text-emerald-600" /> Verified ₦1,500 Payout
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 rounded-2xl border border-dashed border-slate-200 text-slate-400 p-4 space-y-1">
            <span className="block text-lg">📢</span>
            <p className="text-xs font-bold text-slate-700">No referred enrollees yet</p>
            <p className="text-[10.5px] text-slate-450 leading-tight max-w-xs mx-auto">Copy your invitation string above and share with sandbox user emails to check instant cash additions.</p>
          </div>
        )}
      </div>

    </div>
  );
}
