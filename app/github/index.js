require('dotenv').config();
const octokit = require("@octokit/rest")({
  auth: process.env.GITHUB_USER_KEY,
});

function createFile({ owner, repo, path, commitMessage, content }) {
  const base64Content = Buffer.from(content).toString('base64');

  return octokit.repos.createOrUpdateFile({
    owner: owner,
    repo: repo,
    path: path,
    message: commitMessage,
    content: base64Content,
  });
}

module.exports = {
  createFile,
};
