# arcade_physics

The physics half of the `arcade` engine for March: a fixed-step simulation
loop, kinematics, the libm replay seam and pointer-gesture measurement. Every
fn is pure. Modules live under `lib/arcade/physics/` as `Arcade.Physics.*`;
the engine's README lists them.

```toml
[deps]
arcade = "0.1.0"
arcade_physics = "0.1.0"
```

Physics that must replay bit for bit on native and JS takes its sines from
`Arcade.Physics.Trig`, where a recorded table can stand in for libm (V8 and
the native libm differ by an ulp on a few percent of arguments).
