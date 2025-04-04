const { slackApp } = require("../slack/app");
const { Poll } = require("../models/dbmodel");
const { getVoteCounts } = require("./votehandler");
const { v4: uuidv4 } = require("uuid");

const POLL_DURATION = 60 * 5000;

async function sendPoll(req, res) {
  try {
    // Generate unique poll ID
    const poll_id = uuidv4();
    
    const options = ["pizza", "south_indian", "veg_thaali", "non_veg_biryani", "chinese"];
    
    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `\ud83c\udf7d️ Food Poll! What do you want to eat?\n\n Total Votes: 0`
        }
      },
      {
        type: "actions",
        elements: options.map(option => ({
          type: "button",
          text: { type: "plain_text", text: `${option.replace('_', ' ')} (0)` },
          value: `${option}_${poll_id}`, // Make sure poll_id is the UUID
          action_id: `vote_${option}`
        }))
      },
      {
        type: "actions",
        elements: [{
          type: "button",
          text: { type: "plain_text", text: "\ud83d\udcca View Votes" },
          value: poll_id,
          action_id: "view_votes"
        }]
      }
    ];
    
    // Send the message to Slack
    const result = await slackApp.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: process.env.SLACK_CHANNEL,
      text: "\ud83c\udf7d️ *Food Poll!* Vote for your favorite food!",
      blocks: blocks
    });
    
    if (!result || !result.channel || !result.ts) {
      throw new Error("Failed to send poll.");
    }
    
    await Poll.create({
      poll_id,
      message_ts: result.ts,
      channel_id: result.channel,
      title: "Food Poll",
      options,
      created_at: new Date(),
      expires_at: new Date(Date.now() + POLL_DURATION)
    });
    
    setTimeout(() => closePoll(result.channel, result.ts, poll_id), POLL_DURATION);
    
    res.status(200).json({ message: "Poll sent successfully!", poll_id });
  } catch (error) {
    console.error("Error sending poll:", error);
    res.status(500).json({ error: "Error sending poll" });
  }
}

async function closePoll(channelId, messageTs, poll_id) {
  try {
    // Get final vote counts
    const voteCounts = await getVoteCounts(poll_id);
    
    // Format results text
    const resultText = Object.entries(voteCounts)
      .map(([option, count]) => `${option.replace('_', ' ')}: ${count}`)
      .join("\n");
    
    // Create final message text
    const finalText = `\ud83d\udeab Poll Closed - Voting is no longer available.\n\n${resultText}`;
    
    // Update the Slack message
    await slackApp.client.chat.update({
      token: process.env.SLACK_BOT_TOKEN,
      channel: channelId,
      ts: messageTs,
      text: finalText,
      // blocks: [{ type: "section", text: { type: "mrkdwn", text: finalText } }]
    });
    
    console.log("✅ Poll closed successfully.");
  } catch (error) {
    console.error("Error closing poll:", error);
  }
}

async function getPollById(poll_id) {
  try {
    return await Poll.findOne({ poll_id });
  } catch (error) {
    console.error(`Error finding poll ${poll_id}:`, error);
    return null;
  }
}

module.exports = { sendPoll, closePoll, getPollById };