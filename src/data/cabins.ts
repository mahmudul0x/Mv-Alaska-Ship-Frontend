import img101 from "@/assets/101.jpeg";
import img102 from "@/assets/102.jpeg";
import img103 from "@/assets/103.jpeg";
import img109 from "@/assets/109.jpeg";

export type Cabin = {
  slug: string;
  /** Matches a backend RoomType.name — used to overlay the real base_price
   * and pax limits from GET /api/room-types/ onto this marketing content. */
  roomTypeName: string;
  name: string;
  tagline: string;
  img: string;
  gallery: string[];
  size: string;
  occupancy: string;
  price: string;
  priceNote: string;
  description: string;
  features: string[];
  amenities: { label: string; value: string }[];
  highlights: { title: string; desc: string }[];
};

export const cabins: Cabin[] = [
  {
    slug: "premier-balcony-suite",
    roomTypeName: "3-Person Room",
    name: "Premier Balcony Suite",
    tagline: "Floor-to-ceiling glass, private deck, river at your doorstep.",
    img: img103,
    gallery: [img103, img102, img109],
    size: "32 m²",
    occupancy: "2 Adults",
    price: "৳ 14,500",
    priceNote: "per night, inclusive of all meals",
    description:
      "The Premier Balcony Suite is the pinnacle of river living. Step through wide glass doors onto your private balcony and wake to the sounds of the Sundarbans. Wood-panel interiors, ambient lighting, and bespoke furnishings create an atmosphere of quiet luxury — while every meal, excursion, and naturalist tour is taken care of.",
    features: [
      "Private river-facing balcony",
      "King-size bed with Egyptian cotton",
      "Floor-to-ceiling glass sliding doors",
      "En-suite marble bathroom with rain shower",
      "Bespoke wood-panel interior",
      "Dedicated cabin steward",
    ],
    amenities: [
      { label: "Size", value: "32 m²" },
      { label: "Bed type", value: "King" },
      { label: "Occupancy", value: "2 Adults" },
      { label: "Bathroom", value: "En-suite marble" },
      { label: "View", value: "River-facing" },
      { label: "Internet", value: "Starlink Wi-Fi" },
      { label: "Climate", value: "Inverter AC" },
      { label: "Mini bar", value: "Complimentary" },
    ],
    highlights: [
      {
        title: "Private Balcony",
        desc: "Step outside at dawn and watch mist rise over the delta from your exclusive riverside terrace.",
      },
      {
        title: "Marble En-Suite",
        desc: "A full marble bathroom with rainfall shower, premium toiletries, and plush robes.",
      },
      {
        title: "Dedicated Steward",
        desc: "Your personal cabin steward is on call for turndown service, in-cabin dining, and any request.",
      },
    ],
  },
  {
    slug: "panorama-view-cabin",
    roomTypeName: "2-Person Room",
    name: "Panorama View Cabin",
    tagline: "Sweeping river views through floor-spanning panoramic windows.",
    img: img102,
    gallery: [img102, img103, img109],
    size: "26 m²",
    occupancy: "2 Adults",
    price: "৳ 11,200",
    priceNote: "per night, inclusive of all meals",
    description:
      "The Panorama View Cabin frames the Sundarbans like a living painting. Oversized panoramic windows span the full width of the cabin, flooding the space with natural light and wildlife views. A plush queen bed, premium linen, and warm ambient lighting make this the ideal sanctuary for couples and solo adventurers seeking comfort without compromise.",
    features: [
      "Full-span panoramic river windows",
      "Queen-size bed with premium bedding",
      "Ambient mood lighting system",
      "En-suite bathroom with shower",
      "Built-in wardrobe and vanity",
      "In-cabin breakfast service available",
    ],
    amenities: [
      { label: "Size", value: "26 m²" },
      { label: "Bed type", value: "Queen" },
      { label: "Occupancy", value: "2 Adults" },
      { label: "Bathroom", value: "En-suite" },
      { label: "View", value: "Panoramic river" },
      { label: "Internet", value: "Starlink Wi-Fi" },
      { label: "Climate", value: "Inverter AC" },
      { label: "Mini bar", value: "Available" },
    ],
    highlights: [
      {
        title: "Panoramic Windows",
        desc: "Watch kingfishers, spotted deer, and the occasional tiger from the comfort of your bed.",
      },
      {
        title: "Mood Lighting",
        desc: "Adjustable warm ambient lighting to set the perfect atmosphere at any hour.",
      },
      {
        title: "In-Cabin Dining",
        desc: "Order from our chef's menu and enjoy breakfast or late-night bites in your own space.",
      },
    ],
  },
  {
    slug: "family-suite",
    roomTypeName: "4-Person Room",
    name: "Family Suite",
    tagline: "Two bedrooms, a private lounge, and a double balcony for the whole family.",
    img: img101,
    gallery: [img101, img102, img103],
    size: "44 m²",
    occupancy: "4 Adults",
    price: "৳ 22,800",
    priceNote: "per night, inclusive of all meals",
    description:
      "The Family Suite is MV Alaska's grandest cabin — a full two-bedroom sanctuary with a spacious lounge, double balcony, and a dedicated butler. Designed for families and groups who want to share the Sundarbans adventure without sacrificing privacy or luxury, it offers the most generous living space on the vessel.",
    features: [
      "Two separate bedrooms",
      "Private lounge and living area",
      "Double balcony with river view",
      "Dedicated butler service",
      "Two full en-suite bathrooms",
      "Extra-capacity mini bar & refreshments",
    ],
    amenities: [
      { label: "Size", value: "44 m²" },
      { label: "Bedrooms", value: "2 (King + Twin)" },
      { label: "Occupancy", value: "4 Adults" },
      { label: "Bathrooms", value: "2 en-suite" },
      { label: "View", value: "Double balcony" },
      { label: "Internet", value: "Starlink Wi-Fi" },
      { label: "Climate", value: "Dual-zone AC" },
      { label: "Butler", value: "Dedicated" },
    ],
    highlights: [
      {
        title: "Double Balcony",
        desc: "Two separate outdoor terraces let every guest enjoy unobstructed views of the delta.",
      },
      {
        title: "Private Lounge",
        desc: "A furnished sitting room for the family to gather, relax, and plan the day's adventures.",
      },
      {
        title: "Dedicated Butler",
        desc: "A personal butler handles everything — from packing excursion bags to arranging private dinners.",
      },
    ],
  },
];
