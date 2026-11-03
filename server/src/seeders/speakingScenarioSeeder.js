import { SpeakingScenario } from "../models/index.js";

export const speakingScenarios = [
  // 건설 현장 시나리오
  {
    category: "construction",
    scenarioId: "safety_check",
    title: "Safety Equipment Check",
    titleKo: "안전 장비 점검",
    titleVi: "Kiểm tra thiết bị an toàn",
    context: "작업 시작 전 안전 장비를 확인하는 상황",
    difficulty: "beginner",
    dialogues: [
      {
        role: "foreman",
        speaker: "현장 반장",
        text: "안전모를 착용하셨나요?",
        romanization: "anjeonmo-reul chagyong-hasyeossnayo?",
        translation: {
          en: "Are you wearing a hard hat?",
          vi: "Bạn đã đội mũ bảo hiểm chưa?",
        },
        expectedResponses: [
          {
            text: "안전모 착용하고 왔습니다.",
            romanization: "anjeonmo chagyong-hago wasseubnida.",
            translation: "I came with my hard hat on.",
          },
          {
            text: "죄송합니다. 지금 바로 쓰겠습니다.",
            romanization: "joesonghamnida. jigeum balo sseugesseubnida.",
            translation: "Sorry. I'll put it on right now.",
          },
          {
            text: "깜빡했습니다. 사물함에서 가져오겠습니다.",
            romanization: "kkambakhaessseubnida. samulham-eseo gajyeo-ogesseubnida.",
            translation: "I forgot. I'll get it from my locker.",
          },
        ],
      },
      {
        role: "foreman",
        speaker: "현장 반장",
        text: "안전화도 신으셨나요?",
        romanization: "anjeonhwa-do sineusyeossnayo?",
        translation: {
          en: "Are you wearing safety shoes?",
          vi: "Bạn đã đi giày bảo hộ chưa?",
        },
        expectedResponses: [
          {
            text: "안전화 착용 완료했습니다. 끈도 단단히 묶었습니다.",
            romanization: "anjeonhwa chagyong wanlyo-haessseubnida. kkeun-do dandanhi mukkeossseubnida.",
            translation: "Safety shoes are on. I tied the laces tightly too.",
          },
          {
            text: "신발 확인 부탁드립니다. 이거 안전화 맞죠?",
            romanization: "sinbal hwag-in butak-deuribnida. igeo anjeonhwa majjyo?",
            translation: "Please check my shoes. These are safety shoes, right?",
          },
          {
            text: "오늘 새로 구매한 안전화 신고 왔습니다.",
            romanization: "oneul saelo gumaehan anjeonhwa singo wasseubnida.",
            translation: "I'm wearing the safety shoes I just bought today.",
          },
        ],
      },
    ],
    pronunciationFocus: ["안전모", "착용", "안전화", "사물함", "완료"],
  },
  {
    category: "construction",
    scenarioId: "work_instruction",
    title: "Receiving Work Instructions",
    titleKo: "작업 지시 받기",
    titleVi: "Nhận hướng dẫn công việc",
    context: "반장님이 오늘의 작업 지시를 내리는 상황 - 도면 번호와 구역을 확인",
    difficulty: "intermediate",
    dialogues: [
      {
        role: "foreman",
        speaker: "현장 반장",
        text: "오늘은 A동 3층 C구역에서 철근 배근 작업을 진행합니다.",
        romanization: "oneul-eun A-dong 3cheung C-guyeog-eseo cheolgeun baekeun jageob-eul jinhaeng-habnida.",
        translation: {
          en: "Today we'll do rebar placement work in Building A, 3rd floor, Section C.",
          vi: "Hôm nay chúng ta sẽ làm công việc bố trí thép ở Tòa A, tầng 3, khu vực C.",
        },
        expectedResponses: [
          {
            text: "A동 3층 C구역이요? 도면 번호 알려주세요.",
            romanization: "A-dong 3cheung C-guyeog-iyo? domyeon beonho allyeojuseyo.",
            translation: "Building A, 3rd floor, Section C? Please tell me the drawing number.",
          },
          {
            text: "C구역 말씀이시죠? 참고할 도면이 있나요?",
            romanization: "C-guyeog malsseum-isijyo? chamgohal domyeon-i issnayo?",
            translation: "Section C, right? Is there a drawing to refer to?",
          },
          {
            text: "작업 위치 확인했습니다. 어떤 도면 보면 되나요?",
            romanization: "jageob wichi hwag-in-haessseubnida. eotteon domyeon bomyeon doenayo?",
            translation: "Work location confirmed. Which drawing should I look at?",
          },
        ],
      },
      {
        role: "foreman",
        speaker: "현장 반장",
        text: "도면 A-301번을 확인하세요. 철근 간격은 200밀리미터입니다.",
        romanization: "domyeon A-301beon-eul hwag-in-haseyo. cheolgeun gangyeog-eun 200millimiteo-ibnida.",
        translation: {
          en: "Check drawing A-301. The rebar spacing is 200 millimeters.",
          vi: "Kiểm tra bản vẽ A-301. Khoảng cách thép là 200 mm.",
        },
        expectedResponses: [
          {
            text: "A-301번 도면이죠? 철근 간격 200밀리로 배근하겠습니다.",
            romanization: "A-301beon domyeon-ijyo? cheolgeun gangyeog 200milli-lo baekeun-hagessseubnida.",
            translation: "Drawing A-301, right? I'll place the rebar at 200mm spacing.",
          },
          {
            text: "간격 200밀리미터 확인했습니다. 줄자 가져올게요.",
            romanization: "gangyeog 200millimiteo hwag-in-haessseubnida. julja gajyeoolgeyo.",
            translation: "200mm spacing confirmed. I'll bring a measuring tape.",
          },
          {
            text: "도면 지금 보고 있습니다. 200밀리 간격으로 작업 시작하겠습니다.",
            romanization: "domyeon jigeum bogo isseubnida. 200milli gangyeog-eulo jageob sijak-hagessseubnida.",
            translation: "I'm looking at the drawing now. I'll start working at 200mm spacing.",
          },
        ],
      },
      {
        role: "foreman",
        speaker: "현장 반장",
        text: "작업 끝나면 양생 시트로 덮어주세요.",
        romanization: "jageob kkeutnamyeon yangseong siteu-lo deopeojuseyo.",
        translation: {
          en: "Cover it with a curing sheet when you're done.",
          vi: "Phủ bằng tấm bảo dưỡng khi hoàn thành.",
        },
        expectedResponses: [
          {
            text: "양생 시트 창고에서 미리 꺼내놨습니다. 작업 끝나는 대로 바로 덮겠습니다.",
            romanization: "yangseong siteu changgo-eseo miri kkeonaenowasseubnida. jageob kkeutna-neun daelo balo deopgesseubnida.",
            translation: "I already took out the curing sheet from storage. I'll cover it as soon as I finish.",
          },
          {
            text: "혹시 양생 기간은 며칠인가요? 시트 덮고 표시해둘게요.",
            romanization: "hoksi yangseong gigan-eun myeochil-ingayo? siteu deopgo pyosi-haedulgeyo.",
            translation: "How many days is the curing period? I'll cover it and mark it.",
          },
          {
            text: "양생 작업 포함해서 오후 5시까지 완료하겠습니다.",
            romanization: "yangseong jageob poham-haeseo ohu 5si-kkaji wanlyo-hagessseubnida.",
            translation: "Including the curing work, I'll finish by 5 PM.",
          },
        ],
      },
    ],
    pronunciationFocus: ["철근", "배근", "도면", "구역", "간격", "양생", "밀리미터", "창고"],
  },
  {
    category: "construction",
    scenarioId: "concrete_work",
    title: "Concrete Pouring Work",
    titleKo: "콘크리트 타설 작업",
    titleVi: "Công việc đổ bê tông",
    context: "콘크리트 타설 전 거푸집 점검 및 타설 작업 진행",
    difficulty: "advanced",
    dialogues: [
      {
        role: "foreman",
        speaker: "현장 반장",
        text: "B동 2층 거푸집 점검 완료했나요?",
        romanization: "B-dong 2cheung geopujip jeomgeom wanlyo-haessnayo?",
        translation: {
          en: "Have you finished checking the formwork on B Building 2nd floor?",
          vi: "Bạn đã kiểm tra ván khuôn tầng 2 Tòa B chưa?",
        },
        expectedResponses: [
          {
            text: "거푸집 전체 점검 끝났습니다. 볼트 조임도 확인했습니다.",
            romanization: "geopujip jeonche jeomgeom kkeutnasseubnida. bolteu jo-im-do hwag-in-haessseubnida.",
            translation: "Full formwork inspection is done. I also checked the bolt tightening.",
          },
          {
            text: "점검 완료했는데 북쪽 구역 거푸집이 약간 흔들립니다. 보강 필요합니다.",
            romanization: "jeomgeom wanlyo-haessneunde bukjjok guyeok geopujip-i yakgan heundeullibnida. bogang pilyo-habnida.",
            translation: "Inspection complete, but the north section formwork is a bit wobbly. Needs reinforcement.",
          },
          {
            text: "B동 2층 거푸집 이상 없습니다. 타설 준비 되었습니다.",
            romanization: "B-dong 2cheung geopujip isang eobseubnida. taseol junbi doeossseubnida.",
            translation: "No issues with B Building 2nd floor formwork. Ready for pouring.",
          },
        ],
      },
      {
        role: "foreman",
        speaker: "현장 반장",
        text: "좋습니다. 레미콘 차량이 30분 후에 도착합니다. 진동기 준비하세요.",
        romanization: "johseubnida. remikon chalyang-i 30bun hue dochak-habnida. jindonggi junbi-haseyo.",
        translation: {
          en: "Good. The concrete mixer truck will arrive in 30 minutes. Prepare the vibrator.",
          vi: "Tốt. Xe trộn bê tông sẽ đến sau 30 phút. Chuẩn bị máy đầm.",
        },
        expectedResponses: [
          {
            text: "진동기 2대 이미 현장에 배치했습니다. 배터리 충전도 확인했습니다.",
            romanization: "jindonggi 2dae imi hyeonjang-e baechi-haessseubnida. baeteoli chungjeon-do hwag-in-haessseubnida.",
            translation: "Already placed 2 vibrators on site. Battery charge confirmed too.",
          },
          {
            text: "30분이면 충분합니다. 타설 장비 점검하고 인력 배치하겠습니다.",
            romanization: "30bun-imyeon chungbun-habnida. taseol jangbi jeomgeom-hago illyeok baechi-hagessseubnida.",
            translation: "30 minutes is enough. I'll check the equipment and position the workers.",
          },
          {
            text: "레미콘 몇 대 오나요? 진동기 추가로 더 필요한지 확인할게요.",
            romanization: "remikon myeot dae onayo? jindonggi chuga-lo deo pilyohanji hwag-in-halgeyo.",
            translation: "How many mixer trucks are coming? I'll check if we need more vibrators.",
          },
        ],
      },
      {
        role: "foreman",
        speaker: "현장 반장",
        text: "타설 후 최소 7일간 양생해야 합니다. 양생 일지도 작성하세요.",
        romanization: "taseol hu choeso 7ilgan yangseong-haeya habnida. yangseong ilji-do jakseong-haseyo.",
        translation: {
          en: "After pouring, it must cure for at least 7 days. Fill out the curing log too.",
          vi: "Sau khi đổ, phải bảo dưỡng ít nhất 7 ngày. Ghi nhật ký bảo dưỡng.",
        },
        expectedResponses: [
          {
            text: "7일간 매일 아침 저녁으로 양생 상태 점검하고 일지 기록하겠습니다.",
            romanization: "7ilgan maeil achim jeonyeog-eulo yangseong sangtae jeomgeom-hago ilji gilog-hagessseubnida.",
            translation: "For 7 days, I'll check curing condition morning and evening and record in the log.",
          },
          {
            text: "양생 일지 양식 어디 있나요? 온도랑 습도도 같이 기록해야 하나요?",
            romanization: "yangseong ilji yangsik eodi issnayo? ondo-rang seubdo-do gachi gilog-haeya hanayo?",
            translation: "Where's the curing log form? Do I need to record temperature and humidity too?",
          },
          {
            text: "이번 주 날씨가 추운데 양생 시트 두껍게 덮고 보온 조치하겠습니다.",
            romanization: "ibeon ju nalssi-ga chuunde yangseong siteu dukkeobge deopgo bo-on jochi-hagessseubnida.",
            translation: "It's cold this week, so I'll cover it thick with curing sheets and keep it warm.",
          },
        ],
      },
    ],
    pronunciationFocus: ["거푸집", "타설", "레미콘", "진동기", "양생", "일지", "볼트", "배치"],
  },

  // 제조업 시나리오
  {
    category: "manufacturing",
    scenarioId: "machine_operation",
    title: "Machine Operation",
    titleKo: "기계 조작",
    titleVi: "Vận hành máy móc",
    context: "공장에서 컨베이어 라인의 사출기 작동 방법을 배우는 상황",
    difficulty: "intermediate",
    dialogues: [
      {
        role: "supervisor",
        speaker: "관리자",
        text: "라인 3번 컨베이어에서 작업합니다. 빨간 비상정지 버튼 위치 확인하세요.",
        romanization: "lain 3beon keonbeieoe-eseo jageob-habnida. ppalgan bisangjeongji beoteun wichi hwag-in-haseyo.",
        translation: {
          en: "You'll work on Line 3 conveyor. Check the location of the red emergency stop button.",
          vi: "Bạn sẽ làm việc trên băng chuyền Dây 3. Kiểm tra vị trí nút dừng khẩn cấp màu đỏ.",
        },
        expectedResponses: [
          {
            text: "비상정지 버튼 여기 오른쪽에 있네요. 위치 확인했습니다.",
            romanization: "bisangjeongji beoteun yeogi oleunjjog-e issneyo. wichi hwag-in-haessseubnida.",
            translation: "The emergency stop button is here on the right. Location confirmed.",
          },
          {
            text: "라인 3번이요? 비상정지 버튼 누르면 전체 라인이 멈추나요?",
            romanization: "lain 3beon-iyo? bisangjeongji beoteun nuleumyeon jeonche lain-i meomchunayo?",
            translation: "Line 3? Does pressing the emergency stop button halt the entire line?",
          },
          {
            text: "빨간 버튼 위치 외우겠습니다. 혹시 테스트 한 번 해봐도 될까요?",
            romanization: "ppalgan beoteun wichi oeugesseubnida. hoksi teseuteu han beon haebwado doelkkayo?",
            translation: "I'll memorize the red button location. Can I test it once?",
          },
        ],
      },
      {
        role: "supervisor",
        speaker: "관리자",
        text: "사출기 온도는 180도로 설정하고, 사이클 타임은 45초입니다.",
        romanization: "sachulgi ondo-neun 180do-lo seoljeong-hago, saikeul taim-eun 45cho-ibnida.",
        translation: {
          en: "Set the injection molding machine temperature to 180 degrees, and the cycle time is 45 seconds.",
          vi: "Cài đặt nhiệt độ máy ép phun ở 180 độ, và thời gian chu kỳ là 45 giây.",
        },
        expectedResponses: [
          {
            text: "사출기 온도 180도 설정 완료했습니다. 사이클 45초로 맞춰놨습니다.",
            romanization: "sachulgi ondo 180do seoljeong wanlyo-haessseubnida. saikeul 45cho-lo majchwo-nwasseubnida.",
            translation: "Injection machine temperature set to 180 degrees. Cycle adjusted to 45 seconds.",
          },
          {
            text: "온도 올라가는데 시간 얼마나 걸리나요? 45초 사이클 지금 시작 가능한가요?",
            romanization: "ondo ollaganeunde sigan eolmana geollinayo? 45cho saikeul jigeum sijak ganeunghanayo?",
            translation: "How long does it take for temperature to rise? Can we start the 45-second cycle now?",
          },
          {
            text: "180도 45초 메모했습니다. 온도계 어디서 확인하나요?",
            romanization: "180do 45cho memo-haessseubnida. ondogye eodiseo hwag-in-hanayo?",
            translation: "Noted 180 degrees, 45 seconds. Where do I check the thermometer?",
          },
        ],
      },
      {
        role: "supervisor",
        speaker: "관리자",
        text: "불량품이 나오면 즉시 라인을 정지하고 QC 담당자를 불러주세요.",
        romanization: "bullyangpum-i naomyeon jeuksi lain-eul jeongji-hago QC damgdangja-leul bulleo-juseyo.",
        translation: {
          en: "If defective products come out, stop the line immediately and call the QC person.",
          vi: "Nếu có sản phẩm lỗi, hãy dừng dây chuyền ngay và gọi người phụ trách QC.",
        },
        expectedResponses: [
          {
            text: "불량품 기준이 뭔가요? 크기나 색상 이상 있으면 바로 정지하면 되나요?",
            romanization: "bullyangpum gijuni mwongayo? keugina saeksang isang isseumyeon balo jeongji-hamyeon doenayo?",
            translation: "What's the defect standard? Should I stop immediately if there's size or color issues?",
          },
          {
            text: "QC 담당자 연락처 알려주세요. 내선 번호나 호출 방법 필요합니다.",
            romanization: "QC damgdangja yeollakcheo allyeojuseyo. naeseon beonho-na hochul bangbeop pilyo-habnida.",
            translation: "Please tell me the QC person's contact. I need the extension number or how to call.",
          },
          {
            text: "라인 정지 후 불량품은 따로 분류해서 보관하나요? 절차 알려주세요.",
            romanization: "lain jeongji hu bullyangpum-eun ttalo bunlyu-haeseo bogwan-hanayo? jeolcha allyeojuseyo.",
            translation: "After stopping the line, do we sort and store defects separately? Please tell me the procedure.",
          },
        ],
      },
    ],
    pronunciationFocus: ["컨베이어", "사출기", "비상정지", "불량품", "사이클", "QC", "온도", "설정"],
  },
  {
    category: "manufacturing",
    scenarioId: "quality_inspection",
    title: "Quality Inspection",
    titleKo: "품질 검사",
    titleVi: "Kiểm tra chất lượng",
    context: "생산 라인에서 제품 검사 및 포장 작업",
    difficulty: "advanced",
    dialogues: [
      {
        role: "supervisor",
        speaker: "품질 관리자",
        text: "A라인 제품 100개 단위로 샘플 검사 진행해주세요. 검사 기준서는 QC-205입니다.",
        romanization: "A-lain jepum 100gae danwilo saempeul geomsa jinhaeng-haejuseyo. geomsa gijunseo-neun QC-205ibnida.",
        translation: {
          en: "Please conduct sample inspection of Line A products in units of 100. The inspection standard is QC-205.",
          vi: "Vui lòng kiểm tra mẫu sản phẩm Dây A theo đơn vị 100. Tiêu chuẩn kiểm tra là QC-205.",
        },
        expectedResponses: [
          {
            text: "QC-205 기준서 지금 확인 중입니다. 샘플은 100개마다 몇 개씩 뽑나요?",
            romanization: "QC-205 gijunseo jigeum hwag-in jung-ibnida. saempeul-eun 100gaemada myeot gaessik ppopnayo?",
            translation: "Checking QC-205 standard now. How many samples per 100 units?",
          },
          {
            text: "A라인 현재 생산량이 얼마나 되나요? 검사 일정 계획 세우겠습니다.",
            romanization: "A-lain hyeonjae saengsanlyang-i eolmana doenayo? geomsa iljeong gyehoek se-ugesseubnida.",
            translation: "What's Line A's current production volume? I'll plan the inspection schedule.",
          },
          {
            text: "샘플 검사 기록지는 어디 있나요? QC-205 체크리스트 필요합니다.",
            romanization: "saempeul geomsa gilogji-neun eodi issnayo? QC-205 chekeuliseuteu pilyo-habnida.",
            translation: "Where's the sample inspection record sheet? I need the QC-205 checklist.",
          },
        ],
      },
      {
        role: "supervisor",
        speaker: "품질 관리자",
        text: "치수 오차 범위는 플러스 마이너스 0.5밀리미터입니다. 캘리퍼스로 측정하세요.",
        romanization: "chisu ocha beomwi-neun peulleoseu maineoseu 0.5millimiteo-ibnida. kaellipeoseu-lo cheugjeong-haseyo.",
        translation: {
          en: "The dimensional tolerance is plus or minus 0.5 millimeters. Measure with calipers.",
          vi: "Dung sai kích thước là cộng trừ 0.5 mm. Đo bằng thước cặp.",
        },
        expectedResponses: [
          {
            text: "캘리퍼스 영점 조정했습니다. 측정 항목이 길이, 폭, 두께 맞나요?",
            romanization: "kaellipeoseu yeongjeom jojeong-haessseubnida. cheugjeong hangmog-i gili, pok, dukke mannayo?",
            translation: "Calipers zeroed. Are the measurement items length, width, and thickness?",
          },
          {
            text: "0.5밀리 오차 범위 안에 들어오면 합격이죠? 초과하면 불량 처리하나요?",
            romanization: "0.5milli ocha beomwi an-e deureoomyeon hapgyeog-ijyo? chogwa-hamyeon bullyang cheoli-hanayo?",
            translation: "It passes within 0.5mm tolerance, right? Is it rejected if it exceeds?",
          },
          {
            text: "디지털 캘리퍼스 배터리 부족합니다. 예비 캘리퍼스 어디 있나요?",
            romanization: "dijiteol kaellipeoseu baeteoli bujok-habnida. yebi kaellipeoseu eodi issnayo?",
            translation: "Digital calipers battery is low. Where's the spare calipers?",
          },
        ],
      },
      {
        role: "supervisor",
        speaker: "품질 관리자",
        text: "검사 완료된 제품은 합격 스티커 붙이고 파레트에 50개씩 적재해주세요.",
        romanization: "geomsa wanlyo-doen jepum-eun hapgyeok seutikeo butigo palete-e 50gaessik jeogjaehae-juseyo.",
        translation: {
          en: "Put a pass sticker on inspected products and stack 50 units per pallet.",
          vi: "Dán nhãn đạt cho sản phẩm đã kiểm tra và xếp 50 đơn vị mỗi pallet.",
        },
        expectedResponses: [
          {
            text: "합격 스티커 색깔이 초록색 맞나요? 불량품은 빨간색 스티커 붙이나요?",
            romanization: "hapgyeok seutikeo saekkal-i choroksaek mannayo? bullyangpum-eun ppalgansaek seutikeo butinayo?",
            translation: "Is the pass sticker green? Do defects get red stickers?",
          },
          {
            text: "파레트 적재 높이 제한 있나요? 50개 쌓으면 몇 단 정도 되나요?",
            romanization: "palete jeokjae nopi jehan issnayo? 50gae ssaheumyeon myeot dan jeongdo doenayo?",
            translation: "Is there a pallet height limit? How many tiers for 50 units?",
          },
          {
            text: "합격품 파레트 보관 위치 알려주세요. 출하 대기 구역인가요?",
            romanization: "hapgyeokpum palete bogwan wichi allyeojuseyo. chulha daegi guyeog-ingayo?",
            translation: "Tell me where to store passed product pallets. Is it the shipping waiting area?",
          },
        ],
      },
    ],
    pronunciationFocus: ["샘플", "검사", "기준서", "치수", "오차", "캘리퍼스", "파레트", "적재", "영점"],
  },

  // 서비스업 시나리오
  {
    category: "service",
    scenarioId: "customer_greeting",
    title: "Customer Greeting",
    titleKo: "고객 인사",
    titleVi: "Chào khách hàng",
    context: "식당에서 고객을 맞이하는 상황",
    difficulty: "beginner",
    dialogues: [
      {
        role: "staff",
        speaker: "직원",
        text: "어서오세요. 몇 분이세요?",
        romanization: "eoseo-oseyo. myeot bun-iseyo?",
        translation: {
          en: "Welcome. How many people?",
          vi: "Xin chào. Có mấy người?",
        },
        expectedResponses: [
          {
            text: "두 명이요.",
            romanization: "du myeong-iyo.",
            translation: "Two people.",
          },
          {
            text: "세 명입니다.",
            romanization: "se myeong-ibnida.",
            translation: "Three people.",
          },
        ],
      },
      {
        role: "staff",
        speaker: "직원",
        text: "이쪽으로 안내하겠습니다.",
        romanization: "ijjog-eulo annae-hagessseubnida.",
        translation: {
          en: "I'll guide you this way.",
          vi: "Tôi sẽ hướng dẫn bạn đi lối này.",
        },
        expectedResponses: [
          {
            text: "감사합니다.",
            romanization: "gamsahabnida.",
            translation: "Thank you.",
          },
        ],
      },
    ],
    pronunciationFocus: ["어서오세요", "몇 분", "안내"],
  },
  {
    category: "service",
    scenarioId: "order_taking",
    title: "Taking Orders",
    titleKo: "주문 받기",
    titleVi: "Nhận đơn hàng",
    context: "카페에서 주문을 받고 결제 진행하는 상황",
    difficulty: "intermediate",
    dialogues: [
      {
        role: "staff",
        speaker: "직원",
        text: "주문하시겠어요?",
        romanization: "jumun-hasigesseoyo?",
        translation: {
          en: "Would you like to order?",
          vi: "Bạn muốn gọi món không?",
        },
        expectedResponses: [
          {
            text: "아메리카노 한 잔이랑 카페라떼 한 잔 주세요.",
            romanization: "amelikano han jan-ilang kapelatte han jan juseyo.",
            translation: "One Americano and one café latte, please.",
          },
          {
            text: "메뉴 좀 볼 수 있을까요? 추천 메뉴 있나요?",
            romanization: "menyu jom bol su isseulkkayo? chucheon menyu issnayo?",
            translation: "Can I see the menu? Do you have any recommendations?",
          },
          {
            text: "오늘의 커피 뭐예요? 가격도 알려주세요.",
            romanization: "oneul-ui keopi mwoyeyo? gagyeok-do allyeojuseyo.",
            translation: "What's today's coffee? Tell me the price too.",
          },
        ],
      },
      {
        role: "staff",
        speaker: "직원",
        text: "사이즈는 어떻게 하시겠어요? 톨, 그란데, 벤티 중에 선택하세요.",
        romanization: "saijeu-neun eotteoke hasi-gesseoyo? tol, geurandere, benti jung-e seontaek-haseyo.",
        translation: {
          en: "What size would you like? Choose from tall, grande, or venti.",
          vi: "Bạn muốn size nào? Chọn tall, grande hoặc venti.",
        },
        expectedResponses: [
          {
            text: "둘 다 그란데 사이즈로 주세요. 가격 차이 얼마나 나나요?",
            romanization: "dul da geurandere saijeu-lo juseyo. gagyeok chai eolmana nanayo?",
            translation: "Both in grande size, please. How much is the price difference?",
          },
          {
            text: "사이즈별 용량이 어떻게 되나요? 그란데면 몇 밀리리터예요?",
            romanization: "saijeubyeol yonglyang-i eotteoke doenayo? geurandere-myeon myeot milliliteo-yeyo?",
            translation: "What's the volume for each size? How many milliliters is grande?",
          },
          {
            text: "아메리카노는 톨, 라떼는 그란데로 각각 다르게 주문할게요.",
            romanization: "amelikano-neun tol, latte-neun geurandere-lo gakgak dareuge jumun-halgeyo.",
            translation: "I'll order them differently - Americano in tall, latte in grande.",
          },
        ],
      },
      {
        role: "staff",
        speaker: "직원",
        text: "총 4,500원입니다. 카드로 결제하시겠어요?",
        romanization: "chong 4,500won-ibnida. kadeu-lo gyeolje-hasigesseoyo?",
        translation: {
          en: "That's 4,500 won in total. Would you like to pay by card?",
          vi: "Tổng cộng 4.500 won. Bạn thanh toán bằng thẻ không?",
        },
        expectedResponses: [
          {
            text: "카드 결제 가능하죠? 삼성페이도 되나요?",
            romanization: "kadeu gyeolje ganeung-hajyo? samsungpei-do doenayo?",
            translation: "Card payment is okay, right? Is Samsung Pay accepted too?",
          },
          {
            text: "현금으로 낼게요. 5천원 받으세요. 거스름돈 주세요.",
            romanization: "hyeongeum-eulo naelgeyo. 5cheonwon badeusseyo. geoseuleumdon juseyo.",
            translation: "I'll pay in cash. Here's 5,000 won. Please give me the change.",
          },
          {
            text: "포인트 적립 가능한가요? 전화번호 말씀드릴게요.",
            romanization: "pointeu jeoglip ganeunghan-gayo? jeonhwa-beonho malsseum-deurilgeyo.",
            translation: "Can I earn points? I'll tell you my phone number.",
          },
        ],
      },
    ],
    pronunciationFocus: ["주문", "사이즈", "그란데", "결제", "카드"],
  },
  {
    category: "service",
    scenarioId: "inventory_check",
    title: "Inventory Check",
    titleKo: "재고 확인",
    titleVi: "Kiểm tra tồn kho",
    context: "편의점에서 재고를 확인하고 발주하는 상황",
    difficulty: "intermediate",
    dialogues: [
      {
        role: "manager",
        speaker: "매니저",
        text: "냉장고 음료 재고 확인하고 부족한 품목 알려주세요.",
        romanization: "naengjanggo eullyo jaego hwag-in-hago bujokan pummok allyeojuseyo.",
        translation: {
          en: "Check the refrigerator beverage inventory and let me know what items are low.",
          vi: "Kiểm tra tồn kho đồ uống trong tủ lạnh và cho tôi biết mặt hàng nào thiếu.",
        },
        expectedResponses: [
          {
            text: "재고 확인 리스트 있나요? 어떤 품목부터 체크하면 될까요?",
            romanization: "jaego hwag-in liseuteu issnayo? eotteon pummok-buteo chekeu-hamyeon doelkkayo?",
            translation: "Is there an inventory checklist? Which items should I check first?",
          },
          {
            text: "지금 바로 냉장고 가서 확인하겠습니다. 음료수만 체크하면 되나요?",
            romanization: "jigeum balo naengjanggo gaseo hwag-in-hagessseubnida. eumlyosu-man chekeu-hamyeon doenayo?",
            translation: "I'll go check the refrigerator right now. Should I only check beverages?",
          },
          {
            text: "재고 관리 장부에 기록도 해야 하나요? 엑셀 파일로 정리할까요?",
            romanization: "jaego gwanli jangbu-e gilog-do haeya hanayo? eksel pail-lo jeonglihalkkayo?",
            translation: "Should I record it in the inventory book too? Should I organize it in Excel?",
          },
        ],
      },
      {
        role: "staff",
        speaker: "직원",
        text: "콜라 12개, 사이다 5개 남았습니다. 사이다 추가 발주 필요합니다.",
        romanization: "kolla 12gae, saida 5gae namasseubnida. saida chuga balju pilyo-habnida.",
        translation: {
          en: "There are 12 colas and 5 ciders left. We need to order more ciders.",
          vi: "Còn 12 lon cola và 5 lon cider. Cần đặt thêm cider.",
        },
        expectedResponses: [
          {
            text: "사이다 하루 판매량이 얼마나 되나요? 몇 박스 발주하면 좋을까요?",
            romanization: "saida halu panmaelyang-i eolmana doenayo? myeot bakseu balju-hamyeon joheulkkayo?",
            translation: "What's the daily sales volume for cider? How many boxes should I order?",
          },
          {
            text: "발주서 작성해서 본사에 보내면 되나요? 납품 기간은 며칠 걸리나요?",
            romanization: "baljuseo jakseong-haeseo bonsa-e bonaemyeon doenayo? nabpum gigan-eun myeochil geollinayo?",
            translation: "Should I fill out the order form and send it to headquarters? How long does delivery take?",
          },
          {
            text: "콜라도 재고가 12개면 적은 편인데 같이 발주할까요?",
            romanization: "kolla-do jaego-ga 12gae-myeon jeogeun pyeon-inde gachi baljuhalkkayo?",
            translation: "12 colas is also low inventory - should we order that together?",
          },
        ],
      },
      {
        role: "manager",
        speaker: "매니저",
        text: "유통기한도 체크하세요. 3일 이내 상품은 할인 스티커 붙여주세요.",
        romanization: "yutong-gihan-do chekeu-haseyo. 3il inae sangpum-eun halin seutikeo butyeojuseyo.",
        translation: {
          en: "Check the expiration dates too. Put discount stickers on items within 3 days.",
          vi: "Kiểm tra cả hạn sử dụng. Dán nhãn giảm giá cho sản phẩm trong vòng 3 ngày.",
        },
        expectedResponses: [
          {
            text: "할인율이 몇 퍼센트인가요? 30% 할인 스티커 붙이면 되나요?",
            romanization: "halin-yul-i myeot peosenteu-ingayo? 30% halin seutikeo butimyeon doenayo?",
            translation: "What's the discount rate? Should I put 30% discount stickers?",
          },
          {
            text: "유통기한 지난 상품은 어떻게 처리하나요? 폐기 처리 기록해야 하나요?",
            romanization: "yutong-gihan jinan sangpum-eun eotteoke cheoli-hanayo? pyegi cheoli gilog-haeya hanayo?",
            translation: "How do we handle expired products? Do I need to record the disposal?",
          },
          {
            text: "도시락이랑 김밥 먼저 확인할게요. 냉장 상품이 우선이죠?",
            romanization: "dosilag-ilang gimbap meonjeo hwag-in-halgeyo. naengjang sangpum-i useon-ijyo?",
            translation: "I'll check lunch boxes and kimbap first. Refrigerated items are priority, right?",
          },
        ],
      },
    ],
    pronunciationFocus: ["재고", "부족", "발주", "유통기한", "할인", "스티커"],
  },
  {
    category: "service",
    scenarioId: "closing_tasks",
    title: "Store Closing Tasks",
    titleKo: "마감 업무",
    titleVi: "Công việc đóng cửa",
    context: "매장 마감 시 해야 할 업무들을 진행하는 상황",
    difficulty: "advanced",
    dialogues: [
      {
        role: "manager",
        speaker: "매니저",
        text: "마감 시간입니다. 먼저 계산대 현금 정산하고 금고에 넣어주세요.",
        romanization: "magam sigan-ibnida. meonjeo gyesandae hyeongeum jeongsanhago geumgo-e neoheojuseyo.",
        translation: {
          en: "It's closing time. First, count the cash at the register and put it in the safe.",
          vi: "Đã đến giờ đóng cửa. Đầu tiên, đếm tiền mặt ở quầy và cho vào két sắt.",
        },
        expectedResponses: [
          {
            text: "정산 보고서 작성도 해야 하나요? 오늘 매출이 얼마인지 확인할게요.",
            romanization: "jeongsan bogoseo jakseong-do haeya hanayo? oneul maechul-i eolma-inji hwag-in-halgeyo.",
            translation: "Do I need to write a settlement report too? I'll check today's sales amount.",
          },
          {
            text: "현금이랑 카드 매출 따로 정리하나요? 금고 비밀번호 알려주세요.",
            romanization: "hyeongeum-ilang kadeu maechul ttalo jeonglihanayo? geumgo bimilbeonho allyeojuseyo.",
            translation: "Do we organize cash and card sales separately? Tell me the safe password.",
          },
          {
            text: "계산대 영수증도 같이 금고에 보관하나요? 정산 장부 어디 있나요?",
            romanization: "gyesandae yeongsujeung-do gachi geumgo-e bogwan-hanayo? jeongsan jangbu eodi issnayo?",
            translation: "Do we keep register receipts in the safe too? Where's the settlement book?",
          },
        ],
      },
      {
        role: "manager",
        speaker: "매니저",
        text: "정산 끝나면 냉장고 온도 체크하고 청소 시작하세요. 바닥 쓸고 닦기까지 해주세요.",
        romanization: "jeongsan kkeutnamyeon naengjanggo ondo chekeu-hago cheongso sijak-haseyo. badak sseulgo dakkgikkaji haejuseyo.",
        translation: {
          en: "After counting, check the refrigerator temperature and start cleaning. Sweep and mop the floor too.",
          vi: "Sau khi đếm xong, kiểm tra nhiệt độ tủ lạnh và bắt đầu dọn dẹp. Quét và lau sàn.",
        },
        expectedResponses: [
          {
            text: "냉장고 적정 온도가 몇 도인가요? 온도 이상 있으면 어디 보고하나요?",
            romanization: "naengjanggo jeogjeong ondo-ga myeot do-ingayo? ondo isang isseumyeon eodi bogo-hanayo?",
            translation: "What's the proper refrigerator temperature? Where do I report if temperature is abnormal?",
          },
          {
            text: "청소 도구 창고에 있나요? 대걸레랑 세제 가져올게요.",
            romanization: "cheongso dogu changgo-e issnayo? daegeolle-rang seje gajyeo-olgeyo.",
            translation: "Are cleaning tools in the storage? I'll get the mop and detergent.",
          },
          {
            text: "쓰레기 분리수거도 해야 하나요? 일반 쓰레기랑 음식물 따로 버려야죠?",
            romanization: "sseuregi bunlisugeo-do haeya hanayo? ilban sseuregi-rang eumsigmul ttalo beolyeoyajyo?",
            translation: "Do we need to sort waste too? General trash and food waste separately, right?",
          },
        ],
      },
      {
        role: "manager",
        speaker: "매니저",
        text: "마지막으로 출입문 잠금 확인하고 경보 시스템 작동시켜주세요. 코드는 1234입니다.",
        romanization: "majimag-eulo churimmun jamgeum hwag-in-hago gyeongbo siseutem jagdong-sikyeojuseyo. kodeu-neun 1234ibnida.",
        translation: {
          en: "Finally, check that the doors are locked and activate the alarm system. The code is 1234.",
          vi: "Cuối cùng, kiểm tra cửa đã khóa và kích hoạt hệ thống báo động. Mã là 1234.",
        },
        expectedResponses: [
          {
            text: "경보 설정 후 몇 초 안에 나가야 하나요? 뒷문도 확인해야 하나요?",
            romanization: "gyeongbo seoljeong hu myeot cho an-e nagaya hanayo? dwinmun-do hwag-in-haeya hanayo?",
            translation: "How many seconds do I have to exit after setting the alarm? Should I check the back door too?",
          },
          {
            text: "1234 코드 입력하고 별표 버튼 누르면 되나요? 경보 해제 방법도 알려주세요.",
            romanization: "1234 kodeu ipnyeok-hago byeolpyo beoteun nuleumyeon doenayo? gyeongbo haeje bangbeop-do allyeojuseyo.",
            translation: "Enter 1234 and press the star button? Tell me how to deactivate the alarm too.",
          },
          {
            text: "전등 다 끄고 에어컨도 꺼야 하나요? 마감 체크리스트 있으면 주세요.",
            romanization: "jeondeung da kkeugo eeokeon-do kkeoya hanayo? magam chekeuliseuteu isseumyeon juseyo.",
            translation: "Should I turn off all lights and AC? Please give me the closing checklist if there is one.",
          },
        ],
      },
    ],
    pronunciationFocus: ["마감", "정산", "계산대", "금고", "청소", "경보", "시스템"],
  },

  // 일상 대화 시나리오
  {
    category: "daily",
    scenarioId: "daily_greeting",
    title: "Daily Greeting",
    titleKo: "일상 인사",
    titleVi: "Lời chào hàng ngày",
    context: "이웃과 인사하는 상황",
    difficulty: "beginner",
    dialogues: [
      {
        role: "neighbor",
        speaker: "이웃",
        text: "안녕하세요. 오늘 날씨가 좋네요.",
        romanization: "annyeonghaseyo. oneul nalssi-ga johneyo.",
        translation: {
          en: "Hello. The weather is nice today.",
          vi: "Xin chào. Hôm nay thời tiết đẹp nhỉ.",
        },
        expectedResponses: [
          {
            text: "네, 정말 좋네요.",
            romanization: "ne, jeongmal johneyo.",
            translation: "Yes, it's really nice.",
          },
        ],
      },
    ],
    pronunciationFocus: ["안녕하세요", "날씨", "좋네요"],
  },
  {
    category: "daily",
    scenarioId: "asking_directions",
    title: "Asking for Directions",
    titleKo: "길 묻기",
    titleVi: "Hỏi đường",
    context: "지하철역 위치를 묻는 상황",
    difficulty: "intermediate",
    dialogues: [
      {
        role: "passerby",
        speaker: "행인",
        text: "지하철역이 어디에 있나요?",
        romanization: "jihacheol-yeog-i eodie issnayo?",
        translation: {
          en: "Where is the subway station?",
          vi: "Ga tàu điện ngầm ở đâu?",
        },
        expectedResponses: [
          {
            text: "직진하시다가 오른쪽으로 가세요.",
            romanization: "jigjin-hasidaga oleunjjog-eulo gaseyo.",
            translation: "Go straight and turn right.",
          },
        ],
      },
    ],
    pronunciationFocus: ["지하철역", "어디", "직진", "오른쪽"],
  },

  // 응급 상황 시나리오
  {
    category: "emergency",
    scenarioId: "injury_report",
    title: "Reporting an Injury",
    titleKo: "부상 신고",
    titleVi: "Báo cáo chấn thương",
    context: "작업 중 다친 동료를 도와주는 상황",
    difficulty: "intermediate",
    dialogues: [
      {
        role: "worker",
        speaker: "작업자",
        text: "다쳤어요! 도와주세요!",
        romanization: "dachyeosseoyo! dowajuseyo!",
        translation: {
          en: "I'm hurt! Please help!",
          vi: "Tôi bị thương! Xin giúp đỡ!",
        },
        expectedResponses: [
          {
            text: "어디가 다치셨어요?",
            romanization: "eodiga dachisyeosseoyo?",
            translation: "Where are you hurt?",
          },
        ],
      },
      {
        role: "worker",
        speaker: "작업자",
        text: "손가락을 베었어요.",
        romanization: "songalag-eul beeosseoyo.",
        translation: {
          en: "I cut my finger.",
          vi: "Tôi bị cắt ngón tay.",
        },
        expectedResponses: [
          {
            text: "구급상자를 가져올게요.",
            romanization: "gugeubsangja-leul gajyeoolgeyo.",
            translation: "I'll bring the first aid kit.",
          },
        ],
      },
    ],
    pronunciationFocus: ["다쳤어요", "도와주세요", "손가락", "구급상자"],
  },
];

export const seedSpeakingScenarios = async () => {
  try {
    console.log(`📝 Starting to seed ${speakingScenarios.length} speaking scenarios...`);

    for (const scenario of speakingScenarios) {
      await SpeakingScenario.create({
        ...scenario,
        isActive: true,
        sortOrder: speakingScenarios.indexOf(scenario) + 1,
      });
      console.log(`✅ Created scenario: ${scenario.titleKo}`);
    }

    console.log("✅ Speaking scenarios seeded successfully!");
    return true;
  } catch (error) {
    console.error("❌ Error seeding speaking scenarios:", error);
    console.error("Error details:", error.message);
    return false;
  }
};