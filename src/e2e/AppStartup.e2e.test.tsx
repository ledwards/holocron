import React from 'react';
import {act, create, ReactTestRenderer} from 'react-test-renderer';
import App from '../../App';

const mockDownloadCardDefinitions = jest.fn();
const mockDownloadExpansionSets = jest.fn();
const mockDownloadDecklists = jest.fn();
const mockLoadExpansionSets = jest.fn();
const mockLoadCardDefinitions = jest.fn();
const mockLoadDecklists = jest.fn();

let capturedTabNavigationProps: any;
const NetInfoMock = require('@react-native-community/netinfo');

jest.mock('@react-navigation/native', () => ({
  __esModule: true,
  NavigationContainer: ({children}: {children: React.ReactNode}) => children,
  DefaultTheme: {colors: {}},
}));

jest.mock('@react-native-community/netinfo');

jest.mock('../../src/lib/DownloadCardDefinitions', () => ({
  __esModule: true,
  default: () => mockDownloadCardDefinitions(),
}));

jest.mock('../../src/lib/DownloadExpansionSets', () => ({
  __esModule: true,
  default: () => mockDownloadExpansionSets(),
}));

jest.mock('../../src/lib/DownloadDecklists', () => ({
  __esModule: true,
  default: () => mockDownloadDecklists(),
}));

jest.mock('../../src/lib/LoadExpansionSets', () => ({
  __esModule: true,
  default: () => mockLoadExpansionSets(),
}));

jest.mock('../../src/lib/LoadCardDefinitions', () => ({
  __esModule: true,
  default: (sets: unknown[]) => mockLoadCardDefinitions(sets),
}));

jest.mock('../../src/lib/LoadDecklists', () => ({
  __esModule: true,
  default: () => mockLoadDecklists(),
}));

jest.mock('../../src/components/navigation/TabNavigation', () => {
  const ReactLocal = require('react');
  const {View} = require('react-native');

  return (props: unknown) => {
    capturedTabNavigationProps = props;
    return <View testID="tab-navigation" />;
  };
});

describe('App startup e2e', () => {
  const flushMicrotasks = async () => {
    await act(async () => {
      await Promise.resolve();
    });
  };

  const waitForExpectation = async (assertion: () => void) => {
    let lastError: unknown;

    for (let i = 0; i < 20; i += 1) {
      try {
        assertion();
        return;
      } catch (error) {
        lastError = error;
        await flushMicrotasks();
      }
    }

    throw lastError;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    capturedTabNavigationProps = undefined;
    NetInfoMock.__reset();
  });

  it('loads cached data without downloads when offline', async () => {
    const expansionSets = [{code: 'A'}];
    const cards = [{title: 'Darth Vader'}];
    const decklists = [{name: 'Dark Side Ops'}];

    NetInfoMock.__setConnected(false);
    mockLoadExpansionSets.mockResolvedValue(expansionSets);
    mockLoadCardDefinitions.mockResolvedValue(cards);
    mockLoadDecklists.mockResolvedValue(decklists);

    let app: ReactTestRenderer;
    await act(async () => {
      app = create(<App />);
    });

    await waitForExpectation(() => {
      expect(mockLoadExpansionSets).toHaveBeenCalled();
      expect(mockLoadCardDefinitions).toHaveBeenCalledWith(expansionSets);
      expect(mockLoadDecklists).toHaveBeenCalled();
    });

    expect(mockDownloadCardDefinitions).not.toHaveBeenCalled();
    expect(mockDownloadExpansionSets).not.toHaveBeenCalled();
    expect(mockDownloadDecklists).not.toHaveBeenCalled();

    await waitForExpectation(() => {
      expect(capturedTabNavigationProps.allCards).toEqual(cards);
      expect(capturedTabNavigationProps.expansionSets).toEqual(expansionSets);
      expect(capturedTabNavigationProps.allDecklists).toEqual(decklists);
    });

    app!.unmount();
  });

  it('downloads then loads data when online', async () => {
    const expansionSets = [{code: 'B'}];
    const cards = [{title: 'Luke Skywalker'}];
    const decklists = [{name: 'Light Side Speeders'}];

    NetInfoMock.__setConnected(true);
    mockDownloadCardDefinitions.mockResolvedValue(undefined);
    mockDownloadExpansionSets.mockResolvedValue(undefined);
    mockDownloadDecklists.mockResolvedValue(undefined);
    mockLoadExpansionSets.mockResolvedValue(expansionSets);
    mockLoadCardDefinitions.mockResolvedValue(cards);
    mockLoadDecklists.mockResolvedValue(decklists);

    let app: ReactTestRenderer;
    await act(async () => {
      app = create(<App />);
    });

    await waitForExpectation(() => {
      expect(mockDownloadCardDefinitions).toHaveBeenCalledTimes(1);
      expect(mockDownloadExpansionSets).toHaveBeenCalledTimes(1);
      expect(mockDownloadDecklists).toHaveBeenCalledTimes(1);
    });

    await waitForExpectation(() => {
      expect(mockLoadExpansionSets).toHaveBeenCalled();
      expect(mockLoadCardDefinitions).toHaveBeenCalledWith(expansionSets);
      expect(mockLoadDecklists).toHaveBeenCalled();
    });

    await waitForExpectation(() => {
      expect(capturedTabNavigationProps.allCards).toEqual(cards);
      expect(capturedTabNavigationProps.expansionSets).toEqual(expansionSets);
      expect(capturedTabNavigationProps.allDecklists).toEqual(decklists);
    });

    app!.unmount();
  });
});
