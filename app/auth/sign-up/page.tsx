'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'

const signUpSchema = z.object({
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
  isOrganizer: z.boolean().default(false),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar los terminos y condiciones',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contrasenas no coinciden',
  path: ['confirmPassword'],
})

type SignUpForm = z.infer<typeof signUpSchema>

export default function SignUpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const isOrganizerParam = searchParams.get('role') === 'organizer'
  const redirectTo = searchParams.get('redirect') || '/'

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      isOrganizer: isOrganizerParam,
      acceptTerms: false,
    },
  })

  const isOrganizer = watch('isOrganizer')
  const acceptTerms = watch('acceptTerms')

  const onSubmit = async (data: SignUpForm) => {
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/auth/callback`,
          data: {
            full_name: data.fullName,
            role: data.isOrganizer ? 'organizer' : 'user',
          },
        },
      })

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Este email ya esta registrado')
        } else {
          toast.error(error.message)
        }
        return
      }

      router.push('/auth/sign-up-success')
    } catch {
      toast.error('Error al crear la cuenta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Crea tu cuenta</h1>
        <p className="text-muted-foreground">
          Unete a miles de usuarios y descubre los mejores eventos
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nombre completo</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="fullName"
              type="text"
              placeholder="Juan Perez"
              className="pl-10"
              disabled={isLoading}
              {...register('fullName')}
            />
          </div>
          {errors.fullName && (
            <p className="text-sm text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              className="pl-10"
              disabled={isLoading}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contrasena</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="******"
              className="pl-10 pr-10"
              disabled={isLoading}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar contrasena</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="******"
              className="pl-10"
              disabled={isLoading}
              {...register('confirmPassword')}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Organizer Option */}
        <div className="flex items-center space-x-2 py-2">
          <Checkbox
            id="isOrganizer"
            checked={isOrganizer}
            onCheckedChange={(checked) => setValue('isOrganizer', checked === true)}
            disabled={isLoading}
          />
          <label
            htmlFor="isOrganizer"
            className="text-sm font-medium leading-none cursor-pointer"
          >
            Quiero organizar eventos
          </label>
        </div>

        {/* Terms */}
        <div className="flex items-start space-x-2 py-2">
          <Checkbox
            id="acceptTerms"
            checked={acceptTerms}
            onCheckedChange={(checked) => setValue('acceptTerms', checked === true)}
            disabled={isLoading}
          />
          <label
            htmlFor="acceptTerms"
            className="text-sm text-muted-foreground leading-tight cursor-pointer"
          >
            Acepto los{' '}
            <Link href="/terms" className="text-primary hover:underline">
              Terminos y Condiciones
            </Link>{' '}
            y la{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Politica de Privacidad
            </Link>
          </label>
        </div>
        {errors.acceptTerms && (
          <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
        )}

        <Button type="submit" className="w-full h-11" disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Creando cuenta...
            </>
          ) : (
            'Crear cuenta'
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Ya tienes cuenta? </span>
        <Link 
          href={`/auth/login${redirectTo !== '/' ? `?redirect=${redirectTo}` : ''}`} 
          className="text-primary hover:underline font-medium"
        >
          Inicia sesion
        </Link>
      </div>
    </motion.div>
  )
}
