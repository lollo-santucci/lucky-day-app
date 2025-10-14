import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { BirthDetails } from '../types';

interface LocationPickerProps {
  value: BirthDetails['location'];
  onChange: (location: BirthDetails['location']) => void;
  error?: string;
}

interface LocationSuggestion {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  error,
}) => {
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);

  // Mock location data for demonstration - in a real app, you'd use a geocoding service
  const mockLocations: LocationSuggestion[] = [
    { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
    { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
    { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
    { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
    { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
    { name: 'Los Angeles', country: 'United States', latitude: 34.0522, longitude: -118.2437, timezone: 'America/Los_Angeles' },
    { name: 'Berlin', country: 'Germany', latitude: 52.5200, longitude: 13.4050, timezone: 'Europe/Berlin' },
    { name: 'Beijing', country: 'China', latitude: 39.9042, longitude: 116.4074, timezone: 'Asia/Shanghai' },
    { name: 'Mumbai', country: 'India', latitude: 19.0760, longitude: 72.8777, timezone: 'Asia/Kolkata' },
    { name: 'São Paulo', country: 'Brazil', latitude: -23.5505, longitude: -46.6333, timezone: 'America/Sao_Paulo' },
  ];

  useEffect(() => {
    if (searchText.length > 2) {
      setIsSearching(true);
      // Simulate API delay
      const timer = setTimeout(() => {
        const filtered = mockLocations.filter(location =>
          location.name.toLowerCase().includes(searchText.toLowerCase()) ||
          location.country.toLowerCase().includes(searchText.toLowerCase())
        );
        setSuggestions(filtered);
        setIsSearching(false);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [searchText]);

  const getCurrentLocation = async () => {
    setIsGettingCurrentLocation(true);
    
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is needed to detect your current location. You can still search for your birth location manually.'
        );
        setIsGettingCurrentLocation(false);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Get timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // For demo purposes, we'll use a reverse geocoding simulation
      // In a real app, you'd use a proper reverse geocoding service
      const reverseGeocodedLocation: LocationSuggestion = {
        name: 'Current Location',
        country: 'Detected',
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timezone: timezone,
      };

      selectLocation(reverseGeocodedLocation);
    } catch (error) {
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please search for your birth location manually.'
      );
    } finally {
      setIsGettingCurrentLocation(false);
    }
  };

  const selectLocation = (location: LocationSuggestion) => {
    setSelectedLocation(location);
    setSearchText(`${location.name}, ${location.country}`);
    setSuggestions([]);
    
    onChange({
      latitude: location.latitude,
      longitude: location.longitude,
      timezone: location.timezone,
    });
  };

  const formatLocationDisplay = (): string => {
    if (selectedLocation) {
      return `${selectedLocation.name}, ${selectedLocation.country}`;
    }
    if (value.latitude && value.longitude) {
      return `${value.latitude.toFixed(4)}, ${value.longitude.toFixed(4)}`;
    }
    return 'Select your birth location';
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.searchInput, error && styles.searchInputError]}
          placeholder="Search for your birth city..."
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="words"
          autoCorrect={false}
        />
        
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={getCurrentLocation}
          disabled={isGettingCurrentLocation}
        >
          {isGettingCurrentLocation ? (
            <ActivityIndicator size="small" color="#B83330" />
          ) : (
            <Text style={styles.currentLocationText}>📍</Text>
          )}
        </TouchableOpacity>
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {isSearching && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#B83330" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}

      {suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => selectLocation(suggestion)}
            >
              <Text style={styles.suggestionName}>{suggestion.name}</Text>
              <Text style={styles.suggestionCountry}>{suggestion.country}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {selectedLocation && (
        <View style={styles.selectedLocationContainer}>
          <Text style={styles.selectedLocationLabel}>Selected Location:</Text>
          <Text style={styles.selectedLocationText}>
            {formatLocationDisplay()}
          </Text>
          <Text style={styles.timezoneText}>
            Timezone: {selectedLocation.timezone}
          </Text>
        </View>
      )}

      <Text style={styles.helpText}>
        💡 Enter the city where you were born. We need this to calculate your Four Pillars accurately.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#222222',
  },
  searchInputError: {
    borderColor: '#B83330', // Jade Red
  },
  currentLocationButton: {
    marginLeft: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationText: {
    fontSize: 18,
  },
  errorText: {
    color: '#B83330', // Jade Red
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666666',
    fontSize: 14,
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
    maxHeight: 200,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionName: {
    fontSize: 16,
    color: '#222222',
    fontWeight: '500',
  },
  suggestionCountry: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  selectedLocationContainer: {
    backgroundColor: '#F2C879', // Soft Gold (light)
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  selectedLocationLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedLocationText: {
    fontSize: 16,
    color: '#222222',
    fontWeight: '500',
    marginBottom: 4,
  },
  timezoneText: {
    fontSize: 12,
    color: '#666666',
  },
  helpText: {
    fontSize: 12,
    color: '#888888',
    lineHeight: 16,
    fontStyle: 'italic',
  },
});