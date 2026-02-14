import React, { useState, useRef , useEffect , useCallback } from 'react';
import { useTheme } from 'react-native-paper';
import { AnalysisStorage } from '../../services/AnalysisStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { JournalStorage } from '../../services/JournalStorage';
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
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { sendMessageToPet , analyzeSession } from '../../services/geminichatsetup';
import { useMemo } from 'react';
// Define the shape of a message
type Message = {
  id: string;
  text: string;
  sender: 'user' | 'pet';
};

const HomeScreen = () => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [modalVisible, setModalVisible] = useState(false);
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [vibe, setVibe] = useState({ score: 50, label: "Ready to Chat 🐾", summary: "Say hello to start!" });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // Auto-scroll to bottom of chat
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async () => {
    if (!msg.trim()) return;

    const userText = msg;
    setMsg(""); 
    setLoading(true);

    // FIX 1: Explicitly tell TS this object is a 'Message'
    const newUserMsg: Message = { 
      id: Date.now().toString(), 
      text: userText, 
      sender: 'user' 
    };
    
    // Optimistically update UI
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);

    // 2. CREATE THE CONTEXT STRING
    const recentHistory = updatedMessages.slice(-3); 
    
    const contextString = recentHistory
      .map(m => `${m.sender === 'user' ? 'User' : 'Pet'}: ${m.text}`)
      .join('\n');

    try {
      // 3. Send Input + Context
      const aiResponse = await sendMessageToPet(userText, contextString);
      
      // FIX 2: Explicitly tell TS this object is a 'Message'
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: aiResponse, 
        sender: 'pet' 
      };
      
      setMessages(prev => [...prev, aiMsg]);
      const currentTimestamp = Date.now().toString();
      await AsyncStorage.setItem('last_message_time', currentTimestamp);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const handleCloseChat = async () => {
    console.log("modal closed fn called")
    setModalVisible(false); // 1. Close Modal immediately
    
    if (messages.length < 2) return; // Don't analyze empty chats

    setIsAnalyzing(true); // 2. Show loading on Home Screen

    // 3. Prepare History String
    const historyText = messages
      .slice(-10) // Only analyze last 10 messages for speed
      .map(m => `${m.sender}: ${m.text}`)
      .join('\n');

    // 4. Call Gemini
    console.log("calling api")
    const result = await analyzeSession(historyText);
    const journalContent = result.journal_snippet || "Recorded a session today.";
    await JournalStorage.saveEntry(
    journalContent, 
    result.score, 
    result.label
  );
  //   await AnalysisStorage.saveRecord({
  //   score: result.score,
  //   label: result.label,
  //   summary: result.summary
  // });
    await loadTodayJournal()
    setVibe(result); // 5. Update UI
    setIsAnalyzing(false);
    setMessages([])
  };
  // Inside HomeScreen.tsx
const [todayJournal, setTodayJournal] = useState<any>(null);

const loadTodayJournal = async () => {
  const entry = await JournalStorage.getTodayEntry();
  setTodayJournal(entry);
};

// Load on mount
useFocusEffect(
  useCallback(() => {
    loadTodayJournal();
  }, [])
);


const checkAndResetChat = async () => {
  try {
    const lastMsgTime = await AsyncStorage.getItem('last_message_time');
    
    if (lastMsgTime) {
      const lastDate = new Date(parseInt(lastMsgTime)).toDateString();
      const today = new Date().toDateString();

      // IF IT'S A NEW DAY:
      if (lastDate !== today) {
        console.log("☀️ New Day Detected! Resetting...");

        // 1. Create the Greeting
        const greetingMsg = {
          id: Date.now().toString(),
          text: "It's a brand new day! ☀️ How are you feeling?",
          sender: 'pet' // or 'isomer'
        } as Message;

        // 2. Set State (One call is enough)
        setMessages([greetingMsg]);

        // 3. IMPORTANT: Update Storage IMMEDIATELY
        // This prevents the loop! Now 'last_message_time' is Today.
        await AsyncStorage.setItem('last_message_time', Date.now().toString());
        await AsyncStorage.setItem('current_chat_session', JSON.stringify([greetingMsg]));
      }
    }
  } catch (error) {
    console.log("Error resetting chat:", error);
  }
};

// Triggers every time you open/close the modal
useEffect(() => {
  if (modalVisible) { // Only check when OPENING, not closing
    checkAndResetChat();
  }
}, [modalVisible]);

  return (
    <SafeAreaView style={styles.container}>
      
      {/* --- HOME SCREEN CONTENT --- */}
      <View style={styles.contentContainer}>
        <View style={styles.petPlaceholder}>
          <Text style={styles.placeholderText}>[ Pet Animation Here ]</Text>
        </View>
        <View style={styles.teaserContainer}>
        {isAnalyzing ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator color="#6C5CE7" />
            <Text style={{ marginTop: 10, color: '#999' }}>Analyzing your vibe...</Text>
          </View>
        ) : (
          <>
            <View style={styles.teaserHeader}>
              <Text style={styles.teaserTitle}>Current Vibe</Text>
              <Text style={styles.teaserValue}>{vibe.label}</Text>
            </View>
            
            {/* Visual Score Bar */}
            <View style={styles.progressBarBg}>
              <View style={[
                styles.progressBarFill, 
                { width: `${vibe.score}%`, backgroundColor: vibe.score > 50 ? '#6C5CE7' : '#FF7675' }
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
      </View>

      {/* --- BOTTOM TRIGGER INPUT --- */}
      <Pressable 
        style={styles.fakeInputContainer} 
        onPress={() =>{ 
          console.log("loading chat...")
          setModalVisible(true)}}
      >
        <Text style={styles.fakeInputText}>Talk to me...</Text>
      </Pressable>
          {todayJournal && (
  <View style={styles.journalCard}>
    <View style={styles.journalHeader}>
      <Text style={styles.journalTitle}>Today's Story 📖</Text>
      <Pressable onPress={() => router.push('/(tabs)/journal')}>
        <Text style={styles.editLink}>Edit</Text>
      </Pressable>
    </View>
    
    <Text style={styles.journalContent} numberOfLines={3}>
      {todayJournal.content}
    </Text>
    
    <Pressable 
      style={styles.readMoreBtn}
      onPress={() => router.push('/(tabs)/journals')}
    >
      <Text style={styles.readMoreText}>View All Memories →</Text>
    </Pressable>
  </View>
)}
      {/* --- THE CHAT MODAL --- */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)
          }
      >
        {/* SAFE AREA IS THE ROOT */}
        <SafeAreaView style={styles.modalContainer}>
          
          {/* HEADER (Stays fixed at top) */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chat with Isomer</Text>
            <Pressable onPress={() => handleCloseChat()} style={styles.closeBtn}>
              <Text style={styles.closeText}>End Chat</Text>
            </Pressable>
          </View>

          {/* KEYBOARD AVOIDING VIEW WRAPS THE LIST AND INPUT */}
          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
            
            {/* 1. CHAT LIST (Takes all available space) */}
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

            {/* 2. INPUT AREA (Sits at the bottom) */}
            <View style={styles.inputArea}>
              <TextInput 
                style={styles.textInput}
                value={msg}
                onChangeText={setMsg}
                placeholder="Type your message..."
                placeholderTextColor="#999"
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
  // 1. MAIN CONTAINERS
  container: {
    flex: 1,
    backgroundColor: theme.colors.background, // MD3 Background
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // 2. TYPOGRAPHY (Titles = SpaceMB)
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: theme.colors.primary, // User Request
    fontFamily: 'SpaceMB',       // Bold Mono
  },

  // 3. PET AREA
  petPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: theme.colors.surfaceVariant, // Softer than grey
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.outline,
  },
  placeholderText: {
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'SchoolR', // Handwriting font
  },

  // 4. FAKE INPUT (The Trigger)
  fakeInputContainer: {
    backgroundColor: theme.colors.surface, // Card color
    margin: 20,
    padding: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    // Soft MD3 Shadow
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fakeInputText: {
    color: theme.colors.secondary,
    fontSize: 16,
    fontFamily: 'SpaceMR', // Regular Mono
  },

  // 5. CHAT MODAL
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surface,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 18,
    color: theme.colors.onSurface,
    fontFamily: 'SpaceMB', // Bold Mono
  },
  closeBtn: {
    padding: 5,
  },
  closeText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontFamily: 'SpaceMR', 
  },

  // 6. CHAT BUBBLES (Chats = SpaceMR)
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary, // MD3 Primary
    borderBottomRightRadius: 2,
  },
  petBubble: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.secondaryContainer, // MD3 Secondary Container
    borderBottomLeftRadius: 2,
  },
  userText: {
    color: theme.colors.onPrimary, // Text on Primary is usually White
    fontSize: 16,
    fontFamily: 'SpaceMR',
  },
  petText: {
    color: theme.colors.onSecondaryContainer, // Darker text for readability
    fontSize: 16,
    fontFamily: 'SpaceMR',
  },

  // 7. EMPTY STATES
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: theme.colors.outline,
    fontSize: 16,
    fontFamily: 'SchoolR', // Description font
  },

  // 8. INPUT AREA
  inputArea: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    color: theme.colors.onSurface,
    fontFamily: 'SpaceMR',
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnText: {
    color: theme.colors.onPrimary,
    fontFamily: 'SpaceMB',
  },

  // 9. TEASER CARD (Vibe Check)
  teaserContainer: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: theme.colors.surface, // Card
    borderRadius: 20,
    // MD3 Elevation Level 2
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  teaserHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  teaserTitle: { 
    fontSize: 16, 
    color: theme.colors.secondary, 
    fontFamily: 'SpaceMB',
  },
  teaserValue: { 
    fontSize: 18, 
    color: theme.colors.primary, 
    fontFamily: 'SpaceMB',
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
    // Note: Background color for fill is usually handled inline based on score
  },
  summaryText: { 
    fontSize: 14, 
    color: theme.colors.onSurfaceVariant, 
    marginBottom: 15, 
    fontFamily: 'SchoolR', // Handwriting style for summary
  },
  detailBtn: { 
    alignSelf: 'flex-end' 
  },
  detailBtnText: { 
    color: theme.colors.primary, 
    fontSize: 14,
    fontFamily: 'SpaceMB' 
  },

  // 10. JOURNAL CARD
  journalCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  journalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  journalTitle: {
    fontSize: 18,
    color: theme.colors.onSurface,
    fontFamily: 'SpaceMB',
  },
  editLink: {
    fontSize: 14,
    color: theme.colors.primary,
    fontFamily: 'SpaceMB',
  },
  journalContent: {
    fontSize: 15,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: 15,
    fontFamily: 'SchoolR', // Handwriting style for diary
  },
  readMoreBtn: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.secondaryContainer,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  readMoreText: {
    fontSize: 12,
    color: theme.colors.onSecondaryContainer,
    fontFamily: 'SpaceMB',
  },
});

