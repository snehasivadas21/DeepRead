import { Citation, Message } from "@/types/chat";

interface MessageBubbleProps {
  message: Message;
  onCitationClick: (citation: Citation) => void;
}

export default function MessageBubble({
  message,
  onCitationClick,
}: MessageBubbleProps) {
  const parts = message.content.split(
    /(\[\d+\])/g,
  );

  return (
    <div>
      <div
        className={
          message.role === "user"
            ? "ml-auto max-w-[80%] rounded-xl bg-black px-4 py-3 text-sm text-white"
            : "mr-auto max-w-[80%] rounded-xl border bg-white px-4 py-3 text-sm text-gray-800"
        }
      >
        <div className="whitespace-pre-wrap">
          {parts.map((part, index) => {
            const match = part.match(
              /^\[(\d+)\]$/,
            );

            if (!match) {
              return (
                <span key={index}>
                  {part}
                </span>
              );
            }

            const citationNumber = Number(
              match[1],
            );

            const citation =
              message.citations?.find(
                (item) =>
                  item.citation_id ===
                  citationNumber,
              );

            if (!citation) {
              return (
                <span key={index}>
                  {part}
                </span>
              );
            }

            return (
              <button
                key={index}
                type="button"
                onClick={() =>
                  onCitationClick(citation)
                }
                className="mx-0.5 text-xs font-semibold text-blue-600 hover:underline"
              >
                [{citationNumber}]
              </button>
            );
          })}
        </div>
      </div>

      {message.role === "assistant" &&
        message.citations &&
        message.citations.length > 0 && (
          <div className="mt-2 mr-auto max-w-[80%]">
            <p className="mb-1 text-xs font-medium text-gray-500">
              Sources
            </p>

            <div className="flex flex-wrap gap-2">
              {message.citations.map(
                (citation) => (
                  <button
                    key={`${message.id}-${citation.citation_id}`}
                    type="button"
                    onClick={() =>
                      onCitationClick(
                        citation,
                      )
                    }
                    className="rounded-md border bg-white px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                  >
                    {citation.source_name}
                    {" · "}
                    Page{" "}
                    {citation.page_number}
                  </button>
                ),
              )}
            </div>
          </div>
        )}
    </div>
  );
}
