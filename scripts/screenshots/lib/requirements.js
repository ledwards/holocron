'use strict';

const fs = require('fs');

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizePlatformSelection(platform) {
  if (!platform || platform === 'both') {
    return ['ios', 'android'];
  }

  if (platform !== 'ios' && platform !== 'android') {
    throw new Error(`Unsupported platform argument: ${platform}`);
  }

  return [platform];
}

function resolveScreenshotJobs({requirements, scenarios, platformSelection, scenarioFilter}) {
  const selectedPlatforms = normalizePlatformSelection(platformSelection);
  const allowedScenarios = scenarioFilter
    ? new Set(
        scenarioFilter
          .split(',')
          .map(item => item.trim())
          .filter(Boolean),
      )
    : null;

  return scenarios.flatMap(scenario => {
    if (allowedScenarios && !allowedScenarios.has(scenario.scenario)) {
      return [];
    }

    return selectedPlatforms.flatMap(platform => {
      if (!scenario.platforms.includes(platform)) {
        return [];
      }

      const platformConfig = requirements[platform];
      if (!platformConfig || !Array.isArray(platformConfig.profiles)) {
        throw new Error(`Missing requirements for platform: ${platform}`);
      }

      return platformConfig.profiles
        .filter(profile => profile.required)
        .map(profile => ({
          scenarioId: scenario.scenario,
          scenarioName: scenario.name,
          screenshotKey: scenario.screenshot,
          steps: scenario.steps,
          platform,
          store: profile.store,
          profileId: profile.id,
          profileLabel: profile.label,
          target: profile.target,
          cropAnchor: profile.cropAnchor || 'center',
        }));
    });
  });
}

module.exports = {
  readJsonFile,
  normalizePlatformSelection,
  resolveScreenshotJobs,
};
