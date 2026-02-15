import React, { useState, useEffect ,useCallback} from 'react';
import { useTheme } from 'react-native-paper';
import { useMemo } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Dimensions, 
  SafeAreaView, RefreshControl, ActivityIndicator 
} from 'react-native';
// import {  } from 'react';
import { useFocusEffect } from 'expo-router';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { AnalysisStorage, VibeRecord } from '../../services/AnalysisStorage';
import { AnalyticsHeader } from '../../components/analyticsHeader';

const screenWidth = Dimensions.get("window").width;

export default function AnalysisScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [history, setHistory] = useState<VibeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
const loadData = async () => {
    // 1. Fetch Real Data from Storage
    const realData = await AnalysisStorage.getHistory();
    
    // 2. Define Demo Data (Backup for Hackathon Presentation)
    const NOW = Date.now();
    const DAY = 24 * 60 * 60 * 1000; // 1 Day in ms

    const dummyHistory: VibeRecord[] = [
      {
        id: '1',
        timestamp: NOW - (2 * 60 * 60 * 1000), // Today
        score: 85,
        label: "Nice Day", 
        summary: "Feeling confident after finishing the hackathon prototype!"
      },
      {
        id: '2',
        timestamp: NOW - (DAY * 1), // Yesterday
        score: 65,
        label: "Good Day",
        summary: "Stressed about bugs, but made a plan to fix them."
      },
      {
        id: '3',
        timestamp: NOW - (DAY * 2), 
        score: 40,
        label: "Average Day",
        summary: "Too many deadlines. Felt like giving up."
      },
      {
        id: '4',
        timestamp: NOW - (DAY * 3), 
        score: 30,
        label: "Poor Day",
        summary: "Panic attack about the presentation. Need sleep."
      },
      {
        id: '5',
        timestamp: NOW - (DAY * 4), 
        score: 55,
        label: "Good Day",
        summary: "Just an average day. Nothing special."
      },
      {
        id: '6',
        timestamp: NOW - (DAY * 5), 
        score: 70,
        label: "Nice Day",
        summary: "Got a lot of coding done. Feeling good."
      },
      {
        id: '7',
        timestamp: NOW - (DAY * 6), 
        score: 60,
        label: "Good Day",
        summary: "Relaxing Sunday. Ready for the week."
      }
    ];

    // 3. THE DECISION: Use Real Data if exists, otherwise show Demo Data
    if (realData.length > 0) {
      console.log("Using Real User Data");
      setHistory(realData);
    } else {
      console.log("No History Found -> Using Demo Data");
      setHistory(dummyHistory);
    }
  
    setLoading(false);
    setRefreshing(false);
  };


  useFocusEffect(
    useCallback(() => {
      console.log("you are here at stats")
      loadData();
      return () => {};
    }, [])
  );
  // --- CHART DATA PREPARATION ---
  
  // 1. Line Chart: Last 7 Sessions (or fewer)
  const recentRecords = history.slice(0, 7).reverse(); // Oldest -> Newest
  const lineData = {
    labels: recentRecords.map(() => ""), // Hide labels for clean look
    datasets: [{ data: recentRecords.length > 0 ? recentRecords.map(r => r.score) : [50] }]
  };

  // 2. Pie Chart: Label Frequency
  const categoryCounts = {
    "Poor Day": 0,
    "Average Day": 0,
    "Good Day": 0,
    "Nice Day": 0,
  };

  history.forEach(r => {
    // Normalize the label just in case AI adds whitespace
    const label = r.label.trim();
    if (categoryCounts[label] !== undefined) {
      categoryCounts[label]++;
    } else {
      // Fallback logic if AI messes up (map score to category manually)
      if (r.score <= 35) categoryCounts["Poor Day"]++;
      else if (r.score <= 50) categoryCounts["Average Day"]++;
      else if (r.score <= 70) categoryCounts["Good Day"]++;
      else categoryCounts["Nice Day"]++;
    }
  });

  const pieData = [
    {
      name: "Poor",
      population: categoryCounts["Poor Day"],
      color: "#FF7675", // Red
      legendFontColor: "#7F7F7F",
      legendFontSize: 12
    },
    {
      name: "Average",
      population: categoryCounts["Average Day"],
      color: "#FDCB6E", // Orange
      legendFontColor: "#7F7F7F",
      legendFontSize: 12
    },
    {
      name: "Good",
      population: categoryCounts["Good Day"],
      color: "#74B9FF", // Blue
      legendFontColor: "#7F7F7F",
      legendFontSize: 12
    },
    {
      name: "Nice",
      population: categoryCounts["Nice Day"],
      color: "#55EFC4", // Green
      legendFontColor: "#7F7F7F",
      legendFontSize: 12
    }
  ].filter(item => item.population > 0);

  // 3. Insight Calculation
  const averageScore = history.length > 0 
    ? Math.round(history.reduce((a, b) => a + b.score, 0) / history.length) 
    : 0;

let feedback = "I'm ready to listen whenever you're ready to talk. 🐾";

if (history.length > 0) {
  if (averageScore <= 10) {
    feedback = "Everything feels heavy; please use the SOS button or call a friend right now. 🫂";
  } else if (averageScore <= 20) {
    feedback = "have you heard of the 8-Ounce Rule? Drink some water now. 💧";
  } else if (averageScore <= 30) {
    feedback = "Energy is low; have you heard of the 2-Minute Rule? Just stretch for a moment. 🧊";
  } else if (averageScore <= 40) {
    feedback = "have you heard of the **5-4-3-2-1 Rule?  ✋";
  } else if (averageScore <= 50) {
    feedback = "You're tired; have you heard of the 20-20-20 Rule? 🪟";
  } else if (averageScore <= 60) {
    feedback = "You're doing good; have you heard of the 1-Thing Rule? Note one thing you're excited for. 📝";
  } else if (averageScore <= 70) {
    feedback = "Steady progress.. Let's play your favorite song. 🎶";
  } else if (averageScore <= 80) {
    feedback = "Thriving! Let's spread that energyy✨";
  } else if (averageScore <= 90) {
    feedback = "Peak vibes! Have you heard of the Savoring Rule?";
  } else {
    feedback = " Take a mental photo of this joy. 🌈";
  }
}

  // Inside your component
const chartConfig = {
  backgroundGradientFrom: theme.colors.surface,
  backgroundGradientTo: theme.colors.surface,
  color: (opacity = 1) => theme.colors.primary, // The Line Color
  labelColor: (opacity = 1) => theme.colors.secondary, // The Text Color
  strokeWidth: 3, // thicker line
  barPercentage: 0.5,
  useShadowColorFromDataset: false, // optional
  propsForDots: {
    r: "5",
    strokeWidth: "2",
    stroke: theme.colors.background
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <AnalyticsHeader/>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
      >

        {/* 1. INSIGHT CARD */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Overall Wellness</Text>
          <Text style={styles.bigScore}>{averageScore}%</Text>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>

        {/* 2. TREND CHART (Last 7 Sessions) */}
        <View style={styles.card}>
        <Text style={styles.sectionTitle}>Recent Trend</Text>
        {history.length > 1 ? (
          <LineChart
            data={lineData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        ) : (
          <Text style={styles.emptyText}>Need more chats to show trends.</Text>
        )}
        </View>

        {/* 3. EMOTION BREAKDOWN (Pie Chart) */}
         <View style={styles.card}>
        <Text style={styles.sectionTitle}>Emotion Breakdown</Text>
        {history.length > 0 ? (
          <PieChart
            data={pieData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"30"}
            absolute
          />
        ) : null}
          </View>
           <View style={styles.card}>
        {/* 4. DAYWISE HISTORY (Scrollable List) */}
        <Text style={styles.sectionTitle}>Session History</Text>
        {history.map((record) => (
          <View key={record.id} style={styles.historyItem}>
            <View style={styles.historyLeft}>
              <Text style={styles.historyDate}>
                {new Date(record.timestamp).toLocaleDateString()}
              </Text>
              <Text style={styles.historyTime}>
                {new Date(record.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </Text>
            </View>
            <View style={styles.historyCenter}>
              <Text style={styles.historyLabel}>{record.label}</Text>
              <Text style={styles.historySummary} numberOfLines={1}>{record.summary}</Text>
            </View>
            <View style={[styles.scoreBadge, { backgroundColor: record.score > 50 ? theme.colors.primary : theme.colors.error }]}>
              <Text style={styles.scoreText}>{record.score}</Text>
            </View>
          </View>
        ))}
        </View>
        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}



const makeStyles = (theme: any) => StyleSheet.create({
  // 1. LAYOUT
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.tertiaryContainer 
  },
  scrollContent: { 
    padding: 20,
    paddingBottom: 100 // Extra space for Tab Bar
  },
  header: { 
    fontSize: 24, 
    marginTop: 30,
    marginBottom : 20, 
    color: theme.colors.primary,
    fontFamily: 'Freak', // Bold Title
  },
  
  // 2. MAIN SCORE CARD
  card: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 24, // MD3 Rounded Corners
    alignItems: 'center',
    marginBottom: 20,
    // Soft Elevation
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: { 
    color: theme.colors.primary, // Muted Purple
    fontSize: 18, 
    marginBottom: 5,
    fontFamily: 'Freak',
    letterSpacing: 1,
  },
  bigScore: { 
    fontSize: 50, 
    color: theme.colors.primary, 
    fontFamily: 'SpaceMB',
    // borderWidth : 1
  },
  feedbackText: { 
    textAlign: 'center', 
    color: theme.colors.onSurfaceVariant, 
    marginTop: 10, 
    fontSize: 16,
    fontFamily: 'SchoolR', // Handwriting style for the "advice"
    lineHeight: 22,
  },

  // 3. SECTIONS & CHARTS
  sectionTitle: { 
    fontSize: 18, 
    marginTop: 10, 
    marginBottom: 15, 
    color: theme.colors.onBackground,
    fontFamily: 'Freak',
  },
  chart: { 
    borderRadius: 16, 
    marginVertical: 8,
    // Optional: Add border if chart blends too much
    // borderWidth: 1,
    // borderColor: theme.colors.outlineVariant 
  },
  emptyText: { 
    textAlign: 'center', 
    color: theme.colors.outline, 
    marginVertical: 20,
    fontFamily: 'Code',
  },

  // 4. HISTORY LIST ITEMS
  historyItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface, // Card look
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
    alignItems: 'center',
    // Slight shadow for separation
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  historyLeft: { 
    width: 70,
    justifyContent: 'center',
  },
  historyDate: { 
    fontSize: 12, 
    color: theme.colors.onSurface,
    fontFamily: 'SpaceMB', // Mono digits
  },
  historyTime: { 
    fontSize: 10, 
    color: theme.colors.outline,
    fontFamily: 'SpaceMR',
    marginTop: 2,
  },
  
  historyCenter: { 
    flex: 1, 
    paddingHorizontal: 15 
  },
  historyLabel: { 
    fontSize: 16, 
    color: theme.colors.onSurface,
    marginBottom: 4,
    fontFamily: 'SpaceMB',
  },
  historySummary: { 
    fontSize: 13, 
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'SchoolR', // Journal/Handwriting feel
    lineHeight: 18,
  },

  // 5. SCORE BADGE (The Circle on the right)
  scoreBadge: {
    width: 40, 
    height: 40, 
    borderRadius: 20,
    justifyContent: 'center', 
    alignItems: 'center',
    // Background color is usually dynamic (passed via style prop)
    // but we can set a default shadow here
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreText: { 
    color: theme.colors.surface, // White text usually
    fontSize: 12,
    fontFamily: 'SpaceMB', 
  },
});