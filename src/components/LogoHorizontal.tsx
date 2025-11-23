/**
 * Horizontal Logo Component
 * PNG-based logo for the Lucky Day app header
 * 
 * USAGE METHODS:
 * 
 * Method 1 (Current): Image component with PNG file
 * Method 2: FastImage for better performance
 * Method 3: SVG-based approaches (see commented alternatives)
 */

import React from 'react';
import { View, StyleSheet, Image, ImageStyle } from 'react-native';

interface LogoHorizontalProps {
    height?: number;
    width?: number;
    style?: ImageStyle;
    containerStyle?: any;
}

export const LogoHorizontal: React.FC<LogoHorizontalProps> = ({
    height = 60,
    width = 100,
    style,
    containerStyle
}) => {
    return (
        <View style={[styles.container, { height }, containerStyle]}>
            <Image
                source={require('../../assets/images/logo-h.png')}
                style={[
                    {
                        height: height,
                        width: width,
                    },
                    style
                ]}
                resizeMode="contain"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'flex-start', // <— sinistra
        justifyContent: 'center',
        width: '100%',
        height: '100%'
    },
});
/* 

=== ALTERNATIVE METHODS TO USE YOUR LOGO ===

// Method 2: Use react-native-fast-image (better performance for large images)
// 1. Install: npm install react-native-fast-image
// 2. Use like this:

import FastImage from 'react-native-fast-image';

export const LogoHorizontal = ({ width, height, style }) => (
    <View style={[styles.container, { width, height }]}>
        <FastImage
            source={require('../../../assets/images/logo-h.png')}
            style={[{ width, height }, style]}
            resizeMode={FastImage.resizeMode.contain}
        />
    </View>
);

// Method 3: SVG with SvgXml (requires react-native-svg)
import { SvgXml } from 'react-native-svg';

export const LogoHorizontal = ({ width, height, color = '#F04B16' }) => {
    const logoSvg = `<svg>...</svg>`; // Your SVG content
    return (
        <View style={[styles.container, { width, height }]}>
            <SvgXml xml={logoSvg} width={width} height={height} />
        </View>
    );
};

// Method 4: Import SVG as Component (requires react-native-svg-transformer)
// 1. Install: npm install react-native-svg-transformer
// 2. Configure metro.config.js
// 3. Use like this:

import LogoSvg from '../../../assets/images/logo-h.svg';

export const LogoHorizontal = ({ width, height }) => (
    <View style={[styles.container, { width, height }]}>
        <LogoSvg width={width} height={height} />
    </View>
);

// Method 5: Load from URI (for remote images)
export const LogoHorizontal = ({ width, height, uri }) => (
    <View style={[styles.container, { width, height }]}>
        <Image
            source={{ uri }}
            style={{ width, height }}
            resizeMode="contain"
        />
    </View>
);

*/