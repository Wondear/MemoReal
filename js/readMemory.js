const pastPost = document.querySelector("#pastMemo");
const url = "http://127.0.0.1:5050/pastMemo";
let pastMemos;

fetch(url, {
  method: "GET",
  headers: {
    Origin: "http://127.0.0.1:5050/FinalProject/page.html", // 여기에 클라이언트 도메인을 입력하세요.
  },
})
  .then((response) => {
    if (!response.ok) {
      throw new Error(
        `과거 메모를 불러오는 중 오류 발생: ${response.statusText}`
      );
    }
    return response.json();
  })
  .then(async (data) => {
    console.log("과거기록 확인", data);

    // 과거 메모 출력 로직
    pastMemos = data.Memo;
    for (const pastMemo of pastMemos) {
      let newParagraph = document.createElement("div");
      let position;
      if (pastMemo.position) {
        try {
          position = await getAddressFromLatLng(
            pastMemo.position[0],
            pastMemo.position[1]
          );
        } catch (error) {
          console.error("Error getting address:", error);
        }
      }
      newParagraph.innerHTML = `
        <div class="pastMemoItem animation ${pastMemo.design}">
        <div class="title">
        <button class="interButton ${
          pastMemo.design
        }" id="delete-btn">몼</button>
        ${pastMemo.title ? pastMemo.title : "<br>"}
       </div>
       <hr>
        <div class="innercontext">
         ${pastMemo.context}
          </div>
          <div class="timeStamp">
          ${position}에서 <br>
          ${pastMemo.date} ${pastMemo.time}의 기록</div>
        </div>
      `;
      newParagraph
        .querySelector("#delete-btn")
        .addEventListener("click", async () => {
          if (confirm("해당 메모를 삭제하시겠습니까?")) {
            const index = pastMemos.indexOf(pastMemo);
            if (index > -1) {
              pastMemos.splice(index, 1);
            }
            // 서버로 삭제 요청 보내기
            try {
              const deleteResponse = await fetch(url, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
              });

              if (deleteResponse.ok) {
                newParagraph.remove();
              } else {
                console.error(
                  `과거 메모 삭제 중 오류 발생: ${deleteResponse.statusText}`
                );
              }
            } catch (error) {
              console.error("Error deleting memo:", error);
            }
          }
        });

      pastPost.appendChild(newParagraph);
    }
  })
  .catch((error) => {
    console.error("에러발생", error);
  });

async function getAddressFromLatLng(latitude, longitude) {
  const REST_KEY = "35550a1efb1656bca21978ae9d6d0154";
  const lat = latitude;
  const lon = longitude;
  const url = `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${lon}&y=${lat}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `KakaoAK ${REST_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // 필요한 주소 정보 추출 (도, 시, 동 등)
    let city = "";
    let town = "";
    let polish = "";
    const addressComponents = data.documents[0].address_name.split(" ");
    if (addressComponents.length >= 2) {
      city = addressComponents[0];
      town = addressComponents[1];
      polish = addressComponents[2];
    }
    return `${city} ${town} ${polish}`;
  } catch (error) {
    console.error("Error fetching address data:", error);
    throw error;
  }
}

const PostnewMemo = async (newValue) => {
  const index = pastMemos.indexOf(pastMemo);
  if (index > -1) {
    pastMemos.splice(index, 1);
  }
  // 값을 배열의 맨 앞에 추가
  pastMemos.unshift(newValue);
  console.log(pastMemos);
  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Memo: pastMemos }), // 새로운 값을 맨 앞에 추가한 배열을 전송
    });
  } catch (error) {
    console.error("Error deleting memo:", error);
  }
};
window.exporting = PostnewMemo;
