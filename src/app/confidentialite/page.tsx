'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Shield } from 'lucide-react';

const sections = [
  { title: 'Donnees collectees', content: "Nous collectons uniquement les informations necessaires au traitement de vos commandes : nom, numero de telephone, adresse de livraison, et email (si fourni). Ces donnees sont collectees lors de votre prise de contact via WhatsApp ou notre formulaire de contact." },
  { title: 'Utilisation des donnees', content: "Vos donnees personnelles sont utilisees exclusivement pour : traiter et suivre vos commandes, vous contacter concernant votre commande, ameliorer notre service client, et vous envoyer des informations sur nos nouveautes (uniquement avec votre consentement)." },
  { title: 'Partage des donnees', content: "Nous ne vendons, ne louons et ne partageons jamais vos donnees personnelles avec des tiers a des fins commerciales. Vos informations peuvent etre partagees uniquement avec nos partenaires de livraison dans le cadre strict de l'acheminement de votre commande." },
  { title: 'Cookies', content: "Notre site utilise des cookies techniques essentiels au fonctionnement du site (preferences de devise, panier, liste de favoris). Ces donnees sont stockees localement sur votre navigateur et ne sont pas transmises a nos serveurs. Aucun cookie de tracking ou publicitaire n'est utilise." },
  { title: 'Vos droits', content: "Conformement au RGPD et a la legislation congolaise, vous disposez d'un droit d'acces, de rectification, de suppression et de portabilite de vos donnees personnelles. Vous pouvez exercer ces droits a tout moment en nous contactant via WhatsApp ou par email a contact@bellalure.com." },
  { title: 'Securite', content: "Nous mettons en oeuvre des mesures techniques et organisationnelles appropriees pour proteger vos donnees personnelles contre tout acces non autorise, modification, divulgation ou destruction." },
  { title: 'Conservation', content: "Vos donnees personnelles sont conservees pendant la duree necessaire au traitement de votre commande, puis archivees conformement aux obligations legales en vigueur. Les donnees de contact sont conservees tant que vous n'en demandez pas la suppression." },
  { title: 'Contact', content: "Pour toute question relative a la protection de vos donnees personnelles, vous pouvez nous contacter : par WhatsApp au +33 7 58 16 78 30, par email a contact@bellalure.com. Derniere mise a jour : janvier 2025." },
];

export default function PrivacyPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-white">
      <div className="border-b border-black/5 bg-[#F5F0EB]/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-black/40 hover:text-[#C9A96E]">Accueil</Link>
            <ChevronRight className="h-3 w-3 text-black/20" />
            <span className="text-black/70 font-medium">Politique de confidentialite</span>
          </nav>
        </div>
      </div>

      <div className="border-b border-black/5 bg-[#F5F0EB]/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Shield className="mx-auto mb-4 h-8 w-8 text-[#C9A96E]" />
            <h1 className="font-display text-3xl sm:text-4xl font-extralight tracking-[0.1em] text-black uppercase">
              Politique de Confidentialite
            </h1>
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="w-12 h-px bg-[#C9A96E]/50" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]" />
              <span className="w-12 h-px bg-[#C9A96E]/50" />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {sections.map((s, i) => (
            <motion.section
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-black/5 bg-[#F5F0EB]/10 p-6"
            >
              <h2 className="text-sm font-semibold text-black mb-3">
                {i + 1}. {s.title}
              </h2>
              <p className="text-xs leading-relaxed text-black/50">{s.content}</p>
            </motion.section>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
