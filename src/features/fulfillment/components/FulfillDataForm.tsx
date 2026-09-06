import React, { useState, useEffect, useRef } from 'react'
import { Input, Select, message } from 'antd'
import { CheckOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons'
import {
  PHONE_BRANDS,
  PHONE_MODELS,
  lookupImei,
} from '../services/fulfillmentService'
import type { CategoryType } from '@/features/requests/types'

interface AndroidUnitState {
  imei: string
  brand: string
  brandManual?: string
  model: string
  modelManual?: string
  releaseYear: string
  regYear: string
}

interface FulfillDataFormProps {
  category: CategoryType
  qty: number
  onSave: (data: any) => Promise<void>
}

function CsvUploader({
  label,
  hint,
  onFileSelect,
  onDownloadTemplate,
}: {
  label: string
  hint: string
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDownloadTemplate: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string>('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
    }
    onFileSelect(e)
  }

  return (
    <div className="field" style={{ marginBottom: '16px' }}>
      <label className="text-xs font-semibold block mb-1.5 text-slate-700">{label}</label>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleChange}
      />
      <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            type="button"
            className="btn btn-secondary btn-sm flex-none"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadOutlined /> Choose File
          </button>
          <span className="text-xs text-slate-500 truncate" title={fileName || 'No file chosen'}>
            {fileName || 'No file chosen'}
          </span>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm flex-none"
          onClick={onDownloadTemplate}
        >
          <DownloadOutlined /> Template
        </button>
      </div>
      <div className="hint text-[11.5px] text-slate-500 mt-1.5 leading-relaxed">{hint}</div>
    </div>
  )
}

export default function FulfillDataForm({ category, qty, onSave }: FulfillDataFormProps) {
  const [barcodes, setBarcodes] = useState<string[]>([])
  const [androidUnits, setAndroidUnits] = useState<AndroidUnitState[]>([])
  const [specsText, setSpecsText] = useState('')

  useEffect(() => {
    if (category === 'Barcode') {
      setBarcodes(Array.from({ length: qty }, () => ''))
    } else if (category === 'Android') {
      setAndroidUnits(
        Array.from({ length: qty }, () => ({
          imei: '',
          brand: '',
          model: '',
          releaseYear: '',
          regYear: '',
        }))
      )
    }
  }, [category, qty])

  const handleBarcodeCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      let lines = String(event.target?.result || '')
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
      if (lines[0] && /kode|barcode/i.test(lines[0])) lines = lines.slice(1)
      const newCodes = Array.from({ length: qty }, (_, i) =>
        lines[i] ? lines[i].split(',')[0].trim() : ''
      )
      setBarcodes(newCodes)
      message.success(`Berhasil mengimpor ${Math.min(lines.length, qty)} kode barcode dari CSV`)
    }
    reader.readAsText(file)
  }

  const handleAndroidCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      let lines = String(event.target?.result || '')
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
      if (lines[0] && /imei/i.test(lines[0])) lines = lines.slice(1)

      setAndroidUnits((prev) => {
        const next = [...prev]
        lines.forEach((line, i) => {
          if (i >= qty) return
          const [imei, brand, model, rel, reg] = line.split(',').map((s) => (s || '').trim())
          next[i] = {
            imei: imei || next[i]?.imei || '',
            brand: brand || next[i]?.brand || '',
            model: model || next[i]?.model || '',
            releaseYear: rel || next[i]?.releaseYear || '',
            regYear: reg || next[i]?.regYear || '',
          }
        })
        return next
      })
      message.success(`Berhasil mengimpor data ${Math.min(lines.length, qty)} unit dari CSV`)
    }
    reader.readAsText(file)
  }

  const handleDownloadAndroidTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,IMEI,Merk,Jenis,Tahun Rilis,Tahun Registrasi\n354892019283741,Samsung,Galaxy Tab,2023,2024\n864920192837412,Xiaomi,Redmi Note,2022,2023\n'
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'template_android_units.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadBarcodeTemplate = () => {
    const csvContent = 'data:text/csv;charset=utf-8,Kode Barcode\nBC-000001\nBC-000002\n'
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'template_barcode.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleScanImei = (idx: number, imeiValue: string) => {
    const info = lookupImei(imeiValue)
    if (info) {
      setAndroidUnits((prev) => {
        const next = [...prev]
        next[idx] = {
          ...next[idx],
          imei: imeiValue,
          brand: info.brand,
          model: info.model,
          releaseYear: info.releaseYear,
        }
        return next
      })
      message.success(`IMEI dikenali — ${info.brand} ${info.model}`)
    } else {
      setAndroidUnits((prev) => {
        const next = [...prev]
        next[idx] = { ...next[idx], imei: imeiValue }
        return next
      })
    }
  }

  const handleSubmitBarcode = () => {
    const filledCodes = barcodes.map((c) => c.trim()).filter(Boolean)
    if (filledCodes.length < qty) {
      message.error(`Semua ${qty} kode barcode wajib diisi.`)
      return
    }
    onSave({ codes: filledCodes })
  }

  const handleSubmitAndroid = () => {
    const completeUnits = androidUnits.map((u) => {
      const finalBrand = u.brand === '__other__' ? u.brandManual?.trim() || '' : u.brand
      const finalModel = u.model === '__other__' ? u.modelManual?.trim() || '' : u.model
      return {
        imei: u.imei.trim(),
        brand: finalBrand,
        model: finalModel,
        releaseYear: u.releaseYear,
        regYear: u.regYear,
      }
    })

    const isValid = completeUnits.every(
      (u) => u.imei && u.brand && u.model && u.releaseYear && u.regYear
    )

    if (!isValid) {
      message.error(`Semua ${qty} unit wajib lengkap (IMEI, merk, jenis, rilis, registrasi).`)
      return
    }
    onSave({ units: completeUnits })
  }

  const handleSubmitServer = () => {
    if (!specsText.trim()) {
      message.error('Spesifikasi server/PC wajib diisi.')
      return
    }
    onSave({ specs: specsText.trim() })
  }

  if (category === 'Barcode') {
    const filledCount = barcodes.filter((c) => c.trim()).length
    return (
      <div className="space-y-4">
        <CsvUploader
          label="Upload kode barcode (.csv)"
          hint={`Kolom CSV: Kode Barcode — 1 baris = 1 kode, urut sesuai qty (${qty} pcs).`}
          onFileSelect={handleBarcodeCsv}
          onDownloadTemplate={handleDownloadBarcodeTemplate}
        />

        <div className="field">
          <label className="text-xs font-semibold block mb-1.5 text-slate-700">
            Kode Barcode — <span className="font-mono text-rose-600">{filledCount}</span>/{qty} terisi{' '}
            <span className="text-rose-600">*</span>
          </label>
          <div
            className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200"
            style={{ maxHeight: '260px', overflowY: 'auto' }}
          >
            {barcodes.map((code, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-400 w-6 text-right flex-none">
                  {idx + 1}
                </span>
                <Input
                  placeholder={`mis. BC-000${String(idx + 1).padStart(3, '0')}`}
                  value={code}
                  onChange={(e) => {
                    const val = e.target.value
                    setBarcodes((prev) => {
                      const next = [...prev]
                      next[idx] = val
                      return next
                    })
                  }}
                  className="font-mono text-xs"
                />
              </div>
            ))}
          </div>
        </div>

        <button type="button" className="btn btn-go" style={{ width: '100%' }} onClick={handleSubmitBarcode}>
          <CheckOutlined /> Save & Advance to Shipped
        </button>
      </div>
    )
  }

  if (category === 'Android') {
    const completeCount = androidUnits.filter((u) => {
      const b = u.brand === '__other__' ? u.brandManual : u.brand
      const m = u.model === '__other__' ? u.modelManual : u.model
      return u.imei.trim() && b?.trim() && m?.trim() && u.releaseYear && u.regYear
    }).length

    return (
      <div className="space-y-4">
        <CsvUploader
          label="Upload data unit (.csv)"
          hint="Kolom CSV: IMEI, Merk HP, Jenis Model, Tahun Rilis, Tahun Registrasi. Atau scan IMEI per unit di bawah — field lain akan terisi otomatis kalau IMEI dikenali."
          onFileSelect={handleAndroidCsv}
          onDownloadTemplate={handleDownloadAndroidTemplate}
        />

        <div className="field">
          <label className="text-xs font-semibold block mb-1 text-slate-700">
            Data unit — <span className="font-mono text-rose-600">{completeCount}</span>/{qty} lengkap{' '}
            <span className="text-rose-600">*</span>
          </label>
        </div>

        <div style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }} className="space-y-3">
          {androidUnits.map((u, i) => {
            const b = u.brand === '__other__' ? u.brandManual : u.brand
            const m = u.model === '__other__' ? u.modelManual : u.model
            const isUnitComplete = Boolean(u.imei.trim() && b?.trim() && m?.trim() && u.releaseYear && u.regYear)

            return (
              <div
                key={i}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="eyebrow">Unit {i + 1} / {qty}</span>
                  {isUnitComplete ? (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckOutlined /> Lengkap
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400">Belum lengkap</span>
                  )}
                </div>

                {/* IMEI Field */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">IMEI *</label>
                  <Input
                    placeholder="Scan / ketik IMEI (Enter untuk auto-fill)"
                    value={u.imei}
                    onChange={(e) => {
                      const val = e.target.value
                      setAndroidUnits((prev) => {
                        const next = [...prev]
                        next[i] = { ...next[i], imei: val }
                        return next
                      })
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleScanImei(i, u.imei)
                      }
                    }}
                    className="font-mono text-xs"
                  />
                </div>

                {/* Merk & Model */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Merk HP *</label>
                    <Select
                      placeholder="Pilih Merk…"
                      value={u.brand || undefined}
                      onChange={(val) => {
                        setAndroidUnits((prev) => {
                          const next = [...prev]
                          next[i] = { ...next[i], brand: val }
                          return next
                        })
                      }}
                      options={[
                        ...PHONE_BRANDS.map((b) => ({ label: b, value: b })),
                        { label: 'Lainnya', value: '__other__' },
                      ]}
                      className="w-full text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Jenis Model *</label>
                    <Select
                      placeholder="Pilih Model…"
                      value={u.model || undefined}
                      onChange={(val) => {
                        setAndroidUnits((prev) => {
                          const next = [...prev]
                          next[i] = { ...next[i], model: val }
                          return next
                        })
                      }}
                      options={[
                        ...PHONE_MODELS.map((m) => ({ label: m, value: m })),
                        { label: 'Lainnya', value: '__other__' },
                      ]}
                      className="w-full text-xs"
                    />
                  </div>
                </div>

                {/* Manual inputs if '__other__' chosen */}
                {(u.brand === '__other__' || u.model === '__other__') && (
                  <div className="grid grid-cols-2 gap-2">
                    {u.brand === '__other__' && (
                      <Input
                        placeholder="Nama merk manual"
                        value={u.brandManual || ''}
                        onChange={(e) => {
                          const val = e.target.value
                          setAndroidUnits((prev) => {
                            const next = [...prev]
                            next[i] = { ...next[i], brandManual: val }
                            return next
                          })
                        }}
                        className="text-xs"
                      />
                    )}
                    {u.model === '__other__' && (
                      <Input
                        placeholder="Nama model manual"
                        value={u.modelManual || ''}
                        onChange={(e) => {
                          const val = e.target.value
                          setAndroidUnits((prev) => {
                            const next = [...prev]
                            next[i] = { ...next[i], modelManual: val }
                            return next
                          })
                        }}
                        className="text-xs"
                      />
                    )}
                  </div>
                )}

                {/* Tahun Rilis & Tahun Registrasi */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Tahun Rilis *</label>
                    <Select
                      placeholder="Pilih Tahun…"
                      value={u.releaseYear || undefined}
                      onChange={(val) => {
                        setAndroidUnits((prev) => {
                          const next = [...prev]
                          next[i] = { ...next[i], releaseYear: val }
                          return next
                        })
                      }}
                      options={Array.from({ length: 9 }, (_, y) => ({
                        label: String(2018 + y),
                        value: String(2018 + y),
                      }))}
                      className="w-full text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Tahun Registrasi *</label>
                    <Select
                      placeholder="Pilih Tahun…"
                      value={u.regYear || undefined}
                      onChange={(val) => {
                        setAndroidUnits((prev) => {
                          const next = [...prev]
                          next[i] = { ...next[i], regYear: val }
                          return next
                        })
                      }}
                      options={Array.from({ length: 7 }, (_, y) => ({
                        label: String(2020 + y),
                        value: String(2020 + y),
                      }))}
                      className="w-full text-xs"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <button type="button" className="btn btn-go" style={{ width: '100%' }} onClick={handleSubmitAndroid}>
          <CheckOutlined /> Save & Advance to Shipped
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="field">
        <label className="text-xs font-semibold block mb-1.5 text-slate-700">
          Spesifikasi Server / PC <span className="text-rose-600">*</span>
        </label>
        <Input.TextArea
          rows={4}
          placeholder="Mis. CPU 16-Core, RAM 64GB, SSD 2TB, OS Ubuntu 24.04..."
          value={specsText}
          onChange={(e) => setSpecsText(e.target.value)}
        />
      </div>
      <button type="button" className="btn btn-go" style={{ width: '100%' }} onClick={handleSubmitServer}>
        <CheckOutlined /> Save & Advance to Shipped
      </button>
    </div>
  )
}

