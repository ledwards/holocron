import {useContext} from 'react';
import {Chip} from 'react-native-elements';
import styles from '../../styles/SearchBarChipStyles';
import ThemeContext from '../../contexts/ThemeContext';

type SearchBarChipProps = {
  title: string;
  colorConditional: boolean;
};

const SearchBarChip = (props: SearchBarChipProps) => {
  const theme = useContext(ThemeContext);

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
