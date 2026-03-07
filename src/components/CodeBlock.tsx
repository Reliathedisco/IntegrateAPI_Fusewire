import { useState } from "react"

interface Props {
  code: string
}

export default function CodeBlock({ code }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="codeBlock">
      <button
        type="button"
        className="codeBlockCopy"
        onClick={handleCopy}
        aria-label="Copy to clipboard"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  )
}
