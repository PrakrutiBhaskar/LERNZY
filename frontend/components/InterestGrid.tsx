import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Icons from 'lucide-react-native';
import { useTheme } from '@/theme/theme';
import { AppText } from './AppText';
import { Card } from './Card';

export interface InterestItem {
  id: string;
  label: string;
  iconName: string; // Lucide icon name (e.g. 'Rocket', 'Bot', 'Leaf')
}

export interface InterestGridProps {
  items: InterestItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

/**
 * Child-friendly selection grid for onboarding interests.
 * Renders large clickable cards (minimum touch height 80px) and displays
 * selectable Lucide vector icons dynamically.
 */
export const InterestGrid: React.FC<InterestGridProps> = ({
  items,
  selectedIds,
  onToggle,
}) => {
  const { colors, spacing } = useTheme();

  return (
    <View style={styles.grid}>
      {items.map((item) => {
        const isSelected = selectedIds.includes(item.id);
        
        // Resolve Lucide icon component dynamically from library
        const IconComponent = (Icons as any)[item.iconName] || Icons.HelpCircle;

        return (
          <View key={item.id} style={styles.itemWrapper}>
            <Pressable
              onPress={() => onToggle(item.id)}
              accessible={true}
              accessibilityRole="checkbox"
              accessibilityLabel={item.label}
              accessibilityState={{ checked: isSelected }}
              style={styles.pressable}
            >
              <Card
                active={isSelected}
                style={[
                  styles.card,
                  {
                    padding: spacing.space4,
                    backgroundColor: isSelected ? colors.primarySubtle : colors.tertiaryFixed,
                  },
                ]}
              >
                <IconComponent
                  size={38}
                  strokeWidth={2.4}
                  color={isSelected ? colors.primary : colors.tertiary}
                  style={styles.icon}
                />
                <AppText
                  variant="body"
                  color={isSelected ? colors.primary : colors.textPrimary}
                  style={styles.label}
                >
                  {item.label}
                </AppText>
              </Card>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  itemWrapper: {
    width: '50%',
    padding: 6,
  },
  pressable: {
    width: '100%',
  },
  card: {
    width: '100%',
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    overflow: 'hidden',
  },
  icon: {
    marginBottom: 4,
  },
  label: {
    fontWeight: '700',
    textAlign: 'center',
  },
});
