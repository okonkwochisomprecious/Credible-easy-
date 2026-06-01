import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, Key, Smartphone, Fingerprint, Lock, CheckCircle, 
  RefreshCw, AlertTriangle, Scale, ShieldCheck, Mail, Shield, UserCheck
} from 'lucide-react';
import { UserProfile } from '../types';
import { sendMockSMSCode } from '../lib/smsService';
import { sendSimulatedEmail } from '../lib/emailService';

interface SecurityVaultProps {
  user: UserProfile;
  onUserUpdate: (updated: UserProfile) => void;
}

export default function SecurityVault({ user, onUserUpdate }: SecurityVaultProps) {
  // PIN management
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');
  const [pinError, setPinError] = useState('');

  // Daily Spending Limit
  const [dailyLimit, setDailyLimit] = useState(user.dailyTxLimit ? user.dailyTxLimit.toString() : '50000');
  const [limitSuccess, setLimitSuccess] = useState(false);

  // Daily limit 2FA verification state
  const [isVerifyingLimit, setIsVerifyingLimit] = useState(false);
  const [limitOtpSentCode, setLimitOtpSentCode] = useState('');
  const [limitOtpInput, setLimitOtpInput] = useState('');
  const [limitOtpError, setLimitOtpError] = useState('');
  const [pendingDailyLimitTarget, setPendingDailyLimitTarget] = useState<number | null>(null);
  const [isSmsSending, setIsSmsSending] = useState(false);

  // Biometric Bypass Simulation States
  const [isScanningBio, setIsScanningBio] = useState(false);
  const [scanResult, setScanResult] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');

  // Security action activity logs
  const [securityLogs, setSecurityLogs] = useState([
    { id: 1, action: 'Profile Session Authentication Passed', ip: '102.89.44.82', date: 'Just Now', status: 'Success' },
    { id: 2, action: 'Assigned safe transactional PIN protection', ip: '102.89.44.82', date: '10 mins ago', status: 'Secured' },
    { id: 3, action: 'Simulated Biometric Firewall initialized', ip: 'SYSTEM_INTERNAL', date: '10 mins ago', status: 'Core' }
  ]);

  const symbol = user.currency === 'NGN' ? '₦' : '$';

  // Handler for changing PIN
  const handlePinChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setPinSuccess('');

    const expectedCurrent = user.transactionPin || '1234';
    if (currentPin !== expectedCurrent) {
      setPinError('Invalid current PIN keys. If this is a new signup details, your default PIN is "1234".');
      return;
    }

    if (!/^\d{4}$/.test(newPin)) {
      setPinError('New PIN must contain precisely 4 digits (0-9).');
      return;
    }

    if (newPin !== confirmPin) {
      setPinError('New PIN validation mismatched. Please make sure both numeric fields are identical.');
      return;
    }

    // Save
    const updatedUser: UserProfile = {
      ...user,
      transactionPin: newPin
    };
    onUserUpdate(updatedUser);

    setSecurityLogs([
      { id: Date.now(), action: 'Successfully updated Transaction PIN keys', ip: '102.89.44.82', date: 'Just Now', status: 'Success' },
      ...securityLogs
    ]);

    setPinSuccess('PIN updated successfully. Your new 4-digit security code is now active for utility debits!');
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
  };

  // Toggle Two-Factor Authentication
  const handleToggle2FA = () => {
    const next2FA = !user.security2fa;
    const updated: UserProfile = {
      ...user,
      security2fa: next2FA
    };
    onUserUpdate(updated);

    setSecurityLogs([
      { id: Date.now(), action: next2FA ? 'Activated Two-Factor Authentication' : 'Deactivated Two-Factor Authentication', ip: '102.89.44.82', date: 'Just Now', status: 'Configured' },
      ...securityLogs
    ]);
  };

  // Toggle biometrics simulation
  const handleToggleBiometrics = () => {
    const nextBio = !user.biometricsEnabled;
    const updated: UserProfile = {
      ...user,
      biometricsEnabled: nextBio
    };
    onUserUpdate(updated);

    setSecurityLogs([
      { id: Date.now(), action: nextBio ? 'Enabled Biometric bypass login' : 'Disabled Biometric bypass locks', ip: '102.89.44.82', date: 'Just Now', status: 'Configured' },
      ...securityLogs
    ]);
  };

  // Apply limit updates after verification checks
  const applyLimitUpdate = (parsed: number) => {
    const updated: UserProfile = {
      ...user,
      dailyTxLimit: parsed
    };
    onUserUpdate(updated);

    setSecurityLogs([
      { id: Date.now(), action: `Daily spend threshold adjusted to ${symbol}${parsed.toLocaleString()}`, ip: '102.89.44.82', date: 'Just Now', status: 'Limiter' },
      ...securityLogs
    ]);

    setLimitSuccess(true);
    setTimeout(() => setLimitSuccess(false), 2000);
    setIsVerifyingLimit(false);
    setLimitOtpInput('');
    setLimitOtpSentCode('');
    setPendingDailyLimitTarget(null);
  };

  // Save customized spend limits with OTP verification for increases
  const handleSaveSpendsLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(dailyLimit);
    if (isNaN(parsed) || parsed < 100) {
      alert('Limit must be a positive number of at least 100');
      return;
    }

    const currentLimit = user.dailyTxLimit || 50000;

    // Trigger mock SMS OTP 2FA if increasing limit
    if (parsed > currentLimit) {
      setIsSmsSending(true);
      setLimitOtpError('');
      try {
        const destContact = user.phoneNumber || user.identifier || '+2348039121945';
        const sentCode = await sendMockSMSCode(destContact, `limit increase to ${symbol}${parsed.toLocaleString()}`);
        
        // Dispatch to Simulated Email Inbox as requested
        sendSimulatedEmail(
          user.email || user.identifier || 'sandbox@credibleeasy.com',
          '🔐 Two-Factor Authorization: Modify Spend Limit Threshold',
          `Hello ${user.name},\n\nWe received a secure action request to increase your daily spending threshold to: ${symbol}${parsed.toLocaleString()}.\n\nTo authorize this adjustment, please use the following 2-Factor verification code:\n\nVerification Code: [${sentCode}]\n\nBest regards,\nCredible Easy Security Firewall Node`
        );

        setLimitOtpSentCode(sentCode);
        setPendingDailyLimitTarget(parsed);
        setIsVerifyingLimit(true);
      } catch (err) {
        setLimitOtpError('Failed to send verification code. Please try again.');
      } finally {
        setIsSmsSending(false);
      }
      return;
    }

    // Otherwise, decrease or same limits do not require 2FA
    applyLimitUpdate(parsed);
  };

  const handleVerifyLimitOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLimitOtpError('');

    if (limitOtpInput.trim() !== limitOtpSentCode) {
      setLimitOtpError('Invalid 2FA code. Check the simulated SMS push banner or Simulated Email Inbox!');
      return;
    }

    if (pendingDailyLimitTarget !== null) {
      applyLimitUpdate(pendingDailyLimitTarget);
    }
  };

  const handleCancelLimitVerify = () => {
    setIsVerifyingLimit(false);
    setLimitOtpInput('');
    setLimitOtpSentCode('');
    setPendingDailyLimitTarget(null);
    setDailyLimit(user.dailyTxLimit ? user.dailyTxLimit.toString() : '50000');
  };

  return (
    <div id="security-vault-view" className="space-y-6 font-sans">
      
      {/* HEADER SECTION */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-wine-600" /> Security Gateway Crypt Vault
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 mt-1 leading-relaxed">
            Manage your financial credentials, set limits, toggle SMS OTP protections, and audit active biometric firewalls.
          </p>
        </div>
        <div className="flex bg-wine-50/70 border border-wine-100 px-3 py-1.5 rounded-xl text-wine-700 text-xs font-bold items-center gap-1.5">
          <ShieldAlert className="h-4.5 w-4.5 text-wine-600 animate-pulse" /> Unified Shield: Enabled
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. TRANSACTION PIN BOX */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <Key className="h-4.5 w-4.5 text-wine-600" />
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide">Manage Transaction PIN</h3>
          </div>

          <form onSubmit={handlePinChange} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Current 4-Digit PIN</label>
              <input 
                type="password" 
                maxLength={4}
                required
                placeholder="••••"
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono tracking-widest focus:border-wine-500 focus:outline-none focus:ring-1 focus:ring-wine-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">New 4-Digit PIN</label>
                <input 
                  type="password" 
                  maxLength={4}
                  required
                  placeholder="••••"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono tracking-widest focus:border-wine-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Confirm New PIN</label>
                <input 
                  type="password" 
                  maxLength={4}
                  required
                  placeholder="••••"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono tracking-widest focus:border-wine-500 focus:outline-none"
                />
              </div>
            </div>

            {pinError && <p className="text-[10.5px] text-red-600 font-semibold leading-tight">{pinError}</p>}
            {pinSuccess && <p className="text-[10.5px] text-emerald-700 font-bold leading-tight bg-emerald-50 p-2 rounded-lg border border-emerald-100">{pinSuccess}</p>}

            <button 
              type="submit" 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
            >
              Update Security PIN
              <Lock className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        {/* 2. SECURITY FIREWALL TOGGLES */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
              <Smartphone className="h-4.5 w-4.5 text-wine-600" />
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide">Dynamic Protections</h3>
            </div>

            {/* TWO-FACTOR SMS LOCKS */}
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="space-y-0.5">
                <span className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  SMS OTP Validation (2FA)
                  <span className={`h-2 w-2 rounded-full ${user.security2fa ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                </span>
                <span className="block text-[10px] text-slate-450 leading-relaxed max-w-xs">
                  Generate SMS one-time-passcode requests for large checkout transactions.
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggle2FA}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  user.security2fa ? 'bg-wine-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    user.security2fa ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* BIOMETRIC SIMULATORS */}
            <div className="space-y-1">
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="space-y-0.5">
                  <span className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    Biometric Face & Touch ID
                    <span className={`h-2 w-2 rounded-full ${user.biometricsEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  </span>
                  <span className="block text-[10px] text-slate-450 leading-relaxed max-w-xs">
                    Allows quick authorization gates without entering safety PIN keys for sandbox logins.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleBiometrics}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    user.biometricsEnabled ? 'bg-wine-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      user.biometricsEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <AnimatePresence>
                {user.biometricsEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-wine-50/40 border border-dashed border-wine-200 rounded-2xl mt-2.5 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Fingerprint className="h-4 w-4 text-wine-600 animate-pulse" /> Security Scanner Sandbox
                        </span>
                        <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase">
                          Bypass Configured
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-450 leading-relaxed">
                        Test sensor capture: verify simulated biometrics handshake bypass parameters.
                      </p>

                      <div className="bg-white rounded-xl p-2.5 border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                            scanResult === 'scanning' 
                              ? 'bg-wine-50 text-wine-600 animate-pulse' 
                              : scanResult === 'success' 
                              ? 'bg-emerald-50 text-emerald-600' 
                              : 'bg-slate-50 text-slate-400'
                          }`}>
                            <Fingerprint className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <span className="text-[10.5px] font-extrabold text-slate-800 block leading-tight">
                              {scanResult === 'success' 
                                ? '🔑 Bypass Verified OK' 
                                : isScanningBio 
                                ? 'Awaiting Scan Capture...' 
                                : 'Handshake Ready'}
                            </span>
                            <span className="text-[8.5px] text-slate-400 block font-mono">
                              {isScanningBio ? 'FINGER_SCANNING_RAW' : 'BYPASS_ACTIVE_STANDBY'}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setIsScanningBio(true);
                            setScanResult('scanning');
                            setTimeout(() => {
                              setIsScanningBio(false);
                              setScanResult('success');
                              setSecurityLogs(prev => [
                                { id: Date.now(), action: 'Diagnostic biometric credentials sweep successful', ip: 'LOCAL_SENSOR_HUB', date: 'Just Now', status: 'Success' },
                                ...prev
                              ]);
                              setTimeout(() => setScanResult('idle'), 2500);
                            }, 1500);
                          }}
                          disabled={isScanningBio}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[9.5px] font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                        >
                          {isScanningBio ? (
                            <>
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              <span>Scanning...</span>
                            </>
                          ) : (
                            <>
                              <span>Simulate Scan</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 bg-amber-50 p-2 border border-amber-100 rounded-xl text-amber-800 leading-snug flex items-start gap-1.5 font-medium">
            <AlertTriangle className="h-4 w-4 text-amber-650 shrink-0 mt-0.5" />
            Please keep your 4-digit PIN confidential. Default preset code "1234" can be customized above to ensure total security.
          </div>
        </div>

      </div>

      {/* 3. DUAL SECTORS: TRANSACT LIMITER & FIREWALL DIARIES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* ACCOUNT LIMITER */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm md:col-span-1 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <Scale className="h-4.5 w-4.5 text-wine-600" />
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">Daily Limit Guard</h3>
          </div>

          <AnimatePresence mode="wait">
            {!isVerifyingLimit ? (
              <motion.form
                key="limit-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSaveSpendsLimit}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Max Daily Transfer Cap</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-450 font-extrabold font-mono text-sm">{symbol}</span>
                    <input 
                      type="number" 
                      value={dailyLimit}
                      onChange={(e) => setDailyLimit(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 py-2 pl-8 pr-3 text-sm font-bold font-mono focus:border-wine-500 focus:outline-none"
                      min="100"
                    />
                  </div>
                  <p className="text-[9.5px] text-slate-400 leading-tight pt-1">
                    A security safeguard constraint capping the max naira/usd bill purchases permitted in a 24-hour cycle.
                  </p>
                </div>

                {limitSuccess && (
                  <p className="text-[10px] text-emerald-700 bg-emerald-50 p-1.5 border border-emerald-100 rounded font-bold text-center">
                    Spending threshold guard updated!
                  </p>
                )}

                <button 
                  type="submit" 
                  disabled={isSmsSending}
                  className="w-full bg-wine-650 text-white rounded-xl py-2.5 text-xs font-black hover:bg-wine-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSmsSending ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Sending 2FA SMS...</span>
                    </>
                  ) : (
                    <>
                      <span>Update Spend limits</span>
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="otp-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleVerifyLimitOtp}
                className="space-y-4"
              >
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[10.5px] text-amber-900 leading-relaxed space-y-1">
                  <span className="font-extrabold block text-amber-955 flex items-center gap-1">
                    🔒 SMS 2FA REQUIRED
                  </span>
                  <p>
                    We sent a simulated verification code to <b className="font-mono">{user.phoneNumber || user.identifier || '+2348039121945'}</b>. Please enter the OTP to approve this limit increase target of <b>{symbol}{pendingDailyLimitTarget?.toLocaleString()}</b>.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Enter 6-Digit SMS Code</label>
                  <input 
                    type="text" 
                    required
                    maxLength={6}
                    placeholder="••••••"
                    value={limitOtpInput}
                    onChange={(e) => setLimitOtpInput(e.target.value.replace(/\D/g, ''))}
                    className="block w-full rounded-xl border border-slate-200 py-2.5 px-3 text-center text-sm font-bold font-mono tracking-[0.4em] focus:border-amber-500 focus:outline-none"
                  />
                  {limitOtpError && (
                    <p className="text-[10px] text-rose-600 font-bold pt-1 leading-snug">{limitOtpError}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={handleCancelLimitVerify}
                    className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="w-2/3 bg-wine-600 hover:bg-wine-700 text-white rounded-xl py-2 text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    Verify & Save
                    <CheckCircle className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* FIREWALL SECURE JOURNALS */}
        <div className="bg-slate-950 text-white border border-slate-900 rounded-2xl p-6 shadow-sm md:col-span-2 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-20 w-20 bg-wine-500/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="border-b border-slate-850 pb-2 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest tracking-wider flex items-center gap-1">
              <ShieldAlert className="h-4 w-4 text-wine-400" /> Account Security Journals
            </span>
            <span className="text-[9px] bg-wine-400/10 border border-wine-400/20 px-1.5 py-0.5 rounded text-wine-400 select-none">IP Firewall Enabled</span>
          </div>

          <div className="space-y-2.5 pt-1.5 max-h-[190px] overflow-y-auto pr-1">
            {securityLogs.map((log) => {
              const badgeColors = log.status === 'Success' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : log.status === 'Secured' 
                ? 'bg-wine-400/10 text-wine-400 border border-wine-400/20' 
                : 'bg-indigo-400/10 text-indigo-400 border border-indigo-505/20';

              return (
                <div key={log.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-850 text-slate-350 text-xs gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="text-sm shrink-0">🛡️</span>
                    <div>
                      <span className="block font-bold text-slate-200 text-xs leading-snug">{log.action}</span>
                      <span className="block text-[9.5px] text-slate-400 font-mono mt-0.5 font-medium">IP Anchor: {log.ip} • Date: {log.date}</span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded leading-none shrink-0 border ${badgeColors}`}>
                    {log.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
