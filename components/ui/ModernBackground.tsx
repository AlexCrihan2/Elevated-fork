import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const COLORS = {
  blue: '#3B82F6',
  red: '#EF4444',
  yellow: '#F59E0B',
  white: '#FFFFFF',
  black: '#000000',
};

const BackgroundShape = ({ color, size, delay, initialTop, initialLeft, rotateDir = 1 }: any) => {
  const rotation = useSharedValue(0);
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360 * rotateDir, { duration: 15000 + delay, easing: Easing.linear }),
      -1,
      false
    );
    translateY.value = withRepeat(
      withSequence(
        withTiming(-30, { duration: 4000 + delay, easing: Easing.inOut(Easing.quad) }),
        withTiming(30, { duration: 4000 + delay, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
    translateX.value = withRepeat(
      withSequence(
        withTiming(20, { duration: 5000 + delay, easing: Easing.inOut(Easing.quad) }),
        withTiming(-20, { duration: 5000 + delay, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { translateY: translateY.value },
      { translateX: translateX.value }
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.shape,
        {
          backgroundColor: color,
          width: size,
          height: size,
          top: initialTop,
          left: initialLeft,
          borderRadius: size * 0.3
        },
        animatedStyle
      ]}
    />
  );
};

export default function ModernBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Subtle floating background elements */}
      <BackgroundShape color={COLORS.blue} size={150} delay={0} initialTop={height * 0.1} initialLeft={-50} rotateDir={1} />
      <BackgroundShape color={COLORS.red} size={100} delay={1000} initialTop={height * 0.4} initialLeft={width - 50} rotateDir={-1} />
      <BackgroundShape color={COLORS.yellow} size={120} delay={2000} initialTop={height * 0.7} initialLeft={20} rotateDir={1} />
      <BackgroundShape color={COLORS.white} size={60} delay={3000} initialTop={height * 0.25} initialLeft={width * 0.7} rotateDir={-1} />

      {/* Modern Accent Lines */}
      <View style={[styles.line, { top: height * 0.3, backgroundColor: COLORS.blue, width: '40%' }]} />
      <View style={[styles.line, { top: height * 0.6, right: 0, backgroundColor: COLORS.red, width: '30%' }]} />
      <View style={[styles.line, { bottom: height * 0.15, backgroundColor: COLORS.yellow, width: '50%' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  shape: {
    position: 'absolute',
    opacity: 0.08, // Very subtle to not interfere with content
    zIndex: -1,
  },
  line: {
    position: 'absolute',
    height: 1,
    opacity: 0.1,
    zIndex: -1,
  }
});
