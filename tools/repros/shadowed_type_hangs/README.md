A record type named like a type in another module captures that name inside
the other module's types (march#1183's shared names, seen from a test module).

    MARCH_LIB_PATH=lib march --target js -o /tmp/x.mjs main.march

gives `expected { table : Table } but got { table : Table }`: Shapes.Holder's
field `table : Shapes.Table` is read as Main.Table.

Found in the hud suite: a test-module record `type Table = { at : Skee.App.Model,
key : Option(Skee.App.CallKey) }` (Skee.App.Model reaches Skee.Types.Table
through Skee.World) type-checked under `forge check`, then `march --target js`
and `march --compile` never finished: 5 minutes, memory past 19 GB, no
message. Renamed (`HostRun`), the suite builds in 10 s. `scripts/check_core.py`
(make check) already rejects a type name defined twice anywhere in lib/,
test/ and shell/; the hang is what happens when a build runs before it.
