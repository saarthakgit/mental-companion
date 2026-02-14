import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the shape of a Post
export type Post = {
  id: string;
  author: string;
  tag: string;
  content: string;
  hearts: number;
  replies: Reply[];
  timestamp: number;
};

export type Reply = {
  id: string;
  author: string;
  content: string;
};

// Mock Data to start with (so the feed isn't empty)
const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    author: 'Anxious Owl',
    tag: 'Academic Pressure',
    content: 'Does anyone else feel like they are failing even when they get an A? The pressure is real.',
    hearts: 12,
    replies: [],
    timestamp: Date.now(),
  },
  {
    id: '2',
    author: 'Quiet Fox',
    tag: 'Social Anxiety',
    content: 'I went to the party today but hid in the bathroom. Baby steps?',
    hearts: 24,
    replies: [],
    timestamp: Date.now() - 100000,
  },
];

const STORAGE_KEY = 'community_posts';

export const CommunityStorage = {
  // Load posts (or return initial mock data if empty)
  getPosts: async (): Promise<Post[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : INITIAL_POSTS;
    } catch (e) {
      return INITIAL_POSTS;
    }
  },

  // Save the entire list of posts
  savePosts: async (posts: Post[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch (e) {
      console.error("Failed to save posts", e);
    }
  },

  // The "Ghost" Logic: Generate a fake reply
  generateFakeReply: (postId: string): Reply => {
    const supportiveMessages = [
      "We are with you! ❤️",
      "You are stronger than you think.",
      "Sending virtual hugs! 🫂",
      "I felt this way yesterday too.",
      "Keep going, friend."
    ];
    const randomMsg = supportiveMessages[Math.floor(Math.random() * supportiveMessages.length)];
    
    return {
      id: Date.now().toString(),
      author: 'Kind Stranger',
      content: randomMsg
    };
  }
};