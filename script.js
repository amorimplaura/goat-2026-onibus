const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const dados=typeof PARTICIPANTES==="undefined"?[]:PARTICIPANTES;
const busca=document.querySelector("#pesquisa"),resultados=document.querySelector("#resultados"),cards=document.querySelector("#cards"),lista=document.querySelector("#lista-onibus");
const bus=n=>"ÔNIBUS "+String(n).padStart(2,"0");
const locais={
  1:{rua:"Rua Jornalista Milton Amado",url:"https://www.google.com/maps/search/?api=1&query=Rua%20Jornalista%20Milton%20Amado%2C%20S%C3%A3o%20Bento%2C%20Belo%20Horizonte%2C%20MG"},
  2:{rua:"Rua José Motta Magalhães",url:"https://www.google.com/maps/search/?api=1&query=Rua%20Jos%C3%A9%20Motta%20Magalh%C3%A3es%2C%20S%C3%A3o%20Bento%2C%20Belo%20Horizonte%2C%20MG"}
};
const local=n=>n<=6?locais[1]:locais[2];
function pesquisar(){
 const q=norm(busca.value);resultados.replaceChildren();
 if(!q)return;
 const encontrados=dados.filter(p=>norm(p.nome).includes(q)).slice(0,30);
 if(!encontrados.length){resultados.innerHTML='<p class="empty">Não encontramos esse nome. Tente apenas o sobrenome.</p>';return}
 if(q.length>=3&&encontrados.length===1){mostrarResultado(encontrados[0]);return}
 const titulo=document.createElement("p");titulo.className="search-results-title";titulo.textContent=encontrados.length===1?"Encontramos esta criança:":"Escolha a criança na lista abaixo:";resultados.appendChild(titulo);
 for(const p of encontrados){
  const b=document.createElement("button");b.type="button";b.className="search-person";
  b.innerHTML='<span class="search-person-name">'+esc(p.nome)+'</span><span class="search-person-bus">'+bus(p.onibus)+' <span aria-hidden="true">›</span></span>';
  b.setAttribute("aria-label","Mostrar ônibus e colegas de "+p.nome);
  b.addEventListener("click",()=>{busca.blur();mostrarResultado(p)});
  resultados.appendChild(b);
 }
 if(encontrados.length===30){const t=document.createElement("p");t.className="consult-tip";t.textContent="Muitos resultados. Digite mais letras.";resultados.appendChild(t)}
}
function mostrarResultado(crianca){
 const n=Number(crianca.onibus),l=local(n),pessoas=dados.filter(p=>Number(p.onibus)===n);
 resultados.replaceChildren();
 const detalhe=document.createElement("section");detalhe.className="inline-detail";detalhe.setAttribute("aria-label","Resultado da consulta");
 detalhe.innerHTML='<div class="inline-detail-head"><small>RESULTADO DA CONSULTA</small><button type="button" class="change-search">ALTERAR NOME ×</button></div>'+
 '<h3 class="child-name">'+esc(crianca.nome)+'</h3>'+
 '<div class="inline-bus"><small>ÔNIBUS DA CRIANÇA</small><strong>'+bus(n)+'</strong></div>'+
 '<div class="inline-colleagues"><h4>Quem vai no mesmo ônibus?</h4><p>Confira abaixo a lista completa de crianças do '+bus(n)+'.</p>'+
 '<div class="passenger-list">'+pessoas.map(p=>'<div class="passenger'+(norm(p.nome)===norm(crianca.nome)?' passenger-highlight':'')+'"><div><strong>'+esc(p.nome)+'</strong><small>Turma '+esc(p.perse)+'</small></div><span>'+esc(p.observacao||"Ida e volta")+'</span></div>').join('')+'</div></div>'+
 '<div class="inline-location"><small>LOCAL DE SAÍDA · SEXTA 27/11 ÀS 17h30</small><strong>'+esc(l.rua)+'</strong><span>Bairro São Bento · Belo Horizonte/MG</span><a href="'+l.url+'" target="_blank" rel="noopener noreferrer">📍 ABRIR NO GOOGLE MAPS ↗</a></div>'+
 detalhe.insertAdjacentHTML("beforeend",'<button type="button" class="search-again">PESQUISAR OUTRA CRIANÇA ↗</button>');
 resultados.appendChild(detalhe);
 const reiniciar=()=>{busca.value="";resultados.replaceChildren();busca.focus()};
 detalhe.querySelector(".change-search").addEventListener("click",reiniciar);
 detalhe.querySelector(".search-again").addEventListener("click",reiniciar);
}
function abrir(n,destaque=""){
  cards.querySelectorAll("[data-onibus]").forEach(b=>b.setAttribute("aria-pressed",String(Number(b.dataset.onibus)===n)));
  const pessoas=dados.filter(p=>Number(p.onibus)===n),l=local(n);
  lista.hidden=false;
  lista.innerHTML='<div class="lista-head"><div><small>LISTA COMPLETA</small><h3>'+bus(n)+'</h3></div><button type="button" class="close-list">Fechar ×</button></div>'+
    '<div class="list-location"><div><small>SAÍDA · 27/11 ÀS 17h30</small><strong>'+esc(l.rua)+'</strong><span>São Bento · Belo Horizonte/MG</span></div><a href="'+l.url+'" target="_blank" rel="noopener noreferrer">ABRIR MAPA ↗</a></div>'+
    (destaque?'<p class="found-note">Nome pesquisado destacado em amarelo na lista.</p>':'')+
    '<div class="passenger-list">'+pessoas.map(p=>'<div class="passenger'+(destaque&&norm(p.nome)===norm(destaque)?' passenger-highlight':'')+'"><div><strong>'+esc(p.nome)+'</strong><small>Turma '+esc(p.perse)+'</small></div><span>'+esc(p.observacao||"Ida e volta")+'</span></div>').join('')+'</div>';
  lista.querySelector(".close-list").addEventListener("click",()=>{lista.hidden=true;cards.querySelectorAll("[data-onibus]").forEach(b=>b.setAttribute("aria-pressed","false"))});
  lista.scrollIntoView({behavior:"auto",block:"start"});
}
busca.addEventListener("input",pesquisar);
cards.querySelectorAll("[data-onibus]").forEach(b=>b.addEventListener("click",()=>abrir(Number(b.dataset.onibus))));
