/**
 * Exotel/TwiML XML Response Builder
 * Generates XML responses for IVR webhooks
 */

export class ExotelResponse {
  private elements: string[] = [];

  /**
   * Text-to-speech - speaks text to caller
   */
  say(text: string, options: { language?: string; voice?: string } = {}): this {
    const lang = options.language || 'en-IN';
    const voice = options.voice || 'Polly.Aditi'; // AWS Polly Indian English voice
    this.elements.push(`<Say voice="${voice}" language="${lang}">${this.escapeXml(text)}</Say>`);
    return this;
  }

  /**
   * Collect DTMF digits from caller
   */
  gather(options: {
    action: string;
    method?: string;
    numDigits?: number;
    timeout?: number;
    finishOnKey?: string;
  }): this {
    const method = options.method || 'POST';
    const numDigits = options.numDigits || 1;
    const timeout = options.timeout || 5;
    const finishOnKey = options.finishOnKey || '#';
    
    this.elements.push(
      `<Gather action="${options.action}" method="${method}" numDigits="${numDigits}" timeout="${timeout}" finishOnKey="${finishOnKey}">`
    );
    return this;
  }

  /**
   * Close gather element (call after adding say inside gather)
   */
  endGather(): this {
    this.elements.push('</Gather>');
    return this;
  }

  /**
   * Play audio file
   */
  play(url: string): this {
    this.elements.push(`<Play>${url}</Play>`);
    return this;
  }

  /**
   * Pause for specified seconds
   */
  pause(seconds: number = 1): this {
    this.elements.push(`<Pause length="${seconds}"/>`);
    return this;
  }

  /**
   * Record caller's voice
   */
  record(options: {
    action: string;
    maxLength?: number;
    playBeep?: boolean;
  }): this {
    const maxLength = options.maxLength || 60;
    const playBeep = options.playBeep !== false;
    this.elements.push(
      `<Record action="${options.action}" maxLength="${maxLength}" playBeep="${playBeep}"/>`
    );
    return this;
  }

  /**
   * Redirect to another URL
   */
  redirect(url: string): this {
    this.elements.push(`<Redirect>${url}</Redirect>`);
    return this;
  }

  /**
   * Hang up the call
   */
  hangup(): this {
    this.elements.push('<Hangup/>');
    return this;
  }

  /**
   * Build final XML response
   */
  build(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  ${this.elements.join('\n  ')}\n</Response>`;
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

/**
 * Pre-built IVR messages (bilingual: English + Hindi)
 */
export const IVR_MESSAGES = {
  welcome: {
    en: 'Welcome to SevaSync volunteer system.',
    hi: 'SevaSync volunteer system mein aapka swagat hai.',
  },
  notRegistered: {
    en: 'This phone number is not registered. Please register through the app or contact your coordinator. Goodbye.',
    hi: 'Yeh phone number registered nahi hai. Kripya app se register karein ya coordinator se sampark karein. Dhanyawad.',
  },
  noTasks: {
    en: 'There are no tasks available near you right now. Please try again later. Goodbye.',
    hi: 'Abhi aapke paas koi task nahi hai. Baad mein try karein. Dhanyawad.',
  },
  taskIntro: {
    en: 'You have a task nearby.',
    hi: 'Aapke paas ek task hai.',
  },
  taskOptions: {
    en: 'Press 1 to accept this task. Press 2 to skip. Press 9 to hear again.',
    hi: 'Task lene ke liye 1 dabayen. Skip karne ke liye 2 dabayen. Dobara sunne ke liye 9 dabayen.',
  },
  taskAccepted: {
    en: 'Task accepted. Please go to the location and complete it. Call back when done. Goodbye.',
    hi: 'Task accept ho gaya. Location par jayen aur complete karein. Kaam hone par wapas call karein. Dhanyawad.',
  },
  taskSkipped: {
    en: 'Task skipped. Thank you for your time. Goodbye.',
    hi: 'Task skip ho gaya. Aapke samay ke liye dhanyawad.',
  },
  taskAlreadyAssigned: {
    en: 'You already have an active task. Press 1 to mark it complete. Press 2 to hear task details.',
    hi: 'Aapke paas pehle se ek task hai. Complete karne ke liye 1 dabayen. Details sunne ke liye 2 dabayen.',
  },
  taskCompleted: {
    en: 'Task marked as complete. Thank you for your service. Goodbye.',
    hi: 'Task complete ho gaya. Aapki seva ke liye dhanyawad.',
  },
  invalidInput: {
    en: 'Invalid input. Please try again.',
    hi: 'Galat input. Dobara try karein.',
  },
  error: {
    en: 'Sorry, something went wrong. Please try again later. Goodbye.',
    hi: 'Maaf kijiye, kuch gadbad ho gayi. Baad mein try karein. Dhanyawad.',
  },
  goodbye: {
    en: 'Thank you for calling SevaSync. Goodbye.',
    hi: 'SevaSync ko call karne ke liye dhanyawad. Namaste.',
  },
};

/**
 * Get message in specified language (default: Hindi)
 */
export function getMessage(key: keyof typeof IVR_MESSAGES, lang: 'en' | 'hi' = 'hi'): string {
  return IVR_MESSAGES[key][lang];
}

/**
 * Build task description for TTS
 */
export function buildTaskDescription(task: {
  title: string;
  description?: string;
  urgency: string;
  estimatedHours?: number;
}, lang: 'en' | 'hi' = 'hi'): string {
  if (lang === 'hi') {
    const urgencyMap: Record<string, string> = {
      CRITICAL: 'bahut urgent',
      HIGH: 'urgent',
      MEDIUM: 'samanya',
      LOW: 'kam urgent',
    };
    const urgency = urgencyMap[task.urgency] || 'samanya';
    return `Task ka naam: ${task.title}. Yeh ${urgency} hai. ${task.estimatedHours ? `Lagbhag ${task.estimatedHours} ghante lagenge.` : ''}`;
  }
  
  return `Task: ${task.title}. Urgency: ${task.urgency.toLowerCase()}. ${task.estimatedHours ? `Estimated time: ${task.estimatedHours} hours.` : ''}`;
}
