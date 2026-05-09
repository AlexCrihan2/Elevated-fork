import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar, 
  SafeAreaView, 
  Dimensions,
  FlatList,
  Alert,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CommentsModal from '@/components/posts/CommentsModal';
import UserProfileModal from '@/components/profile/UserProfileModal';
import TranslationWidget from '@/components/ui/TranslationWidget';
import ThemeToggleButton from '@/components/ui/ThemeToggleButton';
import SearchModal from '@/components/ui/SearchModal';
import MessagesModal from '@/components/ui/MessagesModal';
import NotificationsModal from '@/components/ui/NotificationsModal';
import StoriesToolbar, { sampleStories } from '@/components/ui/StoriesToolbar';
import CreatePostModal from '@/components/posts/CreatePostModal';
import ConnectionsManager from '@/components/connections/ConnectionsManager';
import SpiderWebAnalytics from '@/components/connections/SpiderWebAnalytics';
import AIDebugDashboard from '@/components/debug/AIDebugDashboard';
import FloatingAIAssistant from '@/components/ui/FloatingAIAssistant';
import FloatingAIButton from '@/components/ui/FloatingAIButton';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalization } from '@/contexts/LocalizationContext';
import { useConnections } from '@/contexts/ConnectionContext';
import { getAutoTranslateSetting } from '@/services/userPreferences';
import LanguageSelector, { LanguageSelectorButton } from '@/components/ui/LanguageSelector';
import DonationPanel from '@/components/economy/DonationPanel';
import { useEconomy } from '@/contexts/EconomyContext';

const { width } = Dimensions.get('window');

interface Post {
  id: string;
  user: {
    name: string;
    displayName: string;
    username: string;
    avatar: string;
    verified: boolean;
    profession?: string;
    followers?: number;
  };
  content: string;
  timestamp: string;
  createdAt: string;
  contentType?: {
    text: string;
    type: 'text' | 'photo' | 'video' | 'poll';
    poll?: {
      question: string;
      options: { text: string; percentage: number }[];
    };
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    saves?: number;
  };
  analytics?: {
    aiScore: number;
    engagementRate: number;
    reachEstimate: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    viralPotential: number;
    trending: boolean;
  };
  category: string;
  location?: string;
  tags?: string[];
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { t, currentLanguage } = useLocalization();
  const { platformStats } = useConnections();
  const { getDonationsForTarget } = useEconomy();
  
  // State for user preferences
  const [autoTranslate, setAutoTranslate] = useState(true);
  
  // Load user preferences on component mount
  useEffect(() => {
    try {
      const loadPreferences = () => {
        const autoTrans = getAutoTranslateSetting();
        setAutoTranslate(autoTrans);
      };
      loadPreferences();
    } catch (error) {
      console.error('Error loading user preferences:', error);
      // Set defaults on error
      setAutoTranslate(true);
    }
  }, []);
  
  // State
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [messageCount, setMessageCount] = useState(7);
  const [notificationCount, setNotificationCount] = useState(12);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [categoriesVisible, setCategoriesVisible] = useState(true);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  
  // Modal states
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showConnectionsManager, setShowConnectionsManager] = useState(false);
  const [showSpiderAnalytics, setShowSpiderAnalytics] = useState(false);
  const [showAIDebugDashboard, setShowAIDebugDashboard] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [donationPostId, setDonationPostId] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  
  // AI Livestreams data
  const aiLivestreams = [
    { id: 'ls1', title: 'AI & Future Tech Summit', host: 'TechWorld', viewers: 12400, category: 'Technology', emoji: '🤖', color: '#3B82F6', isLive: true },
    { id: 'ls2', title: 'Mindfulness & Mental Health', host: 'Dr. Chen', viewers: 8900, category: 'Health', emoji: '🧘', color: '#10B981', isLive: true },
    { id: 'ls3', title: 'Champions League Match', host: 'Sports Live', viewers: 45200, category: 'Sports', emoji: '⚽', color: '#EF4444', isLive: true },
    { id: 'ls4', title: 'Startup Pitch Night', host: 'VentureHub', viewers: 3400, category: 'Business', emoji: '🚀', color: '#8B5CF6', isLive: true },
    { id: 'ls5', title: 'Global Climate Conference', host: 'EcoNews', viewers: 19800, category: 'Science', emoji: '🌍', color: '#06B6D4', isLive: true },
    { id: 'ls6', title: 'Cooking Masterclass', host: 'Chef Marco', viewers: 5600, category: 'Food', emoji: '👨‍🍳', color: '#F97316', isLive: true },
  ];

  // Quick Actions with proper onPress handlers
  const categories = [
    { id: 'all', name: 'All Posts', icon: 'apps', color: '#6366F1' },
    { id: 'trending', name: 'Trending', icon: 'trending-up', color: '#EF4444' },
    { id: 'technology', name: 'Technology', icon: 'computer', color: '#3B82F6' },
    { id: 'health', name: 'Health & Medical', icon: 'local-hospital', color: '#10B981' },
    { id: 'art', name: 'Art & Design', icon: 'palette', color: '#F59E0B' },
    { id: 'entertainment', name: 'Entertainment', icon: 'movie', color: '#8B5CF6' },
    { id: 'sports', name: 'Sports', icon: 'sports-soccer', color: '#06B6D4' },
    { id: 'food', name: 'Food & Cooking', icon: 'restaurant', color: '#F97316' },
    { id: 'travel', name: 'Travel', icon: 'flight', color: '#84CC16' },
    { id: 'education', name: 'Education', icon: 'school', color: '#A855F7' },
  ];

  // Enhanced Posts data with more diverse users and AI analytics
  const posts: Post[] = [
    {
      id: '1',
      user: {
        name: 'Dr. Sarah Mitchell',
        displayName: 'Dr. Sarah Mitchell',
        username: 'drsarah_mitchell',
        avatar: '👩‍⚕️',
        verified: true,
        profession: 'Medical Researcher',
        followers: 245600
      },
      content: '🧬 BREAKTHROUGH: Our gene therapy trial has successfully restored vision to 47 patients with Leber congenital amaurosis! Using CRISPR-Cas9 technology, we achieved a 94% success rate. This could revolutionize treatment for inherited blindness worldwide. The patients can now see their families for the first time! 🙏 #MedicalBreakthrough #GeneTherapy #CRISPR #Research',
      timestamp: '2 hours ago',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      contentType: {
        text: '🧬 BREAKTHROUGH: Our gene therapy trial has successfully restored vision to 47 patients with Leber congenital amaurosis! Using CRISPR-Cas9 technology, we achieved a 94% success rate. This could revolutionize treatment for inherited blindness worldwide. The patients can now see their families for the first time! 🙏 #MedicalBreakthrough #GeneTherapy #CRISPR #Research',
        type: 'photo',
      },
      engagement: {
        likes: 15420,
        comments: 892,
        shares: 2340,
        saves: 1876
      },
      analytics: {
        aiScore: 94,
        engagementRate: 12.8,
        reachEstimate: 1200000,
        sentiment: 'positive',
        viralPotential: 89,
        trending: true
      },
      category: 'health',
      location: 'Stanford Medical Center, CA',
      tags: ['#MedicalBreakthrough', '#GeneTherapy', '#CRISPR', '#Research']
    },
    {
      id: '2',
      user: {
        name: 'Alex Chen',
        displayName: 'Alex Chen',
        username: 'alex_chen_ai',
        avatar: '👨‍💻',
        verified: true,
        profession: 'AI Engineer',
        followers: 89200
      },
      content: '🚀 Just launched my new AI-powered coding assistant! After 2 years of development, it can now write, debug, and optimize code in 15+ programming languages. Beta testing showed 85% faster development time! What programming language should I add next?',
      timestamp: '4 hours ago',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      contentType: {
        text: '🚀 Just launched my new AI-powered coding assistant! After 2 years of development, it can now write, debug, and optimize code in 15+ programming languages. Beta testing showed 85% faster development time! What programming language should I add next?',
        type: 'poll',
        poll: {
          question: 'Next programming language for AI assistant?',
          options: [
            { text: 'Rust 🦀', percentage: 42 },
            { text: 'Go 🐹', percentage: 28 },
            { text: 'Swift 🍎', percentage: 20 },
            { text: 'Kotlin 📱', percentage: 10 }
          ]
        }
      },
      engagement: {
        likes: 8967,
        comments: 1205,
        shares: 3401,
        saves: 892
      },
      analytics: {
        aiScore: 87,
        engagementRate: 15.2,
        reachEstimate: 750000,
        sentiment: 'positive',
        viralPotential: 76,
        trending: true
      },
      category: 'technology',
      location: 'Silicon Valley, CA',
      tags: ['#AI', '#Programming', '#TechStartup', '#Innovation']
    }
  ];

  const filters = ['All', 'Friends', 'Following', 'Popular', 'Recent', 'AI Picks'];

  // Filter posts by selected category AND active filter
  const getFilteredPosts = () => {
    let filtered = selectedCategory === 'all' ? posts : posts.filter(p => p.category === selectedCategory);
    switch (activeFilter) {
      case 'Friends': return filtered.filter(p => ['drsarah_mitchell'].includes(p.user.username));
      case 'Following': return filtered.filter(p => p.user.verified);
      case 'Popular': return [...filtered].sort((a, b) => (b.engagement.likes + b.engagement.comments) - (a.engagement.likes + a.engagement.comments));
      case 'Recent': return [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'AI Picks': return filtered.filter(p => p.analytics && p.analytics.aiScore >= 85);
      default: return filtered;
    }
  };

  // Get AI score color based on performance
  const getAIScoreColor = (score: number) => {
    if (score >= 90) return '#10B981'; // Excellent - Green
    if (score >= 80) return '#F59E0B'; // Good - Yellow
    if (score >= 70) return '#F97316'; // Average - Orange
    return '#EF4444'; // Poor - Red
  };

  // Get sentiment color
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '#10B981';
      case 'negative': return '#EF4444';
      default: return '#6B7280';
    }
  };

  // Get viral potential text
  const getViralPotentialText = (score: number) => {
    if (score >= 90) return 'Very High';
    if (score >= 80) return 'High';
    if (score >= 70) return 'Medium';
    if (score >= 60) return 'Low';
    return 'Very Low';
  };

  const formatEngagementNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleUserPress = (user: any) => {
    setSelectedUser({
      ...user,
      id: user.id || `user-${user.name?.replace(/\s+/g, '-')?.toLowerCase() || 'unknown'}`,
      username: user.username || user.name?.replace(/\s+/g, '_')?.toLowerCase() || 'user',
      displayName: user.displayName || user.name,
      email: user.email || `${user.username || 'user'}@example.com`,
      bio: user.bio || `${user.profession || 'User'} with ${formatEngagementNumber(user.followers || 0)} followers`,
      location: user.location || 'Unknown Location',
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    });
    setShowUserProfile(true);
  };

  const handleCommentPress = (post: Post) => {
    setSelectedPost(post);
    setShowCommentsModal(true);
  };

  const handleSharePress = async (post: Post) => {
    try {
      // Check if Web Share API is available
      if (Platform.OS === 'web' && (navigator as any).share) {
        await (navigator as any).share({
          title: `Post by ${post.user.name}`,
          text: post.content,
          url: window.location.href
        });
      } else if (Platform.OS === 'web' && (navigator as any).clipboard) {
        // Fallback to clipboard
        const shareText = `${post.content}

Shared from Social App`;
        await (navigator as any).clipboard.writeText(shareText);
        Alert.alert('Copied!', 'Post content copied to clipboard');
      } else {
        // Native sharing (iOS/Android)
        Alert.alert('Share Options', 'Choose platform to share:', [
          { text: 'Facebook', onPress: () => Alert.alert('Facebook', 'Opening Facebook share...') },
          { text: 'Twitter', onPress: () => Alert.alert('Twitter', 'Opening Twitter share...') },
          { text: 'Instagram', onPress: () => Alert.alert('Instagram', 'Opening Instagram share...') },
          { text: 'WhatsApp', onPress: () => Alert.alert('WhatsApp', 'Opening WhatsApp share...') },
          { text: 'LinkedIn', onPress: () => Alert.alert('LinkedIn', 'Opening LinkedIn share...') },
          { text: 'Telegram', onPress: () => Alert.alert('Telegram', 'Opening Telegram share...') },
          { text: 'Copy Link', onPress: () => Alert.alert('Copied', 'Post link copied to clipboard') },
          { text: 'Cancel', style: 'cancel' }
        ]);
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Share Error', 'Unable to share at this time');
    }
  };

  // Render functions

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{item.user.avatar}</Text>
          </View>
          
          <View style={styles.userDetails}>
            <View style={styles.userNameRow}>
              <TouchableOpacity onPress={() => handleUserPress(item.user)}>
                <Text style={[styles.userName, styles.clickableUserName]}>{item.user.name}</Text>
              </TouchableOpacity>
              {item.user.verified && (
                <MaterialIcons name="verified" size={16} color="#1DA1F2" />
              )}
            </View>
            <Text style={styles.postTimestamp}>{item.timestamp}</Text>
            {item.user.profession && (
              <Text style={styles.userProfession}>{item.user.profession} · {formatEngagementNumber(item.user.followers || 0)} followers</Text>
            )}
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.postMenuButton}
          onPress={() => Alert.alert('Post Options', 'Post menu opened')}
        >
          <MaterialIcons name="more-horiz" size={24} color="#65676B" />
        </TouchableOpacity>
      </View>

      {/* Post Content */}
      <View style={styles.postContent}>
        <Text style={styles.postText}>{item.content}</Text>
        
        {/* Translation Widget */}
        <View style={styles.translationContainer}>
          <TranslationWidget 
            text={item.content}
            category={item.category || 'general'}
            compact={true}
            darkMode={isDark}
            preferredLanguage={currentLanguage}
            autoTranslate={autoTranslate}
          />
        </View>

        {/* Photo placeholder for non-poll posts */}
        {item.contentType && item.contentType.type === 'photo' && (
          <View style={styles.photoPlaceholder}>
            <MaterialIcons name="photo" size={60} color="#65676B" />
            <Text style={styles.photoText}>Photo Content</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            const newLiked = new Set(likedPosts);
            if (newLiked.has(item.id)) newLiked.delete(item.id); else newLiked.add(item.id);
            setLikedPosts(newLiked);
          }}
        >
          <MaterialIcons name={likedPosts.has(item.id) ? 'thumb-up' : 'thumb-up-off-alt'} size={20} color={likedPosts.has(item.id) ? '#1877F2' : '#65676B'} />
          <Text style={[styles.actionText, likedPosts.has(item.id) && { color: '#1877F2' }]}>Like</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleCommentPress(item)}
        >
          <MaterialIcons name="chat-bubble-outline" size={20} color="#65676B" />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleSharePress(item)}
        >
          <MaterialIcons name="share" size={20} color="#65676B" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => Alert.alert('Save', 'Post saved!')}
        >
          <MaterialIcons name="bookmark-border" size={20} color="#65676B" />
          <Text style={styles.actionText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#FFF0F0', borderRadius: 8 }]}
          onPress={() => setDonationPostId(item.id)}
        >
          <MaterialIcons name="favorite" size={20} color="#EF4444" />
          <Text style={[styles.actionText, { color: '#EF4444' }]}>Tip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
      
      {/* Modern Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.headerBackground, borderBottomColor: theme.colors.border }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.logo, { color: theme.colors.primary }]}>Social</Text>
          <View style={styles.betaBadge}>
            <Text style={styles.betaText}>BETA</Text>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: '#8B5CF6' }]}
            onPress={() => setShowAIDebugDashboard(true)}
          >
            <MaterialIcons name="bug-report" size={20} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: '#10B981' }]}
            onPress={() => setShowSpiderAnalytics(true)}
          >
            <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>🕸️</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: '#F59E0B' }]}
            onPress={() => setShowConnectionsManager(true)}
          >
            <MaterialIcons name="people" size={20} color="white" />
          </TouchableOpacity>
          
          <LanguageSelectorButton onPress={() => setShowLanguageSelector(true)} />
          <ThemeToggleButton />
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: theme.colors.inputBackground }]}
            onPress={() => setShowSearchModal(true)}
          >
            <MaterialIcons name="search" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: theme.colors.inputBackground }]}
            onPress={() => setShowMessagesModal(true)}
          >
            <MaterialIcons name="chat-bubble-outline" size={24} color={theme.colors.text} />
            {messageCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>{messageCount > 99 ? '99+' : messageCount.toString()}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: theme.colors.inputBackground }]}
            onPress={() => setShowNotificationsModal(true)}
          >
            <MaterialIcons name="notifications-none" size={24} color={theme.colors.text} />
            {notificationCount > 0 && (
              <View style={[styles.notificationBadge, { backgroundColor: '#EF4444' }]}>
                <Text style={styles.notificationText}>{notificationCount > 99 ? '99+' : notificationCount.toString()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Stories Toolbar */}
      <StoriesToolbar stories={sampleStories} />

      {/* Content Filter Tabs */}
      <View style={[styles.filterTabs, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.filterSectionTitle, { color: theme.colors.text }]}>Filters</Text>
          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={() => setFiltersVisible(!filtersVisible)}
          >
            <MaterialIcons 
              name={filtersVisible ? 'expand-less' : 'expand-more'} 
              size={24} 
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
        
        {filtersVisible && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterTab,
                  { backgroundColor: theme.colors.inputBackground },
                  activeFilter === filter && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => setActiveFilter(filter)}
              >
                {activeFilter === filter && (
                  <MaterialIcons name="check" size={11} color="white" />
                )}
                <Text style={[
                  styles.filterTabText,
                  { color: theme.colors.textSecondary },
                  activeFilter === filter && { color: 'white' }
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Create Post Section */}
        <View style={[styles.createPostSection, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.createPostHeader}>
            <View style={[styles.createPostAvatar, { backgroundColor: theme.colors.inputBackground }]}>
              <Text style={styles.createPostAvatarText}>😊</Text>
            </View>
            <TouchableOpacity 
              style={[styles.createPostInput, { backgroundColor: theme.colors.inputBackground }]}
              onPress={() => setShowCreatePostModal(true)}
            >
              <Text style={[styles.createPostPlaceholder, { color: theme.colors.placeholder }]}>What's on your mind?</Text>
            </TouchableOpacity>
          </View>
          
    
        </View>

        {/* AI-Powered Livestreams Section */}
        <View style={[styles.liveSection, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.liveSectionHeader}>
            <View style={styles.liveSectionTitleRow}>
              <View style={styles.liveRedDot} />
              <Text style={[styles.liveSectionTitle, { color: theme.colors.text }]}>AI-Curated Livestreams</Text>
            </View>
            <TouchableOpacity onPress={() => Alert.alert('All Streams', 'Browse all live streams')}>
              <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {aiLivestreams.map((stream) => (
              <TouchableOpacity
                key={stream.id}
                style={[styles.liveCard, { backgroundColor: stream.color + '15', borderColor: stream.color + '40' }]}
                onPress={() => Alert.alert('Join Live', `Joining: ${stream.title}`)}
              >
                <View style={[styles.liveCardTop, { backgroundColor: stream.color }]}>
                  <Text style={styles.liveCardEmoji}>{stream.emoji}</Text>
                  <View style={styles.liveBadge}>
                    <View style={styles.livePulseDot} />
                    <Text style={styles.liveBadgeText}>LIVE</Text>
                  </View>
                </View>
                <View style={styles.liveCardBody}>
                  <Text style={[styles.liveCardTitle, { color: theme.colors.text }]} numberOfLines={2}>{stream.title}</Text>
                  <Text style={[styles.liveCardHost, { color: theme.colors.textSecondary }]}>{stream.host}</Text>
                  <View style={styles.liveCardFooter}>
                    <MaterialIcons name="visibility" size={12} color={stream.color} />
                    <Text style={[styles.liveViewers, { color: stream.color }]}>{(stream.viewers / 1000).toFixed(1)}K</Text>
                    <View style={[styles.liveCategoryChip, { backgroundColor: stream.color + '20' }]}>
                      <Text style={[styles.liveCategoryText, { color: stream.color }]}>{stream.category}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

      {/* Popular Content Categories */}
        <View style={[styles.categoriesSection, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Popular by Category</Text>
            <View style={styles.categoryHeaderRight}>
              <TouchableOpacity onPress={() => Alert.alert('Categories', 'View all categories')}>
                <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>See All</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.toggleButton}
                onPress={() => setCategoriesVisible(!categoriesVisible)}
              >
                <MaterialIcons 
                  name={categoriesVisible ? 'expand-less' : 'expand-more'} 
                  size={24} 
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>
          
          {categoriesVisible && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((category) => (
                <TouchableOpacity 
                  key={category.id} 
                  style={[
                    styles.categoryCard,
                    { backgroundColor: selectedCategory === category.id ? category.color : theme.colors.inputBackground },
                    selectedCategory === category.id && styles.activeCategoryCard
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <MaterialIcons 
                    name={category.icon as any} 
                    size={24} 
                    color={selectedCategory === category.id ? 'white' : category.color} 
                  />
                  <Text style={[
                    styles.categoryCardText,
                    { color: selectedCategory === category.id ? 'white' : theme.colors.text }
                  ]}>
                    {category.name}
                  </Text>
                  {selectedCategory === category.id && (
                    <View style={styles.activeCategoryIndicator}>
                      <MaterialIcons name="check-circle" size={16} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Posts Section */}
        <View style={styles.postsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {selectedCategory === 'all' ? 'All Popular Posts' : 
               `Popular in ${categories.find(cat => cat.id === selectedCategory)?.name || 'Category'}`}
            </Text>
            <Text style={[styles.postCount, { color: theme.colors.textSecondary }]}>({getFilteredPosts().length} posts)</Text>
          </View>
          
          <FlatList
            data={getFilteredPosts()}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.postSeparator} />}
          />
        </View>
      </ScrollView>

      {/* User Profile Modal */}
      {selectedUser && (
        <UserProfileModal
          visible={showUserProfile}
          onClose={() => {
            setShowUserProfile(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
      )}

      {/* Comments Modal */}
      {selectedPost && (
        <CommentsModal
          visible={showCommentsModal}
          onClose={() => {
            setShowCommentsModal(false);
            setSelectedPost(null);
          }}
          post={selectedPost}
          onUserPress={handleUserPress}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setShowCreatePostModal(true)}
      >
        <MaterialIcons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Modals */}
      <SearchModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />

      <MessagesModal
        visible={showMessagesModal}
        onClose={() => setShowMessagesModal(false)}
        messageCount={messageCount}
        onMessageCountChange={setMessageCount}
      />

      <NotificationsModal
        visible={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        notificationCount={notificationCount}
        onNotificationCountChange={setNotificationCount}
      />

      <CreatePostModal
        visible={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
      />

      {/* Language Selector Modal */}
      <LanguageSelector
        visible={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
      />

      {/* Spider Web Connections */}
      <ConnectionsManager
        visible={showConnectionsManager}
        onClose={() => setShowConnectionsManager(false)}
      />

      <SpiderWebAnalytics
        visible={showSpiderAnalytics}
        onClose={() => setShowSpiderAnalytics(false)}
      />

      {/* AI Debug Dashboard */}
      <AIDebugDashboard
        visible={showAIDebugDashboard}
        onClose={() => setShowAIDebugDashboard(false)}
      />

      {/* Floating AI Assistant Button */}
      <FloatingAIButton onPress={() => setShowAIAssistant(true)} />

      {/* AI Assistant Modal */}
      <FloatingAIAssistant
        visible={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
      />

      {/* Donation Panel for posts */}
      {donationPostId && (
        <DonationPanel
          visible={!!donationPostId}
          onClose={() => setDonationPostId(null)}
          targetId={donationPostId}
          targetType="post"
          targetName={posts.find(p => p.id === donationPostId)?.user.name || 'Creator'}
          onSuccess={(amount, emoji) => Alert.alert('Tip Sent!', `You sent ${amount} credits ${emoji} to the creator!`)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  betaBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  betaText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#1877F2',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  notificationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  
  // Filter Tabs
  filterTabs: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  toggleButton: {
    padding: 4,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  
  // Create Post Section
  createPostSection: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  createPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  createPostAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createPostAvatarText: {
    fontSize: 22,
  },
  createPostInput: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 24,
  },
  createPostPlaceholder: {
    color: '#6B7280',
    fontSize: 16,
  },
  // AI Livestreams
  liveSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  liveSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveRedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  liveSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  liveCard: {
    width: 150,
    borderRadius: 14,
    marginRight: 12,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  liveCardTop: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  liveCardEmoji: {
    fontSize: 32,
  },
  liveBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveBadgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '800',
  },
  liveCardBody: {
    padding: 10,
  },
  liveCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 3,
    lineHeight: 16,
  },
  liveCardHost: {
    fontSize: 10,
    marginBottom: 6,
  },
  liveCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveViewers: {
    fontSize: 10,
    fontWeight: '700',
    flex: 1,
  },
  liveCategoryChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  liveCategoryText: {
    fontSize: 8,
    fontWeight: '600',
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1877F2',
  },
  
  // Categories Section
  categoriesSection: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginRight: 12,
    minWidth: 100,
    position: 'relative',
  },
  activeCategoryCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryCardText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  activeCategoryIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  
  // Posts Section
  postsSection: {
    paddingHorizontal: 16,
  },
  postCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  postSeparator: {
    height: 16,
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  
  // Post Header
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 24,
  },
  userDetails: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  clickableUserName: {
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  postTimestamp: {
    fontSize: 13,
    color: '#6B7280',
  },
  userProfession: {
    fontSize: 11,
    color: '#8B92A6',
    marginTop: 2,
  },
  postMenuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Post Content
  postContent: {
    marginBottom: 16,
  },
  postText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1F2937',
    marginBottom: 12,
  },
  photoPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  photoText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  translationContainer: {
    alignItems: 'flex-start',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#E5E7EB',
  },
  
  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1877F2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1877F2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});