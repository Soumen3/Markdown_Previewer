import { useCallback } from 'react'

export const useMarkdownOperations = (textareaRef, setMarkdownText) => {
  // Basic toolbar functions with improved markdown insertion
  const applyMarkdown = useCallback((markdownSyntax, placeholder, closingSyntax = markdownSyntax) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentText = textarea.value

    let newText
    if (start === end) { // No text selected
      newText = currentText.substring(0, start) + markdownSyntax + placeholder + closingSyntax + currentText.substring(end)
      setMarkdownText(newText)
      // Position cursor in the middle of the inserted syntax
      setTimeout(() => {
        textarea.selectionStart = start + markdownSyntax.length
        textarea.selectionEnd = start + markdownSyntax.length + placeholder.length
        textarea.focus()
      }, 0)
    } else { // Text selected
      const selectedText = currentText.substring(start, end)
      newText = currentText.substring(0, start) + markdownSyntax + selectedText + closingSyntax + currentText.substring(end)
      setMarkdownText(newText)
      // Keep the selected text highlighted
      setTimeout(() => {
        textarea.selectionStart = start
        textarea.selectionEnd = end + markdownSyntax.length + closingSyntax.length
        textarea.focus()
      }, 0)
    }
  }, [textareaRef, setMarkdownText])

  const insertMarkdown = useCallback((syntax) => {
    switch (syntax) {
      case 'bold':
        applyMarkdown('**', 'bold text')
        break
      case 'italic':
        applyMarkdown('*', 'italic text')
        break
      case 'code':
        applyMarkdown('`', 'code')
        break
      case 'heading':
        applyMarkdown('## ', 'Heading', '')
        break
      case 'link':
        applyMarkdown('[', 'link text', '](url)')
        break
      case 'list':
        applyMarkdown('- ', 'list item', '')
        break
      case 'quote':
        applyMarkdown('> ', 'quote', '')
        break
      default:
        return
    }
  }, [applyMarkdown])

  return {
    insertMarkdown,
    applyMarkdown
  }
}

export default useMarkdownOperations
