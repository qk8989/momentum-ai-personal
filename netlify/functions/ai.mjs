const json=(statusCode,body)=>({statusCode,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"},body:JSON.stringify(body)});
export async function handler(event){
 if(event.httpMethod!=="POST") return json(405,{error:"POST만 허용됩니다."});
 const key=process.env.GEMINI_API_KEY; if(!key)return json(503,{error:"GEMINI_API_KEY가 설정되지 않았습니다."});
 let b;try{b=JSON.parse(event.body||"{}")}catch{return json(400,{error:"잘못된 요청입니다."})}
 const mode=b.mode; let prompt;
 if(mode==="coach"){
  const input=String(b.input||"").slice(0,800), tasks=Array.isArray(b.tasks)?b.tasks.slice(0,8).join(", "):"없음";
  if(!input)return json(400,{error:"입력이 비어 있습니다."});
  prompt=`너는 미루는 대학생을 돕는 한국어 실행 코치다. 설교·비난·과장 없이 답한다. 사용자의 감정을 한 문장으로 인정하고, 5분 안에 가능한 구체적인 첫 행동을 1~2개 제안하라. 답은 180자 이내의 자연스러운 한국어로만 작성하라. 오늘 미완료 작업: ${tasks}\n사용자: ${input}`;
 }else if(mode==="journal"){
  prompt=`너는 따뜻하지만 현실적인 한국어 회고 코치다. 아래 회고를 220자 이내로 요약하고, 성과 1개를 인정한 뒤 내일 실행할 가장 작은 행동 1개를 제안하라. 진단이나 과장된 표현은 쓰지 마라.\n잘한 점: ${String(b.good||"").slice(0,600)}\n아쉬운 점: ${String(b.bad||"").slice(0,600)}\n내일: ${String(b.tomorrow||"").slice(0,600)}`;
 }else return json(400,{error:"지원하지 않는 모드입니다."});
 try{
  const model=process.env.GEMINI_MODEL||"gemini-2.5-flash-lite";
  const u=`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
  const r=await fetch(u,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts:[{text:prompt}]}],generationConfig:{temperature:.55,maxOutputTokens:220}})});
  const x=await r.json(); if(!r.ok) return json(r.status===429?429:502,{error:r.status===429?"무료 사용 한도에 도달했습니다.":"Gemini 응답 오류"});
  const reply=x?.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("").trim(); if(!reply)throw Error("empty");
  return json(200,{reply,model});
 }catch(e){return json(502,{error:"Gemini에 연결하지 못했습니다."})}
}