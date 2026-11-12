import React, { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { ArabicRunnerScene, GameEventCallbacks } from './ArabicRunnerScene';

interface PhaserGameProps {
  callbacks: GameEventCallbacks;
  onSceneReady?: (scene: ArabicRunnerScene) => void;
}

export const PhaserGame: React.FC<PhaserGameProps> = ({ callbacks, onSceneReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<ArabicRunnerScene | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Destroy existing instance if any
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 720,
      height: 540,
      backgroundColor: '#1e1b4b',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: ArabicRunnerScene,
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Wait for scene to boot
    game.events.once('ready', () => {
      const scene = game.scene.getScene('ArabicRunnerScene') as ArabicRunnerScene;
      sceneRef.current = scene;
      scene.scene.restart({ callbacks });
      if (onSceneReady) {
        onSceneReady(scene);
      }
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden">
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center rounded-xl overflow-hidden shadow-2xl"
      />
    </div>
  );
};
