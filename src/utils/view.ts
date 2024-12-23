import { format } from 'd3-format'
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn.js'

dayjs.locale('zh-cn')
dayjs.extend(relativeTime)

export function avatarUrl(template: string, size: number = 96) {
  return template.replace(/^\//, 'https://linux.do/')
    .replace('{size}', size.toString());
}

export function formatNumber(value?: number) {
  if (typeof value === 'undefined') return ''
  if (value < 1e3) return value
  return format('.2s')(value)
}

export function formatDate(date: string) {
  if (!date) return ''
  return dayjs(date).toNow(true)
}
