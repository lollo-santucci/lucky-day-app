/**
 * Profile Manager Service
 * Handles astrological profile creation, management, and storage
 */

import { BirthDetails, AstrologicalProfile, ChineseZodiac, FourPillars, PillarDescriptions } from '../types/astrology';
import { AppStorage, StorageError } from '../utils/storage';
import { 
  calculateChineseZodiac, 
  calculateFourPillars, 
  generateMysticalNickname,
  generatePillarDescriptions,
  generateEssenceSummary
} from './astrology';

/**
 * Profile creation error types
 */
export class ProfileCreationError extends Error {
  constructor(message: string, public readonly step: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'ProfileCreationError';
  }
}

/**
 * Profile Manager class for handling all profile-related operations
 */
export class ProfileManager {
  /**
   * Creates a complete astrological profile from birth details
   * Handles all calculations and error recovery gracefully
   */
  static async createProfile(birthDetails: BirthDetails): Promise<AstrologicalProfile> {
    try {
      console.log('Starting profile creation for birth details:', {
        date: birthDetails.date.toISOString(),
        time: birthDetails.time,
        location: birthDetails.location
      });

      // Step 1: Calculate Chinese zodiac
      let zodiac: ChineseZodiac;
      try {
        zodiac = calculateChineseZodiac(birthDetails.date);
        console.log('Chinese zodiac calculated:', zodiac);
      } catch (error) {
        throw new ProfileCreationError(
          'Failed to calculate Chinese zodiac',
          'zodiac_calculation',
          error instanceof Error ? error : new Error('Unknown zodiac calculation error')
        );
      }

      // Step 2: Calculate Four Pillars
      let pillars: FourPillars;
      try {
        pillars = calculateFourPillars(birthDetails);
        console.log('Four Pillars calculated:', pillars);
      } catch (error) {
        throw new ProfileCreationError(
          'Failed to calculate Four Pillars of Destiny',
          'pillars_calculation',
          error instanceof Error ? error : new Error('Unknown pillars calculation error')
        );
      }

      // Step 3: Generate mystical nickname
      let mysticalNickname: string;
      try {
        mysticalNickname = await generateMysticalNickname(zodiac);
        console.log('Mystical nickname generated:', mysticalNickname);
      } catch (error) {
        console.warn('Failed to generate mystical nickname, using fallback:', error);
        // Fallback nickname generation
        mysticalNickname = `Mystical ${zodiac.animal.charAt(0).toUpperCase() + zodiac.animal.slice(1)}`;
      }

      // Step 4: Generate pillar descriptions
      let pillarDescriptions: PillarDescriptions;
      try {
        pillarDescriptions = await generatePillarDescriptions(pillars);
        console.log('Pillar descriptions generated');
      } catch (error) {
        console.warn('Failed to generate pillar descriptions, using fallback:', error);
        // Fallback descriptions
        pillarDescriptions = {
          year: 'Your destiny flows with the wisdom of ancient traditions, shaped by celestial forces.',
          month: 'Your environment nurtures growth and opportunity, like fertile ground for your dreams.',
          day: 'Your essence shines with unique brilliance, a beacon of your true nature.',
          hour: 'Your inner heart beats with the rhythm of the cosmos, deep and eternal.'
        };
      }

      // Step 5: Generate essence summary
      let essenceSummary: string;
      try {
        essenceSummary = await generateEssenceSummary(zodiac, pillars);
        console.log('Essence summary generated');
      } catch (error) {
        console.warn('Failed to generate essence summary, using fallback:', error);
        // Fallback essence summary
        essenceSummary = [
          `Born under the ${zodiac.element} ${zodiac.animal}, you carry ancient wisdom within`,
          `Your pillars dance between elements, creating harmony in your life's journey`,
          `In your heart flows the eternal spirit, guiding you toward your true destiny`
        ].join('\n');
      }

      // Create the complete profile
      const profile: AstrologicalProfile = {
        zodiac,
        pillars,
        mysticalNickname,
        pillarDescriptions,
        essenceSummary
      };

      console.log('Profile creation completed successfully');
      return profile;

    } catch (error) {
      if (error instanceof ProfileCreationError) {
        throw error;
      }
      
      throw new ProfileCreationError(
        'Unexpected error during profile creation',
        'unknown',
        error instanceof Error ? error : new Error('Unknown error')
      );
    }
  }

  /**
   * Saves profile to local storage with error handling
   */
  static async saveProfile(profile: AstrologicalProfile): Promise<void> {
    try {
      await AppStorage.saveProfile(profile);
      console.log('Profile saved to storage successfully');
    } catch (error) {
      if (error instanceof StorageError) {
        throw new ProfileCreationError(
          `Failed to save profile: ${error.message}`,
          'storage_save',
          error
        );
      }
      
      throw new ProfileCreationError(
        'Unexpected error while saving profile',
        'storage_save',
        error instanceof Error ? error : new Error('Unknown storage error')
      );
    }
  }

  /**
   * Loads profile from local storage
   */
  static async loadProfile(): Promise<AstrologicalProfile | null> {
    try {
      const profile = await AppStorage.loadProfile();
      if (profile) {
        console.log('Profile loaded from storage successfully');
      }
      return profile;
    } catch (error) {
      console.warn('Failed to load profile from storage:', error);
      return null;
    }
  }

  /**
   * Updates an existing profile with new data
   * Automatically clears existing fortune so user can generate fresh one
   */
  static async updateProfile(updates: Partial<AstrologicalProfile>): Promise<AstrologicalProfile> {
    try {
      const existingProfile = await this.loadProfile();
      if (!existingProfile) {
        throw new ProfileCreationError(
          'No existing profile found to update',
          'profile_not_found'
        );
      }

      const updatedProfile: AstrologicalProfile = {
        ...existingProfile,
        ...updates
      };

      await this.saveProfile(updatedProfile);
      
      // Clear existing fortune so user can generate a new one with updated profile
      try {
        const { fortuneManager } = await import('./fortuneManager');
        await fortuneManager.clearFortuneForProfileUpdate();
      } catch (error) {
        console.warn('Failed to clear fortune after profile update:', error);
        // Don't throw here as profile update was successful
      }
      
      console.log('Profile updated successfully');
      return updatedProfile;

    } catch (error) {
      if (error instanceof ProfileCreationError) {
        throw error;
      }
      
      throw new ProfileCreationError(
        'Failed to update profile',
        'profile_update',
        error instanceof Error ? error : new Error('Unknown update error')
      );
    }
  }

  /**
   * Removes profile from storage
   */
  static async removeProfile(): Promise<void> {
    try {
      await AppStorage.removeProfile();
      console.log('Profile removed from storage successfully');
    } catch (error) {
      throw new ProfileCreationError(
        'Failed to remove profile',
        'profile_removal',
        error instanceof Error ? error : new Error('Unknown removal error')
      );
    }
  }

  /**
   * Validates if a profile is complete and valid
   */
  static validateProfile(profile: AstrologicalProfile): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check zodiac
    if (!profile.zodiac || !profile.zodiac.animal || !profile.zodiac.element) {
      errors.push('Invalid zodiac information');
    }

    // Check pillars
    if (!profile.pillars || !profile.pillars.year || !profile.pillars.month || 
        !profile.pillars.day || !profile.pillars.hour) {
      errors.push('Invalid Four Pillars information');
    }

    // Check required text fields
    if (!profile.mysticalNickname || profile.mysticalNickname.trim().length === 0) {
      errors.push('Missing mystical nickname');
    }

    if (!profile.pillarDescriptions || 
        !profile.pillarDescriptions.year || !profile.pillarDescriptions.month ||
        !profile.pillarDescriptions.day || !profile.pillarDescriptions.hour) {
      errors.push('Missing pillar descriptions');
    }

    if (!profile.essenceSummary || profile.essenceSummary.trim().length === 0) {
      errors.push('Missing essence summary');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Exports profile data as a JSON string for backup/sharing
   */
  static exportProfile(profile: AstrologicalProfile): string {
    try {
      return JSON.stringify(profile, null, 2);
    } catch (error) {
      throw new ProfileCreationError(
        'Failed to export profile data',
        'profile_export',
        error instanceof Error ? error : new Error('Unknown export error')
      );
    }
  }

  /**
   * Imports profile data from a JSON string
   */
  static importProfile(profileData: string): AstrologicalProfile {
    try {
      const profile = JSON.parse(profileData) as AstrologicalProfile;
      
      const validation = this.validateProfile(profile);
      if (!validation.isValid) {
        throw new Error(`Invalid profile data: ${validation.errors.join(', ')}`);
      }

      return profile;
    } catch (error) {
      throw new ProfileCreationError(
        'Failed to import profile data',
        'profile_import',
        error instanceof Error ? error : new Error('Unknown import error')
      );
    }
  }

  /**
   * Complete profile creation workflow from birth details to saved profile
   * This is the main function that should be used by the UI
   */
  static async createAndSaveProfile(birthDetails: BirthDetails): Promise<AstrologicalProfile> {
    try {
      console.log('Starting complete profile creation workflow');
      
      // Create the profile
      const profile = await this.createProfile(birthDetails);
      
      // Validate the created profile
      const validation = this.validateProfile(profile);
      if (!validation.isValid) {
        throw new ProfileCreationError(
          `Profile validation failed: ${validation.errors.join(', ')}`,
          'profile_validation'
        );
      }
      
      // Save the profile
      await this.saveProfile(profile);
      
      console.log('Complete profile creation workflow finished successfully');
      return profile;
      
    } catch (error) {
      console.error('Profile creation workflow failed:', error);
      
      if (error instanceof ProfileCreationError) {
        throw error;
      }
      
      throw new ProfileCreationError(
        'Profile creation workflow failed',
        'workflow_error',
        error instanceof Error ? error : new Error('Unknown workflow error')
      );
    }
  }
}