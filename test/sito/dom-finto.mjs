// Un DOM minimo per provare le interfacce del Magazzino in node, senza browser.
class Nodo {
    constructor(tag, doc) {
        this.tagName = tag.toUpperCase(); this.ownerDocument = doc;
        this.children = []; this.attributi = {}; this.ascoltatori = {}; this.dataset = {}; this.style = { setProperty() {} };
        this._testo = ''; this.innerHTML = ''; this.parentNode = null; this.className = '';
        const n = this;
        this.classList = {
            add: (...c) => { const s = new Set(n.className.split(/\s+/).filter(Boolean)); c.forEach(x => s.add(x)); n.className = [...s].join(' '); },
            remove: (...c) => { n.className = n.className.split(/\s+/).filter(x => x && !c.includes(x)).join(' '); },
            toggle: (c, si) => { const ha = n.classList.contains(c); const vuole = si === undefined ? !ha : si; vuole ? n.classList.add(c) : n.classList.remove(c); return vuole; },
            contains: c => n.className.split(/\s+/).includes(c)
        };
    }
    append(...figli) { for (const f of figli) { const x = typeof f === 'string' ? Object.assign(new Nodo('#text', this.ownerDocument), { _testo: f }) : f; x.parentNode = this; this.children.push(x); } }
    replaceChildren(...figli) { this.children = []; this.append(...figli); }
    setAttribute(k, v) { this.attributi[k] = String(v); }
    getAttribute(k) { return k in this.attributi ? this.attributi[k] : null; }
    removeAttribute(k) { delete this.attributi[k]; }
    addEventListener(t, fn) { (this.ascoltatori[t] ||= []).push(fn); }
    dispatchEvent(ev) { ev.target ??= this; for (const fn of this.ascoltatori[ev.type] || []) fn(ev); if (ev.bubbles !== false && this.parentNode) this.parentNode.dispatchEvent(ev); return true; }
    click() { this.dispatchEvent({ type: 'click', target: this, preventDefault() {} }); }
    focus() { this.ownerDocument.activeElement = this; }
    get textContent() { return this._testo + this.children.map(c => c.textContent).join(''); }
    set textContent(v) { this.children = []; this._testo = String(v); }
    tutti() { return this.children.flatMap(c => [c, ...c.tutti()]); }
    querySelectorAll(sel) {
        return this.tutti().filter(n => sel.split(',').some(s => { s = s.trim(); return s.startsWith('.') ? n.classList.contains(s.slice(1)) : n.tagName === s.toUpperCase(); }));
    }
    querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
}
export function domFinto() {
    const doc = { activeElement: null, createElement: tag => new Nodo(tag, doc) };
    doc.body = new Nodo('body', doc);
    return doc;
}
