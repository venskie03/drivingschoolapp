const generateBookingTimes = (start, end, blockSize, breakStart, breakEnd) => {
      const results = [];
      const pad = (n) => String(n).padStart(2, "0");

      const toMinutes = (time) => {
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
      };

      const toTimeString = (mins) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${pad(h)}:${pad(m)}`;
      };

      const startMin = toMinutes(start);
      const endMin = toMinutes(end);
      const breakStartMin = breakStart ? toMinutes(breakStart) : null;
      const breakEndMin = breakEnd ? toMinutes(breakEnd) : null;

      for (let t = startMin; t + blockSize <= endMin; t += blockSize) {
        const blockStart = t;
        const blockEnd = t + blockSize;

        // Skip block if it overlaps with break
        if (
          breakStartMin !== null &&
          breakEndMin !== null &&
          blockEnd > breakStartMin &&
          blockStart < breakEndMin
        ) {
          continue;
        }

        results.push({
          booking_time_start: toTimeString(blockStart),
          booking_time_end: toTimeString(blockEnd),
        });
      }

      return results;
    };


    module.exports = { generateBookingTimes };