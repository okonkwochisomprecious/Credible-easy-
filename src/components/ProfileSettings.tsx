import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, Mail, Phone, Globe, Signal, Check, 
  Sparkles, ShieldCheck, BadgeCheck, Save, RefreshCw
} from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileSettingsProps {
  user: UserProfile;
  onUserUpdate: (updatedUser: UserProfile) => void;
}

export default function ProfileSettings({ user, onUserUpdate }: ProfileSettingsProps) {
  const [fullName, setFullName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || user.identifier || '');
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [network, setNetwork] = useState(user.network || 'MTN');
  const [country, setCountry] = useState(user.country || 'Nigeria');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [validationError, setValidationError] = useState('');

  const carrierOptions = [
    { value: 'MTN', label: 'MTN MoMo Gateway 🟡' },
    { value: 'Glo', label: 'Glo Financial Link 🟢' },
    { value: 'Airtel', label: 'Airtel Active Airtime 🔴' },
    { value: '9mobile', label: '9mobile Telecom Node 🟢' }
  ];

  const countryOptions = [
    { value: 'Nigeria', label: 'Nigeria 🇳🇬' },
    { value: 'United Kingdom', label: 'United Kingdom 🇬🇧' },
    { value: 'United States', label: 'United States 🇺🇸' },
    { value: 'Canada', label: 'Canada 🇨🇦' },
    { value: 'Ghana', label: 'Ghana 🇬🇭' },
    { value: 'South Africa', label: 'South Africa 🇿🇦' }
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setSaveStatus('saving');

    // Validation
    if (!fullName.trim() || fullName.trim().length < 3) {
      setValidationError('Please enter a valid full name (minimum 3 characters)');
      setSaveStatus('idle');
      return;
    }

    if (!email.includes('@') || email.length < 5) {
      setValidationError('Please specify a valid email address');
      setSaveStatus('idle');
      return;
    }

    if (user.type === 'nigerian') {
      const cleanPhone = phoneNumber.trim().replace(/^0+/, '');
      if (!cleanPhone || cleanPhone.length < 9 || isNaN(Number(cleanPhone))) {
        setValidationError('Please enter a valid Nigerian phone number');
        setSaveStatus('idle');
        return;
      }
    }

    // Simulate saving delay for polished visual effect
    setTimeout(() => {
      const updatedUser: UserProfile = {
        ...user,
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        network: user.type === 'nigerian' ? network : undefined,
        country: country
      };

      onUserUpdate(updatedUser);
      setSaveStatus('success');

      // Dispatch simulated audit log event log
      const logEvent = {
        id: Date.now(),
        action: 'Updated profile personal settings details',
        ip: '102.89.44.82',
        date: 'Just Now',
        status: 'Updated'
      };

      // Push to localStorage security logs matching SecurityVault audit lists
      try {
        const rawLogs = localStorage.getItem(`credible_easy_security_logs_${user.identifier}`);
        const parsedLogs = rawLogs ? JSON.parse(rawLogs) : [];
        localStorage.setItem(`credible_easy_security_logs_${user.identifier}`, JSON.stringify([logEvent, ...parsedLogs]));
      } catch (e) {
        // Ignore silent storage errors
      }

      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 1000);
  };

  return (
    <motion.div 
      id="profile-settings-pane"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.15 }}
      className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6"
    >
      {/* Dynamic Header Badge */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <User className="h-4.5 w-4.5 text-wine-600" />
              Profile Configuration Center
            </h3>
            <span className="text-[10px] bg-wine-50 text-wine-800 font-extrabold px-2 py-0.5 rounded-full border border-wine-200 uppercase select-none">
              Verified Tier-1 Account
            </span>
          </div>
          <p className="text-xs text-slate-450 font-medium">
            Manage your personal data credentials, telecom carrier channels, and localized profile metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 select-none">
          <div className="h-10 w-10 rounded-full bg-wine-600 text-white flex items-center justify-center font-black text-base shadow-inner">
            {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="text-left font-sans">
            <span className="text-xs font-black text-slate-800 block leading-none">
              {fullName || 'Credible User'}
            </span>
            <span className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-wider leading-none mt-1 block">
              UID: {user.identifier.substring(0, 8)}...
            </span>
          </div>
        </div>
      </div>

      {/* Main Settings Form Grid */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        
        {validationError && (
          <div id="profile-error-alert" className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl text-xs font-semibold leading-relaxed flex items-center gap-2">
            <span className="text-sm">⚠️</span>
            <span>{validationError}</span>
          </div>
        )}

        {saveStatus === 'success' && (
          <div id="profile-success-alert" className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-xs font-semibold leading-relaxed flex items-center gap-2">
            <Check className="h-4.5 w-4.5 text-emerald-600" />
            <span>Profile credentials updated and synchronized securely across active channels!</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-semibold">
          
          {/* Email Address Indicator (Immutable Username Identity) */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-450 uppercase tracking-widest flex items-center gap-1">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              Primary Sign-In Email
            </label>
            <input 
              type="text"
              disabled
              value={email}
              className="w-full text-xs font-bold border border-slate-150 rounded-xl px-3 py-3 bg-slate-100 text-slate-500 cursor-not-allowed font-mono"
              title="Identity email identifier is immutable"
            />
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5 leading-tight">
              Used as your security authentication destination. Ask support agents to modify.
            </span>
          </div>

          {/* Core Support tier visual */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-450 uppercase tracking-widest flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Buzi System Core Clearance
            </label>
            <div className="w-full border border-emerald-200 bg-emerald-50/20 rounded-xl p-3 flex items-center justify-between">
              <div className="flex gap-2.5 items-center">
                <BadgeCheck className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <span className="font-extrabold text-slate-800 block text-xs">Security Status: CLEAR</span>
                  <span className="text-[10px] text-slate-500 font-medium">Daily Limit Protection Active</span>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded font-mono uppercase tracking-wide leading-none select-none">
                {user.type === 'nigerian' ? 'Naira Tier' : 'Foreigner'}
              </span>
            </div>
          </div>

          {/* Full Name field */}
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="block text-[11px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-wine-500" />
              Account Owner's Full Name
            </label>
            <input 
              id="fullName"
              type="text"
              required
              placeholder="e.g. Precious Okonkwo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full text-xs font-bold border border-slate-200 rounded-xl px-3 py-3 focus:ring-1 focus:ring-wine-650 focus:border-wine-650 bg-slate-50/30 font-sans"
            />
          </div>

          {/* Phone number field */}
          <div className="space-y-1.5">
            <label htmlFor="phoneNumber" className="block text-[11px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1">
              <Phone className="h-3.5 w-3.5 text-wine-500" />
              Primary Phone Number
            </label>
            <div className="relative">
              {user.type === 'nigerian' && (
                <span className="absolute left-3.5 top-3.5 text-slate-400 text-xs font-black font-mono select-none">
                  +234
                </span>
              )}
              <input 
                id="phoneNumber"
                type="text"
                placeholder="e.g. 8039121945"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={`w-full text-xs font-bold border border-slate-200 rounded-xl py-3 focus:ring-1 focus:ring-wine-650 focus:border-wine-650 bg-slate-50/30 font-sans ${
                  user.type === 'nigerian' ? 'pl-13 pr-3' : 'px-3'
                }`}
              />
            </div>
          </div>

          {/* Localized Network Carrier Option for Nigerians */}
          {user.type === 'nigerian' && (
            <div className="space-y-1.5">
              <label htmlFor="carrierSelect" className="block text-[11px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1">
                <Signal className="h-3.5 w-3.5 text-amber-500" />
                Default Telecom Carrier Node
              </label>
              <select
                id="carrierSelect"
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                className="w-full text-xs font-bold border border-slate-200 rounded-xl px-3 py-3 focus:ring-1 focus:ring-wine-650 focus:border-wine-650 bg-slate-50/30"
              >
                {carrierOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Country Field */}
          <div className="space-y-1.5">
            <label htmlFor="countrySelect" className="block text-[11px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1">
              <Globe className="h-3.5 w-3.5 text-wine-500" />
              Residency Location
            </label>
            <select
              id="countrySelect"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full text-xs font-bold border border-slate-200 rounded-xl px-3 py-3 focus:ring-1 focus:ring-wine-650 focus:border-wine-650 bg-slate-50/30"
            >
              {countryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Form Actions Footer Panel */}
        <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-slate-450 leading-normal text-[11px]">
            <Sparkles className="h-4 w-4 text-wine-500 shrink-0" />
            <span>Updates sync automatically with simulated SMS broadcasts & payment gateways.</span>
          </div>

          <button
            type="submit"
            disabled={saveStatus === 'saving'}
            className="w-full sm:w-auto px-6 py-3 bg-wine-650 hover:bg-wine-700 disabled:bg-wine-400 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border-0 outline-none"
          >
            {saveStatus === 'saving' ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Synchronizing credentials...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Profile Changes
              </>
            )}
          </button>
        </div>

      </form>
    </motion.div>
  );
}
