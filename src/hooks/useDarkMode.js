import { useThemeStore } from '../stores/themeStore'

export const useDarkMode = () => {
  const { isDarkMode } = useThemeStore()

  const cardClass = isDarkMode ? 'card-dark' : 'card'
  const inputClass = isDarkMode ? 'input-dark' : 'input'
  const labelClass = isDarkMode ? 'label-dark' : 'label'
  const tableClass = isDarkMode ? 'table table-dark' : 'table'
  const textClass = isDarkMode ? 'text-gray-200' : 'text-gray-800'
  const mutedTextClass = isDarkMode ? 'text-gray-400' : 'text-gray-500'
  const bgClass = isDarkMode ? 'bg-[#1a2570]' : 'bg-white'
  const borderClass = isDarkMode ? 'border-[#2a3580]' : 'border-gray-200'

  return {
    isDarkMode,
    cardClass,
    inputClass,
    labelClass,
    tableClass,
    textClass,
    mutedTextClass,
    bgClass,
    borderClass,
  }
}
