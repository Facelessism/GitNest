import fs from 'fs';
import path from 'path';
import simpleGit from 'simple-git';

export const cloneRepository = async (
  repositoryUrl,
  userId
) => {
  const urlPattern =
    /^https:\/\/.+\/.+\/.+(\.git)?$/i;

  if (!urlPattern.test(repositoryUrl)) {
    throw new Error('Invalid repository URL');
  }

  const repoName = repositoryUrl
    .split('/')
    .pop()
    .replace(/\.git$/i, '');

  const repoPath = path.resolve(
    process.cwd(),
    'repositories',
    userId,
    repoName
  );

  fs.mkdirSync(
    path.dirname(repoPath),
    { recursive: true }
  );

  const git = simpleGit();

  await git.clone(
    repositoryUrl,
    repoPath
  );

  return {
    repoName,
    repoPath,
  };
};
