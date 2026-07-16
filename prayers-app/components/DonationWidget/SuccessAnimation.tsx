import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { useDonationStore } from '@/store/donationStore';
import { THEME } from '@/constants/theme';
interface SuccessAnimationProps {
  onClose: () => void;
}

export function SuccessAnimation({ onClose }: SuccessAnimationProps) {
  const { t } = useTranslation();
  const { reset } = useDonationStore();

  const scale = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    scale.value = withSpring(1);
    const timer = setTimeout(() => {
      onClose();
    }, 2500);
    return () => {
      clearTimeout(timer);
      reset();
    };
  }, []);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Animated.View style={animatedStyle}>
        <Text style={{ fontSize: 48, color: THEME.teal }}>✓</Text>
      </Animated.View>
      <Text style={{ fontSize: 18, marginTop: 12, color: THEME.ink }}>
        {t('prayer.prayer_sent')}
      </Text>
    </View>
  );
}
