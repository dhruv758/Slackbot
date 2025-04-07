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

PollSchema.index({ message_ts: 1, channel_id: 1 });

// Use module.exports to export the model
module.exports = mongoose.model('Poll', PollSchema);
