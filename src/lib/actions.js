// 데이터를 바꾸는 동작 모음. 화면에서는 이 함수들만 부른다
import { buildDemoData } from './demo'
import { newId } from './id'
import { clearPhotos, deletePhoto, replacePhotos } from './photos'
import { emptyData } from './storage'
import { nowMinute } from './time'

export function makeActions(setData) {
  return {
    // 지금 있는 데이터를 모두 지우고 시연용 예시로 바꾼다
    loadDemo() {
      clearPhotos()
      setData(buildDemoData())
    },

    resetAll() {
      clearPhotos()
      setData(emptyData)
    },

    // 백업 파일의 내용으로 전부 바꾼다
    async restore(saved, photos) {
      await replacePhotos(photos)
      setData({ ...emptyData, ...saved })
    },

    // 사진 자체는 photos.js가 따로 저장하고, 여기에는 설명만 남긴다
    addAttachment(attachment) {
      const addedAt = new Date().toISOString()
      setData((d) => ({ ...d, attachments: [...d.attachments, { ...attachment, addedAt }] }))
    },

    deleteAttachment(id) {
      deletePhoto(id)
      setData((d) => ({ ...d, attachments: d.attachments.filter((a) => a.id !== id) }))
    },

    markBackup() {
      const at = new Date().toISOString()
      setData((d) => ({ ...d, lastBackupAt: at }))
    },

    saveWorkplace(wp) {
      const id = wp.id ?? newId()
      setData((d) => {
        const exists = d.workplaces.some((w) => w.id === id)
        const workplaces = exists
          ? d.workplaces.map((w) => (w.id === id ? { ...wp, id } : w))
          : [...d.workplaces, { ...wp, id }]
        return { ...d, workplaces, selectedWorkplaceId: d.selectedWorkplaceId ?? id }
      })
    },

    deleteWorkplace(id) {
      setData((d) => {
        const workplaces = d.workplaces.filter((w) => w.id !== id)
        const selectedWorkplaceId =
          d.selectedWorkplaceId === id ? (workplaces[0]?.id ?? null) : d.selectedWorkplaceId
        return { ...d, workplaces, selectedWorkplaceId, schedules: d.schedules.filter((s) => s.workplaceId !== id) }
      })
    },

    selectWorkplace(id) {
      setData((d) => ({ ...d, selectedWorkplaceId: id }))
    },

    clockIn() {
      const start = nowMinute()
      setData((d) => ({ ...d, active: { workplaceId: d.selectedWorkplaceId, start } }))
    },

    clockOut() {
      const end = nowMinute()
      const id = newId()
      setData((d) => {
        if (!d.active) return d
        const record = {
          id,
          workplaceId: d.active.workplaceId,
          start: d.active.start,
          end,
          source: 'button',
          createdAt: end,
          deleted: false,
          history: [],
        }
        return { ...d, active: null, records: [...d.records, record] }
      })
    },

    // 버튼을 못 눌렀을 때 나중에 직접 넣는 기록. 언제·왜 넣었는지 함께 남긴다
    addManualRecord({ workplaceId, start, end, reason }) {
      const record = {
        id: newId(),
        workplaceId,
        start,
        end,
        source: 'manual',
        createdAt: new Date().toISOString(),
        addReason: reason,
        deleted: false,
        history: [],
      }
      setData((d) => ({ ...d, records: [...d.records, record] }))
    },

    // 수정 전·후 시각, 수정 시점, 사유를 이력에 남긴다
    editRecord(id, { start, end, reason }) {
      const at = new Date().toISOString()
      setData((d) => ({
        ...d,
        records: d.records.map((r) =>
          r.id !== id
            ? r
            : {
                ...r,
                start,
                end,
                history: [
                  ...r.history,
                  { type: 'edit', at, reason, before: { start: r.start, end: r.end }, after: { start, end } },
                ],
              },
        ),
      }))
    },

    // 실제로 지우지 않고 '삭제됨'으로만 표시한다
    deleteRecord(id, reason) {
      const at = new Date().toISOString()
      setData((d) => ({
        ...d,
        records: d.records.map((r) =>
          r.id !== id
            ? r
            : {
                ...r,
                deleted: true,
                history: [...r.history, { type: 'delete', at, reason, before: { start: r.start, end: r.end } }],
              },
        ),
      }))
    },

    addSchedules(list) {
      const items = list.map((s) => ({ ...s, id: newId() }))
      setData((d) => ({ ...d, schedules: [...d.schedules, ...items] }))
    },

    setSudoku(game) {
      setData((d) => ({ ...d, sudoku: game }))
    },

    // 다 푼 판을 저장하고, 더 빨리 풀었으면 최고 기록을 바꾼다. 힌트를 쓴 판은 기록에 넣지 않는다
    finishSudoku(game) {
      setData((d) => {
        const best = d.sudokuBest ?? {}
        const record = best[game.level]
        const clean = (game.hinted ?? []).length === 0
        const sudokuBest = clean && (!record || game.elapsed < record) ? { ...best, [game.level]: game.elapsed } : best
        return { ...d, sudoku: game, sudokuBest }
      })
    },

    // 틀린 그림 찾기를 끝냈을 때: 더 빨리 찾았으면 최고 기록을 바꾼다
    finishSpot(level, seconds) {
      setData((d) => {
        const best = d.spotBest ?? {}
        const cleared = d.spotCleared ?? {}
        const faster = best[level] == null || seconds < best[level]
        return {
          ...d,
          spotCleared: { ...cleared, [level]: (cleared[level] ?? 0) + 1 },
          spotBest: faster ? { ...best, [level]: seconds } : best,
        }
      })
    },

    // 틀린 그림 찾기 그림을 열 때: 연 그림 수를 올려서 같은 그림이 다시 나오지 않게 한다
    seeSpot(level) {
      setData((d) => {
        const seen = d.spotSeen ?? {}
        return { ...d, spotSeen: { ...seen, [level]: (seen[level] ?? 0) + 1 } }
      })
    },

    savePayment(key, value) {
      setData((d) => ({ ...d, payments: { ...d.payments, [key]: value } }))
    },

    saveRequest(key, stage, value) {
      setData((d) => ({ ...d, requests: { ...d.requests, [key]: { ...d.requests[key], [stage]: value } } }))
    },

    // 사장님과 합의해서 쉰 날로 표시하거나 되돌린다 (표시한 시점도 남김)
    toggleScheduleOff(id) {
      const at = new Date().toISOString()
      setData((d) => ({
        ...d,
        schedules: d.schedules.map((s) => (s.id === id ? { ...s, off: !s.off, offAt: s.off ? null : at } : s)),
      }))
    },

    deleteSchedule(id) {
      setData((d) => ({ ...d, schedules: d.schedules.filter((s) => s.id !== id) }))
    },
  }
}
