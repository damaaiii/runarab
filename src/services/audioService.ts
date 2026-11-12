/**
 * Audio Engine for Rihlatul Mughamarah (Arabic Learning Adventure)
 * Features:
 * 1. Procedural Arabic Synthesizer (Maqam Hijaz / Bayati scales with Oud/Ney/Qanun simulation & Darbuka rhythm)
 * 2. High-fidelity Procedural SFX for coin, jump, slide, powerup, correct, wrong, levelup, gameover
 * 3. Fallback support for public/audio/*.mp3
 * 4. Arabic Text-to-Speech (Web Speech API) for authentic Istima' & Kalam pronunciation
 * 5. Full volume and persistence controls
 */

class AudioService {
  private ctx: AudioContext | null = null;
  private musicVolume = 0.5;
  private sfxVolume = 0.7;
  private musicEnabled = true;
  private sfxEnabled = true;
  private isMuted = false;

  private currentTrack: 'menu' | 'gameplay' | null = null;
  private isMusicPlaying = false;
  private musicLoopTimeout: any = null;

  // Local storage keys
  private readonly STORAGE_KEY = 'rihla_audio_settings';

  constructor() {
    this.loadSettings();
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public userInteracted() {
    this.initContext();
    if (this.currentTrack && !this.isMusicPlaying) {
      this.startMusicLoop();
    }
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.musicVolume = parsed.musicVolume ?? 0.5;
        this.sfxVolume = parsed.sfxVolume ?? 0.7;
        this.musicEnabled = parsed.musicEnabled ?? true;
        this.sfxEnabled = parsed.sfxEnabled ?? true;
        this.isMuted = parsed.isMuted ?? false;
      }
    } catch {
      // ignore
    }
  }

  public saveSettings() {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({
          musicVolume: this.musicVolume,
          sfxVolume: this.sfxVolume,
          musicEnabled: this.musicEnabled,
          sfxEnabled: this.sfxEnabled,
          isMuted: this.isMuted,
        })
      );
    } catch {
      // ignore
    }
  }

  // Settings API
  public getSettings() {
    return {
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      musicEnabled: this.musicEnabled,
      sfxEnabled: this.sfxEnabled,
      isMuted: this.isMuted,
      muted: this.isMuted,
    };
  }

  public setMusicVolume(val: number) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    this.saveSettings();
  }

  public setSfxVolume(val: number) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    this.saveSettings();
  }

  public toggleMusic(enabled?: boolean) {
    this.musicEnabled = enabled !== undefined ? enabled : !this.musicEnabled;
    this.saveSettings();
    if (!this.musicEnabled) {
      this.stopMusic();
    } else if (this.currentTrack) {
      this.playMusic(this.currentTrack);
    }
  }

  public toggleSfx(enabled?: boolean) {
    this.sfxEnabled = enabled !== undefined ? enabled : !this.sfxEnabled;
    this.saveSettings();
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    this.saveSettings();
    if (this.isMuted) {
      this.stopMusic();
    } else if (this.currentTrack) {
      this.playMusic(this.currentTrack);
    }
  }

  // --- BACKGROUND MUSIC ENGINE ---
  public playMusic(track: 'menu' | 'gameplay') {
    this.initContext();
    if (this.currentTrack === track && this.isMusicPlaying) return;

    this.stopMusic();
    this.currentTrack = track;

    if (!this.musicEnabled || this.isMuted) return;

    this.startMusicLoop();
  }

  public pauseMusic() {
    this.stopMusic(false);
  }

  public resumeMusic() {
    if (this.currentTrack && this.musicEnabled && !this.isMuted) {
      this.startMusicLoop();
    }
  }

  public stopMusic(clearTrack = true) {
    this.isMusicPlaying = false;
    if (this.musicLoopTimeout) {
      clearTimeout(this.musicLoopTimeout);
      this.musicLoopTimeout = null;
    }
    if (clearTrack) {
      this.currentTrack = null;
    }
  }

  private startMusicLoop() {
    if (!this.ctx || !this.musicEnabled || this.isMuted || !this.currentTrack) return;
    this.isMusicPlaying = true;

    if (this.currentTrack === 'menu') {
      this.playArabicMenuMotif();
    } else {
      this.playArabicAdventureLoop();
    }
  }

  // Ambient Oud/Ney arpeggio in Maqam Bayati (D, Eb-half-flat/Eb, F, G, A, Bb, C, D)
  private playArabicMenuMotif() {
    if (!this.isMusicPlaying || this.currentTrack !== 'menu') return;

    // Frequencies for D Arabic maqam
    const notes = [
      293.66, // D4
      311.13, // Eb4
      369.99, // F#4 / F4
      392.00, // G4
      440.00, // A4
      466.16, // Bb4
      554.37, // C#5
      587.33, // D5
    ];

    const pattern = [0, 2, 3, 4, 3, 2, 4, 5, 4, 3, 2, 1, 0];
    let noteIdx = 0;

    const playNextNote = () => {
      if (!this.isMusicPlaying || this.currentTrack !== 'menu' || !this.ctx) return;

      const freq = notes[pattern[noteIdx % pattern.length]];
      this.synthesizeOudPluck(freq, 0.45, (this.musicVolume * 0.35));

      // Drone / Ney soft pad on root every few notes
      if (noteIdx % 4 === 0) {
        this.synthesizeNeyDrone(146.83, 1.8, (this.musicVolume * 0.15)); // D3
      }

      noteIdx++;
      if (noteIdx < pattern.length) {
        this.musicLoopTimeout = setTimeout(playNextNote, 420);
      } else {
        // Pause between motifs
        this.musicLoopTimeout = setTimeout(() => {
          this.playArabicMenuMotif();
        }, 1200);
      }
    };

    playNextNote();
  }

  // Energetic rhythmic adventure loop in Maqam Hijaz (D, Eb, F#, G, A, Bb, C, D)
  private playArabicAdventureLoop() {
    if (!this.isMusicPlaying || this.currentTrack !== 'gameplay') return;

    // D Hijaz: D4, Eb4, F#4, G4, A4, Bb4, C5, D5
    const hijaz = [293.66, 311.13, 369.99, 392.00, 440.00, 466.16, 523.25, 587.33];
    // Riff melody
    const riff = [
      { n: 0, dur: 200 },
      { n: 1, dur: 200 },
      { n: 2, dur: 200 },
      { n: 3, dur: 350 },
      { n: 2, dur: 200 },
      { n: 1, dur: 200 },
      { n: 0, dur: 400 },
      { n: 4, dur: 200 },
      { n: 3, dur: 200 },
      { n: 2, dur: 200 },
      { n: 1, dur: 300 },
      { n: 2, dur: 200 },
      { n: 0, dur: 500 },
    ];

    let step = 0;

    const playRiffStep = () => {
      if (!this.isMusicPlaying || this.currentTrack !== 'gameplay' || !this.ctx) return;

      const item = riff[step % riff.length];
      const freq = hijaz[item.n];

      // Pluck Qanun / Oud
      this.synthesizeQanunPluck(freq, item.dur / 1000 + 0.1, this.musicVolume * 0.38);

      // Percussion: Dum (heavy bass hit) & Tek (crisp high hit)
      if (step % 4 === 0) {
        this.synthesizeDarbukaDum(this.musicVolume * 0.45);
      } else if (step % 2 === 1) {
        this.synthesizeDarbukaTek(this.musicVolume * 0.3);
      }

      step++;
      this.musicLoopTimeout = setTimeout(playRiffStep, item.dur);
    };

    playRiffStep();
  }

  // --- INSTRUMENT SYNTHESIS (Web Audio API) ---
  private synthesizeOudPluck(freq: number, duration: number, gainVal: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, now);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(freq * 1.002, now); // subtle chorusing

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, now);
    filter.frequency.exponentialRampToValueAtTime(350, now + duration);

    gain.gain.setValueAtTime(gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  private synthesizeQanunPluck(freq: number, duration: number, gainVal: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 1.8, now);
    filter.Q.value = 2.5;

    gain.gain.setValueAtTime(gainVal * 0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  private synthesizeNeyDrone(freq: number, duration: number, gainVal: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(gainVal, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  private synthesizeDarbukaDum(gainVal: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.18);

    gain.gain.setValueAtTime(gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  private synthesizeDarbukaTek(gainVal: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(300, now);

    gain.gain.setValueAtTime(gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // --- SOUND EFFECTS (SFX) ---
  public playSfx(
    type: 'coin' | 'jump' | 'slide' | 'powerup' | 'correct' | 'wrong' | 'levelup' | 'gameover'
  ) {
    if (!this.sfxEnabled || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const vol = this.sfxVolume;
    const now = this.ctx.currentTime;

    switch (type) {
      case 'coin': {
        // Bright two-tone chime
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
        gain.gain.setValueAtTime(vol * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }
      case 'jump': {
        // Upward pitch sweep
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(650, now + 0.18);
        gain.gain.setValueAtTime(vol * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
        break;
      }
      case 'slide': {
        // Downward swoosh
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.18);
        gain.gain.setValueAtTime(vol * 0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
        break;
      }
      case 'powerup': {
        // Magic arpeggio
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          const t = now + idx * 0.07;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(vol * 0.3, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(t);
          osc.stop(t + 0.26);
        });
        break;
      }
      case 'correct': {
        // Joyful Arabic victory triad (D - F# - A - D)
        const notes = [587.33, 739.99, 880.00, 1174.66];
        notes.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          const t = now + idx * 0.08;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(vol * 0.45, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(t);
          osc.stop(t + 0.42);
        });
        break;
      }
      case 'wrong': {
        // Low discordant buzz
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc1.type = 'sawtooth';
        osc2.type = 'square';
        osc1.frequency.setValueAtTime(150, now);
        osc2.frequency.setValueAtTime(142, now); // dissonance
        gain.gain.setValueAtTime(vol * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.38);
        osc2.stop(now + 0.38);
        break;
      }
      case 'levelup': {
        // Grand fanfare
        const chords = [
          [440, 554, 659], // A major
          [587, 740, 880], // D major
        ];
        chords.forEach((chord, chordIdx) => {
          chord.forEach((freq) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            const t = now + chordIdx * 0.22;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(vol * 0.35, t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
            osc.connect(gain);
            gain.connect(this.ctx!.destination);
            osc.start(t);
            osc.stop(t + 0.52);
          });
        });
        break;
      }
      case 'gameover': {
        // Descending melancholy cadence
        const downNotes = [440, 415.3, 369.99, 293.66];
        downNotes.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          const t = now + idx * 0.2;
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(vol * 0.3, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(t);
          osc.stop(t + 0.48);
        });
        break;
      }
    }
  }

  // --- ARABIC SPEECH / PRONUNCIATION (ISTIMA' & KALAM) ---
  public speakArabic(text: string, rate = 0.85): Promise<void> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = rate;
      utterance.pitch = 1.0;
      utterance.volume = this.isMuted ? 0 : this.sfxVolume;

      // Try to match Arabic voice
      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find((v) => v.lang.startsWith('ar'));
      if (arabicVoice) {
        utterance.voice = arabicVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    });
  }
}

export const audioService = new AudioService();
