/* Compatibilidade: remove a antiga tela de senha mesmo quando o Safari reutiliza um HTML em cache. */
(function(){
  const telaAntiga=document.getElementById("goat-entrada");
  if(telaAntiga)telaAntiga.remove();
})();
const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let dados=typeof PARTICIPANTES==="undefined"?[]:PARTICIPANTES;
const busca=document.querySelector("#pesquisa"),resultados=document.querySelector("#resultados"),cards=document.querySelector("#cards"),lista=document.querySelector("#lista-onibus");
const bus=n=>"ÔNIBUS "+String(n).padStart(2,"0");
const locais={
  1:{rua:"Rua Jornalista Milton Amado",url:"https://www.google.com/maps/search/?api=1&query=Rua%20Jornalista%20Milton%20Amado%2C%20S%C3%A3o%20Bento%2C%20Belo%20Horizonte%2C%20MG"},
  2:{rua:"Rua José Mota Magalhães",url:"https://www.google.com/maps/search/?api=1&query=Rua%20Jos%C3%A9%20Mota%20Magalh%C3%A3es%2C%20S%C3%A3o%20Bento%2C%20Belo%20Horizonte%2C%20MG"}
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
 '<div class="inline-location"><small>LOCAL DE SAÍDA · SEXTA 27/11 ÀS 17h30</small><strong>'+esc(l.rua)+'</strong><span>Bairro São Bento · Belo Horizonte/MG</span><a href="'+l.url+'" target="_blank" rel="noopener noreferrer">📍 ABRIR NO GOOGLE MAPS ↗</a></div>'+
 '<div class="inline-colleagues"><h4>Quem vai no mesmo ônibus?</h4><p>Confira abaixo a lista completa de crianças do '+bus(n)+'.</p>'+
 '<div class="passenger-list">'+pessoas.map(p=>'<div class="passenger'+(norm(p.nome)===norm(crianca.nome)?' passenger-highlight':'')+'"><div><strong>'+esc(p.nome)+'</strong><small>Turma '+esc(p.perse)+'</small></div><span>'+esc(p.observacao||"Ida e volta")+'</span></div>').join('')+'</div></div>';
 detalhe.insertAdjacentHTML("beforeend",'<button type="button" class="request-from-result">SOLICITAR ALTERAÇÃO DE ÔNIBUS ↗</button>');
 detalhe.querySelector('.request-from-result').addEventListener('click',()=>{document.getElementById('req-child').value=crianca.nome;document.getElementById('req-child').dispatchEvent(new Event('input'));document.getElementById('solicitacoes').scrollIntoView({behavior:'smooth'});});
 detalhe.insertAdjacentHTML("beforeend",'<button type="button" class="search-again">PESQUISAR OUTRA CRIANÇA ↗</button>');
 resultados.appendChild(detalhe);
 const reiniciar=()=>{busca.value="";resultados.replaceChildren();busca.focus()};
 detalhe.querySelector(".change-search").addEventListener("click",reiniciar);
 detalhe.querySelector(".search-again").addEventListener("click",reiniciar);
}
function abrir(n,destaque="",rolar=true){
  cards.querySelectorAll("[data-onibus]").forEach(b=>b.setAttribute("aria-pressed",String(Number(b.dataset.onibus)===n)));
  const pessoas=dados.filter(p=>Number(p.onibus)===n),l=local(n);
  lista.hidden=false;
  lista.innerHTML='<div class="lista-head"><div><small>LISTA COMPLETA</small><h3>'+bus(n)+'</h3></div><button type="button" class="close-list">Fechar ×</button></div>'+
    '<div class="list-location"><div><small>SAÍDA · 27/11 ÀS 17h30</small><strong>'+esc(l.rua)+'</strong><span>São Bento · Belo Horizonte/MG</span></div><a href="'+l.url+'" target="_blank" rel="noopener noreferrer">ABRIR MAPA ↗</a></div>'+
    (destaque?'<p class="found-note">Nome pesquisado destacado em amarelo na lista.</p>':'')+
    '<div class="passenger-list">'+pessoas.map(p=>'<div class="passenger'+(destaque&&norm(p.nome)===norm(destaque)?' passenger-highlight':'')+'"><div><strong>'+esc(p.nome)+'</strong><small>Turma '+esc(p.perse)+'</small></div><span>'+esc(p.observacao||"Ida e volta")+'</span></div>').join('')+'</div>';
  lista.querySelector(".close-list").addEventListener("click",()=>{lista.hidden=true;cards.querySelectorAll("[data-onibus]").forEach(b=>b.setAttribute("aria-pressed","false"))});
  if(rolar)lista.scrollIntoView({behavior:"auto",block:"start"});
}
busca.addEventListener("input",pesquisar);
cards.querySelectorAll("[data-onibus]").forEach(b=>b.addEventListener("click",()=>abrir(Number(b.dataset.onibus))));

/* Atualizações contínuas, sem mudar o link enviado aos responsáveis.
 * A consulta é atualizada quando a pessoa retorna à aba ou clica no botão.
 * fetch com URL única e cache no-store evita usar o arquivo de passageiros salvo no navegador. */
(function(){
  let ultimaVerificacao=Date.now();
  let verificando=false;
  const bloco=document.createElement("div");
  bloco.className="goat-atualizacao";
  bloco.style.cssText="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin:14px 0 4px;font-size:13px;color:#4a5c78";
  const aviso=document.createElement("span");
  aviso.setAttribute("role","status");
  aviso.textContent="As listas podem mudar. Ao voltar à página, verificamos as atualizações.";
  const botao=document.createElement("button");
  botao.type="button";
  botao.textContent="↻ ATUALIZAR LISTAS";
  botao.style.cssText="border:1px solid #2857a4;border-radius:8px;background:#fff;color:#18478e;font-size:12px;font-weight:800;padding:11px 14px;cursor:pointer";
  bloco.append(aviso,botao);
  const dica=document.querySelector("#consulta .consult-tip");
  if(dica)dica.after(bloco);else document.querySelector("#consulta")?.append(bloco);

  async function conferirListas(){
    if(verificando)return;
    verificando=true;
    botao.disabled=true;
    aviso.style.color="#4a5c78";
    aviso.textContent="Conferindo a versão mais recente...";
    try{
      const resposta=await fetch("dados.js?atualizacao="+Date.now(),{cache:"no-store"});
      if(!resposta.ok)throw new Error("HTTP "+resposta.status);
      const texto=await resposta.text();
      const inicio=texto.indexOf("[");
      const fim=texto.lastIndexOf("]");
      if(inicio<0||fim<inicio)throw new Error("Arquivo de listas inválido");
      const novos=JSON.parse(texto.slice(inicio,fim+1));
      if(!Array.isArray(novos)||!novos.length||novos.some(p=>!p.nome||!Number.isInteger(Number(p.onibus))))throw new Error("Dados incompletos");
      const mudou=JSON.stringify(novos)!==JSON.stringify(dados);
      if(mudou){
        const selecionado=resultados.querySelector(".child-name")?.textContent;
        const aberto=cards.querySelector('[aria-pressed="true"]');
        const onibusAberto=aberto&&!lista.hidden?Number(aberto.dataset.onibus):null;
        dados=novos;
        if(selecionado){
          const pessoa=dados.find(p=>norm(p.nome)===norm(selecionado));
          if(pessoa)mostrarResultado(pessoa);else pesquisar();
        }else if(busca.value.trim())pesquisar();
        if(onibusAberto)abrir(onibusAberto,"",false);
      }
      ultimaVerificacao=Date.now();
      aviso.style.color="#24613c";
      aviso.textContent=mudou?"Listas atualizadas agora.":"Listas verificadas agora.";
    }catch(erro){
      aviso.style.color="#9b2929";
      aviso.textContent="Não foi possível confirmar as listas mais recentes. Tente atualizar novamente.";
    }finally{
      botao.disabled=false;
      verificando=false;
    }
  }
  botao.addEventListener("click",()=>{void conferirListas()});
  const aoRetornar=()=>{if(Date.now()-ultimaVerificacao>10000)void conferirListas()};
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)aoRetornar()});
  window.addEventListener("focus",aoRetornar);
  /* Atualização periódica enquanto a página está aberta e visível. */
  window.setInterval(()=>{if(!document.hidden&&Date.now()-ultimaVerificacao>=60000)void conferirListas()},60000);
  window.addEventListener("pageshow",evento=>{if(evento.persisted)void conferirListas()});
})();

/* No Safari e nos demais navegadores compatíveis, as próximas visitas
 * buscam o HTML atualizado mantendo o mesmo endereço compartilhado. */
if("serviceWorker" in navigator){
  navigator.serviceWorker.register("./sw.js",{scope:"./",updateViaCache:"none"}).catch(()=>{});
}

/* Solicitações enviadas ao Apps Script; não alterar listas automaticamente. */
(function(){
 const form=document.getElementById("request-form");if(!form)return;
 const child=document.getElementById("req-child"),companion=document.getElementById("req-companion");
 const type=document.getElementById("req-type"),busSelect=document.getElementById("req-bus");
 const current=document.getElementById("req-current"),compInfo=document.getElementById("req-companion-info");
 const find=name=>dados.find(p=>norm(p.nome)===norm(name));
 const options=document.getElementById("req-children");
 dados.slice().sort((a,b)=>a.nome.localeCompare(b.nome,"pt-BR")).forEach(p=>{const o=document.createElement("option");o.value=p.nome;options.appendChild(o)});
 for(let i=1;i<=9;i++){const o=document.createElement("option");o.value=String(i);o.textContent=bus(i);busSelect.appendChild(o)}
 function update(){
  const p=find(child.value),friend=find(companion.value);
  current.textContent=p?bus(p.onibus)+" · "+p.perse:"Selecione um nome completo da lista.";
  compInfo.textContent=friend?bus(friend.onibus)+" · "+friend.perse:"";
  const mode=type.value;
  document.getElementById("req-companion-wrap").hidden=mode!=="companhia";
  document.getElementById("req-bus-wrap").hidden=mode!=="onibus";
  companion.required=mode==="companhia";busSelect.required=mode==="onibus";
 }
 child.addEventListener("input",update);companion.addEventListener("input",update);type.addEventListener("change",update);update();

 const ENDPOINT="https://script.google.com/macros/s/AKfycbzMeDVplfUWk_JHmLUBYEMryuF7E7zI_dz2wISk12_EpzB5xWKwraCrCmsNQ_CxlZHp/exec";

 const enviar=form.querySelector(".request-submit");
 form.addEventListener("submit",async e=>{
   e.preventDefault();
   const feedback=document.getElementById("req-feedback");
   const p=find(child.value),friend=find(companion.value),mode=type.value;
   if(!p){feedback.textContent="Selecione a criança da lista.";child.focus();return}
   if(mode==="companhia"&&!friend){feedback.textContent="Selecione a outra criança da lista.";companion.focus();return}
   if(mode==="companhia"&&norm(p.nome)===norm(friend.nome)){feedback.textContent="Selecione uma outra criança.";return}
   if(mode==="companhia"&&Number(p.onibus)===Number(friend.onibus)){feedback.textContent="As duas crianças já estão no mesmo ônibus.";return}
   const tel=document.getElementById("req-phone").value.trim();
   if(tel.replace(/\D/g,"").length<10){feedback.textContent="Confira o WhatsApp informado.";return}
   const payload={
     crianca:p.nome,perse:p.perse,onibusAtual:bus(p.onibus),tipo:mode,
     outraCrianca:mode==="companhia"?friend.nome:"",
     onibusDesejado:mode==="onibus"?bus(busSelect.value):"",
     observacoes:document.getElementById("req-details").value.trim(),
     responsavel:document.getElementById("req-parent").value.trim(),telefone:tel
   };
   enviar.disabled=true;
   enviar.setAttribute("aria-busy","true");
   enviar.querySelector(".request-submit-text").textContent="Enviando solicitação...";
   feedback.className="request-feedback";
   feedback.textContent="Enviando o pedido, não feche esta página.";
   try{
     await fetch(ENDPOINT,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=UTF-8"},body:JSON.stringify(payload),redirect:"follow"});
     feedback.className="request-feedback request-feedback-info";
     feedback.textContent="Solicitação encaminhada para análise! A organização verificará o pedido. A troca de ônibus depende de confirmação.";
   }catch(err){
     feedback.className="request-feedback request-feedback-error";
     feedback.textContent="O envio não foi concluído. Confira sua conexão e tente novamente.";
   }finally{
     enviar.disabled=false;
     enviar.removeAttribute("aria-busy");
     enviar.querySelector(".request-submit-text").textContent="Enviar solicitação para análise";
   }
 });

})();
