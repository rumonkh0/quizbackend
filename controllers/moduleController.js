const Module = require("../models/Module");
const Topic = require("../models/Topic");
const Quiz = require("../models/Quiz");

// ✅
exports.createModule = async (req, res) => {
  try {
    const { topic_id, name, content, order, quiz_id } = req.body;
    const user = req.user; 

    if (!topic_id || !name || !content) {
      return res.status(400).json({
        success: false,
        error: "Please provide topic ID, name, and content",
      });
    }

    // Optional: Validate that the topic and quiz IDs exist
    const topicExists = await Topic.findById(topic_id);
    if (!topicExists) {
      return res.status(404).json({ success: false, error: "Topic not found" });
    }
    let quizExists
    if (quiz_id) {
         quizExists = await Quiz.findById(quiz_id);
        if (!quizExists) {
            return res.status(404).json({ success: false, error: "Quiz not found" });
        }
    }

    const newModule = await Module.create({
      topic_id,
      name,
      content,
      order: order || 0, // Default order to 0
      quiz_id: quizExists || null,
      createdBy: user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Module created successfully",
      data: newModule,
    });
  } catch (e) {
    console.error("ERROR CREATING MODULE: ", e);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// ✅
exports.updateModule = async (req, res) => {
  try {
    const { name, content, order, quiz_id } = req.body;
    const moduleId = req.params.id;

    // 1. Prepare the update object
    const updates = {};
    if (name) updates.name = name;
    if (content !== undefined) updates.content = content;
    if (order !== undefined) updates.order = order;
    // CRITICAL: Handle the quiz_id field, setting it to null if the client sends an empty value
    if (quiz_id !== undefined) updates.quiz_id = quiz_id || null; 
    
    // 2. Find and Update the document, return the new document, and POPULATE
    const moduleDoc = await Module.findByIdAndUpdate(
      moduleId,
      { $set: updates }, // Use $set to only update provided fields
      { new: true }      // IMPORTANT: Returns the updated document
    ).populate({
        path: 'quiz_id',
        select: 'title description timer' // Select the fields you need from the Quiz model
    });

    if (!moduleDoc) {
      return res
        .status(404)
        .json({ success: false, message: "Module not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Module updated successfully",
      data: moduleDoc, // The response data now includes the populated quiz
    });
  } catch (e) {
    console.error("ERROR UPDATING MODULE : ", e);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// ✅
exports.deleteModule = async (req, res) => {
  try {
    const moduleId = req.params.id;

    const moduleDoc = await Module.findByIdAndDelete(moduleId);
    
    if (!moduleDoc) {
      return res
        .status(404)
        .json({ success: false, message: "Module not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Module deleted successfully",
    });
  } catch (e) {
    console.error("ERROR DELETING MODULE : ", e);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// ✅
// **CRITICAL FOR FRONTEND:** Fetch all modules for a specific topic
exports.getModulesByTopicId = async (req, res) => {
  try {
    const topicId = req.params.topicId; // Assuming the route uses /api/modules/topic/:topicId

    const modules = await Module.find({ topic_id: topicId })
      .sort({ order: 1, createdAt: 1 }) // Sort by 'order' field, then by creation time
      .select("_id name order content quiz_id")
       .populate("quiz_id", "_id title description"); // Select only necessary fields

    return res.status(200).json({
      success: true,
      data: modules,
    });
  } catch (e) {
    console.error("ERROR FETCHING MODULES BY TOPIC ID : ", e);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// ✅
exports.getModuleById = async (req, res) => {
  try {
    const moduleId = req.params.id;
    // Populate the quiz details for a complete content view
    const moduleDoc = await Module.findById(moduleId).populate(
      "quiz_id",
      "title description timer"
    ); 

    if (!moduleDoc) {
      return res
        .status(404)
        .json({ success: false, message: "Module not found" });
    }

    return res.status(200).json({
      success: true,
      data: moduleDoc,
    });
  } catch (e) {
    console.error("ERROR GETTING MODULE : ", e);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};