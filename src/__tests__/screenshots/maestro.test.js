const {buildMaestroFlow} = require('../../../scripts/screenshots/lib/maestro');

describe('maestro flow generation', () => {
  it('renders a valid flow with selector and input', () => {
    const flow = buildMaestroFlow({
      appId: 'com.holocron',
      scenarioId: 'home',
      steps: [
        {action: 'launchApp', params: {clearState: true}},
        {action: 'tapOn', params: {text: 'Decklists'}},
        {action: 'inputText', params: {text: 'lee edwards'}},
      ],
    });

    expect(flow).toContain('appId: "com.holocron"');
    expect(flow).toContain('- launchApp:');
    expect(flow).toContain('clearState: true');
    expect(flow).toContain('text: "Decklists"');
    expect(flow).toContain('- inputText: "lee edwards"');
  });
});
