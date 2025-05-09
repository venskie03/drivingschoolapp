const express = require("express");
const router = express.Router();
const db = require("../server/server");
const authenticateToken = require("../middleware/middlewareAuth");


router.get("/current_lessons", authenticateToken, async (req, res) => {
  try {
    const userRole = req.user.role;
    const userUUID = req.user.uid;

    const column = userRole === "coach" ? "coach_uid" : "student_uid";

    const futureLessons = await db.query(
      `SELECT id,
              coach_uid,
              student_uid,
              TO_CHAR(lesson_date, 'YYYY-MM-DD') AS lesson_date,
              start_time,
              end_time,
              status
       FROM lessons
       WHERE ${column} = $1 AND lesson_date >= CURRENT_DATE
       ORDER BY lesson_date, start_time`,
      [userUUID]
    );

    res.status(200).json({ lessons: futureLessons.rows });
  } catch (err) {
    console.error("Error fetching lessons:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
