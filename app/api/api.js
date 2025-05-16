import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AuthenticationAPI, CoachesAPI, InvoiceAPI, LessonsAPI } from '../constant/endpoint';

const baseURL = 'http://192.168.0.113:3000/api'

const api = async (
  endpoint,
  method,
  body,
  params
) => {
  const token = await AsyncStorage.getItem('Authorization');
  const isFormData = body instanceof FormData;

  console.log('api params with id', params);

  const url = endpoint.replace(/:\w+/g, (match) => {
    const key = match.slice(1);
    return params[key] || match;
  });

  const headers = {
    Authorization: `Bearer ${token}`,
    ...(isFormData
      ? { 'Content-Type': 'multipart/form-data' }
      : { 'Content-Type': 'application/json' }),
  };

  try {
    const response = await axios({
      method: method,
      url: `${baseURL}${url}`,
      headers: headers,
      data: body,
      params: params
    });

    return response;
  } catch (error) {
    console.log(error);
    throw error.response?.data;
  }
};

export const API = {
  // AUTHENTICATION API //
  loginUserAccount: (body) => api(AuthenticationAPI.loginAccount, 'post', body),
  currentUserInfo: () => api(AuthenticationAPI.currentUserInfo, 'get'),

  // CREATETIMESLOTS
   createTimeSlotsCoach: (body) => api(CoachesAPI.createTimeSlots, 'post', body),
    listOfTimeAvailability: () => api(CoachesAPI.listOfAvailability, 'get'),

  //LESSONS
  currentUserLesson: () => api(LessonsAPI.currentUserLesson, 'get'),
  bookALesson: (body) => api(LessonsAPI.bookAlesson, 'post', body),

  //LIST OF COACH
  coachList: () => api(CoachesAPI.listOfCoach, 'get'),
  coachAvailableTimeDate: (params) => api(CoachesAPI.coachListOfDateTime, 'get', undefined, params),

  //FAVORITE COACH
  createFavoriteCoach: (params) => api(CoachesAPI.favoriteCoach, 'get', undefined, params),
  deleteFavoriteCoach: (params) => api(CoachesAPI.deleteFavoriteCoach, 'delete', undefined, params),

   //INVOICE
  listOfInvoices: () => api(InvoiceAPI.userInvoice, 'get'),
  payInvoice: (params) => api(InvoiceAPI.payInvoice, 'patch', undefined, params),
   cancelLesson: (body) => api(InvoiceAPI.cancelLesson, 'patch', body),
      coachCancelLesson: (body) => api(InvoiceAPI.cancelByCoachLesson, 'patch', body),

};
