import React from 'react';

interface EffectRendererProps {
  effect: string;
}

const EffectRenderer: React.FC<EffectRendererProps> = ({ effect }) => {
  if (!effect || effect === 'none') return null;

  switch (effect) {
    case 'rain':
      return <div className="absolute inset-0 pointer-events-none opacity-60 effect-rain z-0" />;
    case 'fog':
      return (
        <div
          className="absolute bottom-0 left-0 right-0 h-[60%] pointer-events-none z-0 overflow-hidden mix-blend-screen"
          style={{
            maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
          }}
        >
          <div className="effect-fog-layer1" />
          <div className="effect-fog-layer2" />
        </div>
      );
    case 'grain':
      return <div className="absolute inset-0 pointer-events-none effect-grain z-0 mix-blend-overlay opacity-80" />;
    case 'dust':
      return <div className="absolute inset-0 pointer-events-none effect-dust z-0 mix-blend-screen opacity-80" />;
    default:
      return null;
  }
};

export default EffectRenderer;
