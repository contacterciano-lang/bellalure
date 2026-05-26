'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  RotateCcw,
  Package,
  Shield,
  ChevronRight,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const returnConditions = [
  'L\'article doit etre retourne dans un delai de 7 jours apres reception.',
  'L\'article ne doit pas avoir ete porte, lave ou modifie.',
  'L\'emballage d\'origine doit etre intact, y compris les etiquettes.',
  'La preuve d\'achat (recu ou confirmation WhatsApp) est requise.',
  'Les frais de retour sont a la charge du client.',
];

const exchangeSteps = [
  {
    step: 1,
    title: 'Contactez-nous',
    description: 'Envoyez-nous un message WhatsApp avec votre numero de commande et la raison du retour.',
  },
  {
    step: 2,
    title: 'Validation',
    description: 'Notre equipe examine votre demande et vous confirme l\'eligibilite au retour sous 24h.',
  },
  {
    step: 3,
    title: 'Envoi du retour',
    description: 'Emballez soigneusement l\'article et renvoyez-le a l\'adresse indiquee ou convenez d\'un point de retrait.',
  },
  {
    step: 4,
    title: 'Echange ou remboursement',
    description: 'Apres inspection de l\'article, nous procedons a l\'echange ou au remboursement sous 3 a 5 jours.',
  },
];

const nonReturnableItems = [
  { item: 'Maillots de bain', reason: 'Pour des raisons d\'hygiene' },
  { item: 'Sous-vetements et lingerie', reason: 'Pour des raisons d\'hygiene' },
  { item: 'Accessoires (bijoux, ceintures)', reason: 'Articles fragiles et personnels' },
  { item: 'Articles en solde ou promotion', reason: 'Ventes finales, non remboursables' },
  { item: 'Articles personnalises', reason: 'Confectionnes sur mesure' },
];

export default function RetoursPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link href="/" className="hover:text-gold transition-colors">Accueil</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-dark dark:text-beige font-medium">Retours & Echanges</span>
        </nav>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="font-display text-4xl md:text-5xl text-dark dark:text-beige mb-4">
            Retours & Echanges
          </h1>
          <div className="w-24 h-0.5 bg-gold mx-auto mb-6" />
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Votre satisfaction est notre priorite. Decouvrez notre politique de retours
            simple et transparente.
          </p>
        </motion.div>

        {/* Return Policy */}
        <div className="max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-beige/30 dark:bg-dark-surface rounded-2xl border border-beige-dark/30 dark:border-dark-border p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-gold" />
              </div>
              <h2 className="font-display text-2xl text-dark dark:text-beige">
                Politique de retour
              </h2>
            </div>
            <div className="bg-gold/5 dark:bg-gold/10 rounded-xl p-5 mb-6 border border-gold/20">
              <p className="text-gold-dark dark:text-gold-light font-medium flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                Delai de retour : 7 jours apres reception de votre commande.
              </p>
            </div>
            <ul className="space-y-3">
              {returnConditions.map((condition, i) => (
                <motion.li
                  key={i}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  className="flex items-start gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">{condition}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Exchange Process */}
        <div className="max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-display text-2xl md:text-3xl text-dark dark:text-beige text-center mb-10"
          >
            Processus d&apos;echange
          </motion.h2>
          <div className="space-y-6">
            {exchangeSteps.map((step, i) => (
              <motion.div
                key={step.step}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="flex gap-4 items-start"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold text-white flex items-center justify-center font-bold text-lg">
                  {step.step}
                </div>
                <div className="flex-1 bg-white dark:bg-[#0A0A0A] rounded-xl p-5 border border-beige-dark/30 dark:border-dark-border">
                  <h3 className="font-display text-lg text-dark dark:text-beige mb-1">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Non-returnable Items */}
        <div className="max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-display text-2xl md:text-3xl text-dark dark:text-beige text-center mb-10"
          >
            Articles non retournables
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-red-50/50 dark:bg-red-950/20 rounded-2xl border border-red-200/50 dark:border-red-900/30 p-8"
          >
            <div className="space-y-4">
              {nonReturnableItems.map((item, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  className="flex items-start gap-3 p-3 bg-white/70 dark:bg-[#0A0A0A]/50 rounded-xl"
                >
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-dark dark:text-beige">{item.item}</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.reason}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="bg-beige/30 dark:bg-dark-surface rounded-2xl border border-beige-dark/30 dark:border-dark-border p-8 max-w-xl mx-auto">
            <RotateCcw className="w-10 h-10 text-gold mx-auto mb-4" />
            <h3 className="font-display text-xl text-dark dark:text-beige mb-2">
              Besoin d&apos;effectuer un retour ?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Contactez notre equipe via WhatsApp pour initier votre demande de retour ou d&apos;echange.
            </p>
            <a
              href="https://wa.me/33758167830?text=Bonjour%2C%20je%20souhaite%20effectuer%20un%20retour.%20Mon%20num%C3%A9ro%20de%20commande%20est%20%3A"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-medium transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Demander un retour via WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
