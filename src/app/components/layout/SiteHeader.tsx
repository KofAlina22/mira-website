import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import logo from "../../../assets/mira-logo-icon.png";
import wordmark from "../../../assets/mira-wordmark-header.png";
import { navigation } from "../../content/site";
import { openEarlyAccess } from "../early-access/EarlyAccessModal";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <header className="site-header">
      <div className="nav-shell">
        <a href="#content" className="brand header-brand" aria-label="MIRA home">
          <img className="header-brand-icon" src={logo} alt="" width="50" height="50" />
          <span className="header-brand-copy"><img className="header-brand-wordmark" src={wordmark} alt="" width="128" /></span>
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>
        <div className="nav-actions">
          <a className="text-link desktop-only" href="#start">Log in</a>
          <a className="button button--primary desktop-only" href="#early-access" onClick={(event) => { event.preventDefault(); openEarlyAccess("header", event.currentTarget); }}>Try MIRA free <ArrowRight size={14} /></a>
          <button className="menu-button" type="button" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {open && <nav id="mobile-menu" className="mobile-nav" aria-label="Mobile navigation">{navigation.map((item) => <a key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</a>)}<a href="#start" onClick={() => setOpen(false)}>Log in</a><a className="button button--primary" href="#early-access" onClick={(event) => { event.preventDefault(); openEarlyAccess("mobile_header", event.currentTarget); }}>Try MIRA free</a></nav>}
    </header>
  );
}
