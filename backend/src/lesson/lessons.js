const express = require("express");
const router = express.Router();
const db = require("../server/server");
const authenticateToken = require("../middleware/middlewareAuth");
const { v4: uuidv4 } = require('uuid');

router.get("/current_lessons", authenticateToken, async (req, res) => {
  try {
    const userRole = req.user.role;
    const userUUID = req.user.uid;
    const column = userRole === "coach" ? "coach_uid" : "student_uid";

    // Fetch and order lessons by status priority, then time
    const lessonsResult = await db.query(
      `SELECT 
          id,
          coach_uid,
          student_uid,
          TO_CHAR(lesson_date, 'YYYY-MM-DD') AS lesson_date,
          start_time,
          end_time,
          status
       FROM lessons
       WHERE ${column} = $1
         AND lesson_date >= CURRENT_DATE
       ORDER BY 
         CASE 
           WHEN status = 'pending' THEN 0
           WHEN status = 'confirmed' THEN 1
           WHEN status = 'canceled' THEN 2
           ELSE 3
         END,  -- Status priority
         lesson_date ASC,
         start_time ASC`, 
      [userUUID]
    );

    const lessons = lessonsResult.rows;

    // Collect unique user UUIDs (optimized)
    const userIds = [...new Set(
      lessons.flatMap(lesson => [lesson.coach_uid, lesson.student_uid])
    )];

    // Fetch user info in a single query
    const userInfoResult = await db.query(
      `SELECT uid, first_name, last_name, role 
       FROM users 
       WHERE uid = ANY($1)`,
      [userIds]
    );

    // Create user map
    const userMap = Object.fromEntries(
      userInfoResult.rows.map(user => [user.uid, user])
    );

    // Enrich lessons with user info
    const enrichedLessons = lessons.map(lesson => ({
      ...lesson,
      coach_info: userMap[lesson.coach_uid],
      student_info: userMap[lesson.student_uid]
    }));

    res.status(200).json({ lessons: enrichedLessons });
  } catch (err) {
    console.error("Error fetching lessons:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// STUDENT BOOK A LESSON
// router.post("/lessons", authenticateToken, async (req, res) => {
//   try {
//     const studentUID = req.user.uid;
//     const { coach_uid, date, start_time, end_time, status } = req.body;
//    const invoice_uid = `inv_${uuidv4()}`;

//     if (!coach_uid || !date || !start_time || !end_time) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     // ✅ Restrict max 5 scheduled lessons
//     const lessonRestriction = await db.query(
//       `SELECT 1 FROM lessons WHERE student_uid = $1 AND status = 'scheduled'`,
//       [studentUID]
//     );
//     if (lessonRestriction.rowCount >= 5) {
//       return res.status(403).json({ message: "You already have 5 scheduled lessons." });
//     }

//     // ✅ Block if unpaid invoices
//     const unpaidInvoices = await db.query(
//       `SELECT 1 FROM invoices WHERE student_uid = $1 AND status = 'unpaid'`,
//       [studentUID]
//     );
//     if (unpaidInvoices.rowCount > 0) {
//       return res.status(403).json({ message: "You have unpaid invoices. Please settle them before booking a new lesson." });
//     }

//     // ✅ Avoid double booking
//     const lessonConflictCheck = await db.query(
//       `SELECT 1 FROM lessons WHERE coach_uid = $1 AND lesson_date = $2 AND start_time = $3 AND end_time = $4`,
//       [coach_uid, date, start_time, end_time]
//     );

//     if (lessonConflictCheck.rowCount > 0) {
//       return res.status(409).json({
//         message: "A lesson already exists at this date and time for the coach.",
//       });
//     }

//     // ✅ Insert the lesson
//     const lessonResult = await db.query(
//       `INSERT INTO lessons (coach_uid, student_uid, lesson_date, start_time, end_time, status)
//        VALUES ($1, $2, $3, $4, $5, $6)
//        RETURNING *`,
//       [coach_uid, studentUID, date, start_time, end_time, status || "pending"]
//     );
//     const lesson = lessonResult.rows[0];

//     // ✅ Insert corresponding invoice (adjust amount logic if needed)
//     await db.query(
//       `INSERT INTO invoices (lesson_id, student_uid, amount, status, invoice_uid)
//        VALUES ($1, $2, $3, $4, $5)`,
//       [lesson.id, studentUID, 95, "unpaid", invoice_uid] // adjust 500 to actual lesson fee
//     );

//     res.status(201).json({
//       message: "Lesson booked successfully",
//       lesson,
//     });
//   } catch (err) {
//     console.error("Error creating lesson or invoice:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });


// STUDENT BOOK A LESSON 
router.post("/lessons", authenticateToken, async (req, res) => {
  try {
    const studentUID = req.user.uid;
    const {
      coach_uid,
      date,
      start_time,
      end_time,
      status,
      amount = 95,
    } = req.body;

    const invoice_uid = `inv_${uuidv4()}`;

    if (!coach_uid || !date || !start_time || !end_time) {
      return res.status(400).json({ message: "Missing required fields" });
    }


    // ✅ Restrict max 5 scheduled lessons
    const lessonRestriction = await db.query(
      `SELECT 1 FROM lessons WHERE student_uid = $1 AND status = 'pending'`,
      [studentUID]
    );
    if (lessonRestriction.rowCount >= 5) {
      return res.status(403).json({ message: "You already have 5 scheduled lessons." });
    }

    // ✅ Block if unpaid invoices
 const blockedInvoices = await db.query(
  `SELECT 1 
   FROM invoices 
   WHERE student_uid = $1 
   AND (status = 'unpaid' OR status = 'canceled_penalty')`,
  [studentUID]
);

if (blockedInvoices.rowCount > 0) {
  return res.status(403).json({ 
    message: "You have pending penalties/unpaid invoices. Settle them to book new lessons." 
  });
}


    



    // ✅ Avoid double booking
    const lessonConflictCheck = await db.query(
      `SELECT 1 FROM lessons WHERE coach_uid = $1 AND lesson_date = $2 AND start_time = $3 AND end_time = $4`,
      [coach_uid, date, start_time, end_time]
    );

    if (lessonConflictCheck.rowCount > 0) {
      return res.status(409).json({
        message: "A lesson already exists at this date and time for the coach.",
      });
    }

    // ✅ Insert the lesson
    const lessonResult = await db.query(
      `INSERT INTO lessons (coach_uid, student_uid, lesson_date, start_time, end_time, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [coach_uid, studentUID, date, start_time, end_time, status || "pending"]
    );

    const lesson = lessonResult.rows[0];

    // ✅ Insert invoice
    await db.query(
      `INSERT INTO invoices (invoice_uid, lesson_id, student_uid, amount, status, generated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_DATE)`,
      [
        invoice_uid,
        lesson.id,
        studentUID,
        amount,
        'pending',
      ]
    );

    res.status(201).json({
      message:"Lesson booked successfully",
      lesson,
    });
  } catch (err) {
    console.error("Error creating lesson or invoice:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//COACH BOOK A LESSON FOR STUDENT
router.post("/lessons", authenticateToken, async (req, res) => {
  try {
    const coachUID = req.user.uid;
    const { student_uid, date, start_time, end_time, status } = req.body;
   const invoice_uid = `inv_${uuidv4()}`;

    if (!student_uid || !date || !start_time || !end_time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // // ✅ Restrict max 5 scheduled lessons
    // const lessonRestriction = await db.query(
    //   `SELECT 1 FROM lessons WHERE student_uid = $1 AND status = 'scheduled'`,
    //   [studentUID]
    // );
    // if (lessonRestriction.rowCount >= 5) {
    //   return res.status(403).json({ message: "You already have 5 scheduled lessons." });
    // }

    // // ✅ Block if unpaid invoices
    // const unpaidInvoices = await db.query(
    //   `SELECT 1 FROM invoices WHERE student_uid = $1 AND status = 'unpaid'`,
    //   [studentUID]
    // );
    // if (unpaidInvoices.rowCount > 0) {
    //   return res.status(403).json({ message: "You have unpaid invoices. Please settle them before booking a new lesson." });
    // }

    // ✅ Avoid double booking
    const lessonConflictCheck = await db.query(
      `SELECT 1 FROM lessons WHERE student_uid = $1 AND lesson_date = $2 AND start_time = $3 AND end_time = $4`,
      [student_uid, date, start_time, end_time]
    );

    if (lessonConflictCheck.rowCount > 0) {
      return res.status(409).json({
        message: "A lesson already exists at this date and time for the student.",
      });
    }

    // ✅ Insert the lesson
    const lessonResult = await db.query(
      `INSERT INTO lessons (coach_uid, student_uid, lesson_date, start_time, end_time, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [coachUID, student_uid, date, start_time, end_time, status || "pending"]
    );
    const lesson = lessonResult.rows[0];

    // ✅ Insert corresponding invoice (adjust amount logic if needed)
    await db.query(
      `INSERT INTO invoices (lesson_id, student_uid, amount, status, invoice_uid)
       VALUES ($1, $2, $3, $4)`,
      [lesson.id, student_uid, 95, "unpaid", invoice_uid] // adjust 500 to actual lesson fee
    );

    res.status(201).json({
      message: "Lesson booked successfully",
      lesson,
    });
  } catch (err) {
    console.error("Error creating lesson or invoice:", err);
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


// CANCEL LESSON BASED ON ROLE
router.patch("/lessons", authenticateToken, async (req, res) => {
  try {
    const userRole = req.user.role;
    const cancelBy = userRole === 'coach' ? 'coach' : 'student';
    const { lesson_id, cancel_at } = req.body;

    if (!lesson_id || !cancel_at) {
      return res.status(400).json({ message: "Missing lesson_id or cancel_at" });
    }

    const updateResult = await db.query(
      `UPDATE lessons
       SET cancel_by = $1,
           cancel_at = $2
       WHERE lessonID = $3`,
      [cancelBy, cancel_at, lesson_id]
    );

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ message: "Lesson not found or already cancelled" });
    }

    res.status(200).json({
      message: "Lesson cancelled successfully"
    });
  } catch (err) {
    console.error("Error cancelling lesson:", err);
    res.status(500).json({ message: "Server error" });
  }
});




module.exports = router;
