import {Chip} from 'react-native-elements';
import styles from '../../styles/SearchBarChipStyles';

type SearchBarChipProps = {
  title: string;
  colorConditional: boolean;
  theme: any;
};

const SearchBarChip = (props: SearchBarChipProps) => (
  <Chip
    title={props.title}
    type="outline"
    containerStyle={styles.chipContainer}
    buttonStyle={{
      backgroundColor: props.colorConditional
        ? props.theme.chipYesBackgroundColor
        : props.theme.chipNoBackgroundColor,
      borderColor: props.colorConditional
        ? props.theme.chipYesBorderColor
        : props.theme.chipNoBorderColor,
      ...styles.chipButton,
    }}
    titleStyle={{
      color: props.colorConditional
        ? props.theme.chipYesTextColor
        : props.theme.chipNoTextColor,
      ...styles.chipTitle,
    }}
  />
);

export default SearchBarChip;
