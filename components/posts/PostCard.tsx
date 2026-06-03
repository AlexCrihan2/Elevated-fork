
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Post } from '@/types/social';
import { useSocial } from '@/hooks/useSocial';
import { useTheme } from '@/contexts/ThemeContext';
import { useEconomy } from '@/contexts/EconomyContext';
import { router } from 'expo-router';

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onLivePress?: () => void;
  onSubscribe?: () => void;
  isSubscribed?: boolean;
  onPress?: (post: Post) => void;
}

export default function PostCard({ 
  post, 
  onLike, 
  onComment, 
  onShare, 
  onLivePress,
  onSubscribe,
  isSubscribed,
  onPress
}: PostCardProps) {
  const { theme } = useTheme();
  const { credits, donate } = useEconomy();
  const { updatePost } = useSocial();
  const [isTranslated, setIsTranslated] = useState(false);
  const [originalContent, setOriginalContent] = useState(post.content);
  const [showEmojiBar, setShowEmojiBar] = useState(false);
  const [postReactions, setPostReactions] = useState<{[key: string]: number}>({
    // Faces & Emotions
    '😀': Math.floor(Math.random() * 15), '😃': Math.floor(Math.random() * 12), '😄': Math.floor(Math.random() * 18),
    '😁': Math.floor(Math.random() * 20), '😆': Math.floor(Math.random() * 25), '😂': Math.floor(Math.random() * 45),
    '🤣': Math.floor(Math.random() * 35), '😊': Math.floor(Math.random() * 30), '😇': Math.floor(Math.random() * 8),
    '🙂': Math.floor(Math.random() * 22), '🙃': Math.floor(Math.random() * 15), '😉': Math.floor(Math.random() * 18),
    '😌': Math.floor(Math.random() * 12), '😍': Math.floor(Math.random() * 28), '🥰': Math.floor(Math.random() * 32),
    '😘': Math.floor(Math.random() * 20), '😗': Math.floor(Math.random() * 8), '😙': Math.floor(Math.random() * 6),
    '😚': Math.floor(Math.random() * 10), '😋': Math.floor(Math.random() * 15), '😛': Math.floor(Math.random() * 12),
    '😝': Math.floor(Math.random() * 16), '😜': Math.floor(Math.random() * 14), '🤪': Math.floor(Math.random() * 20),
    '🤨': Math.floor(Math.random() * 8), '🧐': Math.floor(Math.random() * 6), '🤓': Math.floor(Math.random() * 10),
    '😎': Math.floor(Math.random() * 25), '😏': Math.floor(Math.random() * 18), '😒': Math.floor(Math.random() * 5),
    '🙄': Math.floor(Math.random() * 12), '😬': Math.floor(Math.random() * 8), '🤥': Math.floor(Math.random() * 3),
    '😔': Math.floor(Math.random() * 7), '😟': Math.floor(Math.random() * 4), '😕': Math.floor(Math.random() * 6),
    '🙁': Math.floor(Math.random() * 5), '😣': Math.floor(Math.random() * 8), '😖': Math.floor(Math.random() * 4),
    '😫': Math.floor(Math.random() * 6), '😩': Math.floor(Math.random() * 10), '🥺': Math.floor(Math.random() * 15),
    '😢': Math.floor(Math.random() * 8), '😭': Math.floor(Math.random() * 12), '😤': Math.floor(Math.random() * 14),
    '😠': Math.floor(Math.random() * 7), '😡': Math.floor(Math.random() * 5), '🤬': Math.floor(Math.random() * 3),
    '🤯': Math.floor(Math.random() * 18), '😳': Math.floor(Math.random() * 16), '🥵': Math.floor(Math.random() * 12),
    '🥶': Math.floor(Math.random() * 8), '😱': Math.floor(Math.random() * 22), '😨': Math.floor(Math.random() * 10),
    '😰': Math.floor(Math.random() * 6), '😥': Math.floor(Math.random() * 8), '😓': Math.floor(Math.random() * 12),
    '🤗': Math.floor(Math.random() * 20), '🤔': Math.floor(Math.random() * 25), '🤭': Math.floor(Math.random() * 15),
    '🤫': Math.floor(Math.random() * 8), '🤥': Math.floor(Math.random() * 4), '😶': Math.floor(Math.random() * 5),
    '😐': Math.floor(Math.random() * 7), '😑': Math.floor(Math.random() * 6), '😪': Math.floor(Math.random() * 10),
    '🤤': Math.floor(Math.random() * 12), '😴': Math.floor(Math.random() * 8), '😵': Math.floor(Math.random() * 6),
    '🤐': Math.floor(Math.random() * 4), '🥴': Math.floor(Math.random() * 8), '🤢': Math.floor(Math.random() * 3),
    '🤮': Math.floor(Math.random() * 2), '🤧': Math.floor(Math.random() * 6), '😷': Math.floor(Math.random() * 15),
    '🤒': Math.floor(Math.random() * 5), '🤕': Math.floor(Math.random() * 4),
    
    // Hearts & Love
    '❤️': Math.floor(Math.random() * 50), '🧡': Math.floor(Math.random() * 20), '💛': Math.floor(Math.random() * 18),
    '💚': Math.floor(Math.random() * 15), '💙': Math.floor(Math.random() * 22), '💜': Math.floor(Math.random() * 25),
    '🖤': Math.floor(Math.random() * 12), '🤍': Math.floor(Math.random() * 16), '🤎': Math.floor(Math.random() * 8),
    '💔': Math.floor(Math.random() * 6), '❣️': Math.floor(Math.random() * 10), '💕': Math.floor(Math.random() * 24),
    '💞': Math.floor(Math.random() * 18), '💓': Math.floor(Math.random() * 20), '💗': Math.floor(Math.random() * 22),
    '💖': Math.floor(Math.random() * 26), '💘': Math.floor(Math.random() * 15), '💝': Math.floor(Math.random() * 12),
    '💟': Math.floor(Math.random() * 8), '♥️': Math.floor(Math.random() * 30), '💋': Math.floor(Math.random() * 16),
    
    // Gestures & Hands
    '👍': Math.floor(Math.random() * 40), '👎': Math.floor(Math.random() * 8), '👌': Math.floor(Math.random() * 18),
    '🤌': Math.floor(Math.random() * 12), '🤏': Math.floor(Math.random() * 6), '✌️': Math.floor(Math.random() * 20),
    '🤞': Math.floor(Math.random() * 15), '🤟': Math.floor(Math.random() * 10), '🤘': Math.floor(Math.random() * 18),
    '🤙': Math.floor(Math.random() * 22), '👈': Math.floor(Math.random() * 8), '👉': Math.floor(Math.random() * 10),
    '👆': Math.floor(Math.random() * 6), '🖕': Math.floor(Math.random() * 3), '👇': Math.floor(Math.random() * 5),
    '☝️': Math.floor(Math.random() * 8), '👋': Math.floor(Math.random() * 25), '🤚': Math.floor(Math.random() * 12),
    '🖐️': Math.floor(Math.random() * 8), '✋': Math.floor(Math.random() * 15), '🖖': Math.floor(Math.random() * 6),
    '👏': Math.floor(Math.random() * 35), '🙌': Math.floor(Math.random() * 28), '👐': Math.floor(Math.random() * 18),
    '🤲': Math.floor(Math.random() * 12), '🤝': Math.floor(Math.random() * 20), '🙏': Math.floor(Math.random() * 30),
    '✍️': Math.floor(Math.random() * 10), '💅': Math.floor(Math.random() * 8), '🤳': Math.floor(Math.random() * 15),
    
    // Celebration & Achievement
    '🎉': Math.floor(Math.random() * 40), '🎊': Math.floor(Math.random() * 25), '🥳': Math.floor(Math.random() * 35),
    '🎈': Math.floor(Math.random() * 20), '🎁': Math.floor(Math.random() * 18), '🏆': Math.floor(Math.random() * 28),
    '🥇': Math.floor(Math.random() * 22), '🥈': Math.floor(Math.random() * 12), '🥉': Math.floor(Math.random() * 8),
    '🏅': Math.floor(Math.random() * 15), '🎖️': Math.floor(Math.random() * 10), '🏵️': Math.floor(Math.random() * 6),
    '🎗️': Math.floor(Math.random() * 8), '🎫': Math.floor(Math.random() * 12), '🎟️': Math.floor(Math.random() * 10),
    '🎪': Math.floor(Math.random() * 15), '🎭': Math.floor(Math.random() * 18), '🎨': Math.floor(Math.random() * 20),
    
    // Fire & Energy
    '🔥': Math.floor(Math.random() * 45), '💥': Math.floor(Math.random() * 22), '⚡': Math.floor(Math.random() * 28),
    '💫': Math.floor(Math.random() * 18), '⭐': Math.floor(Math.random() * 32), '🌟': Math.floor(Math.random() * 35),
    '✨': Math.floor(Math.random() * 40), '💎': Math.floor(Math.random() * 25), '💍': Math.floor(Math.random() * 15),
    '👑': Math.floor(Math.random() * 20), '🔱': Math.floor(Math.random() * 8), '⚜️': Math.floor(Math.random() * 6),
    
    // Numbers & Symbols
    '💯': Math.floor(Math.random() * 38), '💢': Math.floor(Math.random() * 8), '💨': Math.floor(Math.random() * 12),
    '💦': Math.floor(Math.random() * 10), '💤': Math.floor(Math.random() * 8), '💬': Math.floor(Math.random() * 20),
    '🗨️': Math.floor(Math.random() * 15), '💭': Math.floor(Math.random() * 18), '🗯️': Math.floor(Math.random() * 6),
    '💡': Math.floor(Math.random() * 25), '🔔': Math.floor(Math.random() * 12), '🔕': Math.floor(Math.random() * 4),
    '📢': Math.floor(Math.random() * 15), '📣': Math.floor(Math.random() * 18), '📯': Math.floor(Math.random() * 8),
    '🎵': Math.floor(Math.random() * 20), '🎶': Math.floor(Math.random() * 22), '🎼': Math.floor(Math.random() * 10),
    '🎤': Math.floor(Math.random() * 18), '🎧': Math.floor(Math.random() * 25), '📻': Math.floor(Math.random() * 12),
    '🎸': Math.floor(Math.random() * 15), '🥁': Math.floor(Math.random() * 10), '🎺': Math.floor(Math.random() * 8),
    
    // Food & Drinks
    '🍕': Math.floor(Math.random() * 25), '🍔': Math.floor(Math.random() * 20), '🍟': Math.floor(Math.random() * 18),
    '🌭': Math.floor(Math.random() * 12), '🥪': Math.floor(Math.random() * 15), '🌮': Math.floor(Math.random() * 16),
    '🌯': Math.floor(Math.random() * 10), '🥙': Math.floor(Math.random() * 8), '🧆': Math.floor(Math.random() * 6),
    '🍳': Math.floor(Math.random() * 12), '🥚': Math.floor(Math.random() * 8), '🧀': Math.floor(Math.random() * 10),
    '🥓': Math.floor(Math.random() * 14), '🥩': Math.floor(Math.random() * 12), '🍖': Math.floor(Math.random() * 10),
    '🍗': Math.floor(Math.random() * 15), '🥨': Math.floor(Math.random() * 8), '🥖': Math.floor(Math.random() * 6),
    '🍞': Math.floor(Math.random() * 10), '🥯': Math.floor(Math.random() * 8), '🧈': Math.floor(Math.random() * 4),
    '🍰': Math.floor(Math.random() * 22), '🎂': Math.floor(Math.random() * 20), '🧁': Math.floor(Math.random() * 18),
    '🍪': Math.floor(Math.random() * 16), '🍩': Math.floor(Math.random() * 20), '🍨': Math.floor(Math.random() * 18),
    '🍦': Math.floor(Math.random() * 16), '🥧': Math.floor(Math.random() * 12), '🍫': Math.floor(Math.random() * 15),
    '🍬': Math.floor(Math.random() * 12), '🍭': Math.floor(Math.random() * 10), '🍮': Math.floor(Math.random() * 8),
    
    // Animals
    '🐶': Math.floor(Math.random() * 25), '🐱': Math.floor(Math.random() * 28), '🐭': Math.floor(Math.random() * 12),
    '🐹': Math.floor(Math.random() * 15), '🐰': Math.floor(Math.random() * 20), '🦊': Math.floor(Math.random() * 18),
    '🐻': Math.floor(Math.random() * 22), '🐼': Math.floor(Math.random() * 25), '🐨': Math.floor(Math.random() * 20),
    '🐯': Math.floor(Math.random() * 15), '🦁': Math.floor(Math.random() * 18), '🐮': Math.floor(Math.random() * 12),
    '🐷': Math.floor(Math.random() * 16), '🐸': Math.floor(Math.random() * 14), '🐵': Math.floor(Math.random() * 18),
    '🙈': Math.floor(Math.random() * 20), '🙉': Math.floor(Math.random() * 15), '🙊': Math.floor(Math.random() * 18),
    '🐒': Math.floor(Math.random() * 12), '🦍': Math.floor(Math.random() * 10), '🦘': Math.floor(Math.random() * 8),
    '🐕': Math.floor(Math.random() * 22), '🐩': Math.floor(Math.random() * 15), '🐈': Math.floor(Math.random() * 20),
    '🐓': Math.floor(Math.random() * 10), '🦃': Math.floor(Math.random() * 8), '🕊️': Math.floor(Math.random() * 12),
    '🐧': Math.floor(Math.random() * 18), '🐦': Math.floor(Math.random() * 16), '🦆': Math.floor(Math.random() * 12),
    '🦢': Math.floor(Math.random() * 10), '🦉': Math.floor(Math.random() * 15), '🦚': Math.floor(Math.random() * 12),
    '🦜': Math.floor(Math.random() * 14), '🐝': Math.floor(Math.random() * 16), '🐛': Math.floor(Math.random() * 8),
    '🦋': Math.floor(Math.random() * 20), '🐌': Math.floor(Math.random() * 10), '🐞': Math.floor(Math.random() * 12),
    '🐜': Math.floor(Math.random() * 8), '🦟': Math.floor(Math.random() * 4), '🦗': Math.floor(Math.random() * 6),
    '🕷️': Math.floor(Math.random() * 8), '🦂': Math.floor(Math.random() * 6), '🐢': Math.floor(Math.random() * 12),
    '🐍': Math.floor(Math.random() * 10), '🦎': Math.floor(Math.random() * 8), '🐙': Math.floor(Math.random() * 12),
    '🦑': Math.floor(Math.random() * 10), '🦐': Math.floor(Math.random() * 8), '🦞': Math.floor(Math.random() * 10),
    '🦀': Math.floor(Math.random() * 12), '🐡': Math.floor(Math.random() * 8), '🐠': Math.floor(Math.random() * 15),
    '🐟': Math.floor(Math.random() * 12), '🐬': Math.floor(Math.random() * 18), '🐳': Math.floor(Math.random() * 15),
    '🐋': Math.floor(Math.random() * 12), '🦈': Math.floor(Math.random() * 14), '🐊': Math.floor(Math.random() * 10),
    '🐅': Math.floor(Math.random() * 12), '🐆': Math.floor(Math.random() * 10), '🦓': Math.floor(Math.random() * 12),
    '🦏': Math.floor(Math.random() * 8), '🦛': Math.floor(Math.random() * 10), '🐘': Math.floor(Math.random() * 15),
    '🦒': Math.floor(Math.random() * 12), '🦌': Math.floor(Math.random() * 14), '🐪': Math.floor(Math.random() * 8),
    '🐫': Math.floor(Math.random() * 6), '🦙': Math.floor(Math.random() * 10), '🦥': Math.floor(Math.random() * 12),
    '🦦': Math.floor(Math.random() * 8), '🦨': Math.floor(Math.random() * 6), '🦝': Math.floor(Math.random() * 10),
    '🐿️': Math.floor(Math.random() * 14), '🦔': Math.floor(Math.random() * 12)
  });

  const getFileIcon = (fileName: string) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'picture-as-pdf';
      case 'doc':
      case 'docx': return 'description';
      case 'xls':
      case 'xlsx': return 'table-chart';
      case 'ppt':
      case 'pptx': return 'slideshow';
      case 'txt': return 'text-snippet';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'image';
      case 'mp4':
      case 'mov':
      case 'avi': return 'video-library';
      case 'mp3':
      case 'wav':
      case 'aac': return 'audio-file';
      default: return 'attach-file';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get top 3 most popular emojis for display near heart
  const getTopReactions = () => {
    return Object.entries(postReactions)
      .filter(([emoji, count]) => count > 0)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
  };

  // Get all emoji categories for organized display
  const getEmojiCategories = () => {
    return {
      faces: Object.entries(postReactions).filter(([emoji]) => 
        ['😀', '😃', '😄', '😁', '😆', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '😏', '😒', '🙄', '😬', '🤥', '😔', '😟', '😕', '🙁', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😪', '🤤', '😴', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕'].includes(emoji)
      ),
      hearts: Object.entries(postReactions).filter(([emoji]) => 
        ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '💋'].includes(emoji)
      ),
      hands: Object.entries(postReactions).filter(([emoji]) => 
        ['👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳'].includes(emoji)
      ),
      celebration: Object.entries(postReactions).filter(([emoji]) => 
        ['🎉', '🎊', '🥳', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎫', '🎟️', '🎪', '🎭', '🎨'].includes(emoji)
      ),
      energy: Object.entries(postReactions).filter(([emoji]) => 
        ['🔥', '💥', '⚡', '💫', '⭐', '🌟', '✨', '💎', '💍', '👑', '🔱', '⚜️'].includes(emoji)
      ),
      symbols: Object.entries(postReactions).filter(([emoji]) => 
        ['💯', '💢', '💨', '💦', '💤', '💬', '🗨️', '💭', '🗯️', '💡', '🔔', '🔕', '📢', '📣', '📯', '🎵', '🎶', '🎼', '🎤', '🎧', '📻', '🎸', '🥁', '🎺'].includes(emoji)
      ),
      food: Object.entries(postReactions).filter(([emoji]) => 
        ['🍕', '🍔', '🍟', '🌭', '🥪', '🌮', '🌯', '🥙', '🧆', '🍳', '🥚', '🧀', '🥓', '🥩', '🍖', '🍗', '🥨', '🥖', '🍞', '🥯', '🧈', '🍰', '🎂', '🧁', '🍪', '🍩', '🍨', '🍦', '🥧', '🍫', '🍬', '🍭', '🍮'].includes(emoji)
      ),
      animals: Object.entries(postReactions).filter(([emoji]) => 
        ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🦍', '🦘', '🐕', '🐩', '🐈', '🐓', '🦃', '🕊️', '🐧', '🐦', '🦆', '🦢', '🦉', '🦚', '🦜', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🦂', '🐢', '🐍', '🦎', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦏', '🦛', '🐘', '🦒', '🦌', '🐪', '🐫', '🦙', '🦥', '🦦', '🦨', '🦝', '🐿️', '🦔'].includes(emoji)
      )
    };
  };

  const showPostOptions = (postId: string) => {
    console.log('Post options for:', postId);
  };

  const handleHashtagPress = (hashtag: string, event?: any) => {
    if (event) {
      event.stopPropagation();
    }
    console.log('Search hashtag:', hashtag);
  };

  const [userVotedPoll, setUserVotedPoll] = useState<string | null>(null);
  const [tips, setTips] = useState<{ user: string; avatar: string }[]>([]);

  const handlePollVote = (optionIndex: number) => {
    if (!post.poll || userVotedPoll) {
      return; // Already voted or no poll
    }

    // Update the poll with the new vote
    const updatedPoll = {
      ...post.poll,
      options: post.poll.options.map((option, index) => 
        index === optionIndex 
          ? { ...option, votes: option.votes + 1 }
          : option
      ),
      totalVotes: post.poll.totalVotes + 1
    };

    // Update the post with new poll data
    updatePost(post.id, { poll: updatedPoll });
    
    // Mark that user has voted
    setUserVotedPoll(`${post.id}-${optionIndex}`);
  };

  const handleReactionPress = (emoji: string) => {
    setPostReactions(prev => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1
    }));
    
    // Visual feedback without alert
    setShowEmojiBar(false);
    
    // Update the post with reaction
    updatePost(post.id, { 
      reactions: {
        ...postReactions,
        [emoji]: (postReactions[emoji] || 0) + 1
      }
    });
  };

  const handleTranslate = async () => {
    if (!isTranslated) {
      // Simulate translation
      const translations = [
        'This is an amazing post! I love the content and the way it is presented. Thank you for sharing! 🌟',
        'What an incredible insight! This really changed my perspective on the topic. Great work! 💡',
        'Fantastic content! I learned so much from this post. Keep up the excellent work! 📚',
        'This is exactly what I needed to read today. Very inspiring and motivational! ✨',
        'Outstanding post! The information is very valuable and well-presented. Thanks for sharing! 🙏'
      ];
      const translatedText = translations[Math.floor(Math.random() * translations.length)];
      setOriginalContent(post.content);
      updatePost(post.id, { content: translatedText });
    } else {
      updatePost(post.id, { content: originalContent });
    }
    setIsTranslated(!isTranslated);
  };

  const addRandomEmoji = () => {
    const emojis = ['😊', '🎉', '✨', '🚀', '💎', '🌟', '🔥', '💯', '👏', '🎯', '💪', '🌈', '⚡', '🎊', '🏆'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const currentContent = post.content;
    const newContent = currentContent + ' ' + randomEmoji;
    updatePost(post.id, { content: newContent });
    
    // Show brief visual feedback
    setShowEmojiBar(true);
    setTimeout(() => setShowEmojiBar(false), 2000);
  };

  const handleComment = () => {
    if (onComment) {
      onComment(post.id);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(post.id);
    }
  };

  const handleLike = () => {
    const newLikes = post.isLiked ? post.likes - 1 : post.likes + 1;
    updatePost(post.id, { 
      likes: newLikes, 
      isLiked: !post.isLiked 
    });
    onLike?.(post.id);
  };

  const handlePostPress = () => {
    onPress?.(post);
  };

  const handleTip = () => {
    Alert.alert(
      'Support Creator',
      'Tip 10 coins to this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Tip 10 💰',
          onPress: () => {
            const success = donate(post.id, 'post', 10, 'heart');
            if (success) {
              setTips(prev => [...prev.slice(-4), { user: 'You', avatar: '😊' }]);
              Alert.alert('Thank you!', 'Your tip was sent to the creator.');
            }
          }
        }
      ]
    );
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const posted = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const days = Math.floor(diffInHours / 24);
    return `${days}${days > 365 ? 'y' : 'd'} ago`;
  };

  // Generate mock user avatars for interactions
  const generateInteractionAvatars = (count: number, type: 'likes' | 'comments' | 'shares') => {
    const avatarSets = {
      likes: ['😊', '😍', '🥰', '😎', '🤩', '😋', '🙂', '😉', '🤗', '😇'],
      comments: ['💬', '🗨️', '💭', '🤔', '💡', '📝', '✍️', '🎯', '🔥', '👀'],
      shares: ['📤', '🔄', '📢', '📣', '🎪', '🌟', '⭐', '✨', '🎉', '🎊']
    };
    
    const baseAvatars = [
      '👨‍💼', '👩‍💻', '👨‍🎨', '👩‍🔬', '👨‍🚀', '👩‍⚕️', '👨‍🏫', '👩‍🎤', 
      '👨‍🍳', '👩‍🌾', '👨‍🔧', '👩‍✈️', '👨‍🎯', '👩‍🎨', '👨‍💻', '👩‍🚀'
    ];
    
    // Mix avatars with type-specific emojis for visual variety
    const mixedAvatars = [];
    for (let i = 0; i < count; i++) {
      if (i % 2 === 0) {
        mixedAvatars.push(baseAvatars[i % baseAvatars.length]);
      } else {
        mixedAvatars.push(avatarSets[type][i % avatarSets[type].length]);
      }
    }
    
    return mixedAvatars;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <TouchableOpacity 
        style={styles.postTouchable}
        onPress={handlePostPress}
        activeOpacity={0.95}
      >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.avatarText}>
            {post.user.displayName.charAt(0)}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <View style={styles.userDetails}>
            <View style={styles.nameRow}>
              <Text style={[styles.displayName, { color: theme.colors.text }]}>{post.user.displayName}</Text>
              {post.user.verified && (
                <MaterialIcons name="verified" size={16} color={theme.colors.primary} style={styles.verifiedIcon} />
              )}
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.timeText}>{getTimeAgo(post.createdAt)}</Text>
              {post.location && (
                <>
                  <Text style={styles.dot}>•</Text>
                  <MaterialIcons name="location-on" size={12} color={theme.colors.primary} />
                  <Text style={[styles.locationText, { color: theme.colors.primary }]}>{post.location}</Text>
                </>
              )}
            </View>
          </View>
          {onSubscribe && (
            <TouchableOpacity 
              style={[
                styles.subscribeButton,
                { borderColor: theme.colors.primary },
                isSubscribed && { backgroundColor: theme.colors.primary }
              ]}
              onPress={onSubscribe}
            >
              <MaterialIcons 
                name={isSubscribed ? 'check' : 'add'} 
                size={16} 
                color={isSubscribed ? 'white' : theme.colors.primary}
              />
              <Text style={[
                styles.subscribeButtonText,
                { color: theme.colors.primary },
                isSubscribed && styles.subscribeButtonTextActive
              ]}>
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.moreButton} onPress={() => showPostOptions(post.id)}>
          <MaterialIcons name="more-horiz" size={24} color="#718096" />
        </TouchableOpacity>
      </View>

      {/* Live Badge */}
      {post.isLive && (
        <TouchableOpacity style={styles.liveBadge} onPress={onLivePress}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <Text style={styles.viewersText}>{formatNumber(post.liveViewers || 0)} watching</Text>
        </TouchableOpacity>
      )}

      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={[styles.content, { color: theme.colors.text }]}>{post.content}</Text>
        
        {/* File Attachments */}
        {post.attachments && post.attachments.length > 0 && (
          <View style={[styles.attachmentsContainer, { backgroundColor: theme.colors.inputBackground }]}>
            <View style={styles.attachmentsHeader}>
              <MaterialIcons name="attach-file" size={16} color={theme.colors.primary} />
              <Text style={[styles.attachmentsTitle, { color: theme.colors.text }]}>Attached Files ({post.attachments.length})</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {post.attachments.map((file, index) => (
                <View key={index} style={[styles.attachmentItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                  <View style={styles.attachmentIconContainer}>
                    <MaterialIcons 
                      name={getFileIcon(file.name)} 
                      size={20} 
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text style={[styles.attachmentName, { color: theme.colors.text }]} numberOfLines={1}>{file.name}</Text>
                  <Text style={styles.attachmentSize}>{formatFileSize(file.size)}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* GIF Display */}
        {(post.mediaType === 'gif' || (post.mediaUrl && post.mediaUrl.endsWith('.gif'))) && post.mediaUrl && (
          <View style={styles.gifContainer}>
            <Image source={{ uri: post.mediaUrl }} style={styles.gifImage} contentFit="contain" />
            <View style={styles.gifBadge}>
              <Text style={styles.gifBadgeText}>GIF</Text>
            </View>
          </View>
        )}

        {/* Poll Display */}
        {post.poll && (
          <View style={styles.pollContainer}>
            <View style={styles.pollHeader}>
              <MaterialIcons name="poll" size={20} color="#8B5CF6" />
              <Text style={styles.pollQuestion}>Poll • {post.poll.totalVotes} votes</Text>
              {userVotedPoll && (
                <View style={styles.votedBadge}>
                  <MaterialIcons name="how-to-vote" size={14} color="#10B981" />
                  <Text style={styles.votedText}>Voted</Text>
                </View>
              )}
            </View>
            {post.poll.options.map((option, index) => {
              const percentage = post.poll!.totalVotes > 0 ? (option.votes / post.poll!.totalVotes) * 100 : 0;
              const isSelected = userVotedPoll === `${post.id}-${index}`;
              return (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.pollOption,
                    userVotedPoll && !isSelected && styles.pollOptionDisabled
                  ]}
                  onPress={() => handlePollVote(index)}
                  disabled={!!userVotedPoll}
                  activeOpacity={userVotedPoll ? 1 : 0.7}
                >
                  <View style={[
                    styles.pollOptionBar,
                    isSelected && styles.selectedPollOption
                  ]}>
                    <View 
                      style={[
                        styles.pollOptionProgress, 
                        { width: userVotedPoll ? `${percentage}%` : '0%' },
                        isSelected && styles.selectedProgress
                      ]} 
                    />
                    <View style={styles.pollOptionContent}>
                      <View style={styles.pollOptionLeft}>
                        {!userVotedPoll && (
                          <View style={styles.pollRadio}>
                            <View style={styles.pollRadioInner} />
                          </View>
                        )}
                        {isSelected && (
                          <MaterialIcons name="check-circle" size={20} color="#10B981" />
                        )}
                        <Text style={[
                          styles.pollOptionText,
                          isSelected && styles.selectedPollText
                        ]}>{option.text}</Text>
                      </View>
                      {userVotedPoll && (
                        <View style={styles.pollOptionRight}>
                          <Text style={[
                            styles.pollOptionPercentage,
                            isSelected && styles.selectedPollPercentage
                          ]}>{Math.round(percentage)}%</Text>
                          <Text style={styles.pollOptionVotes}>{option.votes} votes</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
            
            {!userVotedPoll && (
              <View style={styles.pollFooter}>
                <MaterialIcons name="info-outline" size={16} color="#6B7280" />
                <Text style={styles.pollFooterText}>Tap an option to vote</Text>
              </View>
            )}
          </View>
        )}
        
        {/* Content Actions */}
        <View style={styles.contentActions}>
          <TouchableOpacity 
            style={[styles.contentActionButton, { backgroundColor: theme.colors.buttonSecondary, borderColor: theme.colors.border }]}
            onPress={handleTranslate}
          >
            <MaterialIcons 
              name={isTranslated ? 'translate' : 'g-translate'} 
              size={16} 
              color={isTranslated ? theme.colors.success : theme.colors.primary}
            />
            <Text style={[styles.contentActionText, { color: theme.colors.textSecondary }, isTranslated && { color: theme.colors.success }]}>
              {isTranslated ? 'Show Original' : 'Translate'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.contentActionButton, { backgroundColor: theme.colors.buttonSecondary, borderColor: theme.colors.border }]}
            onPress={addRandomEmoji}
          >
            <Text style={styles.emojiIcon}>😊</Text>
            <Text style={[styles.contentActionText, { color: theme.colors.textSecondary }]}>Add Emoji</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.contentActionButton, { backgroundColor: theme.colors.buttonSecondary, borderColor: theme.colors.border }]}
            onPress={() => setShowEmojiBar(!showEmojiBar)}
          >
            <MaterialIcons name="sentiment-satisfied-alt" size={16} color={theme.colors.warning} />
            <Text style={[styles.contentActionText, { color: theme.colors.textSecondary }]}>React</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Top Reactions Display Near Heart */}
      <View style={styles.topReactionsContainer}>
        <View style={styles.topReactionsHeader}>
          <MaterialIcons name="favorite" size={18} color="#EF4444" />
          <Text style={styles.topReactionsTitle}>Top Reactions</Text>
        </View>
        
        <View style={styles.topReactionsList}>
          {getTopReactions().map(([emoji, count], index) => (
            <View key={emoji} style={[styles.topReactionItem, { zIndex: 3 - index }]}>
              <View style={styles.topReactionBadge}>
                <Text style={styles.topReactionEmoji}>{emoji}</Text>
                <View style={styles.topReactionCountBadge}>
                  <Text style={styles.topReactionCount}>{formatNumber(count)}</Text>
                </View>
              </View>
            </View>
          ))}
          
          {/* Total Reactions Indicator */}
          <View style={[styles.totalReactionsIndicator, { backgroundColor: theme.colors.info }]}>
            <Text style={styles.totalReactionsText}>
              {formatNumber(Object.values(postReactions).reduce((sum, count) => sum + count, 0))}
            </Text>
            <Text style={styles.totalReactionsLabel}>total</Text>
          </View>
        </View>
      </View>
      
      {/* Popular Reactions Display */}
      <View style={styles.popularReactions}>
        {Object.entries(postReactions)
          .filter(([emoji, count]) => count > 0)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 6)
          .map(([emoji, count]) => (
            <View key={emoji} style={styles.popularReaction}>
              <Text style={styles.popularEmoji}>{emoji}</Text>
              <Text style={styles.popularCount}>{count}</Text>
            </View>
          ))
        }
      </View>
      
      {/* Comprehensive Emoji Bar - Always Visible When Like is Pressed */}
      {showEmojiBar && (
        <View style={styles.comprehensiveEmojiBar}>
          <View style={styles.emojiBarHeader}>
            <Text style={styles.reactionBarTitle}>Choose your reaction</Text>
            <View style={styles.emojiBarActions}>
              <TouchableOpacity 
                onPress={handleLike}
                style={styles.quickLikeButton}
              >
                <MaterialIcons 
                  name={post.isLiked ? "favorite" : "favorite-border"} 
                  size={16} 
                  color={post.isLiked ? "#EF4444" : "#6B7280"} 
                />
                <Text style={[styles.quickLikeText, post.isLiked && { color: '#EF4444' }]}>
                  {post.isLiked ? 'Unlike' : 'Like'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowEmojiBar(false)}>
                <MaterialIcons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Quick Popular Reactions */}
          <View style={styles.quickReactionRow}>
            <Text style={styles.quickTitle}>⚡ Quick React:</Text>
            <View style={styles.quickButtons}>
              {['❤️', '👍', '😂', '😮', '😢', '😡', '🔥', '💯', '👏', '🎉'].map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.quickReactionButton}
                  onPress={() => handleReactionPress(emoji)}
                >
                  <Text style={styles.quickReactionEmoji}>{emoji}</Text>
                  <Text style={styles.quickReactionCount}>
                    {postReactions[emoji] || 0}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <ScrollView style={styles.emojiCategoriesContainer} showsVerticalScrollIndicator={false}>
            {Object.entries(getEmojiCategories()).map(([categoryName, emojis]) => (
              <View key={categoryName} style={styles.emojiCategory}>
                <Text style={styles.emojiCategoryTitle}>
                  {categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}
                </Text>
                
                <View style={styles.emojiCategoryGrid}>
                  {emojis
                    .slice(0, 16) // Show more emojis per category
                    .map(([emoji, count]) => (
                        <TouchableOpacity 
                        key={emoji}
                        style={styles.categoryEmojiButton}
                        onPress={() => handleReactionPress(emoji)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.categoryEmojiIcon}>{emoji}</Text>
                        <Text style={styles.categoryEmojiCount}>{count}</Text>
                      </TouchableOpacity>
                    ))
                  }
                </View>
              </View>
            ))}
          </ScrollView>
          
          {/* Most Popular Overall */}
          <View style={styles.allTimePopular}>
            <Text style={styles.allTimePopularTitle}>🏆 Most Popular</Text>
            <View style={styles.allTimePopularGrid}>
              {Object.entries(postReactions)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 8)
                .map(([emoji, count]) => (
                  <TouchableOpacity 
                    key={emoji}
                    style={styles.allTimePopularButton}
                    onPress={() => handleReactionPress(emoji)}
                    activeOpacity={0.6}
                  >
                    <Text style={styles.allTimePopularEmoji}>{emoji}</Text>
                    <Text style={styles.allTimePopularCount}>{formatNumber(count)}</Text>
                  </TouchableOpacity>
                ))
              }
            </View>
          </View>
        </View>
      )}

      {/* Hashtags */}
      {post.hashtags && post.hashtags.length > 0 && (
        <View 
          style={styles.hashtagContainer}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {post.hashtags.map((hashtag, index) => (
            <TouchableOpacity 
              key={`${post.id}-hashtag-${index}`} 
              style={[styles.hashtag, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}
              onPress={(e) => {
                e.stopPropagation();
                handleHashtagPress(hashtag);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.hashtagText, { color: theme.colors.primary }]}>{hashtag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Verification Indicators */}
      <View style={styles.verificationContainer}>
        <View style={styles.verificationRow}>
          <View style={styles.verificationIcons}>
            <MaterialIcons name="verified-user" size={14} color={theme.colors.primary} />
            <MaterialIcons name="verified-user" size={14} color={theme.colors.primary} />
            <MaterialIcons name="verified" size={14} color={theme.colors.primary} />
          </View>
          <Text style={[styles.verificationText, { color: theme.colors.textSecondary }]}>Liked by verified users</Text>
        </View>
        <View style={styles.verificationRow}>
          <View style={styles.verificationIcons}>
            <MaterialIcons name="verified" size={14} color={theme.colors.primary} />
            <MaterialIcons name="verified-user" size={14} color={theme.colors.primary} />
          </View>
          <Text style={[styles.verificationText, { color: theme.colors.textSecondary }]}>Commented by verified users</Text>
        </View>
      </View>

      {/* User Interaction Circles */}
      <View style={styles.interactionSection}>
        {/* Tips / Contributors Section */}
        {tips.length > 0 && (
          <View style={styles.interactionGroup}>
            <View style={styles.interactionCircles}>
              {tips.map((tip, index) => (
                <TouchableOpacity
                  key={`tip-${index}`}
                  style={[
                    styles.userInteractionCircle,
                    { zIndex: 10 - index, marginLeft: index > 0 ? -10 : 0, borderColor: '#FBBF24' }
                  ]}
                  onPress={() => router.push('/profile')}
                >
                  <Text style={styles.interactionAvatarText}>{tip.avatar}</Text>
                </TouchableOpacity>
              ))}
              {tips.length >= 5 && (
                <View style={[styles.userInteractionCircle, styles.moreUsersCircle, { marginLeft: -10 }]}>
                  <Text style={styles.moreUsersText}>+...</Text>
                </View>
              )}
            </View>
            <View style={styles.interactionInfo}>
              <Text style={[styles.interactionText, { color: '#D97706', fontWeight: '700' }]}>
                Supported by {tips.length} contributors
              </Text>
            </View>
          </View>
        )}

        {/* Likes Section */}
        {post.likes > 0 && (
          <View style={styles.interactionGroup}>
            <View style={styles.interactionCircles}>
              {/* Mock user avatars who liked */}
              {generateInteractionAvatars(Math.min(post.likes, 3), 'likes').map((avatar, index) => (
                <View 
                  key={`like-${index}`} 
                  style={[
                    styles.userInteractionCircle,
                    { zIndex: 3 - index, marginLeft: index > 0 ? -8 : 0 }
                  ]}
                >
                  <Text style={styles.interactionAvatarText}>{avatar}</Text>
                </View>
              ))}
              {post.likes > 3 && (
                <View style={[styles.userInteractionCircle, styles.moreUsersCircle, { marginLeft: -8 }]}>
                  <Text style={styles.moreUsersText}>+{post.likes - 3}</Text>
                </View>
              )}
            </View>
            <View style={styles.interactionInfo}>
              <MaterialIcons name="favorite" size={14} color="#EF4444" />
              <Text style={styles.interactionText}>
                {post.likes === 1 ? '1 like' : `${formatNumber(post.likes)} likes`}
              </Text>
            </View>
          </View>
        )}

        {/* Comments Section */}
        {post.comments > 0 && (
          <View style={styles.interactionGroup}>
            <View style={styles.interactionCircles}>
              {/* Mock user avatars who commented */}
              {generateInteractionAvatars(Math.min(post.comments, 3), 'comments').map((avatar, index) => (
                <View 
                  key={`comment-${index}`} 
                  style={[
                    styles.userInteractionCircle,
                    { zIndex: 3 - index, marginLeft: index > 0 ? -8 : 0 }
                  ]}
                >
                  <Text style={styles.interactionAvatarText}>{avatar}</Text>
                </View>
              ))}
              {post.comments > 3 && (
                <View style={[styles.userInteractionCircle, styles.moreUsersCircle, { marginLeft: -8 }]}>
                  <Text style={styles.moreUsersText}>+{post.comments - 3}</Text>
                </View>
              )}
            </View>
            <View style={styles.interactionInfo}>
              <MaterialIcons name="chat-bubble-outline" size={14} color={theme.colors.primary} />
              <Text style={[styles.interactionText, { color: theme.colors.textSecondary }]}>
                {post.comments === 1 ? '1 comment' : `${formatNumber(post.comments)} comments`}
              </Text>
            </View>
          </View>
        )}

        {/* Shares Section */}
        {post.shares > 0 && (
          <View style={styles.interactionGroup}>
            <View style={styles.interactionCircles}>
              {/* Mock user avatars who shared */}
              {generateInteractionAvatars(Math.min(post.shares, 3), 'shares').map((avatar, index) => (
                <View 
                  key={`share-${index}`} 
                  style={[
                    styles.userInteractionCircle,
                    { zIndex: 3 - index, marginLeft: index > 0 ? -8 : 0 }
                  ]}
                >
                  <Text style={styles.interactionAvatarText}>{avatar}</Text>
                </View>
              ))}
              {post.shares > 3 && (
                <View style={[styles.userInteractionCircle, styles.moreUsersCircle, { marginLeft: -8 }]}>
                  <Text style={styles.moreUsersText}>+{post.shares - 3}</Text>
                </View>
              )}
            </View>
            <View style={styles.interactionInfo}>
              <MaterialIcons name="share" size={14} color="#8B5CF6" />
              <Text style={styles.interactionText}>
                {post.shares === 1 ? '1 share' : `${formatNumber(post.shares)} shares`}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Traditional Stats (backup display) */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <MaterialIcons name="favorite" size={16} color="#EF4444" />
          <Text style={styles.statText}>{formatNumber(post.likes)}</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialIcons name="chat-bubble-outline" size={16} color="#718096" />
          <Text style={styles.statText}>{formatNumber(post.comments)} comments</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialIcons name="share" size={16} color="#718096" />
          <Text style={styles.statText}>{formatNumber(post.shares)} shares</Text>
        </View>
      </View>

      {/* Actions */}
      <View 
        style={styles.actions}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={(e) => {
            e.stopPropagation();
            setShowEmojiBar(!showEmojiBar);
          }}
        >
          <MaterialIcons 
            name={post.isLiked ? "favorite" : "favorite-border"} 
            size={20} 
            color={post.isLiked ? "#EF4444" : "#718096"} 
          />
          <Text style={[styles.actionText, post.isLiked && styles.likedText]}>
            {showEmojiBar ? 'Close Reactions' : 'React'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={(e) => {
            e.stopPropagation();
            handleComment();
          }}
        >
          <MaterialIcons name="chat-bubble-outline" size={20} color="#718096" />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={(e) => {
            e.stopPropagation();
            handleTip();
          }}
        >
          <MaterialIcons name="monetization-on" size={20} color="#F59E0B" />
          <Text style={[styles.actionText, { color: '#F59E0B' }]}>Tip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={(e) => {
            e.stopPropagation();
            handleShare();
          }}
        >
          <MaterialIcons name="share" size={20} color="#718096" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Live Stream Floating Reactions */}
      {post.isLive && (
        <View style={styles.liveReactionBar}>
          <Text style={styles.liveReactionTitle}>Live Reactions</Text>
          <View style={styles.liveReactionGrid}>
            {['❤️', '👍', '😂', '😮', '🔥', '💯'].map((emoji, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.liveReactionButton}
                onPress={() => handleReactionPress(emoji)}
                activeOpacity={0.6}
              >
                <Text style={styles.liveReactionEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  postTouchable: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  displayName: {
    color: '#2D3748',
    fontSize: 16,
    fontWeight: '600',
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: '#718096',
    fontSize: 14,
  },
  dot: {
    color: '#718096',
    marginHorizontal: 4,
  },
  locationText: {
    color: '#3B82F6',
    fontSize: 14,
    marginLeft: 2,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3B82F6',
    backgroundColor: 'white',
    gap: 4,
  },
  subscribeButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  subscribeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  subscribeButtonTextActive: {
    color: 'white',
  },
  moreButton: {
    padding: 4,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    marginRight: 4,
  },
  liveText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewersText: {
    color: '#718096',
    fontSize: 14,
  },
  contentContainer: {
    marginBottom: 12,
  },
  content: {
    color: '#2D3748',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  contentActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  contentActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  contentActionText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  translatedText: {
    color: '#10B981',
  },
  emojiIcon: {
    fontSize: 14,
  },
  popularReactions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  popularReaction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  popularEmoji: {
    fontSize: 14,
  },
  popularCount: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  emojiReactionBar: {
    backgroundColor: '#FAFBFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reactionBarTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  reactionScroll: {
    marginBottom: 16,
  },
  emojiGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 4,
  },
  emojiReactionButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    minWidth: 64,
  },
  reactionCount: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
    marginTop: 4,
  },
  quickReactionRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 16,
  },
  quickTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  quickButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickReactionButton: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minWidth: 44,
  },
  quickReactionEmoji: {
    fontSize: 16,
  },
  quickReactionCount: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
    marginTop: 2,
  },
  hashtagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  hashtag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  hashtagText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  verificationContainer: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  verificationIcons: {
    flexDirection: 'row',
    marginRight: 8,
  },
  verificationText: {
    color: '#718096',
    fontSize: 14,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F7FAFC',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    color: '#718096',
    fontSize: 14,
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F7FAFC',
  },
  actionText: {
    color: '#718096',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  likedText: {
    color: '#EF4444',
  },
  liveReactionBar: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  liveReactionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 8,
  },
  liveReactionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  liveReactionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  liveReactionEmoji: {
    fontSize: 22,
  },
  reactionEmoji: {
    fontSize: 20,
  },
  
  // User Interaction Circles Styles
  interactionSection: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  interactionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  interactionCircles: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  userInteractionCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0F9FF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  moreUsersCircle: {
    backgroundColor: '#E5E7EB',
  },
  interactionAvatarText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreUsersText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  interactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  interactionText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  
  // Top Reactions Near Heart Styles
  topReactionsContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  topReactionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  topReactionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  topReactionsList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topReactionItem: {
    position: 'relative',
  },
  topReactionBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    position: 'relative',
  },
  topReactionEmoji: {
    fontSize: 24,
  },
  topReactionCountBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  topReactionCount: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  totalReactionsIndicator: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    marginLeft: 12,
  },
  totalReactionsText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  totalReactionsLabel: {
    fontSize: 10,
    color: '#DBEAFE',
    fontWeight: '500',
  },
  
  // Comprehensive Emoji Bar Styles
  comprehensiveEmojiBar: {
    backgroundColor: '#FAFBFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: 400,
  },
  emojiBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  emojiBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickLikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  quickLikeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  emojiCategoriesContainer: {
    flex: 1,
    marginBottom: 16,
  },
  emojiCategory: {
    marginBottom: 16,
  },
  emojiCategoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  emojiCategoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 4,
  },
  categoryEmojiButton: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minWidth: 40,
    marginBottom: 8,
  },
  categoryEmojiIcon: {
    fontSize: 20,
  },
  categoryEmojiCount: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
    marginTop: 2,
  },
  allTimePopular: {
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  allTimePopularTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EA580C',
    marginBottom: 8,
  },
  allTimePopularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allTimePopularButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FB923C',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  allTimePopularEmoji: {
    fontSize: 22,
  },
  allTimePopularCount: {
    fontSize: 11,
    color: '#EA580C',
    fontWeight: '700',
    marginTop: 4,
  },
  attachmentsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  attachmentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  attachmentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  attachmentItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    width: 80,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  attachmentIconContainer: {
    marginBottom: 4,
  },
  attachmentName: {
    fontSize: 10,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 2,
  },
  attachmentSize: {
    fontSize: 8,
    color: '#64748B',
    textAlign: 'center',
  },
  gifContainer: {
    position: 'relative',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gifImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  gifBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gifBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  pollContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pollHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  pollQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  votedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  votedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10B981',
  },
  pollOption: {
    marginBottom: 8,
  },
  pollOptionDisabled: {
    opacity: 0.7,
  },
  selectedPollOption: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  pollOptionBar: {
    position: 'relative',
    backgroundColor: '#E5E7EB',
    borderRadius: 20,
    padding: 12,
    minHeight: 50,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  pollOptionProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    opacity: 0.2,
    transition: 'width 0.3s ease',
  },
  selectedProgress: {
    backgroundColor: '#10B981',
    opacity: 0.3,
  },
  pollOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  pollOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  pollRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  pollRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  pollOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  selectedPollText: {
    fontWeight: '600',
    color: '#10B981',
  },
  pollOptionRight: {
    alignItems: 'flex-end',
  },
  pollOptionPercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  selectedPollPercentage: {
    color: '#10B981',
  },
  pollOptionVotes: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  pollFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 6,
  },
  pollFooterText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});
