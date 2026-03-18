'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, ArrowRight, CheckCircle2, Ticket, Sparkles, PartyPopper } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-lg text-center"
    >
      {/* Animated success icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="relative w-24 h-24 mx-auto mb-8"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 animate-pulse" />
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
          <Mail className="w-10 h-10 text-primary-foreground" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"
        >
          <CheckCircle2 className="w-5 h-5 text-white" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="text-3xl font-bold mb-3">
          Cuenta creada exitosamente
        </h1>
        <p className="text-lg text-primary font-medium mb-2">
          Solo falta un paso mas
        </p>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Te hemos enviado un email de confirmacion. Revisa tu bandeja de entrada 
          y haz clic en el enlace para activar tu cuenta.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 text-left">
              <div className="p-3 rounded-xl bg-primary/10">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Pasos para activar tu cuenta</h3>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">1</span>
                    Abre tu bandeja de entrada
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">2</span>
                    Busca el email de Ticketera
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">3</span>
                    Haz clic en &quot;Confirmar email&quot;
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 text-xs flex items-center justify-center font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                    </span>
                    Listo! Seras redirigido automaticamente
                  </li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <p className="text-sm text-muted-foreground">
            No recibiste el email? Revisa tu carpeta de <strong>spam</strong> o{' '}
            <Link href="/auth/sign-up" className="text-primary hover:underline font-medium">
              intenta registrarte nuevamente
            </Link>
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/">
              <Ticket className="w-4 h-4 mr-2" />
              Explorar eventos
            </Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href="/auth/login">
              Ya confirme mi email
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Fun decorative elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 flex justify-center gap-2 text-muted-foreground/30"
      >
        <PartyPopper className="w-5 h-5" />
        <Sparkles className="w-5 h-5" />
        <Ticket className="w-5 h-5" />
      </motion.div>
    </motion.div>
  )
}
