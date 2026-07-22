/**
 * Contact form types
 */

/**
 * Cloudflare Turnstile browser API, injected by
 * https://challenges.cloudflare.com/turnstile/v0/api.js
 */
export interface TurnstileRenderOptions {
  sitekey: string;
  theme?: 'light' | 'dark' | 'auto';
  callback?: (token: string) => void;
  'error-callback'?: () => void;
}

export interface TurnstileAPI {
  render: (container: HTMLElement | string, options: TurnstileRenderOptions) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileAPI;
    onTurnstileLoadCallback?: () => void;
  }
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
  turnstileToken: string;
  locale: 'tr' | 'en';
}

export interface ContactFormResponse {
  success: boolean;
  message: string;
  error?: string;
  retryAfter?: number;
}

export interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  subject?: string;
  message?: string;
  turnstile?: string;
  submit?: string;
}