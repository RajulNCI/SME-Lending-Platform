module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat','fix','docs','style','refactor','perf',
      'test','build','ci','chore','revert','infra','security',
    ]],
    'scope-enum': [2, 'always', [
      'web','api','infra','ci','ui','tokens','shared','docs','deps','release',
    ]],
    'subject-case':    [2, 'always', 'lower-case'],
    'header-max-length':[2, 'always', 100],
  },
}
