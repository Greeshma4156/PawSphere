import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Plus, Trash2, ArrowLeft, ArrowRight, ShieldCheck, Sparkles, FileText, CheckCircle } from 'lucide-react';
import api from '../lib/axios';
import { useUIStore } from '../store/uiStore';

export default function CreateCampaign() {
  const navigate = useNavigate();
  const { user } = useUIStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  
  // Expenses State (Itemized list)
  const [expenses, setExpenses] = useState([
    { title: 'Surgery & Anesthesia Consultation', amount: '150' },
    { title: 'Prescribed Recovery Medicines (14 Days)', amount: '80' }
  ]);
  const [newExpenseTitle, setNewExpenseTitle] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');

  // Mock upload state
  const [vetCertificate, setVetCertificate] = useState('vet_approval_doc.pdf');

  const addExpenseItem = () => {
    if (!newExpenseTitle || !newExpenseAmount) return;
    setExpenses([...expenses, { title: newExpenseTitle, amount: newExpenseAmount }]);
    setNewExpenseTitle('');
    setNewExpenseAmount('');
  };

  const removeExpenseItem = (idx) => {
    setExpenses(expenses.filter((_, i) => i !== idx));
  };

  const calculatedTotal = expenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  const handleSubmitCampaign = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title,
        description,
        targetAmount: parseFloat(targetAmount) || calculatedTotal,
        expenses: expenses.map(e => ({ title: e.title, amount: parseFloat(e.amount) }))
      };

      const res = await api.post('/donations/campaign', payload);
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/donations');
        }, 2200);
      }
    } catch (err) {
      console.error('Failed to register medical campaign:', err);
      alert('Could not submit campaign. Please check input parameters.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 relative min-h-[85vh]">
      {/* Ambient background glow */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-peach/10 rounded-full filter blur-3xl -z-10"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-lavender/10 rounded-full filter blur-3xl -z-10"></div>

      {/* Header */}
      <div className="text-center mb-10 space-y-3">
        <div className="inline-flex items-center gap-1 px-3 py-1 bg-peach/10 border border-peach/25 rounded-full text-xs font-bold text-peach uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Campaign Wizard
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold font-outfit text-dark dark:text-cream leading-tight">
          Create Medical Campaign
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Raise funds transparently for stray orthopedic surgeries, clinics, or vaccine vials.
        </p>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2 pt-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                step === s ? 'w-8 bg-lavender' : 'w-2.5 bg-lavender/25'
              }`}
            ></div>
          ))}
        </div>
      </div>

      <div className="bg-white/80 dark:bg-dark/80 backdrop-blur-md border border-lavender/25 dark:border-white/5 rounded-[2.5rem] p-6 md:p-8 shadow-xl">
        {success ? (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-emerald-500 animate-bounce" />
            <h3 className="font-extrabold font-outfit text-xl text-dark dark:text-cream">Campaign registered successfully!</h3>
            <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
              Your stray clinic fundraising ledgers have been safely written to the network database. Redirecting you to the active campaigns portal...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitCampaign} className="space-y-6 text-left">
            
            {/* Step 1: Base Info */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-widest mb-3">Step 1: Campaign Details</h3>
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5 ml-0.5">Campaign Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Surgery fund for street dog Bruno"
                    className="w-full bg-beige/10 dark:bg-dark/50 border border-lavender/25 p-3.5 rounded-2xl text-xs dark:text-cream focus:outline-none focus:ring-1 focus:ring-lavender"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5 ml-0.5">Detailed Pet Bio & Recovery Story</label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about the animal's current trauma, recovery plan, and clinic information..."
                    className="w-full bg-beige/10 dark:bg-dark/50 border border-lavender/25 p-3.5 rounded-2xl text-xs dark:text-cream focus:outline-none focus:ring-1 focus:ring-lavender"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5 ml-0.5">Target Goal Amount ($)</label>
                  <input
                    type="number"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full bg-beige/10 dark:bg-dark/50 border border-lavender/25 p-3.5 rounded-2xl text-xs dark:text-cream focus:outline-none focus:ring-1 focus:ring-lavender"
                  />
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!title || !description || !targetAmount) {
                        alert('Please fill out all required parameters.');
                        return;
                      }
                      setStep(2);
                    }}
                    className="px-6 py-3 bg-lavender text-white font-bold rounded-xl text-xs hover:bg-lavender-light flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Itemized Budget Breakdown */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-widest mb-3">Step 2: Transparent Budget Breakdown</h3>
                
                {/* Dynamically build expense breakdown list */}
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {expenses.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-beige/25 dark:bg-white/5 p-3 rounded-xl border border-lavender/5 text-xs">
                      <div>
                        <p className="font-bold text-dark dark:text-cream">{item.title}</p>
                        <p className="text-[9px] text-gray-400">Verifiable Clinic Escrow allocation</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold font-outfit text-dark dark:text-cream">${item.amount}</span>
                        <button
                          type="button"
                          onClick={() => removeExpenseItem(idx)}
                          className="text-red-500 hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add new expense item row */}
                <div className="bg-beige/10 dark:bg-white/5 p-3 rounded-2xl border border-lavender/10 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-7">
                    <input
                      type="text"
                      placeholder="Item name (e.g. Bone Plates & Screws)"
                      value={newExpenseTitle}
                      onChange={(e) => setNewExpenseTitle(e.target.value)}
                      className="w-full bg-white dark:bg-dark border border-lavender/25 p-2 rounded-xl text-xs dark:text-cream focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <input
                      type="number"
                      placeholder="Amount ($)"
                      value={newExpenseAmount}
                      onChange={(e) => setNewExpenseAmount(e.target.value)}
                      className="w-full bg-white dark:bg-dark border border-lavender/25 p-2 rounded-xl text-xs dark:text-cream focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={addExpenseItem}
                      className="w-full py-2 bg-lavender text-white font-bold rounded-xl text-xs hover:bg-lavender-light flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-lavender/10">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-3 border border-lavender text-lavender font-bold rounded-xl text-xs hover:bg-lavender/5 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (expenses.length === 0) {
                        alert('You must provide at least one budget item for ledger transparency.');
                        return;
                      }
                      setStep(3);
                    }}
                    className="px-6 py-3 bg-lavender text-white font-bold rounded-xl text-xs hover:bg-lavender-light flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Vet Verification Uploads */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-widest mb-3">Step 3: NGO & Veterinary Verification</h3>
                
                <div className="border-2 border-dashed border-lavender/30 rounded-[2rem] p-8 text-center space-y-2 bg-beige/5 dark:bg-white/5">
                  <FileText className="w-12 h-12 text-lavender mx-auto" />
                  <p className="text-xs font-bold text-dark dark:text-cream">Clinic Estimate invoice attached</p>
                  <p className="text-[10px] text-gray-400">PDF, JPG, PNG up to 5MB are automatically sandbox verified.</p>
                  <div className="pt-2">
                    <span className="inline-block text-[9px] font-extrabold text-emerald-600 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 rounded-full uppercase tracking-wider">
                      {vetCertificate} (Attached)
                    </span>
                  </div>
                </div>

                <div className="bg-lavender/5 p-4 rounded-2xl border border-lavender/10 text-[10px] leading-relaxed text-gray-500 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-dark dark:text-cream block">Escrow Trust Framework:</span>
                    By publishing this campaign, you acknowledge that all raised funding goes directly to verified partner clinical escrows. Any attempt at billing fraud is audited and logged on our compliance servers.
                  </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-lavender/10">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-3 border border-lavender text-lavender font-bold rounded-xl text-xs hover:bg-lavender/5 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3.5 bg-lavender text-white font-extrabold rounded-xl text-xs hover:bg-lavender-light flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Registering Ledger...
                      </>
                    ) : (
                      <>Publish Medical Campaign</>
                    )}
                  </button>
                </div>
              </div>
            )}

          </form>
        )}
      </div>

    </div>
  );
}
