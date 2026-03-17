import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
  type EasingFunction,
} from "react-native";

import { Card } from "@/src/components/ui/card";

type BottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  footer?: React.ReactNode;
};

const easeOut: EasingFunction = (value) => 1 - (1 - value) * (1 - value);

export function BottomSheet({
  open,
  onOpenChange,
  children,
  title,
  footer,
}: BottomSheetProps) {
  const translateY = useRef(new Animated.Value(32)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = useState(open);
  const { height } = useWindowDimensions();
  const maxContentHeight = Math.min(height * 0.78, 680);
  const maxScrollHeight = footer
    ? Math.max(180, maxContentHeight - 148)
    : maxContentHeight;

  useEffect(() => {
    if (open) {
      setVisible(true);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          easing: easeOut,
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
  }, [opacity, open, translateY]);

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
      <View className="flex-1 justify-end bg-transparent">
        <Pressable className="flex-1 bg-black/60" onPress={() => onOpenChange(false)} />
        <Animated.View style={{ opacity, transform: [{ translateY }] }}>
          <Card
            className="rounded-b-none border-b-0 px-6 pb-10 pt-4"
            style={{ maxHeight: height - 16 }}
          >
            <View className="mb-4 items-center gap-3">
              <View className="h-1.5 w-14 rounded-full bg-border" />
              {title ? (
                <Text className="text-base font-semibold text-text">{title}</Text>
              ) : null}
            </View>
            <ScrollView
              bounces={false}
              contentContainerStyle={{ paddingBottom: 4 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: maxScrollHeight }}
            >
              {children}
            </ScrollView>
            {footer ? (
              <View className="mt-4 border-t border-border pt-4">{footer}</View>
            ) : null}
          </Card>
        </Animated.View>
      </View>
    </Modal>
  );
}
