import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SOSButton } from './SOS';

interface HomeHeaderProps {
  name?: string; // Optional: Pass user's name
}

export const HomeHeader = ({ name = "Buddyy" }: HomeHeaderProps) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  // Logic to determine the "Mode" based on time
  const getTimeContext = () => {
    const hour = new Date().getHours();
    if (hour < 5) return 'LATE NIGHT GRIND';
    if (hour < 12) return 'MORNING ROUTINE';
    if (hour < 17) return 'AFTERNOON FLOW';
    return 'EVENING REFLECTION';
  };

  const getPrompt = () => {
     const hour = new Date().getHours();
     if (hour < 12) return "Ready to start the day?";
     if (hour < 17) return "Don't forget to hydrate.";
     return "What's on your mind today?";
  }

  return (
    <View style={styles.container}>
      
    {/* <SOSButton/> */}

      {/* 2. BOLD GREETING */}
      <Text style={styles.greeting}>
        Hey, {name}!
      </Text>

      {/* 3. PERSONAL PROMPT */}
      <Text style={styles.prompt}>
        {getPrompt()}
      </Text>
      
    </View>
  );
};

const makeStyles = (theme: any) => StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 40, // Adjust for safe area/notch
    // paddingBottom: 20,
    backgroundColor: theme.colors.secondaryContainer,
    borderBottomRightRadius : 40,
    borderBottomLeftRadius : 40,
    paddingBottom : 10,
    borderBottomWidth : 2,
    borderColor : theme.colors.secondary
  },
  
  // Top Row: Dot + Label + Line
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginRight: 8,
  },
  statusText: {
    fontFamily: 'Code', // Technical Font
    fontSize: 12,
    color: theme.colors.primary,
    letterSpacing: 1.5,
    marginRight: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.outlineVariant,
    opacity: 0.5,
  },

  // Main Title
  greeting: {
    marginTop : 10,
    fontFamily: 'Freak', // Bold/Expressive Font
    fontSize: 28,
    color: theme.colors.primary,
    alignSelf :'center'
    // lineHeight: 56, // Tighter line height for large text
  },

  // Subtitle / Prompt
  prompt: {
    fontFamily: 'SchoolR', // Handwritten/Personal Font
    fontSize: 15,
    color: theme.colors.secondary,
    marginTop: 4,
    alignSelf :'center',
    transform: [{ rotate: '-1deg' }] // Slight tilt for natural handwritten feel
  },
});