const express = require("express");
const router = express.Router();
const db = require("../server/server");
const authenticateToken = require("../middleware/middlewareAuth");


router.get("/current_lessons", authenticateToken, async (req, res) => {
  try {
    const userRole = req.user.role;
    const userUUID = req.user.uid;
    console.log("ROLE", userRole, userUUID)
    const column = userRole === "coach" ? "coach_uid" : "student_uid";

    const currentLessons = await db.query(
      `SELECT id,
              coach_uid,
              student_uid,
              TO_CHAR(lesson_date, 'YYYY-MM-DD') AS lesson_date,
              start_time,
              end_time,
              status
       FROM lessons
       WHERE ${column} = $1
         AND lesson_date >= CURRENT_DATE
       ORDER BY start_time`,
      [userUUID]
    );

    res.status(200).json({ lessons: currentLessons.rows });
  } catch (err) {
    console.error("Error fetching lessons:", err);
    res.status(500).json({ message: "Server error" });
  }
});



router.post("/lessons", authenticateToken, async (req, res) => {
  try {
    const studentUID = req.user.uid;
    const { coach_uid, date, start_time, end_time, status } = req.body;

    if (!coach_uid || !date || !start_time || !end_time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if lesson already exists for this coach at that time
    const lessonConflictCheck = await db.query(
      `SELECT * FROM lessons
       WHERE coach_uid = $1
         AND lesson_date = $2
         AND start_time = $3
         AND end_time = $4`,
      [coach_uid, date, start_time, end_time]
    );

    if (lessonConflictCheck.rowCount > 0) {
      return res.status(409).json({
        message: "A lesson already exists at this date and time for the coach.",
      });
    }

    // Insert the new lesson
    const insertQuery = `
      INSERT INTO lessons (coach_uid, student_uid, lesson_date, start_time, end_time, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`;

    const result = await db.query(insertQuery, [
      coach_uid,
      studentUID,
      date,
      start_time,
      end_time,
      status || "pending",
    ]);

    res.status(201).json({
      message: "Lesson booked successfully",
      lesson: result.rows[0],
    });
  } catch (err) {
    console.error("Error creating lesson:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/coach/lessons", authenticateToken, async (req, res) => {
  try {
    const coach_uid = req.user.uid;
    const requestRole = req.user.role



    const { student_uid, date, start_time, end_time, status } = req.body;

    if (!coach_uid || !date || !start_time || !end_time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if lesson already exists for this coach at that time
    const lessonConflictCheck = await db.query(
      `SELECT * FROM lessons
       WHERE coach_uid = $1
         AND lesson_date = $2
         AND start_time = $3
         AND end_time = $4`,
      [coach_uid, date, start_time, end_time]
    );

    if (lessonConflictCheck.rowCount > 0) {
      return res.status(409).json({
        message: "A lesson already exists at this date and time for the coach.",
      });
    }

    // Insert the new lesson
    const insertQuery = `
      INSERT INTO lessons (coach_uid, student_uid, lesson_date, start_time, end_time, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`;

    const result = await db.query(insertQuery, [
      coach_uid,
      student_uid,
      date,
      start_time,
      end_time,
      status || "pending",
    ]);

    res.status(201).json({
      message: "Lesson booked successfully",
      lesson: result.rows[0],
    });
  } catch (err) {
    console.error("Error creating lesson:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.delete("/lessons", authenticateToken, async (req, res) => {
  try {
    const lessonID = req.query.id; // should use .id
    const coach_uid = req.user.uid;
    const userRole = req.user.role; // was mistakenly set to uid before

    if (userRole !== "coach" && userRole !== "admin") {
      return res
        .status(403)
        .json({ message: "You can't delete this availability" });
    }

    if (!lessonID) {
      return res
        .status(400)
        .json({ message: "Missing availability ID in query params" });
    }

    const deleteResult = await db.query(
      `DELETE FROM lessons WHERE id = $1 AND coach_uid = $2 RETURNING *`,
      [lessonID, coach_uid]
    );

    if (deleteResult.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Availability not found or unauthorized" });
    }

    res
      .status(200)
      .json({
        message: "Lesson deleted successfully",
        deleted: deleteResult.rows[0],
        status: 'success',
      });
  } catch (err) {
    console.error("Error deleting availability:", err);
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
