import { StyleSheet, Text, View } from 'react-native'
import LottieView from 'lottie-react-native'
import React, {useRef , useEffect} from 'react'

const NotFound = () => {
  const animationRef = useRef<LottieView>(null);
  useEffect(() => {
    animationRef.current?.play();
  }, [])
  return (
    <LottieView
    ref={animationRef}
    source={"../assets/animations/404.json"}
    autoPlay
    style={{height : 250 , width : 250}}>

    </LottieView>
  )
}

export default NotFound

const styles = StyleSheet.create({})