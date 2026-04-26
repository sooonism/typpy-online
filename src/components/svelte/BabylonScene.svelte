<script>
  import { onDestroy, onMount } from 'svelte';
  import {
    ArcRotateCamera,
    Color4,
    DirectionalLight,
    Engine,
    HemisphericLight,
    MeshBuilder,
    Scene,
    StandardMaterial,
    Vector3,
    DynamicTexture,
    Color3,
    PlaneMesh,
    Mesh,
  } from 'babylonjs';

  let canvas;
  let engine;
  
  // Movement state
  let activeKeys = new Set();
  let spherePosX = 2.5;
  let spherePosZ = 0;
  let currentYaw = 0;
  const MOVE_SPEED = 7.0;
  
  // Ground dimensions (easily change these)
  const GROUND_WIDTH = 20;   // X-axis size
  const GROUND_HEIGHT = 40;  // Z-axis size
  const SPHERE_RADIUS = 0.6;
  
  // Compute ground limits based on size and sphere radius
  const GROUND_LIMIT_X = GROUND_WIDTH / 2 - SPHERE_RADIUS;
  const GROUND_LIMIT_Z = GROUND_HEIGHT / 2 - SPHERE_RADIUS;

  // Central cube collision box (size 1.5, center at (0, 0.75, 0))
  const BOX_MIN = new Vector3(-0.75, 0, -0.75);
  const BOX_MAX = new Vector3(0.75, 1.5, 0.75);

  // Helper: creates a grid texture with lines every 'cellSize' units, major lines every 'majorStep'
  function createGridTexture(scene, cellSize = 2, majorStep = 5, lineColor = "#ffffff", majorLineColor = "#ffaa44", bgTransparent = true) {
    // texture resolution: higher = sharper lines, but we scale it based on world units
    const texSize = 1024;
    const texture = new DynamicTexture("gridTexture", texSize, scene, false);
    const ctx = texture.getContext();
    
    // Clear background
    if (bgTransparent) {
      ctx.clearRect(0, 0, texSize, texSize);
    } else {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, texSize, texSize);
    }
    
    // How many pixels per world unit? We'll decide based on a reference:
    // We want the texture to repeat every N world units. Let's make the texture represent a 10x10 unit tile.
    // That way we can set texture scale to (GROUND_WIDTH/10, GROUND_HEIGHT/10) to cover the ground.
    // But easier: we draw lines at intervals proportional to world units, and then map texture directly with scaling.
    // Since the ground is 20x40, we can draw a fixed number of lines across the texture that correspond to world cells.
    // Let's make the texture represent a 20x40 area? That would be huge texture resolution per unit.
    // Better: draw a tiling pattern: texture represents a 5x5 unit area, then repeat.
    const tileSizeWorld = 5; // each tile in world units (5x5 area)
    const tilePixels = texSize; // full texture represents tileSizeWorld x tileSizeWorld world units
    const pixelsPerUnit = tilePixels / tileSizeWorld;
    
    ctx.save();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    // Draw vertical lines (X direction) within the tile
    for (let x = 0; x <= tileSizeWorld; x += cellSize) {
      const screenX = x * pixelsPerUnit;
      // Determine if major line
      const isMajor = (Math.abs(x % majorStep) < 0.01);
      if (isMajor) {
        ctx.strokeStyle = majorLineColor;
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1.5;
      }
      ctx.beginPath();
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, tilePixels);
      ctx.stroke();
    }
    
    // Draw horizontal lines (Z direction)
    for (let z = 0; z <= tileSizeWorld; z += cellSize) {
      const screenY = z * pixelsPerUnit;
      const isMajor = (Math.abs(z % majorStep) < 0.01);
      if (isMajor) {
        ctx.strokeStyle = majorLineColor;
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1.5;
      }
      ctx.beginPath();
      ctx.moveTo(0, screenY);
      ctx.lineTo(tilePixels, screenY);
      ctx.stroke();
    }
    
    ctx.restore();
    texture.update(false);
    
    // Setup wrap and sampling
    texture.wrapU = 1; // Repeat
    texture.wrapV = 1;
    texture.uScale = GROUND_WIDTH / tileSizeWorld;
    texture.vScale = GROUND_HEIGHT / tileSizeWorld;
    
    return texture;
  }

  function handleResize() {
    if (engine) engine.resize();
  }

  function handleKeyDown(e) {
    const key = e.code;
    if (key === 'KeyW' || key === 'KeyA' || key === 'KeyS' || key === 'KeyD') {
      e.preventDefault();
      activeKeys.add(key);
    }
  }

  function handleKeyUp(e) {
    const key = e.code;
    if (key === 'KeyW' || key === 'KeyA' || key === 'KeyS' || key === 'KeyD') {
      e.preventDefault();
      activeKeys.delete(key);
    }
  }

  function getMovementDirection(camera) {
    let xInput = 0;
    let zInput = 0;
    
    if (activeKeys.has('KeyW')) zInput += 1;
    if (activeKeys.has('KeyS')) zInput -= 1;
    if (activeKeys.has('KeyD')) xInput += 1;
    if (activeKeys.has('KeyA')) xInput -= 1;
    
    if (xInput !== 0 || zInput !== 0) {
      const len = Math.hypot(xInput, zInput);
      xInput /= len;
      zInput /= len;
    }
    
    const forward = camera.getForwardRay().direction.clone();
    forward.y = 0;
    forward.normalize();
    const right = camera.getDirection(new Vector3(1, 0, 0));
    right.y = 0;
    right.normalize();
    
    const moveDir = new Vector3(0, 0, 0);
    moveDir.addInPlace(right.scale(xInput));
    moveDir.addInPlace(forward.scale(zInput));
    
    return moveDir;
  }

  // Sphere vs AABB collision resolution
  function resolveCollisionWithBox(sphereCenter, radius, boxMin, boxMax) {
    const closest = new Vector3(
      Math.max(boxMin.x, Math.min(sphereCenter.x, boxMax.x)),
      Math.max(boxMin.y, Math.min(sphereCenter.y, boxMax.y)),
      Math.max(boxMin.z, Math.min(sphereCenter.z, boxMax.z))
    );
    
    const delta = sphereCenter.subtract(closest);
    const distSq = delta.lengthSquared();
    const minDist = radius;
    
    if (distSq < minDist * minDist) {
      const dist = Math.sqrt(distSq);
      const normal = delta.clone().normalize();
      const correction = normal.scale(minDist - dist);
      return sphereCenter.add(correction);
    }
    return sphereCenter;
  }

  onMount(() => {
    if (!canvas) return;

    engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.03, 0.06, 0.12, 1);

    const camera = new ArcRotateCamera('camera', 0, Math.PI / 10, 27, new Vector3(1, 0, 0), scene);
    // camera.attachControl(canvas, true); // optional

    new HemisphericLight('hemi', new Vector3(0, 1, 0), scene).intensity = 0.75;
    new DirectionalLight('dir', new Vector3(-1, -2, -1), scene).intensity = 0.55;

    // Create ground with dynamic dimensions
    const ground = MeshBuilder.CreateGround('ground', { width: GROUND_WIDTH, height: GROUND_HEIGHT }, scene);
    const box = MeshBuilder.CreateBox('box', { size: 1.5 }, scene);
    box.position.y = 0.75;

    const sphere = MeshBuilder.CreateSphere('sphere', { diameter: SPHERE_RADIUS * 2 }, scene);
    sphere.position.x = spherePosX;
    sphere.position.z = spherePosZ;
    sphere.position.y = 0.6;

    // Front cube child
    const frontCube = MeshBuilder.CreateBox('frontCube', { size: 0.5 }, scene);
    const cubeMaterial = new StandardMaterial('cubeMat', scene);
    cubeMaterial.diffuseColor.set(0.2, 0.9, 0.3);
    frontCube.material = cubeMaterial;
    frontCube.position.z = SPHERE_RADIUS + 0.25;
    frontCube.position.y = 0;
    frontCube.parent = sphere;

    const mat = new StandardMaterial('box-mat', scene);
    mat.diffuseColor.set(0.29, 0.87, 0.99);
    mat.emissiveColor.set(0.03, 0.12, 0.16);
    box.material = mat;

    const sphereMat = new StandardMaterial('sphere-mat', scene);
    sphereMat.diffuseColor.set(0.98, 0.72, 0.26);
    sphere.material = sphereMat;

    const groundMat = new StandardMaterial('ground-mat', scene);
    groundMat.diffuseColor.set(0.12, 0.18, 0.26);
    ground.material = groundMat;

    // ----- GRID ON FLOOR (distance estimation) -----
    // Create a separate plane slightly above ground with grid texture
    const gridTexture = createGridTexture(scene, 1, 5, "#aaccff", "#ffaa66", true);
    const gridMaterial = new StandardMaterial("gridMat", scene);
    gridMaterial.diffuseTexture = gridTexture;
    gridMaterial.useAlphaFromDiffuseTexture = true; // for transparency
    gridMaterial.opacityTexture = gridTexture;
    gridMaterial.backFaceCulling = false;
    
    // Grid plane with same dimensions as ground
    const gridPlane = MeshBuilder.CreatePlane("gridPlane", { width: GROUND_WIDTH, height: GROUND_HEIGHT }, scene);
    gridPlane.material = gridMaterial;
    gridPlane.position.y = 0.02; // just above ground to avoid z-fighting
    gridPlane.rotation.x = Math.PI / 2; // rotate to be horizontal
    // Ensure grid doesn't cast/receive shadows
    gridPlane.receiveShadows = false;
    
    // Optional: make the grid lines always visible by adjusting rendering group
    gridPlane.renderingGroupId = 1;
    ground.renderingGroupId = 0;
    // ----- END GRID -----

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    scene.onBeforeRenderObservable.add(() => {
      const dt = engine.getDeltaTime() / 1000;
      
      box.rotation.y += dt * 1.2;
      
      let moveDir = null;
      if (activeKeys.size > 0) {
        moveDir = getMovementDirection(camera);
        let newX = spherePosX + moveDir.x * MOVE_SPEED * dt;
        let newZ = spherePosZ + moveDir.z * MOVE_SPEED * dt;
        
        // Apply ground boundaries using dynamic limits
        newX = Math.min(GROUND_LIMIT_X, Math.max(-GROUND_LIMIT_X, newX));
        newZ = Math.min(GROUND_LIMIT_Z, Math.max(-GROUND_LIMIT_Z, newZ));
        
        let newCenter = new Vector3(newX, 0.6, newZ);
        newCenter = resolveCollisionWithBox(newCenter, SPHERE_RADIUS, BOX_MIN, BOX_MAX);
        
        spherePosX = newCenter.x;
        spherePosZ = newCenter.z;
      }
      
      if (moveDir && (moveDir.x !== 0 || moveDir.z !== 0)) {
        currentYaw = Math.atan2(moveDir.x, moveDir.z);
      }
      sphere.rotation.y = currentYaw;
      
      sphere.position.x = spherePosX;
      sphere.position.z = spherePosZ;
      sphere.position.y = 0.6 + Math.sin(performance.now() * 0.002) * 0.2;
    });

    engine.runRenderLoop(() => {
      scene.render();
    });

    window.addEventListener('resize', handleResize);
  });

  onDestroy(() => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    if (engine) {
      engine.dispose();
      engine = null;
    }
  });
</script>

<section class="scene-shell">
  <div class="label">
    <h2>BabylonJS + Svelte</h2>
    <p>Orbit with drag. Scroll to zoom. <strong>WASD moves sphere – dynamic ground limits (width {GROUND_WIDTH}, height {GROUND_HEIGHT}) + collision with central cube + green front cube child + grid overlay for distance estimation (1-unit cells, major lines every 5 units)</strong></p>
  </div>
  <canvas bind:this={canvas}></canvas>
</section>

<style>
  .scene-shell {
    width: min(980px, 96vw);
    margin: 2rem auto;
    border-radius: 16px;
    overflow: hidden;
    background: radial-gradient(circle at top left, #1a2942, #090f1a 70%);
    box-shadow: 0 20px 48px rgba(3, 8, 20, 0.48);
  }

  .label {
    padding: 0.9rem 1rem;
    color: #ecf5ff;
    border-bottom: 1px solid rgba(236, 245, 255, 0.15);
  }

  h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
  }

  p {
    margin: 0.25rem 0 0;
    opacity: 0.82;
    font-size: 0.9rem;
  }

  canvas {
    width: 100%;
    height: clamp(340px, 60vh, 620px);
    display: block;
    touch-action: none;
  }
</style>