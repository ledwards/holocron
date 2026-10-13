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
let capturedCardStatus: string;
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
    capturedCardStatus = ReactLocal.useContext(require('../../src/contexts/CardDataStatusContext').default);
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
    [mockLoadExpansionSets, mockLoadCardDefinitions, mockLoadDecklists,
      mockDownloadCardDefinitions, mockDownloadExpansionSets, mockDownloadDecklists]
      .forEach(mock => mock.mockReset());
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
  it('stays loading through an empty cache and a pending online download', async () => {
    NetInfoMock.__setConnected(true);
    let finishDownload!: () => void;
    let downloaded = false;
    const cards = [{title: 'Luke Skywalker'}];
    mockLoadExpansionSets.mockResolvedValue([]);
    mockLoadCardDefinitions.mockImplementation(async () => downloaded ? cards : []);
    mockLoadDecklists.mockResolvedValue([]);
    mockDownloadDecklists.mockResolvedValue(undefined);
    mockDownloadExpansionSets.mockResolvedValue(undefined);
    mockDownloadCardDefinitions.mockReturnValue(new Promise<void>(resolve => {finishDownload = resolve;}));
    let app!: ReactTestRenderer;
    await act(async () => { app = create(<App />); });
    await waitForExpectation(() => expect(mockDownloadCardDefinitions).toHaveBeenCalled());
    expect(capturedCardStatus).toBe('loading');
    expect(capturedTabNavigationProps.allCards).toEqual([]);
    await act(async () => { downloaded = true; finishDownload(); });
    await waitForExpectation(() => expect(capturedCardStatus).toBe('ready'));
    expect(capturedTabNavigationProps.allCards).toEqual(cards);
    act(() => app.unmount());
  });

  it('keeps cached cards available when an online refresh fails', async () => {
    NetInfoMock.__setConnected(true);
    const cards = [{title: 'Darth Vader'}];
    mockLoadExpansionSets.mockResolvedValue([]);
    mockLoadCardDefinitions.mockResolvedValue(cards);
    mockLoadDecklists.mockResolvedValue([]);
    mockDownloadDecklists.mockResolvedValue(undefined);
    mockDownloadExpansionSets.mockRejectedValue(new Error('Download failed'));
    mockDownloadCardDefinitions.mockRejectedValue(new Error('Download failed'));
    let app!: ReactTestRenderer;
    await act(async () => { app = create(<App />); });
    await waitForExpectation(() => expect(mockDownloadCardDefinitions).toHaveBeenCalled());
    expect(capturedCardStatus).toBe('ready');
    expect(capturedTabNavigationProps.allCards).toEqual(cards);
    act(() => app.unmount());
  });

  it('finishes an empty offline load instead of leaving an endless spinner', async () => {
    NetInfoMock.__setConnected(false);
    mockLoadExpansionSets.mockResolvedValue([]);
    mockLoadCardDefinitions.mockResolvedValue([]);
    mockLoadDecklists.mockResolvedValue([]);
    let app!: ReactTestRenderer;
    await act(async () => { app = create(<App />); });
    await waitForExpectation(() => expect(capturedCardStatus).toBe('unavailable'));
    expect(mockDownloadCardDefinitions).not.toHaveBeenCalled();
    act(() => app.unmount());
  });

});
