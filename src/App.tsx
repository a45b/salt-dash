import { useEffect, useState } from 'react'
import { Breadcrumb, Breadcrumbs, Button, Card, GridLayout, H1, H2, SaltProvider, Table, TableContainer, VerticalNavigation, VerticalNavigationItem, VerticalNavigationItemTrigger } from '@salt-ds/core'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { fetchData } from './data/DataAdapter'
import config from './config/dashboard.config'
import type { PageConfig } from './types/config'
import './App.css'

type Row = Record<string, string | number>

function Dashboard({ page }: { page: PageConfig }) {
  const [mode, setMode] = useState<'light' | 'dark'>(config.mode ?? 'light')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [metrics, setMetrics] = useState<Row[]>([])
  const [chart, setChart] = useState<Row[]>([])
  const [rows, setRows] = useState<Row[]>([])

  useEffect(() => {
    let active = true
    Promise.all([
      fetchData<Row[]>(config.dataSources, 'api-kpi-data'),
      fetchData<Row[]>(config.dataSources, 'chart-data'),
      fetchData<Row[]>(config.dataSources, 'table-data'),
    ]).then(([kpi, series, table]) => {
      if (!active) return
      setMetrics(kpi.data ?? [])
      setChart(series.data ?? [])
      setRows(table.data ?? [])
    })
    return () => { active = false }
  }, [])

  const metric = metrics[0] ?? {}
  const title = page.header?.title ?? page.title
  const money = (value: unknown) => typeof value === 'number' ? `$${value.toLocaleString('en-US')}` : '—'

  return (
    <div className={`app-shell${sidebarCollapsed ? ' sidebar-collapsed' : ''}`} data-mode={mode}>
      <header className="topbar"><div className="brand topbar-brand"><span className="brand-mark">S</span><span>salt<span className="brand-light">dash</span></span></div><div className="top-actions"><span className="updated"><i /> All systems operational</span><Button appearance="transparent" onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>{mode === 'light' ? '◐ Dark mode' : '☼ Light mode'}</Button><button className="icon-button" aria-label="Notifications">♧<i /></button></div></header>
      <div className="workspace-layout">
      <aside className="sidebar">
        <div className="sidebar-tools"><div className="nav-caption">WORKSPACE</div><Button appearance="transparent" className="menu-toggle" aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>{sidebarCollapsed ? '›' : '‹'}</Button></div>
        <VerticalNavigation className="salt-sidebar-nav" appearance="indicator" aria-label="Workspace navigation">
          <VerticalNavigationItem className="nav-item active" active><VerticalNavigationItemTrigger href="#overview" title="Overview"><span className="nav-icon">▦</span><span className="nav-label">Overview</span></VerticalNavigationItemTrigger></VerticalNavigationItem>
          <VerticalNavigationItem className="nav-item"><VerticalNavigationItemTrigger href="#analytics" title="Analytics"><span className="nav-icon">◫</span><span className="nav-label">Analytics</span></VerticalNavigationItemTrigger></VerticalNavigationItem>
          <VerticalNavigationItem className="nav-item"><VerticalNavigationItemTrigger href="#reports" title="Reports"><span className="nav-icon">⌁</span><span className="nav-label">Reports</span></VerticalNavigationItemTrigger></VerticalNavigationItem>
        </VerticalNavigation>
        <div className="sidebar-bottom"><span className="avatar">JD</span><span><b>Jordan Davis</b><small>Finance team</small></span><span className="more">···</span></div>
      </aside>

      <main className="main-area">
        <div className="content">
          <Breadcrumbs className="page-breadcrumbs">{[...(page.breadcrumbs ?? []).filter((item) => item.label?.trim()), { label: title }].map((item, index, items) => <Breadcrumb key={`${item.label}-${index}`} href={index < items.length - 1 ? item.href : undefined} current={index === items.length - 1}>{item.label}</Breadcrumb>)}</Breadcrumbs>
          <div className="page-heading"><div><div className="eyebrow">MONDAY, OCTOBER 26, 2026</div><H1 className="page-title">{title}</H1><p>{page.header?.subtitle ?? 'Here’s what’s happening with your business today.'}</p></div><Button appearance="solid" onClick={() => window.print()}>↓ &nbsp; Export report</Button></div>

          <GridLayout className="metric-grid" columns={4} gap={3} aria-label="Key metrics">
            <Card className="panel metric-card"><div className="metric-top"><span>Total revenue</span><span className="metric-icon blue">↗</span></div><div className="metric-value">{money(metric.revenue)}</div><div className="metric-foot"><span className="positive">↑ 12.5%</span><span>vs. last month</span><svg viewBox="0 0 100 30" aria-hidden="true"><path d="M1 24 C15 22 15 16 29 19 S46 20 55 11 S70 17 80 8 S93 10 99 3" /></svg></div></Card>
            <Card className="panel metric-card"><div className="metric-top"><span>Active customers</span><span className="metric-icon green">♙</span></div><div className="metric-value">8,549</div><div className="metric-foot"><span className="positive">↑ 8.2%</span><span>vs. last month</span><svg viewBox="0 0 100 30" aria-hidden="true"><path d="M1 23 C13 18 22 24 33 16 S48 21 59 12 S73 15 83 8 S94 9 99 4" /></svg></div></Card>
            <Card className="panel metric-card"><div className="metric-top"><span>Avg. order value</span><span className="metric-icon violet">◇</span></div><div className="metric-value">$284.50</div><div className="metric-foot"><span className="positive">↑ 4.6%</span><span>vs. last month</span><svg viewBox="0 0 100 30" aria-hidden="true"><path d="M1 24 C13 23 22 17 33 21 S48 12 59 16 S71 8 82 11 S93 7 99 3" /></svg></div></Card>
            <Card className="panel metric-card"><div className="metric-top"><span>Conversion rate</span><span className="metric-icon amber">◎</span></div><div className="metric-value">3.24%</div><div className="metric-foot"><span className="negative">↓ 0.8%</span><span>vs. last month</span><svg className="downline" viewBox="0 0 100 30" aria-hidden="true"><path d="M1 5 C13 8 21 4 33 11 S49 9 59 17 S71 14 81 21 S94 19 99 27" /></svg></div></Card>
          </GridLayout>

          <GridLayout className="analysis-grid" columns={2} gap={3}>
            <Card className="panel chart-panel"><div className="panel-heading"><div><H2>Revenue overview</H2><p>Monthly revenue performance</p></div><select aria-label="Period" defaultValue="6m"><option value="6m">Last 6 months⌄</option><option>Year to date</option></select></div><div className="chart-legend"><span><i className="legend-dot" /> Revenue</span><span className="chart-total">{money(chart.reduce((sum, row) => sum + Number(row.revenue ?? 0), 0))}<small> total</small></span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chart} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}><defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart)" stopOpacity={0.18} /><stop offset="100%" stopColor="var(--chart)" stopOpacity={0.01} /></linearGradient></defs><CartesianGrid stroke="var(--grid)" vertical={false} strokeDasharray="3 4" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} dy={10} /><YAxis tickFormatter={(v) => `$${v / 1000}k`} axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} /><Tooltip formatter={(value) => money(value)} contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text)' }} /><Area type="monotone" dataKey="revenue" stroke="var(--chart)" strokeWidth={2.5} fill="url(#revenueFill)" activeDot={{ r: 4, strokeWidth: 0 }} /></AreaChart></ResponsiveContainer></div></Card>
            <Card className="panel channel-panel"><div className="panel-heading"><div><H2>Revenue by channel</H2><p>Breakdown this month</p></div><Button appearance="transparent" aria-label="More options">···</Button></div><div className="channel-total">$253,400<small>Total revenue</small></div>{([['Direct', 42, '$106,428', 'channel-blue'], ['Referral', 28, '$70,952', 'channel-green'], ['Social', 18, '$45,612', 'channel-violet'], ['Other', 12, '$30,408', 'channel-gray']] as [string, number, string, string][]).map(([name, pct, total, klass]) => <div className="channel-row" key={name}><div><span className={`channel-dot ${klass}`} />{name}<b>{pct}%</b></div><div className="bar-track"><span className={klass} style={{ width: `${pct}%` }} /></div><small>{total}</small></div>)}</Card>
          </GridLayout>

          <Card className="panel table-panel"><div className="panel-heading table-heading"><div><H2>Recent transactions</H2><p>A snapshot of your latest activity</p></div><Button appearance="bordered">View all&nbsp; →</Button></div><TableContainer className="table-scroll"><Table className="transaction-table"><thead><tr><th>TRANSACTION</th><th>CUSTOMER</th><th>DATE</th><th>AMOUNT</th><th>STATUS</th><th /></tr></thead><tbody>{rows.slice(0, 5).map((row, i) => <tr key={row.id}><td><span className={`transaction-icon tx-${i % 3}`}>{['↗', '◈', '⌂'][i % 3]}</span><span className="mono">TRX-{String(row.id).padStart(4, '0')}</span></td><td><span className="customer-avatar">{String(row.name).split(' ').map((part) => part[0]).join('')}</span>{row.name}</td><td>{['Oct 26, 2026', 'Oct 25, 2026', 'Oct 24, 2026', 'Oct 23, 2026', 'Oct 22, 2026'][i]}</td><td className="amount">{['$1,240.00', '$856.50', '$2,100.00', '$432.00', '$1,780.00'][i]}</td><td><span className={`status status-${String(row.status).toLowerCase()}`}><i />{String(row.status).charAt(0).toUpperCase() + String(row.status).slice(1)}</span></td><td><Button appearance="transparent" aria-label="Transaction options">···</Button></td></tr>)}</tbody></Table></TableContainer><footer className="table-footer"><span>Showing <b>1–5</b> of <b>{rows.length}</b> transactions</span><div><Button appearance="bordered" disabled>← Previous</Button><Button appearance="bordered">Next →</Button></div></footer></Card>
          <footer className="app-footer">© 2026 Salt Dash <span>Data refreshed just now</span></footer>
        </div>
      </main>
      </div>
    </div>
  )
}

function App() {
  const page = config.pages[0]
  if (!page) return <SaltProvider mode={config.mode ?? 'light'}><main className="empty-state">No dashboard pages are configured.</main></SaltProvider>
  return <SaltProvider mode={config.mode ?? 'light'}><Dashboard page={page} /></SaltProvider>
}

export default App
