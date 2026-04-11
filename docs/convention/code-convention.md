# 코드 컨벤션 가이드

## 네이밍 컨벤션

### 1. 변수 및 함수명 - camelCase (필수)

모든 변수명과 함수명은 **camelCase**를 사용..

```javascript
const byeonSuMyeong = "only camelCase";
const jojangName = "seongHyeon";
const trueOrFalse = false;

const pleaseCamel = () => {
    const text = "카멜케이스가 약간 정배임";
};

const camelCase = async () => {};
```

### 2. 클래스명 - PascalCase

-   클래스는 잘 안쓰일텐데 그래도 혹시 모르니까.

```javascript
class UserController {}
class DatabaseConnection {}

class userController {}
class database_connection {}
```

### 3. 상수 - UPPER_SNAKE_CASE

-   camelCase 정도는 안지켜도 그러려니 하는데 이건 정말 잘 지켜줘.

```javascript
const MAX_COUNT = 3;
const API_BASE_URL = "https://www.naver.com/api";
const JWT_SECRET_KEY = process.env.JWT_SECRET; // 혹은 api key
```

### 4. 파일명

-   **컴포넌트 파일**: PascalCase (예: `UserProfile.vue`)
-   **일반 JavaScript/TypeScript 파일**: kebab-case (예: `auth-service.js`)

## 코드 스타일

### 1. 들여쓰기

-   **tab** 규격 4칸 (굳이 안해도됨. 걍 내가 보기 편해서. 포메터 4칸으로 설정좀)

```javascript
const a = 3;
const tabKey = (tabkan) => (tabkan == 4 ? console.log("좋습니다") : console.log("ㅗ"));
tabKey(a);
```

### 2. 세미콜론

-   세미콜론 **필수** 사용 (JS 세미콜론 뺀다고 오류 잘 안나긴한데 그래도..)

```javascript
const name = "Jojiho";
const iq = 84;
```

### 3. 따옴표

-   문자열 **큰따옴표(")** 사용 (굳이 안해도됨. 포메터 걍 고정으로 "" 해두면 편함)

```javascript
const tftMotHam = "Yousun";
const insa = `안녕, 난 ${tftMotHam}`;
```

### 4. 화살표 함수

-   화살표 함수 자주 사용함 (이것도 굳이 안써도됨)

```javascript
const gaesan = (a, b) => a + b;
const myeongji = async () => {
    const asd = await abc(url);
    return qwe.json();
};
```

### 5. async await 사용

-   걍 내가 **async/await** 더 많이씀. (안써도 크게 상관은 없음.)

## 주석

-   걍 ㅈ대로 하셈. 상관 없음.

## Git 컨벤션

### ‼️ main 에 커밋 ㄴ

### 1. 브랜치 네이밍

-   현업 개발자가 아니라서 엄청 중요하다는 아닌데 그래도 지켰으면 좋겠다..?

feature/기능명 : 새로운거 만들면

refactor/대상 : 리팩토링

docs/문서명 : 문서 작업

### 2. 커밋 메시지

-   그냥 뭐 지키면 좋다 ..?

---

-   feat: 새로운 기능 추가
-   fix: 버그 수정
-   refactor: 코드 리팩토링
-   style: 코드 포맷팅, 세미콜론 누락 등
-   docs: 문서 수정
-   test: 테스트용

**예시:**

```zsh
git commit -m "feat: 사용자 로그인 기능 추가"
git commit -m "fix: 회원가입 시 이메일 중복 체크 오류 수정"
git commit -m "docs: README 파일 업데이트"
```

## ES7+ 문법 사용

### 1. 변수 선언

-   var 쓰지마;

```javascript
console.log(varNono);
var varNono = "var 쓰지마";
```

### 2. 템플릿 리터럴

-   쓸거면 쓰고 안써도 상관없음. (쓰는거 선호함)

## 코드 품질

### 1. 에러 처리

-   에러처리 부탁.

```javascript
//1학기 진용화 교수님 수업 내용 일부임.

router.post("/sibal", async (req, res) => {
    try {
        const user = req.body;
        const checkUser = await User.findOne({
            where: {
                id: user.id,
            },
        });

        if (checkUser) {
            console.log("중복 사용자:", checkUser);
            return res.json({
                success: false,
                message: "중복된 사용자임",
            });
        }

        await User.create(user);
        res.json({
            success: true,
            message: "회원가입 성공",
        });
    } catch (error) {
        console.error("회원가입 에러남:", error);
        res.status(500).json({
            success: false,
            message: "에러 몇개 있음 확인",
            error: error.message,
        });
    }
});
```

### 2. 일관성

-   웬만해서는 비슷하길 바람

### 3. 가독성

-   복잡한 로직은 함수로 분리
-   의미 있는 변수명 및 함수명 사용 (내가 컨벤션 함수명 대충 적었다고 따라하기 ㄴ)
-   매직 넘버 사용 금지 (변수 안에 숫자 넣어서혀)

```javascript
const sutJa = 2;
const banJiRum = sutJa ** sutJa * 3.14;

const pie = 3.14; // 이렇게 변수로 만들어서.

const leagueOfLegend = (a) => {
    // 전혀 상관없고, 의미도 없는 변수명
    const calcul = a ** a * 3.14; // 이렇게 숫자 직접 박기 x
    console.log(calcul);
};

leagueOfLegend(2);
```

---

그.. 내가 변수명 대충 적었다고 너네도 따라서 대충 짓지 말아줭..
