'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Bus, Compass, Plus, Trash2, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Calendar, MapPin, DollarSign, Award } from 'lucide-react';

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

  // Fleet & departures: every package is sold per seat on scheduled departures
  const isoIn = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
  const [today] = useState(() => isoIn(0));
  const [fleet, setFleet] = useState<{ id: string; name: string; seats: number; vehicleType: string; isActive: boolean }[]>([]);
  const [chosenVehicles, setChosenVehicles] = useState<string[]>([]);
  const [newVehicles, setNewVehicles] = useState<{ name: string; vehicleType: string; seats: number; count: number }[]>([]);
  const [scheduleOn, setScheduleOn] = useState(true);
  const [schedule, setSchedule] = useState(() => ({ firstDate: isoIn(14), until: isoIn(104), everyDays: 7, departureTime: '07:30', vehiclesPerDeparture: 1, maxTravelers: 7 }));
  useEffect(() => {
    fetch('/api/operator/vehicles')
      .then((r) => (r.ok ? r.json() : { vehicles: [] }))
      .then((d) => {
        const active = (d.vehicles ?? []).filter((v: { isActive: boolean }) => v.isActive);
        setFleet(active);
        if (active.length === 0) setNewVehicles([{ name: 'Land Cruiser', vehicleType: '4x4 Land Cruiser', seats: 7, count: 2 }]);
      })
      .catch(() => {});
  }, []);
  const newVehicleCount = newVehicles.reduce((n, v) => n + (Number(v.count) || 0), 0);
  const vehiclePool = chosenVehicles.length + newVehicleCount;

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
          newVehicles: newVehicles.filter((v) => v.name.trim()),
          schedule: scheduleOn
            ? {
                ...schedule,
                vehicleIds: chosenVehicles,
                useNewVehicles: true,
                maxTravelers: vehiclePool === 0 ? schedule.maxTravelers : undefined,
              }
            : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish safari package.');
      }

      setSuccess(
        data.bookable
          ? `Package published with ${data.departuresCreated} departure${data.departuresCreated === 1 ? '' : 's'}${data.skippedDates?.length ? ` (${data.skippedDates.length} date(s) skipped because no vehicle was free)` : ''}. Redirecting...`
          : 'Package published, but it has no departures yet, so travellers can only request quotes. Add departures under Departures. Redirecting...'
      );
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

          {/* Section 4: Fleet & Departures */}
          <div className="surface-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h2 className="text-xl font-bold font-display text-[var(--ink)] flex items-center gap-2">
                <Bus className="w-5 h-5 text-[var(--brand)]" /> 4. Vehicles &amp; Departures
              </h2>
              <label className="flex items-center gap-2 text-xs font-semibold">
                <input type="checkbox" checked={scheduleOn} onChange={(e) => setScheduleOn(e.target.checked)} />
                Schedule departures now
              </label>
            </div>
            <p className="text-xs text-[var(--ink-muted)]">
              Travellers book seats on scheduled departures. Capacity comes from the vehicles on each departure, and a vehicle
              can only be on one trip at a time. When every seat is taken the departure shows as fully booked everywhere.
            </p>

            {fleet.length > 0 && (
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)] mb-2">Use vehicles from your fleet</span>
                <div className="flex flex-wrap gap-2">
                  {fleet.map((v) => {
                    const on = chosenVehicles.includes(v.id);
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setChosenVehicles((c) => (on ? c.filter((x) => x !== v.id) : [...c, v.id]))}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${on ? 'border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-ink)]' : 'border-[var(--border)] text-[var(--ink-secondary)]'}`}
                      >
                        {on ? '✓ ' : ''}{v.name} · {v.seats} seats
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">Add new vehicles</span>
              {newVehicles.map((v, i) => (
                <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end">
                  <input className="form-control sm:col-span-2" placeholder="Name, e.g. Land Cruiser" value={v.name} onChange={(e) => setNewVehicles((l) => l.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)))} />
                  <input className="form-control" placeholder="Type" value={v.vehicleType} onChange={(e) => setNewVehicles((l) => l.map((x, k) => (k === i ? { ...x, vehicleType: e.target.value } : x)))} />
                  <input className="form-control" type="number" min={1} max={100} title="Seats per vehicle" value={v.seats} onChange={(e) => setNewVehicles((l) => l.map((x, k) => (k === i ? { ...x, seats: Number(e.target.value) } : x)))} />
                  <div className="flex gap-2">
                    <input className="form-control" type="number" min={1} max={10} title="How many of these" value={v.count} onChange={(e) => setNewVehicles((l) => l.map((x, k) => (k === i ? { ...x, count: Number(e.target.value) } : x)))} />
                    <button type="button" className="text-rose-600" onClick={() => setNewVehicles((l) => l.filter((_, k) => k !== i))}><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setNewVehicles((l) => [...l, { name: '', vehicleType: '4x4 Land Cruiser', seats: 7, count: 1 }])}>
                <Plus className="w-4 h-4" /> Add vehicle type
              </button>
            </div>

            {scheduleOn && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div><label className="form-label">First departure</label><input type="date" className="form-control" min={today} value={schedule.firstDate} onChange={(e) => setSchedule((x) => ({ ...x, firstDate: e.target.value }))} /></div>
                <div><label className="form-label">Repeat until</label><input type="date" className="form-control" min={schedule.firstDate} value={schedule.until} onChange={(e) => setSchedule((x) => ({ ...x, until: e.target.value }))} /></div>
                <div><label className="form-label">Every (days)</label><input type="number" min={1} max={90} className="form-control" value={schedule.everyDays} onChange={(e) => setSchedule((x) => ({ ...x, everyDays: Number(e.target.value) }))} /></div>
                <div><label className="form-label">Departure time</label><input type="time" className="form-control" value={schedule.departureTime} onChange={(e) => setSchedule((x) => ({ ...x, departureTime: e.target.value }))} /></div>
                {vehiclePool > 0 ? (
                  <div><label className="form-label">Vehicles per departure</label><input type="number" min={1} max={vehiclePool} className="form-control" value={schedule.vehiclesPerDeparture} onChange={(e) => setSchedule((x) => ({ ...x, vehiclesPerDeparture: Number(e.target.value) }))} /></div>
                ) : (
                  <div><label className="form-label">Max group size</label><input type="number" min={1} className="form-control" value={schedule.maxTravelers} onChange={(e) => setSchedule((x) => ({ ...x, maxTravelers: Number(e.target.value) }))} /></div>
                )}
              </div>
            )}
            {scheduleOn && vehiclePool > 0 && schedule.vehiclesPerDeparture * Math.ceil((Number(durationDays) || 1) / Math.max(schedule.everyDays, 1)) > vehiclePool && (
              <p className="text-xs font-semibold text-amber-700">
                A {durationDays}-day trip every {schedule.everyDays} days needs more vehicles than selected, so some dates will be skipped.
              </p>
            )}
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
