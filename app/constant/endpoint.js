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
  coachListOfDateTime: '/coaches/availability/list',
  favoriteCoach: '/coaches/favorite_coach',
  deleteFavoriteCoach: '/coaches/favorite_coach',
};

export const LessonsAPI = {
  currentUserLesson: "/lessons/current_lessons",
  currentUserLesson: "/lessons/current_lessons",
  bookAlesson: "/lessons/lessons",
};

export const InvoiceAPI = {
  userInvoice: '/invoice/current_invoices',
  payInvoice: '/invoice/pay_invoice',
  cancelLesson: '/invoice/cancel_lesson',
  cancelByCoachLesson: '/invoice/coach/cancel_lesson'
}
