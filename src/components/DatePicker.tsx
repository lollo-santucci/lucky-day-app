import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { pickerStyles } from '../styles/pickerStyles';
import { theme } from '@/styles';

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  error?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  error,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Generate years, months, days
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const [selectedYear, setSelectedYear] = useState(value.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(value.getMonth());
  const [selectedDay, setSelectedDay] = useState(value.getDate());

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleConfirm = () => {
    const newDate = new Date(selectedYear, selectedMonth, selectedDay);
    onChange(newDate);
    setShowPicker(false);
    setIsFocused(false);
  };

  const handleCancel = () => {
    // Reset to current value
    setSelectedYear(value.getFullYear());
    setSelectedMonth(value.getMonth());
    setSelectedDay(value.getDate());
    setShowPicker(false);
    setIsFocused(false);
  };

  const showDatePicker = () => {
    // Sync with current value
    setSelectedYear(value.getFullYear());
    setSelectedMonth(value.getMonth());
    setSelectedDay(value.getDate());
    setIsFocused(true);
    setShowPicker(true);
  };

  const daysInSelectedMonth = getDaysInMonth(selectedYear, selectedMonth);
  const days = Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1);

  // Ensure selected day is valid for the selected month/year
  const validDay = Math.min(selectedDay, daysInSelectedMonth);
  if (validDay !== selectedDay) {
    setSelectedDay(validDay);
  }

  return (
    <View style={pickerStyles.container}>
      <TouchableOpacity
        style={[
          pickerStyles.pickerButton,
          error && pickerStyles.pickerButtonError,
          isFocused && pickerStyles.pickerButtonFocused
        ]}
        onPress={showDatePicker}
      >
        <Text style={[pickerStyles.pickerText, error && pickerStyles.pickerTextError]}>
          {formatDate(value)}
        </Text>
        <Text style={pickerStyles.chevron}>›</Text>
      </TouchableOpacity>
      
      {error && (
        <Text style={pickerStyles.errorText}>{error}</Text>
      )}

      <Modal
        visible={showPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={pickerStyles.modalOverlay}>
          <View style={pickerStyles.pickerModal}>
            <View style={pickerStyles.pickerHeader}>
              <TouchableOpacity onPress={handleCancel}>
                <Text style={pickerStyles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={pickerStyles.pickerTitle}>Select Date</Text>
              <TouchableOpacity onPress={handleConfirm}>
                <Text style={pickerStyles.confirmButton}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={pickerStyles.pickerContent}>
              <Text style={pickerStyles.timePreview}>
                {`${months[selectedMonth]} ${selectedDay}, ${selectedYear}`}
              </Text>
              
              <View style={{ flexDirection: 'row', height: 200, marginTop: 20 }}>
                {/* Month Picker */}
                <View style={{ flex: 1, marginRight: 5 }}>
                  <Text style={{ textAlign: 'center', marginBottom: 10, fontWeight: '600', fontSize: 14 }}>Month</Text>
                  <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 60 }}
                  >
                    {months.map((month, index) => (
                      <TouchableOpacity
                        key={month}
                        style={{
                          paddingVertical: 8,
                          alignItems: 'center',
                        }}
                        onPress={() => setSelectedMonth(index)}
                      >
                        <Text style={{
                          fontSize: 16,
                          color: selectedMonth === index ? theme.colors.textPrimary : theme.colors.disabled,
                          fontWeight: selectedMonth === index ? '600' : '400',
                        }}>
                          {month.substring(0, 3)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Day Picker */}
                <View style={{ flex: 1, marginHorizontal: 5 }}>
                  <Text style={{ textAlign: 'center', marginBottom: 10, fontWeight: '600', fontSize: 14 }}>Day</Text>
                  <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 60 }}
                  >
                    {days.map((day) => (
                      <TouchableOpacity
                        key={day}
                        style={{
                          paddingVertical: 8,
                          alignItems: 'center',
                        }}
                        onPress={() => setSelectedDay(day)}
                      >
                        <Text style={{
                          fontSize: 16,
                          color: selectedDay === day ? theme.colors.textPrimary : theme.colors.disabled,
                          fontWeight: selectedDay === day ? '600' : '400',
                        }}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Year Picker */}
                <View style={{ flex: 1, marginLeft: 5 }}>
                  <Text style={{ textAlign: 'center', marginBottom: 10, fontWeight: '600', fontSize: 14 }}>Year</Text>
                  <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 60 }}
                  >
                    {years.map((year) => (
                      <TouchableOpacity
                        key={year}
                        style={{
                          paddingVertical: 8,
                          alignItems: 'center',
                        }}
                        onPress={() => setSelectedYear(year)}
                      >
                        <Text style={{
                          fontSize: 16,
                          color: selectedYear === year ? theme.colors.textPrimary : theme.colors.disabled,
                          fontWeight: selectedYear === year ? '600' : '400',
                        }}>
                          {year}
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