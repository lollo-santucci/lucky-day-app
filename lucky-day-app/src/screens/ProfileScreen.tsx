import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AstrologicalProfile } from '../types/astrology';
import { ProfileManager, ProfileCreationError } from '../services';
import { theme } from '../styles';

interface ProfileScreenProps {
  profile: AstrologicalProfile;
  onEdit?: () => void;
  onBack?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
  profile, 
  onEdit, 
  onBack 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleEditProfile = () => {
    if (onEdit) {
      onEdit();
    }
  };

  const handleExportProfile = async () => {
    try {
      setIsLoading(true);
      const exportData = ProfileManager.exportProfile(profile);
      
      // In a real app, you might want to share this data or save it to files
      Alert.alert(
        'Profile Exported', 
        'Your profile data has been prepared for backup.',
        [
          { text: 'OK', style: 'default' }
        ]
      );
      
      console.log('Exported profile data:', exportData);
    } catch (error) {
      console.error('Failed to export profile:', error);
      Alert.alert('Export Error', 'Failed to export profile data.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPillarLabel = (pillarType: string): string => {
    switch (pillarType) {
      case 'year': return 'Year Pillar (Destiny)';
      case 'month': return 'Month Pillar (Environment)';
      case 'day': return 'Day Pillar (Essence)';
      case 'hour': return 'Hour Pillar (Inner Heart)';
      default: return pillarType;
    }
  };

  const capitalizeAnimal = (animal: string): string => {
    return animal.charAt(0).toUpperCase() + animal.slice(1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Cosmic Profile</Text>
          <Text style={styles.subtitle}>
            Your personalized astrological blueprint
          </Text>
        </View>

        {/* Mystical Nickname */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mystical Identity</Text>
          <View style={styles.nicknameContainer}>
            <Text style={styles.nickname}>{profile.mysticalNickname}</Text>
            <Text style={styles.zodiacInfo}>
              {capitalizeAnimal(profile.zodiac.element)} {capitalizeAnimal(profile.zodiac.animal)} • {profile.zodiac.year}
            </Text>
          </View>
        </View>

        {/* Four Pillars */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Four Pillars of Destiny</Text>
          <Text style={styles.sectionDescription}>
            The cosmic forces that shape your path through life
          </Text>
          
          {Object.entries(profile.pillars).map(([pillarType, pillarData]) => (
            <View key={pillarType} style={styles.pillarContainer}>
              <View style={styles.pillarHeader}>
                <Text style={styles.pillarTitle}>
                  {formatPillarLabel(pillarType)}
                </Text>
                <Text style={styles.pillarSymbols}>
                  {pillarData.stem}{pillarData.branch} • {capitalizeAnimal(pillarData.element)}
                </Text>
              </View>
              <Text style={styles.pillarDescription}>
                {profile.pillarDescriptions[pillarType as keyof typeof profile.pillarDescriptions]}
              </Text>
            </View>
          ))}
        </View>

        {/* Essence Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Essence</Text>
          <Text style={styles.sectionDescription}>
            The spiritual signature of your cosmic blueprint
          </Text>
          <View style={styles.essenceContainer}>
            {profile.essenceSummary.split('\n').map((line, index) => (
              <Text key={index} style={styles.essenceLine}>
                {line.trim()}
              </Text>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {onEdit && (
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={handleEditProfile}
              disabled={isLoading}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.actionButton, styles.exportButton]}
            onPress={handleExportProfile}
            disabled={isLoading}
          >
            <Text style={styles.exportButtonText}>
              {isLoading ? 'Exporting...' : 'Export Profile'}
            </Text>
          </TouchableOpacity>
        </View>

        {onBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
          >
            <Text style={styles.backButtonText}>← Back to Fortune</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  nicknameContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  nickname: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  zodiacInfo: {
    fontSize: 16,
    color: '#666666',
  },
  pillarContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
  },
  pillarHeader: {
    marginBottom: 8,
  },
  pillarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  pillarSymbols: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  pillarDescription: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  essenceContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  essenceLine: {
    fontSize: 16,
    color: '#444444',
    lineHeight: 24,
    marginBottom: 8,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: theme.colors.primary,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  exportButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  exportButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '500',
  },
});