// 증빙 사진 보관. 사진은 용량이 커서 localStorage 대신 브라우저의 IndexedDB에 따로 저장한다
import { useEffect, useState } from 'react'
import { monthKey } from './time'

const DB = 'albaguard'
const STORE = 'photos'
const MAX_SIZE = 1600 // 긴 쪽을 이 크기로 줄여 저장

export const KINDS = {
  schedule: '근무표',
  wage: '시급 근거 (계약서·공고·메시지)',
  deposit: '입금 내역',
  etc: '기타',
}

function open() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function run(mode, work) {
  const db = await open()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode)
    const request = work(tx.objectStore(STORE))
    tx.oncomplete = () => resolve(request?.result)
    tx.onerror = () => reject(tx.error)
  })
}

export const putPhoto = (id, dataUrl) => run('readwrite', (store) => store.put(dataUrl, id))
export const getPhoto = (id) => run('readonly', (store) => store.get(id))
export const deletePhoto = (id) => run('readwrite', (store) => store.delete(id))
export const clearPhotos = () => run('readwrite', (store) => store.clear())

// 백업용: { 사진id: 사진 } 전체
export async function allPhotos() {
  const keys = await run('readonly', (store) => store.getAllKeys())
  const values = await run('readonly', (store) => store.getAll())
  return Object.fromEntries(keys.map((key, i) => [key, values[i]]))
}

export async function replacePhotos(photos) {
  await clearPhotos()
  for (const [id, dataUrl] of Object.entries(photos)) await putPhoto(id, dataUrl)
}

// 고른 사진 파일을 줄여서 저장용 글자(data URL)로 바꾼다
export async function fileToDataUrl(file) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIZE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.8)
}

// 화면에서 사진 한 장을 불러와 쓴다
export function usePhoto(id) {
  const [url, setUrl] = useState(null)
  useEffect(() => {
    let alive = true
    getPhoto(id).then((value) => alive && setUrl(value ?? null))
    return () => {
      alive = false
    }
  }, [id])
  return url
}

// 그 근무지의 해당 달 사진. 시급 근거는 달과 상관없이 항상 포함
export function attachmentsFor(data, workplaceId, yms) {
  return data.attachments
    .filter((a) => a.workplaceId === workplaceId && (a.kind === 'wage' || yms.includes(monthKey(`${a.date}T00:00`))))
    .sort((a, b) => a.date.localeCompare(b.date))
}
