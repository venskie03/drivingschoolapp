export const AuthenticationAPI = {
  createAccount: "/auth/register",
  loginAccount: "/auth/login",
  currentUserInfo: "/auth/profile",
};

export const CoachesAPI = {
  listOfCoach: "/coaches/users",
  coachTimAvailability: "/coaches/availability/time",
  createTimeSlots: "/coaches/availability",
  listOfAvailability: "/coaches/availability/time",
  deleteTimeSlots: "/coaches/availability/:id",
  coachListOfDateTime: '/coaches/availability/list'
};

export const LessonsAPI = {
  currentUserLesson: "/lessons/current_lessons",
  currentUserLesson: "/lessons/current_lessons",
  bookAlesson: "/lessons/lessons",
};
