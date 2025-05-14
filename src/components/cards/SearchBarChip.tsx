import {useContext} from 'react';
import {Chip} from 'react-native-elements';
import styles from '../../styles/SearchBarChipStyles';
import ThemeContext from '../../contexts/ThemeContext';
import { Theme } from '../../types/interfaces';

interface SearchBarChipProps {
  title: string;
  colorConditional: boolean;
}

const SearchBarChip = (props: SearchBarChipProps) => {
  const themeContext = useContext(ThemeContext);
  const theme: Theme = themeContext || {
    name: 'dark',
    backgroundColor: '#000000',
    foregroundColor: '#FFFFFF',
    dividerColor: '#444444',
    translucentBackgroundColor: 'rgba(0,0,0,0.5)',
    chipYesBackgroundColor: '#006633',
    chipNoBackgroundColor: '#990000',
    chipYesBorderColor: '#00FF99',
    chipNoBorderColor: '#FF0000',
    chipYesTextColor: '#FFFFFF',
    chipNoTextColor: '#FFFFFF'
  };

  return (
    <Chip
      title={props.title}
      type="outline"
      containerStyle={styles.chipContainer}
      buttonStyle={{
        backgroundColor: props.colorConditional
          ? theme.chipYesBackgroundColor
          : theme.chipNoBackgroundColor,
        borderColor: props.colorConditional
          ? theme.chipYesBorderColor
          : theme.chipNoBorderColor,
        ...styles.chipButton,
      }}
      titleStyle={{
        color: props.colorConditional
          ? theme.chipYesTextColor
          : theme.chipNoTextColor,
        ...styles.chipTitle,
      }}
    />
  );
};

export default SearchBarChip;
