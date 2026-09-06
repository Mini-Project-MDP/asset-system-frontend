# Frontend Project Development Standards

Document standard arsitektur, konvensi komponen, styling, formulir & validasi, serta manajemen data API untuk proyek **Asset System Frontend** (`asset-system-frontend`).

---

## 1. Tech Stack Overview

- **UI Component Library**: [Ant Design (`antd`)](https://ant.design/) v6
- **Styling Framework**: [Tailwind CSS](https://tailwindcss.com/) v4
- **Form Management**: [React Hook Form (`react-hook-form`)](https://react-hook-form.com/) v7
- **Form Validation**: [Zod (`zod`)](https://zod.dev/) v4 + `@hookform/resolvers`
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Server State & Data Fetching**: [TanStack React Query](https://tanstack.com/query) v5
- **Routing**: [Generouted (`@generouted/react-router`)](https://github.com/pedronauck/generouted) + React Router v7
- **Date Utility**: [Day.js](https://day.js.org/)

---

## 2. Component & UI Standards (Antd + Tailwind)

### 🔑 Aturan Utama UI Component
1. **Ant Design First**: Seluruh komponen UI interaktif (Button, Input, Select, Table, Modal, Form, Card, Tag, Badge, Spin, Notification) **WAJIB** menggunakan komponen resmi Ant Design (`antd`).
2. **Tailwind for Layouting & Micro-styling**: Gunakan Tailwind CSS untuk menangani flexbox/grid layout (`flex`, `grid`, `gap-*`), spacing (`p-*`, `m-*`), sizing (`w-*`, `h-*`), positioning, glassmorphism, dan custom micro-animations.
3. **Antd Theme Customization**: Konfigurasi tema global (Primary Color, Dark/Light Mode, Border Radius) diatur melalui `<ConfigProvider>` Ant Design di `src/app/providers/AppProvider.tsx`.

---

## 3. Form & Validation Standards (React Hook Form + Zod)

 Seluruh formulir di aplikasi **WAJIB** menggunakan kombinasi **React Hook Form (RHF)** + **Zod Schema Validation**.

### 🔑 Rules Penanganan Form:
1. **Schema Validation**: Skema validasi wajib didefinisikan menggunakan `zod` di file schema terpisah atau bagian atas file komponen.
2. **Type Inference**: Tipe data formulir wajib di-derive dari Zod schema menggunakan `z.infer<typeof schema>`.
3. **Antd Input Integration**: Gunakan `<Controller>` dari `react-hook-form` untuk menghubungkan state RHF dengan komponen Ant Design (`Input`, `Select`, `DatePicker`, `Radio`, dll).
4. **Form Error Message**: Pesan error wajib ditampilkan menggunakan props `help` dan `validateStatus` milik `<Form.Item>` Ant Design.

### 💡 Contoh Standar Implementasi Form:

```tsx
import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, Input, Select, Button, Card } from 'antd'

// 1. Skema Validasi Zod
export const createAssetSchema = z.object({
  name: z.string().min(3, 'Nama aset minimal 3 karakter'),
  category: z.string().min(1, 'Kategori aset wajib dipilih'),
  serialNumber: z.string().min(1, 'Nomor seri wajib diisi'),
  price: z.number({ invalid_type_error: 'Harga harus berupa angka' }).positive('Harga harus lebih dari 0'),
})

// 2. Infer Tipe TypeScript dari Schema
export type CreateAssetFormValues = z.infer<typeof createAssetSchema>

export const CreateAssetForm: React.FC<{ onSubmit: (values: CreateAssetFormValues) => void }> = ({ onSubmit }) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateAssetFormValues>({
    resolver: zodResolver(createAssetSchema),
    defaultValues: {
      name: '',
      category: '',
      serialNumber: '',
      price: 0,
    },
  })

  return (
    <Card title="Form Tambah Aset" className="max-w-xl shadow-md rounded-xl">
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        {/* Input Nama Aset */}
        <Form.Item
          label="Nama Aset"
          validateStatus={errors.name ? 'error' : ''}
          help={errors.name?.message}
          required
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Masukkan nama aset" />}
          />
        </Form.Item>

        {/* Select Kategori */}
        <Form.Item
          label="Kategori"
          validateStatus={errors.category ? 'error' : ''}
          help={errors.category?.message}
          required
        >
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Pilih kategori"
                options={[
                  { label: 'Elektronik', value: 'electronics' },
                  { label: 'Kendaraan', value: 'vehicle' },
                  { label: 'Mebel', value: 'furniture' },
                ]}
              />
            )}
          />
        </Form.Item>

        {/* Input Nomor Seri */}
        <Form.Item
          label="Nomor Seri"
          validateStatus={errors.serialNumber ? 'error' : ''}
          help={errors.serialNumber?.message}
          required
        >
          <Controller
            name="serialNumber"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Contoh: SN-123456" />}
          />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={isSubmitting} block className="mt-4">
          Simpan Aset
        </Button>
      </Form>
    </Card>
  )
}
```

---

## 4. Data Fetching & API Standards (Axios + TanStack Query)

Seluruh komunikasi API dilakukan dengan pola **3-Layer Data Flow**:
1. **`httpClient` (Axios)** → Instance terpusat dengan Base URL & Interceptor token auth (`src/shared/services/httpClient.ts`).
2. **`Feature Service` (Axios Calls)** → Fungsi murni penanganan request HTTP (`src/features/<feature>/services/<feature>Service.ts`).
3. **`Custom Query Hook` (TanStack Query)** → Wrapper `useQuery` / `useMutation` untuk komponen React (`src/features/<feature>/hooks/use<Feature>.ts`).

---

## 5. Directory & Module Structure

Gunakan arsitektur **Feature-Driven Design**:

```text
src/
├── app/                      # Inisialisasi App & Providers
│   ├── providers/            # Antd ConfigProvider, QueryClientProvider
│   └── router/               # Generouted Router Setup
├── features/                 # Modular Feature-driven domains
│   ├── assets/               # Modul Fitur Manajemen Aset
│   │   ├── components/       # UI Komponen & Form RHF
│   │   ├── hooks/            # TanStack Query custom hooks
│   │   ├── services/         # Axios API Services
│   │   └── types/            # Interface TypeScript & Zod Schemas
│   ├── asset-requests/       # Modul Fitur Pengajuan Aset
│   └── master-data/          # Modul Fitur Master Data
├── pages/                    # File-based routes (Generouted)
│   ├── index.tsx             # Route: /
│   ├── assets/
│   │   └── index.tsx         # Route: /assets
│   └── 404.tsx
└── shared/                   # Shared Reusable Utilities
    ├── components/           # Generic UI & Form Item Wrappers
    ├── constants/            # Constants & Route Enum
    ├── services/             # httpClient.ts (Axios Instance)
    └── types/                # Generic API & Common Types
```

---

## 6. Routing Standards (Generouted)

- Gunakan **File-based Routing** di folder `src/pages/`.
- Setiap file di `src/pages/` otomatis menjadi rute aplikasi.
- Gunakan `useNavigate` dari `@generouted/react-router` atau `react-router` untuk navigasi antar halaman secara type-safe.

---

## 7. TypeScript & Code Style Rules

1. **Strict Types**: Wajib membuat `interface` atau `type` untuk seluruh payload API, response data, dan Props komponen. Dilarang menggunakan `any`.
2. **Form Validation with Zod**: Dilarang menangani validasi form secara manual/inline `if-else`. Seluruh bentuk form wajib melalui Zod schema.
3. **Named Exports**: Gunakan *named export* (`export const ComponentName = ...`) bukan *default export* untuk komponen fitur & shared helper (kecuali file di `src/pages/` untuk Generouted).
4. **Handling Loading & Errors**: Gunakan Antd `<Spin>`, Skeleton, atau props `loading={isLoading}` milik Antd Table/Button secara konsisten.
