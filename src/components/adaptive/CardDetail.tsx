import React, {useState} from 'react';
import {View, Pressable} from 'react-native';
import useBottomClearance from '../../lib/useBottomClearance';
import CardArtwork from './CardArtwork';

import {DetailCard} from '../../types/adaptive';

/** Space around the card; the card itself takes everything else. */
const MARGIN = 10;

export default function CardDetail({card}: {card: DetailCard}) {
  return <SelectedCard key={card.id} card={card} />;
}
function SelectedCard({card}: {card: DetailCard}) {
  const bottom = useBottomClearance();
  const [back, setBack] = useState(false);
  const [size, setSize] = useState({width: 320, height: 500});
  const label = [card.title, card.subtitle].filter(Boolean).join(', ');
  return (
    <View
      testID="card-detail"
      onLayout={event => setSize(event.nativeEvent.layout)}
      style={{flex: 1, alignItems: 'center', justifyContent: 'center', padding: MARGIN, paddingBottom: MARGIN + bottom}}>
      <Pressable testID="card-flip"
        accessibilityRole={card.backImageUrl ? 'button' : 'image'}
        accessibilityLabel={card.backImageUrl ? `Show ${back ? 'front' : 'back'} of ${card.title}` : label}
        onPress={() => {if (card.backImageUrl) setBack(value => !value);}}>
        <CardArtwork
          testID="card-detail-artwork"
          uri={back ? card.backImageUrl || card.imageUrl : card.imageUrl}
          sideways={card.sideways}
          width={Math.max(0, size.width - 2 * MARGIN)}
          height={Math.max(160, size.height - 2 * MARGIN - bottom)}
          label={`${card.title}, ${back ? 'back' : 'front'}`}
        />
      </Pressable>
    </View>
  );
}
