import React, { useState, useRef , useEffect , useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  StyleSheet, 
  Modal, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  SafeAreaView,
  ActivityIndicator,
  ScrollView // Import ScrollView
} from 'react-native';
import LottieView from 'lottie-react-native';
import { useTheme } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Services & Components
import { EMPTY_CHAT_PROMPTS } from '../../services/randomPrompts';
import { AnalysisStorage } from '../../services/AnalysisStorage';
import { JournalStorage } from '../../services/JournalStorage';
import { sendMessageToPet , analyzeSession } from '../../services/geminichatsetup';
import { HomeHeader } from '../../components/Header';
import { SOSButton } from '../../components/SOS';

// Define the shape of a message
type Message = {
  id: string;
  text: string;
  sender: 'user' | 'pet';
};

const CAT_ANIMATIONS = [
  require('../../assets/animations/cat1.json'),
  require('../../assets/animations/cat2.json'),
  require('../../assets/animations/cat3.json'),
  require('../../assets/animations/cat4.json'),
  require('../../assets/animations/cat5.json'),
];

const HomeScreen = () => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const router = useRouter();
  
  // State
  const [currentCat, setCurrentCat] = useState(CAT_ANIMATIONS[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [randomPrompt, setRandomPrompt] = useState(EMPTY_CHAT_PROMPTS[0]);
  const [vibe, setVibe] = useState({ score: 50, label: "", summary: "Say hello to start!" });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [todayJournal, setTodayJournal] = useState<any>(null);

  const flatListRef = useRef<FlatList>(null);

  // 1. Load Journal & Prompts on Focus
  useFocusEffect(
    useCallback(() => {
      const randomIndex = Math.floor(Math.random() * EMPTY_CHAT_PROMPTS.length);
      setRandomPrompt(EMPTY_CHAT_PROMPTS[randomIndex]);
      loadTodayJournal();
    }, [])
  );

  const loadTodayJournal = async () => {
    const entry = await JournalStorage.getTodayEntry();
    setTodayJournal(entry);
  };

  // 2. Randomize Cat on Mount/Modal Close
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * CAT_ANIMATIONS.length);
    setCurrentCat(CAT_ANIMATIONS[randomIndex]);
  }, [modalVisible]);

  // 3. Reset Chat Logic (New Day)
  useEffect(() => {
    if (modalVisible) { 
      checkAndResetChat();
    }
  }, [modalVisible]);

  const checkAndResetChat = async () => {
    try {
      const lastMsgTime = await AsyncStorage.getItem('last_message_time');
      if (lastMsgTime) {
        const lastDate = new Date(parseInt(lastMsgTime)).toDateString();
        const today = new Date().toDateString();

        if (lastDate !== today) {
          console.log("☀️ New Day Detected! Resetting...");
          const greetingMsg: Message = {
            id: Date.now().toString(),
            text: "It's a brand new day! ☀️ How are you feeling?",
            sender: 'pet' 
          };
          setMessages([greetingMsg]);
          await AsyncStorage.setItem('last_message_time', Date.now().toString());
          await AsyncStorage.setItem('current_chat_session', JSON.stringify([greetingMsg]));
        }
      }
    } catch (error) {
      console.log("Error resetting chat:", error);
    }
  };

  // 4. Chat Handlers
  const handleSend = async () => {
    if (!msg.trim()) return;
    const userText = msg;
    setMsg(""); 
    setLoading(true);

    const newUserMsg: Message = { id: Date.now().toString(), text: userText, sender: 'user' };
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);

    const recentHistory = updatedMessages.slice(-3); 
    const contextString = recentHistory.map(m => `${m.sender === 'user' ? 'User' : 'Pet'}: ${m.text}`).join('\n');

    try {
      const aiResponse = await sendMessageToPet(userText, contextString);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), text: aiResponse, sender: 'pet' };
      setMessages(prev => [...prev, aiMsg]);
      await AsyncStorage.setItem('last_message_time', Date.now().toString());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseChat = async () => {
    setModalVisible(false);
    if (messages.length < 2) return; 

    setIsAnalyzing(true);
    const historyText = messages.slice(-10).map(m => `${m.sender}: ${m.text}`).join('\n');
    
    console.log("calling api");
    const result = await analyzeSession(historyText);
    const journalContent = result.journal_snippet || "Recorded a session today.";
    
    await JournalStorage.saveEntry(journalContent, result.score, result.label);
    await AnalysisStorage.saveRecord({ score: result.score, label: result.label, summary: result.summary });
    await loadTodayJournal();
    
    setVibe(result); 
    setIsAnalyzing(false);
    setMessages([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header stays fixed at top */}
      <HomeHeader/>
    <SOSButton/>
      {/* Main Scrollable Content */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* --- 1. CHAT TRIGGER (Moved to Top) --- */}
        <View style={styles.sectionContainer}>
          <Pressable 
            style={styles.fakeInputContainer} 
            onPress={() => setModalVisible(true)}
          >
            <View>
          <Text style={{fontSize: 18,
    color: theme.colors.primary,
    fontFamily: 'Freak',
    marginBottom:5}}>Tap to Chat 🐱</Text>

            <Text style={styles.fakeInputText}>{randomPrompt}</Text>
            </View>
            {/* Cat Animation inside the card */}
            <View style={styles.catWrapper}>
              <LottieView
                source={currentCat}
                autoPlay
                loop
                style={{ width: 90, height: 90 }}
              />
            </View>
          </Pressable>
        </View>


        {/* --- 2. VIBE ANALYSIS --- */}
        <View style={styles.teaserContainer}>
          {isAnalyzing ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={{ marginTop: 10, color: theme.colors.outline }}>Analyzing your vibe...</Text>
            </View>
          ) : (
            <>
              <View style={styles.teaserHeader}>
                <Text style={styles.cardTitle}>Current Vibe:</Text>
                <Text style={styles.teaserValue}>{vibe.label}</Text>
              </View>
              
              <View style={styles.progressBarBg}>
                <View style={[
                  styles.progressBarFill, 
                  { width: `${vibe.score}%`, backgroundColor: vibe.score > 50 ? theme.colors.primary : theme.colors.error }
                ]} />
              </View>

              <Text style={styles.summaryText}>"{vibe.summary}"</Text>

              <Pressable 
                style={styles.detailBtn}
                onPress={() => router.push('/(tabs)/analysis')}
              >
                <Text style={styles.detailBtnText}>See Detailed Stats →</Text>
              </Pressable>
            </>
          )}
        </View>


        {/* --- 3. JOURNAL CARD --- */}
        <View style={styles.journalCard}>
          <View style={styles.journalHeader}>
            <Text style={styles.cardTitle}>Today's Story:</Text>
            <Pressable onPress={() => router.push('/(tabs)/journals')}>
              <Text style={styles.editLink}>Edit</Text>
            </Pressable>
          </View>

          {todayJournal ? (
            <Text style={styles.journalContent} numberOfLines={3}>
              {todayJournal.content}
            </Text>
          ) : (
            <Text style={[styles.journalContent, { opacity: 0.6 }]} numberOfLines={3}>
              No memory recorded for today. 
              Tell me via chat or tap edit to write yourself!
            </Text>
          )}

          <Pressable 
            style={styles.readMoreBtn}
            onPress={() => router.push('/(tabs)/journals')}
          >
            <Text style={styles.readMoreText}>View All Memories →</Text>
          </Pressable>
        </View>

      </ScrollView>

      {/* --- CHAT MODAL (Full Screen Overlay) --- */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chat with Kitti</Text>
            <Pressable onPress={() => handleCloseChat()} style={styles.closeBtn}>
              <Text style={styles.closeText}>End Chat</Text>
            </Pressable>
          </View>

          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          >
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={item => item.id}
              contentContainerStyle={{ padding: 20 }}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              renderItem={({ item }) => (
                <View style={[
                  styles.messageBubble, 
                  item.sender === 'user' ? styles.userBubble : styles.petBubble
                ]}>
                  <Text style={item.sender === 'user' ? styles.userText : styles.petText}>
                    {item.text}
                  </Text>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No messages yet. Say hello!</Text>
                </View>
              }
            />

            <View style={styles.inputArea}>
              <TextInput 
                style={styles.textInput}
                value={msg}
                onChangeText={setMsg}
                placeholder="Type your message..."
                placeholderTextColor={theme.colors.outline}
                autoFocus={true}
              />
              <Pressable 
                onPress={handleSend} 
                style={({pressed}) => [
                  styles.sendBtn, 
                  { opacity: pressed || !msg.trim() ? 0.5 : 1 }
                ]}
                disabled={!msg.trim() || loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.sendBtnText}>Send</Text>
                )}
              </Pressable>
            </View>

          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
};

export default HomeScreen;

const makeStyles = (theme: any) => StyleSheet.create({
  // 1. LAYOUT
  container: {
    flex: 1,
    backgroundColor: theme.colors.tertiaryContainer,
  },
  scrollContent: {
    padding: 20,
    gap: 24, // Defines space between sections
    paddingBottom: 100, // Extra space at bottom
  },
  sectionContainer: {
    width: '100%',
    marginTop : 20
  },

  // 2. TYPOGRAPHY
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
    color: theme.colors.primary,
    fontFamily: 'Freak',
    paddingLeft: 5,
  },
  cardTitle: { 
    fontSize: 18, 
    color: theme.colors.primary, 
    fontFamily: 'Freak',
  },

  // 3. INPUT CARD (Trigger)
  fakeInputContainer: {
    backgroundColor: theme.colors.surface, 
    
    padding: 20,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    height: 110,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden', // Keeps cat cut off cleanly if needed
  },
  fakeInputText: {
    color: theme.colors.onSurfaceVariant,
    opacity: 0.7,
    fontSize: 16,
    width: '70%',
    fontFamily: 'SchoolR', 
    lineHeight: 22,
  },
  catWrapper: {
    position : "absolute",
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    right : 20, // Pl cat slightly to edge
  },

  // 4. VIBE CARD
  teaserContainer: {
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  teaserHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  teaserValue: { 
    fontSize: 18, 
    color: theme.colors.primary, 
    fontFamily: 'Freak',
    // opacity : 0.7
  },
  progressBarBg: { 
    height: 8, 
    backgroundColor: theme.colors.surfaceVariant, 
    borderRadius: 4, 
    marginBottom: 15 
  },
  progressBarFill: { 
    height: '100%', 
    borderRadius: 4,
  },
  summaryText: { 
    fontSize: 15, 
    color: theme.colors.onSurfaceVariant, 
    marginBottom: 15, 
    fontFamily: 'SchoolR', 
    lineHeight: 22,
  },
  detailBtn: { 
    alignSelf: 'flex-end' 
  },
  detailBtnText: { 
    color: theme.colors.primary, 
    fontSize: 14,
    fontFamily: 'Freak' 
  },

  // 5. JOURNAL CARD
  journalCard: {
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  journalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  editLink: {
    fontSize: 14,
    color: theme.colors.primary,
    fontFamily: 'Freak',
  },
  journalContent: {
    fontSize: 15,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 24,
    marginBottom: 15,
    fontFamily: 'SchoolR', 
  },
  readMoreBtn: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.secondaryContainer,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  readMoreText: {
    fontSize: 12,
    color: theme.colors.onSecondaryContainer,
    fontFamily: 'Freak',
  },

  // 6. MODAL & CHAT STYLES
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surface,
  },
  modalTitle: {
    fontSize: 20,
    color: theme.colors.onSurface,
    fontFamily: 'Freak',
  },
  closeBtn: {
    padding: 5,
  },
  closeText: {
    color: theme.colors.error, // Changed to Error color for "End"
    fontSize: 16,
    fontFamily: 'Freak', 
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 20,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  petBubble: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.secondaryContainer,
    borderBottomLeftRadius: 4,
  },
  userText: {
    color: theme.colors.onPrimary,
    fontSize: 16,
    fontFamily: 'SchoolR',
    lineHeight: 22,
  },
  petText: {
    color: theme.colors.onSecondaryContainer,
    fontSize: 16,
    fontFamily: 'SchoolR',
    lineHeight: 22,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: theme.colors.outline,
    fontSize: 16,
    fontFamily: 'SchoolR',
  },
  inputArea: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    color: theme.colors.onSurface,
    fontFamily: 'SchoolR',
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: 50,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnText: {
    color: theme.colors.onPrimary,
    fontFamily: 'SpaceMB',
    fontSize: 12
  },
});