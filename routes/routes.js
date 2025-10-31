const express = require("express");
const router = express.Router();
const { authMiddleware, adminMiddleware } = require("../middleware/Auth");

// Import Controllers
const {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getAllQuizzes,
  getQuizById,
  attemptQuiz,
  getUserAttempts,
  getAdminQuizes,
  getQuizAttempts,
} = require("../controllers/quizController");

const {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuizQuestions,
} = require("../controllers/questionController");

const {
    createTopic,
    updateTopic,
    deleteTopic,
    getAllTopics,
    getTopicById,
} = require("../controllers/topicController");

const {
    createModule,
    updateModule,
    deleteModule,
    getModulesByTopicId,
    getModuleById,
} = require("../controllers/moduleController");

const { login, register } = require("../controllers/userController");

// User Authentication
router.post("/login", login);
router.post("/register", register);

// =========================================================
//                  TOPIC ROUTES (NEW)
// =========================================================

// Topic Admin (CRUD) Routes
router.post("/topics", authMiddleware,adminMiddleware, createTopic);
router.put("/topics/:id", authMiddleware, adminMiddleware, updateTopic);
router.delete("/topics/:id", authMiddleware, adminMiddleware, deleteTopic);

// Topic Data (User Read) Routes (Used for the initial header load)
router.get("/topics", authMiddleware, getAllTopics);
router.get("/topics/:id", authMiddleware, getTopicById); // Optional: Fetch single topic details

// =========================================================
//                  MODULE ROUTES (NEW)
// =========================================================

// Module Admin (CRUD) Routes
router.post("/modules", authMiddleware, adminMiddleware, createModule);
router.put("/modules/:id", authMiddleware, adminMiddleware, updateModule);
router.delete("/modules/:id", authMiddleware, adminMiddleware, deleteModule);

// Module Data (User Read) Routes
// CRITICAL: Fetches all modules for a selected topic (Sidebar Load)
router.get("/modules/topic/:topicId", authMiddleware, getModulesByTopicId);
router.get("/modules/:id", authMiddleware, getModuleById); // Optional: Fetch single module details

// Quiz routes
router.get("/admin-quizzes", authMiddleware, adminMiddleware, getAdminQuizes);
router.get("/attempts/:id", authMiddleware, adminMiddleware, getQuizAttempts);
router.post("/quizzes", authMiddleware, adminMiddleware, createQuiz);
router.put("/quizzes/:id", authMiddleware, adminMiddleware, updateQuiz);
router.delete("/quizzes/:id", authMiddleware, adminMiddleware, deleteQuiz);

// question routes
router.get("/questions/:id", authMiddleware, getQuizQuestions);
router.post("/questions", authMiddleware, adminMiddleware, createQuestion);
router.put("/questions/:id", authMiddleware, adminMiddleware, updateQuestion);
router.delete(
  "/questions/:id",
  authMiddleware,
  adminMiddleware,
  deleteQuestion
);

// data routes
router.get("/quizzes", authMiddleware, getAllQuizzes);
router.get("/quizzes/:id", authMiddleware, getQuizById);
router.post("/quizzes/:id/attempt", authMiddleware, attemptQuiz);
router.get("/attempts", authMiddleware, getUserAttempts);

module.exports = router;
