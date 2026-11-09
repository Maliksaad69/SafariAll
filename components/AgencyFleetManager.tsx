'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bus,
  Plus,
  Trash2,
  CalendarDays,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronDown,
  Layers,
} from 'lucide-react';

export interface VehicleItem {
  id: string;
  name: string;
  vehicleType: string;
  seats: number;
  plateNumber: string | null;
  isActive: boolean;
  upcomingDepartures?: number;
}

export default function AgencyFleetManager({ initialVehicles }: { initialVehicles: VehicleItem[] }) {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<VehicleItem[]>(initialVehicles);
  const [showAddForm, setShowAddForm] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add form fields
  const [name, setName] = useState('Safari Land Cruiser');
  const [vehicleType, setVehicleType] = useState('4x4 Safari Land Cruiser');
  const [seats, setSeats] = useState(7);
  const [count, setCount] = useState(1);
  const [plateNumber, setPlateNumber] = useState('');

  const activeVehicles = vehicles.filter((v) => v.isActive);
  const totalSeats = activeVehicles.reduce((sum, v) => sum + v.seats, 0);

  const handleAddVehicles = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy('add');
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/operator/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          vehicleType,
          seats: Number(seats),
          count: Number(count),
          plateNumber: plateNumber || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add vehicles.');

      // Refresh fleet
      const listRes = await fetch('/api/operator/vehicles');
      if (listRes.ok) {
        const listData = await listRes.json();
        setVehicles(listData.vehicles || []);
      }

      setSuccess(
        count > 1
          ? `Successfully added ${count} new vehicles to your fleet!`
          : `Vehicle "${name}" added to your fleet!`
      );
      setTimeout(() => setSuccess(''), 4000);
      setShowAddForm(false);
      setPlateNumber('');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error adding vehicle.');
    } finally {
      setBusy(null);
    }
  };

  const toggleActive = async (vehicle: VehicleItem) => {
    setBusy(`toggle-${vehicle.id}`);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/operator/vehicles/${vehicle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !vehicle.isActive }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update vehicle status.');

      setVehicles((prev) =>
        prev.map((v) => (v.id === vehicle.id ? { ...v, isActive: !v.isActive } : v))
      );
      setSuccess(`Vehicle status updated.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error updating status.');
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async (vehicle: VehicleItem) => {
    if (!window.confirm(`Remove vehicle "${vehicle.name}" from your fleet?`)) return;

    setBusy(`del-${vehicle.id}`);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/operator/vehicles/${vehicle.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete vehicle.');

      setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));
      setSuccess(`Vehicle removed.`);
      setTimeout(() => setSuccess(''), 3000);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error deleting vehicle.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="surface-card overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <Bus className="h-5 w-5 text-[var(--brand)]" />
            <h2 className="text-lg font-bold text-[var(--ink)] font-display">
              Agency Fleet &amp; Vehicles
            </h2>
          </div>
          <p className="text-xs text-[var(--ink-secondary)] mt-0.5">
            Define your safari vehicles. Our automated system matches and reserves them for booked tours.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/operator-portal/slots"
            className="btn btn-secondary btn-sm inline-flex items-center gap-1.5 text-xs"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            Manage Departures
          </Link>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary btn-sm inline-flex items-center gap-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            {showAddForm ? 'Close Form' : 'Add Vehicles'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-5 sm:mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mx-5 sm:mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Fleet quick summary badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 sm:p-6 bg-[var(--surface-raised)] border-b border-[var(--border)]">
        <div className="rounded-xl bg-white/70 p-3 border border-[var(--border)]">
          <span className="text-[11px] font-bold text-[var(--ink-secondary)] uppercase">Total Cars</span>
          <div className="text-xl font-bold text-[var(--ink)] mt-0.5">{vehicles.length}</div>
        </div>
        <div className="rounded-xl bg-white/70 p-3 border border-[var(--border)]">
          <span className="text-[11px] font-bold text-[var(--ink-secondary)] uppercase">Active Fleet</span>
          <div className="text-xl font-bold text-emerald-700 mt-0.5">{activeVehicles.length}</div>
        </div>
        <div className="rounded-xl bg-white/70 p-3 border border-[var(--border)]">
          <span className="text-[11px] font-bold text-[var(--ink-secondary)] uppercase">Total Seat Capacity</span>
          <div className="text-xl font-bold text-[var(--brand)] mt-0.5">{totalSeats} seats</div>
        </div>
        <div className="rounded-xl bg-white/70 p-3 border border-[var(--border)]">
          <span className="text-[11px] font-bold text-[var(--ink-secondary)] uppercase">Auto-Allocation</span>
          <div className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-1">
            <ShieldCheck className="h-4 w-4" /> Enabled
          </div>
        </div>
      </div>

      {/* Add Vehicle Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddVehicles}
          className="p-5 sm:p-6 bg-[var(--brand-soft)]/20 border-b border-[var(--border)] space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--brand-deep)] flex items-center gap-2">
              <Plus className="h-4 w-4" /> Define New Vehicle(s)
            </h3>
            <span className="text-xs text-[var(--ink-muted)]">
              Specify quantity if you have multiple identical vehicles
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div className="sm:col-span-2">
              <label className="form-label" htmlFor="vf-name">
                Vehicle Base Name <span className="text-red-600">*</span>
              </label>
              <input
                id="vf-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-control text-xs"
                placeholder="e.g. Safari Cruiser or Land Cruiser 4x4"
              />
              <span className="text-[10.5px] text-[#516D6A] mt-1 block">Name displayed to guests and in departures</span>
            </div>

            <div>
              <label className="form-label" htmlFor="vf-type">
                Vehicle Type / Category <span className="text-red-600">*</span>
              </label>
              <select
                id="vf-type"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="form-control text-xs"
              >
                <option value="4x4 Safari Land Cruiser">4x4 Land Cruiser</option>
                <option value="Safari Minivan (Pop-Up Roof)">Safari Minivan</option>
                <option value="Extended 4x4 Land Cruiser">Extended Cruiser</option>
                <option value="Overland Safari Truck">Overland Truck</option>
                <option value="Luxury SUV">Luxury SUV</option>
              </select>
              <span className="text-[10.5px] text-[#516D6A] mt-1 block">Vehicle specification</span>
            </div>

            <div>
              <label className="form-label" htmlFor="vf-seats">
                Passenger Seats <span className="text-red-600">*</span>
              </label>
              <input
                id="vf-seats"
                type="number"
                min="1"
                max="60"
                required
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                className="form-control text-xs font-bold text-[#193A38]"
              />
              <span className="text-[10.5px] text-[#516D6A] mt-1 block">Excluding driver</span>
            </div>

            <div>
              <label className="form-label" htmlFor="vf-count">
                Fleet Quantity <span className="text-red-600">*</span>
              </label>
              <input
                id="vf-count"
                type="number"
                min="1"
                max="20"
                required
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="form-control text-xs font-bold text-[var(--brand)]"
              />
              <span className="text-[10.5px] text-[#516D6A] mt-1 block">Identical units</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label" htmlFor="vf-plate">
                License Plate / Registration Prefix (Optional)
              </label>
              <input
                id="vf-plate"
                type="text"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                className="form-control text-xs"
                placeholder="e.g. TZ-8492"
              />
              <span className="text-[10.5px] text-[#516D6A] mt-1 block">Optional identifier for vehicle dispatch</span>
            </div>
            <div className="flex items-center pt-5">
              <button
                type="submit"
                disabled={busy === 'add'}
                className="btn btn-primary btn-sm w-full inline-flex items-center justify-center gap-2 text-xs font-bold min-h-[38px]"
              >
                {busy === 'add' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {count > 1 ? `Add ${count} Vehicles to Fleet` : 'Add Vehicle to Fleet'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Vehicle Cards / Grid */}
      {vehicles.length > 0 ? (
        <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className={`rounded-2xl border p-4 transition-all space-y-3 ${
                v.isActive
                  ? 'border-[var(--border)] bg-white shadow-xs'
                  : 'border-amber-300 bg-amber-50/50 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                      v.isActive
                        ? 'bg-[var(--brand-soft)] text-[var(--brand)]'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    <Bus className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#193A38]">{v.name}</h4>
                    <span className="text-xs font-semibold text-[#516D6A]">
                      {v.vehicleType}
                    </span>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    v.isActive
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-amber-100 text-amber-950 border border-amber-300'
                  }`}
                >
                  {v.isActive ? 'Active' : 'Maintenance'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-[#344C49] pt-2 border-t border-[var(--border-soft)]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#193A38]">Passenger Capacity:</span>
                  <span className="font-semibold text-[#193A38]">{v.seats} Seats</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#193A38]">License Plate:</span>
                  <span className="font-mono font-bold text-[#193A38]">{v.plateNumber || 'None specified'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#193A38]">Scheduled Trips:</span>
                  <span className="font-semibold text-[#214446]">
                    {v.upcomingDepartures ? `${v.upcomingDepartures} departure(s)` : 'Ready to reserve'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-[var(--border-soft)] gap-2">
                <button
                  type="button"
                  onClick={() => toggleActive(v)}
                  disabled={busy === `toggle-${v.id}`}
                  className="btn btn-secondary btn-sm text-xs px-2.5 py-1"
                >
                  {v.isActive ? 'Set Inactive' : 'Activate Vehicle'}
                </button>
                {(!v.upcomingDepartures || v.upcomingDepartures === 0) && (
                  <button
                    type="button"
                    onClick={() => handleDelete(v)}
                    disabled={busy === `del-${v.id}`}
                    className="btn btn-danger btn-sm text-xs px-2 py-1"
                    title="Permanently remove vehicle from fleet"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center space-y-2">
          <Bus className="h-8 w-8 text-gray-400 mx-auto" />
          <p className="text-sm font-semibold text-[var(--ink)]">No vehicles defined in your fleet</p>
          <p className="text-xs text-[var(--ink-secondary)] max-w-sm mx-auto">
            Add your safari vehicles so our automated system can reserve them for upcoming tour bookings.
          </p>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary btn-sm mt-3 inline-flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Add First Vehicle
          </button>
        </div>
      )}
    </section>
  );
}
