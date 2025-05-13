import {createContext} from 'react';
import Decklist from '../models/Decklist';

const AllDecklistsContext = createContext<Decklist[] | null>(null);
export default AllDecklistsContext;
