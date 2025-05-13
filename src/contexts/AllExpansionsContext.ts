import {createContext} from 'react';
import ExpansionSet from '../models/ExpansionSet';

const AllExpansionsContext = createContext<ExpansionSet[] | null>(null);
export default AllExpansionsContext;
