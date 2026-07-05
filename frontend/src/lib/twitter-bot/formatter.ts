// ═══════════════════════════════════════════════════════════════════════════
// PayX Twitter Bot - Tweet Formatters (280 Character Limit)
// ═══════════════════════════════════════════════════════════════════════════

import type {
  IndividualTweetData,
  HourlySummaryData,
  DailyRecapData,
  WeeklyLeaderboardData,
  MilestoneData,
  FirstTimeTweetData,
  BatchSummaryData,
  WhaleBatchData,
  UltraWhaleBatchData,
  FirstTimeBatchData,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const MAX_TWEET_LENGTH = 280;
const MAX_MESSAGE_LENGTH = 60; // Reserve space for other content

// ═══════════════════════════════════════════════════════════════════════════
// RANDOM HOOKS - PayX Social Voice
// ═══════════════════════════════════════════════════════════════════════════

const HOOKS = {
  // Batch Summary Hooks
  batch: [
    "People got paid on X 👀",
    "Creators eating today 🍽️",
    "The timeline is tipping 💸",
    "Money moved on X today",
    "Support dropped on creators 👇",
    "Real ones got rewarded today",
    "The feed just got funded 💰",
    "Who got paid? Let's see 👀",
  ],
  
  // Ultra-whale with message
  ultra_whale_msg: [
    "Someone just made {handle}'s day 😮💨",
    "Big energy just hit {handle} 🔥",
    "Massive support incoming for {handle}",
    "{handle} just caught a bag 💰",
    "This one's gonna make {handle} smile",
    "Real support just landed for {handle}",
    "Major tip alert for {handle} 🚨",
  ],
  
  // Ultra-whale without message
  ultra_whale_no_msg: [
    "Quiet flex on the timeline.",
    "No caption needed.",
    "Actions speak louder than tweets.",
    "This is how you support creators.",
    "Silent but powerful.",
    "Money talks.",
    "Value over virality.",
  ],
  
  // Whale with message
  whale_msg: [
    "Respect where it's due.",
    "This is what support looks like.",
    "Real recognize real.",
    "Creators winning today.",
    "Support hit different.",
    "The love is real.",
    "Good vibes and good tips.",
  ],
  
  // Whale without message
  whale_no_msg: [
    "Support hit different today.",
    "No words needed.",
    "Just value, no noise.",
    "Silent support > loud applause.",
    "The timeline is eating.",
    "Creators stay winning.",
    "Value dropped.",
  ],
  
  // First-time recipient
  first_time: [
    "First time getting paid on X 👇",
    "Welcome to the creator economy 🌟",
    "First bag secured 💼",
    "New earner just dropped",
    "Another creator joins the movement",
    "First tip, many more to come 🚀",
    "The journey starts now",
  ],
  
  // Daily recap
  daily_recap: [
    "Today on X with PayX:",
    "Daily drop 📊",
    "What happened today:",
    "The numbers are in:",
    "Today's creator economy update:",
    "End of day vibes:",
    "Today we moved:",
  ],
  
  // Volume milestone
  milestone_volume: [
    "PayX just crossed {amount} tipped on X.",
    "{amount} in creator support. Let that sink in.",
    "We just hit {amount} in total tips.",
    "{amount} moved to creators. This is just the start.",
    "Milestone unlocked: {amount} tipped 🌟",
  ],
  
  // Tip count milestone
  milestone_tips: [
    "{count} tips already.",
    "{count} moments of support.",
    "We just crossed {count} tips.",
    "{count} tips sent. {count} creators supported.",
    "Milestone: {count} tips 🎉",
  ],
  
  // Weekly leaderboard
  weekly: [
    "This week on PayX:",
    "Weekly roundup 📈",
    "7 days of creator support:",
    "The week in review:",
    "Who ran the week?",
    "Weekly wins:",
  ],
};

const CLOSERS = {
  batch: [
    "Creators don't wait for brand deals anymore.",
    "The future of monetization is here.",
    "Support > impressions.",
    "Real value, real fast.",
    "This is creator economy 2.0.",
    "Timelines are becoming economies.",
  ],
  
  ultra_whale_msg: [
    "This is what real support looks like.",
    "More than likes. Real value.",
    "Support that actually matters.",
    "This is how you back creators.",
    "Respect.",
  ],
  
  ultra_whale_no_msg: [
    "No likes needed. Just value.",
    "Actions > words.",
    "This is how it's done.",
    "Pure support.",
    "Value speaks for itself.",
  ],
  
  whale_msg: [
    "Creators > algorithms.",
    "This is the way.",
    "Support over noise.",
    "Real ones know.",
    "The culture is shifting.",
  ],
  
  whale_no_msg: [
    "That's how communities grow.",
    "No caption, just action.",
    "Support speaks.",
    "The best kind of engagement.",
    "Value over vanity.",
  ],
  
  first_time: [
    "Your content is officially monetized now.",
    "Welcome to getting paid for your work.",
    "First of many.",
    "The grind is paying off.",
    "Creator status: unlocked.",
  ],
  
  daily_recap: [
    "This is what creator economy looks like in real-time.",
    "Every day, more creators get paid.",
    "The movement grows.",
    "Tomorrow we go again.",
    "Building the future, one tip at a time.",
  ],
  
  milestone_volume: [
    "That's real money, real creators, real support.\n\nThe future isn't ads.\nIt's direct value.",
    "Real value. No middlemen.\n\nThis is just the beginning.",
    "From timelines to paychecks.\n\nCreator economy is here.",
  ],
  
  milestone_tips: [
    "That's {count} moments where someone said:\n\"Your work matters.\"\n\nPayX is turning timelines into economies.",
    "Each tip = someone saying \"I value this.\"\n\nThe culture is changing.",
    "Support in action.\n\nThis is what the future looks like.",
  ],
  
  weekly: [
    "Timelines are becoming marketplaces.",
    "Another week of creators winning.",
    "The movement keeps growing.",
    "See you next week.",
    "Creators stay eating.",
  ],
};

/**
 * Get random item from array
 */
function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get random hook for a specific type
 */
function getRandomHook(type: keyof typeof HOOKS): string {
  return getRandomItem(HOOKS[type]);
}

/**
 * Get random closer for a specific type
 */
function getRandomCloser(type: keyof typeof CLOSERS): string {
  return getRandomItem(CLOSERS[type]);
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Shorten wallet address for display
 * @param address Full wallet address
 * @returns Shortened format (0x1234...5678)
 */
function shortenAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format USDC amount for display (no decimals for cleaner look)
 * @param amount Amount in USDC
 * @returns Formatted string with $ and commas
 */
function formatAmount(amount: number): string {
  // Use whole numbers for cleaner social look, but keep decimals if amount is small
  if (amount >= 10) {
    return `$${Math.round(amount).toLocaleString('en-US')}`;
  }
  return `$${amount.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}

/**
 * Truncate message to fit within character limit
 * @param message Original message
 * @param maxLength Maximum length
 * @returns Truncated message with ellipsis if needed
 */
function truncateMessage(message: string | null, maxLength: number): string {
  if (!message) return '';
  if (message.length <= maxLength) return message;
  return message.slice(0, maxLength - 3) + '...';
}

/**
 * Validate tweet length
 * @param text Tweet text
 * @returns True if within 280 characters
 */
export function validateTweetLength(text: string): boolean {
  return text.length <= MAX_TWEET_LENGTH && text.length > 0;
}

/**
 * Ensure tweet fits within character limit
 * @param text Tweet text
 * @returns Truncated tweet if needed
 */
function ensureTweetLength(text: string): string {
  if (text.length <= MAX_TWEET_LENGTH) return text;
  return text.slice(0, MAX_TWEET_LENGTH - 3) + '...';
}

// ═══════════════════════════════════════════════════════════════════════════
// BATCH SUMMARY TWEET (4-hour windows) - LONG FORM (Twitter Premium)
// NO wallet addresses, ALL recipients tagged
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Format batch summary tweet (4-hour window)
 * Twitter Premium: Long-form, but LIMITED to avoid mention spam (max ~30 mentions)
 * @param data Batch summary data
 * @returns Tweet text (long-form, max 4000 chars)
 */
export function formatBatchSummaryTweet(data: BatchSummaryData): string {
  const MAX_MENTIONS = 25; // Twitter has ~50 mention limit, stay safe
  const MAX_CHARS = 3500; // Stay under 4000 limit
  
  let tweet = `${getRandomHook('batch')}\n\n`;

  // Only list top recipients to avoid mention spam
  const showRecipients = data.all_recipients.slice(0, MAX_MENTIONS);
  const hiddenCount = data.all_recipients.length - showRecipients.length;
  
  showRecipients.forEach(r => {
    const handle = r.handle.startsWith('@') ? r.handle : `@${r.handle}`;
    tweet += `${handle} 👉 ${formatAmount(r.amount)} USDC\n`;
  });
  
  // Show how many more if truncated
  if (hiddenCount > 0) {
    const hiddenTotal = data.all_recipients.slice(MAX_MENTIONS).reduce((sum, r) => sum + r.amount, 0);
    tweet += `+ ${hiddenCount} more (${formatAmount(hiddenTotal)} USDC)\n`;
  }

  // Narrative ending
  tweet += `\nThat's ${data.total_tips} tips in the last ${data.window_hours}h.\n\n`;
  tweet += `${getRandomCloser('batch')}\n\n`;
  tweet += `Claim 👇 ${data.claim_url}`;

  // Ensure under 4000 chars for Twitter Premium
  if (tweet.length > MAX_CHARS) {
    tweet = tweet.slice(0, MAX_CHARS - 20) + `...\n\n${data.claim_url}`;
  }
  
  return tweet;
}

// ═══════════════════════════════════════════════════════════════════════════
// WHALE BATCH TWEET ($50-99 tips) - LONG FORM
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Format whale batch tweet ($50-99 tips, every 4 hours)
 * Twitter Premium: Long-form with mention limit
 * @param data Whale batch data
 * @returns Tweet text (long-form, max 4000 chars)
 */
export function formatWhaleBatchTweet(data: WhaleBatchData): string {
  const MAX_MENTIONS = 15;
  const MAX_CHARS = 3500;
  
  let tweet = `Big tips rolling in 🐳\n\n`;
  
  const showTips = data.tips.slice(0, MAX_MENTIONS);
  const hiddenCount = data.tips.length - showTips.length;
  
  tweet += `${data.total_tips} tips between $50-99 in the last ${data.window_hours}h:\n\n`;

  showTips.forEach(tip => {
    const handle = tip.handle.startsWith('@') ? tip.handle : `@${tip.handle}`;
    tweet += `${handle} 👉 ${formatAmount(tip.amount)} USDC`;
    if (tip.message && tip.message.trim()) {
      const truncatedMsg = truncateMessage(tip.message, 40);
      tweet += ` – "${truncatedMsg}"`;
    }
    tweet += `\n`;
  });
  
  if (hiddenCount > 0) {
    tweet += `+ ${hiddenCount} more whale tips\n`;
  }

  tweet += `\n${getRandomCloser('whale_msg')}\n\n`;
  tweet += `Claim 👇 ${data.claim_url}`;

  if (tweet.length > MAX_CHARS) {
    tweet = tweet.slice(0, MAX_CHARS - 20) + `...\n\n${data.claim_url}`;
  }
  
  return tweet;
}

// ═══════════════════════════════════════════════════════════════════════════
// ULTRA-WHALE BATCH TWEET ($100+ tips) - LONG FORM
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Format ultra-whale batch tweet ($100+ tips, every 4 hours)
 * Twitter Premium: Long-form with mention limit
 * @param data Ultra-whale batch data
 * @returns Tweet text (long-form, max 4000 chars)
 */
export function formatUltraWhaleBatchTweet(data: UltraWhaleBatchData): string {
  const MAX_MENTIONS = 15;
  const MAX_CHARS = 3500;
  
  let tweet = `Massive support just dropped 🔥\n\n`;
  
  const showTips = data.tips.slice(0, MAX_MENTIONS);
  const hiddenCount = data.tips.length - showTips.length;
  
  tweet += `${data.total_tips} tip${data.total_tips > 1 ? 's' : ''} over $100 in the last ${data.window_hours}h:\n\n`;

  showTips.forEach(tip => {
    const handle = tip.handle.startsWith('@') ? tip.handle : `@${tip.handle}`;
    tweet += `${handle} 👉 ${formatAmount(tip.amount)} USDC`;
    if (tip.message && tip.message.trim()) {
      const truncatedMsg = truncateMessage(tip.message, 40);
      tweet += ` – "${truncatedMsg}"`;
    }
    tweet += `\n`;
  });
  
  if (hiddenCount > 0) {
    tweet += `+ ${hiddenCount} more massive tips\n`;
  }

  tweet += `\n${getRandomCloser('ultra_whale_msg')}\n\n`;
  tweet += `Claim 👇 ${data.claim_url}`;

  if (tweet.length > MAX_CHARS) {
    tweet = tweet.slice(0, MAX_CHARS - 20) + `...\n\n${data.claim_url}`;
  }
  
  return tweet;
}

// ═══════════════════════════════════════════════════════════════════════════
// FIRST-TIME BATCH TWEET - LONG FORM
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Format first-time recipients batch tweet (every 4 hours)
 * Twitter Premium: Long-form with mention limit
 * @param data First-time batch data
 * @returns Tweet text (long-form, max 4000 chars)
 */
export function formatFirstTimeBatchTweet(data: FirstTimeBatchData): string {
  const MAX_MENTIONS = 20;
  const MAX_CHARS = 3500;
  
  let tweet = `New creators joining the economy 🌟\n\n`;
  
  const showRecipients = data.recipients.slice(0, MAX_MENTIONS);
  const hiddenCount = data.recipients.length - showRecipients.length;
  
  tweet += `${data.total_recipients} creator${data.total_recipients > 1 ? 's' : ''} got their first tip in the last ${data.window_hours}h:\n\n`;

  showRecipients.forEach(r => {
    const handle = r.handle.startsWith('@') ? r.handle : `@${r.handle}`;
    tweet += `${handle} 👉 ${formatAmount(r.amount)} USDC\n`;
  });
  
  if (hiddenCount > 0) {
    tweet += `+ ${hiddenCount} more new creators\n`;
  }

  tweet += `\n${getRandomCloser('first_time')}\n\n`;
  tweet += `Claim 👇 ${data.claim_url}`;

  if (tweet.length > MAX_CHARS) {
    tweet = tweet.slice(0, MAX_CHARS - 20) + `...\n\n${data.claim_url}`;
  }
  
  return tweet;
}

// ═══════════════════════════════════════════════════════════════════════════
// WHALE TIP TWEET ($50-99) - DEPRECATED, use formatWhaleBatchTweet
// Kept for backwards compatibility
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Format whale tip tweet ($50-99)
 * DEPRECATED: Now using batch tweets instead
 * @param data Tip data
 * @returns Tweet text (max 280 chars)
 */
export function formatWhaleTipTweet(data: IndividualTweetData): string {
  const handle = data.handle.startsWith('@') ? data.handle : `@${data.handle}`;
  const amount = formatAmount(data.amount);

  let tweet = '';

  if (data.message && data.message.trim()) {
    const truncatedMsg = truncateMessage(data.message, 50);
    tweet = `${getRandomHook('whale_msg')}\n\n`;
    tweet += `${handle} just got ${amount} USDC on X.\n\n`;
    tweet += `"${truncatedMsg}"\n\n`;
    tweet += `${getRandomCloser('whale_msg')}\n\n`;
  } else {
    tweet = `${getRandomHook('whale_no_msg')}\n\n`;
    tweet += `${handle} received ${amount} USDC on X.\n\n`;
    tweet += `${getRandomCloser('whale_no_msg')}\n\n`;
  }

  tweet += `Claim 👇 ${data.claim_url}`;

  return ensureTweetLength(tweet);
}

// ═══════════════════════════════════════════════════════════════════════════
// ULTRA-WHALE TIP TWEET ($100+) - DEPRECATED, use formatUltraWhaleBatchTweet
// Kept for backwards compatibility
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Format ultra-whale tip tweet ($100+)
 * DEPRECATED: Now using batch tweets instead
 * @param data Tip data
 * @returns Tweet text (max 280 chars)
 */
export function formatUltraWhaleTipTweet(data: IndividualTweetData): string {
  const handle = data.handle.startsWith('@') ? data.handle : `@${data.handle}`;
  const amount = formatAmount(data.amount);

  let tweet = '';

  if (data.message && data.message.trim()) {
    const truncatedMsg = truncateMessage(data.message, 45);
    const hook = getRandomHook('ultra_whale_msg').replace('{handle}', handle);
    tweet = `${hook}\n\n`;
    tweet += `${amount} USDC sent on X.\n\n`;
    tweet += `"${truncatedMsg}"\n\n`;
    tweet += `${getRandomCloser('ultra_whale_msg')}\n\n`;
  } else {
    tweet = `${getRandomHook('ultra_whale_no_msg')}\n\n`;
    tweet += `${handle} just received ${amount} USDC on X.\n\n`;
    tweet += `${getRandomCloser('ultra_whale_no_msg')}\n\n`;
  }

  tweet += `Claim 👇 ${data.claim_url}`;

  return ensureTweetLength(tweet);
}

// ═══════════════════════════════════════════════════════════════════════════
// INDIVIDUAL TIP TWEET
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Format individual tip tweet
 * @param data Tip data
 * @returns Tweet text (max 280 chars)
 */
export function formatIndividualTipTweet(data: IndividualTweetData): string {
  const handle = data.handle.startsWith('@') ? data.handle : `@${data.handle}`;
  const amount = formatAmount(data.amount);
  const from = shortenAddress(data.from_address);
  
  let tweet = `💸 ${handle} received ${amount} USDC tip from ${from}\n\n`;

  // Add message if present (this is important!)
  if (data.message && data.message.trim()) {
    const truncatedMsg = truncateMessage(data.message, MAX_MESSAGE_LENGTH);
    tweet += `"${truncatedMsg}"\n\n`;
  }

  // Add claim URL
  tweet += `Claim your tips 👇 ${data.claim_url}`;

  return ensureTweetLength(tweet);
}

// ═══════════════════════════════════════════════════════════════════════════
// FIRST-TIME RECIPIENT TWEET - DEPRECATED, use formatFirstTimeBatchTweet
// Kept for backwards compatibility
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Format first-time recipient tweet
 * DEPRECATED: Now using batch tweets instead
 * @param data First-time tip data
 * @returns Tweet text (max 280 chars)
 */
export function formatFirstTimeTweet(data: FirstTimeTweetData): string {
  const handle = data.handle.startsWith('@') ? data.handle : `@${data.handle}`;
  const amount = formatAmount(data.amount);

  let tweet = `${getRandomHook('first_time')}\n\n`;
  tweet += `${handle} just received ${amount} USDC.\n\n`;
  
  if (data.message && data.message.trim()) {
    const truncatedMsg = truncateMessage(data.message, 40);
    tweet += `"${truncatedMsg}"\n\n`;
  }
  
  tweet += `${getRandomCloser('first_time')}\n\n`;
  tweet += `Claim 👇 ${data.claim_url}`;

  return ensureTweetLength(tweet);
}

// ═══════════════════════════════════════════════════════════════════════════
// HOURLY SUMMARY TWEET
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Format hourly summary tweet
 * @param data Hourly summary data
 * @returns Tweet text (max 280 chars)
 */
export function formatHourlySummaryTweet(data: HourlySummaryData): string {
  let tweet = `⚡ PayX | Last Hour Activity\n\n`;
  
  if (data.tips_count === 1) {
    tweet += `1 tip worth ${formatAmount(data.total_amount)} was sent`;
  } else {
    tweet += `${data.tips_count} tips worth ${formatAmount(data.total_amount)} were sent`;
  }
  
  if (data.top_recipient) {
    const handle = data.top_recipient.startsWith('@') ? data.top_recipient : `@${data.top_recipient}`;
    tweet += `\n\nTop earner: ${handle} (${formatAmount(data.top_amount)})`;
  }
  
  tweet += `\n\nTip creators you love 👇 ${data.claim_url}`;

  return ensureTweetLength(tweet);
}

// ═══════════════════════════════════════════════════════════════════════════
// DAILY RECAP TWEET
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Format daily recap tweet
 * Social voice: narrative, clean stats
 * @param data Daily recap data
 * @returns Tweet text (max 280 chars)
 */
export function formatDailyRecapTweet(data: DailyRecapData): string {
  let tweet = `${getRandomHook('daily_recap')}\n\n`;
  tweet += `${data.total_tips} tips sent\n`;
  tweet += `${formatAmount(data.total_volume)} USDC moved\n`;
  tweet += `${data.unique_recipients} creators supported\n\n`;

  if (data.top_recipients.length > 0) {
    tweet += `Top earners:\n`;
    data.top_recipients.slice(0, 2).forEach((r) => {
      const handle = r.handle.startsWith('@') ? r.handle : `@${r.handle}`;
      tweet += `${handle} 👉 ${formatAmount(r.amount)} USDC\n`;
    });
  }

  tweet += `\n${getRandomCloser('daily_recap')}\n\n`;
  tweet += data.claim_url;

  return ensureTweetLength(tweet);
}

// ═══════════════════════════════════════════════════════════════════════════
// WEEKLY LEADERBOARD TWEET - NO wallet addresses
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Format weekly leaderboard tweet
 * Social voice: competitive, game-like
 * NOTE: Only shows creator handles, NO wallet addresses
 * @param data Weekly leaderboard data
 * @returns Tweet text (max 280 chars)
 */
export function formatWeeklyLeaderboardTweet(data: WeeklyLeaderboardData): string {
  let tweet = `${getRandomHook('weekly')}\n\n`;
  tweet += `${formatAmount(data.total_volume)} USDC moved on X.\n`;
  tweet += `${data.total_tips} tips to ${data.total_creators} creators\n\n`;

  if (data.top_recipients.length > 0) {
    tweet += `Top creators:\n`;
    data.top_recipients.slice(0, 3).forEach((r, i) => {
      const handle = r.handle.startsWith('@') ? r.handle : `@${r.handle}`;
      tweet += `${i + 1}. ${handle} 👉 ${formatAmount(r.amount)} USDC\n`;
    });
  }

  tweet += `\n${getRandomCloser('weekly')}\n\n`;
  tweet += data.claim_url;

  return ensureTweetLength(tweet);
}

// ═══════════════════════════════════════════════════════════════════════════
// MILESTONE TWEET
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Format milestone celebration tweet
 * Social voice: philosophical, vision-forward
 * @param data Milestone data
 * @returns Tweet text (max 280 chars)
 */
export function formatMilestoneTweet(data: MilestoneData): string {
  let tweet = '';
  
  // Add timestamp to prevent duplicate detection
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (data.type === 'tips') {
    const hook = getRandomHook('milestone_tips')
      .replace('{count}', data.milestone.toLocaleString());
    const closer = getRandomCloser('milestone_tips')
      .replace(/{count}/g, data.milestone.toLocaleString());
    tweet = `${hook}\n\n`;
    tweet += `${closer}\n\n`;
  } else {
    const hook = getRandomHook('milestone_volume')
      .replace('{amount}', formatAmount(data.milestone) + ' USDC');
    tweet = `${hook}\n\n`;
    tweet += `${getRandomCloser('milestone_volume')}\n\n`;
  }

  tweet += `${dateStr} • ${data.claim_url}`;

  return ensureTweetLength(tweet);
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN FORMATTER FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Format tweet based on type
 * @param type Tweet type
 * @param data Tweet data
 * @returns Formatted tweet text
 */
export function formatTweet(
  type: 'individual' | 'first_time' | 'hourly' | 'daily' | 'weekly' | 'milestone' | 'batch' | 'whale' | 'ultra_whale' | 'whale_batch' | 'ultra_whale_batch' | 'first_time_batch',
  data: any
): string {
  let tweet = '';
  let isLongForm = false; // Long-form tweets don't need 280 char validation

  switch (type) {
    case 'individual':
      tweet = formatIndividualTipTweet(data as IndividualTweetData);
      break;
    case 'first_time':
      tweet = formatFirstTimeTweet(data as FirstTimeTweetData);
      break;
    case 'batch':
      tweet = formatBatchSummaryTweet(data as BatchSummaryData);
      isLongForm = true;
      break;
    case 'whale_batch':
      tweet = formatWhaleBatchTweet(data as WhaleBatchData);
      isLongForm = true;
      break;
    case 'ultra_whale_batch':
      tweet = formatUltraWhaleBatchTweet(data as UltraWhaleBatchData);
      isLongForm = true;
      break;
    case 'first_time_batch':
      tweet = formatFirstTimeBatchTweet(data as FirstTimeBatchData);
      isLongForm = true;
      break;
    case 'whale':
      tweet = formatWhaleTipTweet(data as IndividualTweetData);
      break;
    case 'ultra_whale':
      tweet = formatUltraWhaleTipTweet(data as IndividualTweetData);
      break;
    case 'hourly':
      tweet = formatHourlySummaryTweet(data as HourlySummaryData);
      break;
    case 'daily':
      tweet = formatDailyRecapTweet(data as DailyRecapData);
      break;
    case 'weekly':
      tweet = formatWeeklyLeaderboardTweet(data as WeeklyLeaderboardData);
      break;
    case 'milestone':
      tweet = formatMilestoneTweet(data as MilestoneData);
      break;
    default:
      throw new Error(`Unknown tweet type: ${type}`);
  }

  // Final validation - skip for long-form (Twitter Premium) tweets
  if (!isLongForm && !validateTweetLength(tweet)) {
    console.warn(`[Formatter] Tweet exceeds 280 chars: ${tweet.length}`);
    tweet = ensureTweetLength(tweet);
  }

  return tweet;
}
