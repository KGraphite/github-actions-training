const core = require('@actions/core');
const exec = require('@actions/exec');

const validateBranchName = ({ branchName }) => /^a-zA-Z0-9_\-\.\/+$/.test(branchName)
const validateDirectoryName = ({ dirName }) => /^a-zA-Z0-9_\-\/+$/.test(dirName)

async function run() { 
  const baseBranch = core.getInput('base-branch');
  const targetBranch = core.getInput('target-branch');
  const ghToken = core.getInput('gh-token');
  const workingDir = core.getInput('working-directory');
  const debug = core.getBooleanInput('debug');

  core.setSecret(ghToken); // set the ghToken as secret
  
  //validate branch and workingdir
  if (!validateBranchName( {branchName: baseBranch } )) {
    core.setFailed('Invalid base branch name. Branch names should include only characters, numbers, dots, hyphens, underscore, and forwardslash ')
    return;
  }

  if (!validateBranchName( {branchName: targetBranch } )) {
    core.setFailed('Invalid target branch name. Branch names should include only characters, numbers, dots, hyphens, underscore, and forwardslash ')
    return;  
  }

  if (!validateDirectoryName( {dirName: workingDir } )) {
    core.setFailed('Invalid directory name. Directory names should include only characters, numbers, hyphens, underscore, and forwardslash ')
    return;  
  }

  core.info(`[ js-dependency-update ] : base branch is ${baseBranch} `);
  core.info(`[ js-dependency-update ] : target branch is ${targetBranch} `);
  core.info(`[ js-dependency-update ] : working directory is ${workingDir} `);

  await exec.exec('npm update', [], {
    cwd: workingDir
  });

  const gitStatus = await exec.getExecOuput('gitstatus -s package*.json', [], {
    cwd: workingDir
  })

  if (gitStatus.stdout.length > 0) {
    core.info('[ js-dependency-update ] : There are updates available!')
  } else {
    core.info('[ js-dependency-update ] : No updates at this point in time')
  }

  /*
  1. parse inputs:
    1.1 base-branch from which to check for updates
    1.2 target-branch to use to create the PR
    1.3 github token for authentication when reaching github api ( to create PRs )
    1.4 working directory for which to check for dependencies
  2. execute npm update command within the working directory
  3. check if there are modified package*.json riles
  4 if there are modified files
    4.1 add and commit files to the target-branch 
    4.2 create a PR to the base-branch using the octokit API
  5. otherwise, conclude the custom action
  */
  core.info('I am a custom JS action');
}
 
run();