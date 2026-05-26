'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Truck,
  Package,
  MapPin,
  CreditCard,
  Clock,
  ChevronRight,
  MessageCircle,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { useState } from 'react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const deliveryZones = [
  {
    icon: MapPin,
    zone: 'Kinshasa',
    price: '5 $',
    delay: '1 - 2 jours',
    description: 'Livraison rapide dans toutes les communes de Kinshasa.',
    color: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  {
    icon: Truck,
    zone: 'Provinces RDC',
    price: '15 $',
    delay: '5 - 10 jours',
    description: 'Livraison dans toutes les grandes villes de la RDC.',
    color: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: Package,
    zone: 'International',
    price: '30 $',
    delay: '15 - 30 jours',
    description: 'Livraison vers l\'Afrique, l\'Europe et le reste du monde.',
    color: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
];

const orderSteps = [
  {
    step: 1,
    title: 'Choisissez',
    description: 'Parcourez notre catalogue et selectionnez vos articles preferes.',
  },
  {
    step: 2,
    title: 'Contactez-nous via WhatsApp',
    description: 'Envoyez-nous votre commande par WhatsApp pour confirmer la disponibilite.',
  },
  {
    step: 3,
    title: 'Payez un acompte',
    description: 'Versez un acompte pour confirmer votre commande. Le solde sera paye a la livraison.',
  },
  {
    step: 4,
    title: 'Livraison',
    description: 'Recevez votre commande a domicile ou au point de retrait convenu.',
  },
];

const paymentMethods = [
  { name: 'Mobile Money (M-Pesa)', icon: CreditCard },
  { name: 'Airtel Money', icon: CreditCard },
  { name: 'Orange Money', icon: CreditCard },
  { name: 'Wave', icon: CreditCard },
  { name: 'Cash (a la livraison)', icon: CreditCard },
];

const faqs = [
  {
    question: 'Comment suivre ma commande ?',
    answer: 'Apres confirmation de votre commande, vous recevrez un numero de suivi via WhatsApp. Vous pourrez suivre votre colis en temps reel.',
  },
  {
    question: 'Puis-je modifier ma commande apres paiement ?',
    answer: 'Oui, tant que la commande n\'a pas ete expediee. Contactez-nous rapidement via WhatsApp pour toute modification.',
  },
  {
    question: 'Que se passe-t-il si je ne suis pas disponible lors de la livraison ?',
    answer: 'Notre livreur vous contactera par telephone. Si vous n\'etes pas disponible, une seconde tentative sera effectuee le lendemain.',
  },
  {
    question: 'Y a-t-il un montant minimum de commande ?',
    answer: 'Non, il n\'y a pas de montant minimum. Cependant, les frais de livraison s\'appliquent a chaque commande.',
  },
];

export default function LivraisonPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link href="/" className="hover:text-gold transition-colors">Accueil</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-dark dark:text-beige font-medium">Livraison</span>
        </nav>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="font-display text-4xl md:text-5xl text-dark dark:text-beige mb-4">
            Livraison
          </h1>
          <div className="w-24 h-0.5 bg-gold mx-auto mb-6" />
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Nous livrons vos articles de mode partout en RDC et dans le monde entier.
            Decouvrez nos zones de livraison et nos methodes de paiement.
          </p>
        </motion.div>

        {/* Delivery Zones */}
        <div className="max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-display text-2xl md:text-3xl text-dark dark:text-beige text-center mb-10"
          >
            Zones de livraison
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {deliveryZones.map((zone, i) => (
              <motion.div
                key={zone.zone}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className={`rounded-2xl border p-6 text-center ${zone.color}`}
              >
                <zone.icon className={`w-10 h-10 mx-auto mb-4 ${zone.iconColor}`} />
                <h3 className="font-display text-xl text-dark dark:text-beige mb-2">{zone.zone}</h3>
                <p className="text-3xl font-bold text-gold mb-1">{zone.price}</p>
                <div className="flex items-center justify-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <Clock className="w-4 h-4" />
                  <span>{zone.delay}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{zone.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Order Process */}
        <div className="max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-display text-2xl md:text-3xl text-dark dark:text-beige text-center mb-10"
          >
            Comment commander ?
          </motion.h2>
          <div className="space-y-6">
            {orderSteps.map((step, i) => (
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
                <div className="flex-1 bg-beige/50 dark:bg-dark-surface rounded-xl p-5 border border-beige-dark/30 dark:border-dark-border">
                  <h3 className="font-display text-lg text-dark dark:text-beige mb-1">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-display text-2xl md:text-3xl text-dark dark:text-beige text-center mb-10"
          >
            Methodes de paiement
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-beige/30 dark:bg-dark-surface rounded-2xl border border-beige-dark/30 dark:border-dark-border p-8"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <div key={method.name} className="flex items-center gap-3 p-3 bg-white dark:bg-[#0A0A0A] rounded-xl border border-beige-dark/20 dark:border-dark-border">
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                    <method.icon className="w-5 h-5 text-gold" />
                  </div>
                  <span className="font-medium text-dark dark:text-beige">{method.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-display text-2xl md:text-3xl text-dark dark:text-beige text-center mb-10"
          >
            Questions frequentes
          </motion.h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="border border-beige-dark/30 dark:border-dark-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-beige/30 dark:hover:bg-dark-surface transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-gold flex-shrink-0" />
                    <span className="font-medium text-dark dark:text-beige">{faq.question}</span>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === i ? 'rotate-90' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 pl-13 text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Vous avez une question sur la livraison ?
          </p>
          <a
            href="https://wa.me/33758167830?text=Bonjour%2C%20j%27ai%20une%20question%20sur%20la%20livraison"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-medium transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Contactez-nous via WhatsApp
          </a>
        </motion.div>
      </div>
    </div>
  );
}
