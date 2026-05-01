import React, { useEffect, useState } from "react";

interface VideoPlayerProps {
  url: string;
  title?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title }) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    console.log("VIDEO URL:", url);
    setLoaded(false);
    setErrored(false);
    setRetryCount(0);
  }, [url]);

  const isYouTube = (u?: string) =>
    !!u && (/youtube\.com|youtu\.be|youtube-nocookie\.com/.test(u));

  const extractYouTubeId = (link: string) => {
    if (!link) return "";
    try {
      if (link.includes("youtu.be/")) return link.split("youtu.be/")[1].split(/[?&]/)[0];
      if (link.includes("watch?v=")) return link.split("watch?v=")[1].split("&")[0];
      if (link.includes("/embed/")) return link.split("/embed/")[1].split(/[?&]/)[0];
      const u = new URL(link);
      return u.searchParams.get("v") || "";
    } catch {
      return "";
    }
  };

  const videoId = isYouTube(url) ? extractYouTubeId(url) : "";
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&modestbranding=1&rel=0`
    : "";

  const openInNewTab = () => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full">
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        {!loaded && !errored && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/30">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
            </div>
          </div>
        )}

        {videoId ? (
          <>
            <iframe
              src={embedUrl}
              title={title || "Exercise video"}
              className="h-full w-full"
              style={{ border: "0", display: errored ? "none" : "block" }}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              onLoad={() => setLoaded(true)}
              onError={() => setErrored(true)}
            />
            {errored && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950 text-white">
                <div className="mb-3 text-sm">Video cannot be embedded here.</div>
                <button
                  onClick={openInNewTab}
                  className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-slate-950"
                >
                  Open video
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <video
              key={retryCount}
              src={url}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
              style={{ display: errored ? "none" : "block" }}
              onCanPlay={() => {
                setLoaded(true);
                setErrored(false);
              }}
              onLoadedData={() => setErrored(false)}
              onError={(e) => {
                console.error("VIDEO ERROR (Retry " + retryCount + "):", url, e);
                if (retryCount < 2) {
                  setTimeout(() => setRetryCount((r) => r + 1), 800);
                } else {
                  setErrored(true);
                }
              }}
            />
            {errored && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950 text-white">
                <div className="mb-3 text-sm">Video cannot be played here.</div>
                <button
                  onClick={openInNewTab}
                  className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-slate-950"
                >
                  Open video
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
