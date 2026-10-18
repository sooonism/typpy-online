# Deploy

Static site, built locally and copied to the VPS by hand. No CI.

- **Host / SSH alias:** `minda-vps` (user `mindaadmin`)
- **Path on server:** `/home/mindaadmin/typpy/public` (served as `/usr/share/nginx/html`)
- **How it's served:** docker nginx container `nginx-server` (`/home/mindaadmin/typpy/docker-compose.yml`, image `nginx:latest`, network `npm_web`), fronted by Nginx Proxy Manager (`~/nginx_proxy_manager`, host config `proxy_host/10.conf` for `typpy.online`).
- **Build:** `npm run build` (runs `prebuild` sitemap script, then Astro; outputs `dist/`; Node >= 22.12.0).
- **Ship:**
  1. `npm run build`
  2. Back up: `ssh minda-vps 'cp -a ~/typpy/public ~/typpy/public.bak-$(date +%F)'`
  3. `rsync -az --delete dist/ minda-vps:/home/mindaadmin/typpy/public/` — **rsync is not installed on the VPS** (confirmed 2026-10-18) and `mindaadmin` has no passwordless sudo to install it, so this fails with "command not found" on the remote side. Until rsync is installed there, sync in place instead (do **not** replace the `public` directory wholesale — see the warning below):
     ```
     ssh minda-vps 'rm -rf ~/typpy/public.new && mkdir -p ~/typpy/public.new'
     COPYFILE_DISABLE=1 tar czf - -C dist --exclude='.DS_Store' . | ssh minda-vps 'tar xzf - -C ~/typpy/public.new'
     ssh minda-vps '
       cp -a ~/typpy/public.new/. ~/typpy/public/ &&
       comm -23 <(cd ~/typpy/public && find . -type f | sort) <(cd ~/typpy/public.new && find . -type f | sort) |
         while IFS= read -r f; do rm -f "$HOME/typpy/public/$f"; done &&
       rm -rf ~/typpy/public.new
     '
     ```
     `COPYFILE_DISABLE=1` stops macOS tar from embedding AppleDouble `._*` resource-fork files that GNU tar on the remote end would otherwise extract as literal junk files.
- **Do not replace the `public` directory itself** (`mv`, `rm -rf` + recreate, etc.) — `nginx-server`'s Docker bind mount is attached to that directory's inode, so swapping in a new directory at the same path silently breaks the mount (the container keeps serving an empty/stale view) until `docker restart nginx-server`. Sync files *into* the existing directory instead, as above.
- **Restart requirements:** none for a normal in-place sync; nginx serves the new files directly. Only needed if the `public` directory itself was ever replaced (see above) — `docker restart nginx-server`.
- **Env vars / secrets:** none for the site. AdSense and GA/GTM IDs are in `src/layouts/Layout.astro`.
- **Git:** `origin` is `https://github.com/sooonism/typpy-online.git`, branch `main`.
