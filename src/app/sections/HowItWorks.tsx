import { BrainCircuit, FileUp, ShieldCheck, WandSparkles } from "lucide-react";
import { workflow } from "../content/site";
import { Reveal } from "../components/ui/Reveal";
import { SectionIntro } from "../components/ui/SectionIntro";
const icons=[FileUp,BrainCircuit,ShieldCheck,WandSparkles];
export function HowItWorks(){return <section className="section how" id="how-it-works"><SectionIntro eyebrow="How MIRA works" title="From conversation to clear next steps." copy="MIRA complements the tools you already use. Start with one uploaded session."/><div className="how-layout"><div className="steps">{workflow.map((step,index)=>{const Icon=icons[index];return <Reveal className="step" key={step.step} delay={index*55}><span><Icon size={18}/></span><b>{index+1}. {step.title}</b><p>{step.text}</p></Reveal>})}</div><Reveal className="risk-card"><em>Executive insight</em><h3>Ownership is unclear</h3><p>Three moments point to the same unresolved decision.</p><div className="risk-evidence"><span>Evidence status</span><b>Ready for review</b></div><a href="#product">See the evidence →</a><small>3 signals · people can validate</small></Reveal></div></section>}
