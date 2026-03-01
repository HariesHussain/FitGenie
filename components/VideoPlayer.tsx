import React, { useEffect, useState } from "react";

interface VideoPlayerProps {
  url: string;
  title?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title }) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [maxHeight, setMaxHeight] = useState<string>("360px");

  // responsive maxHeight: keep mobile smaller and desktop capped
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w < 640) setMaxHeight("42vh"); // mobile — keep it tall but not huge
      else if (w < 1024) setMaxHeight("320px"); // tablet-ish
      else setMaxHeight("360px"); // desktop cap
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  useEffect(() => {
    // reset loading state when url changes
    setLoaded(false);
    setErrored(false);
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
    window.open(url, "_blank");
  };

  // A small shared wrapper style so element doesn't grow too large and doesn't push content
  const wrapperStyle: React.CSSProperties = {
    aspectRatio: "16 / 9",
    maxHeight,
    width: "100%",
    overflow: "hidden",
    background: "#000",
    borderRadius: 12,
  };

  return (
    <div className="w-full" style={{ marginBottom: 6 }}>
      {/* Media wrapper */}
      <div style={wrapperStyle} className="relative">
        {/* Loading spinner */}
        {!loaded && !errored && (
          <div
            className="absolute inset-0 z-20 flex items-center justify-center"
            style={{ pointerEvents: "none" }}
          >
            <div className="w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center">
              <div className="animate-spin w-5 h-5 border-t-2 border-white/60 rounded-full" />
            </div>
          </div>
        )}

        {/* YouTube embed branch */}
        {videoId ? (
          <>
            <iframe
              src={embedUrl}
              title={title || "Exercise video"}
              className="w-full h-full"
              style={{ border: "0", display: errored ? "none" : "block" }}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              onLoad={() => setLoaded(true)}
              onError={() => setErrored(true)}
            />
            {errored && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-white">
                <div className="mb-3 text-sm">Video cannot be embedded here.</div>
                <button
                  onClick={openInNewTab}
                  className="px-3 py-2 rounded bg-primary text-white text-sm"
                  style={{ cursor: "pointer" }}
                >
                  Open video
                </button>
              </div>
            )}
          </>
        ) : (
          // Local video branch
          <>
            <video
              src={url}
              className="w-full h-full"
              style={{ objectFit: "contain", background: "black", display: errored ? "none" : "block" }}
              autoPlay
              muted
              loop
              playsInline
              onCanPlay={() => setLoaded(true)}
              onError={() => setErrored(true)}
              // prevent focusing controls accidentally
              controls={false}
            />
            {errored && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-white">
                <div className="mb-3 text-sm">Video cannot be played here.</div>
                <button
                  onClick={openInNewTab}
                  className="px-3 py-2 rounded bg-primary text-white text-sm"
                  style={{ cursor: "pointer" }}
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
