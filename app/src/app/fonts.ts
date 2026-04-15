import localFont from "next/font/local";

export const plantin = localFont({
  src: [
    {
      path: "../fonts/Plantin-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/Plantin.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Plantin-Italic.otf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-plantin",
  display: "swap",
});

export const brandon = localFont({
  src: [
    {
      path: "../fonts/Brandon_reg.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Brandon_med.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/Brandon_bld.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-brandon",
  display: "swap",
});
