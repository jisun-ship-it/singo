import logoMarkSrc from '../../design/logo-mark.svg'

export function BrandLogo({ size = 32, fontSize = 20 }: { size?: number; fontSize?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <img src={logoMarkSrc} alt="Singo logo" width={size} />
      <span
        style={{
          fontFamily: 'Manrope, sans-serif',
          fontWeight: 600,
          fontSize,
          letterSpacing: '-.02em',
          color: '#1F2328',
        }}
      >
        Singo
      </span>
    </div>
  )
}
