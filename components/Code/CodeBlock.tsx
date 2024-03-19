// import hljs from "highlight.js/lib/core"
import "prismjs/themes/prism-okaidia.min.css"
import Prism from "prismjs"

import "prismjs/components/prism-jsx"
import "prismjs/components/prism-tsx"
import "prismjs/components/prism-typescript"
import "prismjs/plugins/line-highlight/prism-line-highlight"
import "prismjs/plugins/line-numbers/prism-line-numbers"

import "prismjs/plugins/line-highlight/prism-line-highlight.min.css"
import "prismjs/plugins/line-numbers/prism-line-numbers.min.css"
import React, { useEffect, useRef } from "react"

export interface ICodeBlockProps {
  code: string
  /** 高亮的行数：5, [1, 2, 3] 1-5 */
  highlightLines?: (number | string)[]
  /** 语言类型 https://prismjs.com/ */
  language?: string
}

export function CodeBlock({
  code,
  highlightLines = [],
  language = "js"
}: ICodeBlockProps) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current && code) {
      Prism.highlightElement(ref.current)
    }
  }, [code])

  return (
    <pre className="line-numbers" data-line={highlightLines.join()}>
      <code ref={ref} className={`prism-code language-${language}`}>
        {code}
      </code>
    </pre>
  )
}
