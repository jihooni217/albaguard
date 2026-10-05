// 데이터를 바꾸는 동작 모음. 화면에서는 이 함수들만 부른다
import { nowMinute } from './time'

const newId = () => crypto.randomUUID()

export function makeActions(setData) {
  return {
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

    savePayment(key, value) {
      setData((d) => ({ ...d, payments: { ...d.payments, [key]: value } }))
    },

    saveRequest(key, stage, value) {
      setData((d) => ({ ...d, requests: { ...d.requests, [key]: { ...d.requests[key], [stage]: value } } }))
    },

    deleteSchedule(id) {
      setData((d) => ({ ...d, schedules: d.schedules.filter((s) => s.id !== id) }))
    },
  }
}
