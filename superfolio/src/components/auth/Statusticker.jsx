import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Illustrative feed — swap for a real "recent activity" query once the
// dashboard has one. Kept local so the auth page has zero data dependency.
const FEED = [
  { company: "Vercel", role: "Frontend Engineer", status: "Applied", time: "09:14" },
  { company: "Linear", role: "Product Engineer", status: "Screening", time: "09:41" },
  { company: "Stripe", role: "Full Stack Dev", status: "Interview", time: "10:02" },
  { company: "Notion", role: "SWE Intern", status: "Applied", time: "10:23" },
  { company: "Figma", role: "Frontend Engineer", status: "Offer", time: "11:05" },
  { company: "Ramp", role: "Backend Engineer", status: "Screening", time: "11:30" },
  { company: "Anthropic", role: "AI Engineer", status: "Interview", time: "11:52" },
];

const STATUS_STYLES = {
  Applied: "text-mist border-mist/40",
  Screening: "text-mist border-mist/40",
  Interview: "text-amber border-amber/50",
  Offer: "text-moss border-moss/50",
};

export default function StatusTicker() {
  const [visible, setVisible] = useState(FEED.slice(0, 4));
  const [cursor, setCursor] = useState(4);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible((prev) => [...prev.slice(1), FEED[cursor % FEED.length]]);
      setCursor((c) => c + 1);
    }, 2600);
    return () => clearInterval(id);
  }, [cursor]);

  return (
    <div className="flex flex-col gap-2" aria-hidden="true">
      <AnimatePresence initial={false} mode="popLayout">
        {visible.map((item, i) => (
          <motion.div
            key={`${item.company}-${item.time}-${i}-${cursor}`}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.03] px-4 py-3"
          >
            <div className="flex flex-col">
              <span className="font-body text-sm text-foreground/90">{item.role}</span>
              <span className="font-mono text-xs text-mist">{item.company}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-mist/70">{item.time}</span>
              <span
                className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${STATUS_STYLES[item.status]}`}
              >
                {item.status}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}