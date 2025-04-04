const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PollSchema = new Schema({
  poll_id: {
    type: String,
    required: true,
    index: true
  },
  message_ts: {
    type: String,
    required: true
  },
  channel_id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  options: [{
    type: String
  }],
  created_at: {
    type: Date,
    default: Date.now
  },
  expires_at: {
    type: Date,
    index: true
  }
});
// Create a compound index for message_ts and channel_id for quick lookups
PollSchema.index({ message_ts: 1, channel_id: 1 });
const VoteSchema = new Schema({
  poll_id: {
    type: String,
    required: true,
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

VoteSchema.index({ poll_id: 1, user_id: 1 }); // Remove { unique: true }

const Poll = mongoose.model('Poll', PollSchema);
const Vote = mongoose.model('Vote', VoteSchema);

module.exports = { Poll, Vote };