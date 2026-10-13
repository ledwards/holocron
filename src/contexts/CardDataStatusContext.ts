import {createContext} from 'react';

export type CardDataStatus = 'loading' | 'ready' | 'unavailable';

const CardDataStatusContext = createContext<CardDataStatus>('loading');
export default CardDataStatusContext;
