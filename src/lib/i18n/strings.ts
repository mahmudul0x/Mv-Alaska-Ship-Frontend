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
    en: "Today at a glance across every sailing.",
    bn: "সব সেইলিং মিলিয়ে আজকের এক নজরে চিত্র।",
  },
} as const;

export type StringKey = keyof typeof STRINGS;
