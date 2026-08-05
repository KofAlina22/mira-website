import logo from "../../../assets/mira-logo-icon.png";
import wordmark from "../../../assets/mira-wordmark-header.png";
export function SiteFooter() {
  return <footer className="site-footer"><a href="#content" className="brand footer-brand" aria-label="MIRA home"><img className="footer-brand-icon" src={logo} alt="" width="38" height="38" /><span><img className="footer-brand-wordmark" src={wordmark} alt="" width="96" /></span></a><nav aria-label="Footer navigation"><a href="#product">Product</a><a href="#start">Pricing</a><a href="#start">Login</a><a href="mailto:hello@ai-mira.tech?subject=Privacy">Privacy</a><a href="mailto:hello@ai-mira.tech?subject=Terms">Terms</a><a href="mailto:hello@ai-mira.tech">Contact</a></nav><span>© 2026 MIRA Inc.</span></footer>;
}
