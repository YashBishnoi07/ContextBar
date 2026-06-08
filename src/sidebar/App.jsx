import React, { useState, useEffect, useCallback } from 'react'

// ─── Utility ─────────────────────────────────────────────────────────────────

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url.replace(/^www\./, '')
  }
}

const BIAS_CONFIG = {
  'left':       { label: 'Left',        color: '#2563eb', index: 0 },
  'lean-left':  { label: 'Lean Left',   color: '#60a5fa', index: 1 },
  'center':     { label: 'Center',      color: '#64748b', index: 2 },
  'lean-right': { label: 'Lean Right',  color: '#f87171', index: 3 },
  'right':      { label: 'Right',       color: '#dc2626', index: 4 },
}

const BIAS_STOPS = ['left', 'lean-left', 'center', 'lean-right', 'right']

// ─── BiasBar ─────────────────────────────────────────────────────────────────

function BiasBar({ bias }) {
  const activeConfig = BIAS_CONFIG[bias]
  const activeIndex = activeConfig ? activeConfig.index : -1

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '6px',
      }}>
        {BIAS_STOPS.map((stop, i) => {
          const cfg = BIAS_CONFIG[stop]
          const isActive = i === activeIndex
          return (
            <div key={stop} style={{ textAlign: 'center', flex: 1 }}>
              <div style={{
                height: '8px',
                borderRadius: '4px',
                backgroundColor: isActive ? cfg.color : '#e2e8f0',
                margin: '0 2px',
                transition: 'all 0.3s ease',
                ...(isActive && {
                  boxShadow: `0 0 10px ${cfg.color}44`,
                  transform: 'scaleY(1.1)'
                }),
              }} />
              <span style={{
                fontSize: '9px',
                color: isActive ? cfg.color : '#94a3b8',
                fontWeight: isActive ? 700 : 500,
                display: 'block',
                marginTop: '4px',
                transition: 'color 0.3s ease',
                letterSpacing: '0.02em',
              }}>
                {cfg.label}
              </span>
            </div>
          )
        })}
      </div>
      {!activeConfig && (
        <p style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
          Bias rating unavailable
        </p>
      )}
    </div>
  )
}

// ─── BiasPill ────────────────────────────────────────────────────────────────

function BiasPill({ bias }) {
  const cfg = BIAS_CONFIG[bias]
  if (!cfg) return null
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '999px',
      fontSize: '9px',
      fontWeight: 700,
      color: cfg.color,
      border: `1px solid ${cfg.color}33`,
      backgroundColor: `${cfg.color}15`,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      verticalAlign: 'middle',
      marginLeft: '8px',
    }}>
      {cfg.label}
    </span>
  )
}

// ─── ArticleCard ─────────────────────────────────────────────────────────────

function ArticleCard({ article, outlets }) {
  const domain = extractDomain(article.url)
  const outletInfo = outlets ? outlets[domain] : null
  const bias = outletInfo ? outletInfo.bias : null
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '12px 14px',
        borderRadius: '10px',
        backgroundColor: hovered ? '#f8fafc' : '#ffffff',
        border: `1px solid ${hovered ? '#cbd5e1' : '#e2e8f0'}`,
        marginBottom: '10px',
        transition: 'all 0.2s ease',
        boxShadow: hovered ? '0 4px 12px rgba(0,0,0,0.03)' : '0 1px 3px rgba(0,0,0,0.02)',
        cursor: 'default',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '6px',
      }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 800,
          color: '#64748b',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          {article.source}
        </span>
        {bias && <BiasPill bias={bias} />}
      </div>
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: '13px',
          lineHeight: '1.5',
          fontWeight: 600,
          color: hovered ? '#2563eb' : '#1e293b',
          textDecoration: 'none',
          display: 'block',
          transition: 'color 0.2s ease',
        }}
      >
        {article.title}
      </a>
      {article.publishedAt && (
        <span style={{
          fontSize: '11px',
          color: '#94a3b8',
          display: 'block',
          marginTop: '6px',
          fontWeight: 500,
        }}>
          {new Date(article.publishedAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
          })}
        </span>
      )}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonBar({ width = '100%', height = '12px', style = {} }) {
  return (
    <div style={{
      width,
      height,
      borderRadius: '6px',
      backgroundColor: '#f1f5f9',
      backgroundImage: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
      backgroundSize: '200% 100%',
      animation: 'pulse 1.5s ease-in-out infinite',
      ...style,
    }} />
  )
}

function LoadingSkeleton() {
  return (
    <div>
      {/* Bias bar skeleton */}
      <div style={{ marginBottom: '16px' }}>
        <SkeletonBar height="8px" style={{ marginBottom: '8px' }} />
        <div style={{ display: 'flex', gap: '4px' }}>
          {[1,2,3,4,5].map(i => (
            <SkeletonBar key={i} width="18%" height="6px" />
          ))}
        </div>
      </div>
      {/* Owner line */}
      <SkeletonBar width="60%" height="10px" style={{ marginBottom: '24px' }} />
      {/* Article cards */}
      {[1,2,3].map(i => (
        <div key={i} style={{
          padding: '12px 14px',
          borderRadius: '10px',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          marginBottom: '10px',
        }}>
          <SkeletonBar width="40%" height="10px" style={{ marginBottom: '8px' }} />
          <SkeletonBar height="12px" style={{ marginBottom: '6px' }} />
          <SkeletonBar width="80%" height="12px" />
        </div>
      ))}
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const params = new URLSearchParams(window.location.search)
  const headline = params.get('headline') || ''
  const domain   = params.get('domain')   || ''

  const [collapsed, setCollapsed]   = useState(() => {
    try { return localStorage.getItem('contextbar-collapsed') === 'true' } catch { return false }
  })
  const [biasData, setBiasData]     = useState(null)
  const [articles, setArticles]     = useState([])
  const [outlets, setOutlets]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [serverUrl, setServerUrl]   = useState('http://localhost:3000')

  // Resolve server URL from chrome.storage if available
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.get({ serverUrl: 'http://localhost:3000' }, (data) => {
        setServerUrl(data.serverUrl || 'http://localhost:3000')
      })
    }
  }, [])

  // Load outlets.json for BiasPill lookups on article cards
  useEffect(() => {
    const outletUrl = typeof chrome !== 'undefined' && chrome.runtime
      ? chrome.runtime.getURL('data/outlets.json')
      : '/data/outlets.json'
    fetch(outletUrl)
      .then(r => r.json())
      .then(setOutlets)
      .catch(() => setOutlets({}))
  }, [])

  const fetchData = useCallback(() => {
    if (!domain || !serverUrl) return
    setLoading(true)
    setError(null)

    const biasUrl    = `${serverUrl}/bias?domain=${encodeURIComponent(domain)}`
    const articlesUrl = `${serverUrl}/articles?query=${encodeURIComponent(headline)}&exclude=${encodeURIComponent(domain)}&currentBias=`

    Promise.all([
      fetch(biasUrl).then(r => r.json()),
      fetch(articlesUrl).then(r => r.json()),
    ])
      .then(([biasResult, articlesResult]) => {
        setBiasData(biasResult)
        if (articlesResult.error) throw new Error(articlesResult.error)
        setArticles(articlesResult.articles || [])
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        setError('Could not load context. Check your ContextBar server.')
      })
  }, [domain, headline, serverUrl])

  useEffect(() => {
    if (serverUrl) fetchData()
  }, [serverUrl, fetchData])

  // Re-fetch with currentBias once biasData arrives (diversify)
  useEffect(() => {
    if (!biasData || !domain || !headline || !serverUrl) return
    const bias = biasData.bias || 'unknown'
    const articlesUrl = `${serverUrl}/articles?query=${encodeURIComponent(headline)}&exclude=${encodeURIComponent(domain)}&currentBias=${encodeURIComponent(bias)}`
    fetch(articlesUrl)
      .then(r => r.json())
      .then(result => {
        if (!result.error) setArticles(result.articles || [])
      })
      .catch(() => {})
  }, [biasData, domain, headline, serverUrl])

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev
      try { localStorage.setItem('contextbar-collapsed', String(next)) } catch {}
      return next
    })
  }

  const fundingBadgeColor = {
    'private':  { text: '#b45309', bg: '#fef3c7', border: '#fde68a' },
    'public':   { text: '#15803d', bg: '#dcfce7', border: '#bbf7d0' },
    'nonprofit':{ text: '#6d28d9', bg: '#ede9fe', border: '#ddd6fe' },
  }

  // ── Collapsed tab ──────────────────────────────────────────────────────────
  if (collapsed) {
    return (
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
      }}>
        <button
          onClick={toggleCollapsed}
          title="Expand ContextBar"
          style={{
            width: '28px',
            height: '120px',
            borderRadius: '8px 0 0 8px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            fontSize: '11px',
            fontWeight: 800,
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            transform: 'rotate(180deg)',
            letterSpacing: '0.15em',
            transition: 'all 0.2s ease',
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            boxShadow: '-4px 0 12px rgba(0,0,0,0.05)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#f8fafc'
            e.currentTarget.style.color = '#2563eb'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '#ffffff'
            e.currentTarget.style.color = '#64748b'
          }}
        >
          CONTEXT
        </button>
      </div>
    )
  }

  // ── Expanded sidebar ───────────────────────────────────────────────────────
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      backgroundColor: '#f0f8ff', // Alice Blue
      color: '#334155',
      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      borderLeft: '1px solid #e2e8f0',
      boxShadow: '-8px 0 24px rgba(0,0,0,0.04)',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes pulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f0f8ff; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        flexShrink: 0,
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
              <path d="M18 14h-8"></path>
              <path d="M15 18h-5"></path>
              <path d="M10 6h8v4h-8V6Z"></path>
            </svg>
          </div>
          <span style={{
            fontSize: '14px',
            fontWeight: 800,
            letterSpacing: '0.06em',
            color: '#0f172a',
            textTransform: 'uppercase',
          }}>
            ContextBar
          </span>
        </div>
        <button
          onClick={toggleCollapsed}
          title="Collapse sidebar"
          style={{
            background: '#f1f5f9',
            border: 'none',
            cursor: 'pointer',
            color: '#64748b',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#e2e8f0'
            e.currentTarget.style.color = '#0f172a'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '#f1f5f9'
            e.currentTarget.style.color = '#64748b'
          }}
        >
          ›
        </button>
      </div>

      {/* Scrollable body */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
      }}>

        {/* Domain badge */}
        {domain && (
          <div style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#64748b',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            {domain}
          </div>
        )}

        {/* Headline preview */}
        {headline && (
          <div style={{
            fontSize: '13px',
            color: '#334155',
            lineHeight: '1.6',
            fontWeight: 500,
            marginBottom: '16px',
            padding: '12px 14px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            borderLeft: '3px solid #2563eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}>
            {headline.length > 100 ? headline.slice(0, 97) + '…' : headline}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div style={{
            padding: '16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            marginBottom: '16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>⚠️</div>
            <p style={{ fontSize: '13px', color: '#b91c1c', marginBottom: '12px', lineHeight: '1.5', fontWeight: 500 }}>
              {error}
            </p>
            <button
              onClick={fetchData}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: 700,
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#dc2626'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ef4444'}
            >
              ↺ Retry Connection
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && <LoadingSkeleton />}

        {/* Loaded state */}
        {!loading && !error && biasData && (
          <>
            {/* Section: Outlet Bias */}
            <div style={{
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            }}>
              <h2 style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#64748b',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '16px',
              }}>
                Media Bias
              </h2>
              <BiasBar bias={biasData.bias} />

              {/* Ownership */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid #f1f5f9',
              }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
                  {biasData.owner !== 'unknown' ? biasData.owner : 'Owner unknown'}
                </span>
                {biasData.funding && biasData.funding !== 'unknown' && (() => {
                  const fColors = fundingBadgeColor[biasData.funding] || { text: '#475569', bg: '#f1f5f9', border: '#e2e8f0' }
                  return (
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: fColors.text,
                      border: `1px solid ${fColors.border}`,
                      backgroundColor: fColors.bg,
                      letterSpacing: '0.04em',
                      textTransform: 'capitalize',
                    }}>
                      {biasData.funding}
                    </span>
                  )
                })()}
              </div>
            </div>

            {/* Section: Opposing Views */}
            <div>
              <h2 style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#64748b',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}>
                Other Perspectives
              </h2>

              {articles.length === 0 ? (
                <div style={{
                  padding: '20px 16px',
                  textAlign: 'center',
                  color: '#64748b',
                  fontSize: '13px',
                  fontWeight: 500,
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  borderStyle: 'dashed',
                }}>
                  No related articles found for this topic.
                </div>
              ) : (
                articles.map((article, i) => (
                  <ArticleCard key={i} article={article} outlets={outlets} />
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        fontSize: '11px',
        fontWeight: 600,
        color: '#94a3b8',
        textAlign: 'center',
        flexShrink: 0,
        letterSpacing: '0.04em',
      }}>
        ContextBar — Media Awareness Tool
      </div>
    </div>
  )
}
