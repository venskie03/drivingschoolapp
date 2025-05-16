import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API } from '../../api/api';
import { useEffect, useState } from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import { usePathname, useRouter } from 'expo-router';
import { calculateDuration, formatDate, formatTimeRange, getStatusDetails } from '../../helper/helper';

const Coach = () => {
    const [bookingList, setBookingList] = useState([]);
    const router = useRouter();
    const path = usePathname();


    const getCurrentBookings = async () => {
        try {
            const response = await API.currentUserLesson();
            setBookingList(response.data.lessons || []);
            console.log("COACH BOOKINGS", response.data.lessons)
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getCurrentBookings();
    }, [path]);


    const handleCancelLesson = async (lesson_id) => {
        try {
            const body = {
  "lesson_id": lesson_id,    
}

            const response = await API.coachCancelLesson(body);
            console.log("RESPONSE CANACEL", response.data)
            getCurrentBookings();
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="p-4">
                <View className="flex-row justify-between mb-3">
                    <Text className="text-2xl font-bold mb-4">My Bookings</Text>
                </View>
   
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 40}}>
                    {bookingList.length > 0 ? bookingList.map((lesson) => {
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
                                    <Text className="ml-2 text-gray-600">{lesson?.student_info?.first_name}</Text>
                                </View>
                                
                                <View className="flex-row items-center mb-1">
                                    <Ionicons name="calendar" size={16} color="gray" />
                                    <Text className="ml-2 text-gray-600">
                                        {formattedDate} • {formatTimeRange(lesson.start_time, lesson.end_time)}
                                    </Text>
                                </View>

                                  <View className="flex-row items-center mb-1">
                                  <AntDesign name="clockcircle" size={16} color="gray" />
                                    <Text className="ml-2 text-gray-600">
                                        {duration}
                                    </Text>
                                </View>
                                
                                <View className="flex-row justify-between items-center mt-3">
                                         
                                    <Text 
                                        className={`text-xs font-medium px-2 py-1 rounded-full 
                                            ${lesson.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                                            ${lesson.status === 'pending' ? 'bg-orange-100 text-orange-800' : ''}
                                            ${lesson.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
                                            ${lesson.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                                            ${lesson.status === 'schedule' ? 'bg-purple-100 text-purple-800' : ''}
                                        `}
                                    >
                                        {lesson.status.charAt(0).toUpperCase() + lesson.status.slice(1)}
                                    </Text>

                                  <View className="flex-row gap-2">
                                      {/* <TouchableOpacity className="bg-blue-100 px-3 py-1 rounded-full">
                                        <Text className="text-blue-800 text-sm">View Details</Text>
                                    </TouchableOpacity> */}
                                      {lesson.status === 'pending' && (<TouchableOpacity onPress={()=> handleCancelLesson(lesson.id)} className="bg-red-400 px-3 py-1  rounded-full">
                                        <Text className=" text-sm text-white">Cancel</Text>
                                    </TouchableOpacity>)}
                                  </View>
                               
                                </View>
                            </View>
                        );
                    }) : <Text className="text-gray-400">No Bookings</Text>}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default Coach;