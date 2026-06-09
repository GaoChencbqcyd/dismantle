import React, { useCallback, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useTheme } from '../../theme';
import { AppText, Button, Card, ModalSheet } from '../../components';
import { useSessionStore } from '../../stores/sessionStore';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CategoryType } from '../../types/session';

type DismantleStackParamList = {
  Record: undefined;
  Classify: undefined;
};

export function ClassifyScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<DismantleStackParamList>>();
  const currentSession = useSessionStore(function (s) { return s.currentSession; });
  const setFactorCategory = useSessionStore(function (s) { return s.setFactorCategory; });
  const removeFactor = useSessionStore(function (s) { return s.removeFactor; });
  const addFactor = useSessionStore(function (s) { return s.addFactor; });
  const goToStep = useSessionStore(function (s) { return s.goToStep; });
  const saveDraft = useSessionStore(function (s) { return s.saveDraft; });

  const factors = currentSession?.factors || [];

  const [showTip, setShowTip] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFactorText, setNewFactorText] = useState('');
  const [editingFactorId, setEditingFactorId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const controllableCount = factors.filter(function (f) { return f.category === 'controllable'; }).length;
  const uncontrollableCount = factors.filter(function (f) { return f.category === 'uncontrollable'; }).length;
  const unclassifiedCount = factors.filter(function (f) { return f.category === 'unclassified'; }).length;

  const handleClassify = useCallback(function (id: string, category: CategoryType) {
    setFactorCategory(id, category);
  }, [setFactorCategory]);

  const handleDelete = useCallback(function (id: string) {
    Alert.alert(
      '\u5220\u9664\u56E0\u7D20',
      '\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u56E0\u7D20\u5417\uFF1F',
      [
        { text: '\u53D6\u6D88', style: 'cancel' },
        {
          text: '\u5220\u9664',
          style: 'destructive',
          onPress: function () { removeFactor(id); },
        },
      ],
    );
  }, [removeFactor]);

  const handleStartEdit = useCallback(function (id: string, text: string) {
    setEditingFactorId(id);
    setEditingText(text);
  }, []);

  const handleFinishEdit = useCallback(function () {
    setEditingFactorId(null);
    setEditingText('');
  }, []);

  const handleAddFactor = useCallback(function () {
    if (newFactorText.trim().length === 0) {
      Alert.alert('\u63D0\u793A', '\u8BF7\u8F93\u5165\u56E0\u7D20\u5185\u5BB9');
      return;
    }
    addFactor(newFactorText.trim());
    setNewFactorText('');
    setShowAddModal(false);
  }, [newFactorText, addFactor]);

  const handleNext = useCallback(function () {
    const unclassified = factors.filter(function (f) { return f.category === 'unclassified'; });
    if (unclassified.length > 0) {
      Alert.alert(
        '\u63D0\u793A',
        '\u8FD8\u6709 ' + unclassified.length + ' \u4E2A\u56E0\u7D20\u672A\u5206\u7C7B\uFF0C\u786E\u5B9A\u7EE7\u7EED\u5417\uFF1F',
        [
          { text: '\u7EE7\u7EED\u5206\u7C7B', style: 'cancel' },
          {
            text: '\u786E\u5B9A\u7EE7\u7EAD',
            onPress: function () {
              goToStep('reframe');
              saveDraft();
              Alert.alert(
                '\u63D0\u793A',
                '\u91CD\u65B0\u6846\u67B6\u6A21\u5757\u5C06\u5728 Sprint 3 \u4E2D\u5B9E\u73B0',
              );
            },
          },
        ],
      );
    } else {
      goToStep('reframe');
      saveDraft();
      Alert.alert(
        '\u63D0\u793A',
        '\u91CD\u65B0\u6846\u67B6\u6A21\u5757\u5C06\u5728 Sprint 3 \u4E2D\u5B9E\u73B0',
      );
    }
  }, [factors, goToStep, saveDraft]);

  const handleSaveDraft = useCallback(function () {
    saveDraft();
    Alert.alert('\u63D0\u793A', '\u8349\u7A3F\u5DF2\u4FDD\u5B58');
  }, [saveDraft]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AppText variant="heading" style={{ marginBottom: 4 }}>
          {'\u6B65\u9AA4 2\uFF1A\u5206\u7C7B'}
        </AppText>
        <AppText variant="small" muted style={{ marginBottom: 20 }}>
          {'\u533A\u5206\u53EF\u63A7\u4E0E\u4E0D\u53EF\u63A7\u2014\u2014\u65AF\u591A\u66F1\u63A7\u5236\u4E8C\u5206\u6CD5'}
        </AppText>

        {/* Dismissible Guide Tip */}
        {showTip && (
          <Card padding={16} style={{ marginBottom: 20, backgroundColor: colors.bgCard }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <AppText variant="caption" bold style={{ marginBottom: 4 }}>
                  {'\uD83D\uDCA1 \u65AF\u591A\u66F1\u63A7\u5236\u4E8C\u5206\u6CD5'}
                </AppText>
                <AppText variant="caption" muted style={{ lineHeight: 18 }}>
                  {'\u53EF\u63A7\u5236\u7684\u4E8B\u60C5\u2014\u2014\u53BB\u505A\u3002\u4E0D\u53EF\u63A7\u5236\u7684\u4E8B\u60C5\u2014\u2014\u63A5\u53D7\u3002\u667A\u6167\u5C31\u662F\u77E5\u9053\u4E24\u8005\u7684\u533A\u522B\u3002'}
                </AppText>
              </View>
              <TouchableOpacity onPress={function () { setShowTip(false); }}>
                <AppText variant="caption" color={colors.textTertiary}>
                  {'\u2715'}
                </AppText>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Summary Bar */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          <View style={{ flex: 1, backgroundColor: colors.success + '20', borderRadius: 10, padding: 12, alignItems: 'center' }}>
            <AppText variant="subtitle" bold color={colors.success}>
              {controllableCount}
            </AppText>
            <AppText variant="caption" muted>{'\u53EF\u63A7'}</AppText>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.warning + '20', borderRadius: 10, padding: 12, alignItems: 'center' }}>
            <AppText variant="subtitle" bold color={colors.warning}>
              {uncontrollableCount}
            </AppText>
            <AppText variant="caption" muted>{'\u4E0D\u53EF\u63A7'}</AppText>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.borderLight + '60', borderRadius: 10, padding: 12, alignItems: 'center' }}>
            <AppText variant="subtitle" bold color={colors.textTertiary}>
              {unclassifiedCount}
            </AppText>
            <AppText variant="caption" muted>{'\u672A\u5206\u7C7B'}</AppText>
          </View>
        </View>

        {/* Factors List */}
        {factors.length > 0 ? (
          factors.map(function (factor) {
            const isEditing = editingFactorId === factor.id;
            const isControllable = factor.category === 'controllable';
            const isUncontrollable = factor.category === 'uncontrollable';

            return (
              <Card key={factor.id} padding={16} style={{ marginBottom: 10 }}>
                <View>
                  {isEditing ? (
                    <TextInput
                      value={editingText}
                      onChangeText={setEditingText}
                      onBlur={handleFinishEdit}
                      autoFocus
                      style={{
                        fontSize: 15,
                        lineHeight: 22,
                        color: colors.textPrimary,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.accent,
                        paddingBottom: 4,
                        marginBottom: 10,
                      }}
                    />
                  ) : (
                    <TouchableOpacity onPress={function () { handleStartEdit(factor.id, factor.text); }}>
                      <AppText variant="body" style={{ lineHeight: 22, marginBottom: 10 }}>
                        {factor.text}
                      </AppText>
                    </TouchableOpacity>
                  )}

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        onPress={function () { handleClassify(factor.id, 'controllable'); }}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 8,
                          backgroundColor: isControllable ? colors.success : colors.borderLight,
                        }}
                      >
                        <AppText variant="caption" bold color={isControllable ? '#FFFFFF' : colors.textSecondary}>
                          {'\u2705 \u53EF\u63A7'}
                        </AppText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={function () { handleClassify(factor.id, 'uncontrollable'); }}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 8,
                          backgroundColor: isUncontrollable ? colors.warning : colors.borderLight,
                        }}
                      >
                        <AppText variant="caption" bold color={isUncontrollable ? '#FFFFFF' : colors.textSecondary}>
                          {'\u2601\uFE0F \u4E0D\u53EF\u63A7'}
                        </AppText>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={function () { handleDelete(factor.id); }}>
                      <AppText variant="caption" color={colors.textTertiary}>
                        {'\uD83D\uDDD1'}
                      </AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            );
          })
        ) : (
          <Card padding={24} style={{ marginBottom: 10 }}>
            <View style={{ alignItems: 'center' }}>
              <AppText variant="body" muted center>
                {'\u6682\u65E0\u56E0\u7D20\uFF0C\u70B9\u51FB\u4E0B\u65B9\u6309\u94AE\u6DFB\u52A0'}
              </AppText>
            </View>
          </Card>
        )}

        {/* Add Factor Button */}
        <TouchableOpacity
          onPress={function () { setShowAddModal(true); }}
          style={{
            borderWidth: 1,
            borderColor: colors.borderLight,
            borderStyle: 'dashed',
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <AppText variant="body" muted>
            {'+ \u6DFB\u52A0\u56E0\u7D20'}
          </AppText>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={{ gap: 10, marginBottom: 20 }}>
          <Button
            title={'\u4E0B\u4E00\u6B65'}
            variant="primary"
            size="lg"
            block
            onPress={handleNext}
          />
          <Button
            title={'\u4FDD\u5B58\u8349\u7A3F'}
            variant="ghost"
            size="lg"
            block
            onPress={handleSaveDraft}
          />
        </View>
      </ScrollView>

      {/* Add Factor Modal */}
      <ModalSheet visible={showAddModal} onClose={function () { setShowAddModal(false); }}>
        <View style={{ padding: 20 }}>
          <AppText variant="subtitle" bold style={{ marginBottom: 16 }}>
            {'\u6DFB\u52A0\u56E0\u7D20'}
          </AppText>
          <TextInput
            placeholder={'\u8F93\u5165\u56E0\u7D20\u5185\u5BB9\u2026'}
            placeholderTextColor={colors.textTertiary}
            value={newFactorText}
            onChangeText={setNewFactorText}
            multiline
            style={{
              borderWidth: 1,
              borderColor: colors.borderLight,
              borderRadius: 10,
              padding: 14,
              fontSize: 15,
              lineHeight: 22,
              color: colors.textPrimary,
              minHeight: 80,
              textAlignVertical: 'top',
              marginBottom: 16,
            }}
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={function () { setShowAddModal(false); setNewFactorText(''); }}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: colors.borderLight,
                alignItems: 'center',
              }}
            >
              <AppText variant="body" bold>{'\u53D6\u6D88'}</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAddFactor}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: colors.accent,
                alignItems: 'center',
              }}
            >
              <AppText variant="body" bold color="#FFFFFF">{'\u6DFB\u52A0'}</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </ModalSheet>
    </View>
  );
}
