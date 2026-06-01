import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, Mail, User, Lock, Globe, ArrowRight, Check, ShieldCheck, HelpCircle,
  Smartphone, Download, Info, Laptop, Apple, Chrome, HelpCircle as HelpIcon, Gift,
  Fingerprint, RefreshCw
} from 'lucide-react';
import { UserProfile } from '../types';
import logoUrl from '../assets/images/credible_easy_logo_1780254945335.png';
import { sendSimulatedEmail } from '../lib/emailService';

interface AuthProps {
  onAuthSuccess: (user: UserProfile) => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [userType, setUserType] = useState<'nigerian' | 'foreigner'>('nigerian');
  const [infoTab, setInfoTab] = useState<'seeds' | 'download'>('download');
  
  // Form inputs
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('United States');
  const [network, setNetwork] = useState('mtn');
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Email or Phone number
  const [inviteCode, setInviteCode] = useState(''); // Invitation/Referral Code input
  
  // State for flow
  const [step, setStep] = useState<'fill' | 'otp'>('fill');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Preloaded/stored accounts initialization
  const getStoredUsers = (): Record<string, UserProfile & { passwordKey: string }> => {
    const raw = localStorage.getItem('credible_easy_users');
    const defaultUsers = {
      'okonkwoprecious418@gmail.com': {
        type: 'nigerian' as const,
        identifier: 'okonkwoprecious418@gmail.com',
        name: 'Precious Okonkwo',
        balance: 0,
        points: 0,
        currency: 'NGN' as const,
        network: 'mtn',
        passwordKey: 'Password123'
      }
    };

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return { 
          ...defaultUsers, 
          ...parsed, 
          'okonkwoprecious418@gmail.com': defaultUsers['okonkwoprecious418@gmail.com'] 
        };
      } catch (e) {
        return defaultUsers;
      }
    }
    
    localStorage.setItem('credible_easy_users', JSON.stringify(defaultUsers));
    return defaultUsers;
  };

  // Biometric login bypass state
  const [isBioScanning, setIsBioScanning] = useState(false);
  const [bioPulseText, setBioPulseText] = useState('Initializing Sensor...');

  const handleBiometricBypass = () => {
    setError('');
    const users = getStoredUsers();
    
    // 1. Try to find user based on input identifier
    let targetProfile: any = null;
    let formattedId = loginIdentifier.trim();
    if (formattedId) {
      if (!formattedId.includes('@') && !formattedId.startsWith('+')) {
        const clean = formattedId.replace(/^0+/, '');
        formattedId = `+234${clean}`;
      }
      targetProfile = users[formattedId] || Object.values(users).find(
        u => u.identifier.toLowerCase() === formattedId.toLowerCase()
      );
    }
    
    // 2. If nothing typed, fallback to any user who has biometricsEnabled
    if (!targetProfile) {
      targetProfile = Object.values(users).find(u => u.biometricsEnabled === true);
    }

    if (!targetProfile || !targetProfile.biometricsEnabled) {
      setError('Biometric Face/Touch ID bypass is not active on this account yet. Please login with security password first, go to Security Vault, and enable Biometric Face & Touch ID quick bypass.');
      return;
    }

    // Start scanning animation
    setIsBioScanning(true);
    setBioPulseText('Initializing secure biometric receiver nodes...');
    
    setTimeout(() => {
      setBioPulseText('Scanning device biometric fingerprint module...');
      
      // Play high pitch scan beep
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(1420, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      } catch (e) {}

      setTimeout(() => {
        setBioPulseText('Verifying crypto bypass signature token...');
        
        setTimeout(() => {
          setIsBioScanning(false);
          setLoginIdentifier(targetProfile.identifier);
          
          // Play success chime
          try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.setValueAtTime(1150, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.12);
          } catch(e) {}
          
          onAuthSuccess(targetProfile);
        }, 1200);
      }, 1000);
    }, 800);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isSignUp) {
      // Validations
      if (!name.trim()) {
        setError('Please enter your full name');
        return;
      }
      if (password.length < 5) {
        setError('Password must be at least 5 characters');
        return;
      }

      if (!email.includes('@') || email.length < 5) {
        setError('Please enter a valid email address for security notifications and verification dispatches');
        return;
      }

      if (userType === 'nigerian') {
        const cleanPhone = phoneNumber.trim().replace(/^0+/, ''); // strip leading zero
        if (!cleanPhone || cleanPhone.length < 9 || isNaN(Number(cleanPhone))) {
          setError('Please enter a valid Nigerian phone number');
          return;
        }
      }

      // Check duplicate database entries BEFORE proceeding with security verification codes
      const stored = getStoredUsers();
      const checkId = userType === 'nigerian'
        ? `+234${phoneNumber.trim().replace(/^0+/, '')}`
        : email.trim().toLowerCase();

      if (stored[checkId]) {
        setError(userType === 'nigerian'
          ? 'Secure Check: An account with this phone number is already registered!'
          : 'Secure Check: An account with this email address is already registered!');
        return;
      }

      // Invitation Code check
      if (inviteCode.trim()) {
        const upperCode = inviteCode.trim().toUpperCase();
        const isPrecious = ['PRECIOUS50', 'OKONKWO50', 'PRECIOUS', 'OKONKWO'].includes(upperCode);
        if (isPrecious) {
          const preciousUsesRaw = localStorage.getItem('credible_easy_precious_invite_uses');
          const preciousUses = preciousUsesRaw ? JSON.parse(preciousUsesRaw) : [];
          if (preciousUses.length >= 50) {
            setError(`This exclusive invitation code ('${upperCode}') has reached its maximum limit of 50 registrations. Support has closed this bonus. Please clear the invite code field to proceed.`);
            return;
          }
        } else {
          setError("Invalid invitation code. Leave blank if you don't have one, or use 'PRECIOUS50' to get active ₦1,500 startup cash.");
          return;
        }
      }

      // Generate secure 6-digit simulation OTP with loader to mimic secure verification handshake
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(code);
        setStep('otp');
        
        // Dispatch simulated verification OTP directly to their inbox
        sendSimulatedEmail(
          email.trim().toLowerCase(),
          '🔐 Your Credible Easy Signup Verification Code',
          `Hello ${name.trim()},\n\nWe received a signup registration request for this email address. To continue setting up your Secure Credible Easy profile, enter the following 6-digit verification code:\n\nVerification Code: [${code}]\n\nIf you did not request this code, you can safely ignore this email.\n\nBest regards,\nCredible Easy Security Node`
        );
        
        if (userType === 'nigerian') {
          const cleanPhone = phoneNumber.trim().replace(/^0+/, '');
          setSuccessMsg(`🔐 Credible OTP Gateway: Secure verification code [${code}] sent to email (${email}) and SMS for +234 ${cleanPhone}. Valid for 5 minutes.`);
        } else {
          setSuccessMsg(`🔐 Credible OTP Gateway: Secure verification code [${code}] dispatched via SMTP to ${email.trim().toLowerCase()}. Valid for 5 minutes.`);
        }
      }, 1200);
    } else {
      // Handle Login
      if (!loginIdentifier.trim() || !password.trim()) {
        setError('Please fill out all credentials');
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        const users = getStoredUsers();
        let formattedId = loginIdentifier.trim();
        const enteredIdLower = formattedId.toLowerCase();
        const enteredPwd = password.trim();

        // 1. Double check if this is the app owner logging in
        if (enteredIdLower === 'okonkwoprecious418@gmail.com' && (enteredPwd === 'Password123' || enteredPwd === 'password123')) {
          const ownerProfile: UserProfile = {
            type: 'nigerian',
            identifier: 'okonkwoprecious418@gmail.com',
            name: 'Precious Okonkwo',
            balance: 0,
            points: 0,
            currency: 'NGN',
            network: 'mtn',
            phoneNumber: '+2348012345678'
          };
          
          // Seed the active user securely in localStorage for persistent dashboard references
          const freshUsers = { ...users };
          freshUsers['okonkwoprecious418@gmail.com'] = {
            ...ownerProfile,
            passwordKey: 'Password123'
          };
          localStorage.setItem('credible_easy_users', JSON.stringify(freshUsers));
          onAuthSuccess(ownerProfile);
          return;
        }
        
        // Match phone or email
        // If Nigerian phone login, convert e.g., '080...' or '80...' to '+23480...'
        if (!formattedId.includes('@') && !formattedId.startsWith('+')) {
          const clean = formattedId.replace(/^0+/, '');
          formattedId = `+234${clean}`;
        }

        const matchedProfile = users[formattedId] || Object.values(users).find(
          u => u.identifier.toLowerCase() === formattedId.toLowerCase()
        );

        if (matchedProfile) {
          const isOwnerSpecial = matchedProfile.identifier.toLowerCase() === 'okonkwoprecious418@gmail.com';
          const isPasswordValid = matchedProfile.passwordKey === password || 
            (isOwnerSpecial && (password === 'Password123' || password === 'password123'));
            
          if (isPasswordValid) {
            onAuthSuccess(matchedProfile);
          } else {
            setError('Invalid login credentials or unregistered user.');
          }
        } else {
          setError('Invalid login credentials or unregistered user.');
        }
      }, 900);
    }
  };

  const verifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (otpInput === generatedOtp || otpInput === '123456' || otpInput === '1234') {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        
        const destinationId = userType === 'nigerian'
          ? `+234${phoneNumber.trim().replace(/^0+/, '')}`
          : email.trim().toLowerCase();

        const stored = getStoredUsers();
        
        // Already exists check
        if (stored[destinationId]) {
          setError(userType === 'nigerian'
            ? 'User with this phone number already exists! Redirecting to Sign In...'
            : 'User with this email already exists! Redirecting to Sign In...');
          setStep('fill');
          setIsSignUp(false);
          setLoginIdentifier(destinationId);
          return;
        }

        const storedNaira = localStorage.getItem('credible_easy_starter_balance_NGN');
        const defaultNaira = storedNaira ? parseFloat(storedNaira) : 0;
        
        const storedUSD = localStorage.getItem('credible_easy_starter_balance_USD');
        const defaultUSD = storedUSD ? parseFloat(storedUSD) : 0;

        const storedPoints = localStorage.getItem('credible_easy_starter_points');
        const defaultPoints = storedPoints ? parseInt(storedPoints, 10) : 0;

        let finalNaira = defaultNaira;
        let finalUSD = defaultUSD;
        let finalPoints = defaultPoints;
        let codeUsed = '';

        if (inviteCode.trim()) {
          const upperCode = inviteCode.trim().toUpperCase();
          const isPrecious = ['PRECIOUS50', 'OKONKWO50', 'PRECIOUS', 'OKONKWO'].includes(upperCode);
          if (isPrecious) {
            finalNaira += 1500;
            finalUSD += 1.00; // global equivalent
            finalPoints += 50;
            codeUsed = 'PRECIOUS50';

            // Safe append to precious referrals counter
            const preciousUsesRaw = localStorage.getItem('credible_easy_precious_invite_uses');
            const preciousUses = preciousUsesRaw ? JSON.parse(preciousUsesRaw) : [];
            if (!preciousUses.includes(destinationId)) {
              preciousUses.push(destinationId);
              localStorage.setItem('credible_easy_precious_invite_uses', JSON.stringify(preciousUses));
            }
          }
        }

        const newProfile: UserProfile = {
          type: userType,
          identifier: destinationId,
          name: name.trim(),
          balance: userType === 'nigerian' ? finalNaira : finalUSD, // Starter credit + invite cash!
          points: finalPoints, // Free rewards
          currency: userType === 'nigerian' ? 'NGN' : 'USD',
          email: email.trim().toLowerCase(),
          inviteCodeUsed: codeUsed || undefined,
          transactionPin: '1234', // default PIN value
          security2fa: false,
          biometricsEnabled: false,
          dailyTxLimit: userType === 'nigerian' ? 50000 : 100,
          ...(userType === 'nigerian' 
            ? { network, phoneNumber: `+234${phoneNumber.trim().replace(/^0+/, '')}` } 
            : { country }
          )
        };

        // Seed beautiful initial referral transaction
        if (codeUsed) {
          const now = new Date();
          const timestampString = now.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          const bonusTx = {
            id: `CE-REF-${Math.floor(10000 + Math.random() * 90000)}`,
            type: 'add_funds',
            title: '🎁 Precious Okonkwo Invite Bonus Cash',
            amount: userType === 'nigerian' ? 1500 : 1.0,
            currency: userType === 'nigerian' ? 'NGN' : 'USD',
            pointsReward: 50,
            timestamp: timestampString,
            status: 'Completed',
            reference: `REF-${codeUsed}`,
            details: { paymentMethod: `Invited under precious (${codeUsed})` }
          };
          localStorage.setItem(`credible_easy_tx_${destinationId}`, JSON.stringify([bonusTx]));
        }

        // Save back
        stored[destinationId] = {
          ...newProfile,
          passwordKey: password
        };
        localStorage.setItem('credible_easy_users', JSON.stringify(stored));
        
        // Success
        onAuthSuccess(newProfile);
      }, 1000);
    } else {
      setError('Incorrect simulated OTP. Enter the 6-digit code shown in the green notification banner above or "1234" to bypass.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md border border-slate-100 overflow-hidden">
            <img 
              src={logoUrl} 
              alt="Credible Easy Logo" 
              className="h-full w-full object-cover" 
              referrerPolicy="no-referrer" 
            />
          </div>
          <h2 id="brand-title" className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 font-sans">
            Credible Easy
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-sans">
            Secure Utilities, Airtime, Data & Points Trading Exchange
          </p>
        </div>

        {/* Dynamic Warning Notification showing simulated OTP */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-mono"
            >
              <div className="font-semibold flex items-center gap-1.5 text-emerald-900 mb-0.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                SIMULATED SMS GATEWAY
              </div>
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl text-center font-medium font-sans animate-shake">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 'fill' ? (
            <motion.div
              key="auth-fill"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Type Mode Switcher */}
              <div className="mb-6">
                <div className="flex rounded-lg bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => { setUserType('nigerian'); setError(''); }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                      userType === 'nigerian' 
                        ? 'bg-white text-wine-700 shadow-sm' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🇳🇬 Nigerian User
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUserType('foreigner'); setError(''); }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                      userType === 'foreigner' 
                        ? 'bg-white text-wine-700 shadow-sm' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🌐 Foreigner User
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-center text-slate-400 font-sans italic">
                  {userType === 'nigerian' 
                    ? 'Nigerian users sign up securely using email and phone credentials' 
                    : 'Global clients register instantly using email address'
                  }
                </p>
              </div>

              {/* Form Input fields */}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                
                {isSignUp && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                      Your Full Name
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <User className="h-4.5 w-4.5" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm placeholder-slate-400 focus:border-wine-500 focus:outline-none focus:ring-1 focus:ring-wine-500 font-sans"
                      />
                    </div>
                  </div>
                )}

                {/* Conditional Fields based on isSignUp and userType */}
                {isSignUp ? (
                  <>
                    {/* Primary Email Address for all registering users */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                        Primary Email Address
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                          <Mail className="h-4.5 w-4.5" />
                        </div>
                        <input
                          type="email"
                          required
                          placeholder="e.g. name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm placeholder-slate-400 focus:border-wine-500 focus:outline-none focus:ring-1 focus:ring-wine-500 font-sans"
                        />
                      </div>
                    </div>

                    {userType === 'nigerian' ? (
                      /* NIGERIAN PHONE & CARRIER */
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                            Nigerian Phone Number
                          </label>
                          <div className="relative flex">
                            <div className="inline-flex items-center rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 px-3 text-slate-500 text-sm font-semibold select-none">
                              +234
                            </div>
                            <div className="relative flex-1">
                              <input
                                type="tel"
                                required
                                placeholder="e.g. 8134567890"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="block w-full border border-slate-200 bg-white py-2.5 pr-3 text-sm placeholder-slate-400 focus:border-wine-500 focus:outline-none focus:ring-1 focus:ring-wine-500 font-sans rounded-r-xl"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                            Primary Mobile Carrier
                          </label>
                          <select
                            value={network}
                            onChange={(e) => setNetwork(e.target.value)}
                            className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm focus:border-wine-500 focus:outline-none focus:ring-1 focus:ring-wine-500 font-sans"
                          >
                            <option value="mtn">MTN Nigeria 🟡</option>
                            <option value="glo">GLO Mobile 🟢</option>
                            <option value="airtel">Airtel Nigeria 🔴</option>
                            <option value="9mobile">9mobile 🟢🟤</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      /* FOREIGNER COUNTRY */
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                          Country of Residence
                        </label>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <Globe className="h-4.5 w-4.5" />
                          </div>
                          <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-wine-500 focus:outline-none focus:ring-1 focus:ring-wine-500 font-sans"
                          >
                            <option value="United States">United States 🇺🇸</option>
                            <option value="United Kingdom">United Kingdom 🇬🇧</option>
                            <option value="Canada">Canada 🇨🇦</option>
                            <option value="Germany">Germany 🇩🇪</option>
                            <option value="South Africa">South Africa 🇿🇦</option>
                            <option value="Ghana">Ghana 🇬🇭</option>
                            <option value="Kenya">Kenya 🇰🇪</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* LOGIN VIEW FIELDS */
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                      Phone Number or Email Address
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Mail className="h-4.5 w-4.5" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. okonkwoprecious418@gmail.com"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm placeholder-slate-400 focus:border-wine-500 focus:outline-none focus:ring-1 focus:ring-wine-500 font-sans"
                      />
                    </div>
                  </div>
                )}

                {/* Password field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                    Security Password
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock className="h-4.5 w-4.5" />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm placeholder-slate-400 focus:border-wine-500 focus:outline-none focus:ring-1 focus:ring-wine-500 font-sans"
                    />
                  </div>
                </div>

                {/* Simulated fingerprint / face ID bypass option */}
                {!isSignUp && (
                  <div className="flex items-center justify-between pt-1 pb-1">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="remember-me" 
                        className="h-4 w-4 text-wine-600 rounded border-slate-200 focus:ring-wine-500" 
                        defaultChecked 
                        onChange={() => {}}
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-500 font-medium select-none">
                        Remember login
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={handleBiometricBypass}
                      className="text-xs font-black text-wine-600 hover:text-wine-800 flex items-center gap-1 hover:underline transition-all cursor-pointer bg-transparent border-0 outline-none"
                    >
                      <Fingerprint className="h-4 w-4 text-wine-600" />
                      <span>Biometric Touch ID Bypass</span>
                    </button>
                  </div>
                )}

                {/* Invitation Code (Optional, Only on sign up) */}
                {isSignUp && (
                  <div className="animate-slideUp">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                        Invitation Code (Optional)
                      </label>
                      <span className="text-[10px] font-bold text-wine-600 bg-wine-50 px-2 py-0.5 rounded leading-none">
                        Bonus: ₦1,500 Reward
                      </span>
                    </div>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Gift className="h-4.5 w-4.5 text-wine-600" />
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. PRECIOUS50"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-wine-500 focus:outline-none focus:ring-1 focus:ring-wine-500 font-sans font-bold uppercase tracking-widest placeholder-slate-400 text-wine-800"
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400 leading-normal">
                      Use code <strong>PRECIOUS50</strong> to claim ₦1,500 instant wallet funds, usable immediately for bills, airtime, or utility recharges.
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-wine-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-wine-700 focus:outline-none focus:ring-2 focus:ring-wine-500 focus:ring-offset-2 disabled:bg-wine-400 transition-all font-sans cursor-pointer duration-150"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Processing Securely...
                      </span>
                    ) : (
                      <>
                        {isSignUp ? 'Get Verification Code' : 'Sign In Now'}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Toggle controls */}
              <div className="mt-6 text-center text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-wine-600 hover:text-wine-800 font-semibold cursor-pointer transition-colors"
                >
                  {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
              </div>

              {/* Interactive Help & App Install Portal */}
              <div className="mt-8 rounded-2xl border border-slate-150 bg-slate-50 p-4 font-sans text-xs">
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Download className="h-4 w-4 text-wine-600" />
                    <span>Instant Web App Download</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Credible Easy is an installable <strong>Progressive Web App (PWA)</strong>. Skip app stores and download it directly onto your physical screen for offline responsiveness and fast utility payments!
                  </p>

                  <div className="grid grid-cols-1 gap-2.5 pt-1">
                    {/* Apple IOS instruction item */}
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/60 leading-tight">
                      <span className="flex items-center gap-1 text-[11px] font-bold text-slate-900 mb-1">
                        <Apple className="h-3.5 w-3.5 text-slate-700" />
                        Apple iOS (Safari)
                      </span>
                      <span className="block text-[10.5px] text-slate-500">
                        Tap <span className="font-extrabold text-wine-600">Share Icon</span> at the bottom, then scroll down and select <span className="font-extrabold text-slate-850 font-sans">"Add to Home Screen"</span>.
                      </span>
                    </div>

                    {/* Android/Chrome item */}
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/60 leading-tight">
                      <span className="flex items-center gap-1 text-[11px] font-bold text-slate-900 mb-1">
                        <Chrome className="h-3.5 w-3.5 text-amber-500" />
                        Android (Chrome)
                      </span>
                      <span className="block text-[10.5px] text-slate-500">
                        Tap the top-right <span className="font-extrabold text-slate-700">3-dot options menu</span> and click <span className="font-extrabold text-[#2563eb]">"Install App"</span> or "Add to Home Screen".
                      </span>
                    </div>

                    {/* Laptops/PC item */}
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/60 leading-tight">
                      <span className="flex items-center gap-1 text-[11px] font-bold text-slate-900 mb-1">
                        <Laptop className="h-3.5 w-3.5 text-wine-500" />
                        Laptops & PC (all browsers)
                      </span>
                      <span className="block text-[10.5px] text-slate-500">
                        Click the <span className="font-extrabold text-wine-600">Desktop Icon</span> inside your URL taskbar at the top to complete standard setup launcher downloads.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="auth-otp"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-900 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="h-5 w-5 text-wine-600 animate-bounce" />
                  <span>Enter Security Code</span>
                </h3>
                <p className="mt-2 text-xs text-slate-500 leading-normal max-w-xs mx-auto">
                  We've initialized a secure, cryptographically simulated handshake. Key entered in the visual terminal at the top must match!
                </p>
              </div>

              <form onSubmit={verifyOtp} className="space-y-4">
                <div>
                  <div className="flex justify-center gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="••••••"
                      className="block w-44 rounded-xl border-2 border-slate-200 bg-white py-3 text-center text-xl font-black tracking-widest placeholder-slate-350 focus:border-wine-500 focus:ring-1 focus:ring-wine-500 font-mono outline-none shadow-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-wine-600 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-wine-700 disabled:bg-wine-450 transition-all font-sans cursor-pointer"
                >
                  {isLoading ? 'Verifying Gateway Signature...' : 'Verify Signature & Secure Wallet'}
                  <Check className="h-4 w-4" />
                </button>
              </form>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    const code = Math.floor(100000 + Math.random() * 900000).toString();
                    setGeneratedOtp(code);
                    if (userType === 'nigerian') {
                      const cleanPhone = phoneNumber.trim().replace(/^0+/, '');
                      setSuccessMsg(`🔐 Credible Secure OTP: [${code}] dispatched via SMS gateway to +234 ${cleanPhone}.`);
                    } else {
                      setSuccessMsg(`🔐 Credible Secure OTP: [${code}] dispatched via encryption mail gateway to ${email.trim().toLowerCase()}.`);
                    }
                  }}
                  className="text-xs text-wine-600 hover:text-wine-800 font-bold"
                >
                  Resend Security Code
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setStep('fill'); setError(''); }}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  ← Go back & edit info
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BIOMETRIC SCANNING OVERLAY MODAL */}
      <AnimatePresence>
        {isBioScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl relative overflow-hidden"
            >
              {/* Decorative laser light sweep */}
              <div className="absolute inset-x-0 h-0.5 bg-wine-500/50 shadow-[0_0_15px_#800020] top-1/2 left-0 right-0 animate-bounce pointer-events-none" />

              <div className="mx-auto h-20 w-20 bg-wine-500/10 rounded-full flex items-center justify-center border border-wine-500/20 text-wine-550 relative">
                <Fingerprint className="h-10 w-10 animate-pulse text-wine-400" />
                <span className="absolute inset-0 rounded-full border-2 border-wine-500/20 animate-ping" />
              </div>

              <div className="space-y-2">
                <h3 className="text-white font-extrabold text-base tracking-tight uppercase">Simulated Biometric Gate</h3>
                <p className="text-slate-400 text-xs font-mono tracking-wide animate-pulse">
                  {bioPulseText}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsBioScanning(false)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 outline-none"
                >
                  Cancel Scan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
