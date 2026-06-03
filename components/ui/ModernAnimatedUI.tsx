import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  Easing
} from 'react-native-reanimated';
import ModernBackground from './ModernBackground';

const { width, height } = Dimensions.get('window');

const COLORS = {
  blue: '#3B82F6',
  red: '#EF4444',
  yellow: '#F59E0B',
  white: '#FFFFFF',
  black: '#000000',
};

const AnimatedShape = ({ color, size, delay, style }: any) => {
  const rotation = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 5000 + delay, easing: Easing.linear }),
      -1,
      false
    );
    translateY.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 2000 + delay, easing: Easing.inOut(Easing.quad) }),
        withTiming(20, { duration: 2000 + delay, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { translateY: translateY.value },
      { scale: scale.value }
    ],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(1.5),
      withSpring(1)
    );
  };

  return (
    <TouchableOpacity activeOpacity={1} onPress={handlePress}>
      <Animated.View
        style={[
          styles.shape,
          { backgroundColor: color, width: size, height: size },
          style,
          animatedStyle
        ]}
      />
    </TouchableOpacity>
  );
};

export default function ModernAnimatedUI() {
  const opacity = useSharedValue(0);
  const textScale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 1000 });
    textScale.value = withSpring(1);
  }, []);

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: textScale.value }],
  }));

  return (
    <View style={styles.container}>
      <ModernBackground />

      {/* Center Content */}
      <Animated.View style={[styles.content, animatedTextStyle]}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>MODERN UI</Text>
        </View>
        <Text style={styles.title}>
          <Text style={{ color: COLORS.blue }}>Bold</Text>.
          <Text style={{ color: COLORS.red }}> Dynamic</Text>.
          <Text style={{ color: COLORS.yellow }}> Vibrant</Text>.
        </Text>
        <Text style={styles.subtitle}>
          Interactive animations powered by Reanimated. Tap the shapes to interact.
        </Text>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Explore Concept</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Modern Lines */}
      <View style={[styles.line, { top: height * 0.4, backgroundColor: COLORS.blue }]} />
      <View style={[styles.line, { top: height * 0.45, right: 0, width: '40%', backgroundColor: COLORS.red }]} />
      <View style={[styles.line, { bottom: height * 0.2, backgroundColor: COLORS.yellow }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 500,
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  shape: {
    position: 'absolute',
    opacity: 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
    zIndex: 10,
  },
  badge: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    color: COLORS.black,
    fontWeight: '900',
    fontSize: 10,
    letterSpacing: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: 16,
    color: COLORS.white,
  },
  subtitle: {
    color: '#999',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 32,
  },
  button: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 40,
  },
  buttonText: {
    color: COLORS.black,
    fontWeight: '800',
    fontSize: 16,
  },
  line: {
    position: 'absolute',
    height: 2,
    width: '60%',
    opacity: 0.3,
  }
});
