const express = require("express");
const router = express.Router();
const db = require("../server/server");
const authenticateToken = require("../middleware/middlewareAuth");
const { v4: uuidv4 } = require('uuid');


router.get("/current_invoices", authenticateToken, async (req, res) => {
  try {
    const studentUID = req.user.uid;

    const invoicesResult = await db.query(
      `SELECT *
       FROM invoices
       WHERE student_uid = $1
         AND status != 'canceled'  AND status != 'canceled_coach'
       ORDER BY
         CASE WHEN status = 'unpaid' THEN 0 ELSE 1 END,
         generated_at DESC`,
      [studentUID]
    );

    res.status(200).json({
      invoices: invoicesResult.rows,
    });
  } catch (err) {
    console.error("Error fetching invoices:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// STUDENT CANCEL LESSON
router.patch("/cancel_lesson", authenticateToken, async (req, res) => {
  try {
    const { lesson_id, test_date, test_time } = req.body;
    const studentUID = req.user.uid;

    // 1. Get cancellation count
    const { rows: [{ count }] } = await db.query(
      `SELECT COUNT(*) FROM invoices 
       WHERE student_uid = $1 AND status = 'canceled'`,
      [studentUID]
    );
    const cancellationCount = parseInt(count);

    // 2. Fetch lesson details
    const { rows: [lesson] } = await db.query(
      `SELECT id, to_char(lesson_date, 'YYYY-MM-DD') AS date, start_time 
       FROM lessons WHERE id = $1 AND student_uid = $2`,
      [lesson_id, studentUID]  // Added student_uid for security
    );

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found or access denied" });
    }

    // 3. Determine cancellation window
    const thresholds = [2, 24, 48];
    const allowedWindow = thresholds[Math.min(cancellationCount, 2)];

    // 4. Calculate deadline
    const lessonDateTime = new Date(`${lesson.date}T${lesson.start_time}`);
    const currentTime = test_date && test_time 
      ? new Date(`${test_date}T${test_time}`)
      : new Date();

    const cancelDeadline = new Date(lessonDateTime - (allowedWindow * 3600000));

    // 5. Process cancellation
    const isLateCancellation = currentTime > cancelDeadline;

    // Update INVOICE status
    await db.query(
      `UPDATE invoices 
       SET status = $1 
       WHERE lesson_id = $2 AND student_uid = $3`,
      [isLateCancellation ? 'canceled_penalty' : 'canceled', lesson_id, studentUID]
    );

    // Update LESSON status (NEW)
    await db.query(
      `UPDATE lessons 
       SET status = 'canceled',
           canceled_at = NOW(),
           canceled_by = $1
       WHERE id = $2`,
      ['student', lesson_id]  // Track who canceled
    );

    res.status(200).json({
      cancellation_count: cancellationCount,
      allowed_window_hours: allowedWindow,
      is_penalty: isLateCancellation,
      message: `Lesson canceled${isLateCancellation ? ' with penalty' : ''}.`
    });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// COACH CANCEL LESSON
router.patch("/coach/cancel_lesson", authenticateToken, async (req, res) => {
  try {
    const { lesson_id } = req.body;
    const { uid: coachUID, role } = req.user;

    // 1. Verify coach role
    if (role !== 'coach') {
      return res.status(403).json({ message: "Only coaches can use this endpoint" });
    }

    // 2. Verify lesson exists and belongs to coach
    const { rows: [lesson] } = await db.query(
      `SELECT id FROM lessons 
       WHERE id = $1 AND coach_uid = $2`,
      [lesson_id, coachUID]
    );

    if (!lesson) {
      return res.status(404).json({ 
        message: "Lesson not found or not assigned to you" 
      });
    }

    // 3. Update records (transaction recommended)
    await db.query('BEGIN');
    
    // Update invoice
    await db.query(
      `UPDATE invoices 
       SET status = 'canceled_coach' 
       WHERE lesson_id = $1`,
      [lesson_id]
    );

    // Update lesson
    await db.query(
      `UPDATE lessons 
       SET status = 'canceled',
           canceled_at = NOW(),
           canceled_by = $1
       WHERE id = $2`,
      [role, lesson_id]  // Track coach's UID
    );

    await db.query('COMMIT');

    // 4. Success response
    res.status(200).json({
      success: true,
      lesson_id,
      canceled_by: coachUID,
      timestamp: new Date().toISOString(),
      message: "Lesson canceled by coach"
    });

  } catch (err) {
    await db.query('ROLLBACK');
    console.error("Coach cancellation error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to cancel lesson" 
    });
  }
});

router.patch("/pay_invoice", authenticateToken, async (req, res) => {
  try {
    const studentUID = req.user.uid;
    const inv_uid = req.query.inv_uid;

    if (!inv_uid) {
      return res.status(400).json({ message: "Invoice UID is required" });
    }

    // ✅ Check if the invoice exists and belongs to the student
    const invoiceCheck = await db.query(
      `SELECT * FROM invoices WHERE invoice_uid = $1 AND student_uid = $2`,
      [inv_uid, studentUID]
    );

    if (invoiceCheck.rowCount === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const invoice = invoiceCheck.rows[0];

    if (invoice.status === "paid") {
      return res.status(400).json({ message: "Invoice is already paid" });
    }

    // ✅ Update the invoice to mark it as paid
    await db.query(
      `UPDATE invoices
       SET status = 'paid', paid_at = NOW()
       WHERE invoice_uid = $1 AND student_uid = $2`,
      [inv_uid, studentUID]
    );

    res.status(200).json({ message: "Invoice paid successfully" });
  } catch (err) {
    console.error("Error updating invoice:", err);
    res.status(500).json({ message: "Server error" });
  }
});












module.exports = router;
