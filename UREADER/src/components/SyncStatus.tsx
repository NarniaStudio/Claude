import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemeColors } from '../types';
import { formatRelativeDate } from '../utils/formatters';

interface SyncStatusProps {
  isSyncing: boolean;
  lastSyncAt: number | null;
  syncError: string | null;
  isLoggedIn: boolean;
  pendingChanges: number;
  theme: ThemeColors;
  onSync: () => void;
  onLogin: () => void;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({
  isSyncing, lastSyncAt, syncError, isLoggedIn, pendingChanges,
  theme, onSync, onLogin,
}) => {
  if (!isLoggedIn) {
    return (
      <TouchableOpacity
        style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={onLogin}
      >
        <Text style={[styles.icon]}>{'☁️'}</Text>
        <View style={styles.info}>
          <Text style={[styles.title, { color: theme.text }]}>סנכרון</Text>
          <Text style={[styles.subtitle, { color: theme.secondary }]}>
            התחבר כדי לסנכרן בין מכשירים
          </Text>
        </View>
        <Text style={[styles.arrow, { color: theme.secondary }]}>{'>'}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onSync}
      disabled={isSyncing}
    >
      {isSyncing ? (
        <ActivityIndicator size="small" color={theme.accent} />
      ) : (
        <Text style={styles.icon}>{'☁️'}</Text>
      )}
      <View style={styles.info}>
        <Text style={[styles.title, { color: theme.text }]}>
          {isSyncing ? 'מסנכרן...' : syncError ? 'שגיאת סנכרון' : 'מסונכרן'}
        </Text>
        <Text style={[styles.subtitle, { color: syncError ? '#e53935' : theme.secondary }]}>
          {syncError
            ? syncError
            : lastSyncAt
              ? `עודכן ${formatRelativeDate(lastSyncAt)}`
              : 'לא סונכרן עדיין'}
        </Text>
      </View>
      {pendingChanges > 0 && (
        <View style={[styles.badge, { backgroundColor: theme.accent }]}>
          <Text style={styles.badgeText}>{pendingChanges}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  arrow: {
    fontSize: 18,
    fontWeight: '600',
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});
