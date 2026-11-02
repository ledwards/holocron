import React, {useState, useContext, useLayoutEffect} from 'react';
import {useHeaderHeight} from '@react-navigation/elements';
import {useNavigation} from '@react-navigation/native';
import ThemeContext from '../../contexts/ThemeContext';
import AdaptiveWorkspace, {EmptyDetail, PaneIconButton} from '../adaptive/AdaptiveWorkspace';
import SearchableDecklistList from './SearchableDecklistList';
import AdaptiveDeckDetail, {DeckDisplayMode} from './AdaptiveDeckDetail';
import PaneMenuButton, {PaneMenuOption} from '../adaptive/PaneMenuButton';
import DeviceLayoutContext from '../../contexts/DeviceLayoutContext';
import DecklistPresenter from '../../presenters/DecklistPresenter';

const MODE_OPTIONS: PaneMenuOption<DeckDisplayMode>[] = [
  {value: 'grid', label: 'Grid', icon: 'grid-outline'},
  {value: 'list', label: 'List', icon: 'list-outline'},
  {value: 'text', label: 'Text', icon: 'document-text-outline'},
];

export default function DecklistsScreen() {
  const [selected, setSelected] = useState<DecklistPresenter | null>(null);
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const theme = useContext(ThemeContext);
  // In iPhone Duo's strip (closed), the three views are one menu with the
  // current one checkmarked; in the header, one button cycles through them.
  const {placement} = useContext(DeviceLayoutContext);
  const menu = placement !== 'bottom';
  const [mode, setMode] = useState<DeckDisplayMode>('grid');
  const next = mode === 'grid' ? 'list' : mode === 'list' ? 'text' : 'grid';
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: selected?.searchTournamentName || 'Decklists',
      headerLeft: selected ? () => <PaneIconButton testID="adaptive-back" icon="chevron-back"
        label="Back to decklists" onPress={() => setSelected(null)} /> : undefined,
      headerRight: !selected ? undefined : menu
        ? () => <PaneMenuButton testID="deck-mode-menu" label="Deck view" icon={MODE_OPTIONS.find(option => option.value === mode)?.icon || 'grid-outline'}
            options={MODE_OPTIONS} selected={mode} onSelect={setMode} />
        : () => <PaneIconButton testID="deck-mode-toggle"
            label={`Show ${next} view`}
            icon={next === 'grid' ? 'grid-outline' : next === 'list' ? 'list-outline' : 'document-text-outline'}
            onPress={() => setMode(next)} />,
    });
  }, [navigation, selected, next, theme, menu, mode]);
  return (
    <AdaptiveWorkspace
      title="Decklists"
      showBackButton={false}
      topInset={headerHeight}
      selected={!!selected}
      onBack={() => setSelected(null)}
      browser={
        <SearchableDecklistList
          nativeHeaderHeight={0}
          nativeFooterHeight={0}
          embedded
          onSelect={deck => {setSelected(deck); setMode('grid');}}
          selectedSlug={selected?.slug}
        />
      }
      detail={
        selected ? (
          <AdaptiveDeckDetail deck={selected} mode={mode} />
        ) : (
          <EmptyDetail label="Select a decklist" />
        )
      }
    />
  );
}
