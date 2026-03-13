import BackgroundEffects from "@/app/components/BackgroundEffects/BackgroundEffects";
import Navbar from "@/app/components/Navbar/Navbar";
import HeroSection from "@/app/components/HeroSection/HeroSection";
import SectionDivider from "@/app/components/SectionDivider/SectionDivider";
import AboutSection from "@/app/components/AboutSection/AboutSection";
import StackSection from "@/app/components/StackSection/StackSection";
import ExperienceSection from "@/app/components/ExperienceSection/ExperienceSection";
import ProjectsSection from "@/app/components/ProjectsSection/ProjectsSection";
import PublicationsSection from "@/app/components/PublicationsSection/PublicationsSection";
import OtherProjectsSection from "@/app/components/OtherProjectsSection/OtherProjectsSection";
import ContactSection from "@/app/components/ContactSection/ContactSection";
import Footer from "@/app/components/Footer/Footer";

export default function Home() {
  return (
    <>
      <BackgroundEffects />
      <Navbar />

      <div style={{ position: "relative", zIndex: 1 }}>
        <HeroSection />
        <SectionDivider />
        <AboutSection />
        <SectionDivider />
        <StackSection />
        <SectionDivider />
        <ExperienceSection />
        <SectionDivider />
        <ProjectsSection />
        <SectionDivider />
        <PublicationsSection />
        <SectionDivider />
        <OtherProjectsSection />
        <SectionDivider />
        <ContactSection />
      </div>

      <SectionDivider />
      <Footer />
    </>
  );
}
