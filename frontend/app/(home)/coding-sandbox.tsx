import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { CheckCircle2, Code2, Play, RotateCcw, Terminal } from 'lucide-react-native';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTheme } from '@/theme/theme';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ScreenContainer } from '../../components/ScreenContainer';

interface Challenge {
  id: string;
  title: string;
  prompt: string;
  starterCode: string;
  check: (output: string) => boolean;
}

const CHALLENGES: Challenge[] = [
  {
    id: 'hello-world',
    title: 'Hello World',
    prompt: 'Print Hello, World! to the console.',
    starterCode: 'console.log("Hello, World!");',
    check: (output) => output.trim() === 'Hello, World!',
  },
  {
    id: 'sum-two',
    title: 'Add Numbers',
    prompt: 'Create a function that adds two numbers, then print add(2, 3).',
    starterCode: [
      'function add(a, b) {',
      '  return a + b;',
      '}',
      '',
      'console.log(add(2, 3));',
    ].join('\n'),
    check: (output) => output.trim().endsWith('5'),
  },
  {
    id: 'loop-count',
    title: 'Loop Count',
    prompt: 'Use a loop to print 1, 2, and 3 on separate lines.',
    starterCode: [
      'for (let i = 1; i <= 3; i++) {',
      '  console.log(i);',
      '}',
    ].join('\n'),
    check: (output) => output.trim() === '1\n2\n3',
  },
];

function formatValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value === undefined) return 'undefined';
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function executeStudentCode(code: string): { output: string; error: string | null } {
  if (/(while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\))/i.test(code)) {
    return { output: '', error: 'Infinite loops are paused in this sandbox.' };
  }

  const logs: string[] = [];
  const sandboxConsole = {
    log: (...args: unknown[]) => {
      logs.push(args.map(formatValue).join(' '));
    },
  };

  try {
    const result = new Function('console', `"use strict";\n${code}`)(sandboxConsole);
    if (result !== undefined) logs.push(formatValue(result));
    return { output: logs.length > 0 ? logs.join('\n') : 'Done.', error: null };
  } catch (err: any) {
    return { output: logs.join('\n'), error: err?.message || String(err) };
  }
}

export default function CodingSandbox(): React.JSX.Element {
  const { language } = useLanguage();
  const { colors, spacing, radius } = useTheme();
  const [challengeId, setChallengeId] = useState(CHALLENGES[0].id);
  const selectedChallenge = useMemo(
    () => CHALLENGES.find((challenge) => challenge.id === challengeId) || CHALLENGES[0],
    [challengeId]
  );
  const [code, setCode] = useState(selectedChallenge.starterCode);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const runCode = () => {
    const result = executeStudentCode(code);
    setOutput(result.output);
    setError(result.error);
    setFeedback(null);
  };

  const checkCode = () => {
    const result = executeStudentCode(code);
    const passed = !result.error && selectedChallenge.check(result.output);
    setOutput(result.output);
    setError(result.error);
    setFeedback(
      passed
        ? 'Challenge passed.'
        : 'Not yet. Run it again and compare the console output.'
    );
  };

  const resetCode = () => {
    setCode(selectedChallenge.starterCode);
    setOutput('');
    setError(null);
    setFeedback(null);
  };

  const selectChallenge = (challenge: Challenge) => {
    setChallengeId(challenge.id);
    setCode(challenge.starterCode);
    setOutput('');
    setError(null);
    setFeedback(null);
  };

  return (
    <ScreenContainer
      title={language === 'en' ? 'Coding Sandbox' : 'Coding Sandbox'}
      subtitle={selectedChallenge.prompt}
      showBackButton={true}
      scrollable={true}
      contentContainerStyle={[styles.container, { paddingBottom: spacing.space8 }]}
    >
      <View style={styles.challengeRow}>
        {CHALLENGES.map((challenge) => {
          const active = challenge.id === selectedChallenge.id;
          return (
            <Pressable
              key={challenge.id}
              onPress={() => selectChallenge(challenge)}
              style={[
                styles.challengeChip,
                {
                  backgroundColor: active ? colors.primary : colors.surfaceAlt,
                },
              ]}
            >
              <AppText
                variant="caption"
                color={active ? colors.textOnPrimary : colors.textPrimary}
                style={styles.challengeChipText}
              >
                {challenge.title}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <Card style={styles.editorCard}>
        <View style={styles.panelHeader}>
          <View style={styles.panelTitle}>
            <Code2 size={18} color={colors.primary} />
            <AppText variant="heading2" style={styles.panelTitleText}>
              JavaScript
            </AppText>
          </View>
        </View>
        <TextInput
          value={code}
          onChangeText={setCode}
          multiline={true}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          textAlignVertical="top"
          style={[
            styles.editor,
            {
              backgroundColor: colors.bg,
              borderRadius: radius.md,
              color: colors.textPrimary,
            },
          ]}
          placeholder="console.log('Hello');"
          placeholderTextColor={colors.textDisabled}
        />
      </Card>

      <View style={styles.actionRow}>
        <Button
          title="Run"
          onPress={runCode}
          icon={<Play size={18} color={colors.textOnPrimary} fill={colors.textOnPrimary} />}
          style={styles.actionButton}
        />
        <Button
          variant="secondary"
          title="Check"
          onPress={checkCode}
          icon={<CheckCircle2 size={18} color={colors.primary} />}
          style={styles.actionButton}
        />
        <Button
          variant="ghost"
          title="Reset"
          onPress={resetCode}
          icon={<RotateCcw size={18} color={colors.textPrimary} />}
          style={styles.actionButton}
        />
      </View>

      <Card style={[styles.consoleCard, error && { backgroundColor: colors.errorSubtle }]}>
        <View style={styles.panelTitle}>
          <Terminal size={18} color={error ? colors.error : colors.success} />
          <AppText variant="heading2" style={styles.panelTitleText}>
            Console
          </AppText>
        </View>
        <View style={[styles.consoleBox, { backgroundColor: colors.bg, borderRadius: radius.md }]}>
          <AppText
            variant="body"
            color={error ? colors.error : colors.textPrimary}
            style={styles.consoleText}
          >
            {error || output || 'Ready.'}
          </AppText>
        </View>
        {feedback ? (
          <AppText
            variant="body"
            color={feedback === 'Challenge passed.' ? colors.success : colors.warning}
            style={styles.feedbackText}
          >
            {feedback}
          </AppText>
        ) : null}
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  challengeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  challengeChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
    justifyContent: 'center',
  },
  challengeChipText: {
    fontWeight: '700',
  },
  editorCard: {
    padding: 14,
    gap: 12,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  panelTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  panelTitleText: {
    fontWeight: '700',
  },
  editor: {
    minHeight: 260,
    padding: 14,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'monospace',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 10,
  },
  consoleCard: {
    padding: 14,
    gap: 12,
  },
  consoleBox: {
    minHeight: 110,
    padding: 14,
    justifyContent: 'flex-start',
  },
  consoleText: {
    fontFamily: 'monospace',
    lineHeight: 22,
  },
  feedbackText: {
    fontWeight: '700',
  },
});
