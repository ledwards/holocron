'use strict';

function yamlString(value) {
  return `"${String(value).replace(/"/g, '\\\"')}"`;
}

function selectorYaml(params, indent = '    ') {
  if (params.id) {
    return `${indent}id: ${yamlString(params.id)}`;
  }

  if (params.text) {
    return `${indent}text: ${yamlString(params.text)}`;
  }

  throw new Error('Selector action requires id or text parameter');
}

function stepToYaml(step) {
  const {action, params} = step;

  switch (action) {
    case 'launchApp': {
      const lines = ['- launchApp:'];
      lines.push(`    clearState: ${params.clearState === true ? 'true' : 'false'}`);
      if (params.stopApp === true) {
        lines.push('    stopApp: true');
      }
      return lines.join('\n');
    }
    case 'stopApp':
      return '- stopApp';
    case 'tapOn':
      return ['- tapOn:', selectorYaml(params)].join('\n');
    case 'inputText':
      return `- inputText: ${yamlString(params.text || '')}`;
    case 'clearText':
      return '- eraseText';
    case 'hideKeyboard':
      return '- hideKeyboard';
    case 'waitForVisible': {
      const duration = Number(params.timeoutMs || 800);
      return [
        '- extendedWaitUntil:',
        `    timeout: ${duration}`,
        '    visible:',
        selectorYaml(params, '      '),
      ].join('\n');
    }
    case 'assertVisible':
      return ['- assertVisible:', selectorYaml(params)].join('\n');
    case 'swipe':
      return `- swipe: ${yamlString(String(params.direction || 'up').toUpperCase())}`;
    case 'scrollUntilVisible': {
      const direction = String(params.direction || 'down').toUpperCase();
      return [
        '- scrollUntilVisible:',
        '    element:',
        selectorYaml(params, '      '),
        `    direction: ${yamlString(direction)}`,
      ].join('\n');
    }
    case 'back':
      return '- back';
    case 'sleep':
      return '- waitForAnimationToEnd';
    default:
      throw new Error(`Unsupported step action while building Maestro flow: ${action}`);
  }
}

function buildMaestroFlow({appId, scenarioId, steps}) {
  if (!appId) {
    throw new Error(`Missing appId for scenario ${scenarioId}`);
  }

  const body = steps.map(stepToYaml).join('\n');
  return `appId: ${yamlString(appId)}\n---\n${body}\n`;
}

module.exports = {
  buildMaestroFlow,
  stepToYaml,
};
