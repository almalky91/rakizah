/**
 * Type definitions for the Skill Chatbot Assistant feature
 * 
 * This module defines all TypeScript interfaces for the dummy data system
 * and chatbot state management.
 */

/**
 * Represents a response option that students can select to continue the conversation
 * 
 * @property id - Unique identifier for the response option
 * @property text - The display text shown on the button (in Arabic)
 * @property nextNodeId - ID of the next conversation node, or null to end the conversation
 */
export interface ResponseOption {
  id: string;
  text: string;
  nextNodeId: string | null;
}

/**
 * Represents a single node in the conversation tree
 * 
 * @property id - Unique identifier for the conversation node
 * @property message - The AI response message displayed to the student (in Arabic)
 * @property options - Array of response options available at this node
 */
export interface ConversationNode {
  id: string;
  message: string;
  options: ResponseOption[];
}

/**
 * Represents a complete conversation tree for a specific skill
 * 
 * @property skillId - The ID of the skill this conversation belongs to
 * @property initialNodeId - The ID of the first node to display when the conversation starts
 * @property nodes - Map of node IDs to conversation nodes
 */
export interface SkillConversation {
  skillId: string;
  initialNodeId: string;
  nodes: Record<string, ConversationNode>;
}

/**
 * Represents the complete dummy data store containing all skill conversations
 * 
 * @property conversations - Map of skill IDs to their conversation trees
 * @property defaultClosingMessage - Default message displayed when conversation ends (in Arabic)
 */
export interface DummyDataStore {
  conversations: Record<string, SkillConversation>;
  defaultClosingMessage: string;
}

/**
 * Represents a single message in the conversation history
 * 
 * @property id - Unique identifier for the message
 * @property role - Indicates whether this is an AI response or student selection
 * @property content - The text content of the message
 * @property timestamp - When the message was added to the conversation
 */
export interface Message {
  id: string;
  role: 'ai' | 'student';
  content: string;
  timestamp: Date;
}
