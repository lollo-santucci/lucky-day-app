/**
 * Application state and settings type definitions for Lucky Day app
 */

import { AstrologicalProfile } from './astrology';
import { Fortune } from './fortune';

export interface AppSettings {
  /** Whether notifications are enabled */
  notificationsEnabled: boolean;
  /** Whether sound effects are enabled */
  soundEnabled: boolean;
  /** Whether iCloud sync is enabled */
  iCloudSyncEnabled: boolean;
}

export interface AppAnalytics {
  /** Total number of fortunes generated */
  fortunesGenerated: number;
  /** Total number of app opens */
  appOpens: number;
  /** Last date the app was actively used */
  lastActiveDate: Date;
}

export interface AppState {
  /** User's astrological profile, null if not created */
  profile: AstrologicalProfile | null;
  /** Current fortune, null if none available */
  currentFortune: Fortune | null;
  /** Date when last fortune was generated */
  lastFortuneDate: Date | null;
  /** App settings */
  settings: AppSettings;
  /** Anonymous analytics data */
  analytics: AppAnalytics;
}

export type CookieState = 'closed' | 'breaking' | 'opened';