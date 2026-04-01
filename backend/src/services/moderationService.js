// AI moderation placeholder — to be implemented
// Will hook into an AI provider (e.g. OpenAI Moderation API) to
// automatically flag/reject inappropriate content in widget text and images

const moderateText = async (text) => {
  // TODO: call AI moderation API
  return { flagged: false, reason: null };
};

const moderateImage = async (imageUrl) => {
  // TODO: call AI vision moderation API
  return { flagged: false, reason: null };
};

module.exports = { moderateText, moderateImage };
