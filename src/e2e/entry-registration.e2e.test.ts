describe('native app entry', () => {
  it('registers both the Expo entry and the existing native app name', () => {
    const registerRootComponent = jest.fn();
    const registerComponent = jest.fn();
    jest.doMock('react-native-gesture-handler', () => ({}));
    jest.doMock('expo', () => ({registerRootComponent}));
    jest.doMock('react-native', () => ({AppRegistry: {registerComponent}}));
    jest.doMock('../../App', () => ({__esModule: true, default: () => null}));
    jest.isolateModules(() => require('../../index'));
    expect(registerRootComponent).toHaveBeenCalledTimes(1);
    expect(registerComponent).toHaveBeenCalledWith('holocron', expect.any(Function));
    expect(registerComponent.mock.calls[0][1]()).toBe(registerRootComponent.mock.calls[0][0]);
  });
});
