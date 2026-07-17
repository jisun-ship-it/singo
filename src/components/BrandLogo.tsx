import logoMarkSrc from '../../design/logo-mark.svg'

export function BrandLogo({ size = 20 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <img src={logoMarkSrc} alt="Singo logo" width={size} />
      <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 600, color: '#1F2328' }}>
        Singo
      </span>
    </div>
  )
}
