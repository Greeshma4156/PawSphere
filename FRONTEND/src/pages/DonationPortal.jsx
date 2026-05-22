import React, { useState, useEffect } from 'react';
import { getCampaigns, donateToCampaign } from '../services/donationService';
import { useUIStore } from '../store/uiStore';
import { Heart, Landmark, Users, ArrowUpRight, DollarSign, Calendar, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DonationPortal() {
  const { user } = useUIStore();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  
  // Checkout Form State
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState('25');
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState(user ? user.name : '');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const res = await getCampaigns();
      setCampaigns(res.data || []);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCheckout = (campaign) => {
    setSelectedCampaign(campaign);
    setDonorName(user ? user.name : '');
    setSuccess(false);
    setCheckoutOpen(true);
  };

  const handleProcessDonation = async (e) => {
    e.preventDefault();
    setProcessing(true);
    
    const finalAmount = donationAmount === 'custom' ? parseFloat(customAmount) : parseFloat(donationAmount);
    
    if (isNaN(finalAmount) || finalAmount <= 0) {
      alert('Please enter a valid donation amount');
      setProcessing(false);
      return;
    }

    try {
      // Simulate bank delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const res = await donateToCampaign({
        campaignId: selectedCampaign._id,
        amount: finalAmount,
        donorName: donorName || 'Anonymous PawLover'
      });

      if (res.success) {
        setSuccess(true);
        // Refresh local listings after slight pause
        setTimeout(() => {
          loadCampaigns();
          setCheckoutOpen(false);
          setSuccess(false);
        }, 1800);
      }
    } catch (err) {
      console.error('Donation transaction failed:', err);
      alert('Transaction failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 relative min-h-[85vh]">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1 px-3 py-1 bg-peach/10 border border-peach/25 rounded-full text-xs font-bold text-peach uppercase tracking-wider mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-peach" /> Sponsoring Medical Treatment
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold font-outfit text-dark dark:text-cream leading-tight">
          Medical Funding Campaigns
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Transparent ledger funding for stray surgeries, emergency medicines, and vaccinations.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-lavender/30 border-t-lavender rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.map((campaign) => {
            const percent = Math.min(100, Math.round((campaign.raisedAmount / campaign.targetAmount) * 100));
            return (
              <motion.div
                key={campaign._id}
                className="bg-white dark:bg-dark border border-lavender/10 dark:border-white/5 rounded-3xl p-5 shadow-md flex flex-col justify-between hover:shadow-xl transition-all"
                whileHover={{ y: -4 }}
              >
                <div>
                  <h3 className="font-extrabold font-outfit text-lg text-dark dark:text-cream leading-tight mb-2">
                    {campaign.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-3">
                    {campaign.description}
                  </p>

                  {/* Progress Indicator */}
                  <div className="space-y-1.5 mb-5">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-lavender font-outfit">{percent}% Funded</span>
                      <span className="text-gray-400 font-normal">${campaign.raisedAmount} of ${campaign.targetAmount}</span>
                    </div>
                    <div className="w-full h-2.5 bg-beige/50 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-lavender to-peach rounded-full transition-all duration-1000"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Expense Items Breakdown */}
                  <div className="bg-beige/25 dark:bg-white/5 p-3 rounded-2xl border border-lavender/5 mb-5">
                    <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5 text-lavender" /> Budget Breakdown
                    </h4>
                    <div className="flex flex-col gap-1.5">
                      {campaign.expenses?.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
                          <span className="truncate max-w-[80%]">• {item.title}</span>
                          <span className="font-bold font-outfit text-dark dark:text-cream">${item.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Backers (Show initials only - No avatars) */}
                <div className="mt-auto">
                  {campaign.backers && campaign.backers.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                        <Users className="w-3 h-3 text-lavender" /> Top Backers
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {campaign.backers.slice(0, 3).map((backer, idx) => (
                          <div
                            key={idx}
                            className="bg-lavender/10 text-lavender px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border border-lavender/5"
                            title={`Donated $${backer.amount}`}
                          >
                            <span className="uppercase text-[9px]">
                              {backer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </span>
                            <span>${backer.amount}</span>
                          </div>
                        ))}
                        {campaign.backers.length > 3 && (
                          <span className="text-[10px] text-gray-400 self-center">+{campaign.backers.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleOpenCheckout(campaign)}
                    disabled={campaign.isCompleted}
                    className={`w-full py-3 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md ${
                      campaign.isCompleted
                        ? 'bg-mint text-emerald-800 shadow-none cursor-default font-extrabold'
                        : 'bg-lavender text-white hover:bg-lavender-light hover:scale-[1.01]'
                    }`}
                  >
                    {campaign.isCompleted ? (
                      <>Fully Funded! 🎉</>
                    ) : (
                      <>Sponsor Treatment <ArrowUpRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Stripe Simulator Glassmorphic Checkout modal */}
      <AnimatePresence>
        {checkoutOpen && selectedCampaign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-dark/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/90 dark:bg-dark/95 backdrop-blur-md border border-lavender/25 dark:border-white/10 rounded-[2.5rem] p-6 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setCheckoutOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-beige/40 dark:bg-white/5 flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-all font-bold"
              >
                ✕
              </button>

              <div className="text-center mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-lavender bg-lavender/10 px-3 py-1 rounded-full">
                  Stripe Checkout Simulator
                </span>
                <h3 className="font-extrabold font-outfit text-lg mt-3 text-dark dark:text-cream leading-tight">
                  Sponsor {selectedCampaign.title}
                </h3>
              </div>

              {success ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-16 h-16 bg-mint text-emerald-700 rounded-full flex items-center justify-center text-3xl mb-4 animate-bounce border-2 border-emerald-300">
                    ✓
                  </div>
                  <h4 className="font-bold text-base text-dark dark:text-cream">Payment Confirmed!</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs">
                    Your mock donation has been logged to the ledger. Thank you for your support!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleProcessDonation} className="space-y-4">
                  {/* Amount Selection */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">
                      Donation Amount ($)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {['10', '25', '50', 'custom'].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            setDonationAmount(val);
                            if (val !== 'custom') setCustomAmount('');
                          }}
                          className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                            donationAmount === val
                              ? 'bg-lavender text-white border-lavender'
                              : 'bg-beige/20 dark:bg-white/5 border-lavender/10 hover:border-lavender/25 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {val === 'custom' ? 'Other' : `$${val}`}
                        </button>
                      ))}
                    </div>

                    {donationAmount === 'custom' && (
                      <div className="mt-2 relative rounded-xl shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-xs">$</span>
                        </div>
                        <input
                          type="number"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          placeholder="Enter custom amount"
                          className="w-full pl-7 pr-3 py-2 border border-lavender/20 dark:border-white/10 rounded-xl bg-beige/10 dark:bg-white/5 text-xs text-dark dark:text-cream focus:outline-none focus:ring-1 focus:ring-lavender"
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Donor Name */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
                      Billing Name
                    </label>
                    <input
                      type="text"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="Cardholder Name"
                      className="w-full px-3 py-2 border border-lavender/20 dark:border-white/10 rounded-xl bg-beige/10 dark:bg-white/5 text-xs text-dark dark:text-cream focus:outline-none focus:ring-1 focus:ring-lavender"
                      required
                    />
                  </div>

                  {/* Simulated Card Fields */}
                  <div className="bg-beige/10 dark:bg-white/5 p-3 rounded-2xl border border-lavender/10 space-y-3">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full p-1 bg-transparent text-xs tracking-wider text-dark dark:text-cream focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                          Expires
                        </label>
                        <input
                          type="text"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          className="w-full p-1 bg-transparent text-xs text-dark dark:text-cream focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                          CVC
                        </label>
                        <input
                          type="text"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          className="w-full p-1 bg-transparent text-xs text-dark dark:text-cream focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 justify-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secure Sandbox Payment via Stripe Simulator
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3 bg-lavender text-white font-bold rounded-full text-xs hover:bg-lavender-light hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    {processing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Processing Payment...
                      </>
                    ) : (
                      <>Pay ${donationAmount === 'custom' ? customAmount || '0' : donationAmount}</>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
