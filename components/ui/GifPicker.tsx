import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Modal,
  ActivityIndicator, Dimensions, Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Using Giphy public beta key for development
const GIPHY_API_KEY = 'dc6zaTOxFJmzC';
const GIPHY_BASE = 'https://api.giphy.com/v1/gifs';

export interface GifResult {
  id: string;
  url: string;
  preview: string;
  title: string;
  width: number;
  height: number;
}

interface GifPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (gif: GifResult) => void;
}

const TRENDING_SEARCHES = ['Reaction', 'Funny', 'Happy', 'Love', 'OMG', 'Yes', 'No', 'Fire', 'Wow', 'Dance'];

function parseGifs(data: any[]): GifResult[] {
  return data.map(g => ({
    id: g.id,
    url: g.images?.fixed_width?.url || g.images?.original?.url || '',
    preview: g.images?.fixed_width_small?.url || g.images?.fixed_width?.url || '',
    title: g.title || '',
    width: parseInt(g.images?.fixed_width?.width || '200'),
    height: parseInt(g.images?.fixed_width?.height || '150'),
  })).filter(g => g.url);
}

export default function GifPicker({ visible, onClose, onSelect }: GifPickerProps) {
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState<GifResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchGifs = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const endpoint = searchQuery
        ? `${GIPHY_BASE}/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(searchQuery)}&limit=24&rating=g`
        : `${GIPHY_BASE}/trending?api_key=${GIPHY_API_KEY}&limit=24&rating=g`;
      const res = await fetch(endpoint);
      const json = await res.json();
      setGifs(parseGifs(json.data || []));
    } catch (e) {
      // Fallback to emoji-based GIFs if API fails
      setGifs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrending = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`${GIPHY_BASE}/trending?api_key=${GIPHY_API_KEY}&limit=24&rating=g`);
      const json = await res.json();
      setGifs(parseGifs(json.data || []));
    } catch (e) {
      setGifs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpen = useCallback(() => {
    if (!searched) fetchTrending();
  }, [searched, fetchTrending]);

  React.useEffect(() => {
    if (visible) handleOpen();
  }, [visible]);

  const GIF_COL_WIDTH = (width - 48) / 2;

  const renderGif = ({ item }: { item: GifResult }) => (
    <TouchableOpacity
      style={[styles.gifItem, { width: GIF_COL_WIDTH }]}
      onPress={() => { onSelect(item); onClose(); }}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.preview }}
        style={[styles.gifImage, { width: GIF_COL_WIDTH, height: 120 }]}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <MaterialIcons name="close" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.title}>GIF Search</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.searchRow}>
          <MaterialIcons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search GIFs on Giphy..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => fetchGifs(query)}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); fetchTrending(); }}>
              <MaterialIcons name="close" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.trendingRow}>
          <FlatList
            data={TRENDING_SEARCHES}
            keyExtractor={i => i}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.trendingChip}
                onPress={() => { setQuery(item); fetchGifs(item); }}
              >
                <Text style={styles.trendingChipText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Searching Giphy...</Text>
          </View>
        ) : gifs.length === 0 && searched ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>😔</Text>
            <Text style={styles.emptyText}>No GIFs found</Text>
            <Text style={styles.emptySubtext}>Try a different search term</Text>
          </View>
        ) : (
          <FlatList
            data={gifs}
            keyExtractor={g => g.id}
            numColumns={2}
            contentContainerStyle={styles.gifGrid}
            columnWrapperStyle={{ gap: 8 }}
            renderItem={renderGif}
            showsVerticalScrollIndicator={false}
          />
        )}

        <View style={styles.poweredBy}>
          <Text style={styles.poweredByText}>Powered by GIPHY</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  searchRow: { flexDirection: 'row', alignItems: 'center', margin: 12, backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#1F2937' },
  trendingRow: { marginBottom: 8 },
  trendingChip: { backgroundColor: '#EBF4FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#BFDBFE' },
  trendingChipText: { fontSize: 12, fontWeight: '600', color: '#3B82F6' },
  gifGrid: { paddingHorizontal: 16, paddingBottom: 80 },
  gifItem: { borderRadius: 10, overflow: 'hidden', marginBottom: 8 },
  gifImage: { borderRadius: 10 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#6B7280' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  emptySubtext: { fontSize: 14, color: '#6B7280' },
  poweredBy: { position: 'absolute', bottom: 16, alignSelf: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  poweredByText: { fontSize: 10, color: '#9CA3AF', fontWeight: '600' },
});
