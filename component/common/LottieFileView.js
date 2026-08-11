import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import LottieView from 'lottie-react-native';

const LottieFileView = ({
  file,
  title = 'No Trip Assigned',
  message = 'You currently have no active trip assigned from Naracoo Fleet.',
  width = 240,
  height = 180,
  containerStyle
}) => {
  const animation = useRef(null);

  useEffect(() => {
    animation.current?.play();
  }, []);

  return (
    <View style={[styles.animationContainer, containerStyle]}>
      <LottieView
        autoPlay
        loop
        ref={animation}
        style={{ width, height }}
        source={file || require('../../assets/lottiefiles/nodata.json')}
      />
      {title ? <Text style={styles.titleText}>{title}</Text> : null}
      {message ? <Text style={styles.messageText}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 8,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
});

export default LottieFileView;