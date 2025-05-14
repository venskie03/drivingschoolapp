import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API } from '../../api/api';
import { useEffect, useState } from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from 'expo-router';

const Student = () => {
    const [bookingList, setBookingList] = useState([]);
    const router = useRouter();

    // Function to calculate duration between start and end time
    const calculateDuration = (startTime, endTime) => {
        // Remove seconds if present
        const cleanStart = startTime.split(':').slice(0, 2).join(':');
        const cleanEnd = endTime.split(':').slice(0, 2).join(':');
        
        const [startHours, startMinutes] = cleanStart.split(':').map(Number);
        const [endHours, endMinutes] = cleanEnd.split(':').map(Number);
        
        let totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
        
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    };

    // Format date to be more readable
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Icon and color based on status
    const getStatusDetails = (status) => {
        switch (status) {
            case 'confirmed':
                return { icon: 'checkmark-circle', color: 'green' };
            case 'pending':
                return { icon: 'time', color: 'orange' };
            case 'completed':
                return { icon: 'checkmark-done', color: 'blue' };
            case 'cancelled':
                return { icon: 'close-circle', color: 'red' };
            case 'scheduled':
                return { icon: 'calendar', color: 'purple' };
            default:
                return { icon: 'help-circle', color: 'gray' };
        }
    };

    const getCurrentBookings = async () => {
        try {
            const response = await API.currentUserLesson();
            console.log("MY LESSONS", response.data);
            setBookingList(response.data.lessons || []);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getCurrentBookings();
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="p-4">
                <View className="flex-row justify-between mb-3">
                    <Text className="text-2xl font-bold mb-4">My Bookings</Text>
                     <TouchableOpacity 
                     onPress={()=>  router.push('/home/Addbooking')}
            className="bg-blue-500 p-2 rounded-full"
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
                </View>
                
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 40}}>
                    {bookingList.map((lesson) => {
                        const statusDetails = getStatusDetails(lesson.status);
                        const duration = calculateDuration(lesson.start_time, lesson.end_time);
                        const formattedDate = formatDate(lesson.lesson_date);
                        
                        return (
                            <View 
                                key={lesson.id} 
                                className="border border-gray-200 rounded-lg p-4 mb-3 shadow-sm"
                            >
                                <View className="flex-row justify-between items-start mb-2">
                                    <Text className="text-lg font-semibold flex-1">Lesson Title</Text>
                                    <Ionicons 
                                        name={statusDetails.icon} 
                                        size={24} 
                                        color={statusDetails.color} 
                                    />
                                </View>
                                
                                <View className="flex-row items-center mb-1">
                                    <Ionicons name="person" size={16} color="gray" />
                                    <Text className="ml-2 text-gray-600">Kevin</Text>
                                </View>
                                
                                <View className="flex-row items-center mb-1">
                                    <Ionicons name="calendar" size={16} color="gray" />
                                    <Text className="ml-2 text-gray-600">
                                        {formattedDate} • {lesson.start_time}-{lesson.end_time}
                                    </Text>
                                </View>

                                  <View className="flex-row items-center mb-1">
                                  <AntDesign name="clockcircle" size={16} color="gray" />
                                    <Text className="ml-2 text-gray-600">
                                        {duration}
                                    </Text>
                                </View>
                                
                                <View className="flex-row justify-between items-center mt-3">
                                    <TouchableOpacity className="bg-blue-100 px-3 py-1 rounded-full">
                                        <Text className="text-blue-800 text-sm">View Details</Text>
                                    </TouchableOpacity>
                                    
                                    <Text 
                                        className={`text-xs font-medium px-2 py-1 rounded-full 
                                            ${lesson.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                                            ${lesson.status === 'pending' ? 'bg-orange-100 text-orange-800' : ''}
                                            ${lesson.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
                                            ${lesson.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                                            ${lesson.status === 'scheduled' ? 'bg-purple-100 text-purple-800' : ''}
                                        `}
                                    >
                                        {lesson.status.charAt(0).toUpperCase() + lesson.status.slice(1)}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default Student;