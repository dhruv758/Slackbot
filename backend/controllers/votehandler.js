  
const { Poll } = require("../models/Poll");
const { Vote } = require("../models/Votes");

exports.handleVote = async (slackApp, user_id, username, choice, poll_id) => {
  try {
    if (!user_id) {
      console.error("Missing user_id in vote request");
      return false;
    }

    console.log(`Saving vote: ${username} (${user_id}) voted for ${choice} in poll ${poll_id}`);

    const poll = await Poll.findOne({ poll_id });
    if (!poll) {
      console.error(`❌ Poll not found with poll_id: ${poll_id}`);
      return false;
    }
    await Vote.findOneAndUpdate(
      { poll_id, user_id },
      { username, choice, timestamp: new Date() },
      { upsert: true, new: true }
    );
    // Get updated vote counts
    const voteCounts = await exports.getVoteCounts(poll_id);
    const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);

    // Extract only option names not the url ;)
    const optionNames = poll.options.map(option => option.name);

    // Update the Slack message with new counts
    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `🍽️ *Food Poll! What do you want to eat?*\n\n*Total Votes:* ${totalVotes}`
        }
      },
      {
        type: "actions",
        elements: optionNames.map(option => ({
          type: "button",
          text: {
            type: "plain_text",
            text: `${option.replace('_', ' ')} (${voteCounts[option] || 0})`
          },
          value: `${option}_${poll_id}`,
          action_id: `vote_${option}`
        }))
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "📊 View Votes"
            },
            value: poll_id,
            action_id: "view_votes"
          }
        ]
      }
    ];

    await slackApp.client.chat.update({
      token: process.env.SLACK_BOT_TOKEN,
      channel: poll.channel_id,
      ts: poll.message_ts,
      blocks: blocks
    });

    console.log("✅ Vote successfully recorded and poll updated in Slack.");
    return true;
  } catch (error) {
    console.error("❌ Error handling vote:", error);
    return false;
  }
};

exports.viewVoteDetails = async (poll_id) => {
  try {
    const votes = await Vote.find({ poll_id }).lean();

    // Group users by their food choice
    const votesByChoice = {};
    votes.forEach(vote => {
      if (!votesByChoice[vote.choice]) {
        votesByChoice[vote.choice] = [];
      }
      votesByChoice[vote.choice].push(vote.username);
    });

    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Vote Details*"
        }
      }
    ];

    Object.entries(votesByChoice).forEach(([choice, users]) => {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${choice.replace('_', ' ')}* (${users.length})\n${users.join(', ')}`
        }
      });
    });

    return blocks;
  } catch (error) {
    console.error("❌ Error viewing vote details:", error);
    return [
      {
        type: "section",
        text: { type: "mrkdwn", text: "Error loading vote details" }
      }
    ];
  }
};

exports.getVoteCounts = async (poll_id) => {
  try {
    const votes = await Vote.find({ poll_id });
    const poll = await Poll.findOne({ poll_id });

    if (!poll) {
      throw new Error(`Poll with ID ${poll_id} not found`);
    }

    // Extract option names
    const optionNames = poll.options.map(option => option.name);

    const voteCounts = {};
    optionNames.forEach(option => {
      voteCounts[option] = 0;
    });

    votes.forEach(vote => {
      if (voteCounts[vote.choice] !== undefined) {
        voteCounts[vote.choice]++;
      }
    });

    return voteCounts;
  } catch (error) {
    console.error(`Error getting vote counts for poll ${poll_id}:`, error);
    return {};
  }
};
