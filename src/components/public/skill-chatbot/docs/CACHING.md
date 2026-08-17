# Chatbot Conversation Caching

## Overview

The Skill Chatbot Dialog now includes intelligent conversation caching that persists conversations in the browser's localStorage. This allows students to continue their learning conversations seamlessly, even after closing the dialog or refreshing the page.

## Features

### 1. **Automatic Conversation Persistence**
- Every message exchange is automatically saved to localStorage
- Conversations are stored per skill (each skill has its own cache)
- Cache includes:
  - All messages (AI and student)
  - Full conversation history for API context
  - Current follow-up options
  - Timestamp of last update

### 2. **Seamless Conversation Restoration**
- When opening a skill dialog, the system automatically checks for cached conversations
- If a valid cache exists (not expired), it restores:
  - Complete message history
  - Conversation context for AI
  - Last available follow-up questions
- No loading state shown when restoring from cache (instant)

### 3. **Cache Expiration**
- Conversations expire after **24 hours** (configurable)
- Expired caches are automatically cleared
- Ensures conversations remain relevant and don't contain outdated information

### 4. **Manual Conversation Reset**
- "محادثة جديدة" (New Conversation) button appears when messages exist
- Clicking it:
  - Clears the cached conversation for that skill
  - Starts a fresh conversation with a new AI explanation
  - Useful when students want to start over

## Technical Implementation

### Cache Storage Structure

```typescript
interface CachedConversation {
  messages: Message[];              // UI messages
  conversationHistory: Array<{      // API context
    role: 'user' | 'assistant';
    content: string;
  }>;
  currentOptions: ResponseOption[]; // Follow-up questions
  timestamp: number;                // Cache creation time
}
```

### Storage Keys

Conversations are stored with keys in the format:
```
chatbot_conversation_{skillId}
```

Example:
```
chatbot_conversation_reading-comprehension
chatbot_conversation_math-problem-solving
```

### Cache Functions

#### `getCachedConversation(skillId: string)`
- Retrieves cached conversation from localStorage
- Checks expiration (24 hours)
- Converts serialized timestamps back to Date objects
- Returns `null` if not found or expired

#### `saveCachedConversation(skillId, messages, conversationHistory, options)`
- Saves conversation state to localStorage
- Updates timestamp
- Triggered automatically after each message exchange

#### `clearCachedConversation(skillId: string)`
- Removes cached conversation from localStorage
- Triggered when "New Conversation" button is clicked

## User Experience Flow

### Scenario 1: First Time Opening Skill Dialog
```
1. Student clicks skill card
2. Dialog opens, shows loading animation
3. AI generates initial explanation
4. Conversation is cached
5. Follow-up options displayed
```

### Scenario 2: Reopening Same Skill Dialog (Within 24 Hours)
```
1. Student clicks same skill card again
2. Dialog opens, checks cache
3. Finds valid cached conversation
4. Instantly restores complete conversation
5. Student can continue where they left off
```

### Scenario 3: Starting New Conversation
```
1. Student clicks "محادثة جديدة" button
2. Cache is cleared for this skill
3. Fresh AI explanation is requested
4. New conversation begins
```

### Scenario 4: After 24 Hours
```
1. Student opens skill dialog
2. System checks cache
3. Finds expired cache (>24 hours old)
4. Automatically clears old cache
5. Requests fresh AI explanation
```

## Benefits

### For Students
- ✅ **Continuity**: Can pick up learning exactly where they left off
- ✅ **No Data Loss**: Conversations persist across page refreshes
- ✅ **Faster Experience**: Instant restoration from cache (no API call)
- ✅ **Flexibility**: Option to start fresh when needed

### For The System
- ✅ **Reduced API Calls**: Restoring from cache doesn't hit the DeepSeek API
- ✅ **Better Performance**: Instant load time for cached conversations
- ✅ **Cost Savings**: Fewer API calls = lower costs
- ✅ **Improved UX**: Seamless experience without loading delays

## Configuration

### Cache Duration
The cache duration is controlled by the `CACHE_DURATION` constant:

```typescript
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
```

To change the cache duration:
```typescript
// 12 hours
const CACHE_DURATION = 12 * 60 * 60 * 1000;

// 7 days
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

// 1 hour (for testing)
const CACHE_DURATION = 60 * 60 * 1000;
```

## Storage Considerations

### localStorage Limits
- Most browsers support 5-10 MB per domain
- Each conversation typically uses 10-50 KB
- System can store hundreds of skill conversations
- Old/expired conversations are automatically cleaned up

### Data Structure Size
```
Typical conversation (10 exchanges):
- Messages: ~5 KB
- History: ~3 KB
- Options: ~1 KB
- Total: ~9 KB
```

## Privacy & Security

- ✅ **Local Storage Only**: Conversations are stored in the browser (not server)
- ✅ **Per-Device**: Cache is specific to the browser/device being used
- ✅ **Auto-Expiration**: Conversations automatically expire after 24 hours
- ✅ **User Control**: "New Conversation" button allows manual clearing
- ✅ **No Personal Data**: Only conversation content is stored (no user IDs)

## Testing the Feature

### Test Case 1: Cache Creation
```
1. Open a skill dialog
2. Wait for AI response
3. Open browser DevTools → Application → Local Storage
4. Verify key exists: chatbot_conversation_{skillId}
5. Verify data contains messages, history, options
```

### Test Case 2: Cache Restoration
```
1. Have a conversation (exchange 2-3 messages)
2. Close the dialog
3. Reopen the same skill dialog
4. Verify conversation is instantly restored
5. Verify all messages appear
6. Verify follow-up options are available
```

### Test Case 3: New Conversation Button
```
1. Open skill dialog with cached conversation
2. Verify "محادثة جديدة" button appears
3. Click the button
4. Verify conversation resets
5. Verify new AI explanation is loaded
```

### Test Case 4: Cache Expiration
```
1. Manually set timestamp to 25 hours ago in DevTools
2. Open skill dialog
3. Verify expired cache is cleared
4. Verify fresh AI explanation is loaded
```

## Debugging

### Check Cache Contents
```javascript
// In browser console
const skillId = 'your-skill-id';
const cacheKey = `chatbot_conversation_${skillId}`;
const cached = localStorage.getItem(cacheKey);
console.log(JSON.parse(cached));
```

### Clear All Chatbot Caches
```javascript
// In browser console
Object.keys(localStorage)
  .filter(key => key.startsWith('chatbot_conversation_'))
  .forEach(key => localStorage.removeItem(key));
```

### Verify Cache Age
```javascript
// In browser console
const skillId = 'your-skill-id';
const cacheKey = `chatbot_conversation_${skillId}`;
const cached = JSON.parse(localStorage.getItem(cacheKey));
const ageInHours = (Date.now() - cached.timestamp) / (1000 * 60 * 60);
console.log(`Cache age: ${ageInHours.toFixed(2)} hours`);
```

## Future Enhancements

Possible improvements for the caching system:

1. **Cloud Sync** (Optional)
   - Save conversations to database for cross-device access
   - Requires user authentication
   - Would enable: continue conversation on phone after starting on computer

2. **Export/Import**
   - Allow students to export conversation as PDF or text
   - Useful for review and study purposes

3. **Search History**
   - Search through cached conversations
   - Find specific topics discussed

4. **Conversation Analytics**
   - Track which skills students spend most time on
   - Identify common questions
   - Improve AI responses based on patterns

5. **Selective Caching**
   - User preference to enable/disable caching
   - Privacy mode that doesn't cache

## Troubleshooting

### Cache Not Saving
- Check browser localStorage is enabled
- Verify not in private/incognito mode
- Check storage quota not exceeded

### Cache Not Restoring
- Verify cache hasn't expired (check timestamp)
- Check cache key format is correct
- Verify JSON parsing doesn't fail (try in console)

### Performance Issues
- Clear old caches if many exist
- Consider reducing CACHE_DURATION
- Check total localStorage size

## Summary

The conversation caching feature provides a seamless, persistent learning experience for students while reducing API costs and improving performance. It's transparent to users (works automatically) but provides manual controls when needed.

**Key Takeaway**: Students can now have continuous, context-aware conversations with the AI tutor that persist across sessions, creating a more natural and effective learning experience.
