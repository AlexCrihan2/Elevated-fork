import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar, Animated } from 'react-native';
import Reanimated, {
  useSharedValue, useAnimatedStyle, withTiming, withSequence,
  withDelay, withSpring, runOnJS, Easing, interpolate, withRepeat,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const NUM_STARS = 80;
const STAR_DATA = Array.from({ length: NUM_STARS }, (_, i) => ({
  id: i,
  x: Math.random() * width,
  y: Math.random() * (height * 0.75),
  size: Math.random() * 3 + 1,
  opacity: Math.random() * 0.7 + 0.3,
  delay: Math.random() * 3000,
  duration: Math.random() * 2000 + 1500,
}));

interface StarProps {
  x: number;
  y: number;
  size: number;
  opacity: number;
  delay: number;
  duration: number;
}

function Star({ x, y, size, opacity, delay, duration }: StarProps) {
  const anim = useSharedValue(opacity);
  useEffect(() => {
    anim.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(opacity * 0.2, { duration, easing: Easing.inOut(Easing.sin) }),
        withTiming(opacity, { duration, easing: Easing.inOut(Easing.sin) }),
      ), -1
    ));
  }, []);
  const animStyle = useAnimatedStyle(() => ({ opacity: anim.value }));
  return (
    <Reanimated.View
      style={[styles.star, animStyle, { left: x, top: y, width: size, height: size, borderRadius: size / 2 }]}
    />
  );
}

// Shooting star
function ShootingStar({ delay }: { delay: number }) {
  const x = useSharedValue(-60);
  const y = useSharedValue(Math.random() * (height * 0.4));
  const opacity = useSharedValue(0);

  useEffect(() => {
    const animate = () => {
      const startY = Math.random() * (height * 0.4);
      y.value = startY;
      x.value = -60;
      opacity.value = withDelay(delay, withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 800 }),
      ));
      x.value = withDelay(delay, withTiming(width + 100, { duration: 1000, easing: Easing.out(Easing.quad) }));
    };
    animate();
    const interval = setInterval(animate, 4000 + delay);
    return () => clearInterval(interval);
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateX: x.value }, { translateY: y.value }, { rotate: '30deg' }] }));
  return <Reanimated.View style={[styles.shootingStar, style]} />;
}

// Moon crescent
function Moon() {
  const glow = useSharedValue(0.8);
  useEffect(() => {
    glow.value = withRepeat(
      withSequence(withTiming(1, { duration: 2000 }), withTiming(0.8, { duration: 2000 })),
      -1
    );
  }, []);
  const moonStyle = useAnimatedStyle(() => ({ opacity: glow.value }));
  return (
    <Reanimated.View style={[styles.moonContainer, moonStyle]}>
      <View style={styles.moon} />
      <View style={styles.moonCrescent} />
    </Reanimated.View>
  );
}

interface AnimatedIntroProps {
  onComplete: () => void;
}

export default function AnimatedIntro({ onComplete }: AnimatedIntroProps) {
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(40);
  const subtitleOpacity = useSharedValue(0);
  const backgroundOpacity = useSharedValue(1);
  const containerScale = useSharedValue(1);
  const progressWidth = useSharedValue(0);
  const progressOpacity = useSharedValue(0);
  const skyOpacity = useSharedValue(0);

  useEffect(() => {
    // Sky fade in
    skyOpacity.value = withTiming(1, { duration: 1000 });
    
    // Logo entrance
    logoScale.value = withDelay(600, withSpring(1, { damping: 12, stiffness: 100 }));
    logoOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));

    // Title
    titleOpacity.value = withDelay(1100, withTiming(1, { duration: 600 }));
    titleY.value = withDelay(1100, withSpring(0, { damping: 10, stiffness: 80 }));
    subtitleOpacity.value = withDelay(1500, withTiming(1, { duration: 600 }));

    // Progress bar
    progressOpacity.value = withDelay(2000, withTiming(1, { duration: 400 }));
    progressWidth.value = withDelay(2200, withTiming(1, { duration: 1600, easing: Easing.out(Easing.cubic) }));

    // Exit
    setTimeout(() => {
      containerScale.value = withTiming(1.05, { duration: 400, easing: Easing.in(Easing.quad) });
      backgroundOpacity.value = withTiming(0, { duration: 500, easing: Easing.in(Easing.quad) }, () => {
        runOnJS(onComplete)();
      });
    }, 4200);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));
  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value, transform: [{ translateY: titleY.value }] }));
  const subtitleStyle = useAnimatedStyle(() => ({ opacity: subtitleOpacity.value }));
  const bgStyle = useAnimatedStyle(() => ({ opacity: backgroundOpacity.value, transform: [{ scale: containerScale.value }] }));
  const progressContainerStyle = useAnimatedStyle(() => ({ opacity: progressOpacity.value }));
  const progressBarStyle = useAnimatedStyle(() => ({ width: `${progressWidth.value * 100}%` }));
  const skyStyle = useAnimatedStyle(() => ({ opacity: skyOpacity.value }));

  return (
    <Reanimated.View style={[styles.container, bgStyle]}>
      <StatusBar barStyle="light-content" backgroundColor="#050B1F" />
      
      {/* Night Sky Background */}
      <Reanimated.View style={[styles.skyBg, skyStyle]}>
        {/* Stars */}
        {STAR_DATA.map(s => (
          <Star key={s.id} x={s.x} y={s.y} size={s.size} opacity={s.opacity} delay={s.delay} duration={s.duration} />
        ))}
        
        {/* Shooting stars */}
        <ShootingStar delay={1500} />
        <ShootingStar delay={3200} />
        
        {/* Moon */}
        <Moon />

        {/* Nebula effects */}
        <View style={styles.nebula1} />
        <View style={styles.nebula2} />
        <View style={styles.nebula3} />

        {/* Horizon glow */}
        <View style={styles.horizon} />
      </Reanimated.View>

      {/* City silhouette */}
      <View style={styles.cityContainer}>
        <View style={styles.building1} />
        <View style={styles.building2} />
        <View style={styles.building3} />
        <View style={styles.building4} />
        <View style={styles.building5} />
        <View style={styles.building6} />
        <View style={styles.building7} />
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Logo */}
        <Reanimated.View style={[styles.logoContainer, logoStyle]}>
          <View style={styles.logoOuter}>
            <View style={styles.logoInner}>
              <MaterialIcons name="auto-awesome" size={56} color="#F9E784" />
            </View>
          </View>
          {/* Logo glow rings */}
          <View style={styles.glowRing1} />
          <View style={styles.glowRing2} />
        </Reanimated.View>

        {/* Title */}
        <Reanimated.View style={titleStyle}>
          <Text style={styles.title}>Elevated</Text>
        </Reanimated.View>

        {/* Subtitle */}
        <Reanimated.View style={subtitleStyle}>
          <Text style={styles.subtitle}>Your Universe. Elevated.</Text>
          <View style={styles.tagRow}>
            {['✦ Connect', '✦ Create', '✦ Inspire'].map((tag, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </Reanimated.View>
      </View>

      {/* Progress bar */}
      <Reanimated.View style={[styles.progressContainer, progressContainerStyle]}>
        <View style={styles.progressTrack}>
          <Reanimated.View style={[styles.progressBar, progressBarStyle]} />
        </View>
        <Text style={styles.progressText}>Initializing your universe...</Text>
      </Reanimated.View>
    </Reanimated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050B1F' },
  skyBg: { ...StyleSheet.absoluteFillObject },
  star: { position: 'absolute', backgroundColor: '#FFFFFF' },
  shootingStar: {
    position: 'absolute',
    width: 60,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  moonContainer: { position: 'absolute', top: 60, right: 40 },
  moon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F9E784', shadowColor: '#F9E784', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 20, elevation: 8 },
  moonCrescent: { position: 'absolute', top: 5, left: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: '#0A1535' },
  nebula1: { position: 'absolute', top: '15%', left: '5%', width: 200, height: 100, borderRadius: 100, backgroundColor: 'rgba(99,102,241,0.08)', transform: [{ scaleX: 2 }] },
  nebula2: { position: 'absolute', top: '40%', right: '5%', width: 150, height: 80, borderRadius: 80, backgroundColor: 'rgba(236,72,153,0.06)', transform: [{ scaleX: 1.5 }] },
  nebula3: { position: 'absolute', top: '60%', left: '20%', width: 180, height: 90, borderRadius: 90, backgroundColor: 'rgba(59,130,246,0.07)', transform: [{ scaleX: 1.8 }] },
  horizon: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, backgroundColor: 'rgba(15,30,80,0.8)' },
  
  cityContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', paddingHorizontal: 10 },
  building1: { width: 40, height: 90, backgroundColor: '#0A1535', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  building2: { width: 55, height: 140, backgroundColor: '#0D1D4A', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  building3: { width: 35, height: 110, backgroundColor: '#091228', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  building4: { width: 65, height: 180, backgroundColor: '#0F2266', borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  building5: { width: 45, height: 120, backgroundColor: '#0A1535', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  building6: { width: 50, height: 160, backgroundColor: '#0D1D4A', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  building7: { width: 35, height: 95, backgroundColor: '#091228', borderTopLeftRadius: 4, borderTopRightRadius: 4 },

  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingTop: 40 },
  logoContainer: { position: 'relative', marginBottom: 32, alignItems: 'center', justifyContent: 'center' },
  logoOuter: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(249,231,132,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(249,231,132,0.3)' },
  logoInner: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(249,231,132,0.2)', alignItems: 'center', justifyContent: 'center' },
  glowRing1: { position: 'absolute', width: 140, height: 140, borderRadius: 70, borderWidth: 1, borderColor: 'rgba(249,231,132,0.2)' },
  glowRing2: { position: 'absolute', width: 170, height: 170, borderRadius: 85, borderWidth: 0.5, borderColor: 'rgba(249,231,132,0.1)' },

  title: { fontSize: 42, fontWeight: '800', color: '#F9E784', textAlign: 'center', letterSpacing: 2, textShadowColor: 'rgba(249,231,132,0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20, marginBottom: 12 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.75)', textAlign: 'center', fontWeight: '500', letterSpacing: 0.5, marginBottom: 20 },
  tagRow: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(249,231,132,0.3)', backgroundColor: 'rgba(249,231,132,0.05)' },
  tagText: { fontSize: 11, color: 'rgba(249,231,132,0.8)', fontWeight: '600', letterSpacing: 0.5 },

  progressContainer: { position: 'absolute', bottom: 80, left: 40, right: 40, alignItems: 'center' },
  progressTrack: { width: '100%', height: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 1, marginBottom: 10, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 1, backgroundColor: '#F9E784', shadowColor: '#F9E784', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 6 },
  progressText: { fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: '500', letterSpacing: 1 },
});
