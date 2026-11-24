import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUpRight, Plus, Play, Star, Sparkles, Menu, X } from 'lucide-react';
import { members, memories, incidents, welcomes } from './data/content';
import MemoryForm from './components/MemoryForm';
import { supabase, supabaseConfigured } from './lib/supabase';

function fromDatabase(row) {
  const { data: mediaData } = supabase.storage.from('memory-uploads').getPublicUrl(row.media_path);
  const formattedDate = row.memory_date
    ? new Date(`${row.memory_date}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : undefined;
  return {
    id: row.id,
    category: row.category,
    title: formattedDate || 'A new memory',
    note: row.caption,
    date: formattedDate,
    media: row.media_type,
    ...(row.media_type === 'video' ? { videoSrc: mediaData.publicUrl } : { image: mediaData.publicUrl }),
    label: row.media_type === 'video' ? 'OUR VIDEO' : 'OUR PHOTO',
  };
}

function PhotoArt({ type, className = '' }) {
  return <div className={`photo-art art-${type} ${className}`} aria-label="Decorative illustration placeholder">
    <span className="sun"/><span className="cloud cloud-a"/><span className="cloud cloud-b"/><span className="campus-roof"/><span className="campus"/><span className="campus-door"/>
    <span className="table table-one"/><span className="table table-two"/><span className="plant"/><span className="sparkle s-one">✳</span><span className="sparkle s-two">✦</span>
    {type === 'project' && <div className="paper-stack"><b>PROJECT</b><span>PLAN A → PLAN B → ?</span><span className="paper-stamp">ONGOING</span></div>}
    {type === 'six' && <div className="six-dots">{members.map((m,i)=><i key={i} style={{'--i':i}}>{m.initial}</i>)}</div>}
    {type === 'four' && <div className="four-note">once upon<br/>a university</div>}
  </div>;
}
function Polaroid({type,caption,className='',image,alt=caption,mystery=false}) { return <figure className={`polaroid ${className}`}>{mystery?<div className="mystery-art" aria-label="A hidden memory"><span className="mystery-tape"/><span className="mystery-question">?</span><span className="mystery-sparkle">✳</span><span className="mystery-caption">TOP SECRET<br/>FOR NOW</span></div>:image?<img className="polaroid-image" src={image} alt={alt}/>:<PhotoArt type={type}/>}<figcaption>{caption}</figcaption></figure> }

export default function App() {
 const memberId = new URLSearchParams(window.location.search).get('member')?.toLowerCase();
 const visitor = members.find(m=>m.id===memberId);
 const [filter,setFilter]=useState('all'); const [menuOpen,setMenuOpen]=useState(false);
 const [archiveItems,setArchiveItems]=useState(memories); const [showMemoryForm,setShowMemoryForm]=useState(false);
 useEffect(()=>{
  if(!supabaseConfigured) return;
  let active=true;
  supabase.from('memories').select('*').order('created_at',{ascending:false}).then(({data,error})=>{
   if(error){console.error('Could not load shared memories:',error);return;}
   if(active) setArchiveItems([...data.map(fromDatabase),...memories]);
  });
  return ()=>{active=false;};
 },[]);
 const shown = useMemo(()=>filter==='all'?archiveItems:archiveItems.filter(m=>m.category===filter),[filter,archiveItems]);
 const categories=['all',...new Set(archiveItems.map(m=>m.category))];
 return <>
  <header className="topbar"><a href="#home" className="wordmark"><span className="logo-mark">✳</span> ALHH<span className="dot">.</span></a><button className="menu-toggle" aria-label="Toggle menu" onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen?<X/>:<Menu/>}</button><nav className={menuOpen?'nav open':'nav'}>{[['Our story','#story'],['The six','#members'],['Headquarters','#hq'],['Memory archive','#archive'],['Incident files','#incidents']].map(([t,h])=><a key={h} href={h} onClick={()=>setMenuOpen(false)}>{t}</a>)}</nav><a href="#add-memory" className="nav-cta">Add a memory <ArrowUpRight size={15}/></a></header>
  <main>
   <section className="hero" id="home"><div className="hero-copy"><p className="eyebrow"><span className="eyebrow-line"/> OUR SHARED LITTLE UNIVERSE</p><h1>A LOT<br/><span className="happen">HAPPENED</span><br/>HERE<span className="period">.</span></h1><div className="hero-bottom"><div><p className="hero-tagline">And we’re not done yet.</p><p className="hero-sub">Six people. One story. Still going.</p></div><a className="round-link" href="#story" aria-label="Scroll to our story"><ArrowDown size={20}/></a></div></div>
   </section>
   <div className="intro-strip"><span>EST. YEAR TWO</span><span className="strip-star">✳</span><span>STILL WRITING THE STORY</span><span className="strip-star">✳</span><span>MADE WITH LOVE BY MANAR</span></div>
   <section className="welcome section-pad"><div className="welcome-stamp">A NOTE<br/>FOR YOU</div><div><p className="eyebrow">{visitor?`HEY, ${visitor.name.toUpperCase()}!`:'TO THE SIX OF US'}</p><h2>{visitor?welcomes[visitor.id]:'We really did all that…<br/>didn’t we?'}</h2><p className="body-copy">This is our little corner of the internet: a place for the big moments, the tiny ones, and the stories that somehow became ours.</p></div><span className="welcome-doodle">♡</span></section>
   <section className="story section-pad" id="story"><div className="section-heading"><p className="eyebrow">CHAPTER ONE, TWO, THREE…</p><h2>It started with<br/><em>a few of us.</em></h2><p className="body-copy">No grand plan. Just people finding each other, one connection at a time.</p></div><div className="timeline"><div className="timeline-line"/>{[{n:'01',title:'A first hello',text:'During her second year, Manar got in touch with Mostafa.',people:['Manar','Mostafa'],icon:'✳'},{n:'02',title:'The original four',text:'Mostafa and Ali already knew each other. Tasneem joined through Manar—and the four of them found their rhythm.',people:['Manar','Mostafa','Ali','Tasneem'],icon:'↗'},{n:'03',title:'Room for two more',text:'In third year, Malak and Mohamed joined. Suddenly, there were six.',people:['Malak','Mohamed'],icon:'✦'}].map(step=><article className="timeline-item" key={step.n}><div className="timeline-marker">{step.icon}</div><div className="timeline-card"><span className="timeline-no">CHAPTER {step.n}</span><h3>{step.title}</h3><p>{step.text}</p><div className="name-chips">{step.people.map((p,i)=><span key={p} className={`chip chip-${i}`}>{p}</span>)}</div></div></article>)}</div><span className="story-margin-note">and then<br/>everything<br/>happened →</span></section>
   <section className="members section-pad" id="members"><div className="section-heading centered"><p className="eyebrow">THE MAIN CHARACTERS (OBVIOUSLY)</p><h2>The six<span className="period">.</span></h2><p className="body-copy">One shared story, six very important parts.</p></div><div className="member-grid">{members.map((m,i)=><article className={`member-card member-${m.color}`} key={m.id}><div className="member-number">0{i+1}</div><div className="avatar-placeholder"><span>{m.initial}</span><i>✳</i></div><h3>{m.name}</h3><p>A place for your favorite memories, photos & little notes.</p><span className="member-tag">YOUR CORNER ↗</span></article>)}</div></section>
   <section className="hq section-pad" id="hq"><div className="hq-copy"><p className="eyebrow">SOME PLACES STICK WITH YOU</p><h2>The Original<br/><em>Headquarters.</em></h2><p className="body-copy">The old cafeteria. Our first gathering, and the table we kept coming back to whenever there was university work, a project, or just a reason to be together.</p><div className="hq-label"><span className="pin">✳</span><span>LOCATION: THE OLD CAFETERIA<br/><b>STATUS: ALWAYS OURS</b></span></div></div><div className="hq-visual"><div className="hq-frame"><img className="hq-photo" src="/media/old-cafeteria.jpg" alt="The old university cafeteria patio"/><div className="cafeteria-sign">THE OLD<br/><b>CAFETERIA</b></div><div className="cafeteria-caption">our actual headquarters ♡</div></div><span className="hq-sunburst">OUR<br/>PLACE!</span><span className="hq-arrow">↙</span></div></section>
   <section className="archive section-pad" id="archive"><div className="section-heading archive-head"><div><p className="eyebrow">THE GOOD STUFF, SAFELY KEPT</p><h2>Memory<br/><em>archive.</em></h2></div><p className="body-copy">Photos, videos, screenshots, and all the little things we’ll want to find again.</p></div><div className="filters">{categories.map(c=><button key={c} className={filter===c?'active':''} onClick={()=>setFilter(c)}>{c}</button>)}</div><div className="memory-grid">{shown.map((m,i)=><article className={`memory-card memory-${i}`} key={m.id||m.title}><div className="memory-art-wrap">{m.videoSrc?<video className="memory-video" src={m.videoSrc} controls playsInline preload="metadata" aria-label={m.title}/>:m.image?<img className="memory-photo" src={m.image} alt={m.title}/>:<PhotoArt type={m.art}/>}{m.videoSrc||m.image?<span className="sample-badge">{m.label}</span>:m.media==='video'?<><span className="sample-badge">{m.label}</span><span className="media-kind">VIDEO</span><span className="play-button" aria-hidden="true"><Play fill="currentColor" size={18}/></span></>:<span className="sample-badge">{m.label}</span>}</div><div className="memory-meta"><span>{m.category}</span><span>{m.date||'A MEMORY'}</span></div><h3>{m.title}</h3><p>{m.note}</p></article>)}</div><div className="archive-note">A growing collection of our real photos and videos. More memories will join as the story continues.</div></section>
   <section className="incidents section-pad" id="incidents"><div className="incident-title"><div><p className="eyebrow">OUR SPECIALTY: UNEXPECTED PLOT</p><h2>The Incident<br/><em>Files.</em></h2></div><div className="file-doodle">CLASSIFIED<br/><span>ISH</span></div></div><p className="body-copy incident-intro">Plans were made. Projects were started. And then, well… you know how it goes.</p><div className="incident-grid">{incidents.map((inc,i)=><article className="incident-card" key={inc.no}><div className="file-top"><span>{inc.no}</span><span className="file-status">{inc.status}</span></div><div className="file-icon">{i===0?'📁':'🔎'}</div><h3>{inc.title}</h3><p>{inc.body}</p><div className="file-footer">{inc.stamp}<span>✳</span></div></article>)}</div><p className="ongoing-note">CASE STATUS: TO BE CONTINUED <span>↗</span></p></section>
   <section className="recognition section-pad"><div className="recognition-art"><PhotoArt type="six"/><span className="recognition-burst">THE<br/>NEXT<br/>CHAPTER!</span></div><div><p className="eyebrow">A LITTLE SPOTLIGHT FOR OUR STORY</p><h2>Our<br/><em>moment.</em></h2><p className="body-copy">A little recognition for everything we’ve shared so far. This is where we’ll keep the photos, the smiles, and the details we’ll tell stories about later.</p><span className="coming-label">A LITTLE MOMENT WORTH KEEPING <span>✳</span></span></div></section>
   <section className="still-unwritten section-pad" id="add-memory"><div className="still-scribble">there’s more<br/>where that came from ↘</div><p className="eyebrow">THE STORY KEEPS GOING</p><h2>Still<br/><em>unwritten.</em></h2><p className="body-copy">There are more photos to take, stories to collect, and memories waiting to happen.</p><button className="add-button" onClick={()=>setShowMemoryForm(open=>!open)}><Plus size={19}/> {showMemoryForm?'Close':'Add a memory'}</button>{showMemoryForm?<MemoryForm categories={categories.filter(item=>item!=='all')} onAdded={item=>{setArchiveItems(current=>[item,...current]);setFilter('all');setShowMemoryForm(false);document.getElementById('archive')?.scrollIntoView({behavior:'smooth'});}}/>:<div className="memory-note" id="memory-note"><Sparkles size={17}/><span>{supabaseConfigured?'Uploads are ready. Add a photo or video to the shared archive.':'Shared uploads need Supabase setup before they can be saved.'}</span></div>}<span className="still-heart">♡</span></section>
  </main>
  <footer className="footer"><a href="#home" className="wordmark"><span className="logo-mark">✳</span> ALHH<span className="dot">.</span></a><span>MADE WITH LOVE BY MANAR, FOR THE SIX OF US</span><a href="#home">BACK TO TOP ↑</a></footer>
 </>;
}


