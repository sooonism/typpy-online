# Typpy — online

Typpy is a web-based typing game collection focused on training speed, accuracy, and cognition. This repo contains an Astro site that integrates Svelte game components (ZenType, TypeFall) and a set of static pages.

Quick start

Requirements
- Node.js >= 22.12.0
- npm (bundled with Node)

Install

```bash
npm install
```

Run the dev server

```bash
npm run dev
# or for LAN preview
# npm run dev:lan
```

Open http://localhost:3000 (or the port printed by Astro).

Build

```bash
npm run build
npm run preview
```

Games
- /games — index page with links to available games
- /games/zentype — ZenType (calm typing practice)
- /games/typefall — TypeFall (falling words arcade)

Git / GitHub: initialize, commit, and push

If you don't yet have a git repo for this project locally, here are common commands to create it and push to GitHub.

1) Initialize locally and commit

```bash
git init
git add -A
git commit -m "Initial commit: typpy-online"
git branch -M main
```

2) Create a GitHub repo & push

Option A — using the GitHub CLI (gh) (recommended if you have it authenticated):

```bash
# create a new public repo and push local contents
gh repo create <YOUR_USER_OR_ORG>/<REPO_NAME> --public --source=. --remote=origin --push
```

Option B — via GitHub web UI
- Create a new repository on github.com (no README, no .gitignore) and copy the remote URL.

Then add remote and push:

```bash
# using HTTPS
git remote add origin https://github.com/<YOUR_USER_OR_ORG>/<REPO_NAME>.git
# or using SSH
# git remote add origin git@github.com:<YOUR_USER_OR_ORG>/<REPO_NAME>.git

git push -u origin main
```

Notes about authentication
- For HTTPS: you may need a personal access token (PAT) configured as a credential helper or use a password prompt depending on your git setup.
- For SSH: ensure your SSH key is added to your GitHub account and the ssh-agent is running.

Want me to push from this machine?
I can run the git commands here for you and attempt to push if you provide one of the following:
- the GitHub repo remote URL (SSH or HTTPS) and confirm you want me to run the push here; or
- permission to create the remote using `gh` (I can attempt `gh repo create` if `gh` is installed and authenticated in this environment).

If you prefer to keep your credentials local, follow the commands above on your machine and tell me if you hit any authentication errors — I can help troubleshoot.

License

MIT
