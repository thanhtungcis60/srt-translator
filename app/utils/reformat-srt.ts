export default function ReformatSRT(srt: string) {
    const fixedContent = fixSrtDinsLines(srt);
    return fixedContent;
}
const fixSrtDinsLines = (text: string): string => {
    // Regex tìm vị trí: Dòng chữ -> Xuống dòng -> Số ID -> Xuống dòng -> Thời gian
    // Mục tiêu: Chèn thêm 1 dấu xuống dòng trước Số ID
    const regex = /([^\r\n])\r?\n(\d+)\r?\n(\d{2}:\d{2}:\d{2},\d{3})/g;
    return text.replace(regex, '$1\n\n$2\n$3');
  };