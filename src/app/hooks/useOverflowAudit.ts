import { useEffect } from "react";

export function useOverflowAudit(disabled = false) {
  useEffect(() => {
    if (!import.meta.env.DEV || disabled) return;
    const audit = () => {
      const viewportWidth = document.documentElement.clientWidth;
      const offenders = Array.from(document.querySelectorAll<HTMLElement>("body *")).filter((element) => {
        const style = getComputedStyle(element);
        if (style.position === "fixed" || style.display === "none") return false;
        const rect = element.getBoundingClientRect();
        const containsOverflow = ["auto", "scroll", "hidden", "clip"].includes(style.overflowX);
        return (!containsOverflow && element.scrollWidth > element.clientWidth + 1) || rect.left < -1 || rect.right > viewportWidth + 1;
      }).map((element) => ({
        selector: element.id ? `#${element.id}` : `${element.tagName.toLowerCase()}${element.className ? `.${String(element.className).trim().replace(/\s+/g, ".")}` : ""}`,
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
      }));
      if (offenders.length) console.warn("[MIRA] Horizontal overflow audit", offenders);
    };
    const frame = requestAnimationFrame(() => requestAnimationFrame(audit));
    window.addEventListener("resize", audit);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", audit); };
  }, [disabled]);
}
