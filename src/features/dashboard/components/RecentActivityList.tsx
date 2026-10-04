import type { ActivityLog } from '../types'

interface RecentActivityListProps {
  activities: ActivityLog[]
}

/**
 * Shows an activity title with the request ids set in monospace. Built from React
 * nodes, not HTML: titles contain names that come from the database, so they must
 * never be injected as markup.
 */
function ActivityTitle({ title }: { title: string }) {
  // split() with a capture group puts the matched ids at the odd positions.
  return (
    <>
      {title.split(/(REQ-[0-9A-Za-z]+)/g).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="mono">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  )
}

export default function RecentActivityList({ activities }: RecentActivityListProps) {
  const getIconAndColors = (type: ActivityLog['type']) => {
    switch (type) {
      case 'approval':
        return {
          color: 'var(--go)',
          bg: 'var(--go-050)',
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ),
        }
      case 'request':
        return {
          color: 'var(--brand)',
          bg: 'var(--brand-050)',
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          ),
        }
      case 'fulfillment':
        return {
          color: 'var(--brand)',
          bg: 'var(--brand-050)',
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13" rx="2" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          ),
        }
      case 'warning':
      default:
        return {
          color: 'var(--warn)',
          bg: 'var(--warn-050)',
          icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          ),
        }
    }
  }

  return (
    <div className="card">
      <div className="card-hd">
        <h3>Recent activity</h3>
      </div>
      <div className="card-pad" style={{ paddingTop: '4px', paddingBottom: '4px' }}>
        <div className="feed">
          {activities.map((act) => {
            const { color, bg, icon } = getIconAndColors(act.type)
            return (
              <div key={act.id} className="it">
                <span className="ic" style={{ background: bg, color: color }}>
                  {icon}
                </span>
                <span className="tx">
                  <ActivityTitle title={act.title} />
                </span>
                <span className="t">{act.timeAgo}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
