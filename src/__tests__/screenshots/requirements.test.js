const {
  normalizePlatformSelection,
  resolveScreenshotJobs,
} = require('../../../scripts/screenshots/lib/requirements');

describe('screenshot requirements mapping', () => {
  const requirements = {
    ios: {
      profiles: [
        {id: 'iphone_65', store: 'appstore', required: true, target: {width: 1, height: 2}},
      ],
    },
    android: {
      profiles: [
        {id: 'phone', store: 'playstore', required: true, target: {width: 3, height: 4}},
      ],
    },
  };

  const scenarios = [
    {
      scenario: 'home',
      name: 'Home',
      screenshot: 'home',
      platforms: ['ios', 'android'],
      steps: [{action: 'launchApp', params: {}}],
    },
  ];

  it('normalizes platform selection', () => {
    expect(normalizePlatformSelection('both')).toEqual(['ios', 'android']);
    expect(normalizePlatformSelection('ios')).toEqual(['ios']);
    expect(() => normalizePlatformSelection('web')).toThrow('Unsupported platform argument: web');
  });

  it('builds jobs by platform/profile', () => {
    const jobs = resolveScreenshotJobs({
      requirements,
      scenarios,
      platformSelection: 'both',
      scenarioFilter: '',
    });

    expect(jobs).toHaveLength(2);
    expect(jobs.map(job => `${job.platform}:${job.profileId}`)).toEqual([
      'ios:iphone_65',
      'android:phone',
    ]);
  });
});
