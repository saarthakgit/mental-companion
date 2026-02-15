import React, { useState, useMemo } from 'react';
import { 
  View, Text, FlatList, StyleSheet, Pressable, 
  TextInput, Modal, SafeAreaView, ActivityIndicator 
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useTheme , Searchbar} from 'react-native-paper'; // MD3 Theme Hook
import { JournalStorage, JournalEntry } from '../../services/JournalStorage';
import { Ionicons } from '@expo/vector-icons';
import { JournalHeader } from '../../components/journalHeader';

export default function JournalScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  // State
  const [entryMap, setEntryMap] = useState<Record<string, JournalEntry>>({});
  const [timeline, setTimeline] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDate, setEditingDate] = useState(""); // The ID (YYYY-MM-DD)
  const [editingText, setEditingText] = useState("");
  
  // Searchquery
  const [searchQuery, setSearchQuery] = useState('');

  // 0.Searching 
  const filteredEntries = useMemo(() =>{ 
    if(!searchQuery.trim()){
      return timeline
    }
    return timeline.filter(dateIso => {
      const dateKey = dateIso.split('T')[0];
      const entry = entryMap[dateKey];
      const dateString = new Date(dateIso).toDateString().toLowerCase();
      const query = searchQuery.toLowerCase();

    // Match 1: Date text (e.g. "Feb 14")
      if (dateString.includes(query)) return true;

      // Match 2: Entry Content or Mood
      if (entry) {
        return (
          entry.content.toLowerCase().includes(query) ||
          entry.mood.toLowerCase().includes(query)
        );
      }
      
      return false; // Hide empty days if they don't match the date search
    });
  }, [searchQuery, timeline, entryMap]);

  // 1. INITIALIZE: Generate Dates & Load Data
  useFocusEffect(
    React.useCallback(() => {
      initializeData();
    }, [])
  );

  const initializeData = async () => {
    // A. Generate Timeline for last 10 days , memory efficiency
    if (timeline.length === 0) {
      const dates = [];
      for (let i = 0; i < 10; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString());
      }
      setTimeline(dates);
    }

    // B. Load Saved Memories & Convert to Map for fast lookup
    const allEntries = await JournalStorage.getAll();
    const map: Record<string, JournalEntry> = {};
    
    allEntries.forEach(entry => {
      // Assuming entry.id is YYYY-MM-DD
      map[entry.id] = entry;
    });

    setEntryMap(map);
    setLoading(false);
  };

  // 2. LOAD MORE LOGIC
  const handleLoadMore = () => {
    const lastIsoString = timeline[timeline.length - 1];
    if (!lastIsoString) return;

    const lastDateObj = new Date(lastIsoString);
    const newBatch: string[] = [];

    // Generate NEXT 30 days backwards
    for (let i = 1; i <= 10; i++) {
      const d = new Date(lastDateObj);
      d.setDate(d.getDate() - i);
      newBatch.push(d.toISOString());
    }

    setTimeline(prev => [...prev, ...newBatch]);
  };

  // 3. HANDLE EDIT/CREATE
  const handlePressDay = (dateString: string) => {
    const dateObj = new Date(dateString);
    const dateKey = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
    const entry = entryMap[dateKey];

    setEditingDate(dateKey);
    setEditingText(entry ? entry.content : ""); // Pre-fill if exists
    setModalVisible(true);
  };

  const saveEntry = async () => {
    if (!editingDate) return;

    // Use your existing storage logic
    // If it's a new entry, we might need a "mood" default. 
    // For now, let's treat manual edits as "updateContent" logic.
    
    if (entryMap[editingDate]) {
      // Update Existing
      await JournalStorage.updateContent(editingDate, editingText);
    } else {
      // Create New Manual Entry (Backfill)
      // Note: You might need to update JournalStorage to allow creating distinct entries
      // directly, or just use saveEntry with a default mood.
      await JournalStorage.saveEntry(editingText, 50, "Neutral"); 
    }

    setModalVisible(false);
    initializeData(); // Refresh
  };

  // 4. HELPER: MOOD COLOR
  const getMoodColor = (score: number) => {
    if (score > 70) return theme.colors.primary; // Mint/Green
    if (score > 50) return theme.colors.secondary; // Blue
    if (score > 35) return theme.colors.tertiary || '#FDCB6E'; // Yellow
    return theme.colors.error; // Red
  };

  // 5. RENDER ITEM (The Card)
  const renderItem = ({ item: dateIsoString }: { item: string }) => {
    const dateObj = new Date(dateIsoString);
    const dateKey = dateObj.toISOString().split('T')[0];
    const displayDate = dateObj.toDateString();
    
    const entry = entryMap[dateKey];
    const isToday = new Date().toDateString() === displayDate;

    return (
      <Pressable 
        style={[styles.card, !entry && styles.cardEmpty]} 
        onPress={() => handlePressDay(dateIsoString)}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.date, !entry && styles.dateEmpty]}>
            {isToday ? "Today" : displayDate}
          </Text>
          
          {entry && (
            <View style={[styles.moodBadge, { backgroundColor: getMoodColor(entry.score) }]}>
              <Text style={styles.moodText}>{entry.mood}</Text>
            </View>
          )}
        </View>

        {entry ? (
          <Text style={styles.preview} numberOfLines={3}>{entry.content}</Text>
        ) : (
          <Text style={styles.emptyPlaceholder}>
            No memory recorded.. Tap to write... ✍️
          </Text>
        )}
      </Pressable>
    );
  };
  // if (loading) return <ActivityIndicator style={{marginTop:50}} />;
  // 6. RENDER FOOTER
  const renderFooter = () => (
    <View style={styles.footerContainer}>
      <Pressable style={styles.loadMoreBtn} onPress={handleLoadMore}>
        <Text style={styles.loadMoreText}>Load Previous 10 Days</Text>
      </Pressable>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <JournalHeader/>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search memories..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={theme.colors.primary}
          elevation={0} // Flat style fits better
        />
      </View>
      <FlatList
        data={filteredEntries}
        keyExtractor={item => item}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        ListFooterComponent={!searchQuery ? renderFooter : null}
        showsVerticalScrollIndicator={false}
      />

      {/* EDIT MODAL */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={()=>setModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={saveEntry}>
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          </View>
          
          <Text style={styles.modalTitle}>{new Date(editingDate).toDateString()}</Text>
          <TextInput
            style={styles.input}
            multiline
            value={editingText}
            onChangeText={setEditingText}
            placeholder="What happened...?"
            placeholderTextColor="#999"
            autoFocus
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// STYLES FACTORY
const makeStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.tertiaryContainer },
  center: { justifyContent: 'center', alignItems: 'center' },

  
  // CARD STYLES
  card: { 
    backgroundColor: theme.colors.surface, 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 15,
    // Soft Shadow
    shadowColor: theme.colors.shadow, 
    shadowOpacity: 0.05, 
    shadowRadius: 5, 
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  cardEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderStyle: 'dashed', // Dashed line for empty days
    opacity: 0.7
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  
  date: { fontSize: 16, color: theme.colors.primary, fontFamily: 'SpaceMB' },
  dateEmpty: { color: theme.colors.outline },
  
  moodBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  moodText: { fontSize: 12, fontWeight: 'bold', color: 'white', fontFamily: 'SpaceMB' },
  
  preview: { fontSize: 15, color: theme.colors.onSurfaceVariant, lineHeight: 22, fontFamily: 'SchoolR' },
  emptyPlaceholder: { fontSize: 14, color: theme.colors.outline, fontStyle: 'italic', fontFamily: 'SpaceMR' },

  // FOOTER
  footerContainer: { paddingVertical: 20, alignItems: 'center' },
  loadMoreBtn: {
    backgroundColor: theme.colors.secondaryContainer,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  loadMoreText: { color: theme.colors.onSecondaryContainer, fontWeight: '600', fontFamily: 'SpaceMB' },

  // MODAL
  modalContainer: { flex: 1, backgroundColor: theme.colors.surface , marginTop : 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  cancelText: { fontSize: 18, color: theme.colors.outline, fontFamily: 'SpaceMR' },
  saveText: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary, fontFamily: 'SpaceMB' },
  modalTitle: { fontSize: 20, textAlign: 'center', marginBottom: 20, fontFamily: 'SpaceMB', color: theme.colors.primary },
  input: { fontSize: 18, padding: 20, lineHeight: 28, flex: 1, textAlignVertical: 'top', fontFamily: 'SchoolR', color: theme.colors.onSurface },
  // --- SEARCH STYLES ---
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
    borderBottomRightRadius : 40,
    borderBottomLeftRadius : 40,
  },
  searchBar: {
    backgroundColor: theme.colors.background, // Slightly darker than white
    borderRadius: 12,
    height: 50,
  },
  searchInput: {
    fontFamily: 'SpaceMR',
    fontSize: 16,
    alignSelf: 'center', // Fixes text alignment on some Androids
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 40,
    color: theme.colors.outline,
    fontFamily: 'SpaceMR',
  },
});