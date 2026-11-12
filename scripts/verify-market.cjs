/* Domain and persistence regressions. No browser data is read or written. */
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const assert = require('node:assert/strict');
const ts = require('typescript');
const React = require('react');
globalThis.crypto ||= require('node:crypto').webcrypto;
const root = path.resolve(__dirname, '..');
function loader(mocks = {}) {
 const cache = new Map();
 return function load(relative) {
  const file = path.resolve(root, relative);
  if (cache.has(file)) return cache.get(file).exports;
  const mod = new Module(file, module); mod.filename = file; mod.paths = Module._nodeModulePaths(path.dirname(file)); cache.set(file, mod);
  const original = mod.require.bind(mod);
  mod.require = name => {
   if (Object.hasOwn(mocks,name)) return mocks[name];
   if(name.endsWith('.module.css'))return {__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})};
   let local = name.startsWith('.') ? path.resolve(path.dirname(file),name) : name.startsWith('@/') ? path.resolve(root,'src',name.slice(2)) : null;
   if(local) { const target=[local,`${local}.ts`,`${local}.tsx`].find(x=>fs.existsSync(x)&&fs.statSync(x).isFile()); if(target) return load(target); }
   return original(name);
  };
  mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,file);
  return mod.exports;
 };
}
const load=loader(), E=load('src/lib/demo-engine.ts'), D=load('src/lib/data.ts'), C=load('src/lib/catalog.ts'), Q=load('src/lib/catalog-query.ts');
const input={name:'Client Test',phone:'0600000000',city:'Rabat',address:'Adresse fictive de test',delivery:'Livraison à domicile'};
const apply=(s,a)=>E.transition(s,a).state;
const member=()=>apply(E.seed(),{type:'login',email:'client@example.test',password:E.PASSWORD});
const admin=s=>apply(s,{type:'admin',password:E.PASSWORD});
const cart=(s,id='demo-0-b',quantity=1)=>apply(s,{type:'cart',id,quantity});
let count=0;
function check(name,fn){fn();count++;console.log(`PASS ${name}`);}
function rejects(s,a,code){assert.throws(()=>E.transition(s,a),e=>e.message===code);}

check('valid seed and stable original identifiers',()=>{const s=E.seed();E.validate(s);assert.equal(s.products.length,18);assert.deepEqual(s.products.slice(0,12).map(p=>p.slug),D.products.map(p=>p.slug));assert(s.products.slice(0,12).every(p=>!p.family&&!p.profile&&!p.pyramid));});
check('migration v2 preserves snapshots, prices and references',()=>{const old={products:D.products,cart:[{variantId:'p1-100',quantity:1}],orders:[{...input,reference:'DEMO-OLD',status:'PENDING',createdAt:'2026-11-01',total:123,items:[{variantId:'p1-100',quantity:1,unitPrice:123}]}]};const s=E.migrate(old);assert.equal(s.version,3);assert.equal(s.products.length,12);assert.equal(s.orders[0].items[0].unitPrice,123);assert.equal(s.orders[0].items[0].productName,D.products[0].name);assert.equal(s.cart.length,1);assert.equal(s.products[0].variants[0].volumeMl,100);});
check('invalid imported state is rejected',()=>{for(const mutate of [s=>s.cart[0]={variantId:'x',quantity:-1},s=>s.products[1].slug=s.products[0].slug,s=>s.customers[0].email='real@example.com',s=>s.giftCards[0].balance=-1,s=>s.promotions[0].percent=101,s=>delete s.settings.delivery,s=>s.products[0].images=['https://tracker.invalid/image.png'],s=>s.products[0].sources=['javascript:alert(1)'],s=>s.version=99]){const s=E.seed();mutate(s);assert.throws(()=>E.migrate(s));}});
check('product validation: decimals, stock, format, safe image',()=>{for(const mutate of [p=>p.variants[0].price=1.234,p=>p.variants[0].stock=.5,p=>p.image='javascript:alert(1)',p=>p.variants.push({...p.variants[1],id:'new',volumeMl:7,label:'7 ml'})]){const p=structuredClone(D.products[0]);mutate(p);assert(C.productError(p));}assert.equal(D.variantVolumeMl({label:'EDP 90 ml'}),90);});
check('admin gate is explicit and simulated',()=>{const s=E.seed();rejects(s,{type:'archive',id:'p1',archived:true},'adminRequired');assert(apply(s,{type:'admin',password:E.PASSWORD}).admin);rejects(s,{type:'admin',password:'wrong'},'credentials');});
check('accounts, recovery and separate favorites',()=>{let s=E.seed();rejects(s,{type:'register',name:'Test',email:'real@mail.com',password:E.PASSWORD},'testAccount');s=apply(s,{type:'register',name:'Fiction',email:'fiction@example.test',password:E.PASSWORD});assert(s.customerId);assert(!JSON.stringify(s).includes(E.PASSWORD));s=apply(s,{type:'favorite',id:'p1'});const id=s.customerId;s=apply(s,{type:'logout'});assert(!s.guestFavorites.includes('p1'));s=apply(s,{type:'login',email:'client@example.test',password:E.PASSWORD});assert(!s.customers.find(c=>c.id===s.customerId).favorites.includes('p1'));assert(s.customers.find(c=>c.id===id).favorites.includes('p1'));s=apply(s,{type:'recover',email:'fiction@example.test'});assert(s.notices[0].body.includes('Aucun email'));});
check('stock boundaries, archiving and empty cart',()=>{let s=E.seed();rejects(s,{type:'cart',id:'demo-0-b',quantity:7},'stock');rejects(s,{type:'cart',id:'demo-0-b',quantity:-1},'stock');rejects(s,{type:'checkout',input},'empty');s=admin(cart(s));s=apply(s,{type:'archive',id:'demo-0',archived:true});rejects(s,{type:'checkout',input},'stock');});
check('immutable transitions and monetary centimes',()=>{let s=E.seed();const before=JSON.stringify(s);const next=cart(s);assert.equal(JSON.stringify(s),before);next.products.find(p=>p.id==='demo-0').variants[0].price=249.55;const r=E.transition(next,{type:'checkout',input});assert.equal(r.state.orders[0].total,279.55);assert.equal(r.state.orders[0].items[0].unitPrice,249.55);assert.equal(r.state.cart.length,0);assert.equal(E.find(r.state,'demo-0-b').variant.stock,5);});
check('refused and abandoned payments preserve cart and stocks',()=>{for(const result of ['refused','abandoned']){const s=cart(member());const before=JSON.stringify(s);rejects(s,{type:'checkout',input:{...input,payment:'card',result}},result==='refused'?'paymentRefused':'paymentAbandoned');assert.equal(JSON.stringify(s),before);}});
check('final shipping, collection and threshold after discount',()=>{let s=cart(E.seed());assert.equal(E.quote(s,input).shipping,30);assert.equal(E.quote(s,{delivery:'Retrait en boutique'}).shipping,0);s=cart(member(),'demo-0-b',3);assert.equal(E.quote(s,input).shipping,0);s=cart(member(),'demo-4-b',1);assert.equal(E.quote(s,input).shipping,30);s=cart(member(),'demo-1-b',2);assert.equal(E.quote(s,input).shipping,0);assert.equal(E.quote(s,{...input,coupon:'DEMO10'}).shipping,30);});
check('coupon validity, minimum, membership, once per account',()=>{let s=cart(E.seed());assert.throws(()=>E.quote(s,{...input,coupon:'DEMO10'}),/loginRequired/);s=cart(member());assert.equal(E.quote(s,{...input,coupon:'DEMO10'}).discount,25);assert.throws(()=>E.quote(s,{...input,coupon:'BAD'}),/coupon/);s.promotions[0].end='2020-01-01';assert.throws(()=>E.quote(s,{...input,coupon:'DEMO10'}),/coupon/);s=cart(member());s=E.transition(s,{type:'checkout',input:{...input,coupon:'DEMO10'}}).state;s=cart(s);assert.throws(()=>E.quote(s,{...input,coupon:'DEMO10'}),/couponUsed/);});
check('no coupon and points stacking',()=>assert.throws(()=>E.quote(cart(member()),{...input,coupon:'DEMO10',usePoints:true}),/noStack/));
check('points spent and credited once, delivery independent from collection',()=>{let s=cart(member());const result=E.transition(s,{type:'checkout',input:{...input,usePoints:true}});s=admin(result.state);const ref=result.reference;assert.equal(E.balance(s),50);assert.equal(s.orders[0].total,270);s=apply(s,{type:'status',reference:ref,status:'DELIVERED'});assert.equal(E.balance(s),74);assert.equal(s.orders[0].paymentStatus,'PENDING');s=apply(s,{type:'status',reference:ref,status:'DELIVERED'});assert.equal(E.balance(s),74);s=apply(s,{type:'payment',reference:ref});assert.equal(s.orders[0].paymentStatus,'PAID');});
check('cancellation restores stock and benefits only once',()=>{let s=cart(member());const r=E.transition(s,{type:'checkout',input:{...input,usePoints:true,giftCode:'DEMO-CADEAU',payment:'card'}});s=admin(r.state);assert.equal(s.giftCards[0].balance,0);s=apply(s,{type:'status',reference:r.reference,status:'CANCELLED'});assert.equal(E.find(s,'demo-0-b').variant.stock,6);assert.equal(E.balance(s),150);assert.equal(s.giftCards[0].balance,200);const once=JSON.stringify(s);s=apply(s,{type:'status',reference:r.reference,status:'CANCELLED'});assert.equal(JSON.stringify(s),once);s=apply(s,{type:'status',reference:r.reference,status:'PENDING'});assert.equal(E.balance(s),50);assert.equal(s.giftCards[0].balance,0);});
check('reactivation checks stock and coupon usage',()=>{let s=cart(member());const r=E.transition(s,{type:'checkout',input:{...input,coupon:'DEMO10'}});s=admin(r.state);s=apply(s,{type:'status',reference:r.reference,status:'CANCELLED'});s=cart(s);s=E.transition(s,{type:'checkout',input:{...input,coupon:'DEMO10'}}).state;rejects(s,{type:'status',reference:r.reference,status:'PENDING'},'couponUsed');s=admin(E.seed());s=cart(s);const x=E.transition(s,{type:'checkout',input});s=apply(x.state,{type:'status',reference:x.reference,status:'CANCELLED'});E.find(s,'demo-0-b').variant.stock=0;rejects(s,{type:'status',reference:x.reference,status:'PENDING'},'stock');});
check('snapshots survive product price edits; reserved format protected',()=>{const r=E.transition(cart(member()),{type:'checkout',input});let s=admin(r.state);const p=structuredClone(s.products.find(p=>p.id==='demo-0'));p.variants[0].price=260;s=apply(s,{type:'product',product:p});assert.equal(s.orders[0].items[0].unitPrice,250);p.variants[0].volumeMl=90;p.variants[0].label='90 ml';rejects(s,{type:'product',product:p},'reserved');});
check('whole-order refund, separate restock and prevented repeated refund',()=>{const r=E.transition(cart(member()),{type:'checkout',input:{...input,usePoints:true,giftCode:'DEMO-CADEAU',payment:'card'}});let s=admin(r.state);s=apply(s,{type:'status',reference:r.reference,status:'DELIVERED'});s=apply(s,{type:'request',reference:r.reference,kind:'return'});s=apply(s,{type:'decision',reference:r.reference,accept:true});assert.equal(s.orders[0].status,'REFUNDED');assert.equal(s.orders[0].requestDecision,'accepted');assert.equal(E.find(s,'demo-0-b').variant.stock,5);assert.equal(E.balance(s),150);assert.equal(s.giftCards[0].balance,200);s=apply(s,{type:'restock',reference:r.reference});assert.equal(E.find(s,'demo-0-b').variant.stock,6);rejects(s,{type:'restock',reference:r.reference},'status');rejects(s,{type:'status',reference:r.reference,status:'PENDING'},'status');});
check('requests and reviews are restricted to their customer',()=>{let s=member();s=apply(s,{type:'register',name:'Autre',email:'autre@example.test',password:E.PASSWORD});rejects(s,{type:'request',reference:'DEMO-EXEMPLE',kind:'return'},'request');rejects(s,{type:'review',reference:'DEMO-EXEMPLE',productId:'demo-0',rating:5,text:'Exemple'},'review');});
check('pack stock, three 5ml components, coupon exclusions, group removal',()=>{let s=apply(member(),{type:'pack',ids:[],packId:'pack-decouverte'});assert.equal(s.cart.length,3);assert.equal(E.quote(s,input).subtotal,60);assert.throws(()=>E.quote(s,{...input,coupon:'DEMO10'}),/coupon/);rejects(s,{type:'cart',id:'demo-0-d5',quantity:1},'packConflict');s=apply(s,{type:'remove',id:'demo-0-d5'});assert.equal(s.cart.length,0);rejects(s,{type:'pack',ids:['demo-0-d2','demo-1-d5','demo-2-d5']},'pack');rejects(E.seed(),{type:'pack',ids:['demo-5-d5','demo-1-d5','demo-2-d5']},'stock');});
check('gift purchase is separate, issued on success, expiry and partial redemption',()=>{let s=cart(member());const oldCart=JSON.stringify(s.cart);rejects(s,{type:'gift',amount:200,message:'Test',result:'refused'},'paymentRefused');s=apply(s,{type:'gift',amount:200,message:'Test',result:'success'});assert.equal(JSON.stringify(s.cart),oldCart);const g=s.giftCards[0];assert.equal(g.balance,200);assert.equal(s.orders[0].giftPurchase,200);assert.equal(s.orders[0].items.length,0);s=apply(s,{type:'clear'});s=cart(s,'demo-0-d5');s=E.transition(s,{type:'checkout',input:{...input,giftCode:g.code,delivery:'Retrait en boutique'}}).state;assert.equal(s.giftCards[0].balance,185);s.giftCards[0].expires='2020-01-01';s=cart(s,'demo-1-d5');assert.throws(()=>E.quote(s,{...input,giftCode:g.code}),/gift/);});
check('spent issued gift cannot be refunded',()=>{let s=apply(member(),{type:'gift',amount:200,message:'',result:'success'});const ref=s.orders[0].reference,code=s.giftCards[0].code;s=E.transition(cart(s,'demo-0-d5'),{type:'checkout',input:{...input,giftCode:code}}).state;s=admin(s);rejects(s,{type:'status',reference:ref,status:'REFUNDED'},'giftSpent');});
check('moderated reviews only after delivered order',()=>{let s=member();s=apply(s,{type:'review',productId:'demo-0',reference:'DEMO-EXEMPLE',rating:5,text:'Avis fictif pour la démonstration.'});assert.equal(s.reviews[0].approved,false);rejects(s,{type:'review',productId:'demo-0',reference:'DEMO-EXEMPLE',rating:4,text:'Deuxième avis fictif.'},'review');s=admin(s);s=apply(s,{type:'moderate',id:s.reviews[0].id,approved:true});assert.equal(s.reviews[0].approved,true);});
check('restock alerts and newsletter only create local messages',()=>{let s=apply(member(),{type:'subscribe',email:'client@example.test',variantId:'demo-5-d5'});s=admin(s);const p=structuredClone(s.products.find(p=>p.id==='demo-5'));p.variants.find(v=>v.id==='demo-5-d5').stock=2;s=apply(s,{type:'product',product:p});assert(s.subscriptions[0].notified);const notices=s.notices.length;s=apply(s,{type:'product',product:p});assert.equal(s.notices.length,notices);s=apply(s,{type:'subscribe',email:'visiteur@example.test'});assert(s.notices[0].body.includes('aucun envoi'));});
check('catalog: page size, real dates, stock, typed format and matching price',()=>{const s=E.seed();assert.equal(Q.catalogQuery(s,new URLSearchParams()).visible.length,12);assert.equal(Q.catalogQuery(s,new URLSearchParams('page=2')).visible.length,6);assert.equal(Q.catalogQuery(s,new URLSearchParams()).rows[0].product.id,'demo-5');const rows=Q.catalogQuery(s,new URLSearchParams('type=bottle&max=300&stock=1')).rows;assert(rows.length);assert(rows.every(r=>r.variant.kind==='bottle'&&D.unitPrice(r.variant)<=300&&r.variant.stock>0));assert(!Q.catalogQuery(s,new URLSearchParams('type=bottle&format=5')).rows.length);});
check('catalog: Arabic and note search, comparison maximum, favorites persist',()=>{let s=E.seed();assert(Q.catalogQuery(s,new URLSearchParams('q=فانيليا')).rows.length);assert(Q.catalogQuery(s,new URLSearchParams('q=Encens')).rows.some(r=>r.product.id==='p8'));for(const id of ['p1','p2','p3'])s=apply(s,{type:'compare',id});rejects(s,{type:'compare',id:'p4'},'compareLimit');assert.equal(E.migrate(s).comparison.length,3);});
check('dated offer: price reverts outside dates',()=>{const v={id:'test',kind:'bottle',label:'100 ml',price:100,referencePrice:120,saleStart:'2026-01-01',saleEnd:'2026-02-01',stock:2};assert.equal(D.unitPrice(v,'2026-01-15'),100);assert.equal(D.unitPrice(v,'2026-03-01'),120);assert(!Q.onSale(v,'2026-03-01'));});
check('reorder uses current price and current stock',()=>{let s=admin(member());const p=structuredClone(s.products.find(p=>p.id==='demo-0'));p.variants[0].price=260;s=apply(s,{type:'product',product:p});s=apply(s,{type:'reorder',reference:'DEMO-EXEMPLE'});assert.equal(E.quote(s,input).subtotal,260);assert.equal(s.orders[0].items[0].unitPrice,250);});
check('source code has no messaging, banking or analytics integration',()=>{const files=['src/lib/demo-engine.ts','src/lib/store.tsx',...fs.readdirSync(path.join(root,'src/components')).filter(x=>x.startsWith('market-')&&x.endsWith('.tsx')).map(x=>`src/components/${x}`)];for(const f of files)assert(!/\bfetch\s*\(|\bXMLHttpRequest\b|\bnavigator\.sendBeacon\b|https:\/\/wa\.me|mailto:/.test(fs.readFileSync(path.join(root,f),'utf8')),f);});

// Exercise the real StoreProvider with a deterministic hooks/persistence adapter.
let env;
const hooks={...React,useState(initial){const owner=env,i=owner.cursor++;if(!(i in owner.hooks))owner.hooks[i]=typeof initial==='function'?initial():initial;return[owner.hooks[i],v=>{owner.hooks[i]=typeof v==='function'?v(owner.hooks[i]):v;}];},useRef(initial){const i=env.cursor++;if(!(i in env.hooks))env.hooks[i]={current:initial};return env.hooks[i];},useEffect(fn){const i=env.cursor++;if(!(i in env.hooks)){env.hooks[i]=true;env.effects.push(fn);}}};
const provider=loader({react:hooks})('src/lib/store.tsx').StoreProvider;
function render(){env.cursor=0;return provider({children:null}).props.value;}
function mount(saved=new Map()){env={hooks:[],cursor:0,effects:[],saved,fail:false,listeners:new Map()};globalThis.localStorage={getItem:k=>env.saved.get(k)??null,setItem(k,v){if(env.fail)throw Error('QuotaExceededError');env.saved.set(k,v);}};globalThis.window={addEventListener:(k,v)=>env.listeners.set(k,v),removeEventListener:k=>env.listeners.delete(k)};render();env.effects.splice(0).forEach(fn=>fn());return render();}
check('persistence success, reload, independent profile and tabs',()=>{let api=mount();assert(api.ready);api.act({type:'login',email:'client@example.test',password:E.PASSWORD});assert(api.add('demo-0-b'));const saved=new Map(env.saved);api=mount(saved);assert.equal(api.cart.length,1);assert.equal(api.customerId,'client-demo');const next=JSON.parse(env.saved.get(E.STORAGE_KEY));next.guestFavorites=['p1'];env.listeners.get('storage')({key:E.STORAGE_KEY,newValue:JSON.stringify(next)});assert.equal(render().guestFavorites[0],'p1');});
check('quota failure leaves cart, stocks and order state unchanged',()=>{let api=mount();api.add('demo-0-b');api=render();const before=JSON.stringify({cart:api.cart,orders:api.orders,products:api.products});env.fail=true;assert('error'in api.placeOrder(input));api=render();assert.equal(JSON.stringify({cart:api.cart,orders:api.orders,products:api.products}),before);assert.equal(api.storageError,'storage');});
check('corruption remains exportable and cannot be silently overwritten',()=>{const raw='broken-json';let api=mount(new Map([[E.STORAGE_KEY,raw]]));assert.equal(api.storageError,'corrupt');assert.equal(api.exportData(),raw);assert.equal(api.add('demo-0-b'),false);assert.equal(env.saved.get(E.STORAGE_KEY),raw);assert.equal(api.reset(),null);api=render();assert.equal(api.storageError,'');assert.equal(api.cart.length,0);});
check('import validates before mutation; reset is reproducible',()=>{let api=mount();assert.equal(api.importData('{broken'),'invalidData');assert.equal(api.cart.length,0);const s=admin(cart(member()));assert.equal(api.importData(JSON.stringify(s)),null);api=render();assert.equal(api.admin,false);assert.equal(api.customerId,null);assert.equal(api.cart.length,1);assert.equal(api.reset(),null);api=render();assert.deepEqual(api.products,E.seed().products);});
// Server-render real components against isolated demo sessions in both languages.
const { renderToStaticMarkup }=require('react-dom/server');
let query=new URLSearchParams(), demoState=E.seed(), routeParams={};
const uiLoad=loader({
 'motion/react':{useReducedMotion:()=>true,AnimatePresence:({children})=>children,motion:new Proxy({},{get:(_,tag)=>({initial,animate,exit,whileInView,viewport,layout,whileHover,transition,...props})=>React.createElement(tag,props)})},
 'next/navigation':{useSearchParams:()=>query,usePathname:()=>'/produits',useRouter:()=>({push(){},replace(){}}),useParams:()=>routeParams},
 'next/image':({fill,priority,unoptimized,...props})=>React.createElement('img',props),
 'next/link':props=>React.createElement('a',props),
 '@/lib/store':{useStore:()=>({...demoState,ready:true,storageError:'',act:()=>({}),quote:input=>E.quote(demoState,input),findVariant:id=>E.find(demoState,id),placeOrder:()=>({error:'test'}),saveProduct:()=>null,exportData:()=>JSON.stringify(demoState),importData:()=>null,reset:()=>null})}
});
const {MarketProvider}=uiLoad('src/components/market-context.tsx');
const components={...uiLoad('src/components/market-catalog.tsx'),...uiLoad('src/components/market-commerce.tsx'),...uiLoad('src/components/market-account.tsx'),...uiLoad('src/components/market-info.tsx'),...uiLoad('src/components/market-admin.tsx')};
function markup(name,props={}){return renderToStaticMarkup(React.createElement(MarketProvider,null,React.createElement(components[name],props)));}
for(const lang of ['fr','ar']) {
 check(`real pages render without error (${lang})`,()=>{query=new URLSearchParams({lang});demoState=admin(member());routeParams={reference:'DEMO-EXEMPLE',slug:'livraison'};for(const name of ['HomeView','CatalogView','BrandsView','SavedView','QuizView','PurchaseView','ConfirmationView','PacksView','GiftView','AccountView','NotificationsView','GuidesView','InfoView','DemoView','AdminView']){const html=markup(name);assert(html.length>100,name);assert(!html.includes('undefined'),name);}assert(markup('DetailView',{product:demoState.products[0]}).includes('Sauvage'));});
 check(`public account and admin login render (${lang})`,()=>{demoState=E.seed();assert(markup('AccountView').includes('example.test'));assert(markup('AdminView').includes('Demo123!'));});
}
check('checkout carries promotion, gift, reception and wrap from cart URL',()=>{demoState=cart(member());query=new URLSearchParams({lang:'fr',coupon:'DEMO10',gift:'DEMO-CADEAU',delivery:'Retrait en boutique',wrap:'1',message:'Test cadeau'});const html=markup('PurchaseView',{checkout:true});assert(html.includes('value="DEMO10"'));assert(html.includes('value="DEMO-CADEAU"'));assert(html.includes('Test cadeau'));assert(html.includes('25,00'));});
check('Arabic data survives migration and is searchable',()=>{const s=E.migrate(E.seed());assert(s.products.find(p=>p.id==='p3').descriptionAr);assert(Q.catalogQuery(s,new URLSearchParams('q=فانيليا')).rows.some(r=>r.product.id==='p3'));});
check('new admin product is unique, searchable and orderable with its price',()=>{let s=admin(E.seed());const p={...structuredClone(s.products.find(p=>p.id==='demo-0')),id:'custom',slug:'maison-demo-custom',name:'Parfum Test Nouveau',variants:[{id:'custom-b',kind:'bottle',label:'50 ml',volumeMl:50,price:249.5,stock:3}]};s=apply(s,{type:'product',product:p});assert.equal(Q.catalogQuery(s,new URLSearchParams('q=Nouveau')).rows[0].product.id,'custom');s=cart(s,'custom-b');s=E.transition(s,{type:'checkout',input}).state;assert.equal(s.orders[0].items[0].unitPrice,249.5);assert.equal(E.find(s,'custom-b').variant.stock,2);rejects(s,{type:'product',product:{...p,id:'duplicate'}},'product');assert.equal(C.uniqueProductSlug('Maison Démo','Custom',s.products),'maison-demo-custom-2');});
check('archived product route and language-aware links render correctly',()=>{const {ProductRoute}=uiLoad('src/app/produits/[slug]/product-route.tsx');query=new URLSearchParams({lang:'ar'});demoState=admin(E.seed());demoState=apply(demoState,{type:'archive',id:'demo-0',archived:true});const html=renderToStaticMarkup(React.createElement(MarketProvider,null,React.createElement(ProductRoute,{slug:'maison-demo-0'})));assert(html.includes('هذه الصفحة غير متاحة'));assert(html.includes('lang=ar'));});
check('original homepage composition is restored without the replacement hero',()=>{query=new URLSearchParams({lang:'fr'});demoState=E.seed();const html=markup('HomeView');for(const name of ['nocturne-hero','nocturne-hero-image','nocturne-copy','universe-overlap','bottle-editorial','decant-editorial','decant-formats','nocturne-story'])assert(html.includes(name),name);assert(!html.includes('class="m-hero"'));assert(html.includes('L’élégance<br/>laisse une trace.'));assert(html.includes('Explorer les parfums'));assert(html.includes('Découvrir les décants'));});
check('original catalog cards and product arch reuse their original style hooks',()=>{demoState=E.seed();query=new URLSearchParams({lang:'fr'});const catalog=markup('CatalogView');for(const name of ['catalog-nocturne','catalog-compact','catalog-heading','catalog-stage','product-card','product-art','product-photo','product-meta','quick-add'])assert(catalog.includes(name),name);const detail=markup('DetailView',{product:demoState.products[0]});for(const name of ['galleryTop','orbit','galleryWord','imageStage','galleryBottom','formatGrid','scentNotes','guideCards','mobileBar'])assert(detail.includes(name),name);});
check('original purchase and admin structures retain the advanced actions',()=>{demoState=admin(cart(member()));query=new URLSearchParams({lang:'fr',coupon:'DEMO10',gift:'DEMO-CADEAU'});const cartHtml=markup('PurchaseView'),checkoutHtml=markup('PurchaseView',{checkout:true}),adminHtml=markup('AdminView');assert(cartHtml.includes('class="line"'));assert(cartHtml.includes('class="summary"'));assert(checkoutHtml.includes('class="formColumn"'));assert(checkoutHtml.includes('Paiement de démonstration'));assert(checkoutHtml.includes('value="DEMO10"'));assert(adminHtml.includes('class="sidebar"'));assert(adminHtml.includes('class="navigation"'));assert(adminHtml.includes('class="table"'));assert(adminHtml.includes('Fidélité &amp; cartes'));});
check('late route hydration keeps its own server loading markup after store restoration',()=>{
 const ReactServer=require('react-dom/server');
 for(const lang of ['fr','ar']){
  let restored=false;
  const localMocks={'@/lib/store':{useStore:()=>({ready:restored})},'./market-context':{useMarket:()=>({t:(fr,ar)=>lang==='ar'?ar:fr})}};
  const {PageReady}=loader(localMocks)('src/components/page-ready.tsx');
  const element=React.createElement(PageReady,null,React.createElement('section',{className:'nocturne-hero'},'La7ya'));
  const before=ReactServer.renderToString(element);restored=true;
  const after=ReactServer.renderToString(element);
  assert.equal(after,before);assert(after.includes('m-loading'));assert(!after.includes('nocturne-hero'));
  const {PageReady:Hydrated}=loader({...localMocks,react:{...React,useSyncExternalStore:(_subscribe,getSnapshot)=>getSnapshot()}})('src/components/page-ready.tsx');
  assert(ReactServer.renderToString(React.createElement(Hydrated,null,React.createElement('section',{className:'nocturne-hero'}))).includes('nocturne-hero'));
 }
});
check('merged theme initializes light, respects a saved theme and survives blocked storage',()=>{
 const vm=require('node:vm');
 const source=fs.readFileSync(path.join(root,'src/app/layout.tsx'),'utf8');
 const script=source.match(/const themeScript=`([^`]+)`;/)[1];
 for(const saved of [null,'light','dark','invalid']){
  const document={documentElement:{dataset:{},style:{}}};
  vm.runInNewContext(script,{document,localStorage:{getItem:()=>saved}});
  assert.equal(document.documentElement.dataset.theme,saved==='dark'?'dark':'light');
  assert.equal(document.documentElement.style.colorScheme,saved==='dark'?'dark':'light');
 }
 const document={documentElement:{dataset:{},style:{}}};
 vm.runInNewContext(script,{document,localStorage:{getItem(){throw Error('blocked');}}});
 assert.equal(document.documentElement.dataset.theme,'light');
});
check('theme toggle is translated, hydrates deterministically and works without persistence',()=>{
 const {ThemeToggle}=uiLoad('src/components/theme-toggle.tsx');
 for(const lang of ['fr','ar']){
  query=new URLSearchParams({lang});
  const html=renderToStaticMarkup(React.createElement(MarketProvider,null,React.createElement(ThemeToggle)));
  assert(html.includes(lang==='fr'?'Activer le mode sombre':'تفعيل الوضع الداكن'));
 }
 const originalDocument=globalThis.document,originalStorage=globalThis.localStorage;
 try{
  globalThis.document={documentElement:{dataset:{theme:'light'},style:{}}};
  globalThis.localStorage={setItem(){throw Error('blocked');}};
  const {ThemeToggle:Live}=loader({react:{...React,useSyncExternalStore:(_s,get)=>get()},'./market-context':{useMarket:()=>({t:(fr)=>fr})}})('src/components/theme-toggle.tsx');
  Live().props.onClick();assert.equal(document.documentElement.dataset.theme,'dark');
  Live().props.onClick();assert.equal(document.documentElement.dataset.theme,'light');
 }finally{globalThis.document=originalDocument;globalThis.localStorage=originalStorage;}
});
check('merged storefront shell and incoming editorial selections render in both languages',()=>{
 const {MarketShell}=uiLoad('src/components/market-shell.tsx');
 for(const lang of ['fr','ar']){
  query=new URLSearchParams({lang});demoState=E.seed();
  const html=renderToStaticMarkup(React.createElement(MarketProvider,null,React.createElement(MarketShell,null,React.createElement('section',null,'Catalogue'))));
  assert(html.includes('storefront-shell'));assert(html.includes('theme-toggle'));assert(html.includes('Catalogue'));
  const home=markup('HomeView');assert(home.includes('pack-showcase'));assert(home.includes('/images/full-bottles-studio-web-v3.png'));assert(home.includes('type=decant'));
 }
});
check('header hydration keeps the server cart count when browser data has already restored',()=>{
 const {MarketShell}=uiLoad('src/components/market-shell.tsx');
 for(const lang of ['fr','ar']){
  query=new URLSearchParams({lang});demoState=E.seed();
  const render=()=>renderToStaticMarkup(React.createElement(MarketProvider,null,React.createElement(MarketShell,null,React.createElement('section',null,'Catalogue'))));
  const empty=render();demoState={...demoState,cart:[{variantId:'demo-0-b',quantity:3}]};
  const restored=render();assert.equal(restored,empty);assert(restored.includes(lang==='fr'?'Panier, 0':'السلة, 0'));
 }
});
check('header menu and search animations retain unique identities in every open state',()=>{
 let states=[],cursor=0;
 const Presence=({children})=>children;
 const {MarketShell}=loader({
  react:{...React,useState:()=>[states[cursor++],()=>{}],useRef:value=>({current:value}),useEffect:()=>{},useSyncExternalStore:()=>false},
  'motion/react':{useReducedMotion:()=>true,AnimatePresence:Presence,motion:new Proxy({},{get:(_,tag)=>tag})},
  'next/navigation':{usePathname:()=>'/produits'},
  'next/image':()=>null,
  './market-context':{useMarket:()=>({lang:'fr',t:fr=>fr}),LanguageSwitch:()=>null,MLink:()=>null},
  '@/lib/store':{useStore:()=>({cart:[],storageError:''})}
 })('src/components/market-shell.tsx');
 for(const [menu,search,expected] of [[false,false,0],[true,false,2],[false,true,1],[true,true,3]]){
  states=[menu,search,false];cursor=0;
  const shell=MarketShell({children:null});
  const header=React.Children.toArray(shell.props.children).find(node=>React.isValidElement(node)&&node.type.name==='HeritageHeader');
  assert(header);
  const tree=header.type();
  const presence=React.Children.toArray(tree.props.children).find(node=>node.type===Presence);
  const nodes=presence.props.children.filter(React.isValidElement);
  assert.equal(nodes.length,expected);
  const keys=nodes.map(node=>node.key);
  assert(keys.every(key=>typeof key==='string'&&key.length>0),'Animated siblings need explicit stable keys');
  assert.equal(new Set(keys).size,keys.length,'Menu backdrop, menu panel and search cannot share a key');
 }
});
console.log(`${count} vérifications réussies.`);
