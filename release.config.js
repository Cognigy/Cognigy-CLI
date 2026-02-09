module.exports = {
  branches: [
    'main',
    {
      name: 'develop',
      prerelease: true,
    },
  ],
  // Explicitly configure verifyConditions to skip npm verification.
  // Per npm docs: "npm whoami will not reflect OIDC authentication status since
  // the authentication occurs only during the publish operation."
  verifyConditions: [
    '@semantic-release/changelog',
    '@semantic-release/github',
    '@semantic-release/git',
  ],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'angular',
        releaseRules: [
          { type: 'docs', scope: 'README', release: 'patch' },
          { type: 'refactor', release: 'patch' },
          { type: 'style', release: 'patch' },
        ],
      },
    ],
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
      },
    ],
    // Use @semantic-release/exec instead of @semantic-release/npm because:
    // 1. @semantic-release/npm runs 'npm whoami' during prepare/publish which fails
    //    with trusted publishing (OIDC auth only works during 'npm publish').
    // 2. npm 11.5.1+ automatically handles OIDC auth and provenance when running
    //    'npm publish' directly — no --provenance flag needed.
    // 3. The actual npm publish runs as a separate workflow step where OIDC env vars
    //    (ACTIONS_ID_TOKEN_REQUEST_URL/TOKEN) are available.
    [
      '@semantic-release/exec',
      {
        prepareCmd:
          'npm version ${nextRelease.version} --no-git-tag-version --allow-same-version',
        // Write the new version to a file so the workflow step can detect it
        publishCmd: 'echo "${nextRelease.version}" > .semantic-release-version',
      },
    ],
    '@semantic-release/github',
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json', 'package-lock.json'],
        message:
          // eslint-disable-next-line no-template-curly-in-string
          'chore(release): set `package.json` to ${nextRelease.version} [skip ci]',
      },
    ],
  ],
};
