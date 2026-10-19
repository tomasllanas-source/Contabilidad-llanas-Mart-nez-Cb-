/* Puente con Firebase: guarda los datos en la nube y los comparte entre dispositivos.
   Las páginas ya saben trabajar con una base de datos "db"; aquí se la damos hecha con Firestore
   y se pide iniciar sesión. Si firebase-config.js no está rellenado, no hace nada y cada
   página guarda solo en el navegador, como antes. */
(()=>{
  const cfg=window.FIREBASE_CONFIG;
  if(!cfg||!cfg.apiKey||/PEGA/i.test(cfg.apiKey))return;
  // cada página tiene sus propios datos (la calculadora y el inventario tienen los dos "productos")
  const app=(document.currentScript&&document.currentScript.dataset.app)||'general';
  const V='12.19.0',U='https://www.gstatic.com/firebasejs/'+V+'/';
  const RAIZ='negocio/'+app+'/',USUARIOS='negocio/comun/usuarios';

  // ---------- pantalla de inicio de sesión ----------
  const css=`.nb-velo{position:fixed;inset:0;z-index:50;background:var(--bg,#eef1f0);display:grid;place-items:center;padding:16px;overflow:auto}
.nb-caja{width:100%;max-width:380px;background:var(--surface,#fff);border:1px solid var(--line,#d5dcd9);border-radius:14px;padding:20px;display:grid;gap:12px;font-family:var(--f-body,system-ui,sans-serif);color:var(--fg,#1d2422)}
.nb-caja h2{margin:0;font-family:var(--f-display,Georgia,serif);font-weight:400;font-size:24px;color:var(--accent,#8c1c2b)}
.nb-caja p{margin:0;font-size:14px;color:var(--muted,#5b6662)}
.nb-caja label{display:grid;gap:5px;font-size:13px;font-weight:600;color:var(--muted,#5b6662)}
.nb-caja input{font:500 16px var(--f-body,system-ui,sans-serif);color:var(--fg,#1d2422);background:var(--bg,#eef1f0);border:1px solid var(--line,#d5dcd9);border-radius:8px;padding:10px;width:100%;box-sizing:border-box}
.nb-caja button{font:600 15px var(--f-body,system-ui,sans-serif);border-radius:8px;padding:11px 14px;cursor:pointer;border:1px solid var(--accent,#8c1c2b);background:var(--accent,#8c1c2b);color:var(--accent-ink,#fff)}
.nb-caja button:disabled{opacity:.6;cursor:wait}
.nb-caja .nb-link{background:transparent;border:0;color:var(--muted,#5b6662);text-decoration:underline;font-weight:500;font-size:13px;padding:2px 0;justify-self:start}
.nb-err{color:var(--warn,#a4561a)!important}
.nb-err:empty{display:none}
.nb-salir{font:500 12px var(--f-body,system-ui,sans-serif);border:0;background:transparent;color:var(--muted,#5b6662);text-decoration:underline;cursor:pointer;padding:0;margin-left:8px}`;
  function estilos(){if(document.getElementById('nb-css'))return;const s=document.createElement('style');s.id='nb-css';s.textContent=css;document.head.appendChild(s)}
  function cuandoListo(fn){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn()}
  const MSG={'auth/invalid-credential':'Correo o contraseña incorrectos.','auth/wrong-password':'Correo o contraseña incorrectos.','auth/user-not-found':'Correo o contraseña incorrectos.',
    'auth/invalid-email':'Ese correo no es válido.','auth/too-many-requests':'Demasiados intentos. Espera unos minutos y vuelve a probar.','auth/network-request-failed':'Sin conexión a internet.'};
  function pedirLogin(auth,A){cuandoListo(()=>{
    estilos();if(document.getElementById('nb-velo'))return;
    const v=document.createElement('div');v.className='nb-velo';v.id='nb-velo';
    v.innerHTML=`<form class="nb-caja" novalidate><h2>Entrar</h2><p>Inicia sesión para ver y guardar los datos de la carnicería en todos tus dispositivos.</p>
      <label>Correo<input id="nb-mail" type="email" autocomplete="username" required></label>
      <label>Contraseña<input id="nb-pass" type="password" autocomplete="current-password" required></label>
      <p class="nb-err" id="nb-err" aria-live="polite"></p>
      <button type="submit" id="nb-ok">Entrar</button>
      <button type="button" class="nb-link" id="nb-olvido">He olvidado la contraseña</button></form>`;
    document.body.appendChild(v);
    const err=t=>{const e=document.getElementById('nb-err');e.className=t&&t.ok?'':'nb-err';e.textContent=t&&t.ok?t.ok:t||''};
    v.querySelector('form').onsubmit=async e=>{e.preventDefault();const b=document.getElementById('nb-ok');b.disabled=true;err('');
      try{await A.signInWithEmailAndPassword(auth,document.getElementById('nb-mail').value.trim(),document.getElementById('nb-pass').value)}
      catch(x){err(MSG[x&&x.code]||'No se pudo entrar. Inténtalo de nuevo.')}
      b.disabled=false};
    document.getElementById('nb-olvido').onclick=async()=>{const m=document.getElementById('nb-mail').value.trim();
      if(!m){err('Escribe tu correo arriba y vuelve a tocar aquí.');return}
      try{await A.sendPasswordResetEmail(auth,m);err({ok:'Te hemos enviado un correo para cambiar la contraseña.'})}catch(x){err(MSG[x&&x.code]||'No se pudo enviar el correo.')}};
    setTimeout(()=>document.getElementById('nb-mail').focus(),50);
  })}
  function quitarLogin(){const v=document.getElementById('nb-velo');if(v)v.remove()}
  function botonSalir(auth,A,user){cuandoListo(()=>{estilos();const s=document.getElementById('sync');if(!s||document.getElementById('nb-salir'))return;
    const b=document.createElement('button');b.type='button';b.id='nb-salir';b.className='nb-salir';b.textContent='Salir ('+(user.email||'')+')';
    b.onclick=async()=>{await A.signOut(auth);location.reload()};s.insertAdjacentElement('afterend',b)})}
  // traer una copia (archivo .json) con datos de antes: {"app":"inventario","colecciones":{"productos":{"id":{...}}}}
  function botonImportar(F,fs){cuandoListo(()=>{const s=document.getElementById('nb-salir');if(!s||document.getElementById('nb-imp'))return;
    const inp=document.createElement('input');inp.type='file';inp.accept='.json,application/json';inp.hidden=true;
    const b=document.createElement('button');b.type='button';b.id='nb-imp';b.className='nb-salir';b.textContent='Importar copia';b.onclick=()=>inp.click();
    inp.onchange=async()=>{const f=inp.files[0];inp.value='';if(!f)return;
      let c;try{c=JSON.parse(await f.text())}catch(e){alert('Ese archivo no es una copia válida.');return}
      if(!c||!c.colecciones||typeof c.colecciones!=='object'){alert('Ese archivo no es una copia válida.');return}
      if(c.app&&c.app!==app){alert('Esta copia es de «'+c.app+'». Ábrela desde esa página.');return}
      const ops=[];for(const[col,docs]of Object.entries(c.colecciones))for(const[id,d]of Object.entries(docs||{}))if(d&&typeof d==='object')ops.push([col,id,d]);
      const res=Object.entries(c.colecciones).map(([k,v])=>Object.keys(v||{}).length+' '+k).join(', ');
      if(!ops.length){alert('La copia está vacía.');return}
      if(!confirm('Se van a guardar '+res+'. Lo que tenga el mismo nombre interno se sustituye. ¿Seguir?'))return;
      b.disabled=true;b.textContent='Importando…';
      try{for(let i=0;i<ops.length;i+=400){const w=F.writeBatch(fs);ops.slice(i,i+400).forEach(([col,id,d])=>w.set(F.doc(fs,RAIZ+col,id),d));await w.commit()}
        alert('Copia importada: '+res+'.')}
      catch(e){avisar(e);alert('No se pudo importar. Comprueba la conexión y vuelve a probar.')}
      b.disabled=false;b.textContent='Importar copia'};
    s.insertAdjacentElement('afterend',b);b.insertAdjacentElement('afterend',inp)})}

  // ---------- arranque de Firebase ----------
  let fallo=null;
  const avisar=e=>{console.error(e);const s=document.getElementById('sync');if(s){s.textContent=e&&e.code==='permission-denied'?'Esta cuenta no tiene permiso: revisa los correos en las reglas de Firestore':'No se pudo guardar en la nube';s.classList.remove('ok')}};
  const listo=(async()=>{
    const[{initializeApp},A,F]=await Promise.all([import(U+'firebase-app.js'),import(U+'firebase-auth.js'),import(U+'firebase-firestore.js')]);
    const fb=initializeApp(cfg);const auth=A.getAuth(fb);
    // copia en el dispositivo: la app sigue funcionando sin cobertura y sube los cambios al volver
    let fs;try{fs=F.initializeFirestore(fb,{ignoreUndefinedProperties:true,localCache:F.persistentLocalCache({tabManager:F.persistentMultipleTabManager()})})}
    catch(e){fs=F.initializeFirestore(fb,{ignoreUndefinedProperties:true})}
    const user=await new Promise(ok=>{let pedido=false;A.onAuthStateChanged(auth,u=>{if(u){quitarLogin();ok(u)}else if(!pedido){pedido=true;pedirLogin(auth,A)}else location.reload()})});
    botonSalir(auth,A,user);botonImportar(F,fs);
    F.setDoc(F.doc(fs,USUARIOS,user.uid),{nombre:(user.displayName||user.email||'').split('@')[0],email:user.email||''},{merge:true}).catch(()=>{});
    return{F,fs,user,fb};
  })();
  listo.catch(e=>{fallo=e;console.error(e)});

  // ---------- base de datos con la misma forma que usan las páginas ----------
  const snap=d=>({id:d.id,exists:d.exists(),data:()=>d.data()});
  // las escrituras se aplican al momento en el dispositivo y se suben solas; no se espera al servidor
  const enviar=p=>{p.catch(avisar);return Promise.resolve()};
  function hacerDb({F,fs}){
    const consulta=q=>({
      orderBy:(c,d)=>consulta(F.query(q,F.orderBy(c,d))),
      limit:n=>consulta(F.query(q,F.limit(n))),
      where:(c,o,v)=>consulta(F.query(q,F.where(c,o,v))),
      get:async()=>{const s=await F.getDocs(q);return{docs:s.docs.map(snap)}},
      onSnapshot:(ok,ko)=>F.onSnapshot(q,s=>ok({docs:s.docs.map(snap)}),e=>{ko&&ko(e);avisar(e)})});
    return{collection(ruta){const ref=F.collection(fs,RAIZ+ruta);
      return{...consulta(ref),
        add:d=>enviar(F.addDoc(ref,d)),
        doc(id){const r=F.doc(ref,id);return{set:d=>enviar(F.setDoc(r,d)),delete:()=>enviar(F.deleteDoc(r)),get:async()=>snap(await F.getDoc(r))}}}}};
  }
  const descargas={async save({filename,data}){const b=data instanceof Blob?data:new Blob([data],{type:/\.csv$/i.test(filename)?'text/csv;charset=utf-8':/\.html?$/i.test(filename)?'text/html;charset=utf-8':'application/octet-stream'});
    const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000)}};

  // ---------- fotos dentro de la base de datos (plan gratis, sin Storage) ----------
  // Cada foto se guarda en negocio/<página>/fotos/<id>, partida en trozos de texto que caben en un documento.
  // La página la pide con el id "fs:<id>"; aquí se descarga y se convierte en una dirección que el navegador puede mostrar.
  const aTexto=b=>new Promise((ok,ko)=>{const r=new FileReader();r.onload=()=>ok(String(r.result).split(',')[1]);r.onerror=ko;r.readAsDataURL(b)});
  const TROZO=700000,urls=new Map(),cargando=new Map();
  const marca=id=>"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' data-f='"+encodeURIComponent(id)+"'/%3E";
  let leerFoto=null;
  window.nubeBlob=async id=>{if(!leerFoto)throw new Error('sin conexión');return leerFoto(id)};
  const PRE="data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' data-f='";
  const idDe=m=>decodeURIComponent(m.slice(PRE.length).split("'")[0]);
  function cargar(id){
    if(!cargando.has(id))cargando.set(id,leerFoto(id).then(b=>{const u=URL.createObjectURL(b);urls.set(id,u);const m=marca(id);
      document.querySelectorAll('img,a').forEach(el=>{if(el.getAttribute('src')===m)el.setAttribute('src',u);if(el.getAttribute('href')===m)el.setAttribute('href',u)});return u})
      .catch(e=>{console.error(e);cargando.delete(id);throw e}));
    return cargando.get(id)}
  // la página pinta una marca; las miniaturas se cargan al aparecer y los enlaces al tocarlos
  window.nubeUrl=id=>urls.get(id)||marca(id);
  cuandoListo(()=>{
    const ver=()=>{if(leerFoto)document.querySelectorAll('img[src^="'+PRE+'"]').forEach(img=>cargar(idDe(img.getAttribute('src'))).catch(()=>{}))};
    new MutationObserver(ver).observe(document.body,{childList:true,subtree:true});
    document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[href^="'+PRE+'"]');if(!a||!leerFoto)return;
      e.preventDefault();const w=window.open('','_blank');cargar(idDe(a.getAttribute('href'))).then(u=>{if(w)w.location.href=u;else location.href=u}).catch(()=>{if(w)w.close();alert('No se pudo abrir la foto.')})},true);
  });
  function fotosEnBase({F,fs}){
    const col=RAIZ+'fotos';
    leerFoto=async id=>{const k=id.replace(/^fs:/,'');const m=await F.getDoc(F.doc(fs,col,k));if(!m.exists())throw new Error('no encontrada');
      const{tipo,partes}=m.data();const ts=await Promise.all(Array.from({length:partes},(_,i)=>F.getDoc(F.doc(fs,col+'/'+k+'/partes',String(i)))));
      const bin=atob(ts.map(t=>t.data().d).join(''));const u8=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);
      return new Blob([u8],{type:tipo})};
    return{async upload(blob,o){
        if(blob.size>20*1024*1024)throw Object.assign(new Error('grande'),{code:'too_large'});
        const tipo=(o&&o.type)||blob.type||'image/jpeg',txt=await aTexto(blob);
        const k=Date.now().toString(36)+Math.random().toString(36).slice(2,8),n=Math.ceil(txt.length/TROZO);
        try{for(let i=0;i<n;i+=10){const w=F.writeBatch(fs);for(let j=i;j<Math.min(n,i+10);j++)w.set(F.doc(fs,col+'/'+k+'/partes',String(j)),{d:txt.slice(j*TROZO,(j+1)*TROZO)});await w.commit()}
          await F.setDoc(F.doc(fs,col,k),{tipo,partes:n,tam:blob.size,subida:Date.now()})}
        catch(e){avisar(e);throw Object.assign(new Error(e.message),{code:e.code==='resource-exhausted'?'quota_or_state':e.code})}
        urls.set('fs:'+k,URL.createObjectURL(blob));return{id:'fs:'+k}},
      async delete(id){const k=id.replace(/^fs:/,'');const m=await F.getDoc(F.doc(fs,col,k));const n=m.exists()?m.data().partes:0;
        const w=F.writeBatch(fs);for(let i=0;i<n;i++)w.delete(F.doc(fs,col+'/'+k+'/partes',String(i)));w.delete(F.doc(fs,col,k));await w.commit()}};
  }

  window.claude={use:async nombre=>{
    if(nombre==='downloads')return descargas;
    if(nombre==='db'){const x=await listo;return hacerDb(x)}
    if(nombre==='assets'){
      const x=await listo;
      if(!window.FIREBASE_FOTOS)return fotosEnBase(x);
      // fotos de facturas en Firebase Storage (plan Blaze); se activa en firebase-config.js
const S=await import(U+'firebase-storage.js');const st=S.getStorage(x.fb);
      return{async upload(blob,o){
          if(blob.size>20*1024*1024)throw Object.assign(new Error('grande'),{code:'too_large'});
          const tipo=(o&&o.type)||blob.type||'image/jpeg',ext=tipo==='application/pdf'?'pdf':'jpg';
          const r=S.ref(st,RAIZ+'fotos/'+Date.now().toString(36)+Math.random().toString(36).slice(2,8)+'.'+ext);
          try{await S.uploadBytes(r,blob,{contentType:tipo})}
          catch(e){avisar(e);throw Object.assign(new Error(e.message),{code:e.code==='storage/quota-exceeded'?'quota_or_state':e.code})}
          return{id:await S.getDownloadURL(r)}},
        delete:async id=>{await S.deleteObject(S.ref(st,id))}};
    }
    if(nombre==='sample'){
      // leer facturas con Gemini (Firebase AI Logic); en España exige el plan Blaze, se activa en firebase-config.js
      if(!window.FIREBASE_IA)throw Object.assign(new Error('IA no activada'),{code:'not_granted'});
      const x=await listo;const AI=await import(U+'firebase-ai.js');
      const ai=AI.getAI(x.fb,{backend:new AI.GoogleAIBackend()});
      const modelo=AI.getGenerativeModel(ai,{model:window.FIREBASE_IA_MODELO||'gemini-3.8-flash',generationConfig:{responseMimeType:'application/json'}});
      const COD=e=>/429|quota|exhausted/i.test(String(e&&e.message))?'rate_limited':/safety|blocked/i.test(String(e&&e.message))?'refused':'error';
      return{limits:async()=>({images:{maxCount:5}}),
        async json(prompt,o={}){
          const partes=[{text:prompt}];for(const im of o.images||[])partes.push({inlineData:{mimeType:im.type||'image/jpeg',data:await aTexto(im)}});
          const corte=new Promise((_,ko)=>{if(o.signal){if(o.signal.aborted)ko({code:'cancelled'});o.signal.addEventListener('abort',()=>ko({code:'cancelled'}))}});
          let r;try{r=await Promise.race([modelo.generateContent(partes),corte])}catch(e){if(e&&e.code==='cancelled')throw e;console.error(e);throw Object.assign(new Error(e&&e.message),{code:COD(e)})}
          const t=String(r.response.text()||'').trim().replace(/^```(?:json)?\s*|\s*```$/g,'');
          try{return JSON.parse(t)}catch(e){throw Object.assign(new Error('JSON'),{code:'invalid_json'})}}};
    }
    if(nombre==='user'){const x=await listo;const{F,fs,user}=x;return{id:async()=>user.uid,
      profiles:async ids=>{const o={};await Promise.all(ids.map(async id=>{try{const s=await F.getDoc(F.doc(fs,USUARIOS,id));if(s.exists())o[id]={name:s.data().nombre}}catch(e){}}));return o}}}
    throw Object.assign(new Error('No disponible fuera de Claude'),{code:'not_granted'});
  }};
})();
