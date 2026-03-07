// GitHub API Client
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  throw new Error('Missing GITHUB_TOKEN environment variable');
}

const API_BASE = 'https://api.github.com';

async function request(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  return response.json();
}

// Get user repos
export async function getRepos() {
  return request('/user/repos?sort=updated&per_page=100');
}

// Get repo
export async function getRepo(owner: string, repo: string) {
  return request(`/repos/${owner}/${repo}`);
}

// Create issue
export async function createIssue(owner: string, repo: string, params: {
  title: string;
  body?: string;
  labels?: string[];
}) {
  return request(`/repos/${owner}/${repo}/issues`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// Get pull requests
export async function getPullRequests(owner: string, repo: string) {
  return request(`/repos/${owner}/${repo}/pulls`);
}