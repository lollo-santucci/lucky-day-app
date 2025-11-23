/**
 * Birth Info Display Component
 * Displays user's birth information with edit button
 */

import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Text } from './Text';
import { theme } from '../styles';
import { BirthDetails } from '../types/astrology';

interface BirthInfoDisplayProps {
    birthDetails: BirthDetails;
    cityName?: string;
    onEdit: () => void;
}

export const BirthInfoDisplay: React.FC<BirthInfoDisplayProps> = ({
    birthDetails,
    cityName,
    onEdit,
}) => {
    const formatDate = (date: Date | string) => {
        // Ensure date is a Date object
        const dateObj = date instanceof Date ? date : new Date(date);
        const day = dateObj.getDate();
        const month = dateObj.toLocaleString('en-US', { month: 'long' });
        const year = dateObj.getFullYear();
        return { day, month, year };
    };

    const { day, month, year } = formatDate(birthDetails.date);

    return (
        <View style={styles.container}>
            <View style={styles.infoContainer}>
                <Text fontFamily="light" fontSize="md" color="textSecondary">
                    {day} {month} {year}, {cityName?.split(',').splice(0, 1)}
                </Text>
            </View>
            <TouchableOpacity onPress={onEdit} activeOpacity={0.7}>
                <Image
                    source={require('../../assets/icons/edit.png')}
                    style={styles.editIcon}
                    resizeMode="contain"
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: -10,
    },
    infoContainer: {
        // Removed flex: 1 to keep content compact
    },
    editIcon: {
        width: 18,
        height: 18,
        marginLeft: theme.spacing.sm,
    },
});
