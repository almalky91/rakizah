// Test file to validate content schema types and structure
import { describe, it, expect } from 'vitest';
import { quizzes, videos, games, type Quiz, type NewQuiz, type Video, type NewVideo, type Game, type NewGame } from '../content.js';

describe('Content Schema', () => {
  it('should export quizzes table definition', () => {
    expect(quizzes).toBeDefined();
    expect(quizzes).toHaveProperty('_');
  });

  it('should export videos table definition', () => {
    expect(videos).toBeDefined();
    expect(videos).toHaveProperty('_');
  });

  it('should export games table definition', () => {
    expect(games).toBeDefined();
    expect(games).toHaveProperty('_');
  });

  it('should have correct Quiz type structure', () => {
    // Type-level test: this will fail at compile time if types are wrong
    const mockQuiz: Quiz = {
      id: 'quiz-uuid',
      teacherId: 'teacher-uuid',
      title: 'Sample Quiz',
      questions: [
        {
          question: 'What is 2+2?',
          options: ['3', '4', '5', '6'],
          correctAnswer: 1,
        },
      ],
      createdAt: new Date(),
    };

    expect(mockQuiz).toBeDefined();
    expect(mockQuiz.title).toBe('Sample Quiz');
  });

  it('should have correct NewQuiz type for inserts', () => {
    // Type-level test for insert operations
    const newQuiz: NewQuiz = {
      id: 'new-quiz-uuid',
      teacherId: 'teacher-uuid',
      title: 'New Quiz',
      questions: [],
    };

    expect(newQuiz).toBeDefined();
    expect(newQuiz.questions).toEqual([]);
  });

  it('should have correct Video type structure', () => {
    // Type-level test for videos
    const mockVideo: Video = {
      id: 'video-uuid',
      teacherId: 'teacher-uuid',
      title: 'Educational Video',
      youtubeUrl: 'https://youtube.com/watch?v=abc123',
      views: 150,
      createdAt: new Date(),
    };

    expect(mockVideo).toBeDefined();
    expect(mockVideo.youtubeUrl).toContain('youtube.com');
  });

  it('should have correct NewVideo type for inserts', () => {
    // Type-level test for video inserts
    const newVideo: NewVideo = {
      id: 'new-video-uuid',
      teacherId: 'teacher-uuid',
      title: 'New Video',
      youtubeUrl: 'https://youtube.com/watch?v=xyz789',
    };

    expect(newVideo).toBeDefined();
  });

  it('should have correct Game type structure', () => {
    // Type-level test for games
    const mockGame: Game = {
      id: 'game-uuid',
      teacherId: 'teacher-uuid',
      title: 'Memory Game',
      gameType: 'memory',
      config: {
        difficulty: 'easy',
        cards: 12,
        timeLimit: 120,
      },
      createdAt: new Date(),
    };

    expect(mockGame).toBeDefined();
    expect(mockGame.gameType).toBe('memory');
  });

  it('should have correct NewGame type for inserts', () => {
    // Type-level test for game inserts
    const newGame: NewGame = {
      id: 'new-game-uuid',
      teacherId: 'teacher-uuid',
      title: 'Wheel of Fortune',
      gameType: 'wheel',
      config: {
        segments: 8,
        colors: ['red', 'blue', 'green'],
      },
    };

    expect(newGame).toBeDefined();
  });

  it('should handle JSON questions field correctly', () => {
    // Validate that questions JSON field accepts complex structures
    const complexQuestions = [
      {
        question: 'What is the capital of France?',
        options: ['London', 'Berlin', 'Paris', 'Madrid'],
        correctAnswer: 2,
        explanation: 'Paris is the capital city of France.',
        points: 10,
      },
      {
        question: 'Which planet is known as the Red Planet?',
        options: ['Venus', 'Mars', 'Jupiter'],
        correctAnswer: 1,
      },
    ];

    const quizWithComplexQuestions: NewQuiz = {
      id: 'complex-quiz-uuid',
      teacherId: 'teacher-uuid',
      title: 'Geography and Science Quiz',
      questions: complexQuestions,
    };

    expect(quizWithComplexQuestions.questions).toHaveLength(2);
    expect(quizWithComplexQuestions.questions[0]).toHaveProperty('explanation');
  });

  it('should handle JSON config field correctly', () => {
    // Validate that config JSON field accepts various game configurations
    const memoryGameConfig = {
      type: 'memory',
      difficulty: 'hard',
      cards: [
        { id: 1, image: 'cat.png', matched: false },
        { id: 2, image: 'dog.png', matched: false },
      ],
      timeLimit: 180,
      matchSound: 'correct.mp3',
    };

    const gameWithConfig: NewGame = {
      id: 'config-game-uuid',
      teacherId: 'teacher-uuid',
      title: 'Advanced Memory Game',
      gameType: 'memory',
      config: memoryGameConfig,
    };

    expect(gameWithConfig.config).toHaveProperty('cards');
    expect(gameWithConfig.config.cards).toHaveLength(2);
  });

  it('should enforce gameType as string', () => {
    // Validate that gameType accepts various game types
    const gameTypes = ['memory', 'wheel', 'quiz', 'puzzle'];
    
    gameTypes.forEach(type => {
      const game: NewGame = {
        id: `${type}-game-uuid`,
        teacherId: 'teacher-uuid',
        title: `${type} Game`,
        gameType: type,
        config: {},
      };
      
      expect(game.gameType).toBe(type);
    });
  });
});
