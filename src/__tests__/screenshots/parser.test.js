const {parseScenarios} = require('../../../scripts/screenshots/lib/parser');

describe('screenshot scenario parser', () => {
  it('parses multiple scenarios and typed params', () => {
    const input = `
scenario: sample
platforms: ios,android
screenshot: sample_shot
steps:
  - launchApp clearState=true
  - inputText text="agents"
---
scenario: second
platforms: ios
screenshot: second_shot
steps:
  - sleep durationMs=500
`;

    const parsed = parseScenarios(input);

    expect(parsed).toHaveLength(2);
    expect(parsed[0].scenario).toBe('sample');
    expect(parsed[0].steps[0]).toEqual({
      action: 'launchApp',
      params: {clearState: true},
    });
    expect(parsed[0].steps[1].params.text).toBe('agents');
    expect(parsed[1].platforms).toEqual(['ios']);
    expect(parsed[1].steps[0].params.durationMs).toBe(500);
  });

  it('throws for unsupported step action', () => {
    const input = `
scenario: sample
screenshot: sample_shot
steps:
  - doThing value=1
`;

    expect(() => parseScenarios(input)).toThrow('Unsupported action "doThing"');
  });
});
