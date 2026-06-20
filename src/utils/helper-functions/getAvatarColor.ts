export const getAvatarColor = (name: string) => {
  const colors = [
    'bg-red-500/10 text-red-600 dark:text-red-400',
    'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400',
    'bg-pink-500/10 text-pink-600 dark:text-pink-400',
    'bg-rose-500/10 text-rose-600 dark:text-rose-400'
  ]

  const index = name ? name.charCodeAt(0) % colors.length : 0

  return colors[index]
}
