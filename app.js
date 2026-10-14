(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches;
  try { paused = reduced.matches || localStorage.getItem('gr-motion') === 'paused'; } catch {}
  const motionToggle = document.getElementById('motion-toggle');
  function applyMotion() {
    root.classList.toggle('motion-paused', paused);
    root.classList.toggle('js-motion', !paused);
    motionToggle.textContent = paused ? 'Enable motion' : 'Pause motion';
    motionToggle.setAttribute('aria-pressed', String(paused));
  }
  applyMotion();
  motionToggle.addEventListener('click', () => { paused = !paused; applyMotion(); try {localStorage.setItem('gr-motion',paused?'paused':'enabled');} catch {} });
  reduced.addEventListener('change', event => {paused=event.matches;applyMotion();});
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting) {entry.target.classList.add('is-visible');observer.unobserve(entry.target);} }),{threshold:.08});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
  let ticking=false;
  function progress(){const height=root.scrollHeight-window.innerHeight;document.querySelector('.scroll-progress').style.width=(height>0?Math.min(100,window.scrollY/height*100):0)+'%';ticking=false;}
  window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(progress);ticking=true;}},{passive:true});progress();
  const menu=document.querySelector('.menu-toggle'),mobile=document.getElementById('mobile-nav');
  function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');mobile.hidden=true;}
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!open));menu.setAttribute('aria-label',open?'Open navigation':'Close navigation');mobile.hidden=open;});
  mobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!mobile.hidden){closeMenu();menu.focus();}});
  const scenarios={
    restaurant:{question:'“We’re planning lunch for 20 people on Friday. Do you offer catering?”',response:'Collect the date, group size and contact details. Explain that the team will confirm the options.',result:'A structured catering enquiry reaches the restaurant, ready for a personal follow-up.'},
    home:{question:'“Our kitchen tap is leaking. Can someone come and take a look?”',response:'Capture the issue, service area and preferred contact time. Flag anything that needs human attention.',result:'The team receives the enquiry and can confirm availability and the next step.'},
    studio:{question:'“I’d love to book a first visit. Which appointment should I choose?”',response:'Explain the agreed service options, ask what the customer needs and guide them to the booking process.',result:'The customer has a clear next step, with a team handoff for anything more specific.'}
  };
  const tabs=[...document.querySelectorAll('[data-scenario]')],steps=[...document.querySelectorAll('.demo-step')],run=document.getElementById('run-demo'),status=document.getElementById('demo-status');
  let timeouts=[],runId=0;
  function clearRun(){runId++;timeouts.forEach(clearTimeout);timeouts=[];steps.forEach(s=>s.classList.remove('is-active','is-done'));run.disabled=false;run.innerHTML='Run the relay <span aria-hidden="true">↗</span>';}
  function choose(key){clearRun();const data=scenarios[key];tabs.forEach(t=>{const selected=t.dataset.scenario===key;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;});document.getElementById('demo-panel').setAttribute('aria-labelledby','tab-'+key);document.getElementById('demo-question').textContent=data.question;document.getElementById('demo-response').textContent=data.response;document.getElementById('demo-result').textContent=data.result;status.textContent='Ready when you are.';}
  tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>choose(tab.dataset.scenario));tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(index+1)%tabs.length;else if(e.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;e.preventDefault();tabs[next].focus();choose(tabs[next].dataset.scenario);});});
  run.addEventListener('click',()=>{
    clearRun();const current=runId;run.disabled=true;run.innerHTML='Relay in progress <span aria-hidden="true">↗</span>';
    const labels=['01 / Enquiry received.','02 / Helpful response. Key details captured.','03 / Next step prepared for the team.'];
    function stage(i){if(current!==runId)return;steps.forEach((s,j)=>{s.classList.toggle('is-active',j===i);s.classList.toggle('is-done',j<i);});status.textContent=labels[i];}
    const delay=paused||reduced.matches?350:1300;stage(0);
    timeouts.push(setTimeout(()=>stage(1),delay),setTimeout(()=>stage(2),delay*2),setTimeout(()=>{if(current!==runId)return;steps.forEach(s=>{s.classList.remove('is-active');s.classList.add('is-done');});status.textContent='That’s the relay. A clear next step, with your team in control.';run.disabled=false;run.innerHTML='Run it again <span aria-hidden="true">↻</span>';},delay*3));
  });
  choose('restaurant');
})();
