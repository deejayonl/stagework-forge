import { ReactNode, useState } from 'react'

interface TooltipProps {
  children: ReactNode
  content: string
}

export function Tooltip({ children, content }: TooltipProps) {
  const [show, setShow] = useState(false)

  return (
    <div 
      className="relative flex items-center justify-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <div 
        className={`absolute bottom-full mb-2 px-3 py-1.5 bg-[var(--text-primary)] text-[var(--bg-main)] text-[10px] font-bold uppercase tracking-wider rounded-xl whitespace-nowrap pointer-events-none transition-all duration-300 ease-spring z-50 ${
          show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'
        }`}
      >
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--text-primary)]" />
      </div>
    </div>
  )
}
