import {createContext} from 'react';
import Card from '../models/Card';

const AllCardsContext = createContext<Card[] | null>(null);
export default AllCardsContext;
