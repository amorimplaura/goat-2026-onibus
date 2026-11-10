/** GOAT 2026 — endpoint de recebimento de solicitações.
 * Instalar em script.google.com usando a conta proprietária da planilha.
 * Implantar > Nova implantação > Aplicativo da Web > Executar como: Eu
 * > Quem tem acesso: Qualquer pessoa. Copiar URL /exec.
 * A planilha permanece PRIVADA; somente o endpoint recebe POST.
 */
const SPREADSHEET_ID = '1COvAK-PtFp-423f0wx5W2nNqvE7X7_rfuHrtqnF9iWs';
const SHEET_NAME = 'SOLICITAÇÕES';
function doPost(e) {
  try {
    const p=JSON.parse((e.postData&&e.postData.contents)||'{}');
    const fields=['crianca','perse','onibusAtual','tipo','outraCrianca','onibusDesejado','observacoes','responsavel','telefone'];
    if(!p.crianca||!p.responsavel||!p.telefone||!p.tipo) throw Error('Campos obrigatórios ausentes');
    if(String(p.telefone).replace(/\D/g,'').length<10) throw Error('Telefone inválido');
    if(String(p.crianca).length>180||String(p.observacoes||'').length>1500) throw Error('Dados muito longos');
    const lock=LockService.getScriptLock();lock.waitLock(20000);
    try {
      const sh=SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
      if(!sh) throw Error('Aba de solicitações não encontrada');
      const safe=v=>{const s=String(v||'').slice(0,1500);return /^[=+@\-]/.test(s)?("'"+s):s};
      sh.appendRow([new Date(),...fields.map(k=>safe(p[k])),'Pendente']);
    } finally {lock.releaseLock()}
    return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err.message)})).setMimeType(ContentService.MimeType.JSON);
  }
}
