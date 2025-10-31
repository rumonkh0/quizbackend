const Topic = require("../models/Topic"); // Assuming you have this model
const Module = require("../models/Module"); // Need this for deletion logic

// ✅
exports.createTopic = async (req, res) => {
  try {
    const { name, description } = req.body;
    const user = req.user; // Assuming req.user is populated by middleware

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Please provide the topic name",
      });
    }

    const topic = await Topic.create({
      name,
      description,
      createdBy: user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Topic created successfully",
      data: topic,
    });
  } catch (e) {
    console.error("ERROR CREATING TOPIC: ", e);
    // Check for duplicate key error (if name is unique)
    if (e.code === 11000) {
      return res.status(409).json({
        success: false,
        error: "Topic with this name already exists",
      });
    }
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// ✅
exports.updateTopic = async (req, res) => {
  try {
    const { name, description } = req.body;
    const topic = await Topic.findById(req.params.id);

    if (!topic) {
      return res
        .status(404)
        .json({ success: false, message: "Topic not found" });
    }

    // Only update fields that are provided
    if (name) topic.name = name;
    if (description !== undefined) topic.description = description;

    await topic.save();

    return res.status(200).json({
      success: true,
      message: "Topic updated successfully",
      data: topic,
    });
  } catch (e) {
    console.error("ERROR UPDATING TOPIC : ", e);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// ✅
exports.deleteTopic = async (req, res) => {
  try {
    const topicId = req.params.id;

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res
        .status(404)
        .json({ success: false, message: "Topic not found" });
    }

    // IMPORTANT: Delete all associated modules first to maintain database integrity
    const deleteModulesResult = await Module.deleteMany({ topic_id: topicId });

    // Finally, delete the topic
    await Topic.findByIdAndDelete(topicId);

    return res.status(200).json({
      success: true,
      message: `Topic and ${deleteModulesResult.deletedCount} associated module(s) deleted successfully`,
    });
  } catch (e) {
    console.error("ERROR DELETING TOPIC : ", e);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// ✅
exports.getAllTopics = async (req, res) => {
  try {
    // We only need the name and ID for the header/sidebar structure
    const topics = await Topic.find().select("_id name description");
    
    return res.status(200).json({
      success: true,
      data: topics,
    });
  } catch (e) {
    console.error("ERROR GETTING TOPICS : ", e);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// ✅
exports.getTopicById = async (req, res) => {
  try {
    const topicId = req.params.id;
    const topic = await Topic.findById(topicId);
    
    if (!topic) {
      return res
        .status(404)
        .json({ success: false, message: "Topic not found" });
    }
    
    return res.status(200).json({
      success: true,
      data: topic,
    });
  } catch (e) {
    console.error("ERROR GETTING TOPIC : ", e);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};