import React, {useState} from 'react';
import {View, Text, ActivityIndicator} from 'react-native';
import FastImage from 'react-native-fast-image';
import {fitArtwork} from '../../lib/adaptiveLayout';

interface Props {
  uri: string;
  sideways?: boolean;
  width: number;
  height: number;
  label: string;
  testID?: string;
}
/** Position the rotated image within its fitted frame; transforms don't affect layout. */
export default function CardArtwork(props: Props) {
  // A changed URI gets fresh intrinsic dimensions and loading state.
  return <ArtworkImage key={props.uri} {...props} />;
}
function ArtworkImage({
  uri,
  sideways = false,
  width,
  height,
  label,
  testID,
}: Props) {
  const [source, setSource] = useState({width: 339, height: 475});
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const fit = fitArtwork(width, height, source.width, source.height, sideways);
  return (
    <View
      style={{width, height, alignItems: 'center', justifyContent: 'center'}}>
      {failed || !uri ? (
        <Text style={{color: '#888', textAlign: 'center'}}>
          Artwork unavailable
        </Text>
      ) : (
        <View
          style={{
            width: fit.frameWidth,
            height: fit.frameHeight,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {!loaded && <ActivityIndicator accessibilityLabel="Loading artwork" style={{position: 'absolute'}} />}
          <FastImage
            testID={testID}
            accessibilityLabel={label}
            source={{uri}}
            resizeMode="contain"
            onError={() => setFailed(true)}
            onLoad={event => {
              const {width: w, height: h} = event.nativeEvent;
              setLoaded(true);
              if (w > 0 && h > 0) setSource({width: w, height: h});
            }}
            style={{
              width: fit.imageWidth,
              height: fit.imageHeight,
              transform: [{rotate: fit.rotate ? '90deg' : '0deg'}],
            }}
          />
        </View>
      )}
    </View>
  );
}
