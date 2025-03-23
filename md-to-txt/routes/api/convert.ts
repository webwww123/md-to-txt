/// <reference lib="deno.unstable" />

import { Handlers } from "$fresh/server.ts";
import removeMarkdown from "remove-markdown";

interface ConvertRequest {
  markdown: string;
  filename?: string; // 可选的文件名
  removeEmptyLines?: boolean; // 是否去除空行
}

// 打开KV数据库
const kv = await Deno.openKv();

/**
 * 去除文本中的空行
 */
function removeEmptyLinesFromText(text: string): string {
  return text
    .split('\n')
    .filter(line => line.trim() !== '')
    .join('\n');
}

export const handler: Handlers = {
  async POST(req) {
    try {
      const body: ConvertRequest = await req.json();
      
      if (!body.markdown) {
        return new Response(
          JSON.stringify({ error: "缺少Markdown内容" }),
          { 
            status: 400, 
            headers: { "Content-Type": "application/json" }
          }
        );
      }

      // 使用remove-markdown库将markdown转换为纯文本
      let plainText = removeMarkdown(body.markdown);
      
      // 如果需要去除空行
      if (body.removeEmptyLines) {
        plainText = removeEmptyLinesFromText(plainText);
      }
      
      // 保存到KV数据库，用时间戳作为键的一部分
      const timestamp = new Date().toISOString();
      const key = ["conversions", timestamp];
      
      await kv.set(key, {
        timestamp,
        filename: body.filename || "手动输入",
        markdownLength: body.markdown.length,
        textLength: plainText.length,
        sample: plainText.substring(0, 100) + (plainText.length > 100 ? "..." : ""),
        fullText: plainText, // 存储完整的转换结果
        originalMarkdown: body.markdown, // 保存原始Markdown
        options: {
          removeEmptyLines: !!body.removeEmptyLines
        }
      });
      
      return new Response(
        JSON.stringify({ text: plainText }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json" }
        }
      );
    } catch (error) {
      console.error("转换出错:", error);
      
      return new Response(
        JSON.stringify({ error: "处理请求时出错" }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json" }
        }
      );
    }
  },
};