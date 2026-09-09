/**
 * The company's own identity and legal registration details.
 *
 * SSLCommerz's merchant compliance review requires these to be visible on the
 * live site (About Us, the policy pages and the footer), so they are collected
 * here rather than typed into each page — a licence number that appears in four
 * places is a licence number that will eventually disagree with itself.
 *
 * ⚠️ PENDING: the registration numbers below are placeholders. Replace them
 * with the values exactly as they appear on the trade licence — SSLCommerz
 * checks them against the documents, and a transposed digit fails the review.
 * `isPlaceholder` lets the UI hide a row rather than publish "———" to a
 * customer.
 */

const PENDING = "———";

export const COMPANY = {
  /** Trading name, as customers know it. */
  name: "MV Alaska Cruise",
  /** Registered name, exactly as printed on the trade licence. */
  legalName: "Jui Tourism and Shipping Lines",
  /** The registered address, as printed on the VAT certificate — this is the
   *  one the payment gateway checks against the documents, so it is Khulna and
   *  not the Dhaka office, however much more of the business runs from Dhaka. */
  address: {
    line1: "71 KDA Avenue, Sony Rangs Building",
    city: "Khulna-9100",
    country: "Bangladesh",
  },
  /** Second office, shown alongside the registered address. */
  branchAddress: {
    line1: "13/A Planners Tower, Banglamotor",
    city: "Dhaka",
    country: "Bangladesh",
  },
  support: {
    /** Most-preferred first: the first is what a single-slot mailto link uses
     *  and what is printed at the top of any list. */
    emails: ["juitourism@gmail.com", "mvalaskacruise@gmail.com"],
    phones: ["+880 1712-823482", "+880 1831-694307", "+880 1550-699732"],
  },
  /** Registration identifiers. BIN and DBID are genuinely optional — a business
   *  that is not VAT-registered has no BIN — so the UI drops empty ones rather
   *  than printing a blank line. */
  registration: {
    tradeLicence: "19/544",
    tin: "427546566086",
    bin: "007500079-0801",
    dbid: "",
  },
  /** Last time the policy documents were revised. Shown on each policy page:
   *  a policy with no date is one a customer cannot tell has changed. */
  policiesUpdated: "September 2026",
} as const;

export const isPlaceholder = (value: string) => !value || value === PENDING;

/** The address a single-slot mailto link should use. */
export const primaryEmail = COMPANY.support.emails[0];

/** The registration rows worth printing, skipping the ones not held. */
export function registrationRows(): { label: string; value: string }[] {
  const { tradeLicence, tin, bin, dbid } = COMPANY.registration;
  return [
    { label: "Trade Licence No.", value: tradeLicence },
    { label: "TIN", value: tin },
    { label: "BIN (VAT Reg.)", value: bin },
    { label: "DBID", value: dbid },
    // isPlaceholder, not just truthiness: PENDING is a run of em dashes, so a
    // plain `row.value` test happily published "Trade Licence No. ———" to
    // every visitor.
  ].filter((row) => !isPlaceholder(row.value));
}

/** Structural, not `typeof COMPANY.address`: `as const` narrows each address to
 *  its own literal type, so a signature tied to one of them rejects the other. */
type Address = { readonly line1: string; readonly city: string; readonly country: string };

export const fullAddress = (a: Address) => `${a.line1}, ${a.city}, ${a.country}`;
