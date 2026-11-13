import { useState } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usePricing } from '../hooks/usePricing';
import { X, CheckCircle, Zap, ShieldCheck, Loader2, Globe } from 'lucide-react';

export default function ProModal({ onClose }) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  
  const { 
    localPrice, 
    localCurrency, 
    localSymbol, 
    paystackCurrency, 
    paystackSubunit, 
    countryCode, 
    isLoading: pricingLoading 
  } = usePricing();

  const perks = [
    'Unlimited AI Summaries',
    'Early access to past questions',
    'Verified Tutor Badge',
    'Ad-free experience',
    'Priority support',
  ];

  const config = {
    reference: (new Date()).getTime().toString(),
    email: user?.email || 'student@campus.com',
    amount: paystackSubunit, 
    currency: paystackCurrency, 
    publicKey: 'pk_test_YOUR_PUBLIC_KEY_HERE', // <-- MAKE SURE YOUR PK_TEST KEY IS HERE
    metadata: {
      custom_fields: [
        { display_name: "User ID", variable_name: "user_id", value: user?.id },
        { display_name: "Detected Country", variable_name: "country", value: countryCode },
        { display_name: "Display Price", variable_name: "display_price", value: `${localSymbol}${localPrice}` }
      ]
    }
  };

  // 🚨 THIS IS STEP 4: We no longer call Supabase from here! The Webhook does it.
  const onSuccess = (reference) => {
    console.log('Paystack Payment Success. Reference:', reference.reference);
    setProcessing(true);
    
    toast('Payment successful! Upgrading your account securely...', 'success');
    
    // Wait 3 seconds to allow the Paystack Webhook to hit your database
    setTimeout(() => {
      toast('Upgrade complete! Please refresh the page.', 'success');
      window.location.reload(); // Force reload to show the PRO badge
    }, 3000);
  };

  const onClosePaystack = () => {
    toast('Payment window closed.', 'info');
  };

  const initializePayment = usePaystackPayment(config);

  const handleUpgrade = () => {
    if (!user) return toast('Please sign in first.', 'error');
    if (profile?.is_pro) return toast('You are already Pro!', 'info');
    if (pricingLoading) return toast('Detecting your location...', 'info');
    
    initializePayment({ onSuccess, onClose: onClosePaystack });
  };

  const isConverted = paystackCurrency !== localCurrency;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 backdrop-enter">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="glass rounded-[2rem] p-8 md:p-10 max-w-lg w-full relative z-10 modal-enter border-teal/30 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal/20 rounded-full blur-[100px] -z-10" />
        
        <button onClick={onClose} className="absolute top-6 right-6 text-muted hover:text-white transition-colors"><X size={24} /></button>
        
        <div className="flex justify-between items-start mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal to-violet p-[1px] shadow-[0_0_30px_rgba(94,234,212,0.4)]">
            <div className="w-full h-full bg-bg rounded-2xl flex items-center justify-center">
              <Zap className="text-teal" size={32} />
            </div>
          </div>
          
          {!pricingLoading && countryCode && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-muted">
              <Globe size={14} /> Pricing for {countryCode}
            </div>
          )}
        </div>

        <h2 className="font-display text-4xl font-bold mb-2 text-white">Go <span className="gradient-text">Pro</span></h2>
        <p className="text-muted mb-8 text-lg">Supercharge your semester. Fair pricing for your region.</p>

        <div className="space-y-4 mb-8">
          {perks.map((perk) => (
            <div key={perk} className="flex items-center gap-3">
              <CheckCircle className="text-teal shrink-0" size={20} />
              <span className="text-sm text-gray-200">{perk}</span>
            </div>
          ))}
        </div>

        <div className="flex items-end gap-2 mb-2">
          {pricingLoading ? (
            <div className="skeleton h-12 w-32 rounded-xl" />
          ) : (
            <>
              <span className="text-5xl font-display font-bold text-white">
                {localSymbol}{localPrice}
              </span>
              <span className="text-muted mb-1">/month</span>
            </>
          )}
        </div>

        {isConverted && !pricingLoading && (
          <p className="text-xs text-muted mb-4">
            * Billed as ${(paystackSubunit / 100).toFixed(2)} USD at checkout. Your bank will apply the equivalent in {localCurrency}.
          </p>
        )}

        <button 
          onClick={handleUpgrade} 
          disabled={processing || profile?.is_pro || pricingLoading}
          className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 mt-4"
        >
          {processing ? (
            <><Loader2 className="animate-spin" size={20} /> Verifying...</>
          ) : profile?.is_pro ? (
            'You are Pro!'
          ) : pricingLoading ? (
            'Calculating regional price...'
          ) : (
            <><ShieldCheck size={20} /> Upgrade for {localSymbol}{localPrice}</>
          )}
        </button>
        
        <p className="text-center text-xs text-muted mt-4 flex items-center justify-center gap-1">
          <ShieldCheck size={14} /> Secure payment powered by Paystack
        </p>
      </div>
    </div>
  );
}