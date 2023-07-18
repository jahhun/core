module.exports = {
  displayName: 'journeys-ui',
  preset: '../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/journeys/ui',
  setupFilesAfterEnv: ['<rootDir>setupTests.ts'],
  collectCoverage: true,
  coverageReporters: ['cobertura']
}
