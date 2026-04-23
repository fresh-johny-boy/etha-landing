import type { Archetype } from "./quizDataContract";

export type RitualMoment = {
  time: string;
  label: string;
  body: string;
  botanical: ArchetypeBotanical;
};

export type ArchetypeBotanical = {
  name: string;
  subtitle: string;
  rationale: string;
};

export type ArchetypeContent = {
  name: string;
  poeticName: string;
  heroLine: string;
  scienceParagraphs: string[];
  ritual: {
    sunrise: RitualMoment;
    midday: RitualMoment;
    evening: RitualMoment;
  };
};

export const ARCHETYPES: Record<Archetype, ArchetypeContent> = {
  vata: {
    name: "Vata",
    poeticName: "Kinetic Mind",
    heroLine: "The rhythm of air and ether. Moving, reaching, asking what is next.",
    scienceParagraphs: [
      "Your constitution is the one that begins first. Quick to start, quick to scatter. In modern terms: a nervous system tuned for novelty, for movement, for signals the room has not noticed yet.",
      "The 5,000-year-old system calls this the constitution of wind. It means your warmth leaves your body through your hands. Your sleep is light. Your attention is a flock, not a line.",
      "What you need is not stimulation. You already have that. What you need is a floor. Warmth that returns to you. Rhythms you can place yourself inside.",
    ],
    ritual: {
      sunrise: {
        time: "Sunrise",
        label: "7am",
        body: "Begin slowly. Warm water before anything else. Sit with a hand on the belly for one minute. You are allowed to be here before you are useful.",
        botanical: {
          name: "Morning Ground",
          subtitle: "Warming. Steadying. For a nervous system that has been awake too long.",
          rationale: "The morning blend meets you where wind meets air. It is the first weight you carry back into your body.",
        },
      },
      midday: {
        time: "Midday",
        label: "2pm",
        body: "Eat the warmest meal of your day. Sit to eat it. Let the second half of the afternoon find you already settled.",
        botanical: {
          name: "Midday Anchor",
          subtitle: "For the hour your hands go cold and your plans multiply.",
          rationale: "This is the moment your rhythm splinters. The botanical here is ballast, not caffeine. It is the thing that keeps you at your own table.",
        },
      },
      evening: {
        time: "Evening",
        label: "9pm",
        body: "Warm oil on the soles of the feet. Heavy socks. A room with the light already low. You are not going to sleep. You are returning.",
        botanical: {
          name: "Night Return",
          subtitle: "The last step back into the body before sleep.",
          rationale: "A spirit of wind does not land easily. The evening blend is the breath let out. It is the invitation to finally stop listening for the next thing.",
        },
      },
    },
  },

  pitta: {
    name: "Pitta",
    poeticName: "Fiery Mind",
    heroLine: "The rhythm of fire and water. Sharp, precise, burning at the edge of its own clarity.",
    scienceParagraphs: [
      "Your constitution is the one that transforms. You run warm. You think in conclusions. Your body turns food into heat faster than most people around you. In modern terms: a metabolism and an attention that both run hot.",
      "The 5,000-year-old system calls this the constitution of fire. It is why your hands are always warm. Why your opinions arrive fully formed. Why rest, for you, feels like losing.",
      "What you need is not more intensity. You have enough. What you need is cooling. Softness that does not apologise for itself. Permission to be imprecise for an hour.",
    ],
    ritual: {
      sunrise: {
        time: "Sunrise",
        label: "7am",
        body: "Before the first email, fifteen minutes of something you will not be rewarded for. A walk without a destination. The window open. Cold water on your face.",
        botanical: {
          name: "Morning Cool",
          subtitle: "For a body that woke up already on.",
          rationale: "A fire that starts before sunrise burns through what it should have saved. The morning blend is the pause before ignition.",
        },
      },
      midday: {
        time: "Midday",
        label: "2pm",
        body: "Step outside the building. Ten minutes. No phone. Let the sharpness go a little blurry. Come back and the afternoon will be kinder to you.",
        botanical: {
          name: "Midday Soften",
          subtitle: "When the clarity has become an edge.",
          rationale: "This is the moment the heat turns critical, of yourself first, of others second. The botanical is the cool hand on the shoulder that steps you back from it.",
        },
      },
      evening: {
        time: "Evening",
        label: "9pm",
        body: "Finish the day undone. Leave one thing for tomorrow. Take the eyes off the screen an hour before sleep. Something warm, not hot, to drink.",
        botanical: {
          name: "Night Cool",
          subtitle: "The rest a fire needs that it will never ask for.",
          rationale: "The evening blend does what your mind is refusing to do. It admits the day is over. It lets the heat finally leave the body.",
        },
      },
    },
  },

  kapha: {
    name: "Kapha",
    poeticName: "Grounded Mind",
    heroLine: "The rhythm of earth and water. Steady, rooted, slow to move and slow to let go.",
    scienceParagraphs: [
      "Your constitution is the one that holds. You sleep deeply. You trust what has lasted. Your body stores what it receives more carefully than most. In modern terms: a system built for endurance and for love, not for sprinting through the morning.",
      "The 5,000-year-old system calls this the constitution of earth. It is why mornings are the hardest hour of your day. Why your presence is steadying to the people near you. Why you have been carrying things, literally and otherwise, for years.",
      "What you need is not more comfort. You already know comfort. What you need is activation. Warmth that moves. A small, honest challenge placed at the start of the day.",
    ],
    ritual: {
      sunrise: {
        time: "Sunrise",
        label: "7am",
        body: "Rise before the body wants to. Move first. Warm, not cold. A short walk. The window open to what the morning actually smells of.",
        botanical: {
          name: "Morning Wake",
          subtitle: "Warming. Moving. For a body that prefers to stay.",
          rationale: "The earth does not start itself. The morning blend is the small flame held to the fuel. It is the first yes of the day.",
        },
      },
      midday: {
        time: "Midday",
        label: "2pm",
        body: "A lighter lunch than you think you want. Walk after eating, even ten minutes. Let the middle of your day have a little edge to it.",
        botanical: {
          name: "Midday Lift",
          subtitle: "When the afternoon threatens to flatten.",
          rationale: "The botanical here is warmth in motion, not warmth at rest. It is the thing that keeps you leaning forward into the rest of the day.",
        },
      },
      evening: {
        time: "Evening",
        label: "9pm",
        body: "Sleep at the edge of what feels indulgent, not past it. Something honest in the evening. A real conversation. A slow, grounded thing.",
        botanical: {
          name: "Night Settle",
          subtitle: "The steady hand at the end of a steady day.",
          rationale: "You sleep well already. The evening blend is not for sleep. It is for the quality of the morning after, so the earth lifts a little easier tomorrow.",
        },
      },
    },
  },
};

export const DEFAULT_MIRROR_ECHOES: Record<Archetype, string[]> = {
  vata: [
    "Because you said your sleep is light and interrupted, and your hands are always borrowing warmth from the world.",
    "Because when pressure arrives, your centre scatters before it sharpens.",
    "Because the space your mind rests in is silence, and water, and soft light.",
  ],
  pitta: [
    "Because you said your skin is warm, flushed, quick to react, and your hands consistently run hot.",
    "Because under pressure you sharpen, and then you begin to control the room.",
    "Because the inner season you are living right now is summer, intense and sometimes overwhelming.",
  ],
  kapha: [
    "Because you said your sleep is deep and long, and your energy builds in slow crescendos through the day.",
    "Because what you crave most is comfort, connection, and deep stillness.",
    "Because lately your body has felt heavy, congested, and slow to recover.",
  ],
};
