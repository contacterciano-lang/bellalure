import HeroSection from '@/components/home/HeroSection';
import NewArrivals from '@/components/home/NewArrivals';
import TrendingSection from '@/components/home/TrendingSection';
import CategoriesGrid from '@/components/home/CategoriesGrid';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import PromoCountdown from '@/components/home/PromoCountdown';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import WhatsAppBanner from '@/components/home/WhatsAppBanner';
import DeliverySection from '@/components/home/DeliverySection';
import LookbookSection from '@/components/home/LookbookSection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <NewArrivals />
      <TrendingSection />
      <CategoriesGrid />
      <FeaturedProducts />
      <PromoCountdown />
      <LookbookSection />
      <TestimonialsSection />
      <DeliverySection />
      <WhatsAppBanner />
    </>
  );
}
