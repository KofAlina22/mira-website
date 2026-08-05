import { Clock3, EyeOff, Gauge, Route } from "lucide-react";
import { Reveal } from "../components/ui/Reveal";
import { SectionIntro } from "../components/ui/SectionIntro";

const problems = [[EyeOff,"Hidden insights","Critical signals stay buried in summaries and transcripts."],[Route,"Unclear next steps","Teams leave without shared ownership or direction."],[Gauge,"Slow decisions","Leaders act without confidence in what people understood."],[Clock3,"Wasted meeting time","Unresolved issues return in the next conversation."]] as const;
export function Problem(){return <section className="section problem"><SectionIntro eyebrow="The problem" title="You can’t improve what you can’t see." copy="Most tools show what happened. They don’t show whether people understood, remembered, or are ready to act."/><div className="problem-grid">{problems.map(([Icon,title,text],index)=><Reveal key={title} className="problem-card" delay={index*60}><span><Icon size={19}/></span><h3>{title}</h3><p>{text}</p></Reveal>)}</div></section>}
