
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSocial } from '@/hooks/useSocial';
import { Comment, Post } from '@/types/social';
import { useAlert } from '@/template';
import GifPicker, { GifResult } from '@/components/ui/GifPicker';
import DonationPanel from '@/components/economy/DonationPanel';
import { useEconomy } from '@/contexts/EconomyContext';

const { width } = Dimensions.get('window');

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  post: Post;
  onUserPress?: (user: any) => void;
}

const emojiCategories = [
  { name: 'Smileys', emojis: ['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','😉','😍','🥰','😘','😛','😜','🤪','😎','🤩'] },
  { name: 'Hearts', emojis: ['❤️','🧡','💛','💚','💙','💜','🤍','🖤','💔','❣️','💕','💞','💓','💗','💖','💘','💝'] },
  { name: 'Gestures', emojis: ['👍','👎','👌','✌️','🤞','🤟','🤘','👏','🙌','👐','🤝','🙏','💪','🦾','✋','🖐️','🤙'] },
  { name: 'Objects', emojis: ['💯','🔥','⭐','🌟','✨','🎉','🎊','🎁','🏆','🥇','🎭','🎨','🎯','🎲','🎮','🚀','💎','💣'] }
];

const stickerPacks = [
  { name: 'Reactions', stickers: ['💯','🔥','✨','👏','🙌','😍','🤩','😘','🥳','🎉','❤️','💖','👍','👌','🤞','🙏'] },
  { name: 'Animals', stickers: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈'] },
  { name: 'Food', stickers: ['🍕','🍔','🌭','🥪','🌮','🌯','🥗','🍝','🍜','🍣','🍱','🥟','🍰','🎂','🍩','🍦'] }
];

export default function CommentsModal({ visible, onClose, post, onUserPress }: CommentsModalProps) {
  const { comments, addComment, currentUser, getCommentsByPostId } = useSocial();
  const { showAlert } = useAlert();
  const { getDonationsForTarget } = useEconomy();
  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [postComments, setPostComments] = useState<Comment[]>([]);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showDonationPanel, setShowDonationPanel] = useState(false);
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState(0);
  const [selectedStickerPack, setSelectedStickerPack] = useState(0);
  const [commentLikes, setCommentLikes] = useState<{ [key: string]: boolean }>({});
  // Track GIF messages in comments
  const [gifComments, setGifComments] = useState<{ [commentId: string]: string }>({});

  const donations = getDonationsForTarget(post.id);
  const totalDonated = donations.reduce((s, d) => s + d.amount, 0);

  useEffect(() => {
    if (visible) {
      const filtered = getCommentsByPostId(post.id);
      setPostComments(filtered);
    }
  }, [visible, comments, post.id, getCommentsByPostId]);

  const detectHashtags = (text: string) => {
    const parts = text.split(/(#[a-zA-Z0-9_]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('#')) return { type: 'hashtag', content: part };
      return { type: 'text', content: part };
    });
  };

  const renderTextWithHashtags = (text: string) => {
    const parts = detectHashtags(text);
    return (
      <Text style={styles.commentText}>
        {parts.map((part, index) => (
          <Text key={index} style={part.type === 'hashtag' ? styles.hashtag : undefined}
            onPress={part.type === 'hashtag' ? () => showAlert('Hashtag', `Searching ${part.content}`) : undefined}>
            {part.content}
          </Text>
        ))}
      </Text>
    );
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      showAlert('Content Required', 'Please write something first.');
      return;
    }
    if (!currentUser) {
      showAlert('Login Required', 'Please log in to comment.');
      return;
    }
    setIsPosting(true);
    try {
      const comment: Comment = {
        id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        postId: post.id,
        userId: currentUser.id,
        user: currentUser,
        content: newComment.trim(),
        likes: 0,
        isLiked: false,
        replyTo: replyTo?.id,
        createdAt: new Date().toISOString()
      };
      addComment(comment);
      setNewComment('');
      setReplyTo(null);
      setShowEmojiPicker(false);
      setShowStickerPicker(false);
      showAlert('Success', '💬 Comment posted!');
    } catch (e) {
      showAlert('Error', 'Failed to post comment.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleGifSelect = (gif: GifResult) => {
    // Create a GIF comment with the actual URL
    if (!currentUser) { showAlert('Login Required', 'Please log in.'); return; }
    const comment: Comment = {
      id: `gif-comment-${Date.now()}`,
      postId: post.id,
      userId: currentUser.id,
      user: currentUser,
      content: `[GIF: ${gif.title || 'GIF'}]`,
      likes: 0,
      isLiked: false,
      createdAt: new Date().toISOString()
    };
    addComment(comment);
    // Store the GIF URL for rendering
    setGifComments(prev => ({ ...prev, [comment.id]: gif.url }));
  };

  const handleLikeComment = (comment: Comment) => {
    setCommentLikes(prev => ({ ...prev, [comment.id]: !prev[comment.id] }));
  };

  const handleReply = (comment: Comment) => {
    setReplyTo(comment);
    setNewComment(`@${comment.user.username} `);
  };

  const formatTimeAgo = (dateString: string) => {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
    if (diff < 1) return 'now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const isLiked = commentLikes[comment.id] || false;
    const gifUrl = gifComments[comment.id];
    return (
      <View key={comment.id} style={[styles.commentItem, isReply && styles.replyComment]}>
        <View style={styles.commentAvatar}>
          <Text style={styles.avatarText}>{comment.user.displayName.charAt(0)}</Text>
        </View>
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <View style={styles.commentUserInfo}>
              <TouchableOpacity onPress={() => onUserPress?.(comment.user)}>
                <Text style={[styles.commentUserName, onUserPress && styles.clickableUserName]}>
                  {comment.user.displayName}
                </Text>
              </TouchableOpacity>
              {comment.user.verified && <MaterialIcons name="verified" size={12} color="#3B82F6" />}
              <Text style={styles.commentTime}>{formatTimeAgo(comment.createdAt)}</Text>
            </View>
            <TouchableOpacity style={styles.commentLikeButton} onPress={() => handleLikeComment(comment)}>
              <MaterialIcons name={isLiked ? 'favorite' : 'favorite-border'} size={16} color={isLiked ? '#EF4444' : '#9CA3AF'} />
              {(comment.likes + (isLiked ? 1 : 0)) > 0 && (
                <Text style={[styles.commentLikes, isLiked && styles.commentLikesActive]}>{comment.likes + (isLiked ? 1 : 0)}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* GIF display */}
          {gifUrl ? (
            <Image source={{ uri: gifUrl }} style={styles.gifComment} resizeMode="cover" />
          ) : (
            renderTextWithHashtags(comment.content)
          )}

          <View style={styles.commentActions}>
            <TouchableOpacity style={styles.commentActionButton} onPress={() => handleReply(comment)}>
              <MaterialIcons name="reply" size={14} color="#6B7280" />
              <Text style={styles.commentActionText}>Reply</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.commentActionButton} onPress={() => handleLikeComment(comment)}>
              <MaterialIcons name={isLiked ? 'favorite' : 'favorite-border'} size={14} color={isLiked ? '#EF4444' : '#6B7280'} />
              <Text style={[styles.commentActionText, isLiked && styles.commentActionTextActive]}>
                {isLiked ? 'Liked' : 'Like'}
              </Text>
            </TouchableOpacity>
          </View>

          {comment.replies && comment.replies.length > 0 && (
            <View style={styles.repliesContainer}>
              {comment.replies.map((r: any) => renderComment(r, true))}
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderEmojiPicker = () => (
    <View style={styles.pickerContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerTabs}>
        {emojiCategories.map((cat, i) => (
          <TouchableOpacity key={cat.name} style={[styles.pickerTab, selectedEmojiCategory === i && styles.pickerTabActive]} onPress={() => setSelectedEmojiCategory(i)}>
            <Text style={[styles.pickerTabText, selectedEmojiCategory === i && styles.pickerTabTextActive]}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.emojiGrid}>
        {emojiCategories[selectedEmojiCategory].emojis.map((emoji, i) => (
          <TouchableOpacity key={i} style={styles.emojiButton} onPress={() => setNewComment(prev => prev + emoji)}>
            <Text style={styles.emojiText}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStickerPicker = () => (
    <View style={styles.pickerContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerTabs}>
        {stickerPacks.map((pack, i) => (
          <TouchableOpacity key={pack.name} style={[styles.pickerTab, selectedStickerPack === i && styles.pickerTabActive2]} onPress={() => setSelectedStickerPack(i)}>
            <Text style={[styles.pickerTabText, selectedStickerPack === i && styles.pickerTabTextActive2]}>{pack.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.stickerGrid}>
        {stickerPacks[selectedStickerPack].stickers.map((s, i) => (
          <TouchableOpacity key={i} style={styles.stickerButton} onPress={() => { setNewComment(prev => prev + s + ' '); setShowStickerPicker(false); }}>
            <Text style={styles.stickerText}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}><MaterialIcons name="close" size={24} color="white" /></TouchableOpacity>
          <Text style={styles.headerTitle}>Comments</Text>
          <Text style={styles.commentCount}>{postComments.length}</Text>
        </View>

        {/* Post Preview */}
        <View style={styles.postPreview}>
          <View style={styles.postHeaderRow}>
            <View style={styles.postAvatar}>
              <Text style={styles.avatarText}>{post.user.displayName.charAt(0)}</Text>
            </View>
            <View>
              <TouchableOpacity onPress={() => onUserPress?.(post.user)}>
                <Text style={[styles.postUserName, onUserPress && styles.clickableUserName]}>{post.user.displayName}</Text>
              </TouchableOpacity>
              <Text style={styles.postTime}>{formatTimeAgo(post.createdAt)}</Text>
            </View>
          </View>
          {renderTextWithHashtags(post.content)}

          {/* Donations row */}
          {donations.length > 0 && (
            <View style={styles.donationsRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {donations.slice(0, 6).map(d => (
                  <View key={d.id} style={styles.donationChip}>
                    <Text style={styles.donationChipEmoji}>{d.emoji}</Text>
                    <Text style={styles.donationChipName}>{d.donorName}</Text>
                    <Text style={styles.donationChipAmount}>{d.amount}cr</Text>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.donateMiniBtn} onPress={() => setShowDonationPanel(true)}>
                <MaterialIcons name="favorite" size={14} color="#EF4444" />
                <Text style={styles.donateMiniText}>{totalDonated}cr</Text>
              </TouchableOpacity>
            </View>
          )}
          {donations.length === 0 && (
            <TouchableOpacity style={styles.donateMiniBtn} onPress={() => setShowDonationPanel(true)}>
              <MaterialIcons name="favorite-border" size={14} color="#EF4444" />
              <Text style={styles.donateMiniText}>Donate</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Comments List */}
        <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {postComments.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="chat-bubble-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateTitle}>No comments yet</Text>
              <Text style={styles.emptyStateText}>Be the first to share your thoughts!</Text>
            </View>
          ) : (
            <View style={styles.commentsContainer}>
              {postComments.filter(c => !c.replyTo).map(comment => {
                const replies = postComments.filter(c => c.replyTo === comment.id);
                return renderComment({ ...comment, replies });
              })}
            </View>
          )}
        </ScrollView>

        {/* Emoji / Sticker Pickers */}
        {showEmojiPicker && renderEmojiPicker()}
        {showStickerPicker && renderStickerPicker()}

        {/* Reply Context */}
        {replyTo && (
          <View style={styles.replyContext}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialIcons name="reply" size={16} color="#3B82F6" />
              <Text style={styles.replyContextText}>Replying to <Text style={styles.replyContextUser}>@{replyTo.user.username}</Text></Text>
            </View>
            <TouchableOpacity onPress={() => { setReplyTo(null); setNewComment(''); }}>
              <MaterialIcons name="close" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Input */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inputContainer}>
          <View style={styles.inputControls}>
            <TouchableOpacity
              style={[styles.controlBtn, showEmojiPicker && styles.controlBtnActive]}
              onPress={() => { setShowEmojiPicker(!showEmojiPicker); setShowStickerPicker(false); }}
            >
              <MaterialIcons name="emoji-emotions" size={20} color={showEmojiPicker ? '#3B82F6' : '#9CA3AF'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlBtn, showStickerPicker && styles.controlBtnActive2]}
              onPress={() => { setShowStickerPicker(!showStickerPicker); setShowEmojiPicker(false); }}
            >
              <MaterialIcons name="face-retouching-natural" size={20} color={showStickerPicker ? '#10B981' : '#9CA3AF'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlBtn, { borderWidth: 1, borderColor: '#3B82F6' }]}
              onPress={() => { setShowGifPicker(true); setShowEmojiPicker(false); setShowStickerPicker(false); }}
            >
              <Text style={styles.gifBtnText}>GIF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn} onPress={() => setShowDonationPanel(true)}>
              <MaterialIcons name="favorite" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
          <View style={styles.inputRow}>
            <View style={styles.inputAvatar}>
              <Text style={styles.avatarText}>{currentUser?.displayName?.charAt(0) || 'U'}</Text>
            </View>
            <TextInput
              style={styles.commentInput}
              placeholder={replyTo ? `Reply to @${replyTo.user.username}...` : 'Add a comment with #hashtags...'}
              placeholderTextColor="#9CA3AF"
              multiline
              value={newComment}
              onChangeText={setNewComment}
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!newComment.trim() || isPosting) && styles.sendButtonDisabled]}
              onPress={handleAddComment}
              disabled={!newComment.trim() || isPosting}
            >
              {isPosting ? <ActivityIndicator size="small" color="white" /> : <MaterialIcons name="send" size={20} color="white" />}
            </TouchableOpacity>
          </View>
          <View style={styles.inputFooter}>
            <Text style={styles.hashtagHint}>Use #hashtags to be discovered</Text>
            <Text style={styles.charCount}>{newComment.length}/500</Text>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* Real GIF Picker */}
      <GifPicker
        visible={showGifPicker}
        onClose={() => setShowGifPicker(false)}
        onSelect={handleGifSelect}
      />

      {/* Donation Panel */}
      <DonationPanel
        visible={showDonationPanel}
        onClose={() => setShowDonationPanel(false)}
        targetId={post.id}
        targetType="post"
        targetName={post.user.displayName}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#374151' },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '600' },
  commentCount: { color: '#9CA3AF', fontSize: 14 },
  postPreview: { backgroundColor: '#1F2937', padding: 16, borderBottomWidth: 1, borderBottomColor: '#374151' },
  postHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  postAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  postUserName: { color: 'white', fontSize: 14, fontWeight: '600' },
  postTime: { color: '#9CA3AF', fontSize: 12 },
  donationsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8 },
  donationChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 6, gap: 4 },
  donationChipEmoji: { fontSize: 14 },
  donationChipName: { fontSize: 10, color: '#FCA5A5', fontWeight: '600' },
  donationChipAmount: { fontSize: 10, color: '#EF4444', fontWeight: '700' },
  donateMiniBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.15)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, gap: 4, marginTop: 8, alignSelf: 'flex-start' },
  donateMiniText: { fontSize: 12, color: '#EF4444', fontWeight: '700' },
  commentsList: { flex: 1 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStateTitle: { color: '#9CA3AF', fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  emptyStateText: { color: '#6B7280', fontSize: 14, textAlign: 'center' },
  commentsContainer: { padding: 16 },
  commentItem: { flexDirection: 'row', marginBottom: 16 },
  replyComment: { marginLeft: 40, marginTop: 8 },
  commentAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  commentContent: { flex: 1 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  commentUserInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  commentUserName: { color: 'white', fontSize: 14, fontWeight: '600', marginRight: 4 },
  clickableUserName: { color: '#3B82F6', textDecorationLine: 'underline' },
  commentTime: { color: '#9CA3AF', fontSize: 12, marginLeft: 8 },
  commentLikeButton: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 4 },
  commentLikes: { color: '#9CA3AF', fontSize: 12 },
  commentLikesActive: { color: '#EF4444', fontWeight: '600' },
  commentText: { color: '#D1D5DB', fontSize: 14, lineHeight: 20, marginBottom: 8 },
  hashtag: { color: '#3B82F6', fontWeight: '600' },
  gifComment: { width: '100%', height: 180, borderRadius: 12, marginBottom: 8 },
  commentActions: { flexDirection: 'row' },
  commentActionButton: { flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 16, paddingVertical: 4 },
  commentActionText: { color: '#6B7280', fontSize: 12, fontWeight: '500' },
  commentActionTextActive: { color: '#EF4444', fontWeight: '600' },
  repliesContainer: { marginTop: 8 },
  replyContext: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1F2937', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#374151' },
  replyContextText: { color: '#9CA3AF', fontSize: 14 },
  replyContextUser: { color: '#3B82F6', fontWeight: '600' },
  pickerContainer: { backgroundColor: '#1F2937', borderTopWidth: 1, borderTopColor: '#374151', maxHeight: 200 },
  pickerTabs: { borderBottomWidth: 1, borderBottomColor: '#374151', paddingVertical: 8 },
  pickerTab: { paddingHorizontal: 16, paddingVertical: 8, marginHorizontal: 4, borderRadius: 16 },
  pickerTabActive: { backgroundColor: '#3B82F6' },
  pickerTabActive2: { backgroundColor: '#10B981' },
  pickerTabText: { color: '#9CA3AF', fontSize: 12, fontWeight: '500' },
  pickerTabTextActive: { color: 'white', fontWeight: '600' },
  pickerTabTextActive2: { color: 'white', fontWeight: '600' },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8 },
  emojiButton: { width: (width - 16) / 10, height: 40, alignItems: 'center', justifyContent: 'center' },
  emojiText: { fontSize: 22 },
  stickerGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8 },
  stickerButton: { width: (width - 16) / 8, height: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: '#374151', borderRadius: 8, margin: 2 },
  stickerText: { fontSize: 26 },
  inputContainer: { backgroundColor: '#1F2937', borderTopWidth: 1, borderTopColor: '#374151', padding: 16 },
  inputControls: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  controlBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#374151', alignItems: 'center', justifyContent: 'center' },
  controlBtnActive: { backgroundColor: '#1D4ED8' },
  controlBtnActive2: { backgroundColor: '#059669' },
  gifBtnText: { color: '#3B82F6', fontSize: 10, fontWeight: '800' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  inputAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center' },
  commentInput: { flex: 1, backgroundColor: '#374151', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, color: 'white', fontSize: 14, maxHeight: 100 },
  sendButton: { backgroundColor: '#3B82F6', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { backgroundColor: '#374151' },
  inputFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  hashtagHint: { color: '#6B7280', fontSize: 10, fontStyle: 'italic' },
  charCount: { color: '#6B7280', fontSize: 12 },
});
