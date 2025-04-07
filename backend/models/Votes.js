const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VoteSchema = new Schema({
  poll_id: {
    type: Schema.Types.ObjectId, // Referencing Poll schema
    required: true,
    ref: 'Poll', // Reference to Poll collection
    index: true
  },
  user_id: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  choice: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

VoteSchema.index({ poll_id: 1, user_id: 1 }); // Compound index

module.exports = mongoose.model('Vote', VoteSchema);

// const VoteSchema = new Schema({
//   poll_id: {
//     type: String,
//     required: true,
//     index: true
//   },
//   user_id: {
//     type: String,
//     required: true
//   },
//   username: {
//     type: String,
//     required: true
//   },
//   choice: {
//     type: String,
//     required: true
//   },
//   timestamp: {
//     type: Date,
//     default: Date.now
//   }
// });

VoteSchema.index({ poll_id: 1, user_id: 1 }); // Remove { unique: true }

module.exports = mongoose.model('Vote', VoteSchema);
