import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // or any other icon library you prefer

const Coach = () => {
  // Sample booking data
  const bookings = [
    {
      id: 1,
      title: 'Yoga Class',
      instructor: 'Sarah Johnson',
      date: '2023-06-15',
      time: '09:00 AM',
      duration: '60 mins',
      status: 'confirmed',
    },
    {
      id: 2,
      title: 'Pilates Session',
      instructor: 'Michael Chen',
      date: '2023-06-16',
      time: '02:30 PM',
      duration: '45 mins',
      status: 'pending',
    },
    {
      id: 3,
      title: 'Swimming Lesson',
      instructor: 'David Wilson',
      date: '2023-06-17',
      time: '10:00 AM',
      duration: '30 mins',
      status: 'completed',
    },
    {
      id: 4,
      title: 'Tennis Coaching',
      instructor: 'Emma Thompson',
      date: '2023-06-18',
      time: '04:00 PM',
      duration: '90 mins',
      status: 'cancelled',
    },
    {
      id: 5,
      title: 'Boxing Training',
      instructor: 'James Rodriguez',
      date: '2023-06-19',
      time: '06:00 PM',
      duration: '60 mins',
      status: 'confirmed',
    },
  ];

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
      default:
        return { icon: 'help-circle', color: 'gray' };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-4">My Bookings</Text>
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 40}}>
          {bookings.map((booking) => {
            const statusDetails = getStatusDetails(booking.status);
            
            return (
              <View 
                key={booking.id} 
                className="border border-gray-200 rounded-lg p-4 mb-3 shadow-sm"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-lg font-semibold flex-1">{booking.title}</Text>
                  <Ionicons 
                    name={statusDetails.icon} 
                    size={24} 
                    color={statusDetails.color} 
                  />
                </View>
                
                <View className="flex-row items-center mb-1">
                  <Ionicons name="person" size={16} color="gray" />
                  <Text className="ml-2 text-gray-600">{booking.instructor}</Text>
                </View>
                
                <View className="flex-row items-center mb-1">
                  <Ionicons name="calendar" size={16} color="gray" />
                  <Text className="ml-2 text-gray-600">
                    {booking.date} • {booking.time} • {booking.duration}
                  </Text>
                </View>
                
                <View className="flex-row justify-between items-center mt-3">
                  <TouchableOpacity className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-blue-800 text-sm">View Details</Text>
                  </TouchableOpacity>
                  
                  <Text 
                    className={`text-xs font-medium px-2 py-1 rounded-full 
                      ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                      ${booking.status === 'pending' ? 'bg-orange-100 text-orange-800' : ''}
                      ${booking.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
                      ${booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                    `}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
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

export default Coach;