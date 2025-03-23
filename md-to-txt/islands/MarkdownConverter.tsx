import { useSignal } from "@preact/signals";
import { useState, useRef } from "preact/hooks";

export default function MarkdownConverter() {
  const inputText = useSignal("");
  const outputText = useSignal("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [filename, setFilename] = useState<string | null>(null);
  const [removeEmptyLines, setRemoveEmptyLines] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;
    
    const file = target.files[0];
    await processFile(file);
  };

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
      setError("请上传.md或.markdown格式的文件");
      return;
    }
    
    try {
      const text = await file.text();
      inputText.value = text;
      setFilename(file.name);
      setError("");
    } catch (err) {
      setError("读取文件失败");
      console.error(err);
    }
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (!e.dataTransfer?.files.length) return;
    
    const file = e.dataTransfer.files[0];
    await processFile(file);
  };

  const handleConvert = async () => {
    if (!inputText.value.trim()) {
      setError("请输入Markdown内容或上传文件");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          markdown: inputText.value,
          filename: filename,
          removeEmptyLines
        }),
      });
      
      if (!response.ok) {
        throw new Error("转换失败");
      }
      
      const data = await response.json();
      outputText.value = data.text;
    } catch (err) {
      setError(err instanceof Error ? err.message : "转换过程中发生错误");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="flex flex-col gap-4">
        <div>
          <label 
            htmlFor="markdown-input" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Markdown 内容
          </label>
          <div className="mb-2">
            <label className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              上传Markdown文件
              <input
                type="file"
                accept=".md,.markdown"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
          <div 
            ref={dropRef}
            className={`relative ${isDragging ? 'bg-blue-50 border-blue-300' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-80 border-2 border-dashed border-blue-300 rounded-md z-10">
                <p className="text-blue-500 font-medium">释放文件以上传</p>
              </div>
            )}
            <textarea
              id="markdown-input"
              value={inputText.value}
              onInput={(e) => inputText.value = (e.target as HTMLTextAreaElement).value}
              className="w-full h-60 p-2 border border-gray-300 rounded-md"
              placeholder="在这里粘贴您的Markdown内容或拖放文件到此处..."
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remove-empty-lines"
              checked={removeEmptyLines}
              onChange={() => setRemoveEmptyLines(!removeEmptyLines)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remove-empty-lines" className="ml-2 block text-sm text-gray-700">
              去除空行
            </label>
          </div>
          
          <button
            onClick={handleConvert}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isLoading ? "转换中..." : "转换为纯文本"}
          </button>
        </div>
        
        {error && (
          <div className="text-red-500 text-center">{error}</div>
        )}
        
        {outputText.value && (
          <div>
            <label 
              htmlFor="text-output" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              纯文本结果
            </label>
            <textarea
              id="text-output"
              value={outputText.value}
              readOnly
              className="w-full h-60 p-2 border border-gray-300 rounded-md"
            />
            <div className="mt-2 flex justify-end space-x-2">
              <button
                onClick={() => {
                  const blob = new Blob([outputText.value], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'converted-text.txt';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200"
              >
                下载TXT文件
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(outputText.value);
                }}
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                复制到剪贴板
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 