import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView,
  Dimensions, StatusBar, TextInput, KeyboardAvoidingView, Platform,
  FlatList, Animated as RNAnimated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSequence,
  withSpring, withDelay, runOnJS, Easing, interpolate, FadeIn, FadeOut,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useEconomy, DONATION_EMOJIS } from '@/contexts/EconomyContext';

interface LiveStreamData {
  id: string;
  title: string;
  viewerCount: number;
  host?: string;
  category?: string;
  emoji?: string;
  color?: string;
}

interface LiveStreamViewerProps {
  visible: boolean;
  onClose: () => void;
  streamData?: LiveStreamData;
}

interface FloatingEmoji {
  id: string;
  emoji: string;
  color: string;
  x: number;
  donorName: string;
  amount: number;
}

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  time: string;
  verified: boolean;
  isDonation?: boolean;
  donationEmoji?: string;
  donationAmount?: number;
}

interface StreamDonor {
  id: string;
  name: string;
  avatar: string;
  totalAmount: number;
  lastEmoji: string;
  donationCount: number;
}

const { width, height } = Dimensions.get('window');

const QUICK_DONATE_AMOUNTS = [5, 10, 20, 50, 100];

const MOCK_DONORS: StreamDonor[] = [
  { id: 'd1', name: 'CryptoWhale', avatar: '🐋', totalAmount: 2500, lastEmoji: '👑', donationCount: 12 },
  { id: 'd2', name: 'TechFan99', avatar: '👨‍💻', totalAmount: 1200, lastEmoji: '🔥', donationCount: 8 },
  { id: 'd3', name: 'Dr.Sarah', avatar: '👩‍🔬', totalAmount: 800, lastEmoji: '⭐', donationCount: 5 },
  { id: 'd4', name: 'AlexHub', avatar: '🚀', totalAmount: 600, lastEmoji: '💎', donationCount: 4 },
  { id: 'd5', name: 'StreamLover', avatar: '❤️', totalAmount: 350, lastEmoji: '❤️', donationCount: 7 },
];

const MOCK_CHAT: ChatMessage[] = [
  { id: 'c1', user: 'Prof. Michael', message: 'Great insights on AI applications!', time: '2s', verified: true },
  { id: 'c2', user: 'TechFan99', message: 'Love this stream! 🔥', time: '5s', verified: false, isDonation: true, donationEmoji: '🔥', donationAmount: 10 },
  { id: 'c3', user: 'Industry Expert', message: 'When will this be available commercially?', time: '8s', verified: false },
  { id: 'c4', user: 'CryptoWhale', message: 'Keep up the amazing work!', time: '12s', verified: true, isDonation: true, donationEmoji: '👑', donationAmount: 500 },
  { id: 'c5', user: 'StreamLover', message: 'First time watching, already hooked!', time: '15s', verified: false },
];

const supportedLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸', confidence: 0.95 },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', confidence: 0.92 },
  { code: 'fr', name: 'French', flag: '🇫🇷', confidence: 0.89 },
  { code: 'de', name: 'German', flag: '🇩🇪', confidence: 0.91 },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', confidence: 0.87 },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', confidence: 0.86 },
];

// Floating emoji animation component
function FloatingEmojiBubble({ item, onDone }: { item: FloatingEmoji; onDone: (id: string) => void }) {
  const y = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 8, stiffness: 180 });
    y.value = withDelay(200, withTiming(-280, { duration: 2800, easing: Easing.out(Easing.quad) }));
    opacity.value = withDelay(1800, withTiming(0, { duration: 1000 }, () => {
      runOnJS(onDone)(item.id);
    }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: y.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.floatingBubble, style, { left: item.x }]}>
      <View style={[styles.floatingBubbleInner, { borderColor: item.color }]}>
        <Text style={styles.floatingEmoji}>{item.emoji}</Text>
        <View style={styles.floatingInfo}>
          <Text style={styles.floatingName} numberOfLines={1}>{item.donorName}</Text>
          <Text style={[styles.floatingAmount, { color: item.color }]}>{item.amount} cr</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// Donor rank badge
function RankBadge({ rank }: { rank: number }) {
  const colors: [string, string][] = [['#FFD700', '#FFA500'], ['#C0C0C0', '#A8A8A8'], ['#CD7F32', '#8B4513']];
  const icons = ['👑', '🥈', '🥉'];
  if (rank > 3) return <Text style={styles.rankNumber}>#{rank}</Text>;
  return (
    <LinearGradient colors={colors[rank - 1]} style={styles.rankBadge}>
      <Text style={styles.rankBadgeText}>{icons[rank - 1]}</Text>
    </LinearGradient>
  );
}

export default function LiveStreamViewer({ visible, onClose, streamData }: LiveStreamViewerProps) {
  const insets = useSafeAreaInsets();
  const { credits, donate: donateFn } = useEconomy();

  // Stream state
  const [viewerCount, setViewerCount] = useState(streamData?.viewerCount || 12400);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState(supportedLanguages[0]);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [liveSubtitle, setLiveSubtitle] = useState('Welcome to today\'s live stream!');

  // UI panels
  const [activePanel, setActivePanel] = useState<'chat' | 'leaderboard' | 'donate'>('chat');
  const [showDonateQuick, setShowDonateQuick] = useState(false);
  const [selectedEmojiKey, setSelectedEmojiKey] = useState('heart');
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(10);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(MOCK_CHAT);
  const [chatInput, setChatInput] = useState('');
  const chatScrollRef = useRef<ScrollView>(null);

  // Donors leaderboard
  const [donors, setDonors] = useState<StreamDonor[]>(MOCK_DONORS);

  // Floating emojis
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);

  // Total donated to this stream
  const totalDonated = donors.reduce((s, d) => s + d.totalAmount, 0);

  // Stream subtitle loop
  const subtitles = [
    "Welcome everyone to today's live stream on advanced AI applications!",
    "Let's dive into the technical implementation details of this breakthrough.",
    "The results show significant improvements in accuracy by over 47%.",
    "We're seeing unprecedented growth in our AI models this quarter.",
    "Thank you for the excellent questions coming in from the audience!",
  ];
  const subtitleIndexRef = useRef(0);
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      subtitleIndexRef.current = (subtitleIndexRef.current + 1) % subtitles.length;
      setLiveSubtitle(subtitles[subtitleIndexRef.current]);
    }, 5000);
    return () => clearInterval(interval);
  }, [visible]);

  // Viewer count fluctuation
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      const delta = Math.floor(Math.random() * 200) - 100;
      setViewerCount(prev => Math.max(100, prev + delta));
    }, 6000);
    return () => clearInterval(interval);
  }, [visible]);

  // Simulate incoming donations
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      const mockNames = ['StarGazer', 'NightOwl', 'TechBro', 'GlobeTrotter', 'NeonDreamer'];
      const randomDonor = mockNames[Math.floor(Math.random() * mockNames.length)];
      const randomAmount = [5, 10, 20, 50][Math.floor(Math.random() * 4)];
      const emojiKeys = Object.keys(DONATION_EMOJIS);
      const randomEmojiKey = emojiKeys[Math.floor(Math.random() * emojiKeys.length)];
      const emojiData = DONATION_EMOJIS[randomEmojiKey];

      // Spawn floating emoji
      spawnFloatingEmoji(randomDonor, randomAmount, emojiData.emoji, '#667eea');

      // Add to chat
      const newMsg: ChatMessage = {
        id: `auto_${Date.now()}`,
        user: randomDonor,
        message: `Donated ${randomAmount} credits!`,
        time: 'now',
        verified: false,
        isDonation: true,
        donationEmoji: emojiData.emoji,
        donationAmount: randomAmount,
      };
      setChatMessages(prev => [...prev.slice(-20), newMsg]);
    }, 8000);
    return () => clearInterval(interval);
  }, [visible]);

  const spawnFloatingEmoji = useCallback((donorName: string, amount: number, emoji: string, color: string) => {
    const xPos = Math.random() * (width - 120) + 20;
    const newEmoji: FloatingEmoji = {
      id: `fe_${Date.now()}_${Math.random()}`,
      emoji,
      color,
      x: xPos,
      donorName,
      amount,
    };
    setFloatingEmojis(prev => [...prev, newEmoji]);
  }, []);

  const removeFloatingEmoji = useCallback((id: string) => {
    setFloatingEmojis(prev => prev.filter(e => e.id !== id));
  }, []);

  const handleDonate = () => {
    const finalAmount = customAmount ? parseInt(customAmount) || 0 : selectedAmount;
    const emojiData = DONATION_EMOJIS[selectedEmojiKey];

    if (finalAmount < emojiData.minAmount) {
      return;
    }
    if (credits < finalAmount) {
      return;
    }

    const success = donateFn(streamData?.id || 'stream_1', 'stream', finalAmount, selectedEmojiKey);
    if (success) {
      // Spawn multiple floating emojis for impact
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          spawnFloatingEmoji('You', finalAmount, emojiData.emoji, '#667eea');
        }, i * 200);
      }

      // Add donation chat message
      const newMsg: ChatMessage = {
        id: `don_${Date.now()}`,
        user: 'You',
        message: `Just donated ${finalAmount} credits ${emojiData.emoji}!`,
        time: 'now',
        verified: false,
        isDonation: true,
        donationEmoji: emojiData.emoji,
        donationAmount: finalAmount,
      };
      setChatMessages(prev => [...prev.slice(-20), newMsg]);

      // Update leaderboard — add "You" or increment
      setDonors(prev => {
        const existing = prev.find(d => d.name === 'You');
        if (existing) {
          return [...prev.map(d => d.name === 'You'
            ? { ...d, totalAmount: d.totalAmount + finalAmount, lastEmoji: emojiData.emoji, donationCount: d.donationCount + 1 }
            : d
          )].sort((a, b) => b.totalAmount - a.totalAmount);
        }
        return [{
          id: `you_${Date.now()}`,
          name: 'You',
          avatar: '😊',
          totalAmount: finalAmount,
          lastEmoji: emojiData.emoji,
          donationCount: 1,
        }, ...prev].sort((a, b) => b.totalAmount - a.totalAmount);
      });

      setShowDonateQuick(false);
      setCustomAmount('');
      setActivePanel('leaderboard');
      setTimeout(() => setActivePanel('chat'), 3000);
    }
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      user: 'You',
      message: chatInput.trim(),
      time: 'now',
      verified: false,
    };
    setChatMessages(prev => [...prev.slice(-20), newMsg]);
    setChatInput('');
    setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderChatMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[
      styles.chatMsg,
      item.isDonation && styles.chatMsgDonation,
      item.user === 'You' && styles.chatMsgOwn,
    ]}>
      {item.isDonation && (
        <LinearGradient colors={['#667eea22', '#764ba222']} style={styles.donationMsgBanner}>
          <Text style={styles.donationMsgEmoji}>{item.donationEmoji}</Text>
          <Text style={styles.donationMsgAmount}>{item.donationAmount} credits</Text>
        </LinearGradient>
      )}
      <View style={styles.chatMsgRow}>
        <Text style={styles.chatMsgUser}>{item.user}</Text>
        {item.verified && <MaterialIcons name="verified" size={11} color="#3B82F6" />}
        <Text style={styles.chatMsgText}>{item.message}</Text>
      </View>
    </View>
  );

  const renderLeaderboard = () => (
    <View style={styles.leaderboardContainer}>
      {/* Total raised banner */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.totalRaisedBanner}>
        <MaterialIcons name="favorite" size={16} color="#FFF" />
        <Text style={styles.totalRaisedText}>{totalDonated.toLocaleString()} credits raised</Text>
        <Text style={styles.totalRaisedUSD}>≈ ${(totalDonated / 100).toFixed(0)} USD</Text>
      </LinearGradient>

      {donors.map((donor, index) => (
        <View key={donor.id} style={[styles.leaderboardRow, index === 0 && styles.leaderboardRowFirst]}>
          <RankBadge rank={index + 1} />
          <View style={styles.leaderboardAvatar}>
            <Text style={styles.leaderboardAvatarText}>{donor.avatar}</Text>
          </View>
          <View style={styles.leaderboardInfo}>
            <Text style={styles.leaderboardName}>{donor.name}</Text>
            <Text style={styles.leaderboardDonations}>{donor.donationCount} donation{donor.donationCount !== 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.leaderboardRight}>
            <Text style={styles.leaderboardEmoji}>{donor.lastEmoji}</Text>
            <Text style={styles.leaderboardAmount}>{donor.totalAmount.toLocaleString()}</Text>
            <Text style={styles.leaderboardCredits}>credits</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderDonatePanel = () => {
    const emojiData = DONATION_EMOJIS[selectedEmojiKey];
    const finalAmount = customAmount ? parseInt(customAmount) || 0 : selectedAmount;
    const canAfford = credits >= finalAmount;

    return (
      <View style={styles.donatePanel}>
        <Text style={styles.donatePanelTitle}>Choose Donation Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiTypeRow}>
          {Object.entries(DONATION_EMOJIS).map(([key, val]) => (
            <TouchableOpacity
              key={key}
              style={[styles.emojiTypeBtn, selectedEmojiKey === key && styles.emojiTypeBtnSelected]}
              onPress={() => { setSelectedEmojiKey(key); if (selectedAmount < val.minAmount) setSelectedAmount(val.minAmount); }}
            >
              <Text style={styles.emojiTypeBtnEmoji}>{val.emoji}</Text>
              <Text style={styles.emojiTypeBtnLabel}>{val.label}</Text>
              <Text style={styles.emojiTypeBtnMin}>{val.minAmount}cr+</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.donatePanelTitle}>Amount</Text>
        <View style={styles.quickAmountsRow}>
          {QUICK_DONATE_AMOUNTS.map(amt => (
            <TouchableOpacity
              key={amt}
              style={[styles.quickAmtBtn, selectedAmount === amt && !customAmount && styles.quickAmtBtnActive]}
              onPress={() => { setSelectedAmount(amt); setCustomAmount(''); }}
            >
              <Text style={[styles.quickAmtText, selectedAmount === amt && !customAmount && styles.quickAmtTextActive]}>{amt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.customAmtInput}
          placeholder="Custom amount..."
          placeholderTextColor="#6B7280"
          keyboardType="numeric"
          value={customAmount}
          onChangeText={setCustomAmount}
        />

        <View style={styles.donateSummaryRow}>
          <Text style={styles.donateSummaryLabel}>{emojiData.emoji} Sending {finalAmount} credits</Text>
          <Text style={styles.donateSummaryBalance}>Balance: {credits.toLocaleString()} cr</Text>
        </View>

        <TouchableOpacity
          style={[styles.donateConfirmBtn, !canAfford && styles.donateConfirmBtnDisabled]}
          onPress={handleDonate}
          disabled={!canAfford}
        >
          <LinearGradient
            colors={canAfford ? ['#667eea', '#764ba2'] : ['#6B7280', '#4B5563']}
            style={styles.donateConfirmGradient}
          >
            <Text style={styles.donateConfirmText}>{emojiData.emoji} Donate {finalAmount} Credits</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  if (!streamData) return null;

  const streamColor = streamData.color || '#667eea';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <StatusBar hidden />
      <View style={styles.container}>

        {/* ── Video Area ── */}
        <View style={styles.videoArea}>
          {/* Simulated stream background */}
          <LinearGradient
            colors={[streamColor + 'CC', '#0F172A']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          {/* Presentation card */}
          <View style={styles.presentationCard}>
            <Text style={styles.presentationEmoji}>{streamData.emoji || '🎬'}</Text>
            <Text style={styles.presentationTitle}>{streamData.title}</Text>
            <Text style={styles.presentationHost}>{streamData.host || 'Live Host'}</Text>
            <View style={styles.presentationMetrics}>
              {[['47%', 'Growth'], ['15.2K', 'Users'], ['$2.4M', 'Revenue']].map(([v, l]) => (
                <View key={l} style={styles.presentationMetric}>
                  <Text style={styles.presentationMetricValue}>{v}</Text>
                  <Text style={styles.presentationMetricLabel}>{l}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Floating emojis */}
          {floatingEmojis.map(item => (
            <FloatingEmojiBubble key={item.id} item={item} onDone={removeFloatingEmoji} />
          ))}

          {/* Header */}
          <View style={[styles.videoHeader, { paddingTop: insets.top + 4 }]}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <MaterialIcons name="keyboard-arrow-down" size={28} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.videoHeaderCenter}>
              <View style={styles.livePill}>
                <View style={styles.livePillDot} />
                <Text style={styles.livePillText}>LIVE</Text>
              </View>
              <Text style={styles.viewerCountText}>
                <MaterialIcons name="visibility" size={12} color="#E2E8F0" /> {viewerCount.toLocaleString()}
              </Text>
            </View>
            <TouchableOpacity style={styles.leaderboardHeaderBtn} onPress={() => setActivePanel(activePanel === 'leaderboard' ? 'chat' : 'leaderboard')}>
              <MaterialIcons name="leaderboard" size={20} color="#FFF" />
              <Text style={styles.leaderboardHeaderBtnText}>{donors.length}</Text>
            </TouchableOpacity>
          </View>

          {/* Subtitles */}
          {captionsEnabled && (
            <View style={styles.subtitleOverlay}>
              <View style={styles.subtitlePill}>
                <Text style={styles.subtitleFlag}>{currentLanguage.flag}</Text>
                <Text style={styles.subtitleText} numberOfLines={2}>{liveSubtitle}</Text>
              </View>
            </View>
          )}

          {/* Video controls */}
          <View style={styles.videoControls}>
            <TouchableOpacity
              style={[styles.vcBtn, captionsEnabled && styles.vcBtnActive]}
              onPress={() => setCaptionsEnabled(!captionsEnabled)}
            >
              <MaterialIcons name={captionsEnabled ? 'closed-caption' : 'closed-caption-off'} size={18} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.vcBtn} onPress={() => setShowLanguageSelector(true)}>
              <Text style={styles.vcBtnFlag}>{currentLanguage.flag}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.vcBtn}>
              <MaterialIcons name="volume-up" size={18} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.vcBtn}>
              <MaterialIcons name="fullscreen" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Total donations overlay */}
          <TouchableOpacity
            style={styles.totalDonationOverlay}
            onPress={() => setActivePanel('leaderboard')}
          >
            <MaterialIcons name="favorite" size={14} color="#EF4444" />
            <Text style={styles.totalDonationText}>{totalDonated.toLocaleString()} cr</Text>
          </TouchableOpacity>
        </View>

        {/* ── Bottom Panel ── */}
        <View style={[styles.bottomPanel, { paddingBottom: insets.bottom + 8 }]}>

          {/* Panel tabs */}
          <View style={styles.panelTabs}>
            {(['chat', 'leaderboard', 'donate'] as const).map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.panelTab, activePanel === tab && styles.panelTabActive]}
                onPress={() => setActivePanel(tab)}
              >
                <MaterialIcons
                  name={tab === 'chat' ? 'chat-bubble-outline' : tab === 'leaderboard' ? 'leaderboard' : 'favorite'}
                  size={16}
                  color={activePanel === tab ? '#667eea' : '#9CA3AF'}
                />
                <Text style={[styles.panelTabText, activePanel === tab && styles.panelTabTextActive]}>
                  {tab === 'chat' ? 'Chat' : tab === 'leaderboard' ? 'Top Donors' : 'Donate'}
                </Text>
                {tab === 'leaderboard' && (
                  <View style={styles.donorCountBadge}>
                    <Text style={styles.donorCountBadgeText}>{donors.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Panel content */}
          {activePanel === 'chat' && (
            <KeyboardAvoidingView
              style={styles.chatPanel}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <ScrollView
                ref={chatScrollRef}
                style={styles.chatScroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.chatScrollContent}
                onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}
              >
                {chatMessages.map(msg => renderChatMessage({ item: msg }))}
              </ScrollView>

              {/* Quick donate button in chat */}
              <TouchableOpacity
                style={styles.quickDonateFloating}
                onPress={() => setActivePanel('donate')}
              >
                <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.quickDonateGradient}>
                  <MaterialIcons name="favorite" size={16} color="#FFF" />
                  <Text style={styles.quickDonateText}>Tip</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.chatInputRow}>
                <TextInput
                  style={styles.chatInput}
                  placeholder="Say something..."
                  placeholderTextColor="#6B7280"
                  value={chatInput}
                  onChangeText={setChatInput}
                  onSubmitEditing={handleSendChat}
                  returnKeyType="send"
                />
                <TouchableOpacity style={styles.chatSendBtn} onPress={handleSendChat}>
                  <MaterialIcons name="send" size={18} color="#FFF" />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          )}

          {activePanel === 'leaderboard' && (
            <ScrollView style={styles.leaderboardScroll} showsVerticalScrollIndicator={false}>
              {renderLeaderboard()}
            </ScrollView>
          )}

          {activePanel === 'donate' && (
            <ScrollView style={styles.donatePanelScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {renderDonatePanel()}
            </ScrollView>
          )}
        </View>

        {/* Language selector */}
        <Modal visible={showLanguageSelector} transparent animationType="fade">
          <TouchableOpacity style={styles.langOverlay} activeOpacity={1} onPress={() => setShowLanguageSelector(false)}>
            <View style={styles.langModal}>
              <Text style={styles.langModalTitle}>Choose Language</Text>
              {supportedLanguages.map(lang => (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.langOption, currentLanguage.code === lang.code && styles.langOptionActive]}
                  onPress={() => { setCurrentLanguage(lang); setShowLanguageSelector(false); }}
                >
                  <Text style={styles.langFlag}>{lang.flag}</Text>
                  <Text style={styles.langName}>{lang.name}</Text>
                  <Text style={styles.langConfidence}>{(lang.confidence * 100).toFixed(0)}%</Text>
                  {currentLanguage.code === lang.code && <MaterialIcons name="check-circle" size={18} color="#667eea" />}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </Modal>
  );
}

const VIDEO_HEIGHT = height * 0.52;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },

  // Video
  videoArea: { height: VIDEO_HEIGHT, position: 'relative', overflow: 'hidden' },
  videoHeader: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  videoHeaderCenter: { flex: 1, alignItems: 'center', gap: 4 },
  livePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, gap: 4 },
  livePillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFF' },
  livePillText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  viewerCountText: { color: '#E2E8F0', fontSize: 12, fontWeight: '600' },
  leaderboardHeaderBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(102,126,234,0.5)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 4 },
  leaderboardHeaderBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },

  presentationCard: {
    position: 'absolute', top: '50%', left: '50%',
    transform: [{ translateX: -130 }, { translateY: -80 }],
    width: 260, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 20, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  presentationEmoji: { fontSize: 36, marginBottom: 8 },
  presentationTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937', textAlign: 'center', marginBottom: 4 },
  presentationHost: { fontSize: 12, color: '#6B7280', marginBottom: 12 },
  presentationMetrics: { flexDirection: 'row', gap: 16 },
  presentationMetric: { alignItems: 'center' },
  presentationMetricValue: { fontSize: 16, fontWeight: '800', color: '#059669' },
  presentationMetricLabel: { fontSize: 10, color: '#6B7280' },

  // Floating emojis
  floatingBubble: {
    position: 'absolute', bottom: 100, zIndex: 50,
  },
  floatingBubbleInner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(15,23,42,0.85)', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1.5,
  },
  floatingEmoji: { fontSize: 20 },
  floatingInfo: {},
  floatingName: { color: '#F1F5F9', fontSize: 10, fontWeight: '700', maxWidth: 70 },
  floatingAmount: { fontSize: 9, fontWeight: '700' },

  subtitleOverlay: {
    position: 'absolute', bottom: 80, left: 12, right: 12, zIndex: 10,
  },
  subtitlePill: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: 'rgba(0,0,0,0.82)', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10,
    borderLeftWidth: 3, borderLeftColor: '#667eea',
  },
  subtitleFlag: { fontSize: 14 },
  subtitleText: { color: '#FFF', fontSize: 13, lineHeight: 18, flex: 1 },

  videoControls: {
    position: 'absolute', bottom: 16, right: 12, zIndex: 10, gap: 6,
  },
  vcBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center', justifyContent: 'center',
  },
  vcBtnActive: { backgroundColor: '#667eea' },
  vcBtnFlag: { fontSize: 16 },

  totalDonationOverlay: {
    position: 'absolute', bottom: 16, left: 12, zIndex: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.65)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12,
  },
  totalDonationText: { color: '#FFF', fontSize: 12, fontWeight: '700' },

  // Bottom panel
  bottomPanel: { flex: 1, backgroundColor: '#111827' },

  panelTabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#1F2937' },
  panelTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, gap: 5, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  panelTabActive: { borderBottomColor: '#667eea' },
  panelTabText: { fontSize: 12, fontWeight: '600', color: '#9CA3AF' },
  panelTabTextActive: { color: '#667eea' },
  donorCountBadge: { backgroundColor: '#667eea', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1 },
  donorCountBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '700' },

  // Chat
  chatPanel: { flex: 1 },
  chatScroll: { flex: 1 },
  chatScrollContent: { padding: 10, gap: 4 },
  chatMsg: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 },
  chatMsgDonation: { backgroundColor: 'rgba(102,126,234,0.12)', borderWidth: 1, borderColor: 'rgba(102,126,234,0.3)', marginVertical: 2 },
  chatMsgOwn: { backgroundColor: 'rgba(59,130,246,0.1)' },
  donationMsgBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 4 },
  donationMsgEmoji: { fontSize: 16 },
  donationMsgAmount: { fontSize: 11, fontWeight: '700', color: '#A78BFA' },
  chatMsgRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  chatMsgUser: { color: '#667eea', fontSize: 12, fontWeight: '700' },
  chatMsgText: { color: '#D1D5DB', fontSize: 13, flex: 1 },
  quickDonateFloating: { position: 'absolute', right: 60, bottom: 52, borderRadius: 16, overflow: 'hidden' },
  quickDonateGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, gap: 4 },
  quickDonateText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  chatInputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, gap: 8, borderTopWidth: 1, borderTopColor: '#1F2937' },
  chatInput: { flex: 1, backgroundColor: '#1F2937', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, color: '#FFF', fontSize: 14 },
  chatSendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#667eea', alignItems: 'center', justifyContent: 'center' },

  // Leaderboard
  leaderboardScroll: { flex: 1 },
  leaderboardContainer: { padding: 12 },
  totalRaisedBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: 12, marginBottom: 12 },
  totalRaisedText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  totalRaisedUSD: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  leaderboardRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 12, padding: 10, marginBottom: 8, gap: 10 },
  leaderboardRowFirst: { borderWidth: 1.5, borderColor: '#FFD700' + '80' },
  rankBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  rankBadgeText: { fontSize: 14 },
  rankNumber: { fontSize: 13, fontWeight: '700', color: '#9CA3AF', width: 32, textAlign: 'center' },
  leaderboardAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#334155', alignItems: 'center', justifyContent: 'center' },
  leaderboardAvatarText: { fontSize: 18 },
  leaderboardInfo: { flex: 1 },
  leaderboardName: { color: '#F1F5F9', fontSize: 14, fontWeight: '700' },
  leaderboardDonations: { color: '#64748B', fontSize: 11 },
  leaderboardRight: { alignItems: 'flex-end' },
  leaderboardEmoji: { fontSize: 16 },
  leaderboardAmount: { color: '#A78BFA', fontSize: 15, fontWeight: '800' },
  leaderboardCredits: { color: '#64748B', fontSize: 9 },

  // Donate panel
  donatePanelScroll: { flex: 1 },
  donatePanel: { padding: 14 },
  donatePanelTitle: { color: '#94A3B8', fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 10, textTransform: 'uppercase' },
  emojiTypeRow: { gap: 8, paddingRight: 8, marginBottom: 14 },
  emojiTypeBtn: { alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 12, padding: 10, width: 72, borderWidth: 1.5, borderColor: '#334155' },
  emojiTypeBtnSelected: { borderColor: '#667eea', backgroundColor: '#1E3A5F' },
  emojiTypeBtnEmoji: { fontSize: 22, marginBottom: 4 },
  emojiTypeBtnLabel: { color: '#F1F5F9', fontSize: 10, fontWeight: '700' },
  emojiTypeBtnMin: { color: '#64748B', fontSize: 8 },
  quickAmountsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  quickAmtBtn: { flex: 1, paddingVertical: 8, backgroundColor: '#1E293B', borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  quickAmtBtnActive: { backgroundColor: '#667eea', borderColor: '#667eea' },
  quickAmtText: { color: '#9CA3AF', fontSize: 13, fontWeight: '600' },
  quickAmtTextActive: { color: '#FFF', fontWeight: '700' },
  customAmtInput: { backgroundColor: '#1E293B', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, color: '#FFF', fontSize: 14, borderWidth: 1, borderColor: '#334155', marginBottom: 10 },
  donateSummaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  donateSummaryLabel: { color: '#F1F5F9', fontSize: 14, fontWeight: '600' },
  donateSummaryBalance: { color: '#64748B', fontSize: 12 },
  donateConfirmBtn: { borderRadius: 14, overflow: 'hidden' },
  donateConfirmBtnDisabled: { opacity: 0.5 },
  donateConfirmGradient: { paddingVertical: 14, alignItems: 'center' },
  donateConfirmText: { color: '#FFF', fontSize: 15, fontWeight: '800' },

  // Language selector
  langOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  langModal: { backgroundColor: '#1E293B', borderRadius: 16, padding: 16, width: '100%', maxWidth: 340 },
  langModalTitle: { color: '#F1F5F9', fontSize: 16, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  langOption: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 10 },
  langOptionActive: { backgroundColor: '#334155' },
  langFlag: { fontSize: 20 },
  langName: { flex: 1, color: '#F1F5F9', fontSize: 14, fontWeight: '500' },
  langConfidence: { color: '#64748B', fontSize: 12, marginRight: 4 },
});
