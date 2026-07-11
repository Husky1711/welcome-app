import { Link } from 'react-router-dom'
import signInBackground from '../../assets/sign-in-background.png'
import signInLogo from '../../assets/sign-in-logo.png'
import { BackChevronIcon } from '../icons/NavIcons'

interface AppHeaderProps {
  title: string
  subtitle?: string
  backTo?: string
  showBrand?: boolean
}

export function AppHeader({ title, subtitle, backTo, showBrand = false }: AppHeaderProps) {
  return (
    <header className="app-header app-header--hero">
      <div className="app-header__bg" aria-hidden="true">
        <img src={signInBackground} alt="" />
      </div>
      <div className="app-header__fade" aria-hidden="true" />

      <div className="app-header__inner">
        {backTo ? (
          <Link to={backTo} className="app-header__back app-header__back--solid" aria-label="Go back">
            <BackChevronIcon />
          </Link>
        ) : null}

        <div className="app-header__copy">
          {showBrand ? (
            <img src={signInLogo} alt="" className="app-header__brand" aria-hidden="true" />
          ) : null}
          <h1 className="app-header__title">{title}</h1>
          {subtitle ? <p className="app-header__subtitle">{subtitle}</p> : null}
        </div>
      </div>
    </header>
  )
}
