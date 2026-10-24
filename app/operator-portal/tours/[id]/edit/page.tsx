'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  Compass,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  MapPin,
  DollarSign,
  Award,
  ImageIcon,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';

interface ItineraryDay {
  dayNumber: number;
  title: string;
  description: string;
  accommodationName: string;
  mealsIncluded: string;
}

export default function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Tour fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [durationDays, setDurationDays] = useState('7');
  const [durationNights, setDurationNights] = useState('6');
  const [minPriceUsd, setMinPriceUsd] = useState('2500');
  const [maxPriceUsd, setMaxPriceUsd] = useState('3200');
  const [comfortLevel, setComfortLevel] = useState('MID_RANGE');
  const [tourType, setTourType] = useState('PRIVATE');
  const [primaryCountry, setPrimaryCountry] = useState('Tanzania');
  const [startLocation, setStartLocation] = useState('Arusha');
  const [endLocation, setEndLocation] = useState('Zanzibar');
  const [inclusionsText, setInclusionsText] = useState('');
  const [exclusionsText, setExclusionsText] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [itineraries, setItineraries] = useState<ItineraryDay[]>([]);
  const [mediaCount, setMediaCount] = useState(0);

  useEffect(() => {
    fetch(`/api/operator/tours/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load tour package');
        return res.json();
      })
      .then(({ tour }) => {
        setTitle(tour.title || '');
        setSlug(tour.slug || '');
        setDurationDays(String(tour.durationDays || 1));
        setDurationNights(String(tour.durationNights || 0));
        setMinPriceUsd(String(tour.minPriceUsd || 0));
        setMaxPriceUsd(tour.maxPriceUsd ? String(tour.maxPriceUsd) : '');
        setComfortLevel(tour.comfortLevel || 'MID_RANGE');
        setTourType(tour.tourType || 'PRIVATE');
        setPrimaryCountry(tour.primaryCountry || 'Tanzania');
        setStartLocation(tour.startLocation || '');
        setEndLocation(tour.endLocation || '');
        setInclusionsText(Array.isArray(tour.inclusions) ? tour.inclusions.join('\n') : '');
        setExclusionsText(Array.isArray(tour.exclusions) ? tour.exclusions.join('\n') : '');
        setIsPublished(!!tour.isPublished);
        setMediaCount(tour.media?.length || 0);

        if (Array.isArray(tour.itineraries) && tour.itineraries.length > 0) {
          setItineraries(
            tour.itineraries.map((day: any, idx: number) => ({
              dayNumber: day.dayNumber || idx + 1,
              title: day.title || `Day ${idx + 1}`,
              description: day.description || '',
              accommodationName: day.accommodationName || '',
              mealsIncluded: day.mealsIncluded || 'Breakfast, Lunch, Dinner',
            }))
          );
        } else {
          setItineraries([
            {
              dayNumber: 1,
              title: 'Arrival & Welcome',
              description: '',
              accommodationName: '',
              mealsIncluded: 'Dinner',
            },
          ]);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Error loading tour');
        setLoading(false);
      });
  }, [id]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        title,
        durationDays: parseInt(durationDays, 10) || 1,
        durationNights: parseInt(durationNights, 10) || 0,
        minPriceUsd: parseFloat(minPriceUsd) || 0,
        maxPriceUsd: maxPriceUsd ? parseFloat(maxPriceUsd) : null,
        comfortLevel,
        tourType,
        primaryCountry,
        startLocation,
        endLocation,
        inclusions: inclusionsText.split('\n').map((s) => s.trim()).filter(Boolean),
        exclusions: exclusionsText.split('\n').map((s) => s.trim()).filter(Boolean),
        isPublished,
        itineraries,
      };

      const res = await fetch(`/api/operator/tours/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update tour package.');
      }

      setSuccess('Tour package updated successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"? This cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    setError('');

    try {
      const res = await fetch(`/api/operator/tours/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete tour package.');
      }

      router.push('/operator-portal');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to delete package.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--surface-page)] text-[var(--ink-body)]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--brand)]" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface-page)] text-[var(--ink-body)]">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/operator-portal"
            className="inline-flex items-center gap-2 text-xs font-bold text-[var(--ink-secondary)] hover:text-[var(--brand)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Operator Portal
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={`/operator-portal/tours/${id}/images`}
              className="btn btn-secondary btn-sm inline-flex items-center gap-1.5"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Manage Photos ({mediaCount})
            </Link>
            {slug && (
              <Link
                href={`/tours/${slug}`}
                target="_blank"
                className="btn btn-secondary btn-sm inline-flex items-center gap-1.5"
              >
                <Eye className="h-3.5 w-3.5" />
                Preview Public Page
              </Link>
            )}
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="btn btn-danger btn-sm inline-flex items-center gap-1.5"
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Delete Package
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Top banner / title */}
          <div className="surface-card p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="badge badge-brand mb-2">Edit Safari Package</span>
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--ink)] font-display">
                  {title || 'Untitled Tour'}
                </h1>
              </div>

              {/* Publication toggle */}
              <div className="flex items-center gap-3 bg-[var(--surface-sunk)] p-2 rounded-xl border border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsPublished(!isPublished)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isPublished ? 'bg-[var(--success)] text-white shadow-sm' : 'bg-transparent text-[var(--ink-secondary)]'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Live
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublished(!isPublished)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    !isPublished ? 'bg-amber-600 text-white shadow-sm' : 'bg-transparent text-[var(--ink-secondary)]'
                  }`}
                >
                  <EyeOff className="h-3.5 w-3.5" />
                  Draft
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}
          </div>

          {/* Core Package Details */}
          <section className="surface-card p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-[var(--ink)] font-display flex items-center gap-2">
              <Compass className="h-5 w-5 text-[var(--brand)]" />
              General Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="form-label" htmlFor="title">Tour Title *</label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-control"
                  placeholder="e.g. 7-Day Serengeti Migration & Ngorongoro Big Five Safari"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="form-label" htmlFor="country">Primary Country *</label>
                  <select
                    id="country"
                    value={primaryCountry}
                    onChange={(e) => setPrimaryCountry(e.target.value)}
                    className="form-control"
                  >
                    <option value="Tanzania">Tanzania</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Botswana">Botswana</option>
                    <option value="Uganda">Uganda</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Namibia">Namibia</option>
                    <option value="Zimbabwe">Zimbabwe</option>
                    <option value="Zambia">Zambia</option>
                    <option value="Rwanda">Rwanda</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" htmlFor="startLoc">Start Location</label>
                  <input
                    id="startLoc"
                    type="text"
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                    className="form-control"
                    placeholder="e.g. Arusha or Kilimanjaro Airport"
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="endLoc">End Location</label>
                  <input
                    id="endLoc"
                    type="text"
                    value={endLocation}
                    onChange={(e) => setEndLocation(e.target.value)}
                    className="form-control"
                    placeholder="e.g. Zanzibar or Arusha"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label" htmlFor="comfort">Comfort Level</label>
                  <select
                    id="comfort"
                    value={comfortLevel}
                    onChange={(e) => setComfortLevel(e.target.value)}
                    className="form-control"
                  >
                    <option value="CAMPING">Basic Camping</option>
                    <option value="BUDGET">Budget / Economy</option>
                    <option value="MID_RANGE">Mid-Range Lodge & Tented Camps</option>
                    <option value="LUXURY">Luxury Tented Lodges</option>
                    <option value="SUPER_LUXURY">Super Luxury / Connoisseur</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" htmlFor="type">Tour Type</label>
                  <select
                    id="type"
                    value={tourType}
                    onChange={(e) => setTourType(e.target.value)}
                    className="form-control"
                  >
                    <option value="PRIVATE">Private Tour (Exclusive Vehicle)</option>
                    <option value="SHARED_GROUP">Shared Group Safari</option>
                    <option value="FLY_IN">Fly-In Safari</option>
                    <option value="SELF_DRIVE">Self-Drive Safari</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing & Duration */}
          <section className="surface-card p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-[var(--ink)] font-display flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[var(--brand)]" />
              Duration & Pricing
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="form-label" htmlFor="days">Duration Days *</label>
                <input
                  id="days"
                  type="number"
                  min="1"
                  max="45"
                  required
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="form-control"
                />
              </div>
              <div>
                <label className="form-label" htmlFor="nights">Duration Nights</label>
                <input
                  id="nights"
                  type="number"
                  min="0"
                  max="44"
                  value={durationNights}
                  onChange={(e) => setDurationNights(e.target.value)}
                  className="form-control"
                />
              </div>
              <div>
                <label className="form-label" htmlFor="minPrice">Minimum Price (USD) *</label>
                <input
                  id="minPrice"
                  type="number"
                  min="50"
                  required
                  value={minPriceUsd}
                  onChange={(e) => setMinPriceUsd(e.target.value)}
                  className="form-control"
                />
              </div>
              <div>
                <label className="form-label" htmlFor="maxPrice">Maximum Price (USD)</label>
                <input
                  id="maxPrice"
                  type="number"
                  min="0"
                  value={maxPriceUsd}
                  onChange={(e) => setMaxPriceUsd(e.target.value)}
                  className="form-control"
                  placeholder="Optional upper bound"
                />
              </div>
            </div>
          </section>

          {/* Inclusions & Exclusions */}
          <section className="surface-card p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-[var(--ink)] font-display flex items-center gap-2">
              <Award className="h-5 w-5 text-[var(--brand)]" />
              Inclusions & Exclusions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="form-label" htmlFor="inclusions">Inclusions (one item per line)</label>
                <textarea
                  id="inclusions"
                  rows={5}
                  value={inclusionsText}
                  onChange={(e) => setInclusionsText(e.target.value)}
                  className="form-control font-mono text-xs"
                  placeholder="All national park entrance fees&#10;Professional safari guide&#10;4x4 Safari Land Cruiser transport"
                />
              </div>
              <div>
                <label className="form-label" htmlFor="exclusions">Exclusions (one item per line)</label>
                <textarea
                  id="exclusions"
                  rows={5}
                  value={exclusionsText}
                  onChange={(e) => setExclusionsText(e.target.value)}
                  className="form-control font-mono text-xs"
                  placeholder="International flights&#10;Tips for guides & staff&#10;Alcoholic beverages"
                />
              </div>
            </div>
          </section>

          {/* Day-by-Day Itineraries */}
          <section className="surface-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[var(--ink)] font-display flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[var(--brand)]" />
                  Day-by-Day Itinerary ({itineraries.length} days)
                </h2>
                <p className="text-xs text-[var(--ink-secondary)] mt-0.5">
                  Outline what travelers experience each day of the safari.
                </p>
              </div>
              <button
                type="button"
                onClick={addDay}
                className="btn btn-secondary btn-sm inline-flex items-center gap-1.5 self-start"
              >
                <Plus className="h-4 w-4" />
                Add Another Day
              </button>
            </div>

            <div className="space-y-4">
              {itineraries.map((day, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] p-5 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="badge badge-brand">Day {day.dayNumber}</span>
                    {itineraries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDay(idx)}
                        className="text-[var(--danger)] hover:text-red-700 text-xs font-semibold inline-flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove Day
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Day Title</label>
                    <input
                      type="text"
                      value={day.title}
                      onChange={(e) => updateDay(idx, 'title', e.target.value)}
                      className="form-control"
                      placeholder={`e.g. Day ${day.dayNumber}: Tarangire National Park Game Drive`}
                    />
                  </div>

                  <div>
                    <label className="form-label">Day Description & Activities</label>
                    <textarea
                      rows={3}
                      value={day.description}
                      onChange={(e) => updateDay(idx, 'description', e.target.value)}
                      className="form-control text-xs"
                      placeholder="Describe the wildlife, route, activities and sights for this day..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="form-label">Accommodation</label>
                      <input
                        type="text"
                        value={day.accommodationName}
                        onChange={(e) => updateDay(idx, 'accommodationName', e.target.value)}
                        className="form-control text-xs"
                        placeholder="e.g. Serengeti Safari Lodge"
                      />
                    </div>
                    <div>
                      <label className="form-label">Meals Included</label>
                      <input
                        type="text"
                        value={day.mealsIncluded}
                        onChange={(e) => updateDay(idx, 'mealsIncluded', e.target.value)}
                        className="form-control text-xs"
                        placeholder="e.g. Breakfast, Lunch, Dinner"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Sticky save bar */}
          <div className="sticky bottom-4 z-20 surface-card p-4 flex items-center justify-between gap-4 border border-[var(--border)] shadow-xl">
            <Link
              href="/operator-portal"
              className="btn btn-secondary text-xs"
            >
              Cancel
            </Link>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary inline-flex items-center gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
