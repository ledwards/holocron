'use strict';

const fs = require('fs');
const path = require('path');
const {spawnSync} = require('child_process');
const {buildMaestroFlow} = require('./maestro');
const {cropImageToTarget, readImageSize} = require('./crop');
const MAESTRO_APP_CLI = '/Applications/Maestro.app/Contents/Resources/maestro-cli.js';

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    env: options.env || process.env,
    encoding: options.encoding || 'utf8',
    stdio: options.stdio || 'pipe',
    timeout: options.timeoutMs || 300000,
  });

  if (result.error && result.error.code === 'ETIMEDOUT') {
    throw new Error(`Command timed out after ${options.timeoutMs || 300000}ms: ${command} ${args.join(' ')}`);
  }

  if (result.status !== 0) {
    const stderr = result.stderr || '';
    const stdout = result.stdout || '';
    throw new Error(`Command failed: ${command} ${args.join(' ')}\n${stderr || stdout}`);
  }

  return result;
}

function captureIosScreenshot(deviceId, outputPath) {
  runCommand('xcrun', ['simctl', 'io', deviceId, 'screenshot', outputPath]);
}

function captureAndroidScreenshot(deviceId, outputPath) {
  const result = spawnSync('adb', ['-s', deviceId, 'exec-out', 'screencap', '-p'], {
    encoding: null,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.status !== 0) {
    throw new Error(
      `Command failed: adb -s ${deviceId} exec-out screencap -p\n${String(result.stderr || '')}`,
    );
  }

  fs.mkdirSync(path.dirname(outputPath), {recursive: true});
  fs.writeFileSync(outputPath, result.stdout);
}

function runScenarioWithMaestro({flowPath, deviceId, cwd}) {
  const explicitMaestro = process.env.MAESTRO_BIN;
  if (explicitMaestro) {
    runCommand(explicitMaestro, ['test', flowPath, '--device', deviceId], {
      cwd,
      timeoutMs: 180000,
    });
    return;
  }

  const pathProbe = spawnSync('which', ['maestro'], {encoding: 'utf8'});
  if (pathProbe.status === 0) {
    runCommand('maestro', ['test', flowPath, '--device', deviceId], {
      cwd,
      timeoutMs: 180000,
    });
    return;
  }

  if (fs.existsSync(MAESTRO_APP_CLI)) {
    runCommand('node', [MAESTRO_APP_CLI, 'test', flowPath, '--device', deviceId], {
      cwd,
      timeoutMs: 180000,
    });
    return;
  }

  throw new Error(
    'Maestro CLI not found. Install it or set MAESTRO_BIN to the executable path.',
  );
}

function ensureIosDeviceBooted(deviceId) {
  // Boot can return non-zero when already booted; allow that state.
  try {
    runCommand('xcrun', ['simctl', 'boot', deviceId]);
  } catch (error) {
    const message = String(error.message || '');
    if (!message.includes('Unable to boot device in current state: Booted')) {
      throw error;
    }
  }
  runCommand('xcrun', ['simctl', 'bootstatus', deviceId, '-b']);
}

function buildArtifactPaths({outDir, job}) {
  const fileBase = `${job.screenshotKey}__${job.platform}__${job.profileId}`;
  const rawPath = path.join(outDir, 'raw', job.platform, `${fileBase}.png`);
  const processedPath = path.join(
    outDir,
    job.platform,
    job.store,
    `${fileBase}__${job.target.width}x${job.target.height}.png`,
  );
  const flowPath = path.join(outDir, 'flows', `${fileBase}.yaml`);

  return {rawPath, processedPath, flowPath};
}

function writeReport({outDir, rows}) {
  const reportPath = path.join(outDir, 'report.md');
  const lines = [
    '# Screenshot Report',
    '',
    '| Scenario | Platform | Profile | Target | Status | Output |',
    '|---|---|---|---|---|---|',
  ];

  rows.forEach(row => {
    lines.push(
      `| ${row.scenarioId} | ${row.platform} | ${row.profileId} | ${row.target.width}x${row.target.height} | ${row.status} | ${row.outputPath || row.error || ''} |`,
    );
  });

  fs.mkdirSync(outDir, {recursive: true});
  fs.writeFileSync(reportPath, `${lines.join('\n')}\n`);
  return reportPath;
}

function ensureDeviceConfig(devicesConfig, platform, profileId) {
  const platformConfig = devicesConfig[platform];
  if (!platformConfig) {
    throw new Error(`Missing devices config for platform ${platform}`);
  }

  const profileConfig = platformConfig.profiles && platformConfig.profiles[profileId];
  if (!profileConfig || !profileConfig.deviceId) {
    throw new Error(`Missing devices config for ${platform}/${profileId}`);
  }

  if (!platformConfig.appId) {
    throw new Error(`Missing appId in devices config for platform ${platform}`);
  }

  return {
    appId: platformConfig.appId,
    deviceId: profileConfig.deviceId,
  };
}

function validateOutput(pathToImage, target) {
  const size = readImageSize(pathToImage);
  if (size.width !== target.width || size.height !== target.height) {
    throw new Error(
      `Output dimension mismatch for ${pathToImage}. Expected ${target.width}x${target.height}, got ${size.width}x${size.height}`,
    );
  }
}

function executeJobs({jobs, devicesConfig, outDir, repoRoot, dryRun, continueOnError}) {
  const rows = [];

  fs.mkdirSync(path.join(outDir, 'raw'), {recursive: true});
  fs.mkdirSync(path.join(outDir, 'flows'), {recursive: true});

  jobs.forEach(job => {
    const artifactPaths = buildArtifactPaths({outDir, job});

    try {
      const deviceConfig = ensureDeviceConfig(devicesConfig, job.platform, job.profileId);
      const flow = buildMaestroFlow({
        appId: deviceConfig.appId,
        scenarioId: job.scenarioId,
        steps: job.steps,
      });

      fs.mkdirSync(path.dirname(artifactPaths.flowPath), {recursive: true});
      fs.writeFileSync(artifactPaths.flowPath, flow);

      if (!dryRun) {
        if (job.platform === 'ios') {
          ensureIosDeviceBooted(deviceConfig.deviceId);
        }

        runScenarioWithMaestro({
          flowPath: artifactPaths.flowPath,
          deviceId: deviceConfig.deviceId,
          cwd: repoRoot,
        });

        if (job.platform === 'ios') {
          captureIosScreenshot(deviceConfig.deviceId, artifactPaths.rawPath);
        } else {
          captureAndroidScreenshot(deviceConfig.deviceId, artifactPaths.rawPath);
        }

        cropImageToTarget({
          sourcePath: artifactPaths.rawPath,
          targetPath: artifactPaths.processedPath,
          target: job.target,
          anchor: job.cropAnchor,
        });

        validateOutput(artifactPaths.processedPath, job.target);
      }

      rows.push({
        scenarioId: job.scenarioId,
        platform: job.platform,
        profileId: job.profileId,
        target: job.target,
        status: dryRun ? 'DRY_RUN' : 'SUCCESS',
        outputPath: dryRun ? artifactPaths.flowPath : artifactPaths.processedPath,
      });
    } catch (error) {
      rows.push({
        scenarioId: job.scenarioId,
        platform: job.platform,
        profileId: job.profileId,
        target: job.target,
        status: 'FAILED',
        error: error.message,
      });

      if (!continueOnError) {
        throw error;
      }
    }
  });

  const reportPath = writeReport({outDir, rows});
  return {rows, reportPath};
}

module.exports = {
  executeJobs,
  buildArtifactPaths,
  validateOutput,
};
