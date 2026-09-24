// ============================================================
// SAMPLE DERMATOLOGIST DIRECTORY — placeholder profiles for the demo.
// These are NOT real doctors. Every profile is shown with a
// "Sample profile" label. No ratings are included. Replace with a
// verified directory / telemedicine API via lib/catalog.js.
// ============================================================

export const CONSULT_MODES = {
  video:  { label: 'Video consultation', short: 'Video', icon: 'camera' },
  chat:   { label: 'Chat consultation',  short: 'Chat',  icon: 'chat' },
  clinic: { label: 'Clinic appointment', short: 'Clinic', icon: 'home' },
};

export const EXPERTISE = ['Acne & acne scars', 'Pigmentation', 'Sensitive skin & rosacea', 'Eczema & dermatitis', 'Hair & scalp', 'Cosmetic dermatology', 'Paediatric dermatology'];

// schedule: weekday numbers (0 = Sun) and daily time slots (24h)
export const DOCTORS = [
  { id: 'd-meera', name: 'Dr. Meera K.', qualification: 'MBBS, MD (Dermatology)', experience: 11,
    specialization: 'Clinical dermatology', expertise: ['Acne & acne scars', 'Pigmentation'],
    modes: ['video', 'clinic'], fees: { video: 600, clinic: 800 }, languages: ['English', 'Hindi', 'Marathi'],
    city: 'Mumbai', area: 'Andheri West',
    about: 'Focuses on acne-prone and pigmentation-prone skin, with an emphasis on simple, sustainable routines.',
    schedule: { days: [1, 2, 3, 4, 5], slots: ['10:00', '11:00', '12:00', '16:00', '17:00'] } },
  { id: 'd-arjun', name: 'Dr. Arjun S.', qualification: 'MBBS, DNB (Dermatology)', experience: 8,
    specialization: 'Dermatology & venereology', expertise: ['Eczema & dermatitis', 'Sensitive skin & rosacea'],
    modes: ['video', 'chat'], fees: { video: 500, chat: 300 }, languages: ['English', 'Hindi'],
    city: 'Delhi', area: 'Online only',
    about: 'Works with people who have reactive, easily irritated skin and long-standing dryness.',
    schedule: { days: [1, 3, 5, 6], slots: ['09:30', '10:30', '18:00', '19:00', '20:00'] } },
  { id: 'd-lakshmi', name: 'Dr. Lakshmi R.', qualification: 'MBBS, MD (Dermatology)', experience: 15,
    specialization: 'Cosmetic & clinical dermatology', expertise: ['Pigmentation', 'Cosmetic dermatology'],
    modes: ['clinic', 'video'], fees: { clinic: 1000, video: 700 }, languages: ['English', 'Tamil', 'Telugu'],
    city: 'Chennai', area: 'T. Nagar',
    about: 'Interested in pigmentation on deeper skin tones and sun-protection habits.',
    schedule: { days: [2, 4, 6], slots: ['11:00', '12:00', '15:00', '16:00'] } },
  { id: 'd-imran', name: 'Dr. Imran H.', qualification: 'MBBS, MD (Dermatology)', experience: 6,
    specialization: 'Clinical dermatology', expertise: ['Acne & acne scars', 'Hair & scalp'],
    modes: ['chat', 'video'], fees: { chat: 250, video: 450 }, languages: ['English', 'Hindi', 'Urdu'],
    city: 'Hyderabad', area: 'Online only',
    about: 'Helps young adults build routines for acne-prone skin and oily scalps.',
    schedule: { days: [0, 1, 2, 3, 4], slots: ['19:00', '19:30', '20:00', '20:30', '21:00'] } },
  { id: 'd-priyanka', name: 'Dr. Priyanka D.', qualification: 'MBBS, DDVL', experience: 9,
    specialization: 'Paediatric & family dermatology', expertise: ['Paediatric dermatology', 'Eczema & dermatitis'],
    modes: ['clinic', 'video', 'chat'], fees: { clinic: 700, video: 550, chat: 300 }, languages: ['English', 'Bengali', 'Hindi'],
    city: 'Kolkata', area: 'Salt Lake',
    about: 'Sees families with children and teens; gentle, step-by-step skincare plans.',
    schedule: { days: [1, 2, 4, 5], slots: ['10:00', '10:30', '11:00', '17:30', '18:00'] } },
  { id: 'd-rohit', name: 'Dr. Rohit P.', qualification: 'MBBS, MD (Dermatology)', experience: 13,
    specialization: 'Clinical dermatology', expertise: ['Sensitive skin & rosacea', 'Pigmentation', 'Acne & acne scars'],
    modes: ['video', 'clinic'], fees: { video: 650, clinic: 900 }, languages: ['English', 'Hindi', 'Kannada'],
    city: 'Bengaluru', area: 'Indiranagar',
    about: 'Particular interest in redness-prone skin and post-acne marks.',
    schedule: { days: [1, 2, 3, 5, 6], slots: ['09:00', '10:00', '14:00', '15:00', '18:00'] } },
];

/** Next `count` open slots from now, based on the weekly schedule. */
export function upcomingSlots(doctor, count = 12, from = new Date()) {
  const out = [];
  for (let d = 0; d < 21 && out.length < count; d++) {
    const day = new Date(from.getFullYear(), from.getMonth(), from.getDate() + d);
    if (!doctor.schedule.days.includes(day.getDay())) continue;
    for (const t of doctor.schedule.slots) {
      const [h, m] = t.split(':').map(Number);
      const slot = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m);
      if (slot.getTime() > from.getTime() + 60 * 60 * 1000) out.push(slot);
      if (out.length >= count) break;
    }
  }
  return out;
}
