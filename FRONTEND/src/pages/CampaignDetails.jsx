import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Landmark, Users, ArrowLeft, ShieldCheck, Sparkles, AlertCircle, DollarSign, Calendar, HeartHandshake, CheckCircle } from 'lucide-react';
import api from '../lib/axios';
import { useUIStore } from '../store/uiStore';

export default function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUIStore();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Donation state
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
    fetchCampaignDetails();
  }, [id]);

  const fetchCampaignDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch via API
      const res = await api.get(`/donations/campaigns`);
      const matched = res.data.data?.find(c => c._id === id);
      if (matched) {
        setCampaign(matched);
      } else {
        setError('Medical campaign details not found on the network.');
      }
    } catch (err) {
      console.error('Failed to load campaign details:', err);
      setError('Connection to veterinary node failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCheckout = () => {
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const res = await api.post(`/donations/donate`, {
        campaignId: campaign._id,
        amount: finalAmount,
        donorName: donorName || 'Anonymous PawLover'
      });

      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          setCheckoutOpen(false);
          setSuccess(false);
          fetchCampaignDetails(); // reload
        }, 1800);
      }
    } catch (err) {
      console.error('Donation transaction failed:', err);
      alert('Transaction failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="w-12 h-12 border-4 border-lavender/30 border-t-lavender rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="max-w-xl mx-auto px-6 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold font-outfit text-dark dark:text-cream">Could not retrieve campaign</h3>
        <p className="text-xs text-gray-500 mt-2">{error || 'Unknown error occurred.'}</p>
        <Link to="/donations" className="inline-block mt-6 px-5 py-2 bg-lavender text-white rounded-full text-xs font-bold shadow-md hover:bg-lavender-light">
          Back to Medical Funding
        </Link>
      </div>
    );
  }

  const percent = Math.min(100, Math.round((campaign.raisedAmount / campaign.targetAmount) * 100));

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 relative">
      {/* Back button */}
      <Link to="/donations" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-lavender transition-colors mb-6 font-bold">
        <ArrowLeft className="w-4 h-4" /> Back to campaigns
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Visuals & Story (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="w-full aspect-[16/9] rounded-[2.5rem] overflow-hidden relative border border-lavender/25 shadow-lg bg-beige/20">
            <img
              src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80"
              alt={campaign.title}
              className="w-full h-full object-cover select-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 bg-peach text-white rounded-full">
                Active Medical Case
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold font-outfit mt-2 tracking-tight">
                {campaign.title}
              </h2>
            </div>
          </div>

          {/* Verification Indicators */}
          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-mint/15 border border-mint/25 rounded-full text-xs font-bold text-emerald-800 dark:text-mint">
              <ShieldCheck className="w-4 h-4" /> Veterinary Verified
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-lavender/10 border border-lavender/25 rounded-full text-xs font-bold text-lavender">
              <Landmark className="w-4 h-4" /> Transparent Escrow Ledger
            </div>
          </div>

          {/* Description & Story */}
          <div className="bg-white/80 dark:bg-dark/80 backdrop-blur-md border border-lavender/25 dark:border-white/5 rounded-[2rem] p-6 shadow-md">
            <h3 className="font-extrabold font-outfit text-lg mb-3 text-dark dark:text-cream">
              Bruno's Story & Recovery Plan
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-normal whitespace-pre-wrap">
              {campaign.description}
            </p>
            <div className="mt-6 p-4 bg-beige/20 dark:bg-white/5 rounded-2xl border border-lavender/10 text-xs text-gray-400 leading-relaxed">
              <span className="font-bold text-dark dark:text-cream block mb-1">🐾 Our Commitment:</span>
              100% of all gathered donations are processed directly through audited clinic escrows. Any residual funds roll directly into stray food and puppy vaccinations.
            </div>
          </div>

          {/* Transparency Ledger / Budget Breakdown */}
          <div className="bg-white/80 dark:bg-dark/80 backdrop-blur-md border border-lavender/25 dark:border-white/5 rounded-[2rem] p-6 shadow-md">
            <h3 className="font-extrabold font-outfit text-lg mb-4 text-dark dark:text-cream flex items-center gap-2">
              <Landmark className="w-5 h-5 text-lavender" /> Itemized Budget Breakdown
            </h3>
            <div className="divide-y divide-lavender/10 dark:divide-white/5">
              {campaign.expenses?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-3.5 text-xs text-gray-500 dark:text-gray-400">
                  <div className="space-y-0.5">
                    <p className="font-bold text-dark dark:text-cream">• {item.title}</p>
                    <span className="text-[10px] text-gray-400">Verifiable Clinic Invoice attached</span>
                  </div>
                  <span className="font-extrabold font-outfit text-sm text-dark dark:text-cream">${item.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Funding progress widget & live ledger (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Progress & Donate Box */}
          <div className="bg-white/80 dark:bg-dark/80 backdrop-blur-md border border-lavender/25 dark:border-white/5 rounded-[2rem] p-6 shadow-xl space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-lavender font-outfit">{percent}% Funded</span>
                <span className="text-gray-400 font-normal">${campaign.raisedAmount} raised of ${campaign.targetAmount}</span>
              </div>
              <div className="w-full h-3 bg-beige/50 dark:bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-lavender to-peach rounded-full transition-all duration-1000"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center py-2 bg-beige/10 dark:bg-white/5 rounded-2xl border border-lavender/5">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Backers</p>
                <p className="text-lg font-extrabold text-dark dark:text-cream font-outfit">{campaign.backers?.length || 0}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Goal Target</p>
                <p className="text-lg font-extrabold text-dark dark:text-cream font-outfit">${campaign.targetAmount}</p>
              </div>
            </div>

            <button
              onClick={handleOpenCheckout}
              disabled={campaign.isCompleted}
              className={`w-full py-4 rounded-full font-bold text-sm flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer ${
                campaign.isCompleted
                  ? 'bg-mint text-emerald-800 shadow-none cursor-default font-extrabold'
                  : 'bg-lavender text-white hover:bg-lavender-light hover:scale-[1.01]'
              }`}
            >
              {campaign.isCompleted ? (
                <>Fully Funded! 🎉</>
              ) : (
                <>Sponsor Treatment now <HeartHandshake className="w-4 h-4" /></>
              )}
            </button>
          </div>

          {/* Live Donation Ledger Feed */}
          <div className="bg-white/80 dark:bg-dark/80 backdrop-blur-md border border-lavender/25 dark:border-white/5 rounded-[2rem] p-6 shadow-md">
            <h3 className="font-extrabold font-outfit text-base mb-4 text-dark dark:text-cream flex items-center gap-2">
              <Users className="w-5 h-5 text-lavender" /> Donation Ledger & Backers Feed
            </h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {!campaign.backers || campaign.backers.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">Be the very first backer to fund Bruno's surgery!</p>
              ) : (
                campaign.backers.map((backer, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-beige/25 dark:bg-white/5 p-3 rounded-xl border border-lavender/5 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-lavender/10 text-lavender text-[10px] font-extrabold rounded-full flex items-center justify-center uppercase">
                        {backer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-dark dark:text-cream">{backer.name}</p>
                        <p className="text-[9px] text-gray-400">Verified backer transaction logged</p>
                      </div>
                    </div>
                    <span className="font-extrabold font-outfit text-sm text-dark dark:text-cream bg-lavender/10 px-2.5 py-1 rounded-full">
                      +${backer.amount}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {checkoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-dark/45 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/95 dark:bg-dark/95 backdrop-blur-md border border-lavender/25 dark:border-white/10 rounded-[2.5rem] p-6 max-w-md w-full shadow-2xl relative text-left"
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
                  Sponsor {campaign.title}
                </h3>
              </div>

              {success ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle className="w-16 h-16 text-emerald-500 animate-bounce mb-3" />
                  <h4 className="font-bold text-base text-dark dark:text-cream">Payment Confirmed!</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed">
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
