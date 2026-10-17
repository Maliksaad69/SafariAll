'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Compass, Plus, Trash2, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Calendar, MapPin, DollarSign, Award } from 'lucide-react';

interface ItineraryDay {
  dayNumber: number;
  title: string;
  description: string;
  accommodationName: string;
  mealsIncluded: string;
}

export default function NewTourPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Tour fields
  const [title, setTitle] = useState('');
  const [durationDays, setDurationDays] = useState('7');
  const [durationNights, setDurationNights] = useState('6');
  const [minPriceUsd, setMinPriceUsd] = useState('2500');
  const [maxPriceUsd, setMaxPriceUsd] = useState('3200');
  const [comfortLevel, setComfortLevel] = useState('MID_RANGE');
  const [tourType, setTourType] = useState('PRIVATE');
  const [primaryCountry, setPrimaryCountry] = useState('Tanzania');
  const [startLocation, setStartLocation] = useState('Arusha');
  const [endLocation, setEndLocation] = useState('Zanzibar');
  const [inclusionsText, setInclusionsText] = useState("All national park entrance fees\nProfessional safari driver/guide\n4x4 Land Cruiser transport\nMeals as specified\nAccommodations as listed");
  const [exclusionsText, setExclusionsText] = useState("International flights\nVisas & travel insurance\nPersonal tips & gratuities\nAlcoholic beverages");

  // Dynamic Day-by-Day Itineraries
  const [itineraries, setItineraries] = useState<ItineraryDay[]>([
    {
      dayNumber: 1,
      title: 'Arrival in Arusha & Safari Briefing',
      description: 'Meet and greet at Kilimanjaro International Airport (JRO) and transfer to your luxury lodge in Arusha. Tour orientation with your lead safari guide.',
      accommodationName: 'Gran Melia Arusha',
      mealsIncluded: 'Dinner',
    },
    {
      dayNumber: 2,
      title: 'Game Drive in Tarangire National Park',
      description: 'Depart for Tarangire, famous for huge elephant herds and ancient baobab trees. Afternoon game drive along the Tarangire River.',
      accommodationName: 'Tarangire Safari Lodge',
      mealsIncluded: 'Breakfast, Lunch, Dinner',
    },
  ]);

  const addDay = () => {
    const nextDay = itineraries.length + 1;
    setItineraries([
      ...itineraries,
      {
        dayNumber: nextDay,
        title: `Day ${nextDay} Safari Exploration`,
        description: '',
        accommodationName: '',
        mealsIncluded: 'Breakfast, Lunch, Dinner',
      },
    ]);
  };

  const removeDay = (index: number) => {
    if (itineraries.length <= 1) return;
    const updated = itineraries.filter((_, i) => i !== index).map((day, i) => ({
      ...day,
      dayNumber: i + 1,
    }));
    setItineraries(updated);
  };

  const updateDay = (index: number, field: keyof ItineraryDay, value: string) => {
    const updated = [...itineraries];
    updated[index] = { ...updated[index], [field]: value };
    setItineraries(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/operator/tours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          durationDays,
          durationNights,
          minPriceUsd,
          maxPriceUsd,
          comfortLevel,
          tourType,
          primaryCountry,
          startLocation,
          endLocation,
          inclusions: inclusionsText.split('\n').filter(Boolean),
          exclusions: exclusionsText.split('\n').filter(Boolean),
          itineraries,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish safari package.');
      }

      setSuccess('Safari tour package published successfully! Redirecting...');
      setTimeout(() => {
        router.push('/operator-portal');
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--canvas)] text-[var(--ink)]">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/operator-portal" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand)] hover:text-[var(--brand-deep)] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portal</span>
          </Link>
          <span className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider">Operator Tour Builder</span>
        </div>

        <div className="surface-dark rounded-3xl p-8 sm:p-10 text-white shadow-xl space-y-2 border border-white/10">
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">Create New Safari Package</h1>
          <p className="text-xs sm:text-sm text-white/85 font-light">
            Publish a multi-day itinerary with pricing, comfort level, and day-by-day stops for travelers.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-800 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-800 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Basic Information */}
          <div className="surface-card p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold font-display text-[var(--ink)] border-b border-[var(--border)] pb-3">
              1. Tour Overview &amp; Pricing
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="form-label">
                  Safari Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 7-Day Serengeti Great Migration & Ngorongoro Luxury Safari"
                  className="form-control"
                />
              </div>

              <div>
                <label className="form-label">
                  Destination Country *
                </label>
                <select
                  value={primaryCountry}
                  onChange={(e) => setPrimaryCountry(e.target.value)}
                  className="form-control"
                >
                  <option value="Tanzania">Tanzania</option>
                  <option value="Kenya">Kenya</option>
                  <option value="South Africa">South Africa</option>
                  <option value="Uganda">Uganda</option>
                  <option value="Botswana">Botswana</option>
                  <option value="Zimbabwe">Zimbabwe</option>
                  <option value="Rwanda">Rwanda</option>
                </select>
              </div>

              <div>
                <label className="form-label">
                  Comfort Level *
                </label>
                <select
                  value={comfortLevel}
                  onChange={(e) => setComfortLevel(e.target.value)}
                  className="form-control"
                >
                  <option value="BUDGET">Budget / Basic Lodge</option>
                  <option value="MID_RANGE">Mid-Range (Standard Lodge / Camp)</option>
                  <option value="LUXURY">Luxury (High-end Tented Camp)</option>
                  <option value="SUPER_LUXURY">Super Luxury (Exclusive Private Villa)</option>
                  <option value="CAMPING">Public / Adventure Camping</option>
                </select>
              </div>

              <div>
                <label className="form-label">
                  Duration (Days) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="form-control"
                />
              </div>

              <div>
                <label className="form-label">
                  Duration (Nights)
                </label>
                <input
                  type="number"
                  min="0"
                  value={durationNights}
                  onChange={(e) => setDurationNights(e.target.value)}
                  className="form-control"
                />
              </div>

              <div>
                <label className="form-label">
                  Starting Price per Person (USD) *
                </label>
                <input
                  type="number"
                  required
                  min="50"
                  value={minPriceUsd}
                  onChange={(e) => setMinPriceUsd(e.target.value)}
                  className="form-control"
                />
              </div>

              <div>
                <label className="form-label">
                  Max Price per Person (USD)
                </label>
                <input
                  type="number"
                  min="50"
                  value={maxPriceUsd}
                  onChange={(e) => setMaxPriceUsd(e.target.value)}
                  className="form-control"
                />
              </div>

              <div>
                <label className="form-label">
                  Start Hub / City
                </label>
                <input
                  type="text"
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                  placeholder="e.g. Arusha or JRO Airport"
                  className="form-control"
                />
              </div>

              <div>
                <label className="form-label">
                  End Hub / City
                </label>
                <input
                  type="text"
                  value={endLocation}
                  onChange={(e) => setEndLocation(e.target.value)}
                  placeholder="e.g. Zanzibar or Kilimanjaro Airport"
                  className="form-control"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Inclusions & Exclusions */}
          <div className="surface-card p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-bold font-display text-[var(--ink)] border-b border-[var(--border)] pb-3">
              2. What's Included &amp; Excluded
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">
                  Inclusions (One per line)
                </label>
                <textarea
                  rows={5}
                  value={inclusionsText}
                  onChange={(e) => setInclusionsText(e.target.value)}
                  className="form-control font-mono text-xs"
                />
              </div>

              <div>
                <label className="form-label">
                  Exclusions (One per line)
                </label>
                <textarea
                  rows={5}
                  value={exclusionsText}
                  onChange={(e) => setExclusionsText(e.target.value)}
                  className="form-control font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Day-by-Day Itinerary Builder */}
          <div className="surface-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h2 className="text-xl font-bold font-display text-[var(--ink)]">
                3. Day-by-Day Itinerary ({itineraries.length} Days)
              </h2>
              <button
                type="button"
                onClick={addDay}
                className="btn btn-secondary btn-sm"
              >
                <Plus className="w-4 h-4" />
                Add Day
              </button>
            </div>

            <div className="space-y-6">
              {itineraries.map((day, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-[var(--sand)]/50 border border-black/5 space-y-4 relative shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[var(--brand)] uppercase tracking-wider">
                      Day {day.dayNumber}
                    </span>
                    {itineraries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDay(idx)}
                        className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-semibold transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove Day
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)] mb-1">
                        Day Title
                      </label>
                      <input
                        type="text"
                        value={day.title}
                        onChange={(e) => updateDay(idx, 'title', e.target.value)}
                        placeholder="e.g. Serengeti Central Game Drives"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-black/10 text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--brand)]"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)] mb-1">
                        Day Narrative &amp; Activities
                      </label>
                      <textarea
                        rows={3}
                        value={day.description}
                        onChange={(e) => updateDay(idx, 'description', e.target.value)}
                        placeholder="Describe morning game drives, wildlife sightings, landscape transitions, etc."
                        className="w-full px-3 py-2 bg-white rounded-xl border border-black/10 text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--brand)]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)] mb-1">
                        Overnight Accommodation
                      </label>
                      <input
                        type="text"
                        value={day.accommodationName}
                        onChange={(e) => updateDay(idx, 'accommodationName', e.target.value)}
                        placeholder="e.g. Four Seasons Safari Lodge"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-black/10 text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--brand)]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)] mb-1">
                        Meals Included
                      </label>
                      <input
                        type="text"
                        value={day.mealsIncluded}
                        onChange={(e) => updateDay(idx, 'mealsIncluded', e.target.value)}
                        placeholder="Breakfast, Lunch, Dinner"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-black/10 text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--brand)]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit CTA */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary px-8 py-3.5 rounded-xl text-sm font-semibold shadow-md flex items-center gap-2"
            >
              <span>{loading ? 'Publishing Package...' : 'Publish Safari Package'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </main>

      <Footer />
    </div>
  );
}
