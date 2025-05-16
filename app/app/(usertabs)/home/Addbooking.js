import { View, Text, ScrollView, TouchableOpacity, Modal, FlatList, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { API } from "../../../api/api";
import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { formatTimeRange } from "../../../helper/helper";

const AddBooking = () => {
  const [coaches, setCoaches] = useState([]);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null); // New state for selected time

  const fetchListOfCoaches = async () => {
    try {
      const response = await API.coachList();
      setCoaches(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchListOfCoaches();
  }, []);

  const addCoachToFavorite = async (uid) => {
    try {
      const response = await API.createFavoriteCoach({coach_uid: uid});
      Alert.alert(`${response.data.message}`)
      fetchListOfCoaches();
    } catch (error) {
      console.log(error)
      Alert.alert(`${error.message}`)
    }
  }

    const deleteCoachToFavorite = async (uid) => {
    try {
      const response = await API.deleteFavoriteCoach({coach_uid: uid});
      Alert.alert(`${response.data.message}`)
      fetchListOfCoaches();
    } catch (error) {
      console.log(error)
      Alert.alert(`${error.message}`)
    }
  }

  const handleContinueSelectedCoach = async () => {
    try {
      const response = await API.coachAvailableTimeDate({ coach_uid: selectedCoach.uid });
      setAvailableSlots(response.data.available_slots);
      setShowDateModal(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDateSelection = (date) => {
    const selectedSlot = availableSlots.find(slot => slot.date === date);
    if (selectedSlot) {
      setSelectedDate(date);
      setTimeSlots(selectedSlot.available_booking_times);
      setSelectedTimeSlot(null); // Reset selected time when changing date
      setShowDateModal(false);
      setShowTimeModal(true);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedTimeSlot) return;

    const body = {
        coach_uid: selectedCoach.uid,
        start_time: selectedTimeSlot.booking_time_start,
        end_time: selectedTimeSlot.booking_time_end,
        date: selectedDate,
        status: 'pending'
      }
    
    try {
      // Here you would call your booking API
      console.log("Confirming booking for:", body );
      
     const response = await API.bookALesson(body);
     console.log("BOOKING RESPONSE", response.data)
       setShowTimeModal(false);
        fetchListOfCoaches();
        Alert.alert(`${response.data.message}`)
    } catch (error) {
      console.error("Booking error:", error);
         Alert.alert(`${error.message}`)
    }
  };

  const renderDateItem = ({ item }) => (
    <TouchableOpacity
      className="bg-white p-4 rounded-lg mb-3 shadow-sm"
      onPress={() => handleDateSelection(item.date)}
    >
      <Text className="text-lg font-semibold text-gray-800">
        {new Date(item.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </Text>
      <Text className="text-sm text-gray-500 mt-1">
        {item.available_booking_times.length} available slots
      </Text>
    </TouchableOpacity>
  );

  const renderTimeSlot = ({ item }) => (
    <TouchableOpacity
      className={`bg-white p-4 rounded-lg mb-3 shadow-sm ${
        selectedTimeSlot?.booking_time_start === item.booking_time_start && 
        selectedTimeSlot?.booking_time_end === item.booking_time_end
          ? 'border-2 border-blue-500' 
          : ''
      }`}
      onPress={() => {
        setSelectedTimeSlot(item);
      }}
    >
      <Text className="text-lg font-semibold text-gray-800">
        {formatTimeRange(item.booking_time_start, item.booking_time_end)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 p-5 bg-gray-50">
      <Text className="text-2xl font-bold mb-5 text-gray-800">Select a Coach</Text>
      
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {coaches?.map((coach) => (
          <TouchableOpacity
            key={coach.uid}
            className={`flex-row items-center bg-white relative rounded-xl p-4 mb-3 shadow-sm 
            ${selectedCoach?.uid === coach.uid ? 'border-2 border-blue-500' : ''}`}
            onPress={() => setSelectedCoach(coach)}
            activeOpacity={0.7}
          >
            <View className="mr-4">
              <Ionicons name="person-circle" size={40} color="#4f46e5" />
            </View>

           {coach.is_favorite ?  <TouchableOpacity onPress={()=> deleteCoachToFavorite(coach.uid)} className="absolute top-3 right-4">
              <MaterialIcons name="favorite" size={17} color="black" />
            </TouchableOpacity> :  <TouchableOpacity onPress={()=> addCoachToFavorite(coach.uid)} className="absolute top-3 right-4">
              <MaterialIcons name="favorite-border" size={17} color="black" />
            </TouchableOpacity>}
            
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-800 mb-1">
                {coach.first_name} {coach.last_name}
              </Text>
              <View className="flex-row items-center mb-1">
                <Ionicons name="mail" size={16} color="#666" />
                <Text className="text-sm text-gray-600 ml-2">{coach.email}</Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="person" size={16} color="#666" />
                <Text className="text-sm text-gray-600 ml-2 capitalize">{coach.role}</Text>
              </View>
            </View>
            
            {selectedCoach?.uid === coach.uid && (
              <View className="ml-2">
                <Ionicons name="checkmark-circle" size={24} color="#4f46e5" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedCoach && (
        <TouchableOpacity 
          className="flex-row items-center justify-center bg-blue-500 py-4 rounded-xl mt-3"
          activeOpacity={0.8}
          onPress={handleContinueSelectedCoach}
        >
          <Text className="text-white font-bold mr-2">
            Continue with {selectedCoach.first_name}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      )}

      {/* Date Selection Modal */}
      <Modal
        visible={showDateModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowDateModal(false)}
      >
        <View className="flex-1 p-5 bg-gray-50">
          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-2xl font-bold text-gray-800">Available Dates</Text>
            <TouchableOpacity onPress={() => setShowDateModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={availableSlots}
            renderItem={renderDateItem}
            keyExtractor={(item) => item.date}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      </Modal>

      {/* Time Slot Selection Modal */}
      <Modal
        visible={showTimeModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowTimeModal(false)}
      >
        <View className="flex-1 p-5 bg-gray-50">
          <View className="flex-row items-center justify-between mb-5">
            <View>
              <Text className="text-2xl font-bold text-gray-800">Available Times</Text>
              <Text className="text-gray-600">
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowTimeModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={timeSlots}
            renderItem={renderTimeSlot}
            keyExtractor={(item, index) => `${item.booking_time_start}-${index}`}
            contentContainerStyle={{ paddingBottom: 80 }} // Added extra padding for the button
          />
          
          {/* Confirmation Button */}
          <View className="absolute bottom-5 left-5 right-5">
            <TouchableOpacity
              className={`flex-row items-center justify-center py-4 rounded-xl ${
                selectedTimeSlot ? 'bg-blue-500' : 'bg-gray-400'
              }`}
              activeOpacity={0.8}
                onPress={()=> handleConfirmBooking(false)}
              disabled={!selectedTimeSlot}
            >
              <Text className="text-white font-bold mr-2">
                Confirm Booking
              </Text>
              <Ionicons name="checkmark-circle" size={20} color="white" />
            </TouchableOpacity>
             {/* <TouchableOpacity
              className={`flex-row items-center justify-center py-4 mt-2 rounded-xl ${
                selectedTimeSlot ? 'bg-green-500' : 'bg-gray-400'
              }`}
              activeOpacity={0.8}
              onPress={()=> handleConfirmBooking(true)}
              disabled={!selectedTimeSlot}
            >
              <Text className="text-white font-bold mr-2">
                Pay Booking
              </Text>
              <Ionicons name="checkmark-circle" size={20} color="white" />
            </TouchableOpacity> */}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AddBooking;