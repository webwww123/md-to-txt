/// <reference lib="deno.unstable" />
import { Handlers, PageProps } from "$fresh/server.ts";
import RecordRow from "../../islands/RecordRow.tsx";

interface ConversionOptions {
  removeEmptyLines: boolean;
}

interface ConversionRecord {
  timestamp: string;
  filename: string;
  markdownLength: number;
  textLength: number;
  sample: string;
  fullText: string;
  originalMarkdown: string;
  options?: ConversionOptions;
}

interface AdminData {
  records: ConversionRecord[];
  total: number;
}

// 打开KV数据库
const kv = await Deno.openKv();

export const handler: Handlers<AdminData> = {
  async GET(req, ctx) {
    // 简单的验证，使用查询参数作为密码
    const url = new URL(req.url);
    const password = url.searchParams.get("pass");
    
    // 实际应用中应使用环境变量和更安全的验证方式
    if (password !== "admin123") {
      return new Response("未授权访问", { status: 401 });
    }
    
    // 获取转换记录
    const entries = kv.list<ConversionRecord>({ prefix: ["conversions"] });
    const records: ConversionRecord[] = [];
    let total = 0;
    
    for await (const entry of entries) {
      records.push(entry.value);
      total++;
    }
    
    // 按时间逆序排序
    records.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return ctx.render({ records, total });
  },
};

export default function AdminPage({ data }: PageProps<AdminData>) {
  const { records, total } = data;
  
  return (
    <div class="p-4 mx-auto max-w-screen-lg">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">管理后台 - 转换记录</h1>
        <div class="text-gray-600">共 {total} 条记录</div>
      </div>
      
      {records.length === 0 ? (
        <div class="text-center py-10 text-gray-500">暂无转换记录</div>
      ) : (
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border border-gray-300">
            <thead>
              <tr class="bg-gray-100">
                <th class="py-2 px-4 border-b text-left">时间</th>
                <th class="py-2 px-4 border-b text-left">来源</th>
                <th class="py-2 px-4 border-b text-left">Markdown长度</th>
                <th class="py-2 px-4 border-b text-left">文本长度</th>
                <th class="py-2 px-4 border-b text-left">使用选项</th>
                <th class="py-2 px-4 border-b text-left">内容预览</th>
                <th class="py-2 px-4 border-b text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <RecordRow key={record.timestamp} record={record} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 