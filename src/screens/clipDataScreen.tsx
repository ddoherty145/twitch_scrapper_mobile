import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Linking,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { toggleFavorite, Clip } from '../store/clipSlice';
import { colors, spacing, typography, borderRadius } from '../theme/theme_index';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ClipDetailScreen({ route }: any) {
  const { clip }: { clip: Clip } = route.params;
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector(s => s.settings.darkMode);
  const favorites = useAppSelector(s => s.clips.favorites);
  const theme = darkMode ? colors.dark : colors.light;
  const isFavorited = favorites.some(f => f.id === clip.id);

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

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this clip: ${clip.title}\n${clip.url}`,
        url: clip.url,
        title: clip.title,
      });
    } catch (e) {
      Alert.alert('Error', 'Could not share clip');
    }
  };

  const handleFavorite = async () => {
    dispatch(toggleFavorite(clip));
    // Persist to AsyncStorage
    try {
      const updatedFavorites = isFavorited
        ? favorites.filter(f => f.id !== clip.id)
        : [...favorites, clip];
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    } catch (e) {
      console.warn('Failed to save favorites');
    }
  };

  const handleOpenTwitch = () => {
    Linking.openURL(clip.url);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Video Player — load the full Twitch clip page, not the embed endpoint */}
      <View style={styles.playerContainer}>
        <WebView
          source={{ uri: clip.url }}
          style={styles.player}
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          mixedContentMode="always"
          originWhitelist={['*']}
          userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
          onError={e => console.log('WebView error', e.nativeEvent)}
          onHttpError={e => console.log('WebView HTTP error', e.nativeEvent.statusCode)}
        />
      </View>

      {/* Clip Info */}
      <View style={[styles.infoBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>{clip.title}</Text>

        <View style={styles.metaRow}>
          <Text style={[styles.meta, { color: theme.subtext }]}>📺 {clip.broadcaster_name}</Text>
          <Text style={[styles.meta, { color: theme.subtext }]}>🎮 {clip.game_name}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statChip, { backgroundColor: theme.tertiary }]}>
            <Text style={[styles.statText, { color: theme.text }]}>👀 {formatViews(clip.view_count)} views</Text>
          </View>
          <View style={[styles.statChip, { backgroundColor: theme.tertiary }]}>
            <Text style={[styles.statText, { color: theme.text }]}>⏱ {formatDuration(clip.duration)}</Text>
          </View>
        </View>

        <Text style={[styles.creator, { color: theme.subtext }]}>
          Clipped by {clip.creator_name}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={handleFavorite}
          style={[styles.actionButton, { backgroundColor: isFavorited ? '#f59e0b' : theme.card, borderColor: theme.border }]}
        >
          <Text style={styles.actionEmoji}>{isFavorited ? '★' : '☆'}</Text>
          <Text style={[styles.actionLabel, { color: isFavorited ? '#ffffff' : theme.text }]}>
            {isFavorited ? 'Saved' : 'Save'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleShare}
          style={[styles.actionButton, { backgroundColor: theme.secondary, borderColor: theme.secondary }]}
        >
          <Text style={styles.actionEmoji}>↑</Text>
          <Text style={[styles.actionLabel, { color: '#ffffff' }]}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleOpenTwitch}
          style={[styles.actionButton, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <Text style={styles.actionEmoji}>🔗</Text>
          <Text style={[styles.actionLabel, { color: theme.text }]}>Twitch</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  playerContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  player: { flex: 1 },
  infoBox: {
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  title: { ...typography.h3, marginBottom: spacing.sm },
  metaRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  meta: { ...typography.small },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  statChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statText: { ...typography.small },
  creator: { ...typography.small, marginTop: spacing.xs },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  actionEmoji: { fontSize: 20, marginBottom: 4 },
  actionLabel: { ...typography.small, fontWeight: '600' },
});