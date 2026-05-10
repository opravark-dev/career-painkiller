import { useState, useRef, useEffect } from "react";

function useTheme() {
  const [dark, setDark] = useState(() => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const h = e => setDark(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return [dark, setDark];
}

function getT(dark) {
  return dark ? {
    bg:"#0F172A", surface:"#1E293B", elevated:"#263348", border:"#334155", borderSub:"#2D3F55",
    text:"#F1F5F9", textSub:"#94A3B8", textMuted:"#64748B",
    accent:"#3B82F6", accentHov:"#2563EB", accentBg:"#1E3A5F", accentText:"#93C5FD",
    green:"#22C55E", greenBg:"#14532D", greenText:"#86EFAC",
    amber:"#F59E0B", amberBg:"#451A03", amberText:"#FCD34D",
    red:"#EF4444", redBg:"#450A0A", redText:"#FCA5A5",
    inputBg:"#1E293B",
  } : {
    bg:"#F8FAFC", surface:"#FFFFFF", elevated:"#F1F5F9", border:"#E2E8F0", borderSub:"#CBD5E1",
    text:"#0F172A", textSub:"#475569", textMuted:"#94A3B8",
    accent:"#2563EB", accentHov:"#1D4ED8", accentBg:"#EFF6FF", accentText:"#1D4ED8",
    green:"#16A34A", greenBg:"#F0FDF4", greenText:"#15803D",
    amber:"#D97706", amberBg:"#FFFBEB", amberText:"#B45309",
    red:"#DC2626", redBg:"#FFF1F1", redText:"#B91C1C",
    inputBg:"#FFFFFF",
  };
}

// ── Standalone Field (outside App so it never remounts) ──
function Field({ label, value, onChange, placeholder, type="text", multiline, rows=3, hint, t }) {
  const base = {
    width:"100%", boxSizing:"border-box", background:t.inputBg, border:`1px solid ${t.border}`,
    borderRadius:8, padding:"10px 12px", fontSize:14, color:t.text, outline:"none",
    fontFamily:"inherit", resize:"none", transition:"border-color 0.15s",
  };
  const focus = e => e.target.style.borderColor = t.accent;
  const blur  = e => e.target.style.borderColor = t.border;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      <label style={{fontSize:12,fontWeight:600,color:t.textSub,letterSpacing:"0.03em"}}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
            rows={rows} style={base} onFocus={focus} onBlur={blur} />
        : <input type={type} value={value} onChange={e=>onChange(e.target.value)}
            placeholder={placeholder} style={base} onFocus={focus} onBlur={blur} />}
      {hint && <span style={{fontSize:11,color:t.textMuted}}>{hint}</span>}
    </div>
  );
}

function Badge({ color="blue", children, t }) {
  const map = {
    blue:{bg:t.accentBg,text:t.accentText}, green:{bg:t.greenBg,text:t.greenText},
    amber:{bg:t.amberBg,text:t.amberText}, red:{bg:t.redBg,text:t.redText},
    slate:{bg:t.elevated,text:t.textSub},
  };
  const c = map[color]||map.blue;
  return <span style={{fontSize:11,fontWeight:600,padding:"3px 8px",borderRadius:99,background:c.bg,color:c.text,whiteSpace:"nowrap"}}>{children}</span>;
}

function Btn({ children, onClick, variant="primary", disabled, small, t }) {
  const styles = {
    primary:{background:t.accent,color:"#fff",border:"none"},
    secondary:{background:"transparent",color:t.textSub,border:`1px solid ${t.border}`},
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{...styles[variant],padding:small?"7px 13px":"11px 18px",borderRadius:8,fontSize:small?12:14,
        fontWeight:600,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.5:1,
        transition:"all 0.15s",width:variant==="primary"&&!small?"100%":"auto",fontFamily:"inherit"}}
      onMouseOver={e=>{if(!disabled&&variant==="primary")e.target.style.background=t.accentHov;}}
      onMouseOut={e=>{if(variant==="primary")e.target.style.background=t.accent;}}>
      {children}
    </button>
  );
}

function ATSBar({ score, label, t }) {
  const color = score>=75?t.green:score>=50?t.amber:t.red;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
        <span style={{fontSize:13,color:t.textSub,fontWeight:500}}>{label}</span>
        <span style={{fontSize:20,fontWeight:700,color}}>{score}<span style={{fontSize:12,fontWeight:400,color:t.textMuted}}>/100</span></span>
      </div>
      <div style={{background:t.border,borderRadius:99,height:8,overflow:"hidden"}}>
        <div style={{width:`${score}%`,height:"100%",background:color,borderRadius:99,transition:"width 1s ease"}} />
      </div>
    </div>
  );
}

function UpgradeLock({ title, desc, t }) {
  return (
    <div style={{background:t.elevated,border:`1.5px dashed ${t.borderSub}`,borderRadius:12,padding:"20px",
      display:"flex",flexDirection:"column",alignItems:"center",gap:10,textAlign:"center"}}>
      <div style={{width:36,height:36,borderRadius:"50%",background:t.accentBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🔒</div>
      <div>
        <p style={{fontWeight:600,fontSize:14,color:t.text,margin:"0 0 4px"}}>{title}</p>
        <p style={{fontSize:12,color:t.textSub,margin:0,lineHeight:1.5}}>{desc}</p>
      </div>
      <button onClick={()=>alert("Career Pro Pack\n\nUnlimited resumes (no watermark)\nCover Letter PDF / DOCX export\nPremium templates\nFull LinkedIn optimizer\n\n₹199 – Basic  |  ₹499 – Pro (3 months)\n\nGoogle Play Billing — coming soon")}
        style={{background:t.accent,color:"#fff",border:"none",borderRadius:8,padding:"9px 18px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
        Upgrade — ₹199 / ₹499
      </button>
    </div>
  );
}

const STEPS = ["Basics","Resume","Profile","Job Match","Results"];
const TABS  = [["resume","Resume"],["cover","Cover Letter"],["linkedin","LinkedIn"]];

async function callClaude(prompt) {
  const r = await fetch("/api/claude",{
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-3-haiku-20240307",max_tokens:400,messages:[{role:"user",content:prompt}]})
  });
  const d = await r.json();
  if(d.error) throw new Error(d.error.message);
  const tx = d.content?.find(b=>b.type==="text")?.text||"";
  const m = tx.match(/\{[\s\S]*\}/);
  if(!m) throw new Error("No JSON");
  return JSON.parse(m[0]);
}

export default function App() {
  const [dark, setDark] = useTheme();
  const t = getT(dark);

  const [step, setStep]         = useState(0);
  const [basic, setBasic]       = useState({name:"",email:"",phone:""});
  const [profile, setProfile]   = useState({role:"",summary:"",skills:"",experience:"",education:"",achievements:""});
  const [jobDesc, setJobDesc]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [loadMsg, setLoadMsg]   = useState("");
  const [results, setResults]   = useState(null);
  const [ats, setAts]           = useState(null);
  const [tab, setTab]           = useState("resume");
  const [err, setErr]           = useState("");
  const [used, setUsed]         = useState(false);
  const [autofilled, setAutofilled] = useState(false);
  const fileRef = useRef();

  const upB = k => v => setBasic(p=>({...p,[k]:v}));
  const upP = k => v => setProfile(p=>({...p,[k]:v}));

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    setLoading(true); setErr(""); setAutofilled(false);
    const extractPrompt = `Extract resume information and return ONLY valid JSON with these exact keys:
{"role":"current or target job title","summary":"2-sentence professional summary","skills":"comma-separated skills","experience":"2-3 sentence work history with companies and roles","education":"degree institution year","achievements":"top 2-3 achievements as one string"}
If any field is missing use empty string.`;
    try {
      setLoadMsg("Reading resume file...");
      if(file.name.endsWith(".pdf")||file.type==="application/pdf") {
        setLoadMsg("Extracting from PDF with AI...");
        const ab = await file.arrayBuffer();
        const bytes = new Uint8Array(ab);
        let bin=""; for(let i=0;i<bytes.length;i++) bin+=String.fromCharCode(bytes[i]);
        const b64 = btoa(bin);
        const r = await fetch("/api/claude",{
          method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({model:"claude-3-haiku-20240307",max_tokens:300,
            messages:[{role:"user",content:[
              {type:"document",source:{type:"base64",media_type:"application/pdf",data:b64}},
              {type:"text",text:extractPrompt}
            ]}]})
        });
        const d = await r.json();
        if(d.error) throw new Error(d.error.message);
        const tx = d.content?.find(b=>b.type==="text")?.text||"";
        const m = tx.match(/\{[\s\S]*\}/);
        if(!m) throw new Error("Parse failed");
        const p = JSON.parse(m[0]);
        setProfile({role:p.role||"",summary:p.summary||"",skills:p.skills||"",experience:p.experience||"",education:p.education||"",achievements:p.achievements||""});
      } else {
        setLoadMsg("Analysing resume with AI...");
        const text = await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=e=>res(e.target.result);fr.onerror=()=>rej();fr.readAsText(file);});
        const p = await callClaude(extractPrompt+"\n\nResume:\n"+text.slice(0,4000));
        setProfile({role:p.role||"",summary:p.summary||"",skills:p.skills||"",experience:p.experience||"",education:p.education||"",achievements:p.achievements||""});
      }
      setAutofilled(true); setStep(2);
    } catch {
      setErr("Could not extract resume. Please fill in manually."); setStep(2);
    }
    setLoading(false);
  };

  const generate = async () => {
    if(used){alert("Free limit reached.\n\nUpgrade to Career Pro for unlimited resumes.\n₹199 – Basic  |  ₹499 – Pro\n\nGoogle Play Billing — coming soon.");return;}
    setLoading(true); setErr("");
    try {
      setLoadMsg("Calculating ATS score...");
      const atsData = await callClaude(`ATS expert. Return ONLY valid JSON:
{"before_score":<0-100>,"after_score":<0-100 projected>,"feedback":["tip1","tip2","tip3","tip4"],"keywords_found":["kw1","kw2","kw3"],"keywords_missing":["kw1","kw2","kw3"]}
Resume: ${basic.name}, ${profile.role}, Skills:${profile.skills}, Exp:${profile.experience}
Job: ${jobDesc.slice(0,1200)}`);
      setAts(atsData);
      setLoadMsg("Writing optimised resume...");
      const docs = await callClaude(`Expert resume writer. Return ONLY valid JSON:
{"resume":"Full ATS-optimised plain text resume. Sections: CONTACT INFO\\nPROFESSIONAL SUMMARY\\nCORE SKILLS\\nWORK EXPERIENCE\\nEDUCATION\\nKEY ACHIEVEMENTS. Use - for bullets.","cover_letter":"3-paragraph tailored cover letter to Hiring Manager","linkedin_tips":["tip1","tip2","tip3","tip4","tip5","tip6"]}
Candidate: ${basic.name} | ${basic.email} | ${basic.phone}
Role:${profile.role} | Summary:${profile.summary} | Skills:${profile.skills}
Experience:${profile.experience} | Education:${profile.education} | Achievements:${profile.achievements}
Job: ${jobDesc.slice(0,1200)}`);
      setResults(docs); setUsed(true); setStep(4);
    } catch { setErr("Generation failed. Please try again."); }
    setLoading(false);
  };

  const copy     = txt => navigator.clipboard.writeText(txt).then(()=>alert("Copied!"));
  const download = (txt,fn) => {
    const wm="\n\n─────────────────────────\nGenerated by Career Painkiller (Free)\nUpgrade to remove watermark\n─────────────────────────";
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([txt+wm],{type:"text/plain"}));a.download=fn;a.click();
  };

  const Spinner = () => (
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:t.accentBg,borderRadius:8,marginTop:12}}>
      <div style={{width:15,height:15,border:`2.5px solid ${t.accent}`,borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.75s linear infinite",flexShrink:0}} />
      <span style={{fontSize:13,color:t.accentText,fontWeight:500}}>{loadMsg}</span>
    </div>
  );

  // Shared card wrapper
  const cardStyle = {background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"20px"};

  return (
    <div style={{minHeight:"100vh",background:t.bg,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",color:t.text,transition:"background 0.2s,color 0.2s"}}>

      {/* Header */}
      <div style={{background:t.surface,borderBottom:`1px solid ${t.border}`,padding:"13px 18px",
        display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}>
        <div>
          <div style={{fontSize:15,fontWeight:700,color:t.text,letterSpacing:"-0.02em"}}>Career Painkiller</div>
          <div style={{fontSize:11,color:t.textMuted,marginTop:1}}>AI Resume Builder</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={()=>setDark(d=>!d)}
            style={{width:34,height:34,borderRadius:8,border:`1px solid ${t.border}`,background:t.elevated,
              cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {dark?"☀️":"🌙"}
          </button>
          <button onClick={()=>alert("Career Pro Pack\n\nUnlimited resumes  •  No watermark\nCover Letter export  •  LinkedIn tips\n\n₹199 – Basic  |  ₹499 – Pro\n\nGoogle Play Billing — coming soon")}
            style={{background:t.accent,color:"#fff",border:"none",borderRadius:8,padding:"8px 13px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
            Upgrade Pro
          </button>
        </div>
      </div>

      <div style={{maxWidth:440,margin:"0 auto",padding:"18px 14px 60px"}}>

        {/* Progress bar */}
        <div className="progress-bar" style={{display:"flex",alignItems:"center",gap:4,marginBottom:20,padding:"10px 14px",
          background:t.surface,borderRadius:12,border:`1px solid ${t.border}`,overflowX:"auto"}}>
          {STEPS.map((l,i)=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:10,fontWeight:700,flexShrink:0,transition:"all 0.2s",
                  background:i<step?t.green:i===step?t.accent:t.elevated,
                  color:i<=step?"#fff":t.textMuted}}>
                  {i<step?"✓":i+1}
                </div>
                <span style={{fontSize:11,fontWeight:i===step?600:400,whiteSpace:"nowrap",
                  color:i===step?t.accent:i<step?t.green:t.textMuted}}>{l}</span>
              </div>
              {i<STEPS.length-1&&<div style={{width:14,height:1,background:i<step?t.green:t.border,flexShrink:0,marginLeft:2}} />}
            </div>
          ))}
        </div>

        {/* STEP 0 */}
        {step===0 && (
          <div style={cardStyle}>
            <h2 style={{fontSize:18,fontWeight:700,margin:"0 0 4px",color:t.text}}>Let's get started</h2>
            <p style={{fontSize:13,color:t.textSub,margin:"0 0 18px"}}>We'll pull the rest from your resume.</p>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <Field label="Full name"    value={basic.name}  onChange={upB("name")}  placeholder="Arjun Sharma"       t={t} />
              <Field label="Work email"   value={basic.email} onChange={upB("email")} placeholder="arjun@company.com" type="email" t={t} />
              <Field label="Phone number" value={basic.phone} onChange={upB("phone")} placeholder="+91 98765 43210"   t={t} />
            </div>
            {err && <p style={{fontSize:12,color:t.red,margin:"10px 0 0"}}>{err}</p>}
            <div style={{marginTop:18}}>
              <Btn t={t} onClick={()=>{if(!basic.name||!basic.email){setErr("Name and email are required.");return;}setErr("");setStep(1);}}>Continue →</Btn>
            </div>
          </div>
        )}

        {/* STEP 1 */}
        {step===1 && (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={cardStyle}>
              <h2 style={{fontSize:18,fontWeight:700,margin:"0 0 4px",color:t.text}}>Upload your resume</h2>
              <p style={{fontSize:13,color:t.textSub,margin:"0 0 16px"}}>AI extracts your details automatically. Edit anything after.</p>
              <div onClick={()=>!loading&&fileRef.current.click()}
                style={{border:`1.5px dashed ${t.borderSub}`,borderRadius:12,padding:"26px 16px",
                  display:"flex",flexDirection:"column",alignItems:"center",gap:10,
                  cursor:loading?"default":"pointer",background:t.elevated,transition:"border-color 0.15s"}}
                onMouseOver={e=>{if(!loading)e.currentTarget.style.borderColor=t.accent;}}
                onMouseOut={e=>e.currentTarget.style.borderColor=t.borderSub}>
                <div style={{width:42,height:42,borderRadius:10,background:t.accentBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>📄</div>
                <div style={{textAlign:"center"}}>
                  <p style={{fontWeight:600,fontSize:14,margin:"0 0 2px",color:t.text}}>Upload resume</p>
                  <p style={{fontSize:12,color:t.textMuted,margin:0}}>PDF or TXT — AI reads it for you</p>
                </div>
                <input ref={fileRef} type="file" accept=".txt,.pdf" style={{display:"none"}} onChange={handleFile} />
              </div>
              {loading && <Spinner />}
              {err && <p style={{fontSize:12,color:t.red,margin:"10px 0 0"}}>{err}</p>}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{flex:1,height:1,background:t.border}} /><span style={{fontSize:12,color:t.textMuted}}>or</span><div style={{flex:1,height:1,background:t.border}} />
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn variant="secondary" t={t} onClick={()=>setStep(0)}>← Back</Btn>
              <Btn variant="secondary" t={t} onClick={()=>setStep(2)}>Fill manually →</Btn>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step===2 && (
          <div style={cardStyle}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <div>
                <h2 style={{fontSize:18,fontWeight:700,margin:"0 0 2px",color:t.text}}>Review your profile</h2>
                <p style={{fontSize:13,color:t.textSub,margin:0}}>Edit anything before we generate.</p>
              </div>
              {autofilled && <Badge color="blue" t={t}>Autofilled</Badge>}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <Field label="Target role"           value={profile.role}         onChange={upP("role")}         placeholder="Senior Product Manager"            t={t} />
              <Field label="Professional summary"  value={profile.summary}      onChange={upP("summary")}      placeholder="Experienced PM with 5+ years..."    multiline rows={2} t={t} />
              <Field label="Skills"                value={profile.skills}       onChange={upP("skills")}       placeholder="Python, SQL, Agile, Figma..."        multiline rows={2} hint="Separate with commas" t={t} />
              <Field label="Work experience"       value={profile.experience}   onChange={upP("experience")}   placeholder="Role at Company (Year–Year)..."      multiline rows={3} t={t} />
              <Field label="Education"             value={profile.education}    onChange={upP("education")}    placeholder="B.Tech CSE, JNTU Hyderabad, 2021"   t={t} />
              <Field label="Key achievements"      value={profile.achievements} onChange={upP("achievements")} placeholder="Reduced costs 30%, led team of 12..." multiline rows={2} t={t} />
            </div>
            {err && <p style={{fontSize:12,color:t.red,margin:"12px 0 0"}}>{err}</p>}
            <div style={{display:"flex",gap:8,marginTop:18}}>
              <Btn variant="secondary" t={t} onClick={()=>setStep(1)}>← Back</Btn>
              <div style={{flex:1}}>
                <Btn t={t} onClick={()=>{if(!profile.role||!profile.skills||!profile.experience){setErr("Role, skills and experience are required.");return;}setErr("");setStep(3);}}>Next →</Btn>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step===3 && (
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={cardStyle}>
              <h2 style={{fontSize:18,fontWeight:700,margin:"0 0 4px",color:t.text}}>Paste job description</h2>
              <p style={{fontSize:13,color:t.textSub,margin:"0 0 16px"}}>We'll score your resume before and after AI optimisation.</p>
              <Field label="Job description" value={jobDesc} onChange={setJobDesc} placeholder="Paste the full job listing here..." multiline rows={10} t={t} />
              {loading && <Spinner />}
              {err && <p style={{fontSize:12,color:t.red,margin:"10px 0 0"}}>{err}</p>}
              <div style={{display:"flex",gap:8,marginTop:16}}>
                <Btn variant="secondary" t={t} onClick={()=>setStep(2)}>← Back</Btn>
                <div style={{flex:1}}>
                  <Btn disabled={loading} t={t} onClick={()=>{if(!jobDesc.trim()){setErr("Paste a job description to continue.");return;}setErr("");generate();}}>
                    {loading?"Generating...":"Generate & Score ↗"}
                  </Btn>
                </div>
              </div>
            </div>
            <div style={{background:t.accentBg,border:`1px solid ${dark?"#1E3A5F":"#BFDBFE"}`,borderRadius:12,padding:"14px 16px"}}>
              <p style={{fontSize:12,fontWeight:600,color:t.accentText,margin:"0 0 6px"}}>Free plan includes</p>
              <ul style={{margin:0,paddingLeft:16,fontSize:12,color:t.accentText,lineHeight:1.9,opacity:0.85}}>
                <li>1 resume generation</li><li>ATS score &amp; keyword analysis</li>
                <li>Watermarked TXT download</li><li>Cover letter preview</li>
              </ul>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step===4 && results && ats && (
          <div style={{display:"flex",flexDirection:"column",gap:14}}>

            {/* ATS */}
            <div style={cardStyle}>
              <p style={{fontSize:11,fontWeight:600,color:t.textMuted,margin:"0 0 14px",textTransform:"uppercase",letterSpacing:"0.06em"}}>ATS Score Analysis</p>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <ATSBar score={ats.before_score} label="Before optimisation" t={t} />
                <ATSBar score={ats.after_score}  label="After AI optimisation" t={t} />
              </div>
              <div style={{display:"flex",gap:10,marginTop:14}}>
                <div style={{flex:1,background:t.greenBg,borderRadius:8,padding:"10px 12px"}}>
                  <p style={{fontSize:11,fontWeight:600,color:t.greenText,margin:"0 0 6px"}}>Found</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{ats.keywords_found?.map(k=><Badge key={k} color="green" t={t}>{k}</Badge>)}</div>
                </div>
                <div style={{flex:1,background:t.redBg,borderRadius:8,padding:"10px 12px"}}>
                  <p style={{fontSize:11,fontWeight:600,color:t.redText,margin:"0 0 6px"}}>Missing</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{ats.keywords_missing?.map(k=><Badge key={k} color="red" t={t}>{k}</Badge>)}</div>
                </div>
              </div>
              <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:6}}>
                {ats.feedback?.map((f,i)=>(
                  <div key={i} style={{display:"flex",gap:8,background:t.elevated,borderRadius:8,padding:"8px 10px"}}>
                    <span style={{fontSize:11,fontWeight:700,color:t.accent,minWidth:14,marginTop:1}}>{i+1}</span>
                    <span style={{fontSize:12,color:t.textSub,lineHeight:1.5}}>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div style={{display:"flex",background:t.elevated,borderRadius:10,padding:3,gap:2}}>
              {TABS.map(([id,label])=>(
                <button key={id} onClick={()=>setTab(id)}
                  style={{flex:1,padding:"8px 4px",borderRadius:8,border:"none",fontSize:12,fontWeight:600,
                    cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s",
                    background:tab===id?t.surface:"transparent",color:tab===id?t.text:t.textMuted,
                    boxShadow:tab===id?`0 1px 3px rgba(0,0,0,${dark?0.3:0.08})`:"none"}}>
                  {label}
                </button>
              ))}
            </div>

            {/* Resume */}
            {tab==="resume" && (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div style={{...cardStyle,padding:0,overflow:"hidden"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:`1px solid ${t.border}`,background:t.elevated}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <Badge color="green" t={t}>Free</Badge>
                      <span style={{fontSize:13,fontWeight:600,color:t.text}}>ATS-Optimised Resume</span>
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      <Btn variant="secondary" small t={t} onClick={()=>copy(results.resume)}>Copy</Btn>
                      <Btn variant="secondary" small t={t} onClick={()=>download(results.resume,`${basic.name.replace(/ /g,"_")}_Resume.txt`)}>Download</Btn>
                    </div>
                  </div>
                  <div style={{padding:"14px 16px",position:"relative",overflow:"hidden"}}>
                    <pre style={{fontSize:12,lineHeight:1.7,color:t.textSub,whiteSpace:"pre-wrap",fontFamily:"'SF Mono','Fira Mono',monospace",margin:0}}>{results.resume}</pre>
                    <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%) rotate(-30deg)",fontSize:36,fontWeight:800,color:dark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.03)",pointerEvents:"none",whiteSpace:"nowrap",userSelect:"none"}}>CAREER PAINKILLER</div>
                  </div>
                </div>
                <UpgradeLock title="Remove watermark + premium templates" desc="Clean PDF exports with professional formatting and unlimited generations." t={t} />
              </div>
            )}

            {/* Cover letter */}
            {tab==="cover" && (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div style={{...cardStyle,padding:0,overflow:"hidden"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:`1px solid ${t.border}`,background:t.elevated}}>
                    <Badge color="amber" t={t}>Preview only</Badge>
                    <span style={{fontSize:11,color:t.textMuted}}>Export requires upgrade</span>
                  </div>
                  <div style={{padding:"16px"}}>
                    <pre style={{fontSize:12,lineHeight:1.8,color:t.textSub,whiteSpace:"pre-wrap",fontFamily:"inherit",margin:0}}>{results.cover_letter}</pre>
                  </div>
                </div>
                <UpgradeLock title="Export cover letter (PDF / DOCX)" desc="Download a formatted cover letter ready to attach to job applications." t={t} />
              </div>
            )}

            {/* LinkedIn */}
            {tab==="linkedin" && (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div style={cardStyle}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                    <Badge color="green" t={t}>Free preview</Badge>
                    <span style={{fontSize:12,color:t.textMuted}}>1 of 6 tips</span>
                  </div>
                  <div style={{display:"flex",gap:10,background:t.elevated,borderRadius:8,padding:"12px"}}>
                    <span style={{fontWeight:700,color:t.accent,fontSize:14,minWidth:16}}>1</span>
                    <p style={{fontSize:13,color:t.textSub,margin:0,lineHeight:1.6}}>{results.linkedin_tips?.[0]}</p>
                  </div>
                </div>
                <div style={{opacity:0.35,pointerEvents:"none"}}>
                  <div style={{...cardStyle,display:"flex",flexDirection:"column",gap:8}}>
                    {[2,3,4].map(n=>(
                      <div key={n} style={{display:"flex",gap:10,background:t.elevated,borderRadius:8,padding:"10px"}}>
                        <span style={{fontWeight:700,color:t.accent,fontSize:13}}>{n}</span>
                        <div style={{height:12,background:t.border,borderRadius:4,flex:1,marginTop:3}} />
                      </div>
                    ))}
                  </div>
                </div>
                <UpgradeLock title="Unlock all 6 LinkedIn tips" desc="Actionable steps to optimise your headline, about section and activity to attract recruiters." t={t} />
              </div>
            )}

            <button onClick={()=>{setStep(0);setResults(null);setAts(null);setBasic({name:"",email:"",phone:""});setProfile({role:"",summary:"",skills:"",experience:"",education:"",achievements:""});setJobDesc("");setUsed(false);setAutofilled(false);}}
              style={{background:"none",border:"none",color:t.textMuted,fontSize:13,cursor:"pointer",padding:"8px",fontFamily:"inherit",marginTop:4}}>
              ↺ Start over
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::placeholder { color: ${t.textMuted}; opacity: 1; }
        .progress-bar::-webkit-scrollbar { height: 4px; }
        .progress-bar::-webkit-scrollbar-track { background: ${t.elevated}; border-radius: 99px; }
        .progress-bar::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 99px; }
        .progress-bar::-webkit-scrollbar-thumb:hover { background: ${t.textMuted}; }
        .progress-bar { scrollbar-width: thin; scrollbar-color: ${t.border} ${t.elevated}; }
      `}</style>
    </div>
  );
}