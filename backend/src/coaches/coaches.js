const express = require("express");
const router = express.Router();
const db = require("../server/server");
const authenticateToken = require("../middleware/middlewareAuth");

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
    const coachId = req.query.coach_uid;

    if (!coachId) {
      return res.status(400).json({ message: "Missing coach_uid in query params" });
    }

    // Step 1: Get all future availability entries
    const availabilityData = await db.query(
      `SELECT id, to_char(date, 'YYYY-MM-DD') as date, start_time, end_time 
       FROM availability 
       WHERE coach_uid = $1 AND date >= CURRENT_DATE
       ORDER BY date, start_time`,
      [coachId]
    );

    // Step 2: Get booked start+end times
    const bookedLessons = await db.query(
      `SELECT to_char(lesson_date, 'YYYY-MM-DD') as date, start_time, end_time 
       FROM lessons 
       WHERE coach_uid = $1 AND lesson_date >= CURRENT_DATE`,
      [coachId]
    );

    const bookedSlots = bookedLessons.rows.map(lesson => ({
      date: lesson.date,
      start: lesson.start_time,
      end: lesson.end_time,
    }));

    // Step 3: Filter out booked time slots
    const availableSlots = availabilityData.rows.filter(avail => {
      return !bookedSlots.some(booked => 
        booked.date === avail.date &&
        booked.start === avail.start_time &&
        booked.end === avail.end_time
      );
    });

    res.status(200).json({ available_slots: availableSlots });
  } catch (err) {
    console.error("Error fetching availability:", err);
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

    const requestedDates = availabilities.map(a => a.date.split('T')[0]);

    // Check for duplicate entries in request (same date + time)
    const requestDuplicates = availabilities.filter((a, index, self) => {
      const date = a.date.split('T')[0];
      return (
        self.findIndex(
          x =>
            x.date.split('T')[0] === date &&
            x.start_time === a.start_time &&
            x.end_time === a.end_time
        ) !== index
      );
    });

    if (requestDuplicates.length > 0) {
      return res.status(400).json({
        message: "Duplicate date and time entries found in request",
        duplicates: requestDuplicates,
      });
    }

    // Fetch existing availability for those dates
    const existing = await db.query(
      `SELECT date::text, start_time::text, end_time::text 
       FROM availability 
       WHERE coach_uid = $1 AND date = ANY($2::date[])`,
      [coachId, requestedDates]
    );

    const existingEntries = existing.rows.map(row => ({
      date: row.date,
      start_time: row.start_time,
      end_time: row.end_time,
    }));

    const duplicates = availabilities.filter(a => {
      const date = a.date.split('T')[0];
      return existingEntries.some(e =>
        e.date === date &&
        e.start_time === a.start_time &&
        e.end_time === a.end_time
      );
    });

    if (duplicates.length > 0) {
      return res.status(409).json({
        message:
          "Some availability entries already exist with the same date, start_time, and end_time",
        duplicates,
      });
    }

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
        return db.query(
          `INSERT INTO availability 
          (coach_uid, start_time, end_time, break_start, break_end, recurrence, date, time_blocks)
          VALUES ($1, $2, $3, $4, $5, $6, $7::date, $8)`,
          [
            coachId,
            start_time,
            end_time,
            break_start,
            break_end,
            recurrence,
            date.split("T")[0],
            parseInt(time_blocks),
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
