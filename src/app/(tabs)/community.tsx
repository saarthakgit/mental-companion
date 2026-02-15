import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Pressable, 
  Modal, 
  TextInput, 
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper'; 
import { CommunityStorage, Post } from '../../services/communityStorage'; 
import { CommunityHeader } from '../../components/communityHeader';

export default function CommunityScreen() {
  const theme = useTheme(); 
  const styles = useMemo(() => makeStyles(theme), [theme]); 

  const [posts, setPosts] = useState<Post[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);

  // Load Data
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const data = await CommunityStorage.getPosts();
    setPosts(data);
    setLoading(false);
  };

  // Handle New Post
  const handlePost = async () => {
    if (!newPost.trim()) return;
    
    const newPostObj: Post = {
      id: Date.now().toString(),
      author: 'Anonymous', // Simplified for the vibe
      tag: 'THOUGHT',
      content: newPost,
      hearts: 0,
      replies: [],
      timestamp: Date.now(),
    };

    const updatedPosts = [newPostObj, ...posts];
    setPosts(updatedPosts);
    await CommunityStorage.savePosts(updatedPosts); 
    
    setNewPost('');
    setModalVisible(false);

    // Simulate Reply
    setTimeout(async () => {
      const fakeReply = CommunityStorage.generateFakeReply(newPostObj.id);
      const postsWithReply = updatedPosts.map(p => {
        if (p.id === newPostObj.id) {
          return { ...p, replies: [...p.replies, fakeReply] };
        }
        return p;
      });
      setPosts(postsWithReply);
      await CommunityStorage.savePosts(postsWithReply);
    }, 4000); 
  };

  const handleHeart = async (id: string) => {
    const updated = posts.map(p => 
      p.id === id ? { ...p, hearts: p.hearts + 1 } : p
    );
    setPosts(updated);
    await CommunityStorage.savePosts(updated);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <CommunityHeader/>

      {/* FEED */}
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* CARD TOP ROW */}
            <View style={styles.cardHeader}>
              <View style={styles.authorRow}>
                <View style={styles.avatarPlaceholder}>
                   <Text style={styles.avatarText}>{item.author.charAt(0)}</Text>
                </View>
                <Text style={styles.authorName}>{item.author}</Text>
              </View>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>{item.tag}</Text>
              </View>
            </View>
            
            {/* CONTENT (Handwritten Vibe) */}
            <Text style={styles.cardContent}>{item.content}</Text>
            
            {/* REPLIES */}
            {item.replies.length > 0 && (
              <View style={styles.replySection}>
                <View style={styles.replyHeader}>
                  <Ionicons name="return-down-forward" size={14} color={theme.colors.primary} />
                  <Text style={styles.replyLabel}> RESPONSE</Text>
                </View>
                <Text style={styles.replyText}>"{item.replies[0].content}"</Text>
              </View>
            )}

            {/* DIVIDER */}
            <View style={styles.divider} />

            {/* ACTIONS */}
            <View style={styles.cardFooter}>
              <Pressable 
                style={styles.actionBtn} 
                onPress={() => handleHeart(item.id)}
              >
                <Ionicons 
                  name={item.hearts > 0 ? "heart" : "heart-outline"} 
                  size={20} 
                  color={item.hearts > 0 ? theme.colors.error : theme.colors.outline} 
                />
                <Text style={styles.actionText}>{item.hearts}</Text>
              </Pressable>
              
              <View style={styles.actionBtn}>
                <Ionicons name="chatbubble-outline" size={18} color={theme.colors.onSurfaceVariant} />
                <Text style={styles.actionText}>{item.replies.length}</Text>
              </View>

              <Text style={styles.dateText}>JUST NOW</Text>
            </View>
          </View>
        )}
      />

      {/* FAB (Floating Action Button) - MOVED TO BOTTOM RIGHT */}
      <Pressable 
        style={styles.fab} 
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="pencil" size={26} color={theme.colors.onPrimary} />
      </Pressable>

      {/* NEW POST MODAL */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="formSheet">
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>NEW ENTRY</Text>
            <Pressable onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color={theme.colors.onSurface} />
            </Pressable>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Write something real..."
            placeholderTextColor={theme.colors.outline}
            multiline
            value={newPost}
            onChangeText={setNewPost}
            autoFocus
          />

          <View style={styles.modalFooter}>
            <Pressable style={styles.postBtn} onPress={handlePost}>
              <Text style={styles.postBtnText}>PUBLISH</Text>
              <Ionicons name="arrow-forward" size={16} color={theme.colors.onPrimary} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const makeStyles = (theme: any) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.tertiaryContainer 
  },
  
  // 1. HEADER
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: theme.colors.background,
  },
  headerTitle: { 
    fontSize: 42, 
    color: theme.colors.primary,
    fontFamily: 'Freak', // Font Requirement: Titles
    marginBottom: -5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.outline,
    fontFamily: 'Code', // Font Requirement: Labels
    letterSpacing: 2,
  },

  // 2. LIST & FAB
  listContent: {
    padding: 16,
    paddingBottom: 100, // Space for FAB
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    // Strong Shadow
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },

  // 3. CARD DESIGN
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    // Soft Lift
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginBottom: 15 
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontFamily: 'Freak',
    fontSize: 16,
    color: theme.colors.primary,
  },
  authorName: { 
    color: theme.colors.onSurface, 
    fontFamily: 'Freak', // Font Requirement: Titles
    fontSize: 18,
  },
  tagBadge: { 
    backgroundColor: theme.colors.surfaceVariant, 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6,
  },
  tagText: { 
    color: theme.colors.onSurfaceVariant, 
    fontSize: 10, 
    fontFamily: 'Code', // Font Requirement: Labels
    textTransform: 'uppercase',
  },

  // 4. CONTENT
  cardContent: { 
    fontSize: 18, // Slightly larger for handwritten font
    color: theme.colors.onSurface, 
    lineHeight: 26, 
    marginBottom: 16,
    fontFamily: 'SchoolR' // Font Requirement: Small Texts / Body
  },
  
  // 5. REPLY
  replySection: {
    backgroundColor: theme.colors.secondaryContainer, 
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  replyLabel: {
    fontSize: 10,
    color: theme.colors.primary,
    fontFamily: 'Code', // Font Requirement: Labels
  },
  replyText: {
    fontSize: 15,
    color: theme.colors.onSecondaryContainer,
    fontFamily: 'SchoolR', // Font Requirement: Small Texts
    lineHeight: 20,
  },

  divider: {
    height: 1,
    backgroundColor: theme.colors.outlineVariant,
    marginBottom: 12,
    opacity: 0.5
  },

  // 6. FOOTER ACTIONS
  cardFooter: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  actionBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginRight: 20,
    backgroundColor: theme.colors.background,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  actionText: { 
    marginLeft: 6, 
    color: theme.colors.onSurfaceVariant, 
    fontFamily: 'Code', // Font Requirement: Labels
    fontSize: 12
  },
  dateText: {
    marginLeft: 'auto',
    color: theme.colors.outline,
    fontFamily: 'Code', // Font Requirement: Labels
    fontSize: 10,
  },

  // 7. MODAL STYLES
  modalContainer: { 
    flex: 1, 
    backgroundColor: theme.colors.surface,
    padding: 24,
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Freak',
    color: theme.colors.onSurface,
  },
  input: { 
    fontSize: 20, 
    flex: 1,
    textAlignVertical: 'top',
    color: theme.colors.onSurface,
    fontFamily: 'SchoolR', // Consistent journaling feel
    lineHeight: 28,
  },
  modalFooter: {
    marginBottom: 20,
    alignItems: 'flex-end'
  },
  postBtn: { 
    backgroundColor: theme.colors.primary, 
    paddingHorizontal: 24, 
    paddingVertical: 12, 
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
  },
  postBtnText: { 
    color: theme.colors.onPrimary, 
    fontFamily: 'Code', 
    fontSize: 14,
    marginRight: 8,
  },
});