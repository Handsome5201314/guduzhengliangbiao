import { decrypt } from '@/lib/crypto';
import { db } from '@/lib/db';

export async function callDomesticAIModel(prompt: string, provider: 'SOPHGO' | 'SILICONFLOW') {
  const keyName = `${provider}_API_KEY`;
  
  const config = await db.systemConfig.findUnique({ where: { keyName } });
  if (!config) throw new Error(`未配置 ${provider} 的 API Key，请联系管理员`);

  const apiKey = decrypt(config.keyValue);

  const endpoint = provider === 'SOPHGO' 
    ? 'https://api.sophgo.com/v1/chat/completions' 
    : 'https://api.siliconflow.cn/v1/chat/completions';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: provider === 'SOPHGO' ? 'qwen-2.5-72b' : 'deepseek-v3', // 示例模型
      messages: [{ role: 'user', content: prompt }]
    })
  });
  
  return await response.json();
}
