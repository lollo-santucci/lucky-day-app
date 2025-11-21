import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AstrologicalProfile, BirthDetails } from '../types/astrology';
import { ProfileManager, ProfileCreationError } from '../services';
import { theme } from '../styles';
import { 
  BirthDetailsForm, 
  ProfileSection, 
  BirthInfoDisplay,
  InfoCard, 
  MainProfileCard,
  ElementBar,
  PillarCard,
} from '../components';

interface ProfileScreenProps {
  profile: AstrologicalProfile;
  onProfileUpdate?: (updatedProfile: AstrologicalProfile) => void;
  onBack?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  onProfileUpdate,
  onBack
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(profile);

  const handleEditProfile = () => {
    setIsEditModalVisible(true);
  };

  const handleProfileEditSubmit = async (birthDetails: BirthDetails) => {
    try {
      setIsLoading(true);

      // Create new profile from updated birth details
      const updatedProfile = await ProfileManager.createProfile(birthDetails);

      // Save the updated profile
      await ProfileManager.saveProfile(updatedProfile);

      // Clear existing fortune so user can generate a new one with updated profile
      const { fortuneManager } = await import('../services/fortuneManager');
      await fortuneManager.clearFortuneForProfileUpdate();

      // Update local state
      setCurrentProfile(updatedProfile);

      // Notify parent component
      if (onProfileUpdate) {
        onProfileUpdate(updatedProfile);
      }

      setIsEditModalVisible(false);

      Alert.alert(
        'Profile Updated',
        'Your astrological profile has been updated! You can now generate a fresh fortune based on your new cosmic blueprint.',
        [{ text: 'OK', style: 'default' }]
      );

    } catch (error) {
      console.error('Failed to update profile:', error);

      let errorMessage = 'Failed to update profile. Please try again.';
      if (error instanceof ProfileCreationError) {
        errorMessage = `Update failed: ${error.message}`;
      }

      Alert.alert('Update Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
  };



  const formatBirthDate = () => {
    const date = currentProfile.birthDetails.date;
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <SafeAreaView style={[styles.container, { paddingHorizontal: theme.spacing['2xl'] }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <ProfileSection
          profile={currentProfile}
          onPress={onBack || (() => { })}
          variant="profile"
        />

        {/* Birth Information */}
        <BirthInfoDisplay
          birthDetails={currentProfile.birthDetails}
          cityName={currentProfile.cityName}
          onEdit={handleEditProfile}
        />

        {/* Main Profile Section */}
        <MainProfileCard
          animal={currentProfile.main.animal}
          element={currentProfile.main.element}
          polarity={currentProfile.main.polarity}
          identityTitle={currentProfile.main.identity_title}
          identityDescription={currentProfile.main.identity_description}
          strengths={currentProfile.main.strengths}
          weaknesses={currentProfile.main.weaknesses}
        />


        {/* Elements Section */}
        <InfoCard title="ELEMENTS">
          <View style={styles.elementsContainer}>
            <ElementBar 
              element="water" 
              percentage={currentProfile.elements.element_distribution.water} 
            />
            <ElementBar 
              element="wood" 
              percentage={currentProfile.elements.element_distribution.wood} 
            />
            <ElementBar 
              element="fire" 
              percentage={currentProfile.elements.element_distribution.fire} 
            />
            <ElementBar 
              element="metal" 
              percentage={currentProfile.elements.element_distribution.metal} 
            />
            <ElementBar 
              element="earth" 
              percentage={currentProfile.elements.element_distribution.earth} 
            />
            
            <Text style={styles.elementDescription}>
              {currentProfile.elements.element_polarity_description}
            </Text>
          </View>
        </InfoCard>

        {/* Ba Zi (Four Pillars) Section */}
        <InfoCard title="FOUR PILLARS OF DESTINY - BA ZI">
          <PillarCard
            type="year"
            animal={currentProfile.ba_zi.year.animal}
            element={currentProfile.ba_zi.year.element}
            polarity={currentProfile.ba_zi.year.polarity}
            description={currentProfile.ba_zi.year.description}
          />

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <Text style={styles.dividerText}>年</Text>
            <View style={styles.dividerLine} />
          </View>

          <PillarCard
            type="month"
            animal={currentProfile.ba_zi.month.animal}
            element={currentProfile.ba_zi.month.element}
            polarity={currentProfile.ba_zi.month.polarity}
            description={currentProfile.ba_zi.month.description}
          />

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <Text style={styles.dividerText}>月</Text>
            <View style={styles.dividerLine} />
          </View>

          <PillarCard
            type="day"
            animal={currentProfile.ba_zi.day.animal}
            element={currentProfile.ba_zi.day.element}
            polarity={currentProfile.ba_zi.day.polarity}
            description={currentProfile.ba_zi.day.description}
          />

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <Text style={styles.dividerText}>天</Text>
            <View style={styles.dividerLine} />
          </View>

          <PillarCard
            type="hour"
            animal={currentProfile.ba_zi.hour.animal}
            element={currentProfile.ba_zi.hour.element}
            polarity={currentProfile.ba_zi.hour.polarity}
            description={currentProfile.ba_zi.hour.description}
          />

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <Text style={styles.dividerText}>小时</Text>
            <View style={styles.dividerLine} />
          </View>
        </InfoCard>

        {/* Cosmic Blueprint Section */}
        <InfoCard title="YOUR COSMIC BLUEPRINT">
          <View style={styles.blueprintContainer}>
            <Text style={styles.blueprintText}>
              {currentProfile.cosmic_blueprint.full_description}
            </Text>
          </View>
        </InfoCard>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleEditCancel}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleEditCancel}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.modalContent}>
            <BirthDetailsForm
              onSubmit={handleProfileEditSubmit}
              onCancel={handleEditCancel}
              isLoading={isLoading}
              submitButtonText="Update Profile"
              initialValues={currentProfile.birthDetails}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  elementsContainer: {
    //backgroundColor: theme.colors.surface,
    //borderRadius: theme.borderRadius.lg,
    //padding: theme.spacing.lg,
    //borderWidth: 1,
    //borderColor: theme.colors.borderLight,
  },
  elementDescription: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.light,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.relaxed,
    marginTop: theme.spacing.base,
    fontStyle: 'italic',
  },
  blueprintContainer: {
    //backgroundColor: theme.colors.surface,
    //borderRadius: theme.borderRadius.lg,
    //padding: theme.spacing.lg,
    //borderWidth: 1,
    //borderColor: theme.colors.borderLight,
  },
  blueprintText: {
    marginTop: 0,
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.light,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.loose,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  cancelButton: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  headerSpacer: {
    width: 60,
  },
  dividerContainer: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dividerText: {
    fontFamily: theme.typography.fontFamily.light,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginRight: 12,
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: theme.colors.textSecondary,
  },
});