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
