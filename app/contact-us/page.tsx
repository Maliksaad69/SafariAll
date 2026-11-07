'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  Mail,
  Send,
  CheckCircle2,
  Clock,
  Compass,
  ShieldCheck,
  Headphones,
  Briefcase,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Check,
  AlertCircle,
  Users,
} from 'lucide-react';

const TOPIC_OPTIONS = [
  { value: 'planning', label: 'Planning a safari' },
  { value: 'quote_request', label: 'A custom quote request I sent' },
  { value: 'operator_account', label: 'Operator account & registration' },
  { value: 'payments', label: 'Payments & booking protection' },
  { value: 'operator_listings', label: 'Managing listings (safaris, accommodations, vehicles)' },
  { value: 'website_problem', label: 'Website or technical problem' },
  { value: 'partnership', label: 'Partnership & tourism board collaboration' },
  { value: 'other', label: 'Other inquiry' },
];

export default function ContactUsPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [dialCode, setDialCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [topic, setTopic] = useState('planning');
  const [reference, setReference] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [hpTrap, setHpTrap] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in your name, email, and message.');
      return;
    }

    setLoading(true);

    try {
      const fullPhone = phoneNumber.trim() ? `${dialCode} ${phoneNumber.trim()}` : '';
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: fullPhone,
          topic,
          reference: reference.trim(),
          subject: subject.trim(),
          message: message.trim(),
          hp_trap: hpTrap,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send your message. Please try again.');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPhoneNumber('');
    setTopic('planning');
    setReference('');
    setSubject('');
    setMessage('');
    setSubmitted(false);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[var(--surface-page,#F7F6F1)] text-[var(--ink-body,#222B2A)] flex flex-col">
      <Navbar />

      {/* Breadcrumb Bar */}
      <div className="border-b border-black/5 py-2.5 text-xs text-[var(--ink-muted,#516D6A)] bg-white/70 backdrop-blur-sm">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#214446] transition-colors">Home</Link>
          <span className="opacity-50">/</span>
          <span className="text-[#193A38] font-medium">Contact Us</span>
        </div>
      </div>

      {/* Hero Section (Matching SafariVendors dh-hero banner) */}
      <section className="relative overflow-hidden bg-[#193A38] text-white">
        {/* Background Image with Dark Tint Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2560&q=85')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#193A38] via-[#193A38]/90 to-[#214446]/80" />

        <div className="relative max-w-[1240px] mx-auto px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          {/* Eyebrow Badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#E4DBB4] backdrop-blur-md">
            <Mail className="h-3.5 w-3.5 text-[#E4DBB4]" />
            <span>Get In Touch</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display tracking-tight text-white max-w-3xl leading-tight">
            Contact SafariRequest
          </h1>

          {/* Tagline */}
          <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-white/85 font-light">
            Reach SafariRequest for marketplace support, partnership questions, or general assistance. We reply by message within 24 hours.
          </p>

          {/* Feature Badges Row */}
          <div className="mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs text-white/90">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 backdrop-blur-sm">
              <Headphones className="h-3.5 w-3.5 text-[#E4DBB4]" />
              Traveler support
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 backdrop-blur-sm">
              <Briefcase className="h-3.5 w-3.5 text-[#E4DBB4]" />
              Operator onboarding
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 backdrop-blur-sm">
              <Clock className="h-3.5 w-3.5 text-[#E4DBB4]" />
              24h response time
            </span>
          </div>

          {/* Hero Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#contactForm"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E4DBB4] hover:bg-[#D8CDA1] px-5 py-3 text-sm font-bold text-[#193A38] shadow-sm transition-all hover:translate-y-[-1px]"
            >
              <Send className="h-4 w-4" />
              <span>Send Message</span>
            </a>
            <Link
              href="/african-safari-tours"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all"
            >
              <Compass className="h-4 w-4" />
              <span>Browse Safaris</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Layout (Dual Column: Left Form + Right Sidebar) */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Contact Form Panel (Col-span 7 / 8) */}
          <div id="contactForm" className="lg:col-span-7 xl:col-span-8 scroll-mt-20">
            <div className="rounded-3xl border border-[#DEDCCF] bg-white p-6 sm:p-10 shadow-sm">
              {/* Header */}
              <div className="border-b border-[#E8E6DC] pb-6 mb-8">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#214446] mb-2">
                  <Mail className="h-3.5 w-3.5 text-[#214446]" />
                  <span>SafariRequest Support</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#193A38] tracking-tight">
                  Send Us A Message
                </h2>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#516D6A]">
                  Use this page for marketplace support, partnership questions, content updates, and general SafariRequest assistance.
                </p>
              </div>

              {submitted ? (
                /* Submission Confirmation Banner */
                <div className="rounded-2xl border border-[#BCE1D6] bg-[#F2FAF7] p-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#197054] text-white shadow-md">
                    <Check className="h-7 w-7 stroke-[3]" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-[#193A38]">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-[#344C49] max-w-md mx-auto">
                    Thank you, <strong>{fullName}</strong>. Our dedicated safari support desk has received your inquiry and will reply to <strong>{email}</strong> within 24 hours.
                  </p>
                  <div className="pt-4 flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-xl border border-[#DEDCCF] bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#193A38] hover:bg-[#F7F6F1] transition-colors"
                    >
                      Send Another Message
                    </button>
                    <Link
                      href="/african-safari-tours"
                      className="rounded-xl bg-[#214446] px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#193A38] transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>Browse Safaris</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                /* Interactive Contact Form */
                <form onSubmit={handleSubmit} className="space-y-8">
                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs sm:text-sm text-red-700 flex items-start gap-2.5">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Honeypot for spam bots (invisible) */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="hp_trap">Do not fill this</label>
                    <input
                      type="text"
                      id="hp_trap"
                      name="hp_trap"
                      tabIndex={-1}
                      autoComplete="off"
                      value={hpTrap}
                      onChange={(e) => setHpTrap(e.target.value)}
                    />
                  </div>

                  {/* STEP 1: Your Details */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#214446] text-white text-xs font-bold">
                        1
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-[#193A38] leading-tight">
                          Your Details
                        </h3>
                        <p className="text-xs text-[#516D6A] mt-0.5">
                          SafariRequest will use these details only to respond to your message.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {/* Full Name */}
                      <div>
                        <label htmlFor="fullName" className="block text-xs font-bold text-[#193A38] mb-1.5">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="fullName"
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Sarah Jenkins"
                          className="w-full rounded-xl border border-[#DEDCCF] bg-[#FDFCF9] px-3.5 py-2.5 text-sm text-[#193A38] focus:border-[#214446] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#214446] transition-all"
                        />
                      </div>

                      {/* Email Address */}
                      <div>
                        <label htmlFor="email" className="block text-xs font-bold text-[#193A38] mb-1.5">
                          Email address <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="sarah@example.com"
                          className="w-full rounded-xl border border-[#DEDCCF] bg-[#FDFCF9] px-3.5 py-2.5 text-sm text-[#193A38] focus:border-[#214446] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#214446] transition-all"
                        />
                      </div>
                    </div>

                    {/* Email Response Note (as seen on SafariVendors) */}
                    <div className="rounded-xl border border-[#E8E6DC] bg-[#F7F6F1] p-3 text-xs text-[#516D6A] flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-[#214446] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#193A38] font-semibold block">We&apos;ll reply directly to this email address</strong>
                        <span className="opacity-90">Our dedicated support team replies to every inquiry, usually within 24 hours.</span>
                      </div>
                    </div>

                    {/* Phone Number (Optional) */}
                    <div>
                      <label htmlFor="phoneNumber" className="block text-xs font-bold text-[#193A38] mb-1.5">
                        Phone / WhatsApp <span className="font-normal text-[#516D6A]">(optional)</span>
                      </label>
                      <div className="flex rounded-xl border border-[#DEDCCF] bg-[#FDFCF9] focus-within:border-[#214446] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#214446] transition-all overflow-hidden">
                        <select
                          aria-label="Country Dial Code"
                          value={dialCode}
                          onChange={(e) => setDialCode(e.target.value)}
                          className="border-r border-[#DEDCCF] bg-[#F7F6F1] px-3 py-2.5 text-xs font-semibold text-[#193A38] focus:outline-none cursor-pointer"
                        >
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+255">🇹🇿 +255</option>
                          <option value="+254">🇰🇪 +254</option>
                          <option value="+27">🇿🇦 +27</option>
                          <option value="+256">🇺🇬 +256</option>
                          <option value="+267">🇧🇼 +267</option>
                          <option value="+250">🇷🇼 +250</option>
                          <option value="+49">🇩🇪 +49</option>
                          <option value="+33">🇫🇷 +33</option>
                          <option value="+61">🇦🇺 +61</option>
                          <option value="+31">🇳🇱 +31</option>
                        </select>
                        <input
                          id="phoneNumber"
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="e.g. 712 345 678"
                          className="w-full bg-transparent px-3.5 py-2.5 text-sm text-[#193A38] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="border-[#E8E6DC]" />

                  {/* STEP 2: Message Details */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#214446] text-white text-xs font-bold">
                        2
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-[#193A38] leading-tight">
                          Message Details
                        </h3>
                        <p className="text-xs text-[#516D6A] mt-0.5">
                          Choose a category so we can direct your message to the appropriate department.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {/* Topic Dropdown */}
                      <div>
                        <label htmlFor="topic" className="block text-xs font-bold text-[#193A38] mb-1.5">
                          Inquiry Topic <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="topic"
                          required
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          className="w-full rounded-xl border border-[#DEDCCF] bg-[#FDFCF9] px-3.5 py-2.5 text-sm text-[#193A38] focus:border-[#214446] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#214446] transition-all cursor-pointer"
                        >
                          {TOPIC_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Reference Number (Optional) */}
                      <div>
                        <label htmlFor="reference" className="block text-xs font-bold text-[#193A38] mb-1.5">
                          Reference <span className="font-normal text-[#516D6A]">(optional)</span>
                        </label>
                        <input
                          id="reference"
                          type="text"
                          value={reference}
                          onChange={(e) => setReference(e.target.value)}
                          placeholder="Quote, booking or operator ID"
                          className="w-full rounded-xl border border-[#DEDCCF] bg-[#FDFCF9] px-3.5 py-2.5 text-sm text-[#193A38] focus:border-[#214446] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#214446] transition-all"
                        />
                      </div>
                    </div>

                    {/* Subject Line */}
                    <div>
                      <label htmlFor="subject" className="block text-xs font-bold text-[#193A38] mb-1.5">
                        Subject Line <span className="font-normal text-[#516D6A]">(optional)</span>
                      </label>
                      <input
                        id="subject"
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Brief summary of your question..."
                        className="w-full rounded-xl border border-[#DEDCCF] bg-[#FDFCF9] px-3.5 py-2.5 text-sm text-[#193A38] focus:border-[#214446] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#214446] transition-all"
                      />
                    </div>

                    {/* Message Body */}
                    <div>
                      <label htmlFor="message" className="block text-xs font-bold text-[#193A38] mb-1.5">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        required
                        rows={6}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us how we can help you in detail..."
                        className="w-full rounded-xl border border-[#DEDCCF] bg-[#FDFCF9] px-3.5 py-3 text-sm text-[#193A38] focus:border-[#214446] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#214446] transition-all leading-relaxed resize-y"
                      />
                    </div>
                  </div>

                  {/* Trust Row (Matching SafariVendors) */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-[#516D6A]">
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-[#214446]" />
                      Secure &amp; confidential
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-[#214446]" />
                      Reply within 24 hours
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-[#214446]" />
                      Zero spam policy
                    </span>
                  </div>

                  <p className="text-[11px] text-[#516D6A]/80 leading-normal">
                    By submitting, you agree to our{' '}
                    <Link href="/privacy-policy" className="underline hover:text-[#214446]">
                      Privacy Policy
                    </Link>{' '}
                    and platform terms.
                  </p>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-[#214446] hover:bg-[#193A38] text-white py-3.5 px-6 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 hover:translate-y-[-1px] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Sending message...</span>
                      </span>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT: Sidebar Panels (Col-span 5 / 4 - strictly NO telephone or personal email address) */}
          <aside className="lg:col-span-5 xl:col-span-4 space-y-6">
            {/* Card 1: Support Channels ("How We Can Help") */}
            <div className="rounded-3xl border border-[#DEDCCF] bg-white p-6 sm:p-7 shadow-sm space-y-5">
              <div>
                <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#214446]">
                  <Headphones className="h-3.5 w-3.5 text-[#214446]" />
                  <span>Support Channels</span>
                </p>
                <h3 className="text-xl font-bold font-display text-[#193A38] mt-1">
                  How We Can Help
                </h3>
              </div>

              <ul className="space-y-4 text-xs sm:text-sm">
                <li className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F7F6F1] text-[#214446] border border-[#DEDCCF]">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <strong className="text-[#193A38] font-bold block">Traveler Help</strong>
                    <p className="text-xs text-[#516D6A] mt-0.5 leading-relaxed">
                      Questions regarding tour comparisons, custom quotes, booking steps, and travel requirements.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F7F6F1] text-[#214446] border border-[#DEDCCF]">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <strong className="text-[#193A38] font-bold block">Operator Support</strong>
                    <p className="text-xs text-[#516D6A] mt-0.5 leading-relaxed">
                      Agency registration, license verification, listing management, and traveler lead routing.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F7F6F1] text-[#214446] border border-[#DEDCCF]">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <strong className="text-[#193A38] font-bold block">Content &amp; Partnerships</strong>
                    <p className="text-xs text-[#516D6A] mt-0.5 leading-relaxed">
                      Destination guides, national park info updates, press relations, and tourism collaborations.
                    </p>
                  </div>
                </li>
              </ul>

              <div className="rounded-xl bg-[#F7F6F1] border border-[#DEDCCF] p-3 text-xs text-[#516D6A] flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#214446] shrink-0" />
                <span>
                  Typical reply within <strong>24 hours</strong> on business days.
                </span>
              </div>
            </div>

            {/* Card 2: Planning A Safari Prompt ("Skip the form — get a real quote") */}
            <div className="rounded-3xl border border-[#214446] bg-[#214446] p-6 sm:p-7 text-white shadow-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
              <div>
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[#E4DBB4] backdrop-blur-sm">
                  <Compass className="h-3.5 w-3.5 text-[#E4DBB4]" />
                  <span>Planning A Safari?</span>
                </div>
                <h3 className="text-xl font-bold font-display text-white">
                  Skip the form — get a custom quote
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-white/85">
                  Looking to book a safari? Tell us your dates, group size, and dream parks. Receive tailor-made proposals directly from verified local African outfitters.
                </p>
              </div>

              <div className="mt-6 space-y-2.5">
                <Link
                  href="/custom-safari-quote"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#E4DBB4] hover:bg-[#D8CDA1] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#193A38] transition-all shadow-sm"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Request Custom Quote</span>
                </Link>
                <Link
                  href="/african-safari-tours"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white transition-all backdrop-blur-sm"
                >
                  <Compass className="h-3.5 w-3.5" />
                  <span>Browse All Safaris</span>
                </Link>
              </div>
            </div>

            {/* Card 3: For Safari Operators */}
            <div className="rounded-3xl border border-[#DEDCCF] bg-[#F7F6F1] p-6 sm:p-7 shadow-xs">
              <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#214446]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#214446]" />
                <span>For Safari Outfitters</span>
              </div>
              <h3 className="text-lg font-bold font-display text-[#193A38]">
                Are You a Safari Operator?
              </h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#344C49]">
                Join Africa&apos;s leading marketplace. Register your agency, showcase your signature game drive packages, and receive direct quote inquiries from global travelers.
              </p>
              <Link
                href="/register"
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-[#214446] bg-white hover:bg-[#214446] hover:text-white px-4 py-2.5 text-xs sm:text-sm font-bold text-[#214446] transition-all shadow-xs w-full"
              >
                <span>Register Your Agency</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Card 4: Quick Help Center & FAQs */}
            <div className="rounded-3xl border border-[#DEDCCF] bg-white p-6 shadow-xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#214446]/10 text-[#214446]">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#193A38]">Have common questions?</h4>
                  <p className="text-xs text-[#516D6A]">Check best seasons, visas, &amp; tipping guides.</p>
                </div>
              </div>
              <Link
                href="/faq"
                className="rounded-xl bg-[#F7F6F1] hover:bg-[#E8E6DC] text-[#193A38] px-3.5 py-2 text-xs font-bold transition-colors shrink-0"
              >
                FAQs
              </Link>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
