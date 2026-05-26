'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, FileText, Scale } from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const sections = [
  {
    title: 'Article 1 — Objet',
    content: [
      'Les presentes Conditions Generales de Vente (CGV) regissent l\'ensemble des ventes effectuees par Bellalure, boutique en ligne de mode et accessoires, accessible a l\'adresse bellalure.com.',
      'Toute commande passee sur le site implique l\'acceptation sans reserve des presentes CGV par le client.',
      'Bellalure se reserve le droit de modifier les presentes CGV a tout moment. Les conditions applicables sont celles en vigueur au moment de la commande.',
    ],
  },
  {
    title: 'Article 2 — Prix',
    content: [
      'Les prix des produits sont indiques en dollars americains (USD), toutes taxes comprises.',
      'Bellalure se reserve le droit de modifier ses prix a tout moment. Les produits seront factures sur la base des tarifs en vigueur au moment de la validation de la commande.',
      'Les frais de livraison ne sont pas inclus dans le prix des produits et sont indiques separement avant la validation de la commande.',
    ],
  },
  {
    title: 'Article 3 — Commandes',
    content: [
      'Les commandes sont passees via WhatsApp ou directement sur le site. Toute commande est confirmee par un message de validation de notre equipe.',
      'Bellalure se reserve le droit de refuser ou d\'annuler toute commande en cas de litige existant, de non-paiement d\'une commande anterieure ou d\'indisponibilite du produit.',
      'Un acompte peut etre demande pour confirmer la commande. Le montant de l\'acompte sera convenu entre le client et Bellalure.',
      'La commande n\'est consideree comme definitive qu\'apres confirmation de la reception du paiement (acompte ou totalite) par Bellalure.',
    ],
  },
  {
    title: 'Article 4 — Livraison',
    content: [
      'Bellalure livre a Kinshasa, dans les provinces de la RDC et a l\'international. Les delais et frais de livraison varient selon la destination.',
      'Kinshasa : 1 a 2 jours ouvrables — 5 $. Provinces RDC : 5 a 10 jours ouvrables — 15 $. International : 15 a 30 jours ouvrables — 30 $.',
      'Les delais de livraison sont donnes a titre indicatif et ne constituent pas un engagement contractuel. Un retard de livraison ne pourra donner lieu a l\'annulation de la commande ou a des dommages et interets.',
      'Le client est tenu de verifier l\'etat du colis a la reception. Toute anomalie doit etre signalee dans les 48 heures suivant la livraison.',
    ],
  },
  {
    title: 'Article 5 — Retours et echanges',
    content: [
      'Le client dispose d\'un delai de 7 jours a compter de la reception de sa commande pour demander un retour ou un echange.',
      'L\'article doit etre retourne dans son etat d\'origine, non porte, non lave, avec les etiquettes et l\'emballage d\'origine.',
      'Certains articles ne sont pas eligibles au retour : maillots de bain, sous-vetements, lingerie, accessoires, articles en promotion et articles personnalises.',
      'Les frais de retour sont a la charge du client, sauf en cas d\'erreur de Bellalure ou de produit defectueux.',
      'Le remboursement est effectue dans un delai de 3 a 5 jours ouvrables apres reception et verification de l\'article retourne.',
    ],
  },
  {
    title: 'Article 6 — Responsabilite',
    content: [
      'Bellalure s\'engage a fournir des produits conformes a la description presentee sur le site. Les photographies des produits sont les plus fideles possible mais ne peuvent assurer une similitude parfaite avec le produit offert.',
      'La responsabilite de Bellalure ne saurait etre engagee en cas de force majeure, de perturbation ou de greve totale ou partielle des services postaux et moyens de transport.',
      'Bellalure ne pourra etre tenue responsable des dommages resultant d\'une mauvaise utilisation du produit achete.',
      'En cas de produit defectueux ou non conforme, Bellalure s\'engage a proceder a l\'echange ou au remboursement du produit concerne.',
    ],
  },
  {
    title: 'Article 7 — Donnees personnelles',
    content: [
      'Les informations collectees lors de la commande sont necessaires au traitement de celle-ci. Elles sont traitees conformement a notre politique de confidentialite.',
      'Le client dispose d\'un droit d\'acces, de modification, de rectification et de suppression de ses donnees personnelles, qu\'il peut exercer en contactant Bellalure via WhatsApp ou par email a contact@bellalure.com.',
      'Bellalure s\'engage a ne pas communiquer les donnees personnelles de ses clients a des tiers, sauf obligation legale.',
      'Pour plus de details, veuillez consulter notre Politique de Confidentialite.',
    ],
  },
  {
    title: 'Article 8 — Droit applicable',
    content: [
      'Les presentes CGV sont soumises au droit en vigueur en Republique Democratique du Congo.',
      'En cas de litige, une solution amiable sera recherchee avant toute action judiciaire. A defaut, les tribunaux competents de Kinshasa seront seuls competents.',
    ],
  },
];

export default function CgvPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link href="/" className="hover:text-gold transition-colors">Accueil</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-dark dark:text-beige font-medium">Conditions Generales de Vente</span>
        </nav>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="font-display text-4xl md:text-5xl text-dark dark:text-beige mb-4">
            Conditions Generales de Vente
          </h1>
          <div className="w-24 h-0.5 bg-gold mx-auto mb-6" />
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Veuillez lire attentivement les conditions suivantes avant de passer commande.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Derniere mise a jour : Mai 2025
          </p>
        </motion.div>

        {/* Table of Contents */}
        <div className="max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-beige/30 dark:bg-dark-surface rounded-2xl border border-beige-dark/30 dark:border-dark-border p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-gold" />
              <h2 className="font-display text-lg text-dark dark:text-beige">Sommaire</h2>
            </div>
            <nav className="grid sm:grid-cols-2 gap-2">
              {sections.map((section, i) => (
                <a
                  key={i}
                  href={`#section-${i}`}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gold dark:hover:text-gold transition-colors py-1"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </motion.div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="space-y-10">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                id={`section-${i}`}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="scroll-mt-24"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Scale className="w-4 h-4 text-gold" />
                  </div>
                  <h2 className="font-display text-xl md:text-2xl text-dark dark:text-beige">
                    {section.title}
                  </h2>
                </div>
                <div className="pl-11 space-y-3">
                  {section.content.map((paragraph, j) => (
                    <p key={j} className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center text-sm text-gray-400 dark:text-gray-500 mb-12"
        >
          <div className="w-16 h-0.5 bg-gold/30 mx-auto mb-4" />
          <p>
            Pour toute question concernant nos CGV, contactez-nous a{' '}
            <a href="mailto:contact@bellalure.com" className="text-gold hover:underline">
              contact@bellalure.com
            </a>{' '}
            ou via{' '}
            <a
              href="https://wa.me/33758167830"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              WhatsApp
            </a>
            .
          </p>
        </motion.div>
      </div>
    </div>
  );
}
