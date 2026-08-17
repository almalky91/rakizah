/**
 * Unit tests for dummy data utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  dummyData,
  getConversation,
  getNode,
  createFallbackConversation,
  generateMessageId,
} from '../dummyData.js';

describe('dummyData utilities', () => {
  describe('getConversation', () => {
    it('should return correct conversation for valid skillId', () => {
      const conversation = getConversation('reading-comprehension');
      
      expect(conversation).toBeDefined();
      expect(conversation.skillId).toBe('reading-comprehension');
      expect(conversation.initialNodeId).toBe('rc-node-1');
      expect(conversation.nodes).toBeDefined();
      expect(Object.keys(conversation.nodes).length).toBeGreaterThan(0);
    });

    it('should return fallback conversation for invalid skillId', () => {
      const conversation = getConversation('non-existent-skill');
      
      expect(conversation).toBeDefined();
      expect(conversation.skillId).toBe('non-existent-skill');
      expect(conversation.initialNodeId).toBe('fallback-node');
      expect(conversation.nodes['fallback-node']).toBeDefined();
      expect(conversation.nodes['fallback-node'].message).toContain('عذراً');
    });

    it('should return conversations for all predefined skills', () => {
      const skills = ['reading-comprehension', 'math-problem-solving', 'creative-writing'];
      
      skills.forEach(skillId => {
        const conversation = getConversation(skillId);
        expect(conversation.skillId).toBe(skillId);
        expect(conversation.nodes).toBeDefined();
      });
    });
  });

  describe('getNode', () => {
    it('should return correct node for valid nodeId', () => {
      const conversation = getConversation('reading-comprehension');
      const node = getNode(conversation, 'rc-node-1');
      
      expect(node).not.toBeNull();
      expect(node?.id).toBe('rc-node-1');
      expect(node?.message).toBeDefined();
      expect(node?.options).toBeDefined();
      expect(Array.isArray(node?.options)).toBe(true);
    });

    it('should return null for invalid nodeId', () => {
      const conversation = getConversation('reading-comprehension');
      const node = getNode(conversation, 'invalid-node-id');
      
      expect(node).toBeNull();
    });

    it('should return nodes with proper structure', () => {
      const conversation = getConversation('math-problem-solving');
      const node = getNode(conversation, 'math-node-1');
      
      expect(node).not.toBeNull();
      expect(typeof node?.message).toBe('string');
      expect(node?.message.length).toBeGreaterThan(0);
      expect(node?.options.length).toBeGreaterThan(0);
      
      // Check option structure
      const option = node?.options[0];
      expect(option?.id).toBeDefined();
      expect(option?.text).toBeDefined();
      expect(option).toHaveProperty('nextNodeId');
    });
  });

  describe('createFallbackConversation', () => {
    it('should create fallback conversation with correct structure', () => {
      const fallback = createFallbackConversation('test-skill');
      
      expect(fallback.skillId).toBe('test-skill');
      expect(fallback.initialNodeId).toBe('fallback-node');
      expect(fallback.nodes['fallback-node']).toBeDefined();
    });

    it('should have fallback message in Arabic', () => {
      const fallback = createFallbackConversation('test-skill');
      const message = fallback.nodes['fallback-node'].message;
      
      expect(message).toContain('عذراً');
      expect(message).toContain('المساعد');
    });

    it('should have single close option with null nextNodeId', () => {
      const fallback = createFallbackConversation('test-skill');
      const options = fallback.nodes['fallback-node'].options;
      
      expect(options.length).toBe(1);
      expect(options[0].text).toContain('حسناً');
      expect(options[0].nextNodeId).toBeNull();
    });
  });

  describe('generateMessageId', () => {
    it('should generate unique message IDs', () => {
      const id1 = generateMessageId();
      const id2 = generateMessageId();
      const id3 = generateMessageId();
      
      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it('should generate IDs with correct format', () => {
      const id = generateMessageId();
      
      expect(id).toMatch(/^msg-\d+-[a-z0-9]+$/);
      expect(id.startsWith('msg-')).toBe(true);
    });

    it('should generate IDs with timestamp component', () => {
      const beforeTimestamp = Date.now();
      const id = generateMessageId();
      const afterTimestamp = Date.now();
      
      // Extract timestamp from ID
      const parts = id.split('-');
      const idTimestamp = parseInt(parts[1]);
      
      expect(idTimestamp).toBeGreaterThanOrEqual(beforeTimestamp);
      expect(idTimestamp).toBeLessThanOrEqual(afterTimestamp);
    });

    it('should generate many unique IDs without collision', () => {
      const ids = new Set<string>();
      const count = 1000;
      
      for (let i = 0; i < count; i++) {
        ids.add(generateMessageId());
      }
      
      // All IDs should be unique
      expect(ids.size).toBe(count);
    });
  });

  describe('dummyData structure', () => {
    it('should have conversations object', () => {
      expect(dummyData.conversations).toBeDefined();
      expect(typeof dummyData.conversations).toBe('object');
    });

    it('should have defaultClosingMessage', () => {
      expect(dummyData.defaultClosingMessage).toBeDefined();
      expect(typeof dummyData.defaultClosingMessage).toBe('string');
      expect(dummyData.defaultClosingMessage.length).toBeGreaterThan(0);
      expect(dummyData.defaultClosingMessage).toContain('شكراً');
    });

    it('should have at least 3 skill conversations', () => {
      const conversationKeys = Object.keys(dummyData.conversations);
      expect(conversationKeys.length).toBeGreaterThanOrEqual(3);
    });

    it('should have valid conversation structure for all skills', () => {
      Object.entries(dummyData.conversations).forEach(([skillId, conversation]) => {
        expect(conversation.skillId).toBe(skillId);
        expect(conversation.initialNodeId).toBeDefined();
        expect(conversation.nodes).toBeDefined();
        expect(Object.keys(conversation.nodes).length).toBeGreaterThan(0);
        
        // Initial node should exist
        expect(conversation.nodes[conversation.initialNodeId]).toBeDefined();
      });
    });

    it('should have "لم أفهم" self-referencing option in initial nodes', () => {
      Object.values(dummyData.conversations).forEach(conversation => {
        const initialNode = conversation.nodes[conversation.initialNodeId];
        const selfRefOption = initialNode.options.find(
          opt => opt.text.includes('لم أفهم') && opt.nextNodeId === conversation.initialNodeId
        );
        
        expect(selfRefOption).toBeDefined();
      });
    });
  });
});
