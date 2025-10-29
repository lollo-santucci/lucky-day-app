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
import { BirthDetailsForm, ProfileSection, BirthInfoDisplay } from '../components';

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



  return (
    <SafeAreaView style={[styles.container, { paddingHorizontal: theme.spacing['2xl'] }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header with Back Button */}
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
    //padding: 20,
    paddingBottom: 40,
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
});