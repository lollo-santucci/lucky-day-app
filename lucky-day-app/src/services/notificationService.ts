/**
 * Notification Service
 * Handles daily fortune notifications and permission management
 * Implements requirements 1.6, 8.1, 8.2, 8.3 for notification system
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { AppStorage } from '../utils/storage';

/**
 * Notification service error types
 */
export enum NotificationErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  SCHEDULING_FAILED = 'SCHEDULING_FAILED',
  CANCELLATION_FAILED = 'CANCELLATION_FAILED',
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED'
}

export class NotificationServiceError extends Error {
  constructor(
    public type: NotificationErrorType,
    message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'NotificationServiceError';
  }
}

/**
 * Notification permission status
 */
export interface NotificationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: Notifications.PermissionStatus;
}

/**
 * Notification Service Class
 * Manages daily fortune notifications
 */
export class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;
  private notificationIdentifier = 'daily-fortune-notification';

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize the notification service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Configure notification behavior
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      this.isInitialized = true;
      console.log('NotificationService initialized successfully');

    } catch (error) {
      throw new NotificationServiceError(
        NotificationErrorType.INITIALIZATION_FAILED,
        `Failed to initialize notification service: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Request notification permissions
   */
  public async requestPermissions(): Promise<NotificationPermissionStatus> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      const canAskAgain = finalStatus === 'undetermined';
      const granted = finalStatus === 'granted';

      return {
        granted,
        canAskAgain,
        status: finalStatus
      };

    } catch (error) {
      throw new NotificationServiceError(
        NotificationErrorType.PERMISSION_DENIED,
        `Failed to request notification permissions: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Check current notification permission status
   */
  public async getPermissionStatus(): Promise<NotificationPermissionStatus> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      
      return {
        granted: status === 'granted',
        canAskAgain: status === 'undetermined',
        status
      };

    } catch (error) {
      console.warn('Failed to get notification permission status:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied' as Notifications.PermissionStatus
      };
    }
  }

  /**
   * Schedule daily fortune notification
   * Triggers at 8am local time when a new fortune becomes available
   */
  public async scheduleDailyNotification(): Promise<void> {
    try {
      await this.initialize();

      // Check permissions first
      const permissions = await this.getPermissionStatus();
      if (!permissions.granted) {
        console.log('Notification permissions not granted, skipping scheduling');
        return;
      }

      // Cancel any existing notifications
      await this.cancelDailyNotification();

      // Schedule notification for 8am local time
      const trigger: Notifications.DailyTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 8,
        minute: 0,
      };

      await Notifications.scheduleNotificationAsync({
        identifier: this.notificationIdentifier,
        content: {
          title: 'Lucky Day',
          body: 'Il tuo biscotto è pronto 🍪',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger,
      });

      console.log('Daily fortune notification scheduled for 8:00 AM');

    } catch (error) {
      throw new NotificationServiceError(
        NotificationErrorType.SCHEDULING_FAILED,
        `Failed to schedule daily notification: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Cancel daily fortune notification
   */
  public async cancelDailyNotification(): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(this.notificationIdentifier);
      console.log('Daily fortune notification cancelled');

    } catch (error) {
      throw new NotificationServiceError(
        NotificationErrorType.CANCELLATION_FAILED,
        `Failed to cancel daily notification: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Trigger notification after fortune reveal (requirement 1.6)
   * This sets up the next day's notification
   */
  public async triggerAfterFortuneReveal(): Promise<void> {
    try {
      // Check if notifications are enabled in app settings
      const appState = await AppStorage.loadAppState();
      const notificationsEnabled = appState?.settings?.notificationsEnabled ?? true;

      if (!notificationsEnabled) {
        console.log('Notifications disabled in app settings');
        return;
      }

      // Schedule the daily notification for tomorrow
      await this.scheduleDailyNotification();
      
      console.log('Notification scheduled after fortune reveal');

    } catch (error) {
      console.warn('Failed to trigger notification after fortune reveal:', error);
      // Don't throw here as this shouldn't block the fortune reveal process
    }
  }

  /**
   * Update notification settings based on app preferences
   */
  public async updateNotificationSettings(enabled: boolean): Promise<void> {
    try {
      if (enabled) {
        // Request permissions and schedule if enabled
        const permissions = await this.requestPermissions();
        if (permissions.granted) {
          await this.scheduleDailyNotification();
        }
      } else {
        // Cancel notifications if disabled
        await this.cancelDailyNotification();
      }

    } catch (error) {
      console.warn('Failed to update notification settings:', error);
      // Don't throw here as this is a settings update
    }
  }

  /**
   * Handle timezone changes by rescheduling notifications
   */
  public async handleTimezoneChange(): Promise<void> {
    try {
      // Check if notifications are currently scheduled
      const appState = await AppStorage.loadAppState();
      const notificationsEnabled = appState?.settings?.notificationsEnabled ?? true;

      if (notificationsEnabled) {
        // Reschedule with new timezone
        await this.scheduleDailyNotification();
        console.log('Notifications rescheduled for timezone change');
      }

    } catch (error) {
      console.warn('Failed to handle timezone change:', error);
    }
  }

  /**
   * Get all scheduled notifications (for debugging)
   */
  public async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.warn('Failed to get scheduled notifications:', error);
      return [];
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();