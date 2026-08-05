import { BarChart3, ChevronDown, CirclePlay, FileText, LayoutDashboard, Lightbulb, Radio, Sparkles } from "lucide-react";
import logo from "../../../assets/mira-logo-icon.png";
import wordmark from "../../../assets/mira-wordmark-header.png";
import { metrics } from "../../content/site";

export function ProductLogo() {
  return <span className="product-logo" aria-label="MIRA"><img src={logo} alt="" width="20" height="20" /><span className="product-brand-copy"><img className="product-wordmark" src={wordmark} alt="" width="34" /></span></span>;
}

const nav = [
  [LayoutDashboard, "Overview"], [FileText, "Sessions"], [Radio, "Signals"], [Sparkles, "Reports"],
] as const;

export function InsightPanel({ report = false }: { report?: boolean }) {
  return (
    <div className={`dashboard ${report ? "dashboard--report" : ""}`} aria-label="MIRA product report preview">
      <aside className="dash-sidebar">
        <ProductLogo />
        <nav aria-label="Dashboard navigation">{nav.map(([Icon, label], index) => <span key={label} className={index === 0 ? "active" : ""}><Icon size={13} />{label}</span>)}</nav>
      </aside>
      <div className="dash-main">
        <header className="dash-head"><div><h3>{report ? "Leadership Offsite" : "Executive Overview"}</h3>{report && <p>May 15, 2026 · 12 participants</p>}</div><button type="button">Last 6 months <ChevronDown size={12} /></button></header>
        {report && <div className="dash-tabs"><span className="active">Summary</span><span>Understanding</span><span>Signals</span><span>Moments</span><span>Recommendations</span></div>}
        <div className="dash-summary"><span>Summary</span><div className="dash-metrics">{metrics.map((item, index) => <article key={item.label}><small>{item.label}</small><strong>{item.value}</strong><em className={index === 2 ? "risk" : ""}>{item.delta}</em>{index < 2 && <div className={`tiny-chart chart-${index}`}><i/><i/><i/><i/><i/></div>}</article>)}</div></div>
        <div className="dash-lower">
          <section className="dash-insights"><div className="dash-card-title"><b>{report ? "Understanding by topic" : "Top insights"}</b><span>View report →</span></div>{report ? <div className="topic-bars">{[["Company vision",92],["Q2 priorities",68],["Resource allocation",54],["Risk assessment",81]].map(([label,value], i)=><div key={String(label)}><span>{label}</span><i><b className={`bar-${i}`} style={{width:`${value}%`}} /></i><strong>{value}%</strong></div>)}</div> : <div className="insight-items"><p><i className="dot-purple"/><span><b>Go-to-market risks increased</b><small>Positioning needs clearer ownership</small></span></p><p><i className="dot-green"/><span><b>Leadership alignment improved</b><small>Priorities are now more consistent</small></span></p><p><i className="dot-red"/><span><b>Validation needed</b><small>Evidence gap in rollout planning</small></span></p></div>}</section>
          <section className="dash-recommend"><div className="dash-card-title"><b>{report ? "Top recommendations" : "Evidence over time"}</b></div>{report ? <div className="recommend-list">{["Align on Q2 priorities","Clarify resource plan","Address risk mitigation"].map((text,i)=><p key={text}><Lightbulb size={12}/><span>{text}</span><em>{i===0?"High":"Review"}</em></p>)}</div> : <div className="line-chart"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><svg viewBox="0 0 240 100" role="img" aria-label="Evidence trend over six months"><polyline points="6,78 50,49 91,61 132,31 177,44 229,14" fill="none" stroke="#6d4ce8" strokeWidth="3"/><polyline points="6,59 50,30 91,43 132,17 177,26 229,8" fill="none" stroke="#20a464" strokeWidth="2"/></svg></div>}</section>
        </div>
        {report && <div className="report-footer"><span><CirclePlay size={13}/> Evidence linked to every finding</span><span><BarChart3 size={13}/> Confidence shown explicitly</span></div>}
      </div>
    </div>
  );
}
