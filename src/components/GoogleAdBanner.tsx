import { useEffect, useRef } from "react";

interface GoogleAdBannerProps {
  slotId?: string;
  format?: "auto" | "horizontal" | "rectangle" | "vertical";
  className?: string;
}

export default function GoogleAdBanner({
  slotId = "1234567890",
  format = "auto",
  className = ""
}: GoogleAdBannerProps) {
  const isLoaded = useRef(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && !isLoaded.current) {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isLoaded.current = true;
      }
    } catch (err) {
      console.warn("Google AdSense error:", err);
    }
  }, []);

  return (
    <div className={`w-full my-6 text-center overflow-hidden ${className}`}>
      <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-1">
        Sponsored / Advertisement
      </span>
      <div className="bg-card rounded-xl p-2 border border-border min-h-[90px] flex items-center justify-center">
        <ins
          className="adsbygoogle"
          style={{ display: "block", minWidth: "250px", width: "100%" }}
          data-ad-client="ca-pub-7519594157430444"
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
