import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar,
  SafeAreaView, Modal, Switch, Animated, Dimensions, TextInput, Alert,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AnalyticsChart from '@/components/analytics/AnalyticsChart';
import { router } from 'expo-router';
import AdvancedSettings from '@/components/settings/AdvancedSettings';
import ModerationDashboard from '@/components/moderation/ModerationDashboard';
import BookManager from '@/components/books/BookManager';
import ResetDataButtons from '@/components/ui/ResetDataButtons';
import { useTheme } from '@/contexts/ThemeContext';
import { useEconomy, PROFILE_TYPES, ProfileTypeKey, DONATION_EMOJIS } from '@/contexts/EconomyContext';
import DonationPanel from '@/components/economy/DonationPanel';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const profileTabs = [
  { id: 'overview', title: 'Overview', icon: 'dashboard', gradient: ['#667eea', '#764ba2'] as [string, string] },
  { id: 'credits', title: 'Credits', icon: 'monetization-on', gradient: ['#f9e784', '#f59e0b'] as [string, string] },
  { id: 'books', title: 'Books', icon: 'menu-book', gradient: ['#f093fb', '#f5576c'] as [string, string] },
  { id: 'posts', title: 'Posts', icon: 'article', gradient: ['#4facfe', '#00f2fe'] as [string, string] },
  { id: 'analytics', title: 'Analytics', icon: 'analytics', gradient: ['#fa709a', '#fee140'] as [string, string] },
  { id: 'network', title: 'Network', icon: 'people', gradient: ['#30cfd0', '#330867'] as [string, string] },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark, setDarkMode } = useTheme();
  const {
    credits, totalEarned, totalSpent, transactions, profileType,
    changeProfileType, depositUSD, withdrawCredits, creditToUSD, profileTypeMonthlyFee,
    subscribeToChannel, isSubscribed, subscribedChannels,
  } = useEconomy();

  const [activeTab, setActiveTab] = useState('overview');
  const [showSettings, setShowSettings] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showModeration, setShowModeration] = useState(false);
  const [showBookManager, setShowBookManager] = useState(false);
  const [showProfileTypeModal, setShowProfileTypeModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [showDonationPanel, setShowDonationPanel] = useState(false);
  const [isAdmin] = useState(true);

  const scrollY = new Animated.Value(0);
  const headerScale = scrollY.interpolate({ inputRange: [-100, 0], outputRange: [1.4, 1], extrapolate: 'clamp' });
  const headerOpacity = scrollY.interpolate({ inputRange: [0, 120], outputRange: [1, 0.4], extrapolate: 'clamp' });

  const currentProfileData = PROFILE_TYPES[profileType];

  const showNotification = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2000);
  };

  const handleSettingsItemPress = (item: string) => {
    if (item === 'Advanced Settings') { setShowSettings(false); setShowAdvancedSettings(true); }
    else if (item === 'Moderation Center') { setShowSettings(false); setShowModeration(true); }
    else if (item === 'Book Management') { setShowSettings(false); setShowBookManager(true); }
    else { showNotification(`Opening ${item}...`); }
  };

  const handleProfileTypeChange = (newType: ProfileTypeKey) => {
    const info = PROFILE_TYPES[newType];
    if (info.monthlyFee > 0) {
      Alert.alert(
        `Upgrade to ${info.label}?`,
        `This costs ${info.monthlyFee} credits/month.\n\nPerks:\n${info.perks.join('\n• ')}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: `Pay ${info.monthlyFee} Credits`,
            onPress: () => {
              const ok = changeProfileType(newType);
              if (ok) { showNotification(`Profile upgraded to ${info.label}! ${info.emoji}`); setShowProfileTypeModal(false); }
            },
          },
        ]
      );
    } else {
      changeProfileType(newType);
      showNotification(`Profile set to ${info.label}!`);
      setShowProfileTypeModal(false);
    }
  };

  const handleDeposit = () => {
    const usd = parseFloat(depositAmount);
    if (!usd || usd <= 0) { Alert.alert('Invalid Amount', 'Please enter a valid USD amount.'); return; }
    depositUSD(usd);
    showNotification(`Deposited $${usd} → ${Math.floor(usd * 100)} credits!`);
    setDepositAmount('');
    setShowDepositModal(false);
  };

  const handleWithdraw = () => {
    if (profileType !== 'business') {
      Alert.alert('Access Restricted', 'Only Business profiles can withdraw cash. Upgrade your profile to enable this feature!');
      return;
    }

    Alert.alert('Withdraw to Stripe', `How much would you like to withdraw? (Current balance: ${credits} cr)`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Withdraw $10 (1000 cr)', onPress: () => withdrawCredits(1000) },
      { text: 'Withdraw $50 (5000 cr)', onPress: () => withdrawCredits(5000) },
    ]);
  };

  const handleChannelSubscribe = (channelId: string, fee: number) => {
    if (isSubscribed(channelId)) {
      Alert.alert('Already Subscribed', `You are already a premium member of ${channelId}.`);
      return;
    }

    Alert.alert(
      'Channel Subscription',
      `Subscribe to ${channelId} for ${fee} credits/month to get special benefits?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe Now',
          onPress: () => {
            const ok = subscribeToChannel(channelId, fee);
            if (ok) showNotification(`Subscribed to ${channelId}! 📺`);
          }
        }
      ]
    );
  };

  const [settings, setSettings] = useState({ privateAccount: false, pushNotifications: true });

  const renderCreditsTab = () => (
    <View style={styles.tabContent}>
      {/* Credits Balance Hero */}
      <LinearGradient colors={['#0F172A', '#1E3A8A']} style={styles.creditsHero}>
        <View style={styles.creditsBalanceRow}>
          <Text style={styles.creditsIcon}>💰</Text>
          <View>
            <Text style={styles.creditsBalance}>{credits.toLocaleString()}</Text>
            <Text style={styles.creditsLabel}>Credits · ≈ ${creditToUSD(credits).toFixed(2)} USD</Text>
          </View>
        </View>
        <View style={styles.creditsBtnRow}>
          <TouchableOpacity style={styles.creditsBtn} onPress={() => setShowDepositModal(true)}>
            <MaterialIcons name="add-card" size={18} color="#FFF" />
            <Text style={styles.creditsBtnText}>Add Credits</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.creditsBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]} onPress={handleWithdraw}>
            <MaterialIcons name="account-balance" size={18} color="#FFF" />
            <Text style={styles.creditsBtnText}>Withdraw</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.creditsBtn, { backgroundColor: 'rgba(249,231,132,0.2)' }]} onPress={() => setShowDonationPanel(true)}>
            <MaterialIcons name="favorite" size={18} color="#F9E784" />
            <Text style={[styles.creditsBtnText, { color: '#F9E784' }]}>Donate</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats Row */}
      <View style={styles.creditStatsRow}>
        {[
          { label: 'Total Earned', value: totalEarned.toLocaleString(), icon: '📈', color: '#10B981' },
          { label: 'Total Spent', value: totalSpent.toLocaleString(), icon: '📉', color: '#EF4444' },
          { label: 'Rate', value: '100cr=$1', icon: '💱', color: '#3B82F6' },
        ].map((s, i) => (
          <View key={i} style={[styles.creditStatCard, { backgroundColor: isDark ? '#1E293B' : '#FFF' }]}>
            <Text style={styles.creditStatIcon}>{s.icon}</Text>
            <Text style={[styles.creditStatValue, { color: s.color }]}>{s.value}</Text>
            <Text style={[styles.creditStatLabel, { color: isDark ? '#94A3B8' : '#6B7280' }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Earn */}
      <View style={[styles.earnSection, { backgroundColor: isDark ? '#1E293B' : '#FFF' }]}>
        <Text style={[styles.earnTitle, { color: theme.colors.text }]}>💡 Earn Credits</Text>
        {[
          { action: 'Post content', reward: '+10 credits', icon: '✍️' },
          { action: 'Get 100 likes', reward: '+50 credits', icon: '❤️' },
          { action: 'Invite a friend', reward: '+200 credits', icon: '👥' },
          { action: 'Daily check-in', reward: '+5 credits', icon: '📅' },
        ].map((item, i) => (
          <TouchableOpacity key={i} style={styles.earnRow} onPress={() => showNotification(`${item.reward} earned!`)}>
            <Text style={styles.earnRowIcon}>{item.icon}</Text>
            <Text style={[styles.earnRowAction, { color: theme.colors.text }]}>{item.action}</Text>
            <View style={styles.earnRewardChip}>
              <Text style={styles.earnRewardText}>{item.reward}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transaction History */}
      <Text style={[styles.sectionHeader, { color: theme.colors.text }]}>Recent Transactions</Text>
      {transactions.slice(0, 10).map((tx, i) => (
        <View key={tx.id + i} style={[styles.txRow, { backgroundColor: isDark ? '#1E293B' : '#FFF' }]}>
          <Text style={styles.txEmoji}>{tx.emoji || '💸'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.txDesc, { color: theme.colors.text }]}>{tx.description}</Text>
            <Text style={[styles.txTime, { color: theme.colors.textSecondary }]}>
              {new Date(tx.timestamp).toLocaleDateString()}
            </Text>
          </View>
          <Text style={[styles.txAmount, { color: tx.amount > 0 ? '#10B981' : '#EF4444' }]}>
            {tx.amount > 0 ? '+' : ''}{tx.amount}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.tabContent}>
            {/* Channel Subscriptions */}
            <View style={[styles.subscriptionSection, { backgroundColor: isDark ? '#1E293B' : '#FFF' }]}>
              <Text style={[styles.sectionHeader, { color: theme.colors.text, marginTop: 0 }]}>📺 Channel Subscriptions</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.channelScroll}>
                {[
                  { id: 'TechNova', fee: 100, color: '#3B82F6', icon: 'bolt' },
                  { id: 'ArtPulse', fee: 75, color: '#EC4899', icon: 'palette' },
                  { id: 'NewsWire', fee: 50, color: '#EF4444', icon: 'public' },
                ].map(channel => (
                  <TouchableOpacity
                    key={channel.id}
                    style={[styles.channelCard, { borderColor: channel.color + '40' }]}
                    onPress={() => handleChannelSubscribe(channel.id, channel.fee)}
                  >
                    <View style={[styles.channelIcon, { backgroundColor: channel.color }]}>
                      <MaterialIcons name={channel.icon as any} size={24} color="#FFF" />
                    </View>
                    <Text style={[styles.channelName, { color: theme.colors.text }]}>{channel.id}</Text>
                    <Text style={styles.channelFee}>{channel.fee} cr/mo</Text>
                    {isSubscribed(channel.id) ? (
                      <View style={styles.subscribedBadge}>
                        <Text style={styles.subscribedText}>Active</Text>
                      </View>
                    ) : (
                      <View style={[styles.subscribeMiniBtn, { backgroundColor: channel.color }]}>
                        <Text style={styles.subscribeMiniText}>Join</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Credits Quickview */}
            <TouchableOpacity
              style={[styles.creditsQuickCard, { backgroundColor: isDark ? '#1E293B' : '#0F172A' }]}
              onPress={() => setActiveTab('credits')}
            >
              <LinearGradient colors={['#1E3A8A', '#667eea']} style={styles.creditsQuickGradient}>
                <View style={styles.creditsQuickLeft}>
                  <Text style={styles.creditsQuickEmoji}>💰</Text>
                  <View>
                    <Text style={styles.creditsQuickValue}>{credits.toLocaleString()} Credits</Text>
                    <Text style={styles.creditsQuickUSD}>≈ ${creditToUSD(credits).toFixed(2)} USD</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.addCreditBtn} onPress={() => { setShowDepositModal(true); }}>
                  <MaterialIcons name="add" size={16} color="#FFF" />
                  <Text style={styles.addCreditBtnText}>Add</Text>
                </TouchableOpacity>
              </LinearGradient>
            </TouchableOpacity>

            {/* Profile type */}
            <TouchableOpacity style={[styles.profileTypeCard, { backgroundColor: isDark ? '#1E293B' : '#FFF', borderColor: currentProfileData.color + '50' }]} onPress={() => setShowProfileTypeModal(true)}>
              <Text style={styles.profileTypeEmoji}>{currentProfileData.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.profileTypeLabel, { color: theme.colors.text }]}>{currentProfileData.label} Profile</Text>
                <Text style={[styles.profileTypeFee, { color: currentProfileData.color }]}>
                  {currentProfileData.monthlyFee > 0 ? `${currentProfileData.monthlyFee} credits/month` : 'Free'}
                </Text>
              </View>
              <View style={[styles.changeProfileBtn, { backgroundColor: currentProfileData.color }]}>
                <Text style={styles.changeProfileBtnText}>Change</Text>
              </View>
            </TouchableOpacity>

            {/* Achievement Stats */}
            <View style={styles.achievementGrid}>
              {[
                { colors: ['#667eea', '#764ba2'] as [string, string], icon: 'trophy', num: 42, label: 'Level' },
                { colors: ['#f093fb', '#f5576c'] as [string, string], icon: 'medal', num: 87, label: 'Achievements' },
                { colors: ['#4facfe', '#00f2fe'] as [string, string], icon: 'star', num: 9250, label: 'Reputation' },
              ].map((a, i) => (
                <View key={i} style={[styles.achievementCard, { backgroundColor: isDark ? '#1E293B' : '#FFF' }]}>
                  <LinearGradient colors={a.colors} style={styles.achievementGradient}>
                    <Ionicons name={a.icon as any} size={28} color="#FFF" />
                    <Text style={styles.achievementNumber}>{a.num.toLocaleString()}</Text>
                    <Text style={styles.achievementLabel}>{a.label}</Text>
                  </LinearGradient>
                </View>
              ))}
            </View>

            <AnalyticsChart />

            <View style={styles.quickActions}>
              <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: isDark ? '#1E293B' : '#FFF' }]} onPress={() => setShowBookManager(true)}>
                <LinearGradient colors={['#8B5CF6', '#A78BFA']} style={styles.quickActionIcon}>
                  <MaterialIcons name="menu-book" size={22} color="#FFF" />
                </LinearGradient>
                <Text style={[styles.quickActionTitle, { color: theme.colors.text }]}>Book Publisher</Text>
              </TouchableOpacity>
              {isAdmin && (
                <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: isDark ? '#1E293B' : '#FFF' }]} onPress={() => setShowModeration(true)}>
                  <LinearGradient colors={['#DC2626', '#EF4444']} style={styles.quickActionIcon}>
                    <MaterialIcons name="gavel" size={22} color="#FFF" />
                  </LinearGradient>
                  <Text style={[styles.quickActionTitle, { color: theme.colors.text }]}>Moderation</Text>
                </TouchableOpacity>
              )}
            </View>

            <ResetDataButtons
              onResetPosts={() => showNotification('Posts refreshed!')}
              onResetNews={() => showNotification('News refreshed!')}
              onResetTags={() => showNotification('Tags refreshed!')}
            />
          </View>
        );
      case 'credits':
        return renderCreditsTab();
      case 'books':
        return (
          <View style={styles.tabContent}>
            <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: isDark ? '#1E293B' : '#FFF', marginBottom: 16, flexDirection: 'row', alignItems: 'center' }]} onPress={() => setShowBookManager(true)}>
              <LinearGradient colors={['#8B5CF6', '#A78BFA']} style={styles.quickActionIcon}>
                <MaterialIcons name="menu-book" size={22} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.quickActionTitle, { color: theme.colors.text, marginLeft: 12 }]}>Open Book Manager</Text>
            </TouchableOpacity>
            {[{ title: 'The AI Revolution', category: 'Technology', status: 'Published', sales: 1240, price: 150 }, { title: 'Sustainable Future', category: 'Science', status: 'Draft', sales: 0, price: 80 }, { title: 'Mind & Matter', category: 'Psychology', status: 'Published', sales: 876, price: 120 }].map((book, i) => (
              <View key={i} style={[styles.bookItem, { backgroundColor: isDark ? '#1E293B' : '#FFF' }]}>
                <View style={styles.bookItemIcon}><Text style={{ fontSize: 24 }}>📖</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={[{ fontSize: 15, fontWeight: '700', color: theme.colors.text }]}>{book.title}</Text>
                  <Text style={[{ fontSize: 12, color: theme.colors.textSecondary }]}>{book.category} · {book.status}</Text>
                  <Text style={[{ fontSize: 12, color: '#10B981', fontWeight: '600' }]}>💰 {book.price} credits · {book.sales} sales</Text>
                </View>
                <TouchableOpacity style={[styles.buyCreditBtn, { backgroundColor: '#3B82F6' }]} onPress={() => showNotification(`Purchasing ${book.title} for ${book.price} credits...`)}>
                  <Text style={styles.buyCreditBtnText}>Buy</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        );
      case 'posts':
        return (
          <View style={styles.tabContent}>
            {[{ content: '🧬 BREAKTHROUGH: Our gene therapy trial restored vision! #MedicalBreakthrough', likes: 15420, comments: 892, time: '2h ago' }, { content: '🚀 Just launched my AI coding assistant! 85% faster development time!', likes: 8967, comments: 1205, time: '4h ago' }, { content: '✨ Research paper accepted at Nature journal! Years of work paying off 🙏', likes: 6340, comments: 445, time: '1d ago' }].map((post, i) => (
              <View key={i} style={[styles.postItem, { backgroundColor: isDark ? '#1E293B' : '#FFF', borderColor: isDark ? '#334155' : '#E5E7EB' }]}>
                <Text style={[{ fontSize: 14, color: theme.colors.text, lineHeight: 20, marginBottom: 10 }]}>{post.content}</Text>
                <View style={styles.postStats}>
                  <View style={styles.postStat}><MaterialIcons name="thumb-up" size={14} color="#3B82F6" /><Text style={[styles.postStatText, { color: theme.colors.textSecondary }]}>{post.likes.toLocaleString()}</Text></View>
                  <View style={styles.postStat}><MaterialIcons name="chat-bubble-outline" size={14} color="#8B5CF6" /><Text style={[styles.postStatText, { color: theme.colors.textSecondary }]}>{post.comments.toLocaleString()}</Text></View>
                  <Text style={[{ fontSize: 11, color: theme.colors.textSecondary, marginLeft: 'auto' }]}>{post.time}</Text>
                </View>
              </View>
            ))}
          </View>
        );
      case 'analytics':
        return (
          <View style={styles.tabContent}>
            <AnalyticsChart />
            {[{ label: 'Total Impressions', value: '1.2M', icon: 'visibility', color: '#3B82F6' }, { label: 'Engagement Rate', value: '8.7%', icon: 'trending-up', color: '#10B981' }, { label: 'Profile Views', value: '45.2K', icon: 'person', color: '#8B5CF6' }, { label: 'Weekly Reach', value: '152K', icon: 'public', color: '#F59E0B' }].map((stat, i) => (
              <View key={i} style={[styles.analyticsItem, { backgroundColor: isDark ? '#1E293B' : '#FFF' }]}>
                <View style={[styles.analyticsIcon, { backgroundColor: stat.color + '20' }]}><MaterialIcons name={stat.icon as any} size={22} color={stat.color} /></View>
                <Text style={[{ fontSize: 14, color: theme.colors.text, flex: 1, fontWeight: '600' }]}>{stat.label}</Text>
                <Text style={[{ fontSize: 18, fontWeight: '800', color: stat.color }]}>{stat.value}</Text>
              </View>
            ))}
          </View>
        );
      case 'network':
        return (
          <View style={styles.tabContent}>
            {[{ name: 'Dr. James Wilson', role: 'Quantum Lab', avatar: '👨‍🔬', mutual: 12 }, { name: 'Prof. Sarah Kim', role: 'MIT', avatar: '👩‍🏫', mutual: 8 }, { name: 'Alex Chen', role: 'Stanford', avatar: '👨‍💻', mutual: 24 }, { name: 'Maria Rodriguez', role: 'CERN', avatar: '👩‍🔭', mutual: 5 }].map((person, i) => (
              <View key={i} style={[styles.networkItem, { backgroundColor: isDark ? '#1E293B' : '#FFF', borderColor: isDark ? '#334155' : '#E5E7EB' }]}>
                <View style={styles.networkAvatar}><Text style={{ fontSize: 22 }}>{person.avatar}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={[{ fontSize: 14, fontWeight: '700', color: theme.colors.text }]}>{person.name}</Text>
                  <Text style={[{ fontSize: 12, color: theme.colors.textSecondary }]}>{person.role}</Text>
                  <Text style={[{ fontSize: 11, color: '#667eea', fontWeight: '600' }]}>{person.mutual} mutual connections</Text>
                </View>
                <TouchableOpacity style={styles.connectBtn}><MaterialIcons name="person-add" size={16} color="#667eea" /></TouchableOpacity>
              </View>
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.floatingHeader, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity style={styles.headerIconButton} onPress={() => setShowSettings(true)}>
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.headerIconGradient}>
            <MaterialIcons name="settings" size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={[styles.floatingHeaderTitle, { color: theme.colors.text }]}>Profile</Text>
          {/* Credits visible in header */}
          <TouchableOpacity style={styles.headerCredits} onPress={() => setActiveTab('credits')}>
            <Text style={styles.headerCreditsText}>💰 {credits.toLocaleString()}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.headerIconButton} onPress={() => showNotification('Share profile')}>
          <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.headerIconGradient}>
            <MaterialIcons name="share" size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        {/* Profile Header */}
        <Animated.View style={[styles.profileHeader, { transform: [{ scale: headerScale }], opacity: headerOpacity }]}>
          <LinearGradient
            colors={isDark ? ['#1E293B', '#0F172A'] : ['#667eea', '#764ba2']}
            style={styles.coverGradient}
          >
            <View style={styles.statusIndicators}>
              <View style={styles.statusBadge}>
                <View style={styles.onlineDot} />
                <Text style={styles.statusText}>Online</Text>
              </View>
              {/* Profile type badge */}
              <View style={[styles.statusBadge, { backgroundColor: currentProfileData.color + '30' }]}>
                <Text style={styles.statusText}>{currentProfileData.emoji} {currentProfileData.label}</Text>
              </View>
            </View>

            <View style={styles.avatarContainer}>
              <LinearGradient colors={['#f093fb', '#f5576c']} style={styles.avatarGlow}>
                <View style={styles.avatarInner}>
                  <Text style={styles.avatarEmoji}>👩‍🔬</Text>
                </View>
              </LinearGradient>
              <View style={styles.levelBadge}>
                <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.levelBadgeGradient}>
                  <Text style={styles.levelBadgeText}>42</Text>
                </LinearGradient>
              </View>
            </View>

            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>Dr. Alexandra Thompson</Text>
                <MaterialIcons name="verified" size={22} color="#10B981" />
              </View>
              <Text style={styles.profileUsername}>@alex_thompson</Text>
              <Text style={styles.profileBio}>Senior Research Scientist | Sustainable Technology Innovator 🌱</Text>

              {/* Credits displayed on profile */}
              <View style={styles.creditsDisplayRow}>
                <View style={styles.creditsDisplayBadge}>
                  <Text style={styles.creditsDisplayText}>💰 {credits.toLocaleString()} Credits</Text>
                </View>
                <View style={[styles.creditsDisplayBadge, { backgroundColor: 'rgba(249,231,132,0.2)' }]}>
                  <Text style={styles.creditsDisplayText}>≈ ${creditToUSD(credits).toFixed(2)} USD</Text>
                </View>
              </View>

              <View style={styles.followStats}>
                <TouchableOpacity style={styles.followStat}>
                  <Text style={styles.followNumber}>1,847</Text>
                  <Text style={styles.followLabel}>Following</Text>
                </TouchableOpacity>
                <View style={styles.statDivider} />
                <TouchableOpacity style={styles.followStat}>
                  <Text style={styles.followNumber}>12.5K</Text>
                  <Text style={styles.followLabel}>Followers</Text>
                </TouchableOpacity>
                <View style={styles.statDivider} />
                <TouchableOpacity style={styles.followStat}>
                  <Text style={styles.followNumber}>234</Text>
                  <Text style={styles.followLabel}>Posts</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.editButton} onPress={() => setShowSettings(true)}>
                  <LinearGradient colors={['#667eea', '#764ba2']} style={styles.editButtonGradient}>
                    <MaterialIcons name="edit" size={18} color="#FFF" />
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.shareIconButton} onPress={() => setShowDepositModal(true)}>
                  <LinearGradient colors={['#10B981', '#059669']} style={styles.shareIconGradient}>
                    <MaterialIcons name="add-card" size={18} color="#FFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Tab Navigation */}
        <View style={[styles.tabNavigation, { backgroundColor: theme.colors.surface }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
            {profileTabs.map(tab => (
              <TouchableOpacity key={tab.id} style={styles.tabButton} onPress={() => setActiveTab(tab.id)}>
                {activeTab === tab.id ? (
                  <LinearGradient colors={tab.gradient} style={styles.tabButtonGradient}>
                    <MaterialIcons name={tab.icon as any} size={18} color="#FFF" />
                    <Text style={styles.tabButtonTextActive}>{tab.title}</Text>
                  </LinearGradient>
                ) : (
                  <>
                    <MaterialIcons name={tab.icon as any} size={18} color={theme.colors.textSecondary} />
                    <Text style={[styles.tabButtonText, { color: theme.colors.textSecondary }]}>{tab.title}</Text>
                  </>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {renderTabContent()}
      </Animated.ScrollView>

      {/* Profile Type Modal */}
      <Modal visible={showProfileTypeModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.ptModal, { backgroundColor: theme.colors.background }]}>
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.ptModalHeader}>
            <TouchableOpacity onPress={() => setShowProfileTypeModal(false)}>
              <MaterialIcons name="close" size={22} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.ptModalTitle}>Choose Profile Type</Text>
            <View style={{ width: 22 }} />
          </LinearGradient>
          <ScrollView style={{ flex: 1, padding: 16 }}>
            <Text style={[styles.ptModalSubtitle, { color: theme.colors.textSecondary }]}>
              Your current balance: 💰 {credits.toLocaleString()} credits
            </Text>
            {(Object.entries(PROFILE_TYPES) as [ProfileTypeKey, typeof PROFILE_TYPES[ProfileTypeKey]][]).map(([key, info]) => (
              <TouchableOpacity
                key={key}
                style={[styles.ptCard, { backgroundColor: isDark ? '#1E293B' : '#FFF', borderColor: profileType === key ? info.color : (isDark ? '#334155' : '#E5E7EB') }]}
                onPress={() => handleProfileTypeChange(key)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={styles.ptEmoji}>{info.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={[styles.ptName, { color: theme.colors.text }]}>{info.label}</Text>
                      {profileType === key && (
                        <View style={[styles.ptCurrentBadge, { backgroundColor: info.color }]}>
                          <Text style={styles.ptCurrentText}>Current</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.ptFee, { color: info.color }]}>
                      {info.monthlyFee > 0 ? `${info.monthlyFee} credits/month` : 'Free'}
                    </Text>
                  </View>
                </View>
                <View style={styles.ptPerks}>
                  {info.perks.map((perk, i) => (
                    <View key={i} style={styles.ptPerkRow}>
                      <MaterialIcons name="check-circle" size={14} color={info.color} />
                      <Text style={[styles.ptPerkText, { color: theme.colors.textSecondary }]}>{perk}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Deposit Modal */}
      <Modal visible={showDepositModal} animationType="slide" presentationStyle="pageSheet" transparent>
        <View style={styles.depositOverlay}>
          <View style={[styles.depositCard, { backgroundColor: isDark ? '#1E293B' : '#FFF' }]}>
            <Text style={[styles.depositTitle, { color: theme.colors.text }]}>💳 Add Credits</Text>
            <Text style={[styles.depositSubtitle, { color: theme.colors.textSecondary }]}>$1 USD = 100 Credits</Text>
            <TextInput
              style={[styles.depositInput, { backgroundColor: isDark ? '#0F172A' : '#F3F4F6', color: theme.colors.text }]}
              placeholder="Enter USD amount..."
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
              value={depositAmount}
              onChangeText={setDepositAmount}
            />
            {depositAmount ? (
              <Text style={[styles.depositPreview, { color: '#667eea' }]}>
                You'll get {Math.floor(parseFloat(depositAmount || '0') * 100)} credits
              </Text>
            ) : null}
            <View style={styles.depositBtnRow}>
              <TouchableOpacity style={styles.depositCancelBtn} onPress={() => setShowDepositModal(false)}>
                <Text style={styles.depositCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.depositConfirmBtn} onPress={handleDeposit}>
                <LinearGradient colors={['#667eea', '#764ba2']} style={styles.depositConfirmGradient}>
                  <Text style={styles.depositConfirmText}>Add Credits</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal visible={showSettings} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.settingsModal, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.settingsHeader, { backgroundColor: theme.colors.surface }]}>
            <TouchableOpacity onPress={() => setShowSettings(false)}><MaterialIcons name="close" size={24} color={theme.colors.text} /></TouchableOpacity>
            <Text style={[styles.settingsTitle, { color: theme.colors.text }]}>Settings</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView style={styles.settingsContent}>
            <View style={styles.settingsSection}>
              <Text style={[styles.settingsSectionTitle, { color: theme.colors.textSecondary }]}>ACCOUNT</Text>
              {[{ label: 'Edit Profile', subtitle: 'Update your information', colors: ['#667eea', '#764ba2'] as [string, string], icon: 'person', action: 'Profile Settings' }, { label: 'Profile Type', subtitle: currentProfileData.emoji + ' ' + currentProfileData.label, colors: [currentProfileData.color, currentProfileData.color] as [string, string], icon: 'badge', action: 'ProfileType' }, { label: 'Book Management', subtitle: 'Manage your publications', colors: ['#8B5CF6', '#A78BFA'] as [string, string], icon: 'menu-book', action: 'Book Management' }].map((item, i) => (
                <TouchableOpacity key={i} style={[styles.settingsItem, { backgroundColor: theme.colors.inputBackground }]} onPress={() => { if (item.action === 'ProfileType') { setShowSettings(false); setShowProfileTypeModal(true); } else { handleSettingsItemPress(item.action); } }}>
                  <LinearGradient colors={item.colors} style={styles.settingsIcon}><MaterialIcons name={item.icon as any} size={20} color="#FFF" /></LinearGradient>
                  <View style={styles.settingsItemContent}><Text style={[styles.settingsItemTitle, { color: theme.colors.text }]}>{item.label}</Text><Text style={[styles.settingsItemSubtitle, { color: theme.colors.textSecondary }]}>{item.subtitle}</Text></View>
                  <MaterialIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.settingsSection}>
              <Text style={[styles.settingsSectionTitle, { color: theme.colors.textSecondary }]}>ECONOMY</Text>
              <TouchableOpacity style={[styles.settingsItem, { backgroundColor: theme.colors.inputBackground }]} onPress={() => { setShowSettings(false); setShowDepositModal(true); }}>
                <LinearGradient colors={['#10B981', '#059669']} style={styles.settingsIcon}><MaterialIcons name="add-card" size={20} color="#FFF" /></LinearGradient>
                <View style={styles.settingsItemContent}><Text style={[styles.settingsItemTitle, { color: theme.colors.text }]}>Add Credits</Text><Text style={[styles.settingsItemSubtitle, { color: theme.colors.textSecondary }]}>💰 Balance: {credits.toLocaleString()}</Text></View>
                <MaterialIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.settingsItem, { backgroundColor: theme.colors.inputBackground }]} onPress={() => { setShowSettings(false); handleWithdraw(); }}>
                <LinearGradient colors={['#F59E0B', '#EAB308']} style={styles.settingsIcon}><MaterialIcons name="account-balance" size={20} color="#FFF" /></LinearGradient>
                <View style={styles.settingsItemContent}><Text style={[styles.settingsItemTitle, { color: theme.colors.text }]}>Withdraw Credits</Text><Text style={[styles.settingsItemSubtitle, { color: theme.colors.textSecondary }]}>100 credits = $1.00 USD</Text></View>
                <MaterialIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.settingsSection}>
              <Text style={[styles.settingsSectionTitle, { color: theme.colors.textSecondary }]}>PREFERENCES</Text>
              <View style={[styles.settingsItem, { backgroundColor: theme.colors.inputBackground }]}>
                <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.settingsIcon}><MaterialIcons name="dark-mode" size={20} color="#FFF" /></LinearGradient>
                <View style={styles.settingsItemContent}><Text style={[styles.settingsItemTitle, { color: theme.colors.text }]}>Dark Mode</Text></View>
                <Switch value={isDark} onValueChange={setDarkMode} trackColor={{ false: '#D1D5DB', true: '#667eea' }} thumbColor="#FFF" />
              </View>
            </View>
            <View style={styles.settingsSection}>
              <Text style={[styles.settingsSectionTitle, { color: theme.colors.textSecondary }]}>ADVANCED</Text>
              {[{ label: 'Advanced Settings', colors: ['#f093fb', '#f5576c'] as [string, string], icon: 'tune', action: 'Advanced Settings' }, ...(isAdmin ? [{ label: 'Moderation Center', colors: ['#DC2626', '#EF4444'] as [string, string], icon: 'gavel', action: 'Moderation Center' }] : []), { label: 'Security Center', colors: ['#F59E0B', '#EAB308'] as [string, string], icon: 'security', action: 'security' }].map((item, i) => (
                <TouchableOpacity key={i} style={[styles.settingsItem, { backgroundColor: theme.colors.inputBackground }]} onPress={() => { if (item.action === 'security') { setShowSettings(false); router.push('/security'); } else { handleSettingsItemPress(item.action); } }}>
                  <LinearGradient colors={item.colors} style={styles.settingsIcon}><MaterialIcons name={item.icon as any} size={20} color="#FFF" /></LinearGradient>
                  <View style={styles.settingsItemContent}><Text style={[styles.settingsItemTitle, { color: theme.colors.text }]}>{item.label}</Text></View>
                  <MaterialIcons name="chevron-right" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.settingsSection}>
              <TouchableOpacity style={[styles.settingsItem, { backgroundColor: 'rgba(239,68,68,0.1)' }]} onPress={() => showNotification('Signing out...')}>
                <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.settingsIcon}><MaterialIcons name="logout" size={20} color="#FFF" /></LinearGradient>
                <Text style={[styles.settingsItemTitle, { color: '#EF4444' }]}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Donation Panel */}
      <DonationPanel
        visible={showDonationPanel}
        onClose={() => setShowDonationPanel(false)}
        targetId="profile_alex"
        targetType="post"
        targetName="Dr. Alexandra Thompson"
        onSuccess={(amount, emoji) => showNotification(`Donated ${amount} credits ${emoji}!`)}
      />

      {/* Advanced Settings */}
      <AdvancedSettings visible={showAdvancedSettings} onClose={() => setShowAdvancedSettings(false)} />
      <ModerationDashboard visible={showModeration} onClose={() => setShowModeration(false)} userRole="admin" />
      <BookManager visible={showBookManager} onClose={() => setShowBookManager(false)} />

      {showAlert && (
        <View style={styles.alertContainer}>
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.alert}>
            <Ionicons name="checkmark-circle" size={20} color="#FFF" />
            <Text style={styles.alertText}>{alertMessage}</Text>
          </LinearGradient>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  floatingHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  headerIconButton: { width: 40, height: 40 },
  headerIconGradient: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  floatingHeaderTitle: { fontSize: 18, fontWeight: '700' },
  headerCredits: { backgroundColor: '#0F172A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  headerCreditsText: { color: '#F9E784', fontSize: 12, fontWeight: '700' },
  content: { flex: 1 },
  profileHeader: { overflow: 'hidden' },
  coverGradient: { paddingTop: 36, paddingBottom: 28, alignItems: 'center' },
  statusIndicators: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', gap: 6 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, gap: 4 },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#10B981' },
  statusText: { color: '#FFF', fontSize: 10, fontWeight: '600' },
  avatarContainer: { marginBottom: 14, position: 'relative' },
  avatarGlow: { width: 110, height: 110, borderRadius: 55, padding: 3 },
  avatarInner: { width: 104, height: 104, borderRadius: 52, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 44 },
  levelBadge: { position: 'absolute', bottom: 0, right: 0 },
  levelBadgeGradient: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
  levelBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  profileInfo: { alignItems: 'center', paddingHorizontal: 20, width: '100%' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  profileName: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  profileUsername: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
  profileBio: { fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 20, marginBottom: 12 },
  creditsDisplayRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  creditsDisplayBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  creditsDisplayText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  followStats: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 18, padding: 14, marginBottom: 16, gap: 16 },
  followStat: { alignItems: 'center' },
  followNumber: { fontSize: 18, fontWeight: '800', color: '#FFF', marginBottom: 2 },
  followLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.3)' },
  actionButtons: { flexDirection: 'row', gap: 10, width: '100%' },
  editButton: { flex: 1 },
  editButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 14, gap: 6 },
  editButtonText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  shareIconButton: { width: 46 },
  shareIconGradient: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  tabNavigation: { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)', marginTop: 6 },
  tabScrollContent: { paddingHorizontal: 14, gap: 6 },
  tabButton: { paddingVertical: 10, paddingHorizontal: 2 },
  tabButtonGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18, gap: 6 },
  tabButtonText: { fontSize: 12, fontWeight: '600' },
  tabButtonTextActive: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  tabContent: { padding: 16 },
  
  // Credits tab
  creditsHero: { borderRadius: 18, padding: 20, marginBottom: 14 },
  creditsBalanceRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  creditsIcon: { fontSize: 36 },
  creditsBalance: { fontSize: 32, fontWeight: '900', color: '#FFF' },
  creditsLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  creditsBtnRow: { flexDirection: 'row', gap: 8 },
  creditsBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 10, borderRadius: 12, gap: 6 },
  creditsBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  creditStatsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  creditStatCard: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  creditStatIcon: { fontSize: 20, marginBottom: 4 },
  creditStatValue: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  creditStatLabel: { fontSize: 9, textAlign: 'center' },
  earnSection: { borderRadius: 14, padding: 14, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  earnTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  earnRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)', gap: 10 },
  earnRowIcon: { fontSize: 20 },
  earnRowAction: { flex: 1, fontSize: 14, fontWeight: '500' },
  earnRewardChip: { backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  earnRewardText: { fontSize: 11, fontWeight: '700', color: '#10B981' },
  sectionHeader: { fontSize: 16, fontWeight: '700', marginBottom: 10, marginTop: 4 },
  txRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, marginBottom: 6, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 },
  txEmoji: { fontSize: 22 },
  txDesc: { fontSize: 13, fontWeight: '600' },
  txTime: { fontSize: 10 },
  txAmount: { fontSize: 15, fontWeight: '800' },

  // Channel styles
  subscriptionSection: { borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  channelScroll: { gap: 12 },
  channelCard: { width: 120, padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)' },
  channelIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  channelName: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  channelFee: { fontSize: 11, color: '#6B7280', marginBottom: 8 },
  subscribeMiniBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  subscribeMiniText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  subscribedBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: 'rgba(16,185,129,0.1)' },
  subscribedText: { color: '#10B981', fontSize: 10, fontWeight: '800' },

  // Overview cards
  creditsQuickCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  creditsQuickGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  creditsQuickLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  creditsQuickEmoji: { fontSize: 28 },
  creditsQuickValue: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  creditsQuickUSD: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  addCreditBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, gap: 4 },
  addCreditBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  profileTypeCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 2, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  profileTypeEmoji: { fontSize: 28 },
  profileTypeLabel: { fontSize: 16, fontWeight: '700' },
  profileTypeFee: { fontSize: 12, fontWeight: '600' },
  changeProfileBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12 },
  changeProfileBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  achievementGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  achievementCard: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  achievementGradient: { padding: 14, alignItems: 'center' },
  achievementNumber: { fontSize: 20, fontWeight: '800', color: '#FFF', marginVertical: 6 },
  achievementLabel: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },
  quickActions: { flexDirection: 'row', gap: 10, marginTop: 16, marginBottom: 16 },
  quickActionCard: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 },
  quickActionIcon: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  quickActionTitle: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  bookItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 12, marginBottom: 10, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  bookItemIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F3E8FF', alignItems: 'center', justifyContent: 'center' },
  buyCreditBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  buyCreditBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  postItem: { borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1 },
  postStats: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  postStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  postStatText: { fontSize: 12, fontWeight: '600' },
  analyticsItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, marginBottom: 10, gap: 12 },
  analyticsIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  networkItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1, gap: 12 },
  networkAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#667eea20', alignItems: 'center', justifyContent: 'center' },
  connectBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#667eea20', alignItems: 'center', justifyContent: 'center' },

  // Profile type modal
  ptModal: { flex: 1 },
  ptModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, paddingTop: 56 },
  ptModalTitle: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  ptModalSubtitle: { fontSize: 13, marginBottom: 16, textAlign: 'center' },
  ptCard: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 },
  ptEmoji: { fontSize: 32, marginRight: 12 },
  ptName: { fontSize: 18, fontWeight: '700' },
  ptFee: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  ptCurrentBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  ptCurrentText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  ptPerks: { gap: 4 },
  ptPerkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ptPerkText: { fontSize: 12 },

  // Deposit modal
  depositOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'flex-end' },
  depositCard: { width: '100%', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  depositTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 6 },
  depositSubtitle: { fontSize: 13, textAlign: 'center', marginBottom: 16 },
  depositInput: { borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 18, fontWeight: '600', marginBottom: 10 },
  depositPreview: { fontSize: 14, textAlign: 'center', marginBottom: 16, fontWeight: '600' },
  depositBtnRow: { flexDirection: 'row', gap: 12 },
  depositCancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#F3F4F6', alignItems: 'center' },
  depositCancelText: { fontSize: 15, fontWeight: '700', color: '#6B7280' },
  depositConfirmBtn: { flex: 2, borderRadius: 14, overflow: 'hidden' },
  depositConfirmGradient: { paddingVertical: 14, alignItems: 'center' },
  depositConfirmText: { color: '#FFF', fontSize: 15, fontWeight: '800' },

  // Settings
  settingsModal: { flex: 1 },
  settingsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  settingsTitle: { fontSize: 18, fontWeight: '700' },
  settingsContent: { flex: 1 },
  settingsSection: { paddingHorizontal: 16, paddingVertical: 10 },
  settingsSectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  settingsItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, marginBottom: 8, gap: 12 },
  settingsIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  settingsItemContent: { flex: 1 },
  settingsItemTitle: { fontSize: 15, fontWeight: '600', marginBottom: 1 },
  settingsItemSubtitle: { fontSize: 12 },
  alertContainer: { position: 'absolute', top: 100, left: 20, right: 20, zIndex: 1000 },
  alert: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 16, gap: 12 },
  alertText: { color: '#FFF', fontSize: 14, fontWeight: '600', flex: 1 },
});
