//memory.js
//코드 참고 자료
/*초단기실황	T1H	기온	℃	
	RN1	1시간 강수량	mm
	UUU	동서바람성분	m/s	
	VVV	남북바람성분	m/s	
	REH	습도	%	8
	PTY	강수형태	코드값	
	VEC	풍향	deg	10
	WSD	풍속	m/s	10*/

// 각자의 기준값을 새워 일정 이상일 경우 적용될 css를 작성해야함
// 기준 시간보다 이르면 값이 나오지 않음> 분 기준시를 확인, 기준시간보다 이르면 시각에서  -1한 값으로 리턴해야함
//or 기본적으로 현재시간이 아닌 30분정도 전의 시간을 출력하기

const weatherURl =
  "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst";
const weatherApiKey =
  "tPFbPzKhcJgfXd5CGb2vnG1TDAm6ZY9Ju471nOF5OElXBO6WMXDllT1I3oHrc1pveruBfav%2Fn06zLOLuh1T9eQ%3D%3D";
function searchWeather(position) {
  console.log(position.coords); // 위치 정보가 나옴.
  let rs = dfs_xy_conv(
    "toXY",
    position.coords.latitude,
    position.coords.longitude
  );

  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    var url = weatherURl; /*URL*/
    //현재 시각 반영
    var date = getDate();
    var time = getOneHourBeforeTime();
    var queryParams =
      "?" +
      encodeURIComponent("serviceKey") +
      "=" +
      weatherApiKey; /*Service Key*/
    queryParams +=
      "&" + encodeURIComponent("pageNo") + "=" + encodeURIComponent("1"); /**/
    queryParams +=
      "&" +
      encodeURIComponent("numOfRows") +
      "=" +
      encodeURIComponent("1000"); /**/
    queryParams +=
      "&" +
      encodeURIComponent("dataType") +
      "=" +
      encodeURIComponent("JSON"); /**/
    queryParams +=
      "&" +
      encodeURIComponent("base_date") +
      "=" +
      encodeURIComponent(date); /**/
    queryParams +=
      "&" +
      encodeURIComponent("base_time") +
      "=" +
      encodeURIComponent(time); /**/
    queryParams +=
      "&" + encodeURIComponent("nx") + "=" + encodeURIComponent(rs.x); /**/
    queryParams +=
      "&" + encodeURIComponent("ny") + "=" + encodeURIComponent(rs.y); /**/
    //console.log(queryParams);
    xhr.open("GET", url + queryParams);

    xhr.onreadystatechange = function () {
      if (this.readyState == 4) {
        // 데이터를 성공적으로 받아온 경우
        console.log(JSON.parse(this.response));
        let items = JSON.parse(this.response).response.body.items.item;
        console.log(items);
        if (this.status == 200 && items != undefined) {
          let extractedData = [];
          for (let item of items) {
            const { category, obsrValue } = item;
            extractedData.push({ category, obsrValue });
          }
          resolve(extractedData); // Promise를 이용해 데이터 반환
        } else {
          reject("Failed to retrieve weather data"); // 실패 시 reject 호출
        }
      }
    };

    xhr.send("");
  });
}
function getDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0"); // 월은 0부터 시작하므로 +1
  const day = now.getDate().toString().padStart(2, "0");
  return `${year}${month}${day}`;
}
function getOneHourBeforeTime() {
  const now = new Date();

  // 현재 시간에서 1시간을 뺀 시간을 얻습니다.
  const oneHourBefore = new Date(now.getTime() - 60 * 60 * 1000);

  const hours = oneHourBefore.getHours().toString().padStart(2, "0");
  const minutes = oneHourBefore.getMinutes().toString().padStart(2, "0");

  return `${hours}${minutes}`;
}

function getGeolocation() {
  return new Promise((resolve, reject) => {
    const navi = navigator.geolocation;
    navi.getCurrentPosition(
      (position) => {
        resolve(position);
      },
      (error) => {
        reject("위치 정보를 가져오는데 실패했습니다.");
      }
    );
  });
}

//--
var RE = 6371.00877; // 지구 반경(km)
var GRID = 5.0; // 격자 간격(km)
var SLAT1 = 30.0; // 투영 위도1(degree)
var SLAT2 = 60.0; // 투영 위도2(degree)
var OLON = 126.0; // 기준점 경도(degree)
var OLAT = 38.0; // 기준점 위도(degree)
var XO = 43; // 기준점 X좌표(GRID)
var YO = 136; // 기1준점 Y좌표(GRID)
//
// LCC DFS 좌표변환 ( code : "toXY"(위경도->좌표, v1:위도, v2:경도), "toLL"(좌표->위경도,v1:x, v2:y) )
//

function dfs_xy_conv(code, v1, v2) {
  var DEGRAD = Math.PI / 180.0;
  var RADDEG = 180.0 / Math.PI;

  var re = RE / GRID;
  var slat1 = SLAT1 * DEGRAD;
  var slat2 = SLAT2 * DEGRAD;
  var olon = OLON * DEGRAD;
  var olat = OLAT * DEGRAD;

  var sn =
    Math.tan(Math.PI * 0.25 + slat2 * 0.5) /
    Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  var sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  var ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);
  var rs = {};
  if (code == "toXY") {
    rs["lat"] = v1;
    rs["lng"] = v2;
    var ra = Math.tan(Math.PI * 0.25 + v1 * DEGRAD * 0.5);
    ra = (re * sf) / Math.pow(ra, sn);
    var theta = v2 * DEGRAD - olon;
    if (theta > Math.PI) theta -= 2.0 * Math.PI;
    if (theta < -Math.PI) theta += 2.0 * Math.PI;
    theta *= sn;
    rs["x"] = Math.floor(ra * Math.sin(theta) + XO + 0.5);
    rs["y"] = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
  } else {
    rs["x"] = v1;
    rs["y"] = v2;
    var xn = v1 - XO;
    var yn = ro - v2 + YO;
    ra = Math.sqrt(xn * xn + yn * yn);
    if (sn < 0.0) -ra;
    var alat = Math.pow((re * sf) / ra, 1.0 / sn);
    alat = 2.0 * Math.atan(alat) - Math.PI * 0.5;

    if (Math.abs(xn) <= 0.0) {
      theta = 0.0;
    } else {
      if (Math.abs(yn) <= 0.0) {
        theta = Math.PI * 0.5;
        if (xn < 0.0) -theta;
      } else theta = Math.atan2(xn, yn);
    }
    var alon = theta / sn + olon;
    rs["lat"] = alat * RADDEG;
    rs["lng"] = alon * RADDEG;
  }
  return rs;
}
const exporting = async () => {
  try {
    const position = await getGeolocation();
    const extractedData = await searchWeather(position);
    console.log("작업완료");
    // 이곳에서 extractedData를 활용하여 원하는 작업 수행
    return extractedData; // exporting 함수의 반환값으로 extractedData를 사용할 수 있음
  } catch (error) {
    console.error(error);
    // 에러 처리
    return null; // 또는 다른 에러 처리 방식에 따라 적절한 값 반환
  }
};

window.exporting = exporting;
window.exporting = getDate();
window.exporting = getGeolocation();
