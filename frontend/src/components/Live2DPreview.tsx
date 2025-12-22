import { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { Live2DModel } from 'pixi-live2d-display';
import { cn } from '@/lib/utils';

// Expose PIXI to window so that pixi-live2d-display can access PIXI.Ticker
(window as unknown as Window & { PIXI: typeof PIXI }).PIXI = PIXI;

interface Live2DPreviewProps {
  modelUrl: string;
  width?: number;
  height?: number;
  scale?: number;
  fallbackImageUrl: string;
  className?: string;
  /** Expression name to display (e.g., 'smile01', 'angry01', 'sad01', 'default') */
  expression?: string;
  /** Motion name to play (e.g., 'idle01', 'smile01', 'angry01') */
  motion?: string;
  /** Whether the model is speaking (animates mouth) */
  speaking?: boolean;
}

function Live2DPreview({
  modelUrl,
  width = 400,
  height = 600,
  scale = 0.25,
  fallbackImageUrl,
  className,
  expression,
  motion,
  speaking = false,
}: Live2DPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const modelRef = useRef<InstanceType<typeof Live2DModel> | null>(null);
  const speakingIntervalRef = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    let mounted = true;

    const initLive2D = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Create PIXI Application (v6 API - pass options directly to constructor)
        const app = new PIXI.Application({
          view: canvasRef.current!,
          width,
          height,
          backgroundAlpha: 0,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });

        if (!mounted) {
          return;
        }

        appRef.current = app;

        // Load the Live2D model
        const model = await Live2DModel.from(modelUrl, {
          autoInteract: true,
          autoUpdate: true,
        });

        if (!mounted) {
          model.destroy();
          return;
        }

        modelRef.current = model;

        // Configure model position and scale
        model.scale.set(scale);
        model.anchor.set(0.5, 0.5);
        model.x = width / 2;
        model.y = height / 2;

        model.on('hit', (hitAreaNames) => {
          if (hitAreaNames.includes('body')) {
            console.log('Body area clicked');
          }
        });

        // Add model to stage
        app.stage.addChild(model);

        setIsLoading(false);
      } catch (err) {
        if (mounted) {
          console.error('Failed to load Live2D model:', err);
          setError(err instanceof Error ? err.message : 'Failed to load model');
          setIsLoading(false);
        }
      }
    };

    initLive2D();

    return () => {
      mounted = false;
      if (modelRef.current) {
        modelRef.current.destroy();
        modelRef.current = null;
      }
      if (appRef.current) {
        appRef.current = null;
      }
    };
  }, [modelUrl, width, height, scale]);

  // Handle expression changes
  useEffect(() => {
    if (!modelRef.current || !expression) return;

    try {
      // Set the expression on the model
      // The expression name should match the "name" field in model.json expressions array
      modelRef.current.expression(expression);
    } catch (err) {
      console.warn(`Failed to set expression "${expression}":`, err);
    }
  }, [expression]);

  // Handle motion changes
  useEffect(() => {
    if (!modelRef.current || !motion) return;

    try {
      // Play the motion on the model
      // The motion name should match the key in model.json motions object
      // motion(group, index, priority) - priority: 0=none, 1=idle, 2=normal, 3=force
      modelRef.current.motion(motion, 0, 3);
    } catch (err) {
      console.warn(`Failed to play motion "${motion}":`, err);
    }
  }, [motion]);

  // Handle speaking animation (mouth movement simulation)
  useEffect(() => {
    if (!modelRef.current) return;

    const model = modelRef.current;
    const internalModel = model.internalModel;
    let mouthValue = 0;

    // Function to update mouth parameter before model update
    const updateMouth = () => {
      if (!internalModel?.coreModel) return;

      const coreModel = internalModel.coreModel as {
        setParamFloat?: (id: string, value: number, weight?: number) => void;
        setParameterValueById?: (id: string, value: number) => void;
      };

      const mouthParams = [
        'PARAM_MOUTH_OPEN_Y',
        'ParamMouthOpenY',
        'PARAM_MOUTH_OPEN',
        'ParamMouthOpen',
      ];

      for (const param of mouthParams) {
        try {
          if (typeof coreModel.setParamFloat === 'function') {
            coreModel.setParamFloat(param, mouthValue);
            break;
          }
          if (typeof coreModel.setParameterValueById === 'function') {
            coreModel.setParameterValueById(param, mouthValue);
            break;
          }
        } catch {
          // Parameter doesn't exist, try next one
        }
      }
    };

    if (speaking) {
      // Animate mouth value randomly to simulate speech
      const animateMouth = () => {
        mouthValue = Math.random() * 0.7 + 0.3; // Random value between 0.3 and 1.0
      };

      // Run mouth value update at ~15fps for natural look
      speakingIntervalRef.current = window.setInterval(animateMouth, 66);

      // Listen to the model's update cycle and set mouth value before each update
      internalModel.on('beforeModelUpdate', updateMouth);
    } else {
      // Stop speaking - close mouth
      if (speakingIntervalRef.current) {
        clearInterval(speakingIntervalRef.current);
        speakingIntervalRef.current = null;
      }

      mouthValue = 0;
      internalModel.off('beforeModelUpdate', updateMouth);

      // Force one final update to close the mouth
      updateMouth();
    }

    return () => {
      if (speakingIntervalRef.current) {
        clearInterval(speakingIntervalRef.current);
        speakingIntervalRef.current = null;
      }
      internalModel.off('beforeModelUpdate', updateMouth);
    };
  }, [speaking]);

  return (
    <div
      ref={containerRef}
      className={cn('relative h-full w-full', className)}
      style={{ width, height }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
      {isLoading && (
        <div className="text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm">
          加载 Live2D 模型中...
        </div>
      )}
      {error && (
        <img src={fallbackImageUrl} className="h-full w-full object-cover" loading="lazy" />
      )}
    </div>
  );
}

export default Live2DPreview;
