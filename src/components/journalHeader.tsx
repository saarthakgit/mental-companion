import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

interface JournalHeaderProps {
  title?: string;
  subtitle?: string;
}

export const JournalHeader = ({ 
  title = "My Journal", 
  subtitle = "Your personal history book" 
}: JournalHeaderProps) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      
      {/* 1. MAIN TITLE (Freak Font) */}
      <Text style={styles.title}>
        {title}
      </Text>

      {/* 2. SUBTITLE (SchoolR Font) */}
      <Text style={styles.subtitle}>
        {subtitle}
      </Text>
      
    </View>
  );
};

const makeStyles = (theme: any) => StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 50, // Matches HomeHeader safe area
    paddingBottom: 20,
    backgroundColor: theme.colors.secondaryContainer,
    borderBottomRightRadius: 40,
    borderBottomLeftRadius: 40,
    borderBottomWidth: 2,
    borderColor: theme.colors.secondary,
    alignItems: 'center', // Ensures text is centered
    marginBottom: 10, // Slight spacing from the list below
  },

  // Main Title
  title: {
    fontFamily: 'Freak', 
    fontSize: 32, // Slightly bigger for a screen title
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: 4,
  },

  // Subtitle
  subtitle: {
    fontFamily: 'SchoolR', 
    fontSize: 16,
    color: theme.colors.secondary,
    textAlign: 'center',
    transform: [{ rotate: '-1deg' }] // That signature tilt
  },
});