import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { pickerStyles } from '../styles/pickerStyles';

interface TimePickerProps {
  value: string | null;
  onChange: (time: string | null) => void;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const timeUnknown = value === null;

  // Generate hours and minutes arrays
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const [selectedHour, setSelectedHour] = useState(() => {
    if (value) {
      const [h] = value.split(':');
      return parseInt(h, 10);
    }
    return 12;
  });

  const [selectedMinute, setSelectedMinute] = useState(() => {
    if (value) {
      const [, m] = value.split(':');
      return parseInt(m, 10);
    }
    return 0;
  });

  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDisplayTime = (hour: number, minute: number): string => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${ampm}`;
  };

  const handleTimeConfirm = () => {
    const timeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    onChange(timeString);
    setShowPicker(false);
    setIsFocused(false);
  };

  const handleTimeCancel = () => {
    // Reset to current value
    if (value) {
      const [h, m] = value.split(':');
      setSelectedHour(parseInt(h, 10));
      setSelectedMinute(parseInt(m, 10));
    }
    setShowPicker(false);
    setIsFocused(false);
  };

  const showTimePicker = () => {
    // Always sync from current value when opening
    if (timeUnknown) {
      setSelectedHour(12);
      setSelectedMinute(0);
      onChange('12:00');
    } else if (value) {
      const [h, m] = value.split(':');
      setSelectedHour(parseInt(h, 10));
      setSelectedMinute(parseInt(m, 10));
    }

    setIsFocused(true);
    setShowPicker(true);
  };

  const toggleTimeUnknown = () => {
    if (timeUnknown) {
      setSelectedHour(12);
      setSelectedMinute(0);
      onChange('12:00');
    } else {
      onChange(null);
      setShowPicker(false);
      setIsFocused(false);
    }
  };

  return (
    <View style={pickerStyles.container}>
      <TouchableOpacity
        style={[
          pickerStyles.pickerButton,
          timeUnknown && pickerStyles.pickerButtonDisabled,
          isFocused && pickerStyles.pickerButtonFocused
        ]}
        onPress={showTimePicker}
        disabled={timeUnknown}
      >
        <Text style={[pickerStyles.pickerText, timeUnknown && pickerStyles.pickerTextDisabled]}>
          {timeUnknown ? 'Time Unknown (will use noon)' : formatTime(value || '12:00')}
        </Text>
        {!timeUnknown && <Text style={pickerStyles.chevron}>›</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={[pickerStyles.unknownToggle, { marginTop: 12 }]}
        onPress={toggleTimeUnknown}
      >
        <View style={[pickerStyles.checkbox, timeUnknown && pickerStyles.checkboxChecked]}>
          {timeUnknown && <Text style={pickerStyles.checkmark}>✓</Text>}
        </View>
        <Text style={pickerStyles.unknownText}>I don't know my birth time</Text>
      </TouchableOpacity>

      <Modal
        visible={showPicker && !timeUnknown}
        transparent={true}
        animationType="slide"
        onRequestClose={handleTimeCancel}
      >
        <View style={pickerStyles.modalOverlay}>
          <View style={pickerStyles.pickerModal}>
            <View style={pickerStyles.pickerHeader}>
              <TouchableOpacity onPress={handleTimeCancel}>
                <Text style={pickerStyles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={pickerStyles.pickerTitle}>Select Time</Text>
              <TouchableOpacity onPress={handleTimeConfirm}>
                <Text style={pickerStyles.confirmButton}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={pickerStyles.pickerContent}>
              <Text style={pickerStyles.timePreview}>
                {formatDisplayTime(selectedHour, selectedMinute)}
              </Text>

              <View style={{ flexDirection: 'row', height: 200, marginTop: 20 }}>
                {/* Hours Picker */}
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={{ textAlign: 'center', marginBottom: 10, fontWeight: '600', fontSize: 14 }}>Hour</Text>
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 60 }}
                  >
                    {hours.map((hour) => (
                      <TouchableOpacity
                        key={hour}
                        style={{
                          paddingVertical: 8,
                          alignItems: 'center',
                        }}
                        onPress={() => setSelectedHour(hour)}
                      >
                        <Text style={{
                          fontSize: 16,
                          color: selectedHour === hour ? '#222222' : '#CCCCCC',
                          fontWeight: selectedHour === hour ? '600' : '400',
                        }}>
                          {hour.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <Text style={{ fontSize: 20, color: '#222222', marginHorizontal: 10, alignSelf: 'center' }}>:</Text>

                {/* Minutes Picker */}
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ textAlign: 'center', marginBottom: 10, fontWeight: '600', fontSize: 14 }}>Minute</Text>
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 60 }}
                  >
                    {minutes.filter(m => m % 5 === 0).map((minute) => (
                      <TouchableOpacity
                        key={minute}
                        style={{
                          paddingVertical: 8,
                          alignItems: 'center',
                        }}
                        onPress={() => setSelectedMinute(minute)}
                      >
                        <Text style={{
                          fontSize: 16,
                          color: selectedMinute === minute ? '#222222' : '#CCCCCC',
                          fontWeight: selectedMinute === minute ? '600' : '400',
                        }}>
                          {minute.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};