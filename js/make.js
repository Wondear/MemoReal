//memory.js 에서 온 결과 값을 토대로 UI로 동작을 제어할 어쩌구... 파일

const writeButton = document.querySelector("#write");
const submitMemo = document.querySelector("#submit");
const quitMemo = document.querySelector("#cancel");
const newtitle = document.querySelector("#title");
const context = document.querySelector("#texts");
const blurBackground = document.querySelector(".blur-background");

let design;

submitMemo.addEventListener("click", newMemo);
quitMemo.addEventListener("click", cancelMemo);
writeButton.addEventListener("click", writeMemo);

const maxLength = 70; // 최대 입력 길이 설정

context.addEventListener("input", () => {
  const text = context.value;
  if (text.length > maxLength) {
    context.value = text.slice(0, maxLength); // 초과된 부분을 잘라냅니다.
    alert(`현재 ${maxLength}자, 최대길이 입니다.`);
  }
});
function newMemo() {
  if (confirm("현재 메모를 저장 하시겠습니까?")) {
    let position = geolocation();
    let newData = {
      title: newtitle.value,
      date: parseInt(getDate()),
      time: getCurrentTime(),
      context: context.value,
      design: design,
      position: [position.coords.latitude, position.coords.longitude],
    };
    PostnewMemo(newData);
    closeModal();
  }
}
function cancelMemo() {
  if (confirm("작성을 취소하시겠습니까? 정보는 저장되지 않습니다."))
    closeModal();
}
function closeModal() {
  console.log("closeModal확인");
  blurBackground.style.opacity = 0;
  modal.classList.remove(`${design}`);
  blurBackground.style.pointerEvents = "none";
  newtitle.value = "";
  context.value = "";
}
function writeMemo() {
  const modal = document.querySelector("#modal");
  exporting()
    .then((result) => {
      console.log(result); // 실제 데이터가 담긴 배열
      design = petchDesign(result); // 데이터 처리를 위해 값 보내기
      quitMemo.classList.add(`${design}`);
      submitMemo.classList.add(`${design}`);
      modal.classList.add(`${design}`);
      blurBackground.style.opacity = 1;
      blurBackground.style.pointerEvents = "auto";
    })
    .catch((error) => {
      console.error(error);
    });
}

/*초단기실황	T1H	기온	℃	
	RN1	1시간 강수량	mm
	UUU	동서바람성분	m/s	
	VVV	남북바람성분	m/s	
	REH	습도	%	8
	PTY	강수형태	코드값	 > 
	VEC	풍향	deg	10
	WSD	풍속	m/s	10*/
/*
0:{category: 'PTY', obsrValue: '0'}
1:{category: 'REH', obsrValue: '61'}
2:{category: 'RN1', obsrValue: '0'}
3:{category: 'T1H', obsrValue: '12.9'}
4:{category: 'UUU', obsrValue: '-2.3'}
5:{category: 'VEC', obsrValue: '74'}
6: {category: 'VVV', obsrValue: '-0.6'}
7:{category: 'WSD', obsrValue: '2.5'}
*/
function petchDesign(weather) {
  let result = "";
  if (parseInt(weather[0].obsrValue) == 0) {
    if (parseInt(weather[7].obsrValue) > 10.0) result = "wind";
    else {
      console.log("맑음");
      result = "sunny";
    }
  } else if (weather[0].obsrValue == (3 || 7)) {
    console.log("눈이 내림");
    result = "snow";
  } else {
    console.log("비가 옴");
    result = "rain";
  }
  console.log(result);
  return result;
}

function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");

  return `${hours}시 ${minutes}분`;
}
