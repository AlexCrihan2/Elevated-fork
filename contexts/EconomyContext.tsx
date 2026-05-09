import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Alert } from 'react-native';

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'earn' | 'spend' | 'donate' | 'purchase';
  amount: number;
  description: string;
  timestamp: string;
  emoji?: string;
}

export interface DonationRecord {
  id: string;
  donorName: string;
  donorAvatar: string;
  amount: number;
  currency: 'credits' | 'usd';
  emoji: string;
  message?: string;
  targetType: 'post' | 'stream' | 'recipe' | 'preorder';
  targetId: string;
  timestamp: string;
}

interface EconomyContextType {
  credits: number;
  totalEarned: number;
  totalSpent: number;
  transactions: Transaction[];
  donations: DonationRecord[];
  profileType: ProfileTypeKey;
  profileTypeMonthlyFee: number;
  addCredits: (amount: number, description: string) => void;
  spendCredits: (amount: number, description: string) => boolean;
  depositUSD: (usdAmount: number) => void;
  withdrawCredits: (creditAmount: number) => void;
  donate: (targetId: string, targetType: DonationRecord['targetType'], amount: number, emojiType: string) => boolean;
  getDonationsForTarget: (targetId: string) => DonationRecord[];
  changeProfileType: (newType: ProfileTypeKey) => boolean;
  creditToUSD: (credits: number) => number;
  usdToCredits: (usd: number) => number;
}

export type ProfileTypeKey = 'normal' | 'artist' | 'researcher' | 'teacher' | 'business' | 'seller';

export const PROFILE_TYPES: Record<ProfileTypeKey, { label: string; emoji: string; color: string; monthlyFee: number; perks: string[] }> = {
  normal: { label: 'Normal', emoji: '👤', color: '#6B7280', monthlyFee: 0, perks: ['Basic posting', 'Follow users', 'Comment & like'] },
  artist: { label: 'Artist', emoji: '🎨', color: '#EC4899', monthlyFee: 50, perks: ['Portfolio showcase', 'Sell artwork', 'Artist badge', 'Commissions'] },
  researcher: { label: 'Researcher', emoji: '🔬', color: '#8B5CF6', monthlyFee: 75, perks: ['Research papers', 'Citation tracking', 'Lab network', 'Publications'] },
  teacher: { label: 'Teacher', emoji: '🎓', color: '#3B82F6', monthlyFee: 60, perks: ['Course creation', 'Student management', 'Teacher badge', 'Revenue share'] },
  business: { label: 'Business', emoji: '💼', color: '#F59E0B', monthlyFee: 100, perks: ['Business page', 'Analytics', 'Ads', 'Priority support'] },
  seller: { label: 'Seller', emoji: '🛒', color: '#10B981', monthlyFee: 80, perks: ['Product listings', 'Store page', 'Payment processing', 'Seller badge'] },
};

export const DONATION_EMOJIS: Record<string, { emoji: string; label: string; minAmount: number }> = {
  heart: { emoji: '❤️', label: 'Love', minAmount: 5 },
  fire: { emoji: '🔥', label: 'Fire', minAmount: 10 },
  star: { emoji: '⭐', label: 'Star', minAmount: 20 },
  diamond: { emoji: '💎', label: 'Diamond', minAmount: 50 },
  rocket: { emoji: '🚀', label: 'Rocket', minAmount: 100 },
  crown: { emoji: '👑', label: 'Crown', minAmount: 200 },
  trophy: { emoji: '🏆', label: 'Trophy', minAmount: 500 },
};

// 100 credits = $1 USD
const CREDITS_PER_USD = 100;

const EconomyContext = createContext<EconomyContextType | undefined>(undefined);

const mockDonations: DonationRecord[] = [
  { id: 'd1', donorName: 'Alex Chen', donorAvatar: '👨‍💻', amount: 50, currency: 'credits', emoji: '🔥', message: 'Amazing content!', targetType: 'post', targetId: '1', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 'd2', donorName: 'Dr. Sarah', donorAvatar: '👩‍⚕️', amount: 200, currency: 'credits', emoji: '💎', message: 'Keep it up!', targetType: 'stream', targetId: 'ls1', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: 'd3', donorName: 'Maria R.', donorAvatar: '👩‍🎓', amount: 20, currency: 'credits', emoji: '⭐', targetType: 'post', targetId: '2', timestamp: new Date(Date.now() - 1800000).toISOString() },
  { id: 'd4', donorName: 'James W.', donorAvatar: '👨‍🏫', amount: 100, currency: 'credits', emoji: '🚀', message: 'Best streamer!', targetType: 'stream', targetId: 'ls2', timestamp: new Date(Date.now() - 900000).toISOString() },
];

export function EconomyProvider({ children }: { children: ReactNode }) {
  const [credits, setCredits] = useState(2500);
  const [totalEarned, setTotalEarned] = useState(2500);
  const [totalSpent, setTotalSpent] = useState(0);
  const [profileType, setProfileType] = useState<ProfileTypeKey>('researcher');
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 't1', type: 'earn', amount: 2500, description: 'Welcome bonus', timestamp: new Date(Date.now() - 86400000).toISOString(), emoji: '🎁' },
  ]);
  const [donations, setDonations] = useState<DonationRecord[]>(mockDonations);

  const profileTypeMonthlyFee = PROFILE_TYPES[profileType].monthlyFee;

  const addTransaction = useCallback((tx: Omit<Transaction, 'id' | 'timestamp'>) => {
    setTransactions(prev => [{
      ...tx,
      id: `tx_${Date.now()}`,
      timestamp: new Date().toISOString(),
    }, ...prev]);
  }, []);

  const addCredits = useCallback((amount: number, description: string) => {
    setCredits(prev => prev + amount);
    setTotalEarned(prev => prev + amount);
    addTransaction({ type: 'earn', amount, description, emoji: '💰' });
  }, [addTransaction]);

  const spendCredits = useCallback((amount: number, description: string): boolean => {
    if (credits < amount) return false;
    setCredits(prev => prev - amount);
    setTotalSpent(prev => prev + amount);
    addTransaction({ type: 'spend', amount: -amount, description, emoji: '💸' });
    return true;
  }, [credits, addTransaction]);

  const depositUSD = useCallback((usdAmount: number) => {
    const creditAmount = Math.floor(usdAmount * CREDITS_PER_USD);
    setCredits(prev => prev + creditAmount);
    setTotalEarned(prev => prev + creditAmount);
    addTransaction({ type: 'deposit', amount: creditAmount, description: `Deposited $${usdAmount} USD → ${creditAmount} credits`, emoji: '💳' });
  }, [addTransaction]);

  const withdrawCredits = useCallback((creditAmount: number) => {
    if (credits < creditAmount) {
      Alert.alert('Insufficient Credits', `You need ${creditAmount} credits but only have ${credits}.`);
      return;
    }
    const usdAmount = (creditAmount / CREDITS_PER_USD).toFixed(2);
    setCredits(prev => prev - creditAmount);
    setTotalSpent(prev => prev + creditAmount);
    addTransaction({ type: 'withdraw', amount: -creditAmount, description: `Withdrew ${creditAmount} credits → $${usdAmount} USD`, emoji: '🏦' });
    Alert.alert('Withdrawal Successful', `${creditAmount} credits → $${usdAmount} USD sent to your account.`);
  }, [credits, addTransaction]);

  const donate = useCallback((targetId: string, targetType: DonationRecord['targetType'], amount: number, emojiType: string): boolean => {
    if (credits < amount) {
      Alert.alert('Insufficient Credits', `You need ${amount} credits to donate. You have ${credits}.`);
      return false;
    }
    setCredits(prev => prev - amount);
    setTotalSpent(prev => prev + amount);
    const emojiData = DONATION_EMOJIS[emojiType] || DONATION_EMOJIS.heart;
    const newDonation: DonationRecord = {
      id: `don_${Date.now()}`,
      donorName: 'You',
      donorAvatar: '😊',
      amount,
      currency: 'credits',
      emoji: emojiData.emoji,
      targetType,
      targetId,
      timestamp: new Date().toISOString(),
    };
    setDonations(prev => [newDonation, ...prev]);
    addTransaction({ type: 'donate', amount: -amount, description: `${emojiData.emoji} Donated ${amount} credits to ${targetType}`, emoji: emojiData.emoji });
    return true;
  }, [credits, addTransaction]);

  const getDonationsForTarget = useCallback((targetId: string) => {
    return donations.filter(d => d.targetId === targetId);
  }, [donations]);

  const changeProfileType = useCallback((newType: ProfileTypeKey): boolean => {
    const fee = PROFILE_TYPES[newType].monthlyFee;
    if (fee > 0 && credits < fee) {
      Alert.alert('Insufficient Credits', `You need ${fee} credits/month for ${PROFILE_TYPES[newType].label} profile. You have ${credits}.`);
      return false;
    }
    if (fee > 0) {
      setCredits(prev => prev - fee);
      setTotalSpent(prev => prev + fee);
      addTransaction({ type: 'spend', amount: -fee, description: `${PROFILE_TYPES[newType].emoji} Upgraded to ${PROFILE_TYPES[newType].label} profile (monthly fee)`, emoji: PROFILE_TYPES[newType].emoji });
    }
    setProfileType(newType);
    return true;
  }, [credits, addTransaction]);

  const creditToUSD = useCallback((c: number) => c / CREDITS_PER_USD, []);
  const usdToCredits = useCallback((usd: number) => Math.floor(usd * CREDITS_PER_USD), []);

  return (
    <EconomyContext.Provider value={{
      credits, totalEarned, totalSpent, transactions, donations, profileType, profileTypeMonthlyFee,
      addCredits, spendCredits, depositUSD, withdrawCredits, donate, getDonationsForTarget,
      changeProfileType, creditToUSD, usdToCredits,
    }}>
      {children}
    </EconomyContext.Provider>
  );
}

export function useEconomy() {
  const ctx = useContext(EconomyContext);
  if (!ctx) throw new Error('useEconomy must be used within EconomyProvider');
  return ctx;
}
