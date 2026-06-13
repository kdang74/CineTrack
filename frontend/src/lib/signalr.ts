import { HubConnectionBuilder, HubConnection, LogLevel } from '@microsoft/signalr'
import { API_BASE } from './api'

let connection: HubConnection | null = null

export function getActivityHubConnection(): HubConnection {
  if (!connection) {
    connection = new HubConnectionBuilder()
      .withUrl(`${API_BASE}/hubs/activity`, { withCredentials: true })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build()
  }
  return connection
}
