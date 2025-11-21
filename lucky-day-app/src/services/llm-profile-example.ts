/**
 * Example usage of the LLM Chinese Astrological Profile Generator
 * 
 * This demonstrates how to use the generateChineseAstrologicalProfile method
 * to create a complete astrological profile from birth details.
 */

import { llmService } from './llm';
import { BirthDetails, AstrologicalProfile } from '../types';

/**
 * Example: Generate a complete Chinese astrological profile
 */
export async function generateProfileExample(): Promise<void> {
  // Example birth details
  const birthDetails: BirthDetails = {
    date: new Date('1990-05-15T14:30:00Z'),
    time: '14:30',
    location: {
      latitude: 39.9042,
      longitude: 116.4074,
      timezone: 'Asia/Shanghai',
      cityName: 'Beijing'
    }
  };

  try {
    console.log('Generating complete Chinese astrological profile...');
    
    // Generate the profile using LLM (returns profile without birthDetails/cityName)
    const profileData = await llmService.generateChineseAstrologicalProfile(birthDetails);
    
    // Create complete profile with birth details
    const profile: AstrologicalProfile = {
      ...profileData,
      birthDetails,
      cityName: birthDetails.location.cityName
    };
    
    console.log('\n=== COMPLETE ASTROLOGICAL PROFILE ===\n');
    
    // Main Section
    console.log('MAIN PROFILE:');
    console.log(`Animal: ${profile.main.animal}`);
    console.log(`Element: ${profile.main.element}`);
    console.log(`Polarity: ${profile.main.polarity}`);
    console.log(`Identity: ${profile.main.identity_title}`);
    console.log(`Description: ${profile.main.identity_description}`);
    console.log(`Strengths: ${profile.main.strengths.join(', ')}`);
    console.log(`Weaknesses: ${profile.main.weaknesses.join(', ')}`);
    
    // Elements Section
    console.log('\nELEMENT DISTRIBUTION:');
    console.log(`Water: ${profile.elements.element_distribution.water}%`);
    console.log(`Wood: ${profile.elements.element_distribution.wood}%`);
    console.log(`Fire: ${profile.elements.element_distribution.fire}%`);
    console.log(`Metal: ${profile.elements.element_distribution.metal}%`);
    console.log(`Earth: ${profile.elements.element_distribution.earth}%`);
    
    console.log('\nPOLARITY DISTRIBUTION:');
    console.log(`Yin: ${profile.elements.polarity_distribution.yin}%`);
    console.log(`Yang: ${profile.elements.polarity_distribution.yang}%`);
    
    console.log('\nELEMENT-POLARITY DESCRIPTION:');
    console.log(profile.elements.element_polarity_description);
    
    // Ba Zi Section
    console.log('\nBA ZI (FOUR PILLARS):');
    console.log('\nYear Pillar (Public Image):');
    console.log(`  ${profile.ba_zi.year.animal} - ${profile.ba_zi.year.element} (${profile.ba_zi.year.polarity})`);
    console.log(`  ${profile.ba_zi.year.description}`);
    
    console.log('\nMonth Pillar (Environment):');
    console.log(`  ${profile.ba_zi.month.animal} - ${profile.ba_zi.month.element} (${profile.ba_zi.month.polarity})`);
    console.log(`  ${profile.ba_zi.month.description}`);
    
    console.log('\nDay Pillar (Inner Self):');
    console.log(`  ${profile.ba_zi.day.animal} - ${profile.ba_zi.day.element} (${profile.ba_zi.day.polarity})`);
    console.log(`  ${profile.ba_zi.day.description}`);
    
    console.log('\nHour Pillar (Future Development):');
    console.log(`  ${profile.ba_zi.hour.animal} - ${profile.ba_zi.hour.element} (${profile.ba_zi.hour.polarity})`);
    console.log(`  ${profile.ba_zi.hour.description}`);
    
    // Cosmic Blueprint
    console.log('\nCOSMIC BLUEPRINT:');
    console.log(profile.cosmic_blueprint.full_description);
    
    console.log('\n=== PROFILE GENERATION COMPLETE ===\n');
    
  } catch (error) {
    console.error('Failed to generate profile:', error);
    throw error;
  }
}

/**
 * Example: Using the profile in your application
 */
export async function integrateProfileIntoApp(birthDetails: BirthDetails): Promise<AstrologicalProfile> {
  // Check if LLM service is available
  if (!llmService.isServiceAvailable()) {
    throw new Error('LLM service is not available. Please configure your API key.');
  }

  // Generate the profile data
  const profileData = await llmService.generateChineseAstrologicalProfile(birthDetails);
  
  // Create complete profile
  const profile: AstrologicalProfile = {
    ...profileData,
    birthDetails,
    cityName: birthDetails.location.cityName
  };
  
  // Validate the profile structure
  validateProfile(profile);
  
  return profile;
}

/**
 * Validates that the generated profile has all required fields
 */
function validateProfile(profile: AstrologicalProfile): void {
  // Validate main section
  if (!profile.main || !profile.main.animal || !profile.main.element || !profile.main.polarity) {
    throw new Error('Invalid main section in profile');
  }
  
  if (!profile.main.identity_title || !profile.main.identity_description) {
    throw new Error('Missing identity information in profile');
  }
  
  if (!Array.isArray(profile.main.strengths) || profile.main.strengths.length !== 3) {
    throw new Error('Invalid strengths array in profile');
  }
  
  if (!Array.isArray(profile.main.weaknesses) || profile.main.weaknesses.length !== 3) {
    throw new Error('Invalid weaknesses array in profile');
  }
  
  // Validate element distribution
  const elementSum = Object.values(profile.elements.element_distribution).reduce((a, b) => (a as number) + (b as number), 0) as number;
  if (Math.abs(elementSum - 100) > 1) {
    throw new Error('Element distribution does not sum to 100%');
  }
  
  // Validate polarity distribution
  const polaritySum = Object.values(profile.elements.polarity_distribution).reduce((a, b) => (a as number) + (b as number), 0) as number;
  if (Math.abs(polaritySum - 100) > 1) {
    throw new Error('Polarity distribution does not sum to 100%');
  }
  
  // Validate Ba Zi
  const pillars = ['year', 'month', 'day', 'hour'] as const;
  for (const pillar of pillars) {
    if (!profile.ba_zi[pillar] || !profile.ba_zi[pillar].animal || 
        !profile.ba_zi[pillar].element || !profile.ba_zi[pillar].polarity ||
        !profile.ba_zi[pillar].description) {
      throw new Error(`Invalid ${pillar} pillar in Ba Zi`);
    }
  }
  
  // Validate cosmic blueprint
  if (!profile.cosmic_blueprint || !profile.cosmic_blueprint.full_description) {
    throw new Error('Missing cosmic blueprint in profile');
  }
  
  console.log('Profile validation passed ✓');
}

// Export for use in other modules
export { validateProfile };
