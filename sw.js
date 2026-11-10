/* GOAT 2026 - manter o endereço do site e evitar HTML antigo no cache. */
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",evento=>evento.waitUntil(self.clients.claim()));
self.addEventListener("fetch",evento=>{
  if(evento.request.mode!=="navigate")return;
  const escopo=new URL(self.registration.scope);
  const url=new URL(evento.request.url);
  if(url.origin!==escopo.origin||!url.pathname.startsWith(escopo.pathname))return;
  // A URL visitada continua igual; somente a requisição de rede recebe um identificador novo.
  url.searchParams.set("_goat_atualizacao",String(Date.now()));
  evento.respondWith(fetch(url.toString(),{cache:"no-store",credentials:"same-origin"}));
});
