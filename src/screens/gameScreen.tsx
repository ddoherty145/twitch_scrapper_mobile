import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { startTopClipsScrape, fetchJobClips } from '../store/clipSlice';
import { colors, spacing, typography, borderRadius } from '../theme/theme_index';
import { getJobStatus } from '../services/api';

const POPULAR_GAMES = [
  'Just Chatting',
  'League of Legends',
  'Grand Theft Auto V',
  'Fortnite',
  'Valorant',
  'World of Warcraft',
  'Minecraft',
  'Counter-Strike',
  'Apex Legends',
  'Deadlock',
  'Marvel Rivals',
  'Teamfight Tactics',
  'Music',
  'Art',
  'IRL',
  'Peak',
  'Path of Exile 2',
  'Animals, Aquariums, and Zoos',
];

export default function GamesScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector(s => s.settings.darkMode);
  const { scraping } = useAppSelector(s => s.clips);
  const theme = darkMode ? colors.dark : colors.light;

  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [clips, setClips] = useState<any[]>([]);
  const [loadingClips, setLoadingClips] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const pollJobUntilDone = async (jobId: number): Promise<any> => {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const job = await getJobStatus(jobId);
          if (job.status === 'completed') {
            clearInterval(interval);
            resolve(job);
          } else if (job.status === 'failed') {
            clearInterval(interval);
            reject(new Error(job.error || 'Job failed'));
          }
        } catch (e) {
          clearInterval(interval);
          reject(e);
        }
      }, 2000);
    });
  };

  const handleFetchClips = async (game = selectedGame) => {
    if (!game) return;
    setLoadingClips(true);
    setClips([]);

    try {
      const result = await dispatch(startTopClipsScrape({
        days_back: 1,
        limit: 50,
        english_only: true,
        game_filter: game,
      })).unwrap();

      await pollJobUntilDone(result.job_id);
      const clipsResult = await dispatch(fetchJobClips(result.job_id)).unwrap();
      setClips(clipsResult);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to fetch clips');
    } finally {
      setLoadingClips(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await handleFetchClips();
    setRefreshing(false);
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Game Selector */}
      <View style={[styles.selectorBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Choose a Game</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gameScroll}>
          {POPULAR_GAMES.map(game => (
            <TouchableOpacity
              key={game}
              onPress={() => setSelectedGame(game)}
              style={[
                styles.gameChip,
                {
                  backgroundColor: selectedGame === game ? theme.secondary : theme.tertiary,
                  borderColor: selectedGame === game ? theme.secondary : theme.border,
                }
              ]}
            >
              <Text style={[
                styles.gameChipText,
                { color: selectedGame === game ? '#ffffff' : theme.text }
              ]}>
                {game}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {selectedGame && (
          <TouchableOpacity
            onPress={() => handleFetchClips()}
            disabled={loadingClips || scraping}
            style={[
              styles.fetchButton,
              { backgroundColor: theme.secondary },
              (loadingClips || scraping) && styles.fetchButtonDisabled
            ]}
          >
            {loadingClips ? (
              <View style={styles.row}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.fetchButtonText}>  Fetching clips...</Text>
              </View>
            ) : (
              <Text style={styles.fetchButtonText}>▶  Get Top Clips for {selectedGame}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Clips List */}
      {clips.length > 0 ? (
        <FlatList
          data={clips}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={styles.clipsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.secondary}
            />
          }
          ListHeaderComponent={
            <Text style={[styles.resultsLabel, { color: theme.subtext }]}>
              {clips.length} clips found for {selectedGame}
            </Text>
          }
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('ClipDetail', { clip: item })}
              style={[styles.clipCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <View style={styles.clipRank}>
                <Text style={[styles.rankText, { color: theme.secondary }]}>#{index + 1}</Text>
              </View>
              <View style={styles.clipInfo}>
                <Text style={[styles.clipTitle, { color: theme.text }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={[styles.clipMeta, { color: theme.subtext }]}>
                  📺 {item.broadcaster_name}
                </Text>
                <View style={styles.clipStats}>
                  <Text style={[styles.statBadge, { backgroundColor: theme.tertiary, color: theme.text }]}>
                    👀 {formatViews(item.view_count)}
                  </Text>
                  <Text style={[styles.statBadge, { backgroundColor: theme.tertiary, color: theme.text }]}>
                    ⏱ {formatDuration(item.duration)}
                  </Text>
                </View>
              </View>
              <Text style={[styles.chevron, { color: theme.subtext }]}>›</Text>
            </TouchableOpacity>
          )}
        />
      ) : !loadingClips ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎮</Text>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            {selectedGame ? `Ready to fetch ${selectedGame} clips` : 'Select a game above'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.subtext }]}>
            {selectedGame
              ? 'Tap the button to load top clips'
              : 'Scroll through the categories and pick one'}
          </Text>
        </View>
      ) : null}

      {loadingClips && (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={theme.secondary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Fetching top clips from Twitch...
          </Text>
          <Text style={[styles.loadingSubtext, { color: theme.subtext }]}>
            This may take 30–60 seconds
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  selectorBox: {
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  sectionTitle: { ...typography.h3, marginBottom: spacing.sm },
  gameScroll: { marginBottom: spacing.sm },
  gameChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  gameChipText: { ...typography.label },
  fetchButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  fetchButtonDisabled: { opacity: 0.6 },
  fetchButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center' },
  clipsList: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  resultsLabel: { ...typography.small, marginBottom: spacing.sm, marginTop: spacing.xs },
  clipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  clipRank: { width: 36, alignItems: 'center' },
  rankText: { fontSize: 16, fontWeight: '700' },
  clipInfo: { flex: 1, marginLeft: spacing.sm },
  clipTitle: { ...typography.body, fontWeight: '600', marginBottom: 4 },
  clipMeta: { ...typography.small, marginBottom: 6 },
  clipStats: { flexDirection: 'row', gap: spacing.xs },
  statBadge: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  chevron: { fontSize: 24, marginLeft: spacing.sm },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyEmoji: { fontSize: 64, marginBottom: spacing.md },
  emptyTitle: { ...typography.h3, textAlign: 'center', marginBottom: spacing.sm },
  emptySubtitle: { ...typography.body, textAlign: 'center' },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: { ...typography.body, fontWeight: '600' },
  loadingSubtext: { ...typography.small },
});