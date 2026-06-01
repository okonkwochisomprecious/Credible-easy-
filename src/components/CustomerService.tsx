import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Users, MessageSquare, Check, Sparkles, AlertCircle, PhoneCall, 
  HelpCircle, ShieldCheck, RefreshCw, Star, Trash2, Heart
} from 'lucide-react';
import { UserProfile } from '../types';

interface CustomerServiceProps {
  user: UserProfile;
}

export interface Agent {
  id: string;
  name: string;
  avatarColor: string;
  avatarEmoji: string;
  role: string;
  replySpeed: string; // e.g., "Replied just now", "Replies in seconds"
  status: 'Online' | 'Offline';
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  senderName: string;
  text: string;
  timestamp: Date;
  agentId?: string;
}

export default function CustomerService({ user }: CustomerServiceProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingAgent, setTypingAgent] = useState<Agent | null>(null);
  
  // Rating and feedback state
  const [rating, setRating] = useState<number>(0);
  const [rated, setRated] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load / Seed Agents list
  useEffect(() => {
    const loadAgents = () => {
      const stored = localStorage.getItem('credible_easy_support_agents');
      if (stored) {
        try {
          setAgents(JSON.parse(stored));
        } catch (e) {
          setAgents(getDefaultAgents());
        }
      } else {
        const defaults = getDefaultAgents();
        setAgents(defaults);
        localStorage.setItem('credible_easy_support_agents', JSON.stringify(defaults));
      }
    };

    loadAgents();

    // Listen for storage events (if modified in Founder Console)
    window.addEventListener('storage', loadAgents);
    return () => window.removeEventListener('storage', loadAgents);
  }, []);

  const getDefaultAgents = (): Agent[] => [
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
      avatarColor: 'bg-wine-600',
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

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Load chat history or seed initial welcoming message
  useEffect(() => {
    if (agents.length > 0) {
      const initialAgent = selectedAgent || agents[0];
      if (!selectedAgent) {
        setSelectedAgent(initialAgent);
      }

      const storedHistory = localStorage.getItem(`credible_chat_${initialAgent.id}`);
      if (storedHistory) {
        try {
          setMessages(JSON.parse(storedHistory).map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          })));
        } catch (e) {
          seedWelcomeMessage(initialAgent);
        }
      } else {
        seedWelcomeMessage(initialAgent);
      }
    }
  }, [agents, selectedAgent]);

  const seedWelcomeMessage = (agent: Agent) => {
    const welcomeMsgs: ChatMessage[] = [
      {
        id: `msg-welcome-${agent.id}`,
        sender: 'agent',
        senderName: agent.name,
        text: `🇳🇬 Hello ${user.name}! I am ${agent.name}, your dedicated ${agent.role}. How can I assist you with your Credible Easy transactions, billing transfers, or Buzi points liquidations today? I am online and replying quick! ⚡`,
        timestamp: new Date(),
        agentId: agent.id
      }
    ];
    setMessages(welcomeMsgs);
    localStorage.setItem(`credible_chat_${agent.id}`, JSON.stringify(welcomeMsgs));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedAgent || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-msg-${Date.now()}`,
      sender: 'user',
      senderName: user.name,
      text: input,
      timestamp: new Date(),
      agentId: selectedAgent.id
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    localStorage.setItem(`credible_chat_${selectedAgent.id}`, JSON.stringify(updatedMessages));
    setRating(0); // Reset rating for new responses
    setRated(false);
    
    const userText = input.trim();
    setInput('');

    // Trigger instant rapid agent responder
    setIsTyping(true);
    setTypingAgent(selectedAgent);

    // Play message audio click
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(650, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (err) {}

    // Reply delay is highly responsive ("reply quick") - about 800 - 1600ms
    const replyDelay = 800 + Math.random() * 800;

    setTimeout(() => {
      setIsTyping(false);
      setTypingAgent(null);

      // Simple keyword matching for clever realistic support
      let replyText = '';
      const textLower = userText.toLowerCase();

      if (textLower.includes('hello') || textLower.includes('hi') || textLower.includes('hey')) {
        replyText = `Welcome back, ${user.name}! It's a wonderful day at Credible Easy. How can I help you accelerate your airtime topups, withdraw funding, or customize security limits? Let me know! 🚀`;
      } else if (textLower.includes('limit') || textLower.includes('daily limit') || textLower.includes('2fa') || textLower.includes('otp')) {
        replyText = `🛡️ Security Alert: Your Max Daily Spending Limit can be customized securely inside the [Security Vault] tab! If increasing limits, we will dispatch a simulated SMS OTP directly to ${user.phoneNumber || '+2348039121945'} or your Sandbox Email Inbox which you can retrieve in real-time!`;
      } else if (textLower.includes('buzi') || textLower.includes('point') || textLower.includes('bp') || textLower.includes('trade') || textLower.includes('liquidate')) {
        replyText = `📈 Buzi Points Guide: You score points on bills & recharge transactions. Liquidate them instantly into wallet Cash within the [BP Trading Center] tab! 1 BP translates directly to ${user.currency === 'NGN' ? '₦10.00' : '$0.007'}. Trading transactions clear in seconds!`;
      } else if (textLower.includes('fund') || textLower.includes('deposit') || textLower.includes('add') || textLower.includes('balance')) {
        replyText = `💰 Funding is fully instant! Tap the "Fund Wallet" quick action from the top header of the Dashboard, enter your target amount, and approve the simulated payment securely. Your balance updates immediately!`;
      } else if (textLower.includes('mtn') || textLower.includes('b2b') || textLower.includes('momo') || textLower.includes('telecom')) {
        replyText = `📶 MTN MoMo Core Integration is active! You can review active telecomm fiber statuses and linked business phone lines directly from the sidebar or founder config console. Recharge tasks are instant!`;
      } else if (textLower.includes('invite') || textLower.includes('referral') || textLower.includes('code') || textLower.includes('precious50')) {
        replyText = `👥 Referral Promo: Invite colleagues using standard or custom invite codes. Any user who leverages the code 'PRECIOUS50' during onboarding will receive ₦1,500 cash! Check current tracker milestones in the [Invite & Cash Bonus] tab.`;
      } else {
        replyText = `Thank you for your message, ${user.name}! This is ${selectedAgent.name} from Credible Support. I've noted your request regarding "${userText.length > 35 ? userText.substring(0, 35) + '...' : userText}". What else can we help you solve right now? We are fully on standby to assist 24/7.`;
      }

      const agentMsg: ChatMessage = {
        id: `agent-msg-${Date.now()}`,
        sender: 'agent',
        senderName: selectedAgent.name,
        text: replyText,
        timestamp: new Date(),
        agentId: selectedAgent.id
      };

      const finalMessages = [...updatedMessages, agentMsg];
      setMessages(finalMessages);
      localStorage.setItem(`credible_chat_${selectedAgent.id}`, JSON.stringify(finalMessages));

      // Play message received tick
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      } catch (err) {}

    }, replyDelay);
  };

  const clearChatHistory = () => {
    if (!selectedAgent) return;
    if (window.confirm(`Are you sure you want to clear your conversation string with ${selectedAgent.name}?`)) {
      setMessages([]);
      localStorage.removeItem(`credible_chat_${selectedAgent.id}`);
      seedWelcomeMessage(selectedAgent);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. INTERACTIVE AGENTS LISTING */}
      <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5ClassName">
            <Users className="h-4.5 w-4.5 text-wine-600" />
            Support Agents Team
          </h3>
          <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-100 px-2.5 py-0.5 rounded-full font-black uppercase flex items-center gap-1 animate-pulse">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
            Active Online
          </span>
        </div>

        <p className="text-[11px] text-slate-450 leading-relaxed">
          Select an agent specialized in different layers of the Credible Easy architecture. They reply <b>instantly</b> to keep your sandbox trials efficient.
        </p>

        <div className="space-y-3 pt-1">
          {agents.map((agent) => {
            const isSelected = selectedAgent?.id === agent.id;
            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => setSelectedAgent(agent)}
                className={`w-full flex items-start gap-3 p-3.5 rounded-2xl transition-all text-left border relative cursor-pointer ${
                  isSelected 
                    ? 'bg-wine-50/60 border-wine-200 ring-1 ring-wine-100' 
                    : 'bg-slate-50/30 hover:bg-slate-50 border-slate-100'
                }`}
              >
                {/* Agent Emoji Avatar with status indicator bubble */}
                <div className="relative shrink-0">
                  <div className={`h-11 w-11 rounded-full ${agent.avatarColor} text-white flex items-center justify-center text-xl shadow-inner font-black`}>
                    {agent.avatarEmoji}
                  </div>
                  <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                    agent.status === 'Online' ? 'bg-emerald-500' : 'bg-slate-300'
                  }`} />
                </div>

                <div className="space-y-1 overflow-hidden">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-black text-slate-800 truncate block">{agent.name}</span>
                    <span className="text-[8.5px] font-mono text-slate-400 shrink-0 font-medium">{agent.replySpeed}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-extrabold block truncate uppercase tracking-wide">{agent.role}</span>
                  <span className="text-[9px] bg-white/80 border border-slate-150 px-2 py-0.5 rounded text-wine-700 font-bold tracking-tight inline-block">
                    ⚡ Instant responder
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Info box for users on adding custom agents */}
        <div className="bg-amber-50/40 border border-amber-100 rounded-2xl p-4 space-y-2 text-[10.5px] text-slate-500">
          <div className="font-extrabold text-amber-900 uppercase tracking-widest flex items-center gap-1.5 text-[10px]">
            <Sparkles className="h-4 w-4 text-amber-600 animate-bounce" /> Add Agents Quick!
          </div>
          <p className="leading-normal">
            Want to test adding more customer support staff? Go to the <b>Founder Console Panel</b> (at sidebar or top row) and click the <b>"Support Agent Console"</b> tab to expand, edit, or customize infinite real-time agents!
          </p>
        </div>
      </div>

      {/* 2. CHAT STREAM GRAPHICS */}
      <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[520px] overflow-hidden">
        
        {/* Chat Stream Header */}
        {selectedAgent && (
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full ${selectedAgent.avatarColor} text-white flex items-center justify-center text-lg font-black shrink-0`}>
                {selectedAgent.avatarEmoji}
              </div>
              <div>
                <span className="text-xs font-black text-slate-850 block leading-tight flex items-center gap-1">
                  {selectedAgent.name} <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                </span>
                <span className="text-[9.5px] text-slate-400 font-extrabold block uppercase tracking-wide">
                  {selectedAgent.role}
                </span>
              </div>
            </div>

            <button 
              type="button" 
              onClick={clearChatHistory}
              title="Clear dialogue history"
              className="text-[10.5px] text-slate-450 hover:text-red-650 flex items-center gap-1 px-3 py-1.5 hover:bg-red-50 rounded-xl transition-all border border-slate-100 bg-white cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear chat</span>
            </button>
          </div>
        )}

        {/* Messages body stream viewport */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/10 scrollbar-none">
          <div className="text-center py-2">
            <span className="text-[9px] bg-slate-100 text-slate-450 font-black tracking-widest uppercase px-3 py-1 rounded-full">
              💬 Local SECURE SUPPORT ENCRYPTED
            </span>
          </div>

          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-end gap-2`}
                >
                  {/* Left Avatar for Agent bubble */}
                  {!isUser && selectedAgent && (
                    <div className={`h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-xs ${selectedAgent.avatarColor} text-white font-extrabold`}>
                      {selectedAgent.avatarEmoji}
                    </div>
                  )}

                  <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs font-semibold leading-relaxed ${
                    isUser
                      ? 'bg-wine-600 text-white rounded-br-none shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-150 text-slate-800 rounded-bl-none border border-slate-200'
                  }`}>
                    {/* Message Sender Title */}
                    <span className="block text-[8px] opacity-60 font-black uppercase tracking-wider mb-0.5">
                      {isUser ? 'You' : msg.senderName}
                    </span>
                    <span className="whitespace-pre-wrap">{msg.text}</span>
                    <span className="block text-[8px] opacity-40 font-mono text-right mt-1.5 font-bold">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing simulation bubble */}
          {isTyping && typingAgent && (
            <div className="flex justify-start items-end gap-2">
              <div className={`h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-xs ${typingAgent.avatarColor} text-white font-extrabold`}>
                {typingAgent.avatarEmoji}
              </div>
              <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-bl-none p-3 text-xs text-slate-500 flex items-center gap-2">
                <span className="font-bold text-[9px] select-none text-slate-400 capitalize">{typingAgent.name} is typing</span>
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 bg-wine-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 bg-wine-500 rounded-full animate-bounce" style={{ animationDelay: '150ms', transform: 'none' }} />
                  <span className="h-1.5 w-1.5 bg-wine-500 rounded-full animate-bounce" style={{ animationDelay: '300ms', transform: 'none' }} />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Rate section at bottom if we have messages and user just got replied */}
        {messages.length > 2 && !isTyping && (
          <div className="bg-slate-55 border-t border-slate-100 p-2 text-center text-xs text-slate-500 flex items-center justify-center gap-2 shrink-0">
            {!rated ? (
              <>
                <span className="text-[10px] uppercase font-black text-slate-400">Rate this agent reply:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        setRating(star);
                        setRated(true);
                        // Add nice rate log
                        try {
                          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                          const osc = audioCtx.createOscillator();
                          const gain = audioCtx.createGain();
                          osc.connect(gain);
                          gain.connect(audioCtx.destination);
                          osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
                          gain.gain.setValueAtTime(0.012, audioCtx.currentTime);
                          osc.start();
                          osc.stop(audioCtx.currentTime + 0.08);
                        } catch (e) {}
                      }}
                      className="text-slate-350 hover:text-amber-500 transition-colors p-0.5 cursor-pointer text-xs"
                    >
                      ★
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse">
                <Check className="h-3 w-3" /> Thank you for rating {selectedAgent?.name} {rating}/5 stars! You score 1 BP loyalty reward point.
              </span>
            )}
          </div>
        )}

        {/* Chat input footer */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white flex gap-2 shrink-0">
          <input
            type="text"
            required
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            placeholder={`Enter your support question for ${selectedAgent?.name || 'Agent'}...`}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 px-3.5 text-xs font-bold focus:border-wine-500 focus:outline-none bg-slate-50/50 focus:bg-white"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="bg-wine-600 hover:bg-wine-700 text-white rounded-xl py-2 px-4 text-xs font-black transition-all flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer"
          >
            <span>Send</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
}
