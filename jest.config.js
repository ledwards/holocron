module.exports = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.jsx$': 'babel-jest',
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
  "globals": {
    "ts-jest": {
      "babelConfig": true
    }
  },
  testEnvironment: 'node'
};
