/**
 * Every piece of text the staff dashboard shows, in both languages.
 *
 * One flat object rather than nested groups: a nested shape reads well until
 * you need to find where "Save changes" is defined, and then it reads badly
 * forever. The `area.thing` key prefix does the grouping without the nesting.
 *
 * English is the fallback for anything not yet translated, so a missing Bangla
 * string leaves a usable dashboard rather than an empty button.
 */
export const STRINGS = {
  // ── Shell & navigation ──────────────────────────────────────────────────
  "nav.overview": { en: "Overview", bn: "সারসংক্ষেপ" },
  "nav.bookings": { en: "Bookings", bn: "বুকিং" },
  "nav.messages": { en: "Messages", bn: "বার্তা" },
  "nav.refunds": { en: "Refunds", bn: "ফেরত" },
  "nav.packages": { en: "Packages", bn: "প্যাকেজ" },
  "nav.rooms": { en: "Rooms", bn: "রুম" },
  "nav.cabins": { en: "Cabins", bn: "কেবিন" },
  "nav.gallery": { en: "Gallery", bn: "গ্যালারি" },
  "nav.roomSettings": { en: "Room settings", bn: "রুম সেটিংস" },
  "nav.foodMenu": { en: "Food Menu", bn: "খাবারের তালিকা" },
  "nav.settings": { en: "Settings", bn: "সেটিংস" },
  "shell.dashboard": { en: "Staff Dashboard", bn: "স্টাফ ড্যাশবোর্ড" },
  "shell.signedInAs": { en: "Signed in as", bn: "সাইন ইন করেছেন" },
  "shell.logout": { en: "Log out", bn: "লগ আউট" },
  "shell.language": { en: "Language", bn: "ভাষা" },

  // ── Words that recur on every page ──────────────────────────────────────
  "common.save": { en: "Save changes", bn: "পরিবর্তন সংরক্ষণ" },
  "common.saved": { en: "Saved", bn: "সংরক্ষিত" },
  "common.cancel": { en: "Cancel", bn: "বাতিল" },
  "common.edit": { en: "Edit", bn: "সম্পাদনা" },
  "common.delete": { en: "Delete", bn: "মুছুন" },
  "common.close": { en: "Close", bn: "বন্ধ" },
  "common.loading": { en: "Loading…", bn: "লোড হচ্ছে…" },
  "common.unsaved": { en: "Unsaved", bn: "অসংরক্ষিত" },
  "common.search": { en: "Search", bn: "খুঁজুন" },
  "common.all": { en: "All", bn: "সব" },
  "common.none": { en: "None", bn: "নেই" },
  "common.previous": { en: "Previous", bn: "আগের" },
  "common.next": { en: "Next", bn: "পরের" },
  "common.somethingWrong": {
    en: "Something went wrong. Please try again.",
    bn: "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
  },

  // ── Booking status, shared by several pages ─────────────────────────────
  "status.pending": { en: "Pending", bn: "অপেক্ষমাণ" },
  "status.partially_paid": { en: "Partially paid", bn: "আংশিক পরিশোধিত" },
  "status.fully_paid": { en: "Fully paid", bn: "সম্পূর্ণ পরিশোধিত" },
  "status.cancelled": { en: "Cancelled", bn: "বাতিল" },
  "status.completed": { en: "Completed", bn: "সম্পন্ন" },

  // ── Overview ────────────────────────────────────────────────────────────
  "overview.title": { en: "Overview", bn: "সারসংক্ষেপ" },
  "overview.subtitle": {
    en: "Live snapshot of bookings and collections.",
    bn: "বুকিং আর আদায়ের এখনকার অবস্থা।",
  },
  "overview.loading": { en: "Loading overview…", bn: "সারসংক্ষেপ আসছে…" },

  "overview.upcomingPackages": { en: "Upcoming packages", bn: "আসন্ন প্যাকেজ" },
  "overview.upcomingHint": { en: "Open & departing soon", bn: "বুকিং খোলা, শিগগিরই ছাড়বে" },
  "overview.activeBookings": { en: "Active bookings", bn: "চলমান বুকিং" },
  "overview.totalCollected": { en: "Total collected", bn: "মোট আদায়" },
  "overview.outstandingDue": { en: "Outstanding due", bn: "বকেয়া" },
  "overview.dueHint": { en: "To collect on the ship", bn: "জাহাজে গিয়ে তুলতে হবে" },
  "overview.collectionRate": { en: "Collection rate", bn: "আদায়ের হার" },
  "overview.collectionRateHint": { en: "Paid vs. expected", bn: "পাওয়া টাকা বনাম পাওনা" },
  "overview.awaitingPayment": { en: "Awaiting payment", bn: "টাকার অপেক্ষায়" },
  "overview.awaitingHint": { en: "Pending bookings", bn: "এখনো টাকা আসেনি" },
  "overview.refundsOwed": { en: "Refunds owed", bn: "ফেরত দিতে হবে" },
  "overview.refundsNone": { en: "No refunds pending", bn: "কোনো ফেরত বাকি নেই" },
  "overview.refundLiability": { en: "Refund liability", bn: "ফেরতের পরিমাণ" },
  "overview.cancellationRequests": { en: "Cancellation requests", bn: "বাতিলের অনুরোধ" },
  "overview.nothingPending": {
    en: "Nothing awaiting a decision",
    bn: "সিদ্ধান্তের অপেক্ষায় কিছু নেই",
  },

  "overview.collectionByPackage": { en: "Collection by package (BDT)", bn: "প্যাকেজভিত্তিক আদায় (৳)" },
  "overview.bookingsByStatus": { en: "Bookings by status", bn: "অবস্থা অনুযায়ী বুকিং" },
  "overview.fleetBreakdown": { en: "Fleet breakdown", bn: "জাহাজভিত্তিক হিসাব" },
  "overview.recentBookings": { en: "Recent bookings", bn: "সাম্প্রতিক বুকিং" },
  "overview.recentPayments": { en: "Recent payments", bn: "সাম্প্রতিক পেমেন্ট" },
  "overview.recentPackages": { en: "Recent packages", bn: "সাম্প্রতিক প্যাকেজ" },
  "overview.noPackages": { en: "No packages yet.", bn: "এখনো কোনো প্যাকেজ নেই।" },
  "overview.noBookings": { en: "No bookings yet.", bn: "এখনো কোনো বুকিং নেই।" },

  "label.collected": { en: "Collected", bn: "আদায়" },
  "label.due": { en: "Due", bn: "বকেয়া" },
  "label.upcoming": { en: "Upcoming", bn: "আসন্ন" },
  "label.occupancy": { en: "Occupancy", bn: "কেবিন পূর্ণতা" },
  "label.bookings": { en: "Bookings", bn: "বুকিং" },
  "label.total": { en: "Total", bn: "মোট" },

  // Hints that carry a figure. {braces} are filled at render time.
  "overview.ofExpected": { en: "of {amount} expected", bn: "প্রত্যাশিত {amount}-এর মধ্যে" },
  "overview.todayWeek": { en: "{today} today · {week} this week", bn: "আজ {today} · এ সপ্তাহে {week}" },
  "overview.toReturn": {
    en: "{amount} to return — call the customers",
    bn: "{amount} ফেরত দিতে হবে — গ্রাহকদের ফোন করুন",
  },
  "overview.promisedPayouts": {
    en: "{count} payout(s) promised, not yet sent",
    bn: "{count}টি ফেরত কথা দেওয়া আছে, এখনো পাঠানো হয়নি",
  },
  "overview.wouldBeRefunded": { en: "{amount} would be refunded", bn: "{amount} ফেরত যাবে" },
} as const;

export type StringKey = keyof typeof STRINGS;
