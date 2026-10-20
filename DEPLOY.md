# Deploy

Static site, built locally and copied to the VPS by hand. No CI.

- **Host / SSH alias:** `minda-vps` (user `mindaadmin`)
- **Path on server:** `/home/mindaadmin/typpy/public` (served as `/usr/share/nginx/html`)
- **How it's served:** docker nginx container `nginx-server` (`/home/mindaadmin/typpy/docker-compose.yml`, image `nginx:latest`, network `npm_web`), fronted by Nginx Proxy Manager (`~/nginx_proxy_manager`, host config `proxy_host/10.conf` for `typpy.online`). `docker-compose.yml` and the `absolute_redirect off;` conf snippet it mounts are versioned here in `infra/` — if the VPS copy ever needs restoring, `scp infra/* minda-vps:~/typpy/` then `cd ~/typpy && docker compose up -d`. `absolute_redirect off;` exists because the backend only speaks plain HTTP (TLS ends at NPM/Cloudflare); without it, nginx's built-in directory redirect (`/about` → `/about/`) emitted an absolute `http://` Location header, silently downgrading every non-trailing-slash request to HTTP for one hop before NPM forced it back to HTTPS — wasteful and one plausible cause of Search Console's "page with redirect" / "redirect error" flags (fixed 2026-10-18).
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
- **Env vars / secrets:** none for the site. AdSense and GA/GTM IDs are in `src/layouts/Layout.astro`. The four standalone Tidy pages (`tidy`, `tidy-es`, `tidy-ja`, `tidy-ms`) don't use the layout, so each carries its own GA4 tag (`G-FKXKL01WVD`) and sends `round_start` / `round_complete` events with `game`, `language`, `room_size` (and `duration_s`).
- **Git:** `origin` is `https://github.com/sooonism/typpy-online.git`, branch `main`.

## Bing Webmaster Tools

Verified 2026-10-20 via the `<meta name="msvalidate.01" content="FDCE188679599DD2E14450C8E7AF810B" />` tag in src/layouts/Layout.astro (one token per Bing account, same on all sites). **Do not remove it** or Bing drops verification. Sitemap submitted: https://typpy.online/sitemap.xml.

## IndexNow

Key file `public/b52fe43a7c38c995c3b5ff2a819a95c1.txt` (same key on all four sites) is served at the site root. After any deploy that adds or changes pages, re-ping: `~/gitlab/pi_agents/marketing-agents/scripts/indexnow.sh <host> [sitemap-url]` (sitemap defaults to `/sitemap.xml`; tinymath and tinyform use `/sitemap-index.xml`). Set up 2026-10-20.
