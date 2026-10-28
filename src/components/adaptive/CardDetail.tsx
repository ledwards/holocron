import React, {useContext, useState} from 'react';
import {View, Text, ScrollView, Pressable} from 'react-native';
import useBottomClearance from '../../lib/useBottomClearance';
import ThemeContext from '../../contexts/ThemeContext';
import CardArtwork from './CardArtwork';

import {DetailCard} from '../../types/adaptive';
export default function CardDetail({card}: {card: DetailCard}) {
  return <SelectedCard key={card.id} card={card} />;
}
function SelectedCard({card}: {card: DetailCard}) {
  const theme = useContext(ThemeContext);
  const bottom = useBottomClearance();
  const [back, setBack] = useState(false);
  const [headingHeight, setHeadingHeight] = useState(100);
  const [size, setSize] = useState({width: 320, height: 500});
  return (
    <View
      testID="card-detail"
      onLayout={event => setSize(event.nativeEvent.layout)}
      style={{flex: 1}}>
      <ScrollView
        contentContainerStyle={{
          alignItems: 'center',
          padding: 16,
          paddingBottom: bottom + 24,
        }}>
        <View
          onLayout={event => setHeadingHeight(event.nativeEvent.layout.height)}
          style={{width: '100%', maxWidth: 680}}>
          <Text
            style={{
              fontSize: 21,
              fontWeight: '600',
              color: theme?.foregroundColor,
            }}>
            {card.title}
          </Text>
          {!!card.subtitle && (
            <Text
              style={{
                fontSize: 14,
                marginTop: 6,
                color: theme?.foregroundColor,
              }}>
              {card.subtitle}
            </Text>
          )}

        </View>
        <Pressable style={{marginTop: 16}} testID="card-flip"
          accessibilityRole={card.backImageUrl ? 'button' : 'image'}
          accessibilityLabel={card.backImageUrl ? `Show ${back ? 'front' : 'back'}` : card.title}
          onPress={() => {if (card.backImageUrl) setBack(value => !value);}}>
          <CardArtwork
            testID="card-detail-artwork"
            uri={back ? card.backImageUrl || card.imageUrl : card.imageUrl}
            sideways={card.sideways}
            width={Math.max(0, Math.min(size.width - 32, 680))}
            height={Math.max(160, size.height - bottom - headingHeight - 48)}
            label={`${card.title}, ${back ? 'back' : 'front'}`}
          />
        </Pressable>
      </ScrollView>
    </View>
  );
}
