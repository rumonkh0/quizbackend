const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const topicSchema = new mongoose.Schema({
    // Unique name for the topic (e.g., 'React Fundamentals')
    name: {
      type: String,
      required: true,
      unique: true
    },
    // A brief description of what the topic covers
    description: {
      type: String,
      default: ''
    },
    // Optional: Reference to the user who created this topic
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    }
  }, { timestamps: true });
  
module.exports = mongoose.model('Topic', topicSchema);