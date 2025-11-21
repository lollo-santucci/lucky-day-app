/**
 * Profile Manager Service
 * Handles astrological profile creation, management, and storage
 */

import { BirthDetails, AstrologicalProfile } from '../types/astrology';
import { AppStorage, StorageError } from '../utils/storage';

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
   * Creates a complete astrological profile from birth details using LLM
   * Handles all calculations and error recovery gracefully
   */
  static async createProfile(birthDetails: BirthDetails): Promise<AstrologicalProfile> {
    try {
      console.log('Starting LLM profile creation for birth details:', {
        date: birthDetails.date.toISOString(),
        time: birthDetails.time,
        location: birthDetails.location
      });

      // Import LLM service
      const { llmService } = await import('./llm');

      // Check if LLM service is available
      if (!llmService.isServiceAvailable()) {
        throw new ProfileCreationError(
          'LLM service is not available. Please configure your OpenAI API key.',
          'llm_unavailable'
        );
      }

      // Generate complete profile using LLM
      let profileData: Omit<AstrologicalProfile, 'birthDetails' | 'cityName'>;
      try {
        profileData = await llmService.generateChineseAstrologicalProfile(birthDetails);
        console.log('LLM profile generated successfully');
      } catch (error) {
        console.error('LLM generation error details:', error);
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
        throw new ProfileCreationError(
          'Failed to generate astrological profile with LLM',
          'llm_generation',
          error instanceof Error ? error : new Error('Unknown LLM error')
        );
      }

      // Create the complete profile with birth details
      const profile: AstrologicalProfile = {
        ...profileData,
        birthDetails,
        cityName: birthDetails.location.cityName,
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
   * Handles migration from legacy profile structure to new LLM-based structure
   */
  static async loadProfile(): Promise<AstrologicalProfile | null> {
    try {
      const profile = await AppStorage.loadProfile();
      if (profile) {
        console.log('Profile loaded from storage successfully');
        
        let needsSave = false;
        
        // Migration: Check if this is a legacy profile (has zodiac/pillars/mysticalNickname)
        const isLegacyProfile = 'zodiac' in profile && 'pillars' in profile && 'mysticalNickname' in profile;
        
        if (isLegacyProfile) {
          console.warn('Legacy profile detected - user needs to regenerate profile with new system');
          // Return null to force profile regeneration
          // This ensures users get the full LLM-generated profile
          return null;
        }
        
        // Ensure birthDetails exists and date is a Date object
        if (!profile.birthDetails) {
          console.warn('Profile missing birthDetails - invalid profile');
          return null;
        }
        
        if (typeof profile.birthDetails.date === 'string') {
          profile.birthDetails.date = new Date(profile.birthDetails.date);
        }
        
        // Migration: Ensure cityName field exists at profile level
        if (!profile.hasOwnProperty('cityName')) {
          profile.cityName = profile.birthDetails?.location?.cityName;
          needsSave = true;
        }
        
        // Validate new profile structure
        if (!profile.main || !profile.elements || !profile.ba_zi || !profile.cosmic_blueprint) {
          console.warn('Profile missing required fields - invalid profile');
          return null;
        }
        
        // Save the migrated profile if needed
        if (needsSave) {
          await this.saveProfile(profile);
        }
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

    // Check main section
    if (!profile.main || !profile.main.animal || !profile.main.element || !profile.main.polarity) {
      errors.push('Invalid main profile information');
    }

    if (!profile.main?.identity_title || profile.main.identity_title.trim().length === 0) {
      errors.push('Missing identity title');
    }

    if (!profile.main?.identity_description || profile.main.identity_description.trim().length === 0) {
      errors.push('Missing identity description');
    }

    if (!Array.isArray(profile.main?.strengths) || profile.main.strengths.length !== 3) {
      errors.push('Invalid strengths array');
    }

    if (!Array.isArray(profile.main?.weaknesses) || profile.main.weaknesses.length !== 3) {
      errors.push('Invalid weaknesses array');
    }

    // Check elements section
    if (!profile.elements || !profile.elements.element_distribution || !profile.elements.polarity_distribution) {
      errors.push('Invalid elements information');
    }

    // Check Ba Zi section
    if (!profile.ba_zi || !profile.ba_zi.year || !profile.ba_zi.month || 
        !profile.ba_zi.day || !profile.ba_zi.hour) {
      errors.push('Invalid Ba Zi (Four Pillars) information');
    }

    // Check cosmic blueprint
    if (!profile.cosmic_blueprint || !profile.cosmic_blueprint.full_description || 
        profile.cosmic_blueprint.full_description.trim().length === 0) {
      errors.push('Missing cosmic blueprint');
    }

    // Check birth details
    if (!profile.birthDetails) {
      errors.push('Missing birth details');
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
        console.error('Profile validation failed with errors:', validation.errors);
        console.error('Profile structure:', JSON.stringify(profile, null, 2));
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