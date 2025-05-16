import { View, Text, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'expo-router';
import { API } from '../../../api/api';
import { formatTimeRange } from '../../../helper/helper';

const Time = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const path = usePathname();
  const handleEdit = (id) => {
    console.log('Edit time slot:', id);
  };

  const handleDelete = (id) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
  };

  const handleManualAdd = () => {
    setModalVisible(false);
    router.push('/time/Addmanually');
  };

  const handleBulkImport = () => {
    setModalVisible(false);
    router.push('/time/Bulk');
  };

  const handleTimeAvailability = async () => {
    try {
      setLoading(true);
      const response = await API.listOfTimeAvailability();
      console.log("AVAILABILITY", response.data?.available_slots);
      setTimeSlots(response.data?.available_slots || []);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to load time slots");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleTimeAvailability();
  }, [path]);

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{paddingBottom: 40}} className="p-4">
        <View className="flex-row justify-between items-center mb-5">
          <Text className="text-2xl font-bold text-gray-800">Available Time Slots</Text>
          <TouchableOpacity 
            onPress={() => setModalVisible(true)}
            className="bg-blue-500 p-2 rounded-full"
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <Text className="text-center py-4">Loading time slots...</Text>
        ) : timeSlots.length === 0 ? (
          <Text className="text-center py-4">No time slots available</Text>
        ) : (
          timeSlots.map((slot) => (
            <View 
              key={slot.id} 
              className="bg-gray-50 rounded-lg p-4 mb-3 border border-gray-200"
            >
              <View className="flex-row items-center mb-2">
                <Ionicons name="calendar" size={18} color="#4b5563" className="mr-2" />
                <Text className="text-base text-gray-800">{slot.date}</Text>
              </View>
              
              <View className="flex-row items-center mb-3">
                <Ionicons name="time" size={18} color="#4b5563" className="mr-2" />
                <Text className="text-base font-medium text-gray-800">
                  {formatTimeRange(slot.start_time, slot.end_time)}
                </Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <View className="bg-blue-100 px-3 py-1 rounded-full">
                  <Text className="text-blue-800 text-xs">{slot.time_blocks} min blocks</Text>
                </View>
                
                <View className="flex-row">
                  <TouchableOpacity 
                    onPress={() => handleEdit(slot.id)}
                    className="p-2 mr-2"
                  >
                    <Ionicons name="create" size={20} color="#3b82f6" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => handleDelete(slot.id)}
                    className="p-2"
                  >
                    <Ionicons name="trash" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Availability Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg p-6 w-80">
            <Text className="text-xl font-bold text-gray-800 mb-4">Add Availability</Text>
            
            <TouchableOpacity 
              onPress={handleManualAdd}
              className="flex-row items-center p-4 border-b border-gray-200"
            >
              <Ionicons name="create-outline" size={24} color="#3b82f6" className="mr-3" />
              <Text className="text-base text-gray-800">Add Manually</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleBulkImport}
              className="flex-row items-center p-4"
            >
              <Ionicons name="document-attach-outline" size={24} color="#3b82f6" className="mr-3" />
              <Text className="text-base text-gray-800">Bulk Import</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setModalVisible(false)}
              className="mt-4 p-2 bg-gray-100 rounded-lg items-center"
            >
              <Text className="text-gray-600">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Time;