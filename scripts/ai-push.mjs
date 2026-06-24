import { execFileSync, spawnSync } from 'node:child_process'

const isWindows = process.platform === 'win32'
const bin = (command) => (isWindows && command === 'npm' ? 'npm.cmd' : command)

const options = {
  all: false,
  branch: '',
  message: '',
  paths: [],
  remote: 'origin',
}

const args = process.argv.slice(2)

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index]

  if (arg === '--all' || arg === '-All') {
    options.all = true
  } else if (arg === '--branch' || arg === '-Branch') {
    options.branch = args[++index] ?? ''
  } else if (arg === '--message' || arg === '-m' || arg === '-CommitMessage') {
    options.message = args[++index] ?? ''
  } else if (arg === '--paths' || arg === '-Paths') {
    const value = args[++index] ?? ''
    options.paths.push(...value.split(',').map((path) => path.trim()).filter(Boolean))
  } else if (arg === '--path') {
    options.paths.push(args[++index] ?? '')
  } else if (arg === '--remote' || arg === '-Remote') {
    options.remote = args[++index] ?? 'origin'
  } else {
    options.paths.push(arg)
  }
}

const run = (command, commandArgs) => {
  const executable = isWindows && command === 'npm' ? 'cmd.exe' : bin(command)
  const args = isWindows && command === 'npm'
    ? ['/d', '/s', '/c', command, ...commandArgs]
    : commandArgs
  const result = spawnSync(executable, args, {
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    if (result.error) {
      throw result.error
    }

    throw new Error(`Command failed: ${command} ${commandArgs.join(' ')}`)
  }
}

const read = (command, commandArgs) =>
  execFileSync(bin(command), commandArgs, { encoding: 'utf8' }).trim()

if (!options.message.trim()) {
  throw new Error('Pass --message "Describe the change".')
}

if (options.all && options.paths.length > 0) {
  throw new Error('Use either --all or --paths, not both.')
}

if (!options.all && options.paths.length === 0) {
  throw new Error('Provide --paths file1,file2 or pass --all after reviewing git status.')
}

run('npm', ['run', 'lint'])
run('npm', ['run', 'build'])

if (options.all) {
  run('git', ['add', '-A'])
} else {
  run('git', ['add', '--', ...options.paths])
}

const staged = read('git', ['diff', '--cached', '--name-only'])
if (!staged) {
  console.log('No staged changes to commit.')
  process.exit(0)
}

run('git', ['commit', '-m', options.message])

const branch = options.branch || read('git', ['branch', '--show-current'])
if (!branch) {
  throw new Error('Could not determine the current branch. Pass --branch explicitly.')
}

run('git', ['push', options.remote, branch])
