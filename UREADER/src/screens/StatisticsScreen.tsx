import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { getTheme } from '../theme';
import { formatReadingTime } from '../utils/formatters';

const { width } = Dimensions.get('window');

export const StatisticsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const stats = useSelector((state: RootState) => state.reading.stats);
  const dailyReadings = useSelector((state: RootState) => state.reading.dailyReadings);
  const books = useSelector((state: RootState) => state.books.books);
  const readerSettings = useSelector((state: RootState) => state.settings.reader);
  const appSettings = useSelector((state: RootState) => state.settings.app);
  const theme = getTheme(readerSettings.theme);

  const finishedBooks = books.filter(b => b.isFinished).length;
  const readingBooks = books.filter(b => b.progress > 0 && !b.isFinished).length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayReading = dailyReadings.find(d => d.date === todayStr);
  const todayPages = todayReading?.pagesRead || 0;
  const todayMinutes = todayReading?.readingTime || 0;
  const pageGoalProgress = Math.min(100, Math.round((todayPages / appSettings.dailyGoalPages) * 100));
  const timeGoalProgress = Math.min(100, Math.round((todayMinutes / appSettings.dailyGoalMinutes) * 100));

  const last7Days = dailyReadings.slice(-7);
  const maxPages = Math.max(...last7Days.map(d => d.pagesRead), 1);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backText, { color: theme.accent }]}>{'◀ חזרה'}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>סטטיסטיקות</Text>
      </View>

      {/* Daily Goal */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>יעד יומי</Text>
        <View style={styles.goalRow}>
          <View style={styles.goalItem}>
            <View style={styles.goalCircle}>
              <View style={[styles.goalProgress, {
                borderColor: theme.accent,
                transform: [{ rotate: `${pageGoalProgress * 3.6}deg` }],
              }]} />
              <Text style={[styles.goalValue, { color: theme.text }]}>{todayPages}</Text>
              <Text style={[styles.goalTarget, { color: theme.secondary }]}>/{appSettings.dailyGoalPages}</Text>
            </View>
            <Text style={[styles.goalLabel, { color: theme.secondary }]}>עמודים</Text>
          </View>
          <View style={styles.goalItem}>
            <View style={styles.goalCircle}>
              <Text style={[styles.goalValue, { color: theme.text }]}>{Math.round(todayMinutes)}</Text>
              <Text style={[styles.goalTarget, { color: theme.secondary }]}>/{appSettings.dailyGoalMinutes}</Text>
            </View>
            <Text style={[styles.goalLabel, { color: theme.secondary }]}>דקות</Text>
          </View>
        </View>
      </View>

      {/* Streak */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <View style={styles.streakRow}>
          <View style={styles.streakItem}>
            <Text style={[styles.streakValue, { color: theme.accent }]}>{stats.currentStreak}</Text>
            <Text style={[styles.streakLabel, { color: theme.secondary }]}>ימים ברצף</Text>
          </View>
          <View style={[styles.streakDivider, { backgroundColor: theme.border }]} />
          <View style={styles.streakItem}>
            <Text style={[styles.streakValue, { color: theme.accent }]}>{stats.longestStreak}</Text>
            <Text style={[styles.streakLabel, { color: theme.secondary }]}>שיא ברצף</Text>
          </View>
        </View>
      </View>

      {/* Overview Stats */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>סיכום כללי</Text>
        <View style={styles.statsGrid}>
          <StatBox
            label="ספרים בספרייה"
            value={`${books.length}`}
            theme={theme}
          />
          <StatBox
            label="ספרים שהושלמו"
            value={`${finishedBooks}`}
            theme={theme}
          />
          <StatBox
            label="בקריאה"
            value={`${readingBooks}`}
            theme={theme}
          />
          <StatBox
            label="סה\"כ עמודים"
            value={`${stats.totalPagesRead}`}
            theme={theme}
          />
          <StatBox
            label="זמן קריאה"
            value={formatReadingTime(stats.totalReadingTime)}
            theme={theme}
          />
          <StatBox
            label="ממוצע יומי"
            value={`${Math.round(stats.averagePagesPerDay)} עמ'`}
            theme={theme}
          />
        </View>
      </View>

      {/* Weekly Chart */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>7 ימים אחרונים</Text>
        <View style={styles.chartContainer}>
          {last7Days.map((day, index) => (
            <View key={day.date} style={styles.chartBar}>
              <View style={[styles.barFill, {
                backgroundColor: theme.accent,
                height: `${(day.pagesRead / maxPages) * 100}%`,
              }]} />
              <Text style={[styles.barLabel, { color: theme.secondary }]}>
                {new Date(day.date).toLocaleDateString('he-IL', { weekday: 'short' })}
              </Text>
            </View>
          ))}
          {last7Days.length === 0 && (
            <Text style={[styles.emptyChart, { color: theme.secondary }]}>
              אין נתונים עדיין
            </Text>
          )}
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const StatBox: React.FC<{ label: string; value: string; theme: any }> = ({ label, value, theme }) => (
  <View style={[statStyles.box, { backgroundColor: theme.background }]}>
    <Text style={[statStyles.value, { color: theme.accent }]}>{value}</Text>
    <Text style={[statStyles.label, { color: theme.secondary }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 44,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  backText: { fontSize: 15, fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  section: {
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  goalRow: { flexDirection: 'row', justifyContent: 'space-around' },
  goalItem: { alignItems: 'center' },
  goalCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalProgress: { position: 'absolute' },
  goalValue: { fontSize: 28, fontWeight: '800' },
  goalTarget: { fontSize: 12 },
  goalLabel: { fontSize: 14 },
  streakRow: { flexDirection: 'row', alignItems: 'center' },
  streakItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  streakDivider: { width: 1, height: 40 },
  streakValue: { fontSize: 36, fontWeight: '800' },
  streakLabel: { fontSize: 13, marginTop: 4 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 8,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  barFill: {
    width: 24,
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: { fontSize: 10, marginTop: 4 },
  emptyChart: { textAlign: 'center', width: '100%', paddingVertical: 40 },
});

const statStyles = StyleSheet.create({
  box: {
    width: (width - 72) / 3,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  value: { fontSize: 18, fontWeight: '800' },
  label: { fontSize: 10, marginTop: 4, textAlign: 'center' },
});
