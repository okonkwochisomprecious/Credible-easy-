// Simulated SMS service for Credible Easy 2FA validations

export interface SMSNotification {
  id: string;
  phone: string;
  code: string;
  message: string;
  timestamp: Date;
}

type SMSCallback = (sms: SMSNotification) => void;

class SMSEventSystem {
  private listeners: Set<SMSCallback> = new Set();
  private sentLogs: SMSNotification[] = [];

  subscribe(callback: SMSCallback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  broadcast(sms: SMSNotification) {
    this.sentLogs.push(sms);
    // Keep only last 20 logs in memory or localStorage
    if (this.sentLogs.length > 20) {
      this.sentLogs.shift();
    }
    this.listeners.forEach((listener) => {
      try {
        listener(sms);
      } catch (err) {
        console.error('Error delivering SMS visual hook:', err);
      }
    });
  }

  getLogs() {
    return this.sentLogs;
  }
}

export const smsBroadcastSystem = new SMSEventSystem();

/**
 * Simulates sending an SMS verification code for critical operations
 * @param phone Nigerian or international destination mobile line
 * @param action Reason for code dispatch (e.g., "Spend Limit Increase")
 * @returns Promise resolving to the generated 6-digit code string
 */
export async function sendMockSMSCode(phone: string, action: string): Promise<string> {
  return new Promise((resolve) => {
    // Simulate real network operator latency
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const message = `🛡️ Credible Easy Security Alert: Your 2FA OTP code for ${action} is [${code}]. Never share this code with anyone.`;
      
      const notification: SMSNotification = {
        id: `CE-SMS-${Math.floor(10000 + Math.random() * 90000)}`,
        phone,
        code,
        message,
        timestamp: new Date()
      };

      // Broadcast to any active UI displays to render an incoming SMS toast
      smsBroadcastSystem.broadcast(notification);
      
      resolve(code);
    }, 1200);
  });
}
