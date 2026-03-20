import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
  type EasingFunction,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Card } from "@/src/components/ui/card";

type BottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  footer?: React.ReactNode;
  stickyHeaderIndices?: number[];
};

const easeOut: EasingFunction = (value) => 1 - (1 - value) * (1 - value);

export function BottomSheet({
  open,
  onOpenChange,
  children,
  title,
  footer,
  stickyHeaderIndices,
}: BottomSheetProps) {
  const translateY = useRef(new Animated.Value(32)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = useState(open);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const maxContentHeight = Math.min(height * 0.82, 720);
  const maxScrollHeight = footer
    ? Math.max(180, maxContentHeight - 148 - insets.bottom)
    : maxContentHeight;
  const closeThreshold = Math.min(140, height * 0.18);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          gestureState.dy > 8 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderMove: (_, gestureState) => {
          dragY.setValue(Math.max(0, gestureState.dy));
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > closeThreshold || gestureState.vy > 1.2) {
            dragY.setValue(0);
            onOpenChange(false);
            return;
          }

          Animated.spring(dragY, {
            toValue: 0,
            damping: 22,
            stiffness: 220,
            mass: 0.9,
            useNativeDriver: true,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(dragY, {
            toValue: 0,
            damping: 22,
            stiffness: 220,
            mass: 0.9,
            useNativeDriver: true,
          }).start();
        },
      }),
    [closeThreshold, dragY, onOpenChange],
  );

  useEffect(() => {
    if (open) {
      setVisible(true);
      dragY.setValue(0);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 20,
          stiffness: 220,
          mass: 0.9,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          easing: easeOut,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    dragY.setValue(0);
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 32,
        duration: 180,
        easing: easeOut,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        easing: easeOut,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setVisible(false);
      }
    });
  }, [dragY, opacity, open, translateY]);

  if (!visible) {
    return null;
  }

  return (
    <Modal
      animationType="none"
      onRequestClose={() => onOpenChange(false)}
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
      >
        <View className="flex-1 justify-end bg-transparent">
          <Pressable className="flex-1 bg-black/60" onPress={() => onOpenChange(false)} />
          <Animated.View
            style={{ opacity, transform: [{ translateY: Animated.add(translateY, dragY) }] }}
          >
            <Card
              className="rounded-b-none border-b-0 px-6 pt-4"
              style={{ maxHeight: height - 16 }}
            >
              <View className="mb-4 items-center gap-3" {...panResponder.panHandlers}>
                <View className="h-1.5 w-14 rounded-full bg-border" />
                {title ? (
                  <Text className="text-base font-semibold text-text">{title}</Text>
                ) : null}
              </View>
              <ScrollView
                automaticallyAdjustKeyboardInsets
                bounces={false}
                contentContainerStyle={{ paddingBottom: 12 }}
                contentInsetAdjustmentBehavior="never"
                keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
                keyboardShouldPersistTaps="handled"
                overScrollMode="never"
                showsVerticalScrollIndicator={false}
                stickyHeaderIndices={stickyHeaderIndices}
                style={{ maxHeight: maxScrollHeight }}
              >
                {children}
              </ScrollView>
              {footer ? (
                <View
                  className="mt-4 border-t border-border pt-4"
                  style={{ paddingBottom: Math.max(insets.bottom, 12) }}
                >
                  {footer}
                </View>
              ) : null}
            </Card>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
