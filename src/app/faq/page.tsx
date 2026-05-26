'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  ChevronDown,
  MessageCircle,
  HelpCircle,
  ShoppingBag,
  Truck,
  CreditCard,
  RotateCcw,
  Tag,
} from 'lucide-react';
import { useState } from 'react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.5 },
  }),
};

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqCategory {
  name: string;
  icon: React.ElementType;
  color: string;
  faqs: FaqItem[];
}

const faqCategories: FaqCategory[] = [
  {
    name: 'Commande',
    icon: ShoppingBag,
    color: 'text-blue-600 dark:text-blue-400',
    faqs: [
      {
        question: 'Comment passer une commande ?',
        answer: 'Parcourez notre catalogue, selectionnez vos articles et contactez-nous via WhatsApp pour finaliser votre commande. Nous vous confirmerons la disponibilite et le prix total.',
      },
      {
        question: 'Puis-je commander plusieurs articles a la fois ?',
        answer: 'Absolument ! Vous pouvez commander autant d\'articles que vous le souhaitez. Les frais de livraison restent les memes quel que soit le nombre d\'articles dans votre commande.',
      },
      {
        question: 'Comment savoir si un article est disponible ?',
        answer: 'Tous les articles affiches sur notre site sont en principe disponibles. Pour confirmation, envoyez-nous un message WhatsApp avec la reference de l\'article souhaite.',
      },
      {
        question: 'Puis-je modifier ma commande apres l\'avoir passee ?',
        answer: 'Oui, tant que la commande n\'a pas ete expediee. Contactez-nous le plus rapidement possible via WhatsApp pour toute modification.',
      },
    ],
  },
  {
    name: 'Livraison',
    icon: Truck,
    color: 'text-green-600 dark:text-green-400',
    faqs: [
      {
        question: 'Quels sont les delais de livraison ?',
        answer: 'Kinshasa : 1-2 jours. Provinces RDC : 5-10 jours. International : 15-30 jours. Les delais peuvent varier selon la disponibilite des produits.',
      },
      {
        question: 'Livrez-vous en dehors de la RDC ?',
        answer: 'Oui, nous livrons dans le monde entier ! Les frais de livraison internationale sont de 30 $ et les delais varient entre 15 et 30 jours selon la destination.',
      },
      {
        question: 'Comment suivre ma commande ?',
        answer: 'Apres expedition, vous recevrez un numero de suivi par WhatsApp. Vous pourrez suivre votre colis en temps reel via ce numero.',
      },
      {
        question: 'Que faire si ma commande n\'arrive pas ?',
        answer: 'Contactez-nous immediatement via WhatsApp. Nous lancerons une enquete aupres du transporteur et trouverons une solution (renvoi ou remboursement).',
      },
    ],
  },
  {
    name: 'Paiement',
    icon: CreditCard,
    color: 'text-purple-600 dark:text-purple-400',
    faqs: [
      {
        question: 'Quels modes de paiement acceptez-vous ?',
        answer: 'Nous acceptons Mobile Money (M-Pesa), Airtel Money, Orange Money, Wave et le paiement en especes a la livraison.',
      },
      {
        question: 'Dois-je payer la totalite a la commande ?',
        answer: 'Non, nous demandons un acompte pour confirmer la commande. Le solde est paye a la livraison. Le montant de l\'acompte sera convenu via WhatsApp.',
      },
      {
        question: 'Mes paiements sont-ils securises ?',
        answer: 'Oui, tous les paiements via Mobile Money sont securises par les operateurs. Nous ne stockons aucune information financiere.',
      },
    ],
  },
  {
    name: 'Retours',
    icon: RotateCcw,
    color: 'text-orange-600 dark:text-orange-400',
    faqs: [
      {
        question: 'Puis-je retourner un article ?',
        answer: 'Oui, dans un delai de 7 jours apres reception. L\'article doit etre non porte, avec les etiquettes et l\'emballage d\'origine.',
      },
      {
        question: 'Comment effectuer un retour ?',
        answer: 'Contactez-nous via WhatsApp avec votre numero de commande. Notre equipe vous guidera pour le processus de retour.',
      },
      {
        question: 'Quels articles ne sont pas retournables ?',
        answer: 'Les maillots de bain, sous-vetements, accessoires, articles en promotion et articles personnalises ne sont pas retournables.',
      },
      {
        question: 'Combien de temps pour le remboursement ?',
        answer: 'Apres reception et verification de l\'article retourne, le remboursement est effectue sous 3 a 5 jours ouvrables via votre mode de paiement initial.',
      },
    ],
  },
  {
    name: 'Produits',
    icon: Tag,
    color: 'text-pink-600 dark:text-pink-400',
    faqs: [
      {
        question: 'Vos produits sont-ils authentiques ?',
        answer: 'Oui, tous nos produits sont 100% authentiques. Nous travaillons directement avec des fournisseurs agrees et garantissons l\'originalite de chaque article.',
      },
      {
        question: 'Comment choisir la bonne taille ?',
        answer: 'Chaque produit dispose d\'un guide des tailles detaille. Si vous hesitez, contactez-nous via WhatsApp et nous vous conseillerons.',
      },
      {
        question: 'Les couleurs sont-elles fideles aux photos ?',
        answer: 'Nous faisons de notre mieux pour que les photos refletent les couleurs reelles. Cependant, de legeres variations peuvent exister selon les ecrans.',
      },
    ],
  },
];

export default function FaqPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link href="/" className="hover:text-gold transition-colors">Accueil</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-dark dark:text-beige font-medium">FAQ</span>
        </nav>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="font-display text-4xl md:text-5xl text-dark dark:text-beige mb-4">
            Questions Frequentes
          </h1>
          <div className="w-24 h-0.5 bg-gold mx-auto mb-6" />
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Retrouvez les reponses aux questions les plus frequentes.
            Si vous ne trouvez pas ce que vous cherchez, contactez-nous.
          </p>
        </motion.div>

        {/* FAQ Categories */}
        <div className="max-w-3xl mx-auto mb-20">
          {faqCategories.map((category, catIndex) => (
            <motion.div
              key={category.name}
              custom={catIndex}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="mb-10"
            >
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-beige/50 dark:bg-dark-surface flex items-center justify-center">
                  <category.icon className={`w-5 h-5 ${category.color}`} />
                </div>
                <h2 className="font-display text-xl md:text-2xl text-dark dark:text-beige">
                  {category.name}
                </h2>
              </div>

              {/* Questions */}
              <div className="space-y-2">
                {category.faqs.map((faq, faqIndex) => {
                  const key = `${catIndex}-${faqIndex}`;
                  const isOpen = openItems[key] || false;
                  return (
                    <div
                      key={key}
                      className="border border-beige-dark/30 dark:border-dark-border rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(key)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-beige/20 dark:hover:bg-dark-surface transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <HelpCircle className="w-4 h-4 text-gold flex-shrink-0" />
                          <span className="font-medium text-dark dark:text-beige text-sm md:text-base">
                            {faq.question}
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="px-4 pb-4 pl-11"
                        >
                          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base leading-relaxed">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="bg-beige/30 dark:bg-dark-surface rounded-2xl border border-beige-dark/30 dark:border-dark-border p-8 max-w-xl mx-auto">
            <HelpCircle className="w-10 h-10 text-gold mx-auto mb-4" />
            <h3 className="font-display text-xl text-dark dark:text-beige mb-2">
              Autre question ?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Notre equipe est disponible pour repondre a toutes vos questions.
            </p>
            <a
              href="https://wa.me/33758167830?text=Bonjour%2C%20j%27ai%20une%20question%20%3A"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-medium transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Contactez-nous via WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
