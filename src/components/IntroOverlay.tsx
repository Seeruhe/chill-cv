import { AnimatePresence, motion } from 'motion/react';

type IntroOverlayProps = {
  hasLaunched: boolean;
  lang: 'EN' | 'CN';
  onLaunch: () => void;
};

export const IntroOverlay = ({ hasLaunched, lang, onLaunch }: IntroOverlayProps) => (
  <AnimatePresence>
    {!hasLaunched && (
      <motion.div
        key="intro"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.15, rotateX: -10 }}
        className="fixed left-0 top-0 z-50 grid h-screen w-screen place-items-center overflow-hidden bg-[#08091a] pointer-events-none"
      >
        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className="radio-3d-wrap perspective-[700px] mb-8 pointer-events-auto">
            <motion.button
              type="button"
              aria-label={lang === 'EN' ? 'Enter Chill FM' : '进入 Chill FM'}
              className="radio-body relative w-[200px] h-[130px] preserve-3d animate-float3d cursor-pointer border-0 bg-transparent p-0"
              onClick={onLaunch}
              whileHover={{ scale: 1.06, rotateY: 8 }}
              whileTap={{ scale: 0.96 }}
              style={{ transform: 'rotateX(18deg) rotateY(-14deg)' }}
            >
              <div className="absolute -top-[50px] right-8 w-0.5 h-14 bg-gray-600 rounded-sm origin-bottom rotate-[-6deg]" />
              <div className="absolute inset-0 bg-[#D64550] border border-[#f28c8c] translate-z-[22px] rounded-lg p-3 flex flex-col gap-2 shadow-[0_15px_35px_rgba(214,69,80,0.5)]">
                <div className="bg-[#0a0505] border border-[#301010] rounded h-9 flex items-center justify-center overflow-hidden">
                  <span className="font-mono text-[9px] text-[#f28c8c] tracking-[2px] whitespace-nowrap animate-rscroll">
                    NUJABES · JAZZ HOP · LO-FI · ATCQ · DIGABLE PLANETS · CHILL ·&nbsp;
                  </span>
                </div>
                <div className="grid grid-cols-10 gap-x-1 gap-y-1.5 px-0.5">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#9b2c35]" />
                  ))}
                </div>
                <div className="flex gap-2.5 justify-end items-center mt-auto">
                  <div className="w-3.5 h-3.5 rounded-full bg-[radial-gradient(circle_at_35%_35%,#f28c8c,#9b2c35)] border border-[#a6363f]" />
                  <div className="big-knob w-5 h-5 rounded-full bg-[radial-gradient(circle_at_35%_35%,#f28c8c,#9b2c35)] border border-[#a6363f]" />
                </div>
              </div>
              <div className="absolute w-[200px] h-[22px] top-0 bg-[#a6363f]" style={{ transform: 'rotateX(90deg) translateZ(11px)' }} />
              <div className="absolute w-[22px] h-[130px] right-0 bg-[#a6363f]" style={{ transform: 'rotateY(90deg) translateZ(189px) translateX(-11px)' }} />
            </motion.button>
          </div>
          <div className="pointer-events-none font-mono text-xs text-[#D64550] tracking-[3px] animate-blink-custom uppercase">
            {lang === 'EN' ? 'Enter the Chill Zone' : '进入 Chill FM'}
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);
