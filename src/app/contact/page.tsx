'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  MessageCircle,
  Mail,
  Clock,
  MapPin,
  Send,
  Globe,
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

const contactMethods = [
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    subtitle: 'Reponse rapide',
    value: '+33 7 58 16 78 30',
    link: 'https://wa.me/33758167830?text=Bonjour%2C%20je%20vous%20contacte%20depuis%20le%20site%20Bellalure.',
    color: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
    iconColor: 'text-green-600 dark:text-green-400',
    primary: true,
  },
  {
    icon: Mail,
    title: 'Email',
    subtitle: 'Reponse sous 24h',
    value: 'contact@bellalure.com',
    link: 'mailto:contact@bellalure.com',
    color: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
    primary: false,
  },
];

const socialLinks = [
  {
    icon: Globe,
    name: 'Instagram',
    handle: '@bellalure.shop',
    link: 'https://instagram.com/bellalure.shop',
    color: 'bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800',
    iconColor: 'text-pink-600 dark:text-pink-400',
  },
  {
    icon: Globe,
    name: 'Facebook',
    handle: 'Bellalure',
    link: 'https://facebook.com/bellalure',
    color: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
];

// TikTok icon component since lucide doesn't have one
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.51a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.97a8.25 8.25 0 004.76 1.5V7.02a4.84 4.84 0 01-1-.33z" />
    </svg>
  );
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Bonjour, je suis ${formData.name} (${formData.email}). ${formData.message}`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/33758167830?text=${encoded}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link href="/" className="hover:text-gold transition-colors">Accueil</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-dark dark:text-beige font-medium">Contact</span>
        </nav>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="font-display text-4xl md:text-5xl text-dark dark:text-beige mb-4">
            Contactez-nous
          </h1>
          <div className="w-24 h-0.5 bg-gold mx-auto mb-6" />
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Notre equipe est a votre disposition pour repondre a toutes vos questions
            et vous accompagner dans vos achats.
          </p>
        </motion.div>

        {/* WhatsApp CTA - Primary */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="max-w-xl mx-auto mb-16"
        >
          <a
            href="https://wa.me/33758167830?text=Bonjour%2C%20je%20vous%20contacte%20depuis%20le%20site%20Bellalure."
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-green-600 hover:bg-green-700 text-white rounded-2xl p-8 text-center transition-colors group"
          >
            <MessageCircle className="w-14 h-14 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-bold mb-2">Ecrivez-nous sur WhatsApp</h2>
            <p className="text-green-100 mb-4">Le moyen le plus rapide de nous joindre</p>
            <span className="inline-flex items-center gap-2 bg-white/20 px-6 py-2 rounded-full text-sm font-medium">
              +33 7 58 16 78 30
            </span>
          </a>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {/* Contact Methods Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {contactMethods.map((method, i) => (
              <motion.a
                key={method.title}
                href={method.link}
                target={method.title === 'WhatsApp' ? '_blank' : undefined}
                rel={method.title === 'WhatsApp' ? 'noopener noreferrer' : undefined}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className={`block rounded-2xl border p-6 transition-all hover:shadow-md ${method.color}`}
              >
                <method.icon className={`w-8 h-8 mb-3 ${method.iconColor}`} />
                <h3 className="font-display text-lg text-dark dark:text-beige mb-1">{method.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{method.subtitle}</p>
                <p className="font-medium text-dark dark:text-beige">{method.value}</p>
              </motion.a>
            ))}
          </div>

          {/* Business Hours & Social */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {/* Hours */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-beige/30 dark:bg-dark-surface rounded-2xl border border-beige-dark/30 dark:border-dark-border p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-display text-lg text-dark dark:text-beige">Horaires</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Lundi - Samedi</span>
                  <span className="font-medium text-dark dark:text-beige">9h - 18h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Dimanche</span>
                  <span className="font-medium text-red-500">Ferme</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-beige-dark/30 dark:border-dark-border">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Kinshasa, Republique Democratique du Congo
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Social Media */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-beige/30 dark:bg-dark-surface rounded-2xl border border-beige-dark/30 dark:border-dark-border p-6"
            >
              <h3 className="font-display text-lg text-dark dark:text-beige mb-4">Suivez-nous</h3>
              <div className="space-y-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-sm ${social.color}`}
                  >
                    <social.icon className={`w-5 h-5 ${social.iconColor}`} />
                    <div>
                      <p className="font-medium text-dark dark:text-beige text-sm">{social.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{social.handle}</p>
                    </div>
                  </a>
                ))}
                <a
                  href="https://tiktok.com/@bellalure"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl border bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800 transition-all hover:shadow-sm"
                >
                  <TikTokIcon className="w-5 h-5 text-gray-800 dark:text-gray-200" />
                  <div>
                    <p className="font-medium text-dark dark:text-beige text-sm">TikTok</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">@bellalure</p>
                  </div>
                </a>
              </div>
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="font-display text-2xl md:text-3xl text-dark dark:text-beige text-center mb-2">
              Envoyez-nous un message
            </h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-8 text-sm">
              Le formulaire ouvrira WhatsApp avec votre message pre-rempli.
            </p>

            <form onSubmit={handleSubmit} className="bg-beige/30 dark:bg-dark-surface rounded-2xl border border-beige-dark/30 dark:border-dark-border p-8">
              <div className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-dark dark:text-beige mb-2">
                    Nom complet
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Votre nom"
                    className="w-full px-4 py-3 rounded-xl border border-beige-dark/30 dark:border-dark-border bg-white dark:bg-[#0A0A0A] text-dark dark:text-beige placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-dark dark:text-beige mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="votre@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-beige-dark/30 dark:border-dark-border bg-white dark:bg-[#0A0A0A] text-dark dark:text-beige placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-dark dark:text-beige mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Decrivez votre demande..."
                    className="w-full px-4 py-3 rounded-xl border border-beige-dark/30 dark:border-dark-border bg-white dark:bg-[#0A0A0A] text-dark dark:text-beige placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-white py-3 rounded-xl font-medium transition-colors"
                >
                  <Send className="w-5 h-5" />
                  Envoyer via WhatsApp
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
