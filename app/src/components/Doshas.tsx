import AuraButton from "./AuraButton";
import BlobImage from "./BlobImage";
import SectionDivider from "./SectionDivider";
import {
  SHAPE_FIRE,
  SHAPE_EARTH,
  SHAPE_SPACE,
  SHAPE_AIR,
  SHAPE_WATER,
} from "./auraShapes";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const ELEMENT_SHAPES: Record<string, string> = {
  Fire: SHAPE_FIRE,
  Earth: SHAPE_EARTH,
  Space: SHAPE_SPACE,
  Air: SHAPE_AIR,
  Water: SHAPE_WATER,
};

// Element images — same photos from Five Elements section
const ELEMENT_IMAGES: Record<string, { src: string; position: string }> = {
  Fire: { src: `${basePath}/images/fire.webp`, position: "center 40%" },
  Earth: { src: `${basePath}/images/earth.webp`, position: "center center" },
  Space: { src: `${basePath}/images/space.webp`, position: "center center" },
  Air: { src: `${basePath}/images/air.webp`, position: "center center" },
  Water: { src: `${basePath}/images/water.webp`, position: "center center" },
};

// Dosha aura shapes (0-1 normalized) — matched to brand guide p.65 Dosha Auras
const DOSHA_SHAPES: Record<string, string> = {
  // Vata: from Vita.svg — authentic brand guide Vata aura (energised, self-crossing, angular kinks)
  Vata: "M0.7722 0.1477C0.7738 0.1474 0.7754 0.1471 0.7769 0.1471C0.7877 0.1470 0.7975 0.1541 0.8052 0.1671C0.8240 0.1990 0.8403 0.3045 0.8405 0.3499C0.8407 0.4040 0.8285 0.4561 0.8064 0.4945C0.7868 0.5285 0.7588 0.5496 0.7311 0.5525C0.7243 0.5532 0.7175 0.5530 0.7107 0.5518C0.7097 0.5516 0.7081 0.5512 0.7070 0.5509L0.7056 0.5523C0.7032 0.5513 0.6989 0.5483 0.6967 0.5475C0.6776 0.5403 0.6587 0.5262 0.6389 0.5264C0.6258 0.5264 0.6129 0.5324 0.6015 0.5436C0.5485 0.5962 0.5564 0.7325 0.5156 0.8035C0.4844 0.8578 0.4368 0.8462 0.4062 0.7969C0.4025 0.7909 0.3995 0.7831 0.3959 0.7770C0.3768 0.7448 0.3539 0.7920 0.3336 0.7928C0.3244 0.7932 0.3179 0.7787 0.3168 0.7641C0.3145 0.7335 0.3301 0.7149 0.3305 0.6855C0.3304 0.6847 0.3304 0.6838 0.3303 0.6829C0.3295 0.6737 0.3265 0.6659 0.3220 0.6605C0.2985 0.6328 0.2726 0.6677 0.2480 0.6736C0.1727 0.6918 0.1503 0.5876 0.1913 0.4887C0.2029 0.4613 0.2176 0.4382 0.2346 0.4209C0.2868 0.3677 0.3336 0.3961 0.3895 0.3829C0.4416 0.3707 0.4300 0.3083 0.4527 0.2492C0.4614 0.2266 0.4778 0.2071 0.4923 0.1971C0.5216 0.1759 0.5587 0.1821 0.5877 0.2021C0.6180 0.2230 0.6351 0.2419 0.6699 0.2315C0.6845 0.2270 0.6985 0.2177 0.7111 0.2042C0.7315 0.1828 0.7478 0.1545 0.7722 0.1477Z",
  // Pitta: from pita.svg — authentic brand guide Pitta aura (organic, fire-textured contour)
  Pitta:
    "M0.4785 0.0986C0.4848 0.0993 0.4881 0.1025 0.4906 0.1069C0.4919 0.1092 0.4930 0.1119 0.4942 0.1149C0.4954 0.1179 0.4967 0.1212 0.4983 0.1245L0.4986 0.1250L0.4989 0.1251C0.4996 0.1253 0.5004 0.1254 0.5011 0.1255L0.5033 0.1259C0.5123 0.1274 0.5181 0.1325 0.5211 0.1404C0.5241 0.1483 0.5245 0.1594 0.5220 0.1735L0.5218 0.1751L0.5227 0.1756C0.5241 0.1765 0.5256 0.1773 0.5271 0.1783V0.1783C0.5335 0.1824 0.5380 0.1864 0.5415 0.1920C0.5451 0.1975 0.5478 0.2047 0.5506 0.2154L0.5511 0.2173L0.5521 0.2161C0.5561 0.2111 0.5628 0.2048 0.5674 0.2008H0.5674C0.6121 0.1626 0.6651 0.1555 0.7125 0.1819C0.7276 0.1903 0.7412 0.2072 0.7439 0.2351C0.7452 0.2492 0.7420 0.2587 0.7393 0.2722L0.7391 0.2733L0.7396 0.2741C0.7420 0.2772 0.7453 0.2795 0.7483 0.2818C0.7511 0.2841 0.7536 0.2865 0.7552 0.2900L0.7556 0.2907C0.7592 0.2996 0.7597 0.3105 0.7596 0.3222C0.7595 0.3338 0.7588 0.3462 0.7601 0.3572C0.7619 0.3717 0.7649 0.3843 0.7678 0.3974L0.7691 0.4031C0.7715 0.4146 0.7732 0.4264 0.7743 0.4385L0.7746 0.4409C0.7761 0.4608 0.7761 0.4810 0.7746 0.5010C0.7686 0.5809 0.7393 0.6467 0.7030 0.6949C0.6850 0.7188 0.6674 0.7348 0.6491 0.7404C0.6309 0.7460 0.6117 0.7414 0.5906 0.7239C0.5885 0.7222 0.5831 0.7168 0.5779 0.7116C0.5753 0.7091 0.5727 0.7066 0.5707 0.7047C0.5696 0.7038 0.5687 0.7030 0.5680 0.7024C0.5677 0.7021 0.5673 0.7019 0.5670 0.7017C0.5668 0.7015 0.5665 0.7014 0.5662 0.7013L0.5659 0.7012L0.5656 0.7016C0.5646 0.7027 0.5637 0.7044 0.5627 0.7065C0.5618 0.7085 0.5609 0.7109 0.5600 0.7134C0.5582 0.7183 0.5565 0.7234 0.5551 0.7265C0.5519 0.7337 0.5475 0.7391 0.5426 0.7422L0.5426 0.7422C0.5332 0.7482 0.5252 0.7454 0.5173 0.7413C0.5093 0.7371 0.5012 0.7314 0.4917 0.7323C0.4893 0.7325 0.4867 0.7345 0.4844 0.7371C0.4821 0.7397 0.4800 0.7431 0.4787 0.7466L0.4787 0.7466C0.4728 0.7621 0.4723 0.7797 0.4735 0.7972C0.4742 0.8059 0.4753 0.8147 0.4764 0.8233C0.4775 0.8319 0.4786 0.8402 0.4793 0.8481C0.4806 0.8627 0.4794 0.8711 0.4763 0.8763C0.4731 0.8817 0.4678 0.8842 0.4601 0.8859C0.4326 0.8915 0.4025 0.8757 0.3839 0.8396C0.3811 0.8340 0.3782 0.8269 0.3750 0.8199C0.3719 0.8130 0.3685 0.8063 0.3648 0.8020C0.3594 0.7958 0.3540 0.7946 0.3488 0.7930C0.3437 0.7913 0.3386 0.7893 0.3334 0.7819V0.7819L0.3334 0.7819L0.3327 0.7808C0.3290 0.7754 0.3259 0.7674 0.3224 0.7595C0.3188 0.7513 0.3148 0.7433 0.3096 0.7397C0.3065 0.7375 0.3029 0.7382 0.2994 0.7397C0.2976 0.7404 0.2957 0.7414 0.2939 0.7424C0.2920 0.7434 0.2902 0.7444 0.2884 0.7453C0.2847 0.7471 0.2813 0.7483 0.2783 0.7474C0.2754 0.7467 0.2729 0.7440 0.2709 0.7379C0.2694 0.7330 0.2685 0.7265 0.2679 0.7196C0.2675 0.7161 0.2673 0.7126 0.2670 0.7092C0.2668 0.7059 0.2665 0.7026 0.2662 0.6996C0.2652 0.6892 0.2645 0.6777 0.2640 0.6671L0.2640 0.6671L0.2639 0.6642C0.2638 0.6631 0.2638 0.6619 0.2638 0.6606C0.2637 0.6580 0.2636 0.6551 0.2634 0.6522C0.2633 0.6494 0.2631 0.6465 0.2628 0.6440C0.2625 0.6415 0.2622 0.6393 0.2616 0.6377C0.2610 0.6360 0.2600 0.6349 0.2589 0.6341C0.2579 0.6333 0.2566 0.6328 0.2553 0.6323C0.2541 0.6319 0.2528 0.6316 0.2516 0.6313C0.2507 0.6311 0.2499 0.6309 0.2492 0.6307L0.2486 0.6305C0.2450 0.6293 0.2407 0.6280 0.2376 0.6250C0.2362 0.6235 0.2351 0.6217 0.2345 0.6194C0.2339 0.6171 0.2338 0.6140 0.2345 0.6100C0.2352 0.6063 0.2366 0.6033 0.2386 0.6017C0.2417 0.5990 0.2449 0.5967 0.2482 0.5945C0.2515 0.5923 0.2548 0.5902 0.2581 0.5876L0.2581 0.5876C0.2731 0.5759 0.2879 0.5632 0.3023 0.5495L0.3033 0.5485L0.3026 0.5469C0.2942 0.5294 0.2834 0.5197 0.2726 0.5079L0.2443 0.4773L0.2443 0.4773L0.2434 0.4763C0.2423 0.4752 0.2410 0.4740 0.2396 0.4726C0.2378 0.4708 0.2357 0.4688 0.2338 0.4667C0.2319 0.4646 0.2301 0.4624 0.2287 0.4603C0.2274 0.4581 0.2266 0.4562 0.2264 0.4547C0.2260 0.4507 0.2269 0.4476 0.2289 0.4448C0.2309 0.4420 0.2338 0.4398 0.2372 0.4380C0.2440 0.4346 0.2520 0.4332 0.2560 0.4323L0.2570 0.4320L0.2568 0.4303C0.2550 0.4092 0.2584 0.3951 0.2644 0.3839C0.2705 0.3726 0.2792 0.3643 0.2881 0.3548L0.2886 0.3542L0.2885 0.3531C0.2849 0.3173 0.2913 0.2936 0.2952 0.2593C0.2960 0.2527 0.2957 0.2437 0.2956 0.2350C0.2955 0.2261 0.2954 0.2176 0.2964 0.2114C0.2965 0.2109 0.2967 0.2105 0.2972 0.2101C0.2976 0.2097 0.2983 0.2095 0.2992 0.2094C0.3010 0.2093 0.3034 0.2099 0.3059 0.2109C0.3110 0.2129 0.3162 0.2163 0.3177 0.2174L0.3187 0.2183L0.3190 0.2164C0.3209 0.2053 0.3233 0.1958 0.3268 0.1907C0.3286 0.1883 0.3306 0.1868 0.3331 0.1867C0.3355 0.1867 0.3385 0.1880 0.3420 0.1913L0.3430 0.1923L0.3434 0.1904C0.3438 0.1883 0.3442 0.1860 0.3446 0.1836C0.3449 0.1813 0.3453 0.1789 0.3457 0.1765C0.3465 0.1718 0.3475 0.1676 0.3489 0.1646C0.3501 0.1623 0.3513 0.1615 0.3527 0.1617C0.3542 0.1619 0.3558 0.1631 0.3574 0.1650C0.3608 0.1687 0.3640 0.1745 0.3660 0.1778L0.3668 0.1792L0.3675 0.1775C0.3704 0.1701 0.3727 0.1662 0.3746 0.1646C0.3755 0.1638 0.3763 0.1636 0.3770 0.1637C0.3777 0.1638 0.3785 0.1643 0.3792 0.1652C0.3808 0.1670 0.3823 0.1702 0.3841 0.1742C0.3859 0.1782 0.3879 0.1829 0.3902 0.1873C0.3953 0.1966 0.4002 0.2065 0.4050 0.2164C0.4098 0.2262 0.4146 0.2362 0.4196 0.2457L0.4201 0.2467L0.4208 0.2461C0.4245 0.2428 0.4279 0.2373 0.4309 0.2330L0.4309 0.2330C0.4420 0.2177 0.4516 0.1951 0.4547 0.1705C0.4557 0.1621 0.4564 0.1542 0.4572 0.1470C0.4580 0.1397 0.4589 0.1331 0.4603 0.1272C0.4630 0.1154 0.4678 0.1058 0.4781 0.0987C0.4783 0.0986 0.4784 0.0986 0.4785 0.0986Z",
  // Kapha: from kapha.svg — authentic brand guide Kapha aura
  Kapha:
    "M0.5390 0.1885C0.6178 0.1850 0.7031 0.2623 0.6971 0.4167C0.6945 0.4844 0.6738 0.5261 0.6448 0.5689C0.6597 0.5702 0.6868 0.5899 0.6982 0.6069C0.7055 0.6177 0.7099 0.6314 0.7105 0.6480C0.7112 0.6665 0.7066 0.6822 0.6996 0.6957C0.6652 0.7618 0.5624 0.7914 0.5131 0.8013C0.4935 0.8052 0.4739 0.8073 0.4542 0.8093C0.4126 0.8114 0.3689 0.8107 0.3285 0.7909C0.3073 0.7805 0.2845 0.7569 0.2936 0.7129C0.3044 0.6605 0.3394 0.6269 0.3666 0.6026C0.3348 0.5739 0.3040 0.5009 0.3042 0.4377C0.3044 0.3155 0.3714 0.2467 0.4330 0.2190C0.4698 0.2024 0.5009 0.1905 0.5390 0.1885Z",
};

// Brand guide dosha palettes (p.77)
const doshas = [
  {
    name: "Vata",
    elementA: "Air",
    elementB: "Space",
    displayB: "Ether",
    subtitle: "Seeks grounding and warmth",
    essence: "The energy of movement",
    description:
      "It governs breath, circulation, and the nervous system. When balanced, it manifests as creativity, vitality, light sleep, and effortless flow.",
    gradLight: "#86C4FB", // Sky Blue
    gradDark: "#000F9F", // Indigo
    accentColor: "#F5A800", // Citrine
    desktopOffset: "md:-translate-y-10",
  },
  {
    name: "Pitta",
    elementA: "Fire",
    elementB: "Water",
    displayB: "Water",
    subtitle: "Seeks cooling and calm",
    essence: "The energy of transformation",
    description:
      "It governs digestion, metabolism, and intelligence. When balanced, it manifests as sharp focus, strong digestion, warmth, and decisiveness.",
    gradLight: "#FF5C3A", // Fire Red
    gradDark: "#9D0033", // Cool Red
    accentColor: "#A2E8F2", // Aquamarine
    desktopOffset: "",
  },
  {
    name: "Kapha",
    elementA: "Earth",
    elementB: "Water",
    displayB: "Water",
    subtitle: "Seeks stimulation and lightness",
    essence: "The energy of structure",
    description:
      "It governs stability, hydration, and physical endurance. When balanced, it manifests as calm emotions, loyalty, and steady strength.",
    gradLight: "#6BCDB2", // Sea Green
    gradDark: "#00545C", // Forest Green
    accentColor: "#FFB3A5", // Carnelian
    desktopOffset: "md:translate-y-10",
  },
];

// --- Blob components ---

/** Gradient-filled blob with shadow and vignette */
function GradientBlob({
  shape,
  gradId,
  gradLight,
  gradDark,
  accentColor,
  size,
  gradAngle = { x1: "0.1", y1: "0", x2: "0.9", y2: "1" },
}: {
  shape: string;
  gradId: string;
  gradLight: string;
  gradDark: string;
  accentColor: string;
  size: string;
  gradAngle?: { x1: string; y1: string; x2: string; y2: string };
}): React.ReactElement {
  return (
    <div className={`relative ${size}`}>
      {/* Shadow layers */}
      <svg
        className="pointer-events-none absolute inset-[-4%] h-[108%] w-[108%] translate-x-[1.5%] translate-y-[2%]"
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={shape} fill="rgba(0,0,0,0.08)" stroke="none" />
      </svg>
      <svg
        className="pointer-events-none absolute inset-[-4%] h-[108%] w-[108%] translate-x-[3%] translate-y-[4%] blur-[6px]"
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={shape} fill="rgba(0,0,0,0.05)" stroke="none" />
      </svg>

      {/* Main filled blob */}
      <svg
        className="relative h-full w-full overflow-visible"
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={gradId}
            x1={gradAngle.x1}
            y1={gradAngle.y1}
            x2={gradAngle.x2}
            y2={gradAngle.y2}
          >
            <stop offset="0%" stopColor={gradLight} />
            <stop offset="100%" stopColor={gradDark} />
          </linearGradient>
          <radialGradient id={`${gradId}-vig`} cx="45%" cy="40%" r="55%">
            <stop offset="20%" stopColor="white" stopOpacity="0.1" />
            <stop offset="100%" stopColor="black" stopOpacity="0.18" />
          </radialGradient>
        </defs>
        <path d={shape} fill={`url(#${gradId})`} />
        <path d={shape} fill={`url(#${gradId}-vig)`} />
        <path
          d={shape}
          fill="none"
          stroke={accentColor}
          strokeWidth="0.004"
          strokeOpacity="0.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// --- Main component ---

export default function Doshas(): React.ReactElement {
  return (
    <section className="relative bg-cream px-6 py-24 md:px-12 md:py-32">
      <SectionDivider fill="aubergine" variant={1} />
      <div className="relative z-10">
        {/* Section header */}
        <div className="mx-auto max-w-3xl pb-16 md:pb-24">
          <p className="mb-4 font-serif text-sm italic text-aubergine/50">
            — The Three Doshas
          </p>
          <h2 className="mb-6 font-serif text-[clamp(1.75rem,4.5vw,3rem)] font-semibold leading-[1.1] text-aubergine">
            Five elements.
            <br />
            Three constitutions.
          </h2>
          <p className="max-w-lg font-serif text-[15px] font-light leading-[1.6] text-aubergine/60">
            In Ayurveda, the five elements combine in pairs to form three
            Doshas — your unique constitution. Knowing your Dosha reveals how to
            eat, move, rest, and feel more like yourself.
          </p>
        </div>

        {/* Dosha Fusion Grid */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-20 md:grid-cols-3 md:gap-6 lg:gap-10">
          {doshas.map((dosha, i) => {
            const elA = ELEMENT_IMAGES[dosha.elementA];
            const elB = ELEMENT_IMAGES[dosha.elementB];

            return (
              <div
                key={dosha.name}
                className={`relative flex flex-col items-center text-center ${dosha.desktopOffset}`}
              >
                {/* Element Pair — real images clipped to blob shapes */}
                <div className="mb-3 flex items-start gap-3 md:mb-5 md:gap-5">
                  {/* Element A */}
                  <div className="flex flex-col items-center">
                    <BlobImage
                      shape={ELEMENT_SHAPES[dosha.elementA]}
                      image={elA.src}
                      alt={dosha.elementA}
                      imageStyle={{ objectPosition: elA.position }}
                      variant="on-cream"
                      breathDir="right"
                      breathDelay={i * 0.25}
                      className="h-[80px] w-[80px] md:h-[120px] md:w-[120px]"
                    />
                    <p className="mt-2 font-serif text-[11px] italic text-aubergine/60 md:text-[12px]">
                      {dosha.elementA}
                    </p>
                  </div>

                  {/* Plus */}
                  <span className="mt-6 select-none font-serif text-[28px] font-light text-aubergine/60 md:mt-8 md:text-[36px]">
                    +
                  </span>

                  {/* Element B */}
                  <div className="flex flex-col items-center">
                    <BlobImage
                      shape={ELEMENT_SHAPES[dosha.elementB]}
                      image={elB.src}
                      alt={dosha.displayB}
                      imageStyle={{ objectPosition: elB.position }}
                      variant="on-cream"
                      breathDir="left"
                      breathDelay={i * 0.25 + 0.1}
                      className="h-[80px] w-[80px] md:h-[120px] md:w-[120px]"
                    />
                    <p className="mt-2 font-serif text-[11px] italic text-aubergine/60 md:text-[12px]">
                      {dosha.displayB}
                    </p>
                  </div>
                </div>

                {/* Y-Connector — two aubergine lines merging */}
                <svg
                  className="mb-4 h-[40px] w-[140px] md:mb-6 md:h-[52px] md:w-[180px]"
                  viewBox="0 0 180 52"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M24,0 C32,20 62,42 90,50"
                    stroke="#3D233B"
                    strokeWidth="2"
                    strokeOpacity="0.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M156,0 C148,20 118,42 90,50"
                    stroke="#3D233B"
                    strokeWidth="2"
                    strokeOpacity="0.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>

                {/* Large Dosha Blob — gradient fill + aura stroke */}
                <div className="relative mb-5 md:mb-7">
                  {/* Aura stroke — larger, behind the blob */}
                  <svg
                    className="pointer-events-none absolute -inset-[12%] h-[124%] w-[124%]"
                    viewBox="0 0 1 1"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d={DOSHA_SHAPES[dosha.name]}
                      fill="none"
                      stroke={dosha.accentColor}
                      strokeWidth="0.003"
                      strokeOpacity="0.35"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <GradientBlob
                    shape={DOSHA_SHAPES[dosha.name]}
                    gradId={`dosha-blob-${i}`}
                    gradLight={dosha.gradLight}
                    gradDark={dosha.gradDark}
                    accentColor={dosha.accentColor}
                    size="h-[240px] w-[240px] md:h-[300px] md:w-[300px] lg:h-[340px] lg:w-[340px]"
                    gradAngle={{ x1: "0.3", y1: "0.1", x2: "0.7", y2: "0.9" }}
                  />
                </div>

                {/* Dosha Info */}
                <div>
                  <h3 className="mb-1.5 font-serif text-[24px] font-semibold text-aubergine md:text-[30px]">
                    {dosha.name}
                  </h3>
                  <p className="mb-3 font-serif text-[12px] italic text-aubergine/50 md:text-[13px]">
                    {dosha.elementA} + {dosha.displayB}
                  </p>
                  <p className="mb-2 font-serif text-[15px] font-semibold text-aubergine/80 md:text-[16px]">
                    {dosha.essence}
                  </p>
                  <p className="mx-auto mb-2 max-w-[300px] font-serif text-[13px] font-light leading-[1.6] text-aubergine/60 md:text-[14px]">
                    {dosha.description}
                  </p>
                  <p className="font-serif text-[11px] italic text-aubergine/40 md:text-[12px]">
                    {dosha.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom text + CTA */}
        <p className="mx-auto mt-16 max-w-md text-center font-serif text-[15px] font-light italic leading-[1.6] text-aubergine/60 md:mt-20">
          Everyone carries all three Doshas. What differs is which one leads.
        </p>
        <div className="mt-8 hidden justify-center md:mt-10 md:flex">
          <AuraButton href="#quiz" className="text-aubergine">
            DISCOVER YOUR DOSHA
          </AuraButton>
        </div>
      </div>
    </section>
  );
}
