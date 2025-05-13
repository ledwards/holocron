import {createContext} from 'react';

interface Theme {
  name: string;
  backgroundColor: string;
  foregroundColor: string;
  dividerColor: string;
  translucentBackgroundColor: string;
}

const ThemeContext = createContext<Theme | null>(null);
export default ThemeContext;
