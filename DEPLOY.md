# Deploy

Static site, built locally and copied to the VPS by hand. No CI.

- **Host / SSH alias:** `minda-vps` (user `mindaadmin`)
- **Path on server:** `/home/mindaadmin/typpy/public` (served as `/usr/share/nginx/html`)
- **How it's served:** docker nginx container `nginx-server` (`/home/mindaadmin/typpy/docker-compose.yml`, image `nginx:latest`, network `npm_web`), fronted by Nginx Proxy Manager (`~/nginx_proxy_manager`, host config `proxy_host/10.conf` for `typpy.online`).
- **Build:** `npm run build` (runs `prebuild` sitemap script, then Astro; outputs `dist/`; Node >= 22.12.0).
- **Ship:**
  1. `npm run build`
  2. Back up: `ssh minda-vps 'cp -a ~/typpy/public ~/typpy/public.bak-$(date +%F)'`
  3. `rsync -az --delete dist/ minda-vps:/home/mindaadmin/typpy/public/`
- **Restart requirements:** none; nginx serves the new files directly.
- **Env vars / secrets:** none for the site. AdSense and GA/GTM IDs are in `src/layouts/Layout.astro`.
- **Git:** `origin` is `https://github.com/sooonism/typpy-online.git`, branch `main`.
