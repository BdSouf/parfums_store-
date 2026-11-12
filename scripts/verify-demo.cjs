/* Tests du moteur local, sans écrire dans le navigateur ni installer de dépendance. */
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const assert = require("node:assert/strict");
const ts = require("typescript");
const React = require("react");

function load(relativePath, mocks = {}) {
  const file = path.resolve(__dirname, "..", relativePath);
  const instance = new Module(file, module);
  instance.filename = file;
  instance.paths = module.paths;
  const original = instance.require.bind(instance);
  instance.require = name => Object.hasOwn(mocks, name) ? mocks[name] : original(name);
  instance._compile(ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2020 } }).outputText, file);
  return instance.exports;
}
let environment;
const hooks = {
  ...React,
  useState(initial) {
    const owner = environment, index = owner.cursor++;
    if (!(index in owner.hooks)) owner.hooks[index] = typeof initial === "function" ? initial() : initial;
    return [owner.hooks[index], value => { owner.hooks[index] = typeof value === "function" ? value(owner.hooks[index]) : value; }];
  },
  useRef(initial) { const index = environment.cursor++; if (!(index in environment.hooks)) environment.hooks[index] = { current: initial }; return environment.hooks[index]; },
  useEffect(effect) { const index = environment.cursor++; if (!(index in environment.hooks)) { environment.hooks[index] = true; environment.effects.push(effect); } },
};
const data = load("src/lib/data.ts");
const catalog = load("src/lib/catalog.ts", { "./data": data });
const { StoreProvider } = load("src/lib/store.tsx", { react: hooks, "./data": data, "./catalog": catalog });
function render() { environment.cursor = 0; return StoreProvider({ children: null }).props.value; }
function mount(saved = new Map()) {
  environment = { hooks: [], effects: [], cursor: 0, saved, failWrite: false, listeners: new Map() };
  globalThis.localStorage = { getItem: key => environment.saved.get(key) ?? null, setItem(key, value) { if (environment.failWrite) throw new Error("QuotaExceededError"); environment.saved.set(key, value); } };
  globalThis.window = { addEventListener: (name, listener) => environment.listeners.set(name, listener), removeEventListener: name => environment.listeners.delete(name) };
  render();
  for (const effect of environment.effects.splice(0)) effect();
  return render();
}
const product = () => ({ ...structuredClone(data.products[0]), id: "custom-oud", slug: "maison-oud-sultan", name: "Oud Sultan", brand: "Maison Demo", category: data.categories[3], variants: [{ id: "custom-b100", kind: "bottle", label: "100 ml", price: 499.5, stock: 4 }, { id: "custom-d5", kind: "decant", label: "5 ml", price: 49, stock: 7 }] });
const input = { name: "Client Test", phone: "0612345678", city: "Rabat", address: "Adresse de demonstration", delivery: "Livraison à domicile" };
let passed = 0;
function check(label, action) { action(); passed++; console.log(`PASS ${label}`); }

check("catalogue initial valide", () => data.products.forEach(item => assert.equal(catalog.productError(item), null)));
check("validation des univers, prix, stocks, images et volumes", () => {
  for (const change of [p => p.category = "invalid", p => p.image = "javascript:alert(1)", p => p.variants[0].price = -1, p => p.variants[0].price = 1.234, p => p.variants[0].stock = 1.5, p => p.variants[1].label = "7 ml", p => p.variants.push({ ...p.variants[1], id: "other" })]) { const p = product(); change(p); assert(catalog.productError(p)); }
});
check("adresses de fiches uniques", () => assert.equal(catalog.uniqueProductSlug("Maison", "Oud Sultan", [{ slug: "maison-oud-sultan" }]), "maison-oud-sultan-2"));
let api = mount();
check("chargement et ajout du produit", () => { assert(api.ready); assert.equal(api.saveProduct(product()), null); api = render(); assert.equal(api.products.length, data.products.length + 1); assert.equal(api.findVariant("custom-b100").variant.price, 499.5); });
check("persistance apres rechargement", () => { api = mount(new Map(environment.saved)); assert(api.products.some(p => p.slug === "maison-oud-sultan")); });
check("modification du produit et des prix", () => { const p = structuredClone(api.products[0]); p.name = "Oud Sultan Edition"; p.variants[0].price = 599.75; assert.equal(api.saveProduct(p), null); api = render(); assert.equal(api.findVariant("custom-b100").variant.price, 599.75); });
check("collision de slug refusee", () => { const p = product(); p.id = "other-product"; assert(api.saveProduct(p)); });
check("prix avec centimes affiche sans arrondi abusif", () => assert.notEqual(data.money(599.75), data.money(600)));
check("panier et limites de stock", () => { assert(api.add("custom-b100", 2)); assert.equal(api.add("custom-b100", 3), false); assert.equal(api.add("custom-b100", -1), false); assert.equal(api.setQty("custom-b100", 5), false); api = render(); assert.equal(api.cart[0].quantity, 2); });
check("archivage et vente bloquee", () => { assert.equal(api.setArchived("custom-oud", true), null); api = render(); assert(api.products.find(p => p.id === "custom-oud").archived); assert.equal(api.add("custom-d5"), false); assert("error" in api.placeOrder(input)); });
check("remise en vente", () => { assert.equal(api.setArchived("custom-oud", false), null); api = render(); assert(api.add("custom-d5", 1)); });
let reference;
check("commande atomique, stock, total et snapshots", () => { const result = api.placeOrder(input); assert("reference" in result); reference = result.reference; api = render(); assert.equal(api.cart.length, 0); assert.equal(api.orders[0].total, 2 * 599.75 + 49); assert.equal(api.findVariant("custom-b100").variant.stock, 2); assert.equal(api.orders[0].items[0].productName, "Oud Sultan Edition"); assert.equal(api.orders[0].items[0].unitPrice, 599.75); });
check("panier vide non commande", () => assert("error" in api.placeOrder(input)));
check("suppression de format utilise refusee", () => { const p = structuredClone(api.products.find(p => p.id === "custom-oud")); p.variants.shift(); assert(api.saveProduct(p)); });
check("changement de volume reserve refuse", () => { const p = structuredClone(api.products.find(p => p.id === "custom-oud")); p.variants[0].label = "90 ml"; assert(api.saveProduct(p)); });
check("historique conserve apres modification", () => { const p = structuredClone(api.products.find(p => p.id === "custom-oud")); p.name = "Nouveau nom"; p.variants[0].price = 999; assert.equal(api.saveProduct(p), null); api = render(); assert.equal(api.orders[0].items[0].productName, "Oud Sultan Edition"); assert.equal(api.orders[0].total, 1248.5); });
check("annulation restitue le stock une seule fois", () => { assert.equal(api.setStatus(reference, "CANCELLED"), null); api = render(); assert.equal(api.findVariant("custom-b100").variant.stock, 4); assert.equal(api.setStatus(reference, "CANCELLED"), null); assert.equal(render().findVariant("custom-b100").variant.stock, 4); });
check("reactivation reserve de nouveau", () => { assert.equal(api.setStatus(reference, "CONFIRMED"), null); api = render(); assert.equal(api.findVariant("custom-b100").variant.stock, 2); });
check("reactivation impossible sans stock", () => { assert.equal(api.setStatus(reference, "CANCELLED"), null); api = render(); const p = structuredClone(api.products.find(p => p.id === "custom-oud")); p.variants[0].stock = 0; assert.equal(api.saveProduct(p), null); api = render(); assert(api.setStatus(reference, "PENDING")); api = render(); assert.equal(api.orders[0].status, "CANCELLED"); });
check("statut invalide refuse", () => assert(api.setStatus(reference, "UNKNOWN")));
check("echec de sauvegarde sans faux succes", () => { environment.failWrite = true; const p = structuredClone(api.products[0]); p.name = "Unsaved"; assert(api.saveProduct(p)); api = render(); assert.notEqual(api.products[0].name, "Unsaved"); assert(api.storageError); environment.failWrite = false; });
check("quota a la commande preserve panier et stock", () => { assert(api.add("custom-d5")); api = render(); const stock = api.findVariant("custom-d5").variant.stock, count = api.orders.length; environment.failWrite = true; assert("error" in api.placeOrder(input)); api = render(); assert.equal(api.cart.length, 1); assert.equal(api.orders.length, count); assert.equal(api.findVariant("custom-d5").variant.stock, stock); environment.failWrite = false; });
check("synchronisation entre onglets", () => { const next = JSON.parse(environment.saved.get("la7ya-state-v2")); next.products[0].name = "Other tab"; environment.listeners.get("storage")({ key: "la7ya-state-v2", newValue: JSON.stringify(next) }); api = render(); assert.equal(api.products[0].name, "Other tab"); });
check("migration anciens panier et commandes", () => { const old = { ...input, reference: "DEMO-OLD", total: 1690, status: "PENDING", createdAt: "2026-11-11T10:00:00Z", items: [{ variantId: "p1-100", quantity: 1 }] }; api = mount(new Map([["la7ya-cart", JSON.stringify(old.items)], ["la7ya-orders", JSON.stringify([old])]])); assert.equal(api.cart.length, 1); assert.equal(api.orders.length, 1); assert.equal(api.orders[0].items[0].productName, data.products[0].name); assert.equal(api.setStatus("DEMO-OLD", "CANCELLED"), null); assert.equal(render().findVariant("p1-100").variant.stock, 5); });
check("donnees locales corrompues signalees sans suppression", () => { const saved = new Map([["la7ya-state-v2", "broken-json"]]); api = mount(saved); assert(api.ready); assert(api.storageError); assert.equal(saved.get("la7ya-state-v2"), "broken-json"); });
check("styles sans BOM", () => { for (const file of ["src/app/admin/admin.module.css", "src/app/admin/product-editor.module.css", "src/app/produits/[slug]/product-detail.module.css", "src/components/purchase-shell.module.css"]) assert.notEqual(fs.readFileSync(path.resolve(__dirname, "..", file), "utf8").charCodeAt(0), 0xFEFF); });
function nodes(node, result = []) {
  if (Array.isArray(node)) node.forEach(child => nodes(child, result));
  else if (React.isValidElement(node)) { result.push(node); nodes(node.props.children, result); }
  return result;
}
const css = { __esModule: true, default: new Proxy({}, { get: (_, name) => name }) };
api = mount();
const providerEnvironment = environment;
const editorEnvironment = { ...environment, hooks: [], effects: [], cursor: 0 };
const { ProductEditor } = load("src/app/admin/product-editor.tsx", { react: hooks, "next/image": () => null, "@/lib/data": data, "@/lib/catalog": catalog, "@/lib/store": { useStore: () => api }, "./product-editor.module.css": css });
let savedName;
function editorTree() { environment = editorEnvironment; environment.cursor = 0; return nodes(ProductEditor({ product: null, onClose() {}, onSaved: name => { savedName = name; } })); }
function changeField(label, value) {
  const field = editorTree().find(node => node.type === "label" && node.props.children[0] === label);
  assert(field, `Champ absent : ${label}`);
  nodes(field).find(node => ["input", "select", "textarea"].includes(node.type)).props.onChange({ target: { value } });
}
check("formulaire administrateur cree un parfum commandable", () => {
  changeField("Nom du parfum", "Oud Test"); changeField("Marque", "Maison Demo"); changeField("Univers", data.categories[3]);
  changeField("Description", "Une composition de demonstration au oud et a la vanille.");
  for (let index = 0; index < 3; index++) {
    const field = editorTree().filter(node => node.type === "label" && node.props.children[0] === "Note olfactive ")[index];
    nodes(field).find(node => node.type === "input").props.onChange({ target: { value: ["Oud", "Ambre", "Vanille"][index] } });
  }
  changeField("Image du catalogue", data.products[0].image); changeField("Prix (MAD)", "249.50"); changeField("Stock", "3");
  editorTree().find(node => node.type === "form").props.onSubmit({ preventDefault() {} });
  assert.equal(savedName, "Oud Test");
  environment = providerEnvironment; api = render();
  assert.equal(api.products[0].name, "Oud Test"); assert.equal(api.products[0].variants[0].price, 249.5);
});
const Detail = () => null;
const { ProductRoute } = load("src/app/produits/[slug]/product-route.tsx", { "next/link": () => null, "@/lib/store": { useStore: () => api }, "./product-detail": { ProductDetail: Detail }, "./product-detail.module.css": css });
const custom = api.products[0];
check("fiche du produit ajoute via admin", () => { const element = ProductRoute({ slug: custom.slug }); assert.equal(element.type, Detail); assert.equal(element.props.product.id, custom.id); });
check("fiche archivee inaccessible a la vente", () => { assert.equal(api.setArchived(custom.id, true), null); api = render(); assert.notEqual(ProductRoute({ slug: custom.slug }).type, Detail); assert.equal(api.setArchived(custom.id, false), null); api = render(); });
const Card = () => null;
let params = new URLSearchParams();
const ProductsPage = load("src/app/produits/page.tsx", { react: { ...hooks, useMemo: callback => callback() }, "next/navigation": { useSearchParams: () => params }, "motion/react": { motion: new Proxy({}, { get: (_, key) => key }), AnimatePresence: () => null, useReducedMotion: () => true }, "@/lib/store": { useStore: () => api }, "@/lib/data": data, "@/components/product-card": { ProductCard: Card } }).default;
function browse(search = "") { params = new URLSearchParams(search); environment = { ...providerEnvironment, hooks: [], effects: [], cursor: 0 }; const wrapper = ProductsPage(); return nodes(wrapper.type(wrapper.props)); }
check("nouveau produit visible et filtrable en boutique", () => { let tree = browse(); assert.equal(tree.find(node => node.type === Card).props.p.id, custom.id); tree = browse(`q=Oud%20Test&category=${encodeURIComponent(data.categories[3])}`); assert.equal(tree.filter(node => node.type === Card).length, 1); assert.equal(tree.find(node => node.type === Card).props.p.id, custom.id); });
check("recherche et changement de lien reinitialisent les filtres", () => { assert.equal(browse("q=aucun-produit").filter(node => node.type === Card).length, 0); assert(browse().filter(node => node.type === Card).length > 0); });
environment = providerEnvironment; api = render();
check("produit ajoute peut etre commande avec son prix", () => { assert(api.add(custom.variants[0].id, 1)); const result = api.placeOrder(input); assert("reference" in result); api = render(); assert.equal(api.orders[0].items[0].productName, "Oud Test"); assert.equal(api.orders[0].total, 249.5); });
console.log(`${passed} verifications reussies.`);
