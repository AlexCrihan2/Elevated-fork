import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface StoryCreatorProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (story: any) => void;
  onCreateStory: (story: any) => void;
}

interface MediaFile {
  id: string;
  uri: string;
  type: 'image' | 'video';
  name: string;
  size?: number;
}

interface TrendingCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  trend: 'up' | 'down' | 'stable';
  count: number;
}

export default function StoryCreator({ visible, onClose, onSubmit }: StoryCreatorProps) {
  const { theme, isDark } = useTheme();
  const [content, setContent] = useState('');
  const [selectedBackground, setSelectedBackground] = useState('#4F46E5');
  const [selectedFont, setSelectedFont] = useState('default');
  const [textSize, setTextSize] = useState(16);
  const [textAlign, setTextAlign] = useState('left');
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [duration, setDuration] = useState(15);
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [stickers, setStickers] = useState<{ id: string; emoji: string; x: number; y: number }[]>([]);
  const [showStickerPicker, setShowStickerPicker] = useState(false);

  const panGesture = useRef();
  const containerHeight = useSharedValue(screenHeight * 0.9);

  // Trending categories with real-time data
  const trendingCategories: TrendingCategory[] = [
    { id: 'technology', name: 'Technology', icon: 'smartphone', color: '#3B82F6', trend: 'up', count: 24500 },
    { id: 'music', name: 'Music', icon: 'music-note', color: '#EC4899', trend: 'up', count: 18200 },
    { id: 'sports', name: 'Sports', icon: 'sports-soccer', color: '#10B981', trend: 'stable', count: 15800 },
    { id: 'travel', name: 'Travel', icon: 'flight', color: '#F59E0B', trend: 'up', count: 12400 },
    { id: 'food', name: 'Food', icon: 'restaurant', color: '#EF4444', trend: 'down', count: 11200 },
    { id: 'fashion', name: 'Fashion', icon: 'checkroom', color: '#8B5CF6', trend: 'up', count: 9800 },
    { id: 'art', name: 'Art', icon: 'palette', color: '#06B6D4', trend: 'stable', count: 8600 },
    { id: 'fitness', name: 'Fitness', icon: 'fitness-center', color: '#84CC16', trend: 'up', count: 7900 },
    { id: 'gaming', name: 'Gaming', icon: 'sports-esports', color: '#F97316', trend: 'up', count: 22100 },
    { id: 'education', name: 'Education', icon: 'school', color: '#6366F1', trend: 'stable', count: 6700 },
  ];

  const backgrounds = ['#4F46E5', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#F97316'];
  const fonts = ['default', 'serif', 'monospace'];
  const alignments = ['left', 'center', 'right'];

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets) {
        const newImages: MediaFile[] = result.assets.map((asset, index) => ({
          id: `img-${Date.now()}-${index}`,
          uri: asset.uri,
          type: 'image' as const,
          name: `image-${index + 1}.jpg`,
          size: asset.fileSize,
        }));
        setMediaFiles(prev => [...prev, ...newImages]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        const newVideos: MediaFile[] = result.assets.map((asset, index) => ({
          id: `vid-${Date.now()}-${index}`,
          uri: asset.uri,
          type: 'video' as const,
          name: asset.name || `video-${index + 1}.mp4`,
          size: asset.size,
        }));
        setMediaFiles(prev => [...prev, ...newVideos]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const removeMedia = (mediaId: string) => {
    setMediaFiles(prev => prev.filter(media => media.id !== mediaId));
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const publishedDate = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addSticker = (emoji: string) => {
    setStickers([...stickers, {
      id: Date.now().toString(),
      emoji,
      x: Math.random() * (screenWidth - 100) + 50,
      y: Math.random() * 150 + 100
    }]);
    setShowStickerPicker(false);
  };

  const removeSticker = (id: string) => {
    setStickers(stickers.filter(s => s.id !== id));
  };

  const handleSubmit = () => {
    if (!content.trim() && mediaFiles.length === 0) {
      Alert.alert('Error', 'Please add content or media to your story');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a trending category');
      return;
    }

    const storyData = {
      content: content.trim(),
      background: selectedBackground,
      font: selectedFont,
      textSize,
      textAlign,
      music: selectedMusic,
      duration,
      privacy,
      tags,
      mediaFiles,
      stickers,
      category: selectedCategory,
      createdAt: new Date().toISOString(),
      id: Date.now().toString(),
    };

    onSubmit(storyData);
    if (typeof onCreateStory === 'function') onCreateStory(storyData);

    // Reset form
    setContent('');
    setSelectedBackground('#4F46E5');
    setSelectedFont('default');
    setTextSize(16);
    setTextAlign('left');
    setSelectedMusic(null);
    setDuration(15);
    setPrivacy('public');
    setTags([]);
    setTagInput('');
    setMediaFiles([]);
    setSelectedCategory(null);
    setShowAdvancedOptions(false);
    
    onClose();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    height: containerHeight.value,
  }));

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Animated.View style={[styles.container, animatedStyle, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Create Story</Text>
          <TouchableOpacity 
            onPress={handleSubmit}
            style={[styles.shareButton, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Trending Category Selection */}
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="trending-up" size={20} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Choose Trending Category</Text>
            </View>
            
            <TouchableOpacity
              style={[
                styles.categorySelector,
                {
                  backgroundColor: selectedCategory ? theme.colors.primary : theme.colors.background,
                  borderColor: theme.colors.border,
                }
              ]}
              onPress={() => setShowCategoryModal(true)}
            >
              {selectedCategory ? (
                <View style={styles.selectedCategoryContent}>
                  <MaterialIcons 
                    name={trendingCategories.find(c => c.id === selectedCategory)?.icon as any || 'category'} 
                    size={20} 
                    color="#FFFFFF" 
                  />
                  <Text style={styles.selectedCategoryText}>
                    {trendingCategories.find(c => c.id === selectedCategory)?.name}
                  </Text>
                  <View style={styles.trendBadge}>
                    <MaterialIcons 
                      name={trendingCategories.find(c => c.id === selectedCategory)?.trend === 'up' ? 'trending-up' : 'trending-flat'} 
                      size={12} 
                      color="#FFFFFF" 
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.placeholderContent}>
                  <MaterialIcons name="add" size={20} color={theme.colors.textSecondary} />
                  <Text style={[styles.placeholderText, { color: theme.colors.textSecondary }]}>
                    Select trending category
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Content Input */}
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Story Content</Text>
            <TextInput
              style={[
                styles.contentInput,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                  fontSize: textSize,
                  textAlign: textAlign as any,
                  fontFamily: selectedFont === 'default' ? undefined : selectedFont
                }
              ]}
              placeholder="What's on your mind?"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={6}
              value={content}
              onChangeText={setContent}
              maxLength={500}
            />
            <Text style={[styles.characterCount, { color: theme.colors.textSecondary }]}>
              {content.length}/500
            </Text>
          </View>

          {/* Media Upload Section */}
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="perm-media" size={20} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Add Media</Text>
            </View>
            
            <View style={styles.mediaButtons}>
              <TouchableOpacity
                style={[styles.mediaButton, { backgroundColor: theme.colors.primary }]}
                onPress={pickImage}
              >
                <MaterialIcons name="image" size={20} color="#FFFFFF" />
                <Text style={styles.mediaButtonText}>Photos</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.mediaButton, { backgroundColor: '#EF4444' }]}
                onPress={pickVideo}
              >
                <MaterialIcons name="videocam" size={20} color="#FFFFFF" />
                <Text style={styles.mediaButtonText}>Videos</Text>
              </TouchableOpacity>
            </View>
            
            {mediaFiles.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaPreview}>
                {mediaFiles.map((media) => (
                  <View key={media.id} style={styles.mediaItem}>
                    {media.type === 'image' ? (
                      <Image
                        source={{ uri: media.uri }}
                        style={styles.mediaThumbnail}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={[styles.mediaThumbnail, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                        <MaterialIcons name="play-circle-filled" size={30} color={theme.colors.primary} />
                        <Text style={[styles.videoLabel, { color: theme.colors.textSecondary }]}>Video</Text>
                      </View>
                    )}
                    
                    <TouchableOpacity
                      style={styles.removeMediaButton}
                      onPress={() => removeMedia(media.id)}
                    >
                      <MaterialIcons name="close" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                    
                    <Text style={[styles.mediaName, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                      {media.name}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Background Selection */}
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="face" size={20} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Add Stickers</Text>
            </View>
            <TouchableOpacity
              style={[styles.addStickerBtn, { borderColor: theme.colors.primary }]}
              onPress={() => setShowStickerPicker(true)}
            >
              <MaterialIcons name="add-reaction" size={24} color={theme.colors.primary} />
              <Text style={[styles.addStickerText, { color: theme.colors.primary }]}>Choose Stickers</Text>
            </TouchableOpacity>
          </View>

          {/* Background Selection */}
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Background Color</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {backgrounds.map((bg) => (
                <TouchableOpacity
                  key={bg}
                  style={[
                    styles.backgroundOption,
                    { backgroundColor: bg },
                    selectedBackground === bg && styles.selectedBackground
                  ]}
                  onPress={() => setSelectedBackground(bg)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Text Customization */}
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Text Style</Text>
            
            <View style={styles.textOptions}>
              <View style={styles.textOptionRow}>
                <Text style={[styles.optionLabel, { color: theme.colors.text }]}>Font Size:</Text>
                <View style={styles.textSizeOptions}>
                  {[14, 16, 18, 20].map((size) => (
                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.sizeOption,
                        { backgroundColor: theme.colors.background },
                        textSize === size && { backgroundColor: theme.colors.primary }
                      ]}
                      onPress={() => setTextSize(size)}
                    >
                      <Text style={[
                        styles.sizeOptionText,
                        { color: textSize === size ? '#FFFFFF' : theme.colors.text }
                      ]}>
                        {size}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.textOptionRow}>
                <Text style={[styles.optionLabel, { color: theme.colors.text }]}>Alignment:</Text>
                <View style={styles.alignmentOptions}>
                  {alignments.map((align) => (
                    <TouchableOpacity
                      key={align}
                      style={[
                        styles.alignmentOption,
                        { backgroundColor: theme.colors.background },
                        textAlign === align && { backgroundColor: theme.colors.primary }
                      ]}
                      onPress={() => setTextAlign(align)}
                    >
                      <MaterialIcons
                        name={align === 'left' ? 'format-align-left' : align === 'center' ? 'format-align-center' : 'format-align-right'}
                        size={20}
                        color={textAlign === align ? '#FFFFFF' : theme.colors.text}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Tags */}
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Tags</Text>
            
            <View style={styles.tagInput}>
              <TextInput
                style={[styles.tagTextInput, { color: theme.colors.text }]}
                placeholder="Add tags..."
                placeholderTextColor={theme.colors.textSecondary}
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={addTag}
              />
              <TouchableOpacity onPress={addTag} style={[styles.addTagButton, { backgroundColor: theme.colors.primary }]}>
                <MaterialIcons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((tag) => (
                  <View key={tag} style={[styles.tag, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.tagText}>#{tag}</Text>
                    <TouchableOpacity onPress={() => removeTag(tag)}>
                      <MaterialIcons name="close" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Story Preview Canvas */}
          <View style={[styles.previewSection, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Preview</Text>
            
            <View style={[styles.storyCanvas, { backgroundColor: selectedBackground }]}>
              <LinearGradient
                colors={[
                  selectedBackground,
                  selectedBackground + '80'
                ]}
                style={styles.canvasGradient}
              >
                {/* Category Badge */}
                {selectedCategory && (
                  <View style={[styles.categoryBadge, { backgroundColor: trendingCategories.find(c => c.id === selectedCategory)?.color }]}>
                    <MaterialIcons 
                      name={trendingCategories.find(c => c.id === selectedCategory)?.icon as any} 
                      size={12} 
                      color="#FFFFFF" 
                    />
                    <Text style={styles.categoryBadgeText}>
                      {trendingCategories.find(c => c.id === selectedCategory)?.name}
                    </Text>
                  </View>
                )}
                
                {/* Media Preview */}
                {mediaFiles.length > 0 && (
                  <View style={styles.previewMediaContainer}>
                    {mediaFiles[0].type === 'image' ? (
                      <Image
                        source={{ uri: mediaFiles[0].uri }}
                        style={styles.previewMedia}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={[styles.previewMedia, { backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }]}>
                        <MaterialIcons name="play-circle-filled" size={40} color="#FFFFFF" />
                      </View>
                    )}
                    {mediaFiles.length > 1 && (
                      <View style={styles.mediaCounter}>
                        <Text style={styles.mediaCounterText}>+{mediaFiles.length - 1}</Text>
                      </View>
                    )}
                  </View>
                )}
                
                {/* Story Content Preview */}
                <Text
                  style={[
                    styles.previewText,
                    {
                      fontSize: textSize,
                      textAlign: textAlign as any,
                      fontFamily: selectedFont === 'default' ? undefined : selectedFont,
                      color: '#FFFFFF'
                    }
                  ]}
                >
                  {content || 'Your story content will appear here...'}
                </Text>

                {/* Stickers on Canvas */}
                {stickers.map(s => (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.canvasSticker, { left: s.x, top: s.y }]}
                    onPress={() => removeSticker(s.id)}
                  >
                    <Text style={styles.stickerEmoji}>{s.emoji}</Text>
                    <View style={styles.removeStickerBadge}>
                      <MaterialIcons name="close" size={10} color="white" />
                    </View>
                  </TouchableOpacity>
                ))}
              </LinearGradient>
            </View>
          </View>

          {/* Privacy & Duration */}
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Settings</Text>
            
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Privacy:</Text>
              <View style={styles.privacyOptions}>
                {(['public', 'friends', 'private'] as const).map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.privacyOption,
                      { backgroundColor: theme.colors.background },
                      privacy === option && { backgroundColor: theme.colors.primary }
                    ]}
                    onPress={() => setPrivacy(option)}
                  >
                    <Text style={[
                      styles.privacyText,
                      { color: privacy === option ? '#FFFFFF' : theme.colors.text }
                    ]}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
      
      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.categoryModal, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.categoryModalHeader, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.categoryModalTitle, { color: theme.colors.text }]}>Choose Category</Text>
            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
              <MaterialIcons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.categoryList}>
            {trendingCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryOption,
                  {
                    backgroundColor: selectedCategory === category.id ? category.color : theme.colors.surface,
                    borderColor: theme.colors.border,
                  }
                ]}
                onPress={() => {
                  setSelectedCategory(category.id);
                  setShowCategoryModal(false);
                }}
              >
                <View style={styles.categoryOptionLeft}>
                  <View style={[styles.categoryIcon, { backgroundColor: selectedCategory === category.id ? 'rgba(255,255,255,0.2)' : category.color }]}>
                    <MaterialIcons 
                      name={category.icon as any} 
                      size={20} 
                      color={selectedCategory === category.id ? '#FFFFFF' : '#FFFFFF'} 
                    />
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text style={[styles.categoryName, { color: selectedCategory === category.id ? '#FFFFFF' : theme.colors.text }]}>
                      {category.name}
                    </Text>
                    <Text style={[styles.categoryCount, { color: selectedCategory === category.id ? 'rgba(255,255,255,0.8)' : theme.colors.textSecondary }]}>
                      {category.count.toLocaleString()} posts
                    </Text>
                  </View>
                </View>
                
                <View style={styles.categoryTrend}>
                  <MaterialIcons 
                    name={category.trend === 'up' ? 'trending-up' : category.trend === 'down' ? 'trending-down' : 'trending-flat'} 
                    size={20} 
                    color={category.trend === 'up' ? '#10B981' : category.trend === 'down' ? '#EF4444' : '#6B7280'} 
                  />
                  {selectedCategory === category.id && (
                    <MaterialIcons name="check-circle" size={20} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Sticker Picker Modal */}
      <Modal visible={showStickerPicker} transparent animationType="fade">
        <View style={styles.stickerPickerOverlay}>
          <TouchableOpacity style={styles.pickerCloseBg} onPress={() => setShowStickerPicker(false)} />
          <View style={[styles.stickerPickerModal, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.pickerTitle, { color: theme.colors.text }]}>Choose Stickers</Text>
            <ScrollView contentContainerStyle={styles.stickerGrid}>
              {['🔥', '✨', '🎉', '💡', '🚀', '💯', '❤️', '🙌', '💎', '🎨', '🤖', '🌍', '🎮', '🍕', '🏆', '⭐', '⚡', '🌈'].map(emoji => (
                <TouchableOpacity key={emoji} style={styles.stickerItem} onPress={() => addSticker(emoji)}>
                  <Text style={styles.stickerEmojiLarge}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  shareButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  categorySelector: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  selectedCategoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedCategoryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  trendBadge: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  placeholderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  placeholderText: {
    fontSize: 16,
  },
  contentInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  mediaButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  mediaPreview: {
    marginTop: 12,
  },
  mediaItem: {
    marginRight: 12,
    alignItems: 'center',
  },
  mediaThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeMediaButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaName: {
    fontSize: 10,
    marginTop: 4,
    width: 80,
    textAlign: 'center',
  },
  videoLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  backgroundOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedBackground: {
    borderColor: '#000000',
  },
  textOptions: {
    gap: 16,
  },
  textOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  textSizeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  sizeOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeOptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  alignmentOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  alignmentOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagInput: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tagTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addTagButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  previewSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  storyCanvas: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  canvasGradient: {
    flex: 1,
    padding: 20,
  },
  categoryBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    zIndex: 2,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  previewMediaContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 60,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    zIndex: 1,
  },
  previewMedia: {
    width: '100%',
    height: '100%',
  },
  mediaCounter: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  mediaCounterText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
  },
  previewText: {
    marginTop: 60,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  privacyOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  privacyOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  privacyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryModal: {
    flex: 1,
  },
  categoryModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  categoryModalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  categoryList: {
    flex: 1,
    padding: 16,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 12,
  },
  categoryTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addStickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: 10,
    marginTop: 10,
  },
  addStickerText: {
    fontSize: 15,
    fontWeight: '700',
  },
  canvasSticker: {
    position: 'absolute',
    padding: 8,
  },
  stickerEmoji: {
    fontSize: 40,
  },
  removeStickerBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(239,68,68,0.8)',
    borderRadius: 10,
    padding: 2,
  },
  stickerPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerCloseBg: {
    flex: 1,
  },
  stickerPickerModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '50%',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  stickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  stickerItem: {
    padding: 10,
  },
  stickerEmojiLarge: {
    fontSize: 32,
  },
});
