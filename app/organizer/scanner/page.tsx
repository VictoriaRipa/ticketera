'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Camera, 
  CameraOff, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Ticket,
  Calendar,
  User,
  Clock,
  Search,
  RefreshCw,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import type { Event, Ticket as TicketType } from '@/lib/types'

interface ScanResult {
  success: boolean
  message: string
  ticket?: {
    id: string
    qr_code: string
    status: string
    attendee_name: string
    attendee_email: string
    ticket_type_name: string
    event_title: string
    checked_in_at?: string
  }
}

interface CheckInStats {
  total: number
  checkedIn: number
  remaining: number
}

export default function QRScannerPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [stats, setStats] = useState<CheckInStats>({ total: 0, checkedIn: 0, remaining: 0 })
  const [manualCode, setManualCode] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [recentScans, setRecentScans] = useState<ScanResult[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerContainerRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Fetch organizer's events
  useEffect(() => {
    async function fetchEvents() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', user.id)
        .in('status', ['published', 'draft'])
        .order('start_date', { ascending: true })

      if (data) {
        setEvents(data)
        // Auto-select the first event or the one happening today
        const today = new Date()
        const todayEvent = data.find(e => {
          const eventDate = new Date(e.start_date)
          return eventDate.toDateString() === today.toDateString()
        })
        if (todayEvent) {
          setSelectedEventId(todayEvent.id)
        } else if (data.length > 0) {
          setSelectedEventId(data[0].id)
        }
      }
    }
    fetchEvents()
  }, [supabase])

  // Fetch stats when event changes
  useEffect(() => {
    async function fetchStats() {
      if (!selectedEventId) return

      // First get all orders for this event
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('event_id', selectedEventId)
        .eq('status', 'completed')

      if (!orders || orders.length === 0) {
        setStats({ total: 0, checkedIn: 0, remaining: 0 })
        return
      }

      const orderIds = orders.map(o => o.id)

      // Then get all tickets for those orders
      const { data: tickets } = await supabase
        .from('tickets')
        .select('id, status')
        .in('order_id', orderIds)

      if (tickets) {
        const total = tickets.length
        const checkedIn = tickets.filter(t => t.status === 'used').length
        setStats({
          total,
          checkedIn,
          remaining: total - checkedIn
        })
      }
    }
    fetchStats()
  }, [selectedEventId, scanResult, supabase])

  // Initialize scanner
  const startScanner = useCallback(async () => {
    if (!scannerContainerRef.current) return
    
    setError(null)
    
    try {
      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        async (decodedText) => {
          // Pause scanner while processing
          if (scannerRef.current?.getState() === Html5QrcodeScannerState.SCANNING) {
            await scannerRef.current.pause()
          }
          await handleScan(decodedText)
          // Resume scanner after processing
          setTimeout(async () => {
            if (scannerRef.current?.getState() === Html5QrcodeScannerState.PAUSED) {
              await scannerRef.current.resume()
            }
          }, 2000)
        },
        () => {} // Ignore errors (no QR detected)
      )

      setIsScanning(true)
    } catch (err) {
      console.error('[v0] Error starting scanner:', err)
      setError('No se pudo acceder a la camara. Verifica los permisos.')
    }
  }, [])

  // Stop scanner
  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState()
        if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
          await scannerRef.current.stop()
        }
      } catch (err) {
        console.error('[v0] Error stopping scanner:', err)
      }
      scannerRef.current = null
    }
    setIsScanning(false)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  // Handle QR scan
  const handleScan = async (qrCode: string) => {
    if (isProcessing || !selectedEventId) return
    setIsProcessing(true)

    try {
      const response = await fetch('/api/tickets/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_code: qrCode, event_id: selectedEventId })
      })

      const result: ScanResult = await response.json()
      setScanResult(result)
      setRecentScans(prev => [result, ...prev.slice(0, 9)])

      // Play sound feedback
      if (typeof window !== 'undefined') {
        const audio = new Audio(result.success ? '/sounds/success.mp3' : '/sounds/error.mp3')
        audio.play().catch(() => {})
      }
    } catch (err) {
      console.error('[v0] Error validating ticket:', err)
      setScanResult({
        success: false,
        message: 'Error al validar el ticket'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle manual code entry
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualCode.trim()) return
    await handleScan(manualCode.trim())
    setManualCode('')
  }

  const selectedEvent = events.find(e => e.id === selectedEventId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Escaner QR</h1>
          <p className="text-muted-foreground">
            Valida los tickets de tus asistentes
          </p>
        </div>
      </div>

      {/* Event Selector and Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Seleccionar Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un evento" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{event.title}</span>
                      <span className="text-muted-foreground text-xs">
                        ({format(new Date(event.start_date), "d MMM", { locale: es })})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedEvent && (
              <div className="mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {format(new Date(selectedEvent.start_date), "EEEE d 'de' MMMM, yyyy - HH:mm", { locale: es })} hs
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Check-ins</p>
                <p className="text-2xl font-bold text-green-500">{stats.checkedIn}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-500">{stats.remaining}</p>
              </div>
              <Ticket className="w-8 h-8 text-yellow-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Camara
            </CardTitle>
            <CardDescription>
              Apunta la camara al codigo QR del ticket
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Scanner Container */}
            <div 
              ref={scannerContainerRef}
              className="relative aspect-square bg-muted rounded-lg overflow-hidden"
            >
              <div id="qr-reader" className="w-full h-full" />
              
              {!isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <CameraOff className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Camara desactivada</p>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
            </div>

            {/* Scanner Controls */}
            <div className="flex gap-2">
              {!isScanning ? (
                <Button 
                  onClick={startScanner} 
                  className="flex-1"
                  disabled={!selectedEventId}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Iniciar Camara
                </Button>
              ) : (
                <Button 
                  onClick={stopScanner} 
                  variant="destructive"
                  className="flex-1"
                >
                  <CameraOff className="w-4 h-4 mr-2" />
                  Detener Camara
                </Button>
              )}
            </div>

            {/* Manual Entry */}
            <div className="border-t pt-4">
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <Input
                  placeholder="Codigo QR manual..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  disabled={!selectedEventId || isProcessing}
                />
                <Button type="submit" disabled={!manualCode.trim() || !selectedEventId || isProcessing}>
                  <Search className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Result and History */}
        <div className="space-y-6">
          {/* Current Result */}
          <AnimatePresence mode="wait">
            {scanResult && (
              <motion.div
                key={scanResult.ticket?.id || 'result'}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className={`border-2 ${scanResult.success ? 'border-green-500 bg-green-500/5' : 'border-destructive bg-destructive/5'}`}>
                  <CardContent className="pt-6">
                    <div className="text-center mb-4">
                      {scanResult.success ? (
                        <CheckCircle2 className="w-16 h-16 mx-auto text-green-500" />
                      ) : (
                        <XCircle className="w-16 h-16 mx-auto text-destructive" />
                      )}
                      <p className={`text-xl font-bold mt-2 ${scanResult.success ? 'text-green-500' : 'text-destructive'}`}>
                        {scanResult.success ? 'Check-in Exitoso' : 'Error'}
                      </p>
                      <p className="text-muted-foreground">{scanResult.message}</p>
                    </div>

                    {scanResult.ticket && (
                      <div className="space-y-3 border-t pt-4">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{scanResult.ticket.attendee_name}</p>
                            <p className="text-sm text-muted-foreground">{scanResult.ticket.attendee_email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Ticket className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{scanResult.ticket.ticket_type_name}</p>
                            <p className="text-sm text-muted-foreground font-mono">{scanResult.ticket.qr_code}</p>
                          </div>
                        </div>
                        {scanResult.ticket.checked_in_at && (
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Check-in: {format(new Date(scanResult.ticket.checked_in_at), "HH:mm:ss", { locale: es })}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => setScanResult(null)}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Escanear Otro
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recent Scans */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ultimos Escaneos</CardTitle>
            </CardHeader>
            <CardContent>
              {recentScans.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Ticket className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No hay escaneos recientes</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {recentScans.map((scan, index) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        scan.success ? 'bg-green-500/10' : 'bg-destructive/10'
                      }`}
                    >
                      {scan.success ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-destructive shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {scan.ticket?.attendee_name || 'Desconocido'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {scan.ticket?.ticket_type_name || scan.message}
                        </p>
                      </div>
                      <Badge variant={scan.success ? 'default' : 'destructive'} className="shrink-0">
                        {scan.success ? 'OK' : 'Error'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
