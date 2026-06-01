import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, Trash2, CheckCircle, RefreshCw, AlertTriangle, ShieldCheck, 
  Clock, Search, Trash, Inbox, ExternalLink, Inbox as InboxIcon, Check, Copy, ArrowLeft
} from 'lucide-react';
import { emailSystem, EmailMessage } from '../lib/emailService';
import { UserProfile } from '../types';

interface SimulatedEmailInboxProps {
  user: UserProfile;
}

export default function SimulatedEmailInbox({ user }: SimulatedEmailInboxProps) {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  useEffect(() => {
    // Load existing messages
    setEmails(emailSystem.getInbox(user.identifier));

    // Subscribe to new incoming emails while in active tab
    const unsubscribe = emailSystem.subscribe((newEmail) => {
      setEmails(emailSystem.getInbox(user.identifier));
      
      // Trigger temporary floating alert about arriving mail
      setActiveNotification(`📬 Simulated Email Arrived: "${newEmail.subject}"`);
      setTimeout(() => setActiveNotification(null), 5000);
    });

    return () => unsubscribe();
  }, [user.identifier]);

  const handleMarkAllRead = () => {
    emailSystem.markAllAsRead();
    setEmails(emailSystem.getInbox(user.identifier));
  };

  const handleDeleteEmail = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedEmail?.id === id) {
      setSelectedEmail(null);
    }
    emailSystem.deleteEmail(id);
    setEmails(emailSystem.getInbox(user.identifier));
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to permanently empty your simulated mailbox?')) {
      emailSystem.clearInbox();
      setSelectedEmail(null);
      setEmails([]);
    }
  };

  const filteredEmails = emails.filter(email => {
    const query = searchQuery.toLowerCase();
    return (
      email.subject.toLowerCase().includes(query) ||
      email.body.toLowerCase().includes(query) ||
      email.sender.toLowerCase().includes(query)
    );
  });

  // Extract OTP or verification code from subject or body for easy copy-paste
  const extractCode = (email: EmailMessage): string | null => {
    const codeMatch = email.body.match(/\[(\d{4,6})\]/) || email.body.match(/code\s*:?\s*(\d{4,6})/i);
    return codeMatch ? codeMatch[1] : null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. EMAILS DIRECTORY SEGMENT (LEFT SIDE) */}
      <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4 flex flex-col h-[520px]">
        
        <div className="flex justify-between items-center shrink-0">
          <div className="flex items-center gap-1.5">
            <Mail className="h-4.5 w-4.5 text-wine-600 animate-pulse" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              Credible Sandbox Inbox
            </h3>
          </div>
          <span className="text-[9.5px] bg-wine-50 text-wine-800 border border-wine-100 font-bold font-mono px-2 py-0.5 rounded-full">
            {emails.filter(e => !e.read).length} Unread
          </span>
        </div>

        {/* Quick controls row */}
        <div className="flex gap-2 shrink-0">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search className="h-3.5 w-3.5" />
            </span>
            <input 
              type="text"
              placeholder="Search incoming sandbox mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 block w-full bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold focus:bg-white focus:outline-none"
            />
          </div>
          <button 
            type="button"
            onClick={handleMarkAllRead}
            disabled={emails.length === 0}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl text-[10px] font-black transition-all cursor-pointer select-none truncate"
          >
            Mark all read
          </button>
        </div>

        {/* Floating Mail Alert inside tab */}
        <AnimatePresence>
          {activeNotification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-2.5 bg-wine-50 border border-wine-200 rounded-xl text-[10px] text-wine-800 font-bold shrink-0 flex items-center gap-1.5"
            >
              <InboxIcon className="h-3.5 w-3.5 text-wine-600 animate-bounce" />
              <span className="truncate flex-1">{activeNotification}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emails list viewport */}
        <div className="flex-1 overflow-y-auto space-y-2.5 scrollbar-none pr-0.5">
          {filteredEmails.length > 0 ? (
            filteredEmails.map((email) => {
              const isSelected = selectedEmail?.id === email.id;
              const hasCode = extractCode(email);
              return (
                <div
                  key={email.id}
                  onClick={() => {
                    email.read = true;
                    setSelectedEmail(email);
                  }}
                  className={`p-3 rounded-2xl border transition-all text-left cursor-pointer relative flex flex-col gap-1.5 ${
                    isSelected 
                      ? 'bg-wine-50/60 border-wine-200 ring-1 ring-wine-100' 
                      : 'bg-slate-50/30 hover:bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black uppercase text-slate-500 truncate max-w-[130px] block">
                      {email.sender}
                    </span>
                    <span className="text-[8.5px] text-slate-400 font-mono font-bold shrink-0">
                      {email.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  <div className="space-y-0.5 leading-tight">
                    <span className={`text-[11px] block truncate font-black ${
                      !email.read ? 'text-slate-900 border-l-2 border-wine-500 pl-1.5' : 'text-slate-650'
                    }`}>
                      {email.subject}
                    </span>
                    <p className="text-[10px] text-slate-400 truncate leading-relaxed">
                      {email.body}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-1.5 border-t border-slate-200/50 mt-1">
                    <span className="text-[8px] text-slate-400 block font-mono font-bold">
                      {email.id}
                    </span>
                    
                    <div className="flex gap-1 items-center">
                      {hasCode && (
                        <span className="text-[8px] bg-amber-500/10 text-amber-900 border border-amber-500/20 px-1.5 py-0.5 rounded font-black uppercase tracking-wider font-mono">
                          OTP: {hasCode}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteEmail(email.id, e)}
                        className="p-1 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded transition-colors"
                        title="Delete simulated mail"
                      >
                        <Trash className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-slate-400 flex flex-col items-center justify-center gap-2">
              <InboxIcon className="h-10 w-10 text-slate-200" />
              <div>
                <p className="text-xs font-bold font-mono">Mailbox completely empty</p>
                <p className="text-[10px] text-slate-400 pt-0.5 max-w-[160px] mx-auto">
                  Verification codes and OTP updates will generate mock emails immediately visible here.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Clear all layout footer */}
        {emails.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="w-full text-center text-rose-650 hover:text-rose-700 bg-rose-50/20 hover:bg-rose-50/50 border border-rose-100 rounded-xl py-2 text-[10px] font-black transition-all cursor-pointer shrink-0"
          >
            Clear mailbox directory
          </button>
        )}
      </div>

      {/* 2. MAIL ENVELOPE CONTENT RENDERER (RIGHT SIDE) */}
      <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[520px] overflow-hidden">
        {selectedEmail ? (
          <div className="flex-1 flex flex-col">
            
            {/* Header info */}
            <div className="p-5 border-b border-slate-150 bg-slate-50/70 shrink-0 space-y-3">
              <div className="flex justify-between items-start gap-2">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    Simulated SMTP Transmission Core
                  </h4>
                  <h2 className="text-sm font-black text-slate-900 tracking-tight leading-snug">
                    {selectedEmail.subject}
                  </h2>
                </div>
                <span className="text-[9.5px] bg-indigo-50 border border-indigo-100 text-indigo-800 font-mono font-bold px-2.5 py-0.5 rounded">
                  {selectedEmail.id}
                </span>
              </div>

              {/* Sender/Receiver details */}
              <div className="grid grid-cols-2 gap-4 text-[10.5px] border-t border-slate-200/50 pt-3 text-slate-600 font-medium font-mono">
                <div>
                  <span className="text-slate-400 font-semibold block text-[9px] uppercase tracking-wider">From:</span>
                  <span className="font-bold text-slate-800">{selectedEmail.sender}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[9px] uppercase tracking-wider">To Email:</span>
                  <span className="font-bold text-slate-850 truncate block">{selectedEmail.to}</span>
                </div>
              </div>
            </div>

            {/* Email Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 leading-relaxed text-xs text-slate-755 font-medium bg-slate-50/10">
              
              <div className="bg-white border border-slate-150/70 p-5 rounded-3xl space-y-4 shadow-sm max-w-lg mx-auto">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-sans">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <span className="text-xs font-black uppercase text-emerald-800 tracking-wider">Credible Easy Verified Security</span>
                </div>
                
                {/* Simulated message text block */}
                <p className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed pt-1 select-all font-semibold">
                  {selectedEmail.body}
                </p>

                {/* Secure OTP Copier box if code exists */}
                {selectedEmail.body.match(/\[(\d{4,6})\]/) && (
                  <div className="p-4 bg-amber-500/5 border border-dashed border-amber-500/20 rounded-2xl flex items-center justify-between gap-3 font-sans mt-3">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Security Verification Code</span>
                      <span className="text-base font-black font-mono tracking-widest text-slate-800 block">
                        {extractCode(selectedEmail)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const code = extractCode(selectedEmail);
                        if (code) {
                          navigator.clipboard.writeText(code);
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2000);
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer selection:bg-transparent"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy OTP</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-400 font-semibold font-mono">
                  <span>SYSTEM: SMTP_SECURE_GATE</span>
                  <span>TIME: {selectedEmail.timestamp.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 gap-3">
            <Mail className="h-12 w-12 text-slate-150 animate-pulse" />
            <div>
              <p className="text-xs font-black uppercase text-slate-500">No Email Selected</p>
              <p className="text-[10px] text-slate-400 max-w-[200px] mt-0.5 font-medium leading-relaxed">
                Click on any incoming email in the directory to inspect headers, copies, and secure OTP verification codes.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
