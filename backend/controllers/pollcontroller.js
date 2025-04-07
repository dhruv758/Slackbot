const { slackApp } = require("../slack/app");
const { Poll } = require("../models/Poll");
const { getVoteCounts } = require("./votehandler");
const { v4: uuidv4 } = require("uuid");

async function sendPoll(req, res) {
  try {
    const poll_id = uuidv4();

    if (!options || !Array.isArray(options) || options.length === 0) {
      return res.status(400).json({ error: "Options are required." });
    }

    // 🔧 Fix the buttons to match the new structure
    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `🍽️ Food Poll! What do you want to eat?\n\nTotal Votes: 0`
        }
      },
      {
        type: "actions",
        elements: options.map(opt => ({
          type: "button",
          text: {
            type: "plain_text",
            text: `${opt.name.replace('_', ' ')} (0)`
          },
          value: `${opt.name}_${poll_id}`,
          action_id: `vote_${opt.name}`
        }))
      },
      {
        type: "actions",
        elements: [{
          type: "button",
          text: { type: "plain_text", text: "📊 View Votes" },
          value: poll_id,
          action_id: "view_votes"
        }]
      }
    ];

    const result = await slackApp.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: process.env.SLACK_CHANNEL,
      text: "🍽️ *Food Poll!* Vote for your favorite food!",
      blocks
    });

    if (!result?.channel || !result?.ts) {
      throw new Error("Failed to send poll.");
    }

    // ✅ Save the poll with full option objects (name + url)
    await Poll.create({
      poll_id,
      message_ts: result.ts,
      channel_id: result.channel,
      title: "Food Poll",
      options, // Already has { name, url }
      created_at: new Date(),
      expires_at: new Date(expires_at)
    });

    const delay = new Date(expires_at).getTime() - Date.now();
    setTimeout(() => closePoll(result.channel, result.ts, poll_id), delay);

    res.status(200).json({ message: "Poll sent successfully!", poll_id });
  } catch (error) {
    console.error("❌ Error sending poll:", error);
    res.status(500).json({ error: "Error sending poll" });
  }
}

async function closePoll(channelId, messageTs, poll_id) {
  try {
    const voteCounts = await getVoteCounts(poll_id);
    const poll = await getPollById(poll_id);

    if (!poll) {
      throw new Error("Poll not found when trying to close it.");
    }

    const resultText = poll.options.map(opt => {
      const count = voteCounts[opt.name] || 0;
      return `${opt.name.replace('_', ' ')}: ${count}`;
    }).join("\n");

    const finalText = `🚫 Poll Closed - Voting is no longer available.\n\n${resultText}`;

    await slackApp.client.chat.update({
      token: process.env.SLACK_BOT_TOKEN,
      channel: channelId,
      ts: messageTs,
      text: finalText
    });

    console.log("✅ Poll closed successfully.");
  } catch (error) {
    console.error("❌ Error closing poll:", error);
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
