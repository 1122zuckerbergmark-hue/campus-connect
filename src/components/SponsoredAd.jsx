import { ExternalLink, Sparkles, Zap, ShieldCheck } from 'lucide-react';

export default function SponsoredAd({ onUpgrade }) {
  return (
    <div className="relative overflow-hidden rounded-3xl p-6 border border-teal/30 bg-gradient-to-br from-teal/10 via-bg to-violet/10 flex flex-col justify-between h-full group hover:shadow-[0_10px_40px_rgba(94,234,212,0.15)] transition-all duration-300">
      {/* Premium Sponsored Badge */}
      <div className="absolute top-0 right-0 bg-teal/20 text-teal text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider flex items-center gap-1">
        <ShieldCheck size={12} /> Sponsored
      </div>

      <div>
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform">
          <Sparkles size={24} />
        </div>
        <h3 className="font-display font-semibold text-xl mb-2 leading-tight text-white">
          Ace your exams with Grammarly Premium.
        </h3>
        <p className="text-muted text-sm mb-6">
          Get 20% off Grammarly Premium. Write flawless essays, check your grammar, and cite sources automatically.
        </p>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-white/10">
        <a href="#" className="flex items-center gap-1.5 text-xs text-teal hover:text-teal/80 font-bold transition-colors">
          Claim Discount <ExternalLink size={14} />
        </a>
        
        {/* The psychological trap: Free users can remove ads by upgrading */}
        <button 
          onClick={onUpgrade}
          className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold bg-white/5 hover:bg-white/10 text-muted hover:text-white px-3 py-1.5 rounded-lg transition-all border border-white/5 hover:border-white/20"
        >
          <Zap size={12} className="text-violet" /> Remove Ads
        </button>
      </div>
    </div>
  );
}