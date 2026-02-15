import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

interface CommunityHeaderProps {
  title?: string;
  subtitle?: string;
}

export const CommunityHeader = ({ 
  title = "Community", 
  subtitle = "You are not alone.. connect to other peeps" 
}: CommunityHeaderProps) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

const makeStyles = (theme: any) => StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 50, // Safe area padding
    paddingBottom: 20,
    backgroundColor: theme.colors.secondaryContainer,
    borderBottomRightRadius: 40,
    borderBottomLeftRadius: 40,
    borderBottomWidth: 2,
    borderColor: theme.colors.secondary,
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontFamily: 'Freak', 
    fontSize: 32, 
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'SchoolR', 
    fontSize: 16,
    color: theme.colors.secondary,
    textAlign: 'center',
    transform: [{ rotate: '-1deg' }] 
  },
});