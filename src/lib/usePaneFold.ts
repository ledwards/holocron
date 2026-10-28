import {useCallback, useContext, useRef, useState} from 'react';
import {LayoutChangeEvent, View, useWindowDimensions} from 'react-native';
import DeviceLayoutContext from '../contexts/DeviceLayoutContext';
import {Region, PaneFold, foldInPane} from './duoLayout';

/**
 * A pane's measured size, and the fold crossing it in the pane's own
 * coordinates (null when the display is flat, closed, or the fold misses it).
 * `topInset` is space the pane reserves above its content (a header).
 */
export default function usePaneFold(topInset = 0) {
  const {fold} = useContext(DeviceLayoutContext);
  const window = useWindowDimensions();
  const ref = useRef<View>(null);
  const [frame, setFrame] = useState<Region>({x: 0, y: 0, width: window.width, height: window.height});

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const {width, height} = event.nativeEvent.layout;
    setFrame(previous => ({...previous, width, height}));
    ref.current?.measureInWindow?.((x, y, measuredWidth, measuredHeight) => {
      if (measuredWidth && measuredHeight) {
        setFrame({x, y, width: measuredWidth, height: measuredHeight});
      }
    });
  }, []);

  const content: Region = {x: frame.x, y: frame.y + topInset, width: frame.width, height: frame.height - topInset};
  const paneFold: PaneFold | null = foldInPane(fold, content);
  return {ref, onLayout, width: frame.width, height: content.height, fold: paneFold};
}
