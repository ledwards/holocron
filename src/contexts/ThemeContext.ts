import {createContext} from 'react';
import { Theme } from '../types/interfaces';

const ThemeContext = createContext<Theme | null>(null);
export default ThemeContext;
