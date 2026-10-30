import React, {useContext} from 'react';
import {Pressable, Text, View} from 'react-native';
import {Icon} from 'react-native-elements';
import {usePaneInsets} from '../../contexts/PaneInsetsContext';
import ThemeContext from '../../contexts/ThemeContext';
import GlassSurface from '../glass/GlassSurface';
import {PaneIconButton} from '../adaptive/AdaptiveWorkspace';

interface Props {
  pageLabel: string;
  query: string;
  hitProgressLabel: string;
  /** Distance from the bottom of the reader (the tab bar's clearance). */
  bottom: number;
  onOpenSearch: () => void;
  onPrevHit: () => void;
  onNextHit: () => void;
}

/** Room the bar takes at the bottom of the reader, for the text's end padding. */
export function readerBarSpace(hasQuery: boolean): number {
  return hasQuery ? 104 : 56;
}

/**
 * The reader's one floating bar: the current page and, while searching, the
 * query with its match position and previous/next controls. Glass like the
 * rest of the app's bars; the text scrolls beneath it.
 */
export default function RulesReaderBar({pageLabel, query, hitProgressLabel, bottom, onOpenSearch, onPrevHit, onNextHit}: Props) {
  const theme = useContext(ThemeContext);
  const color = theme?.foregroundColor || '#FFFFFF';
  const searching = !!query;
  const insets = usePaneInsets();
  return (
    <View pointerEvents="box-none" style={{position: 'absolute', left: 12 + insets.left, right: 12 + insets.right, bottom: bottom + 8, alignItems: 'center'}}>
      <GlassSurface edge="all" radius={searching ? 24 : 18} style={{alignSelf: searching ? 'stretch' : 'center'}}>
        {searching && (
          <View testID="rules-match-bar" style={{flexDirection: 'row', alignItems: 'center', paddingLeft: 6, paddingRight: 2}}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit rules search"
              onPress={onOpenSearch}
              style={{flex: 1, minWidth: 0, minHeight: 44, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8}}>
              <Icon name="search-outline" type="ionicon" size={20} color={color} />
              <Text numberOfLines={1} style={{flex: 1, marginLeft: 8, fontSize: 16, fontWeight: '500', color}}>
                {query}
              </Text>
            </Pressable>
            <PaneIconButton testID="rules-prev-hit" label="Previous matching page" icon="chevron-up" onPress={onPrevHit} />
            <PaneIconButton testID="rules-next-hit" label="Next matching page" icon="chevron-down" onPress={onNextHit} />
          </View>
        )}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: searching ? 'space-between' : 'center',
            paddingHorizontal: 16,
            paddingTop: searching ? 0 : 8,
            paddingBottom: 8,
          }}>
          <Text testID="rules-visible-pages" style={{fontSize: 13, fontWeight: '500', color, opacity: 0.85}}>
            {pageLabel}
          </Text>
          {searching && (
            <Text testID="rules-hit-progress" style={{fontSize: 13, fontWeight: '500', color, opacity: 0.85}}>
              {hitProgressLabel}
            </Text>
          )}
        </View>
      </GlassSurface>
    </View>
  );
}
