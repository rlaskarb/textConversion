function handleFiles(files) {
  document.getElementById("fileCount").innerText =
    `총 ${files.length}개의 파일이 선택됨`;
  document.getElementById("convertBtn").disabled = false;
}

async function processFiles() {
  const input = document.getElementById("pdfInput");
  const log = document.getElementById("logArea");

  if (input.files.length === 0) return;

  log.innerHTML = "작업 시작...";

  for (let file of input.files) {
    try {
      log.innerHTML += `<br>Processing: ${file.name}...`;

      // 1. PDF에서 텍스트 추출
      const rawText = await extractTextFromPDF(file);

      // 2. 텍스트 파일(.txt)로 다운로드
      downloadTextFile(file.name, rawText);

      log.innerHTML += ` <span style="color:green">완료!</span>`;
    } catch (e) {
      console.error(e);
      log.innerHTML += ` <span style="color:red">실패!</span>`;
    }
  }
  log.innerHTML += `<br><br><b>모든 작업이 끝났습니다. 다운로드 폴더를 확인하세요.</b>`;
}

// PDF 텍스트 추출 함수 (꾸밈 없이 순수 텍스트만)
async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  let fullText = `파일명: ${file.name}\n-----------------------------------\n`;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    // 페이지 내의 텍스트 아이템들을 공백으로 연결
    // transform[5]는 y좌표인데, 이걸로 줄바꿈을 완벽히 구현하긴 어렵지만
    // 단순 텍스트 추출용으로는 join(" ")이나 join("\n")이 최선입니다.
    const pageText = textContent.items.map((item) => item.str).join("  ");

    fullText += `[Page ${i}]\n${pageText}\n\n`;
  }
  return fullText;
}

// .txt 파일 다운로드 함수
function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  // 확장자를 .pdf -> .txt 로 변경
  const newFileName = filename.replace(".pdf", "") + "_추출본.txt";

  link.setAttribute("href", url);
  link.setAttribute("download", newFileName);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
