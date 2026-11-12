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
  // Safe default callbacks so the scene never throws TypeError
  private callbacks: GameEventCallbacks = {
    onScoreUpdate: () => {},
    onLivesUpdate: () => {},
    onTriggerQuiz: () => {},
    onGameOver: () => {},
    onPowerUpActive: () => {},
  };

  // Dimensions & Perspectives
  private readonly GAME_WIDTH = 800;
  private readonly GAME_HEIGHT = 600;
  private readonly HORIZON_Y = 210;
  private readonly ROAD_BOTTOM_Y = 600;
  private readonly PLAYER_Y = 510;

  // 3-Lanes: normalized lane multipliers (-1 = Left, 0 = Center, 1 = Right)
  private readonly LANE_SPREAD_BOTTOM = 150; // Distance from center at bottom
  private readonly LANE_SPREAD_TOP = 45; // Distance from center at horizon
  private currentLane = 0; // -1 = Left, 0 = Center, 1 = Right
  private targetLane = 0;

  // Player Object & State
  private playerContainer!: Phaser.GameObjects.Container;
  private playerSprite!: Phaser.GameObjects.Sprite;
  private playerShadow!: Phaser.GameObjects.Graphics;
  private shieldBubble!: Phaser.GameObjects.Graphics;
  private magnetAura!: Phaser.GameObjects.Graphics;
  private runAnimTimer?: Phaser.Time.TimerEvent;
  private currentRunFrame = 0;

  private isJumping = false;
  private isSliding = false;
  private isCrashing = false;
  private jumpTween?: Phaser.Tweens.Tween;
  private slideTimer?: Phaser.Time.TimerEvent;

  // Game Loop State
  private isGameRunning = false;
  private isPaused = false;
  private score = 0;
  private coins = 0;
  private distance = 0;
  private lives = 3;
  private baseSpeed = 360;
  private currentSpeed = 360;

  // Active Power-ups
  private hasShield = false;
  private hasMagnet = false;
  private doubleMultiplier = false;
  private magnetTimer?: Phaser.Time.TimerEvent;
  private shieldTimer?: Phaser.Time.TimerEvent;
  private doubleTimer?: Phaser.Time.TimerEvent;

  // Groups
  private sceneryGroup!: Phaser.GameObjects.Group;
  private roadDashesGroup!: Phaser.GameObjects.Group;
  private obstaclesGroup!: Phaser.GameObjects.Group;
  private coinsGroup!: Phaser.GameObjects.Group;
  private scrollsGroup!: Phaser.GameObjects.Group;
  private powerUpsGroup!: Phaser.GameObjects.Group;

  // Timers
  private spawnTimer = 0;
  private scenerySpawnTimer = 0;
  private nextQuizDistance = 280;

  // Controls
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private touchStartX = 0;
  private touchStartY = 0;

  constructor() {
    super({ key: 'ArabicRunnerScene' });
  }

  public setCallbacks(cbs: GameEventCallbacks) {
    this.callbacks = cbs;
    // Broadcast initial state
    this.callbacks.onLivesUpdate(this.lives);
    this.callbacks.onScoreUpdate(this.score, this.coins, Math.floor(this.distance));
  }

  init(data?: { callbacks?: GameEventCallbacks }) {
    if (data?.callbacks) {
      this.callbacks = data.callbacks;
    }
    this.currentLane = 0;
    this.targetLane = 0;
    this.lives = 3;
    this.score = 0;
    this.coins = 0;
    this.distance = 0;
    this.currentSpeed = this.baseSpeed;
    this.hasShield = false;
    this.hasMagnet = false;
    this.doubleMultiplier = false;
    this.isJumping = false;
    this.isSliding = false;
    this.isCrashing = false;
    this.nextQuizDistance = 280;
    this.isGameRunning = true;
    this.isPaused = false;
  }

  preload() {
    // Generate all procedural cartoon sprites, items, environment and obstacles
    this.buildProceduralAssets();
  }

  create() {
    // 1. Warm Desert Twilight Sky Gradient
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x172554, 0x1e3a8a, 0xd97706, 0xf59e0b, 1);
    sky.fillRect(0, 0, this.GAME_WIDTH, this.HORIZON_Y + 15);

    // Glowing sun / moon over horizon
    const sun = this.add.graphics();
    sun.fillStyle(0xfef08a, 0.85);
    sun.fillCircle(this.GAME_WIDTH / 2, this.HORIZON_Y - 45, 36);
    sun.fillStyle(0xfde047, 0.4);
    sun.fillCircle(this.GAME_WIDTH / 2, this.HORIZON_Y - 45, 52);

    // 2. Distant Arabian City Silhouette (Mosque domes & minarets)
    this.createCitySkyline();

    // 3. Sand dunes background
    this.createDesertDunes();

    // 4. Ground Terrain (Sand on sides)
    const ground = this.add.graphics();
    ground.fillStyle(0xd97706, 1); // Desert golden sand
    ground.fillRect(0, this.HORIZON_Y, this.GAME_WIDTH, this.GAME_HEIGHT - this.HORIZON_Y);

    // 5. 3-Lane Perspective Roadway
    this.createRoadway();

    // 6. Object Groups
    this.sceneryGroup = this.add.group();
    this.roadDashesGroup = this.add.group();
    this.obstaclesGroup = this.add.group();
    this.coinsGroup = this.add.group();
    this.scrollsGroup = this.add.group();
    this.powerUpsGroup = this.add.group();

    // Road dash lines
    this.initRoadDashLines();

    // 7. Player Creation
    this.createPlayer();

    // 8. Input setup
    this.setupInput();

    // Broadcast initial stats
    this.callbacks.onLivesUpdate(this.lives);
    this.callbacks.onScoreUpdate(this.score, this.coins, 0);
  }

  // ==========================================
  // PROCEDURAL TEXTURE GENERATION
  // ==========================================
  private buildProceduralAssets() {
    // 1. Rotating Coin frames (4-frame 3D spin effect)
    for (let f = 0; f < 4; f++) {
      const texKey = `coin_f${f}`;
      if (!this.textures.exists(texKey)) {
        const g = this.make.graphics({ x: 0, y: 0 });
        const widths = [32, 22, 10, 22];
        const w = widths[f];
        // Outer gold
        g.fillStyle(0xf59e0b, 1);
        g.fillEllipse(18, 18, w, 32);
        // Inner rim
        g.lineStyle(2, 0xfef08a, 1);
        g.strokeEllipse(18, 18, Math.max(4, w - 4), 26);
        // Arabic dinar star/letter center
        if (w >= 18) {
          g.fillStyle(0xd97706, 1);
          g.fillCircle(18, 18, 4);
        }
        g.generateTexture(texKey, 36, 36);
        g.destroy();
      }
    }

    // 2. Character Run Frames (4-frame cartoon runner)
    for (let f = 0; f < 4; f++) {
      const runKey = `char_run_${f}`;
      if (!this.textures.exists(runKey)) {
        const g = this.make.graphics({ x: 0, y: 0 });
        this.renderAdventurerSprite(g, 'run', f);
        g.generateTexture(runKey, 72, 88);
        g.destroy();
      }
    }

    // Jump frame
    if (!this.textures.exists('char_jump')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      this.renderAdventurerSprite(g, 'jump', 0);
      g.generateTexture('char_jump', 72, 88);
      g.destroy();
    }

    // Slide frame
    if (!this.textures.exists('char_slide')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      this.renderAdventurerSprite(g, 'slide', 0);
      g.generateTexture('char_slide', 84, 52);
      g.destroy();
    }

    // Crash frame
    if (!this.textures.exists('char_crash')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      this.renderAdventurerSprite(g, 'crash', 0);
      g.generateTexture('char_crash', 72, 88);
      g.destroy();
    }

    // 3. Environment: Date Palm Tree
    if (!this.textures.exists('scenery_palm')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Curved trunk
      g.lineStyle(10, 0x78350f, 1);
      g.beginPath();
      g.moveTo(40, 110);
      g.lineTo(44, 50);
      g.lineTo(50, 24);
      g.strokePath();

      // Lush Palm Fronds
      g.fillStyle(0x15803d, 1);
      const angles = [0, 45, 90, 135, 180, 225, 270, 315];
      angles.forEach((deg) => {
        const rad = Phaser.Math.DegToRad(deg);
        const ex = 50 + Math.cos(rad) * 32;
        const ey = 24 + Math.sin(rad) * 22;
        g.fillEllipse(ex, ey, 26, 12);
      });
      // Golden dates
      g.fillStyle(0xd97706, 1);
      g.fillCircle(48, 28, 5);
      g.fillCircle(54, 29, 5);
      g.generateTexture('scenery_palm', 96, 120);
      g.destroy();
    }

    // 4. Environment: Arabic Street Lantern / Lamp Post
    if (!this.textures.exists('scenery_lantern')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Black iron post
      g.fillStyle(0x18181b, 1);
      g.fillRect(18, 25, 6, 75);
      g.fillRoundedRect(12, 95, 18, 8, 3);
      // Curved arm
      g.fillRect(8, 20, 26, 6);
      // Glowing Oriental Lantern
      g.fillStyle(0xf59e0b, 1);
      g.fillRoundedRect(4, 26, 14, 20, 4);
      g.fillStyle(0xfef08a, 0.9);
      g.fillCircle(11, 36, 6); // Lamp light
      g.lineStyle(2, 0x78350f, 1);
      g.strokeRoundedRect(4, 26, 14, 20, 4);
      g.generateTexture('scenery_lantern', 42, 105);
      g.destroy();
    }

    // 5. Obstacle: Low Barrier (Lompat / Jump)
    if (!this.textures.exists('obs_barrier')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Wooden fence with oriental arch brackets
      g.fillStyle(0x92400e, 1);
      g.fillRoundedRect(4, 18, 82, 28, 6);
      g.lineStyle(3, 0xfde047, 1);
      g.strokeRoundedRect(4, 18, 82, 28, 6);
      // Danger stripes (Red/White)
      g.fillStyle(0xef4444, 1);
      g.fillRect(14, 20, 14, 24);
      g.fillRect(40, 20, 14, 24);
      g.fillRect(66, 20, 14, 24);
      // Jump prompt indicator
      g.fillStyle(0xffffff, 1);
      g.fillTriangle(47, 6, 40, 16, 54, 16); // Up arrow icon
      g.generateTexture('obs_barrier', 90, 50);
      g.destroy();
    }

    // 6. Obstacle: High Arch Tapestry (Merunduk / Slide)
    if (!this.textures.exists('obs_banner')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Tall stone pillars
      g.fillStyle(0x78350f, 1);
      g.fillRect(4, 0, 10, 85);
      g.fillRect(76, 0, 10, 85);
      // Top arch support
      g.fillRect(4, 0, 82, 12);
      // Hanging Persian Carpet Tapestry
      g.fillStyle(0x991b1b, 1);
      g.fillRoundedRect(12, 12, 66, 46, 6);
      g.lineStyle(2, 0xf59e0b, 1);
      g.strokeRoundedRect(12, 12, 66, 46, 6);
      // Golden Arabic Geometric Motif
      g.fillStyle(0xfde047, 1);
      g.fillRect(20, 32, 50, 6);
      // Down arrow for slide
      g.fillTriangle(45, 52, 38, 44, 52, 44);
      g.generateTexture('obs_banner', 90, 90);
      g.destroy();
    }

    // 7. Obstacle: Market Carts / Crates (Ganti Jalur / Switch Lane)
    if (!this.textures.exists('obs_crates')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Stack of bazaar crates
      g.fillStyle(0xa16207, 1);
      g.fillRoundedRect(6, 28, 70, 48, 6);
      g.lineStyle(3, 0xca8a04, 1);
      g.strokeRoundedRect(6, 28, 70, 48, 6);
      // Diagonal wood brace
      g.lineStyle(2, 0x451a03, 1);
      g.lineBetween(8, 30, 74, 74);
      g.lineBetween(8, 74, 74, 30);
      // Top clay amphora jar
      g.fillStyle(0xb45309, 1);
      g.fillEllipse(41, 18, 22, 28);
      g.fillStyle(0xfef08a, 1);
      g.fillCircle(41, 14, 5);
      g.generateTexture('obs_crates', 82, 80);
      g.destroy();
    }

    // 8. Knowledge Scroll Item (مخطوطة)
    if (!this.textures.exists('item_scroll')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Glowing parchment
      g.fillStyle(0xfef3c7, 1);
      g.fillRoundedRect(6, 6, 36, 46, 6);
      g.lineStyle(3, 0xb45309, 1);
      g.strokeRoundedRect(6, 6, 36, 46, 6);
      // Arabic calligraphy marks
      g.fillStyle(0x92400e, 1);
      g.fillRect(12, 14, 24, 3);
      g.fillRect(12, 22, 24, 3);
      g.fillRect(12, 30, 16, 3);
      // Ribbon
      g.fillStyle(0x059669, 1);
      g.fillRect(6, 38, 36, 6);
      g.generateTexture('item_scroll', 48, 58);
      g.destroy();
    }

    // 9. Power-ups
    const pwrConfigs = [
      { key: 'pwr_shield', color: 0x0284c7, icon: 'shield' },
      { key: 'pwr_magnet', color: 0xe11d48, icon: 'magnet' },
      { key: 'pwr_star', color: 0xa855f7, icon: 'star' },
    ];
    pwrConfigs.forEach(({ key, color, icon }) => {
      if (!this.textures.exists(key)) {
        const g = this.make.graphics({ x: 0, y: 0 });
        g.fillStyle(color, 1);
        g.fillCircle(22, 22, 20);
        g.lineStyle(3, 0xffffff, 1);
        g.strokeCircle(22, 22, 20);
        // Inner symbol
        g.fillStyle(0xffffff, 1);
        if (icon === 'shield') {
          g.fillTriangle(14, 14, 30, 14, 22, 32);
        } else if (icon === 'magnet') {
          g.fillRect(13, 13, 6, 16);
          g.fillRect(25, 13, 6, 16);
          g.fillRect(13, 23, 18, 6);
        } else {
          g.fillCircle(22, 22, 8);
        }
        g.generateTexture(key, 44, 44);
        g.destroy();
      }
    });
  }

  // Cartoon 3D Adventurer Renderer
  private renderAdventurerSprite(
    g: Phaser.GameObjects.Graphics,
    pose: 'run' | 'jump' | 'slide' | 'crash',
    frame: number
  ) {
    if (pose === 'slide') {
      // Sliding crouch pose
      // Dust clouds
      g.fillStyle(0xfde047, 0.7);
      g.fillCircle(12, 42, 10);
      g.fillCircle(26, 44, 8);
      // Body horizontal
      g.fillStyle(0x059669, 1); // Emerald Tunic
      g.fillRoundedRect(16, 18, 52, 22, 8);
      // Gold Belt
      g.fillStyle(0xf59e0b, 1);
      g.fillRect(36, 18, 8, 22);
      // Head low forward
      g.fillStyle(0xfde047, 1); // Keffiyeh
      g.fillCircle(64, 22, 15);
      g.fillStyle(0xfed7aa, 1); // Face
      g.fillCircle(65, 23, 10);
      return;
    }

    if (pose === 'crash') {
      // Dizzy / Crash pose
      g.fillStyle(0x047857, 1);
      g.fillRoundedRect(16, 26, 40, 34, 8);
      // Legs sprawled
      g.fillStyle(0x78350f, 1);
      g.fillRect(8, 56, 14, 16);
      g.fillRect(50, 56, 14, 16);
      // Head tilted
      g.fillStyle(0xfde047, 1);
      g.fillCircle(36, 14, 17);
      // Dizzy X eyes
      g.lineStyle(2, 0x1e293b, 1);
      g.lineBetween(30, 11, 34, 15);
      g.lineBetween(30, 15, 34, 11);
      g.lineBetween(38, 11, 42, 15);
      g.lineBetween(38, 15, 42, 11);
      return;
    }

    // Normal Running & Jumping Cycle
    const legOffset = pose === 'jump' ? -6 : frame === 0 ? 8 : frame === 2 ? -8 : 0;
    const bodyBob = pose === 'jump' ? -10 : frame % 2 === 1 ? -3 : 0;

    // Running Boots & Legs
    g.fillStyle(0x78350f, 1);
    // Left Leg
    g.fillRect(20, 52 + bodyBob - legOffset, 12, 22 + legOffset);
    // Right Leg
    g.fillRect(40, 52 + bodyBob + legOffset, 12, 22 - legOffset);

    // Adventurer Emerald Green Tunic
    g.fillStyle(0x059669, 1);
    g.fillRoundedRect(16, 24 + bodyBob, 40, 34, 10);

    // Gold Trim & Royal Waist Belt
    g.fillStyle(0xf59e0b, 1);
    g.fillRect(16, 44 + bodyBob, 40, 7);
    g.fillStyle(0xfef08a, 1);
    g.fillRect(32, 43 + bodyBob, 8, 9); // Gold Buckle

    // Head (Skin & Hair)
    g.fillStyle(0xfed7aa, 1); // Face tone
    g.fillCircle(36, 15 + bodyBob, 14);

    // Big friendly anime/cartoon eyes
    g.fillStyle(0x0f172a, 1);
    g.fillCircle(32, 14 + bodyBob, 3);
    g.fillCircle(40, 14 + bodyBob, 3);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(33, 13 + bodyBob, 1);
    g.fillCircle(41, 13 + bodyBob, 1);

    // Traditional Adventurer Keffiyeh / Headscarf with Agal (Black cord)
    g.fillStyle(0xd97706, 1); // Desert Ochre Wrap
    g.fillRoundedRect(18, 0 + bodyBob, 36, 14, 5);
    // Agal Headband (Black headband cord)
    g.fillStyle(0x18181b, 1);
    g.fillRect(18, 8 + bodyBob, 36, 4);
    // Flowing scarf tails on back
    g.fillStyle(0xb45309, 1);
    g.fillTriangle(20, 12 + bodyBob, 12, 34 + bodyBob, 20, 28 + bodyBob);
  }

  // ==========================================
  // ENVIRONMENT CREATION
  // ==========================================
  private createCitySkyline() {
    const skyline = this.add.graphics();
    skyline.fillStyle(0x1e1b4b, 0.65); // Twilight Indigo city

    skyline.beginPath();
    skyline.moveTo(0, this.HORIZON_Y);

    let x = 0;
    while (x < this.GAME_WIDTH + 60) {
      const bWidth = 40 + (x % 35);
      const bHeight = 35 + ((x * 7) % 65);
      const baseY = this.HORIZON_Y;

      if (x % 70 < 35) {
        // Mosque Minaret / Spire
        skyline.lineTo(x, baseY);
        skyline.lineTo(x + 8, baseY - bHeight - 25);
        skyline.lineTo(x + 16, baseY);
        x += 24;
      } else {
        // Oriental Dome
        skyline.lineTo(x, baseY);
        skyline.arc(x + bWidth / 2, baseY - 12, bWidth / 2, Math.PI, 0, false);
        skyline.lineTo(x + bWidth, baseY);
        x += bWidth;
      }
    }
    skyline.lineTo(this.GAME_WIDTH, this.HORIZON_Y);
    skyline.lineTo(0, this.HORIZON_Y);
    skyline.closePath();
    skyline.fillPath();
  }

  private createDesertDunes() {
    const dunes = this.add.graphics();
    // Background sand layer
    dunes.fillStyle(0xb45309, 0.7);
    dunes.beginPath();
    dunes.moveTo(0, this.HORIZON_Y);
    dunes.lineTo(this.GAME_WIDTH * 0.3, this.HORIZON_Y - 14);
    dunes.lineTo(this.GAME_WIDTH * 0.7, this.HORIZON_Y - 8);
    dunes.lineTo(this.GAME_WIDTH, this.HORIZON_Y - 16);
    dunes.lineTo(this.GAME_WIDTH, this.HORIZON_Y + 10);
    dunes.lineTo(0, this.HORIZON_Y + 10);
    dunes.closePath();
    dunes.fillPath();
  }

  private createRoadway() {
    const centerX = this.GAME_WIDTH / 2;
    const road = this.add.graphics();

    const roadTopW = 160;
    const roadBottomW = 540;

    // Road Surface (Dark cobblestone avenue)
    road.fillStyle(0x27272a, 1);
    road.beginPath();
    road.moveTo(centerX - roadTopW / 2, this.HORIZON_Y);
    road.lineTo(centerX + roadTopW / 2, this.HORIZON_Y);
    road.lineTo(centerX + roadBottomW / 2, this.ROAD_BOTTOM_Y);
    road.lineTo(centerX - roadBottomW / 2, this.ROAD_BOTTOM_Y);
    road.closePath();
    road.fillPath();

    // Golden mosaic side curbs
    road.lineStyle(12, 0xf59e0b, 1);
    road.beginPath();
    road.moveTo(centerX - roadTopW / 2, this.HORIZON_Y);
    road.lineTo(centerX - roadBottomW / 2, this.ROAD_BOTTOM_Y);
    road.moveTo(centerX + roadTopW / 2, this.HORIZON_Y);
    road.lineTo(centerX + roadBottomW / 2, this.ROAD_BOTTOM_Y);
    road.strokePath();

    // Outer curb white stones
    road.lineStyle(4, 0xfef08a, 0.8);
    road.beginPath();
    road.moveTo(centerX - roadTopW / 2 - 4, this.HORIZON_Y);
    road.lineTo(centerX - roadBottomW / 2 - 8, this.ROAD_BOTTOM_Y);
    road.moveTo(centerX + roadTopW / 2 + 4, this.HORIZON_Y);
    road.lineTo(centerX + roadBottomW / 2 + 8, this.ROAD_BOTTOM_Y);
    road.strokePath();
  }

  private initRoadDashLines() {
    // 8 segments of moving lane divider stripes
    for (let i = 0; i < 9; i++) {
      const p = i / 8;
      const y = this.HORIZON_Y + p * (this.ROAD_BOTTOM_Y - this.HORIZON_Y);
      const dash = this.add.graphics();
      dash.setData('progress', p);
      this.drawDashPair(dash, p, y);
      this.roadDashesGroup.add(dash);
    }
  }

  private drawDashPair(dash: Phaser.GameObjects.Graphics, p: number, y: number) {
    dash.clear();
    const centerX = this.GAME_WIDTH / 2;
    const laneSpread = this.LANE_SPREAD_TOP + p * (this.LANE_SPREAD_BOTTOM - this.LANE_SPREAD_TOP);
    const dashW = Math.max(3, p * 7);
    const dashH = Math.max(8, p * 24);

    dash.fillStyle(0xfde047, 0.85); // Bright gold dashes
    // Left divider dash
    dash.fillRect(centerX - laneSpread / 2 - dashW / 2, y, dashW, dashH);
    // Right divider dash
    dash.fillRect(centerX + laneSpread / 2 - dashW / 2, y, dashW, dashH);
  }

  // ==========================================
  // PLAYER SETUP
  // ==========================================
  private createPlayer() {
    const centerX = this.GAME_WIDTH / 2;
    const initialX = centerX + this.currentLane * this.LANE_SPREAD_BOTTOM;

    this.playerContainer = this.add.container(initialX, this.PLAYER_Y);

    // Drop Shadow
    this.playerShadow = this.add.graphics();
    this.playerShadow.fillStyle(0x000000, 0.45);
    this.playerShadow.fillEllipse(0, 36, 60, 20);
    this.playerContainer.add(this.playerShadow);

    // Shield Aura (Golden/Blue protection bubble)
    this.shieldBubble = this.add.graphics();
    this.shieldBubble.fillStyle(0x38bdf8, 0.35);
    this.shieldBubble.fillCircle(0, 5, 52);
    this.shieldBubble.lineStyle(3, 0x0284c7, 0.9);
    this.shieldBubble.strokeCircle(0, 5, 52);
    this.shieldBubble.setVisible(false);
    this.playerContainer.add(this.shieldBubble);

    // Magnet Aura (Red magnetic pulse)
    this.magnetAura = this.add.graphics();
    this.magnetAura.lineStyle(2, 0xf43f5e, 0.85);
    this.magnetAura.strokeCircle(0, 10, 46);
    this.magnetAura.setVisible(false);
    this.playerContainer.add(this.magnetAura);

    // Main Animated Character Sprite
    this.playerSprite = this.add.sprite(0, 0, 'char_run_0').setOrigin(0.5, 0.5);
    this.playerContainer.add(this.playerSprite);

    // Running frame cycle
    this.runAnimTimer = this.time.addEvent({
      delay: 130,
      loop: true,
      callback: () => {
        if (!this.isGameRunning || this.isPaused || this.isJumping || this.isSliding || this.isCrashing)
          return;
        this.currentRunFrame = (this.currentRunFrame + 1) % 4;
        this.playerSprite.setTexture(`char_run_${this.currentRunFrame}`);
      },
    });
  }

  // ==========================================
  // CONTROLS & INPUT
  // ==========================================
  private setupInput() {
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
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
      });
    }

    // Touch Swipe Detection
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.touchStartX = pointer.x;
      this.touchStartY = pointer.y;
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!this.isGameRunning || this.isPaused) return;
      const diffX = pointer.x - this.touchStartX;
      const diffY = pointer.y - this.touchStartY;
      const minSwipe = 30;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > minSwipe) {
          this.moveLane(diffX > 0 ? 1 : -1);
        }
      } else {
        if (Math.abs(diffY) > minSwipe) {
          if (diffY < 0) this.jump();
          else this.slide();
        }
      }
    });
  }

  // ==========================================
  // PLAYER ACTIONS
  // ==========================================
  public moveLane(direction: number) {
    if (!this.isGameRunning || this.isPaused || this.isCrashing) return;

    const newLane = Phaser.Math.Clamp(this.currentLane + direction, -1, 1);
    if (newLane === this.currentLane) return;

    this.currentLane = newLane;
    const centerX = this.GAME_WIDTH / 2;
    const targetX = centerX + this.currentLane * this.LANE_SPREAD_BOTTOM;

    // Smooth horizontal lane shift with tilt
    this.tweens.add({
      targets: this.playerContainer,
      x: targetX,
      angle: direction * 10,
      duration: 150,
      ease: 'Power2',
      onComplete: () => {
        this.tweens.add({
          targets: this.playerContainer,
          angle: 0,
          duration: 70,
        });
      },
    });

    audioService.playSfx('slide');
  }

  public jump() {
    if (!this.isGameRunning || this.isPaused || this.isJumping || this.isCrashing) return;
    this.isJumping = true;
    this.playerSprite.setTexture('char_jump');
    audioService.playSfx('jump');

    // High leap trajectory
    this.jumpTween = this.tweens.add({
      targets: this.playerContainer,
      y: this.PLAYER_Y - 140,
      duration: 320,
      ease: 'Quad.easeOut',
      yoyo: true,
      onComplete: () => {
        this.playerContainer.y = this.PLAYER_Y;
        this.isJumping = false;
        if (!this.isSliding) {
          this.playerSprite.setTexture(`char_run_${this.currentRunFrame}`);
        }
      },
    });

    // Shadow shrink during jump
    this.tweens.add({
      targets: this.playerShadow,
      scaleX: 0.45,
      scaleY: 0.45,
      alpha: 0.15,
      duration: 320,
      yoyo: true,
    });
  }

  public slide() {
    if (!this.isGameRunning || this.isPaused || this.isSliding || this.isCrashing) return;

    // Slam down into slide if jumping
    if (this.isJumping) {
      this.jumpTween?.stop();
      this.playerContainer.y = this.PLAYER_Y;
      this.isJumping = false;
      this.playerShadow.setScale(1);
      this.playerShadow.alpha = 0.45;
    }

    this.isSliding = true;
    this.playerSprite.setTexture('char_slide');
    audioService.playSfx('slide');

    this.slideTimer?.destroy();
    this.slideTimer = this.time.delayedCall(750, () => {
      this.isSliding = false;
      if (!this.isJumping && !this.isCrashing) {
        this.playerSprite.setTexture(`char_run_${this.currentRunFrame}`);
      }
    });
  }

  // ==========================================
  // SPAWNER & PARALLAX SCENERY
  // ==========================================
  private spawnScenerySide(delta: number) {
    this.scenerySpawnTimer += delta;
    if (this.scenerySpawnTimer >= 500) {
      this.scenerySpawnTimer = 0;

      // Spawn Palm Trees & Street Lanterns on Left and Right curbs
      const type = Math.random() > 0.4 ? 'scenery_palm' : 'scenery_lantern';
      // Left side item
      this.createSceneryItem(type, -1);
      // Right side item
      this.createSceneryItem(type, 1);
    }
  }

  private createSceneryItem(textureKey: string, side: number) {
    const item = this.add.image(0, 0, textureKey);
    item.setData('side', side);
    item.setData('progress', 0);
    this.sceneryGroup.add(item);
  }

  private spawnGameObjects(delta: number) {
    this.spawnTimer += delta;

    // Speed progression
    this.currentSpeed = this.baseSpeed + Math.min(220, this.distance * 0.15);
    const spawnInterval = Math.max(900, 1800 - this.currentSpeed * 1.8);

    if (this.spawnTimer >= spawnInterval) {
      this.spawnTimer = 0;
      this.generateWavePattern();
    }
  }

  private generateWavePattern() {
    // 3 lane choices (-1, 0, 1)
    const lanes = [-1, 0, 1];
    Phaser.Utils.Array.Shuffle(lanes);

    const obstacleLane = lanes[0];
    const itemLane = lanes[1];
    const bonusLane = lanes[2];

    // Pick obstacle type
    const obsTypes = ['obs_barrier', 'obs_banner', 'obs_crates'];
    const chosenObs = Phaser.Utils.Array.GetRandom(obsTypes);
    this.spawnObstacle(chosenObs, obstacleLane);

    // Pick reward item in free lane
    const roll = Math.random();
    if (roll < 0.25) {
      // Knowledge Scroll (Kuis Bahasa Arab)
      this.spawnScroll(itemLane);
    } else if (roll < 0.38) {
      // PowerUp
      const pTypes = ['pwr_shield', 'pwr_magnet', 'pwr_star'];
      this.spawnPowerUp(Phaser.Utils.Array.GetRandom(pTypes), itemLane);
    } else {
      // Arc of 3 Golden Coins
      for (let c = 0; c < 3; c++) {
        this.spawnCoin(itemLane, -c * 0.08);
      }
    }

    // Occasional bonus coins in third lane
    if (Math.random() < 0.4) {
      this.spawnCoin(bonusLane, 0);
    }
  }

  private spawnObstacle(type: string, lane: number) {
    const obs = this.add.image(0, 0, type);
    obs.setData('type', type);
    obs.setData('lane', lane);
    obs.setData('progress', 0);
    obs.setData('hit', false);
    this.obstaclesGroup.add(obs);
  }

  private spawnCoin(lane: number, initialProgress: number) {
    const coin = this.add.image(0, 0, 'coin_f0');
    coin.setData('lane', lane);
    coin.setData('progress', initialProgress);
    coin.setData('animFrame', 0);
    coin.setData('collected', false);
    this.coinsGroup.add(coin);
  }

  private spawnScroll(lane: number) {
    const scroll = this.add.image(0, 0, 'item_scroll');
    scroll.setData('lane', lane);
    scroll.setData('progress', 0);
    scroll.setData('collected', false);
    this.scrollsGroup.add(scroll);
  }

  private spawnPowerUp(key: string, lane: number) {
    const pwr = this.add.image(0, 0, key);
    pwr.setData('powerType', key);
    pwr.setData('lane', lane);
    pwr.setData('progress', 0);
    this.powerUpsGroup.add(pwr);
  }

  // ==========================================
  // GAME LOOP UPDATE
  // ==========================================
  update(_time: number, delta: number) {
    if (!this.isGameRunning || this.isPaused) return;

    const deltaSec = delta / 1000;
    const progressSpeed = (this.currentSpeed / 400) * deltaSec * 0.45;

    // Advance Distance & Score
    const distStep = this.currentSpeed * deltaSec * 0.12;
    this.distance += distStep;
    this.score += Math.round(distStep * (this.doubleMultiplier ? 2 : 1));

    // 1. Animate Road divider stripes
    this.roadDashesGroup.getChildren().forEach((dashObj: any) => {
      let p = dashObj.getData('progress') + progressSpeed;
      if (p > 1) p -= 1;
      dashObj.setData('progress', p);
      const y = this.HORIZON_Y + p * (this.ROAD_BOTTOM_Y - this.HORIZON_Y);
      this.drawDashPair(dashObj, p, y);
    });

    // 2. Parallax Scenery (Palms & Lanterns)
    this.spawnScenerySide(delta);
    this.sceneryGroup.getChildren().forEach((item: any) => {
      let p = item.getData('progress') + progressSpeed * 1.1;
      item.setData('progress', p);

      if (p >= 1.05) {
        item.destroy();
        return;
      }

      const side = item.getData('side');
      const y = this.HORIZON_Y + p * (this.ROAD_BOTTOM_Y - this.HORIZON_Y);
      const curbSpread = (this.GAME_WIDTH / 2) + side * (100 + p * 230);
      item.x = curbSpread;
      item.y = y - 30 * p;
      const scale = 0.25 + p * 0.95;
      item.setScale(scale);
      item.setDepth(10 + Math.floor(p * 20));
    });

    // 3. Spawners
    this.spawnGameObjects(delta);

    const centerX = this.GAME_WIDTH / 2;
    const playerX = this.playerContainer.x;
    const playerY = this.playerContainer.y;

    // 4. Update Obstacles
    this.obstaclesGroup.getChildren().forEach((obs: any) => {
      let p = obs.getData('progress') + progressSpeed;
      obs.setData('progress', p);

      if (p < 0) return;

      const lane = obs.getData('lane');
      const spread = this.LANE_SPREAD_TOP + p * (this.LANE_SPREAD_BOTTOM - this.LANE_SPREAD_TOP);
      obs.x = centerX + lane * spread;
      obs.y = this.HORIZON_Y + p * (this.ROAD_BOTTOM_Y - this.HORIZON_Y) - 15 * p;

      const scale = 0.28 + p * 0.85;
      obs.setScale(scale);
      obs.setDepth(30 + Math.floor(p * 30));

      // Collision Check
      if (!obs.getData('hit') && p >= 0.76 && p <= 0.94) {
        if (Math.abs(obs.x - playerX) < 48 && Math.abs(obs.y - playerY) < 46) {
          this.handleObstacleCollision(obs);
        }
      }

      if (p >= 1.1) {
        obs.destroy();
      }
    });

    // 5. Update Coins (with 3D spin animation)
    this.coinsGroup.getChildren().forEach((coin: any) => {
      let p = coin.getData('progress') + progressSpeed;
      coin.setData('progress', p);

      if (p < 0) return;

      const lane = coin.getData('lane');
      const spread = this.LANE_SPREAD_TOP + p * (this.LANE_SPREAD_BOTTOM - this.LANE_SPREAD_TOP);
      let targetX = centerX + lane * spread;
      let targetY = this.HORIZON_Y + p * (this.ROAD_BOTTOM_Y - this.HORIZON_Y) - 25 * p;

      // Magnet Pull effect
      if (this.hasMagnet && p >= 0.35 && Math.abs(targetY - playerY) < 220) {
        const angle = Phaser.Math.Angle.Between(targetX, targetY, playerX, playerY);
        targetX += Math.cos(angle) * 380 * deltaSec;
        targetY += Math.sin(angle) * 380 * deltaSec;
      }

      coin.x = targetX;
      coin.y = targetY;

      // Animate 3D Spin
      const f = Math.floor((this.time.now / 110) % 4);
      coin.setTexture(`coin_f${f}`);

      const scale = 0.3 + p * 0.8;
      coin.setScale(scale);
      coin.setDepth(25 + Math.floor(p * 20));

      // Collect Check
      if (!coin.getData('collected') && p >= 0.72 && p <= 0.96) {
        if (Math.abs(coin.x - playerX) < 45 && Math.abs(coin.y - playerY) < 48) {
          this.collectCoin(coin);
        }
      }

      if (p >= 1.1) {
        coin.destroy();
      }
    });

    // 6. Update Knowledge Scrolls
    this.scrollsGroup.getChildren().forEach((scroll: any) => {
      let p = scroll.getData('progress') + progressSpeed;
      scroll.setData('progress', p);

      if (p < 0) return;

      const lane = scroll.getData('lane');
      const spread = this.LANE_SPREAD_TOP + p * (this.LANE_SPREAD_BOTTOM - this.LANE_SPREAD_TOP);
      scroll.x = centerX + lane * spread;
      scroll.y = this.HORIZON_Y + p * (this.ROAD_BOTTOM_Y - this.HORIZON_Y) - 30 * p;

      const scale = 0.35 + p * 0.85;
      scroll.setScale(scale);
      scroll.setDepth(28 + Math.floor(p * 20));

      // Pulse
      scroll.setAlpha(0.85 + Math.sin(this.time.now * 0.008) * 0.15);

      if (!scroll.getData('collected') && p >= 0.72 && p <= 0.96) {
        if (Math.abs(scroll.x - playerX) < 46 && Math.abs(scroll.y - playerY) < 50) {
          this.collectScroll(scroll);
        }
      }

      if (p >= 1.1) {
        scroll.destroy();
      }
    });

    // 7. Update Power-ups
    this.powerUpsGroup.getChildren().forEach((pwr: any) => {
      let p = pwr.getData('progress') + progressSpeed;
      pwr.setData('progress', p);

      if (p < 0) return;

      const lane = pwr.getData('lane');
      const spread = this.LANE_SPREAD_TOP + p * (this.LANE_SPREAD_BOTTOM - this.LANE_SPREAD_TOP);
      pwr.x = centerX + lane * spread;
      pwr.y = this.HORIZON_Y + p * (this.ROAD_BOTTOM_Y - this.HORIZON_Y) - 30 * p;

      pwr.setScale(0.35 + p * 0.8);
      pwr.setDepth(29 + Math.floor(p * 20));

      if (p >= 0.72 && p <= 0.96) {
        if (Math.abs(pwr.x - playerX) < 44 && Math.abs(pwr.y - playerY) < 46) {
          this.collectPowerUp(pwr);
        }
      }

      if (p >= 1.1) {
        pwr.destroy();
      }
    });

    // 8. Distance Quiz Trigger
    if (this.distance >= this.nextQuizDistance) {
      this.nextQuizDistance += 320 + Math.random() * 120;
      this.pauseForQuiz();
    }

    // Callbacks to UI
    this.callbacks.onScoreUpdate(this.score, this.coins, Math.floor(this.distance));
  }

  // ==========================================
  // COLLISIONS & ITEM LOGIC
  // ==========================================
  private handleObstacleCollision(obs: any) {
    const type = obs.getData('type');

    // Safe if jumping over barrier
    if (type === 'obs_barrier' && this.isJumping) {
      return;
    }

    // Safe if sliding under hanging banner
    if (type === 'obs_banner' && this.isSliding) {
      return;
    }

    obs.setData('hit', true);

    // If shield active, consume shield without penalty
    if (this.hasShield) {
      this.hasShield = false;
      this.shieldBubble.setVisible(false);
      audioService.playSfx('powerup');
      this.cameras.main.flash(220, 56, 189, 248);
      return;
    }

    // Lost life
    this.lives -= 1;
    this.callbacks.onLivesUpdate(this.lives);
    audioService.playSfx('wrong');
    this.cameras.main.shake(280, 0.02);

    // Red damage flash & dizzy pose
    this.isCrashing = true;
    this.playerSprite.setTexture('char_crash');

    this.tweens.add({
      targets: this.playerContainer,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.playerContainer.alpha = 1;
        this.isCrashing = false;
        if (!this.isSliding && !this.isJumping) {
          this.playerSprite.setTexture(`char_run_${this.currentRunFrame}`);
        }
      },
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

    // Particle sparkle tween
    this.tweens.add({
      targets: coin,
      y: coin.y - 35,
      alpha: 0,
      scaleX: 1.4,
      scaleY: 1.4,
      duration: 160,
      onComplete: () => coin.destroy(),
    });
  }

  private collectScroll(scroll: any) {
    scroll.setData('collected', true);
    audioService.playSfx('powerup');

    this.tweens.add({
      targets: scroll,
      scaleX: 1.6,
      scaleY: 1.6,
      alpha: 0,
      duration: 220,
      onComplete: () => {
        scroll.destroy();
        this.pauseForQuiz();
      },
    });
  }

  private collectPowerUp(pwr: any) {
    const type = pwr.getData('powerType');
    audioService.playSfx('powerup');
    pwr.destroy();

    if (type === 'pwr_shield') {
      this.hasShield = true;
      this.shieldBubble.setVisible(true);
      this.callbacks.onPowerUpActive('Perisai Emas', 10);
    } else if (type === 'pwr_magnet') {
      this.hasMagnet = true;
      this.magnetAura.setVisible(true);
      this.callbacks.onPowerUpActive('Magnet Koin', 10);

      this.magnetTimer?.destroy();
      this.magnetTimer = this.time.delayedCall(10000, () => {
        this.hasMagnet = false;
        this.magnetAura.setVisible(false);
      });
    } else if (type === 'pwr_star') {
      this.doubleMultiplier = true;
      this.callbacks.onPowerUpActive('Skor 2x', 10);

      this.doubleTimer?.destroy();
      this.doubleTimer = this.time.delayedCall(10000, () => {
        this.doubleMultiplier = false;
      });
    }
  }

  // ==========================================
  // QUIZ & PAUSE LIFECYCLE
  // ==========================================
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
      // Temporary speed-boost invulnerability shield
      this.hasShield = true;
      this.shieldBubble.setVisible(true);
      this.time.delayedCall(4000, () => {
        this.hasShield = false;
        this.shieldBubble.setVisible(false);
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
