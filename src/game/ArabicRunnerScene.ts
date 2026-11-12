import * as Phaser from 'phaser';
import { audioService } from '../services/audioService';

export interface GameEventCallbacks {
  onScoreUpdate: (score: number, coins: number, distance: number) => void;
  onLivesUpdate: (lives: number) => void;
  onTriggerQuiz: (speed: number) => void;
  onGameOver: (finalStats: { score: number; coins: number; distance: number }) => void;
  onPowerUpActive: (powerUp: string, duration: number) => void;
}

export class ArabicRunnerScene extends Phaser.Scene {
  private callbacks!: GameEventCallbacks;

  // Lane Configuration
  // 3 Lanes centered in canvas
  private readonly LANE_POSITIONS = [-140, 0, 140];
  private currentLane = 1; // 0 = Left, 1 = Center, 2 = Right
  private targetX = 0;

  // Player properties
  private player!: Phaser.GameObjects.Container;
  private playerSprite!: Phaser.GameObjects.Graphics;
  private playerShadow!: Phaser.GameObjects.Graphics;
  private shieldGlow!: Phaser.GameObjects.Graphics;
  private magnetGlow!: Phaser.GameObjects.Graphics;
  private isJumping = false;
  private isSliding = false;
  private playerBaseY = 460;
  private jumpTween?: Phaser.Tweens.Tween;
  private slideTimer?: Phaser.Time.TimerEvent;

  // Game state
  private isGameRunning = false;
  private isPaused = false;
  private score = 0;
  private coins = 0;
  private distance = 0;
  private lives = 3;
  private baseSpeed = 340;
  private currentSpeed = 340;

  // Power-ups
  private hasShield = false;
  private hasMagnet = false;
  private doubleMultiplier = false;
  private magnetTimer?: Phaser.Time.TimerEvent;
  private shieldTimer?: Phaser.Time.TimerEvent;
  private doubleTimer?: Phaser.Time.TimerEvent;

  // Groups
  private obstacles!: Phaser.GameObjects.Group;
  private coinsGroup!: Phaser.GameObjects.Group;
  private scrollsGroup!: Phaser.GameObjects.Group;
  private powerUpsGroup!: Phaser.GameObjects.Group;
  private sceneryGroup!: Phaser.GameObjects.Group;

  // Environment elements
  private roadGraphics!: Phaser.GameObjects.Graphics;
  private roadDashes: Phaser.GameObjects.Rectangle[] = [];
  private bgMountains: Phaser.GameObjects.Graphics[] = [];

  // Spawners & Timers
  private spawnTimer = 0;
  private nextQuizDistance = 350;

  // Controls
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private touchStartX = 0;
  private touchStartY = 0;

  constructor() {
    super({ key: 'ArabicRunnerScene' });
  }

  init(data: { callbacks: GameEventCallbacks }) {
    this.callbacks = data.callbacks;
    this.currentLane = 1;
    this.lives = 3;
    this.score = 0;
    this.coins = 0;
    this.distance = 0;
    this.currentSpeed = this.baseSpeed;
    this.hasShield = false;
    this.hasMagnet = false;
    this.doubleMultiplier = false;
    this.nextQuizDistance = 350;
    this.isGameRunning = true;
    this.isPaused = false;
  }

  preload() {
    // Generate programmatic procedural textures
    this.generateProceduralTextures();
  }

  create() {
    const { width, height } = this.scale;

    // Draw desert sky gradient
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x1e3a8a, 0x1e3a8a, 0xf59e0b, 0xf97316, 1);
    sky.fillRect(0, 0, width, height);

    // Distant Oriental City Silhouette (Minarets, domes, palm trees)
    this.createDistantCitySilhouette(width, height);

    // 3-Lane Roadway with Arabic Mosaic Border
    this.createRoadway(width, height);

    // Groups
    this.sceneryGroup = this.add.group();
    this.obstacles = this.add.group();
    this.coinsGroup = this.add.group();
    this.scrollsGroup = this.add.group();
    this.powerUpsGroup = this.add.group();

    // Player Setup
    this.createPlayer(width);

    // Keyboard controls
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

      this.input.keyboard.on('keydown', this.handleKeyDown, this);
    }

    // Touch / Swipe controls
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.touchStartX = pointer.x;
      this.touchStartY = pointer.y;
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      const diffX = pointer.x - this.touchStartX;
      const diffY = pointer.y - this.touchStartY;
      const minSwipeDistance = 35;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > minSwipeDistance) {
          if (diffX > 0) this.moveLane(1);
          else this.moveLane(-1);
        }
      } else {
        if (Math.abs(diffY) > minSwipeDistance) {
          if (diffY < 0) this.jump();
          else this.slide();
        }
      }
    });

    // Notify initial state
    this.callbacks.onLivesUpdate(this.lives);
    this.callbacks.onScoreUpdate(this.score, this.coins, Math.floor(this.distance));
  }

  private generateProceduralTextures() {
    // Check if texture exists before creating
    if (!this.textures.exists('coin_tex')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Coin: Gold circle with Arabic motif
      g.fillStyle(0xf59e0b, 1);
      g.fillCircle(18, 18, 16);
      g.lineStyle(2, 0xfef08a, 1);
      g.strokeCircle(18, 18, 14);
      g.fillStyle(0xd97706, 1);
      g.fillCircle(18, 18, 10);
      g.generateTexture('coin_tex', 36, 36);
      g.destroy();
    }

    if (!this.textures.exists('scroll_tex')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Arabic Knowledge Scroll (مخطوطة)
      g.fillStyle(0xfef3c7, 1);
      g.fillRoundedRect(4, 4, 32, 40, 6);
      g.lineStyle(3, 0xb45309, 1);
      g.strokeRoundedRect(4, 4, 32, 40, 6);
      // Arabic text lines simulation
      g.fillStyle(0x92400e, 1);
      g.fillRect(10, 12, 20, 3);
      g.fillRect(10, 18, 20, 3);
      g.fillRect(10, 24, 14, 3);
      g.generateTexture('scroll_tex', 40, 48);
      g.destroy();
    }
  }

  private createDistantCitySilhouette(width: number, height: number) {
    const skyline = this.add.graphics();
    skyline.fillStyle(0x0f172a, 0.45);

    // City outline: Domes, arches, minarets
    skyline.beginPath();
    skyline.moveTo(0, height * 0.42);

    let currX = 0;
    while (currX < width + 50) {
      const buildingWidth = 35 + Math.random() * 45;
      const bHeight = 40 + Math.random() * 70;
      const baseY = height * 0.42;

      if (Math.random() > 0.5) {
        // Minaret / spire
        skyline.lineTo(currX, baseY);
        skyline.lineTo(currX + 8, baseY - bHeight - 35);
        skyline.lineTo(currX + 16, baseY);
        currX += 25;
      } else {
        // Mosque Dome
        skyline.lineTo(currX, baseY);
        skyline.arc(currX + buildingWidth / 2, baseY - 20, buildingWidth / 2, Math.PI, 0, false);
        skyline.lineTo(currX + buildingWidth, baseY);
        currX += buildingWidth;
      }
    }
    skyline.lineTo(width, height * 0.42);
    skyline.lineTo(0, height * 0.42);
    skyline.closePath();
    skyline.fillPath();

    // Sand dune horizon
    const dune = this.add.graphics();
    dune.fillStyle(0xd97706, 0.85);
    dune.beginPath();
    dune.moveTo(0, height * 0.4);
    dune.lineTo(width * 0.35, height * 0.36);
    dune.lineTo(width * 0.7, height * 0.42);
    dune.lineTo(width, height * 0.4);
    dune.lineTo(width, height);
    dune.lineTo(0, height);
    dune.closePath();
    dune.fillPath();
  }

  private createRoadway(width: number, height: number) {
    const centerX = width / 2;
    this.roadGraphics = this.add.graphics();

    // Main paved avenue
    const roadWidthTop = 260;
    const roadWidthBottom = 420;
    const topY = height * 0.38;
    const bottomY = height;

    this.roadGraphics.fillStyle(0x27272a, 1); // Dark stone road
    this.roadGraphics.beginPath();
    this.roadGraphics.moveTo(centerX - roadWidthTop / 2, topY);
    this.roadGraphics.lineTo(centerX + roadWidthTop / 2, topY);
    this.roadGraphics.lineTo(centerX + roadWidthBottom / 2, bottomY);
    this.roadGraphics.lineTo(centerX - roadWidthBottom / 2, bottomY);
    this.roadGraphics.closePath();
    this.roadGraphics.fillPath();

    // Golden mosaic borders on sides
    this.roadGraphics.lineStyle(10, 0xf59e0b, 1);
    this.roadGraphics.beginPath();
    this.roadGraphics.moveTo(centerX - roadWidthTop / 2, topY);
    this.roadGraphics.lineTo(centerX - roadWidthBottom / 2, bottomY);
    this.roadGraphics.moveTo(centerX + roadWidthTop / 2, topY);
    this.roadGraphics.lineTo(centerX + roadWidthBottom / 2, bottomY);
    this.roadGraphics.strokePath();

    // Lane divider stripes
    for (let i = 0; i < 9; i++) {
      const y = topY + (i * (bottomY - topY)) / 8;
      const leftDash = this.add.rectangle(centerX - 48, y, 6, 24, 0xfbbf24).setOrigin(0.5);
      const rightDash = this.add.rectangle(centerX + 48, y, 6, 24, 0xfbbf24).setOrigin(0.5);
      this.roadDashes.push(leftDash, rightDash);
    }
  }

  private createPlayer(width: number) {
    const centerX = width / 2;
    this.targetX = centerX + this.LANE_POSITIONS[this.currentLane];

    this.player = this.add.container(this.targetX, this.playerBaseY);

    // Drop shadow
    this.playerShadow = this.add.graphics();
    this.playerShadow.fillStyle(0x000000, 0.35);
    this.playerShadow.fillEllipse(0, 38, 54, 18);
    this.player.add(this.playerShadow);

    // Glowing shield aura (hidden by default)
    this.shieldGlow = this.add.graphics();
    this.shieldGlow.fillStyle(0x38bdf8, 0.35);
    this.shieldGlow.fillCircle(0, 0, 48);
    this.shieldGlow.lineStyle(3, 0x0284c7, 0.9);
    this.shieldGlow.strokeCircle(0, 0, 48);
    this.shieldGlow.setVisible(false);
    this.player.add(this.shieldGlow);

    // Magnet aura (hidden by default)
    this.magnetGlow = this.add.graphics();
    this.magnetGlow.lineStyle(2, 0xe11d48, 0.8);
    this.magnetGlow.strokeCircle(0, 0, 42);
    this.magnetGlow.setVisible(false);
    this.player.add(this.magnetGlow);

    // Adventurer Character Sprite (Procedural cartoon hero: Keffiyeh / Shemagh, tunic, belt)
    this.playerSprite = this.add.graphics();
    this.drawPlayerGraphics(this.playerSprite, false);
    this.player.add(this.playerSprite);

    // Running bobbing animation
    this.tweens.add({
      targets: this.playerSprite,
      y: -4,
      duration: 160,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private drawPlayerGraphics(g: Phaser.GameObjects.Graphics, isDucking: boolean) {
    g.clear();

    if (isDucking) {
      // Ducking / Sliding posture
      g.fillStyle(0x059669, 1); // Emerald adventurer vest
      g.fillRoundedRect(-24, 8, 48, 22, 8);
      // Head low
      g.fillStyle(0xfde047, 1); // Head wrap
      g.fillCircle(0, 0, 18);
      g.fillStyle(0xfcd34d, 1); // Face
      g.fillCircle(0, 3, 13);
      // Dust particles underneath
      g.fillStyle(0xd97706, 0.6);
      g.fillCircle(-16, 32, 6);
      g.fillCircle(16, 32, 6);
    } else {
      // Normal Running Posture
      // Legs / Boots
      g.fillStyle(0x78350f, 1);
      g.fillRect(-16, 22, 10, 16);
      g.fillRect(6, 22, 10, 16);

      // Body / Tunic (Emerald green & gold belt)
      g.fillStyle(0x059669, 1);
      g.fillRoundedRect(-22, -10, 44, 34, 8);
      // Gold Belt
      g.fillStyle(0xf59e0b, 1);
      g.fillRect(-22, 12, 44, 6);
      g.fillStyle(0xfef08a, 1);
      g.fillRect(-6, 11, 12, 8);

      // Head & Face
      g.fillStyle(0xfde047, 1);
      g.fillCircle(0, -22, 18);
      g.fillStyle(0xffedd5, 1);
      g.fillCircle(0, -20, 13);

      // Cute Eyes
      g.fillStyle(0x1e293b, 1);
      g.fillCircle(-4, -22, 2.5);
      g.fillCircle(4, -22, 2.5);

      // Adventurer Keffiyeh / Headscarf with Agal cord
      g.fillStyle(0xd97706, 1);
      g.fillRect(-18, -36, 36, 8);
      g.fillStyle(0x18181b, 1);
      g.fillRect(-16, -30, 32, 4); // Black agal headband
    }
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (!this.isGameRunning || this.isPaused) return;

    switch (event.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.moveLane(-1);
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.moveLane(1);
        break;
      case 'ArrowUp':
      case 'KeyW':
      case 'Space':
        this.jump();
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.slide();
        break;
    }
  }

  // --- ACTIONS ---
  public moveLane(direction: number) {
    if (!this.isGameRunning || this.isPaused) return;

    const newLane = Phaser.Math.Clamp(this.currentLane + direction, 0, 2);
    if (newLane === this.currentLane) return;

    this.currentLane = newLane;
    const centerX = this.scale.width / 2;
    this.targetX = centerX + this.LANE_POSITIONS[this.currentLane];

    // Smooth lane shift tween with slight tilt
    this.tweens.add({
      targets: this.player,
      x: this.targetX,
      angle: direction * 8,
      duration: 160,
      ease: 'Power2',
      onComplete: () => {
        this.tweens.add({
          targets: this.player,
          angle: 0,
          duration: 80,
        });
      },
    });

    audioService.playSfx('slide');
  }

  public jump() {
    if (!this.isGameRunning || this.isPaused || this.isJumping) return;
    this.isJumping = true;
    audioService.playSfx('jump');

    // Jump Arc
    this.jumpTween = this.tweens.add({
      targets: this.player,
      y: this.playerBaseY - 130,
      duration: 320,
      ease: 'Quad.easeOut',
      yoyo: true,
      onYoyo: () => {
        // Falling down
      },
      onComplete: () => {
        this.player.y = this.playerBaseY;
        this.isJumping = false;
      },
    });

    // Shadow shrink during jump
    this.tweens.add({
      targets: this.playerShadow,
      scaleX: 0.5,
      scaleY: 0.5,
      alpha: 0.15,
      duration: 320,
      yoyo: true,
    });
  }

  public slide() {
    if (!this.isGameRunning || this.isPaused || this.isSliding) return;

    // If currently jumping, cancel jump and slam down into slide
    if (this.isJumping) {
      this.jumpTween?.stop();
      this.player.y = this.playerBaseY;
      this.isJumping = false;
      this.playerShadow.setScale(1);
      this.playerShadow.alpha = 0.35;
    }

    this.isSliding = true;
    this.drawPlayerGraphics(this.playerSprite, true);
    audioService.playSfx('slide');

    this.slideTimer = this.time.delayedCall(700, () => {
      this.drawPlayerGraphics(this.playerSprite, false);
      this.isSliding = false;
    });
  }

  // --- SPAWNING SYSTEM ---
  private spawnObjects(delta: number) {
    this.spawnTimer += delta;

    // Distance-based speed up
    this.currentSpeed = this.baseSpeed + Math.min(220, this.distance * 0.12);

    // Spawning interval scales with speed
    const interval = Math.max(800, 1600 - this.currentSpeed * 1.5);

    if (this.spawnTimer >= interval) {
      this.spawnTimer = 0;
      this.spawnPattern();
    }
  }

  private spawnPattern() {
    const centerX = this.scale.width / 2;
    const topY = this.scale.height * 0.38;

    // Pick 1 to 2 random lanes for obstacles
    const laneChoices = [0, 1, 2];
    Phaser.Utils.Array.Shuffle(laneChoices);

    const primaryLane = laneChoices[0];
    const freeLane = laneChoices[1];
    const bonusLane = laneChoices[2];

    const obstacleTypes = ['jump_barrier', 'slide_banner', 'tall_crate'];
    const selectedType = Phaser.Utils.Array.GetRandom(obstacleTypes);

    this.createObstacle(centerX + this.LANE_POSITIONS[primaryLane], topY, selectedType);

    // In the free lane, spawn coins or knowledge scrolls or powerups
    const roll = Math.random();
    if (roll < 0.22) {
      // Knowledge Scroll!
      this.createScroll(centerX + this.LANE_POSITIONS[freeLane], topY);
    } else if (roll < 0.32) {
      // PowerUp
      const powerUpTypes = ['shield', 'magnet', 'multiplier'];
      const pType = Phaser.Utils.Array.GetRandom(powerUpTypes);
      this.createPowerUp(centerX + this.LANE_POSITIONS[freeLane], topY, pType);
    } else {
      // Arc of 3 coins
      for (let i = 0; i < 3; i++) {
        this.createCoin(centerX + this.LANE_POSITIONS[freeLane], topY - i * 45);
      }
    }

    // Occasional coins in bonus lane
    if (Math.random() < 0.4) {
      this.createCoin(centerX + this.LANE_POSITIONS[bonusLane], topY);
    }
  }

  private createObstacle(x: number, y: number, type: string) {
    const container = this.add.container(x, y);
    const g = this.add.graphics();

    if (type === 'jump_barrier') {
      // Low wooden hurdle (Must jump over)
      g.fillStyle(0x854d0e, 1);
      g.fillRoundedRect(-32, -18, 64, 24, 6);
      g.lineStyle(3, 0xfef08a, 1);
      g.strokeRoundedRect(-32, -18, 64, 24, 6);
      // Warning stripes
      g.fillStyle(0xd97706, 1);
      g.fillRect(-22, -14, 12, 16);
      g.fillRect(10, -14, 12, 16);
    } else if (type === 'slide_banner') {
      // High arch with oriental carpet/banner hanging (Must slide under)
      g.lineStyle(4, 0x78350f, 1);
      g.strokeLineShape(new Phaser.Geom.Line(-34, -75, -34, 10));
      g.strokeLineShape(new Phaser.Geom.Line(34, -75, 34, 10));
      // Hanging tapestry
      g.fillStyle(0x991b1b, 0.95);
      g.fillRoundedRect(-32, -75, 64, 46, 6);
      g.lineStyle(2, 0xf59e0b, 1);
      g.strokeRoundedRect(-32, -75, 64, 46, 6);
      // Arabic calligraphy line
      g.fillStyle(0xfde047, 1);
      g.fillRect(-20, -56, 40, 4);
    } else {
      // Stone Crate / Market Jar (Must dodge lane)
      g.fillStyle(0x713f12, 1);
      g.fillRoundedRect(-30, -50, 60, 56, 8);
      g.lineStyle(3, 0xca8a04, 1);
      g.strokeRoundedRect(-30, -50, 60, 56, 8);
      // Diagonal wooden slats
      g.lineStyle(2, 0x451a03, 1);
      g.lineBetween(-26, -46, 26, 2);
      g.lineBetween(-26, 2, 26, -46);
    }

    container.add(g);
    container.setData('type', type);
    container.setData('hit', false);
    this.obstacles.add(container);
  }

  private createCoin(x: number, y: number) {
    const coin = this.add.image(x, y, 'coin_tex');
    coin.setData('collected', false);
    this.coinsGroup.add(coin);
  }

  private createScroll(x: number, y: number) {
    const scroll = this.add.image(x, y, 'scroll_tex');
    scroll.setData('collected', false);
    // Glow effect
    this.tweens.add({
      targets: scroll,
      scaleX: 1.15,
      scaleY: 1.15,
      yoyo: true,
      repeat: -1,
      duration: 350,
    });
    this.scrollsGroup.add(scroll);
  }

  private createPowerUp(x: number, y: number, type: string) {
    const container = this.add.container(x, y);
    const bg = this.add.graphics();

    let color = 0x38bdf8;
    if (type === 'magnet') color = 0xf43f5e;
    if (type === 'multiplier') color = 0xa855f7;

    bg.fillStyle(color, 1);
    bg.fillCircle(0, 0, 18);
    bg.lineStyle(3, 0xffffff, 1);
    bg.strokeCircle(0, 0, 18);

    // Inner icon symbol
    const icon = this.add.graphics();
    icon.fillStyle(0xffffff, 1);
    if (type === 'shield') {
      icon.fillTriangle(-8, -6, 8, -6, 0, 10);
    } else if (type === 'magnet') {
      icon.fillRect(-8, -8, 5, 14);
      icon.fillRect(3, -8, 5, 14);
      icon.fillRect(-8, 3, 16, 5);
    } else {
      // 2x star
      icon.fillCircle(0, 0, 7);
    }

    container.add([bg, icon]);
    container.setData('powerType', type);
    this.powerUpsGroup.add(container);
  }

  // --- MAIN LOOP ---
  update(_time: number, delta: number) {
    if (!this.isGameRunning || this.isPaused) return;

    const deltaSec = delta / 1000;
    const distanceStep = this.currentSpeed * deltaSec * 0.1;
    this.distance += distanceStep;
    this.score += Math.round(distanceStep * (this.doubleMultiplier ? 2 : 1));

    // Road animation (move dashed stripes down)
    const topY = this.scale.height * 0.38;
    const bottomY = this.scale.height;
    const roadHeight = bottomY - topY;

    this.roadDashes.forEach((dash) => {
      dash.y += this.currentSpeed * deltaSec;
      if (dash.y > bottomY) {
        dash.y -= roadHeight;
      }
    });

    // Spawn obstacles & pickups
    this.spawnObjects(delta);

    // Move Obstacles
    this.obstacles.getChildren().forEach((obs: any) => {
      obs.y += this.currentSpeed * deltaSec;

      // Scale up as it gets closer (perspective illusion)
      const progress = (obs.y - topY) / (bottomY - topY);
      const scale = Phaser.Math.Clamp(0.5 + progress * 0.7, 0.5, 1.25);
      obs.setScale(scale);

      // Collision Check
      if (
        !obs.getData('hit') &&
        Math.abs(obs.x - this.player.x) < 45 &&
        Math.abs(obs.y - this.player.y) < 36
      ) {
        this.handleObstacleCollision(obs);
      }

      // Cleanup
      if (obs.y > bottomY + 80) {
        obs.destroy();
      }
    });

    // Move Coins
    this.coinsGroup.getChildren().forEach((coin: any) => {
      coin.y += this.currentSpeed * deltaSec;

      // Magnet pull effect
      if (this.hasMagnet && Math.abs(coin.y - this.player.y) < 220) {
        const angle = Phaser.Math.Angle.Between(coin.x, coin.y, this.player.x, this.player.y);
        coin.x += Math.cos(angle) * 380 * deltaSec;
        coin.y += Math.sin(angle) * 380 * deltaSec;
      }

      // Collect Check
      if (
        !coin.getData('collected') &&
        Math.abs(coin.x - this.player.x) < 38 &&
        Math.abs(coin.y - this.player.y) < 38
      ) {
        this.collectCoin(coin);
      }

      if (coin.y > bottomY + 50) {
        coin.destroy();
      }
    });

    // Move Scrolls (Knowledge items)
    this.scrollsGroup.getChildren().forEach((scroll: any) => {
      scroll.y += this.currentSpeed * deltaSec;

      if (
        !scroll.getData('collected') &&
        Math.abs(scroll.x - this.player.x) < 42 &&
        Math.abs(scroll.y - this.player.y) < 42
      ) {
        this.collectScroll(scroll);
      }

      if (scroll.y > bottomY + 50) {
        scroll.destroy();
      }
    });

    // Move Powerups
    this.powerUpsGroup.getChildren().forEach((pUp: any) => {
      pUp.y += this.currentSpeed * deltaSec;

      if (Math.abs(pUp.x - this.player.x) < 40 && Math.abs(pUp.y - this.player.y) < 40) {
        this.collectPowerUp(pUp);
      }

      if (pUp.y > bottomY + 50) {
        pUp.destroy();
      }
    });

    // Periodic Arabic Quiz Check
    if (this.distance >= this.nextQuizDistance) {
      this.nextQuizDistance += 320 + Math.random() * 100;
      this.pauseForQuiz();
    }

    // Callbacks to UI
    this.callbacks.onScoreUpdate(this.score, this.coins, Math.floor(this.distance));
  }

  // --- COLLISIONS & EVENTS ---
  private handleObstacleCollision(obs: any) {
    const type = obs.getData('type');

    // Safe if jumping over jump_barrier
    if (type === 'jump_barrier' && this.isJumping) {
      return;
    }

    // Safe if sliding under slide_banner
    if (type === 'slide_banner' && this.isSliding) {
      return;
    }

    obs.setData('hit', true);

    // If shield active, consume shield without losing life
    if (this.hasShield) {
      this.hasShield = false;
      this.shieldGlow.setVisible(false);
      audioService.playSfx('powerup');
      this.cameras.main.flash(200, 56, 189, 248);
      return;
    }

    // Lose life
    this.lives -= 1;
    this.callbacks.onLivesUpdate(this.lives);
    audioService.playSfx('wrong');
    this.cameras.main.shake(250, 0.015);

    // Player red blink
    this.tweens.add({
      targets: this.player,
      alpha: 0.2,
      duration: 100,
      yoyo: true,
      repeat: 3,
    });

    if (this.lives <= 0) {
      this.triggerGameOver();
    }
  }

  private collectCoin(coin: any) {
    coin.setData('collected', true);
    this.coins += 1;
    this.score += this.doubleMultiplier ? 20 : 10;
    audioService.playSfx('coin');

    // Float up and fade tween
    this.tweens.add({
      targets: coin,
      y: coin.y - 30,
      alpha: 0,
      scaleX: 1.4,
      scaleY: 1.4,
      duration: 180,
      onComplete: () => coin.destroy(),
    });
  }

  private collectScroll(scroll: any) {
    scroll.setData('collected', true);
    audioService.playSfx('powerup');

    this.tweens.add({
      targets: scroll,
      scaleX: 1.8,
      scaleY: 1.8,
      alpha: 0,
      duration: 250,
      onComplete: () => {
        scroll.destroy();
        this.pauseForQuiz();
      },
    });
  }

  private collectPowerUp(pUp: any) {
    const type = pUp.getData('powerType');
    audioService.playSfx('powerup');
    pUp.destroy();

    if (type === 'shield') {
      this.hasShield = true;
      this.shieldGlow.setVisible(true);
      this.callbacks.onPowerUpActive('Perisai Emas', 10);
    } else if (type === 'magnet') {
      this.hasMagnet = true;
      this.magnetGlow.setVisible(true);
      this.callbacks.onPowerUpActive('Magnet Koin', 10);

      this.magnetTimer?.destroy();
      this.magnetTimer = this.time.delayedCall(10000, () => {
        this.hasMagnet = false;
        this.magnetGlow.setVisible(false);
      });
    } else if (type === 'multiplier') {
      this.doubleMultiplier = true;
      this.callbacks.onPowerUpActive('Skor 2x', 10);

      this.doubleTimer?.destroy();
      this.doubleTimer = this.time.delayedCall(10000, () => {
        this.doubleMultiplier = false;
      });
    }
  }

  public pauseForQuiz() {
    if (this.isPaused || !this.isGameRunning) return;
    this.isPaused = true;
    audioService.pauseMusic();
    this.callbacks.onTriggerQuiz(this.currentSpeed);
  }

  public resumeFromQuiz(wasCorrect: boolean) {
    this.isPaused = false;
    audioService.resumeMusic();

    if (wasCorrect) {
      this.score += 150;
      this.coins += 15;
      // Temporary speed-boost invulnerability
      this.hasShield = true;
      this.shieldGlow.setVisible(true);
      this.time.delayedCall(4000, () => {
        this.hasShield = false;
        this.shieldGlow.setVisible(false);
      });
    }
  }

  public pauseGame() {
    this.isPaused = true;
    audioService.pauseMusic();
  }

  public resumeGame() {
    this.isPaused = false;
    audioService.resumeMusic();
  }

  private triggerGameOver() {
    this.isGameRunning = false;
    audioService.stopMusic();
    audioService.playSfx('gameover');

    this.callbacks.onGameOver({
      score: this.score,
      coins: this.coins,
      distance: Math.floor(this.distance),
    });
  }
}
