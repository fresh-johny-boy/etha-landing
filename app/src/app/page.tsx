import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import AuraThread from "@/components/AuraThread";
import FiveElements from "@/components/FiveElements";
import Doshas from "@/components/Doshas";
import Rituals from "@/components/Rituals";
import Academy from "@/components/Academy";
import Community from "@/components/Community";
import Closure from "@/components/Closure";
import Footer from "@/components/Footer";
import MobileCTA from "@/components/MobileCTA";

export default function Home(): React.ReactElement {
  return (
    <main className="relative w-full">
      <AuraThread />
      <Nav />
      <Hero />

      <FiveElements />
      <Doshas />
      <Rituals />
      <Academy />
      <Community />
      <Closure />
      <Footer />
      <MobileCTA />
    </main>
  );
}
