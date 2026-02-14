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
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper'; // Import Theme Hook
import { CommunityStorage, Post } from '../../services/communityStorage'; 

export default function CommunityScreen() {
  const theme = useTheme(); // 1. Get Theme
  const styles = useMemo(() => makeStyles(theme), [theme]); // 2. Generate Styles

  const [posts, setPosts] = useState<Post[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Load Data on Startup
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const data = await CommunityStorage.getPosts();
    setPosts(data);
    setLoading(false);
  };

  // 2. Handle New Post + SIMULATE REPLY
  const handlePost = async () => {
    if (!newPost.trim()) return;
    
    const newPostObj: Post = {
      id: Date.now().toString(),
      author: 'Me (Anonymous)',
      tag: 'General',
      content: newPost,
      hearts: 0,
      replies: [],
      timestamp: Date.now(),
    };

    // Optimistic Update
    const updatedPosts = [newPostObj, ...posts];
    setPosts(updatedPosts);
    await CommunityStorage.savePosts(updatedPosts); 
    
    setNewPost('');
    setModalVisible(false);

    // --- THE DEMO MAGIC (Simulate a Reply) ---
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
      
      Alert.alert("New Reply!", "Kind Stranger replied to your post.");
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tribes 🔥</Text>
        <Pressable style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color={theme.colors.onPrimary} />
        </Pressable>
      </View>

      {/* FEED */}
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* POST HEADER */}
            <View style={styles.cardHeader}>
              <View style={styles.authorContainer}>
                <View style={styles.avatar} />
                <Text style={styles.authorName}>{item.author}</Text>
              </View>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>{item.tag}</Text>
              </View>
            </View>
            
            {/* CONTENT */}
            <Text style={styles.cardContent}>{item.content}</Text>
            
            {/* REPLIES */}
            {item.replies.length > 0 && (
              <View style={styles.replySection}>
                <View style={{flexDirection:'row', alignItems:'center', marginBottom: 4}}>
                  <Ionicons name="return-down-forward" size={12} color={theme.colors.outline} />
                  <Text style={styles.replyLabel}> Recent Reply</Text>
                </View>
                <Text style={styles.replyText}>"{item.replies[0].content}"</Text>
              </View>
            )}

            {/* ACTIONS */}
            <View style={styles.cardFooter}>
              <Pressable 
                style={styles.actionBtn} 
                onPress={() => handleHeart(item.id)}
              >
                <Ionicons name="heart-outline" size={20} color={theme.colors.error} />
                <Text style={[styles.actionText, { color: theme.colors.error }]}>{item.hearts}</Text>
              </Pressable>
              
              <View style={styles.actionBtn}>
                <Ionicons name="chatbubble-outline" size={20} color={theme.colors.secondary} />
                <Text style={styles.actionText}>{item.replies.length}</Text>
              </View>
            </View>
          </View>
        )}
      />

      {/* NEW POST MODAL */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.postBtn} onPress={handlePost}>
              <Text style={styles.postBtnText}>Post</Text>
            </Pressable>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Share your feelings anonymously..."
            placeholderTextColor={theme.colors.outline}
            multiline
            value={newPost}
            onChangeText={setNewPost}
            autoFocus
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// --- THEMED STYLES FACTORY ---
const makeStyles = (theme: any) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  
  // HEADER
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.background, // Clean look
  },
  headerTitle: { 
    fontSize: 28, 
    color: theme.colors.onBackground,
    fontFamily: 'SpaceMB' 
  },
  addBtn: {
    backgroundColor: theme.colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    // MD3 Elevation
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  // CARD
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  authorContainer: { flexDirection: 'row', alignItems: 'center' },
  avatar: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    backgroundColor: theme.colors.surfaceVariant, 
    marginRight: 10 
  },
  authorName: { 
    color: theme.colors.onSurface, 
    fontFamily: 'SpaceMB',
    fontSize: 14
  },
  tagBadge: { 
    backgroundColor: theme.colors.secondaryContainer, 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 8 
  },
  tagText: { 
    color: theme.colors.onSecondaryContainer, 
    fontSize: 12, 
    fontFamily: 'SpaceMB' 
  },
  
  // CONTENT
  cardContent: { 
    fontSize: 16, 
    color: theme.colors.onSurface, 
    lineHeight: 24, 
    marginBottom: 16,
    fontFamily: 'SpaceMR' 
  },
  
  // REPLY SECTION
  replySection: {
    backgroundColor: theme.colors.surfaceVariant, // Subtle bubble
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  replyLabel: {
    fontSize: 10,
    color: theme.colors.outline,
    fontFamily: 'SpaceMB',
  },
  replyText: {
    fontSize: 15,
    color: theme.colors.onSurfaceVariant,
    fontFamily: 'SchoolR', // Handwriting style for whispers
    fontStyle: 'italic',
  },

  // FOOTER
  cardFooter: { 
    flexDirection: 'row', 
    borderTopWidth: 1, 
    borderTopColor: theme.colors.outlineVariant, 
    paddingTop: 12 
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 24 },
  actionText: { 
    marginLeft: 6, 
    color: theme.colors.secondary, 
    fontFamily: 'SpaceMB',
    fontSize: 14
  },
  
  // MODAL
  modalContainer: { flex: 1, backgroundColor: theme.colors.surface },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  cancelText: { 
    fontSize: 16, 
    color: theme.colors.outline,
    fontFamily: 'SpaceMR' 
  },
  postBtn: { 
    backgroundColor: theme.colors.primary, 
    paddingHorizontal: 20, 
    paddingVertical: 8, 
    borderRadius: 20 
  },
  postBtnText: { 
    color: theme.colors.onPrimary, 
    fontFamily: 'SpaceMB' 
  },
  input: { 
    fontSize: 18, 
    padding: 20, 
    minHeight: 150, 
    textAlignVertical: 'top',
    color: theme.colors.onSurface,
    fontFamily: 'SpaceMR' 
  },
});