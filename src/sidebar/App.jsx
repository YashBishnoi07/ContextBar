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
  'left':       { label: 'Left',        color: '#3b82f6', index: 0 },
  'lean-left':  { label: 'Lean Left',   color: '#93c5fd', index: 1 },
  'center':     { label: 'Center',      color: '#6b7280', index: 2 },
  'lean-right': { label: 'Lean Right',  color: '#fca5a5', index: 3 },
  'right':      { label: 'Right',       color: '#ef4444', index: 4 },
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
                backgroundColor: isActive ? cfg.color : '#2d2d3d',
                margin: '0 2px',
                transition: 'background-color 0.3s ease',
                ...(isActive && {
                  boxShadow: `0 0 8px ${cfg.color}88`,
                }),
              }} />
              <span style={{
                fontSize: '9px',
                color: isActive ? cfg.color : '#555570',
                fontWeight: isActive ? 700 : 400,
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
        <p style={{ fontSize: '11px', color: '#555570', textAlign: 'center' }}>
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
      padding: '1px 6px',
      borderRadius: '999px',
      fontSize: '9px',
      fontWeight: 700,
      color: cfg.color,
      border: `1px solid ${cfg.color}55`,
      backgroundColor: `${cfg.color}15`,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      verticalAlign: 'middle',
      marginLeft: '6px',
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
        padding: '10px 12px',
        borderRadius: '8px',
        backgroundColor: hovered ? '#1e1e2e' : '#16161e',
        border: `1px solid ${hovered ? '#3d3d5c' : '#252535'}`,
        marginBottom: '8px',
        transition: 'all 0.2s ease',
        cursor: 'default',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '4px',
      }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          color: '#a0a0c0',
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
          fontSize: '12px',
          lineHeight: '1.5',
          color: hovered ? '#c8b4fa' : '#d0d0f0',
          textDecoration: 'none',
          display: 'block',
          transition: 'color 0.2s ease',
        }}
      >
        {article.title}
      </a>
      {article.publishedAt && (
        <span style={{
          fontSize: '10px',
          color: '#44445a',
          display: 'block',
          marginTop: '4px',
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
      backgroundColor: '#1e1e2e',
      backgroundImage: 'linear-gradient(90deg, #1e1e2e 25%, #2a2a3e 50%, #1e1e2e 75%)',
      backgroundSize: '200% 100%',
      animation: 'pulse 1.5s ease-in-out infinite',
      ...style,
    }} />
  )
}

function LoadingSkeleton() {
  return (
    <div>
      <style>{`
        @keyframes pulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
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
      <SkeletonBar width="60%" height="10px" style={{ marginBottom: '20px' }} />
      {/* Article cards */}
      {[1,2,3].map(i => (
        <div key={i} style={{
          padding: '10px 12px',
          borderRadius: '8px',
          backgroundColor: '#16161e',
          border: '1px solid #252535',
          marginBottom: '8px',
        }}>
          <SkeletonBar width="40%" height="10px" style={{ marginBottom: '6px' }} />
          <SkeletonBar height="11px" style={{ marginBottom: '4px' }} />
          <SkeletonBar width="80%" height="11px" />
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
        // After we know currentBias, we could re-fetch for diversification;
        // but the server already does it server-side with the currentBias param.
        // For now set articles from first fetch:
        if (articlesResult.error) throw new Error(articlesResult.error)
        setArticles(articlesResult.articles || [])
        setLoading(false)
      })
      .catch(() => {
        // Re-fetch articles with currentBias once biasData is known
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
      .catch(() => {}) // silently fail — first fetch already set articles
  }, [biasData, domain, headline, serverUrl])

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev
      try { localStorage.setItem('contextbar-collapsed', String(next)) } catch {}
      return next
    })
  }

  const fundingBadgeColor = {
    'private':  '#f59e0b',
    'public':   '#22c55e',
    'nonprofit':'#a78bfa',
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
            backgroundColor: '#0f0f1a',
            border: '1px solid #2d2d4d',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#7c7cac',
            fontSize: '11px',
            fontWeight: 700,
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            transform: 'rotate(180deg)',
            letterSpacing: '0.1em',
            transition: 'all 0.2s ease',
            fontFamily: 'system-ui, sans-serif',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#1a1a2e'
            e.currentTarget.style.color = '#c8b4fa'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '#0f0f1a'
            e.currentTarget.style.color = '#7c7cac'
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
      backgroundColor: '#0a0a14',
      color: '#d0d0f0',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        @keyframes pulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a14; }
        ::-webkit-scrollbar-thumb { background: #2d2d4d; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: #3d3d6d; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: '14px 16px 12px',
        borderBottom: '1px solid #1a1a2e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #0f0f1e 0%, #12122a 100%)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            boxShadow: '0 0 12px #7c3aed44',
          }}>
            ⚡
          </div>
          <span style={{
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: '#e0d0ff',
            textTransform: 'uppercase',
          }}>
            ContextBar
          </span>
        </div>
        <button
          onClick={toggleCollapsed}
          title="Collapse sidebar"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#555570',
            fontSize: '18px',
            lineHeight: 1,
            padding: '2px 4px',
            borderRadius: '4px',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#c8b4fa'}
          onMouseLeave={e => e.currentTarget.style.color = '#555570'}
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
            fontSize: '11px',
            color: '#44445a',
            marginBottom: '12px',
            letterSpacing: '0.04em',
          }}>
            🔎 {domain}
          </div>
        )}

        {/* Headline preview */}
        {headline && (
          <div style={{
            fontSize: '12px',
            color: '#7070a0',
            lineHeight: '1.5',
            marginBottom: '14px',
            padding: '8px 10px',
            backgroundColor: '#12121e',
            borderRadius: '6px',
            borderLeft: '2px solid #3d3d6d',
          }}>
            {headline.length > 100 ? headline.slice(0, 97) + '…' : headline}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div style={{
            padding: '16px',
            backgroundColor: '#1a0a0a',
            border: '1px solid #3d1a1a',
            borderRadius: '8px',
            marginBottom: '12px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>⚠️</div>
            <p style={{ fontSize: '12px', color: '#f87171', marginBottom: '12px', lineHeight: '1.5' }}>
              {error}
            </p>
            <button
              onClick={fetchData}
              style={{
                padding: '6px 16px',
                backgroundColor: '#7c3aed',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#6d28d9'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#7c3aed'}
            >
              ↺ Retry
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
              marginBottom: '20px',
              padding: '14px',
              backgroundColor: '#0e0e1e',
              borderRadius: '10px',
              border: '1px solid #1e1e34',
            }}>
              <h2 style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#5555a0',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}>
                Media Bias
              </h2>
              <BiasBar bias={biasData.bias} />

              {/* Ownership */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexWrap: 'wrap',
              }}>
                <span style={{
                  fontSize: '11px',
                  color: '#7070a0',
                }}>
                  {biasData.owner !== 'unknown' ? `🏢 ${biasData.owner}` : '🏢 Owner unknown'}
                </span>
                {biasData.funding && biasData.funding !== 'unknown' && (
                  <span style={{
                    display: 'inline-block',
                    padding: '1px 7px',
                    borderRadius: '999px',
                    fontSize: '10px',
                    fontWeight: 600,
                    color: fundingBadgeColor[biasData.funding] || '#a0a0c0',
                    border: `1px solid ${(fundingBadgeColor[biasData.funding] || '#a0a0c0')}44`,
                    backgroundColor: `${(fundingBadgeColor[biasData.funding] || '#a0a0c0')}15`,
                    letterSpacing: '0.04em',
                    textTransform: 'capitalize',
                  }}>
                    {biasData.funding}
                  </span>
                )}
              </div>
            </div>

            {/* Section: Opposing Views */}
            <div>
              <h2 style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#5555a0',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}>
                Other Perspectives
              </h2>

              {articles.length === 0 ? (
                <div style={{
                  padding: '16px',
                  textAlign: 'center',
                  color: '#44445a',
                  fontSize: '12px',
                  backgroundColor: '#0e0e1e',
                  borderRadius: '8px',
                  border: '1px solid #1e1e34',
                }}>
                  No related articles found.
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
        padding: '8px 16px',
        borderTop: '1px solid #1a1a2e',
        fontSize: '10px',
        color: '#2d2d4d',
        textAlign: 'center',
        flexShrink: 0,
        letterSpacing: '0.04em',
      }}>
        ContextBar — Media Awareness Tool
      </div>
    </div>
  )
}
