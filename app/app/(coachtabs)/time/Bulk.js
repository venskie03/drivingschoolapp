import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { API } from '../../../api/api';

const Bulk = () => {
  const [formData, setFormData] = useState({
    start_time: new Date(),
    end_time: new Date(),
    break_start: new Date(),
    break_end: new Date(),
    start_date: new Date(),
    end_date: new Date(),
    time_blocks: '50'
  });

  const [selectedDays, setSelectedDays] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false
  });

  const [showPicker, setShowPicker] = useState({
    start_date: false,
    end_date: false,
    start_time: false,
    end_time: false,
    break_start: false,
    break_end: false
  });

  const daysOfWeek = [
    { id: 'monday', label: 'Mon' },
    { id: 'tuesday', label: 'Tue' },
    { id: 'wednesday', label: 'Wed' },
    { id: 'thursday', label: 'Thu' },
    { id: 'friday', label: 'Fri' },
    { id: 'saturday', label: 'Sat' },
    { id: 'sunday', label: 'Sun' }
  ];

  const toggleDay = (dayId) => {
    setSelectedDays({
      ...selectedDays,
      [dayId]: !selectedDays[dayId]
    });
  };

  const handleTimeChange = (event, selectedDate, field) => {
    setShowPicker({...showPicker, [field]: false});
    if (selectedDate) {
      setFormData({...formData, [field]: selectedDate});
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatAPITime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const generateTimeSlots = () => {
    const slots = [];
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    
    // Validate dates
    if (startDate > endDate) {
      Alert.alert("Error", "End date must be after start date");
      return [];
    }

    // Check if at least one day is selected
    if (!Object.values(selectedDays).includes(true)) {
      Alert.alert("Error", "Please select at least one day of the week");
      return [];
    }

    // Generate slots for each day in range
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      if (selectedDays[dayName]) {
        slots.push({
          start_time: formatAPITime(formData.start_time),
          end_time: formatAPITime(formData.end_time),
          break_start: formatAPITime(formData.break_start),
          break_end: formatAPITime(formData.break_end),
          date: formatDate(date),
          time_blocks: formData.time_blocks
        });
      }
    }

    return slots;
  };

  const handleSubmit = async () => {
    const timeSlots = generateTimeSlots();
    
    if (timeSlots.length === 0) return;

    console.log('Submitting bulk time slots:', timeSlots);
    
    try {
      const response = await API.createTimeSlotsCoach(timeSlots);
      console.log("Bulk Response:", response.data);
      Alert.alert("Success", `${timeSlots.length} time slots created successfully`);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", error.message || "Failed to create time slots");
    }
  };

  return (
    <ScrollView contentContainerStyle={{paddingBottom: 30}} className="bg-white p-4">
      <Text className="text-2xl font-bold text-gray-800 mb-6">Bulk Add Time Slots</Text>

      {/* Start Date */}
      <View className="mb-5">
        <Text className="text-gray-700 mb-2">Start Date</Text>
        <TouchableOpacity 
          className="flex-row items-center border border-gray-300 rounded-lg p-3"
          onPress={() => setShowPicker({...showPicker, start_date: true})}
        >
          <Ionicons name="calendar" size={20} color="#4b5563" className="mr-2" />
          <Text>{formatDate(formData.start_date)}</Text>
        </TouchableOpacity>
        {showPicker.start_date && (
          <DateTimePicker
            value={formData.start_date}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(event, date) => handleTimeChange(event, date, 'start_date')}
          />
        )}
      </View>

      {/* End Date */}
      <View className="mb-5">
        <Text className="text-gray-700 mb-2">End Date</Text>
        <TouchableOpacity 
          className="flex-row items-center border border-gray-300 rounded-lg p-3"
          onPress={() => setShowPicker({...showPicker, end_date: true})}
        >
          <Ionicons name="calendar" size={20} color="#4b5563" className="mr-2" />
          <Text>{formatDate(formData.end_date)}</Text>
        </TouchableOpacity>
        {showPicker.end_date && (
          <DateTimePicker
            value={formData.end_date}
            mode="date"
            display="default"
            minimumDate={formData.start_date}
            onChange={(event, date) => handleTimeChange(event, date, 'end_date')}
          />
        )}
      </View>

      {/* Days of Week Selection */}
    <View className="mb-5">
        <Text className="text-gray-700 mb-2">Repeat On</Text>
        <View className="flex-row justify-between mb-3">
          {daysOfWeek.map((day) => (
            <TouchableOpacity
              key={day.id}
              onPress={() => toggleDay(day.id)}
              className={`w-10 h-10 rounded-full items-center justify-center ${
                selectedDays[day.id] ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            >
              <Text className={`${
                selectedDays[day.id] ? 'text-white' : 'text-gray-800'
              }`}>
                {day.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Start Time */}
      <View className="mb-5">
        <Text className="text-gray-700 mb-2">Start Time</Text>
        <TouchableOpacity 
          className="flex-row items-center border border-gray-300 rounded-lg p-3"
          onPress={() => setShowPicker({...showPicker, start_time: true})}
        >
          <Ionicons name="time" size={20} color="#4b5563" className="mr-2" />
          <Text>{formatTime(formData.start_time)}</Text>
        </TouchableOpacity>
        {showPicker.start_time && (
          <DateTimePicker
            value={formData.start_time}
            mode="time"
            display="default"
            onChange={(event, time) => handleTimeChange(event, time, 'start_time')}
          />
        )}
      </View>

      {/* End Time */}
      <View className="mb-5">
        <Text className="text-gray-700 mb-2">End Time</Text>
        <TouchableOpacity 
          className="flex-row items-center border border-gray-300 rounded-lg p-3"
          onPress={() => setShowPicker({...showPicker, end_time: true})}
        >
          <Ionicons name="time" size={20} color="#4b5563" className="mr-2" />
          <Text>{formatTime(formData.end_time)}</Text>
        </TouchableOpacity>
        {showPicker.end_time && (
          <DateTimePicker
            value={formData.end_time}
            mode="time"
            display="default"
            onChange={(event, time) => handleTimeChange(event, time, 'end_time')}
          />
        )}
      </View>

      {/* Break Start Time */}
      <View className="mb-5">
        <Text className="text-gray-700 mb-2">Break Start Time</Text>
        <TouchableOpacity 
          className="flex-row items-center border border-gray-300 rounded-lg p-3"
          onPress={() => setShowPicker({...showPicker, break_start: true})}
        >
          <Ionicons name="time" size={20} color="#4b5563" className="mr-2" />
          <Text>{formatTime(formData.break_start)}</Text>
        </TouchableOpacity>
        {showPicker.break_start && (
          <DateTimePicker
            value={formData.break_start}
            mode="time"
            display="default"
            onChange={(event, time) => handleTimeChange(event, time, 'break_start')}
          />
        )}
      </View>

      {/* Break End Time */}
      <View className="mb-5">
        <Text className="text-gray-700 mb-2">Break End Time</Text>
        <TouchableOpacity 
          className="flex-row items-center border border-gray-300 rounded-lg p-3"
          onPress={() => setShowPicker({...showPicker, break_end: true})}
        >
          <Ionicons name="time" size={20} color="#4b5563" className="mr-2" />
          <Text>{formatTime(formData.break_end)}</Text>
        </TouchableOpacity>
        {showPicker.break_end && (
          <DateTimePicker
            value={formData.break_end}
            mode="time"
            display="default"
            onChange={(event, time) => handleTimeChange(event, time, 'break_end')}
          />
        )}
      </View>

      {/* Time Blocks */}
      <View className="mb-5">
        <Text className="text-gray-700 mb-2">Time Blocks (minutes)</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3"
          keyboardType="numeric"
          value={formData.time_blocks}
          onChangeText={(text) => setFormData({...formData, time_blocks: text})}
          placeholder="e.g., 50"
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        className="bg-blue-500 p-4 rounded-lg items-center"
        onPress={handleSubmit}
      >
        <Text className="text-white font-bold">Create Time Slots</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Bulk;