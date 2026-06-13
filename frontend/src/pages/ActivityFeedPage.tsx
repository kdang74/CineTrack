import { useEffect, useState, useRef } from 'react'
import { api } from '../lib/api'
import { usePageTitle } from '../hooks/usePageTitle'
import type { ActivityEvent } from '../types'
import { getActivityHubConnection } from '../lib/signalr'
import ActivityFeedItem from '../components/ActivityFeedItem'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { Activity, Radio } from 'lucide-react'

export default function ActivityFeedPage() {
  usePageTitle('Live Activity Feed')
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [newIds, setNewIds] = useState<Set<number>>(new Set())
  const connectionRef = useRef(false)

  useEffect(() => {
    api.get('/api/activity', { params: { limit: 50 } })
      .then(r => setEvents(r.data))
      .finally(() => setLoading(false))

    if (!connectionRef.current) {
      connectionRef.current = true
      const conn = getActivityHubConnection()
      conn.on('ActivityReceived', (event: ActivityEvent) => {
        setEvents(prev => [event, ...prev.slice(0, 99)])
        setNewIds(prev => new Set([...prev, event.id]))
        setTimeout(() => setNewIds(prev => { const s = new Set(prev); s.delete(event.id); return s }), 3000)
      })
      conn.start()
        .then(() => setConnected(true))
        .catch(() => setConnected(false))
      conn.onclose(() => setConnected(false))
      conn.onreconnected(() => setConnected(true))
    }
  }, [])

  return (
    <main className="max-w-2xl mx-auto px-4 py-8" aria-labelledby="activity-heading">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 id="activity-heading" className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity size={24} className="text-brand-400" aria-hidden="true" />
            Live Activity Feed
          </h1>
          <p className="text-gray-500 text-sm mt-1">What the community is watching right now</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
          connected
            ? 'bg-green-900/30 text-green-400 border-green-800'
            : 'bg-gray-800 text-gray-500 border-gray-700'
        }`} aria-live="polite" aria-label={connected ? 'Connected to live feed' : 'Connecting to live feed'}>
          <Radio size={12} className={connected ? 'animate-pulse' : ''} aria-hidden="true" />
          {connected ? 'Live' : 'Connecting…'}
        </div>
      </div>

      {loading ? <LoadingSpinner /> : events.length === 0 ? (
        <EmptyState
          icon={<Activity size={28} />}
          title="No activity yet"
          description="Be the first to add something to your watchlist!"
        />
      ) : (
        <div className="space-y-1" role="list" aria-label="Activity events" aria-live="polite" aria-relevant="additions">
          {events.map((event) => (
            <ActivityFeedItem
              key={event.id}
              event={event}
              highlight={newIds.has(event.id)}
            />
          ))}
        </div>
      )}
    </main>
  )
}
