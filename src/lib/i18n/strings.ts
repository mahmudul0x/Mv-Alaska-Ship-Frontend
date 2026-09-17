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
  "shell.logout": { en: "Log out", bn: "লগ আউট" },

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

  "overview.collectionByPackage": {
    en: "Collection by package (BDT)",
    bn: "প্যাকেজভিত্তিক আদায় (৳)",
  },
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
  "overview.todayWeek": {
    en: "{today} today · {week} this week",
    bn: "আজ {today} · এ সপ্তাহে {week}",
  },
  "overview.toReturn": {
    en: "{amount} to return — call the customers",
    bn: "{amount} ফেরত দিতে হবে — গ্রাহকদের ফোন করুন",
  },
  "overview.promisedPayouts": {
    en: "{count} payout(s) promised, not yet sent",
    bn: "{count}টি ফেরত কথা দেওয়া আছে, এখনো পাঠানো হয়নি",
  },
  "overview.wouldBeRefunded": { en: "{amount} would be refunded", bn: "{amount} ফেরত যাবে" },

  // ── Login ───────────────────────────────────────────────────────────────
  "login.username": { en: "Username", bn: "ইউজারনেম" },
  "login.password": { en: "Password", bn: "পাসওয়ার্ড" },
  "login.signIn": { en: "Sign in", bn: "সাইন ইন" },
  "login.failed": {
    en: "Login failed. Check your credentials.",
    bn: "লগইন হয়নি। ইউজারনেম আর পাসওয়ার্ড মিলিয়ে দেখুন।",
  },
  "login.staffOnly": {
    en: "Staff access only · MV Alaska Cruise Ship",
    bn: "শুধু স্টাফদের জন্য · এম.ভি. আলাস্কা ক্রুজ শিপ",
  },

  // ── Messages ────────────────────────────────────────────────────────────
  "messages.title": { en: "Messages", bn: "বার্তা" },
  "messages.subtitle": {
    en: "Inquiries submitted through the website contact form.",
    bn: "ওয়েবসাইটের যোগাযোগ ফর্ম থেকে আসা বার্তা।",
  },
  "messages.markRead": { en: "Mark read", bn: "পড়া হয়েছে" },
  "messages.archive": { en: "Archive", bn: "সংরক্ষণাগারে" },
  "messages.unarchive": { en: "Unarchive", bn: "ফিরিয়ে আনুন" },
  "messages.archived": { en: "Archived", bn: "সংরক্ষিত" },
  "messages.deleted": { en: "Message deleted.", bn: "বার্তাটি মুছে ফেলা হয়েছে।" },
  "messages.new": { en: "New", bn: "নতুন" },
  "messages.read": { en: "Read", bn: "পড়া হয়েছে" },

  // ── Gallery ─────────────────────────────────────────────────────────────
  "gallery.title": { en: "Gallery", bn: "গ্যালারি" },
  "gallery.subtitle": {
    en: "The photos shown on the public Gallery page — upload, write a caption on each, reorder, hide or delete.",
    bn: "পাবলিক গ্যালারি পেজে যে ছবিগুলো দেখায় — আপলোড করুন, ক্যাপশন লিখুন, ক্রম বদলান, লুকান বা মুছুন।",
  },
  "gallery.shipFor": { en: "Ship new uploads belong to", bn: "নতুন ছবি কোন জাহাজের" },
  "gallery.noShip": {
    en: "No ship available to attach photos to.",
    bn: "ছবি যোগ করার মতো কোনো জাহাজ নেই।",
  },
  "gallery.caption": { en: "Write a caption for this photo…", bn: "এই ছবির জন্য ক্যাপশন লিখুন…" },
  "gallery.captionSaved": { en: "Caption saved.", bn: "ক্যাপশন সংরক্ষিত হয়েছে।" },
  "gallery.showOnSite": { en: "Show on website", bn: "ওয়েবসাইটে দেখান" },
  "gallery.hideFromSite": { en: "Hide from website", bn: "ওয়েবসাইট থেকে লুকান" },
  "gallery.nowVisible": {
    en: "Photo is now visible on the website.",
    bn: "ছবিটি এখন ওয়েবসাইটে দেখা যাচ্ছে।",
  },
  "gallery.nowHidden": {
    en: "Photo hidden from the website.",
    bn: "ছবিটি ওয়েবসাইট থেকে লুকানো হয়েছে।",
  },
  "gallery.deletePhoto": { en: "Delete photo", bn: "ছবি মুছুন" },
  "gallery.photoDeleted": { en: "Photo deleted.", bn: "ছবি মুছে ফেলা হয়েছে।" },
  "gallery.confirmDelete": {
    en: "Delete this photo from the gallery? This cannot be undone.",
    bn: "গ্যালারি থেকে এই ছবিটি মুছে ফেলবেন? এটি আর ফেরানো যাবে না।",
  },
  "gallery.photoAlt": { en: "Gallery photo", bn: "গ্যালারির ছবি" },

  // ── Bookings ────────────────────────────────────────────────────────────
  "bk.title": { en: "Bookings", bn: "বুকিং" },
  "bk.searchPlaceholder": {
    en: "Search code / name / phone…",
    bn: "কোড / নাম / ফোন দিয়ে খুঁজুন…",
  },
  "bk.exportCsv": { en: "Export CSV", bn: "CSV নামান" },
  "bk.newBooking": { en: "New booking", bn: "নতুন বুকিং" },
  "bk.newManualBooking": { en: "New manual booking", bn: "হাতে নতুন বুকিং" },
  "bk.nothingToExport": { en: "Nothing to export.", bn: "নামানোর মতো কিছু নেই।" },

  "bk.totalBookings": { en: "Total bookings", bn: "মোট বুকিং" },
  "bk.collected": { en: "Collected", bn: "আদায়" },
  "bk.outstandingDue": { en: "Outstanding due", bn: "বকেয়া" },
  "bk.fullyPaidRate": { en: "Fully-paid rate", bn: "সম্পূর্ণ পরিশোধের হার" },

  "bk.allPackages": { en: "All packages", bn: "সব প্যাকেজ" },
  "bk.allStatuses": { en: "All statuses", bn: "সব অবস্থা" },
  "bk.dueOnly": { en: "Due only", bn: "শুধু বকেয়া" },
  "bk.refundsOwed": { en: "Refunds owed", bn: "ফেরত বাকি" },
  "bk.clear": { en: "Clear", bn: "মুছুন" },
  "bk.noMatch": {
    en: "No bookings match these filters.",
    bn: "এই ছাঁকনিতে কোনো বুকিং মেলেনি।",
  },

  "bk.code": { en: "Code", bn: "কোড" },
  "bk.customer": { en: "Customer", bn: "গ্রাহক" },
  "bk.room": { en: "Room", bn: "রুম" },
  "bk.pax": { en: "Pax", bn: "যাত্রী" },
  "bk.paidProgress": { en: "Paid / Progress", bn: "পরিশোধ / অগ্রগতি" },
  "bk.statusCol": { en: "Status", bn: "অবস্থা" },
  "bk.created": { en: "Created", bn: "তৈরি" },
  "bk.refundOwed": { en: "Refund owed", bn: "ফেরত বাকি" },

  "bk.bookingCode": { en: "Booking code", bn: "বুকিং কোড" },
  "bk.phone": { en: "Phone", bn: "ফোন" },
  "bk.email": { en: "Email", bn: "ইমেইল" },
  "bk.package": { en: "Package", bn: "প্যাকেজ" },
  "bk.total": { en: "Total", bn: "মোট" },
  "bk.paid": { en: "Paid", bn: "পরিশোধিত" },
  "bk.due": { en: "Due", bn: "বকেয়া" },
  "bk.passport": { en: "Passport", bn: "পাসপোর্ট" },
  "bk.reason": { en: "Reason", bn: "কারণ" },
  "bk.note": { en: "Note", bn: "মন্তব্য" },

  "bk.collectionProgress": { en: "Collection progress", bn: "আদায়ের অগ্রগতি" },
  "bk.foreignManifest": {
    en: "Foreign nationals — boarding manifest",
    bn: "বিদেশি নাগরিক — বোর্ডিং তালিকা",
  },
  "bk.changeStatus": { en: "Change status", bn: "অবস্থা বদলান" },
  "bk.statusUpdated": { en: "Status updated.", bn: "অবস্থা বদলানো হয়েছে।" },
  "bk.payments": { en: "Payments", bn: "পেমেন্ট" },
  "bk.noPayments": { en: "No payments yet.", bn: "এখনো কোনো পেমেন্ট হয়নি।" },
  "bk.amount": { en: "Amount", bn: "টাকার অঙ্ক" },
  "bk.paymentRecorded": {
    en: "Payment recorded — invoice email sent.",
    bn: "পেমেন্ট লেখা হয়েছে — ইনভয়েস ইমেইল পাঠানো হয়েছে।",
  },
  "bk.invoices": { en: "Invoices", bn: "ইনভয়েস" },
  "bk.resend": { en: "Resend", bn: "আবার পাঠান" },
  "bk.invoiceResent": { en: "Invoice email resent.", bn: "ইনভয়েস ইমেইল আবার পাঠানো হয়েছে।" },
  "bk.statusHistory": { en: "Status history", bn: "অবস্থার ইতিহাস" },
  "bk.markedRefunded": { en: "Marked as refunded.", bn: "ফেরত দেওয়া হয়েছে বলে চিহ্নিত।" },

  "bk.select": { en: "Select…", bn: "বেছে নিন…" },
  "bk.adults": { en: "Adults", bn: "প্রাপ্তবয়স্ক" },
  "bk.kidAges": { en: "Kid ages (comma separated)", bn: "শিশুদের বয়স (কমা দিয়ে)" },
  "bk.kidAgesPlaceholder": { en: "e.g. 4, 7", bn: "যেমন ৪, ৭" },
  "bk.customerName": { en: "Customer name", bn: "গ্রাহকের নাম" },
  "bk.bookingCreated": { en: "Booking created.", bn: "বুকিং তৈরি হয়েছে।" },

  "bk.cancelWithPolicy": {
    en: "Cancel booking (apply cancellation policy)",
    bn: "বুকিং বাতিল করুন (বাতিলের নীতি প্রয়োগ হবে)",
  },
  "bk.cancelThis": { en: "Cancel this booking", bn: "এই বুকিংটি বাতিল করুন" },
  "bk.confirmCancel": {
    en: "Cancel this booking? The room becomes available again.",
    bn: "বুকিংটি বাতিল করবেন? রুমটি আবার খালি হয়ে যাবে।",
  },
  "bk.cancelledRefundRaised": {
    en: "Booking cancelled and refund raised.",
    bn: "বুকিং বাতিল হয়েছে, ফেরতের হিসাব খোলা হয়েছে।",
  },
  "bk.workingOutCharge": { en: "Working out the charge…", bn: "চার্জ হিসাব করা হচ্ছে…" },
  "bk.waiveCharge": {
    en: "Waive the cancellation charge — refund everything.",
    bn: "বাতিলের চার্জ মাফ করে দিন — পুরো টাকা ফেরত যাবে।",
  },

  "reason.plansChanged": { en: "Plans changed", bn: "পরিকল্পনা বদলেছে" },
  "reason.medical": { en: "Illness / emergency", bn: "অসুস্থতা / জরুরি অবস্থা" },
  "reason.dateChange": { en: "Wants a different date", bn: "অন্য তারিখ চান" },
  "reason.mistake": { en: "Booked by mistake", bn: "ভুল করে বুক করেছেন" },
  "reason.other": { en: "Other", bn: "অন্য কারণ" },

  "payout.method": { en: "Payout method…", bn: "কোন মাধ্যমে ফেরত…" },
  "payout.nagad": { en: "Nagad", bn: "নগদ" },
  "payout.bank": { en: "Bank transfer", bn: "ব্যাংক ট্রান্সফার" },
  "payout.cash": { en: "Cash", bn: "নগদ টাকা" },
  "payout.accountName": { en: "Account name", bn: "অ্যাকাউন্টের নাম" },
  "payout.accountNumber": { en: "Account / wallet number", bn: "অ্যাকাউন্ট / ওয়ালেট নম্বর" },
  "common.back": { en: "Back", bn: "ফিরে যান" },
  "common.pdf": { en: "PDF", bn: "PDF" },
  "common.csv": { en: "CSV", bn: "CSV" },
  "common.nothingHere": { en: "Nothing here.", bn: "এখানে কিছু নেই।" },
  "common.actions": { en: "Actions", bn: "কাজ" },
  "common.notes": { en: "Note", bn: "মন্তব্য" },

  // ── Refunds ─────────────────────────────────────────────────────────────
  "rf.title": { en: "Cancellations & refunds", bn: "বাতিল ও ফেরত" },
  "rf.subtitle": {
    en: "Decide cancellation requests, and record the money that goes back out.",
    bn: "বাতিলের অনুরোধে সিদ্ধান্ত নিন, আর যে টাকা ফেরত যাচ্ছে তা লিখে রাখুন।",
  },
  "rf.awaitingDecision": { en: "Awaiting decision", bn: "সিদ্ধান্তের অপেক্ষায়" },
  "rf.liability": { en: "Refund liability", bn: "ফেরতের পরিমাণ" },
  "rf.overduePayouts": { en: "Overdue payouts", bn: "দেরি হয়ে যাওয়া ফেরত" },
  "rf.overdueHint": {
    en: "Past the refund promise we made",
    bn: "আমরা যে সময় কথা দিয়েছিলাম তা পেরিয়ে গেছে",
  },
  "rf.paidOut": { en: "Paid out", bn: "পাঠানো হয়েছে" },
  "rf.searchRequest": { en: "Booking code, name or phone", bn: "বুকিং কোড, নাম বা ফোন" },
  "rf.searchRefund": {
    en: "Booking, name, phone or reference",
    bn: "বুকিং, নাম, ফোন বা রেফারেন্স",
  },
  "rf.request": { en: "Cancellation request", bn: "বাতিলের অনুরোধ" },
  "rf.raise": { en: "Raise a refund", bn: "ফেরতের হিসাব খুলুন" },
  "rf.raiseShort": { en: "Raise refund", bn: "ফেরত খুলুন" },
  "rf.booking": { en: "Booking", bn: "বুকিং" },
  "rf.customer": { en: "Customer", bn: "গ্রাহক" },
  "rf.departure": { en: "Departure", bn: "যাত্রার তারিখ" },
  "rf.departed": { en: "Departed", bn: "ছেড়ে গেছে" },
  "rf.requested": { en: "Requested", bn: "অনুরোধ করা হয়েছে" },
  "rf.source": { en: "Source", bn: "উৎস" },
  "rf.paidByCustomer": { en: "Paid by customer", bn: "গ্রাহক দিয়েছেন" },
  "rf.charge": { en: "Cancellation charge", bn: "বাতিলের চার্জ" },
  "rf.refundDue": { en: "Refund due", bn: "ফেরত পাওনা" },
  "rf.payoutTo": { en: "Payout to", bn: "কাকে পাঠানো হবে" },
  "rf.account": { en: "Account", bn: "অ্যাকাউন্ট" },
  "rf.bank": { en: "Bank", bn: "ব্যাংক" },
  "rf.sendTo": { en: "Send to", bn: "যেখানে পাঠানো হবে" },
  "rf.howSent": { en: "How was it sent?", bn: "কীভাবে পাঠানো হলো?" },
  "rf.transactionId": { en: "Transaction id", bn: "লেনদেন আইডি" },
  "rf.noteOptional": { en: "Note (optional)", bn: "মন্তব্য (ঐচ্ছিক)" },
  "rf.noteReject": {
    en: "Note (required to reject, shown to the customer)",
    bn: "মন্তব্য (প্রত্যাখ্যান করতে লাগবে, গ্রাহক দেখতে পাবেন)",
  },
  "rf.reject": { en: "Reject", bn: "প্রত্যাখ্যান" },
  "rf.markPaid": { en: "Mark paid", bn: "পাঠানো হয়েছে" },
  "rf.overdue": { en: "Overdue", bn: "দেরি" },
  "rf.noMatch": { en: "No refunds match this filter.", bn: "এই ছাঁকনিতে কোনো ফেরত মেলেনি।" },
  "rf.amountBdt": { en: "Amount (BDT)", bn: "টাকার অঙ্ক (৳)" },
  "rf.overrideWindow": {
    en: "This sailing ended outside the normal claim window — override.",
    bn: "এই সেইলিং স্বাভাবিক দাবির সময়ের বাইরে শেষ হয়েছে — তবু অনুমোদন দিন।",
  },
  "rf.cancelledRaised": {
    en: "Cancelled and refund raised.",
    bn: "বাতিল হয়েছে, ফেরতের হিসাব খোলা হয়েছে।",
  },
  "rf.rejected": {
    en: "Request rejected — the customer has been emailed.",
    bn: "অনুরোধ প্রত্যাখ্যান করা হয়েছে — গ্রাহককে ইমেইল পাঠানো হয়েছে।",
  },
  "rf.voided": { en: "Refund voided.", bn: "ফেরতটি বাতিল করা হয়েছে।" },
  "rf.recorded": {
    en: "Recorded — the customer has been emailed the reference.",
    bn: "লেখা হয়েছে — গ্রাহককে রেফারেন্সসহ ইমেইল পাঠানো হয়েছে।",
  },
  "rf.raised": { en: "Refund raised.", bn: "ফেরতের হিসাব খোলা হয়েছে।" },
  "rfReason.overpayment": { en: "Overpayment", bn: "বেশি টাকা দেওয়া" },
  "rfReason.duplicate": { en: "Duplicate payment", bn: "দুবার পেমেন্ট" },
  "rfReason.goodwill": { en: "Goodwill / service issue", bn: "সদিচ্ছা / সেবায় ত্রুটি" },
  "rfReason.operator": { en: "Operator cancellation", bn: "আমাদের পক্ষ থেকে বাতিল" },

  // ── Packages ────────────────────────────────────────────────────────────
  "pk.title": { en: "Packages", bn: "প্যাকেজ" },
  "pk.searchPlaceholder": { en: "Search title / ship…", bn: "নাম / জাহাজ দিয়ে খুঁজুন…" },
  "pk.newPackage": { en: "New package", bn: "নতুন প্যাকেজ" },
  "pk.totalPackages": { en: "Total packages", bn: "মোট প্যাকেজ" },
  "pk.openForBooking": { en: "Open for booking", bn: "বুকিং খোলা" },
  "pk.acrossShown": { en: "Across shown packages", bn: "দেখানো প্যাকেজগুলো মিলিয়ে" },
  "pk.groupActive": { en: "Active", bn: "চলমান" },
  "pk.groupPast": { en: "Past", bn: "শেষ হওয়া" },
  "pk.groupCancelled": { en: "Cancelled", bn: "বাতিল" },
  "pk.createFirst": { en: "Create your first package →", bn: "প্রথম প্যাকেজটি তৈরি করুন →" },
  "pk.colPackage": { en: "Package", bn: "প্যাকেজ" },
  "pk.colDates": { en: "Dates", bn: "তারিখ" },
  "pk.colOccupancy": { en: "Occupancy", bn: "কেবিন পূর্ণতা" },
  "pk.bookable": { en: "Bookable", bn: "বুক করা যাবে" },
  "pk.sailingNow": { en: "Sailing now", bn: "এখন চলছে" },
  "pk.edit": { en: "Edit", bn: "সম্পাদনা" },
  "pk.generateRooms": { en: "Generate rooms", bn: "রুম তৈরি করুন" },
  "pk.guideReport": { en: "Guide report (PDF)", bn: "গাইড রিপোর্ট (PDF)" },
  "pk.cancelDeparture": {
    en: "Cancel departure (refund everyone)",
    bn: "যাত্রা বাতিল করুন (সবাইকে ফেরত)",
  },
  "pk.deleted": { en: "Package deleted.", bn: "প্যাকেজ মুছে ফেলা হয়েছে।" },
  "pk.confirmDelete": {
    en: "Delete this package? This cannot be undone.",
    bn: "এই প্যাকেজটি মুছে ফেলবেন? এটি আর ফেরানো যাবে না।",
  },
  "pk.startDate": { en: "Start date", bn: "শুরুর তারিখ" },
  "pk.endDate": { en: "End date", bn: "শেষের তারিখ" },
  "pk.adultPrice": { en: "Adult price (BDT)", bn: "প্রাপ্তবয়স্কের ভাড়া (৳)" },
  "pk.cutoff": {
    en: "Booking cutoff — Bangladesh time (UTC+6)",
    bn: "বুকিং বন্ধের সময় — বাংলাদেশ সময় (UTC+6)",
  },
  "pk.bookingOpenOverride": {
    en: "Booking open (manual override)",
    bn: "বুকিং খোলা (হাতে চালু করা)",
  },
  "pk.marketingTitle": { en: "Marketing title", bn: "প্যাকেজের নাম" },
  "pk.marketingTitlePh": { en: "e.g. Sundarbans Explorer", bn: "যেমন সুন্দরবন এক্সপ্লোরার" },
  "pk.marketingDesc": { en: "Marketing description", bn: "প্যাকেজের বর্ণনা" },
  "pk.highlights": { en: "Highlights (one per line)", bn: "মূল আকর্ষণ (প্রতি লাইনে একটি)" },
  "pk.offer": { en: "Offer", bn: "অফার" },
  "pk.noOffer": { en: "No offer", bn: "অফার নেই" },
  "pk.percentOff": { en: "Percentage off", bn: "শতাংশ ছাড়" },
  "pk.takaOff": { en: "Taka off, per cabin", bn: "টাকা ছাড়, প্রতি কেবিনে" },
  "pk.offerNamePh": { en: "Offer name, e.g. Eid Offer", bn: "অফারের নাম, যেমন ঈদ অফার" },
  "pk.offerEndsAt": {
    en: "Ends at (optional — leave blank to run until you remove it)",
    bn: "শেষ হবে (ঐচ্ছিক — খালি রাখলে নিজে না সরানো পর্যন্ত চলবে)",
  },
  "pk.coverPhoto": { en: "Cover photo", bn: "কভার ছবি" },
  "pk.removePhoto": { en: "Remove photo", bn: "ছবি সরান" },
  "common.saving": { en: "Saving…", bn: "সংরক্ষণ হচ্ছে…" },
  "common.photos": { en: "Photos", bn: "ছবি" },
  "common.hidden": { en: "Hidden", bn: "লুকানো" },
  "common.active": { en: "Active", bn: "চালু" },
  "common.add": { en: "Add", bn: "যোগ করুন" },
  "common.ship": { en: "Ship", bn: "জাহাজ" },
  "common.floor": { en: "Floor", bn: "তলা" },
  "common.reasonOptional": { en: "Reason (optional)", bn: "কারণ (ঐচ্ছিক)" },

  // ── Rooms ───────────────────────────────────────────────────────────────
  "rm.title": { en: "Rooms", bn: "রুম" },
  "rm.subtitle": {
    en: "Live room map — see which rooms are booked or free per package.",
    bn: "রুমের জীবন্ত মানচিত্র — কোন প্যাকেজে কোন রুম বুক আর কোনটা খালি।",
  },
  "rm.search": { en: "Find room / guest…", bn: "রুম / অতিথি খুঁজুন…" },
  "rm.loadingPackages": { en: "Loading packages…", bn: "প্যাকেজ আসছে…" },
  "rm.loadingMap": { en: "Loading room map…", bn: "রুমের মানচিত্র আসছে…" },
  "rm.loadingRooms": { en: "Loading rooms…", bn: "রুম আসছে…" },
  "rm.totalRooms": { en: "Total rooms", bn: "মোট রুম" },
  "rm.booked": { en: "Booked", bn: "বুক হয়েছে" },
  "rm.available": { en: "Available", bn: "খালি" },
  "rm.blockedByAdmin": { en: "Blocked by admin", bn: "অ্যাডমিন আটকে রেখেছে" },
  "rm.unavailable": { en: "Unavailable", bn: "অনুপলব্ধ" },
  "rm.roomType": { en: "Room type", bn: "রুমের ধরন" },
  "rm.guestsInRoom": { en: "Guests in this room", bn: "এই রুমের অতিথিরা" },
  "rm.viewing": { en: "Viewing", bn: "দেখছেন" },
  "rm.shipInventory": { en: "Ship inventory — all rooms", bn: "জাহাজের সব রুম" },
  "rm.noRoomsAttached": {
    en: "No rooms are attached to this package yet.",
    bn: "এই প্যাকেজে এখনো কোনো রুম যুক্ত করা হয়নি।",
  },
  "rm.goGenerate": {
    en: "Go to Packages and use “Generate rooms” →",
    bn: "প্যাকেজ পেজে গিয়ে “রুম তৈরি করুন” চাপুন →",
  },
  "rm.currentlyBlocked": { en: "Currently blocked by admin", bn: "এখন অ্যাডমিন আটকে রেখেছে" },
  "rm.blockPlaceholder": {
    en: "e.g. crew cabin, maintenance, VIP hold",
    bn: "যেমন ক্রু কেবিন, মেরামত, ভিআইপি সংরক্ষিত",
  },
  "rm.blocked": {
    en: "Room blocked — hidden from customers.",
    bn: "রুম আটকানো হলো — গ্রাহক আর দেখবে না।",
  },
  "rm.released": {
    en: "Room released — back on sale.",
    bn: "রুম ছেড়ে দেওয়া হলো — আবার বিক্রির জন্য খোলা।",
  },
  "rm.releaseFailed": { en: "Could not release the room.", bn: "রুমটি ছাড়া গেল না।" },
  "rm.manifestFailed": {
    en: "Could not generate the room manifest.",
    bn: "রুমের তালিকা তৈরি করা গেল না।",
  },
  "rm.paymentFailed": { en: "Could not record the payment.", bn: "পেমেন্টটি লেখা গেল না।" },
  "rm.full": { en: "Full", bn: "পূর্ণ" },
  "rm.manageInBookings": { en: "Manage in Bookings →", bn: "বুকিং পেজে সামলান →" },

  // ── Cabins ──────────────────────────────────────────────────────────────
  "cb.title": { en: "Cabins", bn: "কেবিন" },
  "cb.subtitle": {
    en: "The cabin cards & detail pages shown on the public website — content, photos and the card's main image.",
    bn: "পাবলিক ওয়েবসাইটে যে কেবিন কার্ড ও বিস্তারিত পেজ দেখায় — লেখা, ছবি আর কার্ডের মূল ছবি।",
  },
  "cb.newCabin": { en: "New cabin", bn: "নতুন কেবিন" },
  "cb.noneYet": {
    en: "No cabins yet — create the first one.",
    bn: "এখনো কোনো কেবিন নেই — প্রথমটি তৈরি করুন।",
  },
  "cb.name": { en: "Cabin name *", bn: "কেবিনের নাম *" },
  "cb.nameRequired": { en: "Cabin name is required.", bn: "কেবিনের নাম দিতে হবে।" },
  "cb.sizeBadge": { en: "Size badge (optional)", bn: "আয়তনের ব্যাজ (ঐচ্ছিক)" },
  "cb.roomTypeHint": {
    en: "Room type (shows occupancy on the card)",
    bn: "রুমের ধরন (কার্ডে কতজন ধরে তা দেখায়)",
  },
  "cb.tagline": {
    en: "Tagline (one line, under the name on the detail page)",
    bn: "এক লাইনের পরিচিতি (বিস্তারিত পেজে নামের নিচে)",
  },
  "cb.description": {
    en: "Description (detail page 'About this cabin')",
    bn: "বর্ণনা (বিস্তারিত পেজের ‘এই কেবিন সম্পর্কে’)",
  },
  "cb.features": {
    en: "Features — one per line (first 4 show on the card)",
    bn: "সুবিধা — প্রতি লাইনে একটি (প্রথম ৪টি কার্ডে দেখায়)",
  },
  "cb.specs": {
    en: "Cabin specs — one per line as Label: Value (detail page table)",
    bn: "কেবিনের বিবরণ — প্রতি লাইনে শিরোনাম: মান (বিস্তারিত পেজের ছক)",
  },
  "cb.highlights": {
    en: "Highlights — one per line as Title | description (detail page blocks)",
    bn: "আকর্ষণ — প্রতি লাইনে শিরোনাম | বর্ণনা (বিস্তারিত পেজের অংশ)",
  },
  "cb.sortOrder": { en: "Display order (lower shows first)", bn: "দেখানোর ক্রম (ছোট সংখ্যা আগে)" },
  "cb.deleted": { en: "Cabin deleted.", bn: "কেবিন মুছে ফেলা হয়েছে।" },
  "cb.makeMain": { en: "Make this the card's main image", bn: "এটিকে কার্ডের মূল ছবি করুন" },
  "cb.mainUpdated": {
    en: "Main photo updated — this now shows on the cabin card.",
    bn: "মূল ছবি বদলানো হয়েছে — এটিই এখন কেবিন কার্ডে দেখাবে।",
  },
  "cb.main": { en: "Main", bn: "মূল" },
  "cb.captionOptional": { en: "Caption (optional)", bn: "ক্যাপশন (ঐচ্ছিক)" },
  "cb.confirmDeletePhoto": { en: "Delete this photo?", bn: "এই ছবিটি মুছে ফেলবেন?" },

  // ── Food menu ───────────────────────────────────────────────────────────
  "fm.title": { en: "Food Menu", bn: "খাবারের তালিকা" },
  "fm.subtitle": {
    en: "Day-by-day dish pool the chef selects from — add, edit, or hide items per meal.",
    bn: "দিনভিত্তিক খাবারের তালিকা, যেখান থেকে শেফ বেছে নেন — প্রতি বেলার খাবার যোগ, সম্পাদনা বা লুকানো যায়।",
  },
  "fm.loading": { en: "Loading food menu…", bn: "খাবারের তালিকা আসছে…" },
  "fm.search": { en: "Search dishes…", bn: "খাবার খুঁজুন…" },
  "fm.totalDishes": { en: "Total dishes", bn: "মোট পদ" },
  "fm.perDay": { en: "Per day (avg)", bn: "দিনে গড়ে" },
  "fm.itemName": { en: "Item name", bn: "খাবারের নাম" },
  "fm.itemPlaceholder": { en: "e.g. Mixed Vegetables", bn: "যেমন মিক্সড ভেজিটেবল" },
  "fm.editDish": { en: "Edit dish", bn: "খাবার সম্পাদনা" },
  "fm.editItem": { en: "Edit item", bn: "পদ সম্পাদনা" },
  "fm.copyInto": { en: "Copy into", bn: "কোথায় কপি হবে" },
  "fm.copyDay": { en: "Copy this day →", bn: "এই দিনটি কপি করুন →" },
  "fm.duplicateAll": { en: "Duplicate all", bn: "সব কপি করুন" },
  "fm.noItems": { en: "No food menu items yet.", bn: "এখনো কোনো খাবার যোগ করা হয়নি।" },
  "fm.added": { en: "Item added.", bn: "যোগ করা হয়েছে।" },
  "fm.updated": { en: "Item updated.", bn: "বদলানো হয়েছে।" },
  "fm.removed": { en: "Item removed.", bn: "সরিয়ে ফেলা হয়েছে।" },
  "common.manage": { en: "Manage", bn: "সামলান" },

  // ── Room settings ───────────────────────────────────────────────────────
  "rs.title": { en: "Room Settings", bn: "রুম সেটিংস" },
  "rs.subtitle": {
    en: "Prices & pax limits — changes take effect immediately on every new booking.",
    bn: "দাম ও যাত্রীসীমা — বদলালেই নতুন প্রতিটি বুকিংয়ে কার্যকর হয়।",
  },
  "rs.tabRoomTypes": { en: "Room Types", bn: "রুমের ধরন" },
  "rs.tabRoomTypesHint": { en: "Prices & pax limits", bn: "দাম ও যাত্রীসীমা" },
  "rs.tabKid": { en: "Kid Pricing", bn: "শিশুর ভাড়া" },
  "rs.tabKidHint": { en: "Age-based fares", bn: "বয়স অনুযায়ী ভাড়া" },
  "rs.tabForeigner": { en: "Foreigner Surcharge", bn: "বিদেশি সারচার্জ" },
  "rs.tabForeignerHint": { en: "Extra per foreign guest", bn: "বিদেশি অতিথি প্রতি বাড়তি" },
  "rs.tabPhotos": { en: "Room Photos", bn: "রুমের ছবি" },
  "rs.tabPhotosHint": { en: "Per-room gallery", bn: "রুমভিত্তিক গ্যালারি" },

  "rs.fareBasis": { en: "Fare basis", bn: "ভাড়ার ভিত্তি" },
  "rs.fareBasisHint": {
    en: "What every cabin below is priced from",
    bn: "নিচের প্রতিটি কেবিনের দাম যেখান থেকে আসে",
  },
  "rs.defaultAdultFare": { en: "Default adult fare (BDT)", bn: "ডিফল্ট প্রাপ্তবয়স্ক ভাড়া (৳)" },
  "rs.defaultAdultFareHint": {
    en: "Pre-fills a new package. Each sailing can still be priced differently.",
    bn: "নতুন প্যাকেজে আগে থেকে বসে যাবে। প্রতিটি সেইলিংয়ের দাম আলাদা রাখা যাবে।",
  },
  "rs.sellWhole": { en: "Sell cabins whole", bn: "কেবিন পুরোটা বিক্রি করুন" },
  "rs.sellWholeHint": {
    en: "A cabin costs its full berth count however many people take it.",
    bn: "যতজনই যাক, কেবিনের পুরো বার্থের ভাড়া নেওয়া হবে।",
  },
  "rs.allowance": { en: "Allowance per empty berth (BDT)", bn: "প্রতি খালি বার্থে ছাড় (৳)" },
  "rs.allowanceHint": {
    en: "The food an absent guest would have eaten over the trip.",
    bn: "যে অতিথি যাচ্ছেন না, তিনি পুরো ভ্রমণে যে খাবার খেতেন।",
  },
  "rs.fareBasisSaved": {
    en: "Fare basis saved — applies to new bookings only.",
    bn: "ভাড়ার ভিত্তি সংরক্ষিত — শুধু নতুন বুকিংয়ে প্রযোজ্য।",
  },
  "rs.newBookingsOnly": {
    en: "Applies to new bookings only — bookings already made keep the price they were given.",
    bn: "শুধু নতুন বুকিংয়ে প্রযোজ্য — আগের বুকিংগুলো তাদের দেওয়া দামেই থাকবে।",
  },
  "rs.cabinFareNote": {
    en: "A cabin's fare comes from the berths it has and the adult fare above. Pax limits are enforced by the booking API — the frontend cannot bypass them.",
    bn: "কেবিনের ভাড়া আসে তার বার্থ সংখ্যা আর উপরের প্রাপ্তবয়স্ক ভাড়া থেকে। যাত্রীসীমা সার্ভারেই আটকানো — সামনের দিক থেকে ফাঁকি দেওয়া যায় না।",
  },
  "rs.loadingRoomTypes": { en: "Loading room types…", bn: "রুমের ধরন আসছে…" },
  "rs.maxAdults": { en: "Max adults", bn: "সর্বোচ্চ প্রাপ্তবয়স্ক" },
  "rs.maxKids": { en: "Max kids", bn: "সর্বোচ্চ শিশু" },
  "rs.berthWarning": {
    en: "Also how many berths are charged — changing it changes this cabin's fare.",
    bn: "এটাই ঠিক করে কত বার্থের ভাড়া নেওয়া হবে — বদলালে এই কেবিনের দামও বদলাবে।",
  },
  "rs.basePrice": { en: "Base price per room", bn: "রুমপ্রতি ভিত্তিমূল্য" },
  "rs.addBasePrice": { en: "Add a per-cabin base price", bn: "কেবিনপ্রতি ভিত্তিমূল্য যোগ করুন" },
  "rs.basePriceHint": {
    en: "Added once per cabin, on top of the berth fare. Leave at 0 unless this cabin costs more for a reason other than its size.",
    bn: "কেবিনপ্রতি একবার যোগ হয়, বার্থের ভাড়ার উপরে। আকারের বাইরে অন্য কারণে দামি না হলে ০ রাখুন।",
  },
  "rs.fullCabin": { en: "Full cabin ({berths} berths)", bn: "পুরো কেবিন ({berths} বার্থ)" },
  "rs.oneBerthEmpty": { en: "With one berth empty", bn: "একটি বার্থ খালি থাকলে" },
  "rs.atDefaultFare": {
    en: "At the default fare of {fare} per adult · {pax}",
    bn: "প্রাপ্তবয়স্ক প্রতি ডিফল্ট ভাড়া {fare} ধরে · {pax}",
  },
  "rs.upToPax": { en: "up to {n} pax", bn: "সর্বোচ্চ {n} জন" },
  "rs.setFareFirst": {
    en: "Set a default adult fare above to see what this cabin costs · {pax}",
    bn: "উপরে ডিফল্ট ভাড়া বসালেই এই কেবিনের দাম দেখা যাবে · {pax}",
  },
  "rs.perHeadNote": {
    en: "Charged per person, so fewer guests pay less · {pax}",
    bn: "মাথাপিছু ভাড়া, তাই কম লোক গেলে কম দাম · {pax}",
  },
  "rs.roomTypeUpdated": { en: "Room type updated.", bn: "রুমের ধরন বদলানো হয়েছে।" },

  "rs.foreignerTitle": { en: "Foreigner surcharge", bn: "বিদেশি সারচার্জ" },
  "rs.foreignerHint": {
    en: "One rate for every sailing, charged once per foreign guest",
    bn: "সব সেইলিংয়ে একই হার, প্রতি বিদেশি অতিথিতে একবার",
  },
  "rs.perForeignAdult": { en: "Per foreign adult (BDT)", bn: "প্রতি বিদেশি প্রাপ্তবয়স্ক (৳)" },
  "rs.perForeignChild": { en: "Per foreign child (BDT)", bn: "প্রতি বিদেশি শিশু (৳)" },
  "rs.foreignAdultHint": {
    en: "Added once, on top of the adult fare they already pay.",
    bn: "তাঁর স্বাভাবিক ভাড়ার উপরে একবার যোগ হয়।",
  },
  "rs.foreignChildHint": {
    en: "Charged even when the child's age tier is free.",
    bn: "শিশুর বয়সের ধাপ বিনামূল্যে হলেও এটি নেওয়া হয়।",
  },
  "rs.noSurchargeNow": { en: "No surcharge right now.", bn: "এখন কোনো সারচার্জ নেই।" },
  "rs.foreignerUpdated": {
    en: "Foreigner surcharge updated.",
    bn: "বিদেশি সারচার্জ বদলানো হয়েছে।",
  },
  "rs.loadingSurcharge": { en: "Loading surcharge…", bn: "সারচার্জ আসছে…" },

  "rs.loadingKidRules": { en: "Loading kid pricing rules…", bn: "শিশুর ভাড়ার নিয়ম আসছে…" },
  "rs.addRule": { en: "Add rule", bn: "নিয়ম যোগ করুন" },
  "rs.newKidRule": { en: "New kid pricing rule", bn: "শিশুর ভাড়ার নতুন নিয়ম" },
  "rs.ageFrom": { en: "Age from (incl.)", bn: "বয়স শুরু (সহ)" },
  "rs.ageTo": { en: "Age to (excl.)", bn: "বয়স শেষ (বাদে)" },
  "rs.chargeType": { en: "Charge type", bn: "ভাড়ার ধরন" },
  "rs.freeNoCharge": { en: "Free — no charge", bn: "বিনামূল্যে — কোনো টাকা নেই" },
  "rs.fixedCharge": {
    en: "Fixed charge — flat amount per kid",
    bn: "নির্দিষ্ট টাকা — প্রতি শিশুতে থোক",
  },
  "rs.fullAdultFare": { en: "Full adult fare", bn: "পূর্ণ প্রাপ্তবয়স্ক ভাড়া" },
  "rs.chargePerKid": { en: "Charge per kid", bn: "প্রতি শিশুতে" },
  "rs.ageCoverage": { en: "Age coverage", bn: "বয়সের পরিধি" },
  "rs.ruleUpdated": { en: "Kid pricing rule updated.", bn: "শিশুর ভাড়ার নিয়ম বদলানো হয়েছে।" },
  "rs.ruleAdded": { en: "Kid pricing rule added.", bn: "শিশুর ভাড়ার নিয়ম যোগ হয়েছে।" },
  "rs.ruleDeleted": { en: "Kid pricing rule deleted.", bn: "শিশুর ভাড়ার নিয়ম মুছে ফেলা হয়েছে।" },
  "rs.deleteRule": { en: "Delete rule", bn: "নিয়ম মুছুন" },

  "rs.loadingPhotos": { en: "Loading room photos…", bn: "রুমের ছবি আসছে…" },
  "rs.findRoom": { en: "Find room number…", bn: "রুম নম্বর খুঁজুন…" },
  "rs.noPhotos": {
    en: "No photos yet — customers see this room without a gallery.",
    bn: "এখনো ছবি নেই — গ্রাহক এই রুমটি গ্যালারি ছাড়াই দেখবেন।",
  },
  "rs.uploadFirst": {
    en: "Click to upload the first photo",
    bn: "প্রথম ছবিটি আপলোড করতে ক্লিক করুন",
  },
  "rs.showEarlier": { en: "Show earlier", bn: "আগে দেখান" },
  "rs.showLater": { en: "Show later", bn: "পরে দেখান" },

  // ── Settings ────────────────────────────────────────────────────────────
  "st.title": { en: "Settings", bn: "সেটিংস" },
  "st.subtitle": {
    en: "Your account, and the details printed on documents customers receive.",
    bn: "আপনার অ্যাকাউন্ট, আর গ্রাহকের কাগজে যে তথ্য ছাপা হয়।",
  },
  "st.sections": { en: "Settings sections", bn: "সেটিংসের অংশ" },
  "st.account": { en: "Account", bn: "অ্যাকাউন্ট" },
  "st.accountHint": {
    en: "Who you are signed in as. Changing it is an administrator job.",
    bn: "আপনি কার নামে ঢুকেছেন। এটি বদলানো অ্যাডমিনের কাজ।",
  },
  "st.username": { en: "Username", bn: "ইউজারনেম" },
  "st.role": { en: "Role", bn: "পদ" },
  "st.accountNote": {
    en: "To change your name, username or password, ask an administrator to do it in the Django admin panel.",
    bn: "নাম, ইউজারনেম বা পাসওয়ার্ড বদলাতে অ্যাডমিনকে বলুন — তিনি Django অ্যাডমিন প্যানেল থেকে করবেন।",
  },
  "st.contactInbox": { en: "Contact inbox", bn: "যোগাযোগের ইনবক্স" },
  "st.messageNotifications": { en: "Message notifications", bn: "বার্তার বিজ্ঞপ্তি" },
  "st.contactNotifications": { en: "Contact-form notifications", bn: "যোগাযোগ ফর্মের বিজ্ঞপ্তি" },
  "st.notificationEmail": { en: "Notification email", bn: "বিজ্ঞপ্তির ইমেইল" },
  "st.inboxSaved": {
    en: "Notification inbox updated — new website messages go here.",
    bn: "বিজ্ঞপ্তির ইনবক্স বদলানো হয়েছে — ওয়েবসাইটের নতুন বার্তা এখানেই যাবে।",
  },
  "st.helpline": { en: "Helpline numbers", bn: "হেল্পলাইন নম্বর" },
  "st.helplineDoc": { en: "Document helpline numbers", bn: "কাগজে ছাপা হেল্পলাইন নম্বর" },
  "st.phoneNumbers": { en: "Phone numbers (comma-separated)", bn: "ফোন নম্বর (কমা দিয়ে আলাদা)" },
  "st.onThePdf": { en: "On the PDF:", bn: "PDF-এ যেভাবে আসবে:" },
  "st.helplineSaved": {
    en: "Helpline numbers updated — they'll appear on new reports & invoices.",
    bn: "হেল্পলাইন নম্বর বদলানো হয়েছে — নতুন রিপোর্ট ও ইনভয়েসে দেখাবে।",
  },
  "st.guideReport": { en: "Guide report", bn: "গাইড রিপোর্ট" },
  "st.guideReportSize": { en: "Guide report size", bn: "গাইড রিপোর্টের আকার" },
  "st.guideReportDensity": { en: "Guide report PDF density", bn: "গাইড রিপোর্ট PDF-এর ঘনত্ব" },
  "st.guideReportSaved": {
    en: "Guide report size updated — applies to new report downloads.",
    bn: "গাইড রিপোর্টের আকার বদলানো হয়েছে — এরপর নামানো রিপোর্টে প্রযোজ্য।",
  },

  /* Settings — pieces added when the language switch moved onto this page */
  "st.inboxHint": {
    en: "Where inquiries from the website contact form are emailed. Leave blank to use the system default. Every message also appears in Messages.",
    bn: "ওয়েবসাইটের যোগাযোগ ফর্ম থেকে আসা বার্তা কোন ইমেইলে যাবে। খালি রাখলে সিস্টেমের নিজের ঠিকানা ব্যবহার হবে। প্রতিটি বার্তা বার্তা পাতাতেও জমা থাকে।",
  },
  "st.helplineHint": {
    en: "Printed in the top corner of every guide report and customer invoice. Separate multiple numbers with commas.",
    bn: "প্রতিটি গাইড রিপোর্ট ও গ্রাহকের ইনভয়েসের উপরের কোণে ছাপা হয়। একাধিক নম্বর কমা দিয়ে আলাদা করুন।",
  },
  "st.guideReportHint": {
    en: "Controls the text size and rows-per-page of the guide collection report PDF. Compact fits more rooms on a page; Large prints bigger, easier-to-read type.",
    bn: "গাইড কালেকশন রিপোর্ট PDF-এর লেখার আকার আর প্রতি পাতায় কয়টি সারি থাকবে তা ঠিক করে। ছোট রাখলে এক পাতায় বেশি কেবিন আঁটে; বড় রাখলে লেখা বড় ও পড়তে সহজ হয়।",
  },
  "st.densityCompact": { en: "Compact", bn: "ছোট" },
  "st.densityCompactHint": {
    en: "Smaller text — more rooms per page",
    bn: "ছোট লেখা — এক পাতায় বেশি কেবিন",
  },
  "st.densityNormal": { en: "Normal", bn: "মাঝারি" },
  "st.densityNormalHint": { en: "Balanced (default)", bn: "মাঝামাঝি (ডিফল্ট)" },
  "st.densityLarge": { en: "Large", bn: "বড়" },
  "st.densityLargeHint": {
    en: "Bigger text — easier to read, may add pages",
    bn: "বড় লেখা — পড়তে সহজ, পাতা বাড়তে পারে",
  },
  "st.roleStaff": { en: "Staff (dashboard access)", bn: "স্টাফ (ড্যাশবোর্ডে প্রবেশাধিকার)" },
  "st.staff": { en: "Staff", bn: "স্টাফ" },
  "st.helplineLabel": { en: "Helpline:", bn: "হেল্পলাইন:" },
  "st.noHelplineLine": { en: "no helpline line shown", bn: "কোনো হেল্পলাইন লাইন দেখাবে না" },
  "st.language": { en: "Language", bn: "ভাষা" },
  "st.languageHint": {
    en: "The language of this dashboard — labels, numbers and dates. It changes only what staff see here; the customer website stays in English.",
    bn: "এই ড্যাশবোর্ডের ভাষা — লেখা, সংখ্যা আর তারিখ। শুধু স্টাফ যা দেখেন তা-ই বদলায়; গ্রাহকের ওয়েবসাইট ইংরেজিতেই থাকে।",
  },
  "st.languageDashboard": { en: "Dashboard language", bn: "ড্যাশবোর্ডের ভাষা" },
  "st.langEnglish": { en: "English", bn: "English" },
  "st.langEnglishHint": {
    en: "Labels, numbers and dates in English",
    bn: "লেখা, সংখ্যা ও তারিখ ইংরেজিতে",
  },
  "st.langBangla": { en: "বাংলা", bn: "বাংলা" },
  "st.langBanglaHint": {
    en: "Labels, numbers and dates in Bangla",
    bn: "লেখা, সংখ্যা ও তারিখ বাংলায়",
  },
  "st.languageSaved": {
    en: "Language changed — it stays this way on this computer.",
    bn: "ভাষা বদলানো হয়েছে — এই কম্পিউটারে এভাবেই থাকবে।",
  },
  "st.languageNote": {
    en: "Saved in this browser only. Signing in on another computer starts in English again.",
    bn: "শুধু এই ব্রাউজারে সংরক্ষিত। অন্য কম্পিউটার থেকে ঢুকলে আবার ইংরেজিতে শুরু হবে।",
  },

  /* Room Settings — the rest of the page */
  "rs.sleepsUpTo": {
    en: "Sleeps up to {adults} adult(s) + {kids} kid(s)",
    bn: "সর্বোচ্চ {adults} জন প্রাপ্তবয়স্ক + {kids} জন শিশু থাকতে পারে",
  },
  "rs.hide": { en: "hide", bn: "লুকান" },
  "rs.saveFareBasis": { en: "Save fare basis", bn: "ভাড়ার ভিত্তি সংরক্ষণ" },
  "rs.chargeFree": { en: "Free", bn: "বিনামূল্যে" },
  "rs.chargeFreeHint": {
    en: "No charge for this age range",
    bn: "এই বয়সের জন্য কোনো টাকা নেই",
  },
  "rs.chargeFixed": { en: "Fixed charge", bn: "নির্দিষ্ট টাকা" },
  "rs.chargeFixedHint": {
    en: "Flat amount per kid in this age range",
    bn: "এই বয়সের প্রতিটি শিশুর জন্য থোক টাকা",
  },
  "rs.chargeFullHint": {
    en: "Charged the package's adult price",
    bn: "প্যাকেজের প্রাপ্তবয়স্ক ভাড়াই নেওয়া হয়",
  },
  "rs.ageRuleNote1": {
    en: "Age ranges are",
    bn: "বয়সের সীমা",
  },
  "rs.ageRuleNoteBold": {
    en: "min-inclusive, max-exclusive",
    bn: "শুরুর বয়স সহ, শেষের বয়স বাদে",
  },
  "rs.ageRuleNote2": {
    en: ": a rule 3 → 8 covers kids aged 3, 4, … 7. To move the full-fare boundary from 8 to 9, set the fixed rule to 3 → 9 and the adult rule to 9 → 99 — no code change needed. Ranges must not overlap.",
    bn: ": ৩ → ৮ নিয়মটি ৩, ৪, … ৭ বছরের শিশুদের ধরে। পূর্ণ ভাড়ার সীমা ৮ থেকে ৯ করতে চাইলে নির্দিষ্ট নিয়মটি ৩ → ৯ আর প্রাপ্তবয়স্ক নিয়মটি ৯ → ৯৯ করুন — কোড বদলাতে হবে না। সীমাগুলো একটার উপর আরেকটা পড়া যাবে না।",
  },
  "rs.ruleCount": { en: "{n} rule(s)", bn: "{n}টি নিয়ম" },
  "rs.noKidRules1": {
    en: "No kid pricing rules yet. Bookings with children will fail until you add rules covering their ages. Click",
    bn: "এখনো শিশুর ভাড়ার কোনো নিয়ম নেই। বয়স অনুযায়ী নিয়ম না দিলে শিশুসহ বুকিং হবে না। শুরু করতে",
  },
  "rs.noKidRules2": { en: "to start.", bn: "চাপুন।" },
  "rs.confirmDeleteRule": {
    en: "Delete this kid pricing rule?",
    bn: "এই নিয়মটি মুছে ফেলবেন?",
  },
  "rs.yrs": { en: "{from}–{to} yrs", bn: "{from}–{to} বছর" },
  "rs.noSurchargeBody": {
    en: "Foreign guests pay exactly what everyone else pays — their passport is still collected for the boarding manifest.",
    bn: "বিদেশি অতিথিরা বাকি সবার সমান ভাড়াই দেবেন — তবে বোর্ডিং তালিকার জন্য পাসপোর্ট নেওয়া হবে।",
  },
  "rs.surchargeBody": {
    en: "A foreign adult pays {adult} more than a local guest, and a foreign child {kid} more — once each, whatever cabin they take.",
    bn: "একজন বিদেশি প্রাপ্তবয়স্ক দেশি অতিথির চেয়ে {adult} বেশি দেন, আর বিদেশি শিশু {kid} বেশি — যে কেবিনই নিন, একবারই।",
  },
  "rs.photosNote": {
    en: "Photos show on the customer room picker. Keep files under ~1 MB (hard limit 10 MB). Click a room to manage its gallery.",
    bn: "ছবিগুলো গ্রাহকের রুম বাছাইয়ের পাতায় দেখায়। ফাইল ১ MB-এর নিচে রাখুন (সর্বোচ্চ ১০ MB)। গ্যালারি সামলাতে রুমে ক্লিক করুন।",
  },
  "rs.unassignedFloor": { en: "Unassigned floor", bn: "তলা নির্ধারণ করা হয়নি" },
  "rs.floorN": { en: "Floor {n}", bn: "{n} তলা" },
  "rs.roomPhotoCount": {
    en: "{rooms} room(s) · {photos} photo(s)",
    bn: "{rooms}টি রুম · {photos}টি ছবি",
  },
  "rs.photoCount": { en: "{n} photo(s)", bn: "{n}টি ছবি" },
  "rs.noPhotosBadge": { en: "No photos", bn: "ছবি নেই" },
  "rs.roomN": { en: "Room {n}", bn: "রুম {n}" },
  "rs.noRoomsMatch": { en: 'No rooms match "{q}".', bn: '"{q}" মেলে এমন কোনো রুম নেই।' },
  "rs.roomPhotosTitle": { en: "Room {n} — Photos", bn: "রুম {n} — ছবি" },
  "rs.galleryNote": {
    en: "{photos} photo(s) — lower order shows first on the customer site.",
    bn: "{photos}টি ছবি — ছোট ক্রমের ছবি গ্রাহকের সাইটে আগে দেখায়।",
  },
  "rs.addPhotos": { en: "Add photos", bn: "ছবি যোগ করুন" },
  "rs.deletePhoto": { en: "Delete photo", bn: "ছবি মুছুন" },
  "rs.photoDeleted": { en: "Photo deleted.", bn: "ছবি মুছে ফেলা হয়েছে।" },
  "rs.photosAdded": {
    en: "{count} photo(s) added to room {room}.",
    bn: "রুম {room}-এ {count}টি ছবি যোগ হয়েছে।",
  },
  "rs.confirmDeletePhoto": { en: "Delete this photo?", bn: "এই ছবিটি মুছে ফেলবেন?" },
  "rs.captionOptional": { en: "Caption (optional)", bn: "ক্যাপশন (ঐচ্ছিক)" },
  "rs.gapsFound": {
    en: "{n} gap(s) — some ages have no rule",
    bn: "{n}টি ফাঁক — কিছু বয়সের জন্য নিয়ম নেই",
  },
  "rs.fullyCovered": { en: "Fully covered 0–{max}", bn: "০–{max} পুরোটাই ঢাকা" },
  "rs.noRuleForAges": {
    en: "No rule for ages {from}–{to}",
    bn: "{from}–{to} বছরের জন্য কোনো নিয়ম নেই",
  },
  "rs.adultsN": { en: "{n} adults", bn: "{n} জন প্রাপ্তবয়স্ক" },

  /* Odds and ends the first pass left in English */
  "common.add2": { en: "Add item", bn: "আইটেম যোগ করুন" },
  "common.order": { en: "Order", bn: "ক্রম" },
  "common.total": { en: "Total", bn: "মোট" },
  "common.notSent": { en: "Not sent", bn: "পাঠানো হয়নি" },
  "common.sentAt": { en: "Sent {when}", bn: "পাঠানো হয়েছে {when}" },
  "common.createdWord": { en: "created", bn: "তৈরি" },

  "bk.refundOwedCall": {
    en: "Refund owed — call the customer",
    bn: "ফেরত বাকি — গ্রাহককে ফোন করুন",
  },
  "bk.createBooking": { en: "Create booking", bn: "বুকিং তৈরি করুন" },
  "bk.suggestsGroup": {
    en: "This party is large enough to be a group booking — if it is one, change its type first: the group column charges differently.",
    bn: "এই দলটি গ্রুপ বুকিং হওয়ার মতো বড় — যদি তা-ই হয়, আগে ধরন বদলান: গ্রুপের হিসাব আলাদাভাবে হয়।",
  },
  "bk.waiveNote": {
    en: "Money given away, so the note becomes mandatory and is recorded against your name.",
    bn: "টাকা ছেড়ে দেওয়া হচ্ছে, তাই মন্তব্য বাধ্যতামূলক এবং আপনার নামে লেখা থাকবে।",
  },

  "cb.noPhotosCard": {
    en: "No photos yet. The first photo you add becomes the card image automatically.",
    bn: "এখনো ছবি নেই। প্রথম যে ছবিটি দেবেন, সেটিই কার্ডের ছবি হয়ে যাবে।",
  },

  "gallery.empty": {
    en: "No gallery photos yet — add the first ones and they appear on the website instantly.",
    bn: "এখনো গ্যালারিতে ছবি নেই — প্রথম ছবিগুলো দিলেই সঙ্গে সঙ্গে ওয়েবসাইটে দেখাবে।",
  },

  "overview.noPayments": { en: "No payments yet.", bn: "এখনো কোনো পেমেন্ট নেই।" },
  "overview.notBookable": { en: "Not bookable", bn: "বুকিং বন্ধ" },
  "overview.viewAll": { en: "View all →", bn: "সব দেখুন →" },
  "overview.managePackages": { en: "Manage packages →", bn: "প্যাকেজ সামলান →" },

  "pk.cutoffHint": {
    en: "Bookings close at this time (Bangladesh clock, wherever you are). Leave blank to auto-set to noon the day before departure.",
    bn: "এই সময়ে বুকিং বন্ধ হবে (আপনি যেখানেই থাকুন, বাংলাদেশের ঘড়ি অনুযায়ী)। খালি রাখলে ছাড়ার আগের দিন দুপুর ১২টা ধরা হবে।",
  },
  "pk.offerPercentNote": {
    en: "Comes off the whole cabin — base price, adult fares and kid fares together.",
    bn: "পুরো কেবিনের উপর থেকে বাদ যায় — ভিত্তিমূল্য, প্রাপ্তবয়স্ক ও শিশুর ভাড়া মিলিয়ে।",
  },
  "pk.offerFlatNote": {
    en: "Comes off each cabin, so a 3-cabin booking gets it three times.",
    bn: "প্রতিটি কেবিন থেকে বাদ যায়, তাই ৩ কেবিনের বুকিংয়ে তিনবার পাওয়া যায়।",
  },
  "pk.offerTailNote": {
    en: "Bookings already paid for keep the price they were given; ending an offer never re-prices anyone.",
    bn: "যে বুকিংয়ের টাকা দেওয়া হয়ে গেছে সেটি আগের দামেই থাকবে; অফার শেষ হলেও কারো দাম বদলায় না।",
  },
  "pk.coverHint": {
    en: "Shown on the package card, the booking page and the home page. Landscape works best. Without one the card falls back to a stock photograph.",
    bn: "প্যাকেজ কার্ড, বুকিং পাতা ও হোমপেজে দেখাবে। আড়াআড়ি (ল্যান্ডস্কেপ) ছবি সবচেয়ে ভালো লাগে। না দিলে কার্ডে একটি সাধারণ ছবি বসবে।",
  },
  "pk.createHint": {
    en: "Cutoff auto-sets to noon the day before departure. Use “Generate rooms” after creating.",
    bn: "বুকিং বন্ধের সময় নিজে থেকেই ছাড়ার আগের দিন দুপুর ১২টা হবে। তৈরির পর “রুম বানান” চাপুন।",
  },
  "pk.createPackage": { en: "Create package", bn: "প্যাকেজ তৈরি করুন" },

  "rf.wouldBeRefunded": { en: "{amount} would be refunded", bn: "{amount} ফেরত যাবে" },
  "rf.payoutsOwed": { en: "{n} payout(s) owed", bn: "{n}টি পরিশোধ বাকি" },
  "rf.undecidedCount": {
    en: "{n} request(s) are still undecided after their departure.",
    bn: "ছাড়ার পরও {n}টি আবেদনের সিদ্ধান্ত হয়নি।",
  },
  "rf.undecidedNote": {
    en: "The customer filed in time, so the charge they were quoted still stands — this backlog is ours, not theirs.",
    bn: "গ্রাহক সময়মতোই আবেদন করেছেন, তাই তাঁকে বলা চার্জই বহাল থাকবে — দেরিটা আমাদের, তাঁর নয়।",
  },
  "rf.approveRefund": { en: "Approve & refund {amount}", bn: "অনুমোদন দিন ও {amount} ফেরত দিন" },
  "rf.approveNote": {
    en: "Approving cancels the booking, releases the cabin and raises the payout. The customer is emailed automatically.",
    bn: "অনুমোদন দিলে বুকিং বাতিল হবে, কেবিন খালি হবে আর ফেরতের হিসাব তৈরি হবে। গ্রাহককে নিজে থেকেই ইমেইল চলে যাবে।",
  },
  "rf.referenceRequired": {
    en: "Required: without a reference this payout cannot be reconciled against the bKash or bank statement, and the register stops being an accounting document.",
    bn: "আবশ্যক: রেফারেন্স ছাড়া এই পরিশোধ বিকাশ বা ব্যাংকের হিসাবের সঙ্গে মেলানো যাবে না, তখন রেজিস্টারটি আর হিসাবের কাগজ থাকে না।",
  },
  "rf.raiseNote": {
    en: "For money that was never ours (overpayment, a duplicate settlement) or a decision someone made (goodwill). Customer cancellations are not raised here — approving the request creates those, so the charge schedule cannot be bypassed.",
    bn: "যে টাকা কখনোই আমাদের ছিল না (বাড়তি জমা, দুবার পরিশোধ) বা কারো সিদ্ধান্তে দেওয়া (সদিচ্ছা) — তার জন্য। গ্রাহকের বাতিলের ফেরত এখানে তোলা হয় না — আবেদন অনুমোদন দিলেই সেটি তৈরি হয়, যাতে চার্জের নিয়ম এড়ানো না যায়।",
  },
  "rf.amountNote": {
    en: "Checked server-side against what the booking actually received — a refund can never exceed the money that came in.",
    bn: "বুকিংয়ে আসলে কত টাকা এসেছে তা সার্ভারেই মিলিয়ে দেখা হয় — জমা টাকার বেশি ফেরত কখনোই যাবে না।",
  },
  "rf.overrideNote": {
    en: "Reopens a closed accounting period, so the note is mandatory.",
    bn: "বন্ধ হয়ে যাওয়া হিসাবের সময় আবার খোলে, তাই মন্তব্য বাধ্যতামূলক।",
  },

  "rm.releaseNote": {
    en: "Releasing puts this room back on sale — customers will be able to book it again.",
    bn: "ছেড়ে দিলে রুমটি আবার বিক্রির জন্য খুলে যাবে — গ্রাহক আবার বুক করতে পারবেন।",
  },
  "rm.heldBy": { en: "Held by {user}", bn: "আটকে রেখেছেন {user}" },
  "rm.held": { en: "Held", bn: "আটকানো" },

  "gr.bookedOnly": {
    en: "Only booked cabins — the dues collection sheet.",
    bn: "শুধু বুক হওয়া কেবিন — বকেয়া আদায়ের তালিকা।",
  },
  "gr.allCabins": {
    en: "Every cabin — booked first, then the available ones.",
    bn: "সব কেবিন — আগে বুক হওয়াগুলো, তারপর খালিগুলো।",
  },
  "gr.bookedRooms": { en: "Booked rooms", bn: "বুক হওয়া রুম" },
  "gr.allRooms": { en: "All rooms", bn: "সব রুম" },
  "cd.title": { en: "Cancel this departure", bn: "এই যাত্রা বাতিল করুন" },
  "cd.warning": {
    en: "Every active booking on {trip} will be cancelled and refunded in full — no cancellation charge, because the customer did not choose this. Each one is emailed automatically.",
    bn: "{trip} — এই যাত্রার প্রতিটি সচল বুকিং বাতিল হবে এবং পুরো টাকা ফেরত যাবে। কোনো বাতিল চার্জ কাটা হবে না, কারণ সিদ্ধান্তটি গ্রাহকের নয়। প্রত্যেককে নিজে থেকেই ইমেইল চলে যাবে।",
  },
  "cd.reasonLabel": {
    en: "Why is the departure being cancelled?",
    bn: "যাত্রা কেন বাতিল হচ্ছে?",
  },
  "cd.reasonPlaceholder": {
    en: "e.g. Cyclone warning — port authority has suspended sailings",
    bn: "যেমন: ঘূর্ণিঝড়ের সতর্কতা — বন্দর কর্তৃপক্ষ চলাচল বন্ধ রেখেছে",
  },
  "cd.preview": { en: "Preview the impact", bn: "কী হবে আগে দেখুন" },
  "cd.previewNote": {
    en: "Nothing has happened yet — this is the preview",
    bn: "এখনো কিছুই হয়নি — এটি শুধু দেখানো হচ্ছে",
  },
  "cd.bookings": { en: "Bookings", bn: "বুকিং" },
  "cd.guests": { en: "Guests", bn: "অতিথি" },
  "cd.toRefund": { en: "To refund", bn: "ফেরত দিতে হবে" },
  "cd.noBookings": {
    en: "No active bookings on this departure — cancelling it affects nobody.",
    bn: "এই যাত্রায় কোনো সচল বুকিং নেই — বাতিল করলে কারো কিছু যায় আসে না।",
  },
  "cd.confirm": {
    en: "Cancel departure and refund {amount}",
    bn: "যাত্রা বাতিল করে {amount} ফেরত দিন",
  },
  "cd.cannotUndo": { en: "This cannot be undone.", bn: "এটি আর ফেরানো যাবে না।" },
  "cd.done": {
    en: "Departure cancelled — {n} refund(s) raised, {amount} owed.",
    bn: "যাত্রা বাতিল হয়েছে — {n}টি ফেরত তোলা হয়েছে, {amount} দিতে হবে।",
  },

  /* Error messages — shown in toasts, so they carry the whole story */
  "err.thisField": { en: "This", bn: "এই ঘরটি" },
  "err.fieldCutoff": { en: "Booking cutoff", bn: "বুকিং বন্ধের সময়" },
  "err.fieldMinDeposit": { en: "Minimum deposit", bn: "সর্বনিম্ন জমা" },
  "err.fieldBalanceDue": { en: "Balance due deadline", bn: "বাকি টাকার শেষ তারিখ" },
  "err.fieldDurationDays": { en: "Duration in days", bn: "কত দিন" },
  "err.fieldDurationNights": { en: "Duration in nights", bn: "কত রাত" },
  "err.fieldTitle": { en: "Title", bn: "শিরোনাম" },
  "err.fieldDescription": { en: "Description", bn: "বিবরণ" },
  "err.fieldOfferType": { en: "Offer type", bn: "অফারের ধরন" },
  "err.fieldOfferAmount": { en: "Offer amount", bn: "অফারের পরিমাণ" },
  "err.fieldOfferName": { en: "Offer name", bn: "অফারের নাম" },
  "err.fieldOfferEnds": { en: "Offer end date", bn: "অফার শেষের তারিখ" },
  "err.fieldBookingOpen": { en: "Booking open", bn: "বুকিং খোলা" },
  "err.required": { en: "{field} is required.", bn: "{field} দিতে হবে।" },
  "err.blank": { en: "{field} cannot be left empty.", bn: "{field} খালি রাখা যাবে না।" },
  "err.badDate": {
    en: "{field} must be a real date, written as YYYY-MM-DD.",
    bn: "{field} একটি সত্যিকারের তারিখ হতে হবে, YYYY-MM-DD আকারে।",
  },
  "err.badDateTime": {
    en: "{field} must be a real date and time.",
    bn: "{field} একটি সত্যিকারের তারিখ ও সময় হতে হবে।",
  },
  "err.notNumber": { en: "{field} must be a number.", bn: "{field} একটি সংখ্যা হতে হবে।" },
  "err.notWhole": {
    en: "{field} must be a whole number.",
    bn: "{field} পূর্ণসংখ্যা হতে হবে।",
  },
  "err.tooLow": { en: "{field} cannot be below {min}.", bn: "{field} {min}-এর কম হতে পারবে না।" },
  "err.tooHigh": {
    en: "{field} cannot be above {max}.",
    bn: "{field} {max}-এর বেশি হতে পারবে না।",
  },
  "err.badChoice": {
    en: "{field} is not one of the allowed options.",
    bn: "{field} অনুমোদিত বিকল্পগুলোর একটি নয়।",
  },
  "err.notValid": { en: "{field} is not valid.", bn: "{field} ঠিক নেই।" },
  "err.andMore": {
    en: "(+{n} more problem(s))",
    bn: "(আরও {n}টি সমস্যা)",
  },
  "err.offline": {
    en: "Couldn't reach the server. Check your internet connection and try again.",
    bn: "সার্ভারে পৌঁছানো গেল না। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।",
  },
  "err.expired": {
    en: "Your session has expired — please sign in again.",
    bn: "আপনার সেশনের সময় শেষ — আবার সাইন ইন করুন।",
  },
  "err.forbidden": {
    en: "You don't have permission to do that.",
    bn: "এই কাজটি করার অনুমতি আপনার নেই।",
  },
  "err.gone": {
    en: "That item no longer exists. It may have been deleted by someone else.",
    bn: "জিনিসটি আর নেই। অন্য কেউ হয়তো মুছে ফেলেছেন।",
  },
  "err.notAllowed": { en: "That action isn't allowed here.", bn: "এখানে এই কাজটি করা যাবে না।" },
  "err.tooLarge": {
    en: "That file is too large. Try a smaller one.",
    bn: "ফাইলটি অনেক বড়। ছোট একটি দিন।",
  },
  "err.tooMany": {
    en: "Too many attempts in a row. Wait a minute, then try again.",
    bn: "পরপর অনেকবার চেষ্টা হয়েছে। এক মিনিট পর আবার চেষ্টা করুন।",
  },
  "err.serverBroke": {
    en: "Something broke on the server. Try once more — if it keeps happening, report it.",
    bn: "সার্ভারে কিছু একটা ভেঙেছে। আরেকবার চেষ্টা করুন — বারবার হলে জানান।",
  },
  "err.restarting": {
    en: "The server is restarting. Give it a moment and try again.",
    bn: "সার্ভার আবার চালু হচ্ছে। একটু সময় দিয়ে আবার চেষ্টা করুন।",
  },
  "err.timeout": {
    en: "The server took too long to answer. Try again.",
    bn: "সার্ভার উত্তর দিতে অনেক দেরি করেছে। আবার চেষ্টা করুন।",
  },

  "time.justNow": { en: "just now", bn: "এইমাত্র" },
  "time.minsAgo": { en: "{n}m ago", bn: "{n} মিনিট আগে" },
  "time.hoursAgo": { en: "{n}h ago", bn: "{n} ঘণ্টা আগে" },
  "time.daysAgo": { en: "{n}d ago", bn: "{n} দিন আগে" },

  "bk.matchingFilters": { en: "Matching current filters", bn: "এখনকার ছাঁকনির সঙ্গে মিলে" },
  "bk.allBookings": { en: "All bookings", bn: "সব বুকিং" },
  "bk.ofBooked": { en: "of {amount} booked", bn: "{amount} বুক হওয়ার মধ্যে" },
  "bk.toCollect": { en: "To collect", bn: "আদায় করতে হবে" },
  "bk.ofActive": { en: "Of active bookings", bn: "সচল বুকিংয়ের মধ্যে" },
  "bk.refundOwedPaid": {
    en: "Refund owed — {amount} paid on this booking",
    bn: "ফেরত বাকি — এই বুকিংয়ে {amount} জমা হয়েছে",
  },
  "bk.markRefunded": { en: "Mark refunded", bn: "ফেরত দেওয়া হয়েছে চিহ্নিত করুন" },
  "bk.resolvedStamp": { en: "Resolved: {note}", bn: "মীমাংসা: {note}" },
  "bk.refundedWord": { en: "refunded", bn: "ফেরত দেওয়া হয়েছে" },
  "bk.recordCash": {
    en: "Record cash payment (due {amount})",
    bn: "নগদ পেমেন্ট লিখুন (বাকি {amount})",
  },
  "bk.invoiceDue": { en: "Due {amount}", bn: "বাকি {amount}" },
  "bk.byUser": { en: "by {user}", bn: "— {user}" },
  "bk.paidCharge": {
    en: "Paid {paid} · charge {charge}",
    bn: "জমা {paid} · চার্জ {charge}",
  },
  "bk.refundLine": { en: "refund {amount}", bn: "ফেরত {amount}" },
  "bk.shortfallNote": {
    en: "{amount} of the charge is not covered by the deposit — recorded only, never billed.",
    bn: "চার্জের {amount} জমা টাকায় কুলায়নি — শুধু হিসাবে লেখা থাকল, বিল করা হবে না।",
  },
  "bk.paymentInProgress": {
    en: "⚠ A payment is still open at the gateway. It can settle after you cancel — that money would then need refunding too. Ask the customer to close the payment page, or check back in a few minutes.",
    bn: "⚠ গেটওয়েতে একটি পেমেন্ট এখনো খোলা আছে। বাতিলের পরেও সেটি সফল হতে পারে — তখন ওই টাকাও ফেরত দিতে হবে। গ্রাহককে পেমেন্টের পাতা বন্ধ করতে বলুন, বা কয়েক মিনিট পর আবার দেখুন।",
  },
  "bk.cannotCancel": {
    en: "This booking cannot be cancelled ({reason}).",
    bn: "এই বুকিংটি বাতিল করা যাবে না ({reason})।",
  },

  "cb.nowVisible": {
    en: "Cabin is now visible on the website.",
    bn: "কেবিনটি এখন ওয়েবসাইটে দেখা যাচ্ছে।",
  },
  "cb.nowHidden": {
    en: "Cabin hidden from the website.",
    bn: "কেবিনটি ওয়েবসাইট থেকে লুকানো হয়েছে।",
  },
  "cb.hideFromSite": { en: "Hide from website", bn: "ওয়েবসাইট থেকে লুকান" },
  "cb.showOnSite": { en: "Show on website", bn: "ওয়েবসাইটে দেখান" },
  "cb.confirmDelete": {
    en: "Delete “{name}” and all its photos? This cannot be undone.",
    bn: "“{name}” আর তার সব ছবি মুছে ফেলবেন? এটি আর ফেরানো যাবে না।",
  },
  "cb.updated": { en: "Cabin updated.", bn: "কেবিন বদলানো হয়েছে।" },
  "cb.createdAddPhotos": {
    en: "Cabin created — now add photos.",
    bn: "কেবিন তৈরি হয়েছে — এবার ছবি যোগ করুন।",
  },
  "cb.createCabin": { en: "Create cabin", bn: "কেবিন তৈরি করুন" },
  "cb.namePlaceholder": { en: "Premier Balcony Suite", bn: "প্রিমিয়ার ব্যালকনি স্যুট" },
  "cb.taglinePlaceholder": {
    en: "Floor-to-ceiling glass, private deck, river at your doorstep.",
    bn: "মেঝে থেকে ছাদ পর্যন্ত কাচ, নিজস্ব ডেক, দরজার সামনেই নদী।",
  },
  "cb.featuresPlaceholder": {
    en: "Private river-facing balcony\nKing-size bed with Egyptian cotton",
    bn: "নদীমুখী নিজস্ব ব্যালকনি\nমিশরীয় সুতির চাদরে কিং-সাইজ বিছানা",
  },

  "fm.hideFromMenu": { en: "Hide from menu", bn: "মেনু থেকে লুকান" },
  "fm.showOnMenu": { en: "Show on menu", bn: "মেনুতে দেখান" },

  "msg.confirmDelete": {
    en: "Delete the message from {name}?",
    bn: "{name}-এর পাঠানো বার্তাটি মুছে ফেলবেন?",
  },

  "pk.emptyActive": { en: "No packages yet.", bn: "এখনো কোনো প্যাকেজ নেই।" },
  "pk.emptyPast": {
    en: "No sailings have finished yet.",
    bn: "এখনো কোনো যাত্রা শেষ হয়নি।",
  },
  "pk.emptyCancelled": {
    en: "Nothing has been cancelled — which is the way it should be.",
    bn: "কিছুই বাতিল হয়নি — এমনটাই তো হওয়ার কথা।",
  },
  "pk.noMatch": {
    en: "No packages match these filters.",
    bn: "এই ছাঁকনির সঙ্গে কোনো প্যাকেজ মেলেনি।",
  },
  "pk.notOpen": { en: "Not open", bn: "খোলা নেই" },
  "pk.manuallyClosed": { en: "Manually closed", bn: "হাতে বন্ধ করা" },
  "pk.noCutoffSet": { en: "No cutoff set", bn: "বন্ধের সময় দেওয়া নেই" },
  "pk.cutoffPassed": { en: "Cutoff passed", bn: "বন্ধের সময় পেরিয়ে গেছে" },
  "pk.closed": { en: "Closed", bn: "বন্ধ" },
  "pk.bookingReopened": { en: "Booking reopened.", bn: "বুকিং আবার খোলা হয়েছে।" },
  "pk.bookingClosed": { en: "Booking closed.", bn: "বুকিং বন্ধ করা হয়েছে।" },
  "pk.closeBooking": { en: "Close booking", bn: "বুকিং বন্ধ করুন" },
  "pk.reopenBooking": { en: "Reopen booking", bn: "বুকিং আবার খুলুন" },
  "pk.shipSailing": { en: "{ship} sailing", bn: "{ship}-এর যাত্রা" },
  "pk.perAdult": { en: "{amount} / adult", bn: "জনপ্রতি {amount}" },
  "pk.nights": { en: "{n}N", bn: "{n} রাত" },
  "pk.updated": { en: "Package updated.", bn: "প্যাকেজ বদলানো হয়েছে।" },
  "pk.created": { en: "Package created.", bn: "প্যাকেজ তৈরি হয়েছে।" },
  "pk.editTitle": { en: "Edit — {name}", bn: "সম্পাদনা — {name}" },
  "pk.chooseAnother": { en: "Choose a different photo", bn: "অন্য একটি ছবি বাছুন" },
  "pk.choosePhoto": { en: "Choose a photo", bn: "একটি ছবি বাছুন" },

  "rf.bankTransfer": { en: "Bank transfer", bn: "ব্যাংক ট্রান্সফার" },
  "rf.paymentGateway": { en: "Payment gateway", bn: "পেমেন্ট গেটওয়ে" },
  "rf.queueTab": { en: "Cancellation queue", bn: "বাতিলের সারি" },
  "rf.registerTab": { en: "Refund register", bn: "ফেরতের খাতা" },
  "rf.shortfallNote": {
    en: "Charge not covered by the deposit: {amount} — recorded only, never billed.",
    bn: "জমা টাকায় চার্জের যতটা কুলায়নি: {amount} — শুধু হিসাবে লেখা থাকল, বিল করা হবে না।",
  },
  "rf.noDestination": {
    en: "No payout destination recorded",
    bn: "টাকা কোথায় পাঠানো হবে তা লেখা নেই",
  },
  "rf.voidPrompt": {
    en: "Why is this refund being voided? (raised in error, duplicate row, wrong booking)",
    bn: "এই ফেরতটি কেন বাতিল করা হচ্ছে? (ভুলে তোলা, দুবার লেখা, ভুল বুকিং)",
  },
  "rf.recordPayout": { en: "Record payout — {amount}", bn: "পরিশোধ লিখুন — {amount}" },

  "rm.duesClear": { en: "All dues clear", bn: "কোনো বকেয়া নেই" },
  "rm.dueAmount": { en: "{amount} due", bn: "{amount} বকেয়া" },
  "rm.dueWith": { en: "Due {amount}", bn: "বাকি {amount}" },
  "rm.paxCount": { en: "{n} pax", bn: "{n} জন" },
  "rm.collectCash": {
    en: "Collect cash payment (due {amount})",
    bn: "নগদ টাকা নিন (বাকি {amount})",
  },
  "rm.blockFailed": { en: "Could not block the room.", bn: "রুমটি আটকানো গেল না।" },
  "rm.releasing": { en: "Releasing…", bn: "ছাড়া হচ্ছে…" },
  "rm.releaseRoom": { en: "Release room", bn: "রুম ছেড়ে দিন" },
  "rm.blocking": { en: "Blocking…", bn: "আটকানো হচ্ছে…" },
  "rm.blockRoom": { en: "Block room", bn: "রুম আটকান" },
  "pk.highlightsPlaceholder": {
    en: "Mangrove safari\nSunset dinner",
    bn: "ম্যানগ্রোভ সাফারি\nসূর্যাস্তের নৈশভোজ",
  },
  "shell.expand": { en: "Expand sidebar", bn: "সাইডবার খুলুন" },
  "shell.collapse": { en: "Collapse sidebar", bn: "সাইডবার গুটান" },
} as const;

export type StringKey = keyof typeof STRINGS;
