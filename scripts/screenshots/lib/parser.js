'use strict';

const SUPPORTED_ACTIONS = new Set([
  'launchApp',
  'stopApp',
  'tapOn',
  'inputText',
  'clearText',
  'hideKeyboard',
  'waitForVisible',
  'assertVisible',
  'swipe',
  'scrollUntilVisible',
  'back',
  'sleep',
]);

function parseScalar(value) {
  const trimmed = value.trim();

  if (trimmed === 'true') {
    return true;
  }

  if (trimmed === 'false') {
    return false;
  }

  if (/^-?\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  return trimmed;
}

function parseKeyValueTokens(source, lineNumber) {
  const params = {};
  let rest = source.trim();

  while (rest.length > 0) {
    const match = rest.match(/^(\w+)=("([^"]*)"|'([^']*)'|[^\s]+)\s*/);

    if (!match) {
      throw new Error(
        `Invalid step parameters near "${rest}" on line ${lineNumber}. Use key=value pairs.`,
      );
    }

    const key = match[1];
    const rawValue = match[3] ?? match[4] ?? match[2];
    params[key] = parseScalar(rawValue);
    rest = rest.slice(match[0].length);
  }

  return params;
}

function parseStep(stepLine, lineNumber) {
  const normalized = stepLine.trim();
  const match = normalized.match(/^([A-Za-z][\w-]*)(?:\s+(.*))?$/);

  if (!match) {
    throw new Error(`Invalid step syntax on line ${lineNumber}: "${stepLine}"`);
  }

  const action = match[1];
  const rawParams = match[2] || '';

  if (!SUPPORTED_ACTIONS.has(action)) {
    throw new Error(`Unsupported action "${action}" on line ${lineNumber}`);
  }

  const params = rawParams ? parseKeyValueTokens(rawParams, lineNumber) : {};
  return {action, params};
}

function parsePlatforms(value) {
  if (!value) {
    return ['ios', 'android'];
  }

  const platforms = value
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);

  if (platforms.length === 0) {
    return ['ios', 'android'];
  }

  const invalid = platforms.filter(p => p !== 'ios' && p !== 'android');
  if (invalid.length > 0) {
    throw new Error(`Unsupported platform(s): ${invalid.join(', ')}`);
  }

  return Array.from(new Set(platforms));
}

function parseScenarioBlock(block, blockIndex) {
  const lines = block.split('\n');
  const scenario = {
    scenario: '',
    name: '',
    description: '',
    screenshot: '',
    platforms: ['ios', 'android'],
    steps: [],
  };

  let inSteps = false;

  lines.forEach((line, lineIndex) => {
    const lineNumber = lineIndex + 1;
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    if (trimmed.startsWith('- ')) {
      if (!inSteps) {
        throw new Error(
          `Step found before steps: key in scenario block ${blockIndex + 1}, line ${lineNumber}`,
        );
      }
      scenario.steps.push(parseStep(trimmed.slice(2), lineNumber));
      return;
    }

    const keyValueMatch = trimmed.match(/^(\w+):\s*(.*)$/);
    if (!keyValueMatch) {
      throw new Error(`Invalid line in scenario block ${blockIndex + 1}, line ${lineNumber}: ${trimmed}`);
    }

    const key = keyValueMatch[1];
    const value = keyValueMatch[2];

    if (key === 'steps') {
      inSteps = true;
      return;
    }

    inSteps = false;

    switch (key) {
      case 'scenario':
        scenario.scenario = value;
        break;
      case 'name':
        scenario.name = value;
        break;
      case 'description':
        scenario.description = value;
        break;
      case 'screenshot':
        scenario.screenshot = value;
        break;
      case 'platforms':
        scenario.platforms = parsePlatforms(value);
        break;
      default:
        throw new Error(`Unsupported key "${key}" in scenario block ${blockIndex + 1}`);
    }
  });

  if (!scenario.scenario) {
    throw new Error(`Scenario block ${blockIndex + 1} is missing scenario:`);
  }

  if (!scenario.screenshot) {
    throw new Error(`Scenario "${scenario.scenario}" is missing screenshot:`);
  }

  if (scenario.steps.length === 0) {
    throw new Error(`Scenario "${scenario.scenario}" must contain at least one step`);
  }

  if (!scenario.name) {
    scenario.name = scenario.scenario;
  }

  return scenario;
}

function parseScenarios(content) {
  const blocks = content
    .split(/^---\s*$/m)
    .map(block => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return [];
  }

  const scenarios = blocks.map((block, index) => parseScenarioBlock(block, index));
  const seen = new Set();

  scenarios.forEach(scenario => {
    if (seen.has(scenario.scenario)) {
      throw new Error(`Duplicate scenario id: ${scenario.scenario}`);
    }
    seen.add(scenario.scenario);
  });

  return scenarios;
}

module.exports = {
  SUPPORTED_ACTIONS,
  parseScenarios,
  parseStep,
  parsePlatforms,
};
