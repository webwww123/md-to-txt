import { useState } from "preact/hooks";
import RecordDetails from "./RecordDetails.tsx";

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

export default function RecordRow({ record }: { record: ConversionRecord }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <>
      <tr class="hover:bg-gray-50">
        <td class="py-2 px-4 border-b">
          {new Date(record.timestamp).toLocaleString()}
        </td>
        <td class="py-2 px-4 border-b">{record.filename}</td>
        <td class="py-2 px-4 border-b">{record.markdownLength}</td>
        <td class="py-2 px-4 border-b">{record.textLength}</td>
        <td class="py-2 px-4 border-b">
          {record.options?.removeEmptyLines ? 
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800">
              去除空行
            </span> : null}
        </td>
        <td class="py-2 px-4 border-b">
          <div class="max-w-md truncate">{record.sample}</div>
        </td>
        <td class="py-2 px-4 border-b">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            class="px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
          >
            {isExpanded ? "收起" : "查看详情"}
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={7} class="p-0 border-b">
            <RecordDetails record={record} />
          </td>
        </tr>
      )}
    </>
  );
} 