using Microsoft.AspNetCore.SignalR;

namespace CineTrack.Api.Hubs;

public class ActivityHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        await Clients.Caller.SendAsync("Connected", $"Connected to CineTrack activity feed. Connection ID: {Context.ConnectionId}");
        await base.OnConnectedAsync();
    }
}
