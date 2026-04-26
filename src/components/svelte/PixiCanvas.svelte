<script>
  import { onDestroy, onMount } from 'svelte';
  import { Application, Graphics, Text } from 'pixi.js';

  let container;
  let app;

  onMount(async () => {
    if (!container) return;

    app = new Application();
    await app.init({
      background: '#0c1323',
      antialias: true,
      resizeTo: container,
    });

    container.appendChild(app.canvas);

    const ball = new Graphics().circle(0, 0, 28).fill('#52f7d4');
    ball.x = 70;
    ball.y = 70;

    const label = new Text({
      text: 'PixiJS + Svelte',
      style: {
        fill: '#f5f8ff',
        fontFamily: 'monospace',
        fontSize: 20,
      },
    });
    label.x = 18;
    label.y = 16;

    app.stage.addChild(ball);
    app.stage.addChild(label);

    let vx = 2.8;
    let vy = 2.2;
    app.ticker.add(() => {
      const width = app.screen.width;
      const height = app.screen.height;

      ball.x += vx;
      ball.y += vy;

      if (ball.x >= width - 28 || ball.x <= 28) vx *= -1;
      if (ball.y >= height - 28 || ball.y <= 28) vy *= -1;
    });
  });

  onDestroy(() => {
    if (app) {
      app.destroy(true, { children: true, texture: true });
      app = null;
    }
  });
</script>

<div class="pixi-shell">
  <div class="pixi-canvas" bind:this={container}></div>
</div>

<style>
  .pixi-shell {
    width: min(920px, 96vw);
    margin: 2rem auto;
    padding: 1rem;
    border-radius: 16px;
    background: linear-gradient(135deg, #16223f, #0b1325 70%);
    box-shadow: 0 16px 45px rgba(2, 6, 23, 0.45);
  }

  .pixi-canvas {
    width: 100%;
    height: clamp(280px, 50vh, 560px);
    border-radius: 12px;
    overflow: hidden;
  }

  .pixi-canvas :global(canvas) {
    display: block;
  }
</style>