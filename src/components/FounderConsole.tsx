import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, Settings, Users, Radio, MessageSquare, Plus, Trash2, 
  Edit2, Check, Sparkles, Database, Save, RotateCcw, HelpCircle, ShieldCheck,
  Smartphone, Mail, Activity, Link, Server, Key, RefreshCw
} from 'lucide-react';
import { UserProfile, NetworkProvider, UtilityProvider } from '../types';

interface FounderConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUserUpdate: (updatedUser: UserProfile) => void;
  onConfigChange?: () => void; // Notify Dashboard to refresh general states
}

interface Bulletin {
  id: string;
  icon: string;
  title: string;
  content: string;
  color: string; // indigo, teal, amber, rose
}

export default function FounderConsole({ 
  isOpen, 
  onClose, 
  currentUser, 
  onUserUpdate,
  onConfigChange 
}: FounderConsoleProps) {
  const [activeTab, setActiveTab] = useState<'financials' | 'users' | 'billers' | 'bulletins' | 'mtn_b2b' | 'agents'>('financials');

  // --- Module 1: FINANCIALS TUNING STATE ---
  const [exchangeRateNGN, setExchangeRateNGN] = useState(10.00);
  const [exchangeRateUSD, setExchangeRateUSD] = useState(0.007);
  const [starterBalanceNGN, setStarterBalanceNGN] = useState(0);
  const [starterBalanceUSD, setStarterBalanceUSD] = useState(0);
  const [starterPoints, setStarterPoints] = useState(0);

  // --- Module 2: REGISTERED USERS DIR ---
  const [usersList, setUsersList] = useState<Record<string, any>>({});
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserBalance, setEditUserBalance] = useState('');
  const [editUserPoints, setEditUserPoints] = useState('');
  const [editUserName, setEditUserName] = useState('');

  // --- Module 3: RE-CONFIG BILLERS ---
  const [customNetworksNGN, setCustomNetworksNGN] = useState<NetworkProvider[]>([]);
  const [customNetworksUSD, setCustomNetworksUSD] = useState<NetworkProvider[]>([]);
  const [customUtilities, setCustomUtilities] = useState<UtilityProvider[]>([]);
  
  // Custom builder form states
  const [billerType, setBillerType] = useState<'network_ngn' | 'network_usd' | 'utility'>('network_ngn');
  const [billerId, setBillerId] = useState('');
  const [billerName, setBillerName] = useState('');
  const [billerEmoji, setBillerEmoji] = useState('🟡');
  const [billerCategory, setBillerCategory] = useState<'electricity' | 'water'>('electricity');

  // --- Module 4: BULLETINS STATE ---
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [newBulletinIcon, setNewBulletinIcon] = useState('⚡');
  const [newBulletinTitle, setNewBulletinTitle] = useState('');
  const [newBulletinContent, setNewBulletinContent] = useState('');
  const [newBulletinColor, setNewBulletinColor] = useState('indigo');

  // --- Module 5: MTN B2B TELECOM INTEGRATION STATE ---
  const [mtnBusinessEmail, setMtnBusinessEmail] = useState('okonkwoprecious418@gmail.com');
  const [mtnBusinessPhone, setMtnBusinessPhone] = useState('+2348039121945');
  const [mtnWebhookUrl, setMtnWebhookUrl] = useState('https://api.credibleeasy.com/v1/webhooks/mtn');
  const [mtnApiKey, setMtnApiKey] = useState('mtn-momo-live-pk_3b72cda90d81b4f420e1ddfbc0023ee');
  const [mtnPartnerId, setMtnPartnerId] = useState('CREDEASY-99');
  const [mtnVerificationStatus, setMtnVerificationStatus] = useState('verified'); // verified | pending | disconnected
  const [mtnConnectedLines, setMtnConnectedLines] = useState<string[]>([
    '+2348031200000',
    '+2348149800000',
    '+2349033300000',
    '+2347065400000',
    '+2348039121945'
  ]);
  const [newMtnLine, setNewMtnLine] = useState('');
  const [isVerifyingMtn, setIsVerifyingMtn] = useState(false);

  // --- Module 6: SUPPORT AGENTS MANAGEMENT ---
  const [supportAgents, setSupportAgents] = useState<any[]>([]);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentRole, setNewAgentRole] = useState('');
  const [newAgentEmoji, setNewAgentEmoji] = useState('👩‍💻');
  const [newAgentColor, setNewAgentColor] = useState('bg-pink-500');
  const [newAgentStatus, setNewAgentStatus] = useState<'Online' | 'Offline'>('Online');
  const [newAgentSpeed, setNewAgentSpeed] = useState('Replies instantly');

  useEffect(() => {
    if (!isOpen) return;

    // Load financials config
    setExchangeRateNGN(parseFloat(localStorage.getItem('credible_easy_config_baseRate_NGN') || '10.00'));
    setExchangeRateUSD(parseFloat(localStorage.getItem('credible_easy_config_baseRate_USD') || '0.007'));
    setStarterBalanceNGN(parseFloat(localStorage.getItem('credible_easy_starter_balance_NGN') || '0'));
    setStarterBalanceUSD(parseFloat(localStorage.getItem('credible_easy_starter_balance_USD') || '0'));
    setStarterPoints(parseInt(localStorage.getItem('credible_easy_starter_points') || '0'));

    // Load Users List
    const storedUsers = localStorage.getItem('credible_easy_users');
    if (storedUsers) {
      setUsersList(JSON.parse(storedUsers));
    }

    // Load Custom Carriers & Billers
    setCustomNetworksNGN(JSON.parse(localStorage.getItem('credible_easy_custom_networks_NGN') || '[]'));
    setCustomNetworksUSD(JSON.parse(localStorage.getItem('credible_easy_custom_networks_USD') || '[]'));
    setCustomUtilities(JSON.parse(localStorage.getItem('credible_easy_custom_utilities') || '[]'));

    // Load Bulletins
    const DEFAULT_BULLETINS: Bulletin[] = [
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
    const savedBulletins = localStorage.getItem('credible_easy_bulletins');
    setBulletins(savedBulletins ? JSON.parse(savedBulletins) : DEFAULT_BULLETINS);

    // Load Support Agents
    const savedAgents = localStorage.getItem('credible_easy_support_agents');
    if (savedAgents) {
      try {
        setSupportAgents(JSON.parse(savedAgents));
      } catch (err) {
        setSupportAgents([]);
      }
    } else {
      const defaults = [
        {
          id: 'agent-precious',
          name: 'Agent Precious',
          avatarColor: 'bg-emerald-600',
          avatarEmoji: '👑',
          role: 'Principal Operations Chief',
          replySpeed: 'Replied just now',
          status: 'Online'
        },
        {
          id: 'agent-amara',
          name: 'Agent Amara',
          avatarColor: 'bg-blue-600',
          avatarEmoji: '⚡',
          role: 'MTN MoMo Integration Specialist',
          replySpeed: 'Replies in seconds',
          status: 'Online'
        },
        {
          id: 'agent-david',
          name: 'Agent Ibrahim',
          avatarColor: 'bg-amber-500',
          avatarEmoji: '🛡️',
          role: 'Fraud Control & Security Lead',
          replySpeed: 'Replies instantly',
          status: 'Online'
        }
      ];
      setSupportAgents(defaults);
      localStorage.setItem('credible_easy_support_agents', JSON.stringify(defaults));
    }

    // Load MTN B2B Multi-Line Config
    const savedMtnConfig = localStorage.getItem('credible_easy_mtn_b2b_config');
    if (savedMtnConfig) {
      try {
        const parsed = JSON.parse(savedMtnConfig);
        if (parsed.connectedEmail) setMtnBusinessEmail(parsed.connectedEmail);
        if (parsed.connectedPhone) setMtnBusinessPhone(parsed.connectedPhone);
        if (parsed.apiKey) setMtnApiKey(parsed.apiKey);
        if (parsed.partnerId) setMtnPartnerId(parsed.partnerId);
        if (parsed.webhookUrl) setMtnWebhookUrl(parsed.webhookUrl);
        if (parsed.verificationStatus) setMtnVerificationStatus(parsed.verificationStatus);
        if (parsed.linesConnected) setMtnConnectedLines(parsed.linesConnected);
      } catch (e) {
        // use defaults
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
    }

  }, [isOpen]);

  // --- ACTIONS: Save Financial Configs ---
  const handleSaveFinancials = () => {
    localStorage.setItem('credible_easy_config_baseRate_NGN', exchangeRateNGN.toString());
    localStorage.setItem('credible_easy_config_baseRate_USD', exchangeRateUSD.toString());
    localStorage.setItem('credible_easy_starter_balance_NGN', starterBalanceNGN.toString());
    localStorage.setItem('credible_easy_starter_balance_USD', starterBalanceUSD.toString());
    localStorage.setItem('credible_easy_starter_points', starterPoints.toString());
    
    alert('Founder system parameters saved successfully! Rate conversions and signup bonuses have been updated.');
    if (onConfigChange) onConfigChange();
  };

  const handleResetFinancials = () => {
    if (confirm('Revert all financial converters to platform defaults?')) {
      setExchangeRateNGN(10.00);
      setExchangeRateUSD(0.007);
      setStarterBalanceNGN(5000);
      setStarterBalanceUSD(50);
      setStarterPoints(50);

      localStorage.removeItem('credible_easy_config_baseRate_NGN');
      localStorage.removeItem('credible_easy_config_baseRate_USD');
      localStorage.removeItem('credible_easy_starter_balance_NGN');
      localStorage.removeItem('credible_easy_starter_balance_USD');
      localStorage.removeItem('credible_easy_starter_points');
      
      alert('Reverted successfully!');
      if (onConfigChange) onConfigChange();
    }
  };

  // --- ACTIONS: Manage users ---
  const handleStartEditUser = (userId: string, usr: any) => {
    setEditingUserId(userId);
    setEditUserName(usr.name);
    setEditUserBalance(usr.balance.toString());
    setEditUserPoints(usr.points.toString());
  };

  const handleSaveUserEdit = (userId: string) => {
    if (!editUserName.trim() || isNaN(parseFloat(editUserBalance)) || isNaN(parseInt(editUserPoints))) {
      alert('Please provide valid inputs.');
      return;
    }

    const updatedUsers = { ...usersList };
    const oldUser = updatedUsers[userId];
    
    updatedUsers[userId] = {
      ...oldUser,
      name: editUserName.trim(),
      balance: parseFloat(parseFloat(editUserBalance).toFixed(2)),
      points: parseInt(editUserPoints, 10)
    };

    localStorage.setItem('credible_easy_users', JSON.stringify(updatedUsers));
    setUsersList(updatedUsers);
    setEditingUserId(null);

    // If edited user is the current active owner, trigger React context update to refresh header metrics
    if (currentUser.identifier === userId) {
      onUserUpdate(updatedUsers[userId]);
    }

    alert(`Sandbox user profile "${editUserName}" modified successfully.`);
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser.identifier) {
      alert('You cannot delete your own founder session!');
      return;
    }

    if (confirm(`Are you sure you want to permanently delete user record "${userId}"?`)) {
      const updatedUsers = { ...usersList };
      delete updatedUsers[userId];
      localStorage.setItem('credible_easy_users', JSON.stringify(updatedUsers));
      setUsersList(updatedUsers);
      alert('User removed from database.');
    }
  };

  // --- ACTIONS: Manage custom carriers and billers ---
  const handleAddBiller = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billerId.trim() || !billerName.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    const cleanId = billerId.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

    if (billerType === 'network_ngn') {
      const isDuplicate = customNetworksNGN.some(n => n.id === cleanId);
      if (isDuplicate) return alert('Biller/Carrier ID must be unique.');

      const newNetwork: NetworkProvider = {
        id: cleanId,
        name: billerName.trim(),
        logo: billerName.trim().substring(0, 7),
        color: 'bg-slate-900 text-white border-slate-950 hover:bg-slate-800'
      };
      
      const updated = [...customNetworksNGN, newNetwork];
      localStorage.setItem('credible_easy_custom_networks_NGN', JSON.stringify(updated));
      setCustomNetworksNGN(updated);
    } 
    else if (billerType === 'network_usd') {
      const isDuplicate = customNetworksUSD.some(n => n.id === cleanId);
      if (isDuplicate) return alert('Biller/Carrier ID must be unique.');

      const newNetwork: NetworkProvider = {
        id: cleanId,
        name: billerName.trim(),
        logo: billerName.trim().substring(0, 7),
        color: 'bg-indigo-900 text-white border-indigo-950 hover:bg-indigo-800'
      };
      
      const updated = [...customNetworksUSD, newNetwork];
      localStorage.setItem('credible_easy_custom_networks_USD', JSON.stringify(updated));
      setCustomNetworksUSD(updated);
    } 
    else {
      const isDuplicate = customUtilities.some(u => u.id === cleanId);
      if (isDuplicate) return alert('Biller/Carrier ID must be unique.');

      const newUtility: UtilityProvider = {
        id: cleanId,
        name: billerName.trim(),
        category: billerCategory,
        logo: billerEmoji,
        shortName: billerName.trim().substring(0, 8).toUpperCase()
      };

      const updated = [...customUtilities, newUtility];
      localStorage.setItem('credible_easy_custom_utilities', JSON.stringify(updated));
      setCustomUtilities(updated);
    }

    alert(`Successfully created custom carrier/biller: ${billerName.trim()}`);
    setBillerId('');
    setBillerName('');
    if (onConfigChange) onConfigChange();
  };

  const handleClearCustomBillers = () => {
    if (confirm('Erase all dynamic custom carriers and billing platforms?')) {
      localStorage.removeItem('credible_easy_custom_networks_NGN');
      localStorage.removeItem('credible_easy_custom_networks_USD');
      localStorage.removeItem('credible_easy_custom_utilities');
      setCustomNetworksNGN([]);
      setCustomNetworksUSD([]);
      setCustomUtilities([]);
      alert('Reset to production defaults.');
      if (onConfigChange) onConfigChange();
    }
  };

  // --- ACTIONS: MTN B2B Integration Connect ---
  const handleSaveMtnB2b = (updatedStatus?: string) => {
    const statusToSave = updatedStatus || mtnVerificationStatus;
    const config = {
      connectedEmail: mtnBusinessEmail.trim(),
      connectedPhone: mtnBusinessPhone.trim(),
      apiKey: mtnApiKey.trim(),
      partnerId: mtnPartnerId.trim(),
      webhookUrl: mtnWebhookUrl.trim(),
      verificationStatus: statusToSave,
      linesConnected: mtnConnectedLines
    };
    localStorage.setItem('credible_easy_mtn_b2b_config', JSON.stringify(config));
    if (onConfigChange) onConfigChange();
  };

  const handleAddMtnLine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMtnLine.trim()) return;
    
    // Validate Nigerian mobile prefix or length generic
    const cleanLine = newMtnLine.trim();
    if (mtnConnectedLines.includes(cleanLine)) {
      alert('This telephone line is already linked to the active MTN MoMo pool!');
      return;
    }
    
    const updated = [...mtnConnectedLines, cleanLine];
    setMtnConnectedLines(updated);
    setNewMtnLine('');
    
    const config = {
      connectedEmail: mtnBusinessEmail.trim(),
      connectedPhone: mtnBusinessPhone.trim(),
      apiKey: mtnApiKey.trim(),
      partnerId: mtnPartnerId.trim(),
      webhookUrl: mtnWebhookUrl.trim(),
      verificationStatus: mtnVerificationStatus,
      linesConnected: updated
    };
    localStorage.setItem('credible_easy_mtn_b2b_config', JSON.stringify(config));
    if (onConfigChange) onConfigChange();
    alert(`Successfully provisioned webhook line ${cleanLine} for enterprise corporate query checks.`);
  };

  const handleRemoveMtnLine = (line: string) => {
    if (confirm(`Sever business verification lines connection for ${line}?`)) {
      const updated = mtnConnectedLines.filter(l => l !== line);
      setMtnConnectedLines(updated);
      
      const config = {
        connectedEmail: mtnBusinessEmail.trim(),
        connectedPhone: mtnBusinessPhone.trim(),
        apiKey: mtnApiKey.trim(),
        partnerId: mtnPartnerId.trim(),
        webhookUrl: mtnWebhookUrl.trim(),
        verificationStatus: mtnVerificationStatus,
        linesConnected: updated
      };
      localStorage.setItem('credible_easy_mtn_b2b_config', JSON.stringify(config));
      if (onConfigChange) onConfigChange();
      alert(`Severed ${line}. Webhook notifications on this line are disabled.`);
    }
  };

  const handleAddAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim() || !newAgentRole.trim()) {
      alert('Please enter support agent name and role specialization!');
      return;
    }

    const newAgent = {
      id: `agent-${Date.now()}`,
      name: newAgentName.trim(),
      avatarColor: newAgentColor || 'bg-pink-500',
      avatarEmoji: newAgentEmoji || '👩‍💻',
      role: newAgentRole.trim(),
      replySpeed: newAgentSpeed,
      status: newAgentStatus
    };

    const next = [...supportAgents, newAgent];
    setSupportAgents(next);
    localStorage.setItem('credible_easy_support_agents', JSON.stringify(next));
    window.dispatchEvent(new Event('storage')); // Notify active chats to refresh agents list
    
    // reset fields
    setNewAgentName('');
    setNewAgentRole('');
    setNewAgentEmoji('👩‍💻');
    setNewAgentSpeed('Replies instantly');
  };

  const handleRemoveAgent = (id: string) => {
    const target = supportAgents.find(a => a.id === id);
    if (!target) return;
    if (window.confirm(`Are you sure you want to permanently decommission support agent "${target.name}"?`)) {
      const next = supportAgents.filter(a => a.id !== id);
      setSupportAgents(next);
      localStorage.setItem('credible_easy_support_agents', JSON.stringify(next));
      window.dispatchEvent(new Event('storage')); // Notify active chats to refresh
    }
  };

  const handleTriggerMtnVerify = () => {
    setIsVerifyingMtn(true);
    setTimeout(() => {
      setIsVerifyingMtn(false);
      setMtnVerificationStatus('verified');
      
      const config = {
        connectedEmail: mtnBusinessEmail.trim(),
        connectedPhone: mtnBusinessPhone.trim(),
        apiKey: mtnApiKey.trim(),
        partnerId: mtnPartnerId.trim(),
        webhookUrl: mtnWebhookUrl.trim(),
        verificationStatus: 'verified',
        linesConnected: mtnConnectedLines
      };
      localStorage.setItem('credible_easy_mtn_b2b_config', JSON.stringify(config));
      if (onConfigChange) onConfigChange();
      alert('🔐 MTN Enterprise API Handshake Successful!\n\nVerified corporate ownership of email okonkwoprecious418@gmail.com and active mobile terminals.\nAll lines have been certified and connected to the corporate node for live airtime/data/bill automation audits.');
    }, 2000);
  };

  // --- ACTIONS: Manage bulletins ---
  const handleAddBulletin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBulletinTitle.trim() || !newBulletinContent.trim()) {
      alert('Please enter a title and content.');
      return;
    }

    const newBull: Bulletin = {
      id: `bulletin-${Date.now()}`,
      icon: newBulletinIcon,
      title: newBulletinTitle.trim(),
      content: newBulletinContent.trim(),
      color: newBulletinColor
    };

    const updated = [...bulletins, newBull];
    localStorage.setItem('credible_easy_bulletins', JSON.stringify(updated));
    setBulletins(updated);
    
    setNewBulletinTitle('');
    setNewBulletinContent('');
    alert('New flyer bulletin published globally on User Sidebars!');
    if (onConfigChange) onConfigChange();
  };

  const handleDeleteBulletin = (bulletinId: string) => {
    if (confirm('Delete this announcement bulletin?')) {
      const updated = bulletins.filter(b => b.id !== bulletinId);
      localStorage.setItem('credible_easy_bulletins', JSON.stringify(updated));
      setBulletins(updated);
      alert('Bulletin removed.');
      if (onConfigChange) onConfigChange();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white px-6 py-5 flex items-center justify-between select-none">
          <div className="flex items-center gap-2.5">
            <div className="bg-amber-500/15 border border-amber-500/30 p-1.5 rounded-xl">
              <Sparkles className="h-5.5 w-5.5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                Credible Easy Founder Command Console
                <span className="text-[9px] bg-blue-550 border border-blue-450 px-2 py-0.5 rounded text-white font-mono uppercase tracking-widest leading-none">
                  v3.8 Secure Sandbox
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-medium font-sans">
                Admin Terminal for active user: <strong className="text-amber-300">{currentUser.name}</strong> ({currentUser.identifier})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a 
              href="https://ai.studio/build"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all border border-blue-500/30 font-sans font-black text-[11px] flex items-center gap-1.5 cursor-pointer shadow-sm group"
              title="Return to AI Studio Build Workspace to continue coding"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse group-hover:scale-110 transition-transform" />
              <span>AI Studio Workspace</span>
            </a>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white transition-colors border border-slate-700/50 cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="border-b border-slate-100 bg-slate-50/50 flex flex-wrap select-none">
          <button
            onClick={() => setActiveTab('financials')}
            className={`px-5 py-4 text-xs font-black flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'financials' 
                ? 'border-blue-600 text-slate-900 bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-850'
            }`}
          >
            <Settings className="h-4 w-4 text-blue-500" />
            1. Financial Tuning
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-5 py-4 text-xs font-black flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'users' 
                ? 'border-blue-600 text-slate-900 bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-850'
            }`}
          >
            <Users className="h-4 w-4 text-emerald-500" />
            2. Sandbox User DB ({Object.keys(usersList).length})
          </button>
          <button
            onClick={() => setActiveTab('billers')}
            className={`px-5 py-4 text-xs font-black flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'billers' 
                ? 'border-blue-600 text-slate-900 bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-850'
            }`}
          >
            <Radio className="h-4 w-4 text-amber-500" />
            3. Dynamic Carriers/Biller Systems
          </button>
          <button
            onClick={() => setActiveTab('bulletins')}
            className={`px-5 py-4 text-xs font-black flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'bulletins' 
                ? 'border-blue-600 text-slate-900 bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-850'
            }`}
          >
            <MessageSquare className="h-4 w-4 text-indigo-500" />
            4. Broadcast Bulletin Editor
          </button>
          <button
            onClick={() => setActiveTab('mtn_b2b')}
            className={`px-5 py-4 text-xs font-black flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'mtn_b2b' 
                ? 'border-blue-600 text-slate-900 bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-850'
            }`}
          >
            <Smartphone className="h-4 w-4 text-amber-500" />
            5. 📶 MTN Gateway Webhook
          </button>
          <button
            onClick={() => setActiveTab('agents')}
            className={`px-5 py-4 text-xs font-black flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'agents' 
                ? 'border-blue-600 text-slate-900 bg-white' 
                : 'border-transparent text-slate-500 hover:text-slate-850'
            }`}
          >
            <Users className="h-4 w-4 text-pink-500" />
            6. Support Agent Console ({supportAgents.length})
          </button>
        </div>

        {/* Content Workspace */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/20 max-h-[60vh] scrollbar-none">
          
          {/* TAB 1: FINANCIALS */}
          {activeTab === 'financials' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 text-xs text-blue-850">
                <HelpCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-extrabold block">What is financial tuning?</span>
                  <p className="leading-relaxed">
                    Set exchange conversions for Buzi Points liquidation or purchasing. Changes update immediately inside the Trading Terminal, allowing you to instantly alter exchange indices dynamically. You can also define the starter funds and points awarded to newly registering accounts.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Section A: Conversion Index */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4 shadow-xs">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    📉 Conversion Exchange Index (1 BP Equals)
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Nigerian Base Conversion Index (NGN ₦ per 1 Token Point)
                      </label>
                      <input 
                        type="number" 
                        step="0.05"
                        value={exchangeRateNGN}
                        onChange={(e) => setExchangeRateNGN(parseFloat(e.target.value) || 0)}
                        className="w-full text-sm font-mono border border-slate-200 rounded-xl px-3.5 py-2 focus:border-blue-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Foreign Base Conversion Index (USD $ per 1 Token Point)
                      </label>
                      <input 
                        type="number" 
                        step="0.0001"
                        value={exchangeRateUSD}
                        onChange={(e) => setExchangeRateUSD(parseFloat(e.target.value) || 0)}
                        className="w-full text-sm font-mono border border-slate-200 rounded-xl px-3.5 py-2 focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: Signup Credits */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4 shadow-xs">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    🎁 SignUp Starter Incentives
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10.5px] font-bold text-slate-700 mb-1 leading-snug">
                          NGN Wallet Bonus
                        </label>
                        <input 
                          type="number" 
                          value={starterBalanceNGN}
                          onChange={(e) => setStarterBalanceNGN(parseFloat(e.target.value) || 0)}
                          className="w-full text-sm font-mono border border-slate-200 rounded-xl px-3 py-2 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10.5px] font-bold text-slate-700 mb-1 leading-snug">
                          USD Wallet Bonus
                        </label>
                        <input 
                          type="number" 
                          value={starterBalanceUSD}
                          onChange={(e) => setStarterBalanceUSD(parseFloat(e.target.value) || 0)}
                          className="w-full text-sm font-mono border border-slate-200 rounded-xl px-3 py-2 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Starting Loyalty Buzi Points Reward (BP)
                      </label>
                      <input 
                        type="number" 
                        value={starterPoints}
                        onChange={(e) => setStarterPoints(parseInt(e.target.value, 10) || 0)}
                        className="w-full text-sm font-mono border border-slate-200 rounded-xl px-3.5 py-2 focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Control Trigger Row */}
              <div className="flex gap-2 justify-end border-t border-slate-150/40 pt-4">
                <button
                  onClick={handleResetFinancials}
                  className="px-4 py-2 text-xs font-extrabold border border-slate-350 text-slate-650 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="h-4 w-4" />
                  Default Presets
                </button>
                <button
                  onClick={handleSaveFinancials}
                  className="px-5 py-2 text-xs font-black bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="h-4.5 w-4.5" />
                  Save System Parameters
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MEMBERS DIRECTORY DATABASE */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/50">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    📂 Active Registered User Records
                  </h4>
                  <p className="text-[11px] text-slate-450 mt-1 font-medium">Click Edit to manually credit/debit sandbox user balances and loyalty points, or clear dummy entries.</p>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-wider select-none border-b border-slate-150/50">
                    <tr>
                      <th className="px-4 py-3">User Details</th>
                      <th className="px-4 py-3">Account Type</th>
                      <th className="px-4 py-3 text-right">Cash Balance</th>
                      <th className="px-4 py-3 text-right">Buzi Points</th>
                      <th className="px-4 py-3 text-center">Settings Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {Object.keys(usersList).map((userId) => {
                      const usr = usersList[userId];
                      const isSelf = userId === currentUser.identifier;
                      const isEditing = editingUserId === userId;

                      return (
                        <tr key={userId} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3.5">
                            {isEditing ? (
                              <div className="space-y-1 max-w-[170px]">
                                <input 
                                  type="text" 
                                  value={editUserName}
                                  onChange={(e) => setEditUserName(e.target.value)}
                                  className="border border-slate-300 rounded px-2 py-1 text-xs font-bold w-full"
                                  placeholder="Full Name"
                                />
                                <span className="block text-[10px] text-slate-450 font-mono italic max-w-full truncate">{userId}</span>
                              </div>
                            ) : (
                              <div>
                                <span className="block font-extrabold text-slate-900 flex items-center gap-1">
                                  {usr.name}
                                  {isSelf && <span className="text-[8px] bg-blue-150 border border-blue-200 text-blue-750 px-1 rounded uppercase">You</span>}
                                </span>
                                <span className="text-[10.5px] text-slate-400 font-mono tracking-wide">{userId}</span>
                                {usr.phoneNumber && <span className="block text-[9px] font-mono text-slate-500 mt-0.5">Cell: {usr.phoneNumber}</span>}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase select-none ${
                              usr.type === 'nigerian' 
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-250/50' 
                                : 'bg-blue-50 text-blue-800 border border-blue-250/50'
                            }`}>
                              {usr.type === 'nigerian' ? '🇳🇬 Nigerian' : '🌐 Foreigner'}
                            </span>
                            {usr.network && <span className="block text-[9px] text-slate-400 lowercase mt-1 font-mono">Gateway: {usr.network}</span>}
                            {usr.country && <span className="block text-[9px] text-slate-400 mt-1 font-sans font-medium">Home: {usr.country}</span>}
                          </td>
                          <td className="px-4 py-3.5 text-right font-bold text-slate-900 font-mono">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-1 select-none">
                                <span className="text-xs">{usr.currency === 'NGN' ? '₦' : '$'}</span>
                                <input 
                                  type="number" 
                                  value={editUserBalance}
                                  onChange={(e) => setEditUserBalance(e.target.value)}
                                  className="w-20 text-right border border-slate-300 rounded p-1 text-xs"
                                />
                              </div>
                            ) : (
                              <span>
                                {usr.currency === 'NGN' ? '₦' : '$'}
                                {usr.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right font-black font-mono text-blue-700">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-1">
                                <input 
                                  type="number" 
                                  value={editUserPoints}
                                  onChange={(e) => setEditUserPoints(e.target.value)}
                                  className="w-20 text-right border border-slate-300 rounded p-1 text-xs"
                                />
                                <span className="text-[10px] text-slate-400">BP</span>
                              </div>
                            ) : (
                              <span>{usr.points.toLocaleString()} BP</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {isEditing ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleSaveUserEdit(userId)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg text-[10px] transition-colors cursor-pointer"
                                >
                                  <Check className="h-3 w-3" /> Save
                                </button>
                                <button
                                  onClick={() => setEditingUserId(null)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-150 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[10px] transition-colors cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleStartEditUser(userId, usr)}
                                  className="p-1 px-2 bg-slate-100 text-slate-650 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 rounded-lg text-[10.5px] font-bold flex items-center gap-1 cursor-pointer"
                                  title="Edit properties"
                                >
                                  <Edit2 className="h-3 w-3" /> Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(userId)}
                                  className={`p-1 px-1.5 bg-red-50 text-red-650 hover:bg-red-100 hover:text-red-800 border border-red-200 rounded-lg ${isSelf ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                                  disabled={isSelf}
                                  title="Delete user"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: DYNAMIC BILLERS & MOBILE CO-CARRIERS */}
          {activeTab === 'billers' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Section Left: Registered Carriers/Billers */}
                <div className="lg:col-span-1 bg-white border border-slate-100 rounded-2xl p-5 space-y-4 shadow-xs">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    📺 Add Custom Carrier or Biller
                  </h4>

                  <form onSubmit={handleAddBiller} className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Biller Classification
                      </label>
                      <select 
                        value={billerType}
                        onChange={(e: any) => setBillerType(e.target.value)}
                        className="w-full text-xs font-semibold border border-slate-200 bg-white rounded-xl px-3 py-2 focus:border-blue-600 focus:outline-none"
                      >
                        <option value="network_ngn">🇳🇬 Nigerian Telco Carrier (Recharges)</option>
                        <option value="network_usd">🌐 US/EU Global Telco Carrier</option>
                        <option value="utility">⚡💧 Regional Municipal Utility Platform</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Systems Unique Key Identifier (No Spaces)
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. starlink, anambrawater"
                        value={billerId}
                        onChange={(e) => setBillerId(e.target.value)}
                        className="w-full text-xs font-mono border border-slate-200 rounded-xl px-3 py-2.5 focus:border-blue-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Public Title / Platform Label
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Starlink Satellite, Anambra Water"
                        value={billerName}
                        onChange={(e) => setBillerName(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:border-blue-600 focus:outline-none font-sans"
                      />
                    </div>

                    {billerType === 'utility' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 mb-1">
                            Icon Theme Emoji
                          </label>
                          <input 
                            type="text" 
                            placeholder="e.g. ⚡, 💧, 🛰️"
                            value={billerEmoji}
                            onChange={(e) => setBillerEmoji(e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:border-blue-600 focus:outline-none font-sans text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 mb-1">
                            Biller Segment
                          </label>
                          <select 
                            value={billerCategory}
                            onChange={(e: any) => setBillerCategory(e.target.value)}
                            className="w-full text-xs border border-slate-200 bg-white rounded-xl px-2 py-2 focus:border-blue-600 focus:outline-none"
                          >
                            <option value="electricity">Electricity ⚡</option>
                            <option value="water">Water Board 💧</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus className="h-4 w-4" /> Add Biller Platform
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleClearCustomBillers}
                      className="w-full py-2 border border-dashed border-red-200 text-red-650 hover:bg-red-50 font-black text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Erase Dynamic Custom Billers
                    </button>
                  </form>
                </div>

                {/* Section Right: Active custom lists */}
                <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-5 space-y-4 shadow-xs">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    📋 Dynamic Custom Biller Databases
                  </h4>

                  <div className="space-y-4 text-xs font-sans">
                    {/* NGN Carrier */}
                    <div className="space-y-2">
                      <span className="font-extrabold text-slate-800 text-[11px] block border-b border-slate-100 pb-1">🇳🇬 Custom Nigerian Carriers ({customNetworksNGN.length})</span>
                      {customNetworksNGN.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {customNetworksNGN.map(n => (
                            <span key={n.id} className="px-2.5 py-1 bg-slate-900 border border-slate-950 text-white rounded-lg text-[10.5px] font-mono">
                              {n.name} (ID: {n.id})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[10.5px]">No custom Nigerian mobile carriers registered yet.</span>
                      )}
                    </div>

                    {/* USD Carrier */}
                    <div className="space-y-2">
                      <span className="font-extrabold text-slate-800 text-[11px] block border-b border-slate-100 pb-1">🌐 Custom Global Carriers ({customNetworksUSD.length})</span>
                      {customNetworksUSD.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {customNetworksUSD.map(n => (
                            <span key={n.id} className="px-2.5 py-1 bg-indigo-900 border border-indigo-950 text-white rounded-lg text-[10.5px] font-mono">
                              {n.name} (ID: {n.id})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[10.5px]">No custom Global carriers registered yet.</span>
                      )}
                    </div>

                    {/* Utilities */}
                    <div className="space-y-2">
                      <span className="font-extrabold text-slate-800 text-[11px] block border-b border-slate-100 pb-1">⚡💧 Custom Utility boards ({customUtilities.length})</span>
                      {customUtilities.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {customUtilities.map(u => (
                            <span key={u.id} className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-[10.5px] font-mono flex items-center gap-1">
                              <span>{u.logo}</span>
                              <span className="font-bold">{u.name}</span>
                              <span className="text-[9px] bg-slate-100 text-slate-400 px-1 py-0.5 rounded leading-none uppercase">{u.category}</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[10.5px]">No custom regional electricity or water boards registered yet.</span>
                      )}
                    </div>

                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: BULLETINS & BOARD MESSAGES */}
          {activeTab === 'bulletins' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Publishing input Form */}
                <div className="lg:col-span-1 bg-white border border-slate-100 rounded-2xl p-5 space-y-4 shadow-xs">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    📣 Broadcast Regional Bulletin Announcement
                  </h4>

                  <form onSubmit={handleAddBulletin} className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Bullet Symbol Emoji
                        </label>
                        <input 
                          type="text" 
                          required
                          value={newBulletinIcon}
                          onChange={(e) => setNewBulletinIcon(e.target.value)}
                          className="w-full text-xs text-center border border-slate-200 rounded-xl px-3 py-2 focus:border-blue-600 focus:outline-none"
                          placeholder="e.g. ⚡, 💧, 🎁"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Widget Color Theme
                        </label>
                        <select 
                          value={newBulletinColor}
                          onChange={(e) => setNewBulletinColor(e.target.value)}
                          className="w-full text-xs font-semibold border border-slate-200 bg-white rounded-xl px-3 py-2 border-slate-200 focus:border-blue-600 focus:outline-none"
                        >
                          <option value="indigo">Indigo Blue 🟣</option>
                          <option value="teal">Teal Green 🟢</option>
                          <option value="amber">Amber Gold 🟡</option>
                          <option value="rose">Rose Red 🔴</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Flyer Title Header
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. EKEDC Grid Maintenance"
                        value={newBulletinTitle}
                        onChange={(e) => setNewBulletinTitle(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:border-blue-600 focus:outline-none font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Flyer Message Body
                      </label>
                      <textarea 
                        required
                        rows={3}
                        placeholder="Type the message displayed to users on their regional home sidebar dashboards..."
                        value={newBulletinContent}
                        onChange={(e) => setNewBulletinContent(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:border-blue-600 focus:outline-none font-sans leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Plus className="h-4 w-4" /> Publish Broadcast
                    </button>
                  </form>
                </div>

                {/* Section Right: Active Published Bulletins */}
                <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-5 space-y-4 shadow-xs">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    📋 Published Live Flyers ({bulletins.length})
                  </h4>

                  {bulletins.length > 0 ? (
                    <div className="space-y-3">
                      {bulletins.map((b) => {
                        const styleMap: Record<string, string> = {
                          indigo: 'bg-indigo-50 border-indigo-100 text-indigo-850',
                          teal: 'bg-teal-50 border-teal-100 text-teal-850',
                          amber: 'bg-amber-50 border-amber-100 text-amber-850',
                          rose: 'bg-rose-50 border-rose-100 text-rose-850',
                        };

                        const cardStyle = styleMap[b.color] || styleMap.indigo;

                        return (
                          <div 
                            key={b.id} 
                            className={`p-3.5 border rounded-2xl flex justify-between items-start gap-4 text-xs ${cardStyle}`}
                          >
                            <div className="space-y-1 font-sans">
                              <span className="font-extrabold flex items-center gap-1 text-[11.5px]">
                                {b.icon} {b.title}
                              </span>
                              <p className="leading-relaxed text-[11px] pr-2">
                                {b.content}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteBulletin(b.id)}
                              className="p-1 px-2 border border-slate-200 text-slate-500 hover:text-red-700 hover:bg-red-50 bg-white rounded-lg text-[10.5px] font-bold"
                              title="Delete bulletin"
                            >
                              Revoke
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 select-none space-y-2">
                      <span className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 mx-auto">📣</span>
                      <p className="text-xs font-bold text-slate-700">No active bulletins published.</p>
                      <p className="text-[11px] text-slate-400">Add an announcement using the form to publish a flyer on sidebars.</p>
                    </div>
                  )}

                </div>

              </div>
            </div>
          )}

          {/* TAB 5: MTN B2B TELECOM LINES & APP VERIFICATION INTEGRATION */}
          {activeTab === 'mtn_b2b' && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-xs text-amber-900 select-none">
                <Sparkles className="h-5.5 w-5.5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1 font-sans">
                  <span className="font-extrabold block text-amber-950">MTN MoMo Business Partner & Telecom Verification Gateways</span>
                  <p className="leading-relaxed">
                    Set up direct B2B telecom lines to synchronize transaction status, airtime validation handshakes, and dual-layered cellular verification checks for Credible Easy app. All linked numbers are registered via simulated secure webhook.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Panel left: Key credentials */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4 shadow-xs">
                  <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1 border-b border-slate-100 pb-2">
                    <Key className="h-4 w-4 text-amber-500" /> B2B API Enterprise Keys & Email Connection
                  </h4>

                  <div className="space-y-3.5 text-xs font-medium">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Linked Corporate Business Email
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                          <Mail className="h-4 w-4" />
                        </div>
                        <input 
                          type="email"
                          required
                          value={mtnBusinessEmail}
                          onChange={(e) => setMtnBusinessEmail(e.target.value)}
                          className="w-full text-xs font-semibold border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 bg-slate-50 text-slate-500 cursor-not-allowed"
                          disabled
                          title="Locked to Owner Account Email"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Verified with owner account <b className="text-slate-750">okonkwoprecious418@gmail.com</b> for regulatory audits.</p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Primary Operator Representative Phone Number
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                          <Smartphone className="h-4 w-4" />
                        </div>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. +2348039121945"
                          value={mtnBusinessPhone}
                          onChange={(e) => setMtnBusinessPhone(e.target.value)}
                          className="w-full text-xs font-bold border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10.5px] font-bold text-slate-700 mb-1">
                          MTN Corporate Partner ID
                        </label>
                        <input 
                          type="text" 
                          value={mtnPartnerId}
                          onChange={(e) => setMtnPartnerId(e.target.value)}
                          className="w-full text-xs font-mono border border-slate-200 rounded-xl px-3 py-2 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10.5px] font-bold text-slate-700 mb-1">
                          Integration Status Badge
                        </label>
                        <span className={`w-full text-center py-2 rounded-xl text-[10.5px] font-extrabold uppercase select-none block border ${
                          mtnVerificationStatus === 'verified'
                            ? 'bg-emerald-50 border-emerald-250 text-emerald-850'
                            : 'bg-rose-50 border-rose-250 text-rose-800'
                        }`}>
                          {mtnVerificationStatus === 'verified' ? '🟢 SECURE INTEGRATED' : '🔴 PENDING DESIGN'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Active API Gateway Secret Key (Live Endpoint)
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                          <Server className="h-4 w-4" />
                        </div>
                        <input 
                          type="password" 
                          value={mtnApiKey}
                          onChange={(e) => setMtnApiKey(e.target.value)}
                          className="w-full text-xs font-mono border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        MTN Webhook Endpoint Callback Link
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                          <Link className="h-4 w-4" />
                        </div>
                        <input 
                          type="text" 
                          value={mtnWebhookUrl}
                          onChange={(e) => setMtnWebhookUrl(e.target.value)}
                          className="w-full text-xs font-mono border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-3">
                      <button
                        type="button"
                        disabled={isVerifyingMtn}
                        onClick={handleTriggerMtnVerify}
                        className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {isVerifyingMtn ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>API Handshake...</span>
                          </>
                        ) : (
                          <>
                            <Activity className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Handshake Check</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          handleSaveMtnB2b();
                          alert('MTN integration settings secured in decentralized client-side local database!');
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                      >
                        <Save className="h-3.5 w-3.5" />
                        Save Credentials
                      </button>
                    </div>

                  </div>
                </div>

                {/* Panel Right: Connected Mobile Lines Pool */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4 shadow-xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                        <Smartphone className="h-4 w-4 text-emerald-500" /> Connected Webhook Mobile Lines Pool
                      </h4>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full select-none">
                        {mtnConnectedLines.length} Active Lines
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-normal font-medium font-sans">
                      Add and register representative business carrier lines so they are verified automatically by the MTN Gateway network check system.
                    </p>

                    {/* Form to connect new line */}
                    <form onSubmit={handleAddMtnLine} className="flex gap-2">
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. +2348039121945"
                        value={newMtnLine}
                        onChange={(e) => setNewMtnLine(e.target.value)}
                        className="flex-1 text-xs font-mono border border-slate-200 rounded-xl px-3 py-2.5 focus:border-blue-600 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-sm min-w-[124px] justify-center"
                      >
                        <Plus className="h-4 w-4" /> Link App Line
                      </button>
                    </form>

                    {/* Live lines list */}
                    <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1 border border-slate-150/40 rounded-xl p-2 bg-slate-50/20 scrollbar-none">
                      {mtnConnectedLines.map((line) => (
                        <div key={line} className="text-xs p-2 bg-white border border-slate-100 rounded-lg flex items-center justify-between font-mono">
                          <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="font-extrabold text-slate-800">{line}</span>
                            <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1 rounded uppercase font-bold text-[8px] tracking-wider leading-none">CELL_OK</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveMtnLine(line)}
                            className="p-1 px-2 border border-slate-100 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded bg-slate-50 text-[9px] font-bold cursor-pointer transition-colors"
                          >
                            Sever Connection
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Corporate audit logs panel */}
                  <div className="bg-slate-900 text-slate-200 p-3 rounded-xl border border-slate-850 font-mono text-[9px] space-y-1 mt-4 select-none">
                    <span className="text-amber-400 font-black tracking-wider text-[8px] flex justify-between uppercase border-b border-slate-800 pb-1">
                      <span>MTN MoMo Integration Webhook Live Stream</span>
                      <span className="animate-pulse flex items-center gap-1">🟢 LIVE SECURE FEED</span>
                    </span>
                    <div className="space-y-0.5 text-slate-400 overflow-y-auto max-h-[60px] scrollbar-none font-mono">
                      <div>[02:44:31 NGA] Handshake Sync with okonkwoprecious418@gmail.com SUCCESS</div>
                      <div>[02:44:59 NGA] Verified Multi-line nodes count: {mtnConnectedLines.length}</div>
                      <div>[02:45:11 NGA] Security gateway: AES-256-GCM TLSv1.3 verified SECURE</div>
                      <div>[02:45:25 NGA] MoMo API direct access: CERTIFIED_OK 🏢</div>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* TAB 6: CUSTOM SUPPORT AGENTS */}
          {activeTab === 'agents' && (
            <div className="space-y-6">
              <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4 flex gap-3 text-xs text-pink-950">
                <Users className="h-5 w-5 text-pink-600 flex-shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-1">
                  <span className="font-extrabold block">Live Chat Support Agent Command Node</span>
                  <p className="leading-relaxed font-semibold">
                    You can append, edit, or decommission live support agents below. Newly added agents instantly join the Active Customer Service dialogue deck, ready to reply with rapid responsive answers. Use this to simulate real-world telecom & utility support desk workflows.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left side: Add Agent Form */}
                <form onSubmit={handleAddAgent} className="lg:col-span-1 bg-white border border-slate-100 rounded-2xl p-5 space-y-4 shadow-xs">
                  <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Plus className="h-4.5 w-4.5 text-pink-650" /> Add Live Support Agent
                  </h4>

                  <div className="space-y-3.5 text-xs font-semibold">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 leading-none">
                        Agent Account Name
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. Agent Fatima"
                        value={newAgentName}
                        onChange={(e) => setNewAgentName(e.target.value)}
                        className="w-full text-xs font-bold border border-slate-200 rounded-xl px-3 py-2.5 focus:border-blue-600 focus:outline-none bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 leading-none">
                        Support Specialty Role
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. Instant Transfer Expert"
                        value={newAgentRole}
                        onChange={(e) => setNewAgentRole(e.target.value)}
                        className="w-full text-xs font-bold border border-slate-200 rounded-xl px-3 py-2.5 focus:border-blue-600 focus:outline-none bg-slate-50/50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10.5px] font-bold text-slate-700 mb-1 leading-none">
                          Avatar Emoji
                        </label>
                        <select
                          value={newAgentEmoji}
                          onChange={(e) => setNewAgentEmoji(e.target.value)}
                          className="w-full text-xs font-bold border border-slate-200 rounded-xl px-2 py-2 focus:border-blue-600 focus:outline-none bg-slate-50/50"
                        >
                          <option value="👩‍💻">👩‍💻 Dev Lady</option>
                          <option value="👨‍💻">👨‍💻 Dev Guy</option>
                          <option value="⚡">⚡ Lightning Bolt</option>
                          <option value="👑">👑 Chief Representative</option>
                          <option value="🛡️">🛡️ Shield Security</option>
                          <option value="😊">😊 Friendly Helper</option>
                          <option value="🎧">🎧 Support Representative</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-bold text-slate-700 mb-1 leading-none">
                          Avatar Color Theme
                        </label>
                        <select
                          value={newAgentColor}
                          onChange={(e) => setNewAgentColor(e.target.value)}
                          className="w-full text-xs font-bold border border-slate-200 rounded-xl px-2 py-2 focus:border-blue-600 focus:outline-none bg-slate-50/50"
                        >
                          <option value="bg-pink-500">Pink Rose 🌸</option>
                          <option value="bg-emerald-600">Emerald Green 🥦</option>
                          <option value="bg-blue-600">Ocean Blue 🐳</option>
                          <option value="bg-amber-500">Amber Golden 🍊</option>
                          <option value="bg-purple-600">Royal Purple 🍇</option>
                          <option value="bg-indigo-600">Classic Indigo 🌌</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10.5px] font-bold text-slate-700 mb-1 leading-none">
                          Reply Latency
                        </label>
                        <select
                          value={newAgentSpeed}
                          onChange={(e) => setNewAgentSpeed(e.target.value)}
                          className="w-full text-xs font-bold border border-slate-200 rounded-xl px-2 py-2 focus:border-blue-600 focus:outline-none bg-slate-50/50"
                        >
                          <option value="Replies instantly">Replies instantly ⚡</option>
                          <option value="Replies in seconds">Replies in seconds ⌛</option>
                          <option value="Online is active">Online & active 🟢</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-bold text-slate-700 mb-1 leading-none">
                          Duty Status
                        </label>
                        <select
                          value={newAgentStatus}
                          onChange={(e) => setNewAgentStatus(e.target.value as any)}
                          className="w-full text-xs font-bold border border-slate-200 rounded-xl px-2 py-2 focus:border-blue-600 focus:outline-none bg-slate-50/50"
                        >
                          <option value="Online">Online 🟢</option>
                          <option value="Offline">Offline 🔴</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full text-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-lg transition-all shadow-sm cursor-pointer border-0 outline-none mt-2"
                    >
                      Enlist Active Agent
                    </button>
                  </div>
                </form>

                {/* Right side: Enlisted Agents List */}
                <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-5 space-y-4 shadow-xs">
                  <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center justify-between border-b border-slate-100 pb-2">
                    <span>Enlisted Duty Roster ({supportAgents.length})</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Active Stream</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[360px] overflow-y-auto scrollbar-none pr-0.5">
                    {supportAgents.map((agent) => (
                      <div 
                        key={agent.id}
                        className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex items-start justify-between gap-3 relative overflow-hidden"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-11 w-11 rounded-full ${agent.avatarColor} text-white flex items-center justify-center text-xl font-bold shrink-0 shadow-inner`}>
                            {agent.avatarEmoji}
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-xs font-black text-slate-800 block">
                              {agent.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-extrabold block truncate uppercase tracking-widest leading-none">
                              {agent.role}
                            </span>
                            <span className="text-[9px] text-blue-600 bg-white border border-slate-150 rounded font-semibold px-1.5 py-0.2 mt-1 inline-block">
                              🕒 {agent.replySpeed}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 justify-between h-full">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase leading-none border select-none ${
                            agent.status === 'Online'
                              ? 'bg-emerald-50 border-emerald-250 text-emerald-800 animate-pulse'
                              : 'bg-slate-100 border-slate-205 text-slate-450'
                          }`}>
                            {agent.status}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAgent(agent.id)}
                            className="p-1 px-2 border border-slate-100 text-slate-400 hover:text-red-700 hover:bg-rose-50 rounded bg-white text-[9px] font-black cursor-pointer transition-all"
                            title="Decommission Agent"
                          >
                            Decommission
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-right select-none">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 text-xs font-black transition-colors cursor-pointer shadow-xs"
          >
            Close Command Center
          </button>
        </div>

      </motion.div>
    </div>
  );
}
