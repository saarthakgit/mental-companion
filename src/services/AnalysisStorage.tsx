import AsyncStorage from '@react-native-async-storage/async-storage';

export type VibeRecord = {
  id: string;
  timestamp: number; // Date.now()
  score: number;     // 0-100
  label: string;     // "Happy", "Anxious"
  summary: string;
};

const KEY = 'vibe_history';

export const AnalysisStorage = {
  // Save a new session
  saveRecord: async (vibe: Omit<VibeRecord, 'id' | 'timestamp'>) => {
    try {
      const newRecord: VibeRecord = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        ...vibe
      };
      
      const existing = await AnalysisStorage.getHistory();
      const updated = [newRecord, ...existing]; // Newest first
      
      await AsyncStorage.setItem(KEY, JSON.stringify(updated));
      return newRecord;
    } catch (e) {
      console.error("Save failed", e);
    }
  },

  // Get all history
  getHistory: async (): Promise<VibeRecord[]> => {
    try {
      const data = await AsyncStorage.getItem(KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  // Helper: Get Weekly Average
  getWeeklyStats: async () => {
    const history = await AnalysisStorage.getHistory();
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    const weeklyRecords = history.filter(r => r.timestamp > oneWeekAgo);
    if (weeklyRecords.length === 0) return { avg: 0, trend: [] };

    const total = weeklyRecords.reduce((sum, r) => sum + r.score, 0);
    
    // Return average AND the data points for the graph
    return {
      avg: Math.round(total / weeklyRecords.length),
      // Reverse to show oldest -> newest on graph
      trend: weeklyRecords.slice(0, 7).reverse().map(r => r.score) 
    };
  }
};