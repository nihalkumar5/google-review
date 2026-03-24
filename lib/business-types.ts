import type { Locale } from "@/lib/translations";
import type { BusinessType } from "@/types/business";

export const businessTypeValues: BusinessType[] = [
  "cafe",
  "salon",
  "clinic",
  "gym",
  "hotel"
];

const labels: Record<Locale, Record<BusinessType, string>> = {
  en: {
    cafe: "Cafe",
    salon: "Salon",
    clinic: "Clinic",
    gym: "Gym",
    hotel: "Hotel"
  },
  hi: {
    cafe: "कैफे",
    salon: "सैलून",
    clinic: "क्लिनिक",
    gym: "जिम",
    hotel: "होटल"
  }
};

const suggestions: Record<Locale, Record<BusinessType, string[]>> = {
  en: {
    cafe: [
      "Amazing food and great ambience!",
      "Loved the coffee and service!"
    ],
    salon: [
      "Very professional service, highly recommended!",
      "Great staff and clean environment!"
    ],
    clinic: [
      "Doctor was very helpful and explained everything clearly.",
      "Clean clinic and a smooth experience."
    ],
    gym: [
      "Great equipment and very supportive trainers!",
      "Clean space, strong energy, and a motivating atmosphere."
    ],
    hotel: [
      "Comfortable stay with very helpful staff.",
      "Clean rooms and a smooth check-in experience."
    ]
  },
  hi: {
    cafe: [
      "खाना और ambience दोनों शानदार थे!",
      "कॉफी और सर्विस बहुत पसंद आई!"
    ],
    salon: [
      "बहुत professional service, ज़रूर recommend करूंगा/करूंगी!",
      "स्टाफ बहुत अच्छा था और जगह साफ़-सुथरी थी!"
    ],
    clinic: [
      "डॉक्टर बहुत helpful थे और सब कुछ अच्छे से समझाया।",
      "क्लिनिक साफ़ था और पूरा अनुभव स्मूथ रहा।"
    ],
    gym: [
      "Equipment बढ़िया है और trainers बहुत supportive हैं!",
      "जगह साफ़ है और workout atmosphere motivating है।"
    ],
    hotel: [
      "स्टे बहुत comfortable था और staff काफी helpful था।",
      "कमरे साफ़ थे और check-in experience smooth था।"
    ]
  }
};

const photoIdeas: Record<Locale, Record<BusinessType, string[]>> = {
  en: {
    cafe: ["Coffee cup photo", "Interior ambience shot", "Favorite dish close-up"],
    salon: ["Before and after result", "Clean setup photo", "Styling chair shot"],
    clinic: ["Reception or waiting area", "Clean treatment room", "Clinic exterior photo"],
    gym: ["Workout floor photo", "Equipment zone shot", "Trainer support moment"],
    hotel: ["Room setup photo", "Lobby or ambience shot", "Breakfast or amenities photo"]
  },
  hi: {
    cafe: ["कॉफी कप की फोटो", "इंटीरियर ambience शॉट", "फेवरेट डिश का क्लोज़-अप"],
    salon: ["Before और after result", "साफ़ setup की फोटो", "styling chair शॉट"],
    clinic: ["Reception या waiting area", "clean treatment room", "clinic exterior photo"],
    gym: ["Workout floor photo", "equipment zone शॉट", "trainer support moment"],
    hotel: ["Room setup photo", "lobby या ambience shot", "breakfast या amenities photo"]
  }
};

export function isBusinessType(value: string): value is BusinessType {
  return businessTypeValues.includes(value as BusinessType);
}

export function inferBusinessType(source: string) {
  const normalized = source.toLowerCase();

  if (
    normalized.includes("clinic") ||
    normalized.includes("doctor") ||
    normalized.includes("dental") ||
    normalized.includes("hospital")
  ) {
    return "clinic" as const;
  }

  if (normalized.includes("salon") || normalized.includes("spa")) {
    return "salon" as const;
  }

  if (
    normalized.includes("gym") ||
    normalized.includes("fitness") ||
    normalized.includes("workout")
  ) {
    return "gym" as const;
  }

  if (
    normalized.includes("hotel") ||
    normalized.includes("stay") ||
    normalized.includes("resort")
  ) {
    return "hotel" as const;
  }

  return "cafe" as const;
}

export function getBusinessTypeLabel(type: BusinessType, locale: Locale) {
  return labels[locale][type];
}

export function getReviewSuggestions(type: BusinessType, locale: Locale) {
  return suggestions[locale][type];
}

export function getPhotoSuggestions(type: BusinessType, locale: Locale) {
  return photoIdeas[locale][type];
}

export function getDefaultWhatsAppMessage(name: string) {
  return `Hi ${name}, I would like to share some private feedback about my recent experience.`;
}
