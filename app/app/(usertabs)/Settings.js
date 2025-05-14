import { View, Text, TouchableOpacity } from 'react-native'
import React, { useContext } from 'react'
import { AuthenticatedContext } from '../../context/AuthContext'

const Settings = () => {
  const { handleLogoutUser } = useContext(AuthenticatedContext)
  return (
    <View>
      <Text>Settings</Text>
      <TouchableOpacity onPress={()=> handleLogoutUser()} className="bg-red-600 text-white p-4 flex-row justify-center items-center rounded-md"><Text className="text-white">Logout</Text></TouchableOpacity>
    </View>
  )
}

export default Settings