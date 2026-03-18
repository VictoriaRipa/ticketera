'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Ticket, Shield, Zap, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTASection() {
  const features = [
    {
      icon: Ticket,
      title: 'Tickets Digitales',
      description: 'Recibe tus entradas al instante en tu email y dispositivo',
    },
    {
      icon: QrCode,
      title: 'Codigo QR Unico',
      description: 'Acceso seguro y rapido con validacion en tiempo real',
    },
    {
      icon: Shield,
      title: '100% Seguro',
      description: 'Transacciones protegidas y garantia de reembolso',
    },
    {
      icon: Zap,
      title: 'Acceso Instantaneo',
      description: 'Sin filas, escanea tu QR y disfruta del evento',
    },
  ]

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="text-center p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-chart-2/80 to-primary/80 animate-gradient-x" />
          
          {/* Content */}
          <div className="relative px-6 py-12 md:px-12 md:py-16 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
              Organiza tu propio evento
            </h2>
            <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto mb-8">
              Crea, gestiona y vende tickets para tus eventos de forma facil y rapida.
              Sin complicaciones, con todas las herramientas que necesitas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                asChild
                className="bg-white text-primary hover:bg-white/90 font-semibold"
              >
                <Link href="/auth/sign-up?role=organizer">
                  Empezar gratis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                asChild
                className="border-white/50 text-white hover:bg-white/10"
              >
                <Link href="/about">
                  Saber mas
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
