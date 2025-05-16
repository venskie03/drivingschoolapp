export function formatTo12Hour(timeStr) {
  const [hour, minute] = timeStr.split(":");
  const date = new Date();
  date.setHours(parseInt(hour), parseInt(minute));

  const options = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  return date.toLocaleTimeString("en-US", options);
}


   // Function to calculate duration between start and end time
    export const calculateDuration = (startTime, endTime) => {
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
   export const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Icon and color based on status
   export const getStatusDetails = (status) => {
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

    export function formatTimeRange(startTime, endTime) {
  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}
