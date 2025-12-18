// Webhook Sender - posila data do Beta projektu
// Proste kdyz se neco stane v Alphe (nova zprava, ban, stream), poslem to do Bety

import crypto from 'crypto';

// Jak vypada webhook payload - co poslem do Bety
interface WebhookPayload {
  event: string;       // typ eventu (chat.message, moderation.ban, atd)
  timestamp: number;   // kdy se to stalo
  source: string;      // odkud to prislo (alpha)
  signature: string;   // podpis pro bezpecnost
  data: any;           // samotna data
}

// Konfigurace webhoooku - kam posilat, jaky secret, kolikrat zkusit
interface WebhookConfig {
  url: string;
  secret: string;
  retryCount: number;
}

/**
 * Hlavni trida pro posilani webhooku
 * 
 * Co to umi:
 * - HMAC-SHA256 podpis (aby Beta vedela ze to je od nas a ne od hackera)
 * - Retry logika - kdyz se to nepovede, zkusi to znova
 * - Exponential backoff - ceka 1s, 2s, 4s mezi pokusy
 */
export class WebhookSender {
  private config: WebhookConfig;
  
  constructor(config?: Partial<WebhookConfig>) {
    this.config = {
      url: config?.url || process.env.BETA_WEBHOOK_URL || 'http://localhost:3001/api/webhook',
      secret: config?.secret || process.env.WEBHOOK_SECRET || 'development_secret_key_change_in_production',
      retryCount: config?.retryCount || 3
    };
    
    console.log('[WebhookSender] Inicializovan', {
      url: this.config.url,
      retryCount: this.config.retryCount
    });
  }
  
  /**
   * Vytvori HMAC-SHA256 podpis pro payload
   * Tohle je mega dulezity pro bezpecnost - Beta si overi ze to je od nas
   */
  private generateSignature(payload: object): string {
    const payloadString = JSON.stringify(payload);
    const hmac = crypto.createHmac('sha256', this.config.secret);
    hmac.update(payloadString);
    return `sha256=${hmac.digest('hex')}`;
  }
  
  /**
   * Posle webhook event do Beta projektu
   * Vraci true kdyz se to povedlo, false kdyz ne
   */
  async send(event: string, data: any): Promise<boolean> {
    // Sestavime payload
    const payload: WebhookPayload = {
      event,
      timestamp: Date.now(),
      source: 'localhost:3000',
      signature: '',
      data
    };
    
    // Vygenerujeme podpis (bez signature fieldu, jinak by se podepsal sam sebe lol)
    const { signature, ...payloadForSignature } = payload;
    payload.signature = this.generateSignature(payloadForSignature);
    
    console.log(`[Webhook] Posilam ${event}`, {
      event,
      dataSize: JSON.stringify(data).length,
      timestamp: payload.timestamp
    });
    
    // Zkusime to poslat - max 3 pokusy
    for (let attempt = 0; attempt < this.config.retryCount; attempt++) {
      try {
        const response = await fetch(this.config.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Secret': this.config.secret,
            'X-Webhook-Source': 'localhost:3000',
            'User-Agent': 'CrossChat-Alpha-Webhook/1.0'
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(5000) // max 5 sekund cekame
        });
        
        // Povedlo se!
        if (response.ok) {
          const result = await response.json();
          console.log(`✅ [Webhook] ${event} uspesne odeslan`, {
            attempt: attempt + 1,
            status: response.status,
            result
          });
          return true;
        }
        
        // Nepovedlo se, ale aspon mame odpoved
        console.error(`❌ [Webhook] ${event} selhal (pokus ${attempt + 1})`, {
          status: response.status,
          statusText: response.statusText
        });
        
      } catch (error: any) {
        // Totalni fail - treba timeout nebo network error
        console.error(`❌ [Webhook] ${event} chyba (pokus ${attempt + 1})`, {
          error: error.message,
          code: error.code
        });
      }
      
      // Pockame pred dalsim pokusem - exponential backoff
      // 1. pokus: cekame 1s, 2. pokus: cekame 2s, 3. pokus: cekame 4s
      if (attempt < this.config.retryCount - 1) {
        const delayMs = Math.pow(2, attempt) * 1000;
        console.log(`⏳ [Webhook] Zkousim znova za ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    // Ani po 3 pokusech se to nepovedlo
    console.error(`❌ [Webhook] ${event} selhal po ${this.config.retryCount} pokusech`);
    return false;
  }
  
  /**
   * Posle novou chatovou zpravu do Bety
   */
  async sendChatMessage(message: {
    id: string;
    user: string;
    text: string;
    platform: string;
    streamerId: string;
    timestamp: number;
    moderationScore: number;
    isVip?: boolean;
    isSub?: boolean;
    isMod?: boolean;
    color?: string;
  }): Promise<boolean> {
    return this.send('chat.message', message);
  }
  
  /**
   * Posle info o banu do Bety
   */
  async sendModerationBan(ban: {
    user: string;
    streamerId: string;
    reason: string;
    moderationScore: number;
    permanent: boolean;
    duration?: number;
    expiresAt?: number;
    triggeredBy: 'ai_moderation' | 'manual' | 'spam_detection';
    details?: any;
  }): Promise<boolean> {
    return this.send('moderation.ban', ban);
  }
  
  /**
   * Posle info ze zacal stream
   */
  async sendStreamStart(stream: {
    streamerId: string;
    username: string;
    startedAt: number;
    platforms: string[];
  }): Promise<boolean> {
    return this.send('stream.start', stream);
  }
  
  /**
   * Posle info ze skoncil stream
   */
  async sendStreamEnd(stream: {
    streamerId: string;
    username: string;
    startedAt: number;
    endedAt: number;
    duration: number;
    messageCount: number;
    uniqueUsers: number;
    bannedUsers: number;
    averageToxicity: number;
    platformBreakdown: Record<string, number>;
  }): Promise<boolean> {
    return this.send('stream.end', stream);
  }
}

// Singleton - jenom jedna instance v cele aplikaci
// Proc? Protoze nechceme mit 10 ruznych webhook senderu
let webhookSenderInstance: WebhookSender | null = null;

export function getWebhookSender(): WebhookSender {
  if (!webhookSenderInstance) {
    webhookSenderInstance = new WebhookSender();
  }
  return webhookSenderInstance;
}

// Export pro jednoduchy import
export const webhookSender = getWebhookSender();
