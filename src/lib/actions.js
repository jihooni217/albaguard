// 데이터를 바꾸는 동작 모음. 화면에서는 이 함수들만 부른다
import { buildDemoData } from './demo'
import { newId } from './id'
import { clearPhotos, deletePhoto, replacePhotos } from './photos'
import { emptyData } from './storage'
import { nowMinute } from './time'
import { clockInPayload, recordPayload } from './stamp'

// 기록 등록 대기열에 넣는다. 보내는 일은 App.jsx가 한다(인터넷이 될 때). 등록을 꺼 뒀으면 넣지 않는다
function queue(d, recordId, stage, payload) {
  if (d.stampOff) return d
  return {
    ...d,
    deviceId: d.deviceId ?? newId(),
    pendingStamps: [...(d.pendingStamps ?? []), { recordId, stage, payload }],
  }
}

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
      const id = newId() // 퇴근하면 이 번호의 기록이 된다. 출근 시각도 그때 바로 등록해 둔다
      setData((d) => {
        const active = { id, workplaceId: d.selectedWorkplaceId, start }
        return queue({ ...d, active }, id, 'clockIn', clockInPayload(active))
      })
    },

    clockOut() {
      const end = nowMinute()
      const fallback = newId()
      setData((d) => {
        if (!d.active) return d
        const record = {
          id: d.active.id ?? fallback,
          workplaceId: d.active.workplaceId,
          start: d.active.start,
          end,
          source: 'button',
          createdAt: end,
          deleted: false,
          history: [],
        }
        return queue({ ...d, active: null, records: [...d.records, record] }, record.id, 'record', recordPayload(record))
      })
    },

    // 퇴근 버튼을 잊었을 때: 퇴근 시각을 직접 넣어 끝낸다. "나중에 입력"으로 표시되고 입력 시점·사유가 남는다
    clockOutAt(end, reason) {
      const fallback = newId()
      setData((d) => {
        if (!d.active) return d
        const record = {
          id: d.active.id ?? fallback,
          workplaceId: d.active.workplaceId,
          start: d.active.start,
          end,
          source: 'manual',
          addReason: reason,
          createdAt: nowMinute(),
          deleted: false,
          history: [],
        }
        return queue({ ...d, active: null, records: [...d.records, record] }, record.id, 'record', recordPayload(record))
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
      setData((d) => queue({ ...d, records: [...d.records, record] }, record.id, 'record', recordPayload(record)))
    },

    // 수정 전·후 시각, 수정 시점, 사유를 이력에 남긴다. 바뀐 내용도 새로 등록한다
    editRecord(id, { start, end, reason }) {
      const at = new Date().toISOString()
      setData((d) => {
        let changed = null
        const records = d.records.map((r) => {
          if (r.id !== id) return r
          changed = {
            ...r,
            start,
            end,
            history: [...r.history, { type: 'edit', at, reason, before: { start: r.start, end: r.end }, after: { start, end } }],
          }
          return changed
        })
        return changed ? queue({ ...d, records }, id, 'record', recordPayload(changed)) : d
      })
    },

    // 실제로 지우지 않고 '삭제됨'으로만 표시한다. 삭제된 상태도 등록한다
    deleteRecord(id, reason) {
      const at = new Date().toISOString()
      setData((d) => {
        let changed = null
        const records = d.records.map((r) => {
          if (r.id !== id) return r
          changed = {
            ...r,
            deleted: true,
            history: [...r.history, { type: 'delete', at, reason, before: { start: r.start, end: r.end } }],
          }
          return changed
        })
        return changed ? queue({ ...d, records }, id, 'record', recordPayload(changed)) : d
      })
    },

    // 설정 탭: 기록 등록 켜기/끄기
    setGamesHidden(hidden) {
      setData((d) => ({ ...d, gamesHidden: hidden }))
    },
    setStampOff(off) {
      setData((d) => ({ ...d, stampOff: off }))
    },

    // 서버에 보낸 지문을 대기열에서 빼고 등록된 목록에 넣는다
    stampDone(item, { id, at, hash }) {
      setData((d) => ({
        ...d,
        pendingStamps: (d.pendingStamps ?? []).filter(
          (p) => !(p.recordId === item.recordId && p.stage === item.stage && JSON.stringify(p.payload) === JSON.stringify(item.payload)),
        ),
        stamps: {
          ...(d.stamps ?? {}),
          [item.recordId]: [...((d.stamps ?? {})[item.recordId] ?? []), { hash, at, serverId: id, stage: item.stage }],
        },
      }))
    },

    addSchedules(list) {
      const items = list.map((s) => ({ ...s, id: newId() }))
      setData((d) => ({ ...d, schedules: [...d.schedules, ...items] }))
    },

    setSudoku(game) {
      setData((d) => ({ ...d, sudoku: game }))
    },

    // 블록 채우기 판을 저장한다. 점수가 최고 기록을 넘으면 바로 최고 기록이 된다
    setBlock(game) {
      setData((d) => ({ ...d, block: game, blockBest: Math.max(d.blockBest ?? 0, game?.score ?? 0) }))
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
