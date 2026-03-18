'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react'

const errorMessages: Record<string, string> = {
  auth_callback_error: 'Hubo un error al confirmar tu cuenta. El enlace puede haber expirado.',
  access_denied: 'Acceso denegado. No tienes permisos para acceder a esta pagina.',
  default: 'Ha ocurrido un error inesperado.',
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'default'
  const message = errorMessages[error] || errorMessages.default

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md text-center"
    >
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/20 flex items-center justify-center">
        <AlertTriangle className="w-10 h-10 text-destructive" />
      </div>

      <h1 className="text-3xl font-bold mb-4">Algo salio mal</h1>
      
      <p className="text-muted-foreground mb-8">
        {message}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
        </Button>
        <Button asChild>
          <Link href="/auth/sign-up">
            <RefreshCw className="w-4 h-4 mr-2" />
            Intentar nuevamente
          </Link>
        </Button>
      </div>
    </motion.div>
  )
}
