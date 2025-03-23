import { useState } from "preact/hooks";

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

export default function RecordDetails({ record }: { record: ConversionRecord }) {
  const [activeTab, setActiveTab] = useState<'original' | 'converted'>('converted');
  
  return (
    <div class="bg-white p-4 border rounded-md shadow-sm mt-2 mb-4">
      <div class="flex border-b mb-4">
        <button 
          class={`px-4 py-2 ${activeTab === 'converted' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('converted')}
        >
          转换结果
        </button>
        <button 
          class={`px-4 py-2 ${activeTab === 'original' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('original')}
        >
          原始Markdown
        </button>
      </div>
      
      <div class="relative">
        <textarea 
          readOnly
          class="w-full h-72 p-2 border border-gray-300 rounded-md font-mono text-sm"
          value={activeTab === 'converted' ? record.fullText : record.originalMarkdown}
        />
        <div class="absolute top-2 right-2 flex">
          <button
            onClick={() => {
              const text = activeTab === 'converted' ? record.fullText : record.originalMarkdown;
              navigator.clipboard.writeText(text);
            }}
            class="bg-gray-100 hover:bg-gray-200 p-1 rounded"
            title="复制到剪贴板"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          </button>
          <button
            onClick={() => {
              const text = activeTab === 'converted' ? record.fullText : record.originalMarkdown;
              const blob = new Blob([text], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = activeTab === 'converted' 
                ? `converted-${record.filename.replace(/\.[^/.]+$/, "")}.txt` 
                : `original-${record.filename}`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            class="bg-gray-100 hover:bg-gray-200 p-1 rounded ml-1"
            title="下载文件"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 