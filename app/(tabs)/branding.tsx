import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, FlatList, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import ModernAnimatedUI from '@/components/ui/ModernAnimatedUI';
import { useEconomy } from '@/contexts/EconomyContext';
import TranslationWidget from '@/components/ui/TranslationWidget';

const { width } = Dimensions.get('window');

interface ResearchProject {
  id: string;
  title: string;
  status: string;
  description: string;
  team: string;
  progress: number;
  fundingNeeded: string;
  currentFunding: string;
  category: string;
  icon: string;
  color: string;
  donationGoal: number;
  currentDonations: number;
}

interface PreOrderProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  estimatedDelivery: string;
  category: string;
  preOrders: number;
  maxPreOrders: number;
  image: string;
  features: string[];
  status: 'Coming Soon' | 'Pre-Order' | 'Limited' | 'Sold Out';
}

const researchProjects: ResearchProject[] = [
  { id: 'smart-home-1', title: 'Smart Home Automation', status: 'Funding Needed', description: 'AI-powered home automation with voice control', team: 'IoT Research Lab', progress: 45, fundingNeeded: '$500K', currentFunding: '$225K', category: 'Smart Technology', icon: '🏠', color: '#8B5CF6', donationGoal: 500000, currentDonations: 225000 },
  { id: 'health-tech-1', title: 'Wearable Health Monitor', status: 'In Progress', description: 'Advanced biosensor for continuous health monitoring', team: 'HealthTech Division', progress: 72, fundingNeeded: '$750K', currentFunding: '$540K', category: 'Healthcare', icon: '⌚', color: '#10B981', donationGoal: 750000, currentDonations: 540000 },
  { id: 'clean-energy-1', title: 'Portable Solar Generator', status: 'Prototype Ready', description: 'Compact high-efficiency solar power generation', team: 'Clean Energy Lab', progress: 85, fundingNeeded: '$300K', currentFunding: '$255K', category: 'Clean Energy', icon: '☀️', color: '#F59E0B', donationGoal: 300000, currentDonations: 255000 },
  { id: 'ai-assistant-1', title: 'Personal AI Robot', status: 'Research Phase', description: 'Humanoid robot with advanced AI for elderly care', team: 'Robotics Group', progress: 35, fundingNeeded: '$1.2M', currentFunding: '$420K', category: 'Robotics & AI', icon: '🤖', color: '#EF4444', donationGoal: 1200000, currentDonations: 420000 },
  { id: 'drone-delivery-1', title: 'Delivery Drones', status: 'Testing Phase', description: 'AI-powered drone network for eco-friendly delivery', team: 'Aerospace Lab', progress: 68, fundingNeeded: '$800K', currentFunding: '$544K', category: 'Transportation', icon: '🚁', color: '#3B82F6', donationGoal: 800000, currentDonations: 544000 },
  { id: 'vr-education-1', title: 'VR Education Platform', status: 'Early Stage', description: 'Immersive VR system for interactive learning', team: 'EdTech Division', progress: 25, fundingNeeded: '$600K', currentFunding: '$150K', category: 'EdTech', icon: '🥽', color: '#EC4899', donationGoal: 600000, currentDonations: 150000 },
];

const preOrderProducts: PreOrderProduct[] = [
  { id: 'smart-glasses-1', name: 'AR Smart Glasses Pro', description: 'Lightweight AR glasses with 8-hour battery and real-time translation', price: '$899', estimatedDelivery: 'Q2 2025', category: 'Wearable', preOrders: 2847, maxPreOrders: 5000, image: '🥽', features: ['8-hour battery', 'Voice control', 'Real-time translation', 'HD display'], status: 'Pre-Order' },
  { id: 'fitness-tracker-1', name: 'HealthBand Ultra', description: 'Advanced fitness tracker with ECG and blood oxygen', price: '$299', estimatedDelivery: 'Q1 2025', category: 'Health', preOrders: 4210, maxPreOrders: 10000, image: '⌚', features: ['ECG monitoring', 'Blood oxygen', 'Sleep analysis', 'Waterproof'], status: 'Pre-Order' },
  { id: 'drone-camera-1', name: 'SkyShot Pro Drone', description: '4K camera drone with AI object tracking', price: '$1,299', estimatedDelivery: 'Q3 2025', category: 'Photography', preOrders: 890, maxPreOrders: 2000, image: '🚁', features: ['4K camera', 'AI tracking', '45min flight', 'Obstacle avoidance'], status: 'Limited' },
  { id: 'smart-home-hub-1', name: 'HomeAI Central Hub', description: 'Central control system for all smart home devices', price: '$499', estimatedDelivery: 'Q1 2025', category: 'Smart Home', preOrders: 3456, maxPreOrders: 8000, image: '🏠', features: ['AI optimization', 'Voice control', 'Energy saving', 'Security'], status: 'Pre-Order' },
  { id: 'wireless-charger-1', name: 'PowerPad Wireless', description: 'Fast wireless charging pad for all devices', price: '$149', estimatedDelivery: 'Q4 2024', category: 'Accessories', preOrders: 5000, maxPreOrders: 5000, image: '🔋', features: ['Multi-device', 'Fast charging', 'Heat protection', 'LED indicators'], status: 'Sold Out' },
  { id: 'gaming-headset-1', name: 'GameAudio Pro VR', description: 'Professional gaming headset with spatial audio', price: '$399', estimatedDelivery: 'Q2 2025', category: 'Gaming', preOrders: 1567, maxPreOrders: 3000, image: '🎧', features: ['Spatial audio', 'Haptic feedback', 'Noise cancellation', 'Wireless'], status: 'Pre-Order' },
];

const startupMetrics = [
  { metric: 'Total Funding Raised', value: '$15.8M', growth: '+125%', icon: '💰' },
  { metric: 'Research Projects', value: '12', growth: '+200%', icon: '🔬' },
  { metric: 'Patents Filed', value: '8', growth: '+300%', icon: '📋' },
  { metric: 'Team Members', value: '47', growth: '+88%', icon: '👥' },
  { metric: 'Publications', value: '23', growth: '+150%', icon: '📚' },
  { metric: 'Partnerships', value: '15', growth: '+67%', icon: '🤝' },
];

const bookData = [
  { id: 'b1', title: 'The Future of AI', author: 'Dr. Sarah Chen', price: 150, rating: 4.8, cover: '🤖', type: 'ebook' },
  { id: 'b2', title: 'Sustainable Living', author: 'Mark Green', price: 120, rating: 4.6, cover: '🌱', type: 'ebook' },
  { id: 'b3', title: 'Mindful Leadership', author: 'Emma Wilson', price: 200, rating: 4.9, cover: '🧠', type: 'ebook' },
  { id: 'b4', title: 'Quantum Computing 101', author: 'Prof. Alex', price: 180, rating: 4.7, cover: '⚛️', type: 'ebook' },
];

const innovationAreas = [
  { area: 'Artificial Intelligence', projects: 4, investment: '$5.2M' },
  { area: 'Blockchain Technology', projects: 2, investment: '$2.8M' },
  { area: 'Extended Reality', projects: 3, investment: '$4.1M' },
  { area: 'Quantum Computing', projects: 1, investment: '$1.9M' },
  { area: 'Neurotechnology', projects: 2, investment: '$1.8M' },
];

const researchMilestones = [
  { quarter: 'Q1 2024', achievements: ['Launched AI Research Lab with $2M funding', 'Filed 3 patents in machine learning', 'Published breakthrough paper on neural networks', 'Established partnership with Stanford AI Institute'] },
  { quarter: 'Q2 2024', achievements: ['Beta launch of AR reading platform', 'Secured Series A funding round ($8M)', 'Expanded research team to 25 members', 'Won Innovation Award at TechCrunch Disrupt'] },
  { quarter: 'Q3 2024', achievements: ['Quantum computing prototype demonstration', 'Strategic partnership with MIT Technology Review', 'Open-sourced neural recommendation framework', 'International expansion to 3 new markets'] },
];

export default function BrandingScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { credits, spendCredits, addCredits } = useEconomy();
  const [selectedSection, setSelectedSection] = useState('modern');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [purchasedBooks, setPurchasedBooks] = useState<string[]>([]);

  const showNotification = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2000);
  };

  const navSections = [
    { key: 'modern', label: 'Modern UI', icon: 'auto-awesome' },
    { key: 'store', label: 'Store', icon: 'shopping-bag' },
    { key: 'projects', label: 'Projects', icon: 'science' },
    { key: 'preorders', label: 'Pre-Orders', icon: 'shopping-cart' },
  ];

  const handleBuyBook = (book: any) => {
    if (purchasedBooks.includes(book.id)) {
      showNotification(`${book.title} is now an Audiobook! 🎧`);
      return;
    }

    Alert.alert(
      'Confirm Purchase',
      `Buy "${book.title}" for ${book.price} credits?\n\nThis will also unlock the Audiobook version!`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy Now',
          onPress: () => {
            const success = spendCredits(book.price, `Purchased book: ${book.title}`);
            if (success) {
              setPurchasedBooks(prev => [...prev, book.id]);
              showNotification(`Purchased! Recipe downloaded. ${book.title} is now an Audiobook 🎧`);
            } else {
              Alert.alert('Insufficient Credits', 'Please add more credits to your account.');
            }
          }
        }
      ]
    );
  };

  const renderStore = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gridContent}>
      <View style={styles.storeHero}>
        <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.storeHeroGradient}>
          <Text style={styles.storeHeroTitle}>Elevated Store</Text>
          <Text style={styles.storeHeroSubtitle}>Unlock premium knowledge and resources</Text>
          <View style={styles.creditsBadge}>
            <Text style={styles.creditsBadgeText}>💰 {credits} Credits</Text>
          </View>
        </LinearGradient>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text, marginHorizontal: 12, marginBottom: 12 }]}>Featured Books</Text>

      {Array.from({ length: Math.ceil(bookData.length / 2) }, (_, i) => (
        <View key={i} style={styles.gridRow}>
          {bookData.slice(i * 2, i * 2 + 2).map((book) => (
            <TouchableOpacity key={book.id} style={[styles.bookCard, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
              <View style={styles.bookCoverArea}>
                <Text style={styles.bookEmojiLarge}>{book.cover}</Text>
                {purchasedBooks.includes(book.id) && (
                  <View style={styles.audiobookBadge}>
                    <MaterialIcons name="headphones" size={14} color="#FFF" />
                    <Text style={styles.audiobookText}>AUDIOBOOK</Text>
                  </View>
                )}
              </View>
              <View style={styles.bookInfoArea}>
                <Text style={[styles.bookTitleText, { color: theme.colors.text }]} numberOfLines={1}>{book.title}</Text>
                <Text style={styles.bookAuthorText}>{book.author}</Text>
                <View style={styles.bookRatingRow}>
                  <MaterialIcons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.ratingValueText}>{book.rating}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.buyBtn, purchasedBooks.includes(book.id) && styles.listenBtn]}
                  onPress={() => handleBuyBook(book)}
                >
                  <Text style={styles.buyBtnText}>
                    {purchasedBooks.includes(book.id) ? 'Listen Now 🎧' : `Buy ${book.price} cr`}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );

  const renderProjects = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gridContent}>
      {Array.from({ length: Math.ceil(researchProjects.length / 2) }, (_, i) => (
        <View key={i} style={styles.gridRow}>
          {researchProjects.slice(i * 2, i * 2 + 2).map((project) => (
            <TouchableOpacity key={project.id} style={[styles.projectCardSmall, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
              <LinearGradient colors={[project.color + '20', project.color + '05']} style={styles.projectCardGradient}>
                <View style={styles.projectCardHeader}>
                  <Text style={styles.projectEmojiSmall}>{project.icon}</Text>
                  <View style={[styles.statusBadgeSmall, { backgroundColor: project.color + '20' }]}>
                    <Text style={[styles.statusTextSmall, { color: project.color }]} numberOfLines={1}>{project.status}</Text>
                  </View>
                </View>
                <Text style={[styles.projectTitleSmall, { color: isDark ? '#F1F5F9' : '#1F2937' }]} numberOfLines={2}>{project.title}</Text>
                <Text style={[styles.projectDescSmall, { color: isDark ? '#94A3B8' : '#6B7280' }]} numberOfLines={2}>{project.description}</Text>
                <View style={styles.progressBarSmall}>
                  <View style={[styles.progressFillSmall, { width: `${(project.currentDonations / project.donationGoal) * 100}%`, backgroundColor: project.color }]} />
                </View>
                <View style={styles.projectCardFooter}>
                  <Text style={[styles.fundingTextSmall, { color: project.color }]}>{project.currentFunding}</Text>
                  <Text style={[styles.fundingGoalSmall, { color: isDark ? '#64748B' : '#9CA3AF' }]}>/ {project.fundingNeeded}</Text>
                </View>
                <TouchableOpacity style={[styles.donateButtonSmall, { backgroundColor: project.color }]} onPress={() => showNotification(`Donation opened for ${project.title}`)}>
                  <MaterialIcons name="favorite" size={12} color="#FFFFFF" />
                  <Text style={styles.donateButtonTextSmall}>Donate</Text>
                </TouchableOpacity>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );

  const renderPreOrders = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gridContent}>
      {Array.from({ length: Math.ceil(preOrderProducts.length / 2) }, (_, i) => (
        <View key={i} style={styles.gridRow}>
          {preOrderProducts.slice(i * 2, i * 2 + 2).map((product) => (
            <TouchableOpacity key={product.id} style={[styles.productCardSmall, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
              <View style={styles.productCardTop}>
                <Text style={styles.productEmojiSmall}>{product.image}</Text>
                <View style={[styles.productStatusBadge,
                  product.status === 'Sold Out' && { backgroundColor: '#FEF2F2' },
                  product.status === 'Limited' && { backgroundColor: '#FEF3C7' },
                  product.status === 'Pre-Order' && { backgroundColor: '#ECFDF5' },
                ]}>
                  <Text style={[styles.productStatusText,
                    product.status === 'Sold Out' && { color: '#EF4444' },
                    product.status === 'Limited' && { color: '#F59E0B' },
                    product.status === 'Pre-Order' && { color: '#10B981' },
                  ]}>{product.status}</Text>
                </View>
              </View>
              <Text style={[styles.productNameSmall, { color: isDark ? '#F1F5F9' : '#1F2937' }]} numberOfLines={1}>{product.name}</Text>
              <Text style={[styles.productDescSmall, { color: isDark ? '#94A3B8' : '#6B7280' }]} numberOfLines={2}>{product.description}</Text>
              <View style={styles.productCardFooter}>
                <Text style={[styles.productPriceSmall, { color: '#10B981' }]}>{product.price}</Text>
                <Text style={[styles.productDeliverySmall, { color: isDark ? '#64748B' : '#9CA3AF' }]}>{product.estimatedDelivery}</Text>
              </View>
              <View style={[styles.miniProgressBar, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
                <View style={[styles.miniProgressFill, { width: `${(product.preOrders / product.maxPreOrders) * 100}%`, backgroundColor: product.status === 'Sold Out' ? '#EF4444' : '#3B82F6' }]} />
              </View>
              <Text style={[styles.preOrderCountSmall, { color: isDark ? '#64748B' : '#9CA3AF' }]}>{product.preOrders}/{product.maxPreOrders}</Text>
              <TouchableOpacity
                style={[styles.preOrderButtonSmall, product.status === 'Sold Out' && { backgroundColor: '#F1F5F9' }]}
                disabled={product.status === 'Sold Out'}
                onPress={() => showNotification(product.status === 'Sold Out' ? 'Sold out!' : `Pre-ordered ${product.name}!`)}
              >
                <Text style={[styles.preOrderButtonTextSmall, product.status === 'Sold Out' && { color: '#9CA3AF' }]}>
                  {product.status === 'Sold Out' ? 'Sold Out' : 'Pre-Order'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );

  const renderFunding = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gridContent}>
      <View style={styles.gridRow}>
        {startupMetrics.slice(0, 2).map((metric, index) => (
          <View key={index} style={[styles.metricCardSmall, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            <Text style={styles.metricIconSmall}>{metric.icon}</Text>
            <Text style={[styles.metricValueSmall, { color: isDark ? '#F1F5F9' : '#1F2937' }]}>{metric.value}</Text>
            <Text style={[styles.metricLabelSmall, { color: isDark ? '#94A3B8' : '#6B7280' }]}>{metric.metric}</Text>
            <View style={styles.growthBadgeSmall}>
              <MaterialIcons name="trending-up" size={10} color="#10B981" />
              <Text style={styles.growthTextSmall}>{metric.growth}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.gridRow}>
        {startupMetrics.slice(2, 4).map((metric, index) => (
          <View key={index} style={[styles.metricCardSmall, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            <Text style={styles.metricIconSmall}>{metric.icon}</Text>
            <Text style={[styles.metricValueSmall, { color: isDark ? '#F1F5F9' : '#1F2937' }]}>{metric.value}</Text>
            <Text style={[styles.metricLabelSmall, { color: isDark ? '#94A3B8' : '#6B7280' }]}>{metric.metric}</Text>
            <View style={styles.growthBadgeSmall}>
              <MaterialIcons name="trending-up" size={10} color="#10B981" />
              <Text style={styles.growthTextSmall}>{metric.growth}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.gridRow}>
        {startupMetrics.slice(4, 6).map((metric, index) => (
          <View key={index} style={[styles.metricCardSmall, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            <Text style={styles.metricIconSmall}>{metric.icon}</Text>
            <Text style={[styles.metricValueSmall, { color: isDark ? '#F1F5F9' : '#1F2937' }]}>{metric.value}</Text>
            <Text style={[styles.metricLabelSmall, { color: isDark ? '#94A3B8' : '#6B7280' }]}>{metric.metric}</Text>
            <View style={styles.growthBadgeSmall}>
              <MaterialIcons name="trending-up" size={10} color="#10B981" />
              <Text style={styles.growthTextSmall}>{metric.growth}</Text>
            </View>
          </View>
        ))}
      </View>
      {innovationAreas.map((area, index) => (
        <View key={index} style={[styles.innovationCardSmall, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
          <View style={styles.innovationRowSmall}>
            <Text style={[styles.innovationAreaSmall, { color: isDark ? '#F1F5F9' : '#1F2937' }]}>{area.area}</Text>
            <Text style={[styles.innovationInvestmentSmall, { color: '#10B981' }]}>{area.investment}</Text>
          </View>
          <View style={[styles.innovationProgressSmall, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
            <View style={[styles.innovationBarSmall, { width: `${(area.projects / 4) * 100}%` }]} />
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderMilestones = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gridContent}>
      {researchMilestones.map((milestone, index) => (
        <View key={index} style={[styles.milestoneCardSmall, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
          <View style={styles.milestoneHeaderSmall}>
            <View style={styles.timelineDotSmall} />
            <Text style={[styles.milestoneQuarterSmall, { color: '#3B82F6' }]}>{milestone.quarter}</Text>
          </View>
          {milestone.achievements.map((achievement, i) => (
            <View key={i} style={styles.achievementRowSmall}>
              <MaterialIcons name="check-circle" size={13} color="#10B981" />
              <Text style={[styles.achievementTextSmall, { color: isDark ? '#CBD5E1' : '#4B5563' }]}>{achievement}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      {/* Header - No total gained */}
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.header}>
        <Text style={styles.headerTitle}>🎨 Branding Hub</Text>
        <Text style={styles.headerSubtitle}>Create and manage your brand identity</Text>
      </LinearGradient>

      {/* Navigation - 2x2 Grid */}
      <View style={styles.navGrid}>
        {navSections.map((section) => (
          <TouchableOpacity
            key={section.key}
            style={[
              styles.navGridItem,
              { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' },
              selectedSection === section.key && styles.navGridItemActive,
            ]}
            onPress={() => setSelectedSection(section.key)}
          >
            <MaterialIcons
              name={section.icon as any}
              size={20}
              color={selectedSection === section.key ? '#FFFFFF' : '#6B7280'}
            />
            <Text style={[styles.navGridText, selectedSection === section.key && styles.navGridTextActive]}>
              {section.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {selectedSection === 'modern' && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gridContent}>
            <ModernAnimatedUI />
          </ScrollView>
        )}
        {selectedSection === 'store' && renderStore()}
        {selectedSection === 'projects' && renderProjects()}
        {selectedSection === 'preorders' && renderPreOrders()}
        {selectedSection === 'funding' && renderFunding()}
        {selectedSection === 'milestones' && renderMilestones()}
      </View>

      {/* Alert */}
      {showAlert && (
        <View style={styles.alertContainer}>
          <LinearGradient colors={['#10B981', '#059669']} style={styles.alert}>
            <MaterialIcons name="check-circle" size={18} color="#FFFFFF" />
            <Text style={styles.alertText}>{alertMessage}</Text>
          </LinearGradient>
        </View>
      )}
    </View>
  );
}

const CARD_WIDTH = (width - 48) / 2;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 2 },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.65)' },

  // 2x2 Nav Grid
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  navGridItem: {
    width: (width - 40) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  navGridItemActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  navGridText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  navGridTextActive: { color: '#FFFFFF' },

  content: { flex: 1 },
  gridContent: { paddingHorizontal: 12, paddingBottom: 100 },
  gridRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },

  // Project Cards (small)
  projectCardSmall: {
    width: CARD_WIDTH,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  projectCardGradient: { padding: 12 },
  projectCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  projectEmojiSmall: { fontSize: 22 },
  statusBadgeSmall: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, maxWidth: 90 },
  statusTextSmall: { fontSize: 9, fontWeight: '600' },
  projectTitleSmall: { fontSize: 13, fontWeight: '700', marginBottom: 4, lineHeight: 18 },
  projectDescSmall: { fontSize: 11, lineHeight: 15, marginBottom: 8 },
  progressBarSmall: { height: 4, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 2, overflow: 'hidden', marginBottom: 6 },
  progressFillSmall: { height: '100%', borderRadius: 2 },
  projectCardFooter: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 8 },
  fundingTextSmall: { fontSize: 12, fontWeight: '700' },
  fundingGoalSmall: { fontSize: 11 },
  donateButtonSmall: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 8, paddingVertical: 6, gap: 4 },
  donateButtonTextSmall: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },

  // Product Cards (small)
  productCardSmall: {
    width: CARD_WIDTH,
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  productCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  productEmojiSmall: { fontSize: 22 },
  productStatusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  productStatusText: { fontSize: 9, fontWeight: '600' },
  productNameSmall: { fontSize: 12, fontWeight: '700', marginBottom: 3 },
  productDescSmall: { fontSize: 10, lineHeight: 14, marginBottom: 8, color: '#6B7280' },
  productCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  productPriceSmall: { fontSize: 13, fontWeight: '700' },
  productDeliverySmall: { fontSize: 9 },
  miniProgressBar: { height: 3, borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  miniProgressFill: { height: '100%', borderRadius: 2 },
  preOrderCountSmall: { fontSize: 9, marginBottom: 8, textAlign: 'right' },
  preOrderButtonSmall: { backgroundColor: '#3B82F6', borderRadius: 8, paddingVertical: 6, alignItems: 'center' },
  preOrderButtonTextSmall: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },

  // Metric Cards
  metricCardSmall: {
    width: CARD_WIDTH,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  metricIconSmall: { fontSize: 22, marginBottom: 6 },
  metricValueSmall: { fontSize: 22, fontWeight: '800', marginBottom: 2 },
  metricLabelSmall: { fontSize: 10, textAlign: 'center', marginBottom: 6 },
  growthBadgeSmall: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, gap: 2 },
  growthTextSmall: { fontSize: 10, fontWeight: '600', color: '#10B981' },

  // Innovation Cards
  innovationCardSmall: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  innovationRowSmall: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  innovationAreaSmall: { fontSize: 13, fontWeight: '600', flex: 1 },
  innovationInvestmentSmall: { fontSize: 13, fontWeight: '700' },
  innovationProgressSmall: { height: 4, borderRadius: 2, overflow: 'hidden' },
  innovationBarSmall: { height: '100%', backgroundColor: '#3B82F6', borderRadius: 2 },

  // Milestone Cards
  milestoneCardSmall: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  milestoneHeaderSmall: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  timelineDotSmall: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3B82F6' },
  milestoneQuarterSmall: { fontSize: 15, fontWeight: '700' },
  achievementRowSmall: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 6 },
  achievementTextSmall: { fontSize: 12, lineHeight: 16, flex: 1 },

  // Store styles
  storeHero: { marginHorizontal: 12, marginBottom: 20, borderRadius: 16, overflow: 'hidden' },
  storeHeroGradient: { padding: 20, alignItems: 'center' },
  storeHeroTitle: { color: '#FFF', fontSize: 24, fontWeight: '800', marginBottom: 4 },
  storeHeroSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 12 },
  creditsBadge: { backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  creditsBadgeText: { color: '#FBBF24', fontWeight: '700', fontSize: 12 },

  bookCard: { width: CARD_WIDTH, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
  bookCoverArea: { height: 120, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  bookEmojiLarge: { fontSize: 50 },
  audiobookBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#10B981', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  audiobookText: { color: '#FFF', fontSize: 8, fontWeight: '900' },
  bookInfoArea: { padding: 12 },
  bookTitleText: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  bookAuthorText: { fontSize: 11, color: '#6B7280', marginBottom: 6 },
  bookRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  ratingValueText: { fontSize: 11, fontWeight: '600', color: '#4B5563' },
  buyBtn: { backgroundColor: '#3B82F6', paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  listenBtn: { backgroundColor: '#10B981' },
  buyBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },

  // Alert
  alertContainer: { position: 'absolute', bottom: 90, left: 20, right: 20, zIndex: 1000 },
  alert: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, gap: 10 },
  alertText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', flex: 1 },
});
