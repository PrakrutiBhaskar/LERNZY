import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useTheme } from '@/theme/theme';
import { AppText } from './AppText';
import { X, ZoomIn } from 'lucide-react-native';
import { Card } from './Card';

export interface DiagramViewerProps {
  source: string | number; // Local asset index or URI string
  description: string; // Explanatory text for screen-readers
  caption?: string; // Inline visible caption
}

/**
 * Child-friendly zoomable educational diagram viewer.
 * Uses high-performance expo-image for cached rendering and presents
 * a fullscreen zoomed overlay for inspecting fine details.
 */
export const DiagramViewer: React.FC<DiagramViewerProps> = ({
  source,
  description,
  caption,
}) => {
  const { colors, spacing, radius } = useTheme();
  
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <Card style={styles.card}>
      {/* Small Main Diagram Container */}
      <Pressable
        onPress={() => setModalVisible(true)}
        accessible={true}
        accessibilityRole="image"
        accessibilityLabel={`Diagram: ${description}`}
        accessibilityHint="Double tap to open full screen diagram viewer"
        style={styles.pressableArea}
      >
        <Image
          source={source}
          style={[styles.diagramImage, { borderRadius: radius.md }]}
          contentFit="contain"
          transition={100}
        />
        
        {/* Floating Zoom Action Badge */}
        <View style={[styles.zoomBadge, { backgroundColor: colors.surfaceAlt }]}>
          <ZoomIn size={18} color={colors.primary} />
        </View>
      </Pressable>

      {/* Caption footer */}
      {caption && (
        <AppText variant="caption" color={colors.textSecondary} style={styles.captionText}>
          {caption}
        </AppText>
      )}

      {/* Full Screen View Modal */}
      <Modal
        visible={modalVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.bg }]}>
          {/* Header Close Row */}
          <View style={styles.modalHeader}>
            <AppText variant="heading2" color={colors.textPrimary}>
              {caption || 'Diagram View'}
            </AppText>
            <Pressable
              onPress={() => setModalVisible(false)}
              style={({ pressed }) => [
                styles.closeButton,
                { backgroundColor: colors.surfaceAlt },
                pressed && { opacity: 0.7 },
              ]}
            >
              <X size={20} color={colors.textPrimary} />
            </Pressable>
          </View>

          {/* Large Image Canvas */}
          <View style={styles.modalCanvas}>
            <Image
              source={source}
              style={styles.fullscreenImage}
              contentFit="contain"
            />
          </View>

          {/* Description overlay */}
          <View style={[styles.descContainer, { backgroundColor: colors.surface, padding: spacing.space5 }]}>
            <AppText variant="bodyLg" style={styles.descTitle}>
              How it works:
            </AppText>
            <AppText variant="body" color={colors.textSecondary}>
              {description}
            </AppText>
          </View>
        </SafeAreaView>
      </Modal>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    overflow: 'hidden',
  },
  pressableArea: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  diagramImage: {
    width: '100%',
    height: '100%',
  },
  zoomBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionText: {
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCanvas: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
  descContainer: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  descTitle: {
    fontWeight: '700',
    marginBottom: 6,
  },
});
