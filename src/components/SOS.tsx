import React from 'react';
import { Pressable, Text, StyleSheet, Linking, Alert, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

export const SOSButton = () => {
  const theme = useTheme();

  const handlePress = () => {
    Alert.alert(
      "Emergency Help",
      "Do you want to call the National Crisis Helpline?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Call Now", 
          style: "destructive", 
          onPress: () => Linking.openURL('tel:199') // Replace with your local emergency number
        }
      ]
    );
  };

  return (
    <Pressable 
      style={[styles.container, { backgroundColor: theme.colors.error }]} 
      onPress={handlePress}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="warning" size={16} color={theme.colors.onError} />
      </View>
      <Text style={[styles.text, { color: theme.colors.onError }]}>SOS</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 10,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    
    // REDUCED PADDING
    paddingVertical: 6,      // Was 8
    paddingHorizontal: 12,   // Was 16
    
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 999,
  },
  iconContainer: {
    marginRight: 4, // Slightly tighter gap
  },
  text: {
    fontFamily: 'Code',
    fontSize: 12,    // Was 18 (Now much cuter/smaller)
    letterSpacing: 1,
  },
});