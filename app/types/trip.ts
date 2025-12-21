export type TripStatus = "waitlist" | "open" | "full" | "closed";

export type Leader = {
  name: string;
  role: string;
  image: string;
  bio: string;
};

export type Trip = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  dates: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  location: string;
  difficulty: string;
  bannerImage: string;
  status: TripStatus;
  summary: string;
  highlights: string[];
  stargazing?: {
    title: string;
    description: string;
  };
  dailyRhythm: string[];
  leadership: {
    outdoorLeads: Leader[];
    spiritualLeads: Leader[];
  };
  whoItsFor: string[];
  safety: string[];
};
