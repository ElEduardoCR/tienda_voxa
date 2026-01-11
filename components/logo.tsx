import Link from "next/link"
import Image from "next/image"

interface LogoProps {
  className?: string
  showTagline?: boolean
  size?: "sm" | "md" | "lg"
}

export function Logo({ className = "", showTagline = false, size = "md" }: LogoProps) {
  const heightClasses = {
    sm: "h-8",
    md: "h-10",
    lg: "h-12",
  }

  const widthClasses = {
    sm: "w-auto",
    md: "w-auto",
    lg: "w-auto",
  }

  return (
    <Link href="/" className={`flex flex-col items-start ${className}`}>
      <div className={`relative ${widthClasses[size]} ${heightClasses[size]}`}>
        <Image
          src="/logo.png"
          alt="VOXA"
          width={size === "sm" ? 80 : size === "md" ? 100 : 120}
          height={size === "sm" ? 32 : size === "md" ? 40 : 48}
          className="object-contain"
          priority
        />
      </div>
      {showTagline && (
        <span className="text-white text-xs font-light uppercase tracking-wide mt-2">
          MANUFACTURA, SIMPLE.
        </span>
      )}
    </Link>
  )
}

