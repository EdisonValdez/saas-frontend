/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { FC } from 'react'
import remarkGfm from 'remark-gfm'
import { MessageCodeBlock } from './message-codeblock'
import { MessageMarkdownMemoized } from './message-markdown-memoized'

interface MessageMarkdownProps {
    content: string
}

export const MessageMarkdown: FC<MessageMarkdownProps> = ({ content }) => {
    return (
        <MessageMarkdownMemoized
            className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 min-w-full space-y-6 break-words"
            remarkPlugins={[remarkGfm]}
            components={{
                p({ children }) {
                    return <p className="mb-2 last:mb-0">{children}</p>
                },
                img({ node, ...props }) {
                    return <img className="max-w-[67%]" {...props} />
                },
                /* Tables */
                table({ children }) {
                    return (
                        <div className="overflow-x-auto my-4">
                            <table className="min-w-full border border-gray-300 dark:border-gray-600">{children}</table>
                        </div>
                    )
                },
                code({ node, className, children, ...props }) {
                    // Convert children to an array of ReactNode
                    const childArray = React.Children.toArray(children)
                    const firstChild = childArray[0]

                    // Check if firstChild is a ReactElement and has props
                    const firstChildAsString =
                        React.isValidElement(firstChild) &&
                        'props' in firstChild &&
                        firstChild.props !== null &&
                        typeof firstChild.props === 'object'
                            ? (firstChild.props as { children: unknown }).children
                            : firstChild

                    if (firstChildAsString === '▍') {
                        return <span className="mt-1 animate-pulse cursor-default">▍</span>
                    }

                    if (typeof firstChildAsString === 'string') {
                        childArray[0] = firstChildAsString.replace('`▍`', '▍')
                    }

                    const match = /language-(\w+)/.exec(className || '')

                    if (typeof firstChildAsString === 'string' && !firstChildAsString.includes('\n')) {
                        return (
                            <code className={className} {...props}>
                                {childArray}
                            </code>
                        )
                    }

                    return (
                        <MessageCodeBlock
                            key={Math.random()}
                            language={(match && match[1]) || ''}
                            value={String(childArray).replace(/\n$/, '')}
                            {...props}
                        />
                    )
                },
            }}
        >
            {content}
        </MessageMarkdownMemoized>
    )
}
