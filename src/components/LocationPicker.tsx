import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import { BirthDetails } from '../types';
import { geocodingService, LocationResult } from '../services/geocoding';
import { pickerStyles } from '../styles/pickerStyles';
import { theme } from '@/styles';

interface LocationPickerProps {
    value: BirthDetails['location'];
    onChange: (location: BirthDetails['location']) => void;
    error?: string;
}

// Use LocationResult from geocoding service
type LocationSuggestion = LocationResult;

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
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (searchText.length > 1) {
            setIsSearching(true);

            const searchLocations = async () => {
                try {
                    const results = await geocodingService.searchLocations(searchText);

                    setSuggestions(results);
                } catch (error) {
                    console.error('Location search error:', error);
                    // Set fallback suggestions on error
                    const fallbackResults: LocationSuggestion[] = [
                        {
                            name: 'London',
                            country: 'United Kingdom',
                            latitude: 51.5074,
                            longitude: -0.1278,
                            timezone: 'Europe/London',
                            displayName: 'London, United Kingdom'
                        },
                        {
                            name: 'New York',
                            country: 'United States',
                            latitude: 40.7128,
                            longitude: -74.0060,
                            timezone: 'America/New_York',
                            displayName: 'New York, United States'
                        }
                    ];
                    setSuggestions(fallbackResults);
                } finally {
                    setIsSearching(false);
                }
            };

            // Debounce the search
            const timer = setTimeout(searchLocations, 300);
            return () => clearTimeout(timer);
        } else {
            setSuggestions([]);
            setIsSearching(false);
        }
    }, [searchText]);

    // Remove the mock findNearestCity function - now using real geocoding service

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

            // Use geocoding service for reverse geocoding
            const locationResult = await geocodingService.reverseGeocode(
                location.coords.latitude,
                location.coords.longitude
            );

            selectLocation(locationResult);
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
        // Don't update search text to keep it clean
        setSuggestions([]);

        onChange({
            latitude: location.latitude,
            longitude: location.longitude,
            timezone: location.timezone,
            cityName: location.displayName,
        });
    };

    const formatLocationDisplay = (): string => {
        if (selectedLocation) {
            // Always show just "City, Country" format - no "Current Location" text
            return selectedLocation.displayName;
        }
        if (value.latitude && value.longitude) {
            return `Coordinates: ${value.latitude.toFixed(4)}, ${value.longitude.toFixed(4)}`;
        }
        return 'Select your birth location';
    };

    return (
        <View style={pickerStyles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={[
                        styles.searchInput,
                        error && styles.searchInputError,
                        isFocused && styles.searchInputFocused
                    ]}
                    placeholder="Search for your birth city..."
                    value={searchText}
                    onChangeText={setSearchText}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
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
                <Text style={pickerStyles.errorText}>{error}</Text>
            )}

            {isSearching && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#B83330" />
                    <Text style={styles.loadingText}>Searching...</Text>
                </View>
            )}



            {suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    <ScrollView 
                        style={styles.suggestionsList}
                        showsVerticalScrollIndicator={true}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled={true}
                    >
                        {suggestions.map((suggestion, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.suggestionItem,
                                    index === suggestions.length - 1 && styles.suggestionItemLast
                                ]}
                                onPress={() => selectLocation(suggestion)}
                            >
                                <Text style={styles.suggestionName}>{suggestion.name}</Text>
                                <Text style={styles.suggestionCountry}>{suggestion.country}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderWidth: 0.3,
        borderColor: theme.colors.textSecondary,
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: 16,
        fontFamily: theme.typography.fontFamily.light,
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.textPrimary,
    },
    searchInputFocused: {
        borderColor: theme.colors.textSecondary,
        shadowColor: theme.colors.textSecondary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    searchInputError: {
        borderColor: theme.colors.error,
    },
    currentLocationButton: {
        marginLeft: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 0.3,
        borderColor: theme.colors.textSecondary,
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    currentLocationText: {
        fontFamily: theme.typography.fontFamily.light,
        fontSize: theme.typography.fontSize.lg,
        color: theme.colors.textPrimary,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    loadingText: {
        marginLeft: 8,
        fontFamily: theme.typography.fontFamily.light,
        fontSize: theme.typography.fontSize.lg,
        color: theme.colors.textPrimary,
    },
    suggestionsContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 0.3,
        borderColor: theme.colors.textSecondary,
        marginTop: 4,
        marginBottom: 16,
        maxHeight: 240,
        shadowColor: theme.colors.textSecondary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 1000,
        position: 'relative',
    },
    suggestionsList: {
        maxHeight: 240,
    },
    suggestionItem: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    suggestionItemLast: {
        borderBottomWidth: 0,
    },
    suggestionName: {
        fontFamily: theme.typography.fontFamily.light,
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.textPrimary,
    },
    suggestionCountry: {
        fontFamily: theme.typography.fontFamily.light,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textPrimary,
    },
    selectedLocationContainer: {
        backgroundColor: theme.colors.textSecondary, // Soft Gold (light)
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    },
    selectedLocationLabel: {
        fontFamily: theme.typography.fontFamily.light,
        fontSize: theme.typography.fontSize.sm,
        color: '#FFFFFF',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    selectedLocationText: {
        fontFamily: theme.typography.fontFamily.semibold,
        fontSize: theme.typography.fontSize.md,
        color: '#FFFFFF',
        marginBottom: 4,
    },
    timezoneText: {
        fontFamily: theme.typography.fontFamily.light,
        fontSize: theme.typography.fontSize.xs,
        color: '#FFFFFF',
    },
    helpText: {
        fontFamily: theme.typography.fontFamily.light,
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.textTertiary,
    },
});