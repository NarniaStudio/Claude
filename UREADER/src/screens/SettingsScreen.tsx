import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  setDefaultView, setSortBy, setSortOrder, setDailyGoal,
  toggleSync, resetReaderSettings, resetAppSettings,
} from '../store/settingsSlice';
import { useSync } from '../hooks/useSync';
import { getTheme } from '../theme';
import { storageService } from '../services/storageService';
import { APP_VERSION } from '../utils/constants';

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const appSettings = useSelector((state: RootState) => state.settings.app);
  const readerSettings = useSelector((state: RootState) => state.settings.reader);
  const theme = getTheme(readerSettings.theme);
  const { isLoggedIn, signIn, signUp, signOut, performSync, lastSyncAt, isSyncing } = useSync();

  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('שגיאה', 'נא למלא אימייל וסיסמה');
      return;
    }
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      setShowLogin(false);
      Alert.alert('הצלחה', 'התחברת בהצלחה!');
    } catch (error: any) {
      Alert.alert('שגיאה', error.message);
    }
  };

  const handleExport = async () => {
    try {
      const data = await storageService.exportData();
      Alert.alert('ייצוא', 'הנתונים יוצאו בהצלחה');
    } catch (error) {
      Alert.alert('שגיאה', 'לא ניתן לייצא נתונים');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'איפוס הגדרות',
      'האם לאפס את כל ההגדרות לברירת המחדל?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'איפוס',
          style: 'destructive',
          onPress: () => {
            dispatch(resetReaderSettings());
            dispatch(resetAppSettings());
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backText, { color: theme.accent }]}>{'◀ חזרה'}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>הגדרות</Text>
      </View>

      {/* Sync Section */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>סנכרון</Text>

        {isLoggedIn ? (
          <>
            <SettingRow
              label="סנכרון פעיל"
              theme={theme}
              right={
                <Switch
                  value={appSettings.syncEnabled}
                  onValueChange={() => dispatch(toggleSync())}
                  trackColor={{ true: theme.accent }}
                />
              }
            />
            <SettingRow
              label="סנכרון ב-WiFi בלבד"
              theme={theme}
              right={
                <Switch
                  value={appSettings.syncWifiOnly}
                  trackColor={{ true: theme.accent }}
                />
              }
            />
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: theme.accent }]}
              onPress={performSync}
              disabled={isSyncing}
            >
              <Text style={[styles.actionBtnText, { color: theme.accent }]}>
                {isSyncing ? 'מסנכרן...' : 'סנכרן עכשיו'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: '#e53935' }]}
              onPress={async () => {
                await signOut();
                Alert.alert('התנתקת', 'התנתקת בהצלחה');
              }}
            >
              <Text style={[styles.actionBtnText, { color: '#e53935' }]}>התנתק</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={[styles.syncDesc, { color: theme.secondary }]}>
              התחבר כדי לסנכרן את הספרים, הסימניות וההתקדמות בין מכשירים
            </Text>
            {showLogin ? (
              <View style={styles.loginForm}>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                  placeholder="אימייל"
                  placeholderTextColor={theme.secondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  textAlign="right"
                />
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                  placeholder="סיסמה"
                  placeholderTextColor={theme.secondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  textAlign="right"
                />
                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: theme.accent }]}
                  onPress={handleAuth}
                >
                  <Text style={styles.primaryBtnText}>
                    {isSignUp ? 'הרשמה' : 'התחברות'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                  <Text style={[styles.switchAuth, { color: theme.accent }]}>
                    {isSignUp ? 'כבר יש לך חשבון? התחבר' : 'אין לך חשבון? הירשם'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.authButtons}>
                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: theme.accent }]}
                  onPress={() => setShowLogin(true)}
                >
                  <Text style={styles.primaryBtnText}>התחבר / הירשם</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: theme.border }]}
                  onPress={() => signIn()}
                >
                  <Text style={[styles.actionBtnText, { color: theme.text }]}>
                    המשך כאורח
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>

      {/* Library Settings */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>ספרייה</Text>
        <SettingRow
          label="תצוגה"
          value={appSettings.defaultView === 'grid' ? 'רשת' : 'רשימה'}
          theme={theme}
          onPress={() => dispatch(setDefaultView(appSettings.defaultView === 'grid' ? 'list' : 'grid'))}
        />
        <SettingRow
          label="מיון לפי"
          value={
            { title: 'שם', author: 'מחבר', lastRead: 'נקרא לאחרונה', added: 'תאריך הוספה', progress: 'התקדמות' }[appSettings.sortBy]
          }
          theme={theme}
          onPress={() => {
            const options: Array<typeof appSettings.sortBy> = ['lastRead', 'title', 'author', 'added', 'progress'];
            const current = options.indexOf(appSettings.sortBy);
            const next = options[(current + 1) % options.length];
            dispatch(setSortBy(next));
          }}
        />
      </View>

      {/* Reading Goals */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>יעדי קריאה</Text>
        <SettingRow
          label="יעד עמודים יומי"
          value={`${appSettings.dailyGoalPages} עמודים`}
          theme={theme}
          onPress={() => {
            const goals = [10, 20, 30, 50, 100];
            const current = goals.indexOf(appSettings.dailyGoalPages);
            const next = goals[(current + 1) % goals.length];
            dispatch(setDailyGoal({ pages: next }));
          }}
        />
        <SettingRow
          label="יעד זמן יומי"
          value={`${appSettings.dailyGoalMinutes} דקות`}
          theme={theme}
          onPress={() => {
            const goals = [15, 30, 45, 60, 90, 120];
            const current = goals.indexOf(appSettings.dailyGoalMinutes);
            const next = goals[(current + 1) % goals.length];
            dispatch(setDailyGoal({ minutes: next }));
          }}
        />
        <SettingRow
          label="תזכורת קריאה"
          theme={theme}
          right={
            <Switch
              value={appSettings.readingReminder}
              trackColor={{ true: theme.accent }}
            />
          }
        />
      </View>

      {/* Data */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>נתונים</Text>
        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: theme.border }]}
          onPress={handleExport}
        >
          <Text style={[styles.actionBtnText, { color: theme.text }]}>ייצוא נתונים</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: '#e53935' }]}
          onPress={handleReset}
        >
          <Text style={[styles.actionBtnText, { color: '#e53935' }]}>איפוס הגדרות</Text>
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>אודות</Text>
        <SettingRow label="גרסה" value={APP_VERSION} theme={theme} />
        <SettingRow label="UREADER" value="Book Reading App" theme={theme} />
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const SettingRow: React.FC<{
  label: string;
  value?: string;
  theme: any;
  onPress?: () => void;
  right?: React.ReactNode;
}> = ({ label, value, theme, onPress, right }) => (
  <TouchableOpacity
    style={[settingStyles.row, { borderBottomColor: theme.border }]}
    onPress={onPress}
    disabled={!onPress && !right}
  >
    <Text style={[settingStyles.label, { color: theme.text }]}>{label}</Text>
    {right || (
      <Text style={[settingStyles.value, { color: theme.secondary }]}>{value}</Text>
    )}
  </TouchableOpacity>
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
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  syncDesc: { fontSize: 13, marginBottom: 16, lineHeight: 20, textAlign: 'right' },
  loginForm: { gap: 10 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  authButtons: { gap: 10 },
  primaryBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  actionBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    marginTop: 8,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  switchAuth: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
  },
});

const settingStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  label: { fontSize: 15 },
  value: { fontSize: 14 },
});
