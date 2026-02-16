# Screenshot Automation Config

## Files

- `scenarios.txt`: plaintext UI scenarios.
- `requirements.json`: required screenshot target sizes by platform/profile.
- `devices.json`: local simulator/emulator mapping (copy from `devices.example.json`).

## Scenario format

Blocks are separated by `---`.

```text
scenario: home_agents_expanded
name: Home search + expand Agents of the Black Sun
platforms: ios,android
screenshot: home_agents_expanded
steps:
  - launchApp clearState=true
  - tapOn text="Search"
  - inputText text="agents"
  - hideKeyboard
```

## Supported step actions

- `launchApp clearState=true|false stopApp=true|false`
- `stopApp`
- `tapOn text="..."` or `tapOn id="..."`
- `inputText text="..."`
- `clearText`
- `hideKeyboard`
- `waitForVisible text="..." timeoutMs=12000`
- `assertVisible text="..."`
- `swipe direction=up|down|left|right`
- `scrollUntilVisible text="..." direction=down`
- `back`
- `sleep durationMs=600`

## Run

```bash
npm run screenshots:dry-run
npm run screenshots:release -- --platform both --continue-on-error
```
