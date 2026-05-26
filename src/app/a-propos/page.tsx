'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  Star,
  Heart,
  Users,
  Globe,
  Shield,
  Sparkles,
  MessageCircle,
} from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const values = [
  {
    icon: Star,
    title: 'Qualite',
    description: 'Nous selectionnons rigoureusement chaque article pour garantir des produits de haute qualite, authentiques et durables.',
    color: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    icon: Shield,
    title: 'Authenticite',
    description: 'Tous nos produits sont 100% authentiques. Nous travaillons directement avec des fournisseurs agrees pour vous offrir le meilleur.',
    color: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: Heart,
    title: 'Service personnalise',
    description: 'Chaque client est unique. Notre equipe vous accompagne personnellement dans vos choix via WhatsApp pour une experience sur mesure.',
    color: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
];

const teamMembers = [
  {
    name: 'Fondateur',
    role: 'Direction & Vision',
    initials: 'BL',
  },
  {
    name: 'Responsable Mode',
    role: 'Selection & Tendances',
    initials: 'RM',
  },
  {
    name: 'Service Client',
    role: 'Accompagnement & Conseil',
    initials: 'SC',
  },
  {
    name: 'Logistique',
    role: 'Livraison & Operations',
    initials: 'LG',
  },
];

const stats = [
  { value: '500+', label: 'Clients satisfaits' },
  { value: '1000+', label: 'Articles disponibles' },
  { value: '10+', label: 'Pays livres' },
  { value: '24h', label: 'Temps de reponse' },
];

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link href="/" className="hover:text-gold transition-colors">Accueil</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-dark dark:text-beige font-medium">A propos</span>
        </nav>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="font-display text-4xl md:text-5xl text-dark dark:text-beige mb-4">
            A propos de Bellalure
          </h1>
          <div className="w-24 h-0.5 bg-gold mx-auto mb-6" />
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            La mode premium pour l&apos;Afrique et la diaspora, depuis Kinshasa.
          </p>
        </motion.div>

        {/* Brand Story */}
        <div className="max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-beige/30 dark:bg-dark-surface rounded-2xl border border-beige-dark/30 dark:border-dark-border p-8 md:p-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-gold" />
              </div>
              <h2 className="font-display text-2xl text-dark dark:text-beige">Notre histoire</h2>
            </div>
            <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                <strong className="text-dark dark:text-beige">Bellalure</strong> est nee d&apos;une
                vision simple mais ambitieuse : rendre la mode internationale accessible en
                Republique Democratique du Congo et a travers toute la diaspora africaine.
              </p>
              <p>
                Basee a Kinshasa, notre boutique en ligne propose une selection soignee de
                vetements, chaussures, sacs et accessoires provenant des meilleures marques et
                tendances du monde entier. Chaque piece est choisie avec soin pour refleter
                l&apos;elegance, la qualite et le style qui definissent notre clientele.
              </p>
              <p>
                Nous croyons que le style n&apos;a pas de frontieres. C&apos;est pourquoi nous
                livrons partout en RDC et dans le monde, offrant a chacun la possibilite de
                s&apos;habiller avec les dernieres tendances internationales.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Mission */}
        <div className="max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Globe className="w-12 h-12 text-gold mx-auto mb-4" />
            <h2 className="font-display text-2xl md:text-3xl text-dark dark:text-beige mb-4">
              Notre mission
            </h2>
            <div className="w-16 h-0.5 bg-gold mx-auto mb-6" />
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
              Rendre la mode internationale accessible a tous, en offrant des produits premium
              a des prix justes, avec un service client exceptionnel et une livraison fiable
              en Afrique et dans le monde entier.
            </p>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="max-w-3xl mx-auto mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="bg-beige/30 dark:bg-dark-surface rounded-2xl border border-beige-dark/30 dark:border-dark-border p-6 text-center"
              >
                <p className="text-3xl font-bold text-gold mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-display text-2xl md:text-3xl text-dark dark:text-beige text-center mb-10"
          >
            Nos valeurs
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className={`rounded-2xl border p-6 text-center ${value.color}`}
              >
                <value.icon className={`w-10 h-10 mx-auto mb-4 ${value.iconColor}`} />
                <h3 className="font-display text-xl text-dark dark:text-beige mb-3">{value.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-display text-2xl md:text-3xl text-dark dark:text-beige text-center mb-10"
          >
            Notre equipe
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {teamMembers.map((member, i) => (
              <motion.div
                key={member.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-full bg-gold/10 border-2 border-gold/30 flex items-center justify-center mx-auto mb-3">
                  <span className="text-gold font-display text-xl">{member.initials}</span>
                </div>
                <h3 className="font-medium text-dark dark:text-beige text-sm">{member.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{member.role}</p>
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
          <div className="bg-beige/30 dark:bg-dark-surface rounded-2xl border border-beige-dark/30 dark:border-dark-border p-8 max-w-xl mx-auto">
            <Users className="w-10 h-10 text-gold mx-auto mb-4" />
            <h3 className="font-display text-xl text-dark dark:text-beige mb-2">
              Rejoignez la communaute Bellalure
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Suivez-nous sur les reseaux sociaux et decouvrez nos nouveautes en avant-premiere.
            </p>
            <a
              href="https://wa.me/33758167830?text=Bonjour%2C%20je%20souhaite%20en%20savoir%20plus%20sur%20Bellalure."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-medium transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Discutons sur WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
