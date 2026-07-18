import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react";
import { useId, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Anchor,
  Baby,
  BadgeCheck,
  Bed,
  CalendarDays,
  Check,
  CreditCard,
  Download,
  Loader2,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Shield,
  Ticket,
  Users,
  Wallet,
  X,
} from "lucide-react";
import logo from "@/assets/logo.png";
import img109 from "@/assets/109.jpeg";
import { AvailabilityCalendar } from "@/components/booking/AvailabilityCalendar";
import { PackagePicker } from "@/components/booking/PackagePicker";
import { RoomGallery } from "@/components/booking/RoomGallery";
import { RoomPicker } from "@/components/booking/RoomPicker";
import { getBookingInvoices, initiatePayment } from "@/lib/api/bookings";
import { usePackage } from "@/hooks/queries/usePackages";
import { useBookingQuote } from "@/hooks/queries/useBookingQuote";
import { useCreateBooking } from "@/hooks/queries/useCreateBooking";
import { parseLocalDate } from "@/lib/dates";
import { formatBDT } from "@/lib/money";
import { bookingContactSchema, type BookingContactValues } from "@/lib/validation/bookingForm";
import type { ApiError, BookingPublic, PackageRoom } from "@/lib/api/types";

// One selected cabin and its own party. A booking may hold several of these —
// a family taking 2–3 rooms is ONE booking (one payment, one invoice), each
// room priced on its own occupancy.
type RoomSelection = {
  room: PackageRoom;
  adultCount: number;
  kidAges: number[];
};

type BookingData = {
  packageId: number | undefined;
  rooms: RoomSelection[];
  name: string;
  email: string;
  phone: string;
  requests: string;
  paymentType: "full" | "partial";
  partialAmount: string;
};

export const Route = createFileRoute("/booking")({
  component: Booking,
  // Carries a real backend package id from /packages ("Reserve" CTA) into
  // the wizard, preselecting Step 1.
  validateSearch: (s: Record<string, unknown>) => ({
    package: typeof s.package === "number" ? s.package : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Book Your Voyage — MV Alaska Cruise" },
      {
        name: "description",
        content: "Reserve your luxury Sundarbans cruise. Choose dates, room, and payment method.",
      },
    ],
  }),
});

const steps = [
  { label: "Package", icon: Ticket },
  { label: "Voyage", icon: Anchor },
  { label: "Room", icon: Bed },
  { label: "Guests & Pay", icon: CreditCard },
] as const;

const STEP_ROOM = 2;

function isStepComplete(step: number, data: BookingData) {
  if (step === 0) return data.packageId !== undefined; // Package chosen
  if (step === 1) return data.packageId !== undefined; // Voyage confirmed
  if (step === 2) return data.rooms.length > 0; // At least one room chosen
  return true;
}

/** Add/remove/update helpers for the selected-rooms list, keyed by room id. */
function addRoom(rooms: RoomSelection[], room: PackageRoom): RoomSelection[] {
  if (rooms.some((r) => r.room.id === room.id)) return rooms; // already selected
  return [...rooms, { room, adultCount: 1, kidAges: [] }];
}
function removeRoom(rooms: RoomSelection[], roomId: number): RoomSelection[] {
  return rooms.filter((r) => r.room.id !== roomId);
}
function updateRoom(
  rooms: RoomSelection[],
  roomId: number,
  patch: Partial<RoomSelection>,
): RoomSelection[] {
  return rooms.map((r) => (r.room.id === roomId ? { ...r, ...patch } : r));
}

const stepHint: Record<number, string> = {
  0: "Select a package to continue",
  1: "Confirm your sailing dates",
  2: "Select an available room to continue",
};

function Booking() {
  const search = Route.useSearch();
  const [step, setStep] = useState(0);
  const [bookingResult, setBookingResult] = useState<BookingPublic | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [data, setData] = useState<BookingData>({
    packageId: search.package,
    rooms: [],
    name: "",
    email: "",
    phone: "",
    requests: "",
    paymentType: "full",
    partialAmount: "",
  });

  const update = (patch: Partial<BookingData>) => setData((d) => ({ ...d, ...patch }));
  const { data: selectedPackage } = usePackage(data.packageId);
  const createBooking = useCreateBooking();

  const quoteRequest =
    data.packageId !== undefined && data.rooms.length > 0
      ? {
          package_id: data.packageId,
          rooms: data.rooms.map((r) => ({
            room_id: r.room.id,
            adult_count: r.adultCount,
            kid_details: r.kidAges.map((age) => ({ age })),
          })),
        }
      : undefined;
  const { data: quote, isFetching: quoting, error: quoteError } = useBookingQuote(quoteRequest);

  if (bookingResult) {
    return <ConfirmScreen booking={bookingResult} contactName={data.name} />;
  }

  async function handleConfirm(contact: BookingContactValues) {
    if (!quoteRequest) return;
    try {
      const booking = await createBooking.mutateAsync({
        ...quoteRequest,
        customer_name: contact.name,
        phone: contact.phone,
        email: contact.email,
        // Free-text note from the wizard — only sent when the customer typed
        // something, so an empty box stays an empty string server-side.
        ...(data.requests.trim() ? { special_requests: data.requests.trim() } : {}),
      });
      // Industry checkout flow: booking created → straight to the SSLCommerz
      // gateway. The confirmation screen is only a fallback if the gateway
      // can't be reached — success/fail/cancel pages handle the return trip.
      setRedirecting(true);
      try {
        const payment = await initiatePayment(booking.booking_code, {
          payment_type: data.paymentType,
          ...(data.paymentType === "partial" && data.partialAmount
            ? { amount: data.partialAmount }
            : {}),
        });
        window.location.assign(payment.gateway_url);
        return; // keep the button in its redirecting state during navigation
      } catch {
        setRedirecting(false);
        toast.error(
          "Your room is reserved, but the payment gateway didn't respond — use Pay Now below to retry.",
        );
        setBookingResult(booking);
      }
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.code === "room_unavailable" || apiError.status === 409) {
        toast.error("One of your rooms was just booked by someone else. Please pick again.");
        update({ rooms: [] });
        setStep(STEP_ROOM);
      } else if (apiError.fieldErrors) {
        toast.error(Object.values(apiError.fieldErrors).flat().join(" "));
      } else {
        toast.error(apiError.detail || "Couldn't complete your booking. Please try again.");
      }
    }
  }

  // On the final (payment) step the sidebar is hidden — the payment step lays
  // out its own summary + payment columns full-width.
  const isPaymentStep = step === steps.length - 1;
  // The deck plan needs every pixel it can get: with the sidebar taking 5/12 of
  // the row, the hull was narrower at lg than it had been at md. The room step
  // therefore goes full-width too, and the sidebar's totals live in the sticky
  // bar / the payment step instead.
  const isWideStep = isPaymentStep || step === STEP_ROOM;
  const canContinue = isStepComplete(step, data);
  const goBack = () => setStep((s) => Math.max(0, s - 1));
  const goNext = () => canContinue && setStep((s) => Math.min(steps.length - 1, s + 1));

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero band ── */}
      <div className="relative overflow-hidden bg-linear-to-br from-ocean via-ocean to-midnight">
        <img
          src={img109}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-linear-to-r from-ocean/95 via-ocean/85 to-ocean/55" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-midnight/60 to-transparent" />
        <div className="relative z-10 container-luxe pt-28 pb-20 md:pt-32 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="eyebrow text-gold-soft mb-3 flex items-center gap-2"
          >
            <span className="h-px w-8 bg-gold" /> Reservations
          </motion.div>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-background text-[clamp(1.9rem,4.5vw,3.4rem)] font-light leading-[1.05]"
            >
              Begin your <em className="not-italic">voyage.</em>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden md:flex items-center gap-5 pb-1.5"
            >
              {[
                { icon: Lock, label: "SSL-secured payment" },
                { icon: BadgeCheck, label: "Instant confirmation" },
                { icon: Phone, label: "Concierge support" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-background/70"
                >
                  <Icon className="size-3.5 text-gold-soft" /> {label}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Progress rail — floats over the hero, then stays pinned under the navbar ── */}
      <div className="container-luxe relative z-30 -mt-10 md:-mt-12 md:sticky md:top-24">
        <Stepper step={step} data={data} onStepClick={setStep} />
      </div>

      {/* ── Main layout ── */}
      <div className="container-luxe pt-12 pb-28 lg:pt-16 lg:pb-20">
        <div className="grid lg:grid-cols-12 gap-12 xl:gap-16">
          {/* ── Left: step content ── */}
          {/* min-w-0 lets the deck plan's scroll container actually scroll —
              a grid item defaults to min-width:auto and would otherwise widen
              the whole page to fit the hull. */}
          <div
            className={`min-w-0 ${isWideStep ? "lg:col-span-12" : "lg:col-span-7 xl:col-span-8"}`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                {step === 0 && (
                  <StepPackage data={data} update={update} onNext={() => setStep(1)} />
                )}
                {step === 1 && <StepVoyage data={data} update={update} />}
                {step === 2 && <StepCabin data={data} update={update} />}
                {step === 3 && (
                  <StepPayment
                    data={data}
                    update={update}
                    selectedPackage={selectedPackage}
                    quote={quote}
                    quoting={quoting}
                    quoteError={quoteError as ApiError | null}
                    onConfirm={handleConfirm}
                    submitting={createBooking.isPending || redirecting}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Step navigation (final step's form has its own submit) */}
            <div className="mt-12 pt-8 border-t border-border flex items-center justify-between gap-4">
              <button
                onClick={goBack}
                disabled={step === 0}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-sm text-foreground hover:border-gold hover:text-gold-text disabled:opacity-25 disabled:pointer-events-none transition-colors"
              >
                <ArrowLeft className="size-3.5" /> Back
              </button>
              {/* Hidden below lg — the mobile sticky checkout bar has its own Continue */}
              {!isPaymentStep && (
                <div className="hidden lg:flex items-center gap-4">
                  {!canContinue && (
                    <span className="hidden sm:block text-xs text-muted-foreground italic">
                      {stepHint[step]}
                    </span>
                  )}
                  <button
                    onClick={goNext}
                    disabled={!canContinue}
                    className="inline-flex items-center gap-2.5 px-9 py-3.5 rounded-full gradient-gold text-ocean text-xs uppercase tracking-[0.2em] font-semibold shadow-luxe hover-lift disabled:opacity-40 disabled:pointer-events-none"
                  >
                    Continue <ArrowRight className="size-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: sticky summary sidebar (hidden on payment step) ── */}
          {selectedPackage && !isWideStep && (
            <aside className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-40 lg:self-start">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-5"
              >
                <SummaryCard
                  data={data}
                  selectedPackage={selectedPackage}
                  quote={quote}
                  quoting={quoting}
                />
                <HelpCard />
              </motion.div>
            </aside>
          )}
        </div>
      </div>

      {/* ── Mobile sticky checkout bar ── */}
      {!isPaymentStep && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md shadow-[0_-16px_40px_-20px_rgba(0,0,0,0.35)]">
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="eyebrow text-[9px] text-muted-foreground">
                {quote
                  ? "Total"
                  : selectedPackage
                    ? "From / adult"
                    : `Step ${step + 1} of ${steps.length}`}
              </div>
              <div className="font-display text-xl text-ocean leading-tight truncate">
                {quote
                  ? formatBDT(quote.grand_total)
                  : selectedPackage
                    ? formatBDT(selectedPackage.adult_price)
                    : steps[step].label}
              </div>
            </div>
            <button
              onClick={goNext}
              disabled={!canContinue}
              className="shrink-0 inline-flex min-h-11 items-center gap-2 px-7 py-3 rounded-full gradient-gold text-ocean text-[11px] uppercase tracking-[0.18em] font-semibold shadow-luxe disabled:opacity-40 disabled:pointer-events-none"
            >
              Continue <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Progress stepper — desktop node rail + compact mobile bar ── */
function Stepper({
  step,
  data,
  onStepClick,
}: {
  step: number;
  data: BookingData;
  onStepClick: (i: number) => void;
}) {
  const pct = Math.round(((step + 1) / steps.length) * 100);
  const next = steps[step + 1];
  const CurrentIcon = steps[step].icon;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-luxe overflow-hidden">
      {/* Mobile: current step + animated progress bar */}
      <div className="md:hidden px-5 py-4">
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-full bg-ocean grid place-items-center shrink-0 ring-4 ring-ocean/10">
              <CurrentIcon className="size-4 text-gold-soft" />
            </div>
            <div className="min-w-0">
              <div className="eyebrow text-[9px] text-muted-foreground">
                Step {step + 1} of {steps.length}
              </div>
              <div className="font-display text-lg leading-tight truncate">{steps[step].label}</div>
            </div>
          </div>
          {next && (
            <div className="text-right shrink-0">
              <div className="eyebrow text-[9px] text-muted-foreground/70">Next</div>
              <div className="text-xs font-medium text-foreground/70">{next.label}</div>
            </div>
          )}
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full gradient-gold rounded-full"
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Desktop: compact node rail — completed steps are clickable to jump back */}
      <div className="hidden md:block px-6 py-3">
        <div className="flex items-center">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const active = i === step;
            const done = i < step;
            const clickable = done && isStepComplete(i, data);
            return (
              <div key={s.label} className="flex items-center flex-1 last:flex-none">
                <button
                  type="button"
                  onClick={() => clickable && onStepClick(i)}
                  disabled={!clickable}
                  className={`group flex items-center gap-2.5 ${clickable ? "cursor-pointer" : "cursor-default"}`}
                  aria-label={done ? `Return to ${s.label}` : s.label}
                >
                  <div
                    className={`size-8 rounded-full grid place-items-center shrink-0 transition-all duration-500 ${
                      done
                        ? "gradient-gold shadow-luxe group-hover:scale-105"
                        : active
                          ? "bg-ocean shadow-luxe ring-4 ring-ocean/10"
                          : "bg-muted"
                    }`}
                  >
                    {done ? (
                      <Check className="size-3.5 text-ocean" strokeWidth={2.5} />
                    ) : (
                      <Icon
                        className={`size-3.5 ${active ? "text-gold-soft" : "text-muted-foreground"}`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-[9px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                      active
                        ? "text-ocean"
                        : done
                          ? "text-gold-text group-hover:text-ocean"
                          : "text-muted-foreground/70"
                    }`}
                  >
                    {s.label}
                  </span>
                </button>
                {i < steps.length - 1 && (
                  <div className="flex-1 h-[2px] mx-3 lg:mx-4 rounded-full bg-border overflow-hidden">
                    <motion.div
                      className="h-full gradient-gold rounded-full"
                      initial={false}
                      animate={{ width: i < step ? "100%" : "0%" }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
          <span className="eyebrow text-gold-text text-[9px] shrink-0 pl-4 ml-2 border-l border-border">
            {pct}%
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Sidebar: live booking summary with price breakdown ── */
function SummaryCard({
  data,
  selectedPackage,
  quote,
  quoting,
}: {
  data: BookingData;
  selectedPackage: import("@/lib/api/types").PackageDetail;
  quote: import("@/lib/api/types").PriceBreakdown | undefined;
  quoting: boolean;
}) {
  const dates = `${parseLocalDate(selectedPackage.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${parseLocalDate(selectedPackage.end_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;

  const totalAdults = data.rooms.reduce((n, r) => n + r.adultCount, 0);
  const totalKids = data.rooms.reduce((n, r) => n + r.kidAges.length, 0);
  const firstWithPhotos = data.rooms.find((r) => r.room.images?.length);

  const rows = [
    {
      icon: MapPin,
      label: "Package",
      value: selectedPackage.marketing_title || `${selectedPackage.ship.name} Voyage`,
    },
    { icon: CalendarDays, label: "Dates", value: dates },
    {
      icon: Bed,
      label: data.rooms.length > 1 ? "Rooms" : "Room",
      value:
        data.rooms.length > 0
          ? data.rooms.map((r) => `Room ${r.room.room_number}`).join(", ")
          : "Not selected yet",
      muted: data.rooms.length === 0,
      // Small peek at a chosen room — opens the full photo lightbox on tap.
      gallery: firstWithPhotos
        ? { images: firstWithPhotos.room.images, roomNumber: firstWithPhotos.room.room_number }
        : undefined,
    },
    {
      icon: Users,
      label: "Guests",
      value:
        data.rooms.length > 0
          ? `${totalAdults} Adult${totalAdults > 1 ? "s" : ""}${
              totalKids ? `, ${totalKids} Kid${totalKids > 1 ? "s" : ""}` : ""
            }`
          : "—",
    },
  ];

  return (
    <div className="rounded-2xl overflow-hidden border border-border shadow-luxe bg-card">
      {/* Branded header */}
      <div className="relative bg-linear-to-br from-ocean via-ocean to-midnight px-5 py-4 overflow-hidden">
        <div className="absolute -right-8 -top-8 size-24 rounded-full bg-gold/10 blur-xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="eyebrow text-gold-soft text-[9px]">Your booking</div>
            <div className="font-display text-lg text-background leading-tight mt-0.5">
              MV Alaska Cruise
            </div>
          </div>
          <div className="size-9 rounded-full bg-gold/15 ring-1 ring-gold/25 grid place-items-center">
            <Anchor className="size-4 text-gold-soft" />
          </div>
        </div>
      </div>

      {/* Selection rows */}
      <div className="p-5 space-y-4">
        {rows.map(({ icon: Icon, label, value, muted, gallery }) => (
          <div key={label} className="flex items-start gap-3">
            <div className="size-7 rounded-lg bg-ocean/6 grid place-items-center shrink-0 mt-0.5">
              <Icon className="size-3.5 text-gold" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="eyebrow text-[9px] text-muted-foreground">{label}</div>
              <div
                className={`text-sm mt-0.5 leading-snug ${muted ? "text-muted-foreground/60 italic" : "font-medium text-foreground"}`}
              >
                {value}
              </div>
            </div>
            {gallery && <RoomGallery variant="thumb" {...gallery} />}
          </div>
        ))}
      </div>

      {/* Price breakdown */}
      {(quote || quoting) && (
        <div className="px-5 pb-5">
          <div className="rounded-xl border border-border/70 bg-ocean/3 px-4 py-3.5">
            {quoting && !quote ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
                <Loader2 className="size-3.5 animate-spin text-gold" /> Calculating your fare…
              </div>
            ) : quote ? (
              <div className="space-y-2 text-xs">
                {/* One line per cabin — its number and that cabin's subtotal. */}
                {quote.rooms.map((room, i) => (
                  <div key={i} className="flex justify-between text-muted-foreground">
                    <span>
                      {room.room_number ? `Room ${room.room_number}` : `Room ${i + 1}`}
                      <span className="text-muted-foreground/70">
                        {" "}
                        · {room.adult_count} ad{room.kids.length ? ` · ${room.kids.length} kid` : ""}
                      </span>
                    </span>
                    <span className="text-foreground font-medium">{formatBDT(room.total)}</span>
                  </div>
                ))}
                <div className="pt-2.5 mt-1 border-t border-dashed border-border flex justify-between items-baseline">
                  <span className="eyebrow text-[10px] text-muted-foreground">
                    Total{quote.rooms.length > 1 ? ` · ${quote.rooms.length} rooms` : ""}
                  </span>
                  <span className="font-display text-2xl text-gold-text leading-none">
                    {formatBDT(quote.grand_total)}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Trust footer */}
      <div className="px-5 py-3 border-t border-border bg-ocean/3 flex items-center gap-4 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Shield className="size-3 text-gold" /> Secure payment
        </span>
        <span className="inline-flex items-center gap-1.5">
          <BadgeCheck className="size-3 text-gold" /> Instant confirmation
        </span>
      </div>
    </div>
  );
}

function HelpCard() {
  return (
    <div className="rounded-2xl border border-border bg-card px-5 py-4">
      <div className="eyebrow text-gold-text text-[10px] mb-3">Need help booking?</div>
      <div className="space-y-2.5 text-sm">
        <a
          href="tel:+8801712823482"
          className="flex items-center gap-3 text-foreground hover:text-gold transition-colors"
        >
          <div className="size-7 rounded-full bg-ocean/10 grid place-items-center shrink-0">
            <Phone className="size-3 text-gold" />
          </div>
          +880 1712-823482
        </a>
        <a
          href="mailto:mvalaskacruise@gmail.com"
          className="flex items-center gap-3 text-foreground hover:text-gold transition-colors"
        >
          <div className="size-7 rounded-full bg-ocean/10 grid place-items-center shrink-0">
            <Mail className="size-3 text-gold" />
          </div>
          mvalaskacruise@gmail.com
        </a>
      </div>
    </div>
  );
}

/* ── Shared step header — consistent hierarchy across every step ── */
function StepHeader({
  step,
  title,
  highlight,
  description,
}: {
  step: number;
  title: string;
  highlight: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl mb-10">
      <div className="eyebrow text-gold-text text-[10px] mb-3 flex items-center gap-2">
        <span className="h-px w-8 bg-gold" />
        Step {step + 1} · {steps[step].label}
      </div>
      <h2 className="font-display text-[clamp(1.9rem,4vw,2.75rem)] font-light leading-[1.08]">
        {title} <em className="not-italic">{highlight}</em>
      </h2>
      <p className="mt-3 text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

type StepProps = { data: BookingData; update: (p: Partial<BookingData>) => void };

/* ── Step 1: Package selection ── */
function StepPackage({ data, update, onNext }: StepProps & { onNext: () => void }) {
  return (
    <div>
      <StepHeader
        step={0}
        title="Choose your"
        highlight="package."
        description="Browse our upcoming voyages and pick the departure that suits you. Every package includes all meals, guided excursions, and your private room."
      />
      <PackagePicker
        selectedPackageId={data.packageId}
        onSelectPackage={(pkg) => {
          // Selecting a different package invalidates room/guest downstream state.
          update({ packageId: pkg.id, rooms: [] });
          onNext();
        }}
      />
    </div>
  );
}

/* ── Step 2: Voyage — confirm the selected package's dates on the calendar ── */
function StepVoyage({ data, update }: StepProps) {
  const { data: selectedPackage } = usePackage(data.packageId);

  const startDate = selectedPackage ? parseLocalDate(selectedPackage.start_date) : null;
  const endDate = selectedPackage ? parseLocalDate(selectedPackage.end_date) : null;

  return (
    <div>
      <StepHeader
        step={1}
        title="Confirm your"
        highlight="sailing dates."
        description="Review your selected voyage, or pick any open date on the calendar to switch."
      />

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* ── Selected voyage — boarding-pass card ── */}
        {selectedPackage && (
          <motion.div
            key={selectedPackage.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 group relative rounded-3xl border border-border bg-card shadow-luxe overflow-hidden"
          >
            {/* Hero band */}
            <div className="relative h-36 overflow-hidden">
              <img
                src={selectedPackage.hero_image || img109}
                alt={selectedPackage.marketing_title || selectedPackage.ship.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-ocean via-ocean/70 to-ocean/20" />
              <div className="absolute inset-0 bg-linear-to-r from-ocean/85 via-ocean/30 to-transparent" />

              {/* Status pill */}
              <div className="absolute top-4 right-4">
                {selectedPackage.is_bookable ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 backdrop-blur-md px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-emerald-300 ring-1 ring-emerald-400/40">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> Open
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/20 backdrop-blur-md px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-red-200 ring-1 ring-destructive/40">
                    <span className="size-1.5 rounded-full bg-destructive" /> Closed
                  </span>
                )}
              </div>

              {/* Title overlay */}
              <div className="absolute bottom-0 left-0 right-0 px-6 pb-4">
                <div className="flex items-center gap-1.5 eyebrow text-gold-soft text-[9px] mb-1.5">
                  <MapPin className="size-3" /> {selectedPackage.ship.name} · Selected voyage
                </div>
                <h3 className="font-display text-2xl text-background font-light leading-tight truncate">
                  {selectedPackage.marketing_title || `${selectedPackage.ship.name} Voyage`}
                </h3>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* ── Sailing-range visualizer ── */}
              <div className="rounded-2xl border border-border bg-ocean/[0.03] px-6 pt-5 pb-6">
                <div className="flex items-center justify-between gap-2">
                  {/* Depart */}
                  <div className="text-left">
                    <div className="eyebrow text-[8px] text-muted-foreground mb-1.5">Depart</div>
                    <div className="font-display text-4xl leading-none text-foreground">
                      {startDate?.toLocaleDateString("en-GB", { day: "2-digit" })}
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-text mt-1.5">
                      {startDate?.toLocaleDateString("en-GB", { month: "short" })}
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">
                      {startDate?.toLocaleDateString("en-GB", { weekday: "long" })}
                    </div>
                  </div>

                  {/* Journey rail */}
                  <div className="flex-1 flex flex-col items-center px-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ocean/70 mb-2">
                      {selectedPackage.days}D · {selectedPackage.nights}N
                    </div>
                    <div className="relative w-full flex items-center">
                      <span className="size-2 rounded-full ring-1 ring-gold bg-background shrink-0" />
                      <span className="flex-1 border-t border-dashed border-gold/60" />
                      <span className="mx-1.5 grid place-items-center size-7 rounded-full gradient-gold shadow-luxe shrink-0">
                        <Anchor className="size-3.5 text-ocean" />
                      </span>
                      <span className="flex-1 border-t border-dashed border-gold/60" />
                      <span className="size-2 rounded-full bg-gold shrink-0" />
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-2 uppercase tracking-[0.2em]">
                      Round trip
                    </div>
                  </div>

                  {/* Return */}
                  <div className="text-right">
                    <div className="eyebrow text-[8px] text-muted-foreground mb-1.5">Return</div>
                    <div className="font-display text-4xl leading-none text-foreground">
                      {endDate?.toLocaleDateString("en-GB", { day: "2-digit" })}
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gold-text mt-1.5">
                      {endDate?.toLocaleDateString("en-GB", { month: "short" })}
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">
                      {endDate?.toLocaleDateString("en-GB", { weekday: "long" })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Highlights */}
              {selectedPackage.highlights?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedPackage.highlights.slice(0, 3).map((h) => (
                    <span
                      key={h}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[10px] font-medium text-foreground/80"
                    >
                      <Check className="size-2.5 text-gold" strokeWidth={2.5} /> {h}
                    </span>
                  ))}
                </div>
              )}

              {/* Perforation + fare */}
              <div className="relative pt-4">
                <div className="absolute -left-6 top-0 size-4 rounded-full bg-background border border-border -translate-y-1/2" />
                <div className="absolute -right-6 top-0 size-4 rounded-full bg-background border border-border -translate-y-1/2" />
                <div className="absolute inset-x-0 top-0 border-t border-dashed border-border" />
                <div className="flex items-end justify-between">
                  <div>
                    <div className="eyebrow text-muted-foreground text-[9px]">Adult fare</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      per person · incl. tax
                    </div>
                  </div>
                  <span className="font-display text-2xl leading-none">
                    {formatBDT(selectedPackage.adult_price)}
                  </span>
                </div>
              </div>

              {!selectedPackage.is_bookable && (
                <div className="flex items-start gap-2.5 rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3 text-xs text-destructive font-medium">
                  <span className="size-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                  Booking is closed for this voyage — please pick another open date.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Calendar column ── */}
        <div className="lg:col-span-7">
          <AvailabilityCalendar
            selectedPackageId={data.packageId}
            initialMonth={selectedPackage?.start_date}
            onSelectPackage={(packageId) => update({ packageId, rooms: [] })}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Step 3: Cabin (rooms) ── */
function StepCabin({ data, update }: StepProps) {
  return (
    <div>
      <StepHeader
        step={2}
        title="Select your"
        highlight="room(s)."
        description="Live availability for your selected voyage. Booking for a big family? Tap more than one open cabin — they'll be one booking with a single payment."
      />
      <RoomPicker
        packageId={data.packageId}
        selectedRoomIds={data.rooms.map((r) => r.room.id)}
        onToggleRoom={(room) =>
          update({
            rooms: data.rooms.some((r) => r.room.id === room.id)
              ? removeRoom(data.rooms, room.id)
              : addRoom(data.rooms, room),
          })
        }
      />
    </div>
  );
}

/* ── Compact stepper control: − n + ── */
function Counter({
  value,
  min,
  max,
  onChange,
  decLabel,
  incLabel,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  decLabel: string;
  incLabel: string;
}) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={decLabel}
        className="size-11 rounded-full border border-border grid place-items-center hover:border-gold hover:text-gold-text transition-colors disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="w-7 text-center font-display text-xl tabular-nums leading-none">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={incLabel}
        className="size-11 rounded-full border border-border grid place-items-center hover:border-gold hover:text-gold-text transition-colors disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

/* ── Per-room guest counters: one card per selected cabin, each with its own
      adults + kids (the backend prices and limit-checks every room on its own
      occupancy). ── */
function RoomGuestsCard({
  index,
  selection,
  onChange,
}: {
  index: number;
  selection: RoomSelection;
  onChange: (patch: Partial<RoomSelection>) => void;
}) {
  const { room, adultCount, kidAges } = selection;
  const maxAdults = room.room_type.max_adults;
  const maxKids = room.room_type.max_kids;

  const setAdultCount = (n: number) => onChange({ adultCount: Math.max(1, Math.min(maxAdults, n)) });
  const setKidCount = (n: number) => {
    const count = Math.max(0, Math.min(maxKids, n));
    onChange({
      kidAges:
        count > kidAges.length
          ? [...kidAges, ...Array(count - kidAges.length).fill(5)]
          : kidAges.slice(0, count),
    });
  };
  const removeKid = (i: number) => onChange({ kidAges: kidAges.filter((_, idx) => idx !== i) });
  const setKidAge = (i: number, age: number) =>
    onChange({
      kidAges: kidAges.map((a, idx) => (idx === i ? Math.max(0, Math.min(17, age)) : a)),
    });

  return (
    <div className="rounded-2xl border border-border bg-card shadow-luxe divide-y divide-border">
      {/* Room label header */}
      <div className="flex items-center gap-3 px-5 py-3 bg-ocean/3">
        <div className="size-8 rounded-lg gradient-gold grid place-items-center shrink-0 shadow-luxe">
          <Bed className="size-4 text-ocean" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold leading-tight">
            Room {room.room_number} · {room.room_type.name}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Cabin {index + 1} of this booking · up to {maxAdults} adult
            {maxAdults > 1 ? "s" : ""}
            {maxKids ? ` + ${maxKids} kid${maxKids > 1 ? "s" : ""}` : ""}
          </div>
        </div>
      </div>

      {/* Adults */}
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-9 rounded-lg bg-ocean/8 grid place-items-center shrink-0">
            <Users className="size-4 text-ocean/70" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold leading-tight">Adults</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Ages 12+ · up to {maxAdults} in this room
            </div>
          </div>
        </div>
        <Counter
          value={adultCount}
          min={1}
          max={maxAdults}
          onChange={setAdultCount}
          decLabel="Fewer adults"
          incLabel="More adults"
        />
      </div>

      {/* Kids + inline ages */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-9 rounded-lg bg-ocean/8 grid place-items-center shrink-0">
              <Baby className="size-4 text-ocean/70" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold leading-tight">Kids</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Under 12 · up to {maxKids} in this room
              </div>
            </div>
          </div>
          <Counter
            value={kidAges.length}
            min={0}
            max={maxKids}
            onChange={setKidCount}
            decLabel="Fewer kids"
            incLabel="More kids"
          />
        </div>

        <AnimatePresence>
          {kidAges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 grid sm:grid-cols-2 gap-2">
                {kidAges.map((age, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 rounded-xl border border-border/70 bg-ocean/3 pl-3.5 pr-1.5 py-1.5"
                  >
                    <span className="text-xs font-medium text-foreground">Kid {i + 1}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setKidAge(i, age - 1)}
                        disabled={age <= 0}
                        aria-label="Younger"
                        className="size-11 rounded-lg border border-border bg-card grid place-items-center hover:border-gold hover:text-gold-text transition-colors disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
                      >
                        <Minus className="size-3" />
                      </button>
                      <div className="w-12 text-center whitespace-nowrap">
                        <input
                          type="number"
                          min={0}
                          max={17}
                          value={age}
                          aria-label={`Age of kid ${i + 1} in room ${room.room_number}, in years`}
                          onChange={(e) => setKidAge(i, Number(e.target.value))}
                          className="w-6 bg-transparent border-0 text-sm font-semibold text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-[10px] text-muted-foreground">yrs</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setKidAge(i, age + 1)}
                        disabled={age >= 17}
                        aria-label="Older"
                        className="size-11 rounded-lg border border-border bg-card grid place-items-center hover:border-gold hover:text-gold-text transition-colors disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
                      >
                        <Plus className="size-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeKid(i)}
                        aria-label={`Remove kid ${i + 1}`}
                        className="size-11 ml-2 rounded-lg grid place-items-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-[10px] text-muted-foreground">
                Fares vary by age — set each kid's age at the time of travel.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Guest counters (one card per room) + special requests — rendered inside
      the final step ── */
function GuestsCards({ data, update }: StepProps) {
  const requestsId = useId();

  return (
    <div className="space-y-4">
        {/* One guests card per selected cabin */}
        {data.rooms.map((selection, i) => (
          <RoomGuestsCard
            key={selection.room.id}
            index={i}
            selection={selection}
            onChange={(patch) =>
              update({ rooms: updateRoom(data.rooms, selection.room.id, patch) })
            }
          />
        ))}

        {/* Special requests — the label must be associated, not just adjacent:
            with no htmlFor the field's accessible name fell back to the
            placeholder, which also vanishes as soon as the user types. */}
        <div className="rounded-2xl border border-border bg-card shadow-luxe px-5 py-4">
          <label
            htmlFor={requestsId}
            className="eyebrow text-muted-foreground text-[10px] block mb-2"
          >
            Special requests <span className="normal-case font-normal">(optional)</span>
          </label>
          <textarea
            id={requestsId}
            rows={2}
            maxLength={1000}
            placeholder="Dietary requirements, anniversary arrangement, accessibility needs…"
            value={data.requests}
            onChange={(e) => update({ requests: e.target.value })}
            className="w-full bg-background border border-border rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 resize-none placeholder:text-muted-foreground/60 transition-all"
          />
        </div>

      <div className="flex items-center gap-2 px-1 text-[11px] text-muted-foreground">
        <Shield className="size-3.5 text-gold shrink-0" />
        Your personal information is encrypted and never shared with third parties.
      </div>
    </div>
  );
}

/* ── Step 5: Payment ── */
type StepPaymentProps = StepProps & {
  selectedPackage: import("@/lib/api/types").PackageDetail | undefined;
  quote: import("@/lib/api/types").PriceBreakdown | undefined;
  quoting: boolean;
  quoteError: ApiError | null;
  onConfirm: (contact: BookingContactValues) => void | Promise<void>;
  submitting: boolean;
};

function StepPayment({
  data,
  update,
  selectedPackage,
  quote,
  quoting,
  quoteError,
  onConfirm,
  submitting,
}: StepPaymentProps) {
  const partialAmountId = useId();
  const partialErrorId = `${partialAmountId}-error`;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingContactValues>({
    resolver: zodResolver(bookingContactSchema),
    defaultValues: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      requests: data.requests,
    },
  });

  function submit(values: BookingContactValues) {
    // `requests` is edited directly on this page via GuestsCards → data.requests,
    // so only the contact fields come from the form.
    update({
      name: values.name,
      email: values.email,
      phone: values.phone,
    });
    onConfirm(values);
  }

  const dueAmount = quote ? Number.parseFloat(quote.grand_total) : 0;
  const partialAmountNumber = Number.parseFloat(data.partialAmount || "0");
  const partialInvalid =
    data.paymentType === "partial" &&
    (!data.partialAmount || partialAmountNumber <= 0 || partialAmountNumber > dueAmount);

  const payNow =
    data.paymentType === "partial" && partialAmountNumber > 0 ? partialAmountNumber : dueAmount;
  const payLater = Math.max(0, dueAmount - payNow);

  const voyageTitle =
    selectedPackage?.marketing_title || `${selectedPackage?.ship.name ?? "MV Alaska"} Voyage`;

  return (
    <form onSubmit={handleSubmit(submit)}>
      <StepHeader
        step={3}
        title="Guests &"
        highlight="payment."
        description="Tell us who's sailing, add your contact details, then choose how you'd like to pay — all in one place."
      />

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* ── Left: guests + lead guest ── */}
        <div className="lg:col-span-7 space-y-6">
          {/* Who's sailing */}
          <GuestsCards data={data} update={update} />

          {/* Lead guest */}
          <div className="rounded-2xl border border-border bg-card shadow-luxe p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-ocean/8 grid place-items-center">
                <Users className="size-4 text-ocean/70" />
              </div>
              <div>
                <div className="font-display text-lg leading-tight">Lead guest</div>
                <div className="text-xs text-muted-foreground">
                  Your invoice and booking reference go here
                </div>
              </div>
            </div>
            <div className="grid gap-5">
              <FormField label="Full name" error={errors.name?.message} {...register("name")} />
              <div className="grid sm:grid-cols-2 gap-5">
                <FormField
                  label="Email address"
                  type="email"
                  icon={Mail}
                  error={errors.email?.message}
                  {...register("email")}
                />
                <FormField
                  label="Phone / WhatsApp"
                  icon={Phone}
                  error={errors.phone?.message}
                  {...register("phone")}
                />
              </div>
            </div>
          </div>

        </div>

        {/* ── Right: payment panel (sticky, elevated) ── */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-border bg-card shadow-luxe overflow-hidden lg:sticky lg:top-40">
            {/* Total headline */}
            <div className="relative bg-linear-to-br from-ocean via-ocean to-midnight px-5 py-4 overflow-hidden">
              <div className="absolute -right-6 -top-6 size-24 rounded-full bg-gold/10 blur-xl" />
              <Anchor className="absolute -right-2 -bottom-4 size-16 text-background/5 rotate-12" />
              <div className="relative">
                <div className="flex items-center gap-2 eyebrow text-gold-soft text-[9px]">
                  <Lock className="size-3" /> Secure checkout ·{" "}
                  {selectedPackage?.ship.name ?? "MV Alaska"}
                </div>
                <div className="mt-1.5 flex items-end justify-between gap-3">
                  <span className="font-display text-base text-background leading-tight truncate">
                    {voyageTitle}
                  </span>
                  <span className="font-display text-3xl leading-none shrink-0">
                    {quote ? formatBDT(quote.grand_total) : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Trip strip: dates + cabin + guests */}
            {selectedPackage && (
              <div className="px-5 pt-4 flex items-center justify-between gap-3">
                <div>
                  <div className="font-display text-lg leading-none text-foreground whitespace-nowrap">
                    {parseLocalDate(selectedPackage.start_date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </div>
                  <div className="eyebrow text-[8px] text-muted-foreground mt-1">Depart</div>
                </div>

                <div className="flex-1 flex flex-col items-center px-1">
                  <div className="relative w-full flex items-center">
                    <span className="size-1.5 rounded-full ring-1 ring-gold bg-background shrink-0" />
                    <span className="flex-1 border-t border-dashed border-gold/60" />
                    <span className="mx-1 grid place-items-center size-5 rounded-full gradient-gold shadow-luxe shrink-0">
                      <Anchor className="size-2.5 text-ocean" />
                    </span>
                    <span className="flex-1 border-t border-dashed border-gold/60" />
                    <span className="size-1.5 rounded-full bg-gold shrink-0" />
                  </div>
                  <div className="text-[8px] text-muted-foreground mt-1 uppercase tracking-[0.18em]">
                    {selectedPackage.days}D · {selectedPackage.nights}N
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-display text-lg leading-none text-foreground whitespace-nowrap">
                    {parseLocalDate(selectedPackage.end_date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </div>
                  <div className="eyebrow text-[8px] text-muted-foreground mt-1">Return</div>
                </div>
              </div>
            )}

            {/* Cabins + guests, plus a peek at a chosen room's photos */}
            <div className="mx-5 mt-3.5 mb-4 space-y-2">
              {(() => {
                const totalAdults = data.rooms.reduce((n, r) => n + r.adultCount, 0);
                const totalKids = data.rooms.reduce((n, r) => n + r.kidAges.length, 0);
                const withPhotos = data.rooms.find((r) => r.room.images?.length);
                return (
                  <>
                    <div className="rounded-lg bg-ocean/4 border border-border/60 px-3 py-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Bed className="size-3 text-gold" />
                        {data.rooms.length > 0
                          ? data.rooms.map((r) => r.room.room_number).join(", ")
                          : "—"}
                      </span>
                      <span className="size-1 rounded-full bg-border" />
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3 text-gold" />
                        {data.rooms.length} {data.rooms.length === 1 ? "Room" : "Rooms"}
                      </span>
                      <span className="size-1 rounded-full bg-border" />
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3 text-gold" />
                        {totalAdults} Adult{totalAdults > 1 ? "s" : ""}
                        {totalKids ? ` · ${totalKids} Kid${totalKids > 1 ? "s" : ""}` : ""}
                      </span>
                    </div>
                    {withPhotos && (
                      <RoomGallery
                        images={withPhotos.room.images}
                        roomNumber={withPhotos.room.room_number}
                      />
                    )}
                  </>
                );
              })()}
            </div>

            {/* Perforation */}
            <div className="relative">
              <div className="absolute -left-2.5 top-0 size-5 rounded-full bg-background border border-border -translate-y-1/2" />
              <div className="absolute -right-2.5 top-0 size-5 rounded-full bg-background border border-border -translate-y-1/2" />
              <div className="border-t border-dashed border-border" />
            </div>

            {/* Fare summary — the price is recomputed asynchronously whenever the
                guest counts change, so the region is announced politely rather
                than updating silently. The quote failure is an alert: it blocks
                checkout, so it must interrupt. */}
            <div className="px-5 pt-3.5 pb-1" aria-live="polite" aria-atomic="false">
              <div className="eyebrow text-gold-text text-[10px] mb-2.5">Fare summary</div>
              {quoting && (
                <div className="flex items-center gap-2 text-muted-foreground py-1 text-sm">
                  <Loader2 aria-hidden="true" className="size-4 animate-spin text-gold" />{" "}
                  Calculating price…
                </div>
              )}
              {quoteError && (
                <div role="alert" className="text-destructive text-xs">
                  {quoteError.fieldErrors
                    ? Object.values(quoteError.fieldErrors).flat().join(" ")
                    : quoteError.detail || "Couldn't calculate a price for this selection."}
                </div>
              )}
              {quote && (
                <div className="space-y-3 text-xs">
                  {/* One itemised group per cabin. Multi-room bookings get a
                      room heading; a single room reads as one flat group. */}
                  {quote.rooms.map((room, i) => (
                    <div key={i} className="space-y-1.5">
                      {quote.rooms.length > 1 && (
                        <div className="flex items-center justify-between text-[11px] font-semibold text-foreground">
                          <span>
                            {room.room_number ? `Room ${room.room_number}` : `Room ${i + 1}`}
                          </span>
                          <span className="text-gold-text">{formatBDT(room.total)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-muted-foreground">
                        <span>Room base price</span>
                        <span className="text-foreground font-medium">
                          {formatBDT(room.room_base)}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>
                          Adults ({room.adult_count} × {formatBDT(room.adult_price)})
                        </span>
                        <span className="text-foreground font-medium">
                          {formatBDT(room.adults_subtotal)}
                        </span>
                      </div>
                      {room.kids.map((kid, k) => (
                        <div key={k} className="flex justify-between text-muted-foreground">
                          <span>Kid (age {kid.age})</span>
                          <span className="text-foreground font-medium">
                            {formatBDT(kid.charge)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div className="pt-2.5 mt-1 border-t border-dashed border-border flex justify-between items-baseline">
                    <div className="font-medium text-foreground text-sm">
                      Total{quote.rooms.length > 1 ? ` · ${quote.rooms.length} rooms` : ""}
                    </div>
                    <div className="font-display text-xl text-gold-text">
                      {formatBDT(quote.grand_total)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-4 space-y-3.5">
              <div className="eyebrow text-muted-foreground text-[10px]">Payment option</div>
              <div className="grid grid-cols-2 gap-2">
                {(["full", "partial"] as const).map((type) => {
                  const checked = data.paymentType === type;
                  const OptionIcon = type === "full" ? CreditCard : Wallet;
                  return (
                    <label
                      key={type}
                      className={`focus-ring-within relative rounded-xl border p-3 cursor-pointer transition-all ${checked ? "border-gold bg-ocean/4 shadow-[0_0_0_1px_var(--gold)]" : "border-border hover:border-gold/50"}`}
                    >
                      <input
                        type="radio"
                        name="paymentType"
                        className="sr-only"
                        checked={checked}
                        onChange={() => update({ paymentType: type })}
                      />
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <OptionIcon
                            className={`size-3.5 shrink-0 ${checked ? "text-gold" : "text-muted-foreground"}`}
                          />
                          <span className="text-xs font-bold capitalize truncate">{type}</span>
                          {type === "full" && (
                            <span className="rounded-full bg-gold/15 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-[0.1em] text-gold-text shrink-0">
                              Popular
                            </span>
                          )}
                        </div>
                        <span
                          className={`size-3.5 rounded-full border-2 shrink-0 grid place-items-center transition-all ${checked ? "border-gold bg-gold" : "border-border"}`}
                        >
                          {checked && <span className="size-1 rounded-full bg-ocean" />}
                        </span>
                      </div>
                      <span className="mt-1 block text-[10px] text-muted-foreground leading-snug">
                        {type === "full" ? "Pay the entire amount now" : "Part now, rest on boarding"}
                      </span>
                    </label>
                  );
                })}
              </div>

              {data.paymentType === "partial" && (
                <div className="p-3 rounded-xl bg-ocean/3 border border-border space-y-2.5">
                  <label
                    htmlFor={partialAmountId}
                    className="eyebrow text-muted-foreground text-[10px] block"
                  >
                    Amount to pay now — max {quote ? formatBDT(quote.grand_total) : "—"}
                  </label>
                  <div className="relative">
                    <span
                      aria-hidden="true"
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                    >
                      ৳
                    </span>
                    <input
                      id={partialAmountId}
                      type="number"
                      min={0}
                      max={dueAmount || undefined}
                      value={data.partialAmount}
                      onChange={(e) => update({ partialAmount: e.target.value })}
                      placeholder="5000"
                      aria-invalid={partialInvalid ? true : undefined}
                      aria-describedby={partialInvalid ? partialErrorId : undefined}
                      className="w-full bg-background border border-border rounded-lg py-2.5 pl-7 pr-3 text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
                    />
                  </div>
                  {dueAmount > 0 && (
                    <div className="flex gap-2">
                      {[25, 50, 75].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() =>
                            update({ partialAmount: String(Math.round((dueAmount * pct) / 100)) })
                          }
                          className="flex-1 min-h-11 rounded-lg border border-border py-1.5 text-[11px] font-semibold text-muted-foreground hover:border-gold hover:text-gold-text transition-colors"
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  )}
                  {partialInvalid && (
                    <div id={partialErrorId} role="alert" className="text-xs text-destructive">
                      Enter an amount between 1 and the total.
                    </div>
                  )}
                </div>
              )}

              {/* Pay now / later breakdown */}
              {quote && (
                <div className="rounded-xl bg-ocean/5 border border-ocean/10 divide-y divide-border/60">
                  <div className="flex justify-between items-baseline px-3.5 py-2.5">
                    <span className="text-xs text-muted-foreground">Pay now</span>
                    <span className="font-display text-lg text-gold-text">
                      {formatBDT(String(payNow))}
                    </span>
                  </div>
                  {payLater > 0 && (
                    <div className="flex justify-between px-3.5 py-2 text-[11px] text-muted-foreground">
                      <span>Due on boarding</span>
                      <span className="font-medium text-foreground">
                        {formatBDT(String(payLater))}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !quote || partialInvalid}
                className="w-full flex items-center justify-center gap-2 px-8 py-3.5 rounded-full gradient-gold text-ocean text-[11px] uppercase tracking-[0.2em] font-semibold shadow-luxe hover-lift disabled:opacity-40 disabled:pointer-events-none"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowRight className="size-3.5" />
                )}
                {submitting ? "Taking you to secure payment…" : "Confirm & Pay"}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
                <Shield className="size-3.5 text-gold shrink-0" />
                Secured by SSLCommerz — bKash, cards &amp; more.
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

/* ── Confirmation screen ── */
function ConfirmScreen({ booking, contactName }: { booking: BookingPublic; contactName: string }) {
  const bookedOn = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const breakdown = booking.price_breakdown;
  const hasDue = booking.due_amount !== "0.00";

  // A booking may hold several cabins — summarise them for the recap/receipt.
  const roomNumbers = booking.rooms.map((r) => r.room_number).join(", ");
  const totalAdults = booking.rooms.reduce((n, r) => n + r.adult_count, 0);
  const totalKids = booking.rooms.reduce((n, r) => n + r.kid_details.length, 0);
  const roomsLabel = booking.rooms.length > 1 ? "Rooms" : "Room";

  // The official invoice PDF, if one has been issued (i.e. money has been
  // received). Until now the customer had no way to obtain it at all — the
  // "Download Receipt" button below only ever opened a browser print dialog on
  // an HTML card, which is not the sealed invoice they were emailed.
  const { data: invoices } = useQuery({
    queryKey: ["booking-invoices", booking.booking_code],
    queryFn: () => getBookingInvoices(booking.booking_code),
  });
  const latestInvoice = invoices?.[0];

  const waMessage = encodeURIComponent(
    `🚢 *MV Alaska Cruise — Booking Confirmed*\n\n` +
      `Ref: *${booking.booking_code}*\n` +
      `Name: ${booking.customer_name}\n` +
      `${roomsLabel}: ${roomNumbers}\n` +
      `Guests: ${totalAdults} adult(s), ${totalKids} kid(s)\n` +
      `Total: ${formatBDT(booking.total_amount)}\n` +
      `Due: ${formatBDT(booking.due_amount)}\n` +
      `Phone: ${booking.phone}\n\n` +
      `Thank you!`,
  );
  const waUrl = `https://wa.me/8801712823482?text=${waMessage}`;

  // Dedicated print markup (styled by the print CSS below) so the downloaded
  // receipt is branded instead of unstyled app DOM.
  const handlePrint = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    // Escape values before writing them into the receipt HTML — special_requests
    // is free-form customer text and must never inject markup into the document.
    const esc = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const rows = (pairs: [string, string][]) =>
      pairs
        .map(([k, v]) => `<div class="row"><span>${k}</span><span>${esc(v)}</span></div>`)
        .join("");
    win.document.write(`
      <!DOCTYPE html><html><head>
      <meta charset="utf-8"/>
      <title>Booking Receipt — ${booking.booking_code}</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:Georgia,serif;background:#fff;color:#1a2e25;padding:48px;max-width:700px;margin:auto}
        .header{display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #c9a84c;padding-bottom:20px;margin-bottom:28px}
        .brand h1{font-size:22px;letter-spacing:4px;color:#064e3b}
        .brand p{font-size:10px;letter-spacing:3px;color:#c9a84c;text-transform:uppercase;margin-top:2px}
        .issued{font-size:11px;color:#888;text-align:right}
        .ref{background:#064e3b;color:#fff;padding:10px 20px;border-radius:8px;display:inline-block;margin-bottom:8px}
        .ref span{font-size:10px;letter-spacing:2px;text-transform:uppercase;opacity:.7}
        .ref strong{display:block;font-size:20px;letter-spacing:3px;margin-top:2px}
        .badge{display:inline-block;background:#f0f9f6;border:1px solid #c9a84c;color:#064e3b;padding:4px 12px;border-radius:20px;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin:0 0 24px 12px;vertical-align:top}
        .section{margin-bottom:24px}
        .section-title{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#c9a84c;margin-bottom:10px;border-bottom:1px solid #e5e0d0;padding-bottom:4px}
        .row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px;border-bottom:1px solid #f0ece0}
        .row span:first-child{color:#5a7a6a}
        .row span:last-child{font-weight:600}
        .total-row{display:flex;justify-content:space-between;padding:14px 0 6px;font-size:18px;border-top:2px solid #c9a84c;margin-top:8px}
        .total-row span:last-child{color:#c9a84c;font-size:22px}
        .footer{margin-top:40px;border-top:1px solid #e5e0d0;padding-top:16px;font-size:11px;color:#888;text-align:center}
        @media print{body{padding:24px}}
      </style>
      </head><body>
        <div class="header">
          <div class="brand"><h1>M.V. ALASKA</h1><p>Cruise Ship</p></div>
          <div class="issued">Issued ${bookedOn}</div>
        </div>
        <div class="ref"><span>Booking reference</span><strong>${booking.booking_code}</strong></div>
        <span class="badge">${booking.status.replace("_", " ")}</span>
        <div class="section">
          <div class="section-title">Voyage details</div>
          ${rows([
            [roomsLabel, roomNumbers],
            ["Departure", booking.package.start_date],
            ["Return", booking.package.end_date],
            ["Adults", String(totalAdults)],
            ["Kids", String(totalKids)],
            ...(booking.special_requests
              ? ([["Special requests", booking.special_requests]] as [string, string][])
              : []),
          ])}
        </div>
        <div class="section">
          <div class="section-title">Guest &amp; contact</div>
          ${rows([
            ["Name", booking.customer_name || "—"],
            ["Email", booking.email || "—"],
            ["Phone", booking.phone || "—"],
          ])}
        </div>
        <div class="section">
          <div class="section-title">Payment summary</div>
          ${
            breakdown
              ? breakdown.rooms
                  .map((room, i) => {
                    const heading =
                      breakdown.rooms.length > 1
                        ? `<div class="row"><span><strong>Room ${room.room_number ?? i + 1}</strong></span><span>${formatBDT(room.total)}</span></div>`
                        : "";
                    return (
                      heading +
                      rows([
                        ["Room base price", formatBDT(room.room_base)],
                        [
                          `Adults (${room.adult_count} × ${formatBDT(room.adult_price)})`,
                          formatBDT(room.adults_subtotal),
                        ],
                        ...room.kids.map(
                          (kid) =>
                            [`Kid (age ${kid.age})`, formatBDT(kid.charge)] as [string, string],
                        ),
                      ])
                    );
                  })
                  .join("")
              : ""
          }
          ${rows([
            ["Paid", formatBDT(booking.paid_amount)],
            ["Due", formatBDT(booking.due_amount)],
          ])}
          <div class="total-row"><span>Total amount</span><span>${formatBDT(booking.total_amount)}</span></div>
        </div>
        <div class="footer">
          <p>A confirmation email with your invoice will follow after payment.</p>
          <p>+880 1712-823482 &nbsp;|&nbsp; mvalaskacruise@gmail.com</p>
        </div>
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 400);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-64 overflow-hidden bg-ocean">
        <img
          src={img109}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-linear-to-t from-ocean via-ocean/70 to-ocean/40" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 pt-10">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="size-16 rounded-full gradient-gold grid place-items-center shadow-luxe mb-4"
          >
            <Check className="size-8 text-ocean" strokeWidth={2.5} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="eyebrow text-gold-soft mb-2"
          >
            Reservation created
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="font-display text-4xl md:text-5xl text-background font-light"
          >
            Bon voyage{contactName ? `, ${contactName.split(" ")[0]}` : ""}.
          </motion.h1>
        </div>
      </div>

      <div className="container-luxe max-w-3xl py-16 space-y-6">
        {/* What happens next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <div className="eyebrow text-gold-text text-[10px] mb-5">What happens next</div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                n: "1",
                title: "Reservation held",
                text: `Your ${booking.rooms.length > 1 ? "rooms" : "room"} ${roomNumbers} ${
                  booking.rooms.length > 1 ? "are" : "is"
                } reserved under ref ${booking.booking_code}.`,
                done: true,
              },
              {
                n: "2",
                title: hasDue ? "Complete payment" : "Payment received",
                text: hasDue
                  ? "Pay in full or partially via bKash, cards & more."
                  : "Your payment has been received in full.",
                done: !hasDue,
              },
              {
                n: "3",
                title: "Invoice by email",
                text: "Your PDF invoice arrives automatically after payment.",
                done: false,
              },
            ].map((s) => (
              <div key={s.n} className="flex gap-3">
                <div
                  className={`size-7 rounded-full grid place-items-center shrink-0 text-xs font-bold ${
                    s.done ? "gradient-gold text-ocean" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s.done ? <Check className="size-3.5" strokeWidth={3} /> : s.n}
                </div>
                <div>
                  <div className="text-sm font-semibold leading-tight">{s.title}</div>
                  <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.text}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pay now CTA */}
        {hasDue && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.62 }}
            className="rounded-2xl border border-gold/40 bg-ocean/5 p-6 flex items-center justify-between gap-4 flex-wrap"
          >
            <div>
              <div className="eyebrow text-gold-text text-[9px] mb-1">Balance outstanding</div>
              <div className="font-display text-2xl text-foreground leading-none">
                {formatBDT(booking.due_amount)}
              </div>
              <div className="text-xs text-muted-foreground mt-1.5">
                Complete your payment to secure this booking.
              </div>
            </div>
            <Link
              to="/booking/confirmation/$code"
              params={{ code: booking.booking_code }}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full gradient-gold text-ocean text-xs uppercase tracking-[0.2em] font-semibold shadow-luxe hover-lift"
            >
              Pay Now <ArrowRight className="size-3.5" />
            </Link>
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid sm:grid-cols-2 gap-4"
        >
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold text-sm transition-colors shadow-lg hover-lift"
          >
            <MessageCircle className="size-5" />
            Send via WhatsApp
          </a>
          {latestInvoice ? (
            // The real, sealed invoice PDF — authorised by its own token.
            <a
              href={latestInvoice.download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 py-4 rounded-2xl border border-border bg-card text-foreground hover:border-gold hover:text-gold-text font-semibold text-sm transition-colors hover-lift"
            >
              <Download className="size-5" />
              Download Invoice ({latestInvoice.number})
            </a>
          ) : (
            // No invoice is issued until a payment settles, so before then the
            // best we can offer is a printable summary of the booking.
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-3 py-4 rounded-2xl border border-border bg-card text-foreground hover:border-gold hover:text-gold-text font-semibold text-sm transition-colors hover-lift"
            >
              <Download className="size-5" />
              Print Booking Summary
            </button>
          )}
        </motion.div>

        {/* Receipt card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-2xl border border-border bg-card shadow-luxe overflow-hidden"
        >
          {/* Receipt header */}
          <div className="p-7 md:p-8 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src={logo} alt="MV Alaska" className="h-14 w-auto object-contain" />
              <div>
                <div className="font-display text-2xl tracking-widest">M.V. ALASKA</div>
                <div className="eyebrow text-gold-text text-[10px] mt-0.5">Cruise Ship</div>
              </div>
            </div>
            <div className="sm:text-right">
              <div className="eyebrow text-[10px] text-muted-foreground">Booking reference</div>
              <div className="font-display text-3xl text-ocean mt-1 tracking-wide">
                {booking.booking_code}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Issued {bookedOn}</div>
            </div>
          </div>

          {/* Status badge */}
          <div className="px-7 md:px-8 pt-6 pb-2">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold capitalize">
              <span className="size-2 rounded-full bg-emerald-500" />{" "}
              {booking.status.replace("_", " ")}
            </span>
          </div>

          {/* Details grid */}
          <div className="px-7 md:px-8 py-6 grid sm:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="eyebrow text-gold-text text-[10px]">Voyage details</div>
              {[
                { label: roomsLabel, value: roomNumbers },
                { label: "Departure", value: booking.package.start_date },
                { label: "Return", value: booking.package.end_date },
                { label: "Adults", value: String(totalAdults) },
                { label: "Kids", value: String(totalKids) },
              ].map((r) => (
                <div
                  key={r.label}
                  className="flex justify-between text-sm border-b border-border/50 pb-2"
                >
                  <span className="text-muted-foreground">{r.label}</span>
                  <span className="font-medium">{r.value}</span>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="eyebrow text-gold-text text-[10px]">Guest &amp; contact</div>
              {[
                { label: "Name", value: booking.customer_name || "—" },
                { label: "Email", value: booking.email || "—" },
                { label: "Phone", value: booking.phone || "—" },
              ].map((r) => (
                <div
                  key={r.label}
                  className="flex justify-between text-sm border-b border-border/50 pb-2"
                >
                  <span className="text-muted-foreground">{r.label}</span>
                  <span className="font-medium text-right max-w-45 truncate">{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment summary */}
          <div className="mx-7 md:mx-8 mb-8 rounded-xl border border-border overflow-hidden">
            <div className="bg-ocean/5 px-5 py-3 border-b border-border eyebrow text-[10px] text-muted-foreground">
              Payment summary
            </div>
            <div className="p-5 space-y-2 text-sm">
              {breakdown &&
                breakdown.rooms.map((room, i) => (
                  <div key={i} className="space-y-2">
                    {breakdown.rooms.length > 1 && (
                      <div className="flex justify-between text-foreground font-semibold text-[13px]">
                        <span>Room {room.room_number ?? i + 1}</span>
                        <span className="text-gold-text">{formatBDT(room.total)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-muted-foreground">
                      <span>Room base price</span>
                      <span>{formatBDT(room.room_base)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>
                        Adults ({room.adult_count} × {formatBDT(room.adult_price)})
                      </span>
                      <span>{formatBDT(room.adults_subtotal)}</span>
                    </div>
                    {room.kids.map((kid, k) => (
                      <div key={k} className="flex justify-between text-muted-foreground">
                        <span>Kid (age {kid.age})</span>
                        <span>{formatBDT(kid.charge)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              <div className="pt-3 mt-1 border-t border-border flex justify-between items-baseline">
                <div>
                  <div className="font-semibold text-foreground">Total amount</div>
                  <div className="text-xs text-muted-foreground">
                    Paid: {formatBDT(booking.paid_amount)}
                  </div>
                </div>
                <div className="font-display text-2xl text-gold-text">
                  {formatBDT(booking.total_amount)}
                </div>
              </div>
              <div className="flex justify-between items-baseline text-sm">
                <span className="text-muted-foreground">Due amount</span>
                <span className="font-semibold">{formatBDT(booking.due_amount)}</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="px-7 md:px-8 pb-8 text-xs text-muted-foreground text-center space-y-1">
            <p>A confirmation email with your invoice will follow after payment.</p>
            <p>📞 +880 1712-823482 &nbsp;|&nbsp; ✉ mvalaskacruise@gmail.com</p>
          </div>
        </motion.div>

        {/* Bottom nav */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row gap-3 justify-center pt-2"
        >
          <Link
            to="/"
            className="px-8 py-3 rounded-full border border-border text-sm text-foreground hover:border-gold hover:text-gold-text transition-colors text-center"
          >
            ← Return Home
          </Link>
          <Link
            to="/contact"
            className="px-8 py-3 rounded-full bg-ocean text-background text-sm text-center hover:bg-ocean/80 transition-colors"
          >
            Contact Concierge
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

/* ── react-hook-form-registered field ──
 *
 * The label must be *associated* with the input, not merely sitting above it:
 * a bare <label> with no htmlFor leaves the input with an empty accessible
 * name, so a screen reader announces "edit, blank" instead of "Full name".
 * The error is likewise wired via aria-describedby + role="alert", so it is
 * announced on submit rather than only appearing on screen. */
const FormField = React.forwardRef<
  HTMLInputElement,
  {
    label: string;
    type?: string;
    icon?: React.ElementType;
    error?: string;
  } & React.InputHTMLAttributes<HTMLInputElement>
>(function FormField({ label, type = "text", icon: Icon, error, ...props }, ref) {
  const id = React.useId();
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="eyebrow text-muted-foreground text-[10px] block mb-2">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            aria-hidden="true"
            className="size-4 text-gold absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          />
        )}
        <input
          id={id}
          ref={ref}
          type={type}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`w-full bg-background border rounded-xl py-3 text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 placeholder:text-muted-foreground/50 transition-all ${Icon ? "pl-10 pr-4" : "px-4"} ${error ? "border-destructive" : "border-border"}`}
          {...props}
        />
      </div>
      {error && (
        <div id={errorId} role="alert" className="mt-1 text-xs text-destructive">
          {error}
        </div>
      )}
    </div>
  );
});
