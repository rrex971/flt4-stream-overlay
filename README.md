# Fruit Loops Tournament 4 osu!catch tournament stream tosu overlays
a gosumemory/tosu overlays for the 4th edition of the Fruit Loops Tournament CTB tourney.

# Screeenshot
![image](https://github.com/user-attachments/assets/b20b7cb6-1614-4ca1-91c7-36f4989939cf)

Watch the overlays in action here: https://www.twitch.tv/videos/2201579042

## To use with gosu/tosu
clone the repo into the `static` folder of your install.

it should then be accessible via `http://localhost:24050/flt4-stream-overlay/*` where * represents the overlay to be used

# Available Overlays

## `leaderboard-overlay`
Main battle royale leaderboard overlay, has hearts that can be toggled with clicks (interact option in OBS), automatic heart reduction for bottom scorer and dynamic updates for each client.

Accessible at `http://localhost:24050/flt4-stream-overlay/leaderboard-overlay`
Size: `300x800`

## `map-info`
Displays map information and statistics, based on the Kerli 1 counter by [Dartandr](https://github.com/Dartandr).

Accessible at `http://localhost:24050/flt4-stream-overlay/map-info`
Size: `1600x200`

## `ingame-chat`
Simple in-game chat implementation, requires the streamer to be `!mp addref`'d in game like all other chat overlays do.

Accessible at `http://localhost:24050/flt4-stream-overlay/ingame-chat`
Size: `700x150`

## `winner-overlay`
Unfinished and rushed, do not use.





