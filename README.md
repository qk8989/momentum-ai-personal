# Momentum AI Personal — Gemini 무료 등급 연결판

## 포함 기능
- Gemini 기반 시작 코치와 회고 요약
- Gemini 실패/무료 한도 초과 시 로컬 규칙형 응답 자동 전환
- API 키는 Netlify 환경변수에 보관(브라우저에 노출하지 않음)
- 기존 할 일·타이머·회고·백업·복원·PWA 기능 유지

## 준비
1. Google AI Studio에서 Gemini API 키를 생성합니다. 무료 등급 제공 여부와 한도는 계정·지역·모델의 현재 정책에 따릅니다.
2. 이 폴더를 GitHub 저장소에 업로드합니다. API 키 파일은 저장소에 넣지 마세요.
3. Netlify에서 **Add new project → Import an existing project**로 저장소를 연결합니다.
4. Netlify **Project configuration → Environment variables**에 `GEMINI_API_KEY`를 추가합니다. 값은 발급받은 키입니다.
5. 선택: `GEMINI_MODEL`=`gemini-2.5-flash-lite`를 추가합니다.
6. 새 배포를 실행합니다. 생성된 HTTPS 주소의 `/api/ai`는 POST 전용입니다.
7. iPhone Safari에서 주소 접속 → 공유 → 홈 화면에 추가.

## 주의
- ZIP을 단순 드래그앤드롭하면 Functions 빌드가 누락될 수 있으므로 GitHub 연동 배포를 권장합니다.
- 무료 등급은 영구·무제한을 보장하지 않습니다. 한도 초과 시 앱은 자동으로 로컬 코치로 동작합니다.
- 환경변수 설정 후 반드시 재배포하세요.
