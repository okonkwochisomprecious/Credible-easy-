// Simulated Email Inbox service for Credible Easy 2FA and registration systems

export interface EmailMessage {
  id: string;
  to: string;
  subject: string;
  body: string;
  htmlBody?: string;
  sender: string;
  timestamp: Date;
  read: boolean;
}

type EmailCallback = (email: EmailMessage) => void;

class EmailEventSystem {
  private listeners: Set<EmailCallback> = new Set();
  private inbox: EmailMessage[] = [];

  constructor() {
    // Try to load historical inbox from localStorage if available
    const stored = localStorage.getItem('credible_easy_simulated_emails');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.inbox = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      } catch (err) {
        this.inbox = [];
      }
    }

    // Seed empty inbox if fresh
    if (this.inbox.length === 0) {
      this.inbox = [
        {
          id: 'CE-EMAIL-1001',
          to: 'user@example.com',
          sender: 'welcome@credibleeasy.com',
          subject: '👋 Welcome to Credible Easy Sandbox System',
          body: `Welcome to Credible Easy! We are thrilled to have you here. This is a simulated safe Sandbox environment designed to test high-intensity banking recharges, Buzi Points, and military-grade 2FA authorization vaults.\n\nYour account is fully secured. Never share your password or security transaction PINs with anybody outside of support!`,
          timestamp: new Date(Date.now() - 36500 * 1000), // ~10 hours ago
          read: false
        }
      ];
      this.saveLocal();
    }
  }

  private saveLocal() {
    localStorage.setItem('credible_easy_simulated_emails', JSON.stringify(this.inbox));
  }

  subscribe(callback: EmailCallback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  broadcast(email: EmailMessage) {
    this.inbox.unshift(email);
    // Keep only last 50 emails in inbox
    if (this.inbox.length > 50) {
      this.inbox.pop();
    }
    this.saveLocal();
    
    this.listeners.forEach((listener) => {
      try {
        listener(email);
      } catch (err) {
        console.error('Error delivering simulated email:', err);
      }
    });
  }

  getInbox(userEmail?: string): EmailMessage[] {
    if (!userEmail) return this.inbox;
    // Normalize and filter by email if desired, or return entire mock workspace inbox for easy access
    return this.inbox;
  }

  markAllAsRead() {
    this.inbox.forEach(email => email.read = true);
    this.saveLocal();
  }

  deleteEmail(id: string) {
    this.inbox = this.inbox.filter(email => email.id !== id);
    this.saveLocal();
  }

  clearInbox() {
    this.inbox = [];
    this.saveLocal();
  }
}

export const emailSystem = new EmailEventSystem();

/**
 * Simulates dispatching an email to the user with HTML verification templates
 */
export async function sendSimulatedEmail(toEmail: string, subject: string, templateBody: string): Promise<string> {
  const codeMatch = templateBody.match(/\[(\d{4,6})\]/) || templateBody.match(/code\s*:?\s*(\d{4,6})/i);
  const otpCode = codeMatch ? codeMatch[1] : '';

  const email: EmailMessage = {
    id: `CE-EML-${Math.floor(10000 + Math.random() * 90000)}`,
    to: toEmail,
    sender: 'security@credibleeasy.com',
    subject: subject,
    body: templateBody,
    timestamp: new Date(),
    read: false
  };

  // Broadcast to live handlers
  emailSystem.broadcast(email);

  return otpCode;
}
