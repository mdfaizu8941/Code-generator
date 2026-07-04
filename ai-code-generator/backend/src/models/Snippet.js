const mongoose = require('mongoose');

const snippetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  prompt: {
    type: String,
    required: [true, 'Please add the prompt used']
  },
  language: {
    type: String,
    required: [true, 'Please specify the language']
  },
  framework: {
    type: String,
    default: 'None'
  },
  generatedCode: {
    type: String,
    required: [true, 'Generated code cannot be empty']
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Add indexes for efficient querying and sorting
snippetSchema.index({ user: 1, createdAt: -1 });
snippetSchema.index({ user: 1, isFavorite: 1 });
snippetSchema.index({ user: 1, language: 1 });

module.exports = mongoose.model('Snippet', snippetSchema);
