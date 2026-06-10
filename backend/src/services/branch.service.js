import path from 'path';
import simpleGit from 'simple-git';

const getGitInstance = (userId, repoName) => {
  const repoPath = path.resolve(
    process.cwd(),
    'repositories',
    userId,
    repoName
  );

  return simpleGit(repoPath);
};

export const getBranches = async (userId, repoName) => {
  const git = getGitInstance(userId, repoName);

  const branches = await git.branchLocal();

  return {
    current: branches.current,
    branches: branches.all,
  };
};

export const createBranch = async (
  userId,
  repoName,
  branchName
) => {
  const git = getGitInstance(userId, repoName);

  await git.checkoutLocalBranch(branchName);
};

export const checkoutBranch = async (
  userId,
  repoName,
  branchName
) => {
  const git = getGitInstance(userId, repoName);

  await git.checkout(branchName);
};

export const deleteBranch = async (
  userId,
  repoName,
  branchName
) => {
  const git = getGitInstance(userId, repoName);

  const branches = await git.branchLocal();

  if (branches.current === branchName) {
    throw new Error('Cannot delete the current branch');
  }

  if (branchName === 'main') {
    throw new Error('Cannot delete the main branch');
  }

  await git.deleteLocalBranch(branchName);
};
