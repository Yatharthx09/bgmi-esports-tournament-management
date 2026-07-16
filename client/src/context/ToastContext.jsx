import { Toaster, toast } from 'react-hot-toast'

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: 'rgba(13, 18, 26, 0.95)',
          color: '#e2e8f0',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          backdropFilter: 'blur(12px)',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
        },
        success: { iconTheme: { primary: '#39ff88', secondary: '#05070a' } },
        error: { iconTheme: { primary: '#fb7185', secondary: '#05070a' } },
      }}
    />
  )
}

export { toast }
