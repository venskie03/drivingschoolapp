import React, { useContext, useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { API } from "../../api/api";
import { useRouter } from "expo-router";
import { AuthenticatedContext } from "../../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Login = () => {
    const router = useRouter();
    const { setIsLoading } = useContext(AuthenticatedContext);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      email: "",
      password: "",
      general: "",
    };

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      valid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await API.loginUserAccount(formData);
      console.log("RESPONSE", response.data);
      if(response.data.status === 'success'){
       setTimeout( async () => {
         router.push('/(tabs)/Home')
        setIsLoading(false);
        await AsyncStorage.setItem('Authorization', response.data.token)
       }, 2000);
      }
    } catch (error) {
      console.log(error);
      if(error.message === 'Invalid password'){
          setErrors((prev) => ({
        ...prev,
        password: error.message,
      }));
      } else {
          setErrors((prev) => ({
        ...prev,
        email: error.message,
      }));
      }
      setIsLoading(false);
    }
  };

  const handleChange = (name, value) => {
    // Clear the error for this field when user types
    setErrors({
      ...errors,
      [name]: "",
      general: "",
    });

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <View className="flex-1 bg-white p-5 justify-center">
      <Text
        style={{
          fontFamily: "PoppinsMedium",
        }}
        className="text-2xl mb-5 text-center text-gray-800"
      >
        Login Account
      </Text>

      {errors.general ? (
        <Text
          style={{
            fontFamily: "PoppinsMedium",
          }}
          className="text-red-500 mb-2"
        >
          {errors.general}
        </Text>
      ) : null}

      <TextInput
        className={`h-12 border ${
          errors.email ? "border-red-500" : "border-gray-300"
        } text-gray-800 rounded px-4 mb-1 bg-white`}
        placeholder="Email"
        value={formData.email}
        placeholderTextColor="#747688"
        onChangeText={(text) => handleChange("email", text)}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{
          fontFamily: "PoppinsMedium",
        }}
      />
      {errors.email ? (
        <Text
          style={{
            fontFamily: "PoppinsMedium",
          }}
          className="text-red-500 mb-2"
        >
          {errors.email}
        </Text>
      ) : null}

      <TextInput
        className={`h-12 border ${
          errors.password ? "border-red-500" : "border-gray-300"
        } text-gray-800 rounded px-4 mb-1 bg-white`}
        placeholder="Password"
        value={formData.password}
        onChangeText={(text) => handleChange("password", text)}
        secureTextEntry
        placeholderTextColor="#747688"
        autoCapitalize="none"
        style={{
          fontFamily: "PoppinsMedium",
        }}
      />
      {errors.password ? (
        <Text
          style={{
            fontFamily: "PoppinsMedium",
          }}
          className="text-red-500 mb-2"
        >
          {errors.password}
        </Text>
      ) : null}

      <TouchableOpacity
        className="bg-blue-600 py-3 rounded items-center mt-2"
        onPress={handleSubmit}
      >
        <Text
          style={{
            fontFamily: "PoppinsMedium",
          }}
          className="text-white font-bold"
        >
          Login
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;
