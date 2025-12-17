import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  min?: number
  max?: number
  onChange?: (value: number) => void
}

export default function QuantitySelector({ min = 1, max = 99, onChange }: Props) {
  const [qty, setQty] = useState<number>(min)

  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v)))

  function set(v: number) {
    const next = clamp(v)
    setQty(next)
    onChange?.(next)
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-[#0a0e1a]/60 to-[#020304]/60 p-1 ring-1 ring-inset ring-cyan-400/20 backdrop-blur-sm">
      <Button type="button" onClick={() => set(qty - 1)} disabled={qty <= min} className="h-9 w-9 px-0">
        −
      </Button>
      <Input
        value={qty}
        onChange={(e) => set(Number(e.target.value) || min)}
        inputMode="numeric"
        pattern="[0-9]*"
        className="h-9 w-12 text-center"
      />
      <Button type="button" onClick={() => set(qty + 1)} disabled={qty >= max} className="h-9 w-9 px-0">
        +
      </Button>
    </div>
  )
}
