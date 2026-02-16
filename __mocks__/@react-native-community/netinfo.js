const state = {
  isConnected: false,
};

const fetch = jest.fn(() => Promise.resolve({...state}));
const addEventListener = jest.fn(() => jest.fn());

const __setConnected = (isConnected) => {
  state.isConnected = isConnected;
};

const __reset = () => {
  state.isConnected = false;
  fetch.mockClear();
  addEventListener.mockClear();
};

const api = {
  fetch,
  addEventListener,
};

module.exports = {
  __esModule: true,
  default: api,
  fetch,
  addEventListener,
  __setConnected,
  __reset,
};
