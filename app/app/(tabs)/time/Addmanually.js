import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { API } from '../../../api/api';

const AddManually = () => {
  const [formData, setFormData] = useState({
    start_time: new Date(),
    end_time: new Date(),
    break_start: new Date(),
    break_end: new Date(),
    date: new Date(),
    time_blocks: '50'
  });

  const [showPicker, setShowPicker] = useState({
    date: false,
    start_time: false,
    end_time: false,
    break_start: false,
    break_end: false
  });

  const handleTimeChange = (event, selectedDate, field) => {
    setShowPicker({...showPicker, [field]: false});
    if (selectedDate) {
      setFormData({...formData, [field]: selectedDate});
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Fixed date formatting to display correctly
  const formatDisplayDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatAPIDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const handleSubmit = async () => {
    const jsonData = [{
      start_time: formData.start_time.toTimeString().split(' ')[0],
      end_time: formData.end_time.toTimeString().split(' ')[0],
      break_start: formData.break_start.toTimeString().split(' ')[0],
      break_end: formData.break_end.toTimeString().split(' ')[0],
      recurrence: 'manually',
      date: formatAPIDate(formData.date), // Using correct format for API
      time_blocks: formData.time_blocks
    }];
    
    console.log('Submitting date:', jsonData); // Debug log
    
    try {
      const response = await API.createTimeSlotsCoach(jsonData);
      console.log("RESPONSE MANUAL", response.data);
      Alert.alert("Success", "Time slot created successfully");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", error.message || "Failed to create time slot");
    }
  };

  return (
    <ScrollView contentContainerStyle={{paddingBottom: 30}} className="bg-white p-4">
      <Text className="text-2xl font-bold text-gray-800 mb-6">Add Time Slot</Text>

      {/* Date Picker - Now shows correct date */}
      <View className="mb-5">
        <Text className="text-gray-700 mb-2">Date</Text>
        <TouchableOpacity 
          className="flex-row items-center border border-gray-300 rounded-lg p-3"
          onPress={() => setShowPicker({...showPicker, date: true})}
        >
          <Ionicons name="calendar" size={20} color="#4b5563" className="mr-2" />
          <Text>{formatDisplayDate(formData.date)}</Text>
        </TouchableOpacity>
        {showPicker.date && (
          <DateTimePicker
            value={formData.date}
            mode="date"
            display="default"
            onChange={(event, date) => {
              console.log('Selected date:', date); // Debug log
              handleTimeChange(event, date, 'date');
            }}
          />
        )}
      </View>

      {/* Other form fields remain the same */}
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
        <Text className="text-white font-bold">Save Time Slot</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddManually;