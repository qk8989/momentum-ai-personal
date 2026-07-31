const json=(statusCode,body)=>({statusCode,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"},body:JSON.stringify(body)});
export async function handler(event){
 if(event.httpMethod!=="POST") return json(405,{error:"POST만 허용됩니다."});
 const key=process.env.GEMINI_API_KEY; if(!key)return json(503,{error:"GEMINI_API_KEY가 설정되지 않았습니다."});
 let b;try{b=JSON.parse(event.body||"{}")}catch{return json(400,{error:"잘못된 요청입니다."})}
 const mode=b.mode; let prompt;
 if(mode==="coach"){
  const input=String(b.input||"").slice(0,800), tasks=Array.isArray(b.tasks)?b.tasks.slice(0,8).join(", "):"없음";
  if(!input)return json(400,{error:"입력이 비어 있습니다."});
  prompt=`너는 미루는 대학생을 돕는 한국어 코치다. 사용자가 무엇을 말하든 자연스럽게 대화하듯 답하라. 상황에 맞게 공감, 조언, 구체적인 다음 행동 제안, 격려 중 알맞은 방식을 자유롭게 골라서 답하고, 매번 '5분 행동'이나 정해진 틀에 억지로 맞추지 마라. 설교나 비난은 하지 말고 친근한 말투로 250자 이내로 답하라. 오늘 미완료 작업: ${tasks}\n사용자: ${input}`;
 }else if(mode==="journal"){
  prompt=`너는 따뜻하지만 현실적인 한국어 회고 코치다. 아래 회고를 220자 이내로 요약하고, 성과 1개를 인정한 뒤 내일 실행할 가장 작은 행동 1개를 제안하라. 진단이나 과장된 표현은 쓰지 마라.\n잘한 점: ${String(b.good||"").slice(0,600)}\n아쉬운 점: ${String(b.bad||"").slice(0,600)}\n내일: ${String(b.tomorrow||"").slice(0,600)}`;
 }else if(mode==="fact"){
  const input=String(b.input||"").slice(0,500);
  if(!input)return json(400,{error:"입력이 비어 있습니다."});
  prompt=`너는 사용자의 투정과 핑계를 일단 들어주면서도 할 말은 하는 한국어 '팩폭 코치'다. 반말로, 친한 친구가 어이없어하며 살짝 시비 거는 듯한 말투를 써라. 먼저 사용자의 말을 짧게 받아준 뒤 "그럼 평생 그렇게 살든가" 식으로 살짝 도발해서, 사용자가 스스로 오기가 생겨 "해야겠다"는 마음이 들게 만들어라. 인신공격, 외모·능력 비하, 욕설은 절대 하지 말고 행동과 핑계에 대해서만 말하되 사람 자체를 깎아내리지 마라. 120자 이내로 짧고 임팩트 있게 답하라. 단, 사용자의 말에서 번아웃, 우울, 무기력, 자해 등 진지한 고통의 신호가 보이면 장난기를 버리고 진심으로 공감하며 지지하는 말을 하라.\n사용자: ${input}`;
 }else return json(400,{error:"지원하지 않는 모드입니다."});
 try{
  const model=process.env.GEMINI_MODEL||"gemini-2.5-flash-lite";
  const u=`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
  const r=await fetch(u,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts:[{text:prompt}]}],generationConfig:{temperature:.6,maxOutputTokens:320}})});
  const x=await r.json(); if(!r.ok) return json(r.status===429?429:502,{error:r.status===429?"무료 사용 한도에 도달했습니다.":"Gemini 응답 오류"});
  const reply=x?.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("").trim(); if(!reply)throw Error("empty");
  return json(200,{reply,model});
 }catch(e){return json(502,{error:"Gemini에 연결하지 못했습니다."})}
}
