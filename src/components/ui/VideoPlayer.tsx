import React, { useRef, useState, useEffect } from 'react';

type VideoPlayerProps = {
  src: string;
  className?: string;
  muted?: boolean;
  loop?: boolean;
  poster?: string;
};

const DEFAULT_POSTER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90"><rect width="100%" height="100%" fill="%23e5e7eb"/><polygon points="60,45 110,70 110,20" fill="%239ca3af"/></svg>`
  );

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, className, muted = true, loop = false, poster }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
  }, [src]);

  const start = () => {
    setIsPlaying(true);
    requestAnimationFrame(() => {
      if (videoRef.current) videoRef.current.play().catch(() => {});
    });
  };

  const toggle = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      el.pause();
      setIsPlaying(false);
    }
  };

  const handleEnded = () => setIsPlaying(false);
  const handleError = () => setIsPlaying(false);

  return (
    <div className={className} style={{ position: 'relative' }}>
      {!isPlaying && (
        <button
          type="button"
          onClick={start}
          aria-label="Play video"
          style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <img
            src={poster || DEFAULT_POSTER}
            alt="video preview"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.25rem' }}
          />
          <span
            style={{
              position: 'relative',
              width: 36,
              height: 36,
              borderRadius: 9999,
              background: 'rgba(0,0,0,0.6)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              zIndex: 3,
            }}
          >
            ▶
          </span>
        </button>
      )}
      <video
        ref={videoRef}
        src={src}
        controls={false}
        muted={muted}
        loop={loop}
        playsInline
        preload="metadata"
        onClick={toggle}
        onEnded={handleEnded}
        onError={handleError}
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.25rem', display: isPlaying ? 'block' : 'none' }}
      />
    </div>
  );
};

export default VideoPlayer;



