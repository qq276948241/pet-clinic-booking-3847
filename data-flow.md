# 预约数据流转文档

本文档梳理了 `storage.ts`（纯 IO 层）与 `useAppointment.ts`（状态管理层）之间的数据流转关系，以及各页面组件如何消费状态。

---

## 1. 分层架构

```
┌──────────────────────────────────────────────────────────────┐
│                  页面层（Vue 组件）                          │
│  Home.vue  Appointment.vue  Records.vue  DoctorCard.vue     │
└──────────────────────────────────┬───────────────────────────┘
                                   │ 调用 useAppointment() 暴露的 API
                                   ▼
┌──────────────────────────────────────────────────────────────┐
│         useAppointment.ts（状态管理层 / Composable）          │
│                                                              │
│  ┌ 模块级单例状态 ──────────────────────────────────────┐    │
│  │  appointments: Ref<Appointment[]>                   │    │
│  │  bookedDeltas: Reactive<Record<number, number>>     │    │
│  │  version: Ref<number>  ← 强制刷新版本号              │    │
│  │  pendingCount / pendingAppointments（Computed）     │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  CRUD：addAppointment / cancelAppointment / refresh          │
│  查询：getDoctorRemainingSlots / getTotalRemainingSlots      │
└──────────────────────────────────┬───────────────────────────┘
                                   │ 纯函数调用（无副作用依赖反向）
                                   ▼
┌──────────────────────────────────────────────────────────────┐
│            storage.ts（持久化层 / 纯 IO）                     │
│                                                              │
│  localStorage Key：                                          │
│   ├─ pet_hospital_appointments     → Appointment[]          │
│   └─ pet_hospital_doctor_slots      → Record<id, delta>     │
│                                                              │
│  纯函数：getAppointments / saveAppointments                  │
│          getAllDoctorBookedDeltas / setAllDoctorBookedDeltas │
│          generateAppointmentId                               │
└──────────────────────────────────┬───────────────────────────┘
                                   │
                                   ▼
                        ┌─────────────────────┐
                        │     localStorage    │
                        │（浏览器持久化存储）  │
                        └─────────────────────┘
```

> **设计原则**：storage.ts 只负责"读和写字节流"，不包含任何业务逻辑；useAppointment.ts 作为唯一的状态管理者，负责业务逻辑 + 响应式状态，页面组件只能通过它来读写数据。

---

## 2. localStorage 读写时机

| Key | 读时机 | 写时机 |
|-----|--------|--------|
| `pet_hospital_appointments` | ① 首次调用 `useAppointment()`（`ensureInitialized` → `syncFromStorage`）<br>② 每次进入 Records 页（`onMounted / onActivated → refresh`） | ① 首次初始化且存储为空时（写入 mock 数据）<br>② `addAppointment()` 第 114 行：插入新预约后<br>③ `cancelAppointment()` 第 137 行：改状态为已取消后 |
| `pet_hospital_doctor_slots` | 同上 ① ② | ① `addAppointment()` 第 116-117 行：号源 delta +1 后<br>② `cancelAppointment()` 第 139-140 行：号源 delta -1 后 |

---

## 3. composable 内部响应式更新链路

### 3.1 核心状态变量（模块级单例）

```ts
// 模块顶层定义，所有 useAppointment() 调用共享同一份引用
const appointments = ref<Appointment[]>([])           // 预约列表
const bookedDeltas = reactive<DoctorSlotDeltaMap>({})   // 医生号源净变动量
const version = ref(0)                                  // 依赖追踪触发器
let initialized = false                                 // 初始化锁
```

### 3.2 `version` + `bump()` 强制刷新机制

为了解决跨页面响应式依赖丢失问题（详见上一轮 bug 修复），引入了"版本号"模式：

```ts
function bump() { version.value++ }   // 任何状态变更后调用
```

**所有消费端（Computed / getter）都会在函数开头显式引用 version**，强制建立依赖关系：

```ts
// 模块级 computed，所有页面共享
const pendingCount = computed(() => {
  void version.value                    // ← 建立对 version 的依赖
  return appointments.value.filter(a => a.status === 'pending').length
})

function getDoctorRemainingSlots(doctorId) {
  void version.value                    // ← 建立对 version 的依赖
  // ... 计算剩余号源
}
```

**`bump()` 被调用的 4 个场景**：

| 场景 | 触发位置 |
|------|----------|
| 首次初始化 / refresh | `syncFromStorage()` 最后一行（第 66 行） |
| 新增预约 | `addAppointment()` 最后一行（第 118 行） |
| 取消预约 | `cancelAppointment()` 最后一行（第 141 行） |

每次 bump 后，所有消费了 `version` 的 computed 会**立即重新计算**，所有模板引用了这些 computed 的组件会**自动重渲染**。

### 3.3 写操作完整链路（以 addAppointment 为例）

```
用户在 Appointment.vue 点击"确认预约"
           │
           ▼
 useAppointment.addAppointment(params)
           │
   ┌───────┴───────────────────────────────────┐
   │  1. 内存状态更新                           │
   │     appointments.value = [apt, ...old]    │
   │     bookedDeltas[doctorId]++              │
   │                                            │
   │  2. 持久化                                │
   │     persistAppointments(内存列表)         │
   │     persistDeltas(内存 deltas)            │
   │                                            │
   │  3. 版本号 bump 通知所有依赖者             │
   │     bump() → version.value++              │
   └───────────────────────────────────────────┘
           │
           ▼
  Vue 响应式系统自动触发：
   ├─ pendingCount 重新计算（新值 +1）
   ├─ pendingAppointments 重新计算（多了一条）
   ├─ getDoctorRemainingSlots(被预约医生) 返回值 -1
   └─ 组件模板引用上述值 → DOM 重渲染
```

---

## 4. 各页面 / 组件如何消费数据

### 4.1 Home.vue（首页 - 医生列表）

```ts
const { getTotalRemainingSlots } = useAppointment()

const doctors = computed(() => getDoctorsByDate(today))
// 首页顶部的总剩余号源卡片
const totalRemaining = computed(() => getTotalRemainingSlots(doctors.value))
```

- 每次 `bump()` 后，`getTotalRemainingSlots` 内部读取了 `version.value`，会重新计算所有医生的号源总和
- 每个 `DoctorCard` 内部也独立调用 composable，保证各自卡片里的"剩余号源数字徽章"实时变化

### 4.2 DoctorCard.vue（医生卡片组件）

```ts
const { getDoctorRemainingSlots } = useAppointment()

// 医生头像角标数字 + 号源充足/紧张/已满判断
const remainingSlots = computed(() => getDoctorRemainingSlots(props.doctor.id))
```

- 被 Home.vue 和（潜在的）其他列表复用
- 计算号源时会读 `version.value`，所以"取消预约 → 号源 +1"或"新增预约 → 号源 -1"都会立即在卡片上反映出来

### 4.3 Appointment.vue（预约表单页）

```ts
const { addAppointment, getDoctorRemainingSlots } = useAppointment()

// 1. 医生下拉框显示剩余号源
//    <option>{{ doc.name }}（剩余{{ getDoctorRemainingSlots(doc.id) }}号）</option>

// 2. 提交按钮
function submitForm() {
  addAppointment({ doctorId, doctorName, date, time, petType, ... })
  showSuccess.value = true
  setTimeout(() => router.push('/records'), 1500)
}
```

- `getDoctorRemainingSlots` 用于下拉框里的号源展示（切换日期时也会变）
- `addAppointment` 执行后立刻 bump → Home/DoctorCard 下次显示时已更新
- **关键**：`addAppointment` 返回前已经把新记录写入 localStorage，1.5s 后跳 Records 页，Records 页的 `onMounted` 会再读一次 storage，双重保障一定能看到

### 4.4 Records.vue（预约记录页）

```ts
const { appointments, pendingCount, cancelAppointment, refresh } = useAppointment()

// 主列表
const filteredAppointments = computed(() => {
  if (activeTab.value === 'pending')
    return appointments.value.filter(a => a.status === 'pending')
  return appointments.value
})

// 强制同步钩子：每次进入页面都从 localStorage 重新拉一次
onMounted(refresh)
onActivated(refresh)

// 取消按钮
function handleCancel() {
  const result = cancelAppointment(cancelTarget.value.id)
  if (result) showToast(`${result.doctorName}的号源已退还`)
}
```

- **`onMounted + onActivated` 双保险**：`refresh()` 会把 `appointments` 和 `bookedDeltas` 重新从 localStorage 读一遍，并 `bump()` 刷新所有依赖。这是防止"跨路由跳转后内存状态没同步"的兜底措施
- `cancelAppointment` 内部同时完成三件事：改状态为已取消、退还号源 delta、bump 通知 → 顶部"待就诊计数"立刻 -1

---

## 5. 完整端到端流程：用户提交预约 → Records 页看到

```
 时间线 ──────────────────────────────────────────────────────────────►

[Appointment 页面]
  用户点提交
     │ ① addAppointment({...})
     │    └─ appointments.unshift(newApt)    (内存状态更新)
     │    └─ saveAppointments(...)           (写入 localStorage)
     │    └─ bookedDeltas[docId]++            (号源占用)
     │    └─ bump()                           (version+1 通知所有依赖)
     │
     │ ② 1.5 秒等待成功动画
     │    └─ 期间 Vue 已响应：所有 getDoctorRemainingSlots() 的调用者
     │       (DoctorCard / Appointment 下拉框 / Home 总数) 都已重算
     │
     ▼  router.push('/records')

[Records 页面]
     │
     │ ③ 组件 setup()
     │    └─ useAppointment()
     │    └─ ensureInitialized() → 已初始化，跳过 syncFromStorage
     │    └─ appointments / pendingCount → 共享模块级引用，已是新值
     │
     │ ④ onMounted + onActivated 触发 refresh()（兜底）
     │    └─ 从 localStorage 重新读 appointments + deltas
     │    └─ bump() → version 再 +1，所有 computed 再次重算（确保一致）
     │
     ▼
   模板渲染 filteredAppointments → 第一条就是刚刚提交的新记录 ✓
```

---

## 6. 完整端到端流程：用户取消预约 → 首页号源 +1

```
[Records 页面]
  用户点卡片右上角的 ✕ 取消按钮
     │ ① confirmCancel → 弹窗
     │ ② handleCancel → cancelAppointment(id)
     │    └─ appointments[i].status = 'cancelled'   (内存状态更新)
     │    └─ saveAppointments(...)                   (写入 localStorage)
     │    └─ bookedDeltas[docId]--                   (号源退还)
     │    └─ bump()                                   (version+1 通知)
     │
     ▼  Toast 弹出"号源已退还"

[用户切回首页 / DoctorCard 在首页已挂载]
     │ ③ bump() 触发后
     │    └─ DoctorCard 的 remainingSlots computed
     │       → getDoctorRemainingSlots(doc.id)
     │       → 读 version.value → 触发重算
     │       → delta 已经 -1，所以实际号源 +1
     │    └─ Home 的 totalRemaining 同理重算，顶部数字 +1
     │
     ▼  DOM 更新：剩余号源数字徽章 +1，颜色可能从"已满"变回"紧张"或"充足" ✓
```

---

## 7. 关键设计要点

| 设计 | 目的 | 替代方案（为什么不选） |
|------|------|------------------------|
| **模块级单例** | 所有组件共享同一状态源 | Pinia/Vuex（过度设计，本项目规模小） |
| **storage.ts 纯函数化** | 单一职责，composable 是唯一状态所有者 | 组件直接读 storage（导致逻辑分散、重复代码） |
| **version + bump()** | 兜底响应式，解决跨页面依赖追踪丢失 | 只用 ref/rely on Vue 自带追踪（实际路由切换时有失效场景） |
| **delta 而非绝对值存号源** | 只存"新增/取消的净变动"，mock 数据可独立调整 | 存实际 bookedSlots 绝对值（无法区分初始值与用户操作） |
| **Records 进入就 refresh** | 即使内存状态因为 HMR 或路由原因不一致，storage 是唯一真源 | 只依赖内存共享（开发模式下 HMR 偶发状态不一致） |
