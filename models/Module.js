const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const moduleSchema = new mongoose.Schema({
    // Foreign Key: Link to the Topic Model (One Topic has Many Modules)
    topic_id: {
      type: Schema.Types.ObjectId,
      ref: 'Topic',
      required: true
    },
    // The display name of the module (e.g., 'State and Props')
    name: {
      type: String,
      required: true
    },
    // The main content of the module, which can be a long text/HTML string
    content: {
      type: String,
      required: true
    },
    // Optional: Defines the display order within the topic
    order: {
      type: Number,
      default: 0
    },
    // Foreign Key: Link to the Quiz Model (Optional, as per your request)
    quiz_id: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      default: null // Set to null if there is no quiz for this module
    },
    // Optional: Reference to the user who created this module
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    }
  }, { timestamps: true });
  
module.exports = mongoose.model('Module', moduleSchema);