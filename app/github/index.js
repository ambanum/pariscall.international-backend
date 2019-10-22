require('dotenv').config();
const sanitize = require('sanitize-filename');
const changeCase = require('change-case');
const diacritics = require('diacritics');

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

function sanitizeName(filename) {
  return diacritics.remove(changeCase.snakeCase(sanitize(filename)));
}

module.exports = {
  createFile,
  sanitizeName
};
