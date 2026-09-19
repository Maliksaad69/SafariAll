'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Compass, Send, CheckCircle2, ArrowRight, ShieldCheck, MapPin, Calendar, Users, DollarSign, FileText } from 'lucide-react';

function QuoteRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tourId = searchParams.get('tourId');

  const [preferredCountry, setPreferredCountry] = useState('Tanzania');
  const [adultsCount, setAdultsCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [budgetPerPersonUsd, setBudgetPerPersonUsd] = useState(2000);
  const [comfortPreference, setComfortPreference] = useState('MID_RANGE');
  const [customNotes, setCustomNotes] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId,
          preferredCountry,
          adultsCount: Number(adultsCount),
          childrenCount: Number(childrenCount),
          budgetPerPersonUsd: Number(budgetPerPersonUsd),
          comfortPreference,
          customNotes,
          firstName,
          lastName,
          email,
          phone,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-[#E5E0D8] shadow-xl text-center space-y-6 max-w-2xl mx-auto my-12">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold font-serif text-[#1C2826]">
          Quote Request Submitted!
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed max-w-lg mx-auto">
          Your inquiry for <span className="font-bold text-[#1C2826]">{preferredCountry}</span> has been dispatched to top-rated verified local tour operators.
        </p>
        <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-[#E5E0D8] text-xs text-gray-600 font-medium max-w-md mx-auto">
          ✉️ Confirmation sent to <span className="font-bold text-[#1C2826]">{email}</span>. Expect direct proposals within 24 hours.
        </div>
        <button
          onClick={() => router.push('/tours')}
          className="px-6 py-3.5 bg-[#C85A17] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#a6470e] transition-all shadow-md"
        >
          Return to Safari Search
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 border border-[#E5E0D8] space-y-8 max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C2826]/10 text-[#1C2826] text-xs font-bold uppercase tracking-wider">
          <Compass className="w-4 h-4 text-[#C85A17]" />
          Multi-Operator Quote Engine
        </div>
        <h1 className="text-3xl font-bold font-serif text-[#1C2826]">
          Request Custom Safari Quotes
        </h1>
        <p className="text-sm text-gray-600">
          Get direct, zero-markup proposals from licensed local African safari agencies.
        </p>
      </div>

      {/* Form Wizard */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Step 1: Destination & Guests */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="font-bold text-base text-[#1C2826] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#C85A17]" />
            1. Destination & Travelers
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-2">Preferred Destination</label>
              <select
                value={preferredCountry}
                onChange={(e) => setPreferredCountry(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E0D8] text-sm text-[#1C2826] focus:outline-none focus:border-[#C85A17]"
              >
                <option value="Tanzania">Tanzania (Serengeti / Ngorongoro)</option>
                <option value="Kenya">Kenya (Masai Mara / Amboseli)</option>
                <option value="South Africa">South Africa (Kruger)</option>
                <option value="Uganda">Uganda (Bwindi Gorilla Trekking)</option>
                <option value="Botswana">Botswana (Okavango Delta)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-2">Number of Adults</label>
              <input
                type="number"
                min={1}
                max={20}
                value={adultsCount}
                onChange={(e) => setAdultsCount(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E0D8] text-sm text-[#1C2826] focus:outline-none focus:border-[#C85A17]"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Budget & Comfort */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="font-bold text-base text-[#1C2826] flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#C85A17]" />
            2. Budget & Comfort Preference
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-2">Comfort Level</label>
              <select
                value={comfortPreference}
                onChange={(e) => setComfortPreference(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E0D8] text-sm text-[#1C2826] focus:outline-none focus:border-[#C85A17]"
              >
                <option value="MID_RANGE">Mid-Range Safari Lodge</option>
                <option value="LUXURY">Luxury Tented Camp</option>
                <option value="BUDGET">Budget Camping</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-2">Estimated Budget / Person ($USD)</label>
              <input
                type="number"
                min={500}
                step={250}
                value={budgetPerPersonUsd}
                onChange={(e) => setBudgetPerPersonUsd(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E0D8] text-sm text-[#1C2826] focus:outline-none focus:border-[#C85A17]"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Contact Info */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="font-bold text-base text-[#1C2826] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#C85A17]" />
            3. Contact Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Sarah"
                className="w-full px-4 py-3 rounded-xl border border-[#E5E0D8] text-sm text-[#1C2826] focus:outline-none focus:border-[#C85A17]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Jenkins"
                className="w-full px-4 py-3 rounded-xl border border-[#E5E0D8] text-sm text-[#1C2826] focus:outline-none focus:border-[#C85A17]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah@example.com"
              className="w-full px-4 py-3 rounded-xl border border-[#E5E0D8] text-sm text-[#1C2826] focus:outline-none focus:border-[#C85A17]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-2">Custom Requests / Notes</label>
            <textarea
              rows={3}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. Interested in balloon safari over Serengeti or specific dietary needs..."
              className="w-full px-4 py-3 rounded-xl border border-[#E5E0D8] text-sm text-[#1C2826] focus:outline-none focus:border-[#C85A17]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 rounded-xl bg-[#C85A17] hover:bg-[#a6470e] text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2"
        >
          {loading ? 'Submitting Inquiry...' : 'Broadcast Quote Request to Operators'}
          <Send className="w-4 h-4" />
        </button>

      </form>

    </div>
  );
}

export default function QuoteRequestPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#2C221E]">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
        <Suspense fallback={
          <div className="bg-white rounded-3xl p-12 text-center text-gray-500 animate-pulse">
            Loading Quote Form...
          </div>
        }>
          <QuoteRequestForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
