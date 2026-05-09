import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Alert, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEconomy, DONATION_EMOJIS, DonationRecord } from '@/contexts/EconomyContext';

interface DonationPanelProps {
  targetId: string;
  targetType: DonationRecord['targetType'];
  targetName?: string;
  visible: boolean;
  onClose: () => void;
  onSuccess?: (amount: number, emoji: string) => void;
}

const QUICK_AMOUNTS = [5, 10, 20, 50, 100, 200];

export default function DonationPanel({ targetId, targetType, targetName, visible, onClose, onSuccess }: DonationPanelProps) {
  const { credits, donate, getDonationsForTarget } = useEconomy();
  const [selectedEmoji, setSelectedEmoji] = useState('heart');
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(10);
  const [showDonors, setShowDonors] = useState(false);

  const donors = getDonationsForTarget(targetId);
  const totalDonated = donors.reduce((sum, d) => sum + d.amount, 0);
  const emojiData = DONATION_EMOJIS[selectedEmoji];
  const finalAmount = customAmount ? parseInt(customAmount) || 0 : selectedAmount;

  const handleDonate = () => {
    if (finalAmount < emojiData.minAmount) {
      Alert.alert('Minimum Amount', `${emojiData.emoji} ${emojiData.label} requires at least ${emojiData.minAmount} credits.`);
      return;
    }
    const success = donate(targetId, targetType, finalAmount, selectedEmoji);
    if (success) {
      Alert.alert('Donation Sent! 🎉', `You donated ${finalAmount} credits ${emojiData.emoji} ${targetName ? `to ${targetName}` : ''}!`);
      onSuccess?.(finalAmount, emojiData.emoji);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <MaterialIcons name="close" size={22} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>💝 Send Donation</Text>
          <View style={styles.creditsChip}>
            <Text style={styles.creditsText}>💰 {credits.toLocaleString()}</Text>
          </View>
        </LinearGradient>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          {targetName && (
            <View style={styles.targetInfo}>
              <Text style={styles.targetLabel}>Donating to</Text>
              <Text style={styles.targetName}>{targetName}</Text>
            </View>
          )}

          {/* Donation Stats */}
          <TouchableOpacity style={styles.statsRow} onPress={() => setShowDonors(!showDonors)}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{donors.length}</Text>
              <Text style={styles.statLabel}>Donors</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalDonated.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Credits</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name={showDonors ? 'expand-less' : 'expand-more'} size={20} color="#6B7280" />
              <Text style={styles.statLabel}>See donors</Text>
            </View>
          </TouchableOpacity>

          {showDonors && donors.length > 0 && (
            <View style={styles.donorsList}>
              {donors.map(d => (
                <View key={d.id} style={styles.donorRow}>
                  <Text style={styles.donorAvatar}>{d.donorAvatar}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.donorName}>{d.donorName}</Text>
                    {d.message && <Text style={styles.donorMessage}>"{d.message}"</Text>}
                  </View>
                  <View style={styles.donorAmount}>
                    <Text style={styles.donorEmoji}>{d.emoji}</Text>
                    <Text style={styles.donorCredit}>{d.amount}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Emoji Type Selection */}
          <Text style={styles.sectionTitle}>Choose Donation Type</Text>
          <View style={styles.emojiGrid}>
            {Object.entries(DONATION_EMOJIS).map(([key, val]) => (
              <TouchableOpacity
                key={key}
                style={[styles.emojiCard, selectedEmoji === key && styles.emojiCardSelected]}
                onPress={() => { setSelectedEmoji(key); if (selectedAmount < val.minAmount) setSelectedAmount(val.minAmount); }}
              >
                <Text style={styles.emojiIcon}>{val.emoji}</Text>
                <Text style={styles.emojiLabel}>{val.label}</Text>
                <Text style={styles.emojiMin}>Min {val.minAmount}cr</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount Selection */}
          <Text style={styles.sectionTitle}>Amount (Credits)</Text>
          <View style={styles.amountsRow}>
            {QUICK_AMOUNTS.map(amt => (
              <TouchableOpacity
                key={amt}
                style={[styles.amountChip, selectedAmount === amt && !customAmount && styles.amountChipSelected]}
                onPress={() => { setSelectedAmount(amt); setCustomAmount(''); }}
              >
                <Text style={[styles.amountText, selectedAmount === amt && !customAmount && styles.amountTextSelected]}>{amt}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.customInput}
            placeholder="Custom amount..."
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={customAmount}
            onChangeText={setCustomAmount}
          />

          {/* Summary */}
          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>You're sending</Text>
            <Text style={styles.summaryAmount}>{finalAmount} credits {emojiData.emoji}</Text>
            <Text style={styles.summaryUSD}>(≈ ${(finalAmount / 100).toFixed(2)} USD)</Text>
            <Text style={styles.summaryBalance}>Balance after: {(credits - finalAmount).toLocaleString()} credits</Text>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[styles.donateBtn, finalAmount > credits && styles.donateBtnDisabled]}
          onPress={handleDonate}
          disabled={finalAmount > credits}
        >
          <LinearGradient colors={finalAmount > credits ? ['#9CA3AF', '#6B7280'] : ['#667eea', '#764ba2']} style={styles.donateBtnGradient}>
            <Text style={styles.donateBtnText}>{emojiData.emoji} Donate {finalAmount} Credits</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, paddingTop: 56 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  creditsChip: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  creditsText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  body: { flex: 1, padding: 16 },
  targetInfo: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 12, alignItems: 'center' },
  targetLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  targetName: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  statsRow: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 12, justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: '#667eea' },
  statLabel: { fontSize: 11, color: '#6B7280' },
  donorsList: { backgroundColor: '#FFF', borderRadius: 14, padding: 12, marginBottom: 12 },
  donorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  donorAvatar: { fontSize: 22 },
  donorName: { fontSize: 13, fontWeight: '600', color: '#1F2937' },
  donorMessage: { fontSize: 11, color: '#6B7280', fontStyle: 'italic' },
  donorAmount: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  donorEmoji: { fontSize: 16 },
  donorCredit: { fontSize: 13, fontWeight: '700', color: '#667eea' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 10, marginTop: 8 },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  emojiCard: { width: 80, alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, padding: 10, borderWidth: 2, borderColor: '#E5E7EB' },
  emojiCardSelected: { borderColor: '#667eea', backgroundColor: '#EEF2FF' },
  emojiIcon: { fontSize: 24, marginBottom: 4 },
  emojiLabel: { fontSize: 10, fontWeight: '700', color: '#374151' },
  emojiMin: { fontSize: 8, color: '#9CA3AF' },
  amountsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  amountChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#E5E7EB' },
  amountChipSelected: { backgroundColor: '#667eea', borderColor: '#667eea' },
  amountText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  amountTextSelected: { color: '#FFF' },
  customInput: { backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, borderWidth: 1.5, borderColor: '#E5E7EB', marginBottom: 16 },
  summaryBox: { backgroundColor: '#EEF2FF', borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 20 },
  summaryText: { fontSize: 12, color: '#6B7280' },
  summaryAmount: { fontSize: 24, fontWeight: '800', color: '#667eea', marginVertical: 4 },
  summaryUSD: { fontSize: 12, color: '#6B7280' },
  summaryBalance: { fontSize: 12, color: '#374151', marginTop: 4 },
  donateBtn: { margin: 16, borderRadius: 16, overflow: 'hidden' },
  donateBtnDisabled: { opacity: 0.6 },
  donateBtnGradient: { paddingVertical: 16, alignItems: 'center' },
  donateBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
