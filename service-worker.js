if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let r=Promise.resolve();return i[e]||(r=new Promise((async r=>{if("document"in self){const i=document.createElement("script");i.src=e,document.head.appendChild(i),i.onload=r}else importScripts(e),r()}))),r.then((()=>{if(!i[e])throw new Error(`Module ${e} didn’t register its module`);return i[e]}))},r=(r,i)=>{Promise.all(r.map(e)).then((e=>i(1===e.length?e[0]:e)))},i={require:Promise.resolve(r)};self.define=(r,l,n)=>{i[r]||(i[r]=Promise.resolve().then((()=>{let i={};const s={uri:location.origin+r.slice(1)};return Promise.all(l.map((r=>{switch(r){case"exports":return i;case"module":return s;default:return e(r)}}))).then((e=>{const r=n(...e);return i.default||(i.default=r),i}))})))}}define("./service-worker.js",["./workbox-7c877640"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"125.e0dbd8013c11866ef658.js",revision:null},{url:"125.e0dbd8013c11866ef658.js.LICENSE.txt",revision:"c22264673466b8581ef8a74a9d4c540b"},{url:"798.d94eae10983eb28fae01.js",revision:null},{url:"index.html",revision:"1613421989609"},{url:"lib/app-border.d3b862f2fdbcfde502946e19d69826bf.svg",revision:null},{url:"lib/barlow-latin-400.d216a0a23d2052c84e6fc4f074250c50.woff2",revision:null},{url:"lib/button-border-active.acf6a9a459667d52875614226c892f4d.svg",revision:null},{url:"lib/button-border-hover.acfabff5eed4b2a47e385a86c207fd2b.svg",revision:null},{url:"lib/button-border.cc35cb241b509e3e76df51781ebcf9b8.svg",revision:null},{url:"lib/crop-example.e9de0e49471f69deefc6b011e4a57fa1.jpg",revision:null},{url:"lib/cyber.traineddata.gz",revision:"e75dea18fd150ed9d82c035105bbdd21"},{url:"lib/example.450cf14c6c6d4f14fede9bd9f9abf560.jpg",revision:null},{url:"lib/tesseract-core.wasm.e4db7f953ac7bcf9f67bd39031e42241.js",revision:null},{url:"lib/worker.min.6ae4421cc24575c3996815e8a7e47a34.js",revision:null},{url:"lib/worker.min.6ae4421cc24575c3996815e8a7e47a34.js.LICENSE.txt",revision:"4f1f1bdb0417b72686c9419160682e9d"},{url:"main.78495fb25fbf01f5bf1c.js",revision:null},{url:"main.78495fb25fbf01f5bf1c.js.LICENSE.txt",revision:"b8c0ba92a91271ef423bb542e8d829c2"}],{})}));
//# sourceMappingURL=service-worker.js.map
