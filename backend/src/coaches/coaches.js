const express = require("express");
const router = express.Router();
const db = require("../server/server");
const authenticateToken = require("../middleware/middlewareAuth");
const { generateBookingTimes } = require("../helper/helper");

// Get all users with role 'coach'
router.get("/users", authenticateToken, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE role = $1", [
      "coach",
    ]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/availability", authenticateToken, async (req, res) => {
  try {
    const availabilityTimeID = req.query.id;
    const userRole = req.user.role;
    const coach_uid = req.user.uid;

    // Optional: Only allow coaches or admins
    if (userRole !== "coach" && userRole !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const result = await db.query(
      `SELECT id, coach_uid, to_char(date, 'YYYY-MM-DD') AS date, start_time, end_time, break_start, break_end, time_blocks
       FROM availability
       WHERE id = $1 AND coach_uid = $2`,
      [availabilityTimeID, coach_uid]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Availability not found" });
    }

    res.status(200).json({ availability: result.rows[0] });
  } catch (err) {
    console.error("Error fetching availability:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/availability/time", authenticateToken, async (req, res) => {
  try {
    const coachId = req.query.coach_uid;

    if (!coachId) {
      return res
        .status(400)
        .json({ message: "Missing coach_uid in query params" });
    }

    // Step 1: Get all future availability entries including booking_times
    const availabilityData = await db.query(
      `SELECT id, to_char(date, 'YYYY-MM-DD') as date, start_time, end_time, booking_times
       FROM availability 
       WHERE coach_uid = $1 AND date >= CURRENT_DATE
       ORDER BY date, start_time`,
      [coachId]
    );

    // Step 2: Get booked lesson time slots
    const bookedLessons = await db.query(
      `SELECT to_char(lesson_date, 'YYYY-MM-DD') as date, start_time, end_time 
       FROM lessons 
       WHERE coach_uid = $1 AND lesson_date >= CURRENT_DATE`,
      [coachId]
    );

    const bookedSlots = bookedLessons.rows.map((lesson) => ({
      date: lesson.date,
      start: lesson.start_time,
      end: lesson.end_time,
    }));

    // Step 3: Filter out booked booking_times
    const availableSlots = [];

    availabilityData.rows.forEach((avail) => {
      const bookingTimes = avail.booking_times;

      if (!bookingTimes || !Array.isArray(bookingTimes)) return;

      const filteredTimes = bookingTimes.filter((bt) => {
        return !bookedSlots.some(
          (booked) =>
            booked.date === avail.date &&
            booked.start === bt.booking_time_start &&
            booked.end === bt.booking_time_end
        );
      });

      if (filteredTimes.length > 0) {
        availableSlots.push({
          date: avail.date,
          available_booking_times: filteredTimes,
        });
      }
    });

    res.status(200).json({ available_slots: availableSlots});
  } catch (err) {
    console.error("Error fetching availability:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.delete("/availability", authenticateToken, async (req, res) => {
  try {
    const availabilityTimeID = req.query.id; // should use .id
    const coach_uid = req.user.uid;
    const userRole = req.user.role; // was mistakenly set to uid before

    if (userRole !== "coach" && userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "You can't delete this availability" });
    }

    if (!availabilityTimeID) {
      return res
        .status(400)
        .json({ message: "Missing availability ID in query params" });
    }

    const deleteResult = await db.query(
      `DELETE FROM availability WHERE id = $1 AND coach_uid = $2 RETURNING *`,
      [availabilityTimeID, coach_uid]
    );

    if (deleteResult.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Availability not found or unauthorized" });
    }

    res
      .status(200)
      .json({
        message: "Availability deleted successfully",
        deleted: deleteResult.rows[0],
      });
  } catch (err) {
    console.error("Error deleting availability:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/availability", authenticateToken, async (req, res) => {
  try {
    const availabilityTimeID = req.query.id;
    const coach_uid = req.user.uid;
    const userRole = req.user.role;

    const {
      date,
      start_time,
      end_time,
      break_start,
      break_end,
      recurrence,
      time_blocks,
    } = req.body;

    // 🛑 Correct role check (AND, not OR)
    if (userRole !== "coach" && userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "You can't update this availability" });
    }

    if (!date || !start_time || !end_time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const timeBlockSize = parseInt(time_blocks);
    const bookingTimes = generateBookingTimes(
      start_time,
      end_time,
      timeBlockSize,
      break_start,
      break_end
    );

    const updateQuery = `
      UPDATE availability
      SET date = $1,
          start_time = $2,
          end_time = $3,
          break_start = $4,
          break_end = $5,
          recurrence = $6,
          time_blocks = $7,
          booking_times = $8::jsonb
      WHERE id = $9 AND coach_uid = $10
      RETURNING *`;

    const result = await db.query(updateQuery, [
      date.split("T")[0],
      start_time,
      end_time,
      break_start,
      break_end,
      recurrence,
      timeBlockSize,
      JSON.stringify(bookingTimes),
      availabilityTimeID,
      coach_uid,
    ]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Availability not found or unauthorized" });
    }

    res.status(200).json({
      message: "Availability updated successfully",
      availability: result.rows[0],
    });
  } catch (err) {
    console.error("Error updating availability:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/availability", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "coach") {
      return res
        .status(403)
        .json({ message: "Unauthorized: Only coaches can add availability" });
    }

    const coachId = req.user.uid;
    const availabilities = req.body;

    if (!Array.isArray(availabilities) || availabilities.length === 0) {
      return res
        .status(400)
        .json({ message: "Availability data must be a non-empty array" });
    }


    // ✅ Check for duplicate dates in the request body
    const uniqueDates = new Set();
    const requestDuplicates = [];

    for (const a of availabilities) {
      const dateOnly = a.date.split("T")[0];
      if (uniqueDates.has(dateOnly)) {
        requestDuplicates.push(dateOnly);
      } else {
        uniqueDates.add(dateOnly);
      }
    }

    if (requestDuplicates.length > 0) {
      return res.status(400).json({
        message: "Duplicate date entries found in request",
        duplicates: requestDuplicates,
      });
    }

    // ✅ Check if the date already exists in the DB for this coach
    const existing = await db.query(
      `SELECT date::text FROM availability 
       WHERE coach_uid = $1 AND date = ANY($2::date[])`,
      [coachId, [...uniqueDates]]
    );

    const existingDates = existing.rows.map((r) => r.date);

    if (existingDates.length > 0) {
      return res.status(409).json({
        message: "Some availability dates already exist",
        duplicates: existingDates,
      });
    }

    // ✅ Insert all new availabilities
    const insertQueries = availabilities.map(
      ({
        start_time,
        end_time,
        break_start,
        break_end,
        recurrence,
        date,
        time_blocks,
      }) => {
        const timeBlockSize = parseInt(time_blocks);

        // Generate booking times array based on the inputs
        const bookingTimes = generateBookingTimes(
          start_time,
          end_time,
          timeBlockSize,
          break_start,
          break_end
        );

        return db.query(
          `INSERT INTO availability 
          (coach_uid, start_time, end_time, break_start, break_end, recurrence, date, time_blocks, booking_times)
          VALUES ($1, $2, $3, $4, $5, $6, $7::date, $8, $9::jsonb)`,
          [
            coachId,
            start_time,
            end_time,
            break_start,
            break_end,
            recurrence,
            date.split("T")[0],
            timeBlockSize,
            JSON.stringify(bookingTimes),
          ]
        );
      }
    );

    await Promise.all(insertQueries);
    res.status(201).json({ message: "Availability successfully added" });
  } catch (err) {
    console.error("Error inserting availability:", err);
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
