const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Nạp biến môi trường từ BE/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

const SYSTEM_PROMPT = `Bạn là "MamaAI" - Chuyên gia Y khoa & Trợ lý Tâm lý Thai kỳ thông minh của hệ sinh thái MamaCare, được tăng cường bởi mô hình AI DeepSeek.

Nhiệm vụ và phong cách của bạn:
1. Luôn lắng nghe với sự thấu cảm sâu sắc, dịu dàng, ân cần và khoa học. Xưng hô là "MamaAI" và gọi người dùng là "mẹ", "mẹ yêu" hoặc "mẹ bầu".
2. Tra cứu, tìm kiếm và cung cấp câu trả lời chuẩn y khoa về thai kỳ: dinh dưỡng theo từng tuần thai, bài tập vận động an toàn, giải đáp các triệu chứng thể chất (nghén, chuột rút, đau lưng, khó ngủ, rạn da) và chăm sóc tinh thần mẹ bầu.
3. Khi mẹ hỏi về các vấn đề thường gặp hoặc tra cứu kiến thức, hãy giải thích rõ nguyên nhân cơ chế sinh học một cách dễ hiểu và đưa ra giải pháp chăm sóc thực tế, an toàn.
4. Nhắc nhở mẹ bầu đi khám hoặc liên hệ bác sĩ chuyên khoa sản nếu có các dấu hiệu nguy hiểm (chảy máu, đau bụng dữ dội, sốt cao, thai máy ít).
5. Trả lời bằng tiếng Việt chuẩn mực, giàu cảm xúc, có thể dùng emoji hoa lá 🌸✨❤️ để mang lại cảm giác ấm áp và bình yên.`;

/**
 * Gọi API DeepSeek để sinh câu trả lời và tra cứu thông tin
 * @param {string} userMessage - Câu hỏi hoặc tâm sự của mẹ bầu
 * @param {Array} history - Lịch sử trò chuyện gần nhất [{ role: 'user'|'assistant', content: string }]
 * @returns {Promise<{ success: boolean, reply: string, provider: string, model: string, error?: string }>}
 */
async function queryDeepSeek(userMessage, history = []) {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    return {
      success: false,
      isFallback: true,
      error: 'Chưa cấu hình DEEPSEEK_API_KEY trong hệ thống'
    };
  }

  // Chuẩn hóa định dạng messages theo OpenAI/DeepSeek API standard
  const formattedHistory = (Array.isArray(history) ? history : [])
    .slice(-6)
    .map(h => ({
      role: h.sender === 'user' ? 'user' : 'assistant',
      content: String(h.text || h.content || '')
    }))
    .filter(m => m.content.trim() !== '');

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...formattedHistory,
    { role: 'user', content: userMessage.trim() }
  ];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

  try {
    console.log(`[DeepSeek] Đang gửi yêu cầu tra cứu AI tới ${DEEPSEEK_API_URL} (Model: ${DEEPSEEK_MODEL})...`);

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 1200,
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[DeepSeek API Error] HTTP ${response.status}:`, errText);
      return {
        success: false,
        isFallback: true,
        error: `DeepSeek API phản hồi lỗi (${response.status}): ${errText}`
      };
    }

    const data = await response.json();
    const replyContent = data?.choices?.[0]?.message?.content;

    if (replyContent && replyContent.trim()) {
      console.log(`[DeepSeek] Đã nhận phản hồi thành công từ DeepSeek API!`);
      return {
        success: true,
        reply: replyContent.trim(),
        provider: 'DeepSeek AI',
        model: data.model || DEEPSEEK_MODEL
      };
    }

    return {
      success: false,
      isFallback: true,
      error: 'DeepSeek không trả về nội dung hợp lệ'
    };
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('[DeepSeek Network Error]:', err.message);
    return {
      success: false,
      isFallback: true,
      error: err.message
    };
  }
}

/**
 * Cơ chế Fallback tri thức thai kỳ y khoa chuẩn đoán (Khi chưa có key hoặc mạng chập chờn)
 */
function getMedicalFallbackReply(cleanMsg) {
  const lowerMsg = cleanMsg.toLowerCase();

  if (lowerMsg.includes('đau lưng') || lowerMsg.includes('mỏi lưng') || lowerMsg.includes('thắt lưng')) {
    return `🌸 **MamaAI Tra Cứu Thông Tin Giảm Đau Lưng Cho Mẹ:**

1. **Nguyên nhân y khoa:** Do hormone Relaxin làm giãn dây chằng vùng chậu và trọng lượng tử cung tăng kéo trọng tâm cơ thể về phía trước.
2. **Giải pháp khoa học tức thì:**
   - **Tư thế ngủ:** Nằm nghiêng bên trái, đặt một chiếc gối ôm hình chữ U kẹp giữa 2 đùi và đỡ dưới bụng.
   - **Massage giảm áp lực:** Nhờ bố xoa bóp nhẹ nhàng vùng thắt lưng và cơ mông theo chuyển động tròn bằng dầu dừa/dầu tràm ấm.
   - **Chườm ấm:** Dùng túi chườm nước ấm 40°C áp vào thắt lưng trong 15-20 phút trước khi ngủ.
   - **Vận động:** Tập tư thế "Con mèo - Con bò" (Cat-Cow Pose) 5 phút mỗi sáng để kéo giãn nhẹ nhàng cột sống.

Mẹ thử áp dụng ngay tối nay nhé, MamaAI luôn ở đây đồng hành cùng mẹ! ❤️`;
  }

  if (lowerMsg.includes('khó ngủ') || lowerMsg.includes('mất ngủ') || lowerMsg.includes('trằn trọc')) {
    return `🌸 **MamaAI Tra Cứu Giải Pháp Giúp Mẹ Bầu Ngủ Ngon Sâu Giấc:**

1. **Chu kỳ sinh học:** Sự biến thiên của Progesterone kết hợp với triệu chứng ợ nóng và thai đạp có thể khiến mẹ khó vào giấc.
2. **Liệu trình thư giãn 4 bước trước giờ ngủ:**
   - **Bước 1:** Ngâm chân với nước ấm pha một chút muối khoáng hoặc vài lát gừng trong 15 phút.
   - **Bước 2:** Uống một cốc sữa hạt ấm (sữa hạnh nhân hoặc yến mạch) trước giờ ngủ 45 phút để bổ sung tryptophan tự nhiên.
   - **Bước 3:** Vào mục **"Không Gian Thở"** trên MamaCare, bật bài nhạc sóng não 432Hz hoặc tiếng mưa rào nhẹ.
   - **Bước 4:** Thực hành bài tập thở 4-7-8 để đưa hệ thần kinh đối giao cảm vào trạng thái an tĩnh.

Chúc mẹ và bé con có một giấc ngủ thật êm đềm và an lành đêm nay! ✨`;
  }

  if (lowerMsg.includes('nghén') || lowerMsg.includes('nôn') || lowerMsg.includes('buồn nôn')) {
    return `🌸 **MamaAI Tra Cứu Cách Làm Dịu Cơn Ốm Nghén Thai Kỳ:**

1. **Cơ chế:** Nồng độ hormone hCG tăng nhanh trong tam cá nguyệt đầu tiên làm tăng độ nhạy cảm của khứu giác và dạ dày.
2. **Bí quyết kiểm soát cơn nghén chuẩn y khoa:**
   - **Chia nhỏ bữa ăn:** Ăn 5-6 bữa nhỏ/ngày, không bao giờ để bụng quá đói hoặc quá no.
   - **Bánh quy khô đầu giường:** Trước khi bước chân ra khỏi giường vào buổi sáng, hãy nhấm nháp 1-2 mẩu bánh quy mặn hoặc bánh mì nướng khô.
   - **Trà gừng ấm mật ong:** Nhấm từng ngụm nhỏ trà gừng tươi ấm giúp ức chế cảm giác buồn nôn rất hiệu quả.
   - **Tránh mùi kích ứng:** Hạn chế các món chiên xào nhiều dầu mỡ, đồ cay nồng; ưu tiên ăn nguội vì thức ăn nóng bốc nhiều mùi hơn.

Cố gắng lên mẹ nhé, thông thường sau tuần 12 - 14 cơn ốm nghén sẽ giảm đi rõ rệt! 🌿`;
  }

  if (lowerMsg.includes('chồng') || lowerMsg.includes('vô tâm') || lowerMsg.includes('tủi thân') || lowerMsg.includes('buồn')) {
    return `🌸 **MamaAI Lắng Nghe & Ôm Mẹ Thật Chặt:**

Mẹ ơi, mang thai là giai đoạn lượng hormone Estrogen & Progesterone tăng vọt, khiến mẹ nhạy cảm và dễ tổn thương hơn người bình thường gấp nhiều lần. Cảm xúc tủi thân của mẹ là hoàn toàn có thật và rất đáng được trân trọng, không phải do mẹ "khó tính" hay "yếu đuối" đâu ạ.

Đôi khi các ông bố rất yêu thương mẹ nhưng lại thiếu kinh nghiệm quan sát và không biết cơ thể mẹ đang đau nhức ở đâu. 
💡 **Gợi ý nhỏ cho mẹ:** Hãy mở mục **"Hồ Sơ Ghép Đôi"**, kết nối mã của mẹ với ứng dụng của Bố. Hệ thống MamaCare sẽ tự động gửi thông báo thời tiết cảm xúc và nhắc nhở bố chủ động bóp chân, pha nước ấm hoặc rửa bát đỡ mẹ tối nay. Mẹ hãy cứ thả lỏng và yêu thương bản thân nhiều hơn nhé! ❤️`;
  }

  // Câu trả lời tổng quát chuẩn y khoa
  return `🌸 **MamaAI Luôn Ở Đây Cùng Mẹ:**

MamaAI đã lắng nghe câu hỏi của mẹ: *"${cleanMsg}"*.

Trong thai kỳ, mọi thay đổi dù là nhỏ nhất về thể chất lẫn cảm xúc đều đóng vai trò quan trọng đối với sự phát triển của em bé. Mẹ hãy chú ý:
- Uống đủ 2 - 2.5 lít nước ấm mỗi ngày.
- Bổ sung đều đặn vi chất (sắt, canxi, acid folic, DHA) theo chỉ định của bác sĩ.
- Lắng nghe cơ thể và dành ít nhất 30 phút mỗi ngày để thư giãn, nghe nhạc hoặc tập bài thở 4-7-8.

*(💡 Mẹo: Hệ thống đã tích hợp sẵn API DeepSeek. Để nhận được phân tích chuyên sâu tìm kiếm theo thời gian thực từ mô hình AI DeepSeek, mẹ có thể thêm khóa DEEPSEEK_API_KEY vào tệp BE/.env).*

Mẹ muốn MamaAI tìm kiếm hay giải đáp chi tiết hơn về vấn đề nào, cứ gửi tin nhắn cho mình nhé! ✨`;
}

module.exports = {
  queryDeepSeek,
  getMedicalFallbackReply
};
