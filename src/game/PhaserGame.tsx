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

    // Clean up previous instance if any
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 800,
      height: 600,
      backgroundColor: '#172554',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      render: {
        antialias: true,
        pixelArt: false,
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

    // Listen for scene readiness
    const checkScene = () => {
      const scene = game.scene.getScene('ArabicRunnerScene') as ArabicRunnerScene;
      if (scene) {
        sceneRef.current = scene;
        scene.setCallbacks(callbacks);
        if (onSceneReady) {
          onSceneReady(scene);
        }
      } else {
        setTimeout(checkScene, 50);
      }
    };

    game.events.once('ready', checkScene);

    // Also trigger on window resize
    const handleResize = () => {
      if (gameRef.current?.scale) {
        gameRef.current.scale.refresh();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  // Update callbacks reference if prop changes
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setCallbacks(callbacks);
    }
  }, [callbacks]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden">
      <div
        ref={containerRef}
        id="phaser-game-container"
        className="w-full h-full flex items-center justify-center overflow-hidden"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};
