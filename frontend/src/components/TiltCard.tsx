import React, { useRef, useCallback, useState } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Max tilt angle in degrees (default 14) */
  maxTilt?: number;
  /** Scale on hover (default 1.03) */
  hoverScale?: number;
  as?: keyof JSX.IntrinsicElements;
  [key: string]: any; // allow passthrough props (onClick, id, etc.)
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  style = {},
  maxTilt = 14,
  hoverScale = 1.03,
  as: Tag = 'div',
  ...rest
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const [hovering, setHovering] = useState(false);

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width - 0.5;
      const cy = (e.clientY - rect.top) / rect.height - 0.5;
      const rotY = cx * maxTilt * 1.4;
      const rotX = -cy * maxTilt;

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setTiltStyle({
          transform: `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(${hoverScale},${hoverScale},${hoverScale})`,
          transition: 'transform 0.08s linear',
        });
      });
    },
    [maxTilt, hoverScale]
  );

  const onEnter = useCallback(() => setHovering(true), []);

  const onLeave = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setHovering(false);
    setTiltStyle({
      transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)',
      transition: 'transform 0.55s cubic-bezier(0.23,1,0.32,1)',
    });
  }, []);

  return (
    // @ts-ignore — dynamic tag
    <Tag
      ref={ref}
      className={`tilt-card${hovering ? ' tilt-card--active' : ''} ${className}`}
      style={{ ...style, ...tiltStyle }}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      {...rest}
    >
      {children}
    </Tag>
  );
};
