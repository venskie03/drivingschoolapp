export const AuthenticationAPI = {
    createAccount: '/auth/register',
    loginAccount: '/auth/login'
}

export const CoachesAPI = {
    listOfCoach: '/coaches/users',
    coachTimAvailability: '/coaches/availability/time',
    createTimeSlots: '/coaches/availability',
     listOfAvailability: '/coaches/availability/time',
    deleteTimeSlots: '/coaches/availability/:id',
}

export const LessonsAPI = {
    currentUserLesson: '/lessons/current_lessons',

       currentUserLesson: '/lessons/current_lessons',
       bookAlesson: '/lessons/lessons',
}