import { useMemo } from 'react';

const FloatingHearts = ({ count = 12 }) => {
  const hearts = useMemo(
    () =>
      Array.from({ length: count }).map((_, index) => ({
        id: index,
        left: Math.random() * 100,
        delay: Math.random() * 4,
        duration: 6 + Math.random() * 6,
        scale: 0.7 + Math.random() * 0.6,
      })),
    [count],
  );

  return (
    <div className="floating-hearts">
      {hearts.map((heart) => (
        <span
          key={heart.id}
          className="floating-heart"
          style={{
            left: `${heart.left}%`,
            animationDelay: `${heart.delay}s`,
            animationDuration: `${heart.duration}s`,
            transform: `scale(${heart.scale})`,
          }}
        >
          ❤️
        </span>
      ))}
    </div>
  );
};

export default FloatingHearts;

