import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface TimePickerProps {
  value: string | null;
  onChange: (time: string | null) => void;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [timeUnknown, setTimeUnknown] = useState(value === null);

  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const parseTimeString = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    return date;
  };

  const formatTimeToString = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedTime) {
      const timeString = formatTimeToString(selectedTime);
      onChange(timeString);
    }
  };

  const showTimePicker = () => {
    if (timeUnknown) {
      // If time was unknown, set it to noon as default
      onChange('12:00');
      setTimeUnknown(false);
    }
    setShowPicker(true);
  };

  const hideTimePicker = () => {
    setShowPicker(false);
  };

  const toggleTimeUnknown = () => {
    if (timeUnknown) {
      // Set to noon as default when enabling time
      onChange('12:00');
      setTimeUnknown(false);
    } else {
      // Clear time when marking as unknown
      onChange(null);
      setTimeUnknown(true);
    }
  };

  const currentTime = value ? parseTimeString(value) : new Date();
  currentTime.setHours(12, 0, 0, 0); // Default to noon

  return (
    <View style={styles.container}>
      <View style={styles.timeSection}>
        <TouchableOpacity
          style={[styles.timeButton, timeUnknown && styles.timeButtonDisabled]}
          onPress={showTimePicker}
          disabled={timeUnknown}
        >
          <Text style={[styles.timeText, timeUnknown && styles.timeTextDisabled]}>
            {timeUnknown ? 'Time Unknown (will use noon)' : formatTime(value || '12:00')}
          </Text>
          {!timeUnknown && <Text style={styles.chevron}>›</Text>}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.unknownToggle}
        onPress={toggleTimeUnknown}
      >
        <View style={[styles.checkbox, timeUnknown && styles.checkboxChecked]}>
          {timeUnknown && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.unknownText}>I don't know my birth time</Text>
      </TouchableOpacity>

      {showPicker && !timeUnknown && (
        <>
          {Platform.OS === 'ios' && (
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={hideTimePicker}>
                  <Text style={styles.pickerButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={currentTime}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                style={styles.picker}
              />
            </View>
          )}
          
          {Platform.OS === 'android' && (
            <DateTimePicker
              value={currentTime}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  timeSection: {
    marginBottom: 12,
  },
  timeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  timeButtonDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#CCCCCC',
  },
  timeText: {
    fontSize: 16,
    color: '#222222', // Ink Black
  },
  timeTextDisabled: {
    color: '#888888',
  },
  chevron: {
    fontSize: 20,
    color: '#CCCCCC',
    transform: [{ rotate: '90deg' }],
  },
  unknownToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#B83330', // Jade Red
    borderColor: '#B83330',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  unknownText: {
    fontSize: 14,
    color: '#666666',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  pickerButton: {
    color: '#B83330', // Jade Red
    fontSize: 16,
    fontWeight: '600',
  },
  picker: {
    backgroundColor: '#FFFFFF',
  },
});