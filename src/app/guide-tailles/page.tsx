'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Ruler } from 'lucide-react';

const clothingSizes = [
  { eu: 'XS', us: '0-2', uk: '4-6', chest: '82-86', waist: '62-66', hip: '87-91' },
  { eu: 'S', us: '4-6', uk: '8-10', chest: '86-90', waist: '66-70', hip: '91-95' },
  { eu: 'M', us: '8-10', uk: '12-14', chest: '90-94', waist: '70-74', hip: '95-99' },
  { eu: 'L', us: '12-14', uk: '16-18', chest: '94-98', waist: '74-78', hip: '99-103' },
  { eu: 'XL', us: '16-18', uk: '20-22', chest: '98-102', waist: '78-82', hip: '103-107' },
  { eu: 'XXL', us: '20-22', uk: '24-26', chest: '102-106', waist: '82-86', hip: '107-111' },
];

const shoeSizes = [
  { eu: '36', us: '5.5', uk: '3', cm: '22.5' },
  { eu: '37', us: '6.5', uk: '4', cm: '23.5' },
  { eu: '38', us: '7.5', uk: '5', cm: '24' },
  { eu: '39', us: '8.5', uk: '6', cm: '25' },
  { eu: '40', us: '9', uk: '6.5', cm: '25.5' },
  { eu: '41', us: '9.5', uk: '7', cm: '26' },
  { eu: '42', us: '10', uk: '7.5', cm: '26.5' },
  { eu: '43', us: '11', uk: '8.5', cm: '27.5' },
  { eu: '44', us: '12', uk: '9.5', cm: '28.5' },
  { eu: '45', us: '13', uk: '10.5', cm: '29' },
];

const tips = [
  { title: 'Mesurez-vous', desc: 'Utilisez un metre ruban souple et mesurez directement sur le corps, sans vetements epais.' },
  { title: 'Poitrine', desc: 'Mesurez le tour de poitrine au niveau le plus fort, en passant sous les bras.' },
  { title: 'Taille', desc: 'Mesurez au creux naturel de la taille, au-dessus du nombril.' },
  { title: 'Hanches', desc: 'Mesurez au niveau le plus large des hanches.' },
  { title: 'Entre deux tailles ?', desc: 'Nous recommandons de prendre la taille superieure pour un confort optimal.' },
];

export default function SizeGuidePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-white"
    >
      {/* Breadcrumb */}
      <div className="border-b border-black/5 bg-[#F5F0EB]/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-black/40 hover:text-[#C9A96E]">Accueil</Link>
            <ChevronRight className="h-3 w-3 text-black/20" />
            <span className="text-black/70 font-medium">Guide des tailles</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-black/5 bg-[#F5F0EB]/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Ruler className="mx-auto mb-4 h-8 w-8 text-[#C9A96E]" />
            <h1 className="font-display text-3xl sm:text-4xl font-extralight tracking-[0.1em] text-black uppercase">
              Guide des Tailles
            </h1>
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="w-12 h-px bg-[#C9A96E]/50" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]" />
              <span className="w-12 h-px bg-[#C9A96E]/50" />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Clothing */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-2xl font-light tracking-wide text-black mb-6">Vetements</h2>
          <div className="overflow-x-auto rounded-xl border border-black/10">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="bg-[#F5F0EB]/50">
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-black/50">Taille EU</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-black/50">US</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-black/50">UK</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-black/50">Poitrine (cm)</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-black/50">Taille (cm)</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-black/50">Hanches (cm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {clothingSizes.map((s) => (
                  <tr key={s.eu} className="hover:bg-[#F5F0EB]/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-black">{s.eu}</td>
                    <td className="px-4 py-3 text-sm text-black/60">{s.us}</td>
                    <td className="px-4 py-3 text-sm text-black/60">{s.uk}</td>
                    <td className="px-4 py-3 text-sm text-black/60">{s.chest}</td>
                    <td className="px-4 py-3 text-sm text-black/60">{s.waist}</td>
                    <td className="px-4 py-3 text-sm text-black/60">{s.hip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Shoes */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-2xl font-light tracking-wide text-black mb-6">Chaussures</h2>
          <div className="overflow-x-auto rounded-xl border border-black/10">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="bg-[#F5F0EB]/50">
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-black/50">EU</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-black/50">US</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-black/50">UK</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.15em] text-black/50">Longueur (cm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {shoeSizes.map((s) => (
                  <tr key={s.eu} className="hover:bg-[#F5F0EB]/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-black">{s.eu}</td>
                    <td className="px-4 py-3 text-sm text-black/60">{s.us}</td>
                    <td className="px-4 py-3 text-sm text-black/60">{s.uk}</td>
                    <td className="px-4 py-3 text-sm text-black/60">{s.cm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Tips */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-2xl font-light tracking-wide text-black mb-6">Comment se mesurer</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {tips.map((tip, i) => (
              <div key={i} className="rounded-xl border border-black/5 bg-[#F5F0EB]/20 p-5">
                <h3 className="text-sm font-semibold text-black mb-1">{tip.title}</h3>
                <p className="text-xs leading-relaxed text-black/50">{tip.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Help CTA */}
        <div className="text-center pb-8">
          <p className="text-sm text-black/40 mb-4">
            Besoin d&apos;aide pour choisir votre taille ?
          </p>
          <a
            href="https://wa.me/33758167830?text=Bonjour%20Bellalure%2C%20j%27ai%20besoin%20d%27aide%20pour%20choisir%20ma%20taille."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#20BD5B]"
          >
            Nous contacter via WhatsApp
          </a>
        </div>
      </div>
    </motion.div>
  );
}
