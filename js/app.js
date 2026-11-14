
let keys=JSON.parse(localStorage.getItem("rx4signupKeys")||'null')||["REXI1002","REXI2863","REXI0199","REXI2752","REXI1551","REXI1092","REXI2070","REXI1436","REXI7155","REXI4277"];
let users=JSON.parse(localStorage.getItem("rx4u")||"{}");
let rates=JSON.parse(localStorage.getItem("rx4r")||'{"s":15,"f":20,"t":25}');
let session=localStorage.getItem("rx4s"),chosen=null;
let usedKeys=JSON.parse(localStorage.getItem("rx4usedKeys")||"{}"),rx4news=JSON.parse(localStorage.getItem("rx4news")||"[]");
let referralCodes=JSON.parse(localStorage.getItem("rx4refCodes")||'null');
if(!referralCodes||typeof referralCodes!=="object") referralCodes={"REXI0909":10};
window.rx4news=rx4news;
// Recover keys used by accounts created in an older version.
Object.values(users).forEach(u=>{if(u.signupKey)usedKeys[u.signupKey]=true;});

function save(){
  try{
    localStorage.setItem("rx4u",JSON.stringify(users));
    localStorage.setItem("rx4r",JSON.stringify(rates));
    localStorage.setItem("rx4usedKeys",JSON.stringify(usedKeys));
    localStorage.setItem("rx4signupKeys",JSON.stringify(keys));
    return true;
  }catch(err){
    sm.className="error";
    sm.textContent="Submission could not be saved. Your browser storage is full. Please remove old demo data or use a fresh browser/site storage.";
    return false;
  }
}
function authTab(n){loginBox.classList.toggle("hidden",n!=1);signupBox.classList.toggle("hidden",n!=2);document.querySelectorAll(".tab").forEach((x,i)=>x.classList.toggle("active",i==n-1))}
function signup(){
se.textContent="";
let u=su.value.trim(),p=sp.value,k=sk.value.trim(),r=rc.value.trim();
if(!u||!p||!k)return se.textContent="Please fill all required fields";
if(!keys.includes(k))return se.textContent="Invalid signup key";
if(usedKeys[k])return se.textContent="Signup key already used";
if(users[u])return se.textContent="Username already exists";
if(r&&!Object.prototype.hasOwnProperty.call(referralCodes,r))return se.textContent="Invalid referral code";
const referralBonus=r?Number(referralCodes[r])||0:0;
users[u]={password:p,signupKey:k,balance:referralBonus,bonus:referralBonus,referralCode:r||"",approved:0,subs:[],withdrawals:[]};
usedKeys[k]=true;
if(!save())return;
localStorage.setItem("rx4usedKeys",JSON.stringify(usedKeys));
session=u;localStorage.setItem("rx4s",u);open()
}
function login(){
le.textContent="";
if(lu.value=="admin"&&lp.value=="REXI2026ADMIN"){session="admin";localStorage.setItem("rx4s","admin");return open()}
let u=users[lu.value];
if(!u||u.password!=lp.value)return le.textContent="Incorrect username or password";
if(u.suspended)return le.textContent="Your account has been suspended by admin";
u.lastSeen=Date.now();
ensureUser(u);
session=lu.value;localStorage.setItem("rx4s",session);open()
}
function open(){auth.classList.add("hidden");app.classList.remove("hidden");at.classList.toggle("hidden",session!="admin");refresh()}
function go(id,e){document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));document.getElementById(id).classList.add("active");document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));e.classList.add("active");refresh()}
function choose(n,p){
  chosen={n,p};
  form.classList.remove("hidden");
  pkg.textContent=n+" — ₹"+p+" / account";
  buildAccountFields(n);
  form.scrollIntoView({behavior:"smooth"});
}
function buildAccountFields(pkgName){
  const count=pkgName==="5 Accounts"?5:pkgName==="10 Accounts"?10:1;
  const box=document.getElementById("accountFields");
  box.innerHTML=Array.from({length:count},(_,i)=>`
    <div class="card" style="margin:10px 0;padding:14px;background:#0a1424">
      <h4 style="margin:0 0 12px">Account ${i+1}</h4>
      <label>Gmail / Email</label>
      <input class="input acct-email" data-index="${i}" type="email" placeholder="Enter Gmail / email">
      <label>Name</label>
      <input class="input acct-name" data-index="${i}" placeholder="Enter name">
      <label>REXI Verification Password</label>
      <div style="display:flex;gap:8px;align-items:center;margin:7px 0 14px">
        <input class="input acct-pass" data-index="${i}" type="password" placeholder="Enter REXI verification password" style="margin:0;flex:1">
        <button type="button" class="btn" onclick="toggleAccountPassword(${i})" style="white-space:nowrap">SHOW</button>
      </div>
      <label>Profile Screenshot</label>
      <input class="input acct-shot" data-index="${i}" type="file" accept="image/png,image/jpeg,image/webp">
      <div class="acct-preview hidden" data-index="${i}" style="margin:6px 0 0">
        <img class="acct-img" alt="Profile screenshot preview" style="width:100%;max-height:220px;object-fit:contain;border-radius:10px;border:1px solid #30445f">
      </div>
    </div>`).join("");
  box.querySelectorAll(".acct-shot").forEach(el=>el.addEventListener("change",handleAccountScreenshot));
}
function toggleAccountPassword(i){
  const input=document.querySelector(`.acct-pass[data-index="${i}"]`);
  const btn=input.parentElement.querySelector("button");
  if(input.type==="password"){input.type="text";btn.textContent="HIDE"}else{input.type="password";btn.textContent="SHOW"}
}
function handleAccountScreenshot(e){
  const file=e.target.files[0];
  const i=e.target.dataset.index;
  const preview=document.querySelector(`.acct-preview[data-index="${i}"]`);
  const img=preview.querySelector(".acct-img");
  preview.classList.add("hidden");
  if(!file)return;
  if(file.size>5*1024*1024){e.target.value="";sm.className="error";sm.textContent=`Account ${Number(i)+1}: screenshot must be 5 MB or smaller.`;return;}
  const reader=new FileReader();
  reader.onload=function(ev){
    const image=new Image();
    image.onload=function(){
      const maxW=900,scale=Math.min(1,maxW/image.width);
      const canvas=document.createElement("canvas");
      canvas.width=Math.max(1,Math.round(image.width*scale));
      canvas.height=Math.max(1,Math.round(image.height*scale));
      canvas.getContext("2d").drawImage(image,0,0,canvas.width,canvas.height);
      img.src=canvas.toDataURL("image/jpeg",0.72);
      preview.classList.remove("hidden");
    };
    image.src=ev.target.result;
  };
  reader.readAsDataURL(file);
}
let profileShotData="";
document.getElementById("profileShot").addEventListener("change", function(){
  const file=this.files[0];
  profileShotData="";
  document.getElementById("sm").className="";
  document.getElementById("sm").textContent="";
  shotPreview.classList.add("hidden");
  if(!file)return;
  if(file.size>5*1024*1024){
    this.value="";
    sm.className="error";
    sm.textContent="Screenshot must be 5 MB or smaller.";
    return;
  }
  const reader=new FileReader();
  reader.onload=function(e){
    const img=new Image();
    img.onload=function(){
      const maxW=900;
      const scale=Math.min(1,maxW/img.width);
      const canvas=document.createElement("canvas");
      canvas.width=Math.max(1,Math.round(img.width*scale));
      canvas.height=Math.max(1,Math.round(img.height*scale));
      const ctx=canvas.getContext("2d");
      ctx.drawImage(img,0,0,canvas.width,canvas.height);
      profileShotData=canvas.toDataURL("image/jpeg",0.72);
      document.getElementById("sm").className="ok";
      document.getElementById("sm").textContent="Screenshot ready. You can submit now.";
      document.getElementById("shotImg").src=profileShotData;
      shotPreview.classList.remove("hidden");
    };
    img.src=e.target.result;
  };
  reader.readAsDataURL(file);
});

function submitA(){
  const smEl=document.getElementById("sm");
  const confirmEl=document.getElementById("confirm");
  const u=users[session];
  smEl.className="";smEl.textContent="";
  if(!u)return smEl.className="error",smEl.textContent="Session expired. Please log in again.";
  if(!chosen)return smEl.className="error",smEl.textContent="Please select a submission package first";
  if(!confirmEl.checked)return smEl.className="error",smEl.textContent="Please confirm that these are your own/authorized accounts";
  const emails=[...document.querySelectorAll(".acct-email")];
  const names=[...document.querySelectorAll(".acct-name")];
  const passes=[...document.querySelectorAll(".acct-pass")];
  const shots=[...document.querySelectorAll(".acct-shot")];
  const previews=[...document.querySelectorAll(".acct-img")];
  const count=chosen.n==="5 Accounts"?5:chosen.n==="10 Accounts"?10:1;
  for(let i=0;i<count;i++){
    if(!emails[i].value.trim()||!names[i].value.trim()||!passes[i].value.trim()||!shots[i].files[0]){
      return smEl.className="error",smEl.textContent=`Please complete all details and upload the screenshot for Account ${i+1}`;
    }
    if(!previews[i].src)return smEl.className="error",smEl.textContent=`Please wait for the screenshot preview for Account ${i+1}`;
  }
  for(let i=0;i<count;i++){
    u.subs.push({pkg:chosen.n,rate:chosen.p,gmail:emails[i].value.trim(),name:names[i].value.trim(),profileShot:previews[i].src,status:"Pending",date:new Date().toLocaleString(),accountNumber:i+1,totalAccounts:count});
  }
  if(!save()){u.subs.splice(-count,count);return;}
  smEl.className="ok";smEl.textContent=`${count} account${count>1?"s":""} submitted — Pending admin approval.`;
  document.getElementById("accountFields").innerHTML="";
  confirmEl.checked=false;
  chosen=null;
  refresh();
}
function adminTab(id,e){
  document.querySelectorAll(".admin-section").forEach(x=>x.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.querySelectorAll(".admin-tab").forEach(x=>x.classList.remove("active"));
  e.classList.add("active");
  refresh();
}
function addReferralCode(){
  const code=document.getElementById("newReferralCode").value.trim().toUpperCase();
  const amount=Number(document.getElementById("newReferralAmount").value);
  const msg=document.getElementById("referralMsg");
  msg.className=""; msg.textContent="";
  if(!code)return msg.className="error",msg.textContent="Enter a referral code.";
  if(!/^[A-Z0-9_-]{3,30}$/.test(code))return msg.className="error",msg.textContent="Use 3-30 letters, numbers, _ or -.";
  if(!Number.isFinite(amount)||amount<0)return msg.className="error",msg.textContent="Enter a valid bonus amount.";
  referralCodes[code]=amount;
  if(!save())return;
  document.getElementById("newReferralCode").value="";
  document.getElementById("newReferralAmount").value="";
  msg.className="ok"; msg.textContent="Referral code saved.";
  refresh();
}
function deleteReferralCode(code){
  if(code==="REXI0909")return alert("The default referral code cannot be deleted.");
  delete referralCodes[code]; save(); refresh();
}
function renderReferralCodes(){
  const box=document.getElementById("referralCodeList"); if(!box)return;
  const codes=Object.keys(referralCodes);
  box.innerHTML=codes.length?codes.map(code=>`<div class="card" style="margin:8px 0;padding:12px;background:#0a1424"><div class="row"><span><b>${escapeHtml(code)}</b></span><b>₹${Number(referralCodes[code])||0}</b></div><div class="admin-actions"><button class="btn danger small-btn" onclick="deleteReferralCode(${JSON.stringify(code)})">DELETE</button></div></div>`).join(""):"<div class='muted'>No referral codes.</div>";
}
function ensureUser(u){
  if(!u.transactions)u.transactions=[];
  if(typeof u.suspended!=="boolean")u.suspended=false;
  if(!u.lastSeen)u.lastSeen=0;
}
Object.values(users).forEach(ensureUser);
function addTx(username,type,amount,reason){
  const u=users[username]; if(!u)return;
  ensureUser(u);
  u.transactions.unshift({type,amount,reason:reason||"",date:new Date().toLocaleString()});
}
function approve(u,i){
  let s=users[u].subs[i];
  if(!s||s.status!="Pending")return;
  s.status="Approved";
  users[u].balance+=Number(s.rate)||0;
  users[u].approved++;
  addTx(u,"Credit",Number(s.rate)||0,"Approved submission: "+s.pkg);
  save(); refresh();
}
function reject(u,i){
  if(!users[u]||!users[u].subs[i]||users[u].subs[i].status!="Pending")return;
  users[u].subs[i].status="Rejected";
  save(); refresh();
}
function toggleSuspend(username){
  if(!users[username])return;
  users[username].suspended=!users[username].suspended;
  save(); refresh();
}
function adjustWallet(dir){
  const username=walletUser.value;
  const amount=Number(walletAmount.value);
  const reason=walletReason.value.trim()||"Admin wallet adjustment";
  walletMsg.className="";walletMsg.textContent="";
  if(!username||!users[username])return walletMsg.className="error",walletMsg.textContent="Select a user.";
  if(!amount||amount<=0)return walletMsg.className="error",walletMsg.textContent="Enter a valid amount.";
  ensureUser(users[username]);
  if(dir<0 && amount>users[username].balance)return walletMsg.className="error",walletMsg.textContent="Cannot remove more than the user's balance.";
  users[username].balance+=dir*amount;
  addTx(username,dir>0?"Credit":"Debit",amount,reason);
  if(!save())return;
  walletMsg.className="ok";walletMsg.textContent=(dir>0?"Money added":"Money removed")+" successfully.";
  walletAmount.value="";walletReason.value="";refresh();
}
function withdraw(){
let u=users[session],a=Number(amt.value);wm.className="";
if(!upi.value||a<20)return wm.className="error",wm.textContent="Minimum withdrawal is ₹20";
if(a>u.balance)return wm.className="error",wm.textContent="Insufficient balance";
u.balance-=a;ensureUser(u);u.withdrawals.push({upi:upi.value,amount:a,status:"Pending"});addTx(session,"Debit",a,"UPI withdrawal request");save();wm.className="ok";wm.textContent="Withdrawal request submitted.";refresh()
}
function clearNewsForm(){newsEditId.value="";newsMessage.value="";newsLink.value="";newsVideo.value="";newsMsg.textContent="";}
function saveNews(){
  const msg=newsMessage.value.trim(),link=newsLink.value.trim(),video=newsVideo.value.trim();
  newsMsg.className="";newsMsg.textContent="";
  if(!msg)return newsMsg.className="error",newsMsg.textContent="News message is required.";
  if(!Array.isArray(window.rx4news))window.rx4news=[];
  let id=newsEditId.value;
  if(id){
    const item=window.rx4news.find(x=>x.id==id);
    if(item){item.message=msg;item.link=link;item.video=video;item.date=new Date().toLocaleString();}
  }else{
    window.rx4news.unshift({id:Date.now().toString(),message:msg,link,video,date:new Date().toLocaleString()});
  }
  localStorage.setItem("rx4news",JSON.stringify(window.rx4news));
  newsMsg.className="ok";newsMsg.textContent="News saved.";clearNewsForm();refresh();
}
function editNews(id){
  const n=window.rx4news.find(x=>x.id==id);if(!n)return;
  newsEditId.value=n.id;newsMessage.value=n.message||"";newsLink.value=n.link||"";newsVideo.value=n.video||"";
  adminTab('anews',document.querySelector('.admin-tab:nth-child(4)'));window.scrollTo({top:0,behavior:'smooth'});
}
function deleteNews(id){
  window.rx4news=window.rx4news.filter(x=>x.id!=id);localStorage.setItem("rx4news",JSON.stringify(window.rx4news));refresh();
}
function saveRates(){rates={s:Math.max(0,Number(r1.value)||0),f:Math.max(0,Number(r5.value)||0),t:Math.max(0,Number(r10.value)||0)};save();rateMsg.className="ok";rateMsg.textContent="Rates saved.";refresh()}
function addSignupKey(){
  const input=document.getElementById("newSignupKey");
  const msg=document.getElementById("keyMsg");
  const key=input.value.trim().toUpperCase();
  msg.className="";msg.textContent="";
  if(!key)return msg.className="error",msg.textContent="Enter a signup key.";
  if(!/^[A-Z0-9_-]{4,40}$/.test(key))return msg.className="error",msg.textContent="Use 4–40 letters, numbers, _ or -.";
  if(keys.includes(key))return msg.className="error",msg.textContent="This key already exists.";
  keys.push(key);
  if(!save())return;
  input.value="";
  msg.className="ok";msg.textContent="Signup key added successfully.";
  refresh();
}
function renderSignupKeys(){
  const box=document.getElementById("signupKeyList");
  if(!box)return;
  box.innerHTML=keys.map(k=>{
    const usedBy=Object.entries(users).find(([u,x])=>x.signupKey===k);
    const used=!!usedKeys[k] || !!usedBy;
    return `<div class="row"><span><b>${escapeHtml(k)}</b><br><small>${used?`Used${usedBy?` by: ${escapeHtml(usedBy[0])}`:""}`:"Available"}</small></span><span class="pill ${used?"offline-pill":"active-pill"}">${used?"USED":"AVAILABLE"}</span></div>`;
  }).join("")||"No signup keys";
}

function renderNews(){
  if(!Array.isArray(window.rx4news))window.rx4news=[];
  const formatNewsMessage = msg => escapeHtml(msg).replace(/\r?\n/g,"<br>");
  const html=window.rx4news.map(n=>`<div class="card" style="margin:8px 0"><div style="line-height:1.6">${formatNewsMessage(n.message)}</div>${n.link?`<div style="margin-top:8px"><a href="${safeUrl(n.link)}" target="_blank"><button class="btn small-btn">OPEN LINK</button></a></div>`:""}${n.video?`<div style="margin-top:8px"><a href="${safeUrl(n.video)}" target="_blank"><button class="btn small-btn">WATCH VIDEO</button></a></div>`:""}<div class="muted" style="margin-top:8px">${n.date||""}</div></div>`).join("");
  news.innerHTML=html||"Welcome to REXI WEB. Check rates before submitting.";
  newsList.innerHTML=window.rx4news.map(n=>`<div class="row"><span><div style="line-height:1.5">${formatNewsMessage(n.message)}</div><small>${n.link?"Link attached":"No link"} · ${n.video?"Video attached":"No video"}<br>${n.date||""}</small></span><span class="admin-actions"><button class="btn info small-btn" onclick="editNews('${n.id}')">EDIT</button><button class="btn danger small-btn" onclick="deleteNews('${n.id}')">DELETE</button></span></div>`).join("")||"No news yet.";
}
function safeUrl(url){try{const u=new URL(url);if(u.protocol==="http:"||u.protocol==="https:")return u.href;return "#"}catch(e){return "#"}}
function escapeHtml(v){return String(v||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}
function logout(){
  localStorage.removeItem("rx4s");
  session="";
  chosen=null;
  document.getElementById("app").classList.add("hidden");
  document.getElementById("auth").classList.remove("hidden");
  document.getElementById("loginBox").classList.remove("hidden");
  document.getElementById("signupBox").classList.add("hidden");
  document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
  document.getElementById("dashboard").classList.add("active");
  document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));
  document.querySelector(".nav").classList.add("active");
  document.querySelectorAll(".tab").forEach((x,i)=>x.classList.toggle("active",i===0));
  document.getElementById("lu").value="";
  document.getElementById("lp").value="";
  document.getElementById("le").textContent="";
}
function refresh(){
  if(!Array.isArray(window.rx4news))window.rx4news=JSON.parse(localStorage.getItem("rx4news")||"[]");
  Object.values(users).forEach(ensureUser);
  if(session=="admin"){
    uc.textContent=Object.keys(users).length;
    let all=Object.entries(users).flatMap(([u,x])=>(x.subs||[]).map((s,i)=>({u,i,s})));
    pc.textContent=all.filter(x=>x.s.status=="Pending").length;
    nc.textContent=window.rx4news.length;
    userList.innerHTML=Object.entries(users).map(([u,x])=>{const active=(Date.now()-(x.lastSeen||0)<120000);return `<div class="row"><span><b>${escapeHtml(u)}</b><br><small>Wallet: ₹${x.balance||0}<br>${x.suspended?"<span class=\"pill suspended-pill\">Suspended</span>":active?"<span class=\"pill active-pill\">Active</span>":"<span class=\"pill offline-pill\">Offline</span>"}</small></span><span class="admin-actions"><button class="btn small-btn ${x.suspended?"success":"danger"}" onclick="toggleSuspend('${u}')">${x.suspended?"UNSUSPEND":"SUSPEND"}</button></span></div>`}).join("")||"No users";
    walletUser.innerHTML=Object.keys(users).map(u=>`<option value="${escapeHtml(u)}">${escapeHtml(u)} — ₹${users[u].balance||0}</option>`).join("")||"<option value=\"\">No users</option>";
    as.innerHTML=all.map(x=>`<div class="row"><span><b>User: ${escapeHtml(x.u)}</b><br><small>Account: ${x.s.accountNumber||1}/${x.s.totalAccounts||1}<br>Package: ${escapeHtml(x.s.pkg)}<br>Rate: ₹${x.s.rate||0}<br>Email: ${escapeHtml(x.s.gmail)}<br>Name: ${escapeHtml(x.s.name)}<br>Date: ${escapeHtml(x.s.date)}<br>Status: <span class="pill">${escapeHtml(x.s.status)}</span>${x.s.profileShot?`<br><img src="${x.s.profileShot}" alt="Profile screenshot" style="width:110px;height:110px;object-fit:cover;border-radius:8px;margin-top:6px">`:''}</small></span>${x.s.status=="Pending"?`<span class="admin-actions"><button class="btn success small-btn" onclick="approve('${x.u}',${x.i})">APPROVE</button><button class="btn danger small-btn" onclick="reject('${x.u}',${x.i})">REJECT</button></span>`:""}</div>`).join("")||"No submissions";
    r1.value=rates.s;r5.value=rates.f;r10.value=rates.t;
    adminTransactions.innerHTML=Object.entries(users).flatMap(([u,x])=>(x.transactions||[]).map(t=>({u,t}))).sort((a,b)=>String(b.t.date).localeCompare(String(a.t.date))).map(x=>`<div class="row"><span><b>${escapeHtml(x.u)}</b><br><small>${escapeHtml(x.t.reason)}<br>${escapeHtml(x.t.date)}</small></span><span><b class="${x.t.type==="Credit"?"ok":"error"}">${x.t.type==="Credit"?"+":"-"}₹${x.t.amount}</b></span></div>`).join("")||"No transactions";
    renderNews();
    renderSignupKeys();
  renderReferralCodes();
    return;
  }
  let u=users[session];if(!u)return;
  ensureUser(u);u.lastSeen=Date.now();localStorage.setItem("rx4u",JSON.stringify(users));
  dbal.textContent=wbal.textContent="₹"+u.balance;
  pn.textContent=session;pb.textContent="₹"+u.bonus;pa.textContent=u.approved;
  rate.textContent="₹"+rates.s+" / account";
  mine.innerHTML=(u.subs||[]).map(s=>`<div class="row"><span>${escapeHtml(s.pkg)}<br><small>${escapeHtml(s.gmail)}<br>${escapeHtml(s.name)}</small></span><span class="status">${escapeHtml(s.status)}</span></div>`).join("")||"No submissions yet.";
  renderNews();
}
if(session)open();
