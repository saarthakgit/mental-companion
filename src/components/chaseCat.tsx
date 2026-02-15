import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  useDerivedValue,
  withTiming // <--- Import this
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export default function PixelPet() {
  const treatX = useSharedValue(30);
  const treatY = useSharedValue(230);
  
  // 1. HINT OPACITY (Starts visible = 1)
  const hintOpacity = useSharedValue(1);

  const drag = Gesture.Pan()
    .onStart(() => {
      // 2. FADE OUT ON FIRST TOUCH
      // If opacity is still 1, fade it to 0 over 500ms
      if (hintOpacity.value === 1) {
        hintOpacity.value = withTiming(0, { duration: 500 });
      }
    })
    .onChange((event) => {
      treatX.value += event.changeX;
      treatY.value += event.changeY;
    });

  const catX = useDerivedValue(() => withSpring(treatX.value, { damping: 12, stiffness: 90 }));
  const catY = useDerivedValue(() => withSpring(treatY.value + 40, { damping: 12, stiffness: 90 }));

  const catStyle = useAnimatedStyle(() => {
    const diff = treatX.value - catX.value;
    const direction = diff > 0 ? 1 : -1;
    return {
      transform: [
        { translateX: catX.value - 40 },
        { translateY: catY.value - 40 },
        { scaleX: direction } 
      ] as any,
    };
  });

  const treatStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: treatX.value - 20 },
      { translateY: treatY.value - 20 }
    ] as any,
  }));

  // 3. ANIMATED STYLE FOR HINT
  const hintContainerStyle = useAnimatedStyle(() => ({
    opacity: hintOpacity.value,
    transform: [
      // Make it float slightly above the treat
      { translateX: treatX.value - 60 }, 
      { translateY: treatY.value - 50 }
    ] as any
  }));

  return (
    <View style={styles.container} pointerEvents="box-none">
      
      {/* 🐱 THE PET */}
      <Animated.View style={[styles.petContainer, catStyle]} pointerEvents="none">
        <Image 
          source={require('../assets/images/cat.gif')} 
          style={styles.pixelArt}
          resizeMode="contain"
        />
      </Animated.View>

      {/* 👇 THE HINT TEXT (Follows treat until fade out) */}
      <Animated.View style={[styles.hintContainer, hintContainerStyle]} pointerEvents="none">
        <Text style={styles.hintText}>Drag Me!</Text>
      </Animated.View>

      {/* 🐟 THE TREAT */}
      <GestureDetector gesture={drag}>
        <Animated.View style={[styles.treat, treatStyle]}>
          <Image 
            source={require('../assets/images/wool.png')} 
            style={styles.treatImage}
          />
        </Animated.View>
      </GestureDetector>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300, 
    width: '100%',
    zIndex: 10,
    position : 'absolute'
  },
  petContainer: {
    position: 'absolute',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pixelArt: { width: 50, height: 50 },
  
  // TREAT STYLES
  treat: {
    position: 'absolute',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  treatImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },

  // HINT STYLES
  hintContainer: {
    position: 'absolute',
    width: 120,
    alignItems: 'center',
    zIndex: 15,
  },
  hintText: {
    color: '#fafeff',
    // fontWeight: 'bold',
    fontSize: 12,
    backgroundColor: 'rgba(118, 118, 118, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden', // Ensures borderRadius clips background
    fontFamily: 'SchoolR', // Or your bold font
  }
});