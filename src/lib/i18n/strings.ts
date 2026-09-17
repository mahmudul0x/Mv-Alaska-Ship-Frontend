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
} as const;

export type StringKey = keyof typeof STRINGS;
